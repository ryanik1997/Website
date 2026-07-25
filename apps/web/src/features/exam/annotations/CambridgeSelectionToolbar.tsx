import { createPortal, flushSync } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { HighlightColor, HighlightRange, TextNote } from '../readingHighlightUtils'
import type { StableSelectionSnapshot } from './useStableTextSelection'
import './cambridgeSelectionToolbar.css'

interface CambridgeSelectionToolbarProps {
  selection: StableSelectionSnapshot | null
  notes: TextNote[]

  onApplyHighlight: (
    ranges: HighlightRange[],
    color: HighlightColor,
  ) => boolean | void

  onSaveNote: (
    ranges: HighlightRange[],
    text: string,
  ) => boolean | void

  onDeleteNote: (
    ranges: HighlightRange[],
  ) => boolean | void

  onClose: () => void
}

/**
 * Pointer-safe action hook.
 *
 * Chuột → thực hiện action ngay tại pointerdown, không đợi click.
 * Bàn phím → không có pointerdown, thực hiện tại click.
 * Không double action.
 */
function usePointerSafeAction(action: () => void) {
  const pointerActivatedRef = useRef(false)
  const actionRef = useRef(action)
  actionRef.current = action

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    pointerActivatedRef.current = true
    actionRef.current()
  }, [])

  const onClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (pointerActivatedRef.current) {
      pointerActivatedRef.current = false
      return
    }
    actionRef.current()
  }, [])

  return { onPointerDown, onClick }
}

export default function CambridgeSelectionToolbar({
  selection,
  notes,
  onApplyHighlight,
  onSaveNote,
  onDeleteNote,
  onClose,
}: CambridgeSelectionToolbarProps) {
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')

  const hasExistingNote = useMemo(() => {
    if (!selection) return false
    return notes.some(note =>
      selection.ranges.some(range =>
        note.blockId === range.blockId
        && note.start < range.end
        && note.end > range.start,
      ),
    )
  }, [notes, selection])

  /* Reset local editor khi selection đổi */
  const selectionSignature = useMemo(() => {
    if (!selection) return ''
    return selection.ranges
      .map(range => [range.blockId, range.start, range.end].join(':'))
      .join('|')
  }, [selection])

  useEffect(() => {
    setNoteEditorOpen(false)
    setNoteDraft('')
  }, [selectionSignature])

  /* ── Actions (defined before early return to obey Rules of Hooks) ── */

  const handleHighlight = useCallback(() => {
    if (!selection || selection.ranges.length === 0) return

    let committed = false
    flushSync(() => {
      committed = onApplyHighlight(selection.ranges, 'yellow') !== false
    })

    if (!committed) {
      if (import.meta.env.DEV) {
        console.error('[CambridgeSelectionToolbar] Highlight command rejected', selection)
      }
      return
    }

    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onApplyHighlight, onClose, selection])

  const handleOpenNote = useCallback(() => {
    if (!selection) return

    const overlapping = notes.find(note =>
      selection.ranges.some(range =>
        note.blockId === range.blockId
        && note.start < range.end
        && note.end > range.start,
      ),
    )

    setNoteDraft(overlapping?.text ?? '')
    setNoteEditorOpen(true)
  }, [notes, selection])

  const handleSaveNote = useCallback(() => {
    if (!selection) return
    const text = noteDraft.trim()
    if (!text) return

    let committed = false
    flushSync(() => {
      committed = onSaveNote(selection.ranges, text) !== false
    })

    if (!committed) return

    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [noteDraft, onClose, onSaveNote, selection])

  const handleDeleteNote = useCallback(() => {
    if (!selection) return

    let committed = false
    flushSync(() => {
      committed = onDeleteNote(selection.ranges) !== false
    })

    if (!committed) return

    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onClose, onDeleteNote, selection])

  const highlightAction = usePointerSafeAction(handleHighlight)
  const noteAction = usePointerSafeAction(handleOpenNote)
  const saveNoteAction = usePointerSafeAction(handleSaveNote)
  const deleteNoteAction = usePointerSafeAction(handleDeleteNote)

  /* ── Early return — all hooks already called above ── */
  if (!selection) return null

  const toolbarNode = (
    <div
      className="cambridge-selection-toolbar"
      data-cambridge-selection-toolbar
      style={{
        left: selection.rect.left + selection.rect.width / 2,
        top: selection.rect.top - 8,
      }}
      role="toolbar"
      aria-label="Công cụ tô sáng và ghi chú"
      onPointerDownCapture={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()}
    >
      <button
        type="button"
        className="cambridge-selection-toolbar__button"
        {...noteAction}
      >
        Note
      </button>
      <button
        type="button"
        className="cambridge-selection-toolbar__button"
        {...highlightAction}
      >
        Highlight
      </button>

      {noteEditorOpen && (
        <div className="cambridge-selection-toolbar__note-panel">
          <label className="cambridge-selection-toolbar__note-label" htmlFor="pet-note-input">
            Ghi chu cho doan da chon
          </label>
          <textarea
            id="pet-note-input"
            className="cambridge-selection-toolbar__note-input"
            rows={3}
            value={noteDraft}
            placeholder="Nhap ghi chu..."
            onPointerDown={event => event.stopPropagation()}
            onClick={event => event.stopPropagation()}
            onChange={event => setNoteDraft(event.target.value)}
            autoFocus
          />
          <div className="cambridge-selection-toolbar__note-actions">
            <button
              type="button"
              className="cambridge-selection-toolbar__note-btn is-primary"
              {...saveNoteAction}
            >
              Luu note
            </button>
            {hasExistingNote && (
              <button
                type="button"
                className="cambridge-selection-toolbar__note-btn"
                {...deleteNoteAction}
              >
                Xoa
              </button>
            )}
            <button
              type="button"
              className="cambridge-selection-toolbar__note-btn"
              onPointerDown={event => event.stopPropagation()}
              onClick={event => {
                event.stopPropagation()
                setNoteEditorOpen(false)
                setNoteDraft('')
              }}
            >
              Dong
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(toolbarNode, document.body)
}
