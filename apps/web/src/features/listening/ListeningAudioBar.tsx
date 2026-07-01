import { memo } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface Props {
  sentenceIndex: number
  total: number
  playing: boolean
  buffering: boolean
  progressPct: number
  timeLabel: string
  speed: number
  onIndexChange: (idx: number) => void
  onPlay: () => void
  onSeek: (pct: number) => void
  onToggleSpeed: () => void
}

/** Tách audio bar — tránh re-render BlankInputMode mỗi frame khi TTS chạy */
function ListeningAudioBar({
  sentenceIndex,
  total,
  playing,
  buffering,
  progressPct,
  timeLabel,
  speed,
  onIndexChange,
  onPlay,
  onSeek,
  onToggleSpeed,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={sentenceIndex === 0}
          onClick={() => onIndexChange(sentenceIndex - 1)}
          className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          <ChevronLeft size={18} />
        </button>
        <span
          className="text-sm font-semibold tabular-nums min-w-[3rem] text-center"
          style={{ color: 'var(--text-primary)' }}
        >
          {sentenceIndex + 1}/{total}
        </span>
        <button
          type="button"
          disabled={sentenceIndex >= total - 1}
          onClick={() => onIndexChange(sentenceIndex + 1)}
          className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex-1 flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onPlay}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-60"
          style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          aria-label={playing ? 'Đang phát' : 'Phát audio'}
        >
          <Play size={16} className="ml-0.5" />
        </button>
        <button
          type="button"
          className="relative flex-1 h-1.5 rounded-full overflow-hidden cursor-pointer"
          style={{ background: 'var(--bg-secondary)' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = ((e.clientX - rect.left) / rect.width) * 100
            onSeek(pct)
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: '100%',
              transform: `scaleX(${Math.max(0, Math.min(1, progressPct / 100))})`,
              transformOrigin: 'left center',
              background: 'var(--color-primary)',
              opacity: buffering ? 0.45 : 1,
              willChange: 'transform',
            }}
          />
        </button>
        <span className="text-xs tabular-nums shrink-0" style={{ color: 'var(--text-muted)' }}>
          {timeLabel}
        </span>
        <button
          type="button"
          onClick={onToggleSpeed}
          className="text-xs font-bold px-2 py-1 rounded-md shrink-0"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          {speed === 1 ? '1x' : '0.75x'}
        </button>
      </div>
    </div>
  )
}

export default memo(ListeningAudioBar)