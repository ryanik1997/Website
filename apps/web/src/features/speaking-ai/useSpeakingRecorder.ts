import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 60
type SpeechRecognitionCtor = new () => SpeechRecognition

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}

export function useSpeakingRecorder() {
  const [state, setState] = useState<'idle' | 'recording' | 'ready'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audio, setAudio] = useState<{ blob: Blob; url: string } | null>(null)
  const [transcript, setTranscript] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)
  const startedRef = useRef(0)
  const finalTranscriptRef = useRef('')

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    recognitionRef.current?.stop()
    recognitionRef.current = null
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  const start = useCallback(async () => {
    setError(null)
    const Recognition = getRecognitionCtor()
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined' || !Recognition) {
      setError('Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome hoặc Edge mới nhất.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      streamRef.current = stream
      const preferred = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined)
      const recognition = new Recognition()
      const chunks: Blob[] = []
      finalTranscriptRef.current = ''
      setTranscript('')
      recognition.lang = 'en-US'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ''
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const text = event.results[index][0]?.transcript ?? ''
          if (event.results[index].isFinal) finalTranscriptRef.current += `${text} `
          else interim += text
        }
        setTranscript(`${finalTranscriptRef.current}${interim}`.trim())
      }
      recognition.onerror = (event: Event) => {
        const reason = 'error' in event ? String(event.error) : ''
        if (reason === 'no-speech' || reason === 'aborted') return
        setError(reason === 'not-allowed' ? 'Bạn chưa cấp quyền nhận dạng giọng nói.' : 'Nhận dạng giọng nói bị gián đoạn. Hãy thử lại.')
      }
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || preferred || 'audio/webm' })
        setAudio(old => { if (old) URL.revokeObjectURL(old.url); return { blob, url: URL.createObjectURL(blob) } })
        setSeconds(Math.max(1, Math.min(MAX_SECONDS, Math.round((Date.now() - startedRef.current) / 1000))))
        setState('ready')
        cleanupStream()
      }
      recorderRef.current = recorder
      recognitionRef.current = recognition
      startedRef.current = Date.now()
      setSeconds(0)
      setState('recording')
      recognition.start()
      recorder.start(250)
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedRef.current) / 1000)
        setSeconds(elapsed)
        if (elapsed >= MAX_SECONDS) stop()
      }, 250)
    } catch (err) {
      cleanupStream()
      setError(err instanceof DOMException && err.name === 'NotAllowedError' ? 'Bạn chưa cấp quyền microphone.' : 'Không thể mở microphone hoặc nhận dạng giọng nói.')
      setState('idle')
    }
  }, [cleanupStream, stop])

  const reset = useCallback(() => {
    if (audio) URL.revokeObjectURL(audio.url)
    finalTranscriptRef.current = ''
    setAudio(null); setTranscript(''); setSeconds(0); setState('idle'); setError(null)
  }, [audio])

  useEffect(() => () => { cleanupStream(); if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); if (audio) URL.revokeObjectURL(audio.url) }, [audio, cleanupStream])
  return { state, seconds, error, audio, transcript, start, stop, reset, maxSeconds: MAX_SECONDS }
}
