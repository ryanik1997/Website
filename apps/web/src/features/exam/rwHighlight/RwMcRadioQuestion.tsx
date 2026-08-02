import { useRef, type CSSProperties } from 'react'
import { Bookmark } from 'lucide-react'
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
  /** Cambridge: câu đang chọn có khung số xanh */
  isActive?: boolean
  /** Cambridge: nút bookmark góc phải câu đang chọn */
  showFlag?: boolean
  flagged?: boolean
  onToggleFlag?: () => void
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
  isActive = false,
  showFlag = false,
  flagged = false,
  onToggleFlag,
}: Props) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const textSelectionGestureRef = useRef(false)
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
      className={`ket-rw-question${status ? ` is-review-${status}` : ''}${isActive ? ' is-active' : ''}`}
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
        <span className="ket-rw-q-num" data-question-number-badge="true">{question.number}</span>
        <RwHighlightText
          blockId={`${partId}-q-${question.id}-prompt`}
          text={question.prompt}
        />
        {showFlag && (
          <button
            type="button"
            className={`ket-rw-q-flag${flagged ? ' is-flagged' : ''}`}
            data-highlight-skip
            aria-pressed={flagged}
            aria-label={`Bookmark question ${question.number}`}
            title="Bookmark"
            onClick={() => onToggleFlag?.()}
          >
            <Bookmark size={16} strokeWidth={1.5} fill={flagged ? 'currentColor' : 'none'} />
          </button>
        )}
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
              onPointerDownCapture={event => {
                pointerStartRef.current = {
                  x: event.clientX,
                  y: event.clientY,
                }
                textSelectionGestureRef.current = false
              }}
              onPointerUpCapture={event => {
                const start = pointerStartRef.current
                if (!start) return
                const distance = Math.hypot(
                  event.clientX - start.x,
                  event.clientY - start.y,
                )
                const selectedText = window.getSelection()?.toString().trim()
                if (distance > 3 && selectedText) {
                  textSelectionGestureRef.current = true
                }
              }}
              onClickCapture={event => {
                if (!textSelectionGestureRef.current) {
                  return
                }
                event.preventDefault()
                event.stopPropagation()
                textSelectionGestureRef.current = false
              }}
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
