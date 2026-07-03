import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ListeningNotePassageBlock, ListeningQuestion } from './listeningExamData'
import {
  gapLeadRenderedAdjacent,
  gapTrailRenderedAdjacent,
  groupNotePassageIntoLines,
  noteLineBodyText,
  noteLineMarkerKind,
  prepareNotePassageBlocks,
} from './listeningNotePassage'

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
}

function GapInlineCompact({
  question,
  answer,
  isActive,
  onAnswer,
  onSelect,
  suppressLead = false,
  suppressTrail = false,
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
  suppressLead?: boolean
  suppressTrail?: boolean
}) {
  const wordLimit = question.wordLimit ?? 3
  const showLead = Boolean(question.gapLead) && !suppressLead
  const showTrail = Boolean(question.gapTrail) && !suppressTrail
  const hasInline = showLead || showTrail
  const highlights = useExamHighlights()

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
        <span className={`listening-ielts-notes__gap-slot${isActive ? ' is-active' : ''}`}>
          <span className="listening-ielts-notes__gap-num" aria-hidden>
            {question.number}
          </span>
          <input
            id={`ielts-gap-${question.id}`}
            type="text"
            className="listening-ielts-notes__input listening-ielts-notes__input--inline"
            value={answer}
            placeholder=""
            aria-label={`Question ${question.number}`}
            data-highlight-skip
            onChange={e => onAnswer(e.target.value)}
            onFocus={onSelect}
          />
        </span>
        {showTrail && question.gapTrail && (
          <ReadingHighlightableText
            blockId={`${question.id}-trail`}
            text={question.gapTrail.startsWith(' ') ? question.gapTrail : ` ${question.gapTrail}`}
            highlights={highlights}
            as="span"
          />
        )}
      </label>
    )
  }

  return (
    <span
      className={`listening-ielts-notes__gap-slot${isActive ? ' is-active' : ''}`}
      id={`listening-q-${question.id}`}
    >
      <span className="listening-ielts-notes__gap-num" aria-hidden>
        {question.number}
      </span>
      <input
        id={`ielts-gap-${question.id}`}
        type="text"
        className="listening-ielts-notes__input listening-ielts-notes__input--inline"
        value={answer}
        placeholder=""
        aria-label={`Question ${question.number}`}
        data-highlight-skip
        onChange={e => onAnswer(e.target.value)}
        onFocus={onSelect}
      />
    </span>
  )
}

function lineVariant(blocks: ListeningNotePassageBlock[]): '' | 'bullet' | 'sub' {
  const firstStatic = blocks.find(block => block.type === 'static')
  if (!firstStatic?.text) return ''
  return noteLineMarkerKind(firstStatic.text)
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
}: Props) {
  const highlights = useExamHighlights()
  const boxClass = [
    'listening-ielts-notes__box',
    'listening-ielts-notes__box--lecture',
    layout === 'form' ? 'listening-ielts-notes__box--form' : '',
  ].filter(Boolean).join(' ')

  const preparedBlocks = prepareNotePassageBlocks(blocks, questionsByNumber)
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
        const lineClass = [
          'listening-ielts-notes__line',
          variant === 'bullet' ? 'listening-ielts-notes__line--bullet' : '',
          variant === 'sub' ? 'listening-ielts-notes__line--sub' : '',
        ].filter(Boolean).join(' ')

        return (
          <div key={`${partId}-line-${lineIndex}`} className={lineClass} role="listitem">
            {line.blocks.map((block, blockIndex) => {
              if (block.type === 'static') {
                const raw = block.text ?? ''
                const text = variant ? noteLineBodyText(raw) : raw
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

              const prevBlock = line.blocks[blockIndex - 1]
              const nextBlock = line.blocks[blockIndex + 1]

              return (
                <GapInlineCompact
                  key={question.id}
                  question={question}
                  answer={answers[question.id] ?? ''}
                  isActive={activeQuestionId === question.id}
                  onAnswer={v => onAnswer(question.id, v)}
                  onSelect={() => onSelectQuestion(question.id)}
                  suppressLead={gapLeadRenderedAdjacent(prevBlock, question.gapLead)}
                  suppressTrail={gapTrailRenderedAdjacent(nextBlock, question.gapTrail)}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}