import { Link } from 'react-router-dom'
import {
  BookOpen, PenLine, Headphones, GitBranch, Languages,
  Flame, BookMarked, FileText,
} from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import UserAvatar from '../components/UserAvatar'
import SunnyMascotSvg from '../components/SunnyMascotSvg'
import { useHomeStats } from '../features/home/useHomeStats'
import DailyGoalCard from '../features/home/DailyGoalCard'
import StreakCelebration from '../features/home/StreakCelebration'
import StudyActivityGrid from '../features/home/StudyActivityGrid'
import CheckInButton from '../features/home/CheckInButton'
import '../features/home/homePage.css'
import { useI18n } from '../lib/language'

const HOME_ACTION_KEYS = ['nav.vocab', 'nav.writing', 'nav.listening', 'home.translate', 'nav.mindmap'] as const
const HOME_DESC_KEYS = ['home.vocabDesc', 'home.writingDesc', 'home.listeningDesc', 'home.translateDesc', 'home.mindmapDesc'] as const

const QUICK_ACTIONS = [
  { to: '/app/vocab', icon: BookOpen, label: 'Từ vựng', desc: 'SRS & flashcard', color: 'var(--color-primary)' },
  { to: '/app/writing', icon: PenLine, label: 'Viết', desc: 'Thư viện Writing', color: 'var(--color-accent)' },
  { to: '/app/listening', icon: Headphones, label: 'Nghe', desc: 'Dictation', color: 'var(--color-primary)' },
  { to: '/app/writing/translate', icon: Languages, label: 'Dịch câu', desc: 'Luyện dịch IELTS', color: 'var(--color-accent)' },
  { to: '/app/mindmap', icon: GitBranch, label: 'MindMap', desc: 'AI expand', color: 'var(--color-primary)' },
]

function getGreeting(t: (key: string) => string): string {
  const h = new Date().getHours()
  if (h < 12) return t('home.greetingMorning')
  if (h < 18) return t('home.greetingAfternoon')
  return t('home.greetingEvening')
}

function getSubtitle({
  streak,
  wordsStudied,
  onboardingDone,
  t,
}: {
  streak: number
  wordsStudied: number
  onboardingDone: number
  t: (key: string) => string
}): string {
  if (onboardingDone < 2) return t('home.continue')
  if (streak >= 7) return `${streak} ${t('home.streak')} — ${t('home.continue')}`
  if (streak >= 3) return `${t('home.streak')} ${streak} — ${t('home.continue')}`
  if (wordsStudied > 100) return `${t('home.wordsStudied')}: ${wordsStudied} — ${t('home.continue')}`
  return t('home.continue')
}

function getMascotLine(streak: number, t: (key: string) => string): string {
  const h = new Date().getHours()
  if (streak >= 3) return t('home.streakLine').replace('{count}', String(streak))
  if (h < 12) return t('home.morningLine')
  if (h < 18) return t('home.afternoonLine')
  return t('home.eveningLine')
}

export default function HomePage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { wordsStudied, docCount, streak, onboardingDone } = useHomeStats()

  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'bạn'

  return (
    <div className="home-page">
      <div className="home-page-inner">
        <header className="home-page-header">
          <div className="min-w-0">
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
              {getGreeting(t)}, {name}
            </p>
            <h1 className="text-xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {getSubtitle({ streak, wordsStudied, onboardingDone, t })}
            </h1>
          </div>
          <div className="home-page-header-actions">
            <div className="home-sun-mascot" aria-hidden>
              <div className="home-sun-mascot__bubble">
                {getMascotLine(streak, t)}
              </div>
              <div className="home-sun-mascot__float">
                <SunnyMascotSvg className="home-sun-mascot__sun" />
              </div>
            </div>
            <CheckInButton compact />
            {user && <UserAvatar user={user} size="md" bordered />}
          </div>
        </header>

        <div className="home-page-columns">
          {/* Cột trái — hôm nay & tiến độ */}
          <div className="home-page-col">
            <div className="home-page-stats">
              <StatCard
                icon={BookMarked}
                value={wordsStudied}
                label={t('home.wordsStudied')}
                color="var(--color-primary)"
              />
              <StatCard
                icon={FileText}
                value={docCount}
                label={t('home.writing')}
                color="var(--color-accent)"
              />
              <StatCard
                icon={Flame}
                value={streak}
                label={t('home.streak')}
                color="var(--color-primary)"
                showFlameBadge={streak >= 3}
              />
            </div>

            <CheckInButton />

            <DailyGoalCard className="home-daily-goal" />
          </div>

          {/* Cột phải — học ngay & hoạt động */}
          <div className="home-page-col">
            <section>
              <div className="home-page-section-label">
                <span>{t('home.learnNow')}</span>
              </div>
              <div className="home-page-quick-grid">
                {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color }, i) => (
                  <Link
                    key={to}
                    to={to}
                    className={`home-quick-link${i === 0 ? ' home-quick-link--featured' : ''}`}
                  >
                    <div
                      className="home-quick-icon"
                      style={{ background: `color-mix(in srgb, ${color} 18%, transparent)` }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t(HOME_ACTION_KEYS[i])}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{t(HOME_DESC_KEYS[i])}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <StudyActivityGrid />
          </div>
        </div>
      </div>

      <StreakCelebration streak={streak} />
    </div>
  )
}

function StatCard({
  icon: Icon, value, label, color, showFlameBadge,
}: {
  icon: typeof BookOpen
  value: number
  label: string
  color: string
  showFlameBadge?: boolean
}) {
  return (
    <div className="home-stat-card">
      <div
        className="home-stat-card-accent"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        {showFlameBadge && <Flame size={16} style={{ color: 'var(--color-primary)' }} />}
      </div>
      <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {value.toLocaleString('vi-VN')}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}
