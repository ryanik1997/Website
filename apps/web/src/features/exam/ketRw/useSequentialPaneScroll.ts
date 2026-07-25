import { useEffect, type RefObject } from 'react'

const EPSILON = 1

function normalizeWheelDelta(event: WheelEvent, viewportHeight: number): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * viewportHeight
  }
  return event.deltaY
}

export function useSequentialPaneScroll(
  enabled: boolean,
  bodyRef: RefObject<HTMLElement | null>,
  leftPaneRef: RefObject<HTMLElement | null>,
  rightPaneRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!enabled) return

    const root = bodyRef.current
    const left = leftPaneRef.current
    const right = rightPaneRef.current
    if (!root || !left || !right) return

    const onWheel = (event: WheelEvent) => {
      // Ignore horizontal scroll, Ctrl+scroll (zoom)
      if (event.ctrlKey) return
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

      event.preventDefault()

      const delta = normalizeWheelDelta(event, window.innerHeight)

      if (delta > 0) {
        // Scroll down: left first, then right
        let remaining = delta

        const leftRemaining = left.scrollHeight - left.clientHeight - left.scrollTop
        if (leftRemaining > EPSILON) {
          const consumed = Math.min(remaining, leftRemaining)
          left.scrollTop += consumed
          remaining -= consumed
        }

        if (remaining > EPSILON) {
          const rightRemaining = right.scrollHeight - right.clientHeight - right.scrollTop
          if (rightRemaining > EPSILON) {
            const consumed = Math.min(remaining, rightRemaining)
            right.scrollTop += consumed
            remaining -= consumed
          }
        }
      } else {
        // Scroll up: right first, then left
        let remaining = Math.abs(delta)

        if (right.scrollTop > EPSILON) {
          const consumed = Math.min(remaining, right.scrollTop)
          right.scrollTop -= consumed
          remaining -= consumed
        }

        if (remaining > EPSILON && left.scrollTop > EPSILON) {
          const consumed = Math.min(remaining, left.scrollTop)
          left.scrollTop -= consumed
          remaining -= consumed
        }
      }
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [enabled, bodyRef, leftPaneRef, rightPaneRef])
}
