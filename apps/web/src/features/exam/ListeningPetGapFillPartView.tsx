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

export default function ListeningPetGapFillPartView({
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

  return (
    <>
      <ExamHighlightZone className="listening-exam-prompt-pane listening-pet-gapfill__prompt">
        <p className="listening-exam-prompt-pane__part">
          Part {part.partNumber} · {part.rangeLabel}
        </p>
        {part.instruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={part.instruction}
            lineClassName="listening-pet-gapfill__instruction"
          />
        )}
        {part.audioIntro && (
          <ReadingHighlightableText
            blockId={`${part.id}-intro`}
            text={part.audioIntro}
            highlights={highlights}
            className="listening-pet-gapfill__intro"
            as="p"
          />
        )}
        <ListeningExamAudioBar {...audioBar} />
      </ExamHighlightZone>

      {resizer}

      <ExamHighlightZone className="listening-exam-answer-pane listening-pet-gapfill__answers">
        {part.passageTitle && (
          <ReadingHighlightableText
            blockId={`${part.id}-title`}
            text={part.passageTitle}
            highlights={highlights}
            className="listening-pet-gapfill__passage-title"
            as="h3"
          />
        )}
        <div className="listening-pet-gapfill__box">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const wordLimit = question.wordLimit ?? 2
            const hasInline = Boolean(question.gapLead || question.gapTrail)
            return (
              <div
                key={question.id}
                className={`listening-pet-gapfill__row${isActive ? ' is-active' : ''}`}
              >
                {hasInline ? (
                  <label className="listening-pet-gapfill__sentence" htmlFor={`pet-gap-${question.id}`}>
                    <span className="listening-pet-gapfill__num">({question.number})</span>
                    {question.gapLead && (
                      <ReadingHighlightableText
                        blockId={`${question.id}-lead`}
                        text={`${question.gapLead} `}
                        highlights={highlights}
                        as="span"
                      />
                    )}
                    <input
                      id={`pet-gap-${question.id}`}
                      type="text"
                      className="listening-pet-gapfill__input"
                      value={answers[question.id] ?? ''}
                      placeholder={`${wordLimit} từ`}
                      data-highlight-skip
                      onChange={e => onAnswer(question.id, e.target.value)}
                      onFocus={() => onSelectQuestion(question.id)}
                    />
                    {question.gapTrail && (
                      <ReadingHighlightableText
                        blockId={`${question.id}-trail`}
                        text={` ${question.gapTrail}`}
                        highlights={highlights}
                        as="span"
                      />
                    )}
                  </label>
                ) : (
                  <label className="listening-pet-gapfill__field" htmlFor={`pet-gap-${question.id}`}>
                    <span className="listening-pet-gapfill__num">{question.number}</span>
                    <ReadingHighlightableText
                      blockId={`${question.id}-prompt`}
                      text={question.prompt}
                      highlights={highlights}
                      className="listening-pet-gapfill__prompt"
                      as="span"
                    />
                    <input
                      id={`pet-gap-${question.id}`}
                      type="text"
                      className="listening-pet-gapfill__input"
                      value={answers[question.id] ?? ''}
                      placeholder={`Tối đa ${wordLimit} từ`}
                      data-highlight-skip
                      onChange={e => onAnswer(question.id, e.target.value)}
                      onFocus={() => onSelectQuestion(question.id)}
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>
      </ExamHighlightZone>
    </>
  )
}