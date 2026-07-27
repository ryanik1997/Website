import ScorePanel from '../ScorePanel'
import type { WritingDoc } from '@ryan/db'
import type { WritingRewrite, WritingScore } from '@ryan/core'

export default function CambridgeWritingFeedbackDrawer({
  open,
  onClose,
  score,
  docId,
  docType,
  isGrading,
  gradingError,
  onGrade,
}: {
  open: boolean
  onClose: () => void
  score: WritingScore | null
  docId: string
  docType: WritingDoc['type']
  isGrading: boolean
  gradingError: string | null
  onGrade: () => void
  rewrite?: WritingRewrite | null
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto border-l"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>AI Feedback</strong>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>Đóng</button>
        </div>
        {gradingError ? (
          <div className="mx-4 mt-4 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#f59e0b', color: 'var(--text-primary)' }}>
            {gradingError}
          </div>
        ) : null}
        <ScorePanel
          score={score}
          docId={docId}
          docType={docType}
          isGrading={isGrading}
          onGrade={onGrade}
          essayText=""
        />
      </aside>
    </div>
  )
}
