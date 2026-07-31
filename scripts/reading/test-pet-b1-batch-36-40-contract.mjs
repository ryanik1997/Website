#!/usr/bin/env node
/**
 * Comprehensive data-integrity contract for PET B1 Batch 5 (tests 36-40).
 * Validates: Part 1 card/options/answers, Part 2 distinctness + unique answers,
 * Part 3 structure, Part 4 layout + semantic mapping, Part 5 markers/options,
 * Part 6 single-word answers, answer-vault completeness, package/public parity.
 *
 * Run: node scripts/reading/test-pet-b1-batch-36-40-contract.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')

const words = s => s.replace(/\(\d+\)\s*\.{2,}/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
const sentences = s => (s.replace(/\(\d+\)\s*\.{2,}/g, ' ').match(/[.!?](?=\s|$)/g) || []).length

const failures = []
const BATCH = [36, 37, 38, 39, 40]

for (const n of BATCH) {
  const pkgPath = path.join(DATA, `reading-pet-b1-test${n}.json`)
  const pubPath = path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`)
  const vaultPath = path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`)
  const body = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const pub = JSON.parse(fs.readFileSync(pubPath, 'utf8'))
  const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8')).answers

  // Parity
  if (JSON.stringify(body.parts) !== JSON.stringify(pub.parts)) failures.push(`Test ${n}: package/public parity FAIL`)

  const parts = body.parts
  const p1 = parts[0], p2 = parts[1], p3 = parts[2], p4 = parts[3], p5 = parts[4], p6 = parts[5]

  // Part 1: 5 questions, 3 options each with text, answers valid A-C (not "@")
  const q1 = p1.questionGroups[0].questions
  if (q1.length !== 5) failures.push(`Test ${n}: Part 1 has ${q1.length} questions`)
  for (const q of q1) {
    if (q.options.length !== 3) failures.push(`Test ${n} ${q.id}: ${q.options.length} options (expected 3)`)
    for (const o of q.options) if (!o.label || o.label.trim().length < 4) failures.push(`Test ${n} ${q.id}: option text missing`)
    const a = vault[q.id]?.answer
    if (!/^[a-c]$/i.test(a || '')) failures.push(`Test ${n} ${q.id}: answer "${a}" not A-C`)
  }

  // Part 2: 8 distinct options, 5 distinct profiles, 5 distinct answers
  const opts = p2.passage.filter(b => b.label)
  const optTexts = new Set(opts.map(b => b.text))
  if (opts.length !== 8 || optTexts.size !== 8) failures.push(`Test ${n}: Part 2 options not 8 distinct (${opts.length}/${optTexts.size})`)
  const q2 = p2.questionGroups[0].questions
  const profTexts = new Set(q2.map(q => q.prompt))
  if (q2.length !== 5 || profTexts.size !== 5) failures.push(`Test ${n}: Part 2 profiles not 5 distinct (${q2.length}/${profTexts.size})`)
  const ans2 = q2.map(q => vault[q.id]?.answer)
  if (new Set(ans2).size !== 5) failures.push(`Test ${n}: Part 2 answers not 5 distinct (${ans2.join(',')})`)

  // Part 3: ≥4 paragraphs, 5 questions, 4 options, sentences ≥12
  const p3text = p3.passage.filter(b => !b.label).map(b => b.text).join(' ')
  const p3w = words(p3text)
  const q3 = p3.questionGroups[0].questions
  if (p3.passage.filter(b => !b.label).length < 4) failures.push(`Test ${n}: Part 3 <4 paragraphs`)
  if (p3w < 300 || p3w > 380) failures.push(`Test ${n}: Part 3 ${p3w} out of hard range`)
  if (sentences(p3text) < 12) failures.push(`Test ${n}: Part 3 <12 sentences`)
  if (q3.length !== 5 || q3.some(q => q.options.length !== 4)) failures.push(`Test ${n}: Part 3 question shape`)

  // Part 4: layout, gaps, semantic mapping, ranges
  const paras = p4.passage.filter(b => !b.label)
  const opts4 = p4.passage.filter(b => b.label)
  const gaps = paras.flatMap(b => [...b.text.matchAll(/\((\d+)\)\s*\.{2,}/g)].map(x => +x[1]))
  const p4w = paras.reduce((a, b) => a + words(b.text), 0)
  const p4sent = sentences(paras.map(b => b.text).join(' '))
  if (paras.length !== 5 || opts4.length !== 8) failures.push(`Test ${n}: Part 4 layout ${paras.length}/${opts4.length}`)
  if (gaps.join(',') !== '16,17,18,19,20') failures.push(`Test ${n}: Part 4 gaps ${gaps.join(',')}`)
  if (p4w < 300 || p4w > 360) failures.push(`Test ${n}: Part 4 ${p4w} out of hard range`)
  if (paras.some(p => words(p.text) < 50 || words(p.text) > 85)) failures.push(`Test ${n}: Part 4 paragraph balance ${paras.map(p => words(p.text)).join('/')}`)
  if (p4sent < 14) failures.push(`Test ${n}: Part 4 <14 sentences`)
  // semantic mapping: answer label must point to the option whose correctForGap matches the question gap
  const q4 = p4.questionGroups[0].questions
  const correctLabels = q4.map(q => vault[q.id]?.answer.toLowerCase())
  if (new Set(correctLabels).size !== 5) failures.push(`Test ${n}: Part 4 correct options not unique (${correctLabels.join(',')})`)
  for (let i = 0; i < q4.length; i++) {
    const label = correctLabels[i]
    const opt = opts4.find(o => o.label.toLowerCase() === label)
    if (!opt || opt.correctForGap !== 16 + i) failures.push(`Test ${n} Q${16 + i}: label ${label} correctForGap=${opt?.correctForGap}`)
  }
  const unused = opts4.filter(o => !correctLabels.includes(o.label.toLowerCase())).map(o => o.label.toLowerCase())
  if (unused.length !== 3) failures.push(`Test ${n}: expected 3 unused Part 4 options, got ${unused.join(',')}`)

  // Part 5: 6 markers, 6 questions, 4 options each, answer a-d
  const p5text = p5.passage.filter(b => !b.label).map(b => b.text).join(' ')
  const p5w = words(p5text)
  const q5 = p5.questionGroups[0].questions
  const p5markers = [...p5text.matchAll(/\((2[1-6])\)\s*\.{2,}/g)].map(m => +m[1])
  if (p5markers.join(',') !== '21,22,23,24,25,26') failures.push(`Test ${n}: Part 5 markers ${p5markers.join(',')}`)
  if (q5.length !== 6 || q5.some(q => q.options.length !== 4)) failures.push(`Test ${n}: Part 5 question shape`)
  if (p5w < 180 || p5w > 220) failures.push(`Test ${n}: Part 5 ${p5w} out of hard range`)
  if (sentences(p5text) < 8) failures.push(`Test ${n}: Part 5 <8 sentences`)
  for (const q of q5) { const a = vault[q.id]?.answer; if (!/^[a-d]$/.test(a || '')) failures.push(`Test ${n} ${q.id}: answer "${a}" not a-d`) }
  const tail5 = p5text.split(/\s+/).filter(Boolean).slice(-20)
  if (tail5.length < 20) failures.push(`Test ${n}: <20 words after Q26`)

  // Part 6: 6 questions, single lowercase answers, range, sentences
  const p6text = p6.passage.filter(b => !b.label).map(b => b.text).join(' ')
  const p6w = words(p6text)
  const q6 = p6.questionGroups[0].questions
  if (q6.length !== 6) failures.push(`Test ${n}: Part 6 has ${q6.length} questions`)
  if (p6w < 160 || p6w > 200) failures.push(`Test ${n}: Part 6 ${p6w} out of hard range`)
  if (sentences(p6text) < 7) failures.push(`Test ${n}: Part 6 <7 sentences`)
  for (const q of q6) { const a = vault[q.id]?.answer; if (!/^[a-z]+$/.test(a || '')) failures.push(`Test ${n} ${q.id}: answer "${a}" not single lowercase word`) }

  // Answer vault completeness
  const expectedIds = []
  for (let p = 1; p <= 6; p++) for (let q = 1; q <= (p === 2 ? 5 : p === 3 ? 5 : 6); q++) expectedIds.push(`catalog-reading-pet-b1-test${n}-part-${p}-q${p === 2 ? q + 5 : p === 3 ? q + 10 : p === 4 ? q + 15 : p === 5 ? q + 20 : q + 26}`)
  for (const id of expectedIds) if (!vault[id]) failures.push(`Test ${n}: missing answer ${id}`)

  console.log(`Test ${n}: P3 ${p3w} | P4 ${p4w} (${paras.map(p => words(p.text)).join('/')}, ${p4sent} s) | P5 ${p5w} | P6 ${p6w} | P1 ok | P2 distinct ok`)
}

if (failures.length) {
  console.error(`\n${failures.length} contract failures:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('\nPET B1 Batch 36-40 contract PASS')
