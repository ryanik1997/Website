import { useMemo, type CSSProperties } from 'react'
import {
  formatReadingAnswer,
  isReadingAnswerCorrect,
  isWritingTaskQuestion,
  type ReadingQuestion,
  type ReadingQuestionGroup,
} from './examData'
import ReadingHighlightableText from './ReadingHighlightableText'
import ReadingNotePassageBox from './ReadingNotePassageBox'
import ReadingNoteTableView from './ReadingNoteTable'
import type { ReadingHighlight } from './readingHighlightUtils'
import {
  isReadingChooseTwoGroup,
  normalizeReadingChooseTwoGroup,
  normalizeReadingChooseTwoPrompt,
  splitReadingMcGroupForChooseTwo,
  toggleReadingChooseTwoOption,
} from './readingChooseTwoUtils'
import {
  EXAM_REVIEW_COLORS,
  examReviewStatus,
  readingQuestionReviewStatus,
  type ExamReviewStatus,
} from './examReviewUtils'
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
  /** Sau nộp bài: khóa sửa + hiện đúng/sai */
  reviewMode?: boolean
  /** Map id → correct|wrong|skipped (từ parent) */
  reviewStatusMap?: Record<string, ExamReviewStatus>
}

function ReviewQuestionBanner({
  question,
  answer,
  group,
  status: statusProp,
}: {
  question: ReadingQuestion | null
  answer: string
  group?: ReadingQuestionGroup
  status?: ExamReviewStatus | null
}) {
  if (!question || isWritingTaskQuestion(question)) return null
  const status = statusProp ?? readingQuestionReviewStatus(question, answer)
  const ctx = group?.type === 'matching-headings' ? { headings: group.headings } : undefined
  const keyLabel = formatReadingAnswer(question, question.answer, ctx)
  const yourLabel = formatReadingAnswer(question, answer, ctx)
  const c = EXAM_REVIEW_COLORS[status]
  return (
    <div
      className={`reading-review-banner is-${status}`}
      role="status"
      style={{
        borderColor: c.border,
        background: `color-mix(in srgb, ${c.bg} 18%, var(--bg-card))`,
      }}
    >
      <span
        className="reading-review-banner__tag"
        style={{ background: c.bg, color: c.fg }}
      >
        {status === 'correct' ? 'Đúng' : status === 'wrong' ? 'Sai' : 'Bỏ qua'}
      </span>
      <span className="reading-review-banner__q">Câu {question.number}</span>
      <span className="reading-review-banner__you">Bạn: {yourLabel}</span>
      {status !== 'correct' && (
        <span className="reading-review-banner__key" style={{ color: c.border, fontWeight: 700 }}>
          Đáp án: {keyLabel}
        </span>
      )}
    </div>
  )
}

function reviewItemBorder(status: ExamReviewStatus | null | undefined): CSSProperties | undefined {
  if (!status) return undefined
  return {
    borderLeft: `4px solid ${EXAM_REVIEW_COLORS[status].bg}`,
    paddingLeft: '0.55rem',
    marginBottom: '0.35rem',
  }
}

const UI_YNNG_OPTIONS = [
  { id: 'yes', label: 'YES' },
  { id: 'no', label: 'NO' },
  { id: 'not-given', label: 'NOT GIVEN' },
] as const

const UI_TFNG_OPTIONS = [
  { id: 'true', label: 'TRUE' },
  { id: 'false', label: 'FALSE' },
  { id: 'not-given', label: 'NOT GIVEN' },
] as const

/** Luôn 3 radio ngắn — chặn double YES/NO/NG từ JSON lỗi */
function triStateOptionsForGroup(group: ReadingQuestionGroup) {
  const isYnng = group.type === 'ynng'
    || group.questions.some(q => q.type === 'yes-no-not-given')
  return isYnng ? UI_YNNG_OPTIONS : UI_TFNG_OPTIONS
}

function isTriStateKeyOption(
  option: { id: string; label: string },
  answer: string,
): boolean {
  const a = String(answer ?? '').toLowerCase().trim()
  const id = option.id.toLowerCase().trim()
  const label = option.label.toLowerCase().trim()
  const aNorm = a.replace(/\s+/g, '-')
  return id === a || id === aNorm || label === a || label.replace(/\s+/g, '-') === aNorm
}

