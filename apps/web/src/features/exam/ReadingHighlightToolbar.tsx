import { useCallback, useEffect, useState, type RefObject } from 'react'
import { Check, Copy, Eraser, Highlighter } from 'lucide-react'
import { copyToClipboard } from '../../lib/copyToClipboard'
import {
  addHighlights,
  isInExamHighlightZone,
  removeHighlights,
  selectionOverlapsHighlight,
  selectionToHighlightRanges,
  type ReadingHighlight,
} from './readingHighlightUtils'

interface ToolbarState {
  x: number
  y: number
  text: string
  canRemove: boolean
}

interface ReadingHighlightToolbarProps {
  rootRef: RefObject<HTMLElement | null>
  highlights: ReadingHighlight[]
  onHighlightsChange: (highlights: ReadingHighlight[]) => void
  resetKey?: string
}

export default function ReadingHighlightToolbar({
  rootRef,
  highlights,
  onHighlightsChange,
  resetKey,
}: ReadingHighlightToolbarProps) {
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)
  const [copied, setCopied] = useState(false)

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    setToolbar(null)
    setCopied(false)
  }, [])

  const updateToolbar = useCallback(() => {
    const root = rootRef.current
    const selection = window.getSelection()
    if (!root || !selection || selection.isCollapsed || selection.rangeCount === 0) {
      setToolbar(null)
      setCopied(false)
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      setToolbar(null)
      return
    }

    const anchorEl = selection.anchorNode?.parentElement
    const focusEl = selection.focusNode?.parentElement
    if (!isInExamHighlightZone(anchorEl) || !isInExamHighlightZone(focusEl)) {
      setToolbar(null)
      return
    }
    if (!root.contains(anchorEl ?? null) || !root.contains(focusEl ?? null)) {
      setToolbar(null)
      return
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setToolbar(null)
      return
    }

    setToolbar({
      x: rect.left + rect.width / 2,
      y: Math.max(12, rect.top - 10),
      text,
      canRemove: selectionOverlapsHighlight(selection, root, highlights),
    })
    setCopied(false)
  }, [highlights, rootRef])

  useEffect(() => {
    document.addEventListener('mouseup', updateToolbar)
    document.addEventListener('keyup', updateToolbar)
    document.addEventListener('selectionchange', updateToolbar)
    return () => {
      document.removeEventListener('mouseup', updateToolbar)
      document.removeEventListener('keyup', updateToolbar)
      document.removeEventListener('selectionchange', updateToolbar)
    }
  }, [updateToolbar])

  useEffect(() => {
    clearSelection()
  }, [resetKey, clearSelection])

  const applyHighlight = useCallback(() => {
    const root = rootRef.current
    const selection = window.getSelection()
    if (!root || !selection) return

    const ranges = selectionToHighlightRanges(selection, root)
    if (!ranges) return

    onHighlightsChange(addHighlights(highlights, ranges))
    clearSelection()
  }, [clearSelection, highlights, onHighlightsChange, rootRef])

  const removeHighlight = useCallback(() => {
    const root = rootRef.current
    const selection = window.getSelection()
    if (!root || !selection) return

    const ranges = selectionToHighlightRanges(selection, root)
    if (!ranges) return

    onHighlightsChange(removeHighlights(highlights, ranges))
    clearSelection()
  }, [clearSelection, highlights, onHighlightsChange, rootRef])

  async function handleCopy() {
    if (!toolbar) return
    const ok = await copyToClipboard(toolbar.text)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => {
      setCopied(false)
      clearSelection()
    }, 1200)
  }

  if (!toolbar) return null

  return (
    <div
      role="toolbar"
      aria-label="Công cụ tô sáng"
      className="reading-highlight-toolbar"
      style={{ left: toolbar.x, top: toolbar.y }}
      onMouseDown={e => e.preventDefault()}
    >
      <button
        type="button"
        className="reading-highlight-toolbar__btn"
        onClick={applyHighlight}
      >
        <Highlighter size={14} />
        Tô sáng
      </button>
      {toolbar.canRemove && (
        <button
          type="button"
          className="reading-highlight-toolbar__btn"
          onClick={removeHighlight}
        >
          <Eraser size={14} />
          Bỏ tô sáng
        </button>
      )}
      <button
        type="button"
        className="reading-highlight-toolbar__btn"
        onClick={() => void handleCopy()}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Đã sao chép' : 'Sao chép'}
      </button>
    </div>
  )
}