import type { ReadingQuestionGroup } from './examData'
import ReadingHighlightableText from './ReadingHighlightableText'
import ReadingNotePassageBox from './ReadingNotePassageBox'
import ReadingNoteTableView from './ReadingNoteTable'
import type { ReadingHighlight } from './readingHighlightUtils'
import { useBlobMediaUrl } from './useBlobMediaUrl'

interface Props {
  groups: ReadingQuestionGroup[]
  answers: Record<string, string>
  activeQuestionId: string | null
  highlights: ReadingHighlight[]
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2'
  partNumber?: number
  onSelectQuestion: (questionId: string) => void
  onAnswer: (questionId: string, value: string) => void
}

function TriStateGroup({
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

function TfngGroup(props: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  return <TriStateGroup {...props} />
}

function YnngGroup(props: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  return <TriStateGroup {...props} />
}

function MultipleChoiceGroup({
  group,
  answers,
  highlights,
  cambridgeLevel,
  partNumber,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'cambridgeLevel' | 'partNumber' | 'onSelectQuestion' | 'onAnswer'>) {
  const compactLetters = cambridgeLevel === 'a2' && partNumber === 2
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
          <div className={`reading-test-mc-options${compactLetters ? ' is-compact' : ''}`}>
            {question.options.map(option => {
              const selected = answers[question.id] === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`reading-test-mc-option${selected ? ' is-selected' : ''}${compactLetters ? ' is-letter-only' : ''}`}
                  onClick={() => {
                    onSelectQuestion(question.id)
                    onAnswer(question.id, option.id)
                  }}
                >
                  <span className="reading-test-mc-letter" data-highlight-skip>{option.id.toUpperCase()}</span>
                  {!compactLetters && (
                    <ReadingHighlightableText
                      blockId={`${question.id}-opt-${option.id}`}
                      text={option.label}
                      highlights={highlights}
                      className="reading-test-mc-label"
                      as="span"
                    />
                  )}
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

function MatchingHeadingsGroup({
  group,
  answers,
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const headings = group.headings ?? []
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

      {headings.length > 0 && (
        <div className="reading-test-headings">
          <p className="reading-test-headings__title">List of Headings</p>
          <ul className="reading-test-headings__list">
            {headings.map(heading => (
              <li key={heading.id} className="reading-test-headings__item">
                <span className="reading-test-headings__id" data-highlight-skip>{heading.id}</span>
                <ReadingHighlightableText
                  blockId={`${group.id}-heading-${heading.id}`}
                  text={heading.label}
                  highlights={highlights}
                  as="span"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {group.questions.map(question => {
        const answered = answers[question.id]
        const isActive = activeQuestionId === question.id
        const answeredHeading = headings.find(h => h.id.toLowerCase() === answered?.toLowerCase())
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
            <span className="reading-test-match-answer" data-highlight-skip title={answeredHeading?.label}>
              {answered ? answered.toLowerCase() : ''}
            </span>
          </div>
        )
      })}

      <div className="reading-test-heading-pills">
        {headings.map(heading => (
          <button
            key={heading.id}
            type="button"
            className={`reading-test-heading-pill${
              activeQuestion && answers[activeQuestion.id]?.toLowerCase() === heading.id.toLowerCase()
                ? ' is-selected'
                : ''
            }`}
            disabled={!activeInGroup}
            title={heading.label}
            onClick={() => {
              if (!activeQuestion) return
              onAnswer(activeQuestion.id, heading.id.toLowerCase())
              const idx = group.questions.findIndex(q => q.id === activeQuestion.id)
              const next = group.questions[idx + 1]
              if (next) onSelectQuestion(next.id)
            }}
          >
            {heading.id}
          </button>
        ))}
      </div>
      <p className="reading-test-group__instruction" style={{ marginTop: '0.65rem', marginBottom: 0 }}>
        Chọn một đoạn (Paragraph), sau đó bấm heading i, ii, iii… tương ứng.
      </p>
    </section>
  )
}

function gapFillPlaceholder(group: ReadingQuestionGroup): string {
  const hint = `${group.instruction ?? ''} ${group.note ?? ''}`.toLowerCase()
  if (hint.includes('one word and/or a number') || hint.includes('word and/or a number')) {
    return 'ONE WORD/NUMBER'
  }
  if (hint.includes('three and six') || hint.includes('3 and 6') || hint.includes('3–6')) {
    return '3–6 words'
  }
  const multiWordAnswer = group.questions.some(q => q.answer.trim().includes(' '))
  if (multiWordAnswer && hint.includes('transformation')) return '3–6 words'
  return 'ONE WORD'
}

function GroupImage({ imageKey, imageUrl, alt }: { imageKey?: string; imageUrl?: string; alt: string }) {
  const src = useBlobMediaUrl(imageKey, imageUrl)
  if (!src) return null

  return (
    <figure className="reading-test-passage-image reading-test-group__image">
      <img src={src} alt={alt} className="reading-test-passage-image__img" />
    </figure>
  )
}

function SummaryGapFillNote({
  group,
  note,
  placeholder,
  answers,
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
  note: string
  placeholder: string
  answers: Record<string, string>
  highlights: ReadingHighlight[]
  activeQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
  onAnswer: (questionId: string, value: string) => void
}) {
  const questionByNumber = new Map(group.questions.map(q => [q.number, q]))
  const paragraphs = note.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

  return (
    <div className="reading-test-summary-passage">
      {paragraphs.map((paragraph, pIndex) => {
        const segments = parseSummaryNoteSegments(paragraph)
        const isTitle = pIndex === 0 && !segments.some(s => s.kind === 'gap')
        return (
          <p
            key={`${group.id}-gap-summary-p${pIndex}`}
            className={isTitle ? 'reading-test-summary-passage__title' : 'reading-test-summary-passage__para'}
          >
            {segments.map((segment, sIndex) => {
              if (segment.kind === 'text') {
                return (
                  <ReadingHighlightableText
                    key={`${group.id}-gap-summary-p${pIndex}-t${sIndex}`}
                    blockId={`${group.id}-gap-summary-p${pIndex}-t${sIndex}`}
                    text={segment.text}
                    highlights={highlights}
                    as="span"
                  />
                )
              }
              const question = questionByNumber.get(segment.number)
              if (!question) {
                return (
                  <span key={`${group.id}-gap-summary-p${pIndex}-g${sIndex}`} data-highlight-skip>
                    {segment.number}________
                  </span>
                )
              }
              const isActive = activeQuestionId === question.id
              return (
                <span
                  key={`${group.id}-gap-summary-p${pIndex}-g${sIndex}`}
                  className={`reading-test-summary-gap reading-test-summary-gap--input${isActive ? ' is-active' : ''}`}
                  data-highlight-skip
                >
                  <span className="reading-test-summary-gap__num">{segment.number}</span>
                  <input
                    type="text"
                    id={`reading-q-${question.id}`}
                    className="reading-test-summary-gap__input"
                    value={answers[question.id] ?? ''}
                    placeholder={placeholder}
                    aria-label={`Question ${question.number}`}
                    onChange={e => onAnswer(question.id, e.target.value.trim().toLowerCase())}
                    onFocus={() => onSelectQuestion(question.id)}
                  />
                </span>
              )
            })}
          </p>
        )
      })}
    </div>
  )
}

function GapFillGroup({
  group,
  answers,
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
  activeQuestionId?: string | null
} & Pick<Props, 'answers' | 'highlights' | 'onSelectQuestion' | 'onAnswer'>) {
  const placeholder = gapFillPlaceholder(group)
  const hasNotePassage = Boolean(group.notePassage?.length)
  const hasNoteTable = Boolean(group.noteTable?.headers?.length && group.noteTable.rows?.length)
  const inlineSummary = summaryNoteHasInlineGaps(group.note)
  const hasGroupImage = !hasNoteTable && !hasNotePassage && !inlineSummary && Boolean(group.imageKey || group.imageUrl)
  const questionsByNumber = new Map(group.questions.map(q => [q.number, q]))
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
      {group.note && inlineSummary && (
        <SummaryGapFillNote
          group={group}
          note={group.note}
          placeholder={placeholder}
          answers={answers}
          highlights={highlights}
          activeQuestionId={activeQuestionId ?? null}
          onSelectQuestion={onSelectQuestion}
          onAnswer={onAnswer}
        />
      )}
      {group.note && !inlineSummary && (
        <ReadingHighlightableText
          blockId={`${group.id}-note`}
          text={group.note}
          highlights={highlights}
          className="reading-test-group__note"
          as="p"
        />
      )}
      {hasNotePassage && group.notePassage && (
        <ReadingNotePassageBox
          groupId={group.id}
          blocks={group.notePassage}
          questionsByNumber={questionsByNumber}
          answers={answers}
          highlights={highlights}
          activeQuestionId={activeQuestionId ?? null}
          placeholder={placeholder}
          notesTitle={group.notesTitle}
          onAnswer={onAnswer}
          onSelectQuestion={onSelectQuestion}
        />
      )}
      {hasNoteTable && group.noteTable && (
        <ReadingNoteTableView
          groupId={group.id}
          table={group.noteTable}
          questionsByNumber={questionsByNumber}
          answers={answers}
          highlights={highlights}
          activeQuestionId={activeQuestionId ?? null}
          placeholder={placeholder}
          onAnswer={onAnswer}
          onSelectQuestion={onSelectQuestion}
        />
      )}
      {hasGroupImage && (
        <GroupImage
          imageKey={group.imageKey}
          imageUrl={group.imageUrl}
          alt={group.range}
        />
      )}
      <div className={hasGroupImage ? 'reading-test-gap-table-answers' : undefined}>
        {!hasNoteTable && !hasNotePassage && !inlineSummary && group.questions.map(question => (
          <div key={question.id} id={`reading-q-${question.id}`} className="reading-test-mc-item">
            {!hasGroupImage && (
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
            )}
            {hasGroupImage ? (
              <label className="reading-test-gap-table-row">
                <span className="reading-test-tfng-num" data-highlight-skip>{question.number}</span>
                <input
                  type="text"
                  className="reading-test-gap-input"
                  value={answers[question.id] ?? ''}
                  placeholder={placeholder}
                  onChange={e => onAnswer(question.id, e.target.value.trim().toLowerCase())}
                  onFocus={() => onSelectQuestion(question.id)}
                />
              </label>
            ) : (
              <input
                type="text"
                className="reading-test-gap-input"
                value={answers[question.id] ?? ''}
                placeholder={placeholder}
                onChange={e => onAnswer(question.id, e.target.value.trim().toLowerCase())}
                onFocus={() => onSelectQuestion(question.id)}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

const SUMMARY_INLINE_GAP_RE = /(\d{1,2})_{2,}/g

function summaryNoteHasInlineGaps(note?: string): boolean {
  return Boolean(note && /\d{1,2}_{2,}/.test(note))
}

type SummaryNoteSegment =
  | { kind: 'text'; text: string }
  | { kind: 'gap'; number: number }

function parseSummaryNoteSegments(note: string): SummaryNoteSegment[] {
  const segments: SummaryNoteSegment[] = []
  let lastIndex = 0
  const re = new RegExp(SUMMARY_INLINE_GAP_RE.source, 'g')
  let match: RegExpExecArray | null = re.exec(note)
  while (match) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', text: note.slice(lastIndex, match.index) })
    }
    segments.push({ kind: 'gap', number: Number(match[1]) })
    lastIndex = re.lastIndex
    match = re.exec(note)
  }
  if (lastIndex < note.length) {
    segments.push({ kind: 'text', text: note.slice(lastIndex) })
  }
  return segments
}

function SummaryNoteWithGaps({
  group,
  note,
  answers,
  highlights,
  activeQuestionId,
  onSelectQuestion,
}: {
  group: ReadingQuestionGroup
  note: string
  answers: Record<string, string>
  highlights: ReadingHighlight[]
  activeQuestionId: string | null
  onSelectQuestion: (questionId: string) => void
}) {
  const questionByNumber = new Map(group.questions.map(q => [q.number, q]))
  const paragraphs = note.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

  return (
    <div className="reading-test-summary-passage">
      {paragraphs.map((paragraph, pIndex) => {
        const segments = parseSummaryNoteSegments(paragraph)
        const isTitle = pIndex === 0 && !segments.some(s => s.kind === 'gap')
        return (
          <p
            key={`${group.id}-summary-p${pIndex}`}
            className={isTitle ? 'reading-test-summary-passage__title' : 'reading-test-summary-passage__para'}
          >
            {segments.map((segment, sIndex) => {
              if (segment.kind === 'text') {
                return (
                  <ReadingHighlightableText
                    key={`${group.id}-summary-p${pIndex}-t${sIndex}`}
                    blockId={`${group.id}-summary-p${pIndex}-t${sIndex}`}
                    text={segment.text}
                    highlights={highlights}
                    as="span"
                  />
                )
              }
              const question = questionByNumber.get(segment.number)
              if (!question) {
                return (
                  <span key={`${group.id}-summary-p${pIndex}-g${sIndex}`} data-highlight-skip>
                    {segment.number}________
                  </span>
                )
              }
              const answered = answers[question.id]
              const isActive = activeQuestionId === question.id
              return (
                <button
                  key={`${group.id}-summary-p${pIndex}-g${sIndex}`}
                  type="button"
                  id={`reading-q-${question.id}`}
                  className={`reading-test-summary-gap${isActive ? ' is-active' : ''}${answered ? ' is-answered' : ''}`}
                  data-highlight-skip
                  onClick={() => onSelectQuestion(question.id)}
                >
                  <span className="reading-test-summary-gap__num">{segment.number}</span>
                  <span className="reading-test-summary-gap__value">
                    {answered ? answered.toUpperCase() : '…………'}
                  </span>
                </button>
              )
            })}
          </p>
        )
      })}
    </div>
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
  const inlineSummary = summaryNoteHasInlineGaps(group.note)

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
      {group.note && inlineSummary && (
        <SummaryNoteWithGaps
          group={group}
          note={group.note}
          answers={answers}
          highlights={highlights}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={onSelectQuestion}
        />
      )}
      {group.note && !inlineSummary && (
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

      {!inlineSummary && group.questions.map(question => {
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
  cambridgeLevel,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'cambridgeLevel' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const features = group.features ?? []
  /** Cambridge: passage trái đã có reviews/sections — không lặp list đầy đủ bên phải. */
  const hideFeatureList =
    cambridgeLevel === 'a2'
    || cambridgeLevel === 'b1'
    || cambridgeLevel === 'b2'
    || cambridgeLevel === 'c1'
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

      {!hideFeatureList && features.length > 0 && (
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
  cambridgeLevel,
  partNumber,
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
          case 'ynng':
            return (
              <YnngGroup
                key={group.id}
                group={group}
                answers={answers}
                highlights={highlights}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
          case 'matching-headings':
            return (
              <MatchingHeadingsGroup
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
                cambridgeLevel={cambridgeLevel}
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
                activeQuestionId={activeQuestionId}
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
                cambridgeLevel={cambridgeLevel}
                partNumber={partNumber}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
              />
            )
        }
      })}
    </div>
  )
}