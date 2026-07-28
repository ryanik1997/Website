/**
 * Copy listening.mp3 + ảnh từ Tainguyen/IELTS vào apps/web/public/catalog/listening/
 * để import IELTS có fallback audioUrl (/catalog/listening/ielts-cam{X}-test{Y}/...).
 *
 * Run: pnpm ielts:publish-media
 *      pnpm ielts:publish-media -- "IELTS/Listening IELTS_Test3_Cam9"
 */
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { REPO_ROOT, resolveTainguyenPath } from './tainguyen-path.mjs'

const ROOT = REPO_ROOT
const TAINGUYEN_IELTS = join(resolveTainguyenPath(), 'IELTS')
const PUBLIC_LISTENING = join(ROOT, 'apps', 'web', 'public', 'catalog', 'listening')

const MEDIA_EXT = new Set(['.mp3', '.wav', '.ogg', '.jpg', '.jpeg', '.png', '.webp', '.gif'])
const FOLDER_RE = /^Listening IELTS_Test(\d+)_Cam(\d+)$/i

function slug(cam, test) {
  return `ielts-cam${cam}-test${test}`
}

function resolveTargets(filterArg) {
  if (filterArg) {
    const dir = join(TAINGUYEN_IELTS, filterArg.replace(/^IELTS\//, '').replace(/^IELTS\\/, ''))
    if (!existsSync(dir)) throw new Error(`Không tìm thấy: ${dir}`)
    const m = dir.split(/[/\\]/).pop()?.match(FOLDER_RE)
    if (!m) throw new Error(`Tên thư mục không khớp: ${dir}`)
    return [{ dir, cam: m[2], test: m[1] }]
  }

  const out = []
  for (const name of readdirSync(TAINGUYEN_IELTS)) {
    const m = name.match(FOLDER_RE)
    if (!m) continue
    out.push({ dir: join(TAINGUYEN_IELTS, name), cam: m[2], test: m[1] })
  }
  return out.sort((a, b) => Number(a.cam) - Number(b.cam) || Number(a.test) - Number(b.test))
}

function publishBundle({ dir, cam, test }) {
  const dest = join(PUBLIC_LISTENING, slug(cam, test))
  mkdirSync(dest, { recursive: true })

  const copied = []
  for (const name of readdirSync(dir)) {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
    if (!MEDIA_EXT.has(ext)) continue
    const src = join(dir, name)
    if (!statSync(src).isFile()) continue
    copyFileSync(src, join(dest, name))
    copied.push(name)
  }

  return { slug: slug(cam, test), copied, dest }
}

function main() {
  const filterArg = process.argv.slice(2).find(a => !a.startsWith('--'))
  const targets = resolveTargets(filterArg)
  let total = 0

  console.log(`📁 Publish IELTS listening media → ${PUBLIC_LISTENING}\n`)

  for (const target of targets) {
    const result = publishBundle(target)
    if (!result.copied.length) {
      console.log(`⚠️  ${result.slug} — không có media`)
      continue
    }
    total += result.copied.length
    const hasAudio = result.copied.some(f => f.toLowerCase().endsWith('.mp3'))
    const mark = hasAudio ? '✓' : '·'
    console.log(`${mark} ${result.slug} — ${result.copied.join(', ')}`)
  }

  console.log(`\n✓ ${targets.length} bundle(s), ${total} file(s)`)
  if (!filterArg) {
    console.log('Hard refresh (Ctrl+F5) sau khi chạy — không cần import lại nếu đã có audioUrl fallback.')
  }
}

main()