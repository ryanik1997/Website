import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link } from 'react-router-dom'

import { useAuth } from '../../features/auth/AuthContext'
import { SUPPORT_EMAIL, supportMailto } from '../../lib/contact'
import PaymentModal from '../../components/PaymentModal'
import {
  User, LogIn, UserPlus, ChevronDown, ArrowRight,
  BookOpen, PenLine, Headphones, GitBranch, BookMarked, WifiOff,
  Check, Mail, MessageCircle, Sparkles, GraduationCap,
} from 'lucide-react'
import { HERO_MASCOT_MODE } from './landingHeroConfig'
import DictionaryBookScene from './DictionaryBookScene'
import { LegacySunStage, SunAnimationStyles } from './LegacySunMascot'
import './heroFeatureOrbit.css'

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
    icon: GraduationCap,
    title: 'Luyện thi Cambridge',
    desc: 'Cambridge 20-9 đầy đủ & Essential Words for the IELTS. Giao diện thi giống 100%.',
    accent: '#ef4444',
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

type ContactAction =
  | { kind: 'link'; href: string }
  | { kind: 'modal'; modal: 'upgrade-qr' }

const CONTACTS: Array<{
  icon: typeof Mail
  label: string
  text: string
  action: ContactAction
}> = [
  { icon: Mail, label: 'Email hỗ trợ', text: SUPPORT_EMAIL, action: { kind: 'link', href: supportMailto() } },
  { icon: MessageCircle, label: 'Nâng cấp gói', text: 'Liên hệ nâng cấp', action: { kind: 'modal', modal: 'upgrade-qr' } },
]

const PAY_PLAN_DATA: Record<'pro' | 'lifetime', { name: string; price: string }> = {
  pro: { name: 'Pro', price: '99.000đ/tháng' },
  lifetime: { name: 'Trọn đời', price: '599.000đ' },
}

