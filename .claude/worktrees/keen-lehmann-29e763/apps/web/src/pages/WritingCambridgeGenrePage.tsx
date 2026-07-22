import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight } from 'lucide-react'
import { db } from '@ryan/db'
import {
  docMatchesGenre,
  genresForLevel,
  getLevel,
  type CambridgeGenre,
  type CambridgeLevelSlug,
} from '../features/writing/cambridgeCatalog'
import '../features/writing/cambridgeHub.css'

/** Bước 2: Chọn loại bài trong một cấp độ (email, story, …) */
export default function WritingCambridgeGenrePage() {
  const { level: levelSlug } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const level = getLevel(levelSlug)

  const counts = useLiveQuery(async () => {
    if (!level) return new Map<CambridgeGenre, number>()
    const all = await db.writingDocs.where('type').equals(level.type).toArray()
    const map = new Map<CambridgeGenre, number>()
    for (const g of genresForLevel(level.slug)) {
      map.set(g.id, all.filter(d => docMatchesGenre(d, g.id)).length)
    }
    return map
  }, [level?.type, level?.slug])

  if (!level) {
    return <Navigate to="/app/writing/cambridge" replace />
  }

  const genres = genresForLevel(level.slug as CambridgeLevelSlug)

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing">Thư viện Writing</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <Link to="/app/writing/cambridge">Cambridge</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">{level.label}</span>
        </nav>

        <h1 className="cb-title">{level.label} — {level.exam}</h1>
        <p className="cb-sub">
          Chọn loại bài bạn muốn luyện. Chỉ hiện các đề thuộc {level.label} và đúng thể loại.
        </p>

        <div className="cb-grid">
          {genres.map(genre => (
            <button
              key={genre.id}
              type="button"
              className="cb-card"
              onClick={() => navigate(`/app/writing/cambridge/${level.slug}/${genre.id}`)}
            >
              <div className="cb-card-top">
                <span className="cb-card-icon" aria-hidden>{genre.icon}</span>
                <span className="cb-card-count">{counts?.get(genre.id) ?? 0} bài</span>
              </div>
              <h2 className="cb-card-title">{genre.labelVi}</h2>
              <p className="cb-card-desc">{genre.desc}</p>
              <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
                Vào luyện viết
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}