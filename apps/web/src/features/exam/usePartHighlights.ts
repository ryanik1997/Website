import { useCallback, useState } from 'react'
import type { ReadingHighlight } from './readingHighlightUtils'

export function usePartHighlights(currentPartId: string | undefined) {
  const [highlightsByPart, setHighlightsByPart] = useState<Record<string, ReadingHighlight[]>>({})

  const highlights = currentPartId ? (highlightsByPart[currentPartId] ?? []) : []

  const handleHighlightsChange = useCallback((next: ReadingHighlight[]) => {
    if (!currentPartId) return
    setHighlightsByPart(prev => ({ ...prev, [currentPartId]: next }))
  }, [currentPartId])

  const clearAllHighlights = useCallback(() => {
    setHighlightsByPart({})
  }, [])

  return { highlights, handleHighlightsChange, clearAllHighlights }
}