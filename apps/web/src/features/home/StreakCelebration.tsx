import { useCallback, useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { useDailyGoal } from './useDailyGoal'
import { useI18n } from '../../lib/language'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function celebrateKey(): string {
  return `ryan-streak-celebrated-${todayKey()}`
}

const CONFETTI_COLORS = [
  'var(--color-primary)',
  'var(--color-accent)',
  'var(--text-muted)',
]

interface Props {
  streak: number
}

export default function StreakCelebration({ streak }: Props) {
  const { t } = useI18n()
  const { allDone } = useDailyGoal()
  const [visible, setVisible] = useState(false)

  const dismiss = useCallback(() => {
    localStorage.setItem(celebrateKey(), '1')
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!allDone) return
    if (localStorage.getItem(celebrateKey())) return
    setVisible(true)
  }, [allDone])

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(dismiss, 4000)
    return () => window.clearTimeout(timer)
  }, [visible, dismiss])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 streak-celebration-backdrop"
      style={{
        background: 'color-mix(in srgb, var(--text-primary) 35%, transparent)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={dismiss}
    >
      <style>{`
        @keyframes streak-confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes streak-pop-in {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .streak-confetti-piece {
          position: fixed;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: streak-confetti-fall linear forwards;
          pointer-events: none;
        }
        .streak-celebration-card {
          animation: streak-pop-in 0.35s ease-out forwards;
        }
      `}</style>

      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="streak-confetti-piece"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: '-5%',
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDuration: `${2.2 + (i % 5) * 0.4}s`,
            animationDelay: `${(i % 8) * 0.12}s`,
          }}
        />
      ))}

      <div
        className="streak-celebration-card w-full max-w-sm rounded-2xl border p-8 text-center shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}
        >
          <Flame size={40} style={{ color: 'var(--color-primary)' }} />
        </div>
        <p className="text-4xl font-black tabular-nums mb-2" style={{ color: 'var(--text-primary)' }}>
          {streak}
        </p>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('home.streakTitle')}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {t('home.streakMessage').replace('{count}', String(streak))}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  )
}
