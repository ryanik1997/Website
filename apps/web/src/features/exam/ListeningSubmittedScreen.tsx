import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import FullMockStageResult from './FullMockStageResult'
import ListeningExamResult from './ListeningExamResult'
import { listeningExamBackPath } from './examNavigation'
import { getFullMockTest } from './fullMockData'
import {
  appendFullMockQuery,
  clearFullMockSession,
  patchFullMockSession,
} from './fullMockSession'
import type { ListeningExam, ListeningQuestion } from './listeningExamData'
import { getListeningExamQuestions, isListeningAnswerCorrect } from './listeningExamData'
import { useExamWithAnswerKeys } from './useExamWithAnswerKeys'
import { promoteHydratedExamForReview } from './examReviewHydration'

interface Props {
  exam: ListeningExam
  answers: Record<string, string>
  unsure: Record<string, boolean>
  allQuestions: ListeningQuestion[]
  fullMockId: string | null
  onRetry: () => void
  onReviewWithPaper?: () => void
}

/** Màn hình sau Submit — tách riêng để parent test shell không early-return trước hooks. */
export default function ListeningSubmittedScreen({
  exam: examProp,
  answers,
  unsure,
  allQuestions: _allQuestions,
  fullMockId,
  onRetry,
  onReviewWithPaper,
}: Props) {
  const navigate = useNavigate()
  const fullMock = fullMockId ? getFullMockTest(fullMockId) : null
  // Mode D: load answer vault before scoring
  const { exam, answersReady, answersError } = useExamWithAnswerKeys(examProp, 'listening', true)
  const allQuestions = getListeningExamQuestions(exam)

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
    const correct = allQuestions.filter(q => isListeningAnswerCorrect(q, answers[q.id] ?? '')).length
    return (
      <FullMockStageResult
        mockTitle={fullMock.title}
        stage="listening"
        stageLabel="Listening"
        scoreText={`${correct}/${allQuestions.length}`}
        nextLabel="Tiếp Writing"
        onContinue={() => {
          patchFullMockSession({
            stage: 'writing',
            listening: {
              correct,
              total: allQuestions.length,
              answers: { ...answers },
              unsure: { ...unsure },
            },
          })
          navigate(appendFullMockQuery(`/app/exam/writing/${fullMock.id}`, fullMock.id))
        }}
        onExit={() => {
          clearFullMockSession()
          navigate('/app/exam')
        }}
        onRetry={onRetry}
        retryLabel="Làm lại Listening"
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
      <ListeningExamResult
        exam={exam}
        answers={answers}
        unsure={unsure}
        onRetry={onRetry}
        onBack={() => navigate(listeningExamBackPath(exam))}
        onReviewWithPaper={() => {
          promoteHydratedExamForReview(examProp, exam)
          onReviewWithPaper?.()
        }}
      />
    </>
  )
}
