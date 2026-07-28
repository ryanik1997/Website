import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ImageOff, Loader2, Play, Search } from 'lucide-react'
import { getIeltsGenreDef, ieltsGenreLabel, type IeltsGenre } from '../ieltsCatalog'
import { useWritingStore } from '../writingStore'
import { startTidTask, useTidTasks, type TidWritingTask } from './promptBank'
import './promptBank.css'

type BankTab = 'all' | 'task1' | 'task2'

const TABS: { key: BankTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'task1', label: 'Task 1' },
  { key: 'task2', label: 'Task 2' },
]

const PAGE_SIZE = 12

export default function PromptBankBrowser() {
  const { tasks, error } = useTidTasks()
  const navigate = useNavigate()
  const { setActiveDoc } = useWritingStore()

  const [tab, setTab] = useState<BankTab>('all')
  const [genre, setGenre] = useState<IeltsGenre | 'all'>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [startingId, setStartingId] = useState<string | null>(null)

  const genres = useMemo(() => {
    if (!tasks) return []
    const pool = tab === 'all' ? tasks : tasks.filter(t => t.taskType === tab)
    return [...new Set(pool.map(t => t.genre))]
  }, [tasks, tab])

  const filtered = useMemo(() => {
    if (!tasks) return []
    const q = query.trim().toLowerCase()
    return tasks.filter(t => {
      if (tab !== 'all' && t.taskType !== tab) return false
      if (genre !== 'all' && t.genre !== genre) return false
      if (q && !`${t.title} ${t.prompt}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [tasks, tab, genre, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  async function onStart(task: TidWritingTask) {
    if (startingId) return
    setStartingId(task.id)
    try {
      const id = await startTidTask(task)
      setActiveDoc(id)
      navigate(`/app/writing/practice/${task.taskType}/${task.genre}`)
    } finally {
      setStartingId(null)
    }
  }

  if (error) {
    return <p className="pb-status">{error}</p>
  }
  if (!tasks) {
    return (
      <p className="pb-status">
        <Loader2 size={14} className="pb-spin" /> Đang tải ngân hàng đề…
      </p>
    )
  }

  return (
    <section className="pb-bank" aria-label="Ngân hàng đề IELTS Writing">
      <div className="pb-head">
        <h2 className="pb-title">Ngân hàng đề</h2>
        <span className="pb-count">{filtered.length} đề</span>
      </div>

      <div className="pb-toolbar">
        <div className="pb-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`pb-tab ${tab === t.key ? 'is-active' : ''}`}
              onClick={() => {
                setTab(t.key)
                setGenre('all')
                setPage(1)
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          className="pb-genre"
          value={genre}
          onChange={e => {
            setGenre(e.target.value as IeltsGenre | 'all')
            setPage(1)
          }}
          aria-label="Lọc theo loại đề"
        >
          <option value="all">Mọi loại đề</option>
          {genres.map(g => (
            <option key={g} value={g}>
              {getIeltsGenreDef(g)?.icon} {ieltsGenreLabel(g)}
            </option>
          ))}
        </select>
        <label className="pb-search">
          <Search size={14} />
          <input
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Tìm đề…"
          />
        </label>
      </div>

      <div className="pb-grid">
        {visible.map(task => (
          <article key={task.id} className="pb-card">
            <div className="pb-thumb">
              {task.image ? (
                <img src={task.image} alt="" loading="lazy" />
              ) : (
                <ImageOff size={22} className="pb-noimg" />
              )}
              <span className={`pb-badge pb-badge-${task.taskType}`}>
                {getIeltsGenreDef(task.genre)?.icon} {ieltsGenreLabel(task.genre)}
              </span>
            </div>
            <div className="pb-body">
              <h3 className="pb-card-title">{task.title}</h3>
              <p className="pb-card-prompt">{task.prompt}</p>
              <button
                type="button"
                className="pb-start"
                disabled={startingId !== null}
                onClick={() => void onStart(task)}
              >
                {startingId === task.id ? (
                  <Loader2 size={13} className="pb-spin" />
                ) : (
                  <Play size={13} />
                )}
                Luyện đề này
              </button>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pb-pager">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage(safePage - 1)}
            aria-label="Trang trước"
          >
            <ChevronLeft size={14} />
          </button>
          <span>
            Trang {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setPage(safePage + 1)}
            aria-label="Trang sau"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </section>
  )
}
