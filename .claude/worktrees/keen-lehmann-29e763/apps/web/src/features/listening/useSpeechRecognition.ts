import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionCtor = new () => SpeechRecognition

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition(lang = 'en-US') {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [supported, setSupported] = useState(false)
  const recRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    setSupported(!!getRecognitionCtor())
    return () => {
      recRef.current?.abort()
    }
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      window.alert('Trình duyệt không hỗ trợ nhận giọng nói (SpeechRecognition).')
      return
    }
    recRef.current?.abort()
    const rec = new Ctor()
    rec.lang = lang
    rec.interimResults = true
    rec.continuous = true
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      setTranscript(text.trim())
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec
    setTranscript('')
    setListening(true)
    rec.start()
  }, [lang])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  const reset = useCallback(() => {
    recRef.current?.abort()
    setListening(false)
    setTranscript('')
  }, [])

  return { listening, transcript, supported, start, stop, reset }
}