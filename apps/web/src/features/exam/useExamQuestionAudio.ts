import { useCallback, useEffect, useRef, useState } from 'react'
import { audioRepo } from '@ryan/db'
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
  allowSlow?: boolean
  beforePlay?: () => boolean
  onPlayCounted?: () => void
}

export function useExamQuestionAudio() {
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00')
  const [speed, setSpeed] = useState(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)

  const cancelProgress = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const cleanupAudio = useCallback(() => {
    cancelProgress()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    stopTts()
  }, [cancelProgress])

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
    cleanupAudio()
    setBuffering(true)
    setPlaying(true)
    setProgressPct(0)
    setTimeLabel('0:00 / 0:00')

    const audio = new Audio(src)
    audio.playbackRate = rate
    audioRef.current = audio

    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        audio.removeEventListener('loadedmetadata', onReady)
        audio.removeEventListener('error', onError)
        resolve()
      }
      const onError = () => {
        audio.removeEventListener('loadedmetadata', onReady)
        audio.removeEventListener('error', onError)
        reject(new Error('Không tải được audio'))
      }
      audio.addEventListener('loadedmetadata', onReady)
      audio.addEventListener('error', onError)
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
  }, [cancelProgress, cleanupAudio, startProgressLoop])

  const playTtsFallback = useCallback(async (text: string, rate: number) => {
    cleanupAudio()
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
  }, [cancelProgress, cleanupAudio, startProgressLoop])

  const play = useCallback(async (
    source: ExamAudioSource,
    options: ExamAudioPlayOptions = {},
  ) => {
    const rate = options.rate ?? speed
    if (options.beforePlay && !options.beforePlay()) return

    try {
      if (source.audioKey) {
        const record = await audioRepo.get(source.audioKey)
        if (record?.blob) {
          const url = URL.createObjectURL(record.blob)
          objectUrlRef.current = url
          await playHtmlAudio(url, rate)
          options.onPlayCounted?.()
          return
        }
      }

      if (source.audioUrl) {
        await playHtmlAudio(source.audioUrl, rate)
        options.onPlayCounted?.()
        return
      }

      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate)
        options.onPlayCounted?.()
        return
      }

      setTimeLabel('— / —')
    } catch (error) {
      console.warn('Exam audio playback failed', error)
      const ttsText = source.ttsText?.trim()
      if (ttsText) {
        await playTtsFallback(ttsText, rate)
        options.onPlayCounted?.()
      } else {
        cleanupAudio()
        setPlaying(false)
        setBuffering(false)
      }
    }
  }, [cleanupAudio, playHtmlAudio, playTtsFallback, speed])

  const stopPlayback = useCallback(() => {
    cleanupAudio()
    setPlaying(false)
    setBuffering(false)
  }, [cleanupAudio])

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
    toggleSpeed,
    play,
    seekToPct,
    stopPlayback,
  }
}