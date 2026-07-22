import { useRef, type LegacyRef, type ReactNode, type RefObject } from 'react'
import { ExamHighlightProvider } from '../examHighlightContext'
import ExamHighlightZone from '../ExamHighlightZone'
import ReadingHighlightToolbar from '../ReadingHighlightToolbar'
import type { ReadingHighlight, TextNote } from '../readingHighlightUtils'
import '../readingTest.css'

interface Props {
  partId: string | undefined
  highlights: ReadingHighlight[]
  notes: TextNote[]
  onHighlightsChange: (highlights: ReadingHighlight[]) => void
  onNotesChange: (notes: TextNote[]) => void
  children: ReactNode
  mainRef?: RefObject<HTMLDivElement | null>
}

export default function RwExamMain({
  partId,
  highlights,
  notes,
  onHighlightsChange,
  onNotesChange,
  children,
  mainRef: mainRefProp,
}: Props) {
  const internalRef = useRef<HTMLDivElement>(null)
  const mainRef = mainRefProp ?? internalRef

  return (
    <main ref={mainRef as LegacyRef<HTMLElement>} className="ket-rw-main">
      {partId && (
        <ReadingHighlightToolbar
          rootRef={mainRef}
          highlights={highlights}
          onHighlightsChange={onHighlightsChange}
          notes={notes}
          onNotesChange={onNotesChange}
          resetKey={partId}
        />
      )}
      <ExamHighlightProvider highlights={highlights} notes={notes}>
        <ExamHighlightZone className="ket-rw-highlight-zone">
          {children}
        </ExamHighlightZone>
      </ExamHighlightProvider>
    </main>
  )
}