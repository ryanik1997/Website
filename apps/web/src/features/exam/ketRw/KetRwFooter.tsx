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
                <nav
                  className="ket-rw-footer-part__pills"
                  aria-label={`Part ${part.partNumber} questions`}
                >
                  {questions.map(q => {
                    const isActive = activeQuestionId === q.id
                    const isAnswered = Boolean(answers[q.id]?.trim())
                    const rev = reviewMode ? (getQuestionReviewStatus?.(q.id) ?? null) : null
                    const revClass = rev === 'correct'
                      ? ' is-review-ok'
                      : rev === 'wrong'
                        ? ' is-review-bad'
                        : rev === 'skipped'
                          ? ' is-review-skip'
                          : ''
                    return (
                      <button
                        key={q.id}
                        type="button"
                        data-question-id={q.id}
                        aria-label={`Go to question ${q.number}`}
                        aria-current={isActive ? 'true' : undefined}
                        className={`ket-rw-q-pill${isActive ? ' is-current' : ''}${!rev && isAnswered ? ' is-answered' : ''}${revClass}`}
                        style={examReviewPillStyle(rev, isActive)}
                        data-review={rev ?? undefined}
                        title={rev === 'correct' ? 'Đúng' : rev === 'wrong' ? 'Sai' : rev === 'skipped' ? 'Bỏ qua' : undefined}
                        onClick={() => onSelectQuestion(q.id)}
                      >
                        {q.number}
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
        className="ket-rw-footer__submit"
        aria-label="Submit exam"
        onClick={onSubmit}
      >
        ✔
      </button>
    </footer>
  )
}
