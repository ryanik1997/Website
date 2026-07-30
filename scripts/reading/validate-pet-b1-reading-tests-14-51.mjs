#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const FROM = 14
const TO = 51
const ranges = [[1, 1, 5], [2, 6, 5], [3, 11, 5], [4, 16, 5], [5, 21, 6], [6, 27, 6]]

function questions(part) { return part.questionGroups.flatMap(group => group.questions) }
function fail(message) { throw new Error(message) }

for (let n = FROM; n <= TO; n++) {
  const id = `catalog-reading-pet-b1-test${n}`
  const body = JSON.parse(await fs.readFile(path.join(PUBLIC, `${id}.json`), 'utf8'))
  const vault = JSON.parse(await fs.readFile(path.join(PUBLIC, `${id}.answers.json`), 'utf8'))
  if (body.id !== id) fail(`${id}: wrong exam ID`)
  if (body.parts.length !== 6) fail(`${id}: expected 6 parts`)
  const all = body.parts.flatMap(questions)
  if (all.length !== 32 || Object.keys(vault.answers).length !== 32) fail(`${id}: expected 32 questions and answers`)
  if (new Set(all.map(q => q.id)).size !== 32) fail(`${id}: duplicate question ID`)
  if (all.some((q, i) => q.number !== i + 1 || !vault.answers[q.id])) fail(`${id}: numbering or answer mismatch`)
  for (const [partNumber, start, count] of ranges) {
    const part = body.parts[partNumber - 1]
    const qs = questions(part)
    if (qs.length !== count || qs.some((q, i) => q.number !== start + i)) fail(`${id}: Part ${partNumber} range mismatch`)
    if (partNumber !== 1 && partNumber !== 2 && !part.passage.some(block => block.text?.trim())) fail(`${id}: Part ${partNumber} passage missing`)
    if (partNumber === 1 && part.passage.length !== 5) fail(`${id}: Part 1 needs five text blocks`)
    if (partNumber === 2 && part.passage.filter(block => block.label).length !== 8) fail(`${id}: Part 2 needs eight options`)
    if (partNumber === 2 && new Set(qs.map(q => vault.answers[q.id].answer)).size !== 5) fail(`${id}: Part 2 matches are not unique`)
    if (partNumber === 3 && qs.some(q => q.options.length !== 4)) fail(`${id}: Part 3 option count`)
    if (partNumber === 4 && qs.some(q => !q.id || !vault.answers[q.id])) fail(`${id}: Part 4 answer missing`)
    if (partNumber === 5 && qs.some(q => q.options.length !== 4)) fail(`${id}: Part 5 option count`)
    if (partNumber === 6 && qs.some(q => q.options.length !== 0 || !/^[a-z]+$/.test(vault.answers[q.id].answer))) fail(`${id}: Part 6 answer shape`)
  }
}

const test1 = await fs.readFile(path.join(PUBLIC, 'catalog-reading-pet-b1-test1.json'))
const test13 = await fs.readFile(path.join(PUBLIC, 'catalog-reading-pet-b1-test13.json'))
console.log(JSON.stringify({ tests: 38, parts: 228, questions: 1216, answers: 1216, test01Bytes: test1.length, test13Bytes: test13.length, status: 'PASS' }, null, 2))
