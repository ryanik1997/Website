import { useEffect, useState } from 'react'
import { buildWordDiff } from './practiceUtils'

interface Props {
  input: string
  correct: string
}

function maskDots(word: string): string {
  const clean = word.replace(/[^a-zA-Z0-9'-]/g, '')
  return '●'.repeat(Math.max(2, Math.min(clean.length, 9)))
}

export default function WordDiffPanel({ input, correct }: Props) {
  const items = buildWordDiff(input, correct)
  const [open, setOpen] = useState<Set<number>>(() => new Set())

  // Reset peeks when the target sentence changes
  useEffect(() => {
    setOpen(new Set())
  }, [correct])

  if (!correct) return null

  function toggle(i: number) {
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 p-3 rounded-xl mb-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
      {items.map((item, i) => {
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

        const revealed = open.has(i)
        const isWrong = item.status === 'wrong'
        const accent = isWrong ? 'var(--color-accent)' : 'var(--text-muted)'
        const bg = isWrong
          ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
          : 'var(--bg-card)'

        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            title={revealed ? 'Bấm để ẩn đáp án' : 'Bấm để xem đáp án'}
            className="px-2 py-0.5 rounded-md text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
            style={{
              background: bg,
              color: accent,
              border: revealed ? `1px solid ${accent}` : '1px solid transparent',
            }}
          >
            {revealed ? item.word : `${maskDots(item.word)}${item.punct}`}
          </button>
        )
      })}
    </div>
  )
}
