import {
  validateListeningImport,
  type ListeningImportPartJson,
  type ListeningImportPayload,
} from './importListeningUtils'
import { isChooseTwoGroup } from './ieltsListeningSegmentUtils'
import { validateNotePassageBlocks } from './listeningNotePassage'
import type { ListeningNotePassageBlock, ListeningQuestion } from './listeningExamData'

export interface IeltsListeningBundleMetaPart {
  partNumber: number
  /** Tra cứu HDSD — vd. p1-a3, p2-a10, p3-c3, p4-d2 */
  template: string
  file: string
}

export interface IeltsListeningBundleMeta {
  version: 1
  cambridge: number
  test: number
  title: string
  bandHint?: string
  examType?: 'ielts'
  examMode?: 'practice'
  durationMinutes?: number
  audioFile?: string
  parts: IeltsListeningBundleMetaPart[]
}

export interface MergeBundleOptions {
  /** Bỏ qua part thiếu trong meta (dev Part lẻ) */
  allowPartial?: boolean
}

export interface BundleCheckResult {
  errors: string[]
  warnings: string[]
}

const IELTS_PART_RANGES: Record<number, [number, number]> = {
  1: [1, 10],
  2: [11, 20],
  3: [21, 30],
  4: [31, 40],
}

export function assertBundleMeta(raw: unknown): IeltsListeningBundleMeta {
  const meta = raw as IeltsListeningBundleMeta
  if (!meta || meta.version !== 1) throw new Error('meta.json: chỉ hỗ trợ version 1.')
  if (!meta.title?.trim()) throw new Error('meta.json: thiếu title.')
  if (!Array.isArray(meta.parts) || meta.parts.length === 0) {
    throw new Error('meta.json: parts[] trống.')
  }
  return meta
}

export function assertPartJson(raw: unknown, filename: string): ListeningImportPartJson {
  const part = raw as ListeningImportPartJson
  if (!part?.partNumber || !part.questions?.length) {
    throw new Error(`${filename}: partNumber hoặc questions[] không hợp lệ.`)
  }
  return part
}

export function mergeIeltsListeningParts(
  meta: IeltsListeningBundleMeta,
  loadedParts: Map<number, ListeningImportPartJson>,
  options: MergeBundleOptions = {},
): ListeningImportPayload {
  const parts: ListeningImportPartJson[] = []
  const audioFile = meta.audioFile ?? 'listening.mp3'
  const sorted = [...meta.parts].sort((a, b) => a.partNumber - b.partNumber)

  for (const spec of sorted) {
    const part = loadedParts.get(spec.partNumber)
    if (!part) {
      if (options.allowPartial) continue
      throw new Error(`Thiếu ${spec.file} (Part ${spec.partNumber}). Dùng --partial để gộp part có sẵn.`)
    }
    if (part.partNumber !== spec.partNumber) {
      throw new Error(`${spec.file}: partNumber ${part.partNumber} ≠ meta ${spec.partNumber}.`)
    }
    if (!part.audioFile) part.audioFile = audioFile
    parts.push(part)
  }

  if (!parts.length) throw new Error('Không có part nào để gộp.')

  return {
    version: 1,
    title: meta.title,
    durationMinutes: meta.durationMinutes ?? 30,
    bandHint: meta.bandHint
      ?? `IELTS · Cambridge ${meta.cambridge} · Test ${meta.test} · ${parts.length} part(s)`,
    examType: meta.examType ?? 'ielts',
    examMode: meta.examMode ?? 'practice',
    parts,
  }
}

function gapNumbersFromSections(
  sections: Array<{ blocks: ListeningNotePassageBlock[]; gapNumbers?: number[] }> | undefined,
): number[] {
  if (!sections?.length) return []
  const numbers: number[] = []
  for (const section of sections) {
    const fromMeta = section.gapNumbers ?? []
    const fromBlocks = section.blocks
      .filter((b): b is ListeningNotePassageBlock & { number: number } =>
        b.type === 'gap' && typeof b.number === 'number')
      .map(b => b.number)
    numbers.push(...(fromMeta.length ? fromMeta : fromBlocks))
  }
  return numbers
}

