import type { ReadingQuestion } from '../examData'
import RwHighlightText from './RwHighlightText'

interface Props {
  partId: string
  question: ReadingQuestion
  answers: Record<string, string>
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
  formatOptionLabel?: (label: string) => string
}

export default function RwMcRadioQuestion({
  partId,
  question,
  answers,
  onSelectQuestion,
  onAnswer,
  formatOptionLabel,
}: Props) {
  const fmt = formatOptionLabel ?? ((label: string) => label)
  return (
    <div className="ket-rw-question" id={`reading-q-${question.id}`}>
      <p className="ket-rw-q-prompt">
        <span className="ket-rw-q-num">{question.number}</span>
        <RwHighlightText
          blockId={`${partId}-q-${question.id}-prompt`}
          text={question.prompt}
        />
      </p>
      <div className="ket-rw-radio-list">
        {question.options.map(opt => (
          <label key={opt.id} className="ket-rw-radio">
            <input
              type="radio"
              name={question.id}
              checked={answers[question.id] === opt.id}
              data-highlight-skip
              onChange={() => {
                onSelectQuestion(question.id)
                onAnswer(question.id, opt.id)
              }}
            />
            <RwHighlightText
              blockId={`${partId}-q-${question.id}-opt-${opt.id}`}
              text={fmt(opt.label)}
            />
          </label>
        ))}
      </div>
    </div>
  )
}