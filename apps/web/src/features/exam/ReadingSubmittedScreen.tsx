import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import ExamResult from './ExamResult'
import FullMockStageResult from './FullMockStageResult'
import { readingExamBackPath } from './examNavigation'
import { getScorableExamQuestions, isReadingAnswerCorrect, type ReadingExam } from './examData'
import { getFullMockTest } from './fullMockData'
import {
  appendFullMockQuery,
  clearFullMockSession,
  patchFullMockSession,
} from './fullMockSession'
import { useExamWithAnswerKeys } from './useExamWithAnswerKeys'
import { promoteHydratedExamForReview } from './examReviewHydration'

interface Props {
  exam: ReadingExam
  answers: Record<string, string>
  fullMockId: string | null
  onRetry: () => void
  /** Xem lại đề trên UI làm bài (đúng/sai) — không dùng full mock stage */
  onReviewWithPaper?: () => void
  scopedPartIndex?: number
}

/** Màn hình sau Submit Reading — tách riêng, hooks parent luôn gọi đủ trước khi render. */
export default function ReadingSubmittedScreen({
  exam: examProp,
  answers,
  fullMockId,
  onRetry,
  onReviewWithPaper,
  scopedPartIndex,
}: Props) {
  const navigate = useNavigate()
  const fullMock = fullMockId ? getFullMockTest(fullMockId) : null
  const { exam, answersReady, answersError } = useExamWithAnswerKeys(examProp, 'reading', true)

  if (!answersReady) {
    return (
      <div className="flex h-full items-center justify-center gap-2" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải đáp án để chấm…</span>
      </div>
    )
  }

  if (answersError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Không tải được đáp án để chấm bài</p>
        <p className="max-w-lg text-sm" style={{ color: 'var(--text-muted)' }}>{answersError}</p>
        <button type="button" className="rounded-lg border px-4 py-2 text-sm font-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} onClick={() => window.location.reload()}>
          Thử tải lại
        </button>
      </div>
    )
  }

  if (fullMock) {
    const questions = getScorableExamQuestions(exam)
    const correct = questions.filter(q => isReadingAnswerCorrect(q, answers[q.id] ?? '')).length
    return (
      <FullMockStageResult
        mockTitle={fullMock.title}
        stage="reading"
        stageLabel="Reading"
        scoreText={`${correct}/${questions.length}`}
        nextLabel="Tiếp Listening"
        onContinue={() => {
          patchFullMockSession({
            stage: 'listening',
            reading: { correct, total: questions.length, answers: { ...answers } },
          })
          navigate(appendFullMockQuery(`/app/exam/listening/${fullMock.listeningExamId}`, fullMock.id))
        }}
        onExit={() => {
          clearFullMockSession()
          navigate('/app/exam')
        }}
        onRetry={onRetry}
        retryLabel="Làm lại Reading"
      />
    )
  }

  return (
    <>
      {answersError && (
        <p className="px-4 py-2 text-xs text-center" style={{ color: 'var(--color-accent)' }}>
          {answersError}
        </p>
      )}
      <ExamResult
        exam={exam}
        answers={answers}
        onRetry={onRetry}
        onBack={() => navigate(readingExamBackPath(exam))}
        onReviewWithPaper={() => {
          promoteHydratedExamForReview(examProp, exam)
          onReviewWithPaper?.()
        }}
        scopedPartIndex={scopedPartIndex}
      />
    </>
  )
}
