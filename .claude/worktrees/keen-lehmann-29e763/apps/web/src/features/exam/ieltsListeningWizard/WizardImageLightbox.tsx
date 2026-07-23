import { useCallback, useEffect, useRef, useState } from 'react'
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
const DEFAULT_ZOOM = 1

interface Props {
  src: string
  label: string
  onClose: () => void
}

export default function WizardImageLightbox({ src, label, onClose }: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const clampZoom = useCallback((value: number) => {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100))
  }, [])

  const resetView = useCallback(() => {
    setZoom(DEFAULT_ZOOM)
    setPan({ x: 0, y: 0 })
  }, [])

  const zoomIn = useCallback(() => {
    setZoom(z => clampZoom(z + ZOOM_STEP))
  }, [clampZoom])

  const zoomOut = useCallback(() => {
    setZoom(z => clampZoom(z - ZOOM_STEP))
  }, [clampZoom])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
      }
      if (e.key === '-') {
        e.preventDefault()
        zoomOut()
      }
      if (e.key === '0') {
        e.preventDefault()
        resetView()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, zoomIn, zoomOut, resetView])

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
    setZoom(z => clampZoom(z + delta))
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy })
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div
      className="wizard-img-lightbox"
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 55%, transparent)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Xem ảnh ${label}`}
    >
      <div
        className="wizard-img-lightbox__panel"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="wizard-img-lightbox__toolbar"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="wizard-img-lightbox__title">
            <span className="wizard-img-lightbox__label" style={{ color: 'var(--text-primary)' }}>
              {label}
            </span>
            <span className="wizard-img-lightbox__zoom-hint" style={{ color: 'var(--text-muted)' }}>
              {zoomPercent}% · +/- zoom · 0 reset · Esc đóng
            </span>
          </div>
          <div className="wizard-img-lightbox__actions">
            <button
              type="button"
              className="wizard-img-lightbox__btn"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              title="Thu nhỏ (-)"
              aria-label="Thu nhỏ"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              className="wizard-img-lightbox__btn"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={resetView}
              title="Vừa khung (0)"
              aria-label="Vừa khung"
            >
              <Maximize2 size={18} />
            </button>
            <button
              type="button"
              className="wizard-img-lightbox__btn"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              title="Phóng to (+)"
              aria-label="Phóng to"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              className="wizard-img-lightbox__btn wizard-img-lightbox__btn--close"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              onClick={onClose}
              title="Đóng"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          className={`wizard-img-lightbox__viewport${zoom > 1 ? ' is-pannable' : ''}`}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={resetView}
        >
          <img
            src={src}
            alt={label}
            className="wizard-img-lightbox__image"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}