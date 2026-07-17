export const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAD3OvoKGgmLtnOJz'

const TURNSTILE_VERIFY_URL =
  import.meta.env.VITE_TURNSTILE_VERIFY_URL ||
  'https://turnstile-siteverify-ryan-english.ryan-license-worker.workers.dev'

interface TurnstileVerificationResponse {
  success?: boolean
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) return false
  const result = (await response.json()) as TurnstileVerificationResponse
  return result.success === true
}
