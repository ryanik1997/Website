#!/usr/bin/env node
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTainguyenPath } from '../tainguyen-path.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')
const sourcePath = path.join(
  resolveTainguyenPath(),
  'Import Cambridge',
  'FCE_B2',
  'Reading',
  'fce-reading-test26',
  'exam',
  'exam.json',
)
const packagePath = path.join(repoRoot, 'packages', 'catalog', 'data', 'reading-fce-b2-test27.json')
const runtimePath = path.join(
  repoRoot,
  'apps',
  'web',
  'public',
  'catalog',
  'exams',
  'reading',
  'catalog-reading-fce-b2-test27.json',
)
const answerVaultPath = path.join(
  repoRoot,
  'apps',
  'web',
  'public',
  'catalog',
  'exams',
  'reading',
  'catalog-reading-fce-b2-test27.answers.json',
)
const repairPath = path.join(
  __dirname,
  'generated',
  'fce-b2',
  'source-test26',
  'part-02.repair.json',
)
const sourceUrl = 'https://engexam.info/fce-reading-and-use-of-english-practice-tests/fce-reading-and-use-of-english-practice-test-26/2/'
const expectedAnswers = new Map([
  [9, 'has'],
  [10, 'up'],
  [11, 'speak/think'],
  [12, 'although/while'],
  [13, 'for'],
  [14, 'put'],
  [15, 'difference'],
  [16, 'majority'],
])
const genericSignatures = [
  'When it comes to homes and housing',
  'basic principles',
  'face of difficulty',
]

function allQuestions(part) {
  return (part?.questionGroups ?? []).flatMap(group => group.questions ?? [])
}

function passageText(part) {
  return (part?.passage ?? []).map(block => block.text ?? '').join('\n')
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

async function readJson(filePath, { optional = false } = {}) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch (error) {
    if (optional && error?.code === 'ENOENT') return null
    throw error
  }
}

const raw = await readJson(sourcePath)
const packageExam = await readJson(packagePath)
const runtimeBody = await readJson(runtimePath)
const answerVault = await readJson(answerVaultPath)
const runtimeExam = hydrateRuntimeAnswers(runtimeBody, answerVault)
const repair = await readJson(repairPath, { optional: true })
const sourcePart = raw.pages?.find(page => Number(page.partNumber) === 2)
const packagePart = packageExam.parts?.find(part => Number(part.partNumber) === 2)
const runtimePart = runtimeExam.parts?.find(part => Number(part.partNumber) === 2)
const rawSample = String(sourcePart?.rawHtmlSample ?? '')
const rawPassage = String(sourcePart?.passageTextHtml ?? '')
const packagePassage = passageText(packagePart)
const runtimePassage = passageText(runtimePart)

const report = {
  capturedAt: new Date().toISOString(),
  sourceUrl,
  sourceFilePath: sourcePath,
  packageFilePath: packagePath,
  runtimeFilePath: runtimePath,
  answerVaultFilePath: answerVaultPath,
  repairFilePath: repair ? repairPath : null,
  raw: {
    passageTextHtmlLength: rawPassage.length,
    passageTitle: sourcePart?.passageTitle ?? null,
    containsShakespeareInPassage: /Shakespeare/i.test(rawPassage),
    containsShakespeareInRawSample: /Shakespeare/i.test(rawSample),
    containsExampleAlsoInRawSample: /Example:\s*ALSO/i.test(rawSample),
    questionCount: sourcePart?.questions?.length ?? 0,
    rawHtmlSampleLength: rawSample.length,
    rawHtmlSample: rawSample,
  },
  package: {
    passageTitle: packagePart?.passageTitle ?? null,
    passageLength: packagePassage.length,
    containsShakespeare: /Shakespeare/i.test(packagePassage),
    genericSignatures: genericSignatures.filter(signature => packagePassage.includes(signature)),
    answers: Object.fromEntries(allQuestions(packagePart).map(question => [question.number, question.answer])),
    passageProvenance: [...new Set((packagePart?.passage ?? []).map(block => block._provenance).filter(Boolean))],
  },
  runtime: {
    passageTitle: runtimePart?.passageTitle ?? null,
    passageLength: runtimePassage.length,
    containsShakespeare: /Shakespeare/i.test(runtimePassage),
    genericSignatures: genericSignatures.filter(signature => runtimePassage.includes(signature)),
    answers: Object.fromEntries(allQuestions(runtimePart).map(question => [question.number, question.answer])),
    passageProvenance: [...new Set((runtimePart?.passage ?? []).map(block => block._provenance).filter(Boolean))],
  },
  repairCache: repair && {
    origin: repair.provenance?.origin ?? null,
    generatedFields: repair.provenance?.generatedFields ?? [],
    model: repair.provenance?.model ?? null,
    genericSignatures: genericSignatures.filter(signature => JSON.stringify(repair).includes(signature)),
  },
}

const outputArgIndex = process.argv.indexOf('--output')
if (outputArgIndex >= 0 && process.argv[outputArgIndex + 1]) {
  const outputPath = path.resolve(process.argv[outputArgIndex + 1])
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(`Evidence written: ${outputPath}`)
}

assert.ok(sourcePart, 'Source Test 26 Part 2 must exist')
assert.match(rawPassage, /Shakespeare: the mysteries and the facts/i, 'Raw passage must contain the Shakespeare source title')
assert.equal(sourcePart.passageTitle, 'Shakespeare: the mysteries and the facts', 'Raw Part 2 title must be the source title')
assert.match(String(sourcePart.example ?? sourcePart.entryContentHtml ?? ''), /ALSO/i, 'Raw source must preserve example ALSO')
assert.equal(sourcePart.questions?.length, 8, 'Raw source must contain 8 Part 2 input widgets')

for (const [label, part] of [['package', packagePart], ['runtime', runtimePart]]) {
  assert.ok(part, `${label} App Test 27 Part 2 must exist`)
  assert.equal(part.passageTitle, 'Shakespeare: the mysteries and the facts', `${label} title must be Shakespeare`)
  const text = passageText(part)
  assert.match(text, /William Shakespeare/i, `${label} passage must contain the real source text`)
  for (let number = 9; number <= 16; number += 1) {
    const count = (text.match(new RegExp(`\\(${number}\\)\\s*\\.\\.\\.\\.\\.`, 'g')) ?? []).length
    assert.equal(count, 1, `${label} passage must contain exactly one marker for ${number}`)
  }
  for (const signature of genericSignatures) {
    assert.equal(text.includes(signature), false, `${label} passage must not contain generic filler: ${signature}`)
  }
  const questions = allQuestions(part)
  assert.equal(questions.length, 8, `${label} Part 2 must contain 8 questions`)
  for (const [number, expected] of expectedAnswers) {
    const question = questions.find(item => item.number === number)
    assert.equal(question?.answer, expected, `${label} Q${number} answer must be ${expected}`)
  }
  assert.equal(
    (part.passage ?? []).some(block => block._provenance === 'ai-generated'),
    false,
    `${label} Shakespeare passage must not be marked ai-generated`,
  )
}

assert.equal(repair, null, 'The generic Test 26 Part 2 repair cache must be removed')
console.log('FCE B2 App Test 27 Part 2 source/runtime consistency PASS')
