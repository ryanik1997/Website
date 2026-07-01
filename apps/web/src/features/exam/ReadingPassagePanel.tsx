import type { ReadingPart } from './examData'
import { getPartQuestions } from './examData'
import ReadingHighlightableText from './ReadingHighlightableText'
import type { ReadingHighlight } from './readingHighlightUtils'

interface ReadingPassagePanelProps {
  part: ReadingPart
  highlights: ReadingHighlight[]
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2'
  answers?: Record<string, string>
  activeQuestionId?: string | null
  onAnswer?: (questionId: string, value: string) => void
  onSelectQuestion?: (questionId: string) => void
}

function KetPart1Signs({
  part,
  highlights,
  answers = {},
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: ReadingPassagePanelProps) {
  const questions = getPartQuestions(part)

  return (
    <div className="reading-ket-signs">
      {questions.map(question => {
        const isActive = activeQuestionId === question.id
        return (
          <section
            key={question.id}
            id={`reading-q-${question.id}`}
            className={`reading-ket-signs__item${isActive ? ' is-active' : ''}`}
          >
            <p className="reading-ket-signs__num">{question.number}</p>
            <div className="reading-ket-signs__options">
              {question.options.map(option => {
                const selected = answers[question.id] === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`reading-ket-sign-option${selected ? ' is-selected' : ''}`}
                    onClick={() => {
                      onSelectQuestion?.(question.id)
                      onAnswer?.(question.id, option.id)
                    }}
                  >
                    <span className="reading-ket-sign-option__letter">{option.id.toUpperCase()}</span>
                    <ReadingHighlightableText
                      blockId={`${question.id}-sign-${option.id}`}
                      text={option.label}
                      highlights={highlights}
                      className="reading-ket-sign-option__label"
                      as="span"
                    />
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function PassageBlocks({
  part,
  highlights,
}: Pick<ReadingPassagePanelProps, 'part' | 'highlights'>) {
  if (!part.passage.length) {
    return (
      <p className="reading-test-passage-empty">
        Không có nội dung đọc cho part này. Thử import lại PDF hoặc kiểm tra preview khi import.
      </p>
    )
  }

  return part.passage.map((block, index) => (
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
  ))
}

export default function ReadingPassagePanel({
  part,
  highlights,
  cambridgeLevel,
  answers,
  activeQuestionId,
  onAnswer,
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
        <KetPart1Signs
          part={part}
          highlights={highlights}
          answers={answers}
          activeQuestionId={activeQuestionId}
          onAnswer={onAnswer}
          onSelectQuestion={onSelectQuestion}
        />
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