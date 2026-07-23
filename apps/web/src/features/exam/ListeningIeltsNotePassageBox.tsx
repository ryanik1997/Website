import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ListeningNotePassageBlock, ListeningQuestion } from './listeningExamData'
import {
  gapLeadRenderedInPassage,
  gapTrailRenderedInPassage,
  groupNotePassageIntoLines,
  hasNoteLineMarker,
  isFormSubFieldRenderLine,
  noteLineBodyText,
  noteLineMarkerKind,
  prepareNotePassageBlocks,
} from './listeningNotePassage'

import { Check } from 'lucide-react'
import { EXAM_REVIEW_COLORS, type ExamReviewStatus } from './examReviewUtils'
import { examReviewStatus } from './examReviewUtils'
import { isListeningAnswerCorrect } from './listeningExamData'

interface Props {
  partId: string
  blocks: ListeningNotePassageBlock[]
  questionsByNumber: Map<number, ListeningQuestion>
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  passageTitle?: string
  layout?: 'list' | 'form' | 'lecture'
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
}

function GapInlineCompact({
  question,
  answer,
  isActive,
  onAnswer,
  onSelect,
  suppressLead = false,
  suppressTrail = false,
  reviewMode = false,
  reviewStatus = null,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
  suppressLead?: boolean
  suppressTrail?: boolean
  reviewMode?: boolean
  reviewStatus?: ExamReviewStatus | null
}) {
  const wordLimit = question.wordLimit ?? 3
  const showLead = Boolean(question.gapLead) && !suppressLead
  const showTrail = Boolean(question.gapTrail) && !suppressTrail
  const hasInline = showLead || showTrail
  const highlights = useExamHighlights()
  const showKey = reviewMode && reviewStatus !== 'correct' && question.answer
  const border = reviewStatus ? EXAM_REVIEW_COLORS[reviewStatus].bg : undefined

  const gapBox = (
    <span
      className={[
        'listening-tid-gap',
        isActive ? 'is-active' : '',
        answer.trim() ? 'has-value' : '',
        reviewStatus === 'correct' ? 'is-ok' : '',
        reviewStatus === 'wrong' ? 'is-bad' : '',
      ].filter(Boolean).join(' ')}
      id={`listening-q-${question.id}`}
      style={border && reviewMode ? { outline: `2px solid ${border}`, outlineOffset: 1 } : undefined}
    >
      <input
        id={`ielts-gap-${question.id}`}
        type="text"
        autoComplete="off"
        className="listening-tid-gap__input"
        value={answer}
        placeholder=""
        aria-label={`Question ${question.number}`}
        data-highlight-skip
        readOnly={reviewMode}
        onChange={e => onAnswer(e.target.value)}
        onFocus={onSelect}
      />
      <span className="listening-tid-gap__num" aria-hidden>
        {question.number}
      </span>
    </span>
  )

  if (hasInline) {
    return (
      <label
        className={`listening-ielts-notes__inline-gap${isActive ? ' is-active' : ''}`}
        htmlFor={`ielts-gap-${question.id}`}
      >
        {showLead && question.gapLead && (
          <ReadingHighlightableText
            blockId={`${question.id}-lead`}
            text={question.gapLead.endsWith(' ') ? question.gapLead : `${question.gapLead} `}
            highlights={highlights}
            as="span"
          />
        )}
        {gapBox}
        {showTrail && question.gapTrail && (
          <ReadingHighlightableText
            blockId={`${question.id}-trail`}
            text={question.gapTrail.startsWith(' ') ? question.gapTrail : ` ${question.gapTrail}`}
            highlights={highlights}
            as="span"
          />
        )}
        {showKey && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6, fontWeight: 800, color: EXAM_REVIEW_COLORS.correct.bg, fontSize: '0.8rem' }}>
            <Check size={13} strokeWidth={3} />
            {question.answer}
          </span>
        )}
      </label>
    )
  }

  return (
    <>
      {gapBox}
      {showKey && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6, fontWeight: 800, color: EXAM_REVIEW_COLORS.correct.bg, fontSize: '0.8rem' }}>
          <Check size={13} strokeWidth={3} />
          {question.answer}
        </span>
      )}
    </>
  )
}

