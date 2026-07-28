import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Eraser, StickyNote, Trash2, X } from 'lucide-react'
import { copyToClipboard } from '../../lib/copyToClipboard'
import './readingTest.css'
import {
  addHighlights,
  findNotesOverlappingRanges,
  isInExamHighlightZone,
  removeHighlights,
  removeNotesInRanges,
  selectionNodeElement,
  selectionToHighlightRanges,
  upsertNotesForRanges,
  type HighlightColor,
  type HighlightRange,
  type ReadingHighlight,
  type TextNote,
} from './readingHighlightUtils'

interface ToolbarState {
  x: number
  y: number
  text: string
  canRemove: boolean
  canEditNote: boolean
  below: boolean
}

interface SelectionSnapshot {
  text: string
  ranges: HighlightRange[]
  rect: DOMRect
  below: boolean
  canRemove: boolean
  canEditNote: boolean
}

const HIGHLIGHT_COLORS: { id: HighlightColor; label: string; className: string }[] = [
  { id: 'yellow', label: '🟨', className: 'reading-highlight-toolbar__color--yellow' },
  { id: 'blue', label: '🟦', className: 'reading-highlight-toolbar__color--blue' },
  { id: 'green', label: '🟩', className: 'reading-highlight-toolbar__color--green' },
  { id: 'pink', label: '🩷', className: 'reading-highlight-toolbar__color--pink' },
]

interface ReadingHighlightToolbarProps {
  rootRef: RefObject<HTMLElement | null>
  highlights: ReadingHighlight[]
  onHighlightsChange: (highlights: ReadingHighlight[]) => void
  notes?: TextNote[]
  onNotesChange?: (notes: TextNote[]) => void
  resetKey?: string
  readOnly?: boolean
}

const HIGHLIGHT_COLOR_NAMES: Record<HighlightColor, string> = {
  yellow: 'Vàng',
  blue: 'Xanh',
  green: 'Xanh lá',
  pink: 'Hồng',
}

