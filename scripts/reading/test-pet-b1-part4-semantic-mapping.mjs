#!/usr/bin/env node
import fs from 'node:fs'

const expected = {
  14: ['b', 'f', 'd', 'h', 'g'],
  30: ['g', 'b', 'e', 'd', 'h'],
  51: ['c', 'h', 'f', 'd', 'e'],
}

for (const test of [14, 30, 51]) {
  const body = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${test}.json`, 'utf8'))
  const vault = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${test}.answers.json`, 'utf8'))
  const part = body.parts.find(p => p.partNumber === 4)
  const options = part.passage.filter(item => item.label)
  const questions = part.questionGroups[0].questions
  const labels = questions.map(q => vault.answers[q.id].answer.toLowerCase())
  if (labels.join(',') !== expected[test].join(',')) throw new Error(`Test ${test}: answer labels ${labels.join(',')} != ${expected[test].join(',')}`)
  if (new Set(labels).size !== 5) throw new Error(`Test ${test}: correct options are not unique`)
  for (let i = 0; i < questions.length; i++) {
    const label = labels[i]
    const option = options.find(item => item.label.toLowerCase() === label)
    if (!option || option.correctForGap !== 16 + i) throw new Error(`Test ${test} Q${16 + i}: label ${label} has correctForGap ${option?.correctForGap}`)
  }
  const unused = options.filter(option => !labels.includes(option.label.toLowerCase())).map(option => option.label.toLowerCase())
  if (unused.length !== 3) throw new Error(`Test ${test}: expected 3 unused options, got ${unused.join(',')}`)
  console.log(`Test ${test}: ${labels.join('').toUpperCase()} semantic mapping PASS; unused=${unused.join('').toUpperCase()}`)
}
console.log('PET Part 4 semantic mapping PASS')
