import type { ReadingPart } from './examData'
import { REF_LETTERS } from './readingB1ReferenceList'

export function readingPassageAnchorId(questionId: string): string {
  return `reading-p-${questionId}`
}

export function readingPassageBlockAnchorId(partId: string, blockIndex: number): string {
  return `reading-p-block-${partId}-${blockIndex}`
}

export function readingPassageRefAnchorId(partId: string, letter: string): string {
  return `reading-p-ref-${partId}-${letter.toUpperCase()}`
}

export function readingPassageFeatureAnchorId(partId: string, featureId: string): string {
  return `reading-p-feature-${partId}-${featureId}`
}

function findQuestionGroup(part: ReadingPart, questionId: string) {
  for (const group of part.questionGroups) {
    const index = group.questions.findIndex(q => q.id === questionId)
    if (index >= 0) return { group, index }
  }
  return null
}

function firstLabeledBlockIndex(part: ReadingPart): number {
  return part.passage.findIndex(b => Boolean(b.label?.trim()))
}

function optionLabelsMatchPassage(part: ReadingPart, question: ReadingPart['questionGroups'][0]['questions'][0]): boolean {
  const optionLabels = new Set(question.options.map(o => o.label.trim().toLowerCase()))
  return part.passage.some(b => {
    const label = b.label?.trim().toLowerCase()
    return label ? optionLabels.has(label) : false
  })
}

/** Xác định anchor cột trái tương ứng với câu hỏi đang chọn. */
export function resolvePassageAnchorForQuestion(
  part: ReadingPart,
  questionId: string,
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2',
): string {
  if ((cambridgeLevel === 'a2' || cambridgeLevel === 'b1') && part.partNumber === 1) {
    return readingPassageAnchorId(questionId)
  }

  const located = findQuestionGroup(part, questionId)
  if (!located) {
    return readingPassageBlockAnchorId(part.id, 0)
  }

  const { group, index: gIdx } = located
  const question = group.questions[gIdx]!

  if (group.type === 'matching-features' || group.type === 'matching-paragraph') {
    const feature = group.features?.[gIdx]
    if (feature) {
      return readingPassageFeatureAnchorId(part.id, feature.id)
    }
    const letter = REF_LETTERS[gIdx] ?? String(gIdx + 1)
    return readingPassageRefAnchorId(part.id, letter)
  }

  const labeledIdx = firstLabeledBlockIndex(part)
  if (labeledIdx >= 0 && group.type === 'multiple-choice' && optionLabelsMatchPassage(part, question)) {
    return readingPassageBlockAnchorId(part.id, labeledIdx)
  }

  const contentBlocks = part.passage
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => Boolean(b.text?.trim()) || Boolean(b.imageKey || b.imageUrl))

  if (contentBlocks[gIdx]) {
    return readingPassageBlockAnchorId(part.id, contentBlocks[gIdx]!.i)
  }

  if (contentBlocks.length > 0) {
    return readingPassageBlockAnchorId(part.id, contentBlocks[0]!.i)
  }

  return readingPassageBlockAnchorId(part.id, 0)
}

export function isPassageAnchorActive(
  anchorId: string,
  part: ReadingPart,
  activeQuestionId: string | null | undefined,
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2',
): boolean {
  if (!activeQuestionId) return false
  return resolvePassageAnchorForQuestion(part, activeQuestionId, cambridgeLevel) === anchorId
}