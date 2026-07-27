import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import {
  getCambridgeRouteCollection,
  getCambridgeRouteLevel,
  getCambridgeRouteManifest,
} from '../features/writing/cambridgeWritingRouteCatalog'
import '../features/writing/cambridgeHub.css'

export default function WritingCambridgeLevelPage() {
  const { level: levelParam } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const level = getCambridgeRouteLevel(levelParam)
  const [query, setQuery] = useState('')

  if (!level) return <Navigate to="/app/writing/cambridge" replace />

  const collection = getCambridgeRouteCollection(level.level)
  const manifest = getCambridgeRouteManifest(level.level)
  const visibleTests = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return collection.tests
    return collection.tests.filter((test) => {
      const genres = test.tasks.map(task => task.genre).join(' ')
      return `${test.title} ${genres}`.toLowerCase().includes(q)
    })
  }, [collection.tests, query])

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
          {manifest.testCount} test, {manifest.taskCount} task.
        </p>

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
          {visibleTests.map(test => {
            const genres = Array.from(new Set(test.tasks.map(task => task.genre)))
            return (
              <button
                key={test.id}
                type="button"
                className="cb-card"
                onClick={() => navigate(`/app/writing/cambridge/${level.level}/${test.id}`)}
              >
                <div className="cb-card-top">
                  <span className="cb-card-badge">Test {String(test.testNumber).padStart(2, '0')}</span>
                  <span className="cb-card-count">{test.tasks.length} tasks</span>
                </div>
                <h2 className="cb-card-title">{test.title}</h2>
                <p className="cb-card-desc">{genres.join(' · ')}</p>
                <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
                  Open test
                  <ArrowRight size={14} />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
