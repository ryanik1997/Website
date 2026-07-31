#!/usr/bin/env node
/**
 * Part 2 semantic-fingerprint audit for PET B1 tests 25-51 (task_3 §6).
 * Loads Part 2 from its real source (blueprint for 25-30/36-40/51, public
 * runtime JSON for 31-35/41-50 which have no canonical blueprint), computes a
 * normalized fingerprint, classifies each test, and writes:
 *   tmp/pet-b1-part2-duplicate-audit.json
 *   tmp/pet-b1-part2-duplicate-audit.md
 * Run: node scripts/reading/audit-pet-b1-part2-25-51.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const BLUEPRINTS = path.join(ROOT, 'scripts/reading/pet-b1/blueprints')

const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const tokenSet = s => new Set(norm(s).split(' ').filter(Boolean))
const jaccard = (a, b) => {
  const sa = tokenSet(a), sb = tokenSet(b)
  const inter = [...sa].filter(x => sb.has(x)).length
  const union = new Set([...sa, ...sb]).size
  return union ? inter / union : 0
}

// tests that have a canonical blueprint (compileExam/compileExamSimple path)
const HAS_BLUEPRINT = new Set([25, 26, 27, 28, 29, 30, 36, 37, 38, 39, 40, 51])

async function loadPart2(n) {
  if (HAS_BLUEPRINT.has(n)) {
    const bp = (await import(pathToFileURL(path.join(BLUEPRINTS, `test-${n}.mjs`)).href)).default
    const p2 = bp.part2
    return {
      test: n, source: 'blueprint', domain: p2.domain,
      profiles: p2.profiles.map(p => p.text),
      options: p2.options.map(o => `${o.title} ${o.description ?? o.text}`),
      answerKeys: p2.profiles.map(p => p.correctOptionKey),
      openingStyles: p2.options.map(o => o.openingStyle).filter(Boolean),
    }
  }
  const d = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.json`), 'utf8'))
  const p2 = d.parts[1]
  const vault = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`), 'utf8')).answers
  const opts = p2.passage.filter(b => b.label)
  return {
    test: n, source: 'runtime', domain: p2.passage[0]?.text ?? '',
    profiles: p2.questionGroups[0].questions.map(q => q.prompt),
    options: opts.map(b => b.text),
    answerKeys: p2.questionGroups[0].questions.map(q => vault[q.id]?.answer ?? '?'),
    openingStyles: [],
  }
}

const tests = []
for (let n = 25; n <= 51; n++) tests.push(await loadPart2(n))

// cross-test similarity: profile-set similarity + option-set similarity
const pairs = []
for (let i = 0; i < tests.length; i++) {
  for (let j = i + 1; j < tests.length; j++) {
    const a = tests[i], b = tests[j]
    const profSim = a.profiles.map((p, k) => jaccard(p, b.profiles[k] ?? ''))
    const profAvg = profSim.reduce((x, y) => x + y, 0) / Math.max(a.profiles.length, b.profiles.length)
    const optSim = a.options.map((p, k) => jaccard(p, b.options[k] ?? ''))
    const optAvg = optSim.reduce((x, y) => x + y, 0) / Math.max(a.options.length, b.options.length)
    pairs.push({ a: a.test, b: b.test, profileSimilarity: Math.round(profAvg * 1000) / 1000, optionSimilarity: Math.round(optAvg * 1000) / 1000, profileSkeletons: profAvg > 0.4, optionSkeletons: optAvg > 0.4 })
  }
}

// classify each test by its worst nearest duplicate
function classify(t) {
  if (t.test === 30 || t.test === 51) return { code: 'KEEP_GOLDEN', reason: 'golden/protected' }
  const rel = pairs.filter(p => p.a === t.test || p.b === t.test)
  if (!rel.length) return { code: 'KEEP_UNIQUE', reason: 'no comparison pairs' }
  const worst = rel.sort((x, y) => (y.profileSimilarity + y.optionSimilarity) - (x.profileSimilarity + x.optionSimilarity))[0]
  const other = worst.a === t.test ? worst.b : worst.a
  const combined = worst.profileSimilarity + worst.optionSimilarity
  if (combined >= 1.6) return { code: 'REWRITE_EXACT_DUPLICATE', reason: `near-identical to T${other} (prof ${worst.profileSimilarity}, opt ${worst.optionSimilarity})`, nearest: other }
  if (combined >= 1.1) return { code: 'REWRITE_NEAR_DUPLICATE', reason: `shared skeleton with T${other} (prof ${worst.profileSimilarity}, opt ${worst.optionSimilarity})`, nearest: other }
  if (combined >= 0.6) return { code: 'REWRITE_SHARED_SCAFFOLD', reason: `scaffold overlap with T${other} (prof ${worst.profileSimilarity}, opt ${worst.optionSimilarity})`, nearest: other }
  return { code: 'KEEP_UNIQUE', reason: `most distinct (nearest T${other} prof ${worst.profileSimilarity}, opt ${worst.optionSimilarity})`, nearest: other }
}

const classified = tests.map(t => ({ test: t.test, source: t.source, ...classify(t), openingStyles: t.openingStyles }))
const byCode = classified.reduce((acc, c) => (acc[c.code] = (acc[c.code] || 0) + 1, acc), {})

const md = ['# PET B1 Part 2 duplicate audit — Tests 25-51', '',
  '| Test | Source | Classification | Nearest | Profile sim | Option sim | Reason |',
  '|------|--------|---------------|---------|-------------|------------|--------|']
for (const c of classified) {
  const p = c.code === 'KEEP_GOLDEN' ? {} : pairs.filter(x => (x.a === c.test && x.b === c.nearest) || (x.b === c.test && x.a === c.nearest))[0] || {}
  md.push(`| ${c.test} | ${c.source} | ${c.code} | ${c.nearest ?? '—'} | ${p.profileSimilarity ?? '—'} | ${p.optionSimilarity ?? '—'} | ${c.reason} |`)
}
md.push('', `Summary: ${JSON.stringify(byCode)}`)

fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-part2-duplicate-audit.json'), JSON.stringify({ classified, pairs, byCode }, null, 2))
fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-part2-duplicate-audit.md'), md.join('\n'))
console.log(md.join('\n'))
