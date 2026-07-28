import type { ReadingExam } from '../examData'
import { getPartQuestions } from '../examData'
import { examReviewPillStyle, type ExamReviewStatus } from '../examReviewUtils'

interface PetRwFooterProps {
  parts: ReadingExam['parts']
  activePartIndex: number
  activeQuestionId: string | null
  answers: Record<string, string>
  onSelectPart: (partIndex: number) => void
  onSelectQuestion: (questionId: string) => void
  onSubmit: () => void
  reviewMode?: boolean
  getQuestionReviewStatus?: (questionId: string) => ExamReviewStatus | null
}

export default function PetRwFooter({
  parts,
  activePartIndex,
  activeQuestionId,
  answers,
  onSelectPart,
  onSelectQuestion,
  onSubmit,
  reviewMode = false,
  getQuestionReviewStatus,
}: PetRwFooterProps) {
  const answeredInPart = (index: number) => {
    const questions = getPartQuestions(parts[index])
    return questions.filter(question => Boolean(answers[question.id]?.trim())).length
  }

  return (
    <footer className={`pet-rw-footer${reviewMode ? ' is-review' : ''}`}>
      <div className="pet-rw-footer__parts">
        {parts.map((part, index) => {
          const questions = getPartQuestions(part)
          const answered = answeredInPart(index)
          const isCurrent = index === activePartIndex

          return (
            <div
              key={part.id}
              className={`pet-rw-footer__part${isCurrent ? ' is-current' : ''}`}
            >
              {/* Part tab — navigate to another Part */}
              <button
                type="button"
                className="pet-rw-footer__part-tab"
                onClick={() => onSelectPart(index)}
              >
                <span className="pet-rw-footer__part-label">Part {part.partNumber}</span>
                {!isCurrent && (
                  <span className="pet-rw-footer__part-count">
                    {answered} of {questions.length}
                  </span>
                )}
              </button>

              {/* Question pills — only shown for current Part */}
              {isCurrent && (
                <nav
                  className="pet-rw-footer__pills"
                  aria-label={`Part ${part.partNumber} questions`}
                >
                  {questions.map(question => {
                    const isActive = activeQuestionId === question.id
                    const isAnswered = Boolean(answers[question.id]?.trim())
                    const reviewStatus = reviewMode
                      ? (getQuestionReviewStatus?.(question.id) ?? null)
                      : null

                    const reviewClass = reviewStatus === 'correct'
                      ? ' is-review-ok'
                      : reviewStatus === 'wrong'
                        ? ' is-review-bad'
                        : reviewStatus === 'skipped'
                          ? ' is-review-skip'
                          : ''

                    return (
                      <button
                        key={question.id}
                        type="button"
                        data-question-id={question.id}
                        aria-label={`Go to question ${question.number}`}
                        aria-current={isActive ? 'true' : undefined}
                        className={`pet-rw-footer__pill${isActive ? ' is-active' : ''}${!reviewStatus && isAnswered ? ' is-answered' : ''}${reviewClass}`}
                        style={examReviewPillStyle(reviewStatus, isActive)}
                        data-review={reviewStatus ?? undefined}
                        title={reviewStatus === 'correct' ? 'Dung' : reviewStatus === 'wrong' ? 'Sai' : reviewStatus === 'skipped' ? 'Bo qua' : undefined}
                        onClick={() => onSelectQuestion(question.id)}
                      >
                        {question.number}
                      </button>
                    )
                  })}
                </nav>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className="pet-rw-footer__submit"
        aria-label="Submit exam"
        onClick={onSubmit}
      >
        ✓
      </button>
    </footer>
  )
}
