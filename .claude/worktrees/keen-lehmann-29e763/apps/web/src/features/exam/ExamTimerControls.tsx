import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Clock, Minus, Plus, RotateCcw } from 'lucide-react'
import {
  clampExamTimerSeconds,
  formatExamTimer,
  parseExamTimerInput,
} from './examTimer'
import './examShared.css'

interface Props {
  timeLeft: number
  onReset: () => void
  /** Chỉnh thời gian còn lại (giây) — user tùy ý */
  onChange?: (seconds: number) => void
}

const STEP_SECONDS = 60

export default function ExamTimerControls({ timeLeft, onReset, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const canEdit = typeof onChange === 'function'

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  const startEdit = () => {
    if (!canEdit) return
    setDraft(formatExamTimer(timeLeft))
    setEditing(true)
  }

  const commitEdit = () => {
    if (!canEdit) {
      setEditing(false)
      return
    }
    const parsed = parseExamTimerInput(draft)
    if (parsed != null) onChange(parsed)
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  const nudge = (delta: number) => {
    if (!canEdit) return
    onChange(clampExamTimerSeconds(timeLeft + delta))
  }

  return (
    <div className="exam-timer-controls">
      {canEdit && (
        <button
          type="button"
          className="exam-timer-controls__nudge"
          onClick={() => nudge(-STEP_SECONDS)}
          title="Giảm 1 phút"
          aria-label="Giảm 1 phút"
        >
          <Minus size={14} />
        </button>
      )}

      {editing ? (
        <label className="exam-timer-controls__edit" title="mm:ss hoặc số phút">
          <Clock size={15} aria-hidden />
          <input
            ref={inputRef}
            className="exam-timer-controls__input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={onKeyDown}
            inputMode="numeric"
            aria-label="Chỉnh thời gian (mm:ss hoặc phút)"
            placeholder="mm:ss"
          />
        </label>
      ) : (
        <button
          type="button"
          className={`exam-timer-controls__display${timeLeft <= 60 ? ' is-urgent' : ''}${canEdit ? ' is-editable' : ''}`}
          onClick={startEdit}
          title={canEdit ? 'Nhấp để chỉnh thời gian (mm:ss hoặc phút)' : 'Thời gian còn lại'}
          aria-label={canEdit ? `Thời gian ${formatExamTimer(timeLeft)}. Nhấp để chỉnh` : `Thời gian còn lại ${formatExamTimer(timeLeft)}`}
        >
          <Clock size={15} aria-hidden />
          <span>{formatExamTimer(timeLeft)}</span>
        </button>
      )}

      {canEdit && (
        <button
          type="button"
          className="exam-timer-controls__nudge"
          onClick={() => nudge(STEP_SECONDS)}
          title="Tăng 1 phút"
          aria-label="Tăng 1 phút"
        >
          <Plus size={14} />
        </button>
      )}

      <button
        type="button"
        className="exam-timer-controls__reset"
        onClick={onReset}
        title="Đặt lại thời gian gốc của đề"
        aria-label="Đặt lại thời gian gốc của đề"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  )
}
