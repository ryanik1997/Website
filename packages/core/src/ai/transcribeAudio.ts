import type { AIProvider } from './provider'

export type TranscribeProvider = 'openai' | 'groq'

const ENDPOINTS: Record<TranscribeProvider, { url: string; model: string }> = {
  openai: {
    url: 'https://api.openai.com/v1/audio/transcriptions',
    model: 'whisper-1',
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/audio/transcriptions',
    model: 'whisper-large-v3',
  },
}

export const TRANSCRIBE_MAX_BYTES = 25 * 1024 * 1024

export function providerSupportsTranscription(provider: AIProvider): provider is TranscribeProvider {
  return provider === 'openai' || provider === 'groq'
}

export function transcribeProviderLabel(provider: TranscribeProvider): string {
  return provider === 'openai' ? 'OpenAI Whisper' : 'Groq Whisper'
}

/** Speech-to-text via OpenAI / Groq Whisper-compatible API. */
export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
}

export async function transcribeAudio(
  audio: Blob,
  apiKey: string,
  provider: TranscribeProvider,
  filename = 'audio.mp3',
): Promise<{ text: string; segments: TranscriptSegment[] }> {
  if (audio.size > TRANSCRIBE_MAX_BYTES) {
    throw new Error(`File quá lớn (tối đa ${Math.round(TRANSCRIBE_MAX_BYTES / 1024 / 1024)}MB).`)
  }

  const cfg = ENDPOINTS[provider]
  const form = new FormData()
  form.append('file', audio, filename)
  form.append('model', cfg.model)
  form.append('language', 'en')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'segment')

  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Phiên âm lỗi ${res.status}: ${detail.slice(0, 280)}`)
  }

  const data = (await res.json()) as { text?: string; segments?: TranscriptSegment[] }
  const text = (data.text ?? '').trim()
  if (!text) throw new Error('Không nhận được nội dung từ audio.')
  const segments = Array.isArray(data.segments)
    ? data.segments.filter(segment =>
        Number.isFinite(segment.start)
        && Number.isFinite(segment.end)
        && segment.end >= segment.start
        && typeof segment.text === 'string',
      )
    : []
  return { text, segments }
}

export interface TranscribeCredentials {
  provider: TranscribeProvider
  apiKey: string
}

/** Pick Groq/OpenAI key — ưu tiên provider đang chọn, rồi Groq, rồi OpenAI. */
export function resolveTranscribeCredentials(
  preferredProvider: AIProvider,
  keys: Partial<Record<AIProvider, string>>,
): TranscribeCredentials | null {
  const order: TranscribeProvider[] =
    providerSupportsTranscription(preferredProvider)
      ? [preferredProvider, preferredProvider === 'openai' ? 'groq' : 'openai']
      : ['groq', 'openai']

  for (const p of order) {
    const key = keys[p]?.trim()
    if (key) return { provider: p, apiKey: key }
  }
  return null
}