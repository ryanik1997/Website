import type { ReadingPart } from './examData'
import ReadingHighlightableText from './ReadingHighlightableText'
import type { ReadingHighlight } from './readingHighlightUtils'

interface ReadingPassagePanelProps {
  part: ReadingPart
  highlights: ReadingHighlight[]
}

export default function ReadingPassagePanel({
  part,
  highlights,
}: ReadingPassagePanelProps) {
  return (
    <article
      className="reading-test-passage"
      data-reading-highlight-zone
    >
      <p className="reading-test-part-kicker">Part {part.partNumber}</p>
      <p className="reading-test-part-range">{part.rangeLabel}</p>
      <h2 className="reading-test-passage-title">{part.passageTitle}</h2>
      {part.passageSubtitle && (
        <p className="reading-test-passage-subtitle">{part.passageSubtitle}</p>
      )}
      {part.passage.map((block, index) => (
        <p
          key={`${part.id}-p-${index}`}
          className="reading-test-paragraph"
        >
          {block.label && (
            <span className="reading-test-paragraph__label" data-highlight-skip>
              {block.label}
            </span>
          )}
          <ReadingHighlightableText
            blockId={`passage-p-${index}`}
            text={block.text}
            highlights={highlights}
            as="span"
          />
        </p>
      ))}
    </article>
  )
}