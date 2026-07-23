import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import LandingAboutContent from './LandingAboutContent'
import LandingBlogContent from './LandingBlogContent'
import LandingRoadmapContent from './LandingRoadmapContent'
import LegalFooter from '../../components/LegalFooter'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4'
const VIDEO_POSTER_SRC = '/landing-video-poster.jpg'
const VIDEO_LOAD_DELAY_MS = 3500

const NAV_LINKS = [
  { id: 'home', label: 'Trang chủ', href: '#', active: true },
  { id: 'path', label: 'Lộ trình học', href: '#lo-trinh' },
  { id: 'about', label: 'Về chúng tôi', href: '#ve-chung-toi' },
  { id: 'blog', label: 'Blog', href: '#blog' },
  { id: 'contact', label: 'Liên hệ', href: '#lien-he' },
]

const NAV_ITEM_CLASS =
  'liquid-glass-hover inline-flex items-center rounded-full px-4 py-2 text-sm transition-all hover:text-foreground focus-visible:text-foreground'
const NAV_BUTTON_CLASS = `${NAV_ITEM_CLASS} cursor-pointer border-0 bg-transparent`

const SERIF: React.CSSProperties = { fontFamily: 'var(--font-app)' }

/** QR thanh toán (copy từ Tainguyen/QR.jpg → public/) */
const PAYMENT_QR_SRC = '/QR.jpg'
/** QR Zalo liên hệ (copy từ Tainguyen/QR_zalo.jpg → public/) */
const CONTACT_QR_SRC = '/QR_zalo.jpg'
const pricingPlans = [
  {
    id: 'free',
    badge: '',
    name: 'Miễn phí',
    price: '0đ',
    subtitle: '',
    description: 'Bắt đầu học ngay, không cần thanh toán',
    features: [
      'Truy cập bài học cơ bản',
      'Luyện tập mỗi ngày',
      'Làm quen với phương pháp học',
    ],
    cta: 'Bắt đầu miễn phí',
    highlighted: false,
  },
  {
    id: '1-month',
    badge: '',
    name: '1 tháng',
    price: '79.000đ',
    subtitle: '',
    description: 'Phù hợp để học thử nghiêm túc',
    features: [
      'Mở toàn bộ nội dung học',
      'Luyện nghe, từ vựng, phản xạ',
      'Theo dõi tiến độ học tập',
    ],
    cta: 'Chọn gói 1 tháng',
    highlighted: false,
  },
  {
    id: '3-months',
    badge: 'Phổ biến',
    name: '3 tháng',
    price: '199.000đ',
    subtitle: 'Chỉ khoảng 66.000đ/tháng',
    description: 'Lựa chọn phù hợp nhất để duy trì thói quen học',
    features: [
      'Toàn bộ quyền lợi của gói 1 tháng',
      'Thời gian đủ dài để thấy tiến bộ rõ ràng',
      'Chi phí tiết kiệm hơn theo tháng',
    ],
    cta: 'Chọn gói phổ biến',
    highlighted: true,
  },
  {
    id: '12-months',
    badge: 'Tiết kiệm nhất',
    name: '12 tháng',
    price: '499.000đ',
    subtitle: 'Chỉ khoảng 41.000đ/tháng',
    description: 'Dành cho người muốn học lâu dài với chi phí tối ưu',
    features: [
      'Toàn bộ quyền lợi cao cấp',
      'Chi phí theo tháng thấp nhất',
      'Phù hợp để học bền vững lâu dài',
    ],
    cta: 'Chọn gói 12 tháng',
    highlighted: false,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, authError } = useAuth()
  const [pricingOpen, setPricingOpen] = useState(false)
  /** Gói đang chọn trong popup — mặc định gói 3 tháng (phổ biến) */
  const [selectedPlanId, setSelectedPlanId] = useState('3-months')
  /** Popup QR thanh toán cho gói trả phí */
  const [paymentPlanId, setPaymentPlanId] = useState<string | null>(null)
  /** Popup QR Zalo liên hệ (nav Liên hệ) */
  const [contactOpen, setContactOpen] = useState(false)
  /** Popup lộ trình học (nav Lộ trình học) */
  const [roadmapOpen, setRoadmapOpen] = useState(false)
  /** Popup về chúng tôi / lời nhắn tác giả */
  const [aboutOpen, setAboutOpen] = useState(false)
  /** Popup blog */
  const [blogOpen, setBlogOpen] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)

  const paymentPlan = paymentPlanId
    ? pricingPlans.find((p) => p.id === paymentPlanId) ?? null
    : null

  const anyModalOpen =
    pricingOpen ||
    Boolean(paymentPlanId) ||
    contactOpen ||
    roadmapOpen ||
    aboutOpen ||
    blogOpen

  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => setVideoSrc(VIDEO_SRC), VIDEO_LOAD_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!anyModalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (paymentPlanId) {
        setPaymentPlanId(null)
        return
      }
      if (contactOpen) {
        setContactOpen(false)
        return
      }
      if (roadmapOpen) {
        setRoadmapOpen(false)
        return
      }
      if (aboutOpen) {
        setAboutOpen(false)
        return
      }
      if (blogOpen) {
        setBlogOpen(false)
        return
      }
      setPricingOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [anyModalOpen, paymentPlanId, contactOpen, roadmapOpen, aboutOpen, blogOpen])

  const startFree = () => {
    navigate('/app')
  }

  const togglePricing = () => {
    setPaymentPlanId(null)
    setPricingOpen((open) => !open)
  }

  const openPaymentQr = (planId: string) => {
    setSelectedPlanId(planId)
    setPaymentPlanId(planId)
  }

  const closePaymentQr = () => setPaymentPlanId(null)

  const closeAllSideModals = () => {
    setPaymentPlanId(null)
    setPricingOpen(false)
    setContactOpen(false)
    setRoadmapOpen(false)
    setAboutOpen(false)
    setBlogOpen(false)
  }

  const openContact = () => {
    closeAllSideModals()
    setContactOpen(true)
  }

  const closeContact = () => setContactOpen(false)

  const openRoadmap = () => {
    closeAllSideModals()
    setRoadmapOpen(true)
  }

  const closeRoadmap = () => setRoadmapOpen(false)

  const openAbout = () => {
    closeAllSideModals()
    setAboutOpen(true)
  }

  const closeAbout = () => setAboutOpen(false)

  const openBlog = () => {
    closeAllSideModals()
    setBlogOpen(true)
  }

  const closeBlog = () => setBlogOpen(false)

  const blogModal =
    blogOpen &&
    createPortal(
      <div
        className="landing-pricing-overlay fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-title"
        data-landing-modal="blog"
      >
        <button
          type="button"
          className="landing-pricing-backdrop absolute inset-0"
          aria-label="Dong blog"
          onClick={closeBlog}
        />
        <div className="landing-payment-panel landing-blog-panel relative z-10 flex max-h-[min(94vh,920px)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
            <div>
              <h2
                id="blog-title"
                className="text-xl font-normal text-gray-900 sm:text-2xl"
                style={SERIF}
              >
                Blog
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Mẹo luyện thi & thói quen học — viết ngắn, dùng được ngay.
              </p>
            </div>
            <button
              type="button"
              onClick={closeBlog}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm transition-colors hover:bg-white"
              aria-label="Dong"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-5">
            <LandingBlogContent
              onCtaStudy={() => {
                closeBlog()
                void startFree()
              }}
            />
          </div>

          <div className="shrink-0 border-t border-black/5 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={closeBlog}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  const aboutModal =
    aboutOpen &&
    createPortal(
      <div
        className="landing-pricing-overlay fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        data-landing-modal="about"
      >
        <button
          type="button"
          className="landing-pricing-backdrop absolute inset-0"
          aria-label="Dong ve chung toi"
          onClick={closeAbout}
        />
        <div className="landing-payment-panel landing-about-panel relative z-10 flex max-h-[min(94vh,920px)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
            <div>
              <h2
                id="about-title"
                className="text-xl font-normal text-gray-900 sm:text-2xl"
                style={SERIF}
              >
                Về chúng tôi
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Lời nhắn từ Ryan tới bạn — người đang học.
              </p>
            </div>
            <button
              type="button"
              onClick={closeAbout}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm transition-colors hover:bg-white"
              aria-label="Dong"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-5">
            <LandingAboutContent />
          </div>

          <div className="shrink-0 border-t border-black/5 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={closeAbout}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  const roadmapModal =
    roadmapOpen &&
    createPortal(
      <div
        className="landing-pricing-overlay fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roadmap-title"
        data-landing-modal="roadmap"
      >
        <button
          type="button"
          className="landing-pricing-backdrop absolute inset-0"
          aria-label="Dong lo trinh"
          onClick={closeRoadmap}
        />
        <div className="landing-payment-panel landing-roadmap-panel relative z-10 flex max-h-[min(94vh,980px)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-black/5 px-5 py-4 sm:px-6">
            <div>
              <h2
                id="roadmap-title"
                className="text-xl font-normal text-gray-900 sm:text-2xl"
                style={SERIF}
              >
                Lộ trình học
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Tóm gọn thời gian để lên band IELTS — ước lượng trung bình.
              </p>
            </div>
            <button
              type="button"
              onClick={closeRoadmap}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-sm transition-colors hover:bg-white"
              aria-label="Dong"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-5">
            <LandingRoadmapContent />
          </div>

          <div className="shrink-0 border-t border-black/5 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={closeRoadmap}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  const contactModal =
    contactOpen &&
    createPortal(
      <div
        className="landing-pricing-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-qr-title"
        data-landing-modal="contact"
      >
        <button
          type="button"
          className="landing-pricing-backdrop absolute inset-0"
          aria-label="Dong lien he"
          onClick={closeContact}
        />
        <div className="landing-payment-panel relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h2
                id="contact-qr-title"
                className="text-xl font-normal text-gray-900 sm:text-2xl"
                style={SERIF}
              >
                Liên hệ Zalo
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Quét mã QR để nhắn tin / kết bạn Zalo với Ryan English.
              </p>
            </div>
            <button
              type="button"
              onClick={closeContact}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
              aria-label="Dong"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="flex flex-col items-center px-5 py-6 text-center">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <img
                src={CONTACT_QR_SRC}
                alt="QR Zalo Ryan English"
                className="h-auto w-full max-w-[280px] object-contain"
                width={280}
                height={280}
              />
            </div>
            <button
              type="button"
              onClick={closeContact}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  const paymentModal =
    paymentPlan &&
    createPortal(
      <div
        className="landing-pricing-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-qr-title"
        data-landing-modal="payment"
      >
        <button
          type="button"
          className="landing-pricing-backdrop absolute inset-0"
          aria-label="Dong thanh toan"
          onClick={closePaymentQr}
        />
        <div className="landing-payment-panel relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h2
                id="payment-qr-title"
                className="text-xl font-normal text-gray-900 sm:text-2xl"
                style={SERIF}
              >
                Thanh toán gói {paymentPlan.name}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Quét mã QR để chuyển khoản{' '}
                <span className="font-semibold text-gray-900">{paymentPlan.price}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={closePaymentQr}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
              aria-label="Dong"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <div className="flex flex-col items-center px-5 py-6 text-center">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <img
                src={PAYMENT_QR_SRC}
                alt={`QR thanh toan goi ${paymentPlan.name}`}
                className="h-auto w-full max-w-[280px] object-contain"
                width={280}
                height={280}
              />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
              Sau khi chuyển khoản, giữ biên lai và liên hệ Ryan để kích hoạt gói{' '}
              <strong className="text-gray-900">{paymentPlan.name}</strong>.
            </p>
            {paymentPlan.subtitle ? (
              <p className="mt-2 text-sm font-medium text-blue-700">{paymentPlan.subtitle}</p>
            ) : null}
            <button
              type="button"
              onClick={closePaymentQr}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Đã quét xong / Đóng
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <div
      className="landing-hero relative min-h-screen w-full overflow-x-hidden"
      style={{ fontFamily: 'var(--font-app)' }}
    >
      <style>{LANDING_CSS}</style>

      {/* Fullscreen background video */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={videoSrc ?? undefined}
        poster={VIDEO_POSTER_SRC}
        preload="none"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex max-w-7xl flex-row items-center justify-between gap-4 px-4 py-6 sm:px-8">
        <a
          href="/"
          className="shrink-0 text-2xl tracking-tight text-foreground sm:text-3xl"
          style={SERIF}
        >
          Ryan English<sup className="text-xs">®</sup>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            if (link.id === 'contact') {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openContact()
                  }}
                  className={`${NAV_BUTTON_CLASS} text-muted-foreground`}
                >
                  {link.label}
                </button>
              )
            }
            if (link.id === 'path') {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openRoadmap()
                  }}
                  className={`${NAV_BUTTON_CLASS} text-muted-foreground`}
                >
                  {link.label}
                </button>
              )
            }
            if (link.id === 'about') {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openAbout()
                  }}
                  className={`${NAV_BUTTON_CLASS} text-muted-foreground`}
                >
                  {link.label}
                </button>
              )
            }
            if (link.id === 'blog') {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    openBlog()
                  }}
                  className={`${NAV_BUTTON_CLASS} text-muted-foreground`}
                >
                  {link.label}
                </button>
              )
            }
            return (
              <a
                key={link.id}
                href={link.href}
                className={`${NAV_ITEM_CLASS} ${
                  link.active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        {/* Mobile: vẫn mở được Liên hệ */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            openContact()
          }}
          className="cursor-pointer border-0 bg-transparent p-0 text-sm text-muted-foreground transition-colors hover:text-foreground md:hidden"
        >
          Liên hệ
        </button>

        <button
          type="button"
          onClick={startFree}
          className="liquid-glass shrink-0 rounded-full px-4 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03] sm:px-6"
        >
          Vào lớp học
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center px-6 pb-24 pt-24 py-[80px] text-center">
        <div className="landing-hero__overlay" aria-hidden />
        <span
          className="landing-hero__content animate-fade-rise text-xs text-muted-foreground sm:text-sm"
          style={{ letterSpacing: '0.32em', textTransform: 'uppercase' }}
        >
          Nền tảng luyện thi IELTS · Cambridge
        </span>

        <h1
          className="landing-hero__content animate-fade-rise mt-6 max-w-6xl text-5xl font-normal leading-[0.98] text-foreground sm:text-7xl md:text-8xl"
          style={{ ...SERIF, letterSpacing: '-2.46px' }}
        >
          Where <em className="not-italic text-muted-foreground">fluency</em>{' '}
          rises <em className="not-italic text-muted-foreground">through</em>{' '}
          the practice.
        </h1>

        <p className="landing-hero__content animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Chúng tôi xây dựng công cụ cho những người học đêm khuya và kiên trì
          âm thầm. Ryan English gom SRS, dictation, chấm viết AI và đề thi
          Cambridge vào một không gian tập trung — để bạn chỉ cần làm việc của
          mình: học.
        </p>

        <div className="landing-hero__content animate-fade-rise-delay-2 mt-10 flex flex-col items-center gap-3 sm:mt-11 sm:flex-row sm:gap-3 md:mt-12 md:gap-4">
          <button
            type="button"
            onClick={startFree}
            className="liquid-glass cursor-pointer rounded-full px-8 py-3.5 text-base text-foreground transition-transform hover:scale-[1.03] sm:px-9 md:px-10 md:py-4"
          >
            Bắt đầu miễn phí →
          </button>
          <button
            type="button"
            onClick={togglePricing}
            aria-expanded={pricingOpen}
            aria-controls="pricing-modal"
            className="liquid-glass-hover landing-hero__surface cursor-pointer whitespace-nowrap rounded-full px-6 py-3.5 text-sm font-medium text-[color:var(--muted-on-image)] transition-all hover:text-[color:var(--text-on-image)] sm:px-7 sm:text-[15px] md:px-8 md:py-4 md:text-base"
          >
            {pricingOpen ? 'Đóng học phí' : 'Xem học phí'}
          </button>
        </div>

        <p
          className="landing-hero__content landing-hero__surface animate-fade-rise-delay-2 mt-6 max-w-lg rounded-2xl px-4 py-2.5 text-center text-[13px] italic leading-relaxed text-[color:var(--text-on-image)] sm:mt-7 sm:px-5 sm:text-sm md:mt-8"
          style={{ textWrap: 'balance' }}
        >
          "Bạn cứ việc focus… mọi việc đã có Ryan lo." — chú lính chì
        </p>

        {authError && (
          <p className="mt-6 max-w-md text-sm text-red-300">{authError}</p>
        )}
      </section>

      {/* Pricing popup — bấm mở/đóng chuyển qua lại */}
      {pricingOpen && (
        <div
          id="pricing-modal"
          className="landing-pricing-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pricing-title"
        >
          <button
            type="button"
            className="landing-pricing-backdrop absolute inset-0"
            aria-label="Đóng gói học"
            onClick={() => setPricingOpen(false)}
          />
          <div className="landing-pricing-panel relative z-10 flex max-h-[min(92vh,920px)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 px-5 py-4 sm:px-8 sm:py-5">
              <div>
                <h2
                  id="pricing-title"
                  className="text-2xl font-normal text-gray-900 sm:text-3xl"
                  style={SERIF}
                >
                  Gói học
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Chọn gói phù hợp — bắt đầu miễn phí hoặc nâng cấp khi sẵn sàng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPricingOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                aria-label="Đóng"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" role="listbox" aria-label="Chọn gói học">
                {pricingPlans.map((plan) => {
                  const selected = selectedPlanId === plan.id
                  return (
                    <div
                      key={plan.id}
                      role="option"
                      aria-selected={selected}
                      tabIndex={0}
                      onClick={() => setSelectedPlanId(plan.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedPlanId(plan.id)
                        }
                      }}
                      className={[
                        'relative flex h-full w-full cursor-pointer flex-col rounded-2xl border p-6 text-left shadow-sm transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
                        selected
                          ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600/30'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md',
                      ].join(' ')}
                    >
                      {plan.badge ? (
                        <div className="mb-4">
                          <span
                            className={[
                              'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                              selected || plan.highlighted
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700',
                            ].join(' ')}
                          >
                            {plan.badge}
                          </span>
                        </div>
                      ) : (
                        <div className="mb-4 h-7" />
                      )}

                      <div className="mb-2 text-xl font-bold text-gray-900">{plan.name}</div>
                      <div className="mb-1 text-3xl font-extrabold text-gray-900">{plan.price}</div>

                      {plan.subtitle ? (
                        <div className="mb-3 text-sm font-medium text-blue-700">{plan.subtitle}</div>
                      ) : (
                        <div className="mb-3 h-5" />
                      )}

                      <p className="mb-5 text-sm leading-6 text-gray-600">{plan.description}</p>

                      <ul className="mb-6 space-y-3 text-sm text-gray-700">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPlanId(plan.id)
                          if (plan.id === 'free') {
                            void startFree()
                            return
                          }
                          openPaymentQr(plan.id)
                        }}
                        className={[
                          'mt-auto inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                          selected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-900 text-white hover:bg-black',
                        ].join(' ')}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {blogModal}
      {aboutModal}
      {roadmapModal}
      {contactModal}
      {paymentModal}
      <LegalFooter onImage />
    </div>
  )
}

const LANDING_CSS = `
.landing-hero {
  --background: 201 100% 13%;
  --foreground: 0 0% 100%;
  --muted-foreground: 240 4% 66%;
  --surface-on-image: rgba(10, 15, 30, 0.3);
  --text-on-image: rgba(255, 255, 255, 0.92);
  --muted-on-image: rgba(226, 232, 240, 0.82);
  --text-on-image-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
  --primary: 0 0% 100%;
  --primary-foreground: 0 0% 4%;
  --secondary: 0 0% 10%;
  --muted: 0 0% 10%;
  --accent: 0 0% 10%;
  --border: 0 0% 18%;
  --input: 0 0% 18%;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
.landing-hero .text-foreground { color: hsl(var(--foreground)); }
.landing-hero .text-muted-foreground { color: hsl(var(--muted-foreground)); }
.landing-hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    to top,
    rgba(8, 12, 24, 0.88) 0%,
    rgba(8, 12, 24, 0.66) 28%,
    rgba(8, 12, 24, 0.3) 56%,
    rgba(8, 12, 24, 0.08) 76%,
    transparent 100%
  );
  pointer-events: none;
}
.landing-hero__content {
  position: relative;
  z-index: 2;
}
.landing-hero__surface {
  background: var(--surface-on-image);
  box-shadow: var(--text-on-image-shadow);
}

.landing-hero .liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.landing-hero .liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}

