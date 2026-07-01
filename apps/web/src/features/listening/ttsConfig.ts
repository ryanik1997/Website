const TTS_SERVICE_URL_KEY = 'ryan-tts-service-url'
export const KOKORO_STATUS_KEY = 'ryan-kokoro-status'

/** Base URL của local TTS gateway (Node server chạy bằng `pnpm dev:server`). */
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

export function getTtsStartUrl(): string {
  return `${getTtsServiceUrl()}/api/tts/start`
}

export function rememberTtsServiceUrl(url: string): void {
  try {
    localStorage.setItem(TTS_SERVICE_URL_KEY, url)
  } catch {
    // Bỏ qua lỗi localStorage để không ảnh hưởng playback.
  }
}

export function rememberKokoroStatus(status: 'ready' | 'browser' | 'offline'): void {
  try {
    localStorage.setItem(KOKORO_STATUS_KEY, status)
  } catch {
    // Không block UI nếu localStorage không khả dụng.
  }
}

export function readRememberedKokoroStatus(): 'ready' | 'browser' | 'offline' | null {
  try {
    const value = localStorage.getItem(KOKORO_STATUS_KEY)
    return value === 'ready' || value === 'browser' || value === 'offline' ? value : null
  } catch {
    return null
  }
}
