import { useEffect, useMemo, useState } from 'react'
import {
  loadExamAiAnalysisStored,
  type ExamAiAnalysisSkill,
} from './examAiAnalysisStorage'
import type { ExamAiEvidence } from './examAiEvidence'

/**
 * Load AI analysis đã lưu (sessionStorage) khi vào chế độ “Xem cùng đề bài”.
 * Trả null nếu chưa phân tích AI hoặc user đã ẩn panel.
 */
export function useExamReviewAi(
  examId: string | undefined | null,
  skill: ExamAiAnalysisSkill,
  reviewMode: boolean,
) {
  const [hidden, setHidden] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reviewMode) {
      setHidden(false)
      setTick(t => t + 1)
    }
  }, [reviewMode])

  const stored = useMemo(() => {
    if (!reviewMode || !examId || hidden) return null
    void tick
    return loadExamAiAnalysisStored(examId, skill)
  }, [examId, skill, reviewMode, hidden, tick])

  return {
    aiText: stored?.markdown ?? null,
    evidences: (stored?.evidences ?? []) as ExamAiEvidence[],
    hideAi: () => setHidden(true),
  }
}
