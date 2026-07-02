import {
  formatListeningAnswer,
  getListeningExamQuestions,
  isListeningAnswerCorrect,
  type ListeningExam,
} from './listeningExamData'
import './listeningTest.css'

interface Props {
  exam: ListeningExam
  answers: Record<string, string>
  unsure: Record<string, boolean>
  onRetry: () => void
  onBack: () => void
}

export default function ListeningExamResult({
  exam,
  answers,
  unsure,
  onRetry,
  onBack,
}: Props) {
  const questions = getListeningExamQuestions(exam)
  const correctCount = questions.filter(q =>
    isListeningAnswerCorrect(q, answers[q.id] ?? ''),
  ).length
  const unsureCount = questions.filter(q => unsure[q.id]).length

  return (
    <div className="listening-exam-result">
      <div className="listening-exam-result__inner">
        <section
          className="listening-exam-result__hero"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
        >
          <div>
            <p className="listening-exam-result__kicker">Kết quả Listening</p>
            <h1 className="listening-exam-result__title">{exam.title}</h1>
            <p className="listening-exam-result__sub">
              Đã nộp bài. Xem đáp án và làm lại nếu cần.
            </p>
          </div>
          <div className="listening-exam-result__score-box">
            <p className="listening-exam-result__score-label">Tổng điểm</p>
            <p className="listening-exam-result__score-value">
              {correctCount}/{questions.length}
            </p>
            {unsureCount > 0 && (
              <p className="listening-exam-result__unsure-note">
                {unsureCount} câu đánh dấu chưa chắc chắn
              </p>
            )}
          </div>
        </section>

        <div className="listening-exam-result__list">
          {questions.map(question => {
            const userAnswer = answers[question.id] ?? ''
            const isCorrect = isListeningAnswerCorrect(question, userAnswer)
            const wasUnsure = unsure[question.id]

            return (
              <article
                key={question.id}
                className={`listening-exam-result__item${isCorrect ? ' is-correct' : ' is-wrong'}`}
              >
                <div className="listening-exam-result__item-head">
                  <span className="listening-exam-result__item-num">Câu {question.number}</span>
                  <span className={`listening-exam-result__badge${isCorrect ? ' is-ok' : ' is-bad'}`}>
                    {isCorrect ? 'Đúng' : 'Sai'}
                  </span>
                  {wasUnsure && (
                    <span className="listening-exam-result__unsure-badge">Chưa chắc chắn</span>
                  )}
                </div>
                <p className="listening-exam-result__prompt">{question.prompt}</p>
                <div className="listening-exam-result__answers">
                  <p>
                    <span className="listening-exam-result__ans-label">Bạn chọn: </span>
                    {formatListeningAnswer(question, userAnswer)}
                  </p>
                  {!isCorrect && (
                    <p>
                      <span className="listening-exam-result__ans-label">Đáp án: </span>
                      {formatListeningAnswer(question, question.answer)}
                    </p>
                  )}
                  <p className="listening-exam-result__explain">{question.explanation}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="listening-exam-result__actions">
          <button type="button" className="listening-exam-btn listening-exam-btn--ghost" onClick={onBack}>
            Về luyện thi
          </button>
          <button type="button" className="listening-exam-btn listening-exam-btn--primary" onClick={onRetry}>
            Làm lại
          </button>
        </div>
      </div>
    </div>
  )
}