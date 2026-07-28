import type { ReadingQuestion } from '../examData'
import { READING_GAP_DOTS } from '../readingGapDisplay'

/** Chỉ match gap thật — có dấu chấm/gạch dưới; bỏ qua ví dụ (0) are */
const GAP_TOKEN_RE = /\((\d+)\)\s*(?:\.{2,}|_{2,})/g

export type KetRwGapSegment =
  | { kind: 'text'; value: string }
  | { kind: 'gap'; number: number }

export function splitKetGapText(text: string): KetRwGapSegment[] {
  const segments: KetRwGapSegment[] = []
  let last = 0
  let match: RegExpExecArray | null
  const re = new RegExp(GAP_TOKEN_RE.source, 'g')
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ kind: 'text', value: text.slice(last, match.index) })
    }
    segments.push({ kind: 'gap', number: Number(match[1]) })
    last = match.index + match[0].length
  }
  if (last < text.length) {
    segments.push({ kind: 'text', value: text.slice(last) })
  }
  return segments
}

export function ensureGapDots(text: string, gapNumbers: number[]): string {
  if (!gapNumbers.length) return text
  let result = text
  for (const n of [...new Set(gapNumbers)].sort((a, b) => b - a)) {
    const re = new RegExp(`\\(${n}\\)\\s*(?:\\.{2,}|_{2,})?`, 'g')
    result = result.replace(re, `(${n}) ${READING_GAP_DOTS}`)
  }
  return result
}

export function questionByNumber(questions: ReadingQuestion[], n: number): ReadingQuestion | undefined {
  return questions.find(q => q.number === n)
}