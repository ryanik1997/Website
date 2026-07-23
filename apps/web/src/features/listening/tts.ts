import {
  getTtsHealthUrl,
  getTtsStartUrl,
  getTtsSynthUrl,
  readRememberedKokoroStatus,
  rememberKokoroStatus,
  rememberTtsServiceUrl,
} from './ttsConfig'
import { getPreferredKokoroVoice, type KokoroLang } from './kokoroVoices'

export interface SpeakOptions {
  speed?: number
  voice?: string
  lang?: 'a' | 'b'
  onPlaybackStart?: (audio: HTMLAudioElement) => void
  onFallbackStart?: () => void
  onTimeUpdate?: (current: number, duration: number) => void
}

export type TtsEngine = 'kokoro' | 'webspeech' | null
export type KokoroUiStatus = 'checking' | 'starting' | 'ready' | 'browser' | 'offline'

interface TtsHealthResponse {
  ok?: boolean
  message?: string
  kokoro?: {
    ready?: boolean
    available?: boolean
    processRunning?: boolean
    lastError?: string | null
    installHint?: string | null
  }
}

interface TtsStartResponse {
  ok?: boolean
  message?: string
  kokoro?: {
    ready?: boolean
    available?: boolean
    processRunning?: boolean
    lastError?: string | null
    installHint?: string | null
  }
  manualCommand?: string
}

export interface KokoroStatusSnapshot {
  status: KokoroUiStatus
  engine: TtsEngine
  ready: boolean
  gatewayReachable: boolean
  processRunning: boolean
  message: string
  installHint?: string | null
  manualCommand?: string | null
  updatedAt: number
}

let currentAudio: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null
let currentUtt: SpeechSynthesisUtterance | null = null
let settleCurrent: (() => void) | null = null

let lastEngine: TtsEngine = null
let localReady: boolean | null = null
let localReadyCheckedAt = 0
const HEALTH_TTL_MS = 30_000

const prefetchCache = new Map<string, Blob>()
const statusListeners = new Set<(snapshot: KokoroStatusSnapshot) => void>()

let kokoroSnapshot: KokoroStatusSnapshot = buildInitialSnapshot()

function buildInitialSnapshot(): KokoroStatusSnapshot {
  const remembered = readRememberedKokoroStatus()
  if (remembered === 'ready') {
    return {
      status: 'ready',
      engine: lastEngine,
      ready: true,
      gatewayReachable: true,
      processRunning: true,
      message: 'Kokoro local đã sẵn sàng',
      installHint: null,
      manualCommand: null,
      updatedAt: Date.now(),
    }
  }
  if (remembered === 'browser') {
    return {
      status: 'browser',
      engine: 'webspeech',
      ready: false,
      gatewayReachable: true,
      processRunning: false,
      message: 'Đang dùng giọng trình duyệt',
      installHint: null,
      manualCommand: null,
      updatedAt: Date.now(),
    }
  }
  return {
    status: remembered === 'offline' ? 'offline' : 'checking',
    engine: null,
    ready: false,
    gatewayReachable: remembered !== 'offline',
    processRunning: false,
    message: remembered === 'offline'
      ? 'Chưa kết nối được local TTS gateway'
      : 'Đang kiểm tra Kokoro local',
    installHint: null,
    manualCommand: null,
    updatedAt: Date.now(),
  }
}

function emitStatus(next: Partial<KokoroStatusSnapshot>): KokoroStatusSnapshot {
  kokoroSnapshot = {
    ...kokoroSnapshot,
    ...next,
    updatedAt: Date.now(),
  }

  if (kokoroSnapshot.status === 'ready') rememberKokoroStatus('ready')
  else if (kokoroSnapshot.status === 'offline') rememberKokoroStatus('offline')
  else if (kokoroSnapshot.status === 'browser') rememberKokoroStatus('browser')

  for (const listener of statusListeners) listener(kokoroSnapshot)
  return kokoroSnapshot
}

export function subscribeKokoroStatus(listener: (snapshot: KokoroStatusSnapshot) => void): () => void {
  statusListeners.add(listener)
  listener(kokoroSnapshot)
  return () => {
    statusListeners.delete(listener)
  }
}

export function getKokoroStatusSnapshot(): KokoroStatusSnapshot {
  return kokoroSnapshot
}

function clampSpeed(speed: number): number {
  return Math.max(0.55, Math.min(1.45, speed))
}

