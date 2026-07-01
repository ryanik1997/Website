import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Search, Plus, Download, List, LayoutGrid, SlidersHorizontal, Star, Headphones,
} from 'lucide-react'
import { db, lessonRepo } from '@ryan/db'
import type { Lesson } from '@ryan/db'
import CreateLessonModal from './CreateLessonModal'
import ImportAudioModal from './ImportAudioModal'
import AppendSentencesModal from './AppendSentencesModal'
import ListeningTopicAccordion from './ListeningTopicAccordion'
import ListeningUserLessonCard from './ListeningUserLessonCard'
import { lessonHasDue } from './listeningUtils'
import { groupCambridgeLessons, isStructuredLesson } from './listeningMeta'
import ListeningTtsStatusBadge from './ListeningTtsStatusBadge'

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'cambridge', label: 'Cambridge' },
  { id: 'user', label: 'My Lessons' },
  { id: 'review', label: 'Ôn lại', icon: Star },
] as const

type TabId = (typeof TABS)[number]['id']

type AppendTarget = { lessonId: string; lessonTitle: string; mode: 'sentence' | 'text' }

export default function ListeningLibraryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showImportAudio, setShowImportAudio] = useState(false)
  const [appendTarget, setAppendTarget] = useState<AppendTarget | null>(null)


  const allLessons = useLiveQuery(
    () => db.lessons.orderBy('createdAt').reverse().toArray(),
    [],
  ) ?? []

  const filtered = useMemo(() => {
    let list = allLessons
    if (tab === 'cambridge') list = list.filter(l => l.category === 'cambridge')
    else if (tab === 'user') list = list.filter(l => l.category === 'user')
    else if (tab === 'review') list = list.filter(lessonHasDue)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(l =>
        l.title.toLowerCase().includes(q)
        || (l.book?.toLowerCase().includes(q) ?? false)
        || (l.topic?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
  }, [allLessons, tab, search])

  const cambridgeLessons = filtered.filter(l => l.category === 'cambridge' && isStructuredLesson(l))
  const bookGroups = useMemo(() => groupCambridgeLessons(cambridgeLessons), [cambridgeLessons])
  const userLessons = filtered.filter(l => l.category === 'user')

  function openAppend(lesson: Lesson, mode: 'sentence' | 'text') {
    setAppendTarget({ lessonId: lesson.id, lessonTitle: lesson.title, mode })
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
            LIBRARY
          </h1>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none mt-0.5" style={{ color: 'var(--text-primary)' }}>
            ARCHIVES
          </h2>
          <div className="mt-3">
            <ListeningTtsStatusBadge />
          </div>
        </header>

        <div className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {TABS.map(t => {
                const active = tab === t.id
                const Icon = 'icon' in t ? t.icon : undefined
                const count =
                  t.id === 'all' ? allLessons.length
                  : t.id === 'cambridge' ? allLessons.filter(l => l.category === 'cambridge').length
                  : t.id === 'user' ? allLessons.filter(l => l.category === 'user').length
                  : allLessons.filter(lessonHasDue).length
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                    style={{
                      background: active ? 'var(--text-primary)' : 'var(--bg-card)',
                      color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
                      border: active ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    {Icon && <Icon size={13} />}
                    {t.label}
                    <span className="opacity-70 text-xs">· {count}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImportAudio(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                <Download size={15} />
                Import & Phiên âm
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'color-mix(in srgb, var(--color-accent) 18%, var(--bg-card))',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Plus size={15} />
                Tạo từ văn bản
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm bài nghe..."
                className="flex-1 bg-transparent text-sm outline-none min-w-0"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {[List, LayoutGrid, SlidersHorizontal].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-9 h-9 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl py-16 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <Headphones size={36} className="mx-auto mb-3" style={{ color: 'var(--border-color)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Chưa có bài trong mục này</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {bookGroups.length > 0 && (tab === 'all' || tab === 'cambridge' || tab === 'review') && (
              <section>
                {tab === 'all' && (
                  <h3 className="text-xs font-bold tracking-widest mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
                    Library Archives
                  </h3>
                )}
                <div className="flex flex-col gap-3">
                  {bookGroups.map(group => (
                    <ListeningTopicAccordion
                      key={String(group.bookNum)}
                      group={group}
                      defaultExpanded={String(group.bookNum) === '20'}
                      onStart={id => navigate(`/app/listening/${id}`)}
                      onAppendSentence={l => openAppend(l, 'sentence')}
                      onAppendText={l => openAppend(l, 'text')}
                    />
                  ))}
                </div>
              </section>
            )}

            {userLessons.length > 0 && (tab === 'all' || tab === 'user' || tab === 'review') && (
              <section>
                <h3 className="text-xs font-bold tracking-widest mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
                  My Lessons
                </h3>
                <div className="flex flex-col gap-3">
                  {userLessons.map(lesson => (
                    <ListeningUserLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onOpen={() => navigate(`/app/listening/${lesson.id}`)}
                      onAppendSentence={() => openAppend(lesson, 'sentence')}
                      onAppendText={() => openAppend(lesson, 'text')}
                      onDelete={async () => {
                        if (!confirm(`Xóa bài "${lesson.title}"?`)) return
                        await lessonRepo.delete(lesson.id)
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateLessonModal onClose={() => setShowCreate(false)} />}
      {showImportAudio && (
        <ImportAudioModal
          onClose={() => setShowImportAudio(false)}
          onCreated={id => navigate(`/app/listening/${id}`)}
        />
      )}
      {appendTarget && (
        <AppendSentencesModal
          lessonId={appendTarget.lessonId}
          lessonTitle={appendTarget.lessonTitle}
          mode={appendTarget.mode}
          onClose={() => setAppendTarget(null)}
        />
      )}
    </div>
  )
}