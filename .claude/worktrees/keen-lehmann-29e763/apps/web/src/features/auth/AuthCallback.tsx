import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function finish() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          if (!cancelled) {
            setError(exchangeError.message)
            setTimeout(() => navigate('/', { replace: true }), 3000)
          }
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled) {
        navigate(session ? '/app/vocab' : '/', { replace: true })
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
        {error ? `Lỗi xác thực: ${error}` : 'Đang xác thực…'}
      </p>
    </div>
  )
}