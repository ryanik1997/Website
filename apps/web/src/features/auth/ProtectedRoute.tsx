import { useAuth } from './AuthContext'
import LoginPage from './LoginPage'

/** Chỉ hoạt động ở dev: VITE_DEV_AUTH_BYPASS=1 để QA không cần Google login. */
const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === '1'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (DEV_BYPASS) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <>{children}</>
}
