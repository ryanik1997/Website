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
  /** null = unlimited */
  playsLeftLabel?: string | null
  playBlocked?: boolean
  onIndexChange: (idx: number) => void
  onPlay: () => void
  onSeek: (pct: number) => void
  onToggleSpeed: () => void
  onSetSpeed?: (rate: number) => void
  onPlayChunk?: () => void
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
  playsLeftLabel,
  playBlocked,
  onIndexChange,
  onPlay,
  onSeek,
  onToggleSpeed,
  onSetSpeed,
  onPlayChunk,
}: Props) {
  const speedLabel = speed === 0.5 ? '0.5x' : speed === 0.75 ? '0.75x' : '1x'

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
            disabled={playBlocked}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            aria-label={playing ? 'Đang phát' : playBlocked ? 'Hết lượt nghe' : 'Phát audio'}
            title={playBlocked ? 'Hết lượt nghe (nâng Pro để không giới hạn)' : undefined}
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
            title="Đổi tốc độ: 1x → 0.75x → 0.5x"
          >
            {speedLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onSetSpeed && (
          <>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Nghe chậm
            </span>
            {([0.5, 0.75, 1] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => onSetSpeed(r)}
                className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                style={{
                  borderColor: speed === r ? 'var(--color-primary)' : 'var(--border-color)',
                  color: speed === r ? 'var(--color-primary)' : 'var(--text-muted)',
                  background: speed === r
                    ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                    : 'transparent',
                }}
              >
                {r}x
              </button>
            ))}
          </>
        )}
        {onPlayChunk && (
          <button
            type="button"
            onClick={onPlayChunk}
            disabled={playBlocked}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border disabled:opacity-40"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              background: 'var(--bg-secondary)',
            }}
            title="Phát từng đoạn (chunk) — dễ bắt từ khó"
          >
            Nghe chunk
          </button>
        )}
        {playsLeftLabel && (
          <span
            className="ml-auto text-[11px] font-semibold tabular-nums"
            style={{ color: playBlocked ? '#ef4444' : 'var(--text-muted)' }}
          >
            {playsLeftLabel}
          </span>
        )}
      </div>
    </div>
  )
}

export default memo(ListeningAudioBar)