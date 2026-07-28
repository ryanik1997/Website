import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BAO_BASE,
  BILINGUAL_SOURCES,
  formatViews,
  getArticleById,
  getArticlesBySource,
  getSource,
  normalizeSourceId,
  parseBlockText,
} from './catalog'
import type { BilingualArticle, BilingualSourceId } from './types'
import ReadingRibbonBackdrop from './ReadingRibbonBackdrop'
import './readingCorner.css'

const PAGE_SIZE = 12
/** Max source cards under “Recommended by Ryan” per page */
const REC_PAGE_SIZE = 8
const FONTS = ['Lora', 'Fraunces', 'Merriweather', 'Playfair Display', 'Georgia', 'Inter'] as const

function HubView() {
  /** Top: 3 tờ lớn (không badge). Dưới: recommended, max 8 card/trang + lọc chủ đề. */
  const featured = useMemo(() => BILINGUAL_SOURCES.filter(s => !s.recommended), [])
  const recommended = useMemo(() => BILINGUAL_SOURCES.filter(s => s.recommended), [])
  const [recPage, setRecPage] = useState(1)
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [topicQuery, setTopicQuery] = useState('')

  const filteredRecommended = useMemo(() => {
    let list = recommended
    if (topicFilter !== 'all') {
      list = list.filter(s => s.id === topicFilter)
    }
    const q = topicQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.topicKeywords ?? []).some(k => k.toLowerCase().includes(q)),
      )
    }
    return list
  }, [recommended, topicFilter, topicQuery])

  const recTotalPages = Math.max(1, Math.ceil(filteredRecommended.length / REC_PAGE_SIZE))
  const safeRecPage = Math.min(Math.max(1, recPage), recTotalPages)
  const recPageItems = useMemo(() => {
    const start = (safeRecPage - 1) * REC_PAGE_SIZE
    return filteredRecommended.slice(start, start + REC_PAGE_SIZE)
  }, [filteredRecommended, safeRecPage])

  function applyTopicFilter(id: string) {
    setTopicFilter(id)
    setRecPage(1)
  }

  function applyTopicQuery(value: string) {
    setTopicQuery(value)
    setRecPage(1)
  }

  return (
    <div className="snb-hub">
      <main className="snb-hub-main">
        <Link className="snb-back light" to="/app/reading-corner">
          ← Góc đọc
        </Link>
        <div className="snb-hub-copy">
          <div className="snb-kicker">BILINGUAL PRESS PORTAL</div>
          <h1>Đọc Báo Song Ngữ</h1>
          <p className="snb-intro">
            Tuyển tập các bài viết song ngữ Anh - Việt từ những đầu báo uy tín nhất thế giới,
            giúp bạn nâng cao từ vựng học thuật và phản xạ đọc hiểu tự nhiên.
          </p>
        </div>

        <section className="snb-source-grid">
          {featured.map(s => (
            <Link key={s.id} to={`${BAO_BASE}?s=${s.id}`} className="snb-source-card">
              <img src={s.coverUrl} alt={s.name} />
              <span className="snb-source-label">{s.name}</span>
            </Link>
          ))}
        </section>

        {recommended.length > 0 ? (
          <>
            <div className="snb-rec-toolbar">
              <div className="snb-recommended">✦ Recommended by Ryan</div>
              <div className="snb-topic-filter" role="search">
                <label className="snb-topic-filter__label" htmlFor="snb-topic-select">
                  Lọc chủ đề
                </label>
                <select
                  id="snb-topic-select"
                  className="snb-topic-filter__select"
                  value={topicFilter}
                  onChange={e => applyTopicFilter(e.target.value)}
                  aria-label="Chọn chủ đề"
                >
                  <option value="all">Tất cả chủ đề ({recommended.length})</option>
                  {recommended.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="search"
                  className="snb-topic-filter__search"
                  placeholder="Tìm chủ đề…"
                  value={topicQuery}
                  onChange={e => applyTopicQuery(e.target.value)}
                  aria-label="Tìm chủ đề"
                />
                {(topicFilter !== 'all' || topicQuery.trim()) && (
                  <button
                    type="button"
                    className="snb-topic-filter__clear"
                    onClick={() => {
                      setTopicFilter('all')
                      setTopicQuery('')
                      setRecPage(1)
                    }}
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>

            {filteredRecommended.length === 0 ? (
              <p className="snb-topic-filter__empty">
                Không có chủ đề khớp bộ lọc.
                <button
                  type="button"
                  className="snb-topic-filter__clear inline"
                  onClick={() => {
                    setTopicFilter('all')
                    setTopicQuery('')
                    setRecPage(1)
                  }}
                >
                  Hiện tất cả
                </button>
              </p>
            ) : (
              <>
                <p className="snb-topic-filter__meta">
                  Hiển thị {recPageItems.length}/{filteredRecommended.length} chủ đề
                  {topicFilter !== 'all' || topicQuery.trim()
                    ? ' (đã lọc)'
                    : ` · trang ${safeRecPage}/${recTotalPages}`}
                </p>
                <section className="snb-source-grid lower" aria-label="Recommended by Ryan">
                  {recPageItems.map(s => (
                    <Link key={s.id} to={`${BAO_BASE}?s=${s.id}`} className="snb-source-card">
                      <span className="snb-rec-badge">Recommended by Ryan</span>
                      <img src={s.coverUrl} alt={s.name} />
                      <span className="snb-source-label">{s.name}</span>
                    </Link>
                  ))}
                </section>
                {recTotalPages > 1 ? (
                  <div
                    className="snb-pagination snb-rec-pagination"
                    role="navigation"
                    aria-label="Recommended pages"
                  >
                    <button
                      type="button"
                      className={safeRecPage <= 1 ? 'disabled' : ''}
                      disabled={safeRecPage <= 1}
                      onClick={() => setRecPage(p => Math.max(1, p - 1))}
                    >
                      Trước
                    </button>
                    {Array.from({ length: recTotalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        type="button"
                        className={n === safeRecPage ? 'current' : ''}
                        onClick={() => setRecPage(n)}
                        aria-current={n === safeRecPage ? 'page' : undefined}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={safeRecPage >= recTotalPages ? 'disabled' : ''}
                      disabled={safeRecPage >= recTotalPages}
                      onClick={() => setRecPage(p => Math.min(recTotalPages, p + 1))}
                    >
                      Tiếp
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </main>
    </div>
  )
}

function SourceListView({
  sourceId,
  sort,
  page,
}: {
  sourceId: BilingualSourceId
  sort: 'newest' | 'popular'
  page: number
}) {
  const source = getSource(sourceId)!
  const all = useMemo(() => getArticlesBySource(sourceId, sort), [sourceId, sort])
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pageItems = all.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const featured = all[0]

  function hrefFor(next: { sort?: string; page?: number; article?: string }) {
    const p = new URLSearchParams()
    p.set('s', sourceId)
    if (next.article) p.set('a', next.article)
    const s = next.sort ?? sort
    if (s === 'popular') p.set('sort', 'popular')
    const pg = next.page ?? safePage
    if (pg > 1) p.set('page', String(pg))
    return `${BAO_BASE}?${p.toString()}`
  }

  return (
    <div className="snb-list">
      <main className="snb-list-main">
        <div className="snb-list-toolbar">
          <Link className="snb-back dark" to={BAO_BASE}>
            ← Quay lại danh sách báo
          </Link>
          <div className="snb-list-actions">
            <button type="button" className="ghost">
              Đã lưu
            </button>
            <button type="button" className="ghost">
              Thêm bài báo của bạn
            </button>
            <button type="button" className="primary">
              Nhận thông báo bài học mới
            </button>
          </div>
        </div>

        <h1 className="snb-source-title">{source.name}</h1>

        {featured ? (
          <Link
            to={hrefFor({ article: featured.id })}
            className="snb-featured"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.88), rgba(15,23,42,.35)), url(${featured.image_url})`,
            }}
          >
            <div className="snb-featured-body">
              <div className="snb-cat">{featured.category}</div>
              <h2>{featured.title}</h2>
              <p>{featured.title_vi}</p>
              <span className="snb-cta">Click to read bilingual article</span>
              <span className="snb-views">{formatViews(featured.view_count)} lượt đọc</span>
            </div>
          </Link>
        ) : null}

        <div className="snb-sort-row">
          <Link to={hrefFor({ sort: 'newest', page: 1 })} className={sort === 'newest' ? 'active' : ''}>
            ↓ Mới nhất
          </Link>
          <Link to={hrefFor({ sort: 'popular', page: 1 })} className={sort === 'popular' ? 'active' : ''}>
            🔥 Nhiều lượt đọc
          </Link>
        </div>

        <div className="snb-article-grid">
          {pageItems.map(a => (
            <ArticleCard key={a.id} article={a} to={hrefFor({ article: a.id })} />
          ))}
        </div>

        <div className="snb-pagination">
          <Link
            className={safePage <= 1 ? 'disabled' : ''}
            to={hrefFor({ page: Math.max(1, safePage - 1) })}
          >
            Trước
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(0, 6)
            .map(n => (
              <Link key={n} to={hrefFor({ page: n })} className={n === safePage ? 'current' : ''}>
                {n}
              </Link>
            ))}
          <Link
            className={safePage >= totalPages ? 'disabled' : ''}
            to={hrefFor({ page: Math.min(totalPages, safePage + 1) })}
          >
            Tiếp
          </Link>
        </div>
      </main>
    </div>
  )
}

function ArticleCard({ article, to }: { article: BilingualArticle; to: string }) {
  return (
    <Link to={to} className="snb-article-card">
      <div className="snb-cat">📖 {article.category}</div>
      <h3>{article.title}</h3>
      <span
        className="snb-source-link"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          window.open(article.source_url, '_blank', 'noreferrer')
        }}
      >
        {article.source_label}
      </span>
      <p className="snb-title-vi">{article.title_vi}</p>
      <div className="snb-meta">
        <span>BY {article.author || '—'}</span>
        <span>{formatViews(article.view_count)} lượt đọc</span>
        <span>{article.read_time}</span>
      </div>
    </Link>
  )
}

function ReaderView({
  sourceId,
  articleId,
}: {
  sourceId: BilingualSourceId | null
  articleId: string
}) {
  const article = getArticleById(articleId)
  const [font, setFont] = useState<(typeof FONTS)[number]>('Lora')
  const [fontSize, setFontSize] = useState(17)
  const [dark, setDark] = useState(false)
  const navigate = useNavigate()

  if (!article) {
    return (
      <div className="snb-reader">
        <main className="snb-reader-main">
          <p>Không tìm thấy bài viết.</p>
          <Link to={BAO_BASE}>← Về portal</Link>
        </main>
      </div>
    )
  }

  const backHref = `${BAO_BASE}?s=${sourceId ?? article.source_id}`

  return (
    <div className={`snb-reader${dark ? ' is-dark' : ''}`}>
      <main className="snb-reader-main">
        <div className="snb-reader-toolbar">
          <button type="button" className="snb-back-btn" onClick={() => navigate(backHref)}>
            ← đọc song ngữ · Ryan English
          </button>
          <div className="snb-reader-controls">
            <label>
              FONT
              <select
                value={font}
                onChange={e => setFont(e.target.value as (typeof FONTS)[number])}
              >
                {FONTS.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <div className="snb-size">
              <span>CỠ CHỮ</span>
              <button type="button" onClick={() => setFontSize(n => Math.max(14, n - 1))}>
                −
              </button>
              <strong>{fontSize}</strong>
              <button type="button" onClick={() => setFontSize(n => Math.min(24, n + 1))}>
                +
              </button>
            </div>
            <button type="button" className="chip">
              📖 0 từ
            </button>
            <button type="button" className="chip" onClick={() => setDark(d => !d)}>
              {dark ? '☀️ Sáng' : '🌙 Tối'}
            </button>
          </div>
        </div>

        <div
          className="snb-dual"
          style={{ fontFamily: `${font}, Georgia, serif`, fontSize: `${fontSize}px` }}
        >
          <article className="snb-col en">
            <div className="snb-lang-tag">EN · English</div>
            <h1>{article.title}</h1>
            <a href={article.source_url} target="_blank" rel="noreferrer" className="snb-origin">
              {article.source_label}
            </a>
            {article.content.map((block, i) => (
              <Block key={`en-${i}`} raw={block.en} />
            ))}
          </article>
          <div className="snb-divider" aria-hidden />
          <article className="snb-col vi">
            <div className="snb-lang-tag">VI · Tiếng Việt</div>
            <h1>{article.title_vi}</h1>
            {article.content.map((block, i) => (
              <Block key={`vi-${i}`} raw={block.vi} />
            ))}
          </article>
        </div>
      </main>
    </div>
  )
}

function Block({ raw }: { raw: string }) {
  const parsed = parseBlockText(raw)
  if (parsed.type === 'img') {
    return <img className="snb-inline-img" src={parsed.value} alt="" loading="lazy" />
  }
  return <p className={parsed.bold ? 'is-bold' : undefined}>{parsed.value}</p>
}

/**
 * Fixed full-viewport backdrop.
 * @param ribbons — animated diagonal gradient strips (hub/list only; off on article reader)
 */
export default function BilingualPressPortal() {
  const [sp] = useSearchParams()
  const sourceId = normalizeSourceId(sp.get('s'))
  const articleId = sp.get('a')
  const sort = sp.get('sort') === 'popular' ? 'popular' : 'newest'
  const page = Number(sp.get('page') || '1') || 1
  const isReader = Boolean(articleId)

  let body: ReactNode
  if (articleId) body = <ReaderView sourceId={sourceId} articleId={articleId} />
  else if (sourceId) body = <SourceListView sourceId={sourceId} sort={sort} page={page} />
  else body = <HubView />

  return (
    <div className={`snb-fill snb-bao-root${isReader ? ' is-reader' : ''}`}>
      {/* Reader: grid only — no animated ribbon gradient (match gocdoc1.jpg) */}
      <ReadingRibbonBackdrop ribbons={!isReader} />
      <div className="snb-bao-content">{body}</div>
    </div>
  )
}