function validateChooseTwoPairs(part: ListeningImportPartJson): string[] {
  const warnings: string[] = []
  const qs = part.questions ?? []
  const label = `Part ${part.partNumber}`

  for (let i = 0; i < qs.length - 1; i++) {
    const pair = [qs[i], qs[i + 1]]
    if (!isChooseTwoGroup(pair as unknown as ListeningQuestion[])) continue

    const [a, b] = pair
    if (a.prompt.trim() !== b.prompt.trim()) {
      warnings.push(`${label}: Choose TWO câu ${a.number}–${b.number} khác prompt.`)
    }
    if (!/\/|/.test(a.answer) || a.answer !== b.answer) {
      warnings.push(
        `${label}: Choose TWO câu ${a.number}–${b.number} cần cùng answer dạng "A/E".`,
      )
    }
    for (const q of pair) {
      const shortLabels = (q.options ?? []).filter(o => o.label.trim().length <= 2)
      if (shortLabels.length >= 3) {
        warnings.push(
          `${label} câu ${q.number}: Choose TWO options cần nhãn đầy đủ (tránh "A A").`,
        )
      }
    }
    i += 1
  }
  return warnings
}

function validatePartNumbers(part: ListeningImportPartJson): string[] {
  const warnings: string[] = []
  const expected = IELTS_PART_RANGES[part.partNumber]
  if (!expected) return warnings

  const [from, to] = expected
  const numbers = part.questions.map(q => q.number).sort((a, b) => a - b)
  const expectedCount = to - from + 1

  if (numbers.length !== expectedCount) {
    warnings.push(
      `Part ${part.partNumber}: có ${numbers.length} câu (kỳ vọng ${expectedCount}, ${from}–${to}).`,
    )
  }

  for (let n = from; n <= to; n++) {
    if (!numbers.includes(n)) {
      warnings.push(`Part ${part.partNumber}: thiếu câu ${n}.`)
    }
  }

  const dup = numbers.filter((n, i) => numbers.indexOf(n) !== i)
  if (dup.length) {
    warnings.push(`Part ${part.partNumber}: số câu trùng ${[...new Set(dup)].join(', ')}.`)
  }

  return warnings
}

export function validateIeltsListeningBundle(
  meta: IeltsListeningBundleMeta,
  payload: ListeningImportPayload,
  options?: { missingPartFiles?: number[]; missingAudio?: boolean; allowPartial?: boolean },
): BundleCheckResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const n of options?.missingPartFiles ?? []) {
    const spec = meta.parts.find(p => p.partNumber === n)
    errors.push(`Thiếu ${spec?.file ?? `exam_part${n}.json`} (Part ${n}, mẫu ${spec?.template ?? '?'}).`)
  }

  if (options?.missingAudio) {
    warnings.push(`Thiếu ${meta.audioFile ?? 'listening.mp3'} — import ZIP cần file audio.`)
  }

  warnings.push(...validateListeningImport(payload))

  for (const part of payload.parts) {
    warnings.push(...validatePartNumbers(part))
    warnings.push(...validateChooseTwoPairs(part))

    const gapNumbers = part.questions
      .filter(q => q.type === 'gap-fill')
      .map(q => q.number)

    if (part.notePassageSections?.length) {
      const sectionGaps = gapNumbersFromSections(part.notePassageSections)
      warnings.push(
        ...validateNotePassageBlocks(
          part.notePassageSections.flatMap(s => s.blocks),
          sectionGaps.length ? sectionGaps : gapNumbers,
          `Part ${part.partNumber} notePassageSections`,
        ),
      )
    }
  }

  const totalQ = payload.parts.reduce((s, p) => s + p.questions.length, 0)
  if (payload.parts.length === 4 && totalQ !== 40) {
    warnings.push(`Đề đủ 4 parts nhưng chỉ có ${totalQ}/40 câu.`)
  }
  if (payload.parts.length < 4) {
    warnings.push(`Mới có ${payload.parts.length}/4 parts — chưa đủ đề hoàn chỉnh.`)
  }

  if (!options?.allowPartial) {
    const partNums = payload.parts.map(p => p.partNumber)
    for (const spec of meta.parts) {
      if (!partNums.includes(spec.partNumber) && !(options?.missingPartFiles ?? []).includes(spec.partNumber)) {
        errors.push(`Part ${spec.partNumber} có trong meta nhưng chưa gộp được.`)
      }
    }
  }

  return { errors, warnings }
}