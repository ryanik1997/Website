/**
 * Similarity validator for PET B1 Batch 5 (tests 36-40).
 * Checks for shared openings, closings, repeated clauses, scaffold across Parts 3-6.
 * Run: node scripts/reading/validate-pet-b1-batch-5-similarity.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')

function cw(t) { return (t || '').replace(/\(\d+\)(?:\s*\.{2,})?/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length }

function norm(t) { return t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() }

function sentences(text) {
  return norm(text).split(/(?<=[.!?])\s+/).filter(s => s.split(' ').length >= 5)
}

function loadTest(n) {
  const r = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const out = {}
  for (const part of [3, 4, 5, 6]) {
    const p = r.parts.find(x => x.partNumber === part)
    const text = p.passage.filter(b => !b.label && b.text).map(b => b.text).join(' ')
    out[part] = text
  }
  return out
}

const findings = []

// 1. Shared openings (first 5 normalized tokens)
const openings = {}
for (let n = 36; n <= 40; n++) {
  const t = loadTest(n)
  for (const part of [3, 4, 5, 6]) {
    const first5 = norm(t[part]).split(' ').slice(0, 5).join(' ')
    const key = `P${part}:${first5}`
    if (!openings[key]) openings[key] = []
    openings[key].push(n)
  }
}
for (const [key, tests] of Object.entries(openings)) {
  if (tests.length > 1) findings.push({ rule: 'shared-opening', key, tests, detail: key.split(':')[1] })
}

// 2. Shared closings (last 8 normalized tokens)
const closings = {}
for (let n = 36; n <= 40; n++) {
  const t = loadTest(n)
  for (const part of [3, 4, 5, 6]) {
    const words = norm(t[part]).split(' ').filter(Boolean)
    const last8 = words.slice(-8).join(' ')
    const key = `P${part}:${last8}`
    if (!closings[key]) closings[key] = []
    closings[key].push(n)
  }
}
for (const [key, tests] of Object.entries(closings)) {
  if (tests.length > 1) findings.push({ rule: 'shared-closing', key, tests, detail: key.split(':')[1] })
}

// 3. Repeated clauses > 8 words
const seenSentences = {}
for (let n = 36; n <= 40; n++) {
  const t = loadTest(n)
  for (const part of [3, 4, 5, 6]) {
    for (const s of sentences(t[part])) {
      const key = s.split(' ').slice(0, 9).join(' ')
      if (!seenSentences[key]) seenSentences[key] = []
      seenSentences[key].push({ test: n, part })
    }
  }
}
for (const [key, refs] of Object.entries(seenSentences)) {
  const uniq = new Set(refs.map(r => `${r.test}:P${r.part}`))
  if (uniq.size > 1) findings.push({ rule: 'repeated-clause', key, refs: [...uniq], detail: key.substring(0, 60) })
}

// Report
console.log(`\n=== SIMILARITY AUDIT (Batch 5, tests 36-40) ===`)
console.log(`Findings: ${findings.length}\n`)

// Word counts summary
console.log('=== FINAL COUNTS ===')
for (let n = 36; n <= 40; n++) {
  const t = loadTest(n)
  const counts = {}
  for (const part of [3, 4, 5, 6]) counts[part] = cw(t[part])
  console.log(`T${n}: P3=${counts[3]} P4=${counts[4]} P5=${counts[5]} P6=${counts[6]}`)
}

if (findings.length > 0) {
  console.log('\n=== FINDINGS ===')
  for (const f of findings) {
    console.log(`[${f.rule}] ${f.detail} | tests: ${Array.isArray(f.tests) ? f.tests.join(',') : (f.refs || []).join(',')}`)
  }
  process.exitCode = 1
} else {
  console.log('\nNO SHARED SCAFFOLD DETECTED ✓')
}
