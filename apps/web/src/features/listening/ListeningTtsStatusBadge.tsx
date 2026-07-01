import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, PlayCircle, Volume2, VolumeX, XCircle } from 'lucide-react'
import {
  checkTtsHealth,
  getKokoroStatusSnapshot,
  startKokoroServer,
  subscribeKokoroStatus,
  type KokoroStatusSnapshot,
} from './tts'

interface Props {
  compact?: boolean
  showStartButton?: boolean
}

type ToastState = { type: 'success' | 'error' | 'info'; message: string } | null

function toneStyles(type: NonNullable<ToastState>['type']) {
  if (type === 'success') {
    return {
      background: 'color-mix(in srgb, #22c55e 14%, var(--bg-card))',
      color: '#166534',
      border: '1px solid color-mix(in srgb, #22c55e 28%, var(--border-color))',
    }
  }
  if (type === 'error') {
    return {
      background: 'color-mix(in srgb, #ef4444 12%, var(--bg-card))',
      color: '#b91c1c',
      border: '1px solid color-mix(in srgb, #ef4444 22%, var(--border-color))',
    }
  }
  return {
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
  }
}

export default function ListeningTtsStatusBadge({ compact = false, showStartButton = true }: Props) {
  const [snapshot, setSnapshot] = useState<KokoroStatusSnapshot>(getKokoroStatusSnapshot())
  const [toast, setToast] = useState<ToastState>(null)

  useEffect(() => {
    const unsubscribe = subscribeKokoroStatus(setSnapshot)
    void checkTtsHealth()

    const timer = window.setInterval(() => {
      void checkTtsHealth(true)
    }, 30000)

    return () => {
      unsubscribe()
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleStart() {
    const next = await startKokoroServer()

    if (next.status === 'ready') {
      setToast({ type: 'success', message: 'Kokoro đã khởi động và sẵn sàng phát audio.' })
      return
    }

    if (next.status === 'browser') {
      setToast({
        type: 'info',
        message: next.message || 'Server đã phản hồi nhưng Kokoro chưa sẵn sàng. App sẽ tạm dùng Browser Voice.',
      })
      return
    }

    setToast({
      type: 'error',
      message: `${next.message}. Nếu cần, hãy chạy thủ công: ${next.manualCommand ?? 'pnpm dev:server'}`,
    })
  }

  const sizeClass = compact ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'
  const buttonClass = compact ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'
  const isReady = snapshot.status === 'ready'
  const isStarting = snapshot.status === 'starting'
  const isChecking = snapshot.status === 'checking'
  const canStart = showStartButton && !isReady && !isStarting && !isChecking

  let badgeIcon = <VolumeX size={compact ? 12 : 14} />
  let badgeLabel = 'Browser voice'
  let badgeTitle = 'Kokoro local chưa chạy, đang dùng giọng trình duyệt'
  let badgeStyle = {
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
  }

  if (isChecking) {
    badgeIcon = <Loader2 size={compact ? 12 : 14} className="animate-spin" />
    badgeLabel = 'Đang kiểm tra TTS'
    badgeTitle = 'Đang kiểm tra Kokoro local'
  } else if (isStarting) {
    badgeIcon = <Loader2 size={compact ? 12 : 14} className="animate-spin" />
    badgeLabel = 'Đang khởi động Kokoro'
    badgeTitle = snapshot.message
  } else if (isReady) {
    badgeIcon = <CheckCircle2 size={compact ? 12 : 14} />
    badgeLabel = 'Kokoro local'
    badgeTitle = 'Kokoro local đang chạy'
    badgeStyle = {
      background: 'color-mix(in srgb, var(--color-primary) 16%, var(--bg-card))',
      color: 'var(--text-primary)',
      border: '1px solid color-mix(in srgb, var(--color-primary) 28%, var(--border-color))',
    }
  } else if (snapshot.status === 'offline') {
    badgeIcon = <XCircle size={compact ? 12 : 14} />
    badgeLabel = 'Kokoro offline'
    badgeTitle = snapshot.message
    badgeStyle = {
      background: 'color-mix(in srgb, #ef4444 10%, var(--bg-card))',
      color: '#b91c1c',
      border: '1px solid color-mix(in srgb, #ef4444 22%, var(--border-color))',
    }
  } else {
    badgeIcon = <Volume2 size={compact ? 12 : 14} />
    badgeLabel = 'Browser voice'
    badgeTitle = snapshot.message || 'Kokoro chưa sẵn sàng, đang dùng Browser Voice'
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`}
        style={badgeStyle}
        title={badgeTitle}
      >
        {badgeIcon}
        {badgeLabel}
      </span>

      {showStartButton && (
        isReady ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${buttonClass}`}
            style={{
              background: 'color-mix(in srgb, #22c55e 14%, var(--bg-card))',
              color: '#166534',
              border: '1px solid color-mix(in srgb, #22c55e 28%, var(--border-color))',
            }}
            title="Kokoro engine đã sẵn sàng"
          >
            <CheckCircle2 size={compact ? 12 : 14} />
            Kokoro đang chạy
          </span>
        ) : (
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={!canStart}
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold disabled:opacity-60 ${buttonClass}`}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
            title="Khởi động Kokoro local"
          >
            {isStarting || isChecking ? (
              <Loader2 size={compact ? 12 : 14} className="animate-spin" />
            ) : (
              <PlayCircle size={compact ? 12 : 14} />
            )}
            {isStarting ? 'Đang khởi động...' : 'Khởi động Kokoro'}
          </button>
        )
      )}

      {toast && (
        <span
          className={`${compact ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'} inline-flex max-w-full rounded-full font-medium`}
          style={toneStyles(toast.type)}
          title={toast.message}
        >
          {toast.message}
        </span>
      )}
    </div>
  )
}
