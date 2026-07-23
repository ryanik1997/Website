import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function finish() {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const hashRaw = url.hash.slice(1)
        const hashParams = hashRaw ? new URLSearchParams(hashRaw) : null
        const accessToken = hashParams?.get('access_token')
        const refreshToken = hashParams?.get('refresh_token')

        setDebug(`code=${!!code} hash=${!!hashRaw} at=${!!accessToken}`)

        // 1. Try PKCE code exchange first
        if (code) {
          setDebug(prev => prev + ' → exchanging code...')
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeErr) {
            setDebug(prev => prev + ` exchange FAIL: ${exchangeErr.message}`)
            throw exchangeErr
          }
          setDebug(prev => prev + ' code OK')
        }

        // 2. Try implicit hash tokens
        if (accessToken && refreshToken) {
          setDebug(prev => prev + ' → setting session from hash...')
          const { error: setErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (setErr) {
            setDebug(prev => prev + ` setSession FAIL: ${setErr.message}`)
            throw setErr
          }
          setDebug(prev => prev + ' hash OK')
        }

        // 3. Check session
        const { data: { session } } = await supabase.auth.getSession()
        setDebug(prev => prev + ` session=${!!session}`)

        if (!cancelled) {
          if (session) {
            // Clean URL and go to app
            window.history.replaceState({}, '', '/app/vocab')
            navigate('/app', { replace: true })
          } else if (!code && !accessToken) {
            setError('Không có thông tin xác thực. URL: ' + window.location.href.slice(0, 100))
          }
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Lỗi xác thực'
          setError(`${msg} (debug: ${debug})`)
          setTimeout(() => navigate('/', { replace: true }), 5000)
        }
      }
    }

    finish()
    return () => { cancelled = true }
  }, [navigate])

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3" style={{ background: 'var(--bg-secondary)' }}>
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
      <p style={{ color: 'var(--text-muted)' }}>
        {error ? `Lỗi: ${error}` : 'Đang xác thực…'}
      </p>
      {debug && !error && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 400, textAlign: 'center' }}>
          {debug}
        </p>
      )}
    </div>
  )
}
