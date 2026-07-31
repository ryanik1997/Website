import { useEffect } from 'react'
import type { ReadingQuestion } from '../examData'
import './rwPart5McGap.css'

interface Props {
  number: number
  question: ReadingQuestion
  value: string
  open: boolean
  onToggle: () => void
  onClose: () => void
  onSelect: (optionId: string) => void
  disabled?: boolean
  /** Gap sát mép phải → chooser canh phải để không tràn */
  alignRight?: boolean
}

/**
 * Ô chọn đáp án Cambridge: ô trắng 128px hiện số câu / từ đã chọn,
 * bấm mở thanh chooser đen nằm ngang phía trên.
 * Dùng cho PET B1 Part 5 và KET A2 Part 4.
 */
export default function RwPart5McGap({
  number,
  question,
  value,
  open,
  onToggle,
  onClose,
  onSelect,
  disabled,
  alignRight = false,
}: Props) {
  const selectedLabel = value
    ? question.options.find(o => o.id.toLowerCase() === value.toLowerCase())?.label ?? value
    : ''

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element | null)?.closest?.('.pet-rw-part5-gap')) onClose()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <span
      className={[
        'pet-rw-part5-gap',
        open ? 'is-open' : '',
        value ? 'is-filled' : '',
        alignRight ? 'align-right' : '',
      ].filter(Boolean).join(' ')}
    >
      {open && !disabled && (
        <span
          className="pet-rw-part5-gap__chooser"
          role="listbox"
          aria-label={`Question ${number} options`}
        >
          <button
            type="button"
            className="pet-rw-part5-gap__close"
            aria-label="Close choices"
            onClick={onClose}
          >
            ×
          </button>
          {question.options.map(option => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={value.toLowerCase() === option.id.toLowerCase()}
              className={[
                'pet-rw-part5-gap__option',
                value.toLowerCase() === option.id.toLowerCase() ? 'is-selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(option.id)}
            >
              {option.label}
            </button>
          ))}
        </span>
      )}
      <button
        type="button"
        className="pet-rw-part5-gap__field"
        data-highlight-skip
        disabled={disabled}
        aria-expanded={open}
        aria-label={value
          ? `Question ${number}, selected answer ${selectedLabel}`
          : `Question ${number}, choose answer`}
        onClick={onToggle}
      >
        <span className="pet-rw-part5-gap__number">{number}</span>
        {value ? (
          <span className="pet-rw-part5-gap__value">{selectedLabel}</span>
        ) : null}
      </button>
    </span>
  )
}
