import { ArrowRight, Pencil } from 'lucide-react'
import type { CambridgeWritingTest } from '@ryan/catalog'
import type { CambridgeWritingMergedOrigin } from './cambridgeWritingTestRepo'

interface Props {
  test: CambridgeWritingTest
  onOpen?: () => void
  onEdit?: () => void
  adminMode?: boolean
  interactive?: boolean
  origin?: CambridgeWritingMergedOrigin
  editable?: boolean
  preview?: boolean
}

export default function CambridgeWritingTestCard({
  test,
  onOpen,
  onEdit,
  adminMode = false,
  interactive = true,
  origin,
  editable = false,
  preview = false,
}: Props) {
  const genres = Array.from(new Set(test.tasks.map(task => task.genre)))
  const rootClassName = interactive ? 'cb-card cb-card--interactive' : 'cb-card cb-card--preview'

  return (
    <article className={rootClassName}>
      <button
        type="button"
        className="cb-card-main"
        onClick={onOpen}
        disabled={!interactive}
      >
        <div className="cb-card-top">
          <span className="cb-card-badge">Test {String(test.testNumber).padStart(2, '0')}</span>
          <span className="cb-card-count">{test.tasks.length} tasks</span>
        </div>
        <h2 className="cb-card-title">{test.title}</h2>
        <p className="cb-card-desc">{genres.join(' · ')}</p>
        {adminMode && test.status === 'draft' ? (
          <p className="cb-card-desc" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Nháp</p>
        ) : null}
        {adminMode && origin ? (
          <p className="cb-card-desc" style={{ color: 'var(--text-muted)' }}>
            {origin === 'admin_local' ? 'Local draft' : origin === 'published_sync' ? 'Published sync' : 'Seed'}
          </p>
        ) : null}
        <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
          {preview ? 'Card preview' : 'Open test'}
          {!preview ? <ArrowRight size={14} /> : null}
        </span>
      </button>

      {adminMode && editable && onEdit ? (
        <div className="cb-card-actions">
          <button type="button" className="cb-card-edit" onClick={onEdit}>
            <Pencil size={14} />
            Chỉnh sửa
          </button>
        </div>
      ) : null}
    </article>
  )
}
