import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Library } from 'lucide-react'
import { db } from '@ryan/db'
import { CAMBRIDGE_DOC_TYPES } from '../features/writing/writingTypes'
import { CAMBRIDGE_LEVELS } from '../features/writing/cambridgeCatalog'
import {
  CAMBRIDGE_WRITING_MODEL_CATALOG,
  listModelAnswersByLevel,
  type CambridgeWritingLevel,
} from '../features/exam/cambridgeWritingModelCatalog'
import '../features/writing/cambridgeHub.css'

/** Bước 1: Chọn cấp độ Cambridge A2–C2 */
export default function WritingCambridgePage() {
  const navigate = useNavigate()
  const [catalogLevel, setCatalogLevel] = useState<CambridgeWritingLevel | 'all'>('all')
  const [catalogOpen, setCatalogOpen] = useState(false)

  const counts = useLiveQuery(async () => {
    const all = await db.writingDocs.toArray()
    const cambridge = all.filter(d => CAMBRIDGE_DOC_TYPES.includes(d.type))
    const map = new Map<string, number>()
    for (const level of CAMBRIDGE_LEVELS) {
      map.set(level.slug, cambridge.filter(d => d.type === level.type).length)
    }
    return map
  }, [])

  const catalogEntries = catalogLevel === 'all'
    ? CAMBRIDGE_WRITING_MODEL_CATALOG
    : listModelAnswersByLevel(catalogLevel)

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

        <section className="cb-catalog" style={{ marginTop: '2rem' }}>
          <button
            type="button"
            className="cb-catalog-toggle"
            onClick={() => setCatalogOpen(v => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <Library size={16} style={{ color: 'var(--color-primary)' }} />
            Model answer catalog ({CAMBRIDGE_WRITING_MODEL_CATALOG.length})
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {catalogOpen ? '— thu gọn' : '— mở'}
            </span>
          </button>

          {catalogOpen && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                {(['all', 'a2', 'b1', 'b2', 'c1', 'c2'] as const).map(lv => (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => setCatalogLevel(lv)}
                    style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: '9999px',
                      border: '1px solid var(--border-color)',
                      background: catalogLevel === lv
                        ? 'color-mix(in srgb, var(--color-primary) 16%, var(--bg-card))'
                        : 'var(--bg-secondary)',
                      color: catalogLevel === lv ? 'var(--color-primary)' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {lv === 'all' ? 'Tất cả' : lv.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {catalogEntries.map(entry => (
                  <details
                    key={entry.id}
                    style={{
                      borderRadius: '0.85rem',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {entry.title}
                      <span style={{ marginLeft: '0.5rem', fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {entry.genre}
                      </span>
                    </summary>
                    <p style={{ margin: '0.65rem 0 0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {entry.prompt}
                    </p>
                    <pre style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit',
                      fontSize: '0.8rem',
                      lineHeight: 1.65,
                      color: 'var(--text-primary)',
                      background: 'var(--bg-secondary)',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                    }}
                    >
                      {entry.modelAnswer}
                    </pre>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      {entry.notesVi}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}