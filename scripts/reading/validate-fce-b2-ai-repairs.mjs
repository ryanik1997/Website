#!/usr/bin/env node
/**
 * Phase 3+8 — Validate AI repair cache for FCE B2 Reading.
 *
 * Checks:
 * - Every part with missing content has a repair cache
 * - All required fields per part contract are filled
 * - No placeholders remain
 * - No raw HTML entities
 * - Provenance is attached for AI-generated fields
 * - Part 4: 2-5 words answer + keyword present
 * - Part 6: 6 gaps + 7 features
 * - Part 7: A-D sections + 10 prompts
 *
 * Run: node scripts/reading/validate-fce-b2-ai-repairs.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_ROOT = path.resolve(__dirname, 'generated', 'fce-b2')
const PLAN_PATH = path.resolve('tmp/fce-b2-ai-repair-plan.json')

const failures = []

function fail(message) {
  failures.push(message)
}

function hasRawEntity(text) {
  return /&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i.test(text)
}

async function validateRepair(entry) {
  const { sourceTestNumber, appTestNumber, partNumber, status, missing, repairMode } = entry

  // Complete parts don't need repair
  if (status === 'complete') return 'ok'

  const cachePath = path.join(
    CACHE_ROOT,
    `source-test${String(sourceTestNumber).padStart(2, '0')}`,
    `part-${String(partNumber).padStart(2, '0')}.repair.json`,
  )

  let cache
  try {
    cache = JSON.parse(await fs.readFile(cachePath, 'utf8'))
  } catch {
    fail(`Test ${sourceTestNumber} Part ${partNumber}: repair cache missing at ${cachePath}`)
    return 'missing'
  }

  // Check status
  if (cache.status === 'pending_ai_key') {
    fail(`Test ${sourceTestNumber} Part ${partNumber}: pending AI key — run with FCE_REPAIR_AI_KEY`)
    return 'pending'
  }
  if (cache.status === 'failed') {
    fail(`Test ${sourceTestNumber} Part ${partNumber}: AI call failed — ${cache.error || 'unknown error'}`)
    return 'failed'
  }

  // Check provenance
  if (!cache.provenance) {
    fail(`Test ${sourceTestNumber} Part ${partNumber}: missing provenance`)
  } else {
    if (!cache.provenance.origin) fail(`Test ${sourceTestNumber} Part ${partNumber}: provenance missing origin`)
    if (cache.provenance.origin === 'ai-generated' && !cache.provenance.generatedFields?.length) {
      fail(`Test ${sourceTestNumber} Part ${partNumber}: AI-generated but no generatedFields listed`)
    }
  }

  // Check repair payload
  const repair = cache.repair
  if (!repair) {
    fail(`Test ${sourceTestNumber} Part ${partNumber}: repair payload is null/empty`)
    return 'no_repair'
  }

  // Part-specific validation
  switch (partNumber) {
    case 1: {
      // Check passage has content and markers
      if (!repair.passage?.length) fail(`Test ${sourceTestNumber} Part 1: passage missing`)
      const passageText = (repair.passage ?? []).map(b => b.text ?? '').join('\n')
      for (let n = 1; n <= 8; n++) {
        if (!passageText.includes(`(${n}) .....`)) fail(`Test ${sourceTestNumber} Part 1: marker (${n}) missing`)
      }
      if (!repair.questions?.length || repair.questions.length < 8) fail(`Test ${sourceTestNumber} Part 1: expected 8 questions, got ${repair.questions?.length}`)
      for (const q of repair.questions ?? []) {
        if (!q.options || q.options.length !== 4) fail(`Test ${sourceTestNumber} Part 1 Q${q.number}: expected 4 options`)
        if (!q.answer) fail(`Test ${sourceTestNumber} Part 1 Q${q.number}: missing answer`)
        if (q.options && !q.options.some(o => o.id === q.answer)) fail(`Test ${sourceTestNumber} Part 1 Q${q.number}: answer ${q.answer} not in options`)
      }
      if (hasRawEntity(passageText)) fail(`Test ${sourceTestNumber} Part 1: raw HTML entity in passage`)
      break
    }
    case 2: {
      if (!repair.passage?.length) fail(`Test ${sourceTestNumber} Part 2: passage missing`)
      const passageText = (repair.passage ?? []).map(b => b.text ?? '').join('\n')
      for (let n = 9; n <= 16; n++) {
        if (!passageText.includes(`(${n}) .....`)) fail(`Test ${sourceTestNumber} Part 2: marker (${n}) missing`)
      }
      for (const q of repair.questions ?? []) {
        if (!q.answer) fail(`Test ${sourceTestNumber} Part 2 Q${q.number}: missing answer`)
      }
      break
    }
    case 3: {
      if (!repair.passage?.length) fail(`Test ${sourceTestNumber} Part 3: passage missing`)
      const passageText = (repair.passage ?? []).map(b => b.text ?? '').join('\n')
      for (let n = 17; n <= 24; n++) {
        if (!passageText.includes(`(${n}) .....`)) fail(`Test ${sourceTestNumber} Part 3: marker (${n}) missing`)
      }
      for (const q of repair.questions ?? []) {
        if (!q.baseWord) fail(`Test ${sourceTestNumber} Part 3 Q${q.number}: missing baseWord`)
        if (!q.answer) fail(`Test ${sourceTestNumber} Part 3 Q${q.number}: missing answer`)
      }
      break
    }
    case 4: {
      for (const q of repair.questions ?? []) {
        if (!q.sourceSentence) fail(`Test ${sourceTestNumber} Part 4 Q${q.number}: missing sourceSentence`)
        if (!q.keyword) fail(`Test ${sourceTestNumber} Part 4 Q${q.number}: missing keyword`)
        if (!q.targetSentence?.includes('.....')) fail(`Test ${sourceTestNumber} Part 4 Q${q.number}: targetSentence missing gap`)
        if (!q.answer) fail(`Test ${sourceTestNumber} Part 4 Q${q.number}: missing answer`)
        const wordCount = q.answer?.split(/\s+/).length ?? 0
        if (wordCount < 2 || wordCount > 5) fail(`Test ${sourceTestNumber} Part 4 Q${q.number}: answer "${q.answer}" is ${wordCount} words (need 2-5)`)
        if (q.keyword && !q.answer?.toUpperCase().includes(q.keyword.toUpperCase())) {
          fail(`Test ${sourceTestNumber} Part 4 Q${q.number}: answer "${q.answer}" does not contain keyword "${q.keyword}"`)
        }
      }
      break
    }
    case 5: {
      if (!repair.passage?.length) fail(`Test ${sourceTestNumber} Part 5: passage missing`)
      for (const q of repair.questions ?? []) {
        if (!q.prompt || q.prompt.length < 10) fail(`Test ${sourceTestNumber} Part 5 Q${q.number}: missing/too short prompt`)
        if (!q.options || q.options.length !== 4) fail(`Test ${sourceTestNumber} Part 5 Q${q.number}: expected 4 options`)
        if (!q.answer) fail(`Test ${sourceTestNumber} Part 5 Q${q.number}: missing answer`)
      }
      const allText = (repair.passage ?? []).map(b => b.text ?? '').join(' ') + (repair.questions ?? []).map(q => q.prompt).join(' ')
      if (hasRawEntity(allText)) fail(`Test ${sourceTestNumber} Part 5: raw HTML entity`)
      break
    }
    case 6: {
      const passageText = (repair.passage ?? []).map(b => b.text ?? '').join('\n')
      for (let n = 37; n <= 42; n++) {
        if (!passageText.includes(`(${n}) .....`)) fail(`Test ${sourceTestNumber} Part 6: marker (${n}) missing`)
      }
      if (!repair.features || repair.features.length !== 7) fail(`Test ${sourceTestNumber} Part 6: expected 7 features, got ${repair.features?.length}`)
      for (const f of repair.features ?? []) {
        if (!f.name || /^[A-G]$/i.test(f.name)) fail(`Test ${sourceTestNumber} Part 6: feature ${f.id} is empty/letter-only`)
      }
      for (const q of repair.questions ?? []) {
        if (!q.prompt || q.prompt.length < 5) fail(`Test ${sourceTestNumber} Part 6 Q${q.number}: missing/too short prompt`)
        if (!q.answer) fail(`Test ${sourceTestNumber} Part 6 Q${q.number}: missing answer`)
      }
      break
    }
    case 7: {
      if (!repair.passage || repair.passage.length < 4) fail(`Test ${sourceTestNumber} Part 7: expected 4 sections A-D, got ${repair.passage?.length}`)
      const labels = (repair.passage ?? []).map(b => b.label).filter(Boolean).join(',')
      if (labels !== 'A,B,C,D') fail(`Test ${sourceTestNumber} Part 7: labels "${labels}" — expected A,B,C,D`)
      for (const block of repair.passage ?? []) {
        if (!block.text?.trim() || block.text.trim().length < 20) fail(`Test ${sourceTestNumber} Part 7: section ${block.label} empty/too short`)
      }
      if (!repair.questions?.length || repair.questions.length < 10) fail(`Test ${sourceTestNumber} Part 7: expected 10 questions, got ${repair.questions?.length}`)
      for (const q of repair.questions ?? []) {
        if (!q.prompt || /^Question \d+$/i.test(q.prompt)) fail(`Test ${sourceTestNumber} Part 7 Q${q.number}: missing real prompt`)
        if (!q.answer) fail(`Test ${sourceTestNumber} Part 7 Q${q.number}: missing answer`)
      }
      break
    }
  }

  return 'valid'
}

async function main() {
  console.log('[validate-fce-b2-ai-repairs] Validating AI repair cache...')

  const plan = JSON.parse(await fs.readFile(PLAN_PATH, 'utf8'))
  const missingParts = plan.parts.filter(p => p.status !== 'complete')

  console.log(`  ${missingParts.length} parts need AI repair`)

  let valid = 0
  let invalid = 0

  for (const entry of missingParts) {
    const result = await validateRepair(entry)
    if (result === 'valid' || result === 'ok') {
      valid++
    } else {
      invalid++
    }
  }

  if (failures.length) {
    console.log(`\n❌ Validation FAILED — ${failures.length} issues found:`)
    for (const f of failures) {
      console.log(`  ${f}`)
    }
    process.exit(1)
  }

  console.log(`\n✅ Validation PASSED — ${valid}/${missingParts.length} parts have valid repairs`)
  console.log(`  (${plan.parts.filter(p => p.status === 'complete').length} parts needed no repair)`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
