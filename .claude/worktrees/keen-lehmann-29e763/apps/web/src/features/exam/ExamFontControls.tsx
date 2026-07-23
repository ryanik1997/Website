import { Type } from 'lucide-react'
import ReadingFontPanel from './ReadingFontPanel'

interface Props {
  open: boolean
  fontSize: number
  fontFamilyId: string
  onToggle: () => void
  onClose: () => void
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (familyId: string) => void
  /** class cho nút (reading-test-icon-btn | ket-rw-icon-btn | …) */
  buttonClassName?: string
  wrapClassName?: string
}

/** Nút đổi font (thay Menu 3 gạch) + panel 10 font / cỡ chữ. */
export default function ExamFontControls({
  open,
  fontSize,
  fontFamilyId,
  onToggle,
  onClose,
  onFontSizeChange,
  onFontFamilyChange,
  buttonClassName = 'ket-rw-icon-btn',
  wrapClassName = 'exam-font-controls',
}: Props) {
  return (
    <div className={wrapClassName} style={{ position: 'relative' }}>
      <button
        type="button"
        data-reading-font-trigger
        className={`${buttonClassName}${open ? ' is-active' : ''}`}
        title="Đổi font & cỡ chữ"
        aria-label="Đổi font & cỡ chữ"
        aria-expanded={open}
        onClick={onToggle}
      >
        <Type size={16} />
      </button>
      <ReadingFontPanel
        open={open}
        fontSize={fontSize}
        fontFamilyId={fontFamilyId}
        onClose={onClose}
        onFontSizeChange={onFontSizeChange}
        onFontFamilyChange={onFontFamilyChange}
      />
    </div>
  )
}
