import type { ReadingPart } from './examData'
import { getPartQuestions } from './examData'

/** 8 chấm như đề KET Part 4–5: (25) ........ */
export const READING_GAP_DOTS = '........'

/**
 * Chuẩn hóa chỗ trống đánh số trong passage — (19) → (19) ........
 * Bỏ qua gap đã có đáp án ví dụ như (0) are.
 */
export function formatNumberedGapMarkers(text: string, gapNumbers: number[]): string {
  if (!text || gapNumbers.length === 0) return text

  let result = text
  const unique = [...new Set(gapNumbers)].sort((a, b) => b - a)

  for (const n of unique) {
    const re = new RegExp(`\\(${n}\\)\\s*(?:\\.{2,})?`, 'g')
    result = result.replace(re, (match, _g1, offset) => {
      const rest = result.slice(offset + match.length).replace(/^\s+/, '')
      const nextChar = rest[0] ?? ''
      const punctFollows = /^[,.;:!?)}\]]/.test(nextChar)
      return punctFollows
        ? `(${n}) ${READING_GAP_DOTS}`
        : `(${n}) ${READING_GAP_DOTS} `
    })
  }
  return result
}

export function shouldFormatPassageGaps(
  cambridgeLevel: string | undefined,
  partNumber: number,
): boolean {
  if (cambridgeLevel === 'a2' && (partNumber === 4 || partNumber === 5)) return true
  if (cambridgeLevel === 'b1' && (partNumber === 5 || partNumber === 6)) return true
  return false
}

export function formatPassageTextForDisplay(
  text: string,
  part: ReadingPart,
  cambridgeLevel?: string,
): string {
  if (!shouldFormatPassageGaps(cambridgeLevel, part.partNumber)) return text
  const gapNumbers = getPartQuestions(part).map(q => q.number)
  return formatNumberedGapMarkers(text, gapNumbers)
}