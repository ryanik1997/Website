/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TTS_SERVICE_URL?: string
  readonly VITE_MEDIA_MODE?: 'local' | 'signed'
  /** Exam content delivery source: 'legacy' (default) or 'r2'. */
  readonly VITE_EXAM_CONTENT_SOURCE?: 'legacy' | 'r2'
  /** Public R2 base URL (custom domain or r2.dev). No trailing slash. */
  readonly VITE_EXAM_CONTENT_BASE_URL?: string
  /** Manifest path or URL, e.g. /manifests/staging.json */
  readonly VITE_EXAM_CONTENT_MANIFEST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface SpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  error: 'interrupted' | 'canceled' | 'audio-busy' | 'audio-hardware' | 'network' | 'not-allowed' | 'synthesis-failed' | 'synthesis-unavailable' | 'text-too-long' | 'voice-unavailable' | 'language-unavailable'
}