function lineVariant(blocks: ListeningNotePassageBlock[]): '' | 'bullet' | 'sub' {
  const firstStatic = blocks.find(block => block.type === 'static')
  if (firstStatic?.text) {
    return noteLineMarkerKind(firstStatic.text)
  }
  return ''
}

export default function ListeningIeltsNotePassageBox({
  partId,
  blocks,
  questionsByNumber,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
  passageTitle,
  layout = 'list',
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const highlights = useExamHighlights()
  const isForm = layout === 'form'
  const boxClass = [
    'listening-ielts-notes__box',
    isForm ? 'listening-ielts-notes__box--form' : 'listening-ielts-notes__box--lecture',
  ].filter(Boolean).join(' ')

  const preparedBlocks = prepareNotePassageBlocks(blocks, questionsByNumber)
  const gapBlockIndices = new Map<number, number>()
  preparedBlocks.forEach((block, index) => {
    if (block.type === 'gap' && block.number != null) {
      gapBlockIndices.set(block.number, index)
    }
  })
  // Luôn dùng quy tắc form/lecture (1 static = 1 dòng) — không gom list mode.
  const lines = groupNotePassageIntoLines(
    preparedBlocks,
    layout === 'lecture' ? 'lecture' : 'form',
  )

  return (
    <div className={boxClass}>
      {passageTitle && (
        <ReadingHighlightableText
          blockId={`${partId}-title`}
          text={passageTitle}
          highlights={highlights}
          className="listening-ielts-notes__title listening-ielts-notes__title--in-box"
          as="h3"
        />
      )}

      {lines.map((line, lineIndex) => {
        if (line.kind === 'section') {
          return (
            <ReadingHighlightableText
              key={`${partId}-line-${lineIndex}`}
              blockId={`${partId}-np-section-${lineIndex}`}
              text={line.block.text ?? ''}
              highlights={highlights}
              className="listening-ielts-notes__section"
              as="p"
            />
          )
        }

        if (line.kind === 'example') {
          return (
            <ExamHighlightableLines
              key={`${partId}-line-${lineIndex}`}
              blockIdPrefix={`${partId}-np-example-${lineIndex}`}
              text={line.block.text ?? ''}
              lineClassName="listening-ielts-notes__example"
            />
          )
        }

        const variant = lineVariant(line.blocks)
        const subField = isForm && isFormSubFieldRenderLine(line.blocks)
        const lineClass = [
          'listening-ielts-notes__line',
          variant === 'bullet' ? 'listening-ielts-notes__line--bullet' : '',
          variant === 'sub' ? 'listening-ielts-notes__line--sub' : '',
          subField ? 'listening-ielts-notes__line--indent' : '',
        ].filter(Boolean).join(' ')

        return (
          <div key={`${partId}-line-${lineIndex}`} className={lineClass} role="listitem">
            {line.blocks.map((block, blockIndex) => {
              if (block.type === 'static') {
                const raw = block.text ?? ''
                // Always strip leading bullet marker for form/lecture to avoid double bullets (CSS ::before provides it)
                const text = hasNoteLineMarker(raw) ? noteLineBodyText(raw) : raw
                return (
                  <ReadingHighlightableText
                    key={`${partId}-line-${lineIndex}-b-${blockIndex}`}
                    blockId={`${partId}-np-static-${lineIndex}-${blockIndex}`}
                    text={text}
                    highlights={highlights}
                    as="span"
                  />
                )
              }

              const question = block.number != null
                ? questionsByNumber.get(block.number)
                : undefined
              if (!question) return null

              const gapIndex = block.number != null
                ? gapBlockIndices.get(block.number) ?? -1
                : -1

              const ans = answers[question.id] ?? ''
              const st = reviewMode
                ? (reviewStatusMap?.[question.id]
                  ?? examReviewStatus(ans, a => isListeningAnswerCorrect(question, a)))
                : null
              return (
                <GapInlineCompact
                  key={question.id}
                  question={question}
                  answer={ans}
                  isActive={activeQuestionId === question.id}
                  onAnswer={v => onAnswer(question.id, v)}
                  onSelect={() => onSelectQuestion(question.id)}
                  suppressLead={gapLeadRenderedInPassage(preparedBlocks, gapIndex, question.gapLead)}
                  suppressTrail={gapTrailRenderedInPassage(preparedBlocks, gapIndex, question.gapTrail)}
                  reviewMode={reviewMode}
                  reviewStatus={st}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}