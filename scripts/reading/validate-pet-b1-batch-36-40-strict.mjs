#!/usr/bin/env node
/**
 * Strict preferred-range validator for PET B1 Batch 5 (tests 36-40).
 * Checks preferred + hard ranges and structural constraints for Parts 3-6,
 * plus Part 5 language-target diversity and Part 6 grammar-category diversity
 * (read from blueprints).
 *
 * Preferred ranges:
 *   Part 3: 325-365 (hard 300-380), >=4 paragraphs, >=12 sentences
 *   Part 4: 320-345 (hard 300-360), 5 paragraphs 1 gap each, paras 55-75 (hard 50-85), >=14 sentences
 *   Part 5: 190-210 (hard 180-220), 6 gaps, >=8 sentences, >=20 words after Q26
 *   Part 6: 172-192 (hard 160-200), 6 gaps, >=7 sentences
 * Run: node scripts/reading/validate-pet-b1-batch-36-40-strict.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const BLUEPRINTS = path.join(ROOT, 'scripts/reading/pet-b1/blueprints')

const words = s => s.replace(/\(\d+\)\s*\.{2,}/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
const sentences = s => (s.replace(/\(\d+\)\s*\.{2,}/g, ' ').match(/[.!?](?=\s|$)/g) || []).length
const BATCH = [36, 37, 38, 39, 40]
const fails = []
const summary = []

for (const n of BATCH) {
  const d = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const p3 = d.parts[2], p4 = d.parts[3], p5 = d.parts[4], p6 = d.parts[5]
  const t3 = p3.passage.filter(b => !b.label).map(b => b.text).join(' ')
  const t4 = p4.passage.filter(b => !b.label).map(b => b.text).join(' ')
  const t5 = p5.passage.filter(b => !b.label).map(b => b.text).join(' ')
  const t6 = p6.passage.filter(b => !b.label).map(b => b.text).join(' ')
  const w3 = words(t3), w4 = words(t4), w5 = words(t5), w6 = words(t6)
  const paras4 = p4.passage.filter(b => !b.label).map(b => words(b.text))

  const r3 = w3 >= 325 && w3 <= 365 ? 'PREF' : (w3 >= 300 && w3 <= 380 ? 'hard' : 'FAIL')
  const r4 = w4 >= 320 && w4 <= 345 ? 'PREF' : (w4 >= 300 && w4 <= 360 ? 'hard' : 'FAIL')
  const r5 = w5 >= 190 && w5 <= 210 ? 'PREF' : (w5 >= 180 && w5 <= 220 ? 'hard' : 'FAIL')
  const r6 = w6 >= 172 && w6 <= 192 ? 'PREF' : (w6 >= 160 && w6 <= 200 ? 'hard' : 'FAIL')
  summary.push({ test: n, p3: { w: w3, r: r3 }, p4: { w: w4, r: r4, paras: paras4 }, p5: { w: w5, r: r5 }, p6: { w: w6, r: r6 } })

  if (r3 === 'FAIL') fails.push(`Test ${n} P3: ${w3}`)
  if (r4 === 'FAIL') fails.push(`Test ${n} P4: ${w4}`)
  if (r5 === 'FAIL') fails.push(`Test ${n} P5: ${w5}`)
  if (r6 === 'FAIL') fails.push(`Test ${n} P6: ${w6}`)

  if (p3.passage.filter(b => !b.label).length < 4) fails.push(`Test ${n} P3: <4 paragraphs`)
  if (sentences(t3) < 12) fails.push(`Test ${n} P3: ${sentences(t3)} sentences <12`)
  if (p4.passage.filter(b => !b.label).length !== 5) fails.push(`Test ${n} P4: not 5 paragraphs`)
  if (paras4.some(x => x < 55 || x > 75)) fails.push(`Test ${n} P4 paras out of preferred 55-75: ${paras4.join('/')}`)
  if (paras4.some(x => x < 50 || x > 85)) fails.push(`Test ${n} P4 paras out of hard 50-85: ${paras4.join('/')}`)
  if (sentences(t4) < 14) fails.push(`Test ${n} P4: ${sentences(t4)} sentences <14`)
  if (sentences(t5) < 8) fails.push(`Test ${n} P5: <8 sentences`)
  const tail5 = t5.split(/\s+/).filter(Boolean).slice(-20)
  if (tail5.length < 20) fails.push(`Test ${n} P5: ${tail5.length} words after Q26 <20`)
  if (sentences(t6) < 7) fails.push(`Test ${n} P6: <7 sentences`)
}

// Blueprint-level diversity: Part 5 languageTargets and Part 6 grammar targets
const p5seqs = {}
const p6seqs = {}
for (const n of BATCH) {
  const bpPath = path.join(BLUEPRINTS, `test-${n}.mjs`)
  if (!fs.existsSync(bpPath)) { fails.push(`Test ${n}: blueprint missing`); continue }
  const src = fs.readFileSync(bpPath, 'utf8')
  // pull specs[].languageTarget and part6.targets (accept both single and double quotes)
  const langTargets = [...src.matchAll(/["']?languageTarget["']?\s*:\s*["']([^"']+)["']/g)].map(m => m[1])
  const gTargets = [...src.matchAll(/["']?targets["']?\s*:\s*\[([^\]]*)\]/g)].pop()
  const gt = gTargets ? [...gTargets[1].matchAll(/["']([^"']+)["']/g)].map(m => m[1]) : []
  if (langTargets.length !== 6) fails.push(`Test ${n} P5: expected 6 languageTarget fields, got ${langTargets.length}`)
  else {
    const uniq = new Set(langTargets)
    if (uniq.size < 4) fails.push(`Test ${n} P5: only ${uniq.size} distinct language targets: ${langTargets.join(',')}`)
    p5seqs[n] = langTargets.join(' > ')
  }
  if (gt.length !== 6) fails.push(`Test ${n} P6: expected 6 grammar targets, got ${gt.length}`)
  else {
    const uniq = new Set(gt)
    const counts = gt.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), {})
    const over = Object.entries(counts).filter(([, c]) => c > 2).map(([k, c]) => `${k}x${c}`)
    if (uniq.size < 5) fails.push(`Test ${n} P6: only ${uniq.size} distinct grammar categories: ${gt.join(',')}`)
    if (over.length) fails.push(`Test ${n} P6: categories used >2x: ${over.join(', ')}`)
    p6seqs[n] = gt.join(' > ')
  }
}

console.log('=== STRICT VALIDATOR (Batch 5) ===')
for (const s of summary) console.log(`T${s.test}: P3 ${s.p3.w}(${s.p3.r}) P4 ${s.p4.w}(${s.p4.r}) paras[${s.p4.paras.join('/')}] P5 ${s.p5.w}(${s.p5.r}) P6 ${s.p6.w}(${s.p6.r})`)
console.log('\nPart 5 language-target sequences:')
for (const n of BATCH) console.log(`  T${n}: ${p5seqs[n] || '—'}`)
console.log('Part 6 grammar-category sequences:')
for (const n of BATCH) console.log(`  T${n}: ${p6seqs[n] || '—'}`)

if (fails.length) {
  console.error(`\n${fails.length} strict failures:\n- ${fails.join('\n- ')}`)
  process.exit(1)
}
console.log('\nSTRICT TARGET PASS')
