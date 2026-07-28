import { useCallback, useState, type MouseEvent, type ReactNode } from 'react'
import { Bookmark } from 'lucide-react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import { dualMatchingTaskGroups } from './listeningMultiPartLayout'
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

interface TaskColumnProps {
  partId: string
  taskKey: 'one' | 'two'
  title: string
  instruction?: string
  questions: ListeningQuestion[]
  answers: Record<string, string>
  activeQuestionId: string | null
  pickedOptionId: string | null
  onPickOption: (optionId: string | null) => void
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

function TaskColumn({
  partId,
  taskKey,
  title,
  instruction,
  questions,
  answers,
  activeQuestionId,
  pickedOptionId,
  onPickOption,
  onAnswer,
  onSelectQuestion,
}: TaskColumnProps) {
  const highlights = useExamHighlights()
  const options = questions[0]?.options ?? []

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
    onPickOption(null)
    onSelectQuestion(questionId)
  }, [onAnswer, onPickOption, onSelectQuestion, usedByQuestion])

  const clearSlot = useCallback((questionId: string, e: MouseEvent) => {
    e.stopPropagation()
    onAnswer(questionId, '')
  }, [onAnswer])

  return (
    <div className="listening-dual-match__task">
      <h4 className="listening-dual-match__task-title">{title}</h4>
      {instruction && (
        <ExamHighlightableLines
          blockIdPrefix={`${partId}-task-${taskKey}`}
          text={instruction}
          lineClassName="listening-dual-match__task-instruction"
        />
      )}
      <div className="listening-dual-match__task-body">
        <div className="listening-letter-match__speakers">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const answerId = answers[question.id] ?? ''
            const selectedOption = answerId ? optionById(answerId) : null
            return (
              <div
                key={question.id}
                className={`listening-letter-match__speaker-row${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectQuestion(question.id)}
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
                  className={`listening-letter-match__slot${selectedOption ? ' is-filled' : ''}`}
                  aria-label={`Answer for question ${question.number}`}
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
                        className="listening-letter-match__slot-label"
                        as="span"
                      />
                      <span
                        className="listening-letter-match__slot-clear"
                        role="button"
                        tabIndex={0}
                        aria-label="Clear answer"
                        onClick={e => clearSlot(question.id, e)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            clearSlot(question.id, e as unknown as MouseEvent)
                          }
                        }}
                      >
                        x
                      </span>
                    </>
                  ) : (
                    <span className="listening-letter-match__slot-number">{question.number}</span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="listening-dual-match__bank">
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
                  onPickOption(isPicked ? null : option.id)
                }}
                role="button"
                tabIndex={isUsed ? -1 : 0}
                aria-disabled={isUsed}
                onKeyDown={e => {
                  if (isUsed) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onPickOption(isPicked ? null : option.id)
                  }
                }}
              >
                <ReadingHighlightableText
                  blockId={`${partId}-task-${taskKey}-opt-${option.id}`}
                  text={option.label}
                  highlights={highlights}
                  className="listening-letter-match__bank-label"
                  as="span"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ListeningDualLetterMatchingPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  onAnswer,
  onSelectQuestion,
  resizer,
}: Props) {
  const { taskOne, taskTwo } = dualMatchingTaskGroups(part, questions)
  const [pickedTask, setPickedTask] = useState<'one' | 'two' | null>(null)
  const [pickedOptionId, setPickedOptionId] = useState<string | null>(null)

  const handlePickOption = useCallback((task: 'one' | 'two', optionId: string | null) => {
    setPickedTask(optionId ? task : null)
    setPickedOptionId(optionId)
  }, [])

  return (
    <>
      <ExamHighlightZone className="listening-ket-cambridge__stage listening-fce listening-dual-match">
        <div className="listening-ket-cambridge__instruction-card listening-fce__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {part.instruction && (
            <ExamHighlightableLines
              blockIdPrefix={`${part.id}-instruction`}
              text={part.instruction}
              lineClassName="listening-fce__instruction-line"
            />
          )}
        </div>

        <div className="listening-fce__bookmark" aria-hidden="true">
          <Bookmark size={22} />
        </div>

        {pickedOptionId && pickedTask && (
          <p className="listening-letter-match__pick-hint">
            Selected {pickedOptionId} in Task {pickedTask === 'one' ? '1' : '2'}.
          </p>
        )}

        <div className="listening-dual-match__grid">
          <TaskColumn
            partId={part.id}
            taskKey="one"
            title="Task 1"
            instruction={part.taskOneInstruction}
            questions={taskOne}
            answers={answers}
            activeQuestionId={activeQuestionId}
            pickedOptionId={pickedTask === 'one' ? pickedOptionId : null}
            onPickOption={id => handlePickOption('one', id)}
            onAnswer={onAnswer}
            onSelectQuestion={onSelectQuestion}
          />
          <TaskColumn
            partId={part.id}
            taskKey="two"
            title="Task 2"
            instruction={part.taskTwoInstruction}
            questions={taskTwo}
            answers={answers}
            activeQuestionId={activeQuestionId}
            pickedOptionId={pickedTask === 'two' ? pickedOptionId : null}
            onPickOption={id => handlePickOption('two', id)}
            onAnswer={onAnswer}
            onSelectQuestion={onSelectQuestion}
          />
        </div>

        <div className="listening-ket-cambridge__audio listening-fce__audio">
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </ExamHighlightZone>
      {resizer}
    </>
  )
}
