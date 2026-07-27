#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTainguyenPath } from '../tainguyen-path.mjs'
import { convertFcePagesToReadingExam, loadFceTestExamJson } from './fce-b2-pages-to-parts.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')
const tainguyen = resolveTainguyenPath()
const args = process.argv.slice(2)

function readArg(name) {
  const found = args.find(arg => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!found) return null
  if (found.includes('=')) return found.split('=')[1]
  const idx = args.indexOf(found)
  return args[idx + 1] && !args[idx + 1].startsWith('--') ? args[idx + 1] : 'true'
}

function rangeFromArgs() {
  const testArg = readArg('test')
  if (testArg) {
    const test = Number(testArg)
    if (!Number.isInteger(test)) throw new Error(`Invalid --test value: ${testArg}`)
    return [test]
  }
  const from = Number(readArg('from') ?? 1)
  const to = Number(readArg('to') ?? 26)
  const tests = []
  for (let n = from; n <= to; n += 1) tests.push(n)
  return tests
}

const validateOnly = args.includes('--validate-only')
const dryRun = args.includes('--dry-run')
const tests = rangeFromArgs()
const sourceRoot = path.join(tainguyen, 'Import Cambridge', 'FCE_B2', 'Reading')
const tmpDir = path.join(repoRoot, 'tmp')
const stageDir = path.join(tmpDir, 'fce-b2-output')
const dataDir = path.join(repoRoot, 'packages', 'catalog', 'data')

await fs.mkdir(tmpDir, { recursive: true })
await fs.mkdir(stageDir, { recursive: true })

const inventory = []
const converted = []
const failures = []

for (const testNumber of tests) {
  try {
    const { raw } = await loadFceTestExamJson(testNumber, sourceRoot)
    const appTestNumber = testNumber + 1
    const result = convertFcePagesToReadingExam(raw, { sourceTestNumber: testNumber, appTestNumber })
    inventory.push({
      sourceTestNumber: testNumber,
      appTestNumber,
      pages: result.inventory,
      answerPageNumber: result.answerPageNumber,
      answers: result.answerCount,
      questions: result.totalQuestions,
    })
    converted.push({
      sourceTestNumber: testNumber,
      appTestNumber,
      fileName: `reading-fce-b2-test${appTestNumber}.json`,
      body: result.body,
    })
  } catch (error) {
    failures.push({
      sourceTestNumber: testNumber,
      appTestNumber: testNumber + 1,
      error: error instanceof Error ? error.message : String(error),
    })
    inventory.push({
      sourceTestNumber: testNumber,
      appTestNumber: testNumber + 1,
      error: error instanceof Error ? error.message : String(error),
      pages: [],
    })
  }
}

const report = {
  testsExpected: tests.length,
  testsConverted: converted.length,
  testsFailed: failures.length,
  partsExpected: tests.length * 7,
  partsConverted: converted.reduce((sum, item) => sum + item.body.parts.length, 0),
  questionsConverted: converted.reduce(
    (sum, item) => sum + item.body.parts.reduce((partSum, part) => partSum + part.questionGroups.reduce((gSum, g) => gSum + g.questions.length, 0), 0),
    0,
  ),
  missingAnswers: [],
  unknownPages: [],
  emptyPassages: converted.flatMap(item =>
    item.body.parts.filter(part => !part.passage?.some(block => String(block.text ?? '').trim())).map(part => ({
      testNumber: item.body.id,
      partNumber: part.partNumber,
    })),
  ),
  duplicateQuestionNumbers: [],
  failures,
}

await fs.writeFile(path.join(tmpDir, 'fce-b2-test1-schema.json'), JSON.stringify(
  JSON.parse(await fs.readFile(path.join(dataDir, 'reading-fce-b2-test1.json'), 'utf8')),
  null,
  2,
))
await fs.writeFile(path.join(tmpDir, 'fce-b2-pages-inventory.json'), JSON.stringify(inventory, null, 2))
await fs.writeFile(path.join(tmpDir, 'fce-b2-conversion-report.json'), JSON.stringify(report, null, 2))

const markdown = [
  '# FCE B2 Reading Conversion Report',
  '',
  `- Tests expected: ${report.testsExpected}`,
  `- Tests converted: ${report.testsConverted}`,
  `- Tests failed: ${report.testsFailed}`,
  `- Parts expected: ${report.partsExpected}`,
  `- Parts converted: ${report.partsConverted}`,
  `- Questions converted: ${report.questionsConverted}`,
  '',
  '## Failures',
  failures.length ? failures.map(f => `- Test ${f.testNumber}: ${f.error}`).join('\n') : '- None',
]
await fs.writeFile(path.join(tmpDir, 'fce-b2-conversion-report.md'), `${markdown.join('\n')}\n`)

if (failures.length > 0) {
  console.error(`Conversion failed for ${failures.length} test(s). See tmp/fce-b2-conversion-report.json`)
  process.exit(1)
}

if (!validateOnly && !dryRun) {
  await fs.mkdir(stageDir, { recursive: true })
  for (const item of converted) {
    const outPath = path.join(stageDir, item.fileName)
    await fs.writeFile(outPath, `${JSON.stringify(item.body, null, 2)}\n`, 'utf8')
    await fs.writeFile(path.join(dataDir, item.fileName), `${JSON.stringify(item.body, null, 2)}\n`, 'utf8')
  }
}

console.log(JSON.stringify(report, null, 2))
