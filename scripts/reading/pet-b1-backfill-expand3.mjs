import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..')
const DATA = n => resolve(ROOT, `packages/catalog/data/reading-pet-b1-test${n}.json`)

// Load expansion data from JSON sidecar
const expPath = resolve(__dirname, 'pet-b1-expand3-data.json')
const expData = JSON.parse(readFileSync(expPath, 'utf8'))

for (let n = 20; n <= 29; n++) {
  const d = JSON.parse(readFileSync(DATA(n), 'utf8'))
  const p4 = d.parts.find(p => p.partNumber === 4)
  if (!p4) continue

  const textBlocks = p4.passage.filter(b => !b.label && b.text)
  const adds = expData[String(n)]
  if (!adds) { console.log(`No data for test ${n}`); continue }

  for (let i = 0; i < textBlocks.length && i < adds.length; i++) {
    textBlocks[i].text += ' ' + adds[i]
  }

  writeFileSync(DATA(n), JSON.stringify(d, null, 2) + '\n')
  console.log(`Test ${n}: expanded`)
}
