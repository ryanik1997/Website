import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock3, Headphones, Link2, LoaderCircle, Search } from 'lucide-react'
import {
  MODE_TABS,
  SIDEBAR_CATEGORIES,
  SIDEBAR_LEVELS,
  SHADOWING_VIDEOS,
  filterShadowingVideos,
  lessonHref,
} from './catalog'
import type {
  ShadowingCategoryFilter,
  ShadowingLevelFilter,
  ShadowingMode,
  ShadowingVideo,
} from './types'
import { importYoutubeShadowingLesson } from './customShadowing'
import './shadowingLibrary.css'

function categoryShortLabel(category: string): string {
  if (category === 'IELTS Speaking for Success') return 'IELTS'
  if (category === 'Kurzgesagt – In a Nutshell') return 'Kurzgesagt'
  if (category === 'BBC Learning English') return 'BBC'
  if (category === 'Real Easy English') return 'REE'
  if (category === 'Movie short clip') return 'Movie'
  return category
}

function LessonCard({ video, mode }: { video: ShadowingVideo; mode: ShadowingMode }) {
  return (
    <Link to={lessonHref(video, mode)} className="shadowing-card">
      <div className="shadowing-card__thumb">
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
        {video.level ? (
          <span className="shadowing-badge shadowing-badge--level">{video.level}</span>
        ) : (
          <span className="shadowing-badge shadowing-badge--cat" title={video.category}>
            {categoryShortLabel(video.category)}
          </span>
        )}
        {video.duration ? (
          <span className="shadowing-duration">
            <Clock3 size={10} />
            {video.duration}
          </span>
        ) : null}
      </div>
      <div className="shadowing-card__body">
        <h3>{video.title}</h3>
        <div className="shadowing-card__meta">
          {video.segments > 0 ? `${video.segments} phân đoạn` : categoryShortLabel(video.category)}
        </div>
      </div>
    </Link>
  )
}

export default function ShadowingLibraryPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<ShadowingCategoryFilter>('all')
  const [level, setLevel] = useState<ShadowingLevelFilter>('all')
  const [mode, setMode] = useState<ShadowingMode>('shadowing')
  const [search, setSearch] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  async function handleYoutubeImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (importing) return
    setImportError('')
    setImporting(true)
    try {
      const lesson = await importYoutubeShadowingLesson(youtubeUrl)
      navigate(lessonHref(lesson.video, mode))
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Không thể tạo bài Shadowing.')
    } finally {
      setImporting(false)
    }
  }

  const videos = useMemo(
    () => filterShadowingVideos({ category, level, search }),
    [category, level, search],
  )

  const activeCategoryLabel =
    SIDEBAR_CATEGORIES.find(c => c.id === category)?.label ?? 'Tất cả bài học'

  return (
    <div className="shadowing-shell">
      <aside className="shadowing-sidebar">
        <div className="shadowing-sidebar__brand">
          <div className="shadowing-sidebar__icon" aria-hidden>
            <Headphones size={20} />
          </div>
          <div>
            <h1>Luyện Shadowing</h1>
            <p>Chọn chủ đề luyện nói</p>
          </div>
        </div>

        <nav className="shadowing-sidebar__section" aria-label="Chủ đề">
          {SIDEBAR_CATEGORIES.map(item => (
            <button
              key={item.id}
              type="button"
              className={`shadowing-nav-btn${category === item.id ? ' is-active' : ''}`}
              onClick={() => setCategory(item.id)}
            >
              <span>{item.label}</span>
              {item.hot ? <span className="hot">🔥</span> : null}
            </button>
          ))}
        </nav>

        <div className="shadowing-sidebar__section">
          <h3>Cấp độ</h3>
          <button
            type="button"
            className={`shadowing-nav-btn${level === 'all' ? ' is-active' : ''}`}
            onClick={() => setLevel('all')}
          >
            Tất cả cấp độ
          </button>
          {SIDEBAR_LEVELS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`shadowing-nav-btn${level === item.id ? ' is-active' : ''}`}
              onClick={() => setLevel(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="shadowing-sidebar__section">
          <h3>Tổng quan</h3>
        </div>
        <div className="shadowing-stats">
          <div className="shadowing-stat">
            <strong>{SHADOWING_VIDEOS.length}</strong>
            <span>Bài học</span>
          </div>
          <div className="shadowing-stat">
            <strong>{videos.length}</strong>
            <span>Đang lọc</span>
          </div>
          <div className="shadowing-stat">
            <strong>{SIDEBAR_CATEGORIES.length - 1}</strong>
            <span>Chủ đề</span>
          </div>
          <div className="shadowing-stat">
            <strong>0%</strong>
            <span>Trung bình</span>
          </div>
        </div>
      </aside>

      <main className="shadowing-main">
        <header className="shadowing-main__header">
          <h2>Luyện Shadowing</h2>
          <p>Chọn chủ đề để luyện kỹ năng nói một cách tự nhiên</p>
        </header>

        <form className="shadowing-youtube-import" onSubmit={handleYoutubeImport}>
          <div className="shadowing-youtube-import__intro">
            <span className="shadowing-youtube-import__icon" aria-hidden><Link2 size={18} /></span>
            <div>
              <strong>Luyện với video YouTube của bạn</strong>
              <span>Dán URL; hệ thống tự lấy phụ đề tiếng Anh và chia thành từng câu.</span>
            </div>
          </div>
          <div className="shadowing-youtube-import__controls">
            <input
              type="url"
              value={youtubeUrl}
              onChange={event => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              aria-label="URL video YouTube"
              disabled={importing}
              required
            />
            <button type="submit" disabled={importing || !youtubeUrl.trim()}>
              {importing ? <LoaderCircle size={16} className="shadowing-youtube-import__spinner" /> : <Headphones size={16} />}
              {importing ? 'Đang lấy phụ đề…' : 'Tạo bài luyện'}
            </button>
          </div>
          {importError ? <p className="shadowing-youtube-import__error" role="alert">{importError}</p> : null}
          <p className="shadowing-youtube-import__note">Video phải công khai, cho phép nhúng và có phụ đề tiếng Anh.</p>
        </form>

        <div className="shadowing-mode-bar" role="tablist" aria-label="Chế độ luyện">
          {MODE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              className={`shadowing-mode-btn${mode === tab.id ? ' is-active' : ''}`}
              onClick={() => setMode(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="shadowing-toolbar">
          <div>
            <h3>
              {activeCategoryLabel}
              <span className="shadowing-toolbar__count">{videos.length} bài học</span>
            </h3>
          </div>
          <label className="shadowing-search">
            <Search size={15} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm bài học theo tên..."
              aria-label="Tìm bài học theo tên"
            />
          </label>
        </div>

        <div className="shadowing-grid">
          {videos.length === 0 ? (
            <div className="shadowing-empty">Không có bài học khớp bộ lọc.</div>
          ) : (
            videos.map(video => (
              <LessonCard key={video.id} video={video} mode={mode} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
