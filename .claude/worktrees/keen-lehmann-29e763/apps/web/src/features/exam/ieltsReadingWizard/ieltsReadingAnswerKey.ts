import {
  IELTS_READING_PASSAGE_RANGES,
  type IeltsReadingPassageNumber,
} from './ieltsReadingWizardConfig'

/** Tách answer key đầy đủ 1–40 thành slice theo Passage. */
export function sliceAnswerKeyForPassage(fullKey: string, passageNumber: IeltsReadingPassageNumber): string {
  const [from, to] = IELTS_READING_PASSAGE_RANGES[passageNumber]
  const lines: string[] = []

  for (const rawLine of fullKey.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const match = line.match(/^(\d{1,2})\s*[\.\):\-–—]?\s*(.*)$/i)
    if (!match) continue

    const num = Number(match[1])
    if (num >= from && num <= to) {
      lines.push(`${num} ${match[2].trim()}`.trim())
    }
  }

  if (lines.length) return lines.join('\n')

  if (fullKey.trim()) {
    const nums = [...fullKey.matchAll(/\b(\d{1,2})\b/g)].map(m => Number(m[1]))
    const inRange = nums.some(n => n >= from && n <= to)
    if (inRange) return fullKey.trim()
  }

  return fullKey.trim()
}