export function mapRateToSpeed(rate: number): number {
  if (rate <= 0.55) return 0.5
  if (rate <= 0.65) return 0.6
  if (rate <= 0.8) return 0.75
  if (rate >= 0.9) return 1
  return clampSpeed(rate)
}

function resolveLang(rateOrOptions?: number | SpeakOptions, lang?: string): KokoroLang {
  if (typeof rateOrOptions === 'object' && rateOrOptions?.lang) return rateOrOptions.lang
  if (lang === 'en-US' || lang === 'a') return 'a'
  if (lang === 'en-GB' || lang === 'b') return 'b'
  // speak(text, 0.85) defaults third arg en-US → American
  if (typeof rateOrOptions === 'number') return lang === 'en-GB' ? 'b' : 'a'
  return 'b'
}

function normalizeOptions(rateOrOptions?: number | SpeakOptions, lang?: string): SpeakOptions {
  const langCode = resolveLang(rateOrOptions, lang)
  if (typeof rateOrOptions === 'number') {
    return {
      speed: mapRateToSpeed(rateOrOptions),
      lang: langCode,
      voice: getPreferredKokoroVoice(langCode),
    }
  }
  return {
    speed: rateOrOptions?.speed ?? 1,
    voice: rateOrOptions?.voice ?? getPreferredKokoroVoice(langCode),
    lang: langCode,
    onPlaybackStart: rateOrOptions?.onPlaybackStart,
    onFallbackStart: rateOrOptions?.onFallbackStart,
    onTimeUpdate: rateOrOptions?.onTimeUpdate,
  }
}

