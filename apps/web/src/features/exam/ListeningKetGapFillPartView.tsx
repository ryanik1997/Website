import type { ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
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

function splitGapPrompt(prompt: string): { lead: string; trail: string } {
  const [lead = prompt, ...trail] = prompt.split(/(?:\.\.\.|…|â€¦)/)
  return {
    lead: lead.trim(),
    trail: trail.join(' ').trim(),
  }
}

export default function ListeningKetGapFillPartView({
  part,
  questions,
  answers,
  activeQuestionId,
  audioBar,
  onAnswer,
  onSelectQuestion,
  resizer,
}: Props) {
  const [leadInstruction = '', ...restInstruction] = (part.instruction ?? '').split(/\n+/)
  const questionPromptKeys = new Set(
    questions.map(question => question.prompt.trim().toLowerCase()),
  )
  const bodyInstruction = restInstruction
    .map(line => line.trim())
    .filter(line => line && !questionPromptKeys.has(line.toLowerCase()))
    .join('\n')
    .trim()

  return (
    <>
      <ExamHighlightZone className="listening-ket-cambridge__stage listening-ket-gapfill__prompt">
        <div className="listening-ket-cambridge__instruction-card">
          <strong>{part.rangeLabel}</strong>
          {leadInstruction && <span>{leadInstruction}</span>}
        </div>

        {bodyInstruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={bodyInstruction}
            lineClassName="listening-ket-gapfill__instruction"
          />
        )}

        <div className="listening-ket-gapfill__fields">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const { lead, trail } = splitGapPrompt(question.prompt)
            return (
              <div
                key={question.id}
                className={`listening-ket-gapfill__field${isActive ? ' is-active' : ''}`}
              >
                <label
                  className="listening-ket-gapfill__label"
                  htmlFor={`ket-gap-${question.id}`}
                  onClick={() => onSelectQuestion(question.id)}
                >
                  <span className="listening-ket-gapfill__prompt-text">{lead}</span>
                  <input
                    id={`ket-gap-${question.id}`}
                    type="text"
                    className="listening-ket-gapfill__input"
                    value={answers[question.id] ?? ''}
                    placeholder={`${question.number}`}
                    data-highlight-skip
                    onFocus={() => onSelectQuestion(question.id)}
                    onChange={e => onAnswer(question.id, e.target.value)}
                  />
                  {trail && <span className="listening-ket-gapfill__trail">{trail}</span>}
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
