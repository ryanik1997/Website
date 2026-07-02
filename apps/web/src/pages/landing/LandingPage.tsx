import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { useAuth } from '../../features/auth/AuthContext'
import { SUPPORT_EMAIL, supportMailto } from '../../lib/contact'
import PaymentModal from '../../components/PaymentModal'
import {
  User, LogIn, UserPlus, ChevronDown, Bell, ArrowRight,
  BookOpen, PenLine, Headphones, GitBranch, BookMarked, WifiOff,
  Check, Mail, MessageCircle, Sparkles,
} from 'lucide-react'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Từ vựng SRS',
    desc: 'Flashcard 3 chế độ: Lặp lại, Trắc nghiệm, Đoán nghĩa. Thuật toán SM-2 ôn đúng lúc.',
    accent: '#F5850A',
  },
  {
    icon: PenLine,
    title: 'Viết IELTS + AI',
    desc: 'Task 1 & Task 2 với AI chấm band 4 tiêu chí. Feedback tiếng Việt, cache thông minh.',
    accent: '#6366f1',
  },
  {
    icon: Headphones,
    title: 'Nghe Dictation',
    desc: 'Luyện nghe chép chính tả từng từ. Cambridge packs + tạo bài từ văn bản của bạn.',
    accent: '#8b5cf6',
  },
  {
    icon: GitBranch,
    title: 'MindMap AI',
    desc: 'Sơ đồ tư duy radial layout. AI mở rộng nhánh ý tưởng — học chủ đề sâu hơn.',
    accent: '#22c55e',
  },
  {
    icon: BookMarked,
    title: 'Từ điển AI',
    desc: 'Tra từ IPA, collocations, synonyms. Lưu thẳng vào bộ thẻ — cache 30 ngày.',
    accent: '#f59e0b',
  },
  {
    icon: WifiOff,
    title: 'Offline-first',
    desc: 'Dữ liệu lưu cục bộ Dexie. Học mọi lúc, sync cloud khi có mạng.',
    accent: '#64748b',
  },
]

type PlanId = 'free' | 'pro' | 'lifetime'

const PLANS: Array<{
  id: PlanId
  name: string
  price: string
  shortPrice: string
  period: string
  highlight: boolean
  badge?: string
  features: string[]
  cta: string
}> = [
  {
    id: 'free',
    name: 'Free',
    price: '0đ',
    shortPrice: '0đ',
    period: 'mãi mãi',
    highlight: false,
    features: ['Từ vựng cơ bản', 'Mẫu câu', 'Cài đặt giao diện', 'Không giới hạn thời gian'],
    cta: 'Bắt đầu miễn phí',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '99.000đ',
    shortPrice: '99k',
    period: '/tháng',
    highlight: true,
    badge: 'Phổ biến nhất',
    features: ['SRS ôn tập đầy đủ', 'AI chấm Writing 20 lần/ngày', 'MindMap AI expand', 'Sao lưu & xuất dữ liệu'],
    cta: 'Nâng cấp Pro',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '599.000đ',
    shortPrice: '599k',
    period: 'một lần',
    highlight: false,
    features: ['Tất cả tính năng Pro', 'Không giới hạn AI', 'Không hết hạn', 'Cập nhật tính năng mới'],
    cta: 'Mua trọn đời',
  },
]

const CONTACTS = [
  { icon: Mail, label: 'Email hỗ trợ', href: supportMailto(), text: SUPPORT_EMAIL },
  { icon: MessageCircle, label: 'Nâng cấp gói', href: supportMailto('Nâng cấp gói Ryan English'), text: 'Liên hệ nâng cấp' },
]

const PAY_PLAN_DATA: Record<'pro' | 'lifetime', { name: string; price: string }> = {
  pro: { name: 'Pro', price: '99.000đ/tháng' },
  lifetime: { name: 'Trọn đời', price: '599.000đ' },
}