function cacheKey(text: string, options: SpeakOptions): string {
  return `${text.trim()}|${options.voice ?? 'default'}|${clampSpeed(options.speed ?? 1)}|${options.lang ?? 'b'}`
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

export function pauseActiveAudio(): boolean {
  if (!currentAudio) return false
  currentAudio.pause()
  return true
}

export function resumeActiveAudio(): Promise<void> | null {
  if (!currentAudio || currentAudio.ended) return null
  return currentAudio.play()
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
    rememberTtsServiceUrl(getTtsHealthUrl())
    const res = await fetch(getTtsHealthUrl(), { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      localReady = false
      localReadyCheckedAt = now
      emitStatus({
        status: 'browser',
        ready: false,
        gatewayReachable: true,
        processRunning: false,
        engine: lastEngine,
        message: `Local TTS gateway phản hồi ${res.status}`,
      })
      return false
    }

    const data = await res.json() as TtsHealthResponse
    const ready = !!(data.ok && (data.kokoro?.ready ?? data.kokoro?.available))
    localReady = ready
    localReadyCheckedAt = now

    emitStatus({
      status: ready ? 'ready' : 'browser',
      ready,
      gatewayReachable: true,
      processRunning: !!data.kokoro?.processRunning,
      engine: lastEngine,
      message: ready
        ? 'Kokoro local đã sẵn sàng'
        : (data.message ?? 'Kokoro chưa sẵn sàng, đang dùng Browser Voice'),
      installHint: data.kokoro?.installHint ?? null,
      manualCommand: 'pnpm dev:server',
    })

    return ready
  } catch (err) {
    console.warn('[tts] Local TTS health check failed:', err)
    localReady = false
    localReadyCheckedAt = now
    emitStatus({
      status: 'offline',
      ready: false,
      gatewayReachable: false,
      processRunning: false,
      engine: lastEngine,
      message: 'Không kết nối được local TTS gateway',
      installHint: 'Hãy chạy `pnpm dev:server` trong terminal để bật local TTS gateway.',
      manualCommand: 'pnpm dev:server',
    })
    return false
  }
}

export async function startKokoroServer(): Promise<KokoroStatusSnapshot> {
  emitStatus({
    status: 'starting',
    message: 'Đang khởi động Kokoro...',
  })

  try {
    const res = await fetch(getTtsStartUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(20_000),
    })

    if (!res.ok) {
      throw new Error(`Start request failed (${res.status})`)
    }

    const data = await res.json() as TtsStartResponse
    const ready = await checkTtsHealth(true)

    if (ready) {
      return emitStatus({
        status: 'ready',
        ready: true,
        gatewayReachable: true,
        processRunning: true,
        message: data.message ?? 'Kokoro local đang chạy',
        installHint: data.kokoro?.installHint ?? null,
        manualCommand: data.manualCommand ?? 'pnpm dev:server',
      })
    }

    return emitStatus({
      status: 'browser',
      ready: false,
      gatewayReachable: true,
      processRunning: !!data.kokoro?.processRunning,
      message: data.message ?? 'Kokoro chưa sẵn sàng sau khi start',
      installHint: data.kokoro?.installHint ?? null,
      manualCommand: data.manualCommand ?? 'pnpm dev:server',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return emitStatus({
      status: 'offline',
      ready: false,
      gatewayReachable: false,
      processRunning: false,
      message: `Không thể khởi động Kokoro: ${message}`,
      installHint: 'Nếu local TTS gateway chưa chạy, hãy mở terminal và chạy `pnpm dev:server`.',
      manualCommand: 'pnpm dev:server',
    })
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
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('audio')) {
    throw new Error('TTS local chưa sẵn sàng, server trả về non-audio response')
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
      emitStatus({
        status: 'ready',
        ready: true,
        gatewayReachable: true,
        processRunning: true,
        engine: 'kokoro',
        message: 'Đang phát bằng Kokoro local',
      })
      await playBlob(blob, options)
      return
    }
    console.warn('[tts] Local Kokoro chưa sẵn sàng, fallback Web Speech API')
  } catch (err) {
    console.warn('[tts] Local Kokoro lỗi, fallback Web Speech API:', err)
    localReady = false
    localReadyCheckedAt = Date.now()
  }

  lastEngine = 'webspeech'
  emitStatus({
    status: kokoroSnapshot.gatewayReachable ? 'browser' : 'offline',
    ready: false,
    engine: 'webspeech',
    message: kokoroSnapshot.gatewayReachable
      ? 'Đang dùng Browser Voice'
      : 'Kokoro chưa chạy, fallback Browser Voice',
  })
  cleanupAudio()
  options.onFallbackStart?.()
  await speakWebSpeech(text, legacyRate, lang)
}

export function playSlow(text: string, voice?: string): Promise<void> {
  return speak(text, {
    speed: 0.6,
    voice: voice ?? getPreferredKokoroVoice('b'),
    lang: 'b',
  })
}

export interface PlayAudioUrlOptions {
  /** HTMLAudioElement.playbackRate (0.5–1.5) */
  playbackRate?: number
  /** Seek start (seconds) on the file */
  startSec?: number
  /** Stop at (seconds) on the file */
  endSec?: number
  onPlaybackStart?: (audio: HTMLAudioElement) => void
}

/** Play a real MP3/M4A URL (dictation clips). Does not use Kokoro/TTS. */
export async function playAudioUrl(
  url: string,
  options: PlayAudioUrlOptions = {},
): Promise<void> {
  if (!url.trim()) throw new Error('Empty audio URL')

  cleanupAudio()
  stopWebSpeech()

  const audio = new Audio(url)
  audio.preload = 'auto'
  const rate = options.playbackRate ?? 1
  audio.playbackRate = Math.max(0.5, Math.min(1.5, rate))
  currentAudio = audio
  lastEngine = null

  await new Promise<void>((resolve, reject) => {
    const onMeta = () => {
      audio.removeEventListener('error', onErr)
      resolve()
    }
    const onErr = () => {
      audio.removeEventListener('loadedmetadata', onMeta)
      reject(new Error(`Audio load failed: ${url.slice(0, 80)}`))
    }
    if (audio.readyState >= 1) resolve()
    else {
      audio.addEventListener('loadedmetadata', onMeta, { once: true })
      audio.addEventListener('error', onErr, { once: true })
    }
  })

  if (options.startSec != null && Number.isFinite(options.startSec)) {
    try {
      audio.currentTime = Math.max(0, options.startSec)
    } catch {
      // ignore seek errors on some hosts
    }
  }

  options.onPlaybackStart?.(audio)

  return new Promise((resolve, reject) => {
    let stopped = false
    const finish = () => {
      if (stopped) return
      stopped = true
      cleanupAudio()
      resolve()
    }

    if (options.endSec != null && Number.isFinite(options.endSec)) {
      const end = options.endSec
      audio.ontimeupdate = () => {
        if (audio.currentTime >= end) {
          audio.pause()
          finish()
        }
      }
    }

    audio.onended = finish
    audio.onerror = () => {
      if (stopped) return
      stopped = true
      cleanupAudio()
      reject(new Error('Audio playback failed'))
    }
    void audio.play().catch(err => {
      if (stopped) return
      stopped = true
      cleanupAudio()
      reject(err)
    })
  })
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
    voices.find(v => v.lang === 'en-GB' && v.localService)
    ?? voices.find(v => v.lang === 'en-US' && v.localService)
    ?? voices.find(v => v.lang.startsWith('en'))
    ?? null
  )
}
