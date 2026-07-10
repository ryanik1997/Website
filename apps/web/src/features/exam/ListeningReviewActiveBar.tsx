import { Check, X } from 'lucide-react'
import type { ListeningQuestion } from './listeningExamData'
import { formatListeningAnswer } from './listeningExamData'
import {
  EXAM_REVIEW_COLORS,
  type ExamReviewStatus,
} from './examReviewUtils'
import { isListeningKeyOption } from './listeningReviewUi'

interface Props {
  question: ListeningQuestion | null
  userAnswer: string
  status: ExamReviewStatus | null
  /** Ưu tiên hơn question.ttsText (vd. IELTS AI transcript) */
  transcriptOverride?: string | null
}

/**
 * Thanh review luôn hiện (Listening) — không phụ thuộc từng PartView.
 * Câu sai/bỏ qua: luôn ghi rõ đáp án đúng + tích xanh.
 */
export default function ListeningReviewActiveBar({
  question,
  userAnswer,
  status,
  transcriptOverride,
}: Props) {
  if (!question || !status) return null

  const yourLabel = formatListeningAnswer(question, userAnswer)
  const keyLabel = formatListeningAnswer(question, question.answer)
  const c = EXAM_REVIEW_COLORS[status]
  const isMcLike = (question.options?.length ?? 0) > 0
    && (question.type === 'multiple-choice' || question.type === 'matching' || question.type === 'picture-mc')
  const transcript = (transcriptOverride ?? question.ttsText ?? '').trim()

  return (
    <div
      className="listening-review-active-bar"
      role="status"
      style={{
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem 0.85rem',
        padding: '0.65rem 1rem',
        borderBottom: `2px solid ${c.border}`,
        background: `color-mix(in srgb, ${c.bg} 14%, var(--bg-card, #fff))`,
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        fontWeight: 600,
        zIndex: 20,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          borderRadius: 999,
          padding: '0.2rem 0.65rem',
          background: c.bg,
          color: c.fg,
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {status === 'correct' ? <Check size={14} strokeWidth={3} /> : status === 'wrong' ? <X size={14} strokeWidth={3} /> : '−'}
        {status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Bỏ qua'}
      </span>

      <span style={{ fontWeight: 800 }}>Câu {question.number}</span>

      <span style={{ color: 'var(--text-muted)' }}>
        Bạn chọn:{' '}
        <strong style={{ color: status === 'correct' ? EXAM_REVIEW_COLORS.correct.bg : status === 'wrong' ? EXAM_REVIEW_COLORS.wrong.bg : 'var(--text-primary)' }}>
          {yourLabel}
        </strong>
      </span>

      {status !== 'correct' && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginLeft: 'auto',
            padding: '0.35rem 0.75rem',
            borderRadius: 999,
            background: EXAM_REVIEW_COLORS.correct.bg,
            color: '#fff',
            fontWeight: 800,
          }}
        >
          <Check size={16} strokeWidth={3} />
          Đáp án đúng: {keyLabel}
        </span>
      )}

      {isMcLike && status !== 'correct' && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 4,
          }}
        >
          {question.options.map(opt => {
            const isKey = isListeningKeyOption(opt.id, question.answer)
            const selected = userAnswer.trim().toUpperCase() === opt.id.toUpperCase()
            if (!isKey && !selected) return null
            return (
              <span
                key={opt.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.25rem 0.6rem',
                  borderRadius: 8,
                  border: `2px solid ${isKey ? EXAM_REVIEW_COLORS.correct.bg : EXAM_REVIEW_COLORS.wrong.bg}`,
                  background: isKey
                    ? 'color-mix(in srgb, #22c55e 12%, transparent)'
                    : 'color-mix(in srgb, #ef4444 10%, transparent)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                {isKey ? <Check size={14} strokeWidth={3} color={EXAM_REVIEW_COLORS.correct.bg} /> : <X size={14} strokeWidth={3} color={EXAM_REVIEW_COLORS.wrong.bg} />}
                <strong>{opt.id.toUpperCase()}.</strong> {opt.label}
                {isKey ? ' (đúng)' : ' (bạn chọn)'}
              </span>
            )
          })}
        </div>
      )}

      {transcript && (
        <div
          className="listening-review-transcript"
          style={{
            width: '100%',
            marginTop: 6,
            padding: '0.55rem 0.75rem',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-secondary, #f8fafc))',
            fontSize: '0.84rem',
            fontWeight: 500,
            lineHeight: 1.45,
            color: 'var(--text-primary)',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              marginBottom: 4,
            }}
          >
            Transcript
          </span>
          {transcript}
        </div>
      )}
    </div>
  )
}
