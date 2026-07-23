import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'

const SPLIT_STORAGE_KEY = 'ket-rw-split-pct'
const SPLIT_MIN = 28
const SPLIT_MAX = 72
const DEFAULT_SPLIT = 50

function loadSplitPct(): number {
  const raw = window.localStorage.getItem(SPLIT_STORAGE_KEY)
  const n = raw ? Number(raw) : DEFAULT_SPLIT
  return Number.isFinite(n) ? Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, n)) : DEFAULT_SPLIT
}

export function useKetRwSplitResize(bodyRef: RefObject<HTMLElement | null>) {
  const [splitPct, setSplitPct] = useState(loadSplitPct)
  const [isResizing, setIsResizing] = useState(false)
  const splitPctRef = useRef(splitPct)
  splitPctRef.current = splitPct

  const clampSplit = useCallback((pct: number) => (
    Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, pct))
  ), [])

  const updateSplitFromClientX = useCallback((clientX: number) => {
    const body = bodyRef.current
    if (!body) return
    const rect = body.getBoundingClientRect()
    if (rect.width <= 0) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSplitPct(clampSplit(pct))
  }, [bodyRef, clampSplit])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    window.localStorage.setItem(SPLIT_STORAGE_KEY, String(splitPctRef.current))
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const onMove = (event: MouseEvent) => updateSplitFromClientX(event.clientX)
    const onUp = () => stopResizing()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isResizing, stopResizing, updateSplitFromClientX])

  const onResizerPointerDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsResizing(true)
    updateSplitFromClientX(event.clientX)
  }, [updateSplitFromClientX])

  const onResizerPointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return
    updateSplitFromClientX(event.clientX)
  }, [isResizing, updateSplitFromClientX])

  const onResizerPointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    stopResizing()
  }, [isResizing, stopResizing])

  return {
    splitPct,
    isResizing,
    onResizerPointerDown,
    onResizerPointerMove,
    onResizerPointerUp,
  }
}