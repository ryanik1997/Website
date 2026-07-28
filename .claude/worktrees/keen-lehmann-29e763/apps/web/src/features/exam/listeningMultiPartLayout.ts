import type { ListeningPart, ListeningQuestion } from './listeningExamData'

/** Options A–H dùng chung cho mọi câu trong Part (FCE/CAE Part 3 matching) */
export function sharedMatchingOptions(questions: ListeningQuestion[]) {
  return questions[0]?.options ?? []
}

function matchingOptionSignature(options: ListeningQuestion['options']): string {
  return options.map(o => `${o.id}:${o.label}`).join('|')
}

/**
 * Part matching kiểu đề giấy: danh sách A–H bên trái, thả chữ cái vào ô Speaker (câu 19–23).
 */
export function isGroupedLetterMatchingPart(part: ListeningPart): boolean {
  if (isDualLetterMatchingPart(part)) return false
  if (part.questions.length === 0) return false
  if (!part.questions.every(q => q.type === 'matching')) return false

  const base = part.questions[0].options
  if (base.length < 4) return false

  return part.questions.every(q =>
    q.options.length === base.length
    && q.options.every((o, i) => o.id === base[i]?.id && o.label === base[i]?.label),
  )
}

/**
 * CAE Part 4: hai task song song — Task One (5 câu) + Task Two (5 câu), mỗi task có bảng A–H riêng.
 */
export function isDualLetterMatchingPart(part: ListeningPart): boolean {
  if (part.matchingDualTask) return true

  if (part.questions.length !== 10) return false
  if (!part.questions.every(q => q.type === 'matching')) return false

  const firstHalf = part.questions.slice(0, 5)
  const secondHalf = part.questions.slice(5)
  if (!firstHalf.every(q => q.prompt.startsWith('Speaker '))) return false
  if (!secondHalf.every(q => q.prompt.startsWith('Speaker '))) return false

  const firstSig = matchingOptionSignature(firstHalf[0]?.options ?? [])
  const secondSig = matchingOptionSignature(secondHalf[0]?.options ?? [])
  return firstSig !== secondSig && firstSig.length > 0 && secondSig.length > 0
}

export function dualMatchingTaskGroups(
  part: ListeningPart,
  questions: ListeningQuestion[] = part.questions,
): { taskOne: ListeningQuestion[]; taskTwo: ListeningQuestion[] } {
  if (questions.length === 10) {
    return {
      taskOne: questions.slice(0, 5),
      taskTwo: questions.slice(5),
    }
  }
  const midpoint = Math.ceil(questions.length / 2)
  return {
    taskOne: questions.slice(0, midpoint),
    taskTwo: questions.slice(midpoint),
  }
}