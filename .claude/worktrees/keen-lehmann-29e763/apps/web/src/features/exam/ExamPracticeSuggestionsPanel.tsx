import { Link } from 'react-router-dom'
import { ArrowRight, Languages, GitBranch, Blocks } from 'lucide-react'
import { cefrBadgeStyle } from '../../lib/cefr'
import { buildExamPracticeSuggestions } from './examPracticeSuggestLogic'

const ICONS = {
  translation: Languages,
  structure: Blocks,
  mindmap: GitBranch,
} as const

export default function ExamPracticeSuggestions({
  framework,
  correct,
  total,
  band,
  skillLabel,
}: {
  framework: 'ielts' | 'cambridge' | 'other'
  correct: number
  total: number
  band?: number
  skillLabel?: string
}) {
  const s = buildExamPracticeSuggestions({ framework, correct, total, band, skillLabel })
  const badge = cefrBadgeStyle(s.cefr)

  return (
    <section
      className="exam-practice-result__suggest"
      aria-label="Gợi ý ôn sau bài thi"
      style={{
        marginTop: 20,
        padding: '16px 18px',
        borderRadius: 16,
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
          Gợi ý ôn tiếp
        </h3>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 999,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {s.cefr}
        </span>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>
        {s.summary}
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {s.items.map(item => {
          const Icon = ICONS[item.id as keyof typeof ICONS] ?? Languages
          return (
            <li key={item.id}>
              <Link
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.description}
                  </span>
                </span>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
