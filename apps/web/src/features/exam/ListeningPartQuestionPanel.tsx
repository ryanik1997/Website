import type { ListeningPart, ListeningQuestion } from './listeningExamData'

interface Props {
  part: ListeningPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
  onAnswer: (questionId: string, value: string) => void
}

function GapFillItem({
  question,
  answer,
  onAnswer,
  onSelect,
}: {
  question: ListeningQuestion
  answer: string
  onAnswer: (v: string) => void
  onSelect: () => void
}) {
  const limit = question.wordLimit ?? 2
  return (
    <div
      id={`listening-q-${question.id}`}
      className="listening-ielts-gap"
      onFocus={onSelect}
    >
      <span className="listening-ielts-gap__num">{question.number}</span>
      <div className="listening-ielts-gap__body">
        <p className="listening-ielts-gap__prompt">{question.prompt}</p>
        <input
          type="text"
          className="listening-ielts-gap__input"
          value={answer}
          placeholder={`Tối đa ${limit} từ`}
          onChange={e => onAnswer(e.target.value)}
          onFocus={onSelect}
        />
      </div>
    </div>
  )
}

function McItem({
  question,
  answer,
  onAnswer,
  onSelect,
}: {
  question: ListeningQuestion
  answer: string
  onAnswer: (v: string) => void
  onSelect: () => void
}) {
  return (
    <div id={`listening-q-${question.id}`} className="listening-ielts-mc">
      <p className="listening-ielts-mc__prompt">
        <span className="listening-ielts-mc__num">{question.number}</span>
        {question.prompt}
      </p>
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
    </div>
  )
}

function MatchingItem({
  question,
  answer,
  onAnswer,
  onSelect,
}: {
  question: ListeningQuestion
  answer: string
  onAnswer: (v: string) => void
  onSelect: () => void
}) {
  return (
    <div id={`listening-q-${question.id}`} className="listening-ielts-match">
      <p className="listening-ielts-mc__prompt">
        <span className="listening-ielts-mc__num">{question.number}</span>
        {question.prompt}
      </p>
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
    </div>
  )
}

export default function ListeningPartQuestionPanel({
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: Props) {
  return (
    <section className="listening-ielts-questions">
      {part.instruction && (
        <p className="listening-ielts-questions__instruction">{part.instruction}</p>
      )}
      {part.questions.map(question => {
        const answer = answers[question.id] ?? ''
        const select = () => onSelectQuestion(question.id)
        const setAnswer = (v: string) => onAnswer(question.id, v)

        if (question.type === 'gap-fill') {
          return (
            <GapFillItem
              key={question.id}
              question={question}
              answer={answer}
              onAnswer={setAnswer}
              onSelect={select}
            />
          )
        }
        if (question.type === 'matching') {
          return (
            <MatchingItem
              key={question.id}
              question={question}
              answer={answer}
              onAnswer={setAnswer}
              onSelect={select}
            />
          )
        }
        return (
          <McItem
            key={question.id}
            question={question}
            answer={answer}
            onAnswer={setAnswer}
            onSelect={select}
          />
        )
      })}
    </section>
  )
}