#!/usr/bin/env node
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const args = process.argv.slice(2)

function numberArg(name) {
  const index = args.indexOf(name)
  if (index < 0) return null
  const value = Number(args[index + 1])
  if (!Number.isInteger(value)) throw new Error(`${name} requires an integer`)
  return value
}

const testNumber = numberArg('--test')
const partNumber = numberArg('--part')
const tests = testNumber ? [testNumber] : Array.from({ length: 26 }, (_, index) => index + 2)
const roots = [
  {
    label: 'package',
    file: number => path.resolve('packages/catalog/data', `reading-fce-b2-test${number}.json`),
  },
  {
    label: 'runtime',
    file: number => path.resolve(
      'apps/web/public/catalog/exams/reading',
      `catalog-reading-fce-b2-test${number}.json`,
    ),
    vault: number => path.resolve(
      'apps/web/public/catalog/exams/reading',
      `catalog-reading-fce-b2-test${number}.answers.json`,
    ),
  },
]
const expectedPart2Answers = new Map([
  [9, 'has'],
  [10, 'up'],
  [11, 'speak/think'],
  [12, 'although/while'],
  [13, 'for'],
  [14, 'put'],
  [15, 'difference'],
  [16, 'majority'],
])

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

function answerAlternatives(answer) {
  return String(answer ?? '')
    .split(/[/|]/)
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
}

function assertOneWordAlternatives(answer, label) {
  const alternatives = answerAlternatives(answer)
  assert.ok(alternatives.length > 0, `${label}: missing answer`)
  for (const alternative of alternatives) {
    assert.match(alternative, /^\p{L}+(?:['’-]\p{L}+)*$/u, `${label}: answer alternative must be one word`)
  }
}

function validatePart2(part, label, currentTest) {
  const text = passageText(part)
  const questions = allQuestions(part)
  assert.equal(questions.length, 8, `${label}: expected eight Part 2 questions`)

  for (let number = 9; number <= 16; number += 1) {
    const markerCount = (text.match(new RegExp(`\\(${number}\\)\\s*\\.\\.\\.\\.\\.`, 'g')) ?? []).length
    assert.equal(markerCount, 1, `${label}: expected exactly one marker for Q${number}`)
    const question = questions.find(item => Number(item.number) === number)
    assert.ok(question, `${label}: missing Q${number}`)
    assertOneWordAlternatives(question.answer, `${label} Q${number}`)
  }

  const passageOrigins = new Set((part.passage ?? []).map(block => block._provenance).filter(Boolean))
  const answerOrigins = new Set(questions.map(question => question.answerConfidence).filter(Boolean))
  assert.equal(
    passageOrigins.has('ai-generated') && answerOrigins.has('key'),
    false,
    `${label}: AI passage must not use source answer keys`,
  )
  assert.equal(
    passageOrigins.has('source') && answerOrigins.has('ai-generated'),
    false,
    `${label}: source passage must not use AI answers`,
  )

  if (currentTest === 27) {
    assert.equal(part.passageTitle, 'Shakespeare: the mysteries and the facts', `${label}: wrong source title`)
    assert.equal(part.passageSubtitle, 'ALSO', `${label}: missing example ALSO`)
    assert.match(text, /William Shakespeare/i, `${label}: wrong passage`)
    for (const [number, expected] of expectedPart2Answers) {
      const actual = questions.find(question => Number(question.number) === number)?.answer
      assert.equal(actual, expected, `${label}: Q${number} answer mismatch`)
    }
  }
}

let checked = 0
for (const root of roots) {
  for (const currentTest of tests) {
    const body = JSON.parse(await fs.readFile(root.file(currentTest), 'utf8'))
    const vault = root.vault
      ? JSON.parse(await fs.readFile(root.vault(currentTest), 'utf8'))
      : null
    const exam = vault ? hydrateRuntimeAnswers(body, vault) : body
    const parts = partNumber
      ? exam.parts.filter(part => Number(part.partNumber) === partNumber)
      : exam.parts
    assert.ok(parts.length > 0, `${root.label} App Test ${currentTest}: requested part not found`)
    for (const part of parts) {
      if (Number(part.partNumber) === 2) {
        validatePart2(part, `${root.label} App Test ${currentTest} Part 2`, currentTest)
      }
      checked += 1
    }
  }
}

console.log(`FCE B2 answer consistency PASS (${checked} part records checked)`)
