import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  PlayCircle,
  TerminalSquare,
  Volume2,
  VolumeX,
} from 'lucide-react'
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

type NoticeState = {
  type: 'success' | 'error' | 'info'
  message: string
  action?: 'copy-command'
} | null

const MANUAL_COMMAND = 'pnpm dev:server'

function noticeStyles(type: NonNullable<NoticeState>['type']) {
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

async function copyManualCommand(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(MANUAL_COMMAND)
    return true
  } catch {
    return false
  }
}

export default function ListeningTtsStatusBadge({ compact = false, showStartButton = true }: Props) {
  const [snapshot, setSnapshot] = useState<KokoroStatusSnapshot>(getKokoroStatusSnapshot())
  const [notice, setNotice] = useState<NoticeState>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeKokoroStatus(setSnapshot)
    void checkTtsHealth()

    const intervalMs = snapshot.status === 'offline' ? 8000 : 30000
    const timer = window.setInterval(() => {
      void checkTtsHealth(true)
    }, intervalMs)

    return () => {
      unsubscribe()
      window.clearInterval(timer)
    }
  }, [snapshot.status])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), notice.type === 'error' ? 7000 : 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleCopyCommand() {
    const ok = await copyManualCommand()
    if (ok) {
      setCopied(true)
      setNotice({ type: 'success', message: 'Đã copy lệnh mở server. Dán vào terminal để chạy.' })
      return
    }
    setNotice({
      type: 'error',
      message: 'Không thể copy tự động. Hãy chạy: pnpm dev:server',
      action: 'copy-command',
    })
  }

  async function handleStart() {
    const next = await startKokoroServer()

    if (next.status === 'ready') {
      setNotice({ type: 'success', message: 'Kokoro đã sẵn sàng. Bạn có thể nghe bằng giọng local.' })
      return
    }

    if (next.status === 'browser') {
      setNotice({
        type: 'info',
        message: 'Kokoro chưa sẵn sàng. Ứng dụng đang tạm dùng Browser Voice.',
      })
      return
    }

    setNotice({
      type: 'error',
      message: 'Chưa khởi động được server Kokoro. Vui lòng chạy lệnh sau trong terminal.',
      action: 'copy-command',
    })
  }

  const badgeSizeClass = compact ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'
  const actionSizeClass = compact ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'

  const isReady = snapshot.status === 'ready'
  const isStarting = snapshot.status === 'starting'
  const isChecking = snapshot.status === 'checking'
  const isOffline = snapshot.status === 'offline'

  let badgeIcon = <Volume2 size={compact ? 12 : 14} />
  let badgeLabel = 'Browser Voice'
  let badgeTitle = 'Kokoro chưa sẵn sàng. Ứng dụng đang dùng giọng đọc của trình duyệt.'
  let badgeStyle = {
    background: 'var(--bg-card)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
  }

  if (isChecking) {
    badgeIcon = <Loader2 size={compact ? 12 : 14} className="animate-spin" />
    badgeLabel = 'Đang kiểm tra Kokoro'
    badgeTitle = 'Ứng dụng đang kiểm tra xem Kokoro local có đang hoạt động hay không.'
  } else if (isStarting) {
    badgeIcon = <Loader2 size={compact ? 12 : 14} className="animate-spin" />
    badgeLabel = 'Đang khởi động Kokoro'
    badgeTitle = 'Đang gửi yêu cầu khởi động Kokoro. Nếu lâu quá, có thể server chưa được mở.'
  } else if (isReady) {
    badgeIcon = <CheckCircle2 size={compact ? 12 : 14} />
    badgeLabel = 'Kokoro đang chạy'
    badgeTitle = 'Kokoro local đã sẵn sàng. Listening sẽ ưu tiên giọng local thay cho Browser Voice.'
    badgeStyle = {
      background: 'color-mix(in srgb, #22c55e 14%, var(--bg-card))',
      color: '#166534',
      border: '1px solid color-mix(in srgb, #22c55e 28%, var(--border-color))',
    }
  } else if (isOffline) {
    badgeIcon = <AlertTriangle size={compact ? 12 : 14} />
    badgeLabel = 'Kokoro offline'
    badgeTitle = 'Chưa khởi động server Kokoro. Hãy mở terminal và chạy: pnpm dev:server'
    badgeStyle = {
      background: 'color-mix(in srgb, #ef4444 10%, var(--bg-card))',
      color: '#b91c1c',
      border: '1px solid color-mix(in srgb, #ef4444 22%, var(--border-color))',
    }
  } else {
    badgeIcon = <VolumeX size={compact ? 12 : 14} />
    badgeLabel = 'Browser Voice'
    badgeTitle = 'Server Kokoro chưa sẵn sàng. Ứng dụng vẫn hoạt động bình thường với Browser Voice.'
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${badgeSizeClass}`}
        style={badgeStyle}
        title={badgeTitle}
      >
        {badgeIcon}
        {badgeLabel}
        {isOffline && !compact && (
          <span className="opacity-80">- Chưa khởi động server</span>
        )}
      </span>

      {showStartButton && !isReady && (
        <button
          type="button"
          onClick={() => void handleStart()}
          disabled={isStarting || isChecking}
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold disabled:opacity-60 ${actionSizeClass}`}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
          title="Thử khởi động Kokoro từ ứng dụng"
        >
          {isStarting || isChecking ? (
            <Loader2 size={compact ? 12 : 14} className="animate-spin" />
          ) : (
            <PlayCircle size={compact ? 12 : 14} />
          )}
          {isStarting ? 'Đang khởi động...' : 'Khởi động Kokoro'}
        </button>
      )}

      {isOffline && (
        <button
          type="button"
          onClick={() => void handleCopyCommand()}
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${actionSizeClass}`}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
          title="Copy lệnh để mở server Kokoro trong terminal"
        >
          {copied ? <CheckCircle2 size={compact ? 12 : 14} /> : <Copy size={compact ? 12 : 14} />}
          {copied ? 'Đã copy lệnh' : 'Copy lệnh'}
        </button>
      )}

      {isOffline && !compact && (
        <span
          className={`${actionSizeClass} inline-flex items-center gap-1.5 rounded-full font-medium`}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
          }}
          title="Mở terminal rồi dán lệnh này để bật local TTS gateway"
        >
          <TerminalSquare size={14} />
          {MANUAL_COMMAND}
        </span>
      )}

      {notice && (
        <span
          className={`${compact ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'} inline-flex max-w-full items-center gap-2 rounded-full font-medium`}
          style={noticeStyles(notice.type)}
          title={notice.message}
        >
          {notice.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          <span>{notice.message}</span>
          {notice.action === 'copy-command' && (
            <button
              type="button"
              onClick={() => void handleCopyCommand()}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: 'color-mix(in srgb, var(--bg-card) 88%, transparent)',
                color: 'inherit',
                border: '1px solid color-mix(in srgb, currentColor 18%, transparent)',
              }}
            >
              <Copy size={12} />
              Copy lệnh
            </button>
          )}
        </span>
      )}
    </div>
  )
}
