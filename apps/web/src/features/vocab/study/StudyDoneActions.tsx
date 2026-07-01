import { RotateCcw } from 'lucide-react'

interface Props {
  onDone: () => void
  onRestart: () => void
  doneLabel?: string
}

export default function StudyDoneActions({
  onDone,
  onRestart,
  doneLabel = 'Quay lại',
}: Props) {
  return (
    <div className="vs-done-actions">
      <button type="button" className="vs-btn-secondary vs-done-restart" onClick={onRestart}>
        <RotateCcw size={14} />
        Học lại
      </button>
      <button type="button" className="vs-btn-primary" onClick={onDone}>
        {doneLabel}
      </button>
    </div>
  )
}