import { useCallback, useState, type ReactNode } from 'react'
import { Bookmark } from 'lucide-react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
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

export default function ListeningFceMatchingPartView({
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

  const optionById = useCallback((optionId: string) => {
    return options.find(option => option.id === optionId) ?? null
  }, [options])

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

  return (
    <>
      <ExamHighlightZone className="listening-ket-cambridge__stage listening-fce listening-fce-match">
        <div className="listening-ket-cambridge__instruction-card listening-fce__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {part.instruction && (
            <ReadingHighlightableText
              blockId={`${part.id}-instruction`}
              text={part.instruction}
              highlights={highlights}
              as="span"
            />
          )}
        </div>

        <div className="listening-fce__bookmark" aria-hidden="true">
          <Bookmark size={22} />
        </div>

        <div className="listening-fce-match__grid">
          <div className="listening-fce-match__speakers">
            {questions.map(question => {
              const isActive = activeQuestionId === question.id
              const answerId = answers[question.id] ?? ''
              const selectedOption = optionById(answerId)
              return (
                <div
                  key={question.id}
                  className={`listening-fce-match__speaker-row${isActive ? ' is-active' : ''}`}
                  onClick={() => onSelectQuestion(question.id)}
                >
                  <ReadingHighlightableText
                    blockId={`${question.id}-speaker`}
                    text={question.prompt}
                    highlights={highlights}
                    className="listening-fce-match__speaker"
                    as="span"
                  />
                  <button
                    type="button"
                    className={`listening-fce-match__slot${answerId ? ' is-filled' : ''}`}
                    data-highlight-skip
                    onClick={e => {
                      e.stopPropagation()
                      if (pickedOptionId) {
                        assignOption(question.id, pickedOptionId)
                        return
                      }
                      onSelectQuestion(question.id)
                    }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault()
                      const optionId = e.dataTransfer.getData('text/plain')
                      if (optionId) assignOption(question.id, optionId)
                    }}
                  >
                    {selectedOption ? (
                      <>
                        <ReadingHighlightableText
                          blockId={`${question.id}-answer-${selectedOption.id}`}
                          text={selectedOption.label}
                          highlights={highlights}
                          as="span"
                        />
                        <span
                          className="listening-fce-match__clear"
                          role="button"
                          tabIndex={0}
                          aria-label="Clear answer"
                          onClick={e => {
                            e.stopPropagation()
                            onAnswer(question.id, '')
                          }}
                        >
                          x
                        </span>
                      </>
                    ) : (
                      <span>{question.number}</span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="listening-fce-match__bank">
            {options.map(option => {
              const isUsed = Boolean(usedByQuestion(option.id))
              const isPicked = pickedOptionId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`listening-fce-match__option${isUsed ? ' is-used' : ''}${isPicked ? ' is-picked' : ''}`}
                  draggable={!isUsed}
                  disabled={isUsed}
                  onClick={() => setPickedOptionId(prev => prev === option.id ? null : option.id)}
                  onDragStart={e => {
                    if (isUsed) return
                    e.dataTransfer.setData('text/plain', option.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                >
                  <ReadingHighlightableText
                    blockId={`${part.id}-opt-${option.id}`}
                    text={option.label}
                    highlights={highlights}
                    as="span"
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="listening-ket-cambridge__audio listening-fce__audio">
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </ExamHighlightZone>
      {resizer}
    </>
  )
}
