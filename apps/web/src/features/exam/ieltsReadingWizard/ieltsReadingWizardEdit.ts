import type { ReadingExam, ReadingPart, ReadingQuestion, ReadingQuestionGroup } from '../examData'
import type { ReadingImportPartJson, ReadingImportQuestionGroupJson } from '../importReadingManualUtils'
import {
  IELTS_READING_DEFAULT_TEMPLATES,
  IELTS_READING_PASSAGE_NUMBERS,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'
import type { PersistedPassageDraft } from './ieltsReadingWizardPersist'
import { createEmptyReadingWizardDrafts } from './ieltsReadingWizardPersist'

export function isIeltsReadingWizardEditable(exam: ReadingExam): boolean {
  return exam.examTrack === 'ielts' && exam.parts.length === 3
    && exam.parts.every(p => p.partNumber >= 1 && p.partNumber <= 3)
}

export function readingPartToImportJson(part: ReadingPart): ReadingImportPartJson {
  const mapGroup = (group: ReadingQuestionGroup): ReadingImportQuestionGroupJson => ({
    range: group.range,
    instruction: group.instruction,
    note: group.note,
    imageFile: group.imageFile,
    noteTable: group.noteTable,
    notePassage: group.notePassage,
    notesTitle: group.notesTitle,
    type: group.type,
    paragraphLetters: group.paragraphLetters,
    headings: group.headings,
    features: group.features,
    wordBank: group.wordBank,
    questions: group.questions.map(q => ({
      number: q.number,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      ...(q.minWords ? { minWords: q.minWords } : {}),
    })),
  })

  return {
    partNumber: part.partNumber,
    rangeLabel: part.rangeLabel,
    passageTitle: part.passageTitle,
    passageSubtitle: part.passageSubtitle,
    passage: part.passage.map(block => ({
      label: block.label,
      text: block.text,
    })),
    questionGroups: part.questionGroups.map(mapGroup),
  }
}

function groupTypeSignature(part: ReadingImportPartJson): string {
  return part.questionGroups.map(g => g.type).join('|')
}

const TEMPLATE_SIGNATURES: Record<IeltsReadingPassageNumber, Record<string, IeltsReadingWizardTemplateKind>> = {
  1: {
    'tfng|multiple-choice': 'p1-r1-tfng-mc',
    'gap-fill|tfng': 'p1-r1-notes-tfng',
    'tfng|gap-fill': 'p1-r1-tfng-gap',
    'tfng|sentence-completion': 'p1-r1-tfng-gap',
    'tfng|gap-fill|gap-fill': 'p1-r1-tfng-gap-table',
    'matching-headings|multiple-choice': 'p1-r1-headings-mc',
    'sentence-completion|multiple-choice': 'p1-r1-sentence-mc',
    'matching-headings|gap-fill': 'p1-r1-headings-gap',
    'matching-headings|sentence-completion': 'p1-r1-headings-gap',
    'gap-fill|multiple-choice': 'p1-r1-gap-mc',
    'tfng|matching-features|gap-fill': 'p1-r1-tfng-match-notes',
    'tfng|matching-features|summary-completion': 'p1-r1-tfng-match-summary',
    'matching-paragraph|matching-features|multiple-choice': 'p1-r1-match-choose-two',
  },
  2: {
    'matching-paragraph|matching-features|multiple-choice': 'p2-r2-match-mc',
    'ynng|matching-paragraph|matching-features|multiple-choice': 'p2-r2-ynng-match',
    'matching-headings|gap-fill|ynng': 'p2-r2-headings-ynng',
    'matching-headings|sentence-completion|ynng': 'p2-r2-headings-ynng',
    'tfng|matching-paragraph|matching-features|multiple-choice': 'p2-r2-tfng-match',
    'gap-fill|matching-paragraph|multiple-choice': 'p2-r2-gap-match',
    'sentence-completion|matching-paragraph|multiple-choice': 'p2-r2-gap-match',
    'gap-fill|matching-features|matching-paragraph': 'p2-r2-gap-match',
    'matching-headings|gap-fill|multiple-choice': 'p2-r2-headings-summary-mc',
    'summary-completion|ynng|multiple-choice': 'p2-r2-summary-ynng-mc',
    'tfng|summary-completion|gap-fill': 'p2-r2-tfng-endings-summary',
    'multiple-choice|tfng|summary-completion': 'p2-r2-mc-tfng-endings',
    'tfng|gap-fill': 'p2-r2-tfng-diagram',
    'matching-headings|tfng|sentence-completion': 'p2-r2-headings-tfng-sentence',
    'multiple-choice|summary-completion|ynng': 'p2-r2-mc-summary-ynng',
    'matching-headings|matching-features|gap-fill': 'p2-r2-headings-match-summary',
  },
  3: {
    'tfng|multiple-choice': 'p3-r3-tfng-mc',
    'gap-fill|tfng|summary-completion|multiple-choice': 'p3-r3-gap-tfng-flow-mc',
    'gap-fill|tfng|sentence-completion|summary-completion|multiple-choice': 'p3-r3-gap-tfng-flow-mc',
    'ynng|multiple-choice': 'p3-r3-ynng-mc',
    'gap-fill|ynng|multiple-choice': 'p3-r3-gap-ynng-mc',
    'sentence-completion|ynng|multiple-choice': 'p3-r3-gap-ynng-mc',
    'summary-completion|ynng|multiple-choice': 'p3-r3-summary-ynng-mc',
    'summary-completion|multiple-choice|ynng': 'p3-r3-summary-mc-ynng',
    'gap-fill|tfng|multiple-choice': 'p3-r3-gap-tfng-mc',
    'sentence-completion|tfng|multiple-choice': 'p3-r3-gap-tfng-mc',
    'matching-paragraph|gap-fill|matching-features': 'p3-r3-match-table-features',
    'multiple-choice|summary-completion|ynng': 'p3-r3-mc-summary-ynng',
    'matching-paragraph|sentence-completion': 'p3-r3-match-paragraph-sentence',
    'matching-headings|summary-completion|ynng': 'p3-r3-headings-summary-ynng',
    'matching-headings|gap-fill|ynng': 'p3-r3-headings-gap-ynng',
    'gap-fill|ynng|matching-paragraph': 'p3-r3-table-ynng-match',
    'gap-fill|multiple-choice|summary-completion': 'p3-r3-summary-mc-endings',
  },
}

export function inferTemplateKindFromPart(
  passageNumber: IeltsReadingPassageNumber,
  part: ReadingImportPartJson,
): IeltsReadingWizardTemplateKind {
  const sig = groupTypeSignature(part)
  if (passageNumber === 1 && sig === 'tfng|gap-fill|gap-fill') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p1-r1-tfng-gap-table'
  }
  if (passageNumber === 1 && sig === 'gap-fill|tfng') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p1-r1-table-tfng'
    const notesGroup = part.questionGroups.find(g => g.notePassage?.length)
    if (notesGroup) {
      const gapCount = notesGroup.questions?.length ?? 0
      if (gapCount >= 8) return 'p1-r1-notes-tfng-8'
      return 'p1-r1-notes-tfng'
    }
  }
  if (passageNumber === 1 && sig === 'matching-headings|gap-fill') {
    const notesGroup = part.questionGroups.find(g => g.notePassage?.length)
    if (notesGroup) return 'p1-r1-headings-notes'
  }
  if (passageNumber === 3 && sig === 'matching-paragraph|gap-fill|matching-features') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p3-r3-match-table-features'
  }
  if (passageNumber === 3 && sig === 'gap-fill|ynng|matching-paragraph') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p3-r3-table-ynng-match'
  }
  return TEMPLATE_SIGNATURES[passageNumber][sig]
    ?? IELTS_READING_DEFAULT_TEMPLATES[passageNumber]
}

function formatAnswerForKey(q: ReadingQuestion): string {
  const a = q.answer.trim().toLowerCase()
  if (q.type === 'true-false-not-given') {
    if (a === 'true') return 'TRUE'
    if (a === 'false') return 'FALSE'
    return 'NOT GIVEN'
  }
  if (q.type === 'yes-no-not-given') {
    if (a === 'yes') return 'YES'
    if (a === 'no') return 'NO'
    return 'NOT GIVEN'
  }
  if (q.type === 'multiple-choice' || q.type === 'matching-features') {
    return q.answer.toUpperCase()
  }
  return q.answer
}

export function buildAnswerKeyFromExam(parts: ReadingPart[]): string {
  const questions = parts
    .flatMap(p => p.questionGroups.flatMap(g => g.questions))
    .sort((a, b) => a.number - b.number)

  return questions.map(q => `${q.number} ${formatAnswerForKey(q)}`).join('\n')
}

export function parseCamTestFromExam(title: string, sourceFilename?: string): { cambridge: string; test: string } {
  const fromFile = sourceFilename?.match(/cam(\d+)-test(\d+)/i)
  if (fromFile) {
    return { cambridge: fromFile[1], test: fromFile[2] }
  }

  const fromTitle = title.match(/Cambridge\s*(\d+)[\s\S]*?Test\s*(\d+)/i)
  if (fromTitle) {
    return { cambridge: fromTitle[1], test: fromTitle[2] }
  }

  const camOnly = title.match(/Cam(?:bridge)?\s*(\d+)/i)
  const testOnly = title.match(/Test\s*(\d+)/i)
  return {
    cambridge: camOnly?.[1] ?? '10',
    test: testOnly?.[1] ?? '1',
  }
}

