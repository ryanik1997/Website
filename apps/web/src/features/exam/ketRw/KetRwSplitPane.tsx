import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useKetRwSplitResize } from './useKetRwSplitResize'

interface Props {
  left: ReactNode
  right: ReactNode
}

export default function KetRwSplitPane({ left, right }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const {
    splitPct,
    isResizing,
    onResizerPointerDown,
    onResizerPointerMove,
    onResizerPointerUp,
  } = useKetRwSplitResize(bodyRef)

  return (
    <div
      ref={bodyRef}
      className={`ket-rw-body is-split${isResizing ? ' is-resizing' : ''}`}
      style={{ '--ket-split-pct': `${splitPct}%` } as CSSProperties}
    >
      <div className="ket-rw-pane-left">{left}</div>

      <button
        type="button"
        className={`ket-rw-resizer${isResizing ? ' is-dragging' : ''}`}
        aria-label="Kéo để chỉnh độ rộng hai khung"
        onPointerDown={onResizerPointerDown}
        onPointerMove={onResizerPointerMove}
        onPointerUp={onResizerPointerUp}
        onPointerCancel={onResizerPointerUp}
      >
        <span className="ket-rw-resizer__grip" aria-hidden>
          ↔
        </span>
      </button>

      <div className="ket-rw-pane-right">{right}</div>
    </div>
  )
}