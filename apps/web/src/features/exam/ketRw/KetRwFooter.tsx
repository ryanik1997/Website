import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReadingExam } from '../examData'
import { getPartQuestions } from '../examData'

interface Props {
  exam: ReadingExam
  partIndex: number
  activeQuestionId: string | null
  answers: Record<string, string>
  allQuestions: Array<{ id: string; number: number }>
  onGoToPart: (index: number) => void
  onSelectQuestion: (id: string) => void
  onAdjacentQuestion: (delta: number) => void
  onExit: () => void
}

export default function KetRwFooter({
  exam,
  partIndex,
  activeQuestionId,
  answers,
  allQuestions,
  onGoToPart,
  onSelectQuestion,
  onAdjacentQuestion,
  onExit,
}: Props) {
  const activeIndex = activeQuestionId
    ? allQuestions.findIndex(q => q.id === activeQuestionId)
    : -1

  const answeredInPart = (index: number) => {
    const qs = getPartQuestions(exam.parts[index])
    return qs.filter(q => Boolean(answers[q.id]?.trim())).length
  }

  return (
    <footer className="ket-rw-footer">
      <div className="ket-rw-footer__parts">
        {exam.parts.map((part, index) => {
          const questions = getPartQuestions(part)
          const answered = answeredInPart(index)
          const isCurrent = index === partIndex
          return (
            <div
              key={part.id}
              className={`ket-rw-footer-part${isCurrent ? ' is-current' : ''}`}
            >
              <button
                type="button"
                className="ket-rw-footer-part__tab"
                onClick={() => onGoToPart(index)}
              >
                <span className="ket-rw-footer-part__label">Part {part.partNumber}</span>
                {!isCurrent && (
                  <span className="ket-rw-footer-part__count">
                    {answered} of {questions.length}
                  </span>
                )}
              </button>
              {isCurrent && (
                <div className="ket-rw-footer-part__pills">
                  {questions.map(q => {
                    const isActive = activeQuestionId === q.id
                    const isAnswered = Boolean(answers[q.id]?.trim())
                    return (
                      <button
                        key={q.id}
                        type="button"
                        className={`ket-rw-q-pill${isActive ? ' is-current' : ''}${isAnswered ? ' is-answered' : ''}`}
                        onClick={() => onSelectQuestion(q.id)}
                      >
                        {q.number}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="ket-rw-footer__controls">
        <button
          type="button"
          className="ket-rw-exit-btn"
          onClick={onExit}
        >
          Exit
        </button>
        <button
          type="button"
          className="ket-rw-nav-btn"
          disabled={activeIndex <= 0}
          onClick={() => onAdjacentQuestion(-1)}
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="ket-rw-nav-btn is-next"
          disabled={activeIndex >= allQuestions.length - 1}
          onClick={() => onAdjacentQuestion(1)}
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </footer>
  )
}