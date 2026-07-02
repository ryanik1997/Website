import type { ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
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
  showContext: boolean
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  resizer: ReactNode
}

export default function ListeningPetMcPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  showContext,
  onAnswer,
  onSelectQuestion,
  resizer,
}: Props) {
  const highlights = useExamHighlights()
  const activeQuestion = questions.find(q => q.id === activeQuestionId) ?? questions[0] ?? null

  return (
    <>
      <ExamHighlightZone className="listening-exam-prompt-pane listening-pet-mc__prompt">
        <p className="listening-exam-prompt-pane__part">
          Part {part.partNumber} · {part.rangeLabel}
        </p>
        {part.instruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={part.instruction}
            lineClassName="listening-pet-mc__instruction"
          />
        )}
        {part.audioIntro && (
          <ReadingHighlightableText
            blockId={`${part.id}-intro`}
            text={part.audioIntro}
            highlights={highlights}
            className="listening-pet-mc__intro"
            as="p"
          />
        )}
        <ListeningExamAudioBar {...audioBar} />
        <div className="listening-pet-mc__question-list">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            return (
              <div
                key={question.id}
                role="button"
                tabIndex={0}
                className={`listening-pet-mc__question${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectQuestion(question.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectQuestion(question.id)
                  }
                }}
              >
                <span className="listening-pet-mc__num">{question.number}</span>
                <div className="listening-pet-mc__text">
                  {showContext && question.context && (
                    <ReadingHighlightableText
                      blockId={`${question.id}-context`}
                      text={question.context}
                      highlights={highlights}
                      className="listening-pet-mc__context"
                      as="p"
                    />
                  )}
                  <ReadingHighlightableText
                    blockId={`${question.id}-prompt`}
                    text={question.prompt}
                    highlights={highlights}
                    className="listening-pet-mc__prompt"
                    as="p"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </ExamHighlightZone>

      {resizer}

      <ExamHighlightZone className="listening-exam-answer-pane listening-pet-mc__answers">
        <h3 className="listening-exam-answer-pane__title">Chọn đáp án</h3>
        {activeQuestion && (
          <div className="listening-ielts-mc__options">
            {activeQuestion.options.map(option => {
              const selected = answers[activeQuestion.id] === option.id
              return (
                <div
                  key={option.id}
                  role="button"
                  tabIndex={0}
                  className={`listening-ielts-mc__opt${selected ? ' is-selected' : ''}`}
                  onClick={() => onAnswer(activeQuestion.id, option.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onAnswer(activeQuestion.id, option.id)
                    }
                  }}
                >
                  <span className="listening-ielts-mc__letter">{option.id}</span>
                  <ReadingHighlightableText
                    blockId={`${activeQuestion.id}-opt-${option.id}`}
                    text={option.label}
                    highlights={highlights}
                    as="span"
                  />
                </div>
              )
            })}
          </div>
        )}
      </ExamHighlightZone>
    </>
  )
}