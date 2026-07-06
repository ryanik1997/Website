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
  const [leadInstruction = '', ...restInstruction] = (part.instruction ?? '').split(/\n+/)
  const bodyInstruction = restInstruction.join('\n').trim()

  return (
    <>
      <ExamHighlightZone className="listening-ket-cambridge__stage listening-pet-gapfill">
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
          {leadInstruction && part.audioIntro && <span>{leadInstruction}</span>}
        </div>

        {bodyInstruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={bodyInstruction}
            lineClassName="listening-pet-gapfill__instruction"
          />
        )}

        {part.passageTitle && (
          <ReadingHighlightableText
            blockId={`${part.id}-title`}
            text={part.passageTitle}
            highlights={highlights}
            className="listening-pet-gapfill__passage-title"
            as="h2"
          />
        )}

        <div className="listening-pet-gapfill__fields">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const lead = question.gapLead || question.prompt
            const trail = question.gapTrail ?? ''
            return (
              <div
                key={question.id}
                className={`listening-pet-gapfill__field${isActive ? ' is-active' : ''}`}
              >
                <label
                  className="listening-pet-gapfill__label"
                  htmlFor={`pet-gap-${question.id}`}
                  onClick={() => onSelectQuestion(question.id)}
                >
                  <ReadingHighlightableText
                    blockId={`${question.id}-lead`}
                    text={lead}
                    highlights={highlights}
                    className="listening-pet-gapfill__prompt-text"
                    as="span"
                  />
                  <input
                    id={`pet-gap-${question.id}`}
                    type="text"
                    className="listening-pet-gapfill__input"
                    value={answers[question.id] ?? ''}
                    placeholder={`${question.number}`}
                    data-highlight-skip
                    onFocus={() => onSelectQuestion(question.id)}
                    onChange={e => onAnswer(question.id, e.target.value)}
                  />
                  {trail && (
                    <ReadingHighlightableText
                      blockId={`${question.id}-trail`}
                      text={trail}
                      highlights={highlights}
                      className="listening-pet-gapfill__trail"
                      as="span"
                    />
                  )}
                </label>
              </div>
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
