import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type {
  ListeningNoteTable,
  ListeningNoteTableCellBlock,
  ListeningQuestion,
} from './listeningExamData'
import { hasNoteLineMarker } from './listeningNotePassage'

/** Mỗi bullet • trong ô bảng = một dòng (Cam12 T3 P2 Fitness Holidays). */
function groupTableCellLines(cell: ListeningNoteTableCellBlock[]): ListeningNoteTableCellBlock[][] {
  const lines: ListeningNoteTableCellBlock[][] = []
  let current: ListeningNoteTableCellBlock[] = []

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

    const startsNewBulletLine = block.type === 'static'
      && hasNoteLineMarker((block.text ?? '').trim())
      && current.length > 0

    if (startsNewBulletLine) {
      flush()
    }
    current.push(block)
  }

  flush()
  return lines.length ? lines : [[]]
}

import { Check } from 'lucide-react'
import { EXAM_REVIEW_COLORS, examReviewStatus, type ExamReviewStatus } from './examReviewUtils'
import { isListeningAnswerCorrect } from './listeningExamData'

interface Props {
  partId: string
  table: ListeningNoteTable
  questionsByNumber: Map<number, ListeningQuestion>
  answers: Record<string, string>
  activeQuestionId: string | null
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  /** Khi section header đã hiện instruction — tránh lặp trong bảng. */
  suppressInstruction?: boolean
  /** Khi section header đã hiện cùng title — tránh lặp (vd. a15 Manham). */
  suppressTitle?: boolean
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
}

function TableGapInput({
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
  const showKey = reviewMode && reviewStatus !== 'correct' && question.answer
  const border = reviewStatus ? EXAM_REVIEW_COLORS[reviewStatus].bg : undefined
  return (
    <span
      className={`listening-ielts-notes__table-gap${isActive ? ' is-active' : ''}`}
      style={border ? { outline: `2px solid ${border}`, borderRadius: 4, padding: 1 } : undefined}
    >
      <span className="listening-ielts-notes__num">{question.number}</span>
      <input
        id={`ielts-gap-${question.id}`}
        type="text"
        className="listening-ielts-notes__input listening-ielts-notes__input--table"
        value={answer}
        placeholder=""
        aria-label={`Question ${question.number}`}
        data-highlight-skip
        readOnly={reviewMode}
        onChange={e => onAnswer(e.target.value)}
        onFocus={onSelect}
      />
      {showKey && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 4, fontWeight: 800, color: EXAM_REVIEW_COLORS.correct.bg, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          <Check size={12} strokeWidth={3} />
          {question.answer}
        </span>
      )}
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
  suppressInstruction = false,
  suppressTitle = false,
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const highlights = useExamHighlights()

  return (
    <div className="listening-ielts-notes__table-block">
      {table.instruction && !suppressInstruction && (
        <ExamHighlightableLines
          blockIdPrefix={`${partId}-tbl-instruction`}
          text={table.instruction}
          lineClassName="listening-ielts-notes__intro"
        />
      )}
      {table.title && !suppressTitle && (
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
            {table.headers.map((header, headerIndex) => (
              <th key={`${partId}-hdr-${headerIndex}`}>
                {header || '\u00a0'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`${partId}-row-${rowIndex}`}>
              {row.cells.map((cell, cellIndex) => (
                <td key={`${partId}-cell-${rowIndex}-${cellIndex}`}>
                  <div className="listening-ielts-notes__cell">
                    {groupTableCellLines(cell).map((line, lineIndex) => (
                      <div
                        key={`${partId}-cell-line-${rowIndex}-${cellIndex}-${lineIndex}`}
                        className="listening-ielts-notes__cell-line"
                      >
                        {line.map((block, blockIndex) => {
                          if (block.type === 'static') {
                            return (
                              <ReadingHighlightableText
                                key={`${partId}-static-${rowIndex}-${cellIndex}-${lineIndex}-${blockIndex}`}
                                blockId={`${partId}-tbl-${rowIndex}-${cellIndex}-${lineIndex}-${blockIndex}`}
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
                                reviewMode={reviewMode}
                                reviewStatus={reviewMode
                                  ? (reviewStatusMap?.[question.id]
                                    ?? examReviewStatus(answers[question.id] ?? '', a => isListeningAnswerCorrect(question, a)))
                                  : null}
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