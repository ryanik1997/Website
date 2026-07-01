import { useRef } from 'react'
import type { ReadingQuestionGroup } from './examData'

interface Props {
  groups: ReadingQuestionGroup[]
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
  onAnswer: (questionId: string, value: string) => void
}

function TfngGroup({
  group,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  return (
    <section className="reading-test-group">
      <h3 className="reading-test-group__title">{group.range}</h3>
      <p className="reading-test-group__instruction">{group.instruction}</p>
      {group.questions.map(question => (
        <div
          key={question.id}
          id={`reading-q-${question.id}`}
          className="reading-test-tfng-item"
          onFocus={() => onSelectQuestion(question.id)}
        >
          <span className="reading-test-tfng-num">{question.number}</span>
          <div>
            <p className="reading-test-tfng-prompt">{question.prompt}</p>
            <div className="reading-test-tfng-options">
              {question.options.map(option => (
                <label key={option.id} className="reading-test-radio">
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => onAnswer(question.id, option.id)}
                    onFocus={() => onSelectQuestion(question.id)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

function MultipleChoiceGroup({
  group,
  answers,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'onSelectQuestion' | 'onAnswer'>) {
  return (
    <section className="reading-test-group">
      <h3 className="reading-test-group__title">{group.range}</h3>
      <p className="reading-test-group__instruction">{group.instruction}</p>
      {group.questions.map(question => (
        <div key={question.id} id={`reading-q-${question.id}`} className="reading-test-mc-item">
          <p className="reading-test-tfng-prompt">
            <span className="reading-test-tfng-num" style={{ display: 'inline', marginRight: '0.35rem' }}>
              {question.number}
            </span>
            {question.prompt}
          </p>
          <div className="reading-test-mc-options">
            {question.options.map(option => {
              const selected = answers[question.id] === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`reading-test-mc-option${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onSelectQuestion(question.id)
                    onAnswer(question.id, option.id)
                  }}
                >
                  <span className="reading-test-mc-letter">{option.id}</span>
                  <span className="reading-test-mc-label">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

function MatchingParagraphGroup({
  group,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const letters = group.paragraphLetters ?? []
  const activeInGroup = group.questions.some(q => q.id === activeQuestionId)
  const activeQuestion = group.questions.find(q => q.id === activeQuestionId) ?? null

  return (
    <section className="reading-test-group">
      <h3 className="reading-test-group__title">{group.range}</h3>
      <p className="reading-test-group__instruction">{group.instruction}</p>
      {group.note && <p className="reading-test-group__note">{group.note}</p>}

      {group.questions.map(question => {
        const answered = answers[question.id]
        const isActive = activeQuestionId === question.id
        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            role="button"
            tabIndex={0}
            className={`reading-test-match-row${isActive ? ' is-active' : ''}${answered ? ' is-answered' : ''}`}
            onClick={() => onSelectQuestion(question.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectQuestion(question.id)
              }
            }}
          >
            <span className="reading-test-match-num">{question.number}</span>
            <span className="reading-test-match-prompt">{question.prompt}</span>
            <span className="reading-test-match-answer">{answered ? answered.toUpperCase() : ''}</span>
          </div>
        )
      })}

      <div className="reading-test-para-pills">
        {letters.map(letter => (
          <button
            key={letter}
            type="button"
            className={`reading-test-para-pill${
              activeQuestion && answers[activeQuestion.id] === letter.toLowerCase() ? ' is-selected' : ''
            }`}
            disabled={!activeInGroup}
            onClick={() => {
              if (!activeQuestion) return
              onAnswer(activeQuestion.id, letter.toLowerCase())
              const idx = group.questions.findIndex(q => q.id === activeQuestion.id)
              const next = group.questions[idx + 1]
              if (next) onSelectQuestion(next.id)
            }}
          >
            Paragraph {letter}
          </button>
        ))}
      </div>
      <p className="reading-test-group__instruction" style={{ marginTop: '0.65rem', marginBottom: 0 }}>
        Chọn một câu hỏi, sau đó bấm Paragraph tương ứng.
      </p>
    </section>
  )
}

function GapFillGroup({
  group,
  answers,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'onSelectQuestion' | 'onAnswer'>) {
  return (
    <section className="reading-test-group">
      <h3 className="reading-test-group__title">{group.range}</h3>
      <p className="reading-test-group__instruction">{group.instruction}</p>
      {group.note && <p className="reading-test-group__note">{group.note}</p>}
      {group.questions.map(question => (
        <div key={question.id} id={`reading-q-${question.id}`} className="reading-test-mc-item">
          <p className="reading-test-tfng-prompt">
            <span className="reading-test-tfng-num" style={{ display: 'inline', marginRight: '0.35rem' }}>
              {question.number}
            </span>
            {question.prompt}
            {question.answerConfidence === 'inferred' && (
              <span className="reading-test-inferred-badge">Đoán</span>
            )}
          </p>
          <input
            type="text"
            className="reading-test-gap-input"
            value={answers[question.id] ?? ''}
            placeholder="ONE WORD"
            onChange={e => onAnswer(question.id, e.target.value.trim().toLowerCase())}
            onFocus={() => onSelectQuestion(question.id)}
          />
        </div>
      ))}
    </section>
  )
}

function SummaryCompletionGroup({
  group,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const bank = group.wordBank ?? []
  const activeQuestion = group.questions.find(q => q.id === activeQuestionId) ?? null

  return (
    <section className="reading-test-group">
      <h3 className="reading-test-group__title">{group.range}</h3>
      <p className="reading-test-group__instruction">{group.instruction}</p>
      {group.note && <p className="reading-test-group__note">{group.note}</p>}

      {bank.length > 0 && (
        <div className="reading-test-word-bank">
          <p className="reading-test-word-bank__title">Word bank</p>
          {bank.map(word => (
            <p key={word.id} className="reading-test-word-bank__item">
              <strong>{word.id.toUpperCase()}</strong> {word.label}
            </p>
          ))}
        </div>
      )}

      {group.questions.map(question => {
        const answered = answers[question.id]
        const isActive = activeQuestionId === question.id
        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            role="button"
            tabIndex={0}
            className={`reading-test-match-row${isActive ? ' is-active' : ''}${answered ? ' is-answered' : ''}`}
            onClick={() => onSelectQuestion(question.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectQuestion(question.id)
              }
            }}
          >
            <span className="reading-test-match-num">{question.number}</span>
            <span className="reading-test-match-prompt">
              {question.prompt}
              {question.answerConfidence === 'inferred' && (
                <span className="reading-test-inferred-badge">Đoán</span>
              )}
            </span>
            <span className="reading-test-match-answer">{answered ? answered.toUpperCase() : ''}</span>
          </div>
        )
      })}

      <div className="reading-test-feature-pills">
        {bank.map(word => (
          <button
            key={word.id}
            type="button"
            className={`reading-test-para-pill${
              activeQuestion && answers[activeQuestion.id] === word.id ? ' is-selected' : ''
            }`}
            disabled={!activeQuestion}
            onClick={() => {
              if (!activeQuestion) return
              onAnswer(activeQuestion.id, word.id)
              const idx = group.questions.findIndex(q => q.id === activeQuestion.id)
              const next = group.questions[idx + 1]
              if (next) onSelectQuestion(next.id)
            }}
          >
            {word.id.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  )
}

function MatchingFeaturesGroup({
  group,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const features = group.features ?? []
  const activeQuestion = group.questions.find(q => q.id === activeQuestionId) ?? null

  return (
    <section className="reading-test-group">
      <h3 className="reading-test-group__title">{group.range}</h3>
      <p className="reading-test-group__instruction">{group.instruction}</p>
      {group.note && <p className="reading-test-group__note">{group.note}</p>}

      <div className="reading-test-features">
        <p className="reading-test-features__title">List of features</p>
        {features.map(feature => (
          <p key={feature.id} className="reading-test-features__item">
            <strong>{feature.id.toUpperCase()}</strong> {feature.name}
          </p>
        ))}
      </div>

      {group.questions.map(question => {
        const answered = answers[question.id]
        const isActive = activeQuestionId === question.id
        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            role="button"
            tabIndex={0}
            className={`reading-test-match-row${isActive ? ' is-active' : ''}${answered ? ' is-answered' : ''}`}
            onClick={() => onSelectQuestion(question.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectQuestion(question.id)
              }
            }}
          >
            <span className="reading-test-match-num">{question.number}</span>
            <span className="reading-test-match-prompt">{question.prompt}</span>
            <span className="reading-test-match-answer">{answered ? answered.toUpperCase() : ''}</span>
          </div>
        )
      })}

      <div className="reading-test-feature-pills">
        {features.map(feature => (
          <button
            key={feature.id}
            type="button"
            className={`reading-test-para-pill${
              activeQuestion && answers[activeQuestion.id] === feature.id ? ' is-selected' : ''
            }`}
            disabled={!activeQuestion}
            onClick={() => {
              if (!activeQuestion) return
              onAnswer(activeQuestion.id, feature.id)
              const idx = group.questions.findIndex(q => q.id === activeQuestion.id)
              const next = group.questions[idx + 1]
              if (next) onSelectQuestion(next.id)
            }}
          >
            {feature.id.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  )
}

export default function ReadingQuestionPanel({
  groups,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={panelRef} className="reading-test-questions">
      {groups.map(group => {
        switch (group.type) {
          case 'tfng':
            return (
              <TfngGroup
                key={group.id}
                group={group}
                answers={answers}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
          case 'matching-paragraph':
            return (
              <MatchingParagraphGroup
                key={group.id}
                group={group}
                answers={answers}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
          case 'matching-features':
            return (
              <MatchingFeaturesGroup
                key={group.id}
                group={group}
                answers={answers}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
          case 'gap-fill':
          case 'sentence-completion':
            return (
              <GapFillGroup
                key={group.id}
                group={group}
                answers={answers}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
          case 'summary-completion':
            return (
              <SummaryCompletionGroup
                key={group.id}
                group={group}
                answers={answers}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
          default:
            return (
              <MultipleChoiceGroup
                key={group.id}
                group={group}
                answers={answers}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
        }
      })}
    </div>
  )
}