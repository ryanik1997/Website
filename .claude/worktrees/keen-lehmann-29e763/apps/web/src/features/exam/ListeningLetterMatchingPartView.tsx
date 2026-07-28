import { useCallback, useState, type ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import { sharedMatchingOptions } from './listeningMultiPartLayout'
import type { ExamAudioSource } from './useExamQuestionAudio'
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
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  resizer: ReactNode
}

export default function ListeningLetterMatchingPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  onAnswer,
  onSelectQuestion,
  resizer,
}: Props) {
  const highlights = useExamHighlights()
  const options = sharedMatchingOptions(questions)
  const [pickedOptionId, setPickedOptionId] = useState<string | null>(null)

  const usedByQuestion = useCallback((optionId: string) => {
    return questions.find(q => answers[q.id] === optionId)?.id ?? null
  }, [answers, questions])

  const assignOption = useCallback((questionId: string, optionId: string) => {
    const prevOwner = usedByQuestion(optionId)
    if (prevOwner && prevOwner !== questionId) {
      onAnswer(prevOwner, '')
    }
    onAnswer(questionId, optionId)
    setPickedOptionId(null)
    onSelectQuestion(questionId)
  }, [onAnswer, onSelectQuestion, usedByQuestion])

  const handleDrop = useCallback((questionId: string, optionId: string) => {
    if (!optionId) return
    assignOption(questionId, optionId)
  }, [assignOption])

  const handleOptionClick = useCallback((optionId: string) => {
    setPickedOptionId(prev => (prev === optionId ? null : optionId))
  }, [])

  const handleSlotClick = useCallback((questionId: string) => {
    if (pickedOptionId) {
      assignOption(questionId, pickedOptionId)
      return
    }
    onSelectQuestion(questionId)
  }, [assignOption, onSelectQuestion, pickedOptionId])

  const clearSlot = useCallback((questionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onAnswer(questionId, '')
  }, [onAnswer])

  return (
    <>
      <ExamHighlightZone className="listening-exam-prompt-pane listening-letter-match__prompt">
        <p className="listening-exam-prompt-pane__part">
          Part {part.partNumber} · {part.rangeLabel}
        </p>
        {part.instruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={part.instruction}
            lineClassName="listening-letter-match__instruction"
          />
        )}
        <ListeningExamAudioBar {...audioBar} />
        <div className="listening-letter-match__bank">
          {options.map(option => {
            const isUsed = Boolean(usedByQuestion(option.id))
            const isPicked = pickedOptionId === option.id
            return (
              <div
                key={option.id}
                className={`listening-letter-match__bank-row${isUsed ? ' is-used' : ''}${isPicked ? ' is-picked' : ''}`}
                draggable={!isUsed}
                onDragStart={e => {
                  if (isUsed) return
                  e.dataTransfer.setData('text/plain', option.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onClick={() => {
                  if (isUsed) return
                  handleOptionClick(option.id)
                }}
                role="button"
                tabIndex={isUsed ? -1 : 0}
                aria-disabled={isUsed}
                onKeyDown={e => {
                  if (isUsed) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleOptionClick(option.id)
                  }
                }}
              >
                <span className="listening-letter-match__bank-letter">{option.id}</span>
                <ReadingHighlightableText
                  blockId={`${part.id}-opt-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  className="listening-letter-match__bank-label"
                  as="span"
                />
              </div>
            )
          })}
        </div>
      </ExamHighlightZone>

      {resizer}

      <ExamHighlightZone className="listening-exam-answer-pane listening-letter-match__answers">
        <header className="listening-exam-answer-pane__head">
          <h3 className="listening-exam-answer-pane__title">Thả chữ cái vào ô trống</h3>
          {pickedOptionId && (
            <p className="listening-letter-match__pick-hint">
              Đã chọn {pickedOptionId} — bấm vào ô trống bên cạnh Speaker
            </p>
          )}
        </header>
        <div className="listening-letter-match__speakers">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const answerId = answers[question.id] ?? ''
            return (
              <div
                key={question.id}
                className={`listening-letter-match__speaker-row${isActive ? ' is-active' : ''}`}
              >
                <ReadingHighlightableText
                  blockId={`${question.id}-speaker`}
                  text={question.prompt}
                  highlights={highlights}
                  className="listening-letter-match__speaker-label"
                  as="span"
                />
                <button
                  type="button"
                  className={`listening-letter-match__slot${answerId ? ' is-filled' : ''}`}
                  aria-label={`Ô đáp án câu ${question.number} — ${question.prompt}`}
                  data-highlight-skip
                  onClick={() => handleSlotClick(question.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    handleDrop(question.id, e.dataTransfer.getData('text/plain'))
                  }}
                >
                  {answerId ? (
                    <>
                      <span className="listening-letter-match__slot-letter">{answerId}</span>
                      <span
                        className="listening-letter-match__slot-clear"
                        role="button"
                        tabIndex={0}
                        aria-label="Xóa đáp án"
                        onClick={e => clearSlot(question.id, e)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            clearSlot(question.id, e as unknown as React.MouseEvent)
                          }
                        }}
                      >
                        ×
                      </span>
                    </>
                  ) : null}
                </button>
                <span className="listening-letter-match__qnum">{question.number}</span>
              </div>
            )
          })}
        </div>
      </ExamHighlightZone>
    </>
  )
}