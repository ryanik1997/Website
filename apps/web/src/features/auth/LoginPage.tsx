import { FormEvent, useCallback, useState } from 'react'
import { useAuth } from './AuthContext'
import SunnyMascotSvg from '../../components/SunnyMascotSvg'
import TurnstileWidget from './TurnstileWidget'
import {
  TURNSTILE_SITE_KEY,
  verifyTurnstileToken,
} from './turnstileVerification'
import LegalFooter from '../../components/LegalFooter'
import './loginPage.css'

export default function LoginPage() {
  const { authError, signInWithGoogle, signInWithPassword, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)
  const busy = loading || submitting
  const handleTurnstileToken = useCallback((token: string | null) => {
    setTurnstileToken(token)
    if (token) setFormError(null)
  }, [])
  const handleTurnstileError = useCallback((message: string) => {
    setFormError(message)
  }, [])

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!email.trim() || !password) {
      setFormError('Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }
    if (!turnstileToken) {
      setFormError('Vui lòng hoàn tất bước xác minh bảo mật.')
      return
    }

    setSubmitting(true)
    try {
      const verified = await verifyTurnstileToken(turnstileToken)
      if (!verified) {
        setTurnstileToken(null)
        setTurnstileKey((current) => current + 1)
        setFormError('Xác minh bảo mật không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.')
        return
      }
      await signInWithPassword(email, password)
      // Turnstile tokens are single-use. A failed credential attempt must
      // receive a fresh challenge before the next submission.
      setTurnstileToken(null)
      setTurnstileKey((current) => current + 1)
    } catch {
      setTurnstileToken(null)
      setTurnstileKey((current) => current + 1)
      setFormError('Không thể kết nối dịch vụ xác minh bảo mật. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__grid" aria-hidden />
      <div className="login-page__ribbons" aria-hidden>
        <div className="login-page__ribbon login-page__ribbon--1" />
        <div className="login-page__ribbon login-page__ribbon--2" />
        <div className="login-page__ribbon login-page__ribbon--3" />
      </div>

      <div className="login-page__stage">
        <div className="login-page__sun-float" aria-hidden>
          <SunnyMascotSvg className="login-page__sun" />
        </div>

        <main className="login-card" aria-label="Đăng nhập Ryan English">
          <header className="login-card__top">
            <div className="login-card__brand">
              <div className="login-card__mark">R</div>
              <div>
                <p className="login-card__brand-name">Ryan English</p>
                <p className="login-card__brand-sub">IELTS · Cambridge · SRS</p>
              </div>
            </div>
            <div className="login-card__tabs" aria-hidden>
              <span className="login-card__tab login-card__tab--active">Đăng nhập</span>
              <span className="login-card__tab">Đăng ký</span>
            </div>
          </header>

          <section className="login-card__body">
            <p className="login-card__eyebrow">Vào lớp học</p>
            <h1>Chào mừng trở lại</h1>
            <p className="login-card__copy">
              Đăng nhập để đồng bộ tiến độ, streak và tiếp tục lộ trình học của bạn.
            </p>

            <form
              className="login-card__form"
              aria-label="Đăng nhập bằng email"
              onSubmit={handleEmailLogin}
            >
              <div className="login-card__field-group">
                <label htmlFor="login-email">Email</label>
                <div className="login-card__input">
                  <span aria-hidden>@</span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={busy}
                    required
                  />
                </div>
              </div>

              <div className="login-card__field-group">
                <div className="login-card__label-row">
                  <label htmlFor="login-password">Mật khẩu</label>
                  <span>Quên mật khẩu?</span>
                </div>
                <div className="login-card__input">
                  <span aria-hidden>•</span>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={busy}
                    required
                  />
                </div>
              </div>

              <TurnstileWidget
                key={turnstileKey}
                siteKey={TURNSTILE_SITE_KEY}
                onToken={handleTurnstileToken}
                onError={handleTurnstileError}
              />

              {(formError || authError) && (
                <p className="login-card__error" role="alert">
                  {formError || authError}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !turnstileToken}
                className="login-card__primary"
              >
                <span>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}</span>
                <span className="login-card__arrow">→</span>
              </button>
            </form>

            <div className="login-card__divider">
              <span>Hoặc tiếp tục với</span>
            </div>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="login-card__google"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>

            <p className="login-card__secure">Thông tin được bảo mật tuyệt đối</p>
            <LegalFooter compact />
          </section>
        </main>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}
