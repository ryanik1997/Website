import fs from 'node:fs/promises'
import path from 'node:path'

const ids = Array.from({ length: 26 }, (_, i) => `catalog-reading-fce-b2-test${i + 2}`)
const roots = [
  {
    label: 'package',
    body: id => path.resolve('packages/catalog/data', `${id.replace('catalog-reading-', 'reading-')}.json`),
  },
  {
    label: 'runtime',
    body: id => path.resolve('apps/web/public/catalog/exams/reading', `${id}.json`),
  },
]

const failures = []

function fail(label, id, message) {
  failures.push(`${label} ${id}: ${message}`)
}

function allQuestions(part) {
  return part.questionGroups.flatMap(group => group.questions)
}

function textOf(part) {
  return part.passage.map(block => `${block.label ? `${block.label} ` : ''}${block.text ?? ''}`).join('\n')
}

function markerCount(text, n) {
  return (text.match(new RegExp(`\\(${n}\\)\\s*\\.\\.\\.\\.\\.`, 'g')) ?? []).length
}

function hasRawEntity(text) {
  return /&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i.test(text)
}

function validateExam(label, exam) {
  const id = exam.id
  if (exam.parts.length !== 7) fail(label, id, `expected 7 parts, got ${exam.parts.length}`)

  const p1 = exam.parts[0]
  const p1Text = textOf(p1)
  for (let n = 1; n <= 8; n += 1) if (markerCount(p1Text, n) !== 1) fail(label, id, `Part 1 marker ${n} missing/duplicated`)
  for (const q of allQuestions(p1)) {
    if (q.options.length !== 4) fail(label, id, `Part 1 Q${q.number} option count ${q.options.length}`)
    const optionRun = q.options.map(opt => opt.label).join(' ')
    if (optionRun && p1Text.includes(optionRun)) fail(label, id, `Part 1 Q${q.number} options leaked into passage`)
  }

  const p2Text = textOf(exam.parts[1])
  for (let n = 9; n <= 16; n += 1) if (markerCount(p2Text, n) !== 1) fail(label, id, `Part 2 marker ${n} missing/duplicated`)

  const p3 = exam.parts[2]
  const p3Text = textOf(p3)
  for (let n = 17; n <= 24; n += 1) if (markerCount(p3Text, n) !== 1) fail(label, id, `Part 3 marker ${n} missing/duplicated`)
  for (const q of allQuestions(p3)) if (!q.baseWord && !/[-–—]/.test(q.prompt)) fail(label, id, `Part 3 Q${q.number} missing base word`)

  const p4Questions = allQuestions(exam.parts[3])
  for (const q of p4Questions) {
    if (!q.sourceSentence) fail(label, id, `Part 4 Q${q.number} missing sourceSentence`)
    if (!q.keyword) fail(label, id, `Part 4 Q${q.number} missing keyword`)
    if (!q.targetSentence?.includes('.....')) fail(label, id, `Part 4 Q${q.number} targetSentence missing gap`)
    if (/->\s*$|→\s*$/.test(q.prompt)) fail(label, id, `Part 4 Q${q.number} prompt ends with arrow fallback`)
  }

  const p5 = exam.parts[4]
  for (const q of allQuestions(p5)) {
    if (!q.prompt || /^Question \d+$/i.test(q.prompt)) fail(label, id, `Part 5 Q${q.number} missing real prompt`)
    if (q.options.length !== 4) fail(label, id, `Part 5 Q${q.number} option count ${q.options.length}`)
  }
  if (hasRawEntity(textOf(p5) + allQuestions(p5).map(q => q.prompt).join(' '))) fail(label, id, 'Part 5 contains raw HTML entity')

  const p6 = exam.parts[5]
  const p6Text = textOf(p6)
  for (let n = 37; n <= 42; n += 1) if (markerCount(p6Text, n) !== 1) fail(label, id, `Part 6 marker ${n} missing/duplicated`)
  const p6Features = p6.questionGroups[0]?.features ?? []
  if (p6Features.length !== 7) fail(label, id, `Part 6 feature count ${p6Features.length}`)
  for (const feature of p6Features) if (!feature.name || /^[A-G]$/i.test(feature.name)) fail(label, id, `Part 6 feature ${feature.id} is empty/letter-only`)

  const p7 = exam.parts[6]
  const labels = p7.passage.map(block => block.label).filter(Boolean).join(',')
  if (labels !== 'A,B,C,D') fail(label, id, `Part 7 labels ${labels || '<none>'}`)
  for (const block of p7.passage) if (!block.text?.trim()) fail(label, id, `Part 7 section ${block.label ?? '?'} empty`)
  for (const q of allQuestions(p7)) if (!q.prompt || /^Question \d+|^Gap \(\d+\)$/i.test(q.prompt)) fail(label, id, `Part 7 Q${q.number} missing real prompt`)
}

for (const root of roots) {
  for (const id of ids) {
    try {
      const exam = JSON.parse(await fs.readFile(root.body(id), 'utf8'))
      validateExam(root.label, exam)
    } catch (error) {
      fail(root.label, id, error.message)
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`FCE B2 semantic validation PASS (${ids.length} exams x ${roots.length} locations)`)
