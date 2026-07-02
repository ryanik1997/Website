import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ListeningNotePassageBlock, ListeningQuestion } from './listeningExamData'

interface Props {
  partId: string
  blocks: ListeningNotePassageBlock[]
  questionsByNumber: Map<number, ListeningQuestion>
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

function GapInline({
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

  if (!hasInline) {
    return (
      <label
        className={`listening-ielts-notes__field${isActive ? ' is-active' : ''}`}
        htmlFor={`ielts-gap-${question.id}`}
      >
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
    )
  }

  return (
    <label
      className={`listening-ielts-notes__sentence${isActive ? ' is-active' : ''}`}
      htmlFor={`ielts-gap-${question.id}`}
    >
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
  )
}

export default function ListeningIeltsNotePassageBox({
  partId,
  blocks,
  questionsByNumber,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const highlights = useExamHighlights()

  return (
    <div className="listening-ielts-notes__box">
      {blocks.map((block, index) => {
        if (block.type === 'static') {
          return (
            <ExamHighlightableLines
              key={`${partId}-np-${index}`}
              blockIdPrefix={`${partId}-np-static-${index}`}
              text={block.text ?? ''}
              lineClassName="listening-ielts-notes__static"
            />
          )
        }

        if (block.type === 'section') {
          return (
            <ReadingHighlightableText
              key={`${partId}-np-${index}`}
              blockId={`${partId}-np-section-${index}`}
              text={block.text ?? ''}
              highlights={highlights}
              className="listening-ielts-notes__section"
              as="p"
            />
          )
        }

        const question = block.number != null ? questionsByNumber.get(block.number) : undefined
        if (!question) return null

        return (
          <div
            key={question.id}
            id={`listening-q-${question.id}`}
            className={`listening-ielts-notes__row${activeQuestionId === question.id ? ' is-active' : ''}`}
          >
            <GapInline
              question={question}
              answer={answers[question.id] ?? ''}
              isActive={activeQuestionId === question.id}
              onAnswer={v => onAnswer(question.id, v)}
              onSelect={() => onSelectQuestion(question.id)}
            />
          </div>
        )
      })}
    </div>
  )
}