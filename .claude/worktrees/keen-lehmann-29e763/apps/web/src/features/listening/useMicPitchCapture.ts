import { useCallback, useEffect, useRef, useState } from 'react'
import { detectPitchYIN, type PitchFrame } from './pitchContour'

const FRAME_INTERVAL = 40

export function useMicPitchCapture() {
  const [capturing, setCapturing] = useState(false)
  const [frames, setFrames] = useState<PitchFrame[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    try { analyserRef.current?.disconnect() } catch { /* pass */ }
    analyserRef.current = null
    if (audioCtxRef.current?.state !== 'closed') {
      void audioCtxRef.current?.close()
    }
    audioCtxRef.current = null
    setCapturing(false)
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const start = useCallback(async () => {
    cleanup()
    setFrames([])
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0
      source.connect(analyser)
      analyserRef.current = analyser
      await ctx.resume()
      startTimeRef.current = ctx.currentTime
      setCapturing(true)
      const buf = new Float32Array(analyser.fftSize)
      timerRef.current = setInterval(() => {
        const a = analyserRef.current
        const c = audioCtxRef.current
        if (!a || !c) return
        a.getFloatTimeDomainData(buf)
        const f0 = detectPitchYIN(buf, c.sampleRate)
        const t = c.currentTime - startTimeRef.current
        setFrames(prev => [...prev, { t, f0 }])
      }, FRAME_INTERVAL)
    } catch {
      window.alert('Không thể truy cập microphone. Hãy cho phép quyền mic trong trình duyệt.')
    }
  }, [cleanup])

  const stop = useCallback(() => {
    cleanup()
  }, [cleanup])

  const reset = useCallback(() => {
    setFrames([])
  }, [])

  return { capturing, frames, start, stop, reset }
}