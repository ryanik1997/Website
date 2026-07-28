import { supabase } from '../../lib/supabase'

const APP_ENTRY = '/app/vocab'
const LANDING = '/'

let recoveryPromise: Promise<boolean> | null = null

export function hasOAuthCallbackInUrl(): boolean {
  const url = new URL(window.location.href)
  if (url.searchParams.has('code') || url.searchParams.has('error')) return true
  const raw = url.hash.slice(1)
  return raw.length > 0 && raw.includes('access_token=')
}

export function stripOAuthFromUrl(target = LANDING): void {
  window.history.replaceState({}, '', target)
}

function parseHashOAuth(): URLSearchParams | null {
  const raw = window.location.hash.slice(1)
  if (!raw || !raw.includes('access_token=') && !raw.includes('error=')) return null
  return new URLSearchParams(raw)
}

/**
 * Supabase implicit OAuth trả token trong hash (#access_token=...).
 * BrowserRouter dùng pathname — recover xong chuyển sang /app/vocab.
 */
export async function recoverOAuthSession(): Promise<boolean> {
  if (recoveryPromise) return recoveryPromise

  recoveryPromise = (async () => {
    const url = new URL(window.location.href)
    let success = false

    try {
      const code = url.searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
        window.history.replaceState({}, '', APP_ENTRY)
        success = true
        return true
      }

      const hashParams = parseHashOAuth()
      if (!hashParams) return false

      const oauthError = hashParams.get('error_description') ?? hashParams.get('error')
      if (oauthError && !hashParams.get('access_token')) {
        throw new Error(decodeURIComponent(oauthError.replace(/\+/g, ' ')))
      }

      const access_token = hashParams.get('access_token')
      const refresh_token = hashParams.get('refresh_token')
      if (!access_token || !refresh_token) {
        throw new Error('Thiếu token đăng nhập. Thử đăng nhập lại.')
      }

      const { error } = await supabase.auth.setSession({ access_token, refresh_token })
      if (error) throw error

      window.history.replaceState({}, '', APP_ENTRY)
      success = true
      return true
    } finally {
      if (!success && hasOAuthCallbackInUrl()) {
        stripOAuthFromUrl(LANDING)
      }
    }
  })()

  try {
    return await recoveryPromise
  } finally {
    recoveryPromise = null
  }
}