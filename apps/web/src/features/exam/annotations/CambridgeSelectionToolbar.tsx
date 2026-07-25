import { useMemo, useState } from 'react'
import { addHighlights, upsertNotesForRanges, type ReadingHighlight, type TextNote } from '../readingHighlightUtils'
import type { StableSelectionSnapshot } from './useStableTextSelection'
import './cambridgeSelectionToolbar.css'

interface CambridgeSelectionToolbarProps {
  selection: StableSelectionSnapshot | null
  highlights: ReadingHighlight[]
  notes: TextNote[]
  onHighlightsChange: (next: ReadingHighlight[]) => void
  onNotesChange: (next: TextNote[]) => void
  onClose: () => void
}

export default function CambridgeSelectionToolbar({
  selection,
  highlights,
  notes,
  onHighlightsChange,
  onNotesChange,
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

  if (!selection) return null

  const handleHighlight = () => {
    onHighlightsChange(addHighlights(highlights, selection.ranges, 'yellow'))
    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }

  const handleOpenNote = () => {
    const overlapping = notes.find(note =>
      selection.ranges.some(range =>
        note.blockId === range.blockId
        && note.start < range.end
        && note.end > range.start,
      ),
    )
    setNoteDraft(overlapping?.text ?? '')
    setNoteEditorOpen(true)
  }

  const handleSaveNote = () => {
    onNotesChange(upsertNotesForRanges(notes, selection.ranges, noteDraft))
    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }

  return (
    <div
      className="cambridge-selection-toolbar"
      style={{
        left: selection.rect.left + selection.rect.width / 2,
        top: selection.rect.top - 8,
      }}
      role="toolbar"
      aria-label="Cong cu to sang va ghi chu"
      onMouseDown={event => event.preventDefault()}
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
            >
              Luu note
            </button>
            {hasExistingNote && (
              <button
                type="button"
                className="cambridge-selection-toolbar__note-btn"
                onClick={() => {
                  setNoteDraft('')
                  onNotesChange(upsertNotesForRanges(notes, selection.ranges, ''))
                  setNoteEditorOpen(false)
                  onClose()
                }}
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
    </div>
  )
}
