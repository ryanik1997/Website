import ReadingHighlightableText from './ReadingHighlightableText'
import type { ReadingNoteTable, ReadingNoteTableCellBlock, ReadingQuestion } from './examData'
import type { ReadingHighlight } from './readingHighlightUtils'

function groupTableCellLines(cell: ReadingNoteTableCellBlock[]): ReadingNoteTableCellBlock[][] {
  const lines: ReadingNoteTableCellBlock[][] = []
  let current: ReadingNoteTableCellBlock[] = []

  const flush = () => {
    if (!current.length) return
    lines.push(current)
    current = []
  }

  for (const block of cell) {
    if (block.type === 'break') {
      flush()
      continue
    }
    current.push(block)
  }

  flush()
  return lines.length ? lines : [[]]
}

interface Props {
  groupId: string
  table: ReadingNoteTable
  questionsByNumber: Map<number, ReadingQuestion>
  answers: Record<string, string>
  highlights: ReadingHighlight[]
  activeQuestionId: string | null
  placeholder: string
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

function TableGapInput({
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
    <span className={`reading-test-table-gap${isActive ? ' is-active' : ''}`}>
      <span className="reading-test-table-gap__num" data-highlight-skip>{question.number}</span>
      <input
        id={`reading-q-${question.id}`}
        type="text"
        className="reading-test-table-gap__input"
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

export default function ReadingNoteTableView({
  groupId,
  table,
  questionsByNumber,
  answers,
  highlights,
  activeQuestionId,
  placeholder,
  onAnswer,
  onSelectQuestion,
}: Props) {
  return (
    <div className="reading-test-table-block">
      {table.title && (
        <ReadingHighlightableText
          blockId={`${groupId}-tbl-title`}
          text={table.title}
          highlights={highlights}
          className="reading-test-table-block__title"
          as="p"
        />
      )}
      <div className="reading-test-table-wrap">
        <table className="reading-test-table">
          <thead>
            <tr>
              {table.headers.map((header, headerIndex) => (
                <th key={`${groupId}-hdr-${headerIndex}`}>
                  <ReadingHighlightableText
                    blockId={`${groupId}-hdr-${headerIndex}`}
                    text={header || '\u00a0'}
                    highlights={highlights}
                    as="span"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={`${groupId}-row-${rowIndex}`}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={`${groupId}-cell-${rowIndex}-${cellIndex}`}>
                    <div className="reading-test-table__cell">
                      {groupTableCellLines(cell).map((line, lineIndex) => (
                        <div
                          key={`${groupId}-line-${rowIndex}-${cellIndex}-${lineIndex}`}
                          className="reading-test-table__cell-line"
                        >
                          {line.map((block, blockIndex) => {
                            if (block.type === 'static') {
                              return (
                                <ReadingHighlightableText
                                  key={`${groupId}-static-${rowIndex}-${cellIndex}-${lineIndex}-${blockIndex}`}
                                  blockId={`${groupId}-static-${rowIndex}-${cellIndex}-${lineIndex}-${blockIndex}`}
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
                                className={
                                  activeQuestionId === question.id
                                    ? 'reading-test-table-gap-wrap is-active'
                                    : 'reading-test-table-gap-wrap'
                                }
                              >
                                <TableGapInput
                                  question={question}
                                  answer={answers[question.id] ?? ''}
                                  placeholder={placeholder}
                                  isActive={activeQuestionId === question.id}
                                  onAnswer={v => onAnswer(question.id, v)}
                                  onSelect={() => onSelectQuestion(question.id)}
                                />
                              </span>
                            )
                          })}
                        </div>
                      ))}
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