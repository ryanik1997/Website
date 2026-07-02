import { createContext, useContext, type ReactNode } from 'react'
import type { ReadingHighlight } from './readingHighlightUtils'

const ExamHighlightContext = createContext<ReadingHighlight[]>([])

export function ExamHighlightProvider({
  highlights,
  children,
}: {
  highlights: ReadingHighlight[]
  children: ReactNode
}) {
  return (
    <ExamHighlightContext.Provider value={highlights}>
      {children}
    </ExamHighlightContext.Provider>
  )
}

export function useExamHighlights(): ReadingHighlight[] {
  return useContext(ExamHighlightContext)
}