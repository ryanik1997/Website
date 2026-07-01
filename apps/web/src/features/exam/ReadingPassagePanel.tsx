import type { ReadingPart } from './examData'
import { getPartQuestions } from './examData'
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

/** KET Part 1 — chỉ ảnh/sign ở cột trái; đáp án A/B/C ở cột phải (ReadingQuestionPanel). */
function KetPart1PassageImages({
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

function PassageBlocks({
  part,
  highlights,
}: Pick<ReadingPassagePanelProps, 'part' | 'highlights'>) {
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
              text={block.text}
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
  const isKetPart1 = cambridgeLevel === 'a2' && part.partNumber === 1
  const features = part.questionGroups.flatMap(g => g.features ?? [])
  const wordBank = part.questionGroups.flatMap(g => g.wordBank ?? [])

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

      {isKetPart1 ? (
        <>
          <KetPart1PassageImages
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
            />
          )}
        </>
      ) : (
        <PassageBlocks part={part} highlights={highlights} />
      )}

      {features.length > 0 && (
        <div className="reading-ket-features">
          <p className="reading-ket-features__title">Danh sách A–E</p>
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