#!/usr/bin/env node
/**
 * Cross-range similarity validator for PET B1 Batch 5 (tests 36-40).
 *
 * Compares Batch 5 learner-facing Parts 3-6 against the reference range
 * (Tests 01, 02, 03, 13, 14-35, 41-51) AND against each other.
 *
 * Rules (task §13):
 *   - same opening (first 5 normalized tokens)          → FAIL
 *   - same closing (last 8 normalized tokens)           → FAIL
 *   - repeated clause >8 words (9-token shared window)  → FAIL
 *   - shared paragraph skeleton (LCP ≥ 10 tokens)       → FAIL
 *   - near-duplicate prose (trigram Jaccard ≥ 0.30)     → FAIL
 *
 * Run: node scripts/reading/validate-pet-b1-batch-36-40-cross-similarity.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')

const BATCH = [36, 37, 38, 39, 40]
const REFERENCE = [1, 2, 3, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]

function norm(t) {
  return (t || '').toLowerCase().replace(/\(\d+\)(?:\s*\.{2,})?/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}
const tokens = t => norm(t).split(' ').filter(Boolean)
const trigrams = t => {
  const tok = tokens(t)
  const out = []
  for (let i = 0; i + 2 < tok.length; i++) out.push(tok.slice(i, i + 3).join(' '))
  return out
}
const sentences = t => norm(t).split(/(?<=[.!?])\s+/).filter(s => tokens(s).length >= 5)

function loadParts(n) {
  const file = path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`)
  if (!fs.existsSync(file)) return null
  const d = JSON.parse(fs.readFileSync(file, 'utf8'))
  const out = { test: n, parts: {} }
  for (const part of [3, 4, 5, 6]) {
    const p = d.parts.find(x => x.partNumber === part)
    if (!p) continue
    out.parts[part] = p.passage.filter(b => !b.label && b.text).map(b => b.text)
  }
  return out
}

const findings = []
function add(kind, a, b, part, detail, score) {
  findings.push({ rule: kind, testA: a.test, partA: a.part ?? part, testB: b.test, partB: b.part ?? part, normalizedFragment: detail, similarityScore: Math.round(score * 1000) / 1000 })
}

// Load batch passages as block-level entries (for paragraph skeleton) and part-level (for opening/closing).
const batch = []
const refs = []
for (const n of BATCH) {
  const t = loadParts(n)
  if (!t) throw new Error(`missing batch test ${n}`)
  for (const [part, blocks] of Object.entries(t.parts)) {
    const joined = blocks.join(' ')
    batch.push({ test: n, part: Number(part), joined, blocks })
  }
}
for (const n of REFERENCE) {
  const t = loadParts(n)
  if (!t) continue
  for (const [part, blocks] of Object.entries(t.parts)) {
    refs.push({ test: n, part: Number(part), joined: blocks.join(' '), blocks })
  }
}

// 1. Openings (first 5 normalized tokens) — batch vs reference + batch vs batch
for (const a of batch) {
  const openA = tokens(a.joined).slice(0, 5).join(' ')
  if (!openA) continue
  const comp = (b) => tokens(b.joined).slice(0, 5).join(' ')
  for (const b of [...refs, ...batch]) {
    if (a.test === b.test && a.part === b.part) continue
    if (a.test <= b.test && b.test <= a.test && a.part === b.part) continue // skip self
    if (comp(b) === openA) add('shared-opening', a, b, a.part, openA, 1)
  }
}

// 2. Closings (last 8 normalized tokens)
for (const a of batch) {
  const ta = tokens(a.joined)
  if (!ta.length) continue
  const closeA = ta.slice(-8).join(' ')
  for (const b of [...refs, ...batch]) {
    if (a.test === b.test && a.part === b.part) continue
    const tb = tokens(b.joined)
    if (!tb.length) continue
    if (tb.slice(-8).join(' ') === closeA) add('shared-closing', a, b, a.part, closeA, 1)
  }
}

// 3. Repeated clauses >8 words (9-token shared window) — check each batch sentence vs each comparison passage
for (const a of batch) {
  for (const sA of sentences(a.joined)) {
    const win = tokens(sA).slice(0, 9).join(' ')
    if (tokens(sA).length < 9) continue
    for (const b of [...refs, ...batch]) {
      if (a.test === b.test && a.part === b.part) continue
      if (norm(b.joined).includes(win)) {
        add('repeated-clause', a, b, a.part, win.substring(0, 90), 1)
      }
    }
  }
}

// 4. Shared paragraph skeleton (longest common prefix of any batch para vs any comparison para ≥ 10 tokens)
for (const a of batch) {
  for (const [ai, blockA] of a.blocks.entries()) {
    const ta = tokens(blockA)
    if (ta.length < 40) continue
    for (const b of [...refs, ...batch]) {
      if (a.test === b.test && a.part === b.part) continue
      for (const blockB of b.blocks) {
        const tb = tokens(blockB)
        if (tb.length < 40) continue
        let lcp = 0
        const max = Math.min(ta.length, tb.length)
        while (lcp < max && ta[lcp] === tb[lcp]) lcp++
        if (lcp >= 10) {
          add('shared-paragraph-skeleton', { ...a, block: ai }, { ...b }, a.part, ta.slice(0, lcp).join(' ').substring(0, 90), lcp / Math.max(ta.length, tb.length))
        }
      }
    }
  }
}

// 5. Near-duplicate prose (trigram Jaccard ≥ 0.30) on whole-part text
function jaccard(aSet, bSet) {
  const inter = new Set([...aSet].filter(x => bSet.has(x))).size
  const union = new Set([...aSet, ...bSet]).size
  return union ? inter / union : 0
}
for (const a of batch) {
  const ga = new Set(trigrams(a.joined))
  if (ga.size < 10) continue
  for (const b of [...refs, ...batch]) {
    if (a.test === b.test && a.part === b.part) continue
    const gb = new Set(trigrams(b.joined))
    const j = jaccard(ga, gb)
    if (j >= 0.30) add('near-duplicate', a, b, a.part, `jaccard=${Math.round(j * 1000) / 1000}`, j)
  }
}

// Deduplicate findings (same rule + pair + fragment)
const seen = new Set()
const uniq = findings.filter(f => {
  const key = `${f.rule}|${f.testA}:${f.partA}|${f.testB}:${f.partB}|${f.normalizedFragment}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

// Rank all batch-vs-anything pairs by similarity score for the top-20 report.
const allPairs = []
for (const a of batch) {
  for (const b of [...refs, ...batch]) {
    if (a.test === b.test && a.part === b.part) continue
    const ga = new Set(trigrams(a.joined)), gb = new Set(trigrams(b.joined))
    const j = jaccard(ga, gb)
    const openSame = tokens(a.joined).slice(0, 5).join(' ') && tokens(a.joined).slice(0, 5).join(' ') === tokens(b.joined).slice(0, 5).join(' ') ? 0.5 : 0
    allPairs.push({ testA: a.test, partA: a.part, testB: b.test, partB: b.part, score: Math.max(j, openSame), fragA: norm(a.joined).slice(0, 80), fragB: norm(b.joined).slice(0, 80) })
  }
}
allPairs.sort((x, y) => y.score - x.score)

const report = {
  batch: BATCH,
  referenceLoaded: refs.map(r => `${r.test}:P${r.part}`),
  findings: uniq,
  findingsByRule: uniq.reduce((acc, f) => { acc[f.rule] = (acc[f.rule] || 0) + 1; return acc }, {}),
  topSimilarityPairs: allPairs.slice(0, 20),
}
fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-reading-quality-batch-36-40-cross-similarity.json'), JSON.stringify(report, null, 2))

console.log(`Cross-range similarity (tests ${BATCH[0]}-${BATCH[BATCH.length - 1]} vs ${REFERENCE.length} reference tests):`)
console.log(`Reference tests loaded: ${refs.length} passages`)
console.log(`Findings: ${uniq.length}`)
for (const [rule, count] of Object.entries(report.findingsByRule)) console.log(`  ${rule}: ${count}`)
console.log('\nTop 10 similarity pairs:')
for (const p of allPairs.slice(0, 10)) console.log(`  T${p.testA}.P${p.partA} <-> T${p.testB}.P${p.partB} score=${p.score.toFixed(3)} | ${p.fragA.slice(0, 50)}`)
if (uniq.length) process.exitCode = 1
else console.log('\nNO CROSS-RANGE SIMILARITY ISSUES ✓')
