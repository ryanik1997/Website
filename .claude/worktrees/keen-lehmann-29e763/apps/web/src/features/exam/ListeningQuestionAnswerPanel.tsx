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
import type { ExamReviewStatus } from './examReviewUtils'
import { examReviewStatus } from './examReviewUtils'
import { isListeningAnswerCorrect } from './listeningExamData'
import {
  isListeningKeyOption,
  ListeningGapCorrectHint,
  ListeningOptionReviewMark,
  listeningOptionReviewStyle,
} from './listeningReviewUi'

interface Props {
  question: ListeningQuestion
  answer: string
  unsure: boolean
  onAnswer: (value: string) => void
  onUnsureChange: (value: boolean) => void
  reviewMode?: boolean
  reviewStatus?: ExamReviewStatus | null
  /** IELTS AI transcript — ưu tiên hơn question.ttsText */
  transcriptOverride?: string | null
}

export default function ListeningQuestionAnswerPanel({
  question,
  answer,
  unsure,
  onAnswer,
  onUnsureChange,
  reviewMode = false,
  reviewStatus = null,
  transcriptOverride,
}: Props) {
  const highlights = useExamHighlights()
  const isPictureMc = question.type === 'picture-mc'
  const isGapFill = question.type === 'gap-fill'
  const isMatching = question.type === 'matching'
  const isMc = !isGapFill && !isMatching && !isPictureMc
  const wordLimit = question.wordLimit ?? (isGapFill ? 3 : undefined)
  const status = reviewMode
    ? (reviewStatus
      ?? examReviewStatus(answer, a => isListeningAnswerCorrect(question, a)))
    : null
  const transcript = (transcriptOverride ?? question.ttsText ?? '').trim()

  return (
    <ExamHighlightZone className={`listening-exam-answer-pane${reviewMode ? ' is-review' : ''}`} id={listeningAnswerAnchorId(question.id)}>
      <header className="listening-exam-answer-pane__head">
        <h3 className="listening-exam-answer-pane__title">
          {reviewMode ? 'Đáp án · Xem lại' : 'Đáp án'}
        </h3>
        {!reviewMode && (
          <label className="listening-exam-card__unsure">
            <input
              type="checkbox"
              checked={unsure}
              data-highlight-skip
              onChange={e => onUnsureChange(e.target.checked)}
            />
            Chưa chắc chắn
          </label>
        )}
        {reviewMode && status && (
          <span
            className={`listening-review-tag is-${status}`}
            style={{ fontWeight: 800, fontSize: '0.8rem' }}
          >
            {status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Bỏ qua'}
          </span>
        )}
      </header>

      {reviewMode && transcript && (
        <div
          className="listening-review-transcript-block"
          style={{
            marginBottom: 12,
            padding: '0.65rem 0.8rem',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-secondary, #f8fafc))',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
          }}
        >
          <p
            style={{
              margin: '0 0 0.35rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
            }}
          >
            Transcript · Câu {question.number}
          </p>
          <p style={{ margin: 0 }}>{transcript}</p>
        </div>
      )}

      {isPictureMc && usesCompositePictureBoard(question) && (
        <ListeningPictureChoiceRow
          options={question.options}
          answer={answer}
          onAnswer={v => { if (!reviewMode) onAnswer(v) }}
        />
      )}

      {isPictureMc && usesSplitPictureOptions(question) && (
        <div className="listening-exam-card__pictures">
          {question.options.map(option => {
            const selected = answer === option.id
            const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
            return (
              <div key={option.id} style={{ position: 'relative' }}>
                <ListeningPictureOption
                  option={option}
                  selected={selected}
                  onSelect={() => { if (!reviewMode) onAnswer(option.id) }}
                />
                {reviewMode && (
                  <div style={{ position: 'absolute', top: 6, right: 6 }}>
                    <ListeningOptionReviewMark
                      isKey={isKey}
                      selectedWrong={Boolean(selected && status === 'wrong')}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {isPictureMc && !usesCompositePictureBoard(question) && !usesSplitPictureOptions(question) && (
        <ListeningPictureChoiceRow
          options={question.options}
          answer={answer}
          onAnswer={v => { if (!reviewMode) onAnswer(v) }}
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
            className="listening-exam-answer-pane__input listening-ielts-gap__input"
            value={answer}
            placeholder={wordLimit ? `Tối đa ${wordLimit} từ` : 'Nhập đáp án'}
            data-highlight-skip
            readOnly={reviewMode}
            onChange={e => onAnswer(e.target.value)}
          />
          <ListeningGapCorrectHint
            reviewMode={reviewMode}
            status={status}
            correctAnswer={question.answer}
          />
        </div>
      )}

      {isMatching && (
        <div className="listening-exam-card__matching">
          <p className="listening-exam-answer-pane__field-label">Chọn A–H</p>
          <div className="listening-ielts-match__pills">
            {question.options.map(option => {
              const selected = answer.toUpperCase() === option.id.toUpperCase()
              const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
              const selectedWrong = Boolean(reviewMode && selected && status === 'wrong')
              return (
                <div
                  key={option.id}
                  role="button"
                  tabIndex={reviewMode ? -1 : 0}
                  style={listeningOptionReviewStyle(reviewMode, selected, isKey, status)}
                  className={`listening-ielts-match__pill${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
                  onClick={() => { if (!reviewMode) onAnswer(option.id) }}
                  onKeyDown={e => {
                    if (reviewMode) return
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
                  <ListeningOptionReviewMark isKey={isKey} selectedWrong={selectedWrong} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isMc && (
        <div className="listening-exam-card__options">
          {question.options.map(option => {
            const selected = answer.toUpperCase() === option.id.toUpperCase()
            const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
            const selectedWrong = Boolean(reviewMode && selected && status === 'wrong')
            return (
              <label
                key={option.id}
                style={listeningOptionReviewStyle(reviewMode, selected, isKey, status)}
                className={`listening-exam-option${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  disabled={reviewMode}
                  data-highlight-skip
                  onChange={() => { if (!reviewMode) onAnswer(option.id) }}
                />
                <span className="listening-exam-option__letter" data-highlight-skip>{option.id}</span>
                <ReadingHighlightableText
                  blockId={`${question.id}-opt-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  className="listening-exam-option__label"
                  as="span"
                />
                <ListeningOptionReviewMark isKey={isKey} selectedWrong={selectedWrong} />
              </label>
            )
          })}
        </div>
      )}
    </ExamHighlightZone>
  )
}
