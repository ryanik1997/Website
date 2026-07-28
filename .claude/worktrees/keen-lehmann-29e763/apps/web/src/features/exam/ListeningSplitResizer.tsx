import type { RefObject, PointerEvent as ReactPointerEvent } from 'react'

interface Props {
  bodyRef: RefObject<HTMLElement | null>
  isResizing: boolean
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>, bodyRef: RefObject<HTMLElement | null>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>, bodyRef: RefObject<HTMLElement | null>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void
}

export default function ListeningSplitResizer({
  bodyRef,
  isResizing,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  return (
    <button
      type="button"
      className={`listening-exam-resizer${isResizing ? ' is-dragging' : ''}`}
      aria-label="Kéo để chỉnh độ rộng đề và đáp án"
      onPointerDown={e => onPointerDown(e, bodyRef)}
      onPointerMove={e => onPointerMove(e, bodyRef)}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className="listening-exam-resizer__grip" aria-hidden>
        ↔
      </span>
    </button>
  )
}