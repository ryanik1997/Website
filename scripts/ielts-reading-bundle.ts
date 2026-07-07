/**
 * IELTS Reading bundle pipeline
 *
 *   pnpm ielts:reading:merge "IELTS/Reading IELTS_Test1_Cam10"
 *   pnpm ielts:reading:validate "IELTS/Reading IELTS_Test1_Cam10"
 *   pnpm ielts:reading:pack "IELTS/Reading IELTS_Test1_Cam10"
 *   pnpm ielts:reading:bundle "IELTS/Reading IELTS_Test1_Cam10"
 *
 *   --partial  gộp/validate chỉ các passage đã có file (dev Passage lẻ)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipSync } from '../apps/web/node_modules/fflate/esm/browser.js'
import type { ReadingImportPayload } from '../apps/web/src/features/exam/importReadingManualUtils.ts'
import {
  assertPassageJson,
  assertReadingBundleMeta,
  mergeIeltsReadingPassages,
  validateIeltsReadingBundle,
  type IeltsReadingBundleMeta,
} from '../apps/web/src/features/exam/ieltsReadingBundle.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TAINGUYEN = join(ROOT, 'Tainguyen')
const MEDIA_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

function resolveBundleDir(arg: string): string {
  const dir = join(TAINGUYEN, arg)
  if (!existsSync(dir)) throw new Error(`Không tìm thấy: ${dir}`)
  return dir
}

function parseArgs(argv: string[]) {
  const flags = argv.filter(a => a.startsWith('--'))
  const positional = argv.filter(a => !a.startsWith('--'))
  const cmd = positional[0] ?? 'all'
  const bundleArg = positional[1] ?? 'IELTS/Reading IELTS_Test1_Cam10'
  return {
    cmd,
    bundleArg,
    allowPartial: flags.includes('--partial'),
  }
}

function loadBundle(bundleDir: string, meta: IeltsReadingBundleMeta) {
  const loaded = new Map<number, ReturnType<typeof assertPassageJson>>()
  const missing: number[] = []

  for (const spec of meta.passages) {
    const path = join(bundleDir, spec.file)
    if (!existsSync(path)) {
      missing.push(spec.partNumber)
      continue
    }
    const raw = JSON.parse(readFileSync(path, 'utf8'))
    loaded.set(spec.partNumber, assertPassageJson(raw, spec.file))
  }

  return { loaded, missing }
}

function mergeFromDir(bundleDir: string, allowPartial: boolean): ReadingImportPayload {
  const meta = assertReadingBundleMeta(JSON.parse(readFileSync(join(bundleDir, 'meta.json'), 'utf8')))
  const { loaded, missing } = loadBundle(bundleDir, meta)
  if (!allowPartial && missing.length) {
    const spec = meta.passages.find(p => p.partNumber === missing[0])
    throw new Error(`Thiếu ${spec?.file} (Passage ${missing[0]}). Thêm file hoặc dùng --partial.`)
  }
  return mergeIeltsReadingPassages(meta, loaded, { allowPartial })
}

function printCheck(bundleDir: string, payload: ReadingImportPayload, allowPartial: boolean) {
  const meta = assertReadingBundleMeta(JSON.parse(readFileSync(join(bundleDir, 'meta.json'), 'utf8')))
  const { missing } = loadBundle(bundleDir, meta)
  const { errors, warnings } = validateIeltsReadingBundle(meta, payload, {
    missingPassageFiles: allowPartial ? [] : missing,
    allowPartial,
  })

  const totalQ = payload.parts.reduce(
    (s, p) => s + p.questionGroups.reduce((gs, g) => gs + g.questions.length, 0),
    0,
  )
  console.log(`\n📋 ${payload.title}`)
  console.log(`   Passages: ${payload.parts.map(p => p.partNumber).join(', ')} · ${totalQ} câu`)

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
  const totalQ = payload.parts.reduce(
    (s, p) => s + p.questionGroups.reduce((gs, g) => gs + g.questions.length, 0),
    0,
  )
  console.log(`✓ ${out}`)
  console.log(`  ${payload.parts.length} passage(s) · ${totalQ} câu`)
}

function cmdPack(bundleDir: string) {
  const examPath = join(bundleDir, 'exam.json')
  if (!existsSync(examPath)) {
    throw new Error('Thiếu exam.json — chạy ielts:reading:merge trước.')
  }

  const files = readdirSync(bundleDir).filter(name => {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
    return name === 'exam.json' || MEDIA_EXT.has(ext)
  })

  const zipData: Record<string, Uint8Array> = {}
  for (const name of files) {
    zipData[name] = new Uint8Array(readFileSync(join(bundleDir, name)))
  }

  const base = bundleDir.split(/[/\\]/).pop() ?? 'bundle'
  const outPath = join(dirname(bundleDir), `${base}.zip`)
  writeFileSync(outPath, zipSync(zipData))
  console.log(`✓ ${outPath}`)
  console.log(`  ${files.length} files: ${files.join(', ')}`)
  console.log('  → Luyện thi → IELTS → Import thủ công Reading → chọn ZIP')
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