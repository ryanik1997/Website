import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Library } from 'lucide-react'
import { CAMBRIDGE_LEVELS } from '../features/writing/cambridgeCatalog'
import { CAMBRIDGE_WRITING_MANIFEST } from '@ryan/catalog'
import {
  CAMBRIDGE_WRITING_MODEL_CATALOG,
  listModelAnswersByLevel,
  type CambridgeWritingLevel,
} from '../features/exam/cambridgeWritingModelCatalog'
import '../features/writing/cambridgeHub.css'

export default function WritingCambridgePage() {
  const navigate = useNavigate()
  const [catalogLevel, setCatalogLevel] = useState<CambridgeWritingLevel | 'all'>('all')
  const [catalogOpen, setCatalogOpen] = useState(false)

  const counts = new Map<string, number>([
    ['a2', 1],
    ['b1', CAMBRIDGE_WRITING_MANIFEST.b1.testCount],
    ['b2', CAMBRIDGE_WRITING_MANIFEST.b2.testCount],
    ['c1', CAMBRIDGE_WRITING_MANIFEST.c1.testCount],
    ['c2', CAMBRIDGE_WRITING_MANIFEST.c2.testCount],
  ])

  const catalogEntries = catalogLevel === 'all'
    ? CAMBRIDGE_WRITING_MODEL_CATALOG
    : listModelAnswersByLevel(catalogLevel)

  return (
    <div className="cb-hub">
      <div className="cb-inner">
        <nav className="cb-breadcrumb" aria-label="Breadcrumb">
          <span className="cb-breadcrumb-current">Cambridge A2-C2</span>
        </nav>

        <h1 className="cb-title">Luyen viet Cambridge A2-C2</h1>
        <p className="cb-sub">
          Chon cap do truoc - moi level co cac loai bai rieng (email, story, essay...).
          De tim khi thu vien co hang tram de.
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
                  {counts.get(level.slug) ?? 0} bai
                </span>
              </div>
              <h2 className="cb-card-title">{level.label}</h2>
              <p className="cb-card-desc">{level.desc}</p>
              <span className="cb-card-meta" style={{ color: 'var(--color-primary)' }}>
                Open library
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
              {catalogOpen ? '- thu gon' : '- mo'}
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
                    {lv === 'all' ? 'Tat ca' : lv.toUpperCase()}
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
                    <pre
                      style={{
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
