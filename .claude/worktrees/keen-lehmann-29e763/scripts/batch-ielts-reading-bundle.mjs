/**
 * Bundle tất cả IELTS Reading folders đã có đủ 3 exam_passage*.json
 *
 *   node scripts/batch-ielts-reading-bundle.mjs
 *   node scripts/batch-ielts-reading-bundle.mjs --dry-run
 */
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const IELTS_ROOT = join(ROOT, 'Tainguyen', 'IELTS')
const FOLDER_RE = /^Reading IELTS_Test\d+_Cam\d+$/i
const dryRun = process.argv.includes('--dry-run')

const folders = readdirSync(IELTS_ROOT, { withFileTypes: true })
  .filter(e => e.isDirectory() && FOLDER_RE.test(e.name))
  .map(e => e.name)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

let ready = 0
let bundled = 0
let failed = 0

for (const name of folders) {
  const dir = join(IELTS_ROOT, name)
  const hasAll = [1, 2, 3].every(n => existsSync(join(dir, `exam_passage${n}.json`)))
  if (!hasAll) continue
  ready++

  const rel = `IELTS/${name}`
  if (dryRun) {
    console.log(`[dry-run] pnpm ielts:reading:bundle "${rel}"`)
    continue
  }

  console.log(`\n── ${name} ──`)
  const result = spawnSync(`pnpm ielts:reading:bundle "${rel}"`, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  })
  if (result.status === 0) bundled++
  else failed++
}

console.log(`\n📊 Reading bundle batch`)
console.log(`   Folders: ${folders.length}`)
console.log(`   Sẵn sàng (3 passages): ${ready}`)
if (!dryRun) {
  console.log(`   Bundled OK: ${bundled}`)
  console.log(`   Failed: ${failed}`)
}