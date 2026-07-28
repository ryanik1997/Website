import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getActiveAudio,
  mapRateToSpeed,
  pauseActiveAudio,
  playAudioUrl,
  resumeActiveAudio,
  speak,
  stop,
} from './tts'
import { estimateSpeechDurationSec, formatAudioTime } from './practiceUtils'

export function useListeningPlayback() {
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00')
  const [speed, setSpeed] = useState(1)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const durationRef = useRef(0)
  const useRealAudioRef = useRef(false)
  const progressActiveRef = useRef(false)

  const cancelProgress = useCallback(() => {
    progressActiveRef.current = false
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const startProgressLoop = useCallback(() => {
    cancelProgress()
    progressActiveRef.current = true

    const tick = () => {
      if (!progressActiveRef.current) return

      const audio = getActiveAudio()
      if (useRealAudioRef.current && audio?.duration && Number.isFinite(audio.duration)) {
        const pct = Math.min(100, (audio.currentTime / audio.duration) * 100)
        setProgressPct(pct)
        setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(audio.duration)}`)
        if (!audio.paused && !audio.ended) {
          rafRef.current = requestAnimationFrame(tick)
        }
        return
      }

      const elapsed = (performance.now() - startRef.current) / 1000
      const total = durationRef.current
      if (total > 0) {
        const pct = Math.min(100, (elapsed / total) * 100)
        setProgressPct(pct)
        setTimeLabel(`${formatAudioTime(elapsed)} / ${formatAudioTime(total)}`)
        if (elapsed < total) {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [cancelProgress])

  useEffect(() => () => {
    cancelProgress()
    stop()
  }, [cancelProgress])

  const playTts = useCallback(async (
    text: string,
    rate = speed,
    media?: { audioUrl?: string; t0?: number; t1?: number },
  ) => {
    const activeAudio = getActiveAudio()
    if (activeAudio && !activeAudio.ended) {
      if (activeAudio.paused) {
        try {
          await resumeActiveAudio()
          setPlaying(true)
          startProgressLoop()
        } catch {
          setPlaying(false)
        }
      } else {
        pauseActiveAudio()
        cancelProgress()
        setPlaying(false)
      }
      return
    }
    cancelProgress()
    stop()

    // rate UI: 1 | 0.75 | 0.5 → speech rate cho WebSpeech / Kokoro
    const speechRate = rate <= 0.55 ? 0.55 : rate <= 0.8 ? 0.7 : 0.85
    const kokoroSpeed = mapRateToSpeed(speechRate)
    const estimatedTotal = estimateSpeechDurationSec(text, speechRate)

    useRealAudioRef.current = false
    durationRef.current = estimatedTotal
    setPlaying(true)
    setBuffering(true)
    setProgressPct(0)
    setTimeLabel(`0:00 / ${formatAudioTime(estimatedTotal)}`)

    let progressStarted = false
    const beginProgress = (realAudio: boolean, totalSec: number) => {
      if (progressStarted) return
      progressStarted = true
      useRealAudioRef.current = realAudio
      durationRef.current = totalSec
      setBuffering(false)
      setTimeLabel(`0:00 / ${formatAudioTime(totalSec)}`)
      setProgressPct(0)
      if (!realAudio) {
        startRef.current = performance.now()
      }
      startProgressLoop()
    }

    try {
      // Prefer real dictation clip when available
      if (media?.audioUrl) {
        try {
          await playAudioUrl(media.audioUrl, {
            playbackRate: rate === 0.5 ? 0.5 : rate === 0.75 ? 0.75 : 1,
            startSec: media.t0,
            endSec: media.t1,
            onPlaybackStart: (audio) => {
              const total = audio.duration && Number.isFinite(audio.duration)
                ? audio.duration
                : Math.max(0.5, (media.t1 ?? 0) - (media.t0 ?? 0) || estimatedTotal)
              beginProgress(true, total)
            },
          })
          const audio = getActiveAudio()
          if (audio?.duration && Number.isFinite(audio.duration)) {
            setProgressPct(100)
            setTimeLabel(`${formatAudioTime(audio.duration)} / ${formatAudioTime(audio.duration)}`)
          }
          return
        } catch (err) {
          console.warn('[listening] clip play failed, fallback TTS:', err)
        }
      }

      await speak(text, {
        speed: kokoroSpeed,
        onPlaybackStart: (audio) => {
          const total = audio.duration && Number.isFinite(audio.duration)
            ? audio.duration
            : estimatedTotal
          beginProgress(true, total)
        },
        onFallbackStart: () => {
          beginProgress(false, estimatedTotal)
        },
      })

      const audio = getActiveAudio()
      if (audio?.duration && Number.isFinite(audio.duration)) {
        setProgressPct(100)
        setTimeLabel(`${formatAudioTime(audio.duration)} / ${formatAudioTime(audio.duration)}`)
      } else {
        setProgressPct(100)
        setTimeLabel(`${formatAudioTime(durationRef.current)} / ${formatAudioTime(durationRef.current)}`)
      }
    } finally {
      cancelProgress()
      setBuffering(false)
      setPlaying(false)
      useRealAudioRef.current = false
    }
  }, [speed, cancelProgress, startProgressLoop])

  const seekToPct = useCallback((pct: number) => {
    if (!playing && !buffering) return
    const clamped = Math.max(0, Math.min(100, pct))
    const audio = getActiveAudio()
    if (audio?.duration && Number.isFinite(audio.duration)) {
      audio.currentTime = (clamped / 100) * audio.duration
      setProgressPct(clamped)
      setTimeLabel(`${formatAudioTime(audio.currentTime)} / ${formatAudioTime(audio.duration)}`)
      return
    }
    const total = durationRef.current
    startRef.current = performance.now() - (clamped / 100) * total * 1000
    setProgressPct(clamped)
    setTimeLabel(`${formatAudioTime((clamped / 100) * total)} / ${formatAudioTime(total)}`)
  }, [playing, buffering])

  const toggleSpeed = useCallback(() => {
    // Cycle: 1 → 0.75 → 0.5 → 1 (nghe chậm)
    setSpeed(s => (s === 1 ? 0.75 : s === 0.75 ? 0.5 : 1))
  }, [])

  const setPlaybackSpeed = useCallback((rate: number) => {
    setSpeed(rate === 0.5 || rate === 0.75 || rate === 1 ? rate : 1)
  }, [])

  const stopPlayback = useCallback(() => {
    cancelProgress()
    stop()
    setBuffering(false)
    setPlaying(false)
    useRealAudioRef.current = false
  }, [cancelProgress])

  /** Thời lượng ước tính / thực (giây) — dùng time-align transcript */
  const getDurationSec = useCallback((): number => {
    const audio = getActiveAudio()
    if (audio?.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
      return audio.duration
    }
    return durationRef.current
  }, [])

  const getCurrentTimeSec = useCallback((): number => {
    const audio = getActiveAudio()
    if (audio && Number.isFinite(audio.currentTime)) return audio.currentTime
    if (!progressActiveRef.current || durationRef.current <= 0) return 0
    return Math.min(durationRef.current, (performance.now() - startRef.current) / 1000)
  }, [])

  const seekToTimeSec = useCallback((sec: number) => {
    const total = getDurationSec()
    if (total <= 0) return
    const pct = (Math.max(0, Math.min(total, sec)) / total) * 100
    seekToPct(pct)
  }, [getDurationSec, seekToPct])

  return {
    playing,
    buffering,
    progressPct,
    timeLabel,
    speed,
    toggleSpeed,
    setPlaybackSpeed,
    playTts,
    seekToPct,
    seekToTimeSec,
    getDurationSec,
    getCurrentTimeSec,
    stopPlayback,
  }
}
