import {
  countReadingImportQuestions,
  validateReadingManualImport,
  type ReadingImportPartJson,
  type ReadingImportPayload,
} from './importReadingManualUtils'
import { IELTS_READING_PASSAGE_RANGES } from './ieltsReadingWizard/ieltsReadingWizardConfig'

export interface IeltsReadingBundleMetaPassage {
  partNumber: number
  /** Tra cứu HDSD — vd. r1, r2, r2-headings, r3-ynng */
  template: string
  file: string
  note?: string
}

export interface IeltsReadingBundleMeta {
  version: 1
  cambridge: number
  test: number
  title: string
  bandHint?: string
  examTrack?: 'ielts'
  durationMinutes?: number
  passages: IeltsReadingBundleMetaPassage[]
}

export interface MergeReadingBundleOptions {
  allowPartial?: boolean
}

export interface ReadingBundleCheckResult {
  errors: string[]
  warnings: string[]
}

export function assertReadingBundleMeta(raw: unknown): IeltsReadingBundleMeta {
  const meta = raw as IeltsReadingBundleMeta
  if (!meta || meta.version !== 1) throw new Error('meta.json: chỉ hỗ trợ version 1.')
  if (!meta.title?.trim()) throw new Error('meta.json: thiếu title.')
  if (!Array.isArray(meta.passages) || meta.passages.length === 0) {
    throw new Error('meta.json: passages[] trống.')
  }
  return meta
}

export function assertPassageJson(raw: unknown, filename: string): ReadingImportPartJson {
  const part = raw as ReadingImportPartJson
  if (!part?.partNumber || !part.questionGroups?.length) {
    throw new Error(`${filename}: partNumber hoặc questionGroups[] không hợp lệ.`)
  }
  if (!part.passageTitle?.trim()) {
    throw new Error(`${filename}: thiếu passageTitle.`)
  }
  return part
}

export function mergeIeltsReadingPassages(
  meta: IeltsReadingBundleMeta,
  loaded: Map<number, ReadingImportPartJson>,
  options: MergeReadingBundleOptions = {},
): ReadingImportPayload {
  const parts: ReadingImportPartJson[] = []
  const sorted = [...meta.passages].sort((a, b) => a.partNumber - b.partNumber)

  for (const spec of sorted) {
    const part = loaded.get(spec.partNumber)
    if (!part) {
      if (options.allowPartial) continue
      throw new Error(`Thiếu ${spec.file} (Passage ${spec.partNumber}). Dùng --partial để gộp passage có sẵn.`)
    }
    if (part.partNumber !== spec.partNumber) {
      throw new Error(`${spec.file}: partNumber ${part.partNumber} ≠ meta ${spec.partNumber}.`)
    }
    parts.push(part)
  }

  if (!parts.length) throw new Error('Không có passage nào để gộp.')

  const cam = meta.cambridge ? `Cambridge ${meta.cambridge}` : ''
  const test = meta.test ? `Test ${meta.test}` : ''

  return {
    version: 1,
    title: meta.title,
    durationMinutes: meta.durationMinutes ?? 60,
    bandHint: meta.bandHint
      ?? ['IELTS Academic', cam, test, `${parts.length} passage(s) · ~40 câu`].filter(Boolean).join(' · '),
    examTrack: meta.examTrack ?? 'ielts',
    parts,
  }
}

function countPartQuestions(part: ReadingImportPartJson): number {
  return part.questionGroups.reduce((s, g) => s + (g.questions?.length ?? 0), 0)
}

function validatePassageQuestionNumbers(part: ReadingImportPartJson): string[] {
  const warnings: string[] = []
  const range = IELTS_READING_PASSAGE_RANGES[part.partNumber as 1 | 2 | 3]
  if (!range) return warnings

  const [from, to] = range
  const numbers = part.questionGroups.flatMap(g => g.questions.map(q => q.number)).sort((a, b) => a - b)
  const expectedCount = to - from + 1

  if (numbers.length !== expectedCount) {
    warnings.push(
      `Passage ${part.partNumber}: có ${numbers.length} câu (kỳ vọng ${expectedCount}, Q${from}–${to}).`,
    )
  }

  for (let n = from; n <= to; n++) {
    if (!numbers.includes(n)) warnings.push(`Passage ${part.partNumber}: thiếu câu ${n}.`)
  }

  const dup = numbers.filter((n, i) => numbers.indexOf(n) !== i)
  if (dup.length) {
    warnings.push(`Passage ${part.partNumber}: số câu trùng ${[...new Set(dup)].join(', ')}.`)
  }

  return warnings
}

export function validateIeltsReadingBundle(
  meta: IeltsReadingBundleMeta,
  payload: ReadingImportPayload,
  options?: { missingPassageFiles?: number[]; allowPartial?: boolean },
): ReadingBundleCheckResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const n of options?.missingPassageFiles ?? []) {
    const spec = meta.passages.find(p => p.partNumber === n)
    errors.push(`Thiếu ${spec?.file ?? `exam_passage${n}.json`} (Passage ${n}, mẫu ${spec?.template ?? '?'}).`)
  }

  warnings.push(...validateReadingManualImport(payload))

  for (const part of payload.parts) {
    warnings.push(...validatePassageQuestionNumbers(part))
  }

  const totalQ = countReadingImportQuestions(payload)
  if (payload.parts.length === 3 && totalQ !== 40) {
    warnings.push(`Đề đủ 3 passages nhưng có ${totalQ}/40 câu.`)
  }
  if (payload.parts.length < 3) {
    warnings.push(`Mới có ${payload.parts.length}/3 passages — chưa đủ đề hoàn chỉnh.`)
  }

  if (!options?.allowPartial) {
    const nums = payload.parts.map(p => p.partNumber)
    for (const spec of meta.passages) {
      if (!nums.includes(spec.partNumber) && !(options?.missingPassageFiles ?? []).includes(spec.partNumber)) {
        errors.push(`Passage ${spec.partNumber} có trong meta nhưng chưa gộp được.`)
      }
    }
  }

  return { errors, warnings }
}