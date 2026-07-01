import type { ReadingPart } from './examData'
import { getPartQuestions } from './examData'
import { formatPassageTextForDisplay } from './readingGapDisplay'
import ReadingHighlightableText from './ReadingHighlightableText'
import type { ReadingHighlight } from './readingHighlightUtils'
import { useBlobMediaUrl } from './useBlobMediaUrl'

interface ReadingPassagePanelProps {
  part: ReadingPart
  highlights: ReadingHighlight[]
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2'
  activeQuestionId?: string | null
  onSelectQuestion?: (questionId: string) => void
}

/** A2/B1 Part 1 — chỉ ảnh/sign ở cột trái; đáp án ở cột phải. */
function SignsPart1PassageImages({
  part,
  activeQuestionId,
  onSelectQuestion,
}: Pick<ReadingPassagePanelProps, 'part' | 'activeQuestionId' | 'onSelectQuestion'>) {
  const questions = getPartQuestions(part)
  const imageBlocks = part.passage
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => Boolean(block.imageKey || block.imageUrl))

  if (!imageBlocks.length) return null

  return (
    <div className="reading-ket-signs">
      {imageBlocks.map(({ block, index }, imageIndex) => {
        const question = questions[imageIndex] ?? questions.find(q => q.number === imageIndex + 1)
        const isActive = question ? activeQuestionId === question.id : false
        return (
          <section
            key={`${part.id}-ket-img-${index}`}
            className={`reading-ket-signs__item${isActive ? ' is-active' : ''}`}
            role={question ? 'button' : undefined}
            tabIndex={question ? 0 : undefined}
            onClick={() => question && onSelectQuestion?.(question.id)}
            onKeyDown={e => {
              if (!question) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectQuestion?.(question.id)
              }
            }}
          >
            <p className="reading-ket-signs__num">{question?.number ?? imageIndex + 1}</p>
            <PassageImage
              imageKey={block.imageKey}
              imageUrl={block.imageUrl}
              alt={`${part.passageTitle} — question ${question?.number ?? imageIndex + 1}`}
            />
          </section>
        )
      })}
    </div>
  )
}

function PassageImage({ imageKey, imageUrl, alt }: { imageKey?: string; imageUrl?: string; alt: string }) {
  const src = useBlobMediaUrl(imageKey, imageUrl)
  if (!src) return null

  return (
    <figure className="reading-test-passage-image">
      <img src={src} alt={alt} className="reading-test-passage-image__img" />
    </figure>
  )
}

