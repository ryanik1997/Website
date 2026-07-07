import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Check, Copy, Eraser, Highlighter, StickyNote, Trash2, X } from 'lucide-react'
import { copyToClipboard } from '../../lib/copyToClipboard'
import {
  addHighlights,
  findNotesOverlappingRanges,
  isInExamHighlightZone,
  removeHighlights,
  removeNotesInRanges,
  selectionOverlapsHighlight,
  selectionToHighlightRanges,
  upsertNotesForRanges,
  type ReadingHighlight,
  type TextNote,
} from './readingHighlightUtils'

interface ToolbarState {
  x: number
  y: number
  text: string
  canRemove: boolean
  canEditNote: boolean
}

interface ReadingHighlightToolbarProps {
  rootRef: RefObject<HTMLElement | null>
  highlights: ReadingHighlight[]
  onHighlightsChange: (highlights: ReadingHighlight[]) => void
  notes?: TextNote[]
  onNotesChange?: (notes: TextNote[]) => void
  resetKey?: string
}

export default function ReadingHighlightToolbar({
  rootRef,
  highlights,
  onHighlightsChange,
  notes = [],
  onNotesChange,
  resetKey,
}: ReadingHighlightToolbarProps) {
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)
  const [copied, setCopied] = useState(false)
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const pendingRangesRef = useRef<ReturnType<typeof selectionToHighlightRanges>>(null)

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    setToolbar(null)
    setCopied(false)
    setNoteEditorOpen(false)
    setNoteDraft('')
    pendingRangesRef.current = null
  }, [])

  const updateToolbar = useCallback(() => {
    const root = rootRef.current
    const selection = window.getSelection()
    if (!root || !selection || selection.isCollapsed || selection.rangeCount === 0) {
      if (!noteEditorOpen) {
        setToolbar(null)
        setCopied(false)
      }
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      if (!noteEditorOpen) setToolbar(null)
      return
    }

    const anchorEl = selection.anchorNode?.parentElement
    const focusEl = selection.focusNode?.parentElement
    if (!isInExamHighlightZone(anchorEl) || !isInExamHighlightZone(focusEl)) {
      if (!noteEditorOpen) setToolbar(null)
      return
    }
    if (!root.contains(anchorEl ?? null) || !root.contains(focusEl ?? null)) {
      if (!noteEditorOpen) setToolbar(null)
      return
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      if (!noteEditorOpen) setToolbar(null)
      return
    }

    const ranges = selectionToHighlightRanges(selection, root)
    pendingRangesRef.current = ranges

    setToolbar({
      x: rect.left + rect.width / 2,
      y: Math.max(12, rect.top - 10),
      text,
      canRemove: selectionOverlapsHighlight(selection, root, highlights),
      canEditNote: Boolean(ranges?.length && onNotesChange),
    })
    setCopied(false)
  }, [highlights, noteEditorOpen, onNotesChange, rootRef])

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

  const openNoteEditor = useCallback(() => {
    if (!onNotesChange) return
    const ranges = pendingRangesRef.current
    if (!ranges?.length) return

    const overlapping = findNotesOverlappingRanges(notes, ranges)
    setNoteDraft(overlapping[0]?.text ?? '')
    setNoteEditorOpen(true)
  }, [notes, onNotesChange])

  const saveNote = useCallback(() => {
    if (!onNotesChange) return
    const ranges = pendingRangesRef.current
    if (!ranges?.length) return

    onNotesChange(upsertNotesForRanges(notes, ranges, noteDraft))
    clearSelection()
  }, [clearSelection, noteDraft, notes, onNotesChange])

  const deleteNote = useCallback(() => {
    if (!onNotesChange) return
    const ranges = pendingRangesRef.current
    if (!ranges?.length) return

    onNotesChange(removeNotesInRanges(notes, ranges))
    clearSelection()
  }, [clearSelection, notes, onNotesChange])

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

  const hasExistingNote = Boolean(noteDraft.trim()) || Boolean(
    pendingRangesRef.current?.length
    && findNotesOverlappingRanges(notes, pendingRangesRef.current).length,
  )

  return (
    <div
      role="toolbar"
      aria-label="Công cụ tô sáng và ghi chú"
      className={`reading-highlight-toolbar${noteEditorOpen ? ' reading-highlight-toolbar--note-open' : ''}`}
      style={{ left: toolbar.x, top: toolbar.y }}
      onMouseDown={e => e.preventDefault()}
    >
      <div className="reading-highlight-toolbar__actions">
        <button
          type="button"
          className="reading-highlight-toolbar__btn"
          onClick={applyHighlight}
        >
          <Highlighter size={14} />
          Tô sáng
        </button>
        {toolbar.canEditNote && (
          <button
            type="button"
            className={`reading-highlight-toolbar__btn${noteEditorOpen ? ' is-active' : ''}`}
            onClick={openNoteEditor}
          >
            <StickyNote size={14} />
            Note
          </button>
        )}
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

      {noteEditorOpen && onNotesChange && (
        <div className="reading-highlight-toolbar__note-panel">
          <label className="reading-highlight-toolbar__note-label" htmlFor="exam-text-note-input">
            Ghi chú cho đoạn đã chọn
          </label>
          <textarea
            id="exam-text-note-input"
            className="reading-highlight-toolbar__note-input"
            rows={3}
            value={noteDraft}
            placeholder="Nhập ghi chú…"
            onChange={e => setNoteDraft(e.target.value)}
            autoFocus
          />
          <div className="reading-highlight-toolbar__note-actions">
            <button
              type="button"
              className="reading-highlight-toolbar__btn reading-highlight-toolbar__btn--primary"
              onClick={saveNote}
            >
              Lưu note
            </button>
            {hasExistingNote && (
              <button
                type="button"
                className="reading-highlight-toolbar__btn"
                onClick={deleteNote}
              >
                <Trash2 size={14} />
                Xóa
              </button>
            )}
            <button
              type="button"
              className="reading-highlight-toolbar__btn"
              onClick={() => {
                setNoteEditorOpen(false)
                setNoteDraft('')
              }}
            >
              <X size={14} />
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}