import { getTtsHealthUrl, getTtsSynthUrl } from './ttsConfig'

export interface SpeakOptions {
  speed?: number
  voice?: string
  lang?: 'a' | 'b'
  /** Fires when HTMLAudioElement metadata is ready and playback is about to start. */
  onPlaybackStart?: (audio: HTMLAudioElement) => void
  /** Fires when falling back to Web Speech (no HTMLAudioElement). */
  onFallbackStart?: () => void
  /** @deprecated Prefer RAF on getActiveAudio() — kept for compatibility */
  onTimeUpdate?: (current: number, duration: number) => void
}

export type TtsEngine = 'kokoro' | 'webspeech' | null

let currentAudio: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null
let currentUtt: SpeechSynthesisUtterance | null = null
let settleCurrent: (() => void) | null = null

let lastEngine: TtsEngine = null
let localReady: boolean | null = null
let localReadyCheckedAt = 0
const HEALTH_TTL_MS = 30_000

const prefetchCache = new Map<string, Blob>()

function clampSpeed(speed: number): number {
  return Math.max(0.55, Math.min(1.45, speed))
}

/** Map legacy Web Speech rate (0.6–0.9) to Kokoro speed. */
export function mapRateToSpeed(rate: number): number {
  if (rate <= 0.65) return 0.6
  if (rate >= 0.9) return 1
  return clampSpeed(rate)
}

function normalizeOptions(
  rateOrOptions?: number | SpeakOptions,
  lang?: string,
): SpeakOptions {
  if (typeof rateOrOptions === 'number') {
    return { speed: mapRateToSpeed(rateOrOptions), lang: lang === 'en-US' ? 'a' : 'b' }
  }
  return {
    speed: rateOrOptions?.speed ?? 1,
    voice: rateOrOptions?.voice,
    lang: rateOrOptions?.lang ?? 'b',
    onPlaybackStart: rateOrOptions?.onPlaybackStart,
    onFallbackStart: rateOrOptions?.onFallbackStart,
    onTimeUpdate: rateOrOptions?.onTimeUpdate,
  }
}

function cacheKey(text: string, options: SpeakOptions): string {
  return `${text.trim()}|${options.voice ?? 'default'}|${clampSpeed(options.speed ?? 1)}`
}

function cleanupAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio.ontimeupdate = null
    currentAudio.src = ''
    currentAudio = null
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
}

function settleSpeak() {
  if (settleCurrent) {
    const fn = settleCurrent
    settleCurrent = null
    currentUtt = null
    fn()
  }
}

function stopWebSpeech() {
  speechSynthesis.cancel()
  settleSpeak()
}

export function getActiveAudio(): HTMLAudioElement | null {
  return currentAudio
}

export function getLastEngine(): TtsEngine {
  return lastEngine
}

export function isLocalTtsReady(): boolean | null {
  return localReady
}

export async function checkTtsHealth(force = false): Promise<boolean> {
  const now = Date.now()
  if (!force && localReady != null && now - localReadyCheckedAt < HEALTH_TTL_MS) {
    return localReady
  }

  try {
    const res = await fetch(getTtsHealthUrl(), { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      localReady = false
      localReadyCheckedAt = now
      return false
    }
    const data = await res.json() as { ok?: boolean; kokoro?: { ready?: boolean; available?: boolean } }
    localReady = !!(data.ok && (data.kokoro?.ready ?? data.kokoro?.available))
    localReadyCheckedAt = now
    return localReady
  } catch (err) {
    console.warn('[tts] Local TTS health check failed:', err)
    localReady = false
    localReadyCheckedAt = now
    return false
  }
}

async function fetchAudioBlob(text: string, options: SpeakOptions): Promise<Blob> {
  const key = cacheKey(text, options)
  const cached = prefetchCache.get(key)
  if (cached) return cached

  const res = await fetch(getTtsSynthUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.trim(),
      voice: options.voice ?? 'default',
      speed: clampSpeed(options.speed ?? 1),
      lang: options.lang ?? 'b',
    }),
    signal: AbortSignal.timeout(300_000),
  })

  if (!res.ok) {
    let message = `TTS request failed (${res.status})`
    try {
      const data = await res.json() as { message?: string; error?: string }
      message = data.message || data.error || message
    } catch { /* pass */ }
    throw new Error(message)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('audio')) {
    throw new Error('TTS local chưa sẵn sàng — server trả về non-audio response')
  }

  const blob = await res.blob()
  if (!blob.size) throw new Error('TTS returned empty audio')
  return blob
}

