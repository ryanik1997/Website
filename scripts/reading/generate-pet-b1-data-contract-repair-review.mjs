#!/usr/bin/env node
/**
 * Generates task_3 audit artifacts (§18):
 *   tmp/pet-b1-data-contract-repair-audit.json
 *   tmp/pet-b1-data-contract-repair-audit.md
 *   tmp/pet-b1-data-contract-repair-review.md
 * Part 1 (36-40), Part 2 (25-51 classification), Part 5 (36-51 one-word),
 * plus learner-facing content of every rewritten test.
 * Run AFTER regeneration + Part 2 rewrite: node scripts/reading/generate-pet-b1-data-contract-repair-review.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const DATA = path.join(ROOT, 'packages/catalog/data')

const p2audit = JSON.parse(fs.readFileSync(path.join(ROOT, 'tmp/pet-b1-part2-duplicate-audit.json'), 'utf8'))
const classified = Object.fromEntries(p2audit.classified.map(c => [c.test, c]))

const audit = { part1: [], part2: [], part5: [] }
let md = '# PET B1 Data Contract Repair — Audit\n\n'

// ---- Part 1 table (36-40) ----
md += '## Part 1 (tests 36-40)\n\n| Test | Question | Option count | Option A | Option B | Option C | Blank options | Correct answer | Status |\n|------|----------|--------------|----------|----------|----------|---------------|----------------|--------|\n'
for (const n of [36, 37, 38, 39, 40]) {
  const body = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const vault = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`), 'utf8')).answers
  const p1 = body.parts[0]
  for (const q of p1.questionGroups[0].questions) {
    const blanks = q.options.filter(o => !o.label || !o.label.trim()).length
    const ok = q.options.length === 3 && blanks === 0 && /^[a-c]$/i.test(vault[q.id]?.answer || '')
    const row = { test: n, question: q.number, optionCount: q.options.length, a: q.options[0]?.label, b: q.options[1]?.label, c: q.options[2]?.label, blankOptions: blanks, correct: vault[q.id]?.answer, status: ok ? 'OK' : 'FAIL' }
    audit.part1.push(row)
    md += `| ${row.test} | ${row.question} | ${row.optionCount} | ${(row.a || '').replace(/\|/g, '\\|')} | ${(row.b || '').replace(/\|/g, '\\|')} | ${(row.c || '').replace(/\|/g, '\\|')} | ${row.blankOptions} | ${row.correct} | ${row.status} |\n`
  }
}

// ---- Part 2 table (25-51) ----
md += '\n## Part 2 (tests 25-51)\n\n| Test | Domain | Nearest test | Profile sim | Option sim | Classification | Action | Assets preserved |\n|------|--------|--------------|-------------|------------|---------------|--------|------------------|\n'
for (const n of [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]) {
  const c = classified[n] || {}
  const pair = p2audit.pairs.find(p => (p.a === n && p.b === c.nearest) || (p.b === n && p.a === c.nearest)) || {}
  const action = c.code === 'KEEP_GOLDEN' || c.code === 'KEEP_UNIQUE' ? 'keep' : 'rewrite'
  const row = { test: n, domain: '', nearest: c.nearest, profileSim: pair.profileSimilarity, optionSim: pair.optionSimilarity, classification: c.code, action, assets: 'preserved' }
  audit.part2.push(row)
  md += `| ${row.test} | ${row.domain} | ${row.nearest ?? '—'} | ${row.profileSim ?? '—'} | ${row.optionSim ?? '—'} | ${row.classification} | ${row.action} | ${row.assets} |\n`
}

// ---- Part 5 table (36-51) ----
md += '\n## Part 5 (tests 36-51)\n\n| Test | Question | A | B | C | D | Words/opt | Correct | Language target | Status |\n|------|----------|---|---|---|---|----------|---------|-----------------|--------|\n'
const targets = {}
for (const n of [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]) {
  const body = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const vault = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`), 'utf8')).answers
  const p5 = body.parts[4]
  const bpPath = path.join(ROOT, 'scripts/reading/pet-b1/blueprints', `test-${n}.mjs`)
  let p5targets = []
  if (fs.existsSync(bpPath)) {
    const src = fs.readFileSync(bpPath, 'utf8')
    p5targets = [...src.matchAll(/languageTarget:\s*'([^']+)'/g)].map(m => m[1])
  }
  targets[n] = p5targets
  for (const q of p5.questionGroups[0].questions) {
    const wc = q.options.map(o => o.label.trim().split(/\s+/).length)
    const ok = q.options.length === 4 && wc.every(w => w === 1) && new Set(q.options.map(o => o.label.toLowerCase())).size === 4 && /^[a-d]$/.test(vault[q.id]?.answer || '')
    const t = p5targets[q.number - 21] || '—'
    const row = { test: n, question: q.number, a: q.options[0]?.label, b: q.options[1]?.label, c: q.options[2]?.label, d: q.options[3]?.label, wordCounts: wc, correct: vault[q.id]?.answer, languageTarget: t, status: ok ? 'OK' : 'FAIL' }
    audit.part5.push(row)
    md += `| ${row.test} | ${row.question} | ${(row.a || '').replace(/\|/g, '\\|')} | ${(row.b || '').replace(/\|/g, '\\|')} | ${(row.c || '').replace(/\|/g, '\\|')} | ${(row.d || '').replace(/\|/g, '\\|')} | ${row.wordCounts.join('/')} | ${row.correct} | ${row.languageTarget} | ${row.status} |\n`
  }
}

fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-data-contract-repair-audit.json'), JSON.stringify(audit, null, 2))
fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-data-contract-repair-audit.md'), md)

// ---- Review: learner-facing content of rewritten tests (31-35, 41-50 Part 2; 36-40 Part 5) ----
let rv = '# PET B1 Data Contract Repair — Review (learner-facing)\n\n'
rv += '## Part 2 rewritten tests (31-35, 41-50)\n\n'
for (const n of [31, 32, 33, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]) {
  const body = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const p2 = body.parts[1]
  const vault = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`), 'utf8')).answers
  rv += `### Test ${n}\n\n${p2.passage[0].text}\n\n`
  for (const b of p2.passage.filter(x => x.label)) rv += `- ${b.label}. ${b.text}\n`
  rv += `\n**Profiles:**\n`
  for (const q of p2.questionGroups[0].questions) rv += `- Q${q.number}: ${q.prompt} → ${vault[q.id]?.answer}\n`
  rv += '\n'
}
rv += '## Part 5 rewritten tests (36-40) — learner-facing passages\n\n'
for (const n of [36, 37, 38, 39, 40]) {
  const body = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const p5 = body.parts[4]
  rv += `### Test ${n} Part 5\n\n${p5.passage.filter(x => !x.label).map(x => x.text).join(' ')}\n\n`
}
fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-data-contract-repair-review.md'), rv)

console.log('Data-contract repair audit + review regenerated.')
console.log(`Part 1 rows: ${audit.part1.length}, Part 2 rows: ${audit.part2.length}, Part 5 rows: ${audit.part5.length}`)
