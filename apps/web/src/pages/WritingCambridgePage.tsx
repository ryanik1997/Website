import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight } from 'lucide-react'
import { db } from '@ryan/db'
import { CAMBRIDGE_DOC_TYPES } from '../features/writing/writingTypes'
import { CAMBRIDGE_LEVELS } from '../features/writing/cambridgeCatalog'
import '../features/writing/cambridgeHub.css'

/** Bước 1: Chọn cấp độ Cambridge A2–C2 */
export default function WritingCambridgePage() {
  const navigate = useNavigate()

  const counts = useLiveQuery(async () => {
    const all = await db.writingDocs.toArray()
    const cambridge = all.filter(d => CAMBRIDGE_DOC_TYPES.includes(d.type))
    const map = new Map<string, number>()
    for (const level of CAMBRIDGE_LEVELS) {
      map.set(level.slug, cambridge.filter(d => d.type === level.type).length)
    }
    return map
  }, [])

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing">Thư viện Writing</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">Cambridge A2–C2</span>
        </nav>

        <h1 className="cb-title">Luyện viết Cambridge A2–C2</h1>
        <p className="cb-sub">
          Chọn cấp độ trước — mỗi level có các loại bài riêng (email, story, essay…).
          Dễ tìm khi thư viện có hàng trăm đề.
        </p>

        <div className="cb-grid">
          {CAMBRIDGE_LEVELS.map(level => (
            <button
              key={level.slug}
              type="button"
              className="cb-card cb-level-card"
              style={{ '--cb-accent': level.color } as CSSProperties}
              onClick={() => navigate(`/app/writing/cambridge/${level.slug}`)}
            >
              <div className="cb-card-top">
                <span className="cb-card-badge">{level.exam}</span>
                <span className="cb-card-count">
                  {counts?.get(level.slug) ?? 0} bài
                </span>
              </div>
              <h2 className="cb-card-title">{level.label}</h2>
              <p className="cb-card-desc">{level.desc}</p>
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