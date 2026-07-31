import fs from 'node:fs'
import { compilePart2 } from '../../scripts/reading/pet-b1/compile/compile-exam.mjs'
const n = 41
const bp = (await import(`../../scripts/reading/pet-b1/blueprints/test-${n}.mjs`)).default
const p2 = compilePart2(n, bp)
const cur = JSON.parse(fs.readFileSync(`apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`, 'utf8'))
const compBlocks = p2.passage.slice(1)
const curBlocks = cur.parts[1].passage.slice(1)
for (let i = 0; i < compBlocks.length; i++) {
  const c = compBlocks[i], o = curBlocks[i]
  const diffs = []
  for (const k of new Set([...Object.keys(c), ...Object.keys(o)])) {
    if (JSON.stringify(c[k]) !== JSON.stringify(o[k])) diffs.push(k)
  }
  console.log(`option ${i}: diffs=${diffs.join(',')}`)
}
