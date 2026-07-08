import type { ReadingImportPartJson } from '../importReadingManualUtils'
import {
  gapNumbersInReadingNoteTable,
  mergeTemplateNoteTables,
  normalizeReadingImportNoteTables,
} from '../readingNoteTableUtils'
import {
  IELTS_READING_PASSAGE_RANGES,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
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

  next.questionGroups = normalizeReadingImportNoteTables(next.questionGroups)

  return next
}

export function applyReadingTemplateTableStructure(
  part: ReadingImportPartJson,
  templatePart: ReadingImportPartJson,
): ReadingImportPartJson {
  const merged = mergeTemplateNoteTables(part, templatePart)
  return {
    ...part,
    questionGroups: normalizeReadingImportNoteTables(merged.questionGroups),
  }
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

const TABLE_TEMPLATE_KINDS = new Set<IeltsReadingWizardTemplateKind>([
  'p1-r1-tfng-gap-table',
  'p3-r3-match-table-features',
  'p3-r3-table-ynng-match',
])

export function validateAiReadingPartAgainstTemplate(
  part: ReadingImportPartJson,
  passageNumber: IeltsReadingPassageNumber,
  templateKind: IeltsReadingWizardTemplateKind,
): void {
  if (!TABLE_TEMPLATE_KINDS.has(templateKind)) return

  const errors: string[] = []
  const tableGroups = part.questionGroups.filter(g => {
    const gaps = g.questions.filter(q => q.type === 'gap-fill').map(q => q.number)
    return gaps.length > 0
  })

  for (const group of tableGroups) {
    const gapNums = group.questions.filter(q => q.type === 'gap-fill').map(q => q.number)
    if (!group.noteTable?.headers?.length || !group.noteTable.rows?.length) {
      errors.push(`${group.range}: thiếu noteTable (cần bảng ${gapNums.length} gap).`)
      continue
    }
    const tableGaps = gapNumbersInReadingNoteTable(group.noteTable)
    for (const n of gapNums) {
      if (!tableGaps.includes(n)) {
        errors.push(`${group.range}: noteTable thiếu gap ${n}.`)
      }
    }
  }

  if (passageNumber === 3 && templateKind === 'p3-r3-table-ynng-match') {
    const sig = part.questionGroups.map(g => g.type).join('|')
    if (sig !== 'gap-fill|ynng|matching-paragraph') {
      errors.push(`Layout P3 r3ty cần gap-fill|ynng|matching-paragraph (nhận ${sig}).`)
    }
  }

  if (errors.length) {
    throw new Error(errors.join(' '))
  }
}