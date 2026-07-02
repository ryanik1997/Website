import ListeningExamAudioBar from './ListeningExamAudioBar'
import ListeningPictureBoard from './ListeningPictureBoard'
import ExamHighlightZone from './ExamHighlightZone'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import type { ExamAudioSource } from './useExamQuestionAudio'
import { usesCompositePictureBoard } from './listeningPictureMc'
import { listeningPromptAnchorId } from './listeningScrollUtils'
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
  const highlights = useExamHighlights()

  return (
    <ExamHighlightZone className="listening-exam-prompt-pane" id={listeningPromptAnchorId(question.id)}>
      {partLabel && (
        <p className="listening-exam-prompt-pane__part">{partLabel}</p>
      )}
      <h2 className="listening-exam-prompt-pane__qnum">Question {question.number}</h2>
      {partInstruction && (
        <ReadingHighlightableText
          blockId={`${question.id}-instruction`}
          text={partInstruction}
          highlights={highlights}
          className="listening-exam-prompt-pane__instruction"
          as="p"
        />
      )}
      <ReadingHighlightableText
        blockId={`${question.id}-prompt`}
        text={question.prompt}
        highlights={highlights}
        className="listening-exam-prompt-pane__prompt"
        as="p"
      />
      {usesCompositePictureBoard(question) && (
        <ListeningPictureBoard question={question} />
      )}
      <ListeningExamAudioBar {...audioBar} />
    </ExamHighlightZone>
  )
}