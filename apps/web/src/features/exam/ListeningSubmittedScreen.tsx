import { useNavigate } from 'react-router-dom'
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
import { isListeningAnswerCorrect } from './listeningExamData'

interface Props {
  exam: ListeningExam
  answers: Record<string, string>
  unsure: Record<string, boolean>
  allQuestions: ListeningQuestion[]
  fullMockId: string | null
  onRetry: () => void
}

/** Màn hình sau Submit — tách riêng để parent test shell không early-return trước hooks. */
export default function ListeningSubmittedScreen({
  exam,
  answers,
  unsure,
  allQuestions,
  fullMockId,
  onRetry,
}: Props) {
  const navigate = useNavigate()
  const fullMock = fullMockId ? getFullMockTest(fullMockId) : null

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
    <ListeningExamResult
      exam={exam}
      answers={answers}
      unsure={unsure}
      onRetry={onRetry}
      onBack={() => navigate(listeningExamBackPath(exam))}
    />
  )
}