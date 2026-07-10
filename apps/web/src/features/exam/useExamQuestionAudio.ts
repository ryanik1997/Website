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

  const cancelProgress = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  /** Dừng element + TTS; chỉ revoke blob URL cũ nếu khác `keepSrc`. */
  const stopCurrentAudio = useCallback((keepSrc?: string) => {
    cancelProgress()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
      audioRef.current = null
    }
    stopTts()
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
      const duration = audio.duration
      if (duration && Number.isFinite(duration)) {
        const pct = Math.min(100, (audio.currentTime / duration) * 100)
        setProgressPct(pct)
        setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(duration)}`)
      }
      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [cancelProgress])

  const playHtmlAudio = useCallback(async (src: string, rate: number) => {
    // QUAN TRỌNG: không revoke `src` nếu đó là blob URL sắp phát
    // (bug cũ: play() gán objectUrlRef rồi cleanupAudio() revoke ngay → MP3 import fail)
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

    await new Promise<void>((resolve, reject) => {
      const cleanupListeners = () => {
        audio.removeEventListener('loadedmetadata', onReady)
        audio.removeEventListener('canplay', onReady)
        audio.removeEventListener('error', onError)
      }
      const onReady = () => {
        cleanupListeners()
        resolve()
      }
      const onError = () => {
        cleanupListeners()
        const code = audio.error?.code
        const msg = audio.error?.message
        reject(
          new Error(
            `Không tải được audio${code != null ? ` (code ${code})` : ''}${msg ? `: ${msg}` : ''}`,
          ),
        )
      }
      audio.addEventListener('loadedmetadata', onReady)
      audio.addEventListener('canplay', onReady)
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

    await audio.play()
  }, [cancelProgress, startProgressLoop, stopCurrentAudio])

  const playTtsFallback = useCallback(async (text: string, rate: number) => {
    stopCurrentAudio()
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
    if (options.beforePlay && !options.beforePlay()) return

    setPlayError(null)

    const staticUrl = resolveExamMediaUrl(source.audioUrl)
    const htmlSources: string[] = []
    /** Blob URL tạo trong lượt play này — revoke nếu fail (trừ khi đã gắn objectUrlRef khi play OK) */
    const ownedBlobs: string[] = []

    if (source.audioKey) {
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
    if (staticUrl && !htmlSources.includes(staticUrl)) {
      htmlSources.push(staticUrl)
    }

    try {
      for (const src of htmlSources) {
        try {
          await playHtmlAudio(src, rate)
          // Play OK — blob URL đang dùng nằm trong objectUrlRef; đừng revoke
          options.onPlayCounted?.()
          return
        } catch (attemptError) {
          console.warn('Exam audio source failed, trying next', src, attemptError)
          // Revoke blob failed attempt nếu không còn giữ
          if (src.startsWith('blob:') && objectUrlRef.current !== src) {
            URL.revokeObjectURL(src)
          }
          stopCurrentAudio()
        }
      }

      // Dọn blob URLs chưa dùng / fail
      for (const b of ownedBlobs) {
        if (objectUrlRef.current !== b) {
          try { URL.revokeObjectURL(b) } catch { /* ignore */ }
        }
      }

      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate)
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
      setPlayError('Không phát được audio. Thử import lại ZIP kèm MP3 hoặc dùng đề builtin catalog.')
    } catch (error) {
      console.warn('Exam audio playback failed', error)
      for (const b of ownedBlobs) {
        if (objectUrlRef.current !== b) {
          try { URL.revokeObjectURL(b) } catch { /* ignore */ }
        }
      }
      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate)
        options.onPlayCounted?.()
      } else {
        stopCurrentAudio()
        setPlaying(false)
        setBuffering(false)
        setPlayError('Không phát được audio. Thử import lại ZIP kèm MP3 hoặc dùng đề builtin catalog.')
      }
    }
  }, [playHtmlAudio, playTtsFallback, speed, stopCurrentAudio])

  const stopPlayback = useCallback(() => {
    stopCurrentAudio()
    setPlaying(false)
    setBuffering(false)
  }, [stopCurrentAudio])

  const seekToPct = useCallback((pct: number, allowSeek = true) => {
    if (!allowSeek) return
    const audio = audioRef.current
    if (!audio?.duration || !Number.isFinite(audio.duration)) return
    const clamped = Math.max(0, Math.min(100, pct))
    audio.currentTime = (clamped / 100) * audio.duration
    setProgressPct(clamped)
    setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(audio.duration)}`)
  }, [])

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
    stopPlayback,
  }
}
