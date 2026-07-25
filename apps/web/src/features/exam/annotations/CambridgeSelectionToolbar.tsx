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

  onCommitHighlight: (
    ranges: HighlightRange[],
    color: HighlightColor,
  ) => ReadingHighlight[] | null

  onCommitDeleteHighlight: (
    ranges: HighlightRange[],
  ) => ReadingHighlight[] | null

  onCommitNote: (
    ranges: HighlightRange[],
    text: string,
  ) => TextNote[] | null

  onCommitDeleteNote: (
    ranges: HighlightRange[],
  ) => TextNote[] | null

  onClose: () => void
}

export default function CambridgeSelectionToolbar({
  selection,
  highlights,
  notes,
  onCommitHighlight,
  onCommitDeleteHighlight,
  onCommitNote,
  onCommitDeleteNote,
  onClose,
}: CambridgeSelectionToolbarProps) {
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
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

  const hasExistingHighlight = useMemo(() => {
    if (!selection) return false
    return highlights.some(h =>
      selection.ranges.some(range =>
        h.blockId === range.blockId
        && h.start < range.end
        && h.end > range.start,
      ),
    )
  }, [highlights, selection])

  /* Reset local editor khi selection đổi */
  const selectionSignature = useMemo(() => {
    if (!selection) return ''
    return selection.ranges
      .map(range => [range.blockId, range.start, range.end].join(':'))
      .join('|')
  }, [selection])

  /* Reset local editor khi selection đổi */
  useEffect(() => {
    setNoteEditorOpen(false)
    setNoteDraft('')
    setSaveError('')
  }, [selectionSignature])

  /* ── Actions ── */

  const handleHighlight = useCallback(() => {
    if (!selection || selection.ranges.length === 0) {
      setSaveError('Không có vùng chọn hợp lệ.')
      return
    }

    const ranges = selection.ranges.map(r => ({ ...r }))
    setSaveError('')

    const next = onCommitHighlight(ranges, 'yellow')
    if (!next) {
      setSaveError('Không lưu được highlight.')
      return
    }

    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onCommitHighlight, onClose, selection])

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
    if (!selection) {
      setSaveError('Không có vùng chọn hợp lệ.')
      return
    }

    const text = noteDraft.trim()
    if (!text) {
      setSaveError('Vui lòng nhập nội dung note.')
      return
    }

    const ranges = selection.ranges.map(r => ({ ...r }))
    setSaveError('')

    const next = onCommitNote(ranges, text)
    if (!next) {
      setSaveError('Không lưu được note.')
      return
    }

    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [noteDraft, onCommitNote, onClose, selection])

  const handleDeleteHighlight = useCallback(() => {
    if (!selection || selection.ranges.length === 0) return

    const ranges = selection.ranges.map(r => ({ ...r }))
    setSaveError('')

    const next = onCommitDeleteHighlight(ranges)
    if (!next) {
      setSaveError('Không xoá được highlight.')
      return
    }

    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onCommitDeleteHighlight, onClose, selection])

  const handleDeleteNote = useCallback(() => {
    if (!selection) return

    const ranges = selection.ranges.map(r => ({ ...r }))
    setSaveError('')

    const next = onCommitDeleteNote(ranges)
    if (!next) {
      setSaveError('Không xoá được note.')
      return
    }

    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }, [onCommitDeleteNote, onClose, selection])

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
      {hasExistingHighlight && (
        <button
          type="button"
          className="cambridge-selection-toolbar__button cambridge-selection-toolbar__button--danger"
          onClick={handleDeleteHighlight}
        >
          Bỏ tô sáng
        </button>
      )}
      {!hasExistingHighlight && (
        <button
          type="button"
          className="cambridge-selection-toolbar__button"
          onClick={handleHighlight}
        >
          Highlight
        </button>
      )}

      {noteEditorOpen && (
        <div className="cambridge-selection-toolbar__note-panel">
          <label className="cambridge-selection-toolbar__note-label" htmlFor="pet-note-input">
            Ghi chú cho đoạn đã chọn
          </label>
          <textarea
            id="pet-note-input"
            className="cambridge-selection-toolbar__note-input"
            rows={3}
            value={noteDraft}
            placeholder="Nhập ghi chú..."
            onChange={event => setNoteDraft(event.target.value)}
            autoFocus
          />
          <div className="cambridge-selection-toolbar__note-actions">
            <button
              type="button"
              className="cambridge-selection-toolbar__note-btn is-primary"
              onClick={handleSaveNote}
            >
              Lưu note
            </button>
            {hasExistingNote && (
              <button
                type="button"
                className="cambridge-selection-toolbar__note-btn"
                onClick={handleDeleteNote}
              >
                Xóa
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
              Đóng
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
