import type { ListeningQuestionOption } from './listeningExamData'

interface Props {
  options: ListeningQuestionOption[]
  answer: string
  onAnswer: (optionId: string) => void
  showLabels?: boolean
  compact?: boolean
}

export default function ListeningPictureChoiceRow({
  options,
  answer,
  onAnswer,
  showLabels = false,
  compact = false,
}: Props) {
  return (
    <div className={`listening-picture-choice${compact ? ' listening-picture-choice--compact' : ''}`}>
      {options.map(option => {
        const selected = answer === option.id
        return (
          <button
            key={option.id}
            type="button"
            className={`listening-picture-choice__btn${selected ? ' is-selected' : ''}`}
            onClick={() => onAnswer(option.id)}
            aria-label={`Chọn ${option.id}${option.label ? ` — ${option.label}` : ''}`}
          >
            <span className="listening-picture-choice__letter">{option.id}</span>
            {showLabels && option.label && (
              <span className="listening-picture-choice__label">{option.label}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}