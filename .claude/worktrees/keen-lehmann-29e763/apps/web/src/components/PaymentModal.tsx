import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, LoaderCircle, Check } from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { supabase } from '../lib/supabase'
import { SUPPORT_EMAIL } from '../lib/contact'

type NotifyState = 'idle' | 'sending' | 'done' | 'error'

interface Props {
  isOpen: boolean
  onClose: () => void
  planName: string
  planId: string
  price: string
}

function activationMailto(planName: string) {
  const subject = `Kích hoạt ${planName}`
  const body = `Tôi đã chuyển tiền kích hoạt gói ${planName}`
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function PaymentModal({ isOpen, onClose, planName, planId, price }: Props) {
  const { user } = useAuth()
  const email = user?.email ?? ''
  const [notifyState, setNotifyState] = useState<NotifyState>('idle')

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) setNotifyState('idle')
  }, [isOpen])

  async function notifyPayment() {
    if (!user?.id || !user.email) return
    setNotifyState('sending')
    try {
      const { error } = await supabase.functions.invoke('notify-payment', {
        body: {
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name ?? user.email,
          planId,
          price,
        },
      })
      if (error) throw error
      setNotifyState('done')
    } catch {
      setNotifyState('error')
    }
  }

  if (!isOpen) return null

  const transferNote = email
    ? `Ryan ${planName} ${email}`
    : `Ryan ${planName}`

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--text-primary) 40%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Thanh toán · {planName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <img
            src="/images/qr-payment.jpg"
            alt="QR chuyển khoản"
            className="w-full rounded-xl"
            style={{ border: '1px solid var(--border-color)' }}
          />

          <div
            className="rounded-xl px-4 py-3 text-sm flex flex-col gap-1.5"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            <p>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Số tiền:</span>{' '}
              {price}
            </p>
            <p>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Nội dung chuyển khoản:</span>{' '}
              &ldquo;{transferNote}&rdquo;
            </p>
            {!email && (
              <p className="text-xs">
                Chưa đăng nhập — hãy ghi thêm tên hoặc email của bạn vào nội dung chuyển khoản.
              </p>
            )}
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Sau khi chuyển, liên hệ {SUPPORT_EMAIL} hoặc bấm nút bên dưới để thông báo admin.
          </p>

          <a
            href={activationMailto(planName)}
            className="w-full py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            Đã chuyển tiền → Liên hệ ngay
          </a>

          {user && notifyState === 'done' ? (
            <p
              className="text-xs text-center flex items-center justify-center gap-1.5 font-medium"
              style={{ color: 'var(--color-accent)' }}
            >
              <Check size={14} />
              Đã gửi thông báo! Admin sẽ kích hoạt trong vài giờ.
            </p>
          ) : user && notifyState === 'error' ? (
            <p className="text-xs text-center" style={{ color: 'var(--color-accent)' }}>
              Lỗi gửi, vui lòng liên hệ email trực tiếp
            </p>
          ) : user && notifyState !== 'done' ? (
            <button
              type="button"
              onClick={() => void notifyPayment()}
              disabled={notifyState === 'sending'}
              className="w-full py-3 rounded-xl text-sm font-medium border transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                background: 'var(--bg-secondary)',
              }}
            >
              {notifyState === 'sending' ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Đang gửi…
                </>
              ) : (
                'Thông báo đã chuyển'
              )}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            Để sau
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}