import type { ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningPart, ListeningQuestion } from './listeningExamData'
import {
  isListeningKeyOption,
  ListeningOptionReviewMark,
  listeningOptionReviewStyle,
} from './listeningReviewUi'
import type { ExamReviewStatus } from './examReviewUtils'

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
  showContext: boolean
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  resizer: ReactNode
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
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
  reviewMode = false,
  reviewStatusMap,
}: Props) {
  const highlights = useExamHighlights()
  const [leadInstruction = '', ...restInstruction] = (part.instruction ?? '').split(/\n+/)
  const bodyInstruction = restInstruction.join('\n').trim()

  return (
    <>
      <ExamHighlightZone className={`listening-ket-cambridge__stage listening-pet-mc listening-pet-mc--part-${part.partNumber}`}>
        <div className="listening-ket-cambridge__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {part.audioIntro ? (
            <ReadingHighlightableText
              blockId={`${part.id}-intro`}
              text={part.audioIntro}
              highlights={highlights}
              as="span"
            />
          ) : leadInstruction ? (
            <span>{leadInstruction}</span>
          ) : null}
        </div>

        {bodyInstruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={bodyInstruction}
            lineClassName="listening-pet-mc__instruction"
          />
        )}

        <div className="listening-pet-mc__question-list">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const selectedAnswer = answers[question.id] ?? ''
            return (
              <section
                key={question.id}
                className={`listening-pet-mc__question${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectQuestion(question.id)}
              >
                <h2 className="listening-pet-mc__heading">
                  <span className="listening-pet-mc__num">{question.number}</span>
                  <span className="listening-pet-mc__heading-text">
                    {showContext && question.context && (
                      <ReadingHighlightableText
                        blockId={`${question.id}-context`}
                        text={question.context}
                        highlights={highlights}
                        className="listening-pet-mc__context"
                        as="span"
                      />
                    )}
                    <ReadingHighlightableText
                      blockId={`${question.id}-prompt`}
                      text={question.prompt}
                      highlights={highlights}
                      className="listening-pet-mc__prompt"
                      as="span"
                    />
                  </span>
                </h2>

                <div className="listening-pet-mc__options">
                  {question.options.map(option => {
                    const selected = selectedAnswer.toUpperCase() === option.id.toUpperCase()
                    const isKey = reviewMode && isListeningKeyOption(option.id, question.answer)
                    const status = reviewMode ? (reviewStatusMap?.[question.id] ?? null) : null
                    const selectedWrong = Boolean(selected && status === 'wrong')
                    return (
                      <label
                        key={option.id}
                        style={listeningOptionReviewStyle(reviewMode, selected, isKey, status)}
                        className={`listening-pet-mc__option${selected ? ' is-selected' : ''}${isKey ? ' is-review-key' : ''}`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          checked={selected}
                          disabled={reviewMode}
                          data-highlight-skip
                          onFocus={() => onSelectQuestion(question.id)}
                          onChange={() => { if (!reviewMode) onAnswer(question.id, option.id) }}
                        />
                        <ReadingHighlightableText
                          blockId={`${question.id}-opt-${option.id}`}
                          text={option.label}
                          highlights={highlights}
                          as="span"
                        />
                        <ListeningOptionReviewMark isKey={isKey} selectedWrong={selectedWrong} />
                      </label>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        <div className="listening-ket-cambridge__audio">
          <ListeningExamAudioBar {...audioBar} />
        </div>
      </ExamHighlightZone>
      {resizer}
    </>
  )
}
