import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ReadingNotePassageBlock, ReadingQuestion } from './examData'
import type { ListeningNotePassageBlock } from './listeningExamData'
import {
  groupNotePassageIntoLines,
  hasNoteLineMarker,
  isFormSubFieldRenderLine,
  noteLineBodyText,
  noteLineMarkerKind,
  prepareNotePassageBlocks,
} from './listeningNotePassage'

interface Props {
  groupId: string
  blocks: ReadingNotePassageBlock[]
  questionsByNumber: Map<number, ReadingQuestion>
  answers: Record<string, string>
  highlights: ReturnType<typeof useExamHighlights>
  activeQuestionId: string | null
  placeholder: string
  notesTitle?: string
  variant?: 'default' | 'summary'
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

function asListeningBlocks(blocks: ReadingNotePassageBlock[]): ListeningNotePassageBlock[] {
  return blocks as ListeningNotePassageBlock[]
}

function lineVariant(blocks: ReadingNotePassageBlock[]): '' | 'bullet' | 'sub' {
  const firstStatic = blocks.find(block => block.type === 'static')
  if (firstStatic?.text) {
    return noteLineMarkerKind(firstStatic.text)
  }
  return ''
}

function NoteGapInput({
  question,
  answer,
  placeholder,
  isActive,
  onAnswer,
  onSelect,
}: {
  question: ReadingQuestion
  answer: string
  placeholder: string
  isActive: boolean
  onAnswer: (v: string) => void
  onSelect: () => void
}) {
  return (
    <span
      className={`reading-test-notes-gap${isActive ? ' is-active' : ''}`}
      id={`reading-q-${question.id}`}
    >
      <span className="reading-test-notes-gap__num" data-highlight-skip>{question.number}</span>
      <input
        type="text"
        className="reading-test-notes-gap__input"
        value={answer}
        placeholder={placeholder}
        aria-label={`Question ${question.number}`}
        data-highlight-skip
        onChange={e => onAnswer(e.target.value.trim().toLowerCase())}
        onFocus={onSelect}
      />
    </span>
  )
}

export default function ReadingNotePassageBox({
  groupId,
  blocks,
  questionsByNumber,
  answers,
  highlights,
  activeQuestionId,
  placeholder,
  notesTitle,
  variant = 'default',
  onAnswer,
  onSelectQuestion,
}: Props) {
  const listeningBlocks = asListeningBlocks(blocks)
  const preparedBlocks = prepareNotePassageBlocks(
    listeningBlocks,
    questionsByNumber as unknown as Map<number, import('./listeningExamData').ListeningQuestion>,
  )
  const lines = groupNotePassageIntoLines(preparedBlocks, 'form')

  return (
    <div className={`reading-test-notes-box${variant === 'summary' ? ' reading-test-notes-box--summary' : ''}`}>
      {notesTitle && (
        <ReadingHighlightableText
          blockId={`${groupId}-notes-title`}
          text={notesTitle}
          highlights={highlights}
          className="reading-test-notes-box__title"
          as="p"
        />
      )}
      {lines.map((line, lineIndex) => {
        if (line.kind === 'section') {
          return (
            <ReadingHighlightableText
              key={`${groupId}-line-${lineIndex}`}
              blockId={`${groupId}-np-section-${lineIndex}`}
              text={line.block.text ?? ''}
              highlights={highlights}
              className="reading-test-notes-box__section"
              as="p"
            />
          )
        }

        if (line.kind === 'example') {
          return (
            <ExamHighlightableLines
              key={`${groupId}-line-${lineIndex}`}
              blockIdPrefix={`${groupId}-np-example-${lineIndex}`}
              text={line.block.text ?? ''}
              lineClassName="reading-test-notes-box__example"
            />
          )
        }

        const variant = lineVariant(line.blocks as ReadingNotePassageBlock[])
        const subField = isFormSubFieldRenderLine(line.blocks)
        const lineClass = [
          'reading-test-notes-box__line',
          variant === 'bullet' ? 'reading-test-notes-box__line--bullet' : '',
          variant === 'sub' ? 'reading-test-notes-box__line--sub' : '',
          subField ? 'reading-test-notes-box__line--indent' : '',
        ].filter(Boolean).join(' ')

        return (
          <div key={`${groupId}-line-${lineIndex}`} className={lineClass}>
            {(line.blocks as ReadingNotePassageBlock[]).map((block, blockIndex) => {
              if (block.type === 'static') {
                const raw = block.text ?? ''
                const text = hasNoteLineMarker(raw) ? noteLineBodyText(raw) : raw
                return (
                  <ReadingHighlightableText
                    key={`${groupId}-line-${lineIndex}-b-${blockIndex}`}
                    blockId={`${groupId}-np-static-${lineIndex}-${blockIndex}`}
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

              return (
                <NoteGapInput
                  key={question.id}
                  question={question}
                  answer={answers[question.id] ?? ''}
                  placeholder={placeholder}
                  isActive={activeQuestionId === question.id}
                  onAnswer={v => onAnswer(question.id, v)}
                  onSelect={() => onSelectQuestion(question.id)}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
