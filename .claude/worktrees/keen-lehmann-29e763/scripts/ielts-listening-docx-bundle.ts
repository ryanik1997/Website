/**
 * DOCX chuẩn → exam_part*.json + exam.json + ZIP import
 *
 *   pnpm ielts:docx:bundle                           # 4 file trong DOCX standard/
 *   pnpm ielts:docx:bundle "IELTS_Test1_Listening_Cam11.docx"
 *   pnpm ielts:docx:bundle --dry-run Test1_Cam11     # chỉ parse, không ghi file
 *
 * Cần: Answer Key từ exam_part*.json hiện có (hoặc --answer-key file.txt)
 * Media: listening.mp3 + map.jpg từ folder Tainguyen/IELTS/Listening IELTS_Test*_Cam11/
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMParser } from '@xmldom/xmldom'
import { zipSync } from '../apps/web/node_modules/fflate/esm/browser.js'
import { extractDocxContent } from '../apps/web/src/features/exam/docxExtract.ts'
import { buildListeningPayloadFromDocx } from '../apps/web/src/features/exam/ieltsListeningDocxImport.ts'
import type { ListeningImportPartJson } from '../apps/web/src/features/exam/importListeningUtils.ts'
import {
  assertBundleMeta,
  mergeIeltsListeningParts,
  validateIeltsListeningBundle,
} from '../apps/web/src/features/exam/ieltsListeningBundle.ts'

// Polyfill DOM for Node (docxExtract uses DOMParser)
if (typeof globalThis.DOMParser === 'undefined') {
  // @ts-expect-error xmldom shim
  globalThis.DOMParser = DOMParser
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TAINGUYEN = join(ROOT, 'Tainguyen')
const DOCX_DIR = join(TAINGUYEN, 'PDF to HTML', 'DOCX standard')
const MEDIA_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.ogg'])

const DOCX_RE = /IELTS_Test(\d)_Listening_Cam(\d+)\.docx$/i

function parseArgs(argv: string[]) {
  const flags = new Set(argv.filter(a => a.startsWith('--')))
  const positional = argv.filter(a => !a.startsWith('--'))
  return {
    dryRun: flags.has('--dry-run'),
    skipZip: flags.has('--skip-zip'),
    answerKeyFile: (() => {
      const i = argv.indexOf('--answer-key')
      return i >= 0 ? argv[i + 1] : undefined
    })(),
    target: positional[0] as string | undefined,
  }
}

function listDocxFiles(target?: string): string[] {
  if (!existsSync(DOCX_DIR)) {
    throw new Error(`Không tìm thấy thư mục DOCX: ${DOCX_DIR}`)
  }
  const files = readdirSync(DOCX_DIR)
  const docx = files.filter(f => f.toLowerCase().endsWith('.docx'))
  if (!target) return docx.map(f => join(DOCX_DIR, f))
  const t = target.toLowerCase().replace(/[\s_.-]/g, '')
  const matched = docx.filter(f => {
    const norm = f.toLowerCase().replace(/[\s_.-]/g, '')
    if (norm.includes(t) || t.includes(norm.replace('docx', ''))) return true
    const m = f.match(DOCX_RE)
    if (!m) return false
    const key = `test${m[1]}cam${m[2]}`
    return t.includes(key) || key.includes(t)
  })
  if (!matched.length) throw new Error(`Không tìm thấy DOCX khớp "${target}" trong ${DOCX_DIR}`)
  return matched.map(f => join(DOCX_DIR, f))
}

function folderForDocx(docxPath: string): { folder: string; cam: number; test: number } {
  const name = basename(docxPath)
  const m = name.match(DOCX_RE)
  if (!m) throw new Error(`Tên file không đúng mẫu IELTS_TestN_Listening_CamX.docx: ${name}`)
  const test = Number(m[1])
  const cam = Number(m[2])
  const folder = join(TAINGUYEN, 'IELTS', `Listening IELTS_Test${test}_Cam${cam}`)
  return { folder, cam, test }
}

function answerKeyFromExistingParts(folder: string): string {
  const lines: string[] = []
  for (let p = 1; p <= 4; p += 1) {
    const path = join(folder, `exam_part${p}.json`)
    if (!existsSync(path)) continue
    const part = JSON.parse(readFileSync(path, 'utf8')) as ListeningImportPartJson
    for (const q of part.questions ?? []) {
      if (q.number != null && q.answer != null) {
        lines.push(`${q.number} ${q.answer}`)
      }
    }
  }
  lines.sort((a, b) => Number(a.split(' ')[0]) - Number(b.split(' ')[0]))
  return lines.join('\n')
}

async function docxToPayload(docxPath: string, answerKey: string) {
  const bytes = readFileSync(docxPath)
  const file = new File([bytes], basename(docxPath), {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const content = await extractDocxContent(file, { splitMultilineParagraphs: false })
  const { folder, cam, test } = folderForDocx(docxPath)
  return buildListeningPayloadFromDocx(content, {
    title: `IELTS Listening — Cambridge ${cam} Test ${test}`,
    cambridge: String(cam),
    test: String(test),
    answerKey,
  })
}

function writeParts(folder: string, parts: ListeningImportPartJson[]) {
  mkdirSync(folder, { recursive: true })
  for (const part of parts) {
    const path = join(folder, `exam_part${part.partNumber}.json`)
    writeFileSync(path, `${JSON.stringify(part, null, 2)}\n`, 'utf8')
  }
}

function writeMedia(folder: string, mediaFiles: { name: string; bytes: Uint8Array }[]) {
  for (const f of mediaFiles) {
    writeFileSync(join(folder, f.name), f.bytes)
  }
}

function fileToBytes(file: File): Promise<{ name: string; bytes: Uint8Array }> {
  return file.arrayBuffer().then(buf => ({ name: file.name, bytes: new Uint8Array(buf) }))
}

function loadOrCreateMeta(folder: string, cam: number, test: number, title: string) {
  const metaPath = join(folder, 'meta.json')
  if (existsSync(metaPath)) {
    return assertBundleMeta(JSON.parse(readFileSync(metaPath, 'utf8')))
  }
  const templates = ['p1-a3', 'p2-a6', 'p3-c4', 'p4-d2']
  return assertBundleMeta({
    version: 1,
    cambridge: cam,
    test,
    title,
    bandHint: `IELTS · Cambridge ${cam} · Test ${test} · 4 parts · 40 câu`,
    examType: 'ielts',
    examMode: 'practice',
    durationMinutes: 30,
    audioFile: 'listening.mp3',
    parts: [1, 2, 3, 4].map(n => ({
      partNumber: n,
      template: templates[n - 1],
      file: `exam_part${n}.json`,
    })),
  })
}

function packZip(folder: string): string {
  const meta = assertBundleMeta(JSON.parse(readFileSync(join(folder, 'meta.json'), 'utf8')))
  const examPath = join(folder, 'exam.json')
  if (!existsSync(examPath)) throw new Error('Thiếu exam.json')

  const files = readdirSync(folder)
  const zipNames = files.filter(name => {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
    return name === 'exam.json' || MEDIA_EXT.has(ext)
  })

  const audio = meta.audioFile ?? 'listening.mp3'
  if (!zipNames.includes(audio)) {
    console.warn(`  ⚠️  ZIP thiếu ${audio} — copy listening.mp3 vào folder trước khi import.`)
  }

  const zipData: Record<string, Uint8Array> = {}
  for (const name of zipNames) {
    zipData[name] = new Uint8Array(readFileSync(join(folder, name)))
  }

  const base = basename(folder)
  const outPath = join(dirname(folder), `${base}.zip`)
  writeFileSync(outPath, zipSync(zipData))
  return outPath
}

async function processDocx(docxPath: string, opts: ReturnType<typeof parseArgs>) {
  const { folder, cam, test } = folderForDocx(docxPath)
  const name = basename(docxPath)
  console.log(`\n📄 ${name}`)
  console.log(`   → ${folder}`)

  if (!existsSync(folder)) {
    console.warn('   ⚠️  Folder đích chưa có — tạo mới (cần listening.mp3 thủ công).')
  }

  let answerKey = ''
  if (opts.answerKeyFile && existsSync(opts.answerKeyFile)) {
    answerKey = readFileSync(opts.answerKeyFile, 'utf8')
  } else if (existsSync(folder)) {
    answerKey = answerKeyFromExistingParts(folder)
  }
  if (!answerKey.trim()) {
    throw new Error('Thiếu answer key — cần exam_part*.json cũ hoặc --answer-key file.txt')
  }

  const result = await docxToPayload(docxPath, answerKey)
  const totalQ = result.payload.parts.reduce((s, p) => s + p.questions.length, 0)
  console.log(`   Parts: ${result.payload.parts.map(p => p.partNumber).join(', ')} · ${totalQ} câu`)

  if (result.warnings.length) {
    console.log('   Cảnh báo:')
    for (const w of result.warnings) console.log(`     • ${w}`)
  }

  const mediaBytes = await Promise.all(result.mediaFiles.map(fileToBytes))

  const metaPreview = loadOrCreateMeta(folder, cam, test, result.payload.title)
  const loadedPreview = new Map<number, ListeningImportPartJson>()
  for (const p of result.payload.parts) loadedPreview.set(p.partNumber, p)
  const mergedPreview = mergeIeltsListeningParts(metaPreview, loadedPreview, { allowPartial: false })
  const checkPreview = validateIeltsListeningBundle(metaPreview, mergedPreview, {
    missingPartFiles: [],
    missingAudio: !existsSync(join(folder, metaPreview.audioFile ?? 'listening.mp3')),
    allowPartial: false,
  })
  if (checkPreview.errors.length) {
    console.log('   ❌ Validate (trước khi ghi):')
    for (const e of checkPreview.errors) console.log(`     • ${e}`)
    throw new Error(`DOCX "${name}" chưa đủ 4 part / 40 câu — không ghi đè JSON. Sửa Word hoặc dùng pnpm ielts:bundle từ JSON có sẵn.`)
  }

  if (opts.dryRun) {
    console.log('   [dry-run] Validate OK — không ghi file.')
    return
  }

  writeParts(folder, result.payload.parts)

  const meta = loadOrCreateMeta(folder, cam, test, result.payload.title)
  writeFileSync(join(folder, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8')

  const loaded = new Map<number, ListeningImportPartJson>()
  for (const p of result.payload.parts) loaded.set(p.partNumber, p)
  const merged = mergeIeltsListeningParts(meta, loaded, {})
  writeFileSync(join(folder, 'exam.json'), `${JSON.stringify(merged, null, 2)}\n`, 'utf8')

  if (mediaBytes.length) {
    writeMedia(folder, mediaBytes)
    console.log(`   Ảnh: ${mediaBytes.map(m => m.name).join(', ')}`)
  }

  const check = validateIeltsListeningBundle(meta, merged, {
    missingPartFiles: [],
    missingAudio: !existsSync(join(folder, meta.audioFile ?? 'listening.mp3')),
    allowPartial: false,
  })
  if (check.errors.length) {
    console.log('   ❌ Validate:')
    for (const e of check.errors) console.log(`     • ${e}`)
    throw new Error('Validate fail')
  }
  if (!check.warnings.length) console.log('   ✓ Validate OK')

  if (!opts.skipZip) {
    const zipPath = packZip(folder)
    console.log(`   ✓ ZIP: ${zipPath}`)
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const docxFiles = listDocxFiles(opts.target)
  console.log(`DOCX standard → bundle (${docxFiles.length} file)`)

  for (const docx of docxFiles) {
    await processDocx(docx, opts)
  }

  console.log('\nDone. Import: Luyện thi → IELTS → Import thủ công Listening → chọn .zip')
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})