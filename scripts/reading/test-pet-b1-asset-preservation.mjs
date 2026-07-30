import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const file = path.join(root, 'apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-test14.json')
const original = await fs.readFile(file)
try {
  const body = JSON.parse(original)
  const block = body.parts[1].passage.find(item => item.imageSlotId?.endsWith('-option-a-image'))
  block.assetId = 'asset-test-preserve-14-a'
  block.alt = 'Community garden tools'
  await fs.writeFile(file, `${JSON.stringify(body, null, 2)}\n`)
  const result = spawnSync(process.execPath, ['scripts/reading/generate-pet-b1-reading-tests-14-51.mjs', '--test=14'], { cwd: root, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || result.stdout)
  const regenerated = JSON.parse(await fs.readFile(file, 'utf8'))
  const preserved = regenerated.parts[1].passage.find(item => item.imageSlotId?.endsWith('-option-a-image'))
  if (preserved.assetId !== 'asset-test-preserve-14-a' || preserved.alt !== 'Community garden tools') throw new Error('Part 2 asset fields were not preserved')
  console.log('PET Part 2 asset-preservation PASS')
} finally {
  await fs.writeFile(file, original)
}
