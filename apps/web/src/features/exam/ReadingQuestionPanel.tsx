import type { ReadingQuestionGroup } from './examData'
import ReadingHighlightableText from './ReadingHighlightableText'
import type { ReadingHighlight } from './readingHighlightUtils'

interface Props {
  groups: ReadingQuestionGroup[]
  answers: Record<string, string>
  activeQuestionId: string | null
  highlights: ReadingHighlight[]
  onSelectQuestion: (questionId: string) => void
  onAnswer: (questionId: string, value: string) => void
}

function TfngGroup({
  group,
  answers,
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  return (
    <section className="reading-test-group">
      <ReadingHighlightableText
        blockId={`${group.id}-range`}
        text={group.range}
        highlights={highlights}
        className="reading-test-group__title"
        as="h3"
      />
      <ReadingHighlightableText
        blockId={`${group.id}-instruction`}
        text={group.instruction}
        highlights={highlights}
        className="reading-test-group__instruction"
        as="p"
      />
      {group.questions.map(question => (
        <div
          key={question.id}
          id={`reading-q-${question.id}`}
          className="reading-test-tfng-item"
          onFocus={() => onSelectQuestion(question.id)}
        >
          <span className="reading-test-tfng-num" data-highlight-skip>{question.number}</span>
          <div>
            <ReadingHighlightableText
              blockId={`${question.id}-prompt`}
              text={question.prompt}
              highlights={highlights}
              className="reading-test-tfng-prompt"
              as="p"
            />
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
                  <ReadingHighlightableText
                    blockId={`${question.id}-opt-${option.id}`}
                    text={option.label}
                    highlights={highlights}
                    as="span"
                  />
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
  highlights,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'onSelectQuestion' | 'onAnswer'>) {
  return (
    <section className="reading-test-group">
      <ReadingHighlightableText
        blockId={`${group.id}-range`}
        text={group.range}
        highlights={highlights}
        className="reading-test-group__title"
        as="h3"
      />
      <ReadingHighlightableText
        blockId={`${group.id}-instruction`}
        text={group.instruction}
        highlights={highlights}
        className="reading-test-group__instruction"
        as="p"
      />
      {group.questions.map(question => (
        <div key={question.id} id={`reading-q-${question.id}`} className="reading-test-mc-item">
          <p className="reading-test-tfng-prompt">
            <span className="reading-test-tfng-num" data-highlight-skip style={{ display: 'inline', marginRight: '0.35rem' }}>
              {question.number}
            </span>
            <ReadingHighlightableText
              blockId={`${question.id}-prompt`}
              text={question.prompt}
              highlights={highlights}
              as="span"
            />
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
                  <span className="reading-test-mc-letter" data-highlight-skip>{option.id}</span>
                  <ReadingHighlightableText
                    blockId={`${question.id}-opt-${option.id}`}
                    text={option.label}
                    highlights={highlights}
                    className="reading-test-mc-label"
                    as="span"
                  />
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
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const letters = group.paragraphLetters ?? []
  const activeInGroup = group.questions.some(q => q.id === activeQuestionId)
  const activeQuestion = group.questions.find(q => q.id === activeQuestionId) ?? null

  return (
    <section className="reading-test-group">
      <ReadingHighlightableText
        blockId={`${group.id}-range`}
        text={group.range}
        highlights={highlights}
        className="reading-test-group__title"
        as="h3"
      />
      <ReadingHighlightableText
        blockId={`${group.id}-instruction`}
        text={group.instruction}
        highlights={highlights}
        className="reading-test-group__instruction"
        as="p"
      />
      {group.note && (
        <ReadingHighlightableText
          blockId={`${group.id}-note`}
          text={group.note}
          highlights={highlights}
          className="reading-test-group__note"
          as="p"
        />
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
            <span className="reading-test-match-num" data-highlight-skip>{question.number}</span>
            <ReadingHighlightableText
              blockId={`${question.id}-prompt`}
              text={question.prompt}
              highlights={highlights}
              className="reading-test-match-prompt"
              as="span"
            />
            <span className="reading-test-match-answer" data-highlight-skip>
              {answered ? answered.toUpperCase() : ''}
            </span>
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
  highlights,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'onSelectQuestion' | 'onAnswer'>) {
  return (
    <section className="reading-test-group">
      <ReadingHighlightableText
        blockId={`${group.id}-range`}
        text={group.range}
        highlights={highlights}
        className="reading-test-group__title"
        as="h3"
      />
      <ReadingHighlightableText
        blockId={`${group.id}-instruction`}
        text={group.instruction}
        highlights={highlights}
        className="reading-test-group__instruction"
        as="p"
      />
      {group.note && (
        <ReadingHighlightableText
          blockId={`${group.id}-note`}
          text={group.note}
          highlights={highlights}
          className="reading-test-group__note"
          as="p"
        />
      )}
      {group.questions.map(question => (
        <div key={question.id} id={`reading-q-${question.id}`} className="reading-test-mc-item">
          <p className="reading-test-tfng-prompt">
            <span className="reading-test-tfng-num" data-highlight-skip style={{ display: 'inline', marginRight: '0.35rem' }}>
              {question.number}
            </span>
            <ReadingHighlightableText
              blockId={`${question.id}-prompt`}
              text={question.prompt}
              highlights={highlights}
              as="span"
            />
            {question.answerConfidence === 'inferred' && (
              <span className="reading-test-inferred-badge" data-highlight-skip>Đoán</span>
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
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const bank = group.wordBank ?? []
  const activeQuestion = group.questions.find(q => q.id === activeQuestionId) ?? null

  return (
    <section className="reading-test-group">
      <ReadingHighlightableText
        blockId={`${group.id}-range`}
        text={group.range}
        highlights={highlights}
        className="reading-test-group__title"
        as="h3"
      />
      <ReadingHighlightableText
        blockId={`${group.id}-instruction`}
        text={group.instruction}
        highlights={highlights}
        className="reading-test-group__instruction"
        as="p"
      />
      {group.note && (
        <ReadingHighlightableText
          blockId={`${group.id}-note`}
          text={group.note}
          highlights={highlights}
          className="reading-test-group__note"
          as="p"
        />
      )}

      {bank.length > 0 && (
        <div className="reading-test-word-bank">
          <p className="reading-test-word-bank__title">Word bank</p>
          {bank.map(word => (
            <p key={word.id} className="reading-test-word-bank__item">
              <strong data-highlight-skip>{word.id.toUpperCase()}</strong>
              {' '}
              <ReadingHighlightableText
                blockId={`${group.id}-bank-${word.id}`}
                text={word.label}
                highlights={highlights}
                as="span"
              />
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
            <span className="reading-test-match-num" data-highlight-skip>{question.number}</span>
            <span className="reading-test-match-prompt">
              <ReadingHighlightableText
                blockId={`${question.id}-prompt`}
                text={question.prompt}
                highlights={highlights}
                as="span"
              />
              {question.answerConfidence === 'inferred' && (
                <span className="reading-test-inferred-badge" data-highlight-skip>Đoán</span>
              )}
            </span>
            <span className="reading-test-match-answer" data-highlight-skip>
              {answered ? answered.toUpperCase() : ''}
            </span>
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
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const features = group.features ?? []
  const activeQuestion = group.questions.find(q => q.id === activeQuestionId) ?? null

  return (
    <section className="reading-test-group">
      <ReadingHighlightableText
        blockId={`${group.id}-range`}
        text={group.range}
        highlights={highlights}
        className="reading-test-group__title"
        as="h3"
      />
      <ReadingHighlightableText
        blockId={`${group.id}-instruction`}
        text={group.instruction}
        highlights={highlights}
        className="reading-test-group__instruction"
        as="p"
      />
      {group.note && (
        <ReadingHighlightableText
          blockId={`${group.id}-note`}
          text={group.note}
          highlights={highlights}
          className="reading-test-group__note"
          as="p"
        />
      )}

      <div className="reading-test-features">
        <p className="reading-test-features__title">List of features</p>
        {features.map(feature => (
          <p key={feature.id} className="reading-test-features__item">
            <strong data-highlight-skip>{feature.id.toUpperCase()}</strong>
            {' '}
            <ReadingHighlightableText
              blockId={`${group.id}-feature-${feature.id}`}
              text={feature.name}
              highlights={highlights}
              as="span"
            />
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
            <span className="reading-test-match-num" data-highlight-skip>{question.number}</span>
            <ReadingHighlightableText
              blockId={`${question.id}-prompt`}
              text={question.prompt}
              highlights={highlights}
              className="reading-test-match-prompt"
              as="span"
            />
            <span className="reading-test-match-answer" data-highlight-skip>
              {answered ? answered.toUpperCase() : ''}
            </span>
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
  highlights,
  onSelectQuestion,
  onAnswer,
}: Props) {
  return (
    <div className="reading-test-questions" data-reading-highlight-zone>
      {groups.map(group => {
        switch (group.type) {
          case 'tfng':
            return (
              <TfngGroup
                key={group.id}
                group={group}
                answers={answers}
                highlights={highlights}
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
                highlights={highlights}
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
                highlights={highlights}
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
                highlights={highlights}
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
                highlights={highlights}
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
                highlights={highlights}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
        }
      })}
    </div>
  )
}