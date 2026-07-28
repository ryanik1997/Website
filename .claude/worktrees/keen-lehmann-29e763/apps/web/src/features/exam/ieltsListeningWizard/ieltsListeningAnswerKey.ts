import {
  IELTS_WIZARD_PART_RANGES,
  type IeltsWizardPartNumber,
} from './ieltsListeningWizardConfig'

/** Tách answer key đầy đủ 1–40 thành slice theo Part. */
export function sliceAnswerKeyForPart(fullKey: string, partNumber: IeltsWizardPartNumber): string {
  const [from, to] = IELTS_WIZARD_PART_RANGES[partNumber]
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

  // Fallback: trả nguyên key nếu user chỉ dán slice một part
  const anyInRange = lines.length > 0
  if (!anyInRange && fullKey.trim()) {
    const nums = [...fullKey.matchAll(/\b(\d{1,2})\b/g)].map(m => Number(m[1]))
    const inRange = nums.some(n => n >= from && n <= to)
    if (inRange || (partNumber === 1 && !nums.some(n => n > 10))) {
      return fullKey.trim()
    }
  }

  return fullKey.trim()
}