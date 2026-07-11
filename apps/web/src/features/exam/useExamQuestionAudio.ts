import { useCallback, useEffect, useRef, useState } from 'react'
import { audioRepo } from '@ryan/db'
import { resolveExamMediaUrl } from './examMediaUrl'
import { formatAudioTime } from '../listening/practiceUtils'
import { mapRateToSpeed, speak, stop as stopTts } from '../listening/tts'

export interface ExamAudioSource {
  audioKey?: string
  audioUrl?: string
  ttsText?: string
}

export interface ExamAudioPlayOptions {
  rate?: number
  allowSeek?: boolean
  beforePlay?: () => boolean
  onPlayCounted?: () => void
}

/** Blob Dexie đôi khi mất type → trình duyệt không decode MP3. */
async function blobAsAudio(blob: Blob, fallbackMime = 'audio/mpeg'): Promise<Blob> {
  if (blob.type && blob.type.startsWith('audio/')) return blob
  const buf = await blob.arrayBuffer()
  return new Blob([buf], { type: fallbackMime })
}

/**
 * Catalog / URL tĩnh: fetch → blob URL (fallback khi stream trực tiếp lỗi).
 * Không phụ thuộc SW — SW không còn intercept /catalog/*.mp3 (Firefox NS_ERROR_INTERCEPTION_FAILED).
 */
async function fetchUrlAsAudioBlobUrl(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} khi tải audio: ${url.slice(0, 100)}`)
  }
  const ct = (res.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('text/html')) {
    throw new Error(`Server trả HTML thay vì MP3 (sai path?): ${url.slice(0, 100)}`)
  }
  const raw = await res.blob()
  if (!raw.size) throw new Error(`File audio rỗng: ${url.slice(0, 100)}`)
  if (raw.size < 8_000) {
    throw new Error(`File audio quá nhỏ (${raw.size} bytes): ${url.slice(0, 100)}`)
  }
  const head = new Uint8Array(await raw.slice(0, 4).arrayBuffer())
  const isId3 = head[0] === 0x49 && head[1] === 0x44 && head[2] === 0x33
  const isMpeg = head[0] === 0xff && (head[1] & 0xe0) === 0xe0
  if (!isId3 && !isMpeg) {
    throw new Error(
      `Không phải MP3 hợp lệ (header ${[...head].map(b => b.toString(16)).join(' ')}): ${url.slice(0, 80)}`,
    )
  }
  const typed = await blobAsAudio(raw, 'audio/mpeg')
  return URL.createObjectURL(typed)
}

function examAudioSourceId(source: ExamAudioSource): string {
  return `${source.audioKey ?? ''}\0${source.audioUrl ?? ''}\0${source.ttsText?.trim() ?? ''}`
}

function syncTimeUi(audio: HTMLAudioElement, setProgressPct: (n: number) => void, setTimeLabel: (s: string) => void) {
  const duration = audio.duration
  if (duration && Number.isFinite(duration)) {
    const pct = Math.min(100, (audio.currentTime / duration) * 100)
    setProgressPct(pct)
    setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(duration)}`)
  }
}

