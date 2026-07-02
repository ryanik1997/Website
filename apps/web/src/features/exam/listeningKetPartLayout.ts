import type { ListeningPart, ListeningQuestion } from './listeningExamData'

/** Thời gian làm bài KET Listening (Cambridge A2 Key) */
export const KET_LISTENING_DURATION_MINUTES = 25

export function isKetGroupedGapFillPart(part: ListeningPart): boolean {
  return part.questions.length > 0 && part.questions.every(q => q.type === 'gap-fill')
}

export function isKetDragMatchingPart(part: ListeningPart): boolean {
  return part.questions.length > 0 && part.questions.every(q => q.type === 'matching')
}

/** "Barbara will bring" → "Barbara" */
export function matchingPersonName(prompt: string): string {
  const willBring = prompt.match(/^(.+?)\s+will\s+bring/i)
  if (willBring) return willBring[1].trim()
  const first = prompt.split(/\s+/)[0]
  return first ?? prompt
}

export function sharedMatchingOptions(questions: ListeningQuestion[]) {
  const first = questions[0]
  return first?.options ?? []
}