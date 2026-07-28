import { config } from '../config.js'
import type { KokoroDepsStatus, KokoroHealthStatus } from './types.js'
import { clampSpeed, normalizeVoice } from './voices.js'

export interface SynthRequest {
  text: string
  voice: string
  speed: number
  lang?: string
}

export interface SynthResult {
  audio: Buffer
  voiceUsed: string
  seconds: number | null
}

function baseUrl(): string {
  return `http://${config.kokoroHost}:${config.kokoroPort}`
}

async function fetchJson<T>(url: string, timeoutMs: number): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return await res.json() as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchKokoroHealth(timeoutMs = 1500): Promise<KokoroHealthStatus | null> {
  return fetchJson<KokoroHealthStatus>(`${baseUrl()}/health`, timeoutMs)
}

export async function fetchKokoroDeps(force = false, timeoutMs = 8000): Promise<KokoroDepsStatus | null> {
  const suffix = force ? '?force=1' : ''
  return fetchJson<KokoroDepsStatus>(`${baseUrl()}/deps${suffix}`, timeoutMs)
}

export async function synthesizeWithKokoro(req: SynthRequest): Promise<SynthResult> {
  const lang = req.lang === 'a' ? 'a' : 'b'
  const voice = normalizeVoice(req.voice, lang)
  const speed = clampSpeed(req.speed)
  const params = new URLSearchParams({
    text: req.text.trim(),
    lang,
    voice,
    speed: String(speed),
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.synthTimeoutMs)
  try {
    const res = await fetch(`${baseUrl()}/tts?${params.toString()}`, {
      signal: controller.signal,
    })

    const contentType = res.headers.get('content-type') ?? ''
    if (!res.ok) {
      let message = `Kokoro synth failed (${res.status})`
      if (contentType.includes('application/json')) {
        const data = await res.json() as { error?: string; message?: string }
        message = data.error || data.message || message
      }
      throw new Error(message)
    }

    if (!contentType.includes('audio')) {
      const text = await res.text()
      throw new Error(text || 'Kokoro returned non-audio response')
    }

    const audio = Buffer.from(await res.arrayBuffer())
    if (!audio.length) throw new Error('Kokoro returned empty audio')

    return {
      audio,
      voiceUsed: res.headers.get('x-ryan-tts-voice') || voice,
      seconds: res.headers.get('x-ryan-tts-seconds')
        ? Number(res.headers.get('x-ryan-tts-seconds'))
        : null,
    }
  } finally {
    clearTimeout(timer)
  }
}