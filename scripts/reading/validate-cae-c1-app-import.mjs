#!/usr/bin/env node
/**
 * Static validator for the imported CAE C1 Reading & Use of English tests (App Test 2–23).
 * Source 01–22 → App 02–23. App Test 1 (catalog-reading-cae-c1-test1) must be untouched.
 *
 * Usage:
 *   node scripts/reading/validate-cae-c1-app-import.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const READING_DIR = path.join(ROOT, 'apps', 'web', 'public', 'catalog', 'exams', 'reading')
const PACKAGE_DATA = path.join(ROOT, 'packages', 'catalog', 'data')

const PART_COUNTS = { 1: 8, 2: 8, 3: 8, 4: 6, 5: 6, 6: 4, 7: 6, 8: 10 }
const PART_TYPES = { 1: 'multiple-choice', 2: 'gap-fill', 3: 'gap-fill', 4: 'gap-fill', 5: 'multiple-choice', 6: 'matching-features', 7: 'matching-features', 8: 'matching-features' }
const CONTAMINATION_RE = /@context|@type|schema\.org|wp-content|wp-block|generatepress|<script|<style|<[a-zA-Z][a-zA-Z0-9]*(\s|>)|\bfunction\s*\(|\bwindow\.\s*[a-z]|document\.\s*(querySelector|getElementById|createElement|addEventListener|body)|@media|font-family:|background-color:|breadcrumb|application\/ld\+json/i
const LOCAL_PATH_RE = /[A-Z]:\\|file:\/\/|blob:|D:\\App-English-Ryan\\Crawl/i

const problems = []
const report = {
  ok: true,
  targetRange: { start: 2, end: 23 },
  testsChecked: 0,
  totalQuestions: 0,
  totalAnswers: 0,
  problems,
}

function addProblem(message) {
  report.ok = false
  problems.push(message)
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

// 1. Test 1 must be untouched and still valid
const test1BodyPath = path.join(READING_DIR, 'catalog-reading-cae-c1-test1.json')
const test1VaultPath = path.join(READING_DIR, 'catalog-reading-cae-c1-test1.answers.json')
if (!fs.existsSync(test1BodyPath) || !fs.existsSync(test1VaultPath)) {
  addProblem('Test 1 body or vault file is missing!')
} else {
  const t1 = readJson(test1BodyPath)
  if (t1.id !== 'catalog-reading-cae-c1-test1') addProblem(`Test 1 id changed: ${t1.id}`)
  if (t1.parts.length !== 10) addProblem(`Test 1 parts count changed (expected 10 with writing, got ${t1.parts.length})`)
}

// 2. Manifest must contain all 23 reading cae entries, sorted numerically
const manifest = readJson(path.join(PACKAGE_DATA, 'manifest.json'))
const caeReading = (manifest.reading ?? []).filter(e => String(e.id).startsWith('catalog-reading-cae-c1-test'))
const ids = caeReading.map(e => Number(String(e.id).match(/test(\d+)$/)?.[1] ?? -1)).sort((a, b) => a - b)
const expectedIds = Array.from({ length: 23 }, (_, i) => i + 1)
if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
  addProblem(`Manifest CAE Reading ids mismatch. Got: ${JSON.stringify(ids)}`)
}
const numericOrder = [...caeReading].sort((a, b) => {
  const na = Number(String(a.id).match(/test(\d+)$/)?.[1] ?? 0)
  const nb = Number(String(b.id).match(/test(\d+)$/)?.[1] ?? 0)
  return na - nb
}).map(e => e.id)
if (JSON.stringify(numericOrder) !== JSON.stringify(caeReading.map(e => e.id))) {
  addProblem('Manifest CAE Reading entries are not numerically sorted')
}
if (new Set(ids).size !== ids.length) addProblem('Duplicate CAE Reading ids in manifest')

// 3. Meta registry must contain 23 entries
const meta = readJson(path.join(PACKAGE_DATA, 'catalog-reading-meta.json'))
const caeMeta = meta.filter(e => String(e.id).startsWith('catalog-reading-cae-c1-test'))
if (caeMeta.length !== 23) addProblem(`catalog-reading-meta.json has ${caeMeta.length} CAE entries, expected 23`)
if (new Set(caeMeta.map(e => e.id)).size !== caeMeta.length) addProblem('Duplicate CAE entries in catalog-reading-meta.json')

// 4. Each test 2–23
for (let appNumber = 2; appNumber <= 23; appNumber += 1) {
  const examId = `catalog-reading-cae-c1-test${appNumber}`
  const bodyPath = path.join(READING_DIR, `${examId}.json`)
  const vaultPath = path.join(READING_DIR, `${examId}.answers.json`)

  if (!fs.existsSync(bodyPath)) { addProblem(`${examId}: body file missing`); continue }
  if (!fs.existsSync(vaultPath)) { addProblem(`${examId}: vault file missing`); continue }

  const body = readJson(bodyPath)
  const vault = readJson(vaultPath)
  const prefix = `${examId}`

  // meta sanity
  if (body.id !== examId) addProblem(`${prefix}: body id mismatch`)
  if (body.cambridgeLevel !== 'c1') addProblem(`${prefix}: cambridgeLevel=${body.cambridgeLevel}`)
  if (body.examTrack !== 'cambridge') addProblem(`${prefix}: examTrack=${body.examTrack}`)
  if (String(body.catalogSlug) !== `cae-c1-test${appNumber}`) addProblem(`${prefix}: catalogSlug=${body.catalogSlug}`)

  // parts
  if (body.parts.length !== 8) { addProblem(`${prefix}: parts=${body.parts.length}, expected 8`); continue }
  const partNumbers = body.parts.map(p => p.partNumber)
  if (JSON.stringify(partNumbers) !== JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8])) {
    addProblem(`${prefix}: part numbers not continuous 1-8: ${JSON.stringify(partNumbers)}`)
  }

  const allIds = []
  let questionCount = 0
  let answerCount = 0
  const vaultIds = Object.keys(vault.answers ?? {})
  const vaultAnswerSet = new Set(vaultIds)

  for (const part of body.parts) {
    const pn = part.partNumber
    const expectedQ = PART_COUNTS[pn]
    const expectedType = PART_TYPES[pn]
    const group = part.questionGroups?.[0]
    if (!group) { addProblem(`${prefix}: part ${pn} has no questionGroups`); continue }
    if (group.type !== expectedType) addProblem(`${prefix}: part ${pn} type=${group.type}, expected ${expectedType}`)

    const questions = group.questions ?? []
    if (questions.length !== expectedQ) addProblem(`${prefix}: part ${pn} questions=${questions.length}, expected ${expectedQ}`)
    questionCount += questions.length

    // question numbers continuous & unique
    const nums = questions.map(q => Number(q.number))
    const starts = { 1: 1, 2: 9, 3: 17, 4: 25, 5: 31, 6: 37, 7: 41, 8: 47 }
    const expectedStart = starts[pn]
    const expectedNums = Array.from({ length: expectedQ }, (_, i) => expectedStart + i)
    if (JSON.stringify(nums) !== JSON.stringify(expectedNums)) {
      addProblem(`${prefix}: part ${pn} question numbers ${JSON.stringify(nums)}, expected ${JSON.stringify(expectedNums)}`)
    }
    if (new Set(nums).size !== nums.length) addProblem(`${prefix}: part ${pn} duplicate question numbers`)

    for (const q of questions) {
      const qid = `${examId}-part-${pn}-q${q.number}`
      allIds.push(qid)
      if (!vaultAnswerSet.has(qid)) addProblem(`${prefix}: question ${qid} missing in vault`)
      if (!vault.answers[qid]?.answer) addProblem(`${prefix}: question ${qid} has empty vault answer`)
      answerCount += 1

      if (q.type !== expectedType) addProblem(`${prefix}: question ${qid} type=${q.type}`)
      if (String(q.answerConfidence ?? '') !== 'key') addProblem(`${prefix}: question ${qid} answerConfidence=${q.answerConfidence}`)

      // per-part structural checks
      if (pn === 1 || pn === 5) {
        const opts = q.options ?? []
        if (opts.length !== 4) addProblem(`${prefix}: part ${pn} q${q.number} options=${opts.length}, expected 4`)
        for (const o of opts) {
          if (!o.id || !o.label) addProblem(`${prefix}: part ${pn} q${q.number} option missing id/label`)
          if (LOCAL_PATH_RE.test(String(o.label ?? '')) || CONTAMINATION_RE.test(String(o.label ?? ''))) {
            addProblem(`${prefix}: part ${pn} q${q.number} option contaminated`)
          }
        }
      }
      if (pn === 2) {
        if ((q.options ?? []).length !== 0) addProblem(`${prefix}: part 2 q${q.number} has options, expected none`)
      }
      if (pn === 3) {
        if (!/Gap \(\d+\) — .+/.test(String(q.prompt ?? ''))) addProblem(`${prefix}: part 3 q${q.number} prompt missing baseWord: ${String(q.prompt ?? '')}`)
      }
      if (pn === 4) {
        if (!q.prompt?.includes('→')) addProblem(`${prefix}: part 4 q${q.number} prompt missing → separator`)
        if (!q.prompt?.includes('\n\n')) addProblem(`${prefix}: part 4 q${q.number} prompt missing sentence separator`)
      }
      if (pn === 6) {
        const texts = body.parts.find(p => p.partNumber === 6)?.passage?.filter(b => b.label) ?? []
        if (texts.length < 4) addProblem(`${prefix}: part 6 has ${texts.length} labeled texts, expected 4`)
        if ((q.options ?? []).length !== 4) addProblem(`${prefix}: part 6 q${q.number} options=${(q.options ?? []).length}, expected 4`)
      }
      if (pn === 7) {
        const bank = body.parts.find(p => p.partNumber === 7)?.passage?.filter(b => b.label) ?? []
        if (bank.length < 6) addProblem(`${prefix}: part 7 paragraph bank size=${bank.length}, expected 6+`)
        const opts = q.options ?? []
        if (opts.length < 6) addProblem(`${prefix}: part 7 q${q.number} options=${opts.length}, expected 7 (A–G)`)
        for (const o of opts) {
          if (!o.id || !o.label) addProblem(`${prefix}: part 7 q${q.number} option missing id/label`)
        }
      }
      if (pn === 8) {
        const sections = body.parts.find(p => p.partNumber === 8)?.passage?.filter(b => b.label) ?? []
        if (sections.length < 4) addProblem(`${prefix}: part 8 sections=${sections.length}, expected 4+`)
        if ((q.options ?? []).length < 4) addProblem(`${prefix}: part 8 q${q.number} options=${(q.options ?? []).length}, expected 4+`)
      }
    }
  }

  // passage contamination scan
  const allText = JSON.stringify(body)
  if (LOCAL_PATH_RE.test(allText)) addProblem(`${prefix}: body contains local path / blob URL`)
  if (CONTAMINATION_RE.test(allText)) addProblem(`${prefix}: body contains contamination marker`)

  // vault answer contamination
  const vaultText = JSON.stringify(vault)
  if (LOCAL_PATH_RE.test(vaultText)) addProblem(`${prefix}: vault contains local path / blob URL`)

  report.testsChecked += 1
  report.totalQuestions += questionCount
  report.totalAnswers += answerCount
}

// 5. No orphan vault answers (vault key not matching a body question)
for (let appNumber = 2; appNumber <= 23; appNumber += 1) {
  const examId = `catalog-reading-cae-c1-test${appNumber}`
  const bodyPath = path.join(READING_DIR, `${examId}.json`)
  const vaultPath = path.join(READING_DIR, `${examId}.answers.json`)
  if (!fs.existsSync(bodyPath) || !fs.existsSync(vaultPath)) continue
  const body = readJson(bodyPath)
  const vault = readJson(vaultPath)
  const bodyIds = new Set()
  for (const part of body.parts) {
    for (const q of part.questionGroups?.[0]?.questions ?? []) bodyIds.add(`${examId}-part-${part.partNumber}-q${q.number}`)
  }
  for (const vid of Object.keys(vault.answers ?? {})) {
    if (!bodyIds.has(vid)) addProblem(`${examId}: orphan vault answer ${vid}`)
  }
}

// summary
console.log(JSON.stringify({
  ok: report.ok,
  targetRange: report.targetRange,
  testsChecked: report.testsChecked,
  totalQuestions: report.totalQuestions,
  totalAnswers: report.totalAnswers,
  manifestCaeEntries: ids.length,
  problemCount: report.problems.length,
}, null, 2))
if (report.problems.length) {
  console.log('PROBLEMS:')
  for (const p of report.problems.slice(0, 50)) console.log(' -', p)
  if (report.problems.length > 50) console.log(` ... and ${report.problems.length - 50} more`)
}
process.exitCode = report.ok ? 0 : 1
