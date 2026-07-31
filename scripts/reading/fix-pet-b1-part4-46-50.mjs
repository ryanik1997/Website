/**
 * Surgical Part 4 fix for PET B1 Tests 46-50.
 * Replaces ONLY Part 4 in existing JSON files (package + public + answers).
 * Preserves Parts 1,2,3,5,6 and all other metadata untouched.
 *
 * Usage: node scripts/reading/fix-pet-b1-part4-46-50.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')

// Import compilePart4 from the compiler
import { compilePart4 } from './pet-b1/compile/compile-exam.mjs'

// Import blueprints
import bp46 from './pet-b1/blueprints/test-46.mjs'
import bp47 from './pet-b1/blueprints/test-47.mjs'
import bp48 from './pet-b1/blueprints/test-48.mjs'
import bp49 from './pet-b1/blueprints/test-49.mjs'
import bp50 from './pet-b1/blueprints/test-50.mjs'

const BLUEPRINTS = { 46: bp46, 47: bp47, 48: bp48, 49: bp49, 50: bp50 }

let totalFixed = 0

for (const [nStr, bp] of Object.entries(BLUEPRINTS)) {
  const n = Number(nStr)
  const slug = `pet-b1-test${n}`
  const examId = `catalog-reading-${slug}`

  // Compile Part 4 from blueprint
  const newPart4 = compilePart4(n, bp)
  const answers = newPart4._answers
  delete newPart4._answers

  // --- Fix package data ---
  const dataPath = path.join(DATA, `reading-${slug}.json`)
  const body = JSON.parse(readFileSync(dataPath, 'utf8'))
  const p4Index = body.parts.findIndex(p => p.partNumber === 4)
  if (p4Index === -1) throw new Error(`${examId}: Part 4 not found in package data`)
  body.parts[p4Index] = newPart4
  writeFileSync(dataPath, JSON.stringify(body, null, 2) + '\n')

  // --- Fix public runtime ---
  const publicPath = path.join(PUBLIC, `${examId}.json`)
  const pubBody = JSON.parse(readFileSync(publicPath, 'utf8'))
  const pubP4Index = pubBody.parts.findIndex(p => p.partNumber === 4)
  if (pubP4Index === -1) throw new Error(`${examId}: Part 4 not found in public runtime`)
  pubBody.parts[pubP4Index] = newPart4
  writeFileSync(publicPath, JSON.stringify(pubBody, null, 2) + '\n')

  // --- Fix answer vault ---
  const answersPath = path.join(PUBLIC, `${examId}.answers.json`)
  const vault = JSON.parse(readFileSync(answersPath, 'utf8'))
  for (const [qId, ans] of answers) {
    vault.answers[qId] = ans
  }
  writeFileSync(answersPath, JSON.stringify(vault, null, 2) + '\n')

  // Verify
  const paras = newPart4.passage.filter(x => !x.label)
  const opts = newPart4.passage.filter(x => x.label)
  const gapCounts = paras.map(p => (p.text.match(/\(\d+\)/g) || []).length)
  const allOne = gapCounts.every(c => c === 1)
  const answerLetters = answers.map(([, a]) => a.answer)
  const nonMonotonic = JSON.stringify(answerLetters) !== JSON.stringify(['a', 'b', 'c', 'd', 'e'])

  console.log(`T${n}: ${paras.length} paras, ${opts.length} opts, gaps-per-para=[${gapCounts}], answers=[${answerLetters.join(',')}], shuffled=${nonMonotonic ? 'YES' : 'NO'}`)
  if (paras.length !== 5 || !allOne || opts.length !== 8) throw new Error(`T${n}: FAILED validation`)
  totalFixed++
}

console.log(`\nDone: ${totalFixed} tests fixed (Part 4 only).`)