export function useExamQuestionAudio() {
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00')
  const [speed, setSpeed] = useState(1)
  const [playError, setPlayError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  /** Nguồn đang load trên audio element — dùng để resume không load lại từ đầu */
  const loadedSourceIdRef = useRef<string | null>(null)
  const loadedSrcRef = useRef<string | null>(null)

  const cancelProgress = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  /** Hủy hẳn element + TTS (đổi part / unmount). */
  const stopCurrentAudio = useCallback((keepSrc?: string) => {
    cancelProgress()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
      audioRef.current = null
    }
    stopTts()
    loadedSourceIdRef.current = null
    loadedSrcRef.current = null
    if (objectUrlRef.current && objectUrlRef.current !== keepSrc) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [cancelProgress])

  const cleanupAudio = useCallback(() => {
    stopCurrentAudio()
  }, [stopCurrentAudio])

  useEffect(() => () => cleanupAudio(), [cleanupAudio])

  const startProgressLoop = useCallback((audio: HTMLAudioElement) => {
    cancelProgress()

    const tick = () => {
      if (!audioRef.current || audioRef.current !== audio) return
      syncTimeUi(audio, setProgressPct, setTimeLabel)
      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [cancelProgress])

  /** Pause giữ currentTime — bấm phát lại sẽ tiếp tục, không từ 0. */
  const pausePlayback = useCallback(() => {
    cancelProgress()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      syncTimeUi(audio, setProgressPct, setTimeLabel)
    }
    stopTts()
    setPlaying(false)
    setBuffering(false)
  }, [cancelProgress])

  const playHtmlAudio = useCallback(async (src: string, rate: number, sourceId: string) => {
    // QUAN TRỌNG: không revoke `src` nếu đó là blob URL sắp phát
    stopCurrentAudio(src)
    if (src.startsWith('blob:')) {
      objectUrlRef.current = src
    }

    setBuffering(true)
    setPlaying(true)
    setProgressPct(0)
    setTimeLabel('0:00 / 0:00')

    const audio = new Audio()
    audio.preload = 'auto'
    audio.playbackRate = rate
    audioRef.current = audio
    loadedSrcRef.current = src
    loadedSourceIdRef.current = sourceId

    await new Promise<void>((resolve, reject) => {
      let settled = false
      const cleanupListeners = () => {
        window.clearTimeout(timeoutId)
        audio.removeEventListener('loadedmetadata', onReady)
        audio.removeEventListener('canplay', onReady)
        audio.removeEventListener('loadeddata', onReady)
        audio.removeEventListener('error', onError)
      }
      const onReady = () => {
        if (settled) return
        settled = true
        cleanupListeners()
        resolve()
      }
      const onError = () => {
        if (settled) return
        settled = true
        cleanupListeners()
        const code = audio.error?.code
        const msg = audio.error?.message
        reject(
          new Error(
            `Không tải được audio${code != null ? ` (code ${code})` : ''}${msg ? `: ${msg}` : ''} · ${src.slice(0, 100)}`,
          ),
        )
      }
      // File catalog ~20MB: cho đủ thời gian; readyState>=1 = có metadata
      const timeoutId = window.setTimeout(() => {
        if (settled) return
        if (audio.readyState >= 1) {
          settled = true
          cleanupListeners()
          resolve()
        } else {
          settled = true
          cleanupListeners()
          reject(new Error(`Timeout tải audio: ${src.slice(0, 100)}`))
        }
      }, 60000)
      audio.addEventListener('loadedmetadata', onReady)
      audio.addEventListener('canplay', onReady)
      audio.addEventListener('loadeddata', onReady)
      audio.addEventListener('error', onError)
      audio.src = src
      audio.load()
    })

    setBuffering(false)
    setTimeLabel(`0:00 / ${formatAudioTime(audio.duration)}`)
    startProgressLoop(audio)

    audio.onended = () => {
      cancelProgress()
      setPlaying(false)
      setProgressPct(100)
      setTimeLabel(`${formatAudioTime(audio.duration)} / ${formatAudioTime(audio.duration)}`)
    }

    try {
      await audio.play()
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError') {
        setPlaying(false)
        setBuffering(false)
        throw new Error(
          'Trình duyệt chặn tự phát audio. Bấm lại nút Play trên màn hình hoặc nút Phát trên thanh audio.',
        )
      }
      throw err
    }
  }, [cancelProgress, startProgressLoop, stopCurrentAudio])

  const playTtsFallback = useCallback(async (text: string, rate: number, sourceId: string) => {
    stopCurrentAudio()
    loadedSourceIdRef.current = sourceId
    const speechRate = rate === 1 ? 0.85 : 0.6
    const kokoroSpeed = mapRateToSpeed(speechRate)

    setPlaying(true)
    setBuffering(true)
    setProgressPct(0)

    try {
      await speak(text, {
        speed: kokoroSpeed,
        onPlaybackStart: (audio) => {
          audioRef.current = audio
          setBuffering(false)
          setTimeLabel(`0:00 / ${formatAudioTime(audio.duration)}`)
          startProgressLoop(audio)
        },
        onFallbackStart: () => {
          setBuffering(false)
        },
      })
    } finally {
      cancelProgress()
      setBuffering(false)
      setPlaying(false)
    }
  }, [cancelProgress, startProgressLoop, stopCurrentAudio])

  const play = useCallback(async (
    source: ExamAudioSource,
    options: ExamAudioPlayOptions = {},
  ) => {
    const rate = options.rate ?? speed
    const sourceId = examAudioSourceId(source)
    const existing = audioRef.current

    // Đang phát cùng nguồn → no-op
    if (
      existing
      && loadedSourceIdRef.current === sourceId
      && !existing.paused
      && !existing.ended
    ) {
      return
    }

    // Pause giữa chừng (hoặc đã seek lùi sau khi hết bài) → resume từ currentTime
    const nearEnd =
      existing
      && existing.duration
      && Number.isFinite(existing.duration)
      && existing.currentTime >= existing.duration - 0.2
    if (
      existing
      && loadedSourceIdRef.current === sourceId
      && existing.paused
      && existing.src
      && !nearEnd
    ) {
      setPlayError(null)
      setBuffering(false)
      setPlaying(true)
      existing.playbackRate = rate
      startProgressLoop(existing)
      try {
        await existing.play()
      } catch (err) {
        console.warn('Exam audio resume failed', err)
        setPlaying(false)
        setPlayError('Không tiếp tục phát được. Thử bấm Phát lại.')
      }
      return
    }

    // Hết bài (ended) hoặc nguồn mới → phát mới (from 0, trừ khi user đã seek)
    if (options.beforePlay && !options.beforePlay()) return

    setPlayError(null)
    setBuffering(true)

    const staticUrl = resolveExamMediaUrl(source.audioUrl)
    const htmlSources: string[] = []
    const ownedBlobs: string[] = []

    // Reuse blob URL đã load nếu cùng nguồn (ended → play again)
    if (
      loadedSourceIdRef.current === sourceId
      && loadedSrcRef.current
      && existing
      && existing.ended
    ) {
      htmlSources.push(loadedSrcRef.current)
    }

    if (source.audioKey && htmlSources.length === 0) {
      try {
        const record = await audioRepo.get(source.audioKey)
        if (record?.blob && record.blob.size > 0) {
          const typed = await blobAsAudio(record.blob)
          const blobUrl = URL.createObjectURL(typed)
          ownedBlobs.push(blobUrl)
          htmlSources.push(blobUrl)
        } else if (source.audioKey) {
          console.warn('[exam audio] blob missing or empty for key', source.audioKey, record?.blob?.size)
        }
      } catch (blobError) {
        console.warn('Exam audio blob unavailable, trying URL fallback', source.audioKey, blobError)
      }
    }

    // Catalog / static URL:
    // - Chỉ khi không có blob local (audioKey), hoặc blob local rỗng/thiếu
    // - Không push catalog song song với blob import — tránh fail blob → phát nhầm đề khác
    if (staticUrl && htmlSources.length === 0) {
      htmlSources.push(staticUrl)
      try {
        const blobUrl = await fetchUrlAsAudioBlobUrl(staticUrl)
        ownedBlobs.push(blobUrl)
        htmlSources.push(blobUrl)
      } catch (fetchErr) {
        console.warn('[exam audio] fetch catalog blob fallback skipped', staticUrl, fetchErr)
      }
    }

    try {
      for (const src of htmlSources) {
        try {
          // Replay sau ended: giữ element, chỉ seek 0 nếu đã ended
          if (
            existing
            && loadedSourceIdRef.current === sourceId
            && loadedSrcRef.current === src
            && existing.ended
          ) {
            existing.currentTime = 0
            existing.playbackRate = rate
            setPlaying(true)
            setBuffering(false)
            setProgressPct(0)
            setTimeLabel(`0:00 / ${formatAudioTime(existing.duration)}`)
            startProgressLoop(existing)
            existing.onended = () => {
              cancelProgress()
              setPlaying(false)
              setProgressPct(100)
              setTimeLabel(`${formatAudioTime(existing.duration)} / ${formatAudioTime(existing.duration)}`)
            }
            await existing.play()
            options.onPlayCounted?.()
            return
          }

          await playHtmlAudio(src, rate, sourceId)
          options.onPlayCounted?.()
          return
        } catch (attemptError) {
          const attemptMsg = attemptError instanceof Error ? attemptError.message : ''
          // Không thử source khác khi bị chặn gesture — giữ message
          if (attemptMsg.includes('chặn tự phát') || attemptMsg.includes('NotAllowed')) {
            throw attemptError
          }
          console.warn('Exam audio source failed, trying next', src, attemptError)
          if (src.startsWith('blob:') && objectUrlRef.current !== src) {
            URL.revokeObjectURL(src)
          }
          stopCurrentAudio()
        }
      }

      for (const b of ownedBlobs) {
        if (objectUrlRef.current !== b) {
          try { URL.revokeObjectURL(b) } catch { /* ignore */ }
        }
      }

      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate, sourceId)
        options.onPlayCounted?.()
        return
      }

      if (htmlSources.length === 0) {
        setTimeLabel('— / —')
        setPlayError(
          source.audioKey
            ? `Không tìm thấy blob audio (key: ${source.audioKey}). Import lại ZIP kèm MP3.`
            : 'Không tìm thấy file audio. Kiểm tra MP3 trong ZIP import hoặc dùng đề builtin.',
        )
        return
      }

      stopCurrentAudio()
      setPlaying(false)
      setBuffering(false)
      setPlayError(
        staticUrl
          ? `Không phát được file: ${staticUrl}. Kiểm tra đường dẫn catalog / file MP3 trong ZIP.`
          : 'Không phát được audio. Thử import lại ZIP kèm MP3 hoặc dùng đề builtin catalog.',
      )
    } catch (error) {
      console.warn('Exam audio playback failed', error)
      for (const b of ownedBlobs) {
        if (objectUrlRef.current !== b) {
          try { URL.revokeObjectURL(b) } catch { /* ignore */ }
        }
      }
      const msg = error instanceof Error ? error.message : ''
      // NotAllowed / message rõ — không fallback TTS nuốt lỗi
      if (msg.includes('chặn tự phát') || msg.includes('NotAllowed')) {
        stopCurrentAudio()
        setPlaying(false)
        setBuffering(false)
        setPlayError(msg)
        return
      }
      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate, sourceId)
        options.onPlayCounted?.()
      } else {
        stopCurrentAudio()
        setPlaying(false)
        setBuffering(false)
        setPlayError(
          msg || 'Không phát được audio. Thử import lại ZIP kèm MP3 hoặc dùng đề builtin catalog.',
        )
      }
    }
  }, [cancelProgress, playHtmlAudio, playTtsFallback, speed, startProgressLoop, stopCurrentAudio])

  /** Pause (giữ vị trí). Dùng cho nút Pause trên audio bar. */
  const stopPlayback = pausePlayback

  /** Hủy hẳn + reset UI (đổi part / làm lại bài). */
  const resetPlayback = useCallback(() => {
    stopCurrentAudio()
    setPlaying(false)
    setBuffering(false)
    setProgressPct(0)
    setTimeLabel('0:00 / 0:00')
  }, [stopCurrentAudio])

  const seekToPct = useCallback((pct: number, allowSeek = true) => {
    if (!allowSeek) return
    const audio = audioRef.current
    if (!audio?.duration || !Number.isFinite(audio.duration)) return
    const clamped = Math.max(0, Math.min(100, pct))
    audio.currentTime = (clamped / 100) * audio.duration
    // Nếu đã ended, seek lùi để có thể play tiếp từ vị trí mới
    if (audio.ended && clamped < 100) {
      // ended flag clears when currentTime set on most browsers
      try { audio.currentTime = (clamped / 100) * audio.duration } catch { /* ignore */ }
    }
    setProgressPct(clamped)
    setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(audio.duration)}`)
    if (!audio.paused && !audio.ended) {
      startProgressLoop(audio)
    }
  }, [startProgressLoop])

  const toggleSpeed = useCallback(() => {
    setSpeed(prev => {
      const next = prev === 1 ? 0.75 : 1
      if (audioRef.current) {
        audioRef.current.playbackRate = next
      }
      return next
    })
  }, [])

  return {
    playing,
    buffering,
    progressPct,
    timeLabel,
    speed,
    playError,
    toggleSpeed,
    play,
    seekToPct,
    /** Pause — giữ vị trí; phát lại = resume */
    stopPlayback,
    pausePlayback,
    /** Hủy audio element (đổi part / retry) */
    resetPlayback,
  }
}
