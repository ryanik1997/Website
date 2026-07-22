import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight } from 'lucide-react'
import { db } from '@ryan/db'
import { IELTS_TRACKS, typesForTrack } from '../features/writing/ieltsCatalog'
import '../features/writing/cambridgeHub.css'

/** Bước 1: Chọn Task 1 / Task 2 / Viết tự do */
export default function WritingPracticePage() {
  const navigate = useNavigate()

  const counts = useLiveQuery(async () => {
    const all = await db.writingDocs.toArray()
    const map = new Map<string, number>()
    for (const track of IELTS_TRACKS) {
      const types = typesForTrack(track)
      map.set(track.slug, all.filter(d => types.includes(d.type)).length)
    }
    return map
  }, [])

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing">Thư viện Writing</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">Luyện viết IELTS</span>
        </nav>

        <h1 className="cb-title">Luyện viết IELTS</h1>
        <p className="cb-sub">
          Chọn Task 1, Task 2 hoặc Viết tự do — sau đó chọn loại đề (biểu đồ, opinion, discussion…)
          để dễ tìm khi có hàng trăm bài.
        </p>

        <div className="cb-grid">
          {IELTS_TRACKS.map(track => (
            <button
              key={track.slug}
              type="button"
              className="cb-card cb-level-card"
              style={{ '--cb-accent': track.color } as CSSProperties}
              onClick={() => navigate(`/app/writing/practice/${track.slug}`)}
            >
              <div className="cb-card-top">
                <span className="cb-card-badge">{track.badge}</span>
                <span className="cb-card-count">{counts?.get(track.slug) ?? 0} bài</span>
              </div>
              <h2 className="cb-card-title">{track.label}</h2>
              <p className="cb-card-desc">{track.desc}</p>
              <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
                Chọn loại bài
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}