@keyframes fade-rise {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.landing-hero .animate-fade-rise { animation: fade-rise 0.8s ease-out both; }
.landing-hero .animate-fade-rise-delay { animation: fade-rise 0.8s ease-out 0.2s both; }
.landing-hero .animate-fade-rise-delay-2 { animation: fade-rise 0.8s ease-out 0.4s both; }

.landing-hero .liquid-glass-hover {
  position: relative;
  overflow: hidden;
  background: transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease;
}
.landing-hero .liquid-glass-hover::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.landing-hero .liquid-glass-hover:hover {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
.landing-hero .liquid-glass-hover:hover::before {
  opacity: 1;
}

.landing-pricing-overlay {
  animation: landing-pricing-in 0.22s ease-out both;
  pointer-events: auto;
}
.landing-pricing-backdrop {
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  background: rgba(8, 20, 36, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.landing-pricing-panel {
  background: #f8fafc;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
  animation: landing-pricing-panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.landing-payment-panel {
  animation: landing-pricing-panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
  pointer-events: auto;
}

/* CSS popup cũng inject global vì portal ra document.body */
body .landing-pricing-overlay {
  animation: landing-pricing-in 0.22s ease-out both;
}
body .landing-pricing-backdrop {
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  background: rgba(8, 20, 36, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
body .landing-payment-panel {
  animation: landing-pricing-panel-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
  pointer-events: auto;
}
@keyframes landing-pricing-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes landing-pricing-panel-in {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* —— Lộ trình học (UI thay ảnh mờ) —— */
.landing-roadmap-panel {
  background: #f3f7f4;
}
.landing-roadmap {
  color: #1a2e22;
  font-family: var(--font-app);
}
.landing-roadmap__hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
}
.landing-roadmap__title {
  margin: 0;
  font-size: clamp(1.65rem, 3.2vw, 2.35rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #14201a;
  text-wrap: balance;
}
.landing-roadmap__title em {
  font-style: italic;
  font-weight: 500;
  color: #3d6b4f;
}
.landing-roadmap__subtitle {
  margin: 0.65rem 0 0;
  max-width: 36ch;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #5c6f64;
}
.landing-roadmap__rules {
  min-width: min(100%, 240px);
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(45, 90, 62, 0.08);
  box-shadow: 0 8px 24px rgba(28, 55, 40, 0.05);
}
.landing-roadmap__rules-label {
  margin: 0 0 0.65rem;
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #e5f0e8;
  color: #2f5c40;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.landing-roadmap__rules-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.landing-roadmap__rules-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 0.84rem;
  line-height: 1.4;
  color: #33453b;
}
.landing-roadmap__rules-list li svg {
  flex-shrink: 0;
  margin-top: 0.12rem;
  color: #3f7a54;
}
.landing-roadmap__rules-list strong {
  font-weight: 700;
  color: #1a2e22;
}
.landing-roadmap__rules-eq {
  margin: 0 0.28rem;
  color: #7a8f82;
}
.landing-roadmap__table-wrap {
  margin-bottom: 1.35rem;
  padding: 0.85rem;
  border-radius: 1.15rem;
  background: #fff;
  border: 1px solid rgba(45, 90, 62, 0.07);
  box-shadow: 0 10px 28px rgba(28, 55, 40, 0.045);
}
.landing-roadmap__table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.landing-roadmap__table {
  --rm-col-1: minmax(5.5rem, 0.85fr);
  --rm-col-2: minmax(6.5rem, 1fr);
  --rm-col-3: minmax(7.5rem, 1.1fr);
  --rm-col-4: minmax(8.5rem, 1.25fr);
  --rm-col-5: minmax(9rem, 1.45fr);
  --rm-gap: 12px;
  --rm-arrow: 12px;
  min-width: 780px;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
/* Header + mỗi row dùng CÙNG template → align thẳng cột */
.landing-roadmap__trow {
  display: grid;
  grid-template-columns:
    var(--rm-col-1) var(--rm-arrow)
    var(--rm-col-2) var(--rm-arrow)
    var(--rm-col-3) var(--rm-arrow)
    var(--rm-col-4) var(--rm-arrow)
    var(--rm-col-5);
  column-gap: var(--rm-gap);
  align-items: stretch;
}
.landing-roadmap__trow--head {
  align-items: end;
  padding: 0 0 0.2rem;
  min-height: 2.4rem;
}
.landing-roadmap__th {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  text-align: center;
  padding: 0 0.2rem 0.35rem;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #7a8f82;
  line-height: 1.3;
  hyphens: none;
}
.landing-roadmap__th:last-child {
  justify-content: flex-start;
  text-align: left;
  padding-left: 0.7rem;
}
.landing-roadmap__th-gap {
  width: var(--rm-arrow);
  min-height: 1px;
}
.landing-roadmap__td {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 3.25rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.85rem;
  background: #f7faf8;
  border: 1px solid rgba(45, 90, 62, 0.06);
  font-size: 0.84rem;
  line-height: 1.35;
  color: #24352c;
  box-sizing: border-box;
}
.landing-roadmap__td--strong {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: #fff;
  box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset;
}
.landing-roadmap__td--meta {
  gap: 0.4rem;
  color: #3d5346;
  font-weight: 600;
  font-size: 0.8rem;
}
.landing-roadmap__td--meta svg {
  flex-shrink: 0;
  color: #5a8f6c;
}
.landing-roadmap__td--note {
  justify-content: flex-start;
  text-align: left;
  font-size: 0.78rem;
  color: #4a5f54;
  font-weight: 500;
}
.landing-roadmap__td-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--rm-arrow);
  color: #b0c2b6;
  font-size: 1.05rem;
  font-weight: 500;
  user-select: none;
  line-height: 1;
}
.landing-roadmap__source {
  margin: 0.75rem 0 0;
  padding: 0 0.25rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a9d92;
}
.landing-roadmap__stages {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 640px) {
  .landing-roadmap__stages {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1024px) {
  .landing-roadmap__stages {
    grid-template-columns: repeat(4, 1fr);
  }
}
.landing-roadmap__stage {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 1rem 1rem 0.95rem;
  border-radius: 1.15rem;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.landing-roadmap__stage:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(28, 55, 40, 0.08);
}
.landing-roadmap__stage--pink {
  background: linear-gradient(165deg, #fff1f3 0%, #fde8ec 100%);
  border-color: rgba(196, 90, 110, 0.12);
}
.landing-roadmap__stage--blue {
  background: linear-gradient(165deg, #eef5ff 0%, #e3eefc 100%);
  border-color: rgba(70, 120, 190, 0.14);
}
.landing-roadmap__stage--green {
  background: linear-gradient(165deg, #eef8f0 0%, #e2f1e6 100%);
  border-color: rgba(60, 130, 80, 0.14);
}
.landing-roadmap__stage--amber {
  background: linear-gradient(165deg, #fff7eb 0%, #fceed8 100%);
  border-color: rgba(180, 130, 50, 0.14);
}
.landing-roadmap__stage-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}
.landing-roadmap__stage-kicker {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7d72;
}
.landing-roadmap__stage-band {
  margin: 0.15rem 0 0;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: #1a2e22;
}
.landing-roadmap__stage--pink .landing-roadmap__stage-band { color: #9a3d52; }
.landing-roadmap__stage--blue .landing-roadmap__stage-band { color: #2f5f9e; }
.landing-roadmap__stage--green .landing-roadmap__stage-band { color: #2d6b45; }
.landing-roadmap__stage--amber .landing-roadmap__stage-band { color: #9a6a1a; }
.landing-roadmap__stage-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.landing-roadmap__stage--pink .landing-roadmap__stage-icon { color: #c45a6e; }
.landing-roadmap__stage--blue .landing-roadmap__stage-icon { color: #4a7fc0; }
.landing-roadmap__stage--green .landing-roadmap__stage-icon { color: #3d8f5c; }
.landing-roadmap__stage--amber .landing-roadmap__stage-icon { color: #c48a28; }
.landing-roadmap__stage-list {
  margin: 0 0 1rem;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}
.landing-roadmap__stage-list li {
  position: relative;
  padding-left: 0.95rem;
  font-size: 0.82rem;
  line-height: 1.4;
  color: #3a4a40;
  font-weight: 500;
}
.landing-roadmap__stage-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.45rem;
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 999px;
  opacity: 0.7;
}
.landing-roadmap__stage--pink .landing-roadmap__stage-list li::before { background: #c45a6e; }
.landing-roadmap__stage--blue .landing-roadmap__stage-list li::before { background: #4a7fc0; }
.landing-roadmap__stage--green .landing-roadmap__stage-list li::before { background: #3d8f5c; }
.landing-roadmap__stage--amber .landing-roadmap__stage-list li::before { background: #c48a28; }
.landing-roadmap__stage-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: auto;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.78rem;
  font-weight: 650;
  color: #24352c;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* —— Về chúng tôi / lời nhắn tác giả —— */
.landing-about-panel {
  background: #f6f4f0;
}
.landing-about {
  color: #1c1c1a;
  font-family: var(--font-app);
}
.landing-about__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  align-items: start;
}
@media (min-width: 768px) {
  .landing-about__grid {
    grid-template-columns: minmax(220px, 0.9fr) 1.25fr;
    gap: 1.75rem;
  }
}
.landing-about__photo-wrap {
  margin: 0;
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #dfe6ea;
  box-shadow: 0 16px 40px rgba(30, 40, 50, 0.12);
  aspect-ratio: 4 / 5;
}
.landing-about__photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}
.landing-about__photo-cap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 2.5rem 1rem 0.95rem;
  background: linear-gradient(to top, rgba(12, 18, 24, 0.78) 0%, rgba(12, 18, 24, 0) 100%);
  color: #fff;
}
.landing-about__name {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.landing-about__role {
  font-size: 0.78rem;
  opacity: 0.88;
  font-weight: 500;
}
.landing-about__kicker {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a72;
}
.landing-about__title {
  margin: 0 0 1rem;
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #141816;
  text-wrap: balance;
}
.landing-about__letter {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(30, 40, 35, 0.06);
  box-shadow: 0 8px 24px rgba(30, 40, 35, 0.04);
}
.landing-about__letter p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  color: #2c3330;
}
.landing-about__letter strong {
  font-weight: 700;
  color: #141816;
}
.landing-about__letter em {
  font-style: italic;
  color: #3d4a44;
}
.landing-about__signoff {
  margin-top: 0.25rem !important;
  font-weight: 600;
  color: #1a221e !important;
  line-height: 1.55 !important;
}
.landing-about__signoff span {
  font-size: 1.15rem;
  font-weight: 500;
  color: #24352c;
}
.landing-about__pillars {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.55rem;
}
@media (min-width: 520px) {
  .landing-about__pillars {
    grid-template-columns: 1fr;
  }
}
.landing-about__pillars li {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(30, 40, 35, 0.06);
}
.landing-about__pillars strong {
  font-size: 0.84rem;
  font-weight: 700;
  color: #1a2e22;
}
.landing-about__pillars span {
  font-size: 0.8rem;
  line-height: 1.45;
  color: #4a5a52;
}

/* —— Blog —— */
.landing-blog-panel {
  background: #f7f5f1;
}
.landing-blog {
  color: #1c1c1a;
  font-family: var(--font-app);
}
.landing-blog__intro {
  margin-bottom: 1.15rem;
}
.landing-blog__kicker {
  margin: 0 0 0.35rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a72;
}
.landing-blog__title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #141816;
  text-wrap: balance;
}
.landing-blog__lead {
  margin: 0;
  max-width: 48ch;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #5a6560;
}
.landing-blog__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.landing-blog__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  padding: 1rem 1.05rem;
  border-radius: 1rem;
  border: 1px solid rgba(30, 40, 35, 0.07);
  background: #fff;
  box-shadow: 0 6px 18px rgba(30, 40, 35, 0.04);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.landing-blog__card:hover {
  transform: translateY(-1px);
  border-color: rgba(45, 90, 62, 0.18);
  box-shadow: 0 12px 28px rgba(30, 40, 35, 0.07);
}
.landing-blog__card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}
.landing-blog__tag {
  display: inline-flex;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: #e8f0ea;
  color: #2f5c40;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.landing-blog__read {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #7a8a82;
}
.landing-blog__card-title {
  margin: 0 0 0.4rem;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: #141816;
}
.landing-blog__card-excerpt {
  margin: 0 0 0.75rem;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #4a5a52;
}
.landing-blog__card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
}
.landing-blog__date {
  font-size: 0.72rem;
  font-weight: 600;
  color: #8a9a92;
  font-variant-numeric: tabular-nums;
}
.landing-blog__more {
  font-size: 0.78rem;
  font-weight: 700;
  color: #2d5a40;
}
.landing-blog--detail .landing-blog__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 0.84rem;
  font-weight: 600;
  color: #3d5346;
  cursor: pointer;
}
.landing-blog--detail .landing-blog__back:hover {
  color: #1a2e22;
}
.landing-blog__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.65rem;
}
.landing-blog__detail-title {
  margin: 0 0 1rem;
  font-size: clamp(1.4rem, 2.6vw, 1.9rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #141816;
  text-wrap: balance;
}
.landing-blog__body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid rgba(30, 40, 35, 0.06);
}
.landing-blog__body p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.7;
  color: #2c3330;
}
.landing-blog__cta {
  margin-top: 1.1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: 0.9rem;
  background: #1a2e22;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}
.landing-blog__cta:hover {
  background: #0f1a14;
}
`
