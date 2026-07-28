import type { ReadingPassageBlock, ReadingQuestionGroup } from '../examData'
import { petPart2PersonImageFilename } from '../importReadingManualUtils'
import {
  buildB1ReferenceBlocks,
  resolveReferenceParts,
} from '../readingB1ReferenceList'

const LETTER_LABEL_RE = /^[A-H]$/i

export interface PetRwBankOption {
  id: string
  label: string
  title?: string
  body?: string
}

export function isLetterLabel(label?: string): boolean {
  return Boolean(label?.trim() && LETTER_LABEL_RE.test(label.trim()))
}

/** Blocks A–H (markets, sentences, courses…) */
export function getLabeledOptionBlocks(passage: ReadingPassageBlock[]): ReadingPassageBlock[] {
  return passage.filter(b => isLetterLabel(b.label))
}

/** Body text blocks — no letter label, no standalone image-only intro */
export function getBodyTextBlocks(passage: ReadingPassageBlock[]): ReadingPassageBlock[] {
  return passage.filter(b => {
    if (b.imageKey || b.imageUrl) return false
    if (isLetterLabel(b.label)) return false
    const t = b.text?.trim() ?? ''
    if (!t) return false
    if (/^sentences?$/i.test(t)) return false
    return true
  })
}

export function featureBankFromGroup(group: ReadingQuestionGroup): Array<{ id: string; label: string }> {
  if (group.features?.length) {
    return group.features.map((f, i) => ({
      id: String.fromCharCode(65 + i),
      label: f.name,
    }))
  }
  return []
}

export function optionBankFromPassage(
  passage: ReadingPassageBlock[],
  group: ReadingQuestionGroup,
  opts?: { partNumber?: number; compact?: boolean },
): PetRwBankOption[] {
  const partNumber = opts?.partNumber
  const compact = opts?.compact ?? false

  if (partNumber === 2 && !compact) {
    const features = group.features ?? []
    const blocks = buildB1ReferenceBlocks(passage, features, 2)
    if (blocks.length) {
      return blocks.map((block, index) => {
        const { letter, title, body } = resolveReferenceParts(block, index, true)
        return {
          id: letter,
          label: title ?? body,
          title,
          body,
        }
      })
    }
  }

  const fromFeatures = featureBankFromGroup(group)
  if (fromFeatures.length) {
    return fromFeatures.map(f => ({ id: f.id, label: f.label, title: f.label }))
  }
  return getLabeledOptionBlocks(passage).map((b, index) => {
    const letter = b.label!.trim().toUpperCase()
    const { title, body } = resolveReferenceParts(b, index, partNumber === 2)
    return {
      id: letter,
      label: title ?? body,
      title,
      body,
    }
  })
}

export function partHasFullPageImage(passage: ReadingPassageBlock[]): ReadingPassageBlock | null {
  const img = passage.find(b => (b.imageKey || b.imageUrl) && !b.text?.trim())
  return img ?? null
}

export function personImageFileForQuestion(questionNumber: number): string {
  return petPart2PersonImageFilename(questionNumber)
}