import ListeningExamAudioBar from './ListeningExamAudioBar'
import type { ExamAudioSource } from './useExamQuestionAudio'
import type { ListeningQuestion } from './listeningExamData'

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
  onPlayNormal: () => void
  onPlaySlow: () => void
  onSeek: (pct: number) => void
  onStop: () => void
}

interface Props {
  question: ListeningQuestion
  partInstruction?: string
  partLabel?: string
  audioBar: AudioBarProps
}

export default function ListeningQuestionPromptPanel({
  question,
  partInstruction,
  partLabel,
  audioBar,
}: Props) {
  return (
    <div className="listening-exam-prompt-pane">
      {partLabel && (
        <p className="listening-exam-prompt-pane__part">{partLabel}</p>
      )}
      <h2 className="listening-exam-prompt-pane__qnum">Question {question.number}</h2>
      {partInstruction && (
        <p className="listening-exam-prompt-pane__instruction">{partInstruction}</p>
      )}
      <p className="listening-exam-prompt-pane__prompt">{question.prompt}</p>
      <ListeningExamAudioBar {...audioBar} />
    </div>
  )
}