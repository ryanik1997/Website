import fs from 'node:fs'

const file = process.argv[2] ?? 'packages/catalog/data/reading-ket-a2-generated-01.json'
const exam = JSON.parse(fs.readFileSync(file, 'utf8'))
const words = text => String(text ?? '').replace(/\[[^\]]+\]/g, ' ').trim().split(/\s+/).filter(Boolean).length
const passageText = part => (part.passage ?? []).map(block => block.text ?? '').join(' ')
const part = n => exam.parts.find(p => p.partNumber === n)
const count = n => words(passageText(part(n)))
const checks = [
  ['Part 2', count(2), 200],
  ['Part 3', count(3), 200],
  ['Part 4', count(4), 120],
  ['Part 5', count(5), 100],
]
const failed = checks.filter(([, actual, min]) => actual < min)
for (const [label, actual, min] of checks) console.log(`${label}: ${actual} words (minimum ${min})`)
if (failed.length) {
  console.error('KET A2 pilot rejected: passage wordcount below specification.')
  process.exit(1)
}
console.log('KET A2 pilot wordcount validation passed.')
