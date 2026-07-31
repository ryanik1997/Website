#!/usr/bin/env node
/**
 * Apply bespoke Part 2 content to tests 31-35 + 41-50 (task_3 §6-9).
 * These tests have no canonical blueprint; their Part 2 currently comes from a
 * shared fallback scaffold. This script rewrites their runtime Part 2 in BOTH
 * packages/catalog/data and apps/web/public (parity), plus the answer vault.
 *
 * Content source: every tmp/_workspace/part2-rewrite-*.json file:
 *   { "<testN>": { domain, options: [{key,title,description,openingStyle,constraints}...8],
 *                  profiles: [{key,text,correctOptionKey}...5] } }
 *
 * Rules enforced here: 8 distinct options, 5 distinct profiles, valid + unique
 * answer keys, title contains no em/en-dash or "- ".
 * Run: node scripts/reading/rewrite-pet-b1-part2-31-50.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const TARGETS = [31, 32, 33, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
const LETTERS = 'ABCDEFGH'.split('')

const norm = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const assertTitleSafe = t => !/[—–]|-\s|-$/.test(t)

const content = {}
const files = fs.readdirSync(path.join(ROOT, 'tmp/_workspace')).filter(f => f.startsWith('part2-rewrite-') && f.endsWith('.json'))
for (const f of files) Object.assign(content, JSON.parse(fs.readFileSync(path.join(ROOT, 'tmp/_workspace', f), 'utf8')))

const errors = []
for (const n of TARGETS) {
  if (!content[n]) { errors.push(`Test ${n}: no content`); continue }
  const c = content[n]
  if (c.options.length !== 8) errors.push(`Test ${n}: ${c.options.length} options`)
  if (c.profiles.length !== 5) errors.push(`Test ${n}: ${c.profiles.length} profiles`)
  if (new Set(c.options.map(o => norm(`${o.title} ${o.description}`))).size !== 8) errors.push(`Test ${n}: options not distinct`)
  if (new Set(c.profiles.map(p => norm(p.text))).size !== 5) errors.push(`Test ${n}: profiles not distinct`)
  const keys = new Set(c.options.map(o => o.key))
  const answers = c.profiles.map(p => p.correctOptionKey)
  if (answers.some(k => !keys.has(k))) errors.push(`Test ${n}: unknown answer key`)
  if (new Set(answers).size !== 5) errors.push(`Test ${n}: answer keys not unique`)
  for (const o of c.options) if (!assertTitleSafe(o.title)) errors.push(`Test ${n}: unsafe title "${o.title}"`)
  const styles = c.options.map(o => o.openingStyle).filter(Boolean)
  if (new Set(styles).size < 5) errors.push(`Test ${n}: <5 opening styles`)
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }

function apply(n) {
  const c = content[n]
  const id = `catalog-reading-pet-b1-test${n}`
  const passage = [{ text: `The people below want to choose from ${c.domain}. Decide which option is most suitable.` }]
  const features = []
  for (let i = 0; i < 8; i++) {
    const o = c.options[i]
    const label = LETTERS[i]
    const block = {
      label,
      text: `${o.title} — ${o.description}`,
      imageSlotId: `${id}-part-2-option-${label.toLowerCase()}-image`,
      imageRequired: false,
    }
    passage.push(block)
    features.push({ id: label.toLowerCase(), name: block.text })
  }
  const questions = c.profiles.map((p, i) => {
    const qid = `${id}-part-2-q${i + 6}`
    return { id: qid, number: i + 6, type: 'matching-features', prompt: p.text, options: [], answerConfidence: 'key' }
  })
  const part = {
    id: `${id}-part-2`, partNumber: 2, rangeLabel: 'Questions 6–10',
    passageTitle: 'Part 2 – Matching', passage,
    questionGroups: [{ id: `${id}-part-2-g0`, range: 'Questions 6–10', instruction: 'For each question, choose the most suitable option.', type: 'matching-features', features, questions }],
  }
  const answerEntries = {}
  for (let i = 0; i < 5; i++) {
    const label = LETTERS[c.options.findIndex(o => o.key === c.profiles[i].correctOptionKey)]
    answerEntries[`${id}-part-2-q${i + 6}`] = { answer: label, explanation: `Option ${label} satisfies all constraints in the profile.` }
  }
  return { part, answerEntries }
}

// Merge part into body, keeping the other 5 parts and the rest of the file intact.
for (const n of TARGETS) {
  const { part, answerEntries } = apply(n)
  for (const dir of [DATA, PUBLIC]) {
    const bodyPath = path.join(dir, dir === DATA ? `reading-pet-b1-test${n}.json` : `catalog-reading-pet-b1-test${n}.json`)
    const body = JSON.parse(fs.readFileSync(bodyPath, 'utf8'))
    body.parts[1] = part
    fs.writeFileSync(bodyPath, `${JSON.stringify(body, null, 2)}\n`)
  }
  const vaultPath = path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`)
  const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'))
  Object.assign(vault.answers, answerEntries)
  fs.writeFileSync(vaultPath, `${JSON.stringify(vault, null, 2)}\n`)
  console.log(`Test ${n}: Part 2 rewritten (${part.passage.length - 1} options, ${part.questionGroups[0].questions.length} profiles)`)
}
console.log('Part 2 rewrite applied for tests', TARGETS.join(','))
