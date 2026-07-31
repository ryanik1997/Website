#!/usr/bin/env node
/**
 * Part 1 option-contract validator (task_3 §4/§16/§20).
 * For tests 36-40: each question has exactly 3 non-blank options (labels A-C),
 * answer is A/B/C, instruction is A/B/C. Fails on blank/missing text, 4
 * options, answer outside A-C, or wrong instruction.
 *
 * Run: node scripts/reading/validate-pet-b1-part1-contract.mjs [--tests=36-40]
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const BATCH = [36, 37, 38, 39, 40]
const EXPECTED_INSTRUCTION = 'For each question, choose the correct answer A, B or C.'

const fails = []
for (const n of BATCH) {
  const body = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const vault = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`), 'utf8')).answers
  const p1 = body.parts[0]
  const g = p1.questionGroups[0]
  const qs = g.questions
  if (qs.length !== 5) fails.push(`Test ${n}: ${qs.length} questions (expected 5)`)
  if (g.instruction !== EXPECTED_INSTRUCTION) fails.push(`Test ${n}: instruction "${g.instruction}" != "${EXPECTED_INSTRUCTION}"`)
  for (const q of qs) {
    if (q.options.length !== 3) fails.push(`Test ${n} ${q.id}: ${q.options.length} options (expected 3)`)
    for (const o of q.options) {
      if (!o.label || !o.label.trim()) fails.push(`Test ${n} ${q.id}: blank option text`)
      else if (o.label.trim().length < 2) fails.push(`Test ${n} ${q.id}: option text too short "${o.label}"`)
    }
    const a = vault[q.id]?.answer
    if (!/^[a-c]$/i.test(a || '')) fails.push(`Test ${n} ${q.id}: answer "${a}" not A-C`)
  }
}
if (fails.length) {
  console.error(`PART 1 CONTRACT FAILURES (${fails.length}):\n- ${fails.join('\n- ')}`)
  process.exit(1)
}
console.log(`Part 1 option-contract PASS: tests ${BATCH.join(',')}; 3 non-blank options A-C, answers A-C, instruction A/B/C.`)
