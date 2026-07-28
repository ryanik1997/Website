import { useEffect, useState } from 'react'
import { ensureExamAnswersLoaded } from './catalogExamBody'

type ExamLike = {
  id: string
  answersPath?: string
  answersRemote?: boolean
  parts?: unknown[]
}

/**
 * Mode D: after submit, load answer vault and merge into exam for scoring/UI.
 */
export function useExamWithAnswerKeys<T extends ExamLike>(
  exam: T,
  skill: 'listening' | 'reading',
  enabled = true,
): { exam: T; answersReady: boolean; answersError: string | null } {
  const [merged, setMerged] = useState<T>(exam)
  const [answersReady, setAnswersReady] = useState(false)
  const [answersError, setAnswersError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setMerged(exam)
    setAnswersReady(false)
    setAnswersError(null)
    if (!enabled) {
      setAnswersReady(true)
      return
    }
    void ensureExamAnswersLoaded(exam, skill)
      .then(next => {
        if (!cancelled) {
          setMerged(next as T)
          setAnswersReady(true)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setAnswersError(err instanceof Error ? err.message : 'Không tải được đáp án')
        setAnswersReady(true)
      })
    return () => { cancelled = true }
  }, [exam, skill, enabled, exam.id])

  return { exam: merged, answersReady, answersError }
}