export default function LandingPage() {
  const { user, loading, authError } = useAuth()
  const navigate = useNavigate()
  const [payModal, setPayModal] = useState<{ open: boolean; planId: PlanId }>({ open: false, planId: 'pro' })

  useEffect(() => {
    if (!loading && user) navigate('/app/vocab', { replace: true })
  }, [user, loading, navigate])

  const payPlan = payModal.planId === 'pro' || payModal.planId === 'lifetime'
    ? PAY_PLAN_DATA[payModal.planId]
    : null

  return (
    <div
      className="h-[100dvh] overflow-y-auto flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      <SunAnimationStyles />
      <Header />
      {authError && (
        <div
          className="mx-6 md:mx-8 mt-4 px-4 py-3 rounded-xl border text-sm"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--color-primary)',
            color: 'var(--text-primary)',
          }}
        >
          Đăng nhập thất bại: {authError}
        </div>
      )}
      <main className="flex-1">
        <Hero />
        <FeaturesSection />
        <PricingSection onOpenPayment={planId => setPayModal({ open: true, planId })} />
      </main>
      <Footer />

      <PaymentModal
        isOpen={payModal.open && !!payPlan}
        onClose={() => setPayModal(prev => ({ ...prev, open: false }))}
        planName={payPlan?.name ?? 'Pro'}
        planId={payModal.planId}
        price={payPlan?.price ?? ''}
      />
    </div>
  )
}

/* ── CSS animations ─────────────────────────────────────── */
function SunAnimationStyles() {
  return (
    <style>{`
      @keyframes sun-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes sun-float {
        0%, 100% { transform: translate3d(0, 0px, 0); }
        25%      { transform: translate3d(8px, -10px, 0); }
        50%      { transform: translate3d(-6px, -28px, 0); }
        75%      { transform: translate3d(-10px, -12px, 0); }
      }
      @keyframes sun-pulse {
        0%, 100% { transform: scale(1); opacity: 0.96; }
        50%      { transform: scale(1.08); opacity: 0.82; }
      }
      @keyframes halo-drift-a {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.42; }
        50%      { transform: translate3d(18px, -20px, 0) scale(1.08); opacity: 0.58; }
      }
      @keyframes halo-drift-b {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.26; }
        50%      { transform: translate3d(-24px, 16px, 0) scale(0.94); opacity: 0.4; }
      }
      @keyframes ray-breathe {
        0%, 100% { stroke-width: 14px; opacity: 0.88; }
        50%      { stroke-width: 21px; opacity: 1; }
      }
      @keyframes bubble-pop {
        0%   { transform: scale(0.8) translateY(6px); opacity: 0; }
        60%  { transform: scale(1.04) translateY(-2px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      @keyframes blink {
        0%, 90%, 100% { transform: scaleY(1); }
        95%            { transform: scaleY(0.08); }
      }
      @keyframes smile-wiggle {
        0%, 100% { transform: rotate(0deg); }
        25%       { transform: rotate(3deg); }
        75%       { transform: rotate(-3deg); }
      }

      .sun-rays  { transform-origin: 200px 230px; animation: sun-spin 14s linear infinite; }
      .sun-body  { transform-origin: 200px 230px; animation: sun-pulse 3.5s ease-in-out infinite; }
      .sun-wrap  { animation: sun-float 5.6s cubic-bezier(.45,.05,.55,.95) infinite; }
      .sun-halo-a { animation: halo-drift-a 10s ease-in-out infinite; }
      .sun-halo-b { animation: halo-drift-b 13s ease-in-out infinite; }
      .sun-parallax-halo {
        transform: translate3d(calc(var(--sun-px, 0px) * 0.35), calc(var(--sun-py, 0px) * 0.35), 0);
        transition: transform 220ms ease-out;
        will-change: transform;
      }
      .sun-parallax-main {
        transform: translate3d(calc(var(--sun-px, 0px) * 0.7), calc(var(--sun-py, 0px) * 0.7), 0);
        transition: transform 180ms ease-out;
        will-change: transform;
      }
      .sun-bubble-layer {
        transform: translate3d(calc(var(--sun-px, 0px) * 1.1), calc(var(--sun-py, 0px) * 1.1), 0);
        transition: transform 200ms ease-out;
        will-change: transform;
      }
      .sun-eye-l { transform-origin: 165px 215px; animation: blink 4s ease-in-out infinite; }
      .sun-eye-r { transform-origin: 235px 215px; animation: blink 4s ease-in-out infinite 0.05s; }
      .sun-smile { transform-origin: 200px 255px; animation: smile-wiggle 4s ease-in-out infinite; }
      .sun-bubble { animation: bubble-pop 0.6s cubic-bezier(.34,1.56,.64,1) both; }
    `}</style>
  )
}

