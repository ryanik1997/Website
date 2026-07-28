import type { CSSProperties, ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { EXAM_REVIEW_COLORS, type ExamReviewStatus } from './examReviewUtils'

/** So khớp option id với đáp án (chữ hoa/thường, A/B/C). */
export function isListeningKeyOption(optionId: string, answer: string): boolean {
  const o = String(optionId ?? '').trim().toUpperCase()
  const a = String(answer ?? '').trim().toUpperCase()
  if (!o || !a) return false
  if (o === a) return true
  // answer có thể là "A" hoặc "a" hoặc "A|B"
  if (a.includes('|') || a.includes('/')) {
    return a.split(/[/|]/).map(s => s.trim().toUpperCase()).includes(o)
  }
  return false
}

export function listeningOptionReviewStyle(
  reviewMode: boolean,
  selected: boolean,
  isKey: boolean,
  status: ExamReviewStatus | null | undefined,
): CSSProperties | undefined {
  if (!reviewMode) return undefined
  if (isKey) {
    return {
      outline: `2px solid ${EXAM_REVIEW_COLORS.correct.bg}`,
      background: 'color-mix(in srgb, #22c55e 16%, var(--bg-card, #fff))',
      borderRadius: 8,
    }
  }
  if (selected && status === 'wrong') {
    return {
      outline: `2px solid ${EXAM_REVIEW_COLORS.wrong.bg}`,
      background: 'color-mix(in srgb, #ef4444 12%, var(--bg-card, #fff))',
      borderRadius: 8,
    }
  }
  return undefined
}

/** Tích xanh / dấu X trên option khi review. */
export function ListeningOptionReviewMark({
  isKey,
  selectedWrong,
}: {
  isKey: boolean
  selectedWrong: boolean
}): ReactNode {
  if (isKey) {
    return (
      <span
        className="listening-review-mark listening-review-mark--ok"
        title="Đáp án đúng"
        aria-label="Đáp án đúng"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 999,
          background: EXAM_REVIEW_COLORS.correct.bg,
          color: '#fff',
          flexShrink: 0,
          marginLeft: 6,
        }}
      >
        <Check size={13} strokeWidth={3} />
      </span>
    )
  }
  if (selectedWrong) {
    return (
      <span
        className="listening-review-mark listening-review-mark--bad"
        title="Bạn chọn sai"
        aria-label="Bạn chọn sai"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: 999,
          background: EXAM_REVIEW_COLORS.wrong.bg,
          color: '#fff',
          flexShrink: 0,
          marginLeft: 6,
        }}
      >
        <X size={12} strokeWidth={3} />
      </span>
    )
  }
  return null
}

/** Gợi ý đáp án đúng cho gap-fill. */
export function ListeningGapCorrectHint({
  reviewMode,
  status,
  correctAnswer,
}: {
  reviewMode: boolean
  status: ExamReviewStatus | null | undefined
  correctAnswer: string
}): ReactNode {
  if (!reviewMode || !correctAnswer) return null
  if (status === 'correct') return null
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        fontSize: '0.82rem',
        fontWeight: 700,
        color: EXAM_REVIEW_COLORS.correct.bg,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          width: 18,
          height: 18,
          borderRadius: 999,
          background: EXAM_REVIEW_COLORS.correct.bg,
          color: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      Đáp án đúng: {correctAnswer}
    </span>
  )
}
