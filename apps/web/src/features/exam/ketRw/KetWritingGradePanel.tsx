/**
 * @deprecated Dùng CambridgeRwWritingGradePanel.
 * Wrapper tương thích: mặc định level A2.
 */
import type { ReadingPart, ReadingQuestion } from '../examData'
import CambridgeRwWritingGradePanel from '../CambridgeRwWritingGradePanel'

interface Props {
  part: ReadingPart
  question: ReadingQuestion
  userAnswer: string
}

export default function KetWritingGradePanel({ part, question, userAnswer }: Props) {
  return (
    <CambridgeRwWritingGradePanel
      exam={{
        id: 'ket-legacy',
        title: 'Cambridge A2',
        durationMinutes: 60,
        bandHint: 'A2',
        parts: [],
        cambridgeLevel: 'a2',
        examTrack: 'cambridge',
      }}
      part={part}
      question={question}
      userAnswer={userAnswer}
    />
  )
}
