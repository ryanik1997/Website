/**
 * Mode D — answer vault: keys are NOT in runtime exam body.
 * Fetched only for submit scoring / review (signed path).
 */
import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'
import { mediaAccessUserMessage, parseMediaAccessError } from '../../lib/mediaAccessErrors'

export interface ExamAnswerEntry {
  answer?: string
  acceptableAnswers?: string[]
  explanation?: string
  correct?: string
  correctAnswer?: string
  [key: string]: unknown
}

export interface ExamAnswersVault {
  examId: string
  version?: number
  mode?: string
  answers: Record<string, ExamAnswerEntry>
}

const cache = new Map<string, ExamAnswersVault>()
const inflight = new Map<string, Promise<ExamAnswersVault>>()

export function answersPathForExam(
  exam: { id: string; answersPath?: string },
  skill: 'listening' | 'reading',
): string {
  if (exam.answersPath?.trim()) return exam.answersPath.replace(/^\//, '')
  return `catalog/exams/${skill}/${exam.id}.answers.json`
}

export async function fetchCatalogExamAnswers(
  exam: { id: string; answersPath?: string; answersRemote?: boolean },
  skill: 'listening' | 'reading',
): Promise<ExamAnswersVault> {
  const path = answersPathForExam(exam, skill)
  if (cache.has(path)) return cache.get(path)!
  if (inflight.has(path)) return inflight.get(path)!

  const job = (async () => {
    try {
      const url = await resolvePlayableMediaUrl(`/${path}`)
      if (!url) throw new Error('No answers URL')
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} loading answers`)
      const vault = await res.json() as ExamAnswersVault
      if (!vault?.answers || typeof vault.answers !== 'object') {
        throw new Error('Invalid answers vault')
      }
      cache.set(path, vault)
      return vault
    } catch (err) {
      const parsed = parseMediaAccessError(err)
      throw new Error(mediaAccessUserMessage(parsed))
    } finally {
      inflight.delete(path)
    }
  })()

  inflight.set(path, job)
  return job
}

function mergeQuestionList(
  questions: Array<Record<string, unknown> & { id?: string }> | undefined,
  answers: Record<string, ExamAnswerEntry>,
) {
  return (questions ?? []).map(q => {
    const id = q.id
    if (!id || !answers[id]) return q
    return { ...q, ...answers[id] }
  })
}

/** Merge vault keys into exam questions (listening.parts.questions + reading.questionGroups). */
export function mergeAnswersIntoExam<
  T extends {
    parts?: Array<{
      questions?: Array<Record<string, unknown> & { id?: string }>
      questionGroups?: Array<{ questions?: Array<Record<string, unknown> & { id?: string }> }>
    }>
  },
>(exam: T, vault: ExamAnswersVault): T {
  const answers = vault.answers ?? {}
  const parts = (exam.parts ?? []).map(part => ({
    ...part,
    questions: mergeQuestionList(part.questions, answers),
    questionGroups: (part.questionGroups ?? []).map(g => ({
      ...g,
      questions: mergeQuestionList(g.questions, answers),
    })),
  }))
  return { ...exam, parts }
}

export function clearCatalogExamAnswersCache(): void {
  cache.clear()
  inflight.clear()
}

function collectQuestions(exam: {
  parts?: Array<{
    questions?: Array<{ answer?: string; id?: string }>
    questionGroups?: Array<{ questions?: Array<{ answer?: string; id?: string }> }>
  }>
}) {
  const qs: Array<{ answer?: string; id?: string }> = []
  for (const p of exam.parts ?? []) {
    qs.push(...(p.questions ?? []))
    for (const g of p.questionGroups ?? []) qs.push(...(g.questions ?? []))
  }
  return qs
}

/** True if questions still lack answer keys (vault not merged). */
export function examMissingAnswerKeys(exam: {
  parts?: Array<{
    questions?: Array<{ answer?: string; id?: string }>
    questionGroups?: Array<{ questions?: Array<{ answer?: string; id?: string }> }>
  }>
}): boolean {
  const qs = collectQuestions(exam)
  if (!qs.length) return true
  const withId = qs.filter(q => q.id)
  if (!withId.length) return true
  const withAnswer = withId.filter(q => q.answer != null && String(q.answer).length > 0)
  return withAnswer.length < withId.length * 0.5
}
