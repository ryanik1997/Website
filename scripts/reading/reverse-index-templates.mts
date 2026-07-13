/**
 * Bước 1 — Reverse-index tất cả template builder.
 *
 * Chạy từng template kind trong catalog (P1/P2/P3) → build template part →
 * trích type-triplet của mỗi group → map `"tfng|mc"` → template kind.
 *
 * Output: `out-reading/template-triplet-index.json`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  IELTS_P1_READING_TEMPLATE_OPTIONS,
  IELTS_P2_READING_TEMPLATE_OPTIONS,
  IELTS_P3_READING_TEMPLATE_OPTIONS,
} from '../../apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog'
import { getIeltsReadingWizardTemplatePart } from '../../apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates'
import type { IeltsReadingPassageNumber } from '../../apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingWizardConfig'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../../out-reading/template-triplet-index.json')

interface Entry {
  kind: string
  passage: number
  triplet: string[]
  key: string
}

const entries: Entry[] = []
const errors: { kind: string; passage: number; error: string }[] = []

const buckets: [IeltsReadingPassageNumber, { kind: string }[]][] = [
  [1, IELTS_P1_READING_TEMPLATE_OPTIONS as any],
  [2, IELTS_P2_READING_TEMPLATE_OPTIONS as any],
  [3, IELTS_P3_READING_TEMPLATE_OPTIONS as any],
]

for (const [passageNumber, options] of buckets) {
  for (const opt of options) {
    try {
      const part = getIeltsReadingWizardTemplatePart(passageNumber, opt.kind as any)
      const triplet = (part.questionGroups ?? []).map((g: any) => String(g.type ?? '?'))
      const key = triplet.join('|')
      entries.push({ kind: opt.kind, passage: passageNumber, triplet, key })
    } catch (e: any) {
      errors.push({ kind: opt.kind, passage: passageNumber, error: String(e?.message ?? e) })
    }
  }
}

// Build map: key → { kind, passage } (first-wins per passage)
const byKey: Record<string, Entry> = {}
const collisions: Record<string, Entry[]> = {}
for (const e of entries) {
  const k = `${e.passage}::${e.key}`
  if (!byKey[k]) byKey[k] = e
  else {
    if (!collisions[k]) collisions[k] = [byKey[k]]
    collisions[k].push(e)
  }
}

const uniqueKeys = new Set(entries.map(e => `${e.passage}::${e.key}`)).size

const payload = {
  totalTemplates: entries.length,
  errors,
  uniqueTriplets: uniqueKeys,
  collisions: Object.fromEntries(
    Object.entries(collisions).map(([k, arr]) => [k, arr.map(x => x.kind)]),
  ),
  map: Object.fromEntries(Object.entries(byKey).map(([k, e]) => [k, e.kind])),
  entries,
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf-8')
console.log(
  `[reverse-index] templates=${entries.length} errors=${errors.length} uniqueTriplets=${uniqueKeys} collisions=${Object.keys(collisions).length}`,
)
console.log(`wrote ${OUT}`)
