import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ListeningNotePassageBlock, ListeningQuestion } from './listeningExamData'
import { groupNotePassageIntoLines, prepareNotePassageBlocks } from './listeningNotePassage'

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
}: {
  question: ListeningQuestion
  answer: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
}) {
  const wordLimit = question.wordLimit ?? 3
  const hasInline = Boolean(question.gapLead || question.gapTrail)
  const highlights = useExamHighlights()

  if (hasInline) {
    return (
      <label
        className={`listening-ielts-notes__inline-gap${isActive ? ' is-active' : ''}`}
        htmlFor={`ielts-gap-${question.id}`}
      >
        {question.gapLead && (
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
        {question.gapTrail && (
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
  const trimmed = firstStatic.text.trimStart()
  if (trimmed.startsWith('•')) return 'bullet'
  if (trimmed.startsWith('–') || trimmed.startsWith('−') || trimmed.startsWith('- ')) return 'sub'
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
}: Props) {
  const highlights = useExamHighlights()
  const boxClass = [
    'listening-ielts-notes__box',
    'listening-ielts-notes__box--lecture',
    layout === 'form' ? 'listening-ielts-notes__box--form' : '',
  ].filter(Boolean).join(' ')

  const preparedBlocks = prepareNotePassageBlocks(blocks, questionsByNumber)
  const lines = groupNotePassageIntoLines(preparedBlocks)

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
          <p key={`${partId}-line-${lineIndex}`} className={lineClass}>
            {line.blocks.map((block, blockIndex) => {
              if (block.type === 'static') {
                return (
                  <ReadingHighlightableText
                    key={`${partId}-line-${lineIndex}-b-${blockIndex}`}
                    blockId={`${partId}-np-static-${lineIndex}-${blockIndex}`}
                    text={block.text ?? ''}
                    highlights={highlights}
                    as="span"
                  />
                )
              }

              const question = block.number != null
                ? questionsByNumber.get(block.number)
                : undefined
              if (!question) return null

              return (
                <GapInlineCompact
                  key={question.id}
                  question={question}
                  answer={answers[question.id] ?? ''}
                  isActive={activeQuestionId === question.id}
                  onAnswer={v => onAnswer(question.id, v)}
                  onSelect={() => onSelectQuestion(question.id)}
                />
              )
            })}
          </p>
        )
      })}
    </div>
  )
}