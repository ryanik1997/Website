#!/usr/bin/env node
import fs from 'node:fs'
import assert from 'node:assert/strict'

const TESTS = [46, 47, 48, 49, 50]
const GAP_RE = /\((16|17|18|19|20)\)\s*\.{2,}/g

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function words(value) {
  return String(value ?? '')
    .replace(GAP_RE, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

for (const test of TESTS) {
  const packageFile = `packages/catalog/data/reading-pet-b1-test${test}.json`
  const runtimeFile = `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${test}.json`
  const vaultFile = `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${test}.answers.json`
  const packageBody = readJson(packageFile)
  const runtimeBody = readJson(runtimeFile)
  const vault = readJson(vaultFile)
  const part = packageBody.parts.find(item => item.partNumber === 4)
  const runtimePart = runtimeBody.parts.find(item => item.partNumber === 4)

  assert.deepEqual(runtimePart, part, `Test ${test}: package/public Part 4 mismatch`)
  assert.match(part.passageTitle, /^Part 4\s+[–-]\s+\S+/, `Test ${test}: missing explicit title`)

  const paragraphs = part.passage.filter(block => !block.label)
  const options = part.passage.filter(block => block.label)
  assert.equal(paragraphs.length, 5, `Test ${test}: expected five paragraph blocks`)
  assert.equal(options.length, 8, `Test ${test}: expected eight sentence options`)

  const paragraphWords = paragraphs.map(block => words(block.text).length)
  const totalWords = paragraphWords.reduce((sum, count) => sum + count, 0)
  assert.ok(totalWords >= 300 && totalWords <= 360, `Test ${test}: passage has ${totalWords} words, expected 300-360`)
  assert.ok(paragraphWords.every(count => count >= 55 && count <= 75), `Test ${test}: paragraph words [${paragraphWords}] outside 55-75`)

  const gapsByParagraph = paragraphs.map(block => [...block.text.matchAll(GAP_RE)].map(match => Number(match[1])))
  assert.deepEqual(gapsByParagraph, [[16], [17], [18], [19], [20]], `Test ${test}: gaps are not one-per-paragraph in reading order`)
  const sentenceCount = paragraphs.reduce((sum, block) => sum + (block.text.match(/[.!?](?:\s|$)/g) ?? []).length, 0)
  assert.ok(sentenceCount >= 14, `Test ${test}: only ${sentenceCount} passage sentences`)

  const firstBefore = words(paragraphs[0].text.split('(16)')[0]).length
  const lastAfter = words(paragraphs[4].text.split(/\(20\)\s*\.{2,}/)[1]).length
  assert.ok(firstBefore >= 35, `Test ${test}: only ${firstBefore} words before Q16`)
  assert.ok(lastAfter >= 35, `Test ${test}: only ${lastAfter} words after Q20`)
  for (let index = 0; index < 4; index += 1) {
    const after = paragraphs[index].text.split(new RegExp(`\\(${16 + index}\\)\\s*\\.{2,}`))[1]
    const before = paragraphs[index + 1].text.split(`(${17 + index})`)[0]
    const between = words(`${after} ${before}`).length
    assert.ok(between >= 35, `Test ${test}: only ${between} words between Q${16 + index} and Q${17 + index}`)
  }

  const labels = options.map(option => option.label.toLowerCase())
  assert.equal(new Set(labels).size, 8, `Test ${test}: option labels are not unique`)
  assert.equal(new Set(options.map(option => option.text.trim().toLowerCase())).size, 8, `Test ${test}: option texts are not unique`)
  const repeatedOptions = options.filter(option => paragraphs.some(block => block.text.includes(option.text)))
  assert.deepEqual(repeatedOptions, [], `Test ${test}: option sentences were copied into the passage`)

  const questions = part.questionGroups[0].questions
  const answers = questions.map(question => String(vault.answers[question.id]?.answer ?? '').toLowerCase())
  assert.equal(new Set(answers).size, 5, `Test ${test}: correct options are not unique`)
  assert.ok(answers.every(answer => labels.includes(answer)), `Test ${test}: answer vault points outside option bank`)
  const positions = answers.map(answer => labels.indexOf(answer))
  assert.ok(!positions.every((position, index) => index === 0 || position > positions[index - 1]), `Test ${test}: correct options are displayed in logical order`)
  assert.equal(labels.filter(label => !answers.includes(label)).length, 3, `Test ${test}: expected three distractors`)

  for (let index = 0; index < questions.length; index += 1) {
    const option = options.find(item => item.label.toLowerCase() === answers[index])
    assert.equal(option?.correctForGap, 16 + index, `Test ${test} Q${16 + index}: answer is not derived from correctForGap`)
  }

  console.log(`Test ${test}: words=${totalWords} paragraphs=[${paragraphWords}] answers=${answers.join('').toUpperCase()} positions=[${positions}]`)
}

console.log('PET Part 4 Tests 46-50 contract PASS')
