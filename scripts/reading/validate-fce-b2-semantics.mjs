import fs from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)
const testArgIndex = args.indexOf('--test')
const requestedTest = testArgIndex >= 0 ? Number(args[testArgIndex + 1]) : null
if (testArgIndex >= 0 && !Number.isInteger(requestedTest)) {
  throw new Error('--test requires an integer')
}
const scopeArgIndex = args.indexOf('--scope')
const scope = scopeArgIndex >= 0 ? args[scopeArgIndex + 1] : 'all'
if (!['all', 'package', 'runtime'].includes(scope)) {
  throw new Error('--scope must be all, package, or runtime')
}
const ids = requestedTest
  ? [`catalog-reading-fce-b2-test${requestedTest}`]
  : Array.from({ length: 26 }, (_, i) => `catalog-reading-fce-b2-test${i + 2}`)
const roots = [
  {
    label: 'package',
    body: id => path.resolve('packages/catalog/data', `${id.replace('catalog-reading-', 'reading-')}.json`),
  },
  {
    label: 'runtime',
    body: id => path.resolve('apps/web/public/catalog/exams/reading', `${id}.json`),
    vault: id => path.resolve('apps/web/public/catalog/exams/reading', `${id}.answers.json`),
  },
].filter(root => scope === 'all' || root.label === scope)

const failures = []
const genericPart2Signatures = [
  'When it comes to homes and housing',
  'basic principles',
  'face of difficulty',
]

function fail(label, id, message) {
  failures.push(`${label} ${id}: ${message}`)
}

function allQuestions(part) {
  return part.questionGroups.flatMap(group => group.questions)
}

function textOf(part) {
  return part.passage.map(block => `${block.label ? `${block.label} ` : ''}${block.text ?? ''}`).join('\n')
}

function hydrateRuntimeAnswers(exam, vault) {
  const answers = vault?.answers ?? {}
  return {
    ...exam,
    parts: (exam.parts ?? []).map(part => ({
      ...part,
      questionGroups: (part.questionGroups ?? []).map(group => ({
        ...group,
        questions: (group.questions ?? []).map(question => ({
          ...question,
          ...(answers[question.id] ?? {}),
        })),
      })),
    })),
  }
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

  const p2 = exam.parts[1]
  const p2Text = textOf(p2)
  const p2Questions = allQuestions(p2)
  for (let n = 9; n <= 16; n += 1) if (markerCount(p2Text, n) !== 1) fail(label, id, `Part 2 marker ${n} missing/duplicated`)
  if (p2Questions.length !== 8) fail(label, id, `Part 2 question count ${p2Questions.length}`)
  for (const q of p2Questions) {
    const alternatives = String(q.answer ?? '').split(/[/|]/).map(answer => answer.trim()).filter(Boolean)
    if (!alternatives.length || alternatives.some(answer => !/^\p{L}+(?:['’-]\p{L}+)*$/u.test(answer))) {
      fail(label, id, `Part 2 Q${q.number} answer must contain one-word alternatives`)
    }
  }
  for (const signature of genericPart2Signatures) {
    if (p2Text.includes(signature)) fail(label, id, `Part 2 contains generic filler: ${signature}`)
  }
  const passageOrigins = new Set(p2.passage.map(block => block._provenance).filter(Boolean))
  const hasAiAnswers = p2Questions.some(question => question.answerConfidence === 'ai-generated')
  const hasSourceAnswers = p2Questions.some(question => question.answerConfidence === 'key')
  if (passageOrigins.has('ai-generated') && hasSourceAnswers) fail(label, id, 'Part 2 mixes AI passage with source answer key')
  if (passageOrigins.has('source') && hasAiAnswers) fail(label, id, 'Part 2 mixes source passage with AI answers')

  if (id === 'catalog-reading-fce-b2-test27') {
    if (p2.passageTitle !== 'Shakespeare: the mysteries and the facts') fail(label, id, 'Part 2 missing Shakespeare source title')
    if (p2.passageSubtitle !== 'ALSO') fail(label, id, 'Part 2 missing source example ALSO')
    if (!/William Shakespeare/i.test(p2Text)) fail(label, id, 'Part 2 missing Shakespeare source passage')
  }

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
  const expectedLabels = [...new Set(allQuestions(p7).flatMap(q => q.options ?? []).map(option => (
    String(option?.id ?? '').trim().toUpperCase()
  )).filter(value => /^[A-E]$/.test(value)))]
  const labels = p7.passage.map(block => block.label).filter(Boolean)
  if (expectedLabels.length < 4 || expectedLabels.length > 5 || labels.join(',') !== expectedLabels.join(',')) {
    fail(label, id, `Part 7 labels ${labels.join(',') || '<none>'}`)
  }
  for (const block of p7.passage) if (!block.text?.trim()) fail(label, id, `Part 7 section ${block.label ?? '?'} empty`)
  for (const q of allQuestions(p7)) if (!q.prompt || /^Question \d+|^Gap \(\d+\)$/i.test(q.prompt)) fail(label, id, `Part 7 Q${q.number} missing real prompt`)
}

for (const root of roots) {
  for (const id of ids) {
    try {
      const body = JSON.parse(await fs.readFile(root.body(id), 'utf8'))
      const vault = root.vault
        ? JSON.parse(await fs.readFile(root.vault(id), 'utf8'))
        : null
      const exam = vault ? hydrateRuntimeAnswers(body, vault) : body
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
