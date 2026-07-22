import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { IeltsSectionMeta } from './ieltsListeningSegmentUtils'

interface Props {
  blockIdPrefix: string
  meta: IeltsSectionMeta
}

export default function ListeningIeltsSectionHeader({ blockIdPrefix, meta }: Props) {
  const highlights = useExamHighlights()
  if (!meta.range && !meta.instruction && !meta.title) return null

  return (
    <div className="listening-ielts-section-head">
      {meta.range && (
        <p className="listening-ielts-section-head__range">{meta.range}</p>
      )}
      {meta.instruction && (
        <ExamHighlightableLines
          blockIdPrefix={`${blockIdPrefix}-instruction`}
          text={meta.instruction}
          lineClassName="listening-ielts-section-head__instruction"
        />
      )}
      {meta.title && (
        <ReadingHighlightableText
          blockId={`${blockIdPrefix}-title`}
          text={meta.title}
          highlights={highlights}
          className="listening-ielts-notes__title"
          as="h3"
        />
      )}
    </div>
  )
}