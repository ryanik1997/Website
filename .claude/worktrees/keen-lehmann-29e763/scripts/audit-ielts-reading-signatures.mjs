import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', 'Tainguyen', 'IELTS')
const dirs = readdirSync(ROOT)
  .filter(d => d.startsWith('Reading') && statSync(join(ROOT, d)).isDirectory())
  .sort()

const byPassage = { 1: new Map(), 2: new Map(), 3: new Map() }
let files = 0

for (const d of dirs) {
  const dir = join(ROOT, d)
  for (let p = 1; p <= 3; p++) {
    const f = join(dir, `exam_passage${p}.json`)
    if (!existsSync(f)) continue
    files++
    const j = JSON.parse(readFileSync(f, 'utf8'))
    const sig = j.questionGroups.map(g => g.type).join('|')
    const key = sig
    if (!byPassage[p].has(key)) byPassage[p].set(key, [])
    byPassage[p].get(key).push(d)
  }
}

console.log(`Passage JSON files: ${files}`)
for (const p of [1, 2, 3]) {
  console.log(`\n=== PASSAGE ${p} (${byPassage[p].size} signatures) ===`)
  for (const [sig, exams] of [...byPassage[p].entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${exams.length}x  ${sig}`)
    if (exams.length <= 4) console.log(`      ${exams.join(', ')}`)
  }
}