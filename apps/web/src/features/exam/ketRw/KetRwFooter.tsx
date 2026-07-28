import type { ReadingExam } from '../examData'
import { getPartQuestions } from '../examData'
import { examReviewPillStyle, type ExamReviewStatus } from '../examReviewUtils'

interface Props {
  exam: ReadingExam
  partIndex: number
  activeQuestionId: string | null
  answers: Record<string, string>
  onGoToPart: (index: number) => void
  onSelectQuestion: (id: string) => void
  onSubmit: () => void
  reviewMode?: boolean
  getQuestionReviewStatus?: (questionId: string) => ExamReviewStatus | null
}

export default function KetRwFooter({
  exam,
  partIndex,
  activeQuestionId,
  answers,
  onGoToPart,
  onSelectQuestion,
  onSubmit,
  reviewMode = false,
  getQuestionReviewStatus,
}: Props) {
  const answeredInPart = (index: number) => {
    const qs = getPartQuestions(exam.parts[index])
    return qs.filter(q => Boolean(answers[q.id]?.trim())).length
  }

  return (
    <footer className={`ket-rw-footer${reviewMode ? ' is-review' : ''}`}>
      <div className="ket-rw-footer__parts">
        {exam.parts.map((part, index) => {
          const questions = getPartQuestions(part)
          const answered = answeredInPart(index)
          const isCurrent = index === partIndex

          return (
            <section
              key={part.id}
              className={`ket-rw-footer__part${isCurrent ? ' is-current' : ''}`}
            >
              <button
                type="button"
                className="ket-rw-footer__part-tab"
                onClick={() => onGoToPart(index)}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <span className="ket-rw-footer__part-label">
                  Part {part.partNumber}
                </span>

                {!isCurrent && (
                  <span className="ket-rw-footer__part-count">
                    {answered} of {questions.length}
                  </span>
                )}
              </button>

              {isCurrent && (
                <nav
                  className="ket-rw-footer__pills"
                  aria-label={`Part ${part.partNumber} questions`}
                >
                  {questions.map(q => {
                    const isActive = activeQuestionId === q.id
                    const isAnswered = Boolean(answers[q.id]?.trim())
                    const reviewStatus = reviewMode
                      ? (getQuestionReviewStatus?.(q.id) ?? null)
                      : null

                    const reviewClass =
                      reviewStatus === 'correct'
                        ? ' is-review-ok'
                        : reviewStatus === 'wrong'
                          ? ' is-review-bad'
                          : reviewStatus === 'skipped'
                            ? ' is-review-skip'
                            : ''

                    return (
                      <button
                        key={q.id}
                        type="button"
                        data-question-id={q.id}
                        aria-label={`Go to question ${q.number}`}
                        aria-current={isActive ? 'true' : undefined}
                        className={[
                          'ket-rw-footer__pill',
                          isActive ? 'is-active' : '',
                          !reviewStatus && isAnswered ? 'is-answered' : '',
                          reviewClass,
                        ].filter(Boolean).join(' ')}
                        style={examReviewPillStyle(reviewStatus, isActive)}
                        data-review={reviewStatus ?? undefined}
                        onClick={() => onSelectQuestion(q.id)}
                      >
                        {q.number}
                      </button>
                    )
                  })}
                </nav>
              )}
            </section>
          )
        })}
      </div>

      <button
        type="button"
        className="ket-rw-footer__submit"
        aria-label="Submit exam"
        onClick={onSubmit}
      >
        ✓
      </button>
    </footer>
  )
}
