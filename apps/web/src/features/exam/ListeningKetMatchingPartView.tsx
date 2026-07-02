import { useCallback, useState, type ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'
import { matchingPersonName, sharedMatchingOptions } from './listeningKetPartLayout'

interface AudioBarProps {
  source: ExamAudioSource
  playing: boolean
  buffering: boolean
  progressPct: number
  timeLabel: string
  hasAudioFile: boolean
  allowSeek: boolean
  allowSlow: boolean
  playsLeft?: number | null
  playBlocked: boolean
  playError?: string | null
  onPlayNormal: () => void
  onPlaySlow: () => void
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

export default function ListeningKetMatchingPartView({
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
      <ExamHighlightZone className="listening-exam-prompt-pane listening-ket-match__prompt">
        <p className="listening-exam-prompt-pane__part">
          Part {part.partNumber} · {part.rangeLabel}
        </p>
        {part.instruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={part.instruction}
            lineClassName="listening-ket-match__instruction"
          />
        )}
        <ListeningExamAudioBar {...audioBar} />
        <div className="listening-ket-match__rows">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const answerId = answers[question.id] ?? ''
            const answerOpt = options.find(o => o.id === answerId)
            const name = matchingPersonName(question.prompt)
            return (
              <div
                key={question.id}
                className={`listening-ket-match__row${isActive ? ' is-active' : ''}`}
              >
                <span className="listening-ket-match__num">{question.number}</span>
                <ReadingHighlightableText
                  blockId={`${question.id}-name`}
                  text={name}
                  highlights={highlights}
                  className="listening-ket-match__name"
                  as="span"
                />
                <button
                  type="button"
                  className={`listening-ket-match__slot${answerOpt ? ' is-filled' : ''}`}
                  aria-label={`Ô đáp án câu ${question.number} — ${name}`}
                  data-highlight-skip
                  onClick={() => handleSlotClick(question.id)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    handleDrop(question.id, e.dataTransfer.getData('text/plain'))
                  }}
                >
                  {answerOpt ? (
                    <>
                      <span className="listening-ket-match__slot-letter">{answerOpt.id}</span>
                      <span className="listening-ket-match__slot-label">{answerOpt.label}</span>
                      <span
                        className="listening-ket-match__slot-clear"
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
              </div>
            )
          })}
        </div>
      </ExamHighlightZone>

      {resizer}

      <ExamHighlightZone className="listening-exam-answer-pane listening-ket-match__bank">
        <header className="listening-exam-answer-pane__head">
          <h3 className="listening-exam-answer-pane__title">Kéo thả đáp án</h3>
          {pickedOptionId && (
            <p className="listening-ket-match__pick-hint">
              Đã chọn {pickedOptionId} — bấm vào ô vuông bên trái
            </p>
          )}
        </header>
        <div className="listening-ket-match__options">
          {options.map(option => {
            const ownerId = usedByQuestion(option.id)
            const isUsed = Boolean(ownerId)
            const isPicked = pickedOptionId === option.id
            return (
              <div
                key={option.id}
                className={`listening-ket-match__option${isUsed ? ' is-used' : ''}${isPicked ? ' is-picked' : ''}`}
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
                <span className="listening-ket-match__option-letter">{option.id}</span>
                <ReadingHighlightableText
                  blockId={`${part.id}-opt-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  className="listening-ket-match__option-label"
                  as="span"
                />
              </div>
            )
          })}
        </div>
      </ExamHighlightZone>
    </>
  )
}