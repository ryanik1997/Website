import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight } from 'lucide-react'
import { db } from '@ryan/db'
import {
  docMatchesIeltsGenre,
  genresForTrack,
  getIeltsTrack,
  type IeltsGenre,
  type IeltsTrackSlug,
  typesForTrack,
} from '../features/writing/ieltsCatalog'
import '../features/writing/cambridgeHub.css'

/** Bước 2: Chọn loại đề IELTS trong từng Task */
export default function WritingIeltsGenrePage() {
  const { track: trackSlug } = useParams<{ track: string }>()
  const navigate = useNavigate()
  const track = getIeltsTrack(trackSlug)

  const counts = useLiveQuery(async () => {
    if (!track) return new Map<IeltsGenre, number>()
    const types = typesForTrack(track)
    const all = await db.writingDocs.toArray()
    const docs = all.filter(d => types.includes(d.type))
    const map = new Map<IeltsGenre, number>()
    for (const g of genresForTrack(track.slug)) {
      map.set(g.id, docs.filter(d => docMatchesIeltsGenre(d, track, g.id)).length)
    }
    return map
  }, [track?.slug, track?.type])

  if (!track) {
    return <Navigate to="/app/writing/practice" replace />
  }

  const genres = genresForTrack(track.slug as IeltsTrackSlug)

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing">Thư viện Writing</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <Link to="/app/writing/practice">IELTS</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">{track.label}</span>
        </nav>

        <h1 className="cb-title">{track.label}</h1>
        <p className="cb-sub">
          Chọn loại đề bạn muốn luyện. Chỉ hiện các bài thuộc {track.label} và đúng thể loại.
        </p>

        <div className="cb-grid">
          {genres.map(genre => (
            <button
              key={genre.id}
              type="button"
              className="cb-card"
              onClick={() => navigate(`/app/writing/practice/${track.slug}/${genre.id}`)}
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