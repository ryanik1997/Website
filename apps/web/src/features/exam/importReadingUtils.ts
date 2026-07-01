import type { ParsedReadingPart } from '@ryan/core'
import type { ReadingExam, ReadingPart } from './examData'

export function parsedPartToReadingPart(parsed: ParsedReadingPart, partId: string): ReadingPart {
  return {
    id: partId,
    partNumber: parsed.partNumber,
    rangeLabel: parsed.rangeLabel,
    passageTitle: parsed.passageTitle,
    passageSubtitle: parsed.passageSubtitle,
    passage: parsed.passage,
    questionGroups: parsed.questionGroups.map((group, groupIndex) => ({
      id: `${partId}-g${groupIndex}`,
      range: group.range,
      instruction: group.instruction,
      note: group.note,
      type: group.type,
      paragraphLetters: group.paragraphLetters,
      features: group.features,
      wordBank: group.wordBank,
      questions: group.questions.map(question => ({
        id: `${partId}-q${question.number}`,
        number: question.number,
        type: question.type,
        prompt: question.prompt,
        options: question.options,
        answer: question.answer,
        explanation: question.explanation,
        answerConfidence: question.answerConfidence,
      })),
    })),
  }
}

export function parsedPartsToReadingParts(examId: string, parts: ParsedReadingPart[]): ReadingPart[] {
  return parts.map(p => parsedPartToReadingPart(p, `${examId}-part-${p.partNumber}`))
}

/** @deprecated — dùng parsedPartToReadingPart */
export const part1ToReadingPart = parsedPartToReadingPart

export function buildImportedReadingExam(
  examId: string,
  title: string,
  parts: ReadingPart[],
  _sourceFilename?: string,
): ReadingExam {
  const partCount = parts.length
  const bandHint = partCount >= 3
    ? 'Import PDF — Full test (3 parts)'
    : partCount === 1
      ? 'Import PDF — Part 1'
      : `Import PDF — ${partCount} parts`

  return {
    id: examId,
    title,
    durationMinutes: 60,
    bandHint,
    parts,
  }
}

export function titleFromPdfFilename(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Reading PDF Import'
}

export function defaultExamTitle(parts: ParsedReadingPart[]): string {
  const p1 = parts.find(p => p.partNumber === 1) ?? parts[0]
  if (!p1) return 'Reading PDF Import'
  if (parts.length >= 3) return `${p1.passageTitle} — Full Reading`
  if (parts.length === 1) return p1.passageTitle
  const nums = parts.map(p => p.partNumber).sort((a, b) => a - b).join(', ')
  return `${p1.passageTitle} — Parts ${nums}`
}

export function countQuestions(parts: ParsedReadingPart[]): number {
  return parts.reduce(
    (sum, p) => sum + p.questionGroups.reduce((gs, g) => gs + g.questions.length, 0),
    0,
  )
}

export function countInferredAnswers(parts: ParsedReadingPart[]): number {
  return parts.reduce(
    (sum, p) => sum + p.questionGroups.reduce(
      (gs, g) => gs + g.questions.filter(q => q.answerConfidence === 'inferred').length,
      0,
    ),
    0,
  )
}