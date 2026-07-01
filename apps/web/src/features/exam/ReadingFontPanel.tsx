import { useEffect, useRef } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STORAGE_KEY,
  FONT_FAMILY_STORAGE_KEY,
  READING_FONT_OPTIONS,
  ensureReadingFontsLoaded,
} from './readingFontSettings'

interface Props {
  open: boolean
  fontSize: number
  fontFamilyId: string
  onClose: () => void
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (familyId: string) => void
}

export default function ReadingFontPanel({
  open,
  fontSize,
  fontFamilyId,
  onClose,
  onFontSizeChange,
  onFontFamilyChange,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureReadingFontsLoaded()
  }, [])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target)) return
      if ((target as HTMLElement).closest?.('[data-reading-font-trigger]')) return
      onClose()
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open])

  if (!open) return null

  function changeSize(delta: number) {
    const next = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, fontSize + delta))
    onFontSizeChange(next)
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(next))
  }

  function selectFamily(id: string) {
    onFontFamilyChange(id)
    window.localStorage.setItem(FONT_FAMILY_STORAGE_KEY, id)
  }

  return (
    <div ref={panelRef} className="reading-font-panel" role="dialog" aria-label="Cài đặt cỡ chữ và kiểu chữ">
      <p className="reading-font-panel__section-label">CỠ CHỮ</p>
      <div className="reading-font-panel__size-row">
        <button
          type="button"
          className="reading-font-panel__size-btn"
          aria-label="Giảm cỡ chữ"
          disabled={fontSize <= FONT_SIZE_MIN}
          onClick={() => changeSize(-1)}
        >
          <Minus size={16} />
        </button>
        <span className="reading-font-panel__size-value" aria-live="polite">
          {fontSize}
        </span>
        <button
          type="button"
          className="reading-font-panel__size-btn"
          aria-label="Tăng cỡ chữ"
          disabled={fontSize >= FONT_SIZE_MAX}
          onClick={() => changeSize(1)}
        >
          <Plus size={16} />
        </button>
      </div>

      <p className="reading-font-panel__section-label">KIỂU CHỮ</p>
      <ul className="reading-font-panel__font-list">
        {READING_FONT_OPTIONS.map(option => {
          const selected = option.id === fontFamilyId
          return (
            <li key={option.id}>
              <button
                type="button"
                className={`reading-font-panel__font-item${selected ? ' is-selected' : ''}`}
                style={{ fontFamily: option.family }}
                onClick={() => selectFamily(option.id)}
              >
                <span>{option.label}</span>
                {selected && (
                  <span className="reading-font-panel__check" aria-hidden>
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}