function TriStateGroup({
  group,
  answers,
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
  reviewMode = false,
  reviewStatusMap,
}: {
  group: ReadingQuestionGroup
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const options = triStateOptionsForGroup(group)

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
        const ans = (answers[question.id] ?? '').toLowerCase().trim()
        const status = reviewMode
          ? (reviewStatusMap?.[question.id]
            ?? examReviewStatus(answers[question.id], a => isReadingAnswerCorrect(question, a)))
          : null
        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            className={`reading-test-tfng-item${status ? ` is-review-${status}` : ''}${activeQuestionId === question.id ? ' is-active' : ''}`}
            style={reviewItemBorder(status)}
            onFocus={() => onSelectQuestion(question.id)}
            onClick={() => onSelectQuestion(question.id)}
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
                {options.map(option => {
                  const selected = ans === option.id || ans === option.label.toLowerCase()
                    || ans.replace(/\s+/g, '-') === option.id
                  const isKey = reviewMode && isTriStateKeyOption(option, question.answer)
                  const optStyle: CSSProperties | undefined = reviewMode
                    ? isKey
                      ? { outline: `2px solid ${EXAM_REVIEW_COLORS.correct.bg}`, background: 'color-mix(in srgb, #22c55e 16%, var(--bg-card))', borderRadius: 8, padding: '0.15rem 0.35rem' }
                      : selected && status === 'wrong'
                        ? { outline: `2px solid ${EXAM_REVIEW_COLORS.wrong.bg}`, background: 'color-mix(in srgb, #ef4444 12%, var(--bg-card))', borderRadius: 8, padding: '0.15rem 0.35rem' }
                        : undefined
                    : undefined
                  return (
                    <label
                      key={option.id}
                      className={`reading-test-radio${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}${selected && status === 'wrong' ? ' is-review-bad' : ''}${selected && status === 'correct' ? ' is-review-ok' : ''}`}
                      style={optStyle}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={selected}
                        disabled={reviewMode}
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
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

function TfngGroup(props: {
  group: ReadingQuestionGroup
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  return <TriStateGroup {...props} />
}

function YnngGroup(props: {
  group: ReadingQuestionGroup
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  return <TriStateGroup {...props} />
}

function ChooseTwoGroup({
  group,
  answers,
  highlights,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
}: {
  group: ReadingQuestionGroup
} & Pick<Props, 'answers' | 'highlights' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const questions = group.questions
  const options = questions[0]?.options ?? []
  const selectedIds = new Set(
    questions.map(q => (answers[q.id] ?? '').toLowerCase()).filter(Boolean),
  )
  const isActive = questions.some(q => q.id === activeQuestionId)
  const start = questions[0]?.number
  const end = questions[questions.length - 1]?.number
  const promptBase = normalizeReadingChooseTwoPrompt(questions[0]?.prompt ?? '')
  const promptText = start != null && end != null
    ? `${start}–${end} ${promptBase}`
    : promptBase

  return (
    <section
      className={`reading-test-group reading-test-choose-two${isActive ? ' is-active' : ''}`}
      id={questions[0] ? `reading-q-${questions[0].id}` : undefined}
    >
      <ReadingHighlightableText
        blockId={`${group.id}-range`}
        text={group.range}
        highlights={highlights}
        className="reading-test-group__title"
        as="h3"
      />
      <ReadingHighlightableText
        blockId={`${group.id}-instruction`}
        text={group.instruction || 'Choose TWO correct answers.'}
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
      <p className="reading-test-choose-two__prompt">
        <ReadingHighlightableText
          blockId={`${group.id}-prompt`}
          text={promptText}
          highlights={highlights}
          as="span"
        />
      </p>
      <p className="reading-test-choose-two__slots" data-highlight-skip>
        {questions.map(q => (
          <span
            key={q.id}
            className={`reading-test-choose-two__slot${answers[q.id] ? ' is-filled' : ''}${
              activeQuestionId === q.id ? ' is-active' : ''
            }`}
          >
            <strong>{q.number}</strong>
            {' '}
            {answers[q.id] ? answers[q.id].toUpperCase() : '—'}
          </span>
        ))}
      </p>
      <ul className="reading-test-choose-two__options">
        {options.map(option => {
          const checked = selectedIds.has(option.id.toLowerCase())
          return (
            <li key={option.id}>
              <button
                type="button"
                className={`reading-test-choose-two__option${checked ? ' is-selected' : ''}`}
                aria-pressed={checked}
                onClick={() => {
                  toggleReadingChooseTwoOption(
                    option.id,
                    questions,
                    answers,
                    onAnswer,
                    onSelectQuestion,
                  )
                }}
              >
                <span
                  className={`reading-test-choose-two__checkbox${checked ? ' is-checked' : ''}`}
                  aria-hidden
                />
                <span className="reading-test-choose-two__letter" data-highlight-skip>
                  {option.id.toUpperCase()}.
                </span>
                <ReadingHighlightableText
                  blockId={`${group.id}-opt-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  className="reading-test-choose-two__label"
                  as="span"
                />
              </button>
            </li>
          )
        })}
      </ul>
      {/* Anchor cho footer nav câu 2 trong cặp */}
      {questions[1] && <div id={`reading-q-${questions[1].id}`} className="reading-test-choose-two__anchor" />}
    </section>
  )
}

function MultipleChoiceGroup({
  group,
  answers,
  highlights,
  cambridgeLevel,
  partNumber,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
  reviewMode = false,
  reviewStatusMap,
}: {
  group: ReadingQuestionGroup
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
} & Pick<Props, 'answers' | 'highlights' | 'cambridgeLevel' | 'partNumber' | 'activeQuestionId' | 'onSelectQuestion' | 'onAnswer'>) {
  const compactLetters = cambridgeLevel === 'a2' && partNumber === 2
  // Share options câu 2 nếu AI bỏ bank (r2msc Q24/Q26)
  const groupForChooseTwo = normalizeReadingChooseTwoGroup(group)

  if (isReadingChooseTwoGroup(groupForChooseTwo)) {
    return (
      <ChooseTwoGroup
        group={groupForChooseTwo}
        answers={answers}
        highlights={highlights}
        activeQuestionId={activeQuestionId}
        onSelectQuestion={onSelectQuestion}
        onAnswer={onAnswer}
      />
    )
  }

  const segments = splitReadingMcGroupForChooseTwo(group)
  if (segments.length > 1) {
    return (
      <>
        {segments.map(seg => (
          <MultipleChoiceGroup
            key={seg.id}
            group={seg}
            answers={answers}
            highlights={highlights}
            cambridgeLevel={cambridgeLevel}
            partNumber={partNumber}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={onSelectQuestion}
            onAnswer={onAnswer}
            reviewMode={reviewMode}
            reviewStatusMap={reviewStatusMap}
          />
        ))}
      </>
    )
  }

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
      {group.questions.map(question => {
        const status = reviewMode
          ? (reviewStatusMap?.[question.id]
            ?? examReviewStatus(answers[question.id], a => isReadingAnswerCorrect(question, a)))
          : null
        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            className={`reading-test-mc-item${status ? ` is-review-${status}` : ''}`}
            style={reviewItemBorder(status)}
            onClick={() => onSelectQuestion(question.id)}
          >
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
              {(question.options ?? []).map(option => {
                const selected = (answers[question.id] ?? '').toLowerCase() === option.id.toLowerCase()
                const isKey = reviewMode && option.id.toLowerCase() === String(question.answer).toLowerCase().trim()
                const optStyle: CSSProperties | undefined = reviewMode
                  ? isKey
                    ? { outline: `2px solid ${EXAM_REVIEW_COLORS.correct.bg}`, background: 'color-mix(in srgb, #22c55e 16%, var(--bg-card))' }
                    : selected && status === 'wrong'
                      ? { outline: `2px solid ${EXAM_REVIEW_COLORS.wrong.bg}`, background: 'color-mix(in srgb, #ef4444 12%, var(--bg-card))' }
                      : undefined
                  : undefined
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={reviewMode}
                    style={optStyle}
                    className={`reading-test-mc-option${selected ? ' is-selected' : ''}${compactLetters ? ' is-letter-only' : ''}${isKey ? ' is-review-key' : ''}${selected && status === 'wrong' ? ' is-review-bad' : ''}${selected && status === 'correct' ? ' is-review-ok' : ''}`}
                    onClick={() => {
                      if (reviewMode) return
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
        )
      })}
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
  reviewMode = false,
  reviewStatusMap,
}: {
  group: ReadingQuestionGroup
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
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
        const status = reviewMode
          ? (reviewStatusMap?.[question.id]
            ?? examReviewStatus(answers[question.id], a => isReadingAnswerCorrect(question, a)))
          : null
        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            role="button"
            tabIndex={0}
            className={`reading-test-match-row${isActive ? ' is-active' : ''}${answered ? ' is-answered' : ''}${status ? ` is-review-${status}` : ''}`}
            style={reviewItemBorder(status)}
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
            <span
              className="reading-test-match-answer"
              data-highlight-skip
              style={status ? { color: EXAM_REVIEW_COLORS[status].bg, fontWeight: 800 } : undefined}
            >
              {answered ? answered.toUpperCase() : (reviewMode ? '—' : '')}
              {reviewMode && status === 'wrong' && question.answer
                ? ` → ${String(question.answer).toUpperCase()}`
                : ''}
            </span>
          </div>
        )
      })}

      <div className="reading-test-para-pills">
        {letters.map(letter => {
          const lid = letter.toLowerCase()
          const selected = Boolean(activeQuestion && (answers[activeQuestion.id] ?? '').toLowerCase() === lid)
          const isKey = Boolean(
            reviewMode && activeQuestion && String(activeQuestion.answer).toLowerCase() === lid,
          )
          const aStatus = activeQuestion && reviewMode
            ? (reviewStatusMap?.[activeQuestion.id] ?? null)
            : null
          const pillStyle: CSSProperties | undefined = reviewMode
            ? isKey
              ? { outline: `2px solid ${EXAM_REVIEW_COLORS.correct.bg}`, background: 'color-mix(in srgb, #22c55e 18%, var(--bg-card))' }
              : selected && aStatus === 'wrong'
                ? { outline: `2px solid ${EXAM_REVIEW_COLORS.wrong.bg}`, background: 'color-mix(in srgb, #ef4444 12%, var(--bg-card))' }
                : undefined
            : undefined
          return (
            <button
              key={letter}
              type="button"
              style={pillStyle}
              className={`reading-test-para-pill${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
              disabled={!activeInGroup || reviewMode}
              onClick={() => {
                if (reviewMode || !activeQuestion) return
                onAnswer(activeQuestion.id, lid)
              }}
            >
              Paragraph {letter}
            </button>
          )
        })}
      </div>
      <p className="reading-test-group__instruction" style={{ marginTop: '0.65rem', marginBottom: 0 }}>
        {reviewMode
          ? 'Xem lại: viền xanh = đáp án đúng; đỏ = bạn chọn sai.'
          : 'Chọn một câu hỏi, sau đó bấm Paragraph tương ứng.'}
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
  const multiWordAnswer = group.questions.some(q => (q.answer ?? '').trim().includes(' '))
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
  // Sentence completion / multi-line notes: mỗi dòng đề = 1 đoạn (single \\n hoặc \\n\\n)
  const paragraphs = splitSummaryNoteParagraphs(note, group.instruction, group.type)

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
  const isSummaryOrNotesInstr = /complete the summary|summary below|complete the notes|notes below|complete the sentences/i
    .test(group.instruction ?? '')
  const isTableInstr = /complete the table|table below/i.test(group.instruction ?? '')
  const inlineSummary = summaryNoteHasInlineGaps(group.note)
  // Chỉ render noteTable khi instruction table
  const hasNoteTable = Boolean(
    group.noteTable?.headers?.length
    && group.noteTable.rows?.length
    && isTableInstr
    && !isSummaryOrNotesInstr
    && !hasNotePassage
    && !inlineSummary,
  )
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

/** Complete the sentences / multi-line summary: mỗi dòng đề = 1 đoạn hiển thị. */
function isSentenceStyleInstruction(instruction?: string, type?: string): boolean {
  if (type === 'sentence-completion') return true
  const t = (instruction ?? '').toLowerCase()
  return /complete the sentences/i.test(t) || /complete each sentence/i.test(t)
}

function splitSummaryNoteParagraphs(
  note: string,
  instruction?: string,
  type?: string,
): string[] {
  const raw = note.replace(/\r\n/g, '\n').trim()
  if (!raw) return []

  // Ưu tiên \\n\\n
  let parts = raw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  if (parts.length > 1) return parts

  // Sentence completion hoặc note có nhiều gap trên nhiều dòng: tách theo single \\n
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length > 1) {
    const gapLines = lines.filter(l => /\d{1,2}_{2,}/.test(l)).length
    if (
      isSentenceStyleInstruction(instruction, type)
      || gapLines >= 2
      || lines.some(l => isNoteDecadeOrEraHeadingLike(l))
    ) {
      return lines
    }
  }

  return parts.length ? parts : [raw]
}

function isNoteDecadeOrEraHeadingLike(text: string): boolean {
  const bare = text.trim().replace(/^[•●‣▪◦○·*+–−\-►▸]\s*/, '')
  return /^\d{3,4}s$/i.test(bare)
    || /^(early|mid|late)\s*\d{3,4}s$/i.test(bare)
    || /^\d{1,2}(st|nd|rd|th)\s+century$/i.test(bare)
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
  const paragraphs = splitSummaryNoteParagraphs(note, group.instruction, group.type)

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
          <p className="reading-test-word-bank__title">LIST OF OPTIONS</p>
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
                text={feature.name ?? ''}
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
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const lockedAnswer = useMemo(() => {
    if (!reviewMode) return onAnswer
    return (_id: string, _value: string) => undefined
  }, [onAnswer, reviewMode])

  const activeMeta = useMemo(() => {
    if (!activeQuestionId) return { question: null as ReadingQuestion | null, group: undefined as ReadingQuestionGroup | undefined }
    for (const g of groups) {
      const q = g.questions.find(x => x.id === activeQuestionId)
      if (q) return { question: q, group: g }
    }
    return { question: null, group: undefined }
  }, [activeQuestionId, groups])

  const activeStatus = activeQuestionId && reviewMode
    ? (reviewStatusMap?.[activeQuestionId]
      ?? (activeMeta.question
        ? readingQuestionReviewStatus(activeMeta.question, answers[activeQuestionId])
        : null))
    : null

  return (
    <div className={`reading-test-questions${reviewMode ? ' is-review' : ''}`} data-reading-highlight-zone>
      {reviewMode && (
        <ReviewQuestionBanner
          question={activeMeta.question}
          answer={activeQuestionId ? (answers[activeQuestionId] ?? '') : ''}
          group={activeMeta.group}
          status={activeStatus}
        />
      )}
      {groups.map(group => {
        // noteTable CHỈ khi instruction table (Complete the table…) — không TFNG/summary/notes/sentence
        const isTableInstr = /complete the table|table below/i.test(group.instruction ?? '')
        const isSummaryOrNotes = /complete the summary|summary below|complete the notes|notes below|complete the sentences/i
          .test(group.instruction ?? '')
        const hasSummaryNote = Boolean(group.note && /\d{1,2}_{2,}/.test(group.note))
        const hasNotePassage = Boolean(group.notePassage?.length)
        const hasNoteTable = Boolean(
          group.noteTable?.headers?.length
          && group.noteTable.rows?.length
          && isTableInstr
          && !isSummaryOrNotes
          && !hasNotePassage
          && !hasSummaryNote
          && group.type !== 'tfng'
          && group.type !== 'ynng',
        )
        // Gỡ noteTable khỏi props khi không phải table slot (chống render nhiễm)
        const groupClean = hasNoteTable ? group : { ...group, noteTable: undefined }

        if (hasNoteTable && group.type !== 'gap-fill' && group.type !== 'sentence-completion') {
          return (
            <GapFillGroup
              key={group.id}
              group={{ ...groupClean, type: 'gap-fill' }}
              answers={answers}
              highlights={highlights}
              activeQuestionId={activeQuestionId}
              onSelectQuestion={onSelectQuestion}
              onAnswer={lockedAnswer}
            />
          )
        }

        // Cam19+ : group.type = multiple-choice nhưng câu yes-no-not-given + option YES/NO
        // → không render MC (A YES / B NO) chồng instruction → double
        const qs = groupClean.questions ?? []
        const allYnngQs = qs.length > 0 && qs.every(q =>
          q.type === 'yes-no-not-given'
          || ((q.options?.length ?? 0) > 0 && (q.options?.length ?? 0) <= 3
            && (q.options ?? []).every(o => /^(yes|no|not[\s-]?given)$/i.test(String(o.id))
              || /^(yes|no|not given)/i.test(String(o.label)))),
        )
        const allTfngQs = qs.length > 0 && qs.every(q =>
          q.type === 'true-false-not-given'
          || ((q.options?.length ?? 0) > 0 && (q.options?.length ?? 0) <= 3
            && (q.options ?? []).every(o => /^(true|false|not[\s-]?given)$/i.test(String(o.id))
              || /^(true|false|not given)/i.test(String(o.label)))),
        )
        const ynngInstr = /claims of the writer|views of the writer/i.test(groupClean.instruction ?? '')
          && /not given/i.test(groupClean.instruction ?? '')
        const effectiveType = (groupClean.type === 'multiple-choice' && allYnngQs) || (ynngInstr && allYnngQs)
          ? 'ynng' as const
          : (groupClean.type === 'multiple-choice' && allTfngQs)
            ? 'tfng' as const
            : groupClean.type

        switch (effectiveType) {
          case 'tfng':
            return (
              <TfngGroup
                key={group.id}
                group={{ ...groupClean, type: 'tfng' }}
                answers={answers}
                highlights={highlights}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
                reviewMode={reviewMode}
                reviewStatusMap={reviewStatusMap}
              />
            )
          case 'ynng':
            return (
              <YnngGroup
                key={group.id}
                group={{ ...groupClean, type: 'ynng' }}
                answers={answers}
                highlights={highlights}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
                reviewMode={reviewMode}
                reviewStatusMap={reviewStatusMap}
              />
            )
          case 'matching-headings':
            return (
              <MatchingHeadingsGroup
                key={group.id}
                group={groupClean}
                answers={answers}
                highlights={highlights}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
              />
            )
          case 'matching-paragraph':
            return (
              <MatchingParagraphGroup
                key={group.id}
                group={groupClean}
                answers={answers}
                highlights={highlights}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
                reviewMode={reviewMode}
                reviewStatusMap={reviewStatusMap}
              />
            )
          case 'matching-features':
            return (
              <MatchingFeaturesGroup
                key={group.id}
                group={groupClean}
                answers={answers}
                highlights={highlights}
                cambridgeLevel={cambridgeLevel}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
              />
            )
          case 'gap-fill':
          case 'sentence-completion':
            // r3ysm/r3my: nếu vẫn còn wordBank (AI type sai gap-fill) → LIST OF OPTIONS
            if ((groupClean.wordBank?.length ?? 0) > 0) {
              return (
                <SummaryCompletionGroup
                  key={group.id}
                  group={{ ...groupClean, type: 'summary-completion' }}
                  answers={answers}
                  highlights={highlights}
                  activeQuestionId={activeQuestionId}
                  onSelectQuestion={onSelectQuestion}
                  onAnswer={lockedAnswer}
                />
              )
            }
            return (
              <GapFillGroup
                key={group.id}
                group={groupClean}
                answers={answers}
                highlights={highlights}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
              />
            )
          case 'summary-completion':
            return (
              <SummaryCompletionGroup
                key={group.id}
                group={groupClean}
                answers={answers}
                highlights={highlights}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
              />
            )
          default:
            return (
              <MultipleChoiceGroup
                key={group.id}
                group={groupClean}
                answers={answers}
                highlights={highlights}
                cambridgeLevel={cambridgeLevel}
                partNumber={partNumber}
                activeQuestionId={activeQuestionId}
                onSelectQuestion={onSelectQuestion}
                onAnswer={lockedAnswer}
                reviewMode={reviewMode}
                reviewStatusMap={reviewStatusMap}
              />
            )
        }
      })}
    </div>
  )
}