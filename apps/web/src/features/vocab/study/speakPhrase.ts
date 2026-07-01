import { speak, stop, mapRateToSpeed } from '../../listening/tts'

export type SpeakHandlers = { onStart?: () => void; onEnd?: () => void; onError?: () => void }

/** Phát âm US English qua Kokoro local; fallback Web Speech nếu server chưa chạy. */
export async function speakPhrase(text: string, rate = 0.85, handlers?: SpeakHandlers): Promise<void> {
  if (!text.trim()) return
  stopSpeaking()
  handlers?.onStart?.()
  try {
    await speak(text, {
      speed: mapRateToSpeed(rate),
      lang: 'a',
      onFallbackStart: () => handlers?.onStart?.(),
    })
    handlers?.onEnd?.()
  } catch {
    handlers?.onError?.()
  }
}

export function stopSpeaking() {
  stop()
}

export const SPEECH_SPEEDS = {
  slow: 0.6,
  normal: 0.85,
  fast: 1.1,
} as const

export type SpeechSpeed = keyof typeof SPEECH_SPEEDS