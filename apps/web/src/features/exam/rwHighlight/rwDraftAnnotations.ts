import type { ReadingHighlight, TextNote } from '../readingHighlightUtils'

export interface RwDraftAnnotationFields {
  highlightsByPart?: Record<string, ReadingHighlight[]>
  notesByPart?: Record<string, TextNote[]>
}

export function rwDraftWithAnnotations(
  base: Record<string, unknown>,
  highlightsByPart: Record<string, ReadingHighlight[]>,
  notesByPart: Record<string, TextNote[]>,
): Record<string, unknown> {
  return { ...base, highlightsByPart, notesByPart }
}