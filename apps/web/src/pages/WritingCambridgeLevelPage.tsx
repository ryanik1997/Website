import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Search } from 'lucide-react'
import { getCambridgeRouteLevel } from '../features/writing/cambridgeWritingRouteCatalog'
import { useCambridgeWritingCollection } from '../features/writing/useCambridgeWritingTests'
import CambridgeWritingTestCard from '../features/writing/CambridgeWritingTestCard'
import { useIsAdmin } from '../features/auth/useIsAdmin'
import '../features/writing/cambridgeHub.css'

export default function WritingCambridgeLevelPage() {
  const { level: levelParam } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const level = getCambridgeRouteLevel(levelParam)
  const [query, setQuery] = useState('')
  const isAdmin = useIsAdmin()

  if (!level) return <Navigate to="/app/writing/cambridge" replace />

  const collection = useCambridgeWritingCollection(level.level)
  const visibleTests = useMemo(() => {
    const tests = collection?.tests ?? []
    const q = query.trim().toLowerCase()
    if (!q) return tests
    return tests.filter((test) => {
      const searchable = [
        test.title,
        String(test.testNumber),
        ...test.tasks.flatMap(task => [task.title, task.genre, task.instruction]),
      ].join(' ')
      return searchable.toLowerCase().includes(q)
    })
  }, [collection?.tests, query])

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

        <h1 className="cb-title">{level.displayName} Writing</h1>
        <p className="cb-sub">
          {collection ? `${collection.testCount} test, ${collection.taskCount} task.` : 'Loading library...'}
        </p>

        {collection?.errors.length ? (
          <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <AlertTriangle size={16} />
              {isAdmin === true ? 'Some Writing records are invalid.' : 'Writing content is being updated.'}
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
            placeholder="Find a test or genre..."
          />
        </label>

        <div className="cb-grid" style={{ marginTop: '1.2rem' }}>
          {!collection ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading Writing library...</div>
          ) : visibleTests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>
              {query.trim()
                ? 'No Writing test matches your search.'
                : isAdmin === true
                  ? 'Chưa có đề Writing nào cho cấp độ này.'
                  : 'Nội dung đang được cập nhật.'}
            </div>
          ) : visibleTests.map(test => (
            <CambridgeWritingTestCard
              key={test.id}
              test={test}
              onOpen={() => navigate(`/app/writing/cambridge/${level.level}/${test.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
