import { useState, useRef, useEffect, type CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { useAuth } from '../../features/auth/AuthContext'
import { SUPPORT_EMAIL, supportMailto } from '../../lib/contact'
import PaymentModal from '../../components/PaymentModal'
import {
  User, LogIn, UserPlus, ChevronDown, ArrowRight,
  BookOpen, PenLine, Headphones, GitBranch, BookMarked, WifiOff,
  Check, Mail, MessageCircle, Sparkles, GraduationCap,
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
      @keyframes sun-hero-enter {
        0% {
          transform: translate3d(240px, 28px, 0) scale(0.92);
          opacity: 0;
        }
        45% {
          transform: translate3d(168px, 20px, 0) scale(0.94);
          opacity: 0.45;
        }
        78% {
          transform: translate3d(48px, 7px, 0) scale(0.985);
          opacity: 0.9;
        }
        100% {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: 1;
        }
      }
      @keyframes sun-bubble-enter {
        0% {
          transform: translate3d(120px, 16px, 0) scale(0.94);
          opacity: 0;
        }
        55% {
          transform: translate3d(76px, 10px, 0) scale(0.96);
          opacity: 0.38;
        }
        100% {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: 1;
        }
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
      .sun-hero-enter {
        animation: sun-hero-enter 5.2s cubic-bezier(.22,.61,.2,1) both;
        will-change: transform, opacity;
      }
      .sun-bubble-enter {
        animation: sun-bubble-enter 3.1s cubic-bezier(.24,.62,.2,1) 1.35s both;
        will-change: transform, opacity;
      }
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

      @keyframes star-twinkle {
        0%, 100% { opacity: 0.9; transform: scale(1); }
        50%      { opacity: 0.28; transform: scale(0.7); }
      }
      @keyframes zzz-float {
        0%   { transform: translate(0, 0) scale(0.85); opacity: 0; }
        18%  { opacity: 1; }
        70%  { opacity: 0.9; }
        100% { transform: translate(-22px, -46px) scale(1.12); opacity: 0; }
      }
      @keyframes sleep-breathe {
        0%, 100% { transform: scaleY(1); }
        50%      { transform: scaleY(0.86); }
      }
      @keyframes moon-eye-flutter {
        0%, 92%, 100% { transform: scaleY(1); }
        95%           { transform: scaleY(0.55); }
      }

      .moon-star  { animation: star-twinkle 2.6s ease-in-out infinite; }
      .moon-zzz-1 { animation: zzz-float 3.4s ease-in-out infinite; }
      .moon-zzz-2 { animation: zzz-float 3.4s ease-in-out 0.75s infinite; }
      .moon-zzz-3 { animation: zzz-float 3.4s ease-in-out 1.5s infinite; }
      .moon-smile { transform-origin: 200px 268px; animation: sleep-breathe 3.8s ease-in-out infinite; }
      .moon-eye-l { transform-origin: 165px 218px; animation: moon-eye-flutter 5s ease-in-out infinite; }
      .moon-eye-r { transform-origin: 235px 218px; animation: moon-eye-flutter 5s ease-in-out infinite 0.08s; }

      /* ─ 3D Orbit — feature cards (5 stops) ─ */
      @keyframes orbit-spin {
        0%,   14%  { transform: rotateY(0deg); }
        20%,  34%  { transform: rotateY(-72deg); }
        40%,  54%  { transform: rotateY(-144deg); }
        60%,  74%  { transform: rotateY(-216deg); }
        80%,  94%  { transform: rotateY(-288deg); }
        100%       { transform: rotateY(-360deg); }
      }
      @keyframes card-spotlight {
        0%,  14% {
          opacity: 1;
          transform: scale(1.08);
          filter: brightness(1.06) saturate(1.08);
          box-shadow:
            0 26px 70px -8px color-mix(in srgb, var(--accent, #6366f1) 55%, transparent),
            0 12px 28px -6px color-mix(in srgb, var(--accent, #6366f1) 40%, transparent),
            0 2px 8px color-mix(in srgb, var(--accent, #6366f1) 22%, transparent),
            0 0 0 1px color-mix(in srgb, var(--accent, #6366f1) 45%, transparent) inset,
            0 1px 0 color-mix(in srgb, #ffffff 30%, transparent) inset;
        }
        20%, 94% {
          opacity: 0.9;
          transform: scale(0.96);
          filter: brightness(0.95) saturate(0.94);
          box-shadow:
            0 14px 34px -10px color-mix(in srgb, var(--accent, #6366f1) 28%, transparent),
            0 4px 12px -4px color-mix(in srgb, var(--accent, #6366f1) 18%, transparent),
            0 0 0 1px color-mix(in srgb, var(--accent, #6366f1) 22%, transparent) inset;
        }
        100% {
          opacity: 1;
          transform: scale(1.08);
          filter: brightness(1.06) saturate(1.08);
          box-shadow:
            0 26px 70px -8px color-mix(in srgb, var(--accent, #6366f1) 55%, transparent),
            0 12px 28px -6px color-mix(in srgb, var(--accent, #6366f1) 40%, transparent),
            0 2px 8px color-mix(in srgb, var(--accent, #6366f1) 22%, transparent),
            0 0 0 1px color-mix(in srgb, var(--accent, #6366f1) 45%, transparent) inset,
            0 1px 0 color-mix(in srgb, #ffffff 30%, transparent) inset;
        }
      }
      @keyframes card-halo {
        0%, 14%   { opacity: 1; transform: scale(1.15); }
        20%, 94%  { opacity: 0; transform: scale(0.85); }
        100%      { opacity: 1; transform: scale(1.15); }
      }
      @keyframes card-sheen {
        0%, 14%  { opacity: 0.9; background-position: 0% 0%; }
        20%, 94% { opacity: 0; background-position: 100% 100%; }
        100%     { opacity: 0.9; background-position: 0% 0%; }
      }
      @keyframes orbit-enter {
        0%   { opacity: 0; transform: translateY(24px) scale(0.94); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      .feature-orbit-viewport {
        position: relative;
        width: 100%;
        max-width: 485px;
        aspect-ratio: 2.1 / 1;
        margin-top: -21px;
        perspective: 1210px;
        perspective-origin: 50% 50%;
        animation: orbit-enter 900ms cubic-bezier(.22,.61,.2,1) 300ms both;
      }
      .feature-orbit-tilt {
        position: absolute;
        inset: 0;
        transform: rotateX(-9deg);
        transform-style: preserve-3d;
      }
      .feature-orbit-spin {
        position: absolute;
        inset: 0;
        transform-style: preserve-3d;
        animation: orbit-spin 17.5s cubic-bezier(.72,.02,.28,1) infinite;
        will-change: transform;
      }
      .feature-orbit-card {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 229px;
        height: 146px;
        margin: -73px 0 0 -114px;
        transform: rotateY(calc(var(--i) * 72deg)) translateZ(178px);
        transform-style: preserve-3d;
        will-change: transform;
      }
      .feature-orbit-card-halo {
        position: absolute;
        inset: -18px;
        border-radius: 28px;
        background:
          radial-gradient(
            60% 55% at 50% 50%,
            color-mix(in srgb, var(--accent, #6366f1) 55%, transparent) 0%,
            color-mix(in srgb, var(--accent, #6366f1) 22%, transparent) 45%,
            transparent 78%
          );
        filter: blur(18px);
        opacity: 0;
        z-index: 0;
        pointer-events: none;
        animation: card-halo 17.5s cubic-bezier(.4,.05,.2,1) infinite;
        animation-delay: calc(var(--i) * 3.5s - 17.5s);
        will-change: opacity, transform;
      }
      .feature-orbit-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 14px 16px;
        border-radius: 18px;
        background:
          linear-gradient(
            135deg,
            color-mix(in srgb, var(--accent, #6366f1) 14%, var(--bg-card)) 0%,
            color-mix(in srgb, var(--bg-card) 96%, transparent) 55%,
            color-mix(in srgb, var(--accent, #6366f1) 8%, var(--bg-card)) 100%
          );
        border: 1px solid color-mix(in srgb, var(--accent, #6366f1) 35%, var(--border-color));
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transform-origin: center;
        overflow: hidden;
        z-index: 1;
        animation: card-spotlight 17.5s cubic-bezier(.4,.05,.2,1) infinite;
        animation-delay: calc(var(--i) * 3.5s - 17.5s);
        will-change: opacity, transform, filter, box-shadow;
      }
      .feature-orbit-card-inner::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background:
          radial-gradient(
            120% 90% at 15% -10%,
            color-mix(in srgb, #ffffff 22%, transparent) 0%,
            transparent 55%
          ),
          linear-gradient(
            115deg,
            transparent 20%,
            color-mix(in srgb, var(--accent, #6366f1) 18%, transparent) 45%,
            transparent 70%
          );
        background-size: 200% 200%;
        pointer-events: none;
        animation: card-sheen 17.5s cubic-bezier(.4,.05,.2,1) infinite;
        animation-delay: calc(var(--i) * 3.5s - 17.5s);
        will-change: opacity, background-position;
      }
      .feature-orbit-card-inner > * {
        position: relative;
        z-index: 1;
      }
      .feature-orbit-viewport:hover .feature-orbit-spin,
      .feature-orbit-viewport:hover .feature-orbit-card-inner,
      .feature-orbit-viewport:hover .feature-orbit-card-halo,
      .feature-orbit-viewport:hover .feature-orbit-card-inner::before {
        animation-play-state: paused;
      }
      @media (prefers-reduced-motion: reduce) {
        .feature-orbit-spin,
        .feature-orbit-card-inner,
        .feature-orbit-card-halo { animation: none; }
        .feature-orbit-card-inner { opacity: 1; transform: scale(1); }
        .feature-orbit-card-halo { opacity: 0.6; }
      }
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

/* ── Theme detection ─────────────────────────────────────── */
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
function Hero() {
  const { signInWithGoogle } = useAuth()
  const heroRef = useRef<HTMLElement>(null)
  const theme = useThemeMode()
  const isNight = theme === 'dark' || theme === 'mid'

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

  const featuredProofs = FEATURES.slice(0, 5)

  function scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[calc(100dvh-72px)] items-center overflow-visible px-6 pt-12 pb-12 md:px-16 md:pt-16 md:pb-16 lg:px-24"
    >
      {/* Warm glow behind sun */}
      <div className="z-10 max-w-2xl flex-[1.1]">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>
          Nền tảng
        </p>
        <h1 className="mb-7 text-6xl font-black leading-[0.96] sm:text-7xl md:text-[5.5rem] lg:text-[6.5rem]" style={{ color: 'var(--text-primary)' }}>
          Luyện thi<br />
          <span style={{ color: 'var(--color-primary)' }}>IELTS/ CAMBRIDGE</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: 'var(--text-muted)' }}>
          Hệ thống học từ vựng SRS, luyện viết IELTS với AI chấm điểm,
          nghe dictation — tất cả trong một nền tảng.
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
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
            onClick={scrollToPricing}
            className="rounded-full border px-7 py-3.5 text-sm font-semibold transition-colors"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            Xem gói học
          </button>
        </div>
        {/* Mobile / tablet fallback: grid tĩnh */}
        <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
          {featuredProofs.map(({ icon: Icon, title, desc, accent }) => (
            <div
              key={title}
              className="rounded-2xl border p-4 backdrop-blur-sm"
              style={{
                background: 'color-mix(in srgb, var(--bg-card) 82%, transparent)',
                borderColor: 'color-mix(in srgb, var(--border-color) 82%, transparent)',
              }}
            >
              <div className="mb-2 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop: 3D Orbit auto-pause spotlight */}
        <div className="hidden md:block max-w-2xl">
          <FeatureOrbit items={featuredProofs} />
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-visible md:flex md:min-h-[720px]">
        <div className="sun-hero-enter absolute inset-0 pointer-events-none">
          <div
            className="sun-halo-a sun-parallax-halo absolute right-[6%] top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full"
            style={{
              background: isNight
                ? 'radial-gradient(circle, color-mix(in srgb, #CFDCFF 30%, transparent) 0%, color-mix(in srgb, #8CA0D8 12%, transparent) 34%, transparent 72%)'
                : 'radial-gradient(circle, color-mix(in srgb, #FFF3A3 36%, transparent) 0%, color-mix(in srgb, #FFD36A 14%, transparent) 34%, transparent 72%)',
            }}
          />
          <div
            className="sun-halo-b sun-parallax-halo absolute right-[-10%] top-[44%] h-[760px] w-[760px] -translate-y-1/2 rounded-full"
            style={{
              background: isNight
                ? 'radial-gradient(circle, color-mix(in srgb, #B9C8F0 16%, transparent) 0%, color-mix(in srgb, #7C8DC8 8%, transparent) 42%, transparent 78%)'
                : 'radial-gradient(circle, color-mix(in srgb, #FFE28A 18%, transparent) 0%, color-mix(in srgb, #FFDA5A 8%, transparent) 42%, transparent 78%)',
            }}
          />
          <div
            className="sun-parallax-halo absolute right-[-4%] top-1/2 h-[640px] w-[640px] -translate-y-1/2 rounded-full"
            style={{
              background: isNight
                ? 'radial-gradient(circle, color-mix(in srgb, #A9BCEA 22%, transparent) 0%, color-mix(in srgb, #8395C6 10%, transparent) 38%, transparent 74%)'
                : 'radial-gradient(circle, color-mix(in srgb, #FFDA5A 24%, transparent) 0%, color-mix(in srgb, #FFD36A 12%, transparent) 38%, transparent 74%)',
            }}
          />
        </div>
        <div className="sun-hero-enter relative z-10">
          {isNight ? <MoonIllustration /> : <SunIllustration />}
        </div>
      </div>
    </section>
  )
}

/* ── 3D Feature Orbit ────────────────────────────────────── */
type FeatureItem = typeof FEATURES[number]

function FeatureOrbit({ items }: { items: FeatureItem[] }) {
  return (
    <div className="feature-orbit-viewport" aria-hidden>
      <div className="feature-orbit-tilt">
        <div className="feature-orbit-spin">
          {items.map(({ icon: Icon, title, desc, accent }, i) => (
            <div
              key={title}
              className="feature-orbit-card"
              style={{ ['--i' as string]: i, ['--accent' as string]: accent } as CSSProperties}
            >
              <div className="feature-orbit-card-halo" aria-hidden />
              <div className="feature-orbit-card-inner">
                <div className="mb-1.5 flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)` }}
                  >
                    <Icon size={16} style={{ color: accent }} />
                  </div>
                  <h3
                    className="text-xs font-bold uppercase tracking-[0.12em]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </h3>
                </div>
                <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    <section id="pricing" className="px-6 md:px-16 lg:px-24 py-20" style={{ background: 'var(--bg-secondary)' }}>
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
  const [upgradeQrOpen, setUpgradeQrOpen] = useState(false)
  return (
    <>
    <footer
      className="px-6 md:px-16 lg:px-24 py-10 border-t"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="mb-2">
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Study with Genius</span>
            </div>
            <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Nền tảng luyện thi IELTS & Cambridge — học thông minh, offline-first.
            </p>
          </div>

          {/* Contact links */}
          <div className="flex flex-col sm:flex-row gap-4">
            {CONTACTS.map(({ icon: Icon, label, text, action }) => {
              const content = (
                <>
                  <Icon size={16} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{text}</p>
                  </div>
                </>
              )
              const commonClass = 'flex items-center gap-3 px-4 py-3 rounded-xl border transition-opacity hover:opacity-80 text-left'
              const commonStyle = { borderColor: 'var(--border-color)', background: 'var(--bg-card)' }
              if (action.kind === 'link') {
                return (
                  <a key={label} href={action.href} className={commonClass} style={commonStyle}>
                    {content}
                  </a>
                )
              }
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setUpgradeQrOpen(true)}
                  className={commonClass}
                  style={commonStyle}
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          <p>© {new Date().getFullYear()} Study with Genius. All rights reserved.</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-80 transition-opacity">Bảng giá</button>
            <a href={supportMailto()} className="hover:opacity-80 transition-opacity">Liên hệ</a>
          </div>
        </div>
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
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-qr-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, #000 65%, transparent)', backdropFilter: 'blur(6px)' }}
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
            loading="lazy"
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
    </div>
  )
}

/* ── Animated Sun ────────────────────────────────────────── */
function SunIllustration() {
  const RAYS = 16
  return (
    <svg
      viewBox="-40 -30 500 500"
      className="sun-parallax-main w-[188%] max-w-[52rem] overflow-visible drop-shadow-xl"
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

        <g className="sun-bubble sun-bubble-layer sun-bubble-enter">
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

/* ── Sleeping Moon (dark/mid theme) ──────────────────────── */
function MoonIllustration() {
  const STARS = 14
  const STAR_POS = Array.from({ length: STARS }).map((_, i) => {
    const angle = (i * 360 / STARS) * Math.PI / 180
    const radius = i % 3 === 0 ? 205 : i % 3 === 1 ? 224 : 192
    return {
      cx: 200 + radius * Math.cos(angle),
      cy: 235 + radius * Math.sin(angle),
      r: i % 2 === 0 ? 5 : 3.4,
      warm: i % 2 === 0,
      delay: (i * 0.18).toFixed(2),
    }
  })

  return (
    <svg
      viewBox="-40 -30 500 500"
      className="sun-parallax-main w-[188%] max-w-[52rem] overflow-visible drop-shadow-xl"
      fill="none"
    >
      <defs>
        <radialGradient id="moonBody" cx="42%" cy="38%" r="68%">
          <stop offset="0%"   stopColor="#FFF7DC" />
          <stop offset="55%"  stopColor="#E8D9AC" />
          <stop offset="100%" stopColor="#B0A079" />
        </radialGradient>
        <radialGradient id="moonGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#DDE6FF" stopOpacity="0.58" />
          <stop offset="52%"  stopColor="#A6B4E0" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#8090C0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonShade" cx="78%" cy="48%" r="72%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0" />
          <stop offset="55%"  stopColor="#000" stopOpacity="0" />
          <stop offset="85%"  stopColor="#000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.36" />
        </radialGradient>
        <filter id="moonBlur" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Ambient moon glow */}
      <circle className="sun-wrap" cx="200" cy="235" r="190" fill="url(#moonGlowGrad)" />

      <g className="sun-wrap">
        {/* Twinkling stars orbiting slowly (reuses sun-spin) */}
        <g className="sun-rays" filter="url(#moonBlur)">
          {STAR_POS.map((s, i) => (
            <g
              key={i}
              className="moon-star"
              style={{ transformOrigin: `${s.cx}px ${s.cy}px`, animationDelay: `${s.delay}s` }}
            >
              <path
                d={`M ${s.cx} ${s.cy - s.r * 2.2} L ${s.cx + s.r * 0.55} ${s.cy - s.r * 0.55} L ${s.cx + s.r * 2.2} ${s.cy} L ${s.cx + s.r * 0.55} ${s.cy + s.r * 0.55} L ${s.cx} ${s.cy + s.r * 2.2} L ${s.cx - s.r * 0.55} ${s.cy + s.r * 0.55} L ${s.cx - s.r * 2.2} ${s.cy} L ${s.cx - s.r * 0.55} ${s.cy - s.r * 0.55} Z`}
                fill={s.warm ? '#FFF3C0' : '#E6ECFF'}
                opacity="0.92"
              />
              <circle cx={s.cx} cy={s.cy} r={s.r * 0.35} fill="#FFFFFF" opacity="0.85" />
            </g>
          ))}
        </g>

        {/* Moon body */}
        <circle className="sun-body" cx="200" cy="235" r="145" fill="url(#moonBody)" />
        {/* Crescent phase shadow (subtle) */}
        <circle className="sun-body" cx="200" cy="235" r="145" fill="url(#moonShade)" />

        {/* Highlight */}
        <ellipse cx="168" cy="175" rx="30" ry="18"
          fill="white" opacity="0.32" transform="rotate(-30 168 175)" />

        {/* Craters for lunar texture */}
        <circle cx="150" cy="292" r="11" fill="#000" opacity="0.07" />
        <circle cx="115" cy="238" r="7"  fill="#000" opacity="0.06" />
        <circle cx="244" cy="308" r="6"  fill="#000" opacity="0.06" />
        <circle cx="272" cy="205" r="5"  fill="#000" opacity="0.05" />

        {/* Closed sleepy eyes */}
        <path className="moon-eye-l"
          d="M 150 220 Q 165 208 180 220"
          stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path className="moon-eye-r"
          d="M 220 220 Q 235 208 250 220"
          stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none" />
        {/* Eyelash hint */}
        <path d="M 148 224 L 143 229" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
        <path d="M 252 224 L 257 229" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />

        {/* Gentle peaceful smile */}
        <path className="moon-smile"
          d="M 178 268 Q 200 282 222 268"
          stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* Night-time blush */}
        <ellipse cx="138" cy="252" rx="16" ry="10" fill="#8CA0D8" opacity="0.32" />
        <ellipse cx="262" cy="252" rx="16" ry="10" fill="#8CA0D8" opacity="0.32" />

        {/* Floating Zzz (three staggered letters rising up-left) */}
        <g fontFamily="Inter,sans-serif" fontWeight="700">
          <text className="moon-zzz-1" x="140" y="88"  fontSize="26" fill="#FFF6D0" opacity="0.9">z</text>
          <text className="moon-zzz-2" x="108" y="52"  fontSize="34" fill="#FFF6D0" opacity="0.85">z</text>
          <text className="moon-zzz-3" x="70"  y="12"  fontSize="44" fill="#FFF6D0" opacity="0.8">Z</text>
        </g>

        {/* Speech bubble — sleeping message */}
        <g className="sun-bubble sun-bubble-layer sun-bubble-enter">
          <rect x="216" y="48" width="196" height="126" rx="22"
            fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1.5"
            filter="url(#moonBlur)" />
          <polygon points="232,174 252,174 240,194" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1" />
          <text x="234" y="80"  fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Đêm khuya cứ ngủ ngon giấc,</text>
          <text x="234" y="100" fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">còn hệ thống học tập và</text>
          <text x="234" y="120" fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">'thế giới' còn lại cứ để</text>
          <text x="234" y="140" fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Ryan bảo kê nhé!</text>
        </g>
      </g>
    </svg>
  )
}

