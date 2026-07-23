import { Link } from 'react-router-dom'
import {
  BookOpen, PenLine, Headphones, GitBranch, Languages,
  Flame, BookMarked, FileText,
} from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { useHomeStats } from '../features/home/useHomeStats'
import DailyGoalCard from '../features/home/DailyGoalCard'
import StreakCelebration from '../features/home/StreakCelebration'
import StudyActivityGrid from '../features/home/StudyActivityGrid'
import CheckInButton from '../features/home/CheckInButton'
import '../features/home/homePage.css'

const QUICK_ACTIONS = [
  { to: '/app/vocab', icon: BookOpen, label: 'Từ vựng', desc: 'SRS & flashcard', color: 'var(--color-primary)' },
  { to: '/app/writing', icon: PenLine, label: 'Viết', desc: 'Thư viện Writing', color: 'var(--color-accent)' },
  { to: '/app/listening', icon: Headphones, label: 'Nghe', desc: 'Dictation', color: 'var(--color-primary)' },
  { to: '/app/writing/translate', icon: Languages, label: 'Dịch câu', desc: 'Luyện dịch IELTS', color: 'var(--color-accent)' },
  { to: '/app/mindmap', icon: GitBranch, label: 'MindMap', desc: 'AI expand', color: 'var(--color-primary)' },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

function getSubtitle({
  streak,
  wordsStudied,
  onboardingDone,
}: {
  streak: number
  wordsStudied: number
  onboardingDone: number
}): string {
  if (onboardingDone < 2) return 'Hoàn thành checklist để bắt đầu hành trình'
  if (streak >= 7) return `${streak} ngày liên tiếp — bạn đang rất đều!`
  if (streak >= 3) return `Streak ${streak} ngày — tiếp tục phát huy!`
  if (wordsStudied > 100) return `Đã học ${wordsStudied} từ — tiếp tục thôi!`
  return 'Tiếp tục hành trình luyện thi của bạn'
}

export default function HomePage() {
  const { user } = useAuth()
  const { wordsStudied, docCount, streak, onboardingDone } = useHomeStats()

  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? 'bạn'

  return (
    <div className="home-page">
      <div className="home-page-inner">
        <header className="home-page-header">
          <div className="min-w-0">
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
              {getGreeting()}, {name}
            </p>
            <h1 className="text-xl font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {getSubtitle({ streak, wordsStudied, onboardingDone })}
            </h1>
          </div>
          <div className="home-page-header-actions">
            <CheckInButton compact />
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                className="w-10 h-10 rounded-full border-2 shrink-0"
                style={{ borderColor: 'var(--border-color)' }}
                alt=""
              />
            )}
          </div>
        </header>

        <div className="home-page-columns">
          {/* Cột trái — hôm nay & tiến độ */}
          <div className="home-page-col">
            <div className="home-page-stats">
              <StatCard
                icon={BookMarked}
                value={wordsStudied}
                label="Từ đã học"
                color="var(--color-primary)"
              />
              <StatCard
                icon={FileText}
                value={docCount}
                label="Bài viết"
                color="var(--color-accent)"
              />
              <StatCard
                icon={Flame}
                value={streak}
                label="Ngày liên tiếp"
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
                <span>Học ngay</span>
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
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
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