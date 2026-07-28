/**
 * Mode A — remove bank media from Vite dist before Vercel ships it.
 * Keeps local public/ for DEV; production deploy must not expose catalog/data.
 *
 * Run after vite build (hooked from apps/web package.json build).
 */
import { existsSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, '..', 'apps', 'web', 'dist')

const STRIP = ['catalog', 'data', 'books', 'ielts-wizard']

function main() {
  if (!existsSync(DIST)) {
    console.warn('[strip-media] dist missing — skip')
    return
  }
  for (const name of STRIP) {
    const p = join(DIST, name)
    if (existsSync(p)) {
      rmSync(p, { recursive: true, force: true })
      console.log('[strip-media] removed', name)
    }
  }
  // Placeholder so accidental 404 is clear
  const noteDir = join(DIST, '_mode-a')
  mkdirSync(noteDir, { recursive: true })
  writeFileSync(
    join(noteDir, 'README.txt'),
    'Mode A Fortress: catalog/, data/, books/, and ielts-wizard/ are NOT shipped.\nMedia is private Supabase Storage + content-sign.\n',
  )
  console.log('[strip-media] done')
}

main()
