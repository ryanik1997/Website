/** Base URL of the local Kokoro TTS gateway (Node server from `pnpm dev:server`). */
export function getTtsServiceUrl(): string {
  const raw = import.meta.env.VITE_TTS_SERVICE_URL?.trim()
  return raw || 'http://localhost:8787'
}

export function getTtsHealthUrl(): string {
  return `${getTtsServiceUrl()}/api/tts/health`
}

export function getTtsSynthUrl(): string {
  return `${getTtsServiceUrl()}/api/tts`
}