import { Clock, RotateCcw } from 'lucide-react'
import { formatExamTimer } from './examTimer'
import './examShared.css'

interface Props {
  timeLeft: number
  onReset: () => void
}

export default function ExamTimerControls({ timeLeft, onReset }: Props) {
  return (
    <div className="exam-timer-controls">
      <div
        className={`exam-timer-controls__display${timeLeft <= 60 ? ' is-urgent' : ''}`}
        title="Thời gian còn lại"
      >
        <Clock size={15} aria-hidden />
        <span>{formatExamTimer(timeLeft)}</span>
      </div>
      <button
        type="button"
        className="exam-timer-controls__reset"
        onClick={onReset}
        title="Đặt lại thời gian"
        aria-label="Đặt lại thời gian"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  )
}