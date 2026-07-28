import type { ListeningQuestion, ListeningQuestionOption } from './listeningExamData'

/** A…Z letter bank for map/diagram labelling when catalog options are empty. */
export function letterOptionsRange(
  from: string,
  to: string,
): ListeningQuestionOption[] {
  const start = from.toUpperCase().charCodeAt(0)
  const end = to.toUpperCase().charCodeAt(0)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return letterOptionsRange('A', 'H')
  }
  const out: ListeningQuestionOption[] = []
  for (let c = start; c <= end; c += 1) {
    const id = String.fromCharCode(c)
    out.push({ id, label: id })
  }
  return out
}

/**
 * Infer A–H / A–I from section instruction, answers, or default A–H.
 * Catalog IELTS map items often ship with `options: []`.
 */
export function resolveMapOrDiagramLetterOptions(
  questions: ListeningQuestion[],
  fallbackInstruction?: string,
): ListeningQuestionOption[] {
  const first = questions[0]
  if (first?.options?.length) {
    return first.options
  }

  const text = [
    first?.sectionInstruction,
    fallbackInstruction,
    first?.prompt,
  ]
    .filter(Boolean)
    .join(' ')

  // "A–H", "A-H", "A – I", "letters A to H"
  const range =
    text.match(/\b([A-I])\s*[–\-−]\s*([A-I])\b/i)
    ?? text.match(/\b([A-I])\s+to\s+([A-I])\b/i)
  if (range) {
    return letterOptionsRange(range[1]!, range[2]!)
  }

  const answerLetters = questions
    .map(q => String(q.answer || '').trim().toUpperCase())
    .filter(a => /^[A-I]$/.test(a))
    .map(a => a.charCodeAt(0))

  if (answerLetters.length) {
    const max = Math.max(...answerLetters)
    // Always include A..max, at least through H for typical map banks
    const end = Math.max(max, 'H'.charCodeAt(0))
    return letterOptionsRange('A', String.fromCharCode(end))
  }

  return letterOptionsRange('A', 'H')
}
