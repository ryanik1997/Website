import { CalendarCheck, Check, Loader2 } from 'lucide-react'
import { useCheckIn } from './useCheckIn'

export default function CheckInButton({ compact = false }: { compact?: boolean }) {
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
        <span>{checkedInToday ? 'Đã điểm danh' : 'Điểm danh'}</span>
      </button>
    )
  }

  return (
    <div className="home-checkin-card">
      <div className="home-checkin-card-text">
        <p className="home-checkin-card-title">Điểm danh hôm nay</p>
        <p className="home-checkin-card-sub">
          {checkedInToday
            ? `Streak điểm danh: ${checkInStreak} ngày — quay lại ngày mai nhé!`
            : 'Một cú bấm để giữ thói quen học mỗi ngày'}
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
        <span>{checkedInToday ? 'Đã điểm danh' : 'Điểm danh'}</span>
      </button>
    </div>
  )
}