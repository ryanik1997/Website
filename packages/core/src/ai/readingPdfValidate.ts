import type { ParsedReadingPart } from './readingPdfPrompt'

export interface ReadingPartStat {
  partNumber: number
  questionCount: number
  expectedMin: number
  expectedMax: number
  inferredCount: number
  present: boolean
}

export interface ReadingImportValidation {
  score: number
  warnings: string[]
  errors: string[]
  partStats: ReadingPartStat[]
  inferredTotal: number
  canSave: boolean
}

const PART_Q_RANGES: Record<1 | 2 | 3, { min: number; max: number }> = {
  1: { min: 10, max: 14 },
  2: { min: 10, max: 14 },
  3: { min: 11, max: 15 },
}

function countInferred(part: ParsedReadingPart): number {
  return part.questionGroups.reduce(
    (sum, g) => sum + g.questions.filter(q => q.answerConfidence === 'inferred').length,
    0,
  )
}

function questionNumbers(part: ParsedReadingPart): number[] {
  return part.questionGroups.flatMap(g => g.questions.map(q => q.number))
}

export function validateReadingImport(parts: ParsedReadingPart[]): ReadingImportValidation {
  const warnings: string[] = []
  const errors: string[] = []
  let score = 100

  const partStats: ReadingPartStat[] = ([1, 2, 3] as const).map(partNumber => {
    const part = parts.find(p => p.partNumber === partNumber)
    const qCount = part
      ? part.questionGroups.reduce((s, g) => s + g.questions.length, 0)
      : 0
    const range = PART_Q_RANGES[partNumber]
    return {
      partNumber,
      questionCount: qCount,
      expectedMin: range.min,
      expectedMax: range.max,
      inferredCount: part ? countInferred(part) : 0,
      present: Boolean(part),
    }
  })

  if (!parts.length) {
    errors.push('Không có part nào được trích.')
    return { score: 0, warnings, errors, partStats, inferredTotal: 0, canSave: false }
  }

  const inferredTotal = parts.reduce((s, p) => s + countInferred(p), 0)

  for (const stat of partStats) {
    if (!stat.present) {
      warnings.push(`Thiếu Part ${stat.partNumber}.`)
      score -= 15
      continue
    }
    if (stat.questionCount < stat.expectedMin) {
      warnings.push(`Part ${stat.partNumber}: chỉ ${stat.questionCount} câu (thường ${stat.expectedMin}–${stat.expectedMax}).`)
      score -= 10
    } else if (stat.questionCount > stat.expectedMax) {
      warnings.push(`Part ${stat.partNumber}: ${stat.questionCount} câu — có thể trùng hoặc thừa.`)
      score -= 5
    }
  }

  for (const part of parts) {
    const nums = questionNumbers(part)
    const dupes = nums.filter((n, i) => nums.indexOf(n) !== i)
    if (dupes.length) {
      warnings.push(`Part ${part.partNumber}: trùng số câu ${[...new Set(dupes)].join(', ')}.`)
      score -= 8
    }

    for (const group of part.questionGroups) {
      if (group.type === 'matching-paragraph' && !group.paragraphLetters?.length) {
        warnings.push(`Part ${part.partNumber} (${group.range}): thiếu paragraph letters A–G.`)
        score -= 5
      }
      if (group.type === 'matching-features' && !group.features?.length) {
        warnings.push(`Part ${part.partNumber} (${group.range}): thiếu danh sách features.`)
        score -= 5
      }
      if (group.type === 'summary-completion' && !group.wordBank?.length) {
        warnings.push(`Part ${part.partNumber} (${group.range}): thiếu word bank.`)
        score -= 5
      }
    }
  }

  if (inferredTotal > 0) {
    const ratio = inferredTotal / Math.max(1, parts.reduce((s, p) => s + questionNumbers(p).length, 0))
    if (ratio > 0.5) {
      warnings.push(`${inferredTotal} câu có đáp án AI đoán (>50%) — nên kiểm tra kỹ preview.`)
      score -= 12
    } else if (inferredTotal > 0) {
      warnings.push(`${inferredTotal} câu có đáp án AI đoán (không có answer key trong PDF).`)
      score -= Math.min(8, inferredTotal)
    }
  }

  score = Math.max(0, Math.min(100, score))
  const canSave = errors.length === 0 && parts.some(p => p.questionGroups.length > 0)

  return { score, warnings, errors, partStats, inferredTotal, canSave }
}