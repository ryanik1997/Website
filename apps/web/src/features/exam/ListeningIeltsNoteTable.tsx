import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ListeningNoteTable, ListeningQuestion } from './listeningExamData'

interface Props {
  partId: string
  table: ListeningNoteTable
  questionsByNumber: Map<number, ListeningQuestion>
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

function TableGapInput({
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

  return (
    <span className={`listening-ielts-notes__table-gap${isActive ? ' is-active' : ''}`}>
      <span className="listening-ielts-notes__num">{question.number}</span>
      <input
        id={`ielts-gap-${question.id}`}
        type="text"
        className="listening-ielts-notes__input listening-ielts-notes__input--table"
        value={answer}
        placeholder={`${wordLimit} từ`}
        data-highlight-skip
        onChange={e => onAnswer(e.target.value)}
        onFocus={onSelect}
      />
    </span>
  )
}

export default function ListeningIeltsNoteTable({
  partId,
  table,
  questionsByNumber,
  answers,
  activeQuestionId,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const highlights = useExamHighlights()

  return (
    <div className="listening-ielts-notes__table-block">
      {table.instruction && (
        <ExamHighlightableLines
          blockIdPrefix={`${partId}-tbl-instruction`}
          text={table.instruction}
          lineClassName="listening-ielts-notes__intro"
        />
      )}
      {table.title && (
        <ReadingHighlightableText
          blockId={`${partId}-tbl-title`}
          text={table.title}
          highlights={highlights}
          className="listening-ielts-notes__title"
          as="h3"
        />
      )}
      <div className="listening-ielts-notes__table-wrap">
      <table className="listening-ielts-notes__table">
        <thead>
          <tr>
            {table.headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${partId}-row-${rowIndex}`}>
              {row.cells.map((cell, cellIndex) => (
                <td key={`${partId}-cell-${rowIndex}-${cellIndex}`}>
                  <div className="listening-ielts-notes__cell">
                    {cell.map((block, blockIndex) => {
                      if (block.type === 'break') {
                        return <br key={`${partId}-br-${rowIndex}-${cellIndex}-${blockIndex}`} />
                      }

                      if (block.type === 'static') {
                        return (
                          <ReadingHighlightableText
                            key={`${partId}-static-${rowIndex}-${cellIndex}-${blockIndex}`}
                            blockId={`${partId}-tbl-${rowIndex}-${cellIndex}-${blockIndex}`}
                            text={block.text ?? ''}
                            highlights={highlights}
                            as="span"
                          />
                        )
                      }

                      const question =
                        block.number != null ? questionsByNumber.get(block.number) : undefined
                      if (!question) return null

                      return (
                        <span
                          key={question.id}
                          id={`listening-q-${question.id}`}
                          className={
                            activeQuestionId === question.id
                              ? 'listening-ielts-notes__table-gap-wrap is-active'
                              : 'listening-ielts-notes__table-gap-wrap'
                          }
                        >
                          <TableGapInput
                            question={question}
                            answer={answers[question.id] ?? ''}
                            isActive={activeQuestionId === question.id}
                            onAnswer={v => onAnswer(question.id, v)}
                            onSelect={() => onSelectQuestion(question.id)}
                          />
                        </span>
                      )
                    })}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}