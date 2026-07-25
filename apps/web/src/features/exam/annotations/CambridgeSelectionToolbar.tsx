import { createPortal } from 'react-dom'
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
    if (!selection?.ranges.length) {
      if (import.meta.env.DEV) {
        console.error('[CambridgeSelectionToolbar] Missing ranges', selection)
      }
      return
    }

    const nextHighlights = addHighlights(highlights, selection.ranges, 'yellow')

    if (import.meta.env.DEV) {
      console.debug('[CambridgeSelectionToolbar] Highlight', {
        ranges: selection.ranges,
        previous: highlights,
        next: nextHighlights,
      })
    }

    onHighlightsChange(nextHighlights)
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
    const text = noteDraft.trim()

    if (!text || !selection?.ranges.length) {
      return
    }

    const nextNotes = upsertNotesForRanges(notes, selection.ranges, text)

    if (import.meta.env.DEV) {
      console.debug('[CambridgeSelectionToolbar] Save note', {
        ranges: selection.ranges,
        text,
        previous: notes,
        next: nextNotes,
      })
    }

    onNotesChange(nextNotes)
    setNoteEditorOpen(false)
    setNoteDraft('')
    onClose()
  }

  const toolbarNode = (
    <div
      className="cambridge-selection-toolbar"
      style={{
        left: selection.rect.left + selection.rect.width / 2,
        top: selection.rect.top - 8,
      }}
      role="toolbar"
      aria-label="Cong cu to sang va ghi chu"
      onPointerDown={event => event.stopPropagation()}
    >
      <button
        type="button"
        className="cambridge-selection-toolbar__button"
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.stopPropagation()
          handleOpenNote()
        }}
      >
        Note
      </button>
      <button
        type="button"
        className="cambridge-selection-toolbar__button"
        onPointerDown={event => event.stopPropagation()}
        onClick={event => {
          event.stopPropagation()
          handleHighlight()
        }}
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
              onPointerDown={event => event.stopPropagation()}
              onClick={event => {
                event.stopPropagation()
                handleSaveNote()
              }}
            >
              Luu note
            </button>
            {hasExistingNote && (
              <button
                type="button"
                className="cambridge-selection-toolbar__note-btn"
                onPointerDown={event => event.stopPropagation()}
                onClick={event => {
                  event.stopPropagation()
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
