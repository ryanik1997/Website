#!/usr/bin/env node
import fs from 'node:fs'

for (const test of [14, 30, 51]) {
  const body = JSON.parse(fs.readFileSync(`packages/catalog/data/reading-pet-b1-test${test}.json`, 'utf8'))
  const vault = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${test}.answers.json`, 'utf8'))
  const part = body.parts[3]
  const labels = part.passage.slice(1).map(option => option.label.toLowerCase())
  const answers = part.questionGroups[0].questions.map(question => vault.answers[question.id].answer)
  if (labels.length !== 8 || new Set(labels).size !== 8) throw new Error(`Test ${test}: expected 8 unique options`)
  if (new Set(answers).size !== 5 || answers.some(answer => !labels.includes(answer))) throw new Error(`Test ${test}: invalid answer mapping`)
  const positions = answers.map(answer => labels.indexOf(answer))
  if (positions.every((position, i) => i === 0 || position > positions[i - 1])) throw new Error(`Test ${test}: monotonic answers`)
  if (labels.filter(label => !answers.includes(label)).length !== 3) throw new Error(`Test ${test}: expected 3 unused options`)
  console.log(`Test ${test}: ${labels.join('')} answers=${answers.join('')} positions=${positions.join(',')}`)
}
console.log('PET Part 4 distribution PASS')
