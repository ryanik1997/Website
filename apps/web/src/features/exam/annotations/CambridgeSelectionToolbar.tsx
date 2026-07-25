import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  HighlightColor,
  HighlightRange,
  ReadingHighlight,
  TextNote,
} from '../readingHighlightUtils'
import type { StableSelectionSnapshot } from './useStableTextSelection'
import './cambridgeSelectionToolbar.css'

interface CambridgeSelectionToolbarProps {
  selection: StableSelectionSnapshot | null
  highlights: ReadingHighlight[]
  notes: TextNote[]

  onApplyHighlight: (
    ranges: HighlightRange[],
    color: HighlightColor,
  ) => void

  onSaveNote: (
    ranges: HighlightRange[],
    text: string,
  ) => void

  onDeleteNote: (
    ranges: HighlightRange[],
  ) => void

  onClose: () => void
}

type PendingAnnotation =
  | { type: 'highlight'; ranges: HighlightRange[] }
  | { type: 'note'; ranges: HighlightRange[]; text: string }
  | { type: 'delete'; ranges: HighlightRange[] }

export default function CambridgeSelectionToolbar({
  selection,
  highlights,
  notes,
  onApplyHighlight,
  onSaveNote,
  onDeleteNote,
  onClose,
}: CambridgeSelectionToolbarProps) {
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [pendingAnnotation, setPendingAnnotation] = useState<PendingAnnotation | null>(null)
  const [saveError, setSaveError] = useState('')

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
    setPendingAnnotation(null)
    setSaveError('')
  }, [selectionSignature])

  /* ── Commit checker helpers ── */

  const rangeIsHighlighted = useCallback(
    (range: HighlightRange) =>
      highlights.some(h =>
        h.blockId === range.blockId
        && h.start <= range.start
        && h.end >= range.end,
      ),
    [highlights],
  )

  const rangeHasNote = useCallback(
    (range: HighlightRange, text: string) =>
      notes.some(note =>
        note.blockId === range.blockId
        && note.start < range.end
        && note.end > range.start
        && note.text === text,
      ),
    [notes],
  )

  const rangeHasNoNote = useCallback(
    (range: HighlightRange) =>
      !notes.some(note =>
        note.blockId === range.blockId
        && note.start < range.end
        && note.end > range.start,
      ),
    [notes],
  )

  /* ── Commit observer effects ── */

  useEffect(() => {
    if (pendingAnnotation?.type !== 'highlight') return
    const committed = pendingAnnotation.ranges.every(r => rangeIsHighlighted(r))
    if (!committed) return

    setPendingAnnotation(null)
    setSaveError('')
    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onClose, pendingAnnotation, rangeIsHighlighted])

  useEffect(() => {
    if (pendingAnnotation?.type !== 'note') return
    const committed = pendingAnnotation.ranges.every(r =>
      rangeHasNote(r, pendingAnnotation.text),
    )
    if (!committed) return

    setPendingAnnotation(null)
    setSaveError('')
    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onClose, pendingAnnotation, rangeHasNote])

  useEffect(() => {
    if (pendingAnnotation?.type !== 'delete') return
    const committed = pendingAnnotation.ranges.every(r => rangeHasNoNote(r))
    if (!committed) return

    setPendingAnnotation(null)
    setSaveError('')
    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onClose, pendingAnnotation, rangeHasNoNote])

  /* Error timeout — nếu commit không xảy ra trong 1.2s thì hiển thị lỗi */
  useEffect(() => {
    if (!pendingAnnotation) return
    const timer = window.setTimeout(() => {
      setPendingAnnotation(null)
      setSaveError(
        pendingAnnotation.type === 'highlight'
          ? 'Không lưu được highlight.'
          : pendingAnnotation.type === 'note'
            ? 'Không lưu được note.'
            : 'Không xoá được note.',
      )
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [pendingAnnotation])

  /* ── Actions ── */

  const handleHighlight = useCallback(() => {
    if (!selection || selection.ranges.length === 0) return

    const ranges = selection.ranges.map(r => ({ ...r }))
    setSaveError('')
    setPendingAnnotation({ type: 'highlight', ranges })
    onApplyHighlight(ranges, 'yellow')
  }, [onApplyHighlight, selection])

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

    const ranges = selection.ranges.map(r => ({ ...r }))
    setSaveError('')
    setPendingAnnotation({ type: 'note', ranges, text })
    onSaveNote(ranges, text)
  }, [noteDraft, onSaveNote, selection])

  const handleDeleteNote = useCallback(() => {
    if (!selection) return
    const ranges = selection.ranges.map(r => ({ ...r }))
    setSaveError('')
    setPendingAnnotation({ type: 'delete', ranges })
    onDeleteNote(ranges)
  }, [onDeleteNote, selection])

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
    >
      <button
        type="button"
        className="cambridge-selection-toolbar__button"
        onClick={handleOpenNote}
      >
        Note
      </button>
      <button
        type="button"
        className="cambridge-selection-toolbar__button"
        onClick={handleHighlight}
        disabled={pendingAnnotation !== null}
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
            onChange={event => setNoteDraft(event.target.value)}
            autoFocus
          />
          <div className="cambridge-selection-toolbar__note-actions">
            <button
              type="button"
              className="cambridge-selection-toolbar__note-btn is-primary"
              onClick={handleSaveNote}
              disabled={pendingAnnotation !== null}
            >
              {pendingAnnotation?.type === 'note' ? 'Dang luu...' : 'Luu note'}
            </button>
            {hasExistingNote && (
              <button
                type="button"
                className="cambridge-selection-toolbar__note-btn"
                onClick={handleDeleteNote}
                disabled={pendingAnnotation !== null}
              >
                Xoa
              </button>
            )}
            <button
              type="button"
              className="cambridge-selection-toolbar__note-btn"
              onClick={() => {
                setNoteEditorOpen(false)
                setNoteDraft('')
              }}
            >
              Dong
            </button>
          </div>
        </div>
      )}

      {saveError && (
        <div
          className="cambridge-selection-toolbar__error"
          role="alert"
        >
          {saveError}
        </div>
      )}
    </div>
  )

  return createPortal(toolbarNode, document.body)
}
