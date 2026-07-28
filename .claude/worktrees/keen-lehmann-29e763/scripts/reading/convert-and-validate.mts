/**
 * Bước 2–4 — Detect template + apply pipeline + validate.
 *
 * Nạp reverse-index → cho mỗi passage:
 *   - key = `${partNumber}::${triplet.join('|')}`
 *   - lookup templateKind
 *   - if hit → applyReadingTemplateTableStructure(part, templatePart)
 *   - if miss → fallback normalizeAiReadingPart
 * Chạy validateAiReadingPartAgainstTemplate before/after — đếm cảnh báo.
 *
 * Output:
 *   - out-reading/converted/<file>.json (đã convert)
 *   - out-reading/VALIDATE-REPORT.md
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  normalizeAiReadingPart,
  applyReadingTemplateTableStructure,
  validateAiReadingPartAgainstTemplate,
  validateAiReadingPartShape,
} from '../../apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize'
import { getIeltsReadingWizardTemplatePart } from '../../apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates'
import {
  validateReadingNoteTable,
  gapNumbersInReadingNoteTable,
} from '../../apps/web/src/features/exam/readingNoteTableUtils'
import type { IeltsReadingPassageNumber } from '../../apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingWizardConfig'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const OUT_DIR = path.join(ROOT, 'out-reading')
const CONVERTED_DIR = path.join(OUT_DIR, 'converted')
const INDEX_FILE = path.join(OUT_DIR, 'template-triplet-index.json')
const REPORT_FILE = path.join(OUT_DIR, 'VALIDATE-REPORT.md')

fs.mkdirSync(CONVERTED_DIR, { recursive: true })

const revIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8')) as {
  map: Record<string, string>
}

function tripletOf(part: any): string[] {
  return (part.questionGroups ?? []).map((g: any) => String(g.type ?? '?'))
}

function key(partNumber: number, triplet: string[]) {
  return `${partNumber}::${triplet.join('|')}`
}

function countWarnings(
  part: any,
  passageNumber: IeltsReadingPassageNumber,
  templateKind: string | null,
): { count: number; message: string; kinds: string[] } {
  const kinds: string[] = []
  let count = 0
  let message = ''
  try {
    validateAiReadingPartShape(part, passageNumber)
  } catch (e: any) {
    const msg = String(e?.message ?? e)
    message += msg + ' '
    count += 1
    kinds.push(classify(msg))
  }
  if (templateKind) {
    try {
      validateAiReadingPartAgainstTemplate(part, passageNumber, templateKind as any)
    } catch (e: any) {
      const msg = String(e?.message ?? e)
      // errors joined by ' '. Split into sentences by '. '
      const parts = msg
        .split(/(?<=\.)\s+(?=[A-ZẠ-Ỹ\d]|Layout|Questions|Q\d|Câu|thiếu)/u)
        .filter(Boolean)
      count += parts.length
      message += msg + ' '
      for (const p of parts) kinds.push(classify(p))
    }
  }

  // Broad noteTable validation across all groups (returns warnings array, not thrown)
  for (const g of (part.questionGroups ?? [])) {
    const gaps = gapNumbersInReadingNoteTable(g.noteTable)
    const gapNums = (g.questions ?? [])
      .filter((q: any) => {
        const t = String(q.type ?? '').toLowerCase()
        return !t || t === 'gap-fill' || t === 'sentence-completion'
          || t === 'summary-completion' || t === 'table-completion'
          || t === 'one-word' || t === 'short-answer'
      })
      .map((q: any) => q.number)
    const warns = validateReadingNoteTable(g.noteTable, gapNums.length ? gapNums : gaps, g.range)
    for (const w of warns) {
      count += 1
      message += w + ' '
      kinds.push(classify(w))
    }
  }
  return { count, message: message.trim(), kinds }
}

function classify(msg: string): string {
  if (/noteTable/i.test(msg) && /thiếu/i.test(msg)) return 'missing-noteTable'
  if (/notePassage/i.test(msg) && /thiếu/i.test(msg)) return 'missing-notePassage'
  if (/Layout/i.test(msg)) return 'layout-mismatch'
  if (/headers/i.test(msg)) return 'missing-headers'
  if (/ngoài range/i.test(msg)) return 'range-out'
  if (/placeholder/i.test(msg)) return 'placeholder-prompt'
  if (/passageTitle/i.test(msg)) return 'missing-passageTitle'
  if (/questionGroups/i.test(msg) || /questions/i.test(msg)) return 'missing-questions'
  return 'other'
}

interface Row {
  file: string
  partNumber: number
  triplet: string
  templateKind: string | null
  matched: boolean
  before: number
  after: number
  kindsAfter: string[]
}

const rows: Row[] = []

// Find reading-cam-<9..20>-<1..4>.json (exclude cam-11-2 per user) — 47 exams
const files = fs
  .readdirSync(OUT_DIR)
  .filter(f => {
    const m = /^reading-cam-(\d+)-(\d+)\.json$/.exec(f)
    if (!m) return false
    const cam = Number(m[1])
    return cam >= 9 && cam <= 20
  })
  .sort()

console.log(`[convert] found ${files.length} reading-cam-*.json files`)

for (const f of files) {
  if (f === 'reading-cam-11-2.json') {
    console.log(`  skip ${f} (excluded per user)`)
    continue
  }
  const src = path.join(OUT_DIR, f)
  const doc = JSON.parse(fs.readFileSync(src, 'utf-8'))
  const converted = { ...doc, parts: [] as any[] }

  for (const rawPart of doc.parts ?? []) {
    const partNumber = rawPart.partNumber as IeltsReadingPassageNumber
    if (![1, 2, 3].includes(partNumber)) {
      converted.parts.push(rawPart)
      rows.push({
        file: f,
        partNumber,
        triplet: '',
        templateKind: null,
        matched: false,
        before: 0,
        after: 0,
        kindsAfter: ['skipped-part-number'],
      })
      continue
    }

    const triplet = tripletOf(rawPart)
    if (triplet.length === 0) {
      // No question groups → passthrough
      converted.parts.push(rawPart)
      rows.push({
        file: f,
        partNumber,
        triplet: '',
        templateKind: null,
        matched: false,
        before: 0,
        after: 0,
        kindsAfter: ['empty-questionGroups'],
      })
      continue
    }

    const k = key(partNumber, triplet)
    const templateKind = revIndex.map[k] ?? null

    // Count before (using templateKind if matched — for a fair before/after)
    const before = countWarnings(rawPart, partNumber, templateKind)

    let outPart: any
    if (templateKind) {
      try {
        const templatePart = getIeltsReadingWizardTemplatePart(partNumber, templateKind as any)
        const normalized = normalizeAiReadingPart(rawPart)
        outPart = applyReadingTemplateTableStructure(normalized, templatePart)
      } catch (e: any) {
        console.warn(`  ${f} P${partNumber}: apply failed, fallback normalize (${e?.message})`)
        outPart = normalizeAiReadingPart(rawPart)
      }
    } else {
      console.warn(`  ${f} P${partNumber}: no template for triplet [${triplet.join('|')}] → normalize-only`)
      outPart = normalizeAiReadingPart(rawPart)
    }

    const after = countWarnings(outPart, partNumber, templateKind)

    converted.parts.push(outPart)
    rows.push({
      file: f,
      partNumber,
      triplet: triplet.join('|'),
      templateKind,
      matched: Boolean(templateKind),
      before: before.count,
      after: after.count,
      kindsAfter: after.kinds,
    })
  }

  fs.writeFileSync(path.join(CONVERTED_DIR, f), JSON.stringify(converted, null, 2), 'utf-8')
}

// Report
const totalBefore = rows.reduce((s, r) => s + r.before, 0)
const totalAfter = rows.reduce((s, r) => s + r.after, 0)
const matched = rows.filter(r => r.matched).length
const fallback = rows.filter(r => !r.matched && r.templateKind === null && !r.kindsAfter.includes('skipped-part-number')).length

// Top kinds after
const kindCount: Record<string, number> = {}
for (const r of rows) for (const k of r.kindsAfter) kindCount[k] = (kindCount[k] || 0) + 1

// Top files after
const fileCount: Record<string, number> = {}
for (const r of rows) fileCount[r.file] = (fileCount[r.file] || 0) + r.after

const top = (m: Record<string, number>, n: number) =>
  Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n)

const md: string[] = []
md.push(`# Reading Convert — Validate Report`)
md.push('')
md.push(`Generated: ${new Date().toISOString()}`)
md.push('')
md.push(`## Tổng quan`)
md.push('')
md.push(`- Files convert: **${files.filter(f => f !== 'reading-cam-11-2.json').length}** (exclude cam-11-2)`)
md.push(`- Passages: **${rows.length}**`)
md.push(`- Matched template: **${matched}** / ${rows.length}`)
md.push(`- Fallback normalize-only: **${fallback}**`)
md.push(`- Cảnh báo TRƯỚC: **${totalBefore}**`)
md.push(`- Cảnh báo SAU: **${totalAfter}**`)
md.push(`- Giảm: **${totalBefore - totalAfter}** (${totalBefore ? Math.round((1 - totalAfter / totalBefore) * 100) : 0}%)`)
md.push('')
md.push(`## Top loại cảnh báo (sau)`)
md.push('')
md.push(`| Loại | Count |`)
md.push(`|------|-------|`)
for (const [k, v] of top(kindCount, 10)) md.push(`| ${k} | ${v} |`)
md.push('')
md.push(`## Top đề còn cảnh báo`)
md.push('')
md.push(`| File | Count |`)
md.push(`|------|-------|`)
for (const [k, v] of top(fileCount, 15)) if (v > 0) md.push(`| ${k} | ${v} |`)
md.push('')
md.push(`## Chi tiết per passage`)
md.push('')
md.push(`| File | Part | Triplet | Template | Before | After |`)
md.push(`|------|------|---------|----------|--------|-------|`)
for (const r of rows) {
  md.push(`| ${r.file} | ${r.partNumber} | ${r.triplet || '(empty)'} | ${r.templateKind ?? '—'} | ${r.before} | ${r.after} |`)
}

fs.writeFileSync(REPORT_FILE, md.join('\n'), 'utf-8')
console.log(`[convert] rows=${rows.length} matched=${matched} fallback=${fallback} beforeW=${totalBefore} afterW=${totalAfter}`)
console.log(`wrote ${REPORT_FILE}`)
console.log(`wrote ${CONVERTED_DIR}`)
