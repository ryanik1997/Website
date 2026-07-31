/**
 * Generate runtime catalog JSON from package data for tests 31-35.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')

for (let n = 31; n <= 35; n++) {
  const pkgPath = resolve(ROOT, `packages/catalog/data/reading-pet-b1-test${n}.json`)
  const runPath = resolve(ROOT, `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test${n}.json`)

  if (!existsSync(pkgPath)) { console.log(`Skip ${n}: no package file`); continue }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

  // Runtime is identical to package except P4 passage: merge text blocks into one
  const run = { ...pkg }
  run.parts = pkg.parts.map(part => {
    if (part.partNumber !== 4) return part
    const textBlocks = part.passage.filter(b => !b.label && b.text)
    const labeled = part.passage.filter(b => b.label)
    const merged = textBlocks.map(b => b.text).join(' ')
    return { ...part, passage: [{ text: merged }, ...labeled] }
  })

  writeFileSync(runPath, JSON.stringify(run, null, 2) + '\n')
  console.log(`Generated runtime test ${n}`)
}
