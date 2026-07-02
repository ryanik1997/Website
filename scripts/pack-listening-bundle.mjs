/**
 * Đóng gói Tainguyen/<bundle>/ → ZIP để Import thủ công Listening.
 * Run: node scripts/pack-listening-bundle.mjs ket-listening-test1
 */
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipSync } from '../apps/web/node_modules/fflate/esm/browser.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TAINGUYEN = path.join(ROOT, 'Tainguyen')

const MEDIA_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.ogg'])

async function main() {
  const bundleDir = process.argv[2] ?? 'ket-listening-test1'
  const sourceDir = path.join(TAINGUYEN, bundleDir)
  if (!existsSync(sourceDir)) {
    console.error(`Không tìm thấy: ${sourceDir}`)
    process.exit(1)
  }

  const examJsonPath = path.join(sourceDir, 'exam.json')
  if (!existsSync(examJsonPath)) {
    console.error('Thiếu exam.json trong bundle.')
    process.exit(1)
  }

  const entries = await fs.readdir(sourceDir, { withFileTypes: true })
  const files = entries.filter(e => e.isFile()).map(e => e.name)
  const zipFiles = files.filter(name => {
    const ext = path.extname(name).toLowerCase()
    return name === 'exam.json' || MEDIA_EXT.has(ext)
  })

  const zipData = {}
  for (const name of zipFiles) {
    zipData[name] = new Uint8Array(await fs.readFile(path.join(sourceDir, name)))
  }

  const zipBase = path.basename(bundleDir)
  const outDir = path.dirname(path.join(TAINGUYEN, bundleDir))
  const outPath = path.join(outDir, `${zipBase}.zip`)
  await fs.writeFile(outPath, zipSync(zipData))
  console.log(`✓ ${outPath}`)
  console.log(`  ${zipFiles.length} files: ${zipFiles.join(', ')}`)
  console.log('  → Luyện thi → Import thủ công Listening → chọn ZIP này')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})