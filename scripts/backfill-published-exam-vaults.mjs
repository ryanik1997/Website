/**
 * Phase 1 backfill:
 * - read existing reading/listening published rows
 * - extract answer fields into private exam-media vaults
 * - replace row.parts with recursively stripped runtime bodies
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   node scripts/backfill-published-exam-vaults.mjs --dry-run
 *   node scripts/backfill-published-exam-vaults.mjs
 *   node scripts/backfill-published-exam-vaults.mjs --skill reading
 *   node scripts/backfill-published-exam-vaults.mjs --exam-id some-id
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const require = createRequire(join(ROOT, 'apps/web/package.json'))
const { createClient } = require('@supabase/supabase-js')
const BUCKET = 'exam-media'
const PAGE_SIZE = 100
const ANSWER_FIELDS = new Set([
  'answer',
  'acceptableAnswers',
  'explanation',
  'modelAnswer',
  'correct',
  'correctAnswer',
  'correctAnswers',
  'solution',
  'solutions',
  'answerKey',
  'key',
  'feedback',
])

function loadEnvFile(name) {
  const path = join(ROOT, name)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index < 0) continue
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile('.env.deploy')
loadEnvFile('.env.local')
loadEnvFile('apps/web/.env.local')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const skillIndex = args.indexOf('--skill')
const requestedSkill = skillIndex >= 0 ? args[skillIndex + 1] : null
const examIndex = args.indexOf('--exam-id')
const requestedExamId = examIndex >= 0 ? args[examIndex + 1] : null

if (requestedSkill && !['reading', 'listening'].includes(requestedSkill)) {
  throw new Error('--skill must be reading or listening')
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stripAnswerFields(value) {
  if (Array.isArray(value)) return value.map(stripAnswerFields)
  if (!isRecord(value)) return value
  const clean = {}
  for (const [key, nested] of Object.entries(value)) {
    if (ANSWER_FIELDS.has(key)) continue
    clean[key] = stripAnswerFields(nested)
  }
  return clean
}

function collectQuestions(parts) {
  const questions = []
  for (const part of Array.isArray(parts) ? parts : []) {
    if (!isRecord(part)) continue
    for (const question of Array.isArray(part.questions) ? part.questions : []) {
      if (isRecord(question)) questions.push(question)
    }
    for (const group of Array.isArray(part.questionGroups) ? part.questionGroups : []) {
      if (!isRecord(group)) continue
      for (const question of Array.isArray(group.questions) ? group.questions : []) {
        if (isRecord(question)) questions.push(question)
      }
    }
  }
  return questions
}

function createVault(examId, parts) {
  const answers = {}
  for (const question of collectQuestions(parts)) {
    const id = typeof question.id === 'string' ? question.id.trim() : ''
    if (!id) continue
    const entry = {}
    for (const field of ANSWER_FIELDS) {
      if (question[field] !== undefined) entry[field] = question[field]
    }
    if (Object.keys(entry).length) answers[id] = entry
  }
  return {
    examId,
    version: 1,
    mode: 'answers-vault',
    answers,
  }
}

async function listRows(table) {
  if (requestedExamId) {
    const { data, error } = await supabase
      .from(table)
      .select('id, parts')
      .eq('id', requestedExamId)
    if (error) throw error
    return data ?? []
  }

  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select('id, parts')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if ((data ?? []).length < PAGE_SIZE) break
  }
  return rows
}

async function processSkill(skill) {
  const table = `${skill}_exam_published`
  const rows = await listRows(table)
  const result = { skill, rows: rows.length, updated: 0, answers: 0, failed: 0 }

  for (const row of rows) {
    try {
      const vault = createVault(row.id, row.parts)
      const answerCount = Object.keys(vault.answers).length
      const cleanParts = stripAnswerFields(row.parts)
      const cleanJson = JSON.stringify(cleanParts)
      if (/"(answer|explanation|acceptableAnswers|modelAnswer)"\s*:/.test(cleanJson)) {
        throw new Error('strip verification failed')
      }

      result.answers += answerCount
      if (!dryRun) {
        const path = `catalog/exams/${skill}/${row.id}.answers.json`
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, JSON.stringify(vault), {
            upsert: true,
            contentType: 'application/json',
            cacheControl: 'private, max-age=60',
          })
        if (uploadError) throw uploadError

        const { error: updateError } = await supabase
          .from(table)
          .update({
            parts: cleanParts,
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id)
        if (updateError) throw updateError
      }

      result.updated += 1
      console.log(`[${skill}] ${row.id}: ${answerCount} answers${dryRun ? ' (dry-run)' : ''}`)
    } catch (error) {
      result.failed += 1
      console.error(`[${skill}] ${row.id}: FAILED`, error instanceof Error ? error.message : error)
    }
  }
  return result
}

const skills = requestedSkill ? [requestedSkill] : ['reading', 'listening']
const results = []
for (const skill of skills) results.push(await processSkill(skill))

console.log(JSON.stringify({ dryRun, results }, null, 2))
if (results.some(result => result.failed > 0)) process.exitCode = 1
