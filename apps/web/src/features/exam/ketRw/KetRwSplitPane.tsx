import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useKetRwSplitResize } from './useKetRwSplitResize'
import { useSequentialPaneScroll } from './useSequentialPaneScroll'

export type SplitPaneVariant = 'resizable' | 'fixed-scrollbar' | 'fixed-divider'

interface Props {
  left: ReactNode
  right: ReactNode
  variant?: SplitPaneVariant
  sequentialScroll?: boolean
  initialSplitPct?: number
  scrollResetKey?: string
}

export default function KetRwSplitPane({
  left,
  right,
  variant = 'resizable',
  sequentialScroll = false,
  initialSplitPct,
  scrollResetKey,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const leftPaneRef = useRef<HTMLDivElement>(null)
  const rightPaneRef = useRef<HTMLDivElement>(null)
  const isResizable = variant === 'resizable'

  const {
    splitPct,
    isResizing,
    onResizerPointerDown,
    onResizerPointerMove,
    onResizerPointerUp,
  } = useKetRwSplitResize(bodyRef, isResizable ? initialSplitPct : undefined)

  // Sequential scroll only for fixed-scrollbar (Part 2)
  useSequentialPaneScroll(
    variant === 'fixed-scrollbar' && sequentialScroll,
    bodyRef,
    leftPaneRef,
    rightPaneRef,
  )

  // Reset scroll when part changes (only for sequential mode)
  useLayoutEffect(() => {
    if (variant !== 'fixed-scrollbar' || !sequentialScroll) return
    if (leftPaneRef.current) leftPaneRef.current.scrollTop = 0
    if (rightPaneRef.current) rightPaneRef.current.scrollTop = 0
  }, [variant, sequentialScroll, scrollResetKey])

  const className = [
    'ket-rw-body',
    'is-split',
    `is-${variant}`,
    isResizing && isResizable ? 'is-resizing' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={bodyRef}
      className={className}
      style={
        isResizable
          ? ({ '--ket-split-pct': `${splitPct}%` } as CSSProperties)
          : undefined
      }
      data-sequential-scroll={
        variant === 'fixed-scrollbar' && sequentialScroll ? 'true' : undefined
      }
    >
      <div
        ref={leftPaneRef}
        className="ket-rw-pane-left"
        data-scroll-pane="left"
      >
        {left}
      </div>

      {isResizable && (
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

      {variant === 'fixed-divider' && (
        <div className="ket-rw-fixed-divider" aria-hidden="true" />
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
