import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { selectionNodeElement, selectionToHighlightRanges, type HighlightRange } from '../readingHighlightUtils'

interface StableSelectionRect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface StableSelectionSnapshot {
  text: string
  ranges: HighlightRange[]
  rect: StableSelectionRect
}

interface UseStableTextSelectionOptions {
  rootRef: RefObject<HTMLElement | null>
  disabled?: boolean
}

declare global {
  interface Window {
    __RW_SELECTION_DEBUG__?: unknown
  }
}

export function useStableTextSelection({
  rootRef,
  disabled = false,
}: UseStableTextSelectionOptions): {
  selection: StableSelectionSnapshot | null
  clearSelection: () => void
} {
  const latestValidSelectionRef = useRef<StableSelectionSnapshot | null>(null)
  const pointerDownRef = useRef(false)
  const [visibleSelection, setVisibleSelection] = useState<StableSelectionSnapshot | null>(null)

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    latestValidSelectionRef.current = null
    setVisibleSelection(null)
  }, [])

  const setDebugState = useCallback((reason: string, nativeSelection: Selection | null, root: HTMLElement | null) => {
    if (!import.meta.env.DEV) return
    window.__RW_SELECTION_DEBUG__ = {
      reason,
      text: nativeSelection?.toString(),
      collapsed: nativeSelection?.isCollapsed,
      rangeCount: nativeSelection?.rangeCount,
      anchorNode: nativeSelection?.anchorNode?.nodeName,
      focusNode: nativeSelection?.focusNode?.nodeName,
      anchorBlock: selectionNodeElement(nativeSelection?.anchorNode ?? null)
        ?.closest('[data-highlight-block]')
        ?.getAttribute('data-block-id'),
      focusBlock: selectionNodeElement(nativeSelection?.focusNode ?? null)
        ?.closest('[data-highlight-block]')
        ?.getAttribute('data-block-id'),
      insideZone: Boolean(
        selectionNodeElement(nativeSelection?.anchorNode ?? null)
          ?.closest('[data-exam-highlight-zone]'),
      ),
      insideRoot: Boolean(
        root?.contains(selectionNodeElement(nativeSelection?.anchorNode ?? null) ?? null),
      ),
    }
  }, [])

  const captureSelection = useCallback((): StableSelectionSnapshot | null => {
    const root = rootRef.current
    const nativeSelection = window.getSelection()

    if (!root || !nativeSelection) {
      setDebugState('missing-root-or-selection', nativeSelection, root)
      return null
    }
    if (nativeSelection.isCollapsed || nativeSelection.rangeCount === 0) {
      setDebugState('collapsed-or-empty', nativeSelection, root)
      return null
    }

    const text = nativeSelection.toString().trim()
    if (!text) {
      setDebugState('empty-text', nativeSelection, root)
      return null
    }

    const ranges = selectionToHighlightRanges(nativeSelection, root)
    if (!ranges?.length) {
      setDebugState('no-highlight-ranges', nativeSelection, root)
      return null
    }

    const rect = nativeSelection.getRangeAt(0).getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setDebugState('zero-rect', nativeSelection, root)
      return null
    }

    const snapshot = {
      text,
      ranges,
      rect: {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      },
    }
    setDebugState('ok', nativeSelection, root)
    return snapshot
  }, [rootRef, setDebugState])

  useEffect(() => {
    if (disabled) {
      clearSelection()
      return
    }

    const isInsideCurrentRoot = (target: EventTarget | null) => {
      const root = rootRef.current
      return Boolean(root && target instanceof Node && root.contains(target))
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!isInsideCurrentRoot(event.target)) return
      pointerDownRef.current = true
      latestValidSelectionRef.current = null
      setVisibleSelection(null)
    }

    const handleSelectionChange = () => {
      const snapshot = captureSelection()
      if (!snapshot) return
      latestValidSelectionRef.current = snapshot
      if (!pointerDownRef.current) {
        setVisibleSelection(snapshot)
      }
    }

    const handlePointerUp = () => {
      if (!pointerDownRef.current) return
      pointerDownRef.current = false
      const liveSnapshot = captureSelection()
      const finalSnapshot = liveSnapshot ?? latestValidSelectionRef.current
      if (!finalSnapshot) return
      setVisibleSelection(finalSnapshot)
    }

    const handlePointerCancel = () => {
      pointerDownRef.current = false
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('pointerup', handlePointerUp, true)
    document.addEventListener('pointercancel', handlePointerCancel, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('pointerup', handlePointerUp, true)
      document.removeEventListener('pointercancel', handlePointerCancel, true)
    }
  }, [captureSelection, clearSelection, disabled, rootRef])

  return {
    selection: disabled ? null : visibleSelection,
    clearSelection,
  }
}
