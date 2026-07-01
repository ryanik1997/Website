import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Volume2, VolumeX } from 'lucide-react'
import { checkTtsHealth, getLastEngine, isLocalTtsReady, type TtsEngine } from './tts'

type Status = 'checking' | 'kokoro' | 'browser'

interface Props {
  compact?: boolean
}

export default function ListeningTtsStatusBadge({ compact = false }: Props) {
  const [status, setStatus] = useState<Status>('checking')
  const [engine, setEngine] = useState<TtsEngine>(getLastEngine())

  useEffect(() => {
    let mounted = true

    async function refresh() {
      const last = getLastEngine()
      if (last) setEngine(last)

      const knownReady = isLocalTtsReady()
      if (knownReady === true) {
        if (mounted) setStatus('kokoro')
        return
      }
      if (knownReady === false && last === 'webspeech') {
        if (mounted) setStatus('browser')
        return
      }

      if (mounted) setStatus('checking')
      const ready = await checkTtsHealth()
      if (!mounted) return
      setStatus(ready ? 'kokoro' : 'browser')
      setEngine(getLastEngine())
    }

    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 30000)
    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  const sizeClass = compact ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'

  if (status === 'checking') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`}
        style={{
          background: 'var(--bg-card)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
        }}
        title="Đang kiểm tra Kokoro local"
      >
        <Loader2 size={compact ? 12 : 14} className="animate-spin" />
        Đang kiểm tra TTS
      </span>
    )
  }

  if (status === 'kokoro') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`}
        style={{
          background: 'color-mix(in srgb, var(--color-primary) 16%, var(--bg-card))',
          color: 'var(--text-primary)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 28%, var(--border-color))',
        }}
        title={engine === 'kokoro' ? 'Đang phát bằng Kokoro local' : 'Kokoro local đã sẵn sàng'}
      >
        <CheckCircle2 size={compact ? 12 : 14} />
        Kokoro local
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`}
      style={{
        background: 'var(--bg-card)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-color)',
      }}
      title="Kokoro local chưa chạy, đang dùng giọng trình duyệt"
    >
      {engine === 'webspeech' ? <Volume2 size={compact ? 12 : 14} /> : <VolumeX size={compact ? 12 : 14} />}
      Browser voice
    </span>
  )
}
