/**
 * Mode C + D — pack catalog exams:
 * - List stubs (meta) for JS bundle
 * - Full bodies WITHOUT answer keys → catalog/exams/{skill}/{id}.json
 * - Answer vault (separate) → catalog/exams/{skill}/{id}.answers.json
 *
 * Run: node scripts/mode-c-pack-catalog.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUB_EXAMS = path.join(ROOT, 'apps/web/public/catalog/exams')

/** Fields stripped from runtime body (Mode D answer vault). */
const ANSWER_FIELDS = [
  'answer',
  'acceptableAnswers',
  'explanation',
  'correct',
  'correctAnswer',
  'correctAnswers',
  'solution',
  'solutions',
  'answerKey',
  'key',
  'feedback',
]

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true })
}

function countQuestions(exam) {
  const parts = Array.isArray(exam.parts) ? exam.parts : []
  return parts.reduce((n, p) => n + (Array.isArray(p.questions) ? p.questions.length : 0), 0)
}

function stripAnswerFields(obj) {
  if (Array.isArray(obj)) return obj.map(stripAnswerFields)
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (ANSWER_FIELDS.includes(k)) continue
    out[k] = stripAnswerFields(v)
  }
  return out
}

function iterQuestions(exam) {
  const out = []
  const parts = Array.isArray(exam.parts) ? exam.parts : []
  for (const part of parts) {
    for (const q of part.questions ?? []) out.push(q)
    // Reading: questions nested in questionGroups
    for (const g of part.questionGroups ?? []) {
      for (const q of g.questions ?? []) out.push(q)
    }
  }
  return out
}

function extractAnswersVault(exam) {
  /** @type {Record<string, Record<string, unknown>>} */
  const byId = {}
  for (const q of iterQuestions(exam)) {
    if (!q?.id) continue
    const entry = {}
    if (q.answer != null) entry.answer = q.answer
    if (q.acceptableAnswers != null) entry.acceptableAnswers = q.acceptableAnswers
    if (q.explanation != null) entry.explanation = q.explanation
    if (q.correct != null) entry.correct = q.correct
    if (q.correctAnswer != null) entry.correctAnswer = q.correctAnswer
    if (q.answerConfidence != null) entry.answerConfidence = q.answerConfidence
    if (Object.keys(entry).length) byId[q.id] = entry
  }
  return {
    examId: exam.id,
    version: 1,
    mode: 'answers-vault',
    answers: byId,
  }
}

function toStub(exam, skill) {
  const parts = Array.isArray(exam.parts) ? exam.parts : []
  const bodyPath = `catalog/exams/${skill}/${exam.id}.json`
  const answersPath = `catalog/exams/${skill}/${exam.id}.answers.json`
  return {
    id: exam.id,
    title: exam.title,
    durationMinutes: exam.durationMinutes ?? 30,
    bandHint: exam.bandHint ?? '',
    examType: exam.examType,
    examMode: exam.examMode ?? 'practice',
    examTrack: exam.examTrack,
    cambridgeLevel: exam.cambridgeLevel,
    questionCount: countQuestions(exam),
    bodyPath,
    answersPath,
    bodyRemote: true,
    answersRemote: true,
    parts: parts.map(p => ({
      id: p.id,
      partNumber: p.partNumber,
      rangeLabel: p.rangeLabel ?? '',
      questions: [],
    })),
  }
}

function packSkill(prefix, skill) {
  const files = fs.readdirSync(DATA)
    .filter(f => f.startsWith(prefix) && f.endsWith('.json') && !f.includes('meta') && !f.includes('answers'))
    .sort()

  const stubs = []
  const outDir = path.join(PUB_EXAMS, skill)
  ensureDir(outDir)

  let withAnswers = 0
  for (const file of files) {
    const full = path.join(DATA, file)
    let exam
    try {
      exam = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch (e) {
      console.warn('skip bad json', file, e.message)
      continue
    }
    if (!exam?.id) continue

    const vault = extractAnswersVault(exam)
    const answerCount = Object.keys(vault.answers).length
    if (answerCount > 0) withAnswers++

    // Runtime body: no keys
    const body = stripAnswerFields(exam)
    body.answersPath = `catalog/exams/${skill}/${exam.id}.answers.json`
    body.answersRemote = true
    body.bodyRemote = true

    fs.writeFileSync(path.join(outDir, `${exam.id}.json`), JSON.stringify(body))
    fs.writeFileSync(path.join(outDir, `${exam.id}.answers.json`), JSON.stringify(vault))
    stubs.push(toStub(exam, skill))
  }

  const metaFile = path.join(DATA, `catalog-${skill}-meta.json`)
  fs.writeFileSync(metaFile, JSON.stringify(stubs, null, 2) + '\n')
  console.log(`[mode-d] ${skill}: ${stubs.length} stubs, ${withAnswers} answer vaults → ${outDir}`)
  return stubs.length
}

function main() {
  ensureDir(PUB_EXAMS)
  const nL = packSkill('listening-', 'listening')
  const nR = packSkill('reading-', 'reading')
  console.log(JSON.stringify({ listening: nL, reading: nR, mode: 'C+D', ok: true }, null, 2))
}

main()
