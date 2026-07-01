import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight } from 'lucide-react'
import { db } from '@ryan/db'
import {
  genreDisplayLabel,
  genresForTrack,
  getTranslationTrack,
  setMatchesTrackGenre,
  type TranslationGenre,
  type TranslationTrackSlug,
} from '../features/translation/translationCatalog'
import '../features/writing/cambridgeHub.css'

/** Bước 2: Chọn chủ đề trong từng track */
export default function TranslationGenrePage() {
  const { track: trackSlug } = useParams<{ track: string }>()
  const navigate = useNavigate()
  const track = getTranslationTrack(trackSlug)

  const counts = useLiveQuery(async () => {
    if (!track) return new Map<TranslationGenre, number>()
    const all = await db.translationSets.where('category').equals(track.category).toArray()
    const map = new Map<TranslationGenre, number>()
    for (const g of genresForTrack(track.slug)) {
      map.set(g.id, all.filter(s => setMatchesTrackGenre(s, track, g.id)).length)
    }
    return map
  }, [track?.slug, track?.category])

  if (!track) {
    return <Navigate to="/app/writing/translate" replace />
  }

  const genres = genresForTrack(track.slug as TranslationTrackSlug)

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing">Thư viện Writing</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <Link to="/app/writing/translate">Luyện dịch</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">{track.label}</span>
        </nav>

        <h1 className="cb-title">{track.label}</h1>
        <p className="cb-sub">
          Chọn chủ đề bạn muốn luyện. Chỉ hiện các bộ câu thuộc {track.label} và đúng chủ đề.
        </p>

        <div className="cb-grid">
          {genres.map(genre => (
            <button
              key={genre.id}
              type="button"
              className="cb-card"
              onClick={() => navigate(`/app/writing/translate/${track.slug}/${genre.id}`)}
            >
              <div className="cb-card-top">
                <span className="cb-card-icon" aria-hidden>{genre.icon}</span>
                <span className="cb-card-count">{counts?.get(genre.id) ?? 0} bộ</span>
              </div>
              <h2 className="cb-card-title">{genreDisplayLabel(track, genre.id)}</h2>
              <p className="cb-card-desc">{genre.desc}</p>
              <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
                Vào luyện dịch
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}