/** PET B1 Part 2/4 — markets hoặc câu A–H ở cột trái, đánh số rõ. */
function PassageLabeledReferenceList({
  blocks,
  rangeLabel,
  highlights,
  partId,
}: {
  blocks: ReadingPart['passage']
  rangeLabel: string
  highlights: ReadingHighlight[]
  partId: string
}) {
  if (!blocks.length) return null

  return (
    <div className="reading-ket-features">
      <p className="reading-ket-features__title">{rangeLabel}</p>
      <ul className="reading-ket-features__list">
        {blocks.map((block, index) => (
          <li key={`${partId}-ref-${block.label ?? index}`}>
            <span className="reading-ket-features__id" data-highlight-skip>
              {(block.label ?? '').toUpperCase()}
            </span>
            <ReadingHighlightableText
              blockId={`${partId}-ref-${index}`}
              text={block.text ?? ''}
              highlights={highlights}
              as="span"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function PassageBlocks({
  part,
  highlights,
  cambridgeLevel,
}: Pick<ReadingPassagePanelProps, 'part' | 'highlights' | 'cambridgeLevel'>) {
  if (!part.passage.length) {
    return (
      <p className="reading-test-passage-empty">
        Không có nội dung đọc cho part này. Thử import lại hoặc kiểm tra preview khi import.
      </p>
    )
  }

  return part.passage.map((block, index) => {
    const hasText = Boolean(block.text?.trim())
    const hasImage = Boolean(block.imageKey || block.imageUrl)

    if (!hasText && hasImage) {
      return (
        <PassageImage
          key={`${part.id}-img-${index}`}
          imageKey={block.imageKey}
          imageUrl={block.imageUrl}
          alt={`${part.passageTitle} — illustration ${index + 1}`}
        />
      )
    }

    return (
      <div key={`${part.id}-p-${index}`} className="reading-test-paragraph-wrap">
        {hasImage && (
          <PassageImage
            imageKey={block.imageKey}
            imageUrl={block.imageUrl}
            alt={`${part.passageTitle} — illustration ${index + 1}`}
          />
        )}
        {hasText && (
          <p className="reading-test-paragraph">
            {block.label && (
              <span className="reading-test-paragraph__label" data-highlight-skip>
                {block.label}
              </span>
            )}
            <ReadingHighlightableText
              blockId={`passage-p-${index}`}
              text={formatPassageTextForDisplay(block.text ?? '', part, cambridgeLevel)}
              highlights={highlights}
              as="span"
            />
          </p>
        )}
      </div>
    )
  })
}

export default function ReadingPassagePanel({
  part,
  highlights,
  cambridgeLevel,
  activeQuestionId,
  onSelectQuestion,
}: ReadingPassagePanelProps) {
  const isSignsPart1 = (cambridgeLevel === 'a2' || cambridgeLevel === 'b1') && part.partNumber === 1
  const isB1MatchingRef = cambridgeLevel === 'b1' && (part.partNumber === 2 || part.partNumber === 4)
  const labeledPassageBlocks = part.passage.filter(b => Boolean(b.label?.trim()))
  const unlabeledPassageBlocks = part.passage.filter(b => !b.label?.trim())
  const useLabeledPassageList = isB1MatchingRef && labeledPassageBlocks.length > 0
  const features = part.questionGroups.flatMap(g => g.features ?? [])
  const wordBank = part.questionGroups.flatMap(g => g.wordBank ?? [])
  const featureCount = features.length
  const featureRangeLabel = featureCount >= 8 ? 'A–H' : featureCount >= 5 ? 'A–E' : 'A–D'
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

      {isSignsPart1 ? (
        <>
          <SignsPart1PassageImages
            part={part}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={onSelectQuestion}
          />
          {part.passage.some(b => b.text?.trim()) && (
            <PassageBlocks
              part={{
                ...part,
                passage: part.passage.filter(b => b.text?.trim()),
              }}
              highlights={highlights}
              cambridgeLevel={cambridgeLevel}
            />
          )}
        </>
      ) : useLabeledPassageList ? (
        <>
          <PassageBlocks
            part={{ ...part, passage: unlabeledPassageBlocks }}
            highlights={highlights}
            cambridgeLevel={cambridgeLevel}
          />
          <PassageLabeledReferenceList
            blocks={labeledPassageBlocks}
            rangeLabel={`Danh sách ${featureRangeLabel}`}
            highlights={highlights}
            partId={part.id}
          />
        </>
      ) : (
        <PassageBlocks part={part} highlights={highlights} cambridgeLevel={cambridgeLevel} />
      )}

      {!useLabeledPassageList && features.length > 0 && (
        <div className="reading-ket-features">
          <p className="reading-ket-features__title">Danh sách {featureRangeLabel}</p>
          <ul className="reading-ket-features__list">
            {features.map(feature => (
              <li key={feature.id}>
                <span className="reading-ket-features__id">{feature.id.toUpperCase()}</span>
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {wordBank.length > 0 && (
        <div className="reading-ket-wordbank">
          <p className="reading-ket-wordbank__title">Word bank</p>
          <div className="reading-ket-wordbank__pills">
            {wordBank.map(word => (
              <span key={word.id} className="reading-ket-wordbank__pill">
                <strong>{word.id.toUpperCase()}</strong> {word.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}