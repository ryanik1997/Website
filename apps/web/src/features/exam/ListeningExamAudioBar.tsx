import { Loader2, Pause, Play, Volume2 } from 'lucide-react'
import type { ExamAudioSource } from './useExamQuestionAudio'

interface Props {
  source: ExamAudioSource
  playing: boolean
  buffering: boolean
  progressPct: number
  timeLabel: string
  hasAudioFile: boolean
  allowSeek?: boolean
  playsLeft?: number | null
  playBlocked?: boolean
  playError?: string | null
  onPlayNormal: () => void
  speed?: number
  onToggleSpeed?: () => void
  onSeek: (pct: number) => void
  onStop: () => void
}

export default function ListeningExamAudioBar({
  source,
  playing,
  buffering,
  progressPct,
  timeLabel,
  hasAudioFile,
  allowSeek = true,
  playsLeft = null,
  playBlocked = false,
  playError = null,
  onPlayNormal,
  speed = 1,
  onToggleSpeed,
  onSeek,
  onStop,
}: Props) {
  const showTtsHint = !hasAudioFile && Boolean(source.ttsText)
  const disabled = buffering || playBlocked

  return (
    <div className="listening-exam-audio" data-highlight-skip>
      <div className="listening-exam-audio__row">
        <button
          type="button"
          className="listening-exam-audio__play-icon"
          onClick={playing ? onStop : onPlayNormal}
          disabled={disabled && !playing}
          aria-label={playing ? 'Tạm dừng' : 'Phát / tiếp tục'}
          title={playing ? 'Tạm dừng (giữ vị trí)' : 'Phát / tiếp tục từ vị trí hiện tại'}
        >
          {buffering ? (
            <Loader2 size={16} className="animate-spin" />
          ) : playing ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>

        {onToggleSpeed && (
          <button
            type="button"
            className="listening-exam-audio__speed"
            onClick={onToggleSpeed}
            aria-label="Tốc độ phát audio"
            title="Đổi tốc độ phát"
          >
            {speed}×
          </button>
        )}

        <Volume2 size={15} className="listening-exam-audio__volume" aria-hidden />

        <span className="listening-exam-audio__time">{timeLabel}</span>

        <button
          type="button"
          className="listening-exam-audio__track"
          disabled={!allowSeek}
          onPointerDown={e => {
            if (!allowSeek) return
            const track = e.currentTarget
            const seekFromEvent = (clientX: number) => {
              const rect = track.getBoundingClientRect()
              if (rect.width <= 0) return
              const pct = ((clientX - rect.left) / rect.width) * 100
              onSeek(Math.max(0, Math.min(100, pct)))
            }
            seekFromEvent(e.clientX)
            track.setPointerCapture(e.pointerId)
            const onMove = (ev: PointerEvent) => seekFromEvent(ev.clientX)
            const onUp = (ev: PointerEvent) => {
              track.releasePointerCapture(ev.pointerId)
              track.removeEventListener('pointermove', onMove)
              track.removeEventListener('pointerup', onUp)
              track.removeEventListener('pointercancel', onUp)
            }
            track.addEventListener('pointermove', onMove)
            track.addEventListener('pointerup', onUp)
            track.addEventListener('pointercancel', onUp)
          }}
          aria-label="Tiến độ audio — kéo để tua"
          title={allowSeek ? 'Kéo hoặc bấm để tua' : 'Chế độ thi — không tua'}
        >
          <span
            className="listening-exam-audio__fill"
            style={{ transform: `translateY(-50%) scaleX(${Math.max(0, Math.min(100, progressPct)) / 100})` }}
          />
        </button>
      </div>

      <div className="listening-exam-audio__actions">
        <button
          type="button"
          className="listening-exam-audio__btn listening-exam-audio__btn--primary"
          onClick={playing ? onStop : onPlayNormal}
          disabled={disabled && !playing}
        >
          {playing ? 'Tạm dừng' : 'Phát'}
        </button>
      </div>

      {playsLeft != null && (
        <p className="listening-exam-audio__hint">
          {playBlocked
            ? 'Đã hết lượt nghe cho phần này (chế độ thi).'
            : `Còn ${playsLeft} lượt nghe (chế độ thi)`}
        </p>
      )}

      {showTtsHint && playsLeft == null && (
        <p className="listening-exam-audio__hint">
          Chưa có MP3 — đang dùng giọng đọc tạm. Gắn file khi import.
        </p>
      )}

      {playError && (
        <p className="listening-exam-audio__hint listening-exam-audio__hint--error">
          {playError}
        </p>
      )}
    </div>
  )
}
