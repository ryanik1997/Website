import type { CSSProperties } from 'react'
import type { ReadingQuestion } from '../examData'
import { isReadingAnswerCorrect } from '../examData'
import {
  EXAM_REVIEW_COLORS,
  examReviewStatus,
  type ExamReviewStatus,
} from '../examReviewUtils'
import RwHighlightText from './RwHighlightText'

interface Props {
  partId: string
  question: ReadingQuestion
  answers: Record<string, string>
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
  formatOptionLabel?: (label: string) => string
  reviewMode?: boolean
  reviewStatus?: ExamReviewStatus | null
}

export default function RwMcRadioQuestion({
  partId,
  question,
  answers,
  onSelectQuestion,
  onAnswer,
  formatOptionLabel,
  reviewMode = false,
  reviewStatus = null,
}: Props) {
  const fmt = formatOptionLabel ?? ((label: string) => label)
  const userAns = answers[question.id] ?? ''
  const status = reviewMode
    ? (reviewStatus
      ?? examReviewStatus(userAns, a => isReadingAnswerCorrect(question, a)))
    : null
  const borderStyle: CSSProperties | undefined = status
    ? {
        borderLeft: `4px solid ${EXAM_REVIEW_COLORS[status].bg}`,
        paddingLeft: '0.55rem',
        marginBottom: '0.5rem',
      }
    : undefined

  return (
    <div
      className={`ket-rw-question${status ? ` is-review-${status}` : ''}`}
      id={`reading-q-${question.id}`}
      style={borderStyle}
    >
      {reviewMode && status && (
        <p
          className="ket-rw-review-tag"
          style={{
            margin: '0 0 0.4rem',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: EXAM_REVIEW_COLORS[status].bg,
          }}
        >
          {status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Bỏ qua'}
          {status !== 'correct' && question.answer
            ? ` · Đáp án: ${question.options.find(o => o.id.toLowerCase() === String(question.answer).toLowerCase())?.label ?? question.answer}`
            : ''}
        </p>
      )}
      <p className="ket-rw-q-prompt">
        <span className="ket-rw-q-num">{question.number}</span>
        <RwHighlightText
          blockId={`${partId}-q-${question.id}-prompt`}
          text={question.prompt}
        />
      </p>
      <div className="ket-rw-radio-list">
        {question.options.map(opt => {
          const selected = userAns.toLowerCase() === opt.id.toLowerCase()
          const isKey = reviewMode
            && opt.id.toLowerCase() === String(question.answer).toLowerCase().trim()
          const optStyle: CSSProperties | undefined = reviewMode
            ? isKey
              ? {
                  outline: `2px solid ${EXAM_REVIEW_COLORS.correct.bg}`,
                  background: 'color-mix(in srgb, #22c55e 16%, transparent)',
                  borderRadius: 8,
                  padding: '0.2rem 0.4rem',
                }
              : selected && status === 'wrong'
                ? {
                    outline: `2px solid ${EXAM_REVIEW_COLORS.wrong.bg}`,
                    background: 'color-mix(in srgb, #ef4444 12%, transparent)',
                    borderRadius: 8,
                    padding: '0.2rem 0.4rem',
                  }
                : undefined
            : undefined
          return (
            <label
              key={opt.id}
              className={`ket-rw-radio${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
              style={optStyle}
            >
              <input
                type="radio"
                name={question.id}
                checked={selected}
                disabled={reviewMode}
                data-highlight-skip
                onChange={() => {
                  if (reviewMode) return
                  onSelectQuestion(question.id)
                  onAnswer(question.id, opt.id)
                }}
              />
              <RwHighlightText
                blockId={`${partId}-q-${question.id}-opt-${opt.id}`}
                text={fmt(opt.label)}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
