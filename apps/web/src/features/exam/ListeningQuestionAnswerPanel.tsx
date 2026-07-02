import ListeningPictureOption from './ListeningPictureOption'
import type { ListeningQuestion } from './listeningExamData'

interface Props {
  question: ListeningQuestion
  answer: string
  unsure: boolean
  onAnswer: (value: string) => void
  onUnsureChange: (value: boolean) => void
}

export default function ListeningQuestionAnswerPanel({
  question,
  answer,
  unsure,
  onAnswer,
  onUnsureChange,
}: Props) {
  const isPictureMc = question.type === 'picture-mc'
  const isGapFill = question.type === 'gap-fill'
  const isMatching = question.type === 'matching'
  const isMc = !isGapFill && !isMatching
  const wordLimit = question.wordLimit ?? (isGapFill ? 3 : undefined)

  return (
    <div className="listening-exam-answer-pane">
      <header className="listening-exam-answer-pane__head">
        <h3 className="listening-exam-answer-pane__title">Đáp án</h3>
        <label className="listening-exam-card__unsure">
          <input
            type="checkbox"
            checked={unsure}
            onChange={e => onUnsureChange(e.target.checked)}
          />
          Chưa chắc chắn
        </label>
      </header>

      {isPictureMc && (
        <div className="listening-exam-card__pictures">
          {question.options.map(option => (
            <ListeningPictureOption
              key={option.id}
              option={option}
              selected={answer === option.id}
              onSelect={() => onAnswer(option.id)}
            />
          ))}
        </div>
      )}

      {isGapFill && (
        <div className="listening-exam-card__gap">
          <label className="listening-exam-answer-pane__field-label" htmlFor={`answer-${question.id}`}>
            Câu {question.number}
          </label>
          <input
            id={`answer-${question.id}`}
            type="text"
            className="listening-ielts-gap__input listening-exam-answer-pane__input"
            value={answer}
            placeholder={wordLimit ? `Tối đa ${wordLimit} từ` : 'Nhập đáp án'}
            onChange={e => onAnswer(e.target.value)}
          />
        </div>
      )}

      {isMatching && (
        <div className="listening-exam-card__matching">
          <p className="listening-exam-answer-pane__field-label">Chọn A–H</p>
          <div className="listening-ielts-match__pills">
            {question.options.map(option => {
              const selected = answer === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`listening-ielts-match__pill${selected ? ' is-selected' : ''}`}
                  onClick={() => onAnswer(option.id)}
                >
                  {option.id}. {option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isMc && (
        <div className="listening-exam-card__options">
          {question.options.map(option => {
            const selected = answer === option.id
            return (
              <label
                key={option.id}
                className={`listening-exam-option${selected ? ' is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  onChange={() => onAnswer(option.id)}
                />
                <span className="listening-exam-option__letter">{option.id}</span>
                <span className="listening-exam-option__label">{option.label}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}