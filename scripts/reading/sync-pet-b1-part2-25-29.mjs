#!/usr/bin/env node
/**
 * Sync Part 2 from blueprint to runtime for tests 25-29 (task_3 §6/§17).
 * The 25-29 blueprints carry distinct bespoke Part 2 content, but the public
 * runtime is stale (shared fallback scaffold). Tests 25-29 were backfilled
 * directly into runtime for Parts 3-6, so a full regeneration would clobber
 * that backfill. This script rewrites ONLY Part 2 (public + package + answer
 * vault Part 2 entries), preserving all other parts byte-for-byte.
 * Run: node scripts/reading/sync-pet-b1-part2-25-29.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { compileExamSimple } from './pet-b1/compile/compile-exam.mjs'

const ROOT = process.cwd()
const DATA = path.join(ROOT, 'packages/catalog/data')
const PUBLIC = path.join(ROOT, 'apps/web/public/catalog/exams/reading')
const BLUEPRINTS = path.join(ROOT, 'scripts/reading/pet-b1/blueprints')
const TARGETS = [25, 26, 27, 28, 29]

for (const n of TARGETS) {
  const bp = (await import(pathToFileURL(path.join(BLUEPRINTS, `test-${n}.mjs`)).href)).default
  if (bp.part1.cards) throw new Error(`Test ${n} uses cards; this script targets items-based (simple) blueprints`)
  const compiled = compileExamSimple(bp)
  const part2 = compiled.body.parts.find(p => p.partNumber === 2)
  const answerIds = Object.keys(compiled.answers.answers).filter(id => id.includes(`-part-2-`))
  const answerEntries = Object.fromEntries(answerIds.map(id => [id, compiled.answers.answers[id]]))

  for (const dir of [DATA, PUBLIC]) {
    const bodyPath = path.join(dir, dir === DATA ? `reading-pet-b1-test${n}.json` : `catalog-reading-pet-b1-test${n}.json`)
    const body = JSON.parse(fs.readFileSync(bodyPath, 'utf8'))
    body.parts[1] = part2
    fs.writeFileSync(bodyPath, `${JSON.stringify(body, null, 2)}\n`)
  }
  const vaultPath = path.join(PUBLIC, `catalog-reading-pet-b1-test${n}.answers.json`)
  const vault = JSON.parse(fs.readFileSync(vaultPath, 'utf8'))
  for (const [id, entry] of Object.entries(answerEntries)) vault.answers[id] = entry
  fs.writeFileSync(vaultPath, `${JSON.stringify(vault, null, 2)}\n`)
  console.log(`Test ${n}: Part 2 synced from blueprint (${part2.passage.length - 1} options, ${part2.questionGroups[0].questions.length} profiles)`)
}
console.log('Part 2 sync complete for tests 25-29')
