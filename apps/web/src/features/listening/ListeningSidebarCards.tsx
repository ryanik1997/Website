import { useEffect, useState } from 'react'
import { Headphones } from 'lucide-react'
import CopyButton from '../../components/CopyButton'
import type { LessonSentence } from './types'
import { speak } from './tts'

interface Props {
  sentence: LessonSentence | null
  showTranslation: boolean
  pronunciationRevealed: boolean
}

function maskDots(clean: string): string {
  return '●'.repeat(Math.max(2, Math.min(clean.length || 2, 7)))
}

export default function ListeningSidebarCards({
  sentence,
  showTranslation,
  pronunciationRevealed,
}: Props) {
  const words = sentence?.text.trim().split(/\s+/) ?? []
  const [peeked, setPeeked] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    setPeeked(new Set())
  }, [sentence?.id, sentence?.text])

  function togglePeek(i: number) {
    setPeeked(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="listening-bao-card rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
            • Dịch nghĩa
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 20%, var(--bg-secondary))',
              color: 'var(--color-accent)',
            }}
          >
            Vietnamese
          </span>
          {sentence && showTranslation && sentence.vi && (
            <CopyButton text={sentence.vi} title="Copy bản dịch" className="ml-auto" />
          )}
        </div>
        {sentence && showTranslation && sentence.vi ? (
          <p className="text-sm leading-relaxed select-text" style={{ color: 'var(--text-primary)' }}>{sentence.vi}</p>
        ) : (
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Hoàn thành câu để xem bản dịch...
          </p>
        )}
      </div>

      <div
        className="listening-bao-card rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Headphones size={16} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Luyện phát âm
          </span>
          {sentence && pronunciationRevealed && (
            <CopyButton text={sentence.text} title="Copy câu" className="ml-auto" />
          )}
        </div>
        <p className="text-xs mb-4 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {pronunciationRevealed
            ? 'Click vào từ để nghe đọc'
            : 'Bấm ●●● để mở chip từ · bấm lại để ẩn'}
        </p>
        {words.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {words.map((word, i) => {
              const clean = word.replace(/[^a-zA-Z0-9'-]/g, '')
              const punct = word.slice(clean.length)

              if (pronunciationRevealed) {
                return (
                  <button
                    key={`${word}-${i}`}
                    type="button"
                    onClick={() => void speak(clean, 0.82)}
                    className="px-2.5 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {word}
                  </button>
                )
              }

              const open = peeked.has(i)
              return (
                <button
                  key={`${word}-${i}`}
                  type="button"
                  onClick={() => togglePeek(i)}
                  title={open ? 'Bấm để ẩn' : 'Bấm để xem từ'}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                  style={{
                    background: open
                      ? 'color-mix(in srgb, var(--color-primary) 12%, var(--bg-secondary))'
                      : 'var(--bg-secondary)',
                    color: open ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: open
                      ? '1px solid color-mix(in srgb, var(--color-primary) 40%, var(--border-color))'
                      : '1px solid var(--border-color)',
                  }}
                >
                  {open ? word : `${maskDots(clean)}${punct}`}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 opacity-40">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="w-8 h-8 rounded-full"
                style={{ background: 'var(--bg-secondary)' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
