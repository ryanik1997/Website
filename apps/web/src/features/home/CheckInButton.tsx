import { CalendarCheck, Check, Loader2 } from 'lucide-react'
import { useCheckIn } from './useCheckIn'
import { useI18n } from '../../lib/language'

export default function CheckInButton({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()
  const { checkedInToday, checkInStreak, checkIn, pending } = useCheckIn()

  async function handleClick() {
    await checkIn()
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={checkedInToday || pending}
        className="home-checkin-btn home-checkin-btn--compact"
        data-done={checkedInToday || undefined}
      >
        {pending ? (
          <Loader2 size={16} className="home-checkin-spin" />
        ) : checkedInToday ? (
          <Check size={16} />
        ) : (
          <CalendarCheck size={16} />
        )}
        <span>{checkedInToday ? t('home.checkedIn') : t('home.checkin')}</span>
      </button>
    )
  }

  return (
    <div className="home-checkin-card">
      <div className="home-checkin-card-text">
        <p className="home-checkin-card-title">{t('home.checkinTitle')}</p>
        <p className="home-checkin-card-sub">
          {checkedInToday
            ? t('home.checkinStreak').replace('{count}', String(checkInStreak))
            : t('home.checkinHint')}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={checkedInToday || pending}
        className="home-checkin-btn"
        data-done={checkedInToday || undefined}
      >
        {pending ? (
          <Loader2 size={18} className="home-checkin-spin" />
        ) : checkedInToday ? (
          <Check size={18} />
        ) : (
          <CalendarCheck size={18} />
        )}
        <span>{checkedInToday ? t('home.checkedIn') : t('home.checkin')}</span>
      </button>
    </div>
  )
}
