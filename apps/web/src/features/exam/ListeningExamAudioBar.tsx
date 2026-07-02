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
  allowSlow?: boolean
  playsLeft?: number | null
  playBlocked?: boolean
  playError?: string | null
  onPlayNormal: () => void
  onPlaySlow: () => void
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
  allowSlow = true,
  playsLeft = null,
  playBlocked = false,
  playError = null,
  onPlayNormal,
  onPlaySlow,
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
          disabled={disabled}
          aria-label={playing ? 'Dừng' : 'Phát'}
        >
          {buffering ? (
            <Loader2 size={16} className="animate-spin" />
          ) : playing ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>

        <Volume2 size={15} className="listening-exam-audio__volume" aria-hidden />

        <span className="listening-exam-audio__time">{timeLabel}</span>

        <button
          type="button"
          className="listening-exam-audio__track"
          disabled={!allowSeek}
          onClick={e => {
            if (!allowSeek) return
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = ((e.clientX - rect.left) / rect.width) * 100
            onSeek(pct)
          }}
          aria-label="Tiến độ audio"
        >
          <span
            className="listening-exam-audio__fill"
            style={{ transform: `scaleX(${progressPct / 100})` }}
          />
        </button>
      </div>

      <div className="listening-exam-audio__actions">
        <button
          type="button"
          className="listening-exam-audio__btn listening-exam-audio__btn--primary"
          onClick={onPlayNormal}
          disabled={disabled}
        >
          Phát
        </button>
        {allowSlow && (
          <button
            type="button"
            className="listening-exam-audio__btn listening-exam-audio__btn--slow"
            onClick={onPlaySlow}
            disabled={disabled}
          >
            Phát chậm
          </button>
        )}
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