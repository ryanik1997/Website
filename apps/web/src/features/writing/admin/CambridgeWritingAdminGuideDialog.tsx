import { useEffect, useRef } from 'react'
import { Info, X } from 'lucide-react'
import { CAMBRIDGE_WRITING_COPY } from '../cambridgeWritingCopy'
import './cambridgeWritingAdmin.css'

type Props = {
  open: boolean
  onClose: () => void
}

export default function CambridgeWritingAdminGuideDialog({ open, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    window.setTimeout(() => closeButtonRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="cb-admin-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambridge-writing-guide-title"
        className="cb-admin-dialog cb-admin-dialog--guide"
        onClick={event => event.stopPropagation()}
      >
        <div className="cb-admin-head">
          <div>
            <h2 id="cambridge-writing-guide-title" style={{ margin: 0, fontSize: '1.05rem' }}>
              {CAMBRIDGE_WRITING_COPY.adminGuideTitle}
            </h2>
            <div className="cb-admin-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Admin-only local draft flow
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="cb-admin-mini-btn" onClick={onClose}>
            <X size={14} />
            Đóng
          </button>
        </div>

        <div className="cb-admin-body">
          <div className="cb-admin-section">
            <ol className="cb-admin-guide-list">
              {CAMBRIDGE_WRITING_COPY.adminGuideSteps.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className="cb-admin-guide-warning">
              <Info size={16} />
              <span>{CAMBRIDGE_WRITING_COPY.adminGuideWarning}</span>
            </div>
          </div>
        </div>

        <div className="cb-admin-foot">
          <button type="button" className="cb-admin-primary" onClick={onClose}>
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}

