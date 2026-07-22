import { useCallback, useState, type ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'
import { matchingPersonName } from './listeningKetPartLayout'
import { sharedMatchingOptions } from './listeningMultiPartLayout'

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
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null)

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

  const clearSlot = useCallback((questionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onAnswer(questionId, '')
    onSelectQuestion(questionId)
  }, [onAnswer, onSelectQuestion])

  const [leadInstruction = '', ...restInstruction] = (part.instruction ?? '').split(/\n+/)
  const instruction = restInstruction
    .filter(line => !/^Food\s*:/i.test(line.trim()))
    .join('\n')
    .trim()

  return (
    <>
      <ExamHighlightZone className="listening-ket-cambridge__stage listening-ket-match">
        <div className="listening-ket-cambridge__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {leadInstruction && <span>{leadInstruction}</span>}
          {instruction && (
            <ExamHighlightableLines
              blockIdPrefix={`${part.id}-instruction`}
              text={instruction}
              lineClassName="listening-ket-match__instruction"
            />
          )}
        </div>

        <div className="listening-ket-match__grid">
          <section className="listening-ket-match__people" aria-label="People">
            <h2>People</h2>
            <div className="listening-ket-match__rows">
              {questions.map(question => {
                const isActive = activeQuestionId === question.id
                const answerId = answers[question.id] ?? ''
                const answerOpt = options.find(o => o.id === answerId)
                const name = matchingPersonName(question.prompt)
                const isDropTarget = dragOverQuestionId === question.id
                return (
                  <div
                    key={question.id}
                    className={`listening-ket-match__row${isActive ? ' is-active' : ''}`}
                  >
                    <ReadingHighlightableText
                      blockId={`${question.id}-name`}
                      text={name}
                      highlights={highlights}
                      className="listening-ket-match__name"
                      as="span"
                    />
                    <button
                      type="button"
                      className={`listening-ket-match__slot${answerOpt ? ' is-filled' : ''}${isDropTarget ? ' is-over' : ''}`}
                      aria-label={`Answer ${question.number} for ${name}`}
                      data-highlight-skip
                      onClick={() => {
                        if (pickedOptionId) {
                          assignOption(question.id, pickedOptionId)
                          return
                        }
                        onSelectQuestion(question.id)
                      }}
                      onDragEnter={e => {
                        e.preventDefault()
                        setDragOverQuestionId(question.id)
                      }}
                      onDragOver={e => e.preventDefault()}
                      onDragLeave={() => setDragOverQuestionId(null)}
                      onDrop={e => {
                        e.preventDefault()
                        setDragOverQuestionId(null)
                        const optionId = e.dataTransfer.getData('text/plain')
                        if (optionId) assignOption(question.id, optionId)
                      }}
                    >
                      {answerOpt ? (
                        <>
                          <span className="listening-ket-match__slot-label">{answerOpt.label}</span>
                          <span
                            className="listening-ket-match__slot-clear"
                            role="button"
                            tabIndex={0}
                            aria-label="Clear answer"
                            onClick={e => clearSlot(question.id, e)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                clearSlot(question.id, e as unknown as React.MouseEvent)
                              }
                            }}
                          >
                            x
                          </span>
                        </>
                      ) : (
                        <span className="listening-ket-match__slot-number">{question.number}</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="listening-ket-match__food" aria-label="Food">
            <h2>Food</h2>
            {pickedOptionId && (
              <p className="listening-ket-match__pick-hint">
                Selected {options.find(o => o.id === pickedOptionId)?.label ?? pickedOptionId}. Click a blank.
              </p>
            )}
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
                      setPickedOptionId(prev => (prev === option.id ? null : option.id))
                    }}
                    role="button"
                    tabIndex={isUsed ? -1 : 0}
                    aria-disabled={isUsed}
                    onKeyDown={e => {
                      if (isUsed) return
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setPickedOptionId(prev => (prev === option.id ? null : option.id))
                      }
                    }}
                  >
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
          </section>
        </div>

        <div className="listening-ket-cambridge__audio">
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </ExamHighlightZone>
      {resizer}
    </>
  )
}
