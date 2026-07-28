import type { ReactNode } from 'react'
import ListeningPictureBoard from './ListeningPictureBoard'
import ListeningPictureChoiceRow from './ListeningPictureChoiceRow'
import ListeningPictureOption from './ListeningPictureOption'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ListeningPartImageHeader from './ListeningPartImageHeader'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'
import {
  isListeningKeyOption,
  ListeningGapCorrectHint,
  ListeningOptionReviewMark,
  listeningOptionReviewStyle,
} from './listeningReviewUi'
import {
  usesCompositePictureBoard,
  usesSplitPictureOptions,
} from './listeningPictureMc'

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
  const highlights = useExamHighlights()

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
      <ReadingHighlightableText
        blockId={`${question.id}-prompt`}
        text={question.prompt}
        highlights={highlights}
        className="listening-split-prompt-row__text"
        as="p"
      />
    </div>
  )
}

function AnswerRow({
  question,
  answer,
  isActive,
  onAnswer,
  onSelect,
  reviewMode = false,
  reviewStatus = null,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
  reviewMode?: boolean
  reviewStatus?: 'correct' | 'wrong' | 'skipped' | null
}) {
  const highlights = useExamHighlights()
  const isPictureMc = question.type === 'picture-mc'
  const isGapFill = question.type === 'gap-fill'
  const isMatching = question.type === 'matching'
  const isMc = !isGapFill && !isMatching && !isPictureMc
  const wordLimit = question.wordLimit ?? (isGapFill ? 2 : undefined)
  const revClass = reviewStatus === 'correct'
    ? ' is-review-ok'
    : reviewStatus === 'wrong'
      ? ' is-review-bad'
      : reviewStatus === 'skipped'
        ? ' is-review-skip'
        : ''

  return (
    <div
      id={`listening-a-${question.id}`}
      className={`listening-split-answer-row${isActive ? ' is-active' : ''}${revClass}`}
      onFocus={onSelect}
    >
      <span className="listening-split-answer-row__num">{question.number}</span>
      <div className="listening-split-answer-row__body">
        {reviewMode && reviewStatus && (
          <p className={`listening-review-tag is-${reviewStatus}`}>
            {reviewStatus === 'correct' ? 'Đúng' : reviewStatus === 'wrong' ? 'Sai' : 'Bỏ qua'}
          </p>
        )}
        {isGapFill && (
          <>
            <input
              type="text"
              className="listening-ielts-gap__input"
              value={answer}
              placeholder={`Tối đa ${wordLimit} từ`}
              data-highlight-skip
              readOnly={reviewMode}
              onChange={e => onAnswer(e.target.value)}
              onFocus={onSelect}
            />
            <ListeningGapCorrectHint
              reviewMode={reviewMode}
              status={reviewStatus}
              correctAnswer={question.answer}
            />
          </>
        )}

        {isMatching && (
          <div className="listening-ielts-match__pills">
            {question.options.map(option => {
              const selected = answer.toUpperCase() === option.id.toUpperCase()
              const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
              const selectedWrong = Boolean(reviewMode && selected && reviewStatus === 'wrong')
              return (
                <div
                  key={option.id}
                  role="button"
                  tabIndex={reviewMode ? -1 : 0}
                  style={listeningOptionReviewStyle(reviewMode, selected, isKey, reviewStatus)}
                  className={`listening-ielts-match__pill${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}${selectedWrong ? ' is-review-bad' : ''}${selected && reviewStatus === 'correct' ? ' is-review-ok' : ''}`}
                  onClick={() => {
                    if (reviewMode) return
                    onSelect()
                    onAnswer(option.id)
                  }}
                  onKeyDown={e => {
                    if (reviewMode) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect()
                      onAnswer(option.id)
                    }
                  }}
                >
                  {option.id}.{' '}
                  <ReadingHighlightableText
                    blockId={`${question.id}-match-${option.id}`}
                    text={option.label}
                    highlights={highlights}
                    as="span"
                  />
                  <ListeningOptionReviewMark isKey={isKey} selectedWrong={selectedWrong} />
                </div>
              )
            })}
          </div>
        )}

        {isMc && (
          <div className="listening-ielts-mc__options">
            {question.options.map(option => {
              const selected = answer.toUpperCase() === option.id.toUpperCase()
              const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
              const selectedWrong = Boolean(reviewMode && selected && reviewStatus === 'wrong')
              return (
                <div
                  key={option.id}
                  role="button"
                  tabIndex={reviewMode ? -1 : 0}
                  style={listeningOptionReviewStyle(reviewMode, selected, isKey, reviewStatus)}
                  className={`listening-ielts-mc__opt${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}${selectedWrong ? ' is-review-bad' : ''}${selected && reviewStatus === 'correct' ? ' is-review-ok' : ''}`}
                  onClick={() => {
                    if (reviewMode) return
                    onSelect()
                    onAnswer(option.id)
                  }}
                  onKeyDown={e => {
                    if (reviewMode) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect()
                      onAnswer(option.id)
                    }
                  }}
                >
                  <span className="listening-ielts-mc__letter">{option.id}</span>
                  <ReadingHighlightableText
                    blockId={`${question.id}-opt-${option.id}`}
                    text={option.label}
                    highlights={highlights}
                    as="span"
                  />
                  <ListeningOptionReviewMark isKey={isKey} selectedWrong={selectedWrong} />
                </div>
              )
            })}
          </div>
        )}

        {isPictureMc && usesCompositePictureBoard(question) && (
          <ListeningPictureChoiceRow
            options={question.options}
            answer={answer}
            compact
            onAnswer={id => {
              onSelect()
              onAnswer(id)
            }}
          />
        )}

        {isPictureMc && usesSplitPictureOptions(question) && (
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

        {isPictureMc && !usesCompositePictureBoard(question) && !usesSplitPictureOptions(question) && (
          <ListeningPictureChoiceRow
            options={question.options}
            answer={answer}
            compact
            showLabels
            onAnswer={id => {
              onSelect()
              onAnswer(id)
            }}
          />
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
  const activeQuestion = part.questions.find(q => q.id === activeQuestionId) ?? null

  return (
    <ExamHighlightZone className="listening-exam-prompt-pane">
      <p className="listening-exam-prompt-pane__part">
        Part {part.partNumber} · {part.rangeLabel}
      </p>
      {part.instruction && (
        <ExamHighlightableLines
          blockIdPrefix={`${part.id}-instruction`}
          text={part.instruction}
          lineClassName="listening-exam-prompt-pane__instruction"
        />
      )}
      <ListeningPartImageHeader
        partId={part.id}
        passageTitle={part.passageTitle}
        partImageUrl={part.partImageUrl}
      />
      {audioSlot}
      {activeQuestion && usesCompositePictureBoard(activeQuestion) && (
        <ListeningPictureBoard
          question={activeQuestion}
          className="listening-picture-board--inline"
        />
      )}
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
    </ExamHighlightZone>
  )
}

export function ListeningPartAnswerPanel({
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
  reviewMode = false,
  getQuestionReviewStatus,
}: Props & {
  reviewMode?: boolean
  getQuestionReviewStatus?: (questionId: string) => 'correct' | 'wrong' | 'skipped' | null
}) {
  return (
    <ExamHighlightZone className={`listening-exam-answer-pane${reviewMode ? ' is-review' : ''}`}>
      <h3 className="listening-exam-answer-pane__title">
        {reviewMode ? 'Đáp án · Xem lại' : 'Đáp án'}
      </h3>
      <div className="listening-split-answer-list">
        {part.questions.map(question => {
          const rev = reviewMode ? (getQuestionReviewStatus?.(question.id) ?? null) : null
          return (
            <AnswerRow
              key={question.id}
              question={question}
              answer={answers[question.id] ?? ''}
              isActive={activeQuestionId === question.id}
              reviewStatus={rev}
              reviewMode={reviewMode}
              onAnswer={v => {
                if (reviewMode) return
                onAnswer(question.id, v)
              }}
              onSelect={() => onSelectQuestion(question.id)}
            />
          )
        })}
      </div>
    </ExamHighlightZone>
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