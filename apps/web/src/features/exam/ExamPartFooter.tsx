import { ChevronLeft, ChevronRight } from 'lucide-react'
import './readingTest.css'

export interface ExamPartFooterPart {
  id: string
  partNumber: number
}

interface Props {
  parts: ExamPartFooterPart[]
  getPartQuestions: (partIndex: number) => Array<{ id: string; number: number }>
  partIndex: number
  activeQuestionId: string | null
  answers: Record<string, string>
  allQuestions: Array<{ id: string }>
  answeredInPart: (index: number) => number
  onGoToPart: (index: number) => void
  onSelectQuestion: (questionId: string) => void
  onAdjacentQuestion: (delta: number) => void
  onSubmit: () => void
  submitLabel?: string
}

export default function ExamPartFooter({
  parts,
  getPartQuestions,
  partIndex,
  activeQuestionId,
  answers,
  allQuestions,
  answeredInPart,
  onGoToPart,
  onSelectQuestion,
  onAdjacentQuestion,
  onSubmit,
  submitLabel = 'Submit Test',
}: Props) {
  const activeIndex = activeQuestionId
    ? allQuestions.findIndex(q => q.id === activeQuestionId)
    : -1

  return (
    <footer className="reading-test-footer">
      <div className="reading-test-footer__parts">
        {parts.map((part, index) => {
          const questions = getPartQuestions(index)
          const answered = answeredInPart(index)
          const isCurrent = index === partIndex
          return (
            <div
              key={part.id}
              className={`reading-test-footer-part${isCurrent ? ' is-current' : ''}`}
            >
              <button
                type="button"
                className="reading-test-footer-part__tab"
                onClick={() => onGoToPart(index)}
              >
                <span className="reading-test-footer-part__label">Part {part.partNumber}</span>
                {!isCurrent && (
                  <span className="reading-test-footer-part__count">
                    {answered} of {questions.length}
                  </span>
                )}
              </button>
              {isCurrent && questions.map(question => {
                const isActive = activeQuestionId === question.id
                const isAnswered = Boolean(answers[question.id])
                return (
                  <button
                    key={question.id}
                    type="button"
                    className={`reading-test-q-pill${isActive ? ' is-current' : ''}${isAnswered ? ' is-answered' : ''}`}
                    onClick={() => onSelectQuestion(question.id)}
                  >
                    {question.number}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="reading-test-footer__nav">
        <button
          type="button"
          className="reading-test-nav-btn"
          disabled={activeIndex <= 0}
          onClick={() => onAdjacentQuestion(-1)}
          aria-label="Câu trước"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className="reading-test-nav-btn"
          disabled={activeIndex >= allQuestions.length - 1}
          onClick={() => onAdjacentQuestion(1)}
          aria-label="Câu tiếp"
        >
          <ChevronRight size={16} />
        </button>
        <button type="button" className="reading-test-submit" onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>
    </footer>
  )
}