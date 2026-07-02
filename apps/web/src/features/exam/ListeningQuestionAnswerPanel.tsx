import ListeningPictureChoiceRow from './ListeningPictureChoiceRow'
import ListeningPictureOption from './ListeningPictureOption'
import ExamHighlightZone from './ExamHighlightZone'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import {
  usesCompositePictureBoard,
  usesSplitPictureOptions,
} from './listeningPictureMc'
import { listeningAnswerAnchorId } from './listeningScrollUtils'
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
  const highlights = useExamHighlights()
  const isPictureMc = question.type === 'picture-mc'
  const isGapFill = question.type === 'gap-fill'
  const isMatching = question.type === 'matching'
  const isMc = !isGapFill && !isMatching && !isPictureMc
  const wordLimit = question.wordLimit ?? (isGapFill ? 3 : undefined)

  return (
    <ExamHighlightZone className="listening-exam-answer-pane" id={listeningAnswerAnchorId(question.id)}>
      <header className="listening-exam-answer-pane__head">
        <h3 className="listening-exam-answer-pane__title">Đáp án</h3>
        <label className="listening-exam-card__unsure">
          <input
            type="checkbox"
            checked={unsure}
            data-highlight-skip
            onChange={e => onUnsureChange(e.target.checked)}
          />
          Chưa chắc chắn
        </label>
      </header>

      {isPictureMc && usesCompositePictureBoard(question) && (
        <ListeningPictureChoiceRow
          options={question.options}
          answer={answer}
          onAnswer={onAnswer}
        />
      )}

      {isPictureMc && usesSplitPictureOptions(question) && (
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

      {isPictureMc && !usesCompositePictureBoard(question) && !usesSplitPictureOptions(question) && (
        <ListeningPictureChoiceRow
          options={question.options}
          answer={answer}
          onAnswer={onAnswer}
          showLabels
        />
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
            data-highlight-skip
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
                <div
                  key={option.id}
                  role="button"
                  tabIndex={0}
                  className={`listening-ielts-match__pill${selected ? ' is-selected' : ''}`}
                  onClick={() => onAnswer(option.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onAnswer(option.id)
                    }
                  }}
                >
                  {option.id}.{' '}
                  <ReadingHighlightableText
                    blockId={`${question.id}-match-${option.id}`}
                    text={option.label}
                    highlights={highlights}
                    as="span"
                  />
                </div>
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
                  data-highlight-skip
                  onChange={() => onAnswer(option.id)}
                />
                <span className="listening-exam-option__letter" data-highlight-skip>{option.id}</span>
                <ReadingHighlightableText
                  blockId={`${question.id}-opt-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  className="listening-exam-option__label"
                  as="span"
                />
              </label>
            )
          })}
        </div>
      )}
    </ExamHighlightZone>
  )
}