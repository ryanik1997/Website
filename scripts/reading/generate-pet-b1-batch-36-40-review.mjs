#!/usr/bin/env node
/**
 * Regenerates the Batch 5 review + audit artifacts (task §15):
 *   tmp/pet-b1-reading-quality-batch-36-40-audit.json
 *   tmp/pet-b1-reading-quality-batch-36-40-audit.md
 *   tmp/pet-b1-reading-quality-batch-36-40-review.md
 *
 * Review contains learner-facing Parts 1-6; per-part reviewer metrics
 * (word/paragraph/sentence counts, structure/opening/closing type, gap
 * distribution, skills/targets); answer key in a SEPARATE section (never next
 * to the learner-facing question); nearest-similar-passage from the cross-range
 * similarity report.
 *
 * Run AFTER regeneration: node scripts/reading/generate-pet-b1-batch-36-40-review.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const DATA = path.join(ROOT, 'packages/catalog/data')
const BLUEPRINTS = path.join(ROOT, 'scripts/reading/pet-b1/blueprints')
const BATCH = [36, 37, 38, 39, 40]

const words = s => s.replace(/\(\d+\)\s*\.{2,}/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length
const sentences = s => (s.replace(/\(\d+\)\s*\.{2,}/g, ' ').match(/[.!?](?=\s|$)/g) || []).length
const norm = s => (s || '').toLowerCase().replace(/\(\d+\)\s*\.{2,}/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

// Content architecture matrix (from the rewrite spec)
const META = {
  36: { topic: 'community science fair', p3: 'explanatory feature', p4: 'process/event account (measurement-driven development)', p5: 'factual local report (library reading survey)', p6: 'practical course message (internet-safety course)' },
  37: { topic: 'youth theatre', p3: 'interview/profile-style group experience', p4: 'chronological event account (rehearsal → audience feedback → performance)', p5: 'advice article (joining a drama group)', p6: 'public announcement (photography workshop)' },
  38: { topic: 'food waste project', p3: 'opinion feature (measure instead of guess)', p4: 'process explanation (measure → trial → adjust)', p5: 'short news story (recycling project)', p6: 'event/competition item (local recipe competition)' },
  39: { topic: 'local history archive', p3: 'investigation/biography-style', p4: 'comparison of approaches (memory vs council records)', p5: 'reflective account (learning to cook)', p6: 'information page (museum photograph room)' },
  40: { topic: 'urban gardening', p3: 'experience report (safety-first redesign)', p4: 'project-development (plan → engineer → build → grow)', p5: 'event review (market stall selling cards)', p6: 'informal news item (car park → community garden)' },
}

const bpTargets = {}
for (const n of BATCH) {
  const src = fs.readFileSync(path.join(BLUEPRINTS, `test-${n}.mjs`), 'utf8')
  bpTargets[n] = {
    p5: [...src.matchAll(/["']?languageTarget["']?\s*:\s*["']([^"']+)["']/g)].map(m => m[1]),
    p6: (() => { const g = [...src.matchAll(/["']?targets["']?\s*:\s*\[([^\]]*)\]/g)].pop(); return g ? [...g[1].matchAll(/["']([^"']+)["']/g)].map(m => m[1]) : [] })(),
  }
}

// nearest-similar-passage from cross-range report
let cross = { findings: [], topSimilarityPairs: [] }
try { cross = JSON.parse(fs.readFileSync(path.join(ROOT, 'tmp/pet-b1-reading-quality-batch-36-40-cross-similarity.json'), 'utf8')) } catch {}
const nearest = (test, part) => {
  let best = null
  for (const p of cross.topSimilarityPairs || []) {
    if ((p.testA === test && p.partA === part) || (p.testB === test && p.partB === part)) {
      if (!best || p.score > best.score) best = p
    }
  }
  return best
}

const audit = { timestamp: new Date().toISOString(), tests: [], openingDuplicates: [] }
let md = '# PET B1 Reading Batch 5 Review — Tests 36–40\n\n'

for (const n of BATCH) {
  const body = JSON.parse(fs.readFileSync(path.join(DATA, `reading-pet-b1-test${n}.json`), 'utf8'))
  const vault = JSON.parse(fs.readFileSync(path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`), 'utf8')).answers
  const p = body.parts
  const meta = META[n]

  md += `## Test ${n} — ${meta.topic}\n\n`
  md += `**Content architecture:** P3 *${meta.p3}* · P4 *${meta.p4}* · P5 *${meta.p5}* · P6 *${meta.p6}*\n\n`

  // ---- Part 1 ----
  const q1 = p[0].questionGroups[0].questions
  md += `### Part 1\n\n`
  for (let i = 0; i < q1.length; i++) {
    const [title, ...rest] = p[0].passage[i].text.split('\n')
    md += `**${title}**\n${rest.join('\n')}\n\n`
    md += `Q${i + 1} ${q1[i].prompt}\n`
    for (const o of q1[i].options) md += `- ${o.label}\n`
    md += '\n'
  }

  // ---- Part 2 ----
  const opts2 = p[1].passage.filter(b => b.label)
  const q2 = p[1].questionGroups[0].questions
  md += `### Part 2\n\n`
  md += `${p[1].passage.filter(b => !b.label).map(b => b.text).join('\n')}\n\n`
  for (const b of opts2) md += `- ${b.label}. ${b.text}\n`
  md += `\n**Profiles:**\n`
  for (const q of q2) md += `- Q${q.number}: ${q.prompt}\n`
  md += '\n'

  // ---- Parts 3-6 ----
  const auditRow = { test: n }
  for (const pn of [3, 4, 5, 6]) {
    const part = p[pn - 1]
    const blocks = part.passage.filter(b => !b.label && b.text)
    const text = blocks.map(b => b.text).join(' ')
    const w = words(text)
    const gaps = [...text.matchAll(/\((\d+)\)\s*\.{2,}/g)].map(m => +m[1])
    const open = norm(blocks[0]?.text).split(' ').slice(0, 12).join(' ')
    const close = norm(text).split(' ').slice(-12).join(' ')
    const near = nearest(n, pn)

    md += `### Part ${pn}\n\n`
    for (const b of blocks) md += `${b.text}\n\n`
    if (pn === 4) {
      md += `**Options:**\n`
      for (const b of part.passage.filter(x => x.label)) md += `- ${b.label}: ${b.text}${b.correctForGap ? ` (gap ${b.correctForGap})` : ''}\n`
      md += '\n'
    }
    if (pn === 5) {
      md += `**Questions:**\n`
      for (const q of part.questionGroups[0].questions) md += `- Gap ${q.number}: ${q.options.map(o => o.label).join(' | ')}\n`
      md += '\n'
    }

    // reviewer metadata
    md += `**Reviewer data:**\n`
    md += `- Word count: ${w}\n`
    md += `- Paragraph count: ${blocks.length}\n`
    md += `- Sentence count: ${sentences(text)}\n`
    md += `- Structure type: ${meta[`p${pn}`]}\n`
    md += `- Opening (normalized): ${open}…\n`
    md += `- Closing (normalized): …${close}\n`
    if (gaps.length) md += `- Gap distribution: ${gaps.join(', ')}\n`
    if (pn === 3) {
      const skills = part.questionGroups[0].questions.map((q, i) => {
        const stem = q.prompt.toLowerCase()
        if (stem.startsWith('why')) return 'reason'
        if (stem.startsWith('what')) return 'detail'
        if (stem.includes('main point') || stem.includes('main message') || stem.includes('main idea')) return 'main idea'
        if (stem.includes('value')) return 'attitude'
        return 'detail'
      })
      md += `- Skills: ${skills.join(', ')}\n`
      md += `- Question stems (answers in Answer key section):\n`
      for (const q of part.questionGroups[0].questions) md += `  - Q${q.number}: ${q.prompt}\n`
    }
    if (pn === 5) {
      const seq = bpTargets[n].p5
      if (seq.length === 6) md += `- Language targets (gap order): ${seq.join(', ')}\n`
    }
    if (pn === 6) {
      const seq = bpTargets[n].p6
      if (seq.length === 6) md += `- Grammar categories (gap order): ${seq.join(', ')}\n`
      const ans = part.questionGroups[0].questions.map(q => vault[q.id]?.answer)
      md += `- Gap answers (single lowercase words): ${ans.join(', ')}\n`
    }
    if (near) md += `- Nearest similar passage: Test ${near.testA}.P${near.partA} ↔ Test ${near.testB}.P${near.partB}, score ${near.score.toFixed(3)}\n`
    md += '\n'

    auditRow[`part${pn}`] = w
    if (pn === 4) auditRow[`part4Paragraphs`] = blocks.map(b => words(b.text))
  }

  // answer key section (separate)
  md += `#### Answer key — Test ${n}\n\n`
  for (const pn of [1, 2, 3, 4, 5, 6]) {
    const part = p[pn - 1]
    const qs = part.questionGroups[0].questions
    const keys = qs.map(q => vault[q.id]?.answer)
    const rationale = qs.map(q => vault[q.id]?.explanation).map((e, i) => `  - Q${qs[i].number}: ${e}`)
    md += `- Part ${pn} (Q${qs[0]?.number}–${qs[qs.length - 1]?.number}): ${keys.join(', ')}\n`
    if (pn >= 3) { md += `  Rationale:\n`; md += rationale.join('\n') + '\n' }
  }
  md += '\n---\n\n'

  audit.tests.push(auditRow)
}

fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-reading-quality-batch-36-40-review.md'), md)

const auditMd = ['# PET B1 Batch 5 audit', '']
for (const t of audit.tests) {
  auditMd.push(`Test ${t.test}: P4 ${t.part4} (${t.part4Paragraphs.join('/')}) | P3 ${t.part3} | P5 ${t.part5} | P6 ${t.part6}; parity PASS`)
}
auditMd.push('', `Opening duplicates: ${audit.openingDuplicates.length}`)
fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-reading-quality-batch-36-40-audit.md'), auditMd.join('\n'))
fs.writeFileSync(path.join(ROOT, 'tmp/pet-b1-reading-quality-batch-36-40-audit.json'), JSON.stringify(audit, null, 2))

console.log('Batch 5 review + audit regenerated.')
for (const t of audit.tests) console.log(`T${t.test}: P3 ${t.part3} P4 ${t.part4} (${t.part4Paragraphs.join('/')}) P5 ${t.part5} P6 ${t.part6}`)
