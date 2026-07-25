import { useCallback, useEffect, useRef, useState } from 'react'
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

  /* Refs giữ giá trị mới nhất cho commit API */
  const highlightsByPartRef = useRef(highlightsByPart)
  const notesByPartRef = useRef(notesByPart)

  useEffect(() => { highlightsByPartRef.current = highlightsByPart }, [highlightsByPart])
  useEffect(() => { notesByPartRef.current = notesByPart }, [notesByPart])

  const highlights = currentPartId ? (highlightsByPart[currentPartId] ?? []) : []
  const notes = currentPartId ? (notesByPart[currentPartId] ?? []) : []

  /* ── Legacy API — giữ nguyên để không hỏng RwExamMain ── */

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

  /* ── Commit API — ref-based, trả kết quả ngay ── */

  const commitHighlightRanges = useCallback(
    (ranges: HighlightRange[], color: HighlightColor = 'yellow'): ReadingHighlight[] | null => {
      if (!currentPartId || ranges.length === 0) {
        console.error('[PET annotation] commitHighlightRanges rejected', { currentPartId, ranges })
        return null
      }

      const previous = highlightsByPartRef.current[currentPartId] ?? []
      const next = addHighlights(previous, ranges, color)

      highlightsByPartRef.current = { ...highlightsByPartRef.current, [currentPartId]: next }
      setHighlightsByPart(highlightsByPartRef.current)

      console.info('[PET annotation] COMMIT_HIGHLIGHT', { partId: currentPartId, ranges, color, before: previous, after: next })

      return next
    },
    [currentPartId],
  )

  const commitNoteRanges = useCallback(
    (ranges: HighlightRange[], rawText: string): TextNote[] | null => {
      const text = rawText.trim()

      if (!currentPartId || ranges.length === 0 || !text) {
        console.error('[PET annotation] commitNoteRanges rejected', { currentPartId, ranges, text })
        return null
      }

      const previous = notesByPartRef.current[currentPartId] ?? []
      const next = upsertNotesForRanges(previous, ranges, text)

      notesByPartRef.current = { ...notesByPartRef.current, [currentPartId]: next }
      setNotesByPart(notesByPartRef.current)

      console.info('[PET annotation] COMMIT_NOTE', { partId: currentPartId, ranges, text, before: previous, after: next })

      return next
    },
    [currentPartId],
  )

  const commitDeleteNoteRanges = useCallback(
    (ranges: HighlightRange[]): TextNote[] | null => {
      if (!currentPartId || ranges.length === 0) {
        return null
      }

      const previous = notesByPartRef.current[currentPartId] ?? []
      const next = removeNotesInRanges(previous, ranges)

      notesByPartRef.current = { ...notesByPartRef.current, [currentPartId]: next }
      setNotesByPart(notesByPartRef.current)

      return next
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

    commitHighlightRanges,
    commitNoteRanges,
    commitDeleteNoteRanges,

    clearAllHighlights,
    setAnnotationsByPart,
  }
}
