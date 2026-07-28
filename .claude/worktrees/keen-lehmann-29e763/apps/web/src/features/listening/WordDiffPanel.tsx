import { buildWordDiff } from './practiceUtils'

interface Props {
  input: string
  correct: string
}

export default function WordDiffPanel({ input, correct }: Props) {
  const items = buildWordDiff(input, correct)
  if (!correct) return null

  return (
    <div
      className="flex flex-wrap gap-1.5 p-3 rounded-xl mb-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
      {items.map((item, i) => {
        if (item.status === 'masked') {
          const dots = '●'.repeat(Math.max(2, Math.min(item.word.replace(/[^a-zA-Z0-9'-]/g, '').length, 9)))
          return (
            <span key={i} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {dots}{item.punct}
            </span>
          )
        }
        if (item.status === 'correct') {
          return (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-sm font-medium"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              {item.word}
            </span>
          )
        }
        const dots = '●'.repeat(Math.max(2, Math.min(item.word.replace(/[^a-zA-Z0-9'-]/g, '').length, 9)))
        return (
          <span
            key={i}
            className="px-2 py-0.5 rounded-md text-sm font-medium"
            title={item.word}
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
              color: 'var(--color-accent)',
            }}
          >
            {dots}{item.punct}
          </span>
        )
      })}
    </div>
  )
}