export default function ReadingHighlightToolbar({
  rootRef,
  highlights,
  onHighlightsChange,
  notes = [],
  onNotesChange,
  resetKey,
  readOnly = false,
}: ReadingHighlightToolbarProps) {
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null)
  const [copied, setCopied] = useState(false)
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const pendingRangesRef = useRef<HighlightRange[] | null>(null)
  const pointerSelectingRef = useRef(false)
  const lastValidSelectionRef = useRef<SelectionSnapshot | null>(null)
  const highlightsRef = useRef(highlights)
  highlightsRef.current = highlights
  const onNotesChangeRef = useRef(onNotesChange)
  onNotesChangeRef.current = onNotesChange

  const setDebugState = useCallback((reason: string, selection: Selection | null, root: HTMLElement | null) => {
    if (!import.meta.env.DEV) return
    const snapshot = lastValidSelectionRef.current
    ;(window as Window & { __RW_SELECTION_DEBUG__?: unknown }).__RW_SELECTION_DEBUG__ = {
      reason,
      text: selection?.toString(),
      collapsed: selection?.isCollapsed,
      rangeCount: selection?.rangeCount,
      anchorNode: selection?.anchorNode?.nodeName,
      focusNode: selection?.focusNode?.nodeName,
      anchorBlock: selectionNodeElement(selection?.anchorNode ?? null)
        ?.closest('[data-highlight-block]')
        ?.getAttribute('data-block-id'),
      focusBlock: selectionNodeElement(selection?.focusNode ?? null)
        ?.closest('[data-highlight-block]')
        ?.getAttribute('data-block-id'),
      insideZone: Boolean(
        selectionNodeElement(selection?.anchorNode ?? null)
          ?.closest('[data-exam-highlight-zone]'),
      ),
      insideRoot: Boolean(
        root?.contains(selectionNodeElement(selection?.anchorNode ?? null) ?? null),
      ),
      hasSnapshot: Boolean(snapshot),
      snapshotText: snapshot?.text,
      snapshotRanges: snapshot?.ranges,
      snapshotBelow: snapshot?.below,
      snapshotCanRemove: snapshot?.canRemove,
      snapshotCanEditNote: snapshot?.canEditNote,
    }
  }, [])

  const captureSelection = useCallback((): SelectionSnapshot | null => {
    const root = rootRef.current
    const selection = window.getSelection()

    const reject = (reason: string) => {
      setDebugState(reason, selection, root)
      if (import.meta.env.DEV) {
        console.debug('[ReadingHighlightToolbar] capture rejected', {
          reason,
          root: Boolean(root),
          text: selection?.toString(),
          collapsed: selection?.isCollapsed,
          rangeCount: selection?.rangeCount,
        })
      }
    }

    if (!root) { reject('missing-root'); return null }
    if (!selection) { reject('missing-selection'); return null }
    if (selection.isCollapsed) { reject('collapsed'); return null }
    if (selection.rangeCount === 0) { reject('no-range'); return null }

    const text = selection.toString().trim()
    if (!text) { reject('empty-text'); return null }

    const anchorEl = selectionNodeElement(selection.anchorNode)
    const focusEl = selectionNodeElement(selection.focusNode)
    if (!isInExamHighlightZone(anchorEl) || !isInExamHighlightZone(focusEl)) {
      reject('outside-zone')
      return null
    }
    if (!root.contains(anchorEl ?? null) || !root.contains(focusEl ?? null)) {
      reject('outside-root')
      return null
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      reject('zero-rect')
      return null
    }

    const ranges = selectionToHighlightRanges(selection, root)
    if (!ranges?.length) { reject('no-highlight-ranges'); return null }

    const inTranscriptPanel = Boolean(root.closest('.listening-transcript-panel'))
    const nearTop = rect.top < 100
    const below = (inTranscriptPanel && rect.bottom < window.innerHeight - 120) || nearTop

    const canRemove = highlightsRef.current.some(h =>
      ranges.some(r =>
        r.blockId === h.blockId && r.start < h.end && r.end > h.start,
      ),
    )
    const canEditNote = Boolean(ranges.length && onNotesChangeRef.current)

    setDebugState('ok', selection, root)

    return { text, ranges, rect, below, canRemove, canEditNote }
  }, [rootRef, setDebugState])

  const showToolbarFromSnapshot = useCallback((snapshot: SelectionSnapshot) => {
    const pad = 12
    const rawX = snapshot.rect.left + snapshot.rect.width / 2
    const rawY = snapshot.below
      ? snapshot.rect.bottom + 8
      : Math.max(12, snapshot.rect.top - 10)
    const x = Math.min(window.innerWidth - pad, Math.max(pad, rawX))
    const y = Math.min(window.innerHeight - pad, Math.max(pad, rawY))

    setToolbar({
      x, y,
      text: snapshot.text,
      canRemove: snapshot.canRemove,
      canEditNote: snapshot.canEditNote,
      below: snapshot.below,
    })
    setCopied(false)
    pendingRangesRef.current = snapshot.ranges
  }, [])

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    setToolbar(null)
    setCopied(false)
    setNoteEditorOpen(false)
    setNoteDraft('')
    pendingRangesRef.current = null
    lastValidSelectionRef.current = null
  }, [])

  const handlePointerDown = useCallback(() => {
    pointerSelectingRef.current = true
    lastValidSelectionRef.current = null
  }, [])

  const handleSelectionChange = useCallback(() => {
    const snapshot = captureSelection()
    if (snapshot) {
      lastValidSelectionRef.current = snapshot
    }
  }, [captureSelection])

  const handlePointerUp = useCallback(() => {
    pointerSelectingRef.current = false
    const snapshot = lastValidSelectionRef.current
    if (snapshot) {
      showToolbarFromSnapshot(snapshot)
      lastValidSelectionRef.current = null
    }
  }, [showToolbarFromSnapshot])

  const handlePointerCancel = useCallback(() => {
    pointerSelectingRef.current = false
    lastValidSelectionRef.current = null
  }, [])

  const handleKeyUp = useCallback(() => {
    const snapshot = captureSelection()
    if (snapshot) {
      showToolbarFromSnapshot(snapshot)
    }
  }, [captureSelection, showToolbarFromSnapshot])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    root.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('pointerup', handlePointerUp, true)
    document.addEventListener('pointercancel', handlePointerCancel, true)
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('keyup', handleKeyUp, true)

    return () => {
      root.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('pointerup', handlePointerUp, true)
      document.removeEventListener('pointercancel', handlePointerCancel, true)
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [rootRef, handlePointerDown, handlePointerUp, handlePointerCancel, handleSelectionChange, handleKeyUp])

  useEffect(() => {
    clearSelection()
  }, [resetKey, clearSelection])

  const applyHighlight = useCallback(() => {
    const ranges = pendingRangesRef.current
    if (!ranges?.length) return

    onHighlightsChange(addHighlights(highlights, ranges))
    clearSelection()
  }, [clearSelection, highlights, onHighlightsChange])

  const removeHighlight = useCallback(() => {
    const ranges = pendingRangesRef.current
    if (!ranges?.length) return

    onHighlightsChange(removeHighlights(highlights, ranges))
    if (onNotesChange) {
      onNotesChange(removeNotesInRanges(notes, ranges))
    }
    clearSelection()
  }, [clearSelection, highlights, notes, onHighlightsChange, onNotesChange])

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

  const node = (
    <div
      role="toolbar"
      aria-label="Công cụ tô sáng và ghi chú"
      className={`reading-highlight-toolbar${noteEditorOpen ? ' reading-highlight-toolbar--note-open' : ''}${toolbar.below ? ' reading-highlight-toolbar--below' : ''}`}
      style={{ left: toolbar.x, top: toolbar.y }}
      onMouseDown={e => e.stopPropagation()}
    >
      {!readOnly && (
        <div className="reading-highlight-toolbar__colors">
          {HIGHLIGHT_COLORS.map(color => (
            <button
              key={color.id}
              type="button"
              className={`reading-highlight-toolbar__color ${color.className}`}
              aria-label={`Tô màu ${HIGHLIGHT_COLOR_NAMES[color.id]}`}
              title={`Tô màu ${HIGHLIGHT_COLOR_NAMES[color.id]}`}
              onClick={e => {
                e.stopPropagation()
                const ranges = pendingRangesRef.current
                if (!ranges?.length) return
                onHighlightsChange(addHighlights(highlights, ranges, color.id))
                clearSelection()
              }}
            >
              {color.label}
            </button>
          ))}
        </div>
      )}
      <div className="reading-highlight-toolbar__actions">
        {!readOnly && toolbar.canEditNote && (
          <button
            type="button"
            className={`reading-highlight-toolbar__btn${noteEditorOpen ? ' is-active' : ''}`}
            onClick={e => {
              e.stopPropagation()
              openNoteEditor()
            }}
          >
            <StickyNote size={14} />
            Note
          </button>
        )}
        {toolbar.canRemove && (
          <button
            type="button"
            className="reading-highlight-toolbar__btn"
            onClick={e => {
              e.stopPropagation()
              removeHighlight()
            }}
          >
            <Eraser size={14} />
            Bỏ tô sáng
          </button>
        )}
        <button
          type="button"
          className="reading-highlight-toolbar__btn"
          onClick={e => {
            e.stopPropagation()
            void handleCopy()
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
      </div>

      {noteEditorOpen && onNotesChange && (
        <div className="reading-highlight-toolbar__note-panel">
          {toolbar.text && (
            <div className="reading-highlight-toolbar__selected-text">
              <span className="reading-highlight-toolbar__selected-text-label">Đoạn đã chọn:</span>
              <q className="reading-highlight-toolbar__selected-text-quote">{toolbar.text}</q>
            </div>
          )}
          <label className="reading-highlight-toolbar__note-label" htmlFor="exam-text-note-input">
            Ghi chú cho đoạn đã chọn
          </label>
          <textarea
            id="exam-text-note-input"
            className="reading-highlight-toolbar__note-input"
            rows={3}
            value={noteDraft}
            placeholder="Nhập ghi chú…"
            onMouseDown={e => e.stopPropagation()}
            onChange={e => setNoteDraft(e.target.value)}
            autoFocus
          />
          <div className="reading-highlight-toolbar__note-actions">
            <button
              type="button"
              className="reading-highlight-toolbar__btn reading-highlight-toolbar__btn--primary"
              onClick={e => {
                e.stopPropagation()
                saveNote()
              }}
            >
              Lưu note
            </button>
            {hasExistingNote && (
              <button
                type="button"
                className="reading-highlight-toolbar__btn"
                onClick={e => {
                  e.stopPropagation()
                  deleteNote()
                }}
              >
                <Trash2 size={14} />
                Xóa
              </button>
            )}
            <button
              type="button"
              className="reading-highlight-toolbar__btn"
              onClick={e => {
                e.stopPropagation()
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

  if (typeof document === 'undefined') return node
  return createPortal(node, document.body)
}
