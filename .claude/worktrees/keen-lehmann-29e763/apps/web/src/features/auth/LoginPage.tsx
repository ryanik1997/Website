import { useAuth } from './AuthContext'
import { BookOpen } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth()

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8 flex flex-col items-center gap-6"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-primary)' }}
          >
            <BookOpen size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Ryan English
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Đăng nhập để bắt đầu học
            </p>
          </div>
        </div>

        {/* Google button */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border font-medium text-sm transition-colors disabled:opacity-50 hover:bg-[var(--bg-secondary)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <GoogleIcon />
          Tiếp tục với Google
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <a href="/terms" className="underline">Điều khoản sử dụng</a>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
