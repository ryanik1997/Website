import { useCallback, useState } from 'react'
import type { ReadingHighlight, TextNote } from './readingHighlightUtils'

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

  return {
    highlights,
    notes,
    highlightsByPart,
    notesByPart,
    handleHighlightsChange,
    handleNotesChange,
    clearAllHighlights,
    setAnnotationsByPart,
  }
}