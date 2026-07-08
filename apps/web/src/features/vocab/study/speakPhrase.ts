import { speak, stop, mapRateToSpeed } from '../../listening/tts'

export type SpeakHandlers = { onStart?: () => void; onEnd?: () => void; onError?: () => void }
export type SpeakVariant = 'us' | 'uk'

/** Phát âm US/UK English qua Kokoro local; fallback Web Speech nếu server chưa chạy. */
export async function speakPhrase(
  text: string,
  rate = 0.85,
  handlers?: SpeakHandlers,
  variant: SpeakVariant = 'us',
): Promise<void> {
  if (!text.trim()) return
  stopSpeaking()
  handlers?.onStart?.()
  try {
    await speak(
      text,
      {
        speed: mapRateToSpeed(rate),
        lang: variant === 'uk' ? 'b' : 'a',
        onFallbackStart: () => handlers?.onStart?.(),
      },
      variant === 'uk' ? 'en-GB' : 'en-US',
    )
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