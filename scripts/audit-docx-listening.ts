/**
 * Audit DOCX listening — dump structure + parse quality
 * pnpm exec vite-node scripts/audit-docx-listening.ts [Test2_Cam11]
 */
import { readFileSync, readdirSync } from 'node:fs'
import { basename, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMParser } from '@xmldom/xmldom'
import { extractDocxContent } from '../apps/web/src/features/exam/docxExtract.ts'
import { buildListeningPayloadFromDocx } from '../apps/web/src/features/exam/ieltsListeningDocxImport.ts'
import { splitDocxIntoPartSlices } from '../apps/web/src/features/exam/ieltsListeningDocxImport.ts'
import type { ListeningImportPartJson } from '../apps/web/src/features/exam/importListeningUtils.ts'

if (typeof globalThis.DOMParser === 'undefined') {
  // @ts-expect-error shim
  globalThis.DOMParser = DOMParser
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCX_DIR = join(ROOT, 'Tainguyen', 'PDF to HTML', 'DOCX standard')
const TAINGUYEN = join(ROOT, 'Tainguyen', 'IELTS')

const DOCX_RE = /IELTS_Test(\d)_Listening_Cam(\d+)\.docx$/i

function answerKeyFromFolder(folder: string): string {
  const lines: string[] = []
  for (let p = 1; p <= 4; p++) {
    const path = join(folder, `exam_part${p}.json`)
    try {
      const part = JSON.parse(readFileSync(path, 'utf8')) as ListeningImportPartJson
      for (const q of part.questions ?? []) {
        if (q.number != null) lines.push(`${q.number} ${q.answer}`)
      }
    } catch { /* skip */ }
  }
  return lines.join('\n')
}

function partStats(part: ListeningImportPartJson) {
  const gapsInNotes = (part.notePassage ?? []).filter(b => b.type === 'gap').length
  const gapsInTable = 0 // simplified
  const mc = part.questions.filter(q => q.type === 'multiple-choice').length
  const matching = part.questions.filter(q => q.type === 'matching').length
  const gapFill = part.questions.filter(q => q.type === 'gap-fill').length
  const genericPrompt = part.questions.filter(q => /^Question \d+$/i.test(q.prompt ?? '')).length
  return { gapsInNotes, mc, matching, gapFill, genericPrompt, hasTitle: !!part.passageTitle, image: part.imageFile }
}

async function auditFile(docxPath: string) {
  const name = basename(docxPath)
  const m = name.match(DOCX_RE)!
  const folder = join(TAINGUYEN, `Listening IELTS_Test${m[1]}_Cam${m[2]}`)
  const bytes = readFileSync(docxPath)
  const file = new File([bytes], name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const content = await extractDocxContent(file, { splitMultilineParagraphs: false })
  const slices = splitDocxIntoPartSlices(content)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📄 ${name}  (${slices.length} sections, ${content.images.length} images)`)
  console.log(`   Paragraphs: ${content.paragraphs.length}`)

  // Show section markers in raw text
  for (const p of content.paragraphs) {
    const t = p.text.trim()
    if (/^SECTION\s*\d/i.test(t) || /^Questions?\s*\d/i.test(t)) {
      console.log(`   [marker] ${t.slice(0, 80)}`)
    }
  }

  const result = buildListeningPayloadFromDocx(content, {
    title: `Cam${m[2]} Test${m[1]}`,
    cambridge: m[2],
    test: m[1],
    answerKey: answerKeyFromFolder(folder),
  })

  for (const part of result.payload.parts) {
    const s = partStats(part)
    console.log(
      `   Part ${part.partNumber}: ${part.questions.length}Q | notePassage gaps=${s.gapsInNotes} | `
      + `MC=${s.mc} match=${s.matching} gap=${s.gapFill} | generic prompts=${s.genericPrompt}`
      + (s.hasTitle ? ` | title="${part.passageTitle}"` : '')
      + (s.image ? ` | ${s.image}` : ''),
    )
    if (s.gapsInNotes === 0 && s.gapFill > 0) {
      console.log(`     ⚠️  P${part.partNumber}: có gap-fill nhưng notePassage trống — UI sẽ không giống đề giấy`)
    }
  }

  if (result.warnings.length) {
    console.log('   Warnings:')
    for (const w of result.warnings.slice(0, 8)) console.log(`     • ${w}`)
    if (result.warnings.length > 8) console.log(`     … +${result.warnings.length - 8} more`)
  }
  console.log(`   Media from DOCX: ${result.mediaFiles.map(f => f.name).join(', ') || '(none)'}`)
}

async function main() {
  const target = process.argv[2]
  let files = readdirSync(DOCX_DIR).filter(f => f.endsWith('.docx'))
  if (target) {
    const t = target.toLowerCase().replace(/[\s_.-]/g, '')
    files = files.filter(f => f.toLowerCase().replace(/[\s_.-]/g, '').includes(t))
  }
  for (const f of files.sort()) {
    await auditFile(join(DOCX_DIR, f))
  }
}

main().catch(e => { console.error(e); process.exit(1) })