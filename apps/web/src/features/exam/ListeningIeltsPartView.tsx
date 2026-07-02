import type { ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ExamAudioSource } from './useExamQuestionAudio'
import ListeningIeltsNotePassageBox from './ListeningIeltsNotePassageBox'
import ListeningIeltsNoteTable from './ListeningIeltsNoteTable'
import ListeningIeltsDiagramBlock from './ListeningIeltsDiagramBlock'
import ListeningIeltsFlowChartBlock from './ListeningIeltsFlowChartBlock'
import ListeningIeltsMapBlock from './ListeningIeltsMapBlock'
import ListeningIeltsMatchingBlock from './ListeningIeltsMatchingBlock'
import ListeningIeltsSectionHeader from './ListeningIeltsSectionHeader'
import {
  isChooseTwoGroup,
  isDiagramLabelGroup,
  isFlowChartGroup,
  isLetterMatchingGroup,
  isMapLabelGroup,
  sectionMetaFromQuestions,
} from './ieltsListeningSegmentUtils'
import {
  notePassageForGapSegment,
  notePassageSectionForGapSegment,
  noteTableForGapSegment,
} from './listeningNotePassage'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'

interface AudioBarProps {
  source: ExamAudioSource
  playing: boolean
  buffering: boolean
  progressPct: number
  timeLabel: string
  hasAudioFile: boolean
  allowSeek: boolean
  playsLeft?: number | null
  playBlocked: boolean
  playError?: string | null
  onPlayNormal: () => void
  onSeek: (pct: number) => void
  onStop: () => void
}

interface Props {
  part: ListeningPart
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  audioBar: AudioBarProps
  examMode: 'practice' | 'exam'
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

type Segment =
  | { kind: 'gaps'; questions: ListeningQuestion[] }
  | { kind: 'mc'; questions: ListeningQuestion[] }
  | { kind: 'choose-two'; prompt: string; questions: ListeningQuestion[] }
  | { kind: 'matching'; questions: ListeningQuestion[] }
  | { kind: 'diagram'; questions: ListeningQuestion[] }
  | { kind: 'flowchart'; questions: ListeningQuestion[] }
  | { kind: 'map'; questions: ListeningQuestion[] }

function collectMatchingRun(questions: ListeningQuestion[], start: number): ListeningQuestion[] {
  const sig = questions[start].options.map(o => `${o.id}:${o.label}`).join('|')
  const run = [questions[start]]
  let j = start + 1
  while (j < questions.length) {
    const next = questions[j]
    if (next.type !== 'matching') break
    const nextSig = next.options.map(o => `${o.id}:${o.label}`).join('|')
    if (nextSig !== sig) break
    run.push(next)
    j += 1
  }
  return run
}

function buildSegments(questions: ListeningQuestion[]): Segment[] {
  const segments: Segment[] = []
  let i = 0

  while (i < questions.length) {
    const q = questions[i]

    if (q.type === 'gap-fill') {
      const run: ListeningQuestion[] = []
      while (i < questions.length && questions[i].type === 'gap-fill') {
        run.push(questions[i])
        i += 1
      }
      segments.push({ kind: 'gaps', questions: run })
      continue
    }

    if (q.type === 'matching') {
      const run = collectMatchingRun(questions, i)
      if (isChooseTwoGroup(run)) {
        segments.push({
          kind: 'choose-two',
          prompt: run[0].prompt.replace(/\s*\(\d+\)\s*$/, '').trim(),
          questions: run,
        })
        i += run.length
        continue
      }
      if (isDiagramLabelGroup(run)) {
        segments.push({ kind: 'diagram', questions: run })
        i += run.length
        continue
      }
      if (isMapLabelGroup(run)) {
        segments.push({ kind: 'map', questions: run })
        i += run.length
        continue
      }
      if (isFlowChartGroup(run)) {
        segments.push({ kind: 'flowchart', questions: run })
        i += run.length
        continue
      }
      if (isLetterMatchingGroup(run)) {
        segments.push({ kind: 'matching', questions: run })
        i += run.length
        continue
      }
    }

    if (q.type === 'multiple-choice') {
      const run: ListeningQuestion[] = []
      while (i < questions.length && questions[i].type === 'multiple-choice') {
        run.push(questions[i])
        i += 1
      }
      segments.push({ kind: 'mc', questions: run })
      continue
    }

    if (q.type === 'matching') {
      segments.push({ kind: 'matching', questions: [q] })
      i += 1
      continue
    }

    segments.push({ kind: 'mc', questions: [q] })
    i += 1
  }

  return segments
}

function GapRow({
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
  const highlights = useExamHighlights()
  const wordLimit = question.wordLimit ?? 3
  const hasInline = Boolean(question.gapLead || question.gapTrail)

  const noteBeforeBlock = question.noteBefore ? (
    <ExamHighlightableLines
      blockIdPrefix={`${question.id}-before`}
      text={question.noteBefore}
      lineClassName="listening-ielts-notes__static"
    />
  ) : null
  const contextBlock = question.context ? (
    <ReadingHighlightableText
      blockId={`${question.id}-context`}
      text={question.context}
      highlights={highlights}
      className="listening-ielts-notes__section"
      as="p"
    />
  ) : null

  return (
    <div className={`listening-ielts-notes__row${isActive ? ' is-active' : ''}`}>
      {question.contextFirst ? (
        <>
          {contextBlock}
          {noteBeforeBlock}
        </>
      ) : (
        <>
          {noteBeforeBlock}
          {contextBlock}
        </>
      )}
      {hasInline ? (
        <label className="listening-ielts-notes__sentence" htmlFor={`ielts-gap-${question.id}`}>
          <span className="listening-ielts-notes__num">{question.number}</span>
          {question.gapLead && (
            <ReadingHighlightableText
              blockId={`${question.id}-lead`}
              text={`${question.gapLead} `}
              highlights={highlights}
              as="span"
            />
          )}
          <input
            id={`ielts-gap-${question.id}`}
            type="text"
            className="listening-ielts-notes__input"
            value={answer}
            placeholder={`${wordLimit} từ`}
            data-highlight-skip
            onChange={e => onAnswer(e.target.value)}
            onFocus={onSelect}
          />
          {question.gapTrail && (
            <ReadingHighlightableText
              blockId={`${question.id}-trail`}
              text={` ${question.gapTrail}`}
              highlights={highlights}
              as="span"
            />
          )}
        </label>
      ) : (
        <label className="listening-ielts-notes__field" htmlFor={`ielts-gap-${question.id}`}>
          <span className="listening-ielts-notes__num">{question.number}</span>
          <ReadingHighlightableText
            blockId={`${question.id}-prompt`}
            text={question.prompt}
            highlights={highlights}
            className="listening-ielts-notes__prompt"
            as="span"
          />
          <input
            id={`ielts-gap-${question.id}`}
            type="text"
            className="listening-ielts-notes__input"
            value={answer}
            placeholder={`Tối đa ${wordLimit} từ`}
            data-highlight-skip
            onChange={e => onAnswer(e.target.value)}
            onFocus={onSelect}
          />
        </label>
      )}
      {question.noteAfter && (
        <ExamHighlightableLines
          blockIdPrefix={`${question.id}-after`}
          text={question.noteAfter}
          lineClassName="listening-ielts-notes__static"
        />
      )}
    </div>
  )
}

function McBlock({
  question,
  answer,
  isActive,
  onAnswer,
  onSelect,
  showSectionHeader = false,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
  showSectionHeader?: boolean
}) {
  const highlights = useExamHighlights()

  return (
    <div
      id={`listening-q-${question.id}`}
      className={`listening-ielts-mc${isActive ? ' is-active' : ''}`}
      onClick={onSelect}
    >
      {showSectionHeader && (
        <ListeningIeltsSectionHeader
          blockIdPrefix={`${question.id}-section`}
          meta={sectionMetaFromQuestions([question])}
        />
      )}
      <p className="listening-ielts-mc__prompt">
        <span className="listening-ielts-mc__num">{question.number}</span>
        <ReadingHighlightableText
          blockId={`${question.id}-prompt`}
          text={question.prompt}
          highlights={highlights}
          as="span"
        />
      </p>
      <div className="listening-ielts-mc__options">
        {question.options.map(option => {
          const selected = answer === option.id
          return (
            <div
              key={option.id}
              role="button"
              tabIndex={0}
              className={`listening-ielts-mc__opt${selected ? ' is-selected' : ''}`}
              onClick={e => {
                e.stopPropagation()
                onSelect()
                onAnswer(option.id)
              }}
              onKeyDown={e => {
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

function toggleChooseTwoOption(
  optionId: string,
  questions: ListeningQuestion[],
  answers: Record<string, string>,
  onAnswer: (questionId: string, value: string) => void,
  onSelectQuestion: (questionId: string) => void,
) {
  const [first, second] = questions
  if (!first) return

  const firstVal = answers[first.id] ?? ''
  const secondVal = second ? answers[second.id] ?? '' : ''

  if (firstVal === optionId) {
    onAnswer(first.id, '')
    return
  }
  if (second && secondVal === optionId) {
    onAnswer(second.id, '')
    return
  }

  if (!firstVal) {
    onAnswer(first.id, optionId)
    onSelectQuestion(first.id)
    return
  }
  if (second && !secondVal) {
    onAnswer(second.id, optionId)
    onSelectQuestion(second.id)
    return
  }
  if (second) {
    onAnswer(second.id, optionId)
    onSelectQuestion(second.id)
  }
}

function ChooseTwoBlock({
  prompt,
  questions,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: {
  prompt: string
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}) {
  const highlights = useExamHighlights()
  const options = questions[0]?.options ?? []
  const meta = sectionMetaFromQuestions(questions)
  const rangeLabel = meta.range
    ?? `Questions ${questions[0]?.number ?? ''}–${questions[questions.length - 1]?.number ?? ''}`
  const isActive = questions.some(q => q.id === activeQuestionId)
  const selectedIds = new Set(questions.map(q => answers[q.id]).filter(Boolean))

  return (
    <div className={`listening-ielts-choose-two${isActive ? ' is-active' : ''}`}>
      <ListeningIeltsSectionHeader
        blockIdPrefix={`choose-two-${questions[0]?.id ?? 'group'}`}
        meta={{
          range: rangeLabel,
          instruction: meta.instruction ?? 'Choose TWO letters, A–E.',
          title: meta.title,
        }}
      />
      <p className="listening-ielts-choose-two__prompt">
        <ReadingHighlightableText
          blockId={`choose-two-${questions[0]?.id ?? 'group'}`}
          text={prompt}
          highlights={highlights}
          as="span"
        />
      </p>
      <p className="listening-ielts-choose-two__hint" data-highlight-skip>
        Chọn đúng 2 đáp án — bấm vào các lựa chọn bên dưới hoặc ô {questions.map(q => q.number).join(' và ')}.
      </p>
      <ul className="listening-ielts-choose-two__options" data-highlight-skip>
        {options.map(option => {
          const checked = selectedIds.has(option.id)
          return (
            <li key={option.id}>
              <button
                type="button"
                className={`listening-ielts-choose-two__option${checked ? ' is-selected' : ''}`}
                aria-pressed={checked}
                onClick={() => toggleChooseTwoOption(
                  option.id,
                  questions,
                  answers,
                  onAnswer,
                  onSelectQuestion,
                )}
              >
                <span
                  className={`listening-ielts-choose-two__checkbox${checked ? ' is-checked' : ''}`}
                  aria-hidden
                />
                <span className="listening-ielts-choose-two__letter">{option.id}</span>
                <span className="listening-ielts-choose-two__label">{option.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="listening-ielts-choose-two__slots" data-highlight-skip>
        {questions.map(question => (
          <div key={question.id} className="listening-ielts-choose-two__slot">
            <span className="listening-ielts-choose-two__slot-num">{question.number}</span>
            <div className="listening-ielts-choose-two__slot-pills">
              {options.map(option => {
                const selected = answers[question.id] === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`listening-ielts-choose-two__pill${selected ? ' is-selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => {
                      onSelectQuestion(question.id)
                      onAnswer(question.id, selected ? '' : option.id)
                    }}
                  >
                    {option.id}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ListeningIeltsPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  examMode,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const highlights = useExamHighlights()
  const segments = buildSegments(questions)
  const firstGapSegmentIndex = segments.findIndex(segment => segment.kind === 'gaps')

  const headerSlot: ReactNode = (
    <div className="listening-ielts-audio-inline">
      {examMode === 'exam' && (
        <span className="listening-ielts-mode-badge">Chế độ thi</span>
      )}
      <ListeningExamAudioBar {...audioBar} />
    </div>
  )

  return (
    <ExamHighlightZone className="listening-ielts-main">
      <p className="listening-exam-prompt-pane__part">
        Part {part.partNumber} · {part.rangeLabel}
      </p>
      {part.instruction && (
        <ExamHighlightableLines
          blockIdPrefix={`${part.id}-instruction`}
          text={part.instruction}
          lineClassName="listening-ielts-questions__instruction"
        />
      )}
      {headerSlot}

      {segments.map((segment, index) => {
        if (segment.kind === 'gaps') {
          const passageSection = notePassageSectionForGapSegment(
            part.notePassageSections,
            segment.questions,
          )
          const passageBlocks = passageSection?.blocks
            ?? (part.notePassage
              ? notePassageForGapSegment(part.notePassage, segment.questions)
              : null)
          const questionsByNumber = new Map(segment.questions.map(q => [q.number, q]))
          const segmentTable = noteTableForGapSegment(
            part.noteTables,
            part.noteTable,
            segment.questions,
          )
          const showPartTitle = Boolean(
            part.passageTitle
            && index === firstGapSegmentIndex
            && !segmentTable?.title
            && !passageSection?.title,
          )

          const gapSectionMeta = sectionMetaFromQuestions(segment.questions)
          const sectionHeaderMeta = {
            range: gapSectionMeta.range,
            instruction: gapSectionMeta.instruction ?? passageSection?.instruction,
            title: gapSectionMeta.title ?? passageSection?.title,
          }

          return (
            <section key={`gaps-${index}`} className="listening-ielts-notes">
              {(sectionHeaderMeta.range || sectionHeaderMeta.instruction) && (
                <ListeningIeltsSectionHeader
                  blockIdPrefix={`${part.id}-gap-section-${index}`}
                  meta={{
                    range: sectionHeaderMeta.range,
                    instruction: sectionHeaderMeta.instruction,
                    title: showPartTitle ? undefined : sectionHeaderMeta.title,
                  }}
                />
              )}
              {showPartTitle && (
                <ReadingHighlightableText
                  blockId={`${part.id}-title`}
                  text={part.passageTitle!}
                  highlights={highlights}
                  className="listening-ielts-notes__title"
                  as="h3"
                />
              )}
              {segmentTable ? (
                <ListeningIeltsNoteTable
                  partId={`${part.id}-tbl-${index}`}
                  table={segmentTable}
                  questionsByNumber={questionsByNumber}
                  answers={answers}
                  activeQuestionId={activeQuestionId}
                  onAnswer={onAnswer}
                  onSelectQuestion={onSelectQuestion}
                />
              ) : passageBlocks ? (
                <ListeningIeltsNotePassageBox
                  partId={part.id}
                  blocks={passageBlocks}
                  questionsByNumber={questionsByNumber}
                  answers={answers}
                  activeQuestionId={activeQuestionId}
                  onAnswer={onAnswer}
                  onSelectQuestion={onSelectQuestion}
                  layout={part.notePassageLayout === 'form' ? 'form' : 'list'}
                />
              ) : (
                <>
                  {part.audioIntro && (
                    <ExamHighlightableLines
                      blockIdPrefix={`${part.id}-intro`}
                      text={part.audioIntro}
                      lineClassName="listening-ielts-notes__intro"
                    />
                  )}
                  <div className="listening-ielts-notes__box">
                    {segment.questions.map(question => (
                      <GapRow
                        key={question.id}
                        question={question}
                        answer={answers[question.id] ?? ''}
                        isActive={activeQuestionId === question.id}
                        onAnswer={v => onAnswer(question.id, v)}
                        onSelect={() => onSelectQuestion(question.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          )
        }

        if (segment.kind === 'choose-two') {
          return (
            <ChooseTwoBlock
              key={`choose-${index}`}
              prompt={segment.prompt}
              questions={segment.questions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onAnswer={onAnswer}
              onSelectQuestion={onSelectQuestion}
            />
          )
        }

        if (segment.kind === 'matching') {
          return (
            <ListeningIeltsMatchingBlock
              key={`matching-${index}`}
              blockIdPrefix={`${part.id}-match-${index}`}
              questions={segment.questions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onAnswer={onAnswer}
              onSelectQuestion={onSelectQuestion}
            />
          )
        }

        if (segment.kind === 'diagram') {
          return (
            <ListeningIeltsDiagramBlock
              key={`diagram-${index}`}
              part={part}
              blockIdPrefix={`${part.id}-diagram-${index}`}
              questions={segment.questions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onAnswer={onAnswer}
              onSelectQuestion={onSelectQuestion}
            />
          )
        }

        if (segment.kind === 'flowchart') {
          return (
            <ListeningIeltsFlowChartBlock
              key={`flowchart-${index}`}
              blockIdPrefix={`${part.id}-flow-${index}`}
              questions={segment.questions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onAnswer={onAnswer}
              onSelectQuestion={onSelectQuestion}
            />
          )
        }

        if (segment.kind === 'map') {
          return (
            <ListeningIeltsMapBlock
              key={`map-${index}`}
              part={part}
              blockIdPrefix={`${part.id}-map-${index}`}
              questions={segment.questions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onAnswer={onAnswer}
              onSelectQuestion={onSelectQuestion}
            />
          )
        }

        return (
          <section key={`mc-${index}`} className="listening-ielts-mc-group">
            {segment.questions.map((question, qIndex) => (
              <McBlock
                key={question.id}
                question={question}
                answer={answers[question.id] ?? ''}
                isActive={activeQuestionId === question.id}
                onAnswer={v => onAnswer(question.id, v)}
                onSelect={() => onSelectQuestion(question.id)}
                showSectionHeader={qIndex === 0 && Boolean(question.sectionRange || question.sectionInstruction)}
              />
            ))}
          </section>
        )
      })}
    </ExamHighlightZone>
  )
}