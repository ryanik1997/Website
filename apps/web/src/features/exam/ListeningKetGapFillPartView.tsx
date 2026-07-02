import type { ReactNode } from 'react'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ExamHighlightZone from './ExamHighlightZone'
import ExamHighlightableLines from './ExamHighlightableLines'
import { injectKetGapFillQuestionMarkers } from './examCompletion'
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
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
  resizer: ReactNode
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
  const markedInstruction = part.instruction
    ? injectKetGapFillQuestionMarkers(part.instruction, questions)
    : ''

  return (
    <>
      <ExamHighlightZone className="listening-exam-prompt-pane listening-ket-gapfill__prompt">
        <p className="listening-exam-prompt-pane__part">
          Part {part.partNumber} · {part.rangeLabel}
        </p>
        {markedInstruction && (
          <ExamHighlightableLines
            blockIdPrefix={`${part.id}-instruction`}
            text={markedInstruction}
            lineClassName="listening-ket-gapfill__instruction"
          />
        )}
        <ListeningExamAudioBar {...audioBar} />
      </ExamHighlightZone>

      {resizer}

      <ExamHighlightZone className="listening-exam-answer-pane listening-ket-gapfill__answers">
        <header className="listening-exam-answer-pane__head">
          <h3 className="listening-exam-answer-pane__title">Điền vào chỗ trống</h3>
        </header>
        <div className="listening-ket-gapfill__fields">
          {questions.map(question => {
            const isActive = activeQuestionId === question.id
            const wordLimit = question.wordLimit ?? 3
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
                  <span className="listening-ket-gapfill__num">{question.number}</span>
                  <input
                    id={`ket-gap-${question.id}`}
                    type="text"
                    className="listening-ket-gapfill__input"
                    value={answers[question.id] ?? ''}
                    placeholder={wordLimit ? `Tối đa ${wordLimit} từ` : 'Nhập đáp án'}
                    data-highlight-skip
                    onFocus={() => onSelectQuestion(question.id)}
                    onChange={e => onAnswer(question.id, e.target.value)}
                  />
                </label>
              </div>
            )
          })}
        </div>
      </ExamHighlightZone>
    </>
  )
}