export function passageDraftFromPart(part: ReadingPart): PersistedPassageDraft {
  const passageNumber = part.partNumber as IeltsReadingPassageNumber
  const importPart = readingPartToImportJson(part)
  return {
    templateKind: inferTemplateKindFromPart(passageNumber, importPart),
    examText: '',
    part: importPart,
    rawJson: JSON.stringify(importPart, null, 2),
    warnings: [],
  }
}

export interface ReadingWizardEditState {
  activePassage: IeltsReadingPassageNumber
  title: string
  cambridge: string
  test: string
  answerKey: string
  drafts: Record<IeltsReadingPassageNumber, PersistedPassageDraft>
}

export function wizardEditStateFromExam(
  exam: ReadingExam,
  sourceFilename?: string,
): ReadingWizardEditState {
  const { cambridge, test } = parseCamTestFromExam(exam.title, sourceFilename)
  const drafts = createEmptyReadingWizardDrafts()

  for (const part of exam.parts) {
    if (part.partNumber < 1 || part.partNumber > 3) continue
    const n = part.partNumber as IeltsReadingPassageNumber
    drafts[n] = passageDraftFromPart(part)
  }

  return {
    activePassage: 1,
    title: exam.title,
    cambridge,
    test,
    answerKey: buildAnswerKeyFromExam(exam.parts),
    drafts,
  }
}

export function mergePassageImageKeys(oldParts: ReadingPart[], newParts: ReadingPart[]): ReadingPart[] {
  const oldByNum = new Map(oldParts.map(p => [p.partNumber, p]))

  return newParts.map(np => {
    const op = oldByNum.get(np.partNumber)
    if (!op) return np

    const passage = np.passage.map((block, i) => ({
      ...block,
      imageKey: block.imageKey ?? op.passage[i]?.imageKey,
      imageUrl: block.imageUrl ?? op.passage[i]?.imageUrl,
    }))

    const questionGroups = np.questionGroups.map((group, i) => ({
      ...group,
      imageKey: group.imageKey ?? op.questionGroups[i]?.imageKey,
      imageUrl: group.imageUrl ?? op.questionGroups[i]?.imageUrl,
      imageFile: group.imageFile ?? op.questionGroups[i]?.imageFile,
      noteTable: group.noteTable ?? op.questionGroups[i]?.noteTable,
      notePassage: group.notePassage ?? op.questionGroups[i]?.notePassage,
      notesTitle: group.notesTitle ?? op.questionGroups[i]?.notesTitle,
    }))

    return {
      ...np,
      passage,
      questionGroups,
      topImageUrl: np.topImageUrl ?? op.topImageUrl,
      bottomImageUrl: np.bottomImageUrl ?? op.bottomImageUrl,
    }
  })
}

export function allEditPassagesReady(
  drafts: Record<IeltsReadingPassageNumber, PersistedPassageDraft>,
): boolean {
  return IELTS_READING_PASSAGE_NUMBERS.every(n => drafts[n].part != null)
}