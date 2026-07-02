import type { ReactNode } from 'react'
import ListeningPictureOption from './ListeningPictureOption'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'

interface Props {
  part: ListeningPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
  onAnswer: (questionId: string, value: string) => void
}

function PromptRow({ question, isActive, onSelect }: {
  question: ListeningQuestion
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <div
      id={`listening-q-${question.id}`}
      className={`listening-split-prompt-row${isActive ? ' is-active' : ''}`}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === 'Enter') onSelect() }}
      role="button"
      tabIndex={0}
    >
      <span className="listening-split-prompt-row__num">{question.number}</span>
      <p className="listening-split-prompt-row__text">{question.prompt}</p>
    </div>
  )
}

function AnswerRow({
  question,
  answer,
  isActive,
  onAnswer,
  onSelect,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
}) {
  const isPictureMc = question.type === 'picture-mc'
  const isGapFill = question.type === 'gap-fill'
  const isMatching = question.type === 'matching'
  const isMc = !isGapFill && !isMatching && !isPictureMc
  const wordLimit = question.wordLimit ?? (isGapFill ? 2 : undefined)

  return (
    <div
      id={`listening-a-${question.id}`}
      className={`listening-split-answer-row${isActive ? ' is-active' : ''}`}
      onFocus={onSelect}
    >
      <span className="listening-split-answer-row__num">{question.number}</span>
      <div className="listening-split-answer-row__body">
        {isGapFill && (
          <input
            type="text"
            className="listening-ielts-gap__input"
            value={answer}
            placeholder={`Tối đa ${wordLimit} từ`}
            onChange={e => onAnswer(e.target.value)}
            onFocus={onSelect}
          />
        )}

        {isMatching && (
          <div className="listening-ielts-match__pills">
            {question.options.map(option => {
              const selected = answer === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`listening-ielts-match__pill${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onSelect()
                    onAnswer(option.id)
                  }}
                >
                  {option.id}. {option.label}
                </button>
              )
            })}
          </div>
        )}

        {isMc && (
          <div className="listening-ielts-mc__options">
            {question.options.map(option => {
              const selected = answer === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`listening-ielts-mc__opt${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onSelect()
                    onAnswer(option.id)
                  }}
                >
                  <span className="listening-ielts-mc__letter">{option.id}</span>
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {isPictureMc && (
          <div className="listening-exam-card__pictures listening-exam-card__pictures--compact">
            {question.options.map(option => (
              <ListeningPictureOption
                key={option.id}
                option={option}
                selected={answer === option.id}
                onSelect={() => {
                  onSelect()
                  onAnswer(option.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ListeningPartPromptPanel({
  part,
  activeQuestionId,
  onSelectQuestion,
  audioSlot,
}: {
  part: ListeningPart
  activeQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
  audioSlot?: ReactNode
}) {
  return (
    <div className="listening-exam-prompt-pane">
      <p className="listening-exam-prompt-pane__part">
        Part {part.partNumber} · {part.rangeLabel}
      </p>
      {part.instruction && (
        <p className="listening-exam-prompt-pane__instruction">{part.instruction}</p>
      )}
      {audioSlot}
      <div className="listening-split-prompt-list">
        {part.questions.map(question => (
          <PromptRow
            key={question.id}
            question={question}
            isActive={activeQuestionId === question.id}
            onSelect={() => onSelectQuestion(question.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function ListeningPartAnswerPanel({
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: Props) {
  return (
    <div className="listening-exam-answer-pane">
      <h3 className="listening-exam-answer-pane__title">Đáp án</h3>
      <div className="listening-split-answer-list">
        {part.questions.map(question => (
          <AnswerRow
            key={question.id}
            question={question}
            answer={answers[question.id] ?? ''}
            isActive={activeQuestionId === question.id}
            onAnswer={v => onAnswer(question.id, v)}
            onSelect={() => onSelectQuestion(question.id)}
          />
        ))}
      </div>
    </div>
  )
}

/** @deprecated Dùng ListeningPartPromptPanel + ListeningPartAnswerPanel trong split body */
export default function ListeningPartQuestionPanel(props: Props) {
  return (
    <section className="listening-ielts-questions">
      <ListeningPartPromptPanel
        part={props.part}
        activeQuestionId={props.activeQuestionId}
        onSelectQuestion={props.onSelectQuestion}
      />
      <ListeningPartAnswerPanel {...props} />
    </section>
  )
}