import type { ElementType } from 'react'
import ReadingHighlightableText from '../ReadingHighlightableText'
import { useExamHighlights } from '../examHighlightContext'

interface Props {
  blockId: string
  text: string
  className?: string
  as?: ElementType
}

export default function RwHighlightText({ blockId, text, className, as = 'span' }: Props) {
  const highlights = useExamHighlights()
  if (!text) return null
  return (
    <ReadingHighlightableText
      blockId={blockId}
      text={text}
      highlights={highlights}
      className={className}
      as={as}
    />
  )
}