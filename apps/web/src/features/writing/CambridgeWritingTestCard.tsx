import { ArrowRight, Pencil } from 'lucide-react'
import type { CambridgeWritingTest } from '@ryan/catalog'
import type { CambridgeWritingMergedOrigin } from './cambridgeWritingTestRepo'
import { CAMBRIDGE_WRITING_COPY } from './cambridgeWritingCopy'

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
          <p className="cb-card-desc" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            {CAMBRIDGE_WRITING_COPY.draft}
          </p>
        ) : null}
        {adminMode && origin ? (
          <p className="cb-card-desc" style={{ color: 'var(--text-muted)' }}>
            {origin === 'admin_local'
              ? CAMBRIDGE_WRITING_COPY.localDraft
              : origin === 'published_sync'
                ? CAMBRIDGE_WRITING_COPY.publishedSync
                : CAMBRIDGE_WRITING_COPY.seed}
          </p>
        ) : null}
        <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
          {preview ? CAMBRIDGE_WRITING_COPY.cardPreview : CAMBRIDGE_WRITING_COPY.openTest}
          {!preview ? <ArrowRight size={14} /> : null}
        </span>
      </button>

      {adminMode && editable && onEdit ? (
        <div className="cb-card-actions">
          <button type="button" className="cb-card-edit" onClick={onEdit}>
            <Pencil size={14} />
            {CAMBRIDGE_WRITING_COPY.editDraft}
          </button>
        </div>
      ) : null}
    </article>
  )
}
