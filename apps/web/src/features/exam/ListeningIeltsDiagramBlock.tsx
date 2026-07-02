import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import ListeningIeltsSectionHeader from './ListeningIeltsSectionHeader'
import { resolveExamMediaUrl } from './examMediaUrl'
import { useBlobMediaUrl } from './useBlobMediaUrl'
import { sectionMetaFromQuestions } from './ieltsListeningSegmentUtils'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'

interface Props {
  part: ListeningPart
  blockIdPrefix: string
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

export default function ListeningIeltsDiagramBlock({
  part,
  blockIdPrefix,
  questions,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const highlights = useExamHighlights()
  const options = questions[0]?.options ?? []
  const meta = sectionMetaFromQuestions(questions)
  const imageSrc = useBlobMediaUrl(part.partImageKey, resolveExamMediaUrl(part.partImageUrl))
  const isActive = questions.some(q => q.id === activeQuestionId)

  return (
    <section className={`listening-ielts-diagram${isActive ? ' is-active' : ''}`}>
      <ListeningIeltsSectionHeader blockIdPrefix={blockIdPrefix} meta={meta} />

      {imageSrc && (
        <div className="listening-ielts-diagram__image-wrap">
          <img
            src={imageSrc}
            alt={meta.title ?? 'Diagram'}
            className="listening-ielts-diagram__image"
          />
        </div>
      )}

      <ul className="listening-ielts-matching__bank">
        {options.map(option => (
          <li key={option.id} className="listening-ielts-matching__bank-item">
            <span className="listening-ielts-matching__bank-letter">{option.id}</span>
            <ReadingHighlightableText
              blockId={`${blockIdPrefix}-bank-${option.id}`}
              text={option.label}
              highlights={highlights}
              as="span"
            />
          </li>
        ))}
      </ul>

      <div className="listening-ielts-matching__rows">
        {questions.map(question => (
          <div
            key={question.id}
            id={`listening-q-${question.id}`}
            className={`listening-ielts-matching__row${activeQuestionId === question.id ? ' is-active' : ''}`}
          >
            <select
              className="listening-ielts-matching__select"
              value={answers[question.id] ?? ''}
              data-highlight-skip
              onChange={e => {
                onSelectQuestion(question.id)
                onAnswer(question.id, e.target.value)
              }}
              onFocus={() => onSelectQuestion(question.id)}
            >
              <option value="">—</option>
              {options.map(option => (
                <option key={option.id} value={option.id}>
                  {option.id}
                </option>
              ))}
            </select>
            <span className="listening-ielts-matching__num">{question.number}</span>
            <ReadingHighlightableText
              blockId={`${question.id}-prompt`}
              text={question.prompt}
              highlights={highlights}
              className="listening-ielts-matching__prompt"
              as="span"
            />
          </div>
        ))}
      </div>
    </section>
  )
}