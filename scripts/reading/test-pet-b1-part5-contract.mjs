#!/usr/bin/env node
import fs from 'node:fs'

const tests = [14, 30, 51]
const failures = []
for (const n of tests) {
  const file = `packages/catalog/data/reading-pet-b1-test${n}.json`
  const exam = JSON.parse(fs.readFileSync(file, 'utf8'))
  const part = exam.parts.find(p => p.partNumber === 5)
  const text = part?.passage?.map(block => block.text ?? '').join(' ') ?? ''
  const markers = [...text.matchAll(/\((2[1-6])\) \.{5}/g)].map(match => Number(match[1]))
  const questions = part?.questionGroups?.[0]?.questions ?? []
  if (markers.length !== 6 || markers.join(',') !== '21,22,23,24,25,26') failures.push(`Test ${n}: markers ${markers}`)
  if (questions.length !== 6) failures.push(`Test ${n}: questions ${questions.length}`)
  questions.forEach((question, index) => {
    const expectedId = `catalog-reading-pet-b1-test${n}-part-5-q${index + 21}`
    if (question.id !== expectedId) failures.push(`${file}: bad ID ${question.id}`)
    if (question.options?.length !== 4) failures.push(`${file}: ${question.id} has ${question.options?.length ?? 0} options`)
    const answer = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.answers.json`, 'utf8')).answers[question.id]?.answer
    if (!/^[a-d]$/.test(answer ?? '')) failures.push(`${file}: ${question.id} answer is not lowercase a-d`)
    const marker = `(${index + 21}) .....`
    if (!text.includes(marker)) failures.push(`${file}: missing ${marker}`)
  })
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('PET Part 5 contract PASS: Tests 14, 30, 51; six markers and six four-option questions each')
