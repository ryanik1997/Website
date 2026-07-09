import { useNavigate } from 'react-router-dom'
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

interface Props {
  exam: ReadingExam
  answers: Record<string, string>
  fullMockId: string | null
  onRetry: () => void
  /** Xem lại đề trên UI làm bài (đúng/sai) — không dùng full mock stage */
  onReviewWithPaper?: () => void
}

/** Màn hình sau Submit Reading — tách riêng, hooks parent luôn gọi đủ trước khi render. */
export default function ReadingSubmittedScreen({
  exam,
  answers,
  fullMockId,
  onRetry,
  onReviewWithPaper,
}: Props) {
  const navigate = useNavigate()
  const fullMock = fullMockId ? getFullMockTest(fullMockId) : null

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
    <ExamResult
      exam={exam}
      answers={answers}
      onRetry={onRetry}
      onBack={() => navigate(readingExamBackPath(exam))}
      onReviewWithPaper={onReviewWithPaper ?? (() => undefined)}
    />
  )
}