export default function LandingPage() {
  const { user, loading, authError } = useAuth()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const [payModal, setPayModal] = useState<{ open: boolean; planId: PlanId }>({ open: false, planId: 'pro' })

  useEffect(() => {
    if (!loading && user) navigate('/app/vocab', { replace: true })
  }, [user, loading, navigate])

  const payPlan = payModal.planId === 'pro' || payModal.planId === 'lifetime'
    ? PAY_PLAN_DATA[payModal.planId]
    : null

  return (
    <div
      ref={pageRef}
      className="h-[100dvh] overflow-y-auto flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {HERO_MASCOT_MODE === 'sun' && <SunAnimationStyles />}
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
        <Hero scrollRootRef={pageRef} />
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

/* ── Header ─────────────────────────────────────────────── */
function Header() {
  const { user, loading } = useAuth()

  return (
    <header
      className="flex items-center justify-between px-6 md:px-8 py-4 border-b sticky top-0 z-40 backdrop-blur-md"
      style={{ borderColor: 'var(--border-color)', background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)' }}
    >
      <div className="flex items-center">
        <span className="font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Study with Genius</span>
      </div>
      <div className="flex items-center gap-2">
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
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Chào mừng bạn!</p>
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
        </div>
      )}
    </div>
  )
}

function useThemeMode() {
  const readTheme = () => {
    if (typeof document === 'undefined') return 'light'
    return document.documentElement.getAttribute('data-theme') ?? 'light'
  }
  const [theme, setTheme] = useState<string>(readTheme)
  useEffect(() => {
    const el = document.documentElement
    const sync = () => setTheme(el.getAttribute('data-theme') ?? 'light')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  return theme
}

/* ── Hero ────────────────────────────────────────────────── */
function Hero({ scrollRootRef }: { scrollRootRef: React.RefObject<HTMLDivElement | null> }) {
  const { signInWithGoogle } = useAuth()
  const heroRef = useRef<HTMLElement>(null)
  const theme = useThemeMode()
  const isNight = theme === 'dark' || theme === 'mid'
  const useSun = HERO_MASCOT_MODE === 'sun'
  const featuredProofs = FEATURES.slice(0, 5)

  useEffect(() => {
    if (!useSun) return
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
  }, [useSun])

  function scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[calc(100dvh-72px)] flex-col justify-center overflow-visible px-6 pt-8 pb-10 md:flex-row md:items-center md:px-16 md:pt-10 md:pb-12 lg:px-24"
    >
      {/* Copy + CTA — trái */}
      <div className="relative z-30 w-full max-w-xl flex-[1.05] overflow-visible">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>
          Nền tảng
        </p>
        <h1 className="mb-4 text-5xl font-black leading-[0.98] sm:text-6xl md:text-[3.5rem] lg:text-[4.1rem]" style={{ color: 'var(--text-primary)' }}>
          Luyện thi<br />
          <span style={{ color: 'var(--color-primary)' }}>IELTS / Cambridge</span>
        </h1>
        <p className="mb-5 max-w-md text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-muted)' }}>
          Từ vựng SRS, viết với AI, nghe dictation và luyện đề — một nền tảng offline-first.
        </p>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: 'var(--color-primary)',
              boxShadow: '0 8px 24px color-mix(in srgb, var(--color-primary) 35%, transparent)',
            }}
          >
            Bắt đầu miễn phí
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={scrollToPricing}
            className="rounded-full border px-7 py-3.5 text-sm font-semibold transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            Xem gói học
          </button>
        </div>

        {/* 5 card xoay dưới CTA — luôn hiện (mọi viewport ≥ sm) */}
        <div className="hero-orbit" aria-label="Tính năng nổi bật">
          <div className="hero-orbit__stage">
            {featuredProofs.map(({ icon: Icon, title, desc, accent }, i) => (
              <div
                key={title}
                className="hero-orbit__card"
                style={
                  {
                    '--i': String(i),
                    '--accent': accent,
                  } as CSSProperties
                }
              >
                <div className="hero-orbit__inner">
                  <div className="hero-orbit__icon">
                    <Icon size={14} />
                  </div>
                  <p className="hero-orbit__title">{title}</p>
                  <p className="hero-orbit__desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phải: sách từ điển + orbit — hoặc mặt trời backup */}
      {useSun ? (
        <LegacySunStage isNight={isNight} />
      ) : (
        <div
          className="relative z-10 mt-4 w-full flex-[1.2] md:mt-0 md:min-h-[640px] md:max-w-none lg:max-w-[560px] xl:max-w-[620px]"
          style={{ minHeight: 'min(66vh, 660px)' }}
        >
          <DictionaryBookScene features={featuredProofs} scrollRootRef={scrollRootRef} />
        </div>
      )}
    </section>
  )
}

/* ── Features (beat 2: đọc được sau hero) ───────────────── */
function FeaturesSection() {
  return (
    <section
      id="features"
      className="px-6 md:px-16 lg:px-24 py-16 md:py-20"
      style={{ background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 max-w-xl">
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            Mọi thứ bạn cần để luyện thi
          </h2>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Năm trụ cột quanh cuốn từ điển — học từ vựng, viết, nghe, mindmap và đề thi.
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
    <section id="pricing" className="px-6 md:px-16 lg:px-24 py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
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
                  opacity: active ? 1 : 0.78,
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
  const [upgradeQrOpen, setUpgradeQrOpen] = useState(false)
  return (
    <>
      <footer
        className="px-6 md:px-16 lg:px-24 py-10 border-t"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Study with Genius</span>
              <p className="text-sm max-w-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Nền tảng luyện thi IELTS & Cambridge — học thông minh, offline-first.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {CONTACTS.map(({ icon: Icon, label, text, action }) => {
                if (action.kind === 'link') {
                  return (
                    <a
                      key={label}
                      href={action.href}
                      className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                      <span>
                        <span className="block text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
                        {text}
                      </span>
                    </a>
                  )
                }
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setUpgradeQrOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium text-left transition-opacity hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>
                      <span className="block text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <p className="mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Study with Genius
          </p>
        </div>
      </footer>
      <UpgradeQrModal open={upgradeQrOpen} onClose={() => setUpgradeQrOpen(false)} />
    </>
  )
}

/* ── Upgrade QR Zalo Modal ───────────────────────────────── */
function UpgradeQrModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-qr-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: 'color-mix(in srgb, #000 65%, transparent)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          ×
        </button>

        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--color-primary)' }}>
            Liên hệ Zalo
          </p>
          <h3 id="upgrade-qr-title" className="mt-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Nâng cấp gói học
          </h3>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Quét mã QR bên dưới bằng ứng dụng Zalo để nhắn admin. Nhận báo giá và kích hoạt gói trong vòng vài phút.
          </p>
        </div>

        <div
          className="flex items-center justify-center rounded-xl border p-3"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
        >
          <img
            src="/images/qr-zalo.jpg"
            alt="QR Zalo — Liên hệ nâng cấp gói"
            className="h-64 w-64 rounded-lg object-contain"
            loading="eager"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={supportMailto('Nâng cấp gói Study with Genius')}
            className="flex-1 rounded-full border px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            Gửi email
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
