import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const signInWithGoogle = vi.fn()
const signInWithPassword = vi.fn()
const verifyTurnstileToken = vi.fn()

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    authError: null,
    loading: false,
    signInWithGoogle,
    signInWithPassword,
  }),
}))

vi.mock('../../components/SunnyMascotSvg', () => ({
  default: () => <div data-testid="sunny-mascot" />,
}))

vi.mock('./TurnstileWidget', () => ({
  default: ({ onToken }: { onToken: (token: string) => void }) => (
    <button type="button" onClick={() => onToken('valid-turnstile-token')}>
      Complete Turnstile
    </button>
  ),
}))

vi.mock('./turnstileVerification', () => ({
  TURNSTILE_SITE_KEY: 'test-site-key',
  verifyTurnstileToken: (...args: unknown[]) => verifyTurnstileToken(...args),
}))

describe('LoginPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    signInWithGoogle.mockReset()
    signInWithPassword.mockReset()
    signInWithPassword.mockResolvedValue(undefined)
    verifyTurnstileToken.mockReset()
    verifyTurnstileToken.mockResolvedValue(true)
  })

  it('accepts email and password text and submits them', async () => {
    const { container } = renderLoginPage()

    const email = screen.getByLabelText('Email')
    const password = screen.getByLabelText('Mật khẩu')

    expect(container.querySelectorAll('.login-page__ribbon')).toHaveLength(3)
    fireEvent.change(email, { target: { value: 'learner@example.com' } })
    fireEvent.change(password, { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Turnstile' }))
    fireEvent.submit(screen.getByRole('form', { name: 'Đăng nhập bằng email' }))

    expect(email).toHaveValue('learner@example.com')
    expect(password).toHaveValue('secret123')
    await waitFor(() => {
      expect(verifyTurnstileToken).toHaveBeenCalledWith('valid-turnstile-token')
      expect(signInWithPassword).toHaveBeenCalledWith('learner@example.com', 'secret123')
    })
  })

  it('does not run the existing login handler when Turnstile verification fails', async () => {
    verifyTurnstileToken.mockResolvedValue(false)
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'learner@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Mật khẩu'), {
      target: { value: 'secret123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Turnstile' }))
    fireEvent.submit(screen.getByRole('form', { name: 'Đăng nhập bằng email' }))

    await waitFor(() => {
      expect(verifyTurnstileToken).toHaveBeenCalledWith('valid-turnstile-token')
      expect(signInWithPassword).not.toHaveBeenCalled()
    })
  })
})
