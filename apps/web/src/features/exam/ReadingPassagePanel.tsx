import type { ReadingPart } from './examData'
import { getPartQuestions } from './examData'
import { formatPassageTextForDisplay } from './readingGapDisplay'
import {
  buildB1ReferenceBlocks,
  getB1IntroPassageBlocks,
  referenceLetter,
  resolveReferenceParts,
  splitReferenceText,
} from './readingB1ReferenceList'
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

/** PET B1 Part 2/4 — markets hoặc câu A–H ở cột trái, căn lề đều. */
function PassageLabeledReferenceList({
  blocks,
  rangeLabel,
  highlights,
  partId,
  partNumber,
}: {
  blocks: ReadingPart['passage']
  rangeLabel: string
  highlights: ReadingHighlight[]
  partId: string
  partNumber: number
}) {
  if (!blocks.length) return null
  const showMarketTitle = partNumber === 2

  return (
    <div className="reading-ket-features">
      <p className="reading-ket-features__title">{rangeLabel}</p>
      <ul className="reading-ket-features__list reading-ket-ref-list">
        {blocks.map((block, index) => {
          const { letter, title, body } = resolveReferenceParts(block, index, showMarketTitle)
          const displayTitle = title ?? (!body ? undefined : (
            showMarketTitle && body.length < 80 && !/[—–-]/.test(body) ? body : undefined
          ))
          const displayBody = displayTitle === body ? '' : body
          return (
            <li key={`${partId}-ref-${letter}-${index}`} className="reading-ket-ref-item">
              <span className="reading-ket-ref-item__letter" data-highlight-skip>
                {letter}
              </span>
              <div className="reading-ket-ref-item__content">
                {displayTitle && (
                  <p className="reading-ket-ref-item__title" data-highlight-skip>
                    {displayTitle}
                  </p>
                )}
                {displayBody && (
                  <ReadingHighlightableText
                    blockId={`${partId}-ref-${index}`}
                    text={displayBody}
                    highlights={highlights}
                    className="reading-ket-ref-item__text"
                    as="p"
                  />
                )}
              </div>
            </li>
          )
        })}
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
  const features = part.questionGroups.flatMap(g => g.features ?? [])
  const wordBank = part.questionGroups.flatMap(g => g.wordBank ?? [])
  const featureCount = features.length
  const featureRangeLabel = featureCount >= 8 ? 'A–H' : featureCount >= 5 ? 'A–E' : 'A–D'
  const b1Part = part.partNumber === 2 || part.partNumber === 4 ? part.partNumber : null
  const referenceBlocks = isB1MatchingRef && b1Part
    ? buildB1ReferenceBlocks(part.passage, features, b1Part)
    : []
  const useB1ReferenceList = referenceBlocks.length > 0
  const introPassageBlocks = isB1MatchingRef && b1Part
    ? getB1IntroPassageBlocks(part.passage, b1Part)
    : part.passage

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
      ) : useB1ReferenceList ? (
        <>
          <PassageBlocks
            part={{ ...part, passage: introPassageBlocks }}
            highlights={highlights}
            cambridgeLevel={cambridgeLevel}
          />
          <PassageLabeledReferenceList
            blocks={referenceBlocks}
            rangeLabel={`Danh sách ${featureRangeLabel}`}
            highlights={highlights}
            partId={part.id}
            partNumber={part.partNumber}
          />
        </>
      ) : (
        <PassageBlocks part={part} highlights={highlights} cambridgeLevel={cambridgeLevel} />
      )}

      {!useB1ReferenceList && features.length > 0 && (
        <div className="reading-ket-features">
          <p className="reading-ket-features__title">Danh sách {featureRangeLabel}</p>
          <ul className="reading-ket-features__list reading-ket-ref-list">
            {features.map((feature, index) => {
              const letter = referenceLetter(feature.id, index)
              const { title, body } = splitReferenceText(feature.name, part.partNumber === 2)
              return (
                <li key={feature.id} className="reading-ket-ref-item">
                  <span className="reading-ket-ref-item__letter" data-highlight-skip>
                    {letter}
                  </span>
                  <div className="reading-ket-ref-item__content">
                    {title && (
                      <p className="reading-ket-ref-item__title" data-highlight-skip>
                        {title}
                      </p>
                    )}
                    <p className="reading-ket-ref-item__text">{body}</p>
                  </div>
                </li>
              )
            })}
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