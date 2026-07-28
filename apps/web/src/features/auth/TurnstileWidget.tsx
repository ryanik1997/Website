import { useEffect, useRef } from 'react'

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script'
const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileRenderOptions = {
  sitekey: string
  action: string
  theme: 'auto'
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let turnstileScriptPromise: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (turnstileScriptPromise) return turnstileScriptPromise

  const promise = new Promise<TurnstileApi>((resolve, reject) => {
    const existingScript = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null
    const script = existingScript ?? document.createElement('script')

    const handleLoad = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile API was not initialized.'))
    }
    const handleError = () => reject(new Error('Unable to load Turnstile.'))

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.id = TURNSTILE_SCRIPT_ID
      script.setAttribute('data-cfasync', 'false')
      script.src = TURNSTILE_SCRIPT_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }).catch((error: unknown) => {
    turnstileScriptPromise = null
    throw error
  })

  turnstileScriptPromise = promise
  return promise
}

interface TurnstileWidgetProps {
  siteKey: string
  onToken: (token: string | null) => void
  onError: (message: string) => void
}

export default function TurnstileWidget({
  siteKey,
  onToken,
  onError,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    let widgetId: string | null = null

    void loadTurnstile()
      .then((turnstile) => {
        if (!active || !containerRef.current) return
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: 'turnstile-spin-v1',
          theme: 'auto',
          callback: (token) => {
            if (active) onToken(token)
          },
          'expired-callback': () => {
            if (active) onToken(null)
          },
          'error-callback': () => {
            if (!active) return
            onToken(null)
            onError('Không thể xác minh bảo mật. Vui lòng thử lại.')
          },
        })
      })
      .catch(() => {
        if (active) onError('Không thể tải lớp xác minh bảo mật.')
      })

    return () => {
      active = false
      onToken(null)
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId)
      }
    }
  }, [onError, onToken, siteKey])

  return (
    <div className="login-card__turnstile">
      <div ref={containerRef} data-action="turnstile-spin-v1" />
    </div>
  )
}
