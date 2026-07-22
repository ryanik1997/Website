import type { ElementType, ReactNode } from 'react'
import { useExamNotes } from './examHighlightContext'
import {
  segmentsFromAnnotations,
  type ReadingHighlight,
  type TextNote,
} from './readingHighlightUtils'

interface ReadingHighlightableTextProps {
  blockId: string
  text: string
  highlights: ReadingHighlight[]
  notes?: TextNote[]
  className?: string
  as?: ElementType
  children?: ReactNode
}

export default function ReadingHighlightableText({
  blockId,
  text,
  highlights,
  notes: notesProp,
  className,
  as: Tag = 'span',
  children,
}: ReadingHighlightableTextProps) {
  const contextNotes = useExamNotes()
  const notes = notesProp ?? contextNotes
  const segments = segmentsFromAnnotations(text ?? '', highlights, notes, blockId)

  return (
    <Tag className={className} data-highlight-block data-block-id={blockId}>
      {children}
      {segments.map((segment, segIndex) => {
        const classNames = [
          segment.highlighted
            ? (segment.evidence ? 'reading-test-highlight reading-test-highlight--evidence' : 'reading-test-highlight')
            : '',
          segment.note ? 'reading-test-note' : '',
        ].filter(Boolean).join(' ')

        if (segment.highlighted || segment.note) {
          const Wrapper = segment.highlighted ? 'mark' : 'span'
          return (
            <Wrapper
              key={`${blockId}-seg-${segIndex}`}
              className={classNames || undefined}
              title={segment.note ?? (segment.evidence ? 'Đoạn AI chỉ (đáp án / thông tin đúng)' : undefined)}
              data-ai-evidence={segment.evidence ? '1' : undefined}
            >
              {segment.text}
            </Wrapper>
          )
        }

        return (
          <span key={`${blockId}-t-${segIndex}`}>{segment.text}</span>
        )
      })}
    </Tag>
  )
}