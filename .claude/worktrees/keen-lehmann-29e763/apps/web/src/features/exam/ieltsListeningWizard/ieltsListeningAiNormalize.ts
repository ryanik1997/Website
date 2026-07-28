import type { IeltsListeningP1TemplateKind } from '../ieltsListeningImportTemplates'
import {
  gapNumbersFromSections,
  gapNumbersInNoteTable,
} from '../listeningNotePassage'
import type { ListeningImportPartJson } from '../importListeningUtils'
import { normalizeListeningImportPart } from '../listeningImportNormalize'
import {
  IELTS_WIZARD_PART_RANGES,
  type IeltsListeningWizardTemplateKind,
  type IeltsWizardPartNumber,
} from './ieltsListeningWizardConfig'

function sectionsHaveWrongShape(
  sections: ListeningImportPartJson['notePassageSections'],
): boolean {
  if (!sections?.length) return false
  return sections.some(s => 'type' in (s as object))
}

export function normalizeAiPart(
  part: ListeningImportPartJson,
  options?: { examText?: string },
): ListeningImportPartJson {
  return normalizeListeningImportPart(part, {
    examText: options?.examText,
    examType: 'ielts',
  })
}

/** @deprecated */
export function normalizeAiP1Part(part: ListeningImportPartJson): ListeningImportPartJson {
  return normalizeAiPart(part)
}

export function validateAiPartShape(
  part: ListeningImportPartJson,
  partNumber: IeltsWizardPartNumber,
): void {
  if (part.partNumber !== partNumber) {
    throw new Error(`partNumber phải là ${partNumber} (nhận ${part.partNumber}).`)
  }
  if (!part.questions?.length) {
    throw new Error('part.questions trống.')
  }

  const [from, to] = IELTS_WIZARD_PART_RANGES[partNumber]
  const numbers = part.questions.map(q => q.number).sort((a, b) => a - b)
  if (numbers.length !== 10) {
    throw new Error(`Part ${partNumber} cần 10 câu (nhận ${numbers.length}).`)
  }
  for (let n = from; n <= to; n++) {
    if (!numbers.includes(n)) {
      throw new Error(`Thiếu câu ${n} trong questions.`)
    }
  }

  for (const q of part.questions) {
    if (/placeholder/i.test(q.prompt)) {
      throw new Error(`Câu ${q.number}: prompt placeholder — map vào notePassage/bảng.`)
    }
  }
}

export function validateAiPartAgainstTemplate(
  part: ListeningImportPartJson,
  partNumber: IeltsWizardPartNumber,
  templateKind: IeltsListeningWizardTemplateKind,
): void {
  const errors: string[] = []

  if (sectionsHaveWrongShape(part.notePassageSections)) {
    errors.push(
      'notePassageSections SAI: dùng [{ gapNumbers, instruction, title, blocks }], '
      + 'không tách từng field thành section riêng.',
    )
  }

  if (
    partNumber === 1
    && (templateKind === 'p1-hybrid-form-table' || templateKind === 'p1-hybrid-a6')
  ) {
    if (!part.notePassageSections?.length) errors.push('Thiếu notePassageSections Q1–6.')
    if (!part.noteTables?.length) errors.push('Thiếu noteTables Q7–10.')
    else {
      const tableGaps = part.noteTables.flatMap(t =>
        t.gapNumbers?.length ? t.gapNumbers : gapNumbersInNoteTable(t),
      )
      for (const n of [7, 8, 9, 10]) {
        if (!tableGaps.includes(n)) errors.push(`noteTables thiếu gap ${n}.`)
      }
    }
    const sectionGaps = gapNumbersFromSections(part.notePassageSections)
    for (const n of [1, 2, 3, 4, 5, 6]) {
      if (!sectionGaps.includes(n)) errors.push(`notePassageSections thiếu gap ${n}.`)
    }
  }

  if (partNumber === 1 && templateKind === 'p1-form'
    && !part.notePassage?.length && !part.notePassageSections?.length) {
    errors.push('Thiếu notePassage hoặc notePassageSections.')
  }

  if (partNumber === 1 && templateKind === 'p1-table'
    && !part.noteTable && !part.noteTables?.length) {
    errors.push('Thiếu noteTable hoặc noteTables.')
  }

  if (partNumber === 2 && templateKind === 'p2-a15') {
    if (!part.noteTables?.length) errors.push('a15: thiếu noteTables Q16–20.')
    else {
      const tableGaps = part.noteTables.flatMap(t =>
        t.gapNumbers?.length ? t.gapNumbers : gapNumbersInNoteTable(t),
      )
      for (const n of [16, 17, 18, 19, 20]) {
        if (!tableGaps.includes(n)) errors.push(`noteTables thiếu gap ${n}.`)
      }
    }
  }

  if (partNumber === 4 && templateKind === 'p4-d4') {
    if (!part.notePassage?.length) errors.push('d4: thiếu notePassage Q34–40.')
    else {
      const gaps = part.notePassage
        .filter(b => b.type === 'gap' && b.number != null)
        .map(b => b.number as number)
      for (const n of [34, 35, 36, 37, 38, 39, 40]) {
        if (!gaps.includes(n)) errors.push(`notePassage thiếu gap ${n}.`)
      }
    }
  } else if (partNumber === 4 && !part.notePassage?.length && !part.notePassageSections?.length) {
    errors.push('Part 4 cần notePassage (lecture notes).')
  }

  if (errors.length) {
    throw new Error(errors.join(' '))
  }
}

/** @deprecated */
export function validateAiP1AgainstTemplate(
  part: ListeningImportPartJson,
  templateKind: IeltsListeningP1TemplateKind,
): void {
  validateAiPartAgainstTemplate(part, 1, templateKind)
}