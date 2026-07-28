import { useEffect, useMemo, type RefObject } from 'react'
import {
  buildEvidenceHighlights,
  evidencesForQuestion,
  scrollToAiEvidence,
  type ExamAiEvidence,
  type HighlightTextBlock,
} from './examAiEvidence'
import type { ReadingHighlight } from './readingHighlightUtils'

/** Gộp tô user + tô cam AI evidence; auto-scroll khi đổi câu. */
export function useReviewEvidenceHighlights(
  reviewMode: boolean,
  evidences: ExamAiEvidence[],
  activeQuestionNumber: number | null,
  blocks: HighlightTextBlock[],
  userHighlights: ReadingHighlight[],
  scrollRootRef?: RefObject<HTMLElement | null>,
): ReadingHighlight[] {
  const aiEvidenceHighlights = useMemo(() => {
    if (!reviewMode) return []
    const quotes = evidencesForQuestion(evidences, activeQuestionNumber)
    if (!quotes.length || !blocks.length) return []
    return buildEvidenceHighlights(blocks, quotes)
  }, [activeQuestionNumber, blocks, evidences, reviewMode])

  const displayHighlights = useMemo(
    () => [...userHighlights, ...aiEvidenceHighlights],
    [aiEvidenceHighlights, userHighlights],
  )

  useEffect(() => {
    if (!reviewMode || !aiEvidenceHighlights.length) return
    const fallback = document.querySelector(
      '.ket-rw-main, .reading-test-body, .listening-exam-body',
    ) as HTMLElement | null
    scrollToAiEvidence(scrollRootRef?.current ?? fallback)
  }, [activeQuestionNumber, aiEvidenceHighlights, reviewMode, scrollRootRef])

  return displayHighlights
}