/* ── Header ─────────────────────────────────────────────── */
function Header() {
  const { user, loading } = useAuth()

  return (
    <header
      className="flex items-center justify-between px-6 md:px-8 py-4 border-b sticky top-0 z-40 backdrop-blur-md"
      style={{ borderColor: 'var(--border-color)', background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <span className="text-white text-xs font-bold">RE</span>
        </div>
        <span className="font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Ryan English</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors relative"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
        </button>
        {!loading && user ? <UserChip user={user} /> : <GuestMenu />}
      </div>
    </header>
  )
}

function UserChip({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const name = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Bạn'
  return (
    <Link
      to="/app/vocab"
      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-opacity hover:opacity-80"
      style={{ borderColor: 'var(--border-color)' }}
    >
      {user.user_metadata?.avatar_url ? (
        <img src={user.user_metadata.avatar_url} alt="" className="w-7 h-7 rounded-full" />
      ) : (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
        >
          {name[0]?.toUpperCase()}
        </div>
      )}
      <div className="text-left hidden sm:block">
        <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>{name}</p>
        <p className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--color-primary)' }}>Vào app →</p>
      </div>
    </Link>
  )
}

/* ── Guest dropdown ──────────────────────────────────────── */
function GuestMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { signInWithGoogle } = useAuth()

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <User size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>Khách</p>
          <p className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>KHÁCH</p>
        </div>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-xl z-50 overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="px-5 pt-5 pb-3">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Chào mừng bạn! 👋</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Đăng nhập để lưu kết quả và nhận lộ trình học cá nhân.
            </p>
          </div>
          <div className="px-3 pb-3 flex flex-col gap-1">
            <button
              onClick={() => { setOpen(false); signInWithGoogle() }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left"
              style={{ color: 'var(--text-primary)' }}
            >
              <LogIn size={17} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
              Đăng nhập tài khoản
            </button>
            <button
              onClick={() => { setOpen(false); signInWithGoogle() }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left"
              style={{ color: 'var(--text-primary)' }}
            >
              <UserPlus size={17} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
              Tạo tài khoản mới
            </button>
          </div>
          <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
              Thông tin bảo mật
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Hero ────────────────────────────────────────────────── */
function Hero() {
  const { signInWithGoogle } = useAuth()
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const heroEl: HTMLElement = hero

    function resetParallax() {
      heroEl.style.setProperty('--sun-px', '0px')
      heroEl.style.setProperty('--sun-py', '0px')
    }

    function handlePointerMove(event: PointerEvent) {
      if (window.innerWidth < 768) {
        resetParallax()
        return
      }

      const rect = heroEl.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      heroEl.style.setProperty('--sun-px', `${Math.max(-14, Math.min(14, nx * 28))}px`)
      heroEl.style.setProperty('--sun-py', `${Math.max(-10, Math.min(10, ny * 20))}px`)
    }

    resetParallax()
    heroEl.addEventListener('pointermove', handlePointerMove)
    heroEl.addEventListener('pointerleave', resetParallax)
    return () => {
      heroEl.removeEventListener('pointermove', handlePointerMove)
      heroEl.removeEventListener('pointerleave', resetParallax)
    }
  }, [])

  function scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={heroRef}
      className="flex items-center px-6 md:px-16 lg:px-24 pt-10 pb-16 md:pb-20 overflow-visible relative"
    >
      {/* Warm glow behind sun */}
      <div
        className="sun-halo-a sun-parallax-halo absolute right-[6%] top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 rounded-full pointer-events-none md:block"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, #FFF3A3 36%, transparent) 0%, color-mix(in srgb, #FFD36A 14%, transparent) 34%, transparent 72%)' }}
      />
      <div
        className="sun-halo-b sun-parallax-halo absolute right-[-10%] top-[44%] hidden h-[760px] w-[760px] -translate-y-1/2 rounded-full pointer-events-none md:block"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, #FFE28A 18%, transparent) 0%, color-mix(in srgb, #FFDA5A 8%, transparent) 42%, transparent 78%)' }}
      />
      <div
        className="sun-parallax-halo absolute right-[-4%] top-1/2 hidden w-[640px] h-[640px] -translate-y-1/2 rounded-full pointer-events-none md:block"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, #FFDA5A 24%, transparent) 0%, color-mix(in srgb, #FFD36A 12%, transparent) 38%, transparent 74%)' }}
      />

      <div className="flex-1 max-w-xl z-10">
        <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-primary)' }}>
          Nền tảng
        </p>
        <h1 className="text-5xl md:text-6xl font-black leading-[1.05] mb-6" style={{ color: 'var(--text-primary)' }}>
          Luyện thi<br />
          <span style={{ color: 'var(--color-primary)' }}>IELTS/ CAMBRIDGE</span>
        </h1>
        <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: 'var(--text-muted)' }}>
          Hệ thống học từ vựng SRS, luyện viết IELTS với AI chấm điểm,
          nghe dictation — tất cả trong một nền tảng.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{
              background: 'var(--color-primary)',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--color-primary) 35%, transparent)',
            }}
          >
            Bắt đầu miễn phí
            <ArrowRight size={16} />
          </button>
          <button
            onClick={scrollToFeatures}
            className="px-6 py-3 rounded-full border font-semibold text-sm transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            Tìm hiểu thêm
          </button>
        </div>
      </div>

      <div className="hidden md:flex flex-1 items-end justify-center h-full max-h-[520px] relative overflow-visible">
        <SunIllustration />
      </div>
    </section>
  )
}

