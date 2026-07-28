import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

const STORAGE_KEY = 'exam-listening-split-pct'
const SPLIT_MIN = 28
const SPLIT_MAX = 72

export function useListeningSplitPane() {
  const [splitPct, setSplitPct] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const splitPctRef = useRef(splitPct)
  splitPctRef.current = splitPct

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    const parsed = Number(saved)
    if (!Number.isNaN(parsed)) {
      setSplitPct(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, parsed)))
    }
  }, [])

  const clampSplit = useCallback((pct: number) => (
    Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, pct))
  ), [])

  const updateSplitFromClientX = useCallback((clientX: number, body: HTMLElement | null) => {
    if (!body) return
    const rect = body.getBoundingClientRect()
    if (rect.width <= 0) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSplitPct(clampSplit(pct))
  }, [clampSplit])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    window.localStorage.setItem(STORAGE_KEY, String(splitPctRef.current))
  }, [])

  const onResizerPointerDown = useCallback((
    event: ReactPointerEvent<HTMLButtonElement>,
    bodyRef: React.RefObject<HTMLElement | null>,
  ) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsResizing(true)
    updateSplitFromClientX(event.clientX, bodyRef.current)
  }, [updateSplitFromClientX])

  const onResizerPointerMove = useCallback((
    event: ReactPointerEvent<HTMLButtonElement>,
    bodyRef: React.RefObject<HTMLElement | null>,
  ) => {
    if (!isResizing) return
    updateSplitFromClientX(event.clientX, bodyRef.current)
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