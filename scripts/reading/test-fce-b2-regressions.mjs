#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTainguyenPath } from '../tainguyen-path.mjs'
import { convertFcePagesToReadingExam } from './fce-b2-pages-to-parts.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')
const FCE_ROOT = path.join(resolveTainguyenPath(), 'Import Cambridge', 'FCE_B2', 'Reading')
const WRITE_BASELINE = process.argv.includes('--write-baseline')

function allQuestions(part) {
  return (part?.questionGroups ?? []).flatMap(group => group?.questions ?? [])
}

function explanationLetter(explanation) {
  const text = String(explanation ?? '')
  return (
    text.match(/\banswer\s+is\s+([A-G])\b/i)?.[1]
    ?? text.match(/\bsentence\s+([A-G])\s+fits\b/i)?.[1]
    ?? null
  )
}

async function loadRaw(sourceTestNumber) {
  const file = path.join(FCE_ROOT, `fce-reading-test${sourceTestNumber}`, 'exam', 'exam.json')
  return JSON.parse(await fs.readFile(file, 'utf8'))
}

function addFailure(failures, failure) {
  failures.push({
    sourceTestNumber: failure.appTestNumber - 1,
    ...failure,
  })
}

async function collectFailures() {
  const failures = []
  const raw = await loadRaw(1)
  const { body } = convertFcePagesToReadingExam(raw, { sourceTestNumber: 1, appTestNumber: 2 })
  const question14 = allQuestions(body.parts.find(part => part.partNumber === 2)).find(item => item.number === 14)
  const expectedAnswers = ['although', 'though', 'while']
  const actualAnswers = question14?.acceptedAnswers ?? String(question14?.answer ?? '').split(/[/|]/).filter(Boolean)
  if (question14?.answer !== expectedAnswers[0] || JSON.stringify(actualAnswers) !== JSON.stringify(expectedAnswers)) {
    addFailure(failures, {
      appTestNumber: 2,
      partNumber: 2,
      questionNumber: 14,
      category: 'split_answer_parse_error',
      actualAnswer: question14?.answer ?? null,
      actualAcceptedAnswers: actualAnswers,
      expectedAcceptedAnswers: expectedAnswers,
      explanation: question14?.explanation ?? null,
    })
  }

  const packageFile = path.join(REPO_ROOT, 'packages', 'catalog', 'data', 'reading-fce-b2-test27.json')
  const exam = JSON.parse(await fs.readFile(packageFile, 'utf8'))
  for (const partNumber of [6, 7]) {
    const part = exam.parts.find(item => Number(item.partNumber) === partNumber)
    for (const question of allQuestions(part)) {
      const letter = explanationLetter(question.explanation)
      if (letter && String(question.answer).toLowerCase() !== letter.toLowerCase()) {
        addFailure(failures, {
          appTestNumber: 27,
          partNumber,
          questionNumber: question.number,
          category: 'answer_explanation_mismatch',
          actualAnswer: question.answer,
          explanationAnswer: letter.toLowerCase(),
          explanation: question.explanation,
        })
      }
    }
  }

  const part7 = exam.parts.find(item => Number(item.partNumber) === 7)
  const passageOrigins = new Set((part7.passage ?? []).map(block => block?._provenance).filter(Boolean))
  const promptOrigins = new Set(allQuestions(part7).map(question => question?._prompt_provenance).filter(Boolean))
  const answerOrigins = new Set(allQuestions(part7).map(question => question?.answerConfidence).filter(Boolean))
  if (passageOrigins.has('ai-generated') && answerOrigins.has('key')) {
    addFailure(failures, {
      appTestNumber: 27,
      partNumber: 7,
      questionNumber: null,
      category: 'ai_passage_source_answers',
      passageOrigins: [...passageOrigins],
      answerOrigins: [...answerOrigins],
    })
  }
  if (promptOrigins.has('ai-generated') && answerOrigins.has('key')) {
    addFailure(failures, {
      appTestNumber: 27,
      partNumber: 7,
      questionNumber: null,
      category: 'ai_prompts_source_answers',
      promptOrigins: [...promptOrigins],
      answerOrigins: [...answerOrigins],
    })
  }

  return failures
}

async function writeBaseline(failures) {
  const jsonPath = path.join(REPO_ROOT, 'tmp', 'fce-b2-baseline-failures.json')
  const markdownPath = path.join(REPO_ROOT, 'tmp', 'fce-b2-baseline-failures.md')
  const report = {
    capturedFromCommit: '058fbc314bb97e2dd41dee4ae5ee32df5422a8d2',
    failureCount: failures.length,
    failures,
  }
  const markdown = [
    '# FCE B2 Baseline Failures',
    '',
    `- Baseline commit: ${report.capturedFromCommit}`,
    `- Targeted failures: ${failures.length}`,
    '',
    '| App Test | Source Test | Part | Question | Category | Actual | Expected / explanation |',
    '| ---: | ---: | ---: | ---: | --- | --- | --- |',
    ...failures.map(failure => `| ${failure.appTestNumber} | ${failure.sourceTestNumber} | ${failure.partNumber} | ${failure.questionNumber ?? 'part'} | ${failure.category} | ${failure.actualAnswer ?? (failure.passageOrigins ?? failure.promptOrigins ?? []).join(',')} | ${failure.explanationAnswer ?? (failure.expectedAcceptedAnswers ?? failure.answerOrigins ?? []).join(',')} |`),
    '',
  ]
  await fs.mkdir(path.dirname(jsonPath), { recursive: true })
  await Promise.all([
    fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8'),
    fs.writeFile(markdownPath, markdown.join('\n'), 'utf8'),
  ])
  console.log(jsonPath)
  console.log(markdownPath)
}

const failures = await collectFailures()
if (WRITE_BASELINE) await writeBaseline(failures)
if (failures.length) {
  console.error(`FCE B2 regression tests FAIL (${failures.length} targeted failures)`)
  for (const failure of failures) {
    console.error(`- App Test ${failure.appTestNumber} Part ${failure.partNumber} ${failure.questionNumber ? `Q${failure.questionNumber} ` : ''}${failure.category}`)
  }
  process.exit(1)
}
console.log('FCE B2 regression tests PASS')