async function playBlob(blob: Blob, options: SpeakOptions): Promise<void> {
  cleanupAudio()
  stopWebSpeech()

  const url = URL.createObjectURL(blob)
  currentObjectUrl = url
  const audio = new Audio(url)
  currentAudio = audio

  await new Promise<void>((resolve, reject) => {
    const onMeta = () => {
      audio.removeEventListener('error', onErr)
      resolve()
    }
    const onErr = () => {
      audio.removeEventListener('loadedmetadata', onMeta)
      reject(new Error('Audio load failed'))
    }
    if (audio.readyState >= 1) resolve()
    else {
      audio.addEventListener('loadedmetadata', onMeta, { once: true })
      audio.addEventListener('error', onErr, { once: true })
    }
  })

  options.onPlaybackStart?.(audio)

  if (options.onTimeUpdate) {
    audio.ontimeupdate = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        options.onTimeUpdate!(audio.currentTime, audio.duration)
      }
    }
  }

  return new Promise((resolve, reject) => {
    audio.onended = () => {
      cleanupAudio()
      resolve()
    }
    audio.onerror = () => {
      cleanupAudio()
      reject(new Error('Audio playback failed'))
    }
    void audio.play().catch(err => {
      cleanupAudio()
      reject(err)
    })
  })
}

/** FALLBACK: browser Web Speech API when local Kokoro is unavailable. */
function speakWebSpeech(text: string, rate = 0.9, lang = 'en-US'): Promise<void> {
  return new Promise((resolve, reject) => {
    speechSynthesis.cancel()
    settleSpeak()

    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang
    utt.rate = rate
    utt.pitch = 1

    const voice = getBestEnglishVoice()
    if (voice) utt.voice = voice

    let done = false
    const finish = () => {
      if (done) return
      done = true
      settleCurrent = null
      currentUtt = null
      resolve()
    }

    utt.onend = finish
    utt.onerror = (e) => {
      if (done) return
      done = true
      settleCurrent = null
      currentUtt = null
      const err = (e as SpeechSynthesisErrorEvent).error
      if (err === 'interrupted' || err === 'canceled') resolve()
      else reject(e)
    }

    currentUtt = utt
    settleCurrent = finish

    const start = () => speechSynthesis.speak(utt)
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', start, { once: true })
    } else {
      start()
    }

    const words = text.trim().split(/\s+/).filter(Boolean).length
    const timeoutMs = Math.max(4000, ((words * 450) / rate) + 2500)
    window.setTimeout(finish, timeoutMs)
  })
}

export async function speak(
  text: string,
  rateOrOptions?: number | SpeakOptions,
  lang = 'en-US',
): Promise<void> {
  const options = normalizeOptions(rateOrOptions, lang)
  const legacyRate = typeof rateOrOptions === 'number' ? rateOrOptions : (options.speed ?? 1)

  try {
    const ready = await checkTtsHealth()
    if (ready) {
      const blob = await fetchAudioBlob(text, options)
      lastEngine = 'kokoro'
      await playBlob(blob, options)
      return
    }
    console.warn('[tts] Local Kokoro chưa sẵn sàng — fallback Web Speech API (tạm)')
  } catch (err) {
    console.warn('[tts] Local Kokoro lỗi — fallback Web Speech API (tạm):', err)
    localReady = false
    localReadyCheckedAt = Date.now()
  }

  // FALLBACK (tạm): Web Speech API khi `pnpm dev:server` chưa chạy hoặc Kokoro chưa ready
  lastEngine = 'webspeech'
  cleanupAudio()
  options.onFallbackStart?.()
  await speakWebSpeech(text, legacyRate, lang)
}

export function playSlow(text: string, voice?: string): Promise<void> {
  return speak(text, { speed: 0.6, voice, lang: 'b' })
}

export async function prefetch(text: string, options?: SpeakOptions): Promise<void> {
  const opts = normalizeOptions(options)
  const key = cacheKey(text, opts)
  if (prefetchCache.has(key)) return

  try {
    if (!(await checkTtsHealth())) return
    const blob = await fetchAudioBlob(text, opts)
    prefetchCache.set(key, blob)
  } catch (err) {
    console.warn('[tts] prefetch skipped:', err)
  }
}

export function stop() {
  cleanupAudio()
  stopWebSpeech()
}

export function isSpeaking() {
  return !!(currentAudio && !currentAudio.paused && !currentAudio.ended)
    || speechSynthesis.speaking
}

export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  return (
    voices.find(v => v.lang === 'en-GB' && v.localService) ??
    voices.find(v => v.lang === 'en-US' && v.localService) ??
    voices.find(v => v.lang.startsWith('en')) ??
    null
  )
}