import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useKetRwSplitResize } from './useKetRwSplitResize'
import { useSequentialPaneScroll } from './useSequentialPaneScroll'

interface Props {
  left: ReactNode
  right: ReactNode
  sequentialScroll?: boolean
  initialSplitPct?: number
  scrollResetKey?: string
}

export default function KetRwSplitPane({
  left,
  right,
  sequentialScroll = false,
  initialSplitPct = 50,
  scrollResetKey,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const leftPaneRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)
  const {
    splitPct,
    isResizing,
    onResizerPointerDown,
    onResizerPointerMove,
    onResizerPointerUp,
  } = useKetRwSplitResize(bodyRef, initialSplitPct)

  useSequentialPaneScroll(sequentialScroll, bodyRef, leftPaneRef, rightPaneRef)

  // Reset scroll when part changes
  useLayoutEffect(() => {
    if (!sequentialScroll) return
    if (leftPaneRef.current) leftPaneRef.current.scrollTop = 0
    if (rightPaneRef.current) rightPaneRef.current.scrollTop = 0
  }, [sequentialScroll, scrollResetKey])

  return (
    <div
      ref={bodyRef}
      className={`ket-rw-body is-split${isResizing ? ' is-resizing' : ''}`}
      style={{ '--ket-split-pct': `${splitPct}%` } as CSSProperties}
      data-sequential-scroll={sequentialScroll ? 'true' : undefined}
    >
      <div
        ref={leftPaneRef}
        className="ket-rw-pane-left"
        data-scroll-pane="left"
      >
        {left}
      </div>

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

      <div
        ref={rightPaneRef}
        className="ket-rw-pane-right"
        data-scroll-pane="right"
      >
        {right}
      </div>
    </div>
  )
}
