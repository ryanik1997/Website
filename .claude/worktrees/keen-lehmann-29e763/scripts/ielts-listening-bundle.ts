/**
 * IELTS Listening bundle pipeline
 *
 *   pnpm ielts:merge "IELTS/Listening IELTS_Test2_Cam9"
 *   pnpm ielts:validate "IELTS/Listening IELTS_Test2_Cam9"
 *   pnpm ielts:pack "IELTS/Listening IELTS_Test2_Cam9"
 *   pnpm ielts:bundle "IELTS/Listening IELTS_Test2_Cam9"
 *
 *   --partial  gộp/validate chỉ các part đã có file (dev Part lẻ)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipSync } from '../apps/web/node_modules/fflate/esm/browser.js'
import type { ListeningImportPayload } from '../apps/web/src/features/exam/importListeningUtils.ts'
import {
  assertBundleMeta,
  assertPartJson,
  mergeIeltsListeningParts,
  validateIeltsListeningBundle,
  type IeltsListeningBundleMeta,
} from '../apps/web/src/features/exam/ieltsListeningBundle.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TAINGUYEN = join(ROOT, 'Tainguyen')
const MEDIA_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.ogg'])

function resolveBundleDir(arg: string): string {
  const dir = join(TAINGUYEN, arg)
  if (!existsSync(dir)) throw new Error(`Không tìm thấy: ${dir}`)
  return dir
}

function parseArgs(argv: string[]) {
  const flags = argv.filter(a => a.startsWith('--'))
  const positional = argv.filter(a => !a.startsWith('--'))
  const cmd = positional[0] ?? 'all'
  const bundleArg = positional[1] ?? 'IELTS/Listening IELTS_Test2_Cam9'
  return {
    cmd,
    bundleArg,
    allowPartial: flags.includes('--partial'),
  }
}

function loadBundle(bundleDir: string, meta: IeltsListeningBundleMeta) {
  const loaded = new Map<number, ReturnType<typeof assertPartJson>>()
  const missing: number[] = []

  for (const spec of meta.parts) {
    const path = join(bundleDir, spec.file)
    if (!existsSync(path)) {
      missing.push(spec.partNumber)
      continue
    }
    const raw = JSON.parse(readFileSync(path, 'utf8'))
    loaded.set(spec.partNumber, assertPartJson(raw, spec.file))
  }

  return { loaded, missing }
}

function mergeFromDir(bundleDir: string, allowPartial: boolean): ListeningImportPayload {
  const meta = assertBundleMeta(JSON.parse(readFileSync(join(bundleDir, 'meta.json'), 'utf8')))
  const { loaded, missing } = loadBundle(bundleDir, meta)
  if (!allowPartial && missing.length) {
    const spec = meta.parts.find(p => p.partNumber === missing[0])
    throw new Error(`Thiếu ${spec?.file} (Part ${missing[0]}). Thêm file hoặc dùng --partial.`)
  }
  return mergeIeltsListeningParts(meta, loaded, { allowPartial })
}

function printCheck(bundleDir: string, payload: ListeningImportPayload, allowPartial: boolean) {
  const meta = assertBundleMeta(JSON.parse(readFileSync(join(bundleDir, 'meta.json'), 'utf8')))
  const { missing } = loadBundle(bundleDir, meta)
  const audio = meta.audioFile ?? 'listening.mp3'
  const { errors, warnings } = validateIeltsListeningBundle(meta, payload, {
    missingPartFiles: allowPartial ? [] : missing,
    missingAudio: !existsSync(join(bundleDir, audio)),
    allowPartial,
  })

  const totalQ = payload.parts.reduce((s, p) => s + p.questions.length, 0)
  console.log(`\n📋 ${payload.title}`)
  console.log(`   Parts: ${payload.parts.map(p => p.partNumber).join(', ')} · ${totalQ} câu`)

  if (warnings.length) {
    console.log('\n⚠️  Cảnh báo:')
    for (const w of warnings) console.log(`   • ${w}`)
  }
  if (errors.length) {
    console.log('\n❌ Lỗi:')
    for (const e of errors) console.log(`   • ${e}`)
    process.exit(1)
  }
  if (!warnings.length && !errors.length) console.log('\n✓ Không có cảnh báo.')
}

function cmdMerge(bundleDir: string, allowPartial: boolean) {
  const payload = mergeFromDir(bundleDir, allowPartial)
  const out = join(bundleDir, 'exam.json')
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  const totalQ = payload.parts.reduce((s, p) => s + p.questions.length, 0)
  console.log(`✓ ${out}`)
  console.log(`  ${payload.parts.length} part(s) · ${totalQ} câu`)
}

function cmdPack(bundleDir: string) {
  const examPath = join(bundleDir, 'exam.json')
  if (!existsSync(examPath)) {
    throw new Error('Thiếu exam.json — chạy ielts:merge trước.')
  }

  const meta = assertBundleMeta(JSON.parse(readFileSync(join(bundleDir, 'meta.json'), 'utf8')))
  const audio = meta.audioFile ?? 'listening.mp3'

  const files = readdirSync(bundleDir).filter(name => {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
    return name === 'exam.json' || MEDIA_EXT.has(ext)
  })

  if (!files.includes(audio)) {
    console.warn(`⚠️  ZIP không có ${audio}`)
  }

  const zipData: Record<string, Uint8Array> = {}
  for (const name of files) {
    zipData[name] = new Uint8Array(readFileSync(join(bundleDir, name)))
  }

  const base = bundleDir.split(/[/\\]/).pop() ?? 'bundle'
  const outPath = join(dirname(bundleDir), `${base}.zip`)
  writeFileSync(outPath, zipSync(zipData))
  console.log(`✓ ${outPath}`)
  console.log(`  ${files.length} files: ${files.join(', ')}`)
  console.log('  → Luyện thi → IELTS → Import thủ công Listening → chọn ZIP')
}

function main() {
  const { cmd, bundleArg, allowPartial } = parseArgs(process.argv.slice(2))
  const bundleDir = resolveBundleDir(bundleArg)
  console.log(`📁 ${bundleDir}`)

  if (cmd === 'merge') {
    cmdMerge(bundleDir, allowPartial)
    return
  }
  if (cmd === 'validate') {
    const payload = mergeFromDir(bundleDir, true)
    printCheck(bundleDir, payload, allowPartial)
    return
  }
  if (cmd === 'pack') {
    cmdPack(bundleDir)
    return
  }
  if (cmd === 'all') {
    cmdMerge(bundleDir, allowPartial)
    const payload = mergeFromDir(bundleDir, allowPartial)
    printCheck(bundleDir, payload, allowPartial)
    cmdPack(bundleDir)
    return
  }

  console.error('Usage: merge|validate|pack|all <Tainguyen/subpath> [--partial]')
  process.exit(1)
}

main()