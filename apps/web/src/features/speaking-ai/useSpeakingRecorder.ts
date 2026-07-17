import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 60

export function useSpeakingRecorder() {
  const [state, setState] = useState<'idle' | 'recording' | 'ready'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audio, setAudio] = useState<{ blob: Blob; url: string } | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(0)

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const stop = useCallback(() => recorderRef.current?.state === 'recording' && recorderRef.current.stop(), [])

  const start = useCallback(async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Trình duyệt này chưa hỗ trợ ghi âm. Hãy thử Chrome hoặc Safari mới nhất.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      streamRef.current = stream
      const preferred = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined)
      const chunks: Blob[] = []
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || preferred || 'audio/webm' })
        setAudio(old => { if (old) URL.revokeObjectURL(old.url); return { blob, url: URL.createObjectURL(blob) } })
        setSeconds(Math.max(1, Math.min(MAX_SECONDS, Math.round((Date.now() - startedRef.current) / 1000))))
        setState('ready')
        cleanupStream()
      }
      recorderRef.current = recorder
      startedRef.current = Date.now()
      setSeconds(0)
      setState('recording')
      recorder.start(250)
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedRef.current) / 1000)
        setSeconds(elapsed)
        if (elapsed >= MAX_SECONDS) stop()
      }, 250)
    } catch (err) {
      cleanupStream()
      setError(err instanceof DOMException && err.name === 'NotAllowedError' ? 'Bạn chưa cấp quyền microphone.' : 'Không thể mở microphone.')
      setState('idle')
    }
  }, [cleanupStream, stop])

  const reset = useCallback(() => {
    if (audio) URL.revokeObjectURL(audio.url)
    setAudio(null); setSeconds(0); setState('idle'); setError(null)
  }, [audio])

  useEffect(() => () => { cleanupStream(); recorderRef.current?.stop(); if (audio) URL.revokeObjectURL(audio.url) }, [audio, cleanupStream])
  return { state, seconds, error, audio, start, stop, reset, maxSeconds: MAX_SECONDS }
}
