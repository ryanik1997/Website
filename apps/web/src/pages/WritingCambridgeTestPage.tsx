import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getCambridgeRouteLevel, getCambridgeRouteTest } from '../features/writing/cambridgeWritingRouteCatalog'
import '../features/writing/cambridgeHub.css'

export default function WritingCambridgeTestPage() {
  const { level: levelParam, testId } = useParams<{ level: string; testId: string }>()
  const navigate = useNavigate()
  const level = getCambridgeRouteLevel(levelParam)
  const test = level && testId ? getCambridgeRouteTest(level.level, testId) : null

  if (!level || !test) return <Navigate to="/app/writing/cambridge" replace />

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing/cambridge">Cambridge</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <Link to={`/app/writing/cambridge/${level.level}`}>{level.displayName}</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">{test.title}</span>
        </nav>

        <button type="button" className="exam-hub-back" onClick={() => navigate(`/app/writing/cambridge/${level.level}`)}>
          <ArrowLeft size={14} />
          {level.displayName} library
        </button>

        <h1 className="cb-title">{test.title}</h1>
        <p className="cb-sub">Keep the real Part/Task structure.</p>

        <div className="cb-grid" style={{ marginTop: '1.2rem' }}>
          {test.tasks.map(task => (
            <button
              key={task.id}
              type="button"
              className="cb-card"
              onClick={() => navigate(`/app/writing/cambridge/${level.level}/${test.id}/${task.id}`)}
            >
              <div className="cb-card-top">
                <span className="cb-card-badge">Part {task.partNumber}</span>
                <span className="cb-card-count">{task.wordLimit?.displayText ?? 'Open'}</span>
              </div>
              <h2 className="cb-card-title">{task.title}</h2>
              <p className="cb-card-desc">{task.genre} · {task.metadata?.compulsory ? 'Compulsory' : 'Choose one'}</p>
              <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
                Start writing
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
