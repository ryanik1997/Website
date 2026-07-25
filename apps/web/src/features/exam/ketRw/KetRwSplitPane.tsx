import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useKetRwSplitResize } from './useKetRwSplitResize'
import { useSequentialPaneScroll } from './useSequentialPaneScroll'

interface Props {
  left: ReactNode
  right: ReactNode
  fixedSplit?: boolean
  sequentialScroll?: boolean
  initialSplitPct?: number
  scrollResetKey?: string
}

export default function KetRwSplitPane({
  left,
  right,
  fixedSplit = false,
  sequentialScroll = false,
  initialSplitPct,
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
  } = useKetRwSplitResize(bodyRef, fixedSplit ? undefined : initialSplitPct)

  useSequentialPaneScroll(sequentialScroll, bodyRef, leftPaneRef, rightPaneRef)

  // Reset scroll when part changes
  useLayoutEffect(() => {
    if (!sequentialScroll) return
    if (leftPaneRef.current) leftPaneRef.current.scrollTop = 0
    if (rightPaneRef.current) rightPaneRef.current.scrollTop = 0
  }, [sequentialScroll, scrollResetKey])

  const className = [
    'ket-rw-body',
    'is-split',
    isResizing ? ' is-resizing' : '',
    fixedSplit ? 'is-fixed-split' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={bodyRef}
      className={className}
      style={fixedSplit ? undefined : { '--ket-split-pct': `${splitPct}%` } as CSSProperties}
      data-sequential-scroll={sequentialScroll ? 'true' : undefined}
      data-fixed-split={fixedSplit ? 'true' : undefined}
    >
      <div
        ref={leftPaneRef}
        className="ket-rw-pane-left"
        data-scroll-pane="left"
      >
        {left}
      </div>

      {!fixedSplit && (
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
      )}

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
