import { createContext, useContext, type ReactNode } from 'react'
import type { ReadingHighlight, TextNote } from './readingHighlightUtils'

interface ExamAnnotationContextValue {
  highlights: ReadingHighlight[]
  notes: TextNote[]
}

const ExamAnnotationContext = createContext<ExamAnnotationContextValue>({
  highlights: [],
  notes: [],
})

export function ExamHighlightProvider({
  highlights,
  notes = [],
  children,
}: {
  highlights: ReadingHighlight[]
  notes?: TextNote[]
  children: ReactNode
}) {
  return (
    <ExamAnnotationContext.Provider value={{ highlights, notes }}>
      {children}
    </ExamAnnotationContext.Provider>
  )
}

export function useExamHighlights(): ReadingHighlight[] {
  return useContext(ExamAnnotationContext).highlights
}

export function useExamNotes(): TextNote[] {
  return useContext(ExamAnnotationContext).notes
}