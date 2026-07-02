import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'

interface Props {
  blockIdPrefix: string
  text: string
  lineClassName?: string
}

export default function ExamHighlightableLines({
  blockIdPrefix,
  text,
  lineClassName,
}: Props) {
  const highlights = useExamHighlights()
  const lines = text.split('\n')

  return (
    <>
      {lines.map((line, index) => {
        if (!line.trim()) {
          return <br key={`${blockIdPrefix}-br-${index}`} />
        }
        return (
          <ReadingHighlightableText
            key={`${blockIdPrefix}-L${index}`}
            blockId={`${blockIdPrefix}-L${index}`}
            text={line}
            highlights={highlights}
            className={lineClassName}
            as="p"
          />
        )
      })}
    </>
  )
}