import type { ElementType, ReactNode } from 'react'
import { segmentsFromHighlights, type ReadingHighlight } from './readingHighlightUtils'

interface ReadingHighlightableTextProps {
  blockId: string
  text: string
  highlights: ReadingHighlight[]
  className?: string
  as?: ElementType
  children?: ReactNode
}

export default function ReadingHighlightableText({
  blockId,
  text,
  highlights,
  className,
  as: Tag = 'span',
  children,
}: ReadingHighlightableTextProps) {
  const segments = segmentsFromHighlights(text, highlights, blockId)

  return (
    <Tag className={className} data-highlight-block data-block-id={blockId}>
      {children}
      {segments.map((segment, segIndex) => (
        segment.highlighted ? (
          <mark
            key={`${blockId}-hl-${segIndex}`}
            className="reading-test-highlight"
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${blockId}-t-${segIndex}`}>{segment.text}</span>
        )
      ))}
    </Tag>
  )
}