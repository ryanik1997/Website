/**
 * Chuyển exam.json KET Reading do AI tạo (schema sai) sang schema import app.
 * Usage: node scripts/fix-ket-reading-import-json.mjs <path-to-exam.json>
 */
import { readFileSync, writeFileSync } from 'node:fs'

const PART_META = {
  1: { range: 'Questions 1–6', title: 'Signs and messages', groupType: 'multiple-choice', instruction: 'For each question, choose the correct answer.' },
  2: { range: 'Questions 7–13', title: 'Matching people', groupType: 'multiple-choice', instruction: 'For each question, choose the correct answer.' },
  3: { range: 'Questions 14–18', title: 'Reading comprehension', groupType: 'multiple-choice', instruction: 'For each question, choose the correct answer.' },
  4: { range: 'Questions 19–24', title: 'Multiple-choice cloze', groupType: 'multiple-choice', instruction: 'For each question, choose the correct answer.' },
  5: { range: 'Questions 25–30', title: 'Email / open cloze', groupType: 'gap-fill', instruction: 'For each question, write the correct answer. Write ONE word for each gap.' },
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return undefined
  return options.map((opt) => {
    if (opt.id && opt.label) return { id: String(opt.id), label: String(opt.label) }
    const letter = String(opt.label ?? opt.id ?? '').trim()
    const text = String(opt.text ?? opt.label ?? '').trim()
    if (/^[A-D]$/i.test(letter) && opt.text) {
      return { id: letter.toUpperCase(), label: text }
    }
    return { id: letter.toUpperCase() || 'A', label: text || letter }
  })
}

function normalizeQuestion(q, groupType) {
  const number = Number(q.number ?? q.id) || 0
  const type = q.type ?? (groupType === 'gap-fill' ? 'gap-fill' : 'multiple-choice')
  const prompt = String(q.prompt ?? q.question ?? '').trim()
    || (type === 'gap-fill' ? `Gap (${number})` : `Question ${number}`)
  return {
    number,
    type,
    prompt,
    ...(normalizeOptions(q.options) ? { options: normalizeOptions(q.options) } : {}),
    answer: String(q.answer ?? '').trim().toLowerCase(),
    ...(q.explanation ? { explanation: String(q.explanation) } : {}),
  }
}

function normalizePassage(passage) {
  if (typeof passage === 'string') return [{ text: passage }]
  if (!Array.isArray(passage)) return []
  return passage.map((block) => {
    if (typeof block === 'string') return { text: block }
    const out = {}
    if (block.label) out.label = block.label
    if (block.text) out.text = block.text
    if (block.imageFile) out.imageFile = block.imageFile
    return out
  })
}

function normalizePart(raw) {
  const partNumber = Number(raw.partNumber ?? raw.part) || 1
  const meta = PART_META[partNumber] ?? PART_META[1]
  const groupType = raw.questionGroups?.type
    ?? (Array.isArray(raw.questionGroups) ? raw.questionGroups[0]?.type : null)
    ?? meta.groupType

  const flatQuestions = Array.isArray(raw.questions) ? raw.questions : []
  const groupQuestions = Array.isArray(raw.questionGroups)
    ? raw.questionGroups.flatMap((g) => g.questions ?? [])
    : []

  const questions = (flatQuestions.length ? flatQuestions : groupQuestions)
    .map((q) => normalizeQuestion(q, groupType))

  const passageTitle = String(raw.passageTitle ?? raw.title ?? `Part ${partNumber} — ${meta.title}`).trim()

  return {
    partNumber,
    rangeLabel: String(raw.rangeLabel ?? meta.range),
    passageTitle,
    passage: normalizePassage(raw.passage),
    questionGroups: [{
      range: meta.range,
      instruction: meta.instruction,
      type: groupType,
      questions,
    }],
  }
}

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: node scripts/fix-ket-reading-import-json.mjs <exam.json>')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(inputPath, 'utf8'))
const fixed = {
  version: 1,
  title: raw.title,
  durationMinutes: raw.durationMinutes ?? 60,
  bandHint: raw.bandHint ?? 'A2 Key Reading',
  examTrack: raw.examTrack ?? 'cambridge',
  cambridgeLevel: raw.cambridgeLevel ?? 'a2',
  parts: (raw.parts ?? []).map(normalizePart),
}

writeFileSync(inputPath, `${JSON.stringify(fixed, null, 2)}\n`, 'utf8')

const totalQ = fixed.parts.reduce(
  (s, p) => s + p.questionGroups.reduce((gs, g) => gs + g.questions.length, 0),
  0,
)
console.log(`Fixed ${inputPath}: ${fixed.parts.length} parts, ${totalQ} questions`)