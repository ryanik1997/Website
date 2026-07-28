#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveTainguyenPath } from '../tainguyen-path.mjs'
import { auditFcePart7Page, convertFcePagesToReadingExam } from './fce-b2-pages-to-parts.mjs'

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
  const syntheticShapes = [
    ['<p><strong>A. Kevin Teller</strong><br>Anyone who saw Together...</p>', 'Kevin Teller'],
    ['<p><strong>A.</strong><strong>Kevin Teller</strong><br>Anyone who saw Together...</p>', 'Kevin Teller'],
    ['<p><strong>A.</strong>Kevin Teller<br>Anyone who saw Together...</p>', 'Kevin Teller'],
    ['<p><strong>A</strong><span>Kevin Teller</span><br>Anyone who saw Together...</p>', 'Kevin Teller'],
  ]
  for (const [passageTextHtml, expectedHeading] of syntheticShapes) {
    const [section] = auditFcePart7Page({ passageTextHtml }, ['A'])
    if (section?.label !== 'A' || section?.heading !== expectedHeading || section?.text !== 'Anyone who saw Together...') {
      addFailure(failures, {
        appTestNumber: 2,
        partNumber: 7,
        questionNumber: null,
        category: 'part7_heading_shape_parse_error',
        actualAnswer: JSON.stringify(section),
        expectedAcceptedAnswers: ['A', expectedHeading, 'Anyone who saw Together...'],
      })
    }
  }

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

  const raw2 = await loadRaw(2)
  const { body: exam3 } = convertFcePagesToReadingExam(raw2, { sourceTestNumber: 2, appTestNumber: 3 })
  const part5WithoutTitle = exam3.parts.find(item => item.partNumber === 5)
  const part5Passage = (part5WithoutTitle?.passage ?? [])
    .map(block => block.text)
    .join(' ')
  if (
    part5Passage.length < 500
    || /For questions 31-36, choose the answer/i.test(part5Passage)
  ) {
    addFailure(failures, {
      appTestNumber: 3,
      partNumber: 5,
      questionNumber: null,
      category: 'part5_no_h2_passage_missing',
      actualAnswer: part5Passage.slice(0, 120),
    })
  }

  const raw27 = await loadRaw(26)
  const { body: exam } = convertFcePagesToReadingExam(raw27, { sourceTestNumber: 26, appTestNumber: 27 })
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

  const raw15 = await loadRaw(15)
  const { body: exam16 } = convertFcePagesToReadingExam(raw15, { sourceTestNumber: 15, appTestNumber: 16 })
  const part6Features = exam16.parts.find(item => item.partNumber === 6)?.questionGroups?.[0]?.features ?? []
  if (part6Features.map(feature => feature.id).join(',') !== 'a,b,c,d,e,f,g') {
    addFailure(failures, {
      appTestNumber: 16,
      partNumber: 6,
      questionNumber: null,
      category: 'duplicate_part6_feature_ids',
      actualAnswer: part6Features.map(feature => feature.id).join(','),
      expectedAcceptedAnswers: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    })
  }

  const raw13 = await loadRaw(13)
  const { body: exam14 } = convertFcePagesToReadingExam(raw13, { sourceTestNumber: 13, appTestNumber: 14 })
  const part7WithFiveSections = exam14.parts.find(item => item.partNumber === 7)
  const part7Labels = (part7WithFiveSections?.passage ?? []).map(block => block.label)
  if (part7Labels.join(',') !== 'A,B,C,D,E') {
    addFailure(failures, {
      appTestNumber: 14,
      partNumber: 7,
      questionNumber: null,
      category: 'part7_section_bank_truncated',
      actualAnswer: part7Labels.join(','),
      expectedAcceptedAnswers: ['A', 'B', 'C', 'D', 'E'],
    })
  }
  for (const question of allQuestions(part7WithFiveSections)) {
    if (!question.prompt || /^Question \d+$/i.test(question.prompt)) {
      addFailure(failures, {
        appTestNumber: 14,
        partNumber: 7,
        questionNumber: question.number,
        category: 'part7_source_prompt_missing',
        actualAnswer: question.prompt ?? null,
      })
    }
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