/* ── Features ────────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section
      id="features"
      className="px-6 md:px-16 lg:px-24 py-20"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-primary)' }}>
            Tính năng
          </p>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Mọi thứ bạn cần để luyện thi
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Ryan lo phần còn lại — bạn chỉ việc focus vào học.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border transition-all hover:-translate-y-1"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 12px color-mix(in srgb, var(--text-primary) 4%, transparent)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `color-mix(in srgb, ${accent} 15%, transparent)` }}
              >
                <Icon size={20} style={{ color: accent }} />
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Pricing ─────────────────────────────────────────────── */
function PricingSection({ onOpenPayment }: { onOpenPayment: (planId: PlanId) => void }) {
  const { signInWithGoogle } = useAuth()
  const [selected, setSelected] = useState<PlanId>('pro')

  function handleCta(planId: PlanId) {
    if (planId === 'free') signInWithGoogle()
    else onOpenPayment(planId)
  }

  return (
    <section id="pricing" className="px-6 md:px-16 lg:px-24 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--color-primary)' }}>
            Bảng giá
          </p>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            Chọn gói phù hợp với bạn
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Bắt đầu miễn phí, nâng cấp khi cần AI và tính năng nâng cao.
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map(plan => {
            const active = selected === plan.id
            return (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => setSelected(plan.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(plan.id)
                  }
                }}
                className="relative flex cursor-pointer flex-col rounded-2xl border p-6 transition-all"
                style={{
                  background: active ? 'var(--bg-card)' : 'var(--bg-secondary)',
                  borderColor: active ? 'var(--color-primary)' : 'var(--border-color)',
                  boxShadow: active
                    ? '0 8px 32px color-mix(in srgb, var(--color-primary) 20%, transparent)'
                    : 'none',
                  opacity: active ? 1 : 0.72,
                  transform: active ? 'scale(1)' : 'scale(0.98)',
                }}
              >
                {plan.id === 'pro' && plan.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <Sparkles size={11} />
                    {plan.badge}
                  </span>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black" style={{ color: active ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                      {plan.price}
                    </span>
                    <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                  </div>
                </div>

                <ul className="flex-1 flex flex-col gap-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Check size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    handleCta(plan.id)
                  }}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={
                    active
                      ? { background: 'var(--color-primary)', color: '#fff' }
                      : { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }
                  }
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="px-6 md:px-16 lg:px-24 py-10 border-t"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}
              >
                <span className="text-white text-[10px] font-bold">RE</span>
              </div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Ryan English</span>
            </div>
            <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Nền tảng luyện thi IELTS & Cambridge — học thông minh, offline-first.
            </p>
          </div>

          {/* Contact links */}
          <div className="flex flex-col sm:flex-row gap-4">
            {CONTACTS.map(({ icon: Icon, label, href, text }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
              >
                <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{text}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div
          className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          <p>© {new Date().getFullYear()} Ryan English. All rights reserved.</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-80 transition-opacity">Tính năng</button>
            <button type="button" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-80 transition-opacity">Bảng giá</button>
            <a href={supportMailto()} className="hover:opacity-80 transition-opacity">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Animated Sun ────────────────────────────────────────── */
function SunIllustration() {
  const RAYS = 16
  return (
    <svg
      viewBox="-40 -30 500 500"
      className="sun-parallax-main w-full max-w-md overflow-visible drop-shadow-xl"
      fill="none"
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#FFDA5A" />
          <stop offset="100%" stopColor="#F5850A" />
        </radialGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#FFF6B8" stopOpacity="0.74" />
          <stop offset="52%"  stopColor="#FFE17A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFF3A3" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <circle className="sun-wrap" cx="200" cy="235" r="190" fill="url(#glowGrad)" />

      <g className="sun-wrap">
        <g className="sun-rays" filter="url(#glow)">
          {Array.from({ length: RAYS }).map((_, i) => {
            const angle = (i * 360 / RAYS) * Math.PI / 180
            const inner = 158
            const outer = i % 2 === 0 ? 196 : 182
            return (
              <line
                key={i}
                x1={200 + inner * Math.cos(angle)}
                y1={235 + inner * Math.sin(angle)}
                x2={200 + outer * Math.cos(angle)}
                y2={235 + outer * Math.sin(angle)}
                stroke={i % 2 === 0 ? '#FFCC00' : '#FFB300'}
                strokeWidth={i % 2 === 0 ? 16 : 10}
                strokeLinecap="round"
                className="ray-breathe"
              />
            )
          })}
        </g>

        <circle className="sun-body" cx="200" cy="235" r="145" fill="url(#bodyGrad)" />

        <ellipse cx="168" cy="175" rx="28" ry="18"
          fill="white" opacity="0.22" transform="rotate(-30 168 175)" />

        <ellipse className="sun-eye-l" cx="165" cy="218" rx="13" ry="13" fill="#1a1a1a" />
        <circle cx="160" cy="213" r="4" fill="white" opacity="0.6" />
        <ellipse className="sun-eye-r" cx="235" cy="218" rx="13" ry="13" fill="#1a1a1a" />
        <circle cx="230" cy="213" r="4" fill="white" opacity="0.6" />

        <path className="sun-smile"
          d="M 162 262 Q 200 295 238 262"
          stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" fill="none" />

        <ellipse cx="138" cy="248" rx="16" ry="10" fill="#FF7043" opacity="0.25" />
        <ellipse cx="262" cy="248" rx="16" ry="10" fill="#FF7043" opacity="0.25" />

        <g className="sun-bubble sun-bubble-layer">
          <rect x="228" y="58" width="168" height="98" rx="18"
            fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1.5"
            filter="url(#glow)" />
          <polygon points="242,156 260,156 248,174" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1" />
          <text x="246" y="86"  fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Việc của bạn là tỏa sáng và</text>
          <text x="246" y="102" fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">tập trung, còn hệ thống và</text>
          <text x="246" y="118" fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">'thế giới' còn lại cứ để</text>
          <text x="246" y="134" fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Ryan bảo kê!</text>
        </g>
      </g>
    </svg>
  )
}

