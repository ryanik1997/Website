import type { ReadingPart, ReadingQuestion, ReadingQuestionGroup, ReadingQuestionOption } from './examData'
import type {
  ListeningExamType,
  ListeningPart,
  ListeningQuestion,
  ListeningQuestionType,
} from './listeningExamData'

const TFNG: ReadingQuestionOption[] = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
]

export function mcOpts(labels: string[]): ReadingQuestionOption[] {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
  return labels.map((label, i) => ({ id: ids[i] ?? `o${i}`, label }))
}

export function readingMc(
  num: number,
  id: string,
  prompt: string,
  options: ReadingQuestionOption[],
  answer: string,
  explanation: string,
): ReadingQuestion {
  return { id, number: num, type: 'multiple-choice', prompt, options, answer, explanation }
}

export function readingTfng(
  num: number,
  id: string,
  prompt: string,
  answer: string,
  explanation: string,
): ReadingQuestion {
  return { id, number: num, type: 'true-false-not-given', prompt, options: TFNG, answer, explanation }
}

export function readingGap(
  num: number,
  id: string,
  prompt: string,
  answer: string,
  explanation: string,
): ReadingQuestion {
  return {
    id,
    number: num,
    type: 'gap-fill',
    prompt,
    options: [],
    answer,
    explanation,
  }
}

export function readingPart(
  examId: string,
  partNumber: number,
  rangeLabel: string,
  passageTitle: string,
  passage: { text: string; label?: string }[],
  questionGroups: ReadingQuestionGroup[],
  passageSubtitle?: string,
): ReadingPart {
  return {
    id: `${examId}-part-${partNumber}`,
    partNumber,
    rangeLabel,
    passageTitle,
    passageSubtitle,
    passage,
    questionGroups,
  }
}

export function readingGroup(
  id: string,
  range: string,
  type: ReadingQuestionGroup['type'],
  instruction: string,
  questions: ReadingQuestion[],
  extra?: Pick<ReadingQuestionGroup, 'note' | 'paragraphLetters' | 'features' | 'wordBank'>,
): ReadingQuestionGroup {
  return { id, range, type, instruction, questions, ...extra }
}

type McTuple = [string, [string, string, string], 'A' | 'B' | 'C', string]

export function listeningMc(
  examType: string,
  partNum: number,
  num: number,
  prompt: string,
  options: [string, string, string],
  answer: 'A' | 'B' | 'C',
  explanation: string,
  type: ListeningQuestionType = 'multiple-choice',
  extra?: Pick<ListeningQuestion, 'context' | 'gapLead' | 'gapTrail' | 'pictureImageUrl'>,
): ListeningQuestion {
  const ids = ['A', 'B', 'C'] as const
  return {
    id: `${examType}-l-p${partNum}-q${num}`,
    number: num,
    type,
    prompt,
    options: ids.map((id, i) => ({ id, label: options[i] })),
    answer,
    explanation,
    ttsText: prompt,
    ...extra,
  }
}

export function listeningGap(
  examType: string,
  partNum: number,
  num: number,
  prompt: string,
  answer: string,
  explanation: string,
  wordLimit = 2,
  extra?: Pick<ListeningQuestion, 'gapLead' | 'gapTrail'>,
): ListeningQuestion {
  return {
    id: `${examType}-l-p${partNum}-q${num}`,
    number: num,
    type: 'gap-fill',
    prompt,
    options: [],
    answer,
    explanation,
    ttsText: prompt || `${extra?.gapLead ?? ''} ${extra?.gapTrail ?? ''}`.trim(),
    wordLimit,
    ...extra,
  }
}

export function listeningPartFromMc(
  examId: string,
  examType: ListeningExamType,
  partNumber: number,
  start: number,
  items: McTuple[],
  instruction: string,
  ttsText: string,
  questionType: ListeningQuestionType = 'multiple-choice',
): ListeningPart {
  const end = start + items.length - 1
  return {
    id: `${examId}-part-${partNumber}`,
    partNumber,
    rangeLabel: `Questions ${start}–${end}`,
    instruction,
    ttsText,
    questions: items.map(([prompt, opts, answer, expl], i) =>
      listeningMc(examType, partNumber, start + i, prompt, opts, answer, expl, questionType),
    ),
  }
}

export function listeningPartFromGaps(
  examId: string,
  examType: ListeningExamType,
  partNumber: number,
  start: number,
  items: [string, string, string][],
  instruction: string,
  ttsText: string,
): ListeningPart {
  const end = start + items.length - 1
  return {
    id: `${examId}-part-${partNumber}`,
    partNumber,
    rangeLabel: `Questions ${start}–${end}`,
    instruction,
    ttsText,
    questions: items.map(([prompt, answer, expl], i) =>
      listeningGap(examType, partNumber, start + i, prompt, answer, expl),
    ),
  }
}

export function countListeningQuestions(parts: ListeningPart[]): number {
  return parts.reduce((s, p) => s + p.questions.length, 0)
}

export function countReadingQuestions(parts: ReadingPart[]): number {
  return parts.reduce(
    (s, p) => s + p.questionGroups.reduce((gs, g) => gs + g.questions.length, 0),
    0,
  )
}