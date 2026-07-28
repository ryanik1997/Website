import type { CSSProperties } from 'react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight } from 'lucide-react'
import { db } from '@ryan/db'
import { TRANSLATION_TRACKS } from '../features/translation/translationCatalog'
import { ensureTranslationSeedData } from '../features/translation/seedTranslationPacks'
import '../features/writing/cambridgeHub.css'

/** Bước 1: Chọn Task 1 / Task 2 / Daily / Của tôi */
export default function TranslationHubPage() {
  const navigate = useNavigate()

  useEffect(() => {
    void ensureTranslationSeedData().catch(err =>
      console.warn('[translation] seed failed', err),
    )
  }, [])

  const counts = useLiveQuery(async () => {
    const all = await db.translationSets.toArray()
    const map = new Map<string, number>()
    for (const track of TRANSLATION_TRACKS) {
      map.set(track.slug, all.filter(s => s.category === track.category).length)
    }
    return map
  }, [])

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <Link to="/app/writing">Thư viện Writing</Link>
          <span className="cb-breadcrumb-sep">/</span>
          <span className="cb-breadcrumb-current">Luyện dịch IELTS</span>
        </nav>

        <h1 className="cb-title">Luyện dịch IELTS</h1>
        <p className="cb-sub">
          Cấu trúc cơ bản, Collocations & Vocab, dịch đoạn Band 6.5/8.0, Essay hoàn chỉnh —
          chọn loại rồi chọn chủ đề để luyện dịch có hệ thống.
        </p>

        <div className="cb-grid">
          {TRANSLATION_TRACKS.map(track => (
            <button
              key={track.slug}
              type="button"
              className="cb-card cb-level-card"
              style={{ '--cb-accent': track.color } as CSSProperties}
              onClick={() => navigate(`/app/writing/translate/${track.slug}`)}
            >
              <div className="cb-card-top">
                <span className="cb-card-badge">{track.badge}</span>
                <span className="cb-card-count">{counts?.get(track.slug) ?? 0} bộ</span>
              </div>
              <h2 className="cb-card-title">{track.label}</h2>
              <p className="cb-card-desc">{track.desc}</p>
              <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
                Chọn chủ đề
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}