import type { ReadingImportPartJson } from '../importReadingManualUtils'
import {
  IELTS_READING_PASSAGE_RANGES,
  type IeltsReadingPassageNumber,
} from './ieltsReadingWizardConfig'

export function normalizeAiReadingPart(part: ReadingImportPartJson): ReadingImportPartJson {
  let next = { ...part }

  if (!next.rangeLabel?.trim()) {
    const [from, to] = IELTS_READING_PASSAGE_RANGES[next.partNumber as IeltsReadingPassageNumber] ?? [1, 13]
    next.rangeLabel = `Read the text and answer questions ${from}–${to}.`
  }

  if (next.passage?.length) {
    next.passage = next.passage.map(block => ({
      ...block,
      text: block.text ?? '',
    }))
  }

  return next
}

export function validateAiReadingPartShape(
  part: ReadingImportPartJson,
  passageNumber: IeltsReadingPassageNumber,
): void {
  if (part.partNumber !== passageNumber) {
    throw new Error(`partNumber phải là ${passageNumber} (nhận ${part.partNumber}).`)
  }
  if (!part.passageTitle?.trim()) {
    throw new Error('Thiếu passageTitle.')
  }
  if (!part.passage?.some(b => b.text?.trim())) {
    throw new Error('passage[] trống — cần toàn bộ text đoạn văn.')
  }
  if (!part.questionGroups?.length) {
    throw new Error('Thiếu questionGroups.')
  }

  const numbers = part.questionGroups.flatMap(g => g.questions.map(q => q.number)).sort((a, b) => a - b)
  if (!numbers.length) {
    throw new Error('Không có câu hỏi.')
  }

  const [from, to] = IELTS_READING_PASSAGE_RANGES[passageNumber]
  for (const n of numbers) {
    if (n < from || n > to) {
      throw new Error(`Câu ${n} ngoài range Passage ${passageNumber} (${from}–${to}).`)
    }
  }

  for (const q of part.questionGroups.flatMap(g => g.questions)) {
    if (/placeholder/i.test(q.prompt)) {
      throw new Error(`Câu ${q.number}: prompt placeholder.`)
    }
  }
}