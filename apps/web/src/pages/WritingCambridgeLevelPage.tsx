import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Search } from 'lucide-react'
import { useIsAdmin } from '../features/auth/useIsAdmin'
import CambridgeWritingCreateButton from '../features/writing/admin/CambridgeWritingCreateButton'
import CambridgeWritingTestEditorDialog from '../features/writing/admin/CambridgeWritingTestEditorDialog'
import CambridgeWritingTestCard from '../features/writing/CambridgeWritingTestCard'
import { CAMBRIDGE_WRITING_COPY } from '../features/writing/cambridgeWritingCopy'
import { getCambridgeRouteLevel } from '../features/writing/cambridgeWritingRouteCatalog'
import { useCambridgeWritingCollection } from '../features/writing/useCambridgeWritingTests'
import '../features/writing/admin/cambridgeWritingAdmin.css'
import '../features/writing/cambridgeHub.css'

export default function WritingCambridgeLevelPage() {
  const { level: levelParam } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const level = getCambridgeRouteLevel(levelParam)
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const isAdmin = useIsAdmin()

  if (!level) return <Navigate to="/app/writing/cambridge" replace />

  const collection = useCambridgeWritingCollection(level.level)
  const visibleItems = useMemo(() => {
    const items = collection?.items ?? []
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(({ test }) => {
      const searchable = [
        test.title,
        String(test.testNumber),
        ...test.tasks.flatMap(task => [task.title, task.genre, task.instruction]),
      ].join(' ')
      return searchable.toLowerCase().includes(q)
    })
  }, [collection?.items, query])

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing/cambridge">Cambridge</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">{level.displayName}</span>
        </nav>

        <button type="button" className="exam-hub-back" onClick={() => navigate(level.trackPath)}>
          <ArrowLeft size={14} />
          {level.displayName}
        </button>

        <div className="cb-level-header">
          <div>
            <h1 className="cb-title">{level.displayName} Writing</h1>
            <p className="cb-sub">
              {collection
                ? `${collection.testCount} ${CAMBRIDGE_WRITING_COPY.testsLabel}, ${collection.taskCount} ${CAMBRIDGE_WRITING_COPY.tasksLabel}.`
                : CAMBRIDGE_WRITING_COPY.levelLoading}
            </p>
          </div>
          {isAdmin === true && collection ? (
            <CambridgeWritingCreateButton level={level.level} tests={collection.items} />
          ) : null}
        </div>

        {collection?.errors.length ? (
          <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <AlertTriangle size={16} />
              {isAdmin === true ? CAMBRIDGE_WRITING_COPY.levelInvalidRecordsAdmin : CAMBRIDGE_WRITING_COPY.levelUpdatingAdminHint}
            </div>
            {isAdmin === true ? (
              <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1rem', color: 'var(--text-muted)' }}>
                {collection.errors.map(error => <li key={error}>{error}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}

        <label className="ielts-library__search" style={{ marginTop: '1rem', display: 'inline-flex' }}>
          <Search size={14} className="ielts-library__search-icon" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={CAMBRIDGE_WRITING_COPY.levelSearchPlaceholder}
          />
        </label>

        <div className="cb-grid" style={{ marginTop: '1.2rem' }}>
          {!collection ? (
            <div style={{ color: 'var(--text-muted)' }}>{CAMBRIDGE_WRITING_COPY.levelLoading}</div>
          ) : visibleItems.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>
              {query.trim()
                ? CAMBRIDGE_WRITING_COPY.levelNoSearchResults
                : isAdmin === true
                  ? CAMBRIDGE_WRITING_COPY.levelNoTests
                  : CAMBRIDGE_WRITING_COPY.levelUpdating}
            </div>
          ) : visibleItems.map(item => (
            <CambridgeWritingTestCard
              key={item.test.id}
              test={item.test}
              adminMode={isAdmin === true}
              origin={item.origin}
              editable={item.editable}
              onOpen={() => navigate(`/app/writing/cambridge/${level.level}/${item.test.id}`)}
              onEdit={item.editable ? () => setEditingId(item.recordId) : undefined}
            />
          ))}
        </div>

        {isAdmin === true && editingId && collection ? (
          <CambridgeWritingTestEditorDialog
            open
            mode={{ type: 'edit', level: level.level, recordId: editingId }}
            existingTests={collection.items}
            onClose={() => setEditingId(null)}
          />
        ) : null}
      </div>
    </div>
  )
}
