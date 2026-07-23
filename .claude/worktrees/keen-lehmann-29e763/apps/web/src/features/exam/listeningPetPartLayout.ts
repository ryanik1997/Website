import type { ListeningExamType, ListeningPart } from './listeningExamData'

/** Thời gian làm bài PET Listening (Cambridge B1) */
export const PET_LISTENING_DURATION_MINUTES = 30

export const PET_LISTENING_QUESTION_COUNT = 25

export type PetListeningPartKind = 'picture' | 'extract' | 'gapfill' | 'interview'

const PET_PART_KIND: Record<number, PetListeningPartKind> = {
  1: 'picture',
  2: 'extract',
  3: 'gapfill',
  4: 'interview',
}

export function petListeningPartKind(
  examType: ListeningExamType,
  part: ListeningPart,
): PetListeningPartKind | null {
  if (examType !== 'pet') return null
  return PET_PART_KIND[part.partNumber] ?? null
}

export function isPetPicturePart(examType: ListeningExamType, part: ListeningPart): boolean {
  return petListeningPartKind(examType, part) === 'picture'
}

export function isPetExtractPart(examType: ListeningExamType, part: ListeningPart): boolean {
  return petListeningPartKind(examType, part) === 'extract'
}

export function isPetGroupedGapFillPart(examType: ListeningExamType, part: ListeningPart): boolean {
  return petListeningPartKind(examType, part) === 'gapfill'
}

export function isPetInterviewPart(examType: ListeningExamType, part: ListeningPart): boolean {
  return petListeningPartKind(examType, part) === 'interview'
}

export function isPetSpecialPartLayout(examType: ListeningExamType, part: ListeningPart): boolean {
  return examType === 'pet' && part.partNumber >= 2 && part.partNumber <= 4
}