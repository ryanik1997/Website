#!/usr/bin/env node
/**
 * Part 5 one-word option validator (task_3 §11/§16/§20).
 * For tests 36-51: every Q21-26 has exactly 4 unique single-word options
 * (one orthographic word each, no whitespace), answer in A-D, no phrase/clause/
 * sentence options. Fails on multi-word, empty, duplicate, !=4, or phrase answer.
 *
 * Run: node scripts/reading/validate-pet-b1-part5-oneword.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const RANGE = []
for (let n = 36; n <= 51; n++) RANGE.push(n)

const ONE_WORD = /^[a-z][a-z'-]*$/i
const fails = []
for (const n of RANGE) {
  const file = path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`)
  if (!fs.existsSync(file)) { fails.push(`Test ${n}: missing public file`); continue }
  const body = JSON.parse(fs.readFileSync(file, 'utf8'))
  const vault = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`), 'utf8')).answers
  const p5 = body.parts[4]
  const qs = p5.questionGroups[0].questions
  if (qs.length !== 6) fails.push(`Test ${n}: ${qs.length} Part 5 questions (expected 6)`)
  for (const q of qs) {
    if (q.options.length !== 4) fails.push(`Test ${n} ${q.id}: ${q.options.length} options (expected 4)`)
    const texts = q.options.map(o => o.label)
    const lowered = new Set(texts.map(t => t.toLowerCase()))
    if (lowered.size !== texts.length) fails.push(`Test ${n} ${q.id}: duplicate options`)
    for (const t of texts) {
      if (!t || !t.trim()) fails.push(`Test ${n} ${q.id}: empty option`)
      else if (/\s/.test(t.trim())) fails.push(`Test ${n} ${q.id}: multi-word option "${t}"`)
      else if (!ONE_WORD.test(t.trim())) fails.push(`Test ${n} ${q.id}: option "${t}" is not a single orthographic word`)
    }
    const a = vault[q.id]?.answer
    if (!/^[a-d]$/i.test(a || '')) fails.push(`Test ${n} ${q.id}: answer "${a}" not a-d`)
  }
}
if (fails.length) {
  console.error(`PART 5 ONE-WORD FAILURES (${fails.length}):\n- ${fails.join('\n- ')}`)
  process.exit(1)
}
console.log(`Part 5 one-word option PASS: tests ${RANGE[0]}-${RANGE[RANGE.length - 1]}; every option a single word, 4 unique per gap, answers a-d.`)
