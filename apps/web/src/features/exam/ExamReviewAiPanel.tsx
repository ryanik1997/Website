import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react'
import { extractAiSectionForQuestion } from './examAiAnalysisStorage'

interface Props {
  aiText: string
  /** Số câu đang xem — ưu tiên hiện đoạn AI của câu đó */
  activeQuestionNumber?: number | null
  onClose?: () => void
}

/** Panel AI khi đang “Xem cùng đề bài” — style giống bài giải chi tiết (theme card). */
export default function ExamReviewAiPanel({
  aiText,
  activeQuestionNumber,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState(true)
  const [showFull, setShowFull] = useState(false)

  const section = useMemo(() => {
    if (activeQuestionNumber == null) return null
    return extractAiSectionForQuestion(aiText, activeQuestionNumber)
  }, [activeQuestionNumber, aiText])

  const displayText = showFull || !section ? aiText : section

  if (!aiText.trim()) return null

  return (
    <div
      className="exam-review-ai-panel"
      style={{
        flexShrink: 0,
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        zIndex: 25,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.55rem 0.85rem',
          borderBottom: expanded ? '1px solid var(--border-color)' : 'none',
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          AI phân tích
          {activeQuestionNumber != null && section
            ? ` · Câu ${activeQuestionNumber}`
            : ' · toàn bài'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {section && (
            <button
              type="button"
              onClick={() => setShowFull(v => !v)}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 999,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                cursor: 'pointer',
              }}
            >
              {showFull ? 'Chỉ câu này' : 'Toàn bộ AI'}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Ẩn AI"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'inline-flex',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div
          style={{
            maxHeight: 'min(28vh, 220px)',
            overflowY: 'auto',
            padding: '0.65rem 1rem 0.85rem',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
        >
          {displayText.split('\n').map((line, i) => {
            const t = line.trim()
            if (!t) return <br key={i} />
            if (t.startsWith('### ')) {
              return (
                <h4 key={i} style={{ margin: '0.65rem 0 0.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {t.slice(4)}
                </h4>
              )
            }
            if (t.startsWith('## ')) {
              return (
                <h3 key={i} style={{ margin: '0.75rem 0 0.3rem', fontWeight: 800, fontSize: '1rem' }}>
                  {t.slice(3)}
                </h3>
              )
            }
            if (t.startsWith('- ') || t.startsWith('* ')) {
              const body = t.slice(2)
              const isEvidence = /\*\*(?:Đoạn trong đề|Bằng chứng|Evidence)\*\*/i.test(body)
              return (
                <p
                  key={i}
                  style={{
                    margin: '0.2rem 0 0.2rem 0.5rem',
                    paddingLeft: '0.5rem',
                    borderLeft: isEvidence
                      ? '3px solid #ff9800'
                      : '3px solid color-mix(in srgb, var(--color-primary) 40%, var(--border-color))',
                    background: isEvidence
                      ? 'color-mix(in srgb, #ff9800 12%, transparent)'
                      : undefined,
                    borderRadius: isEvidence ? 4 : undefined,
                  }}
                >
                  {body}
                </p>
              )
            }
            return (
              <p key={i} style={{ margin: '0.3rem 0' }}>
                {line}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}
