import { READING_EXAMS } from '../examData'
import type { ReadingImportPartJson } from '../importReadingManualUtils'
import type { IeltsReadingPassageNumber, IeltsReadingWizardTemplateKind } from './ieltsReadingWizardConfig'

function partToImportJson(part: (typeof READING_EXAMS)[0]['parts'][0]): ReadingImportPartJson {
  return {
    partNumber: part.partNumber,
    rangeLabel: part.rangeLabel,
    passageTitle: part.passageTitle,
    passageSubtitle: part.passageSubtitle,
    passage: part.passage.map(block => ({
      label: block.label,
      text: block.text,
    })),
    questionGroups: part.questionGroups.map(group => ({
      range: group.range,
      instruction: group.instruction,
      note: group.note,
      type: group.type,
      paragraphLetters: group.paragraphLetters,
      features: group.features,
      wordBank: group.wordBank,
      questions: group.questions.map(q => ({
        number: q.number,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      })),
    })),
  }
}

const MOCK = READING_EXAMS.find(e => e.id === 'ielts-reading-01')!

export function ieltsReadingP1R1Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[0])
}

export function ieltsReadingP2R2Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[1])
}

export function ieltsReadingP3R3Part(): ReadingImportPartJson {
  return partToImportJson(MOCK.parts[2])
}

const TEMPLATE_BUILDERS: Record<IeltsReadingWizardTemplateKind, () => ReadingImportPartJson> = {
  'p1-r1-tfng-mc': ieltsReadingP1R1Part,
  'p2-r2-match-mc': ieltsReadingP2R2Part,
  'p3-r3-tfng-mc': ieltsReadingP3R3Part,
}

export function getIeltsReadingWizardTemplatePart(
  passageNumber: IeltsReadingPassageNumber,
  kind: IeltsReadingWizardTemplateKind,
): ReadingImportPartJson {
  const part = TEMPLATE_BUILDERS[kind]()
  return { ...part, partNumber: passageNumber }
}