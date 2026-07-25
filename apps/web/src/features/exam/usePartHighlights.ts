import { useCallback, useState } from 'react'
import {
  addHighlights,
  removeNotesInRanges,
  upsertNotesForRanges,
  type HighlightColor,
  type HighlightRange,
  type ReadingHighlight,
  type TextNote,
} from './readingHighlightUtils'

export function usePartHighlights(currentPartId: string | undefined) {
  const [highlightsByPart, setHighlightsByPart] = useState<Record<string, ReadingHighlight[]>>({})
  const [notesByPart, setNotesByPart] = useState<Record<string, TextNote[]>>({})

  const highlights = currentPartId ? (highlightsByPart[currentPartId] ?? []) : []
  const notes = currentPartId ? (notesByPart[currentPartId] ?? []) : []

  const handleHighlightsChange = useCallback((next: ReadingHighlight[]) => {
    if (!currentPartId) return
    setHighlightsByPart(prev => ({ ...prev, [currentPartId]: next }))
  }, [currentPartId])

  const handleNotesChange = useCallback((next: TextNote[]) => {
    if (!currentPartId) return
    setNotesByPart(prev => ({ ...prev, [currentPartId]: next }))
  }, [currentPartId])

  const clearAllHighlights = useCallback(() => {
    setHighlightsByPart({})
    setNotesByPart({})
  }, [])

  const setAnnotationsByPart = useCallback((
    nextHighlights: Record<string, ReadingHighlight[]>,
    nextNotes: Record<string, TextNote[]>,
  ) => {
    setHighlightsByPart(nextHighlights)
    setNotesByPart(nextNotes)
  }, [])

  /* ── Command API — functional update, captured currentPartId ── */
  const applyHighlightRanges = useCallback(
    (ranges: HighlightRange[], color: HighlightColor = 'yellow') => {
      if (!currentPartId || ranges.length === 0) {
        if (import.meta.env.DEV) {
          console.error('[usePartHighlights] Cannot apply highlight', { currentPartId, ranges })
        }
        return false
      }

      setHighlightsByPart(prev => {
        const current = prev[currentPartId] ?? []
        const next = addHighlights(current, ranges, color)

        if (import.meta.env.DEV) {
          console.info('[PET annotation] APPLY_HIGHLIGHT', { partId: currentPartId, ranges, color, before: current, after: next })
        }

        return { ...prev, [currentPartId]: next }
      })

      return true
    },
    [currentPartId],
  )

  const saveNoteRanges = useCallback(
    (ranges: HighlightRange[], rawText: string) => {
      const text = rawText.trim()

      if (!currentPartId || ranges.length === 0 || !text) {
        if (import.meta.env.DEV) {
          console.error('[usePartHighlights] Cannot save note', { currentPartId, ranges, text })
        }
        return false
      }

      setNotesByPart(prev => {
        const current = prev[currentPartId] ?? []
        const next = upsertNotesForRanges(current, ranges, text)

        if (import.meta.env.DEV) {
          console.info('[PET annotation] SAVE_NOTE', { partId: currentPartId, ranges, text, before: current, after: next })
        }

        return { ...prev, [currentPartId]: next }
      })

      return true
    },
    [currentPartId],
  )

  const deleteNoteRanges = useCallback(
    (ranges: HighlightRange[]) => {
      if (!currentPartId || ranges.length === 0) {
        return false
      }

      setNotesByPart(prev => {
        const current = prev[currentPartId] ?? []
        const next = removeNotesInRanges(current, ranges)
        return { ...prev, [currentPartId]: next }
      })

      return true
    },
    [currentPartId],
  )

  return {
    highlights,
    notes,
    highlightsByPart,
    notesByPart,
    handleHighlightsChange,
    handleNotesChange,
    applyHighlightRanges,
    saveNoteRanges,
    deleteNoteRanges,
    clearAllHighlights,
    setAnnotationsByPart,
  }
}