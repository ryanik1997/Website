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
import ListeningIeltsGapFlowChartBlock from './ListeningIeltsGapFlowChartBlock'
import ListeningIeltsMapBlock from './ListeningIeltsMapBlock'
import ListeningIeltsMatchingBlock from './ListeningIeltsMatchingBlock'
import ListeningIeltsChooseTwoBlock from './ListeningIeltsChooseTwoBlock'
import ListeningIeltsSectionHeader from './ListeningIeltsSectionHeader'
import {
  isChooseTwoGroup,
  isDiagramLabelGroup,
  isFlowChartGroup,
  isGapFillFlowChartGroup,
  isLetterMatchingGroup,
  isMapLabelGroup,
  sectionMetaFromQuestions,
} from './ieltsListeningSegmentUtils'
import {
  notePassageForGapSegment,
  notePassageSectionForGapSegment,
  noteTableForGapSegment,
} from './listeningNotePassage'
import type { ListeningFlowChartStep, ListeningPart, ListeningQuestion } from './listeningExamData'
import {
  isListeningKeyOption,
  ListeningGapCorrectHint,
  ListeningOptionReviewMark,
  listeningOptionReviewStyle,
} from './listeningReviewUi'
import { examReviewStatus, type ExamReviewStatus } from './examReviewUtils'
import { isListeningAnswerCorrect } from './listeningExamData'

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
  reviewMode?: boolean
  reviewStatusMap?: Record<string, import('./examReviewUtils').ExamReviewStatus>
}

type Segment =
  | { kind: 'gaps'; questions: ListeningQuestion[] }
  | { kind: 'mc'; questions: ListeningQuestion[] }
  | { kind: 'choose-two'; prompt: string; questions: ListeningQuestion[] }
  | { kind: 'matching'; questions: ListeningQuestion[] }
  | { kind: 'diagram'; questions: ListeningQuestion[] }
  | { kind: 'flowchart'; questions: ListeningQuestion[] }
  | { kind: 'flowchart-gaps'; questions: ListeningQuestion[]; flowChartSteps: ListeningFlowChartStep[] }
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

function normalizeTitleKey(text: string | undefined): string {
  return (text ?? '').trim().toLowerCase()
}

/** MC + notes/bảng sau (a15, d4): tiêu đề chỉ ở nhóm sau — MC chỉ range + instruction. */
function mcSectionHeaderMeta(
  part: ListeningPart,
  segments: Segment[],
  segmentIndex: number,
  mcSectionMeta: ReturnType<typeof sectionMetaFromQuestions>,
): ReturnType<typeof sectionMetaFromQuestions> {
  const laterNotesSegments = segments
    .slice(segmentIndex + 1)
    .filter((seg): seg is Extract<Segment, { kind: 'gaps' }> => seg.kind === 'gaps')

  if (!laterNotesSegments.length) return mcSectionMeta

  const laterSectionTitle = laterNotesSegments
    .flatMap(seg => seg.questions)
    .find(q => q.sectionTitle)?.sectionTitle

  const laterTableTitle = part.noteTables?.find(t => t.title?.trim())?.title

  if (laterSectionTitle || laterTableTitle) {
    return {
      range: mcSectionMeta.range,
      instruction: mcSectionMeta.instruction,
    }
  }

  return mcSectionMeta
}

function buildSegments(questions: ListeningQuestion[], part: ListeningPart): Segment[] {
  const segments: Segment[] = []
  let i = 0

  while (i < questions.length) {
    const q = questions[i]

    if (q.type === 'gap-fill') {
      const run: ListeningQuestion[] = []
      const sectionKey = q.sectionRange ?? ''
      while (i < questions.length && questions[i].type === 'gap-fill') {
        const curr = questions[i]
        const currSection = curr.sectionRange ?? ''
        if (run.length > 0 && currSection && sectionKey && currSection !== sectionKey) {
          break
        }
        run.push(curr)
        i += 1
      }
      if (isGapFillFlowChartGroup(run) && part.flowChartSteps?.length) {
        segments.push({
          kind: 'flowchart-gaps',
          questions: run,
          flowChartSteps: part.flowChartSteps,
        })
      } else {
        segments.push({ kind: 'gaps', questions: run })
      }
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
  reviewMode = false,
  reviewStatus = null,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
  reviewMode?: boolean
  reviewStatus?: ExamReviewStatus | null
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
            readOnly={reviewMode}
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
            readOnly={reviewMode}
            onChange={e => onAnswer(e.target.value)}
            onFocus={onSelect}
          />
        </label>
      )}
      <ListeningGapCorrectHint
        reviewMode={reviewMode}
        status={reviewStatus}
        correctAnswer={question.answer}
      />
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
  sectionHeaderMeta,
  reviewMode = false,
  reviewStatus = null,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
  showSectionHeader?: boolean
  sectionHeaderMeta?: ReturnType<typeof sectionMetaFromQuestions>
  reviewMode?: boolean
  reviewStatus?: import('./examReviewUtils').ExamReviewStatus | null
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
          meta={sectionHeaderMeta ?? sectionMetaFromQuestions([question])}
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
          const selected = answer.toUpperCase() === option.id.toUpperCase()
          const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
          const selectedWrong = Boolean(reviewMode && selected && reviewStatus === 'wrong')
          return (
            <div
              key={option.id}
              role="button"
              tabIndex={reviewMode ? -1 : 0}
              style={listeningOptionReviewStyle(reviewMode, selected, isKey, reviewStatus)}
              className={`listening-ielts-mc__opt${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
              onClick={e => {
                e.stopPropagation()
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
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const highlights = useExamHighlights()
  const segments = buildSegments(questions, part)
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
          const gapSectionMeta = sectionMetaFromQuestions(segment.questions)
          const gapsSectionTitle = gapSectionMeta.title ?? passageSection?.title
          const hasPriorMcSegment = segments.slice(0, index).some(seg => seg.kind === 'mc')
          const passageTitleKey = normalizeTitleKey(part.passageTitle)
          const gapsSectionTitleKey = normalizeTitleKey(gapsSectionTitle)
          const sectionTitleDuplicatesPassage = Boolean(
            passageTitleKey
            && gapsSectionTitleKey
            && passageTitleKey === gapsSectionTitleKey,
          )
          const notePassageStartsWithTitle = Boolean(
            passageTitleKey
            && passageBlocks?.[0]?.type === 'section'
            && normalizeTitleKey(passageBlocks[0].text) === passageTitleKey,
          )
          // P1 form + P2/P4 khi sectionTitle trùng passageTitle: tiêu đề trong box (Cam11 T1)
          const titleGoesInNoteBox = Boolean(
            passageBlocks
            && part.passageTitle
            && (
              (part.partNumber === 1 && part.notePassageLayout === 'form')
              || (gapsSectionTitle && (part.partNumber === 1 || part.partNumber === 4))
              || sectionTitleDuplicatesPassage
            ),
          )
          // Tiêu đề part-level phía trên box — khi không đặt trong box
          const showPartTitleAboveBox = Boolean(
            part.passageTitle
            && index === firstGapSegmentIndex
            && !titleGoesInNoteBox
            && !segmentTable?.title
            && !passageSection?.title
            && !gapsSectionTitle
            && !hasPriorMcSegment
            && !notePassageStartsWithTitle,
          )
          const partTitleAboveBox = (part.partNumber === 1 || part.partNumber === 4) && showPartTitleAboveBox
          const noteBoxTitle = passageBlocks
            ? titleGoesInNoteBox
              ? (sectionTitleDuplicatesPassage || !gapsSectionTitle
                  ? part.passageTitle
                  : gapsSectionTitle)
                ?? (part.partNumber === 4 && part.passageTitle && hasPriorMcSegment
                  ? part.passageTitle
                  : undefined)
              : !showPartTitleAboveBox && part.partNumber !== 4
                ? part.passageTitle
                : undefined
            : undefined
          const sectionHeaderTitle = titleGoesInNoteBox
            ? undefined
            : gapsSectionTitle && !showPartTitleAboveBox && !sectionTitleDuplicatesPassage
              ? gapsSectionTitle
              : undefined

          const sectionShowsInstruction = Boolean(
            gapSectionMeta.range
            || gapSectionMeta.instruction
            || passageSection?.instruction,
          )
          const sectionHeaderMeta = {
            range: gapSectionMeta.range,
            instruction: gapSectionMeta.instruction ?? passageSection?.instruction,
            title: sectionHeaderTitle,
          }
          const sectionHeaderShowsTitle = Boolean(sectionHeaderMeta.title)
          const suppressTableTitle = Boolean(
            sectionHeaderShowsTitle
            && segmentTable?.title
            && normalizeTitleKey(segmentTable.title) === normalizeTitleKey(sectionHeaderMeta.title),
          )

          return (
            <section key={`gaps-${index}`} className="listening-ielts-notes">
              {(sectionHeaderMeta.range || sectionHeaderMeta.instruction || sectionHeaderMeta.title) && (
                <ListeningIeltsSectionHeader
                  blockIdPrefix={`${part.id}-gap-section-${index}`}
                  meta={{
                    range: sectionHeaderMeta.range,
                    instruction: sectionHeaderMeta.instruction,
                    title: sectionHeaderMeta.title,
                  }}
                />
              )}
              {showPartTitleAboveBox && (partTitleAboveBox || !passageBlocks) && (
                <ReadingHighlightableText
                  blockId={`${part.id}-title`}
                  text={part.passageTitle!}
                  highlights={highlights}
                  className={[
                    'listening-ielts-notes__title',
                    partTitleAboveBox ? 'listening-ielts-notes__title--part1' : '',
                  ].filter(Boolean).join(' ')}
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
                  suppressInstruction={sectionShowsInstruction}
                  suppressTitle={suppressTableTitle}
                  reviewMode={reviewMode}
                  reviewStatusMap={reviewStatusMap}
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
                  passageTitle={noteBoxTitle}
                  layout={part.notePassageLayout === 'form' ? 'form' : 'lecture'}
                  reviewMode={reviewMode}
                  reviewStatusMap={reviewStatusMap}
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
                    {segment.questions.map(question => {
                      const ans = answers[question.id] ?? ''
                      const status = reviewMode
                        ? (reviewStatusMap?.[question.id]
                          ?? examReviewStatus(ans, a => isListeningAnswerCorrect(question, a)))
                        : null
                      return (
                        <GapRow
                          key={question.id}
                          question={question}
                          answer={ans}
                          isActive={activeQuestionId === question.id}
                          onAnswer={v => onAnswer(question.id, v)}
                          onSelect={() => onSelectQuestion(question.id)}
                          reviewMode={reviewMode}
                          reviewStatus={status}
                        />
                      )
                    })}
                  </div>
                </>
              )}
            </section>
          )
        }

        if (segment.kind === 'choose-two') {
          return (
            <ListeningIeltsChooseTwoBlock
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
              reviewMode={reviewMode}
              reviewStatusMap={reviewStatusMap}
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

        if (segment.kind === 'flowchart-gaps') {
          const gapFlowQuestionsByNumber = new Map(segment.questions.map(q => [q.number, q]))
          return (
            <ListeningIeltsGapFlowChartBlock
              key={`flowchart-gaps-${index}`}
              blockIdPrefix={`${part.id}-flow-gaps-${index}`}
              steps={segment.flowChartSteps}
              questionsByNumber={gapFlowQuestionsByNumber}
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

        const mcSectionMeta = sectionMetaFromQuestions(segment.questions)
        const mcHeaderMeta = mcSectionHeaderMeta(part, segments, index, mcSectionMeta)

        return (
          <section key={`mc-${index}`} className="listening-ielts-mc-group">
            {segment.questions.map((question, qIndex) => {
              const ans = answers[question.id] ?? ''
              const status = reviewMode
                ? (reviewStatusMap?.[question.id]
                  ?? examReviewStatus(ans, a => isListeningAnswerCorrect(question, a)))
                : null
              return (
                <McBlock
                  key={question.id}
                  question={question}
                  answer={ans}
                  isActive={activeQuestionId === question.id}
                  onAnswer={v => onAnswer(question.id, v)}
                  onSelect={() => onSelectQuestion(question.id)}
                  showSectionHeader={qIndex === 0 && Boolean(
                    mcHeaderMeta.range || mcHeaderMeta.instruction || mcHeaderMeta.title,
                  )}
                  sectionHeaderMeta={mcHeaderMeta}
                  reviewMode={reviewMode}
                  reviewStatus={status}
                />
              )
            })}
          </section>
        )
      })}
    </ExamHighlightZone>
  )
}