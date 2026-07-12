import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Download,
  Headphones,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react'
import { db, lessonRepo } from '@ryan/db'
import type { Lesson } from '@ryan/db'
import AppendSentencesModal from './AppendSentencesModal'
import CreateLessonModal from './CreateLessonModal'
import ImportAudioModal from './ImportAudioModal'
import ListeningTopicAccordion from './ListeningTopicAccordion'
import ListeningTtsStatusBadge from './ListeningTtsStatusBadge'
import ListeningUserLessonCard, { type ListeningLibraryViewMode } from './ListeningUserLessonCard'
import { lessonHasDue } from './listeningUtils'
import { groupCambridgeLessons, isStructuredLesson } from './listeningMeta'
import './listeningLibraryPage.css'

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'cambridge', label: 'Cambridge' },
  { id: 'user', label: 'My Lessons' },
  { id: 'review', label: 'Ôn lại', icon: Star },
] as const

const VIEW_MODE_KEY = 'listening-library-view-mode'

const VIEW_MODES: Array<{
  id: ListeningLibraryViewMode
  label: string
  icon: typeof List
}> = [
  { id: 'list', label: 'List view', icon: List },
  { id: 'grid', label: 'Grid view', icon: LayoutGrid },
  { id: 'compact', label: 'Compact view', icon: SlidersHorizontal },
]

type TabId = (typeof TABS)[number]['id']
type AppendTarget = { lessonId: string; lessonTitle: string; mode: 'sentence' | 'text' }

function readInitialViewMode(): ListeningLibraryViewMode {
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY)
    return saved === 'grid' || saved === 'compact' ? saved : 'list'
  } catch {
    return 'list'
  }
}

export default function ListeningLibraryPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showImportAudio, setShowImportAudio] = useState(false)
  const [appendTarget, setAppendTarget] = useState<AppendTarget | null>(null)
  const [viewMode, setViewMode] = useState<ListeningLibraryViewMode>(readInitialViewMode)

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode)
    } catch {
      // Không block UI nếu localStorage bị chặn.
    }
  }, [viewMode])

  const allLessons = useLiveQuery(
    () => db.lessons.orderBy('createdAt').reverse().toArray(),
    [],
  ) ?? []

  const filtered = useMemo(() => {
    let list = allLessons
    if (tab === 'cambridge') list = list.filter(lesson => lesson.category === 'cambridge')
    else if (tab === 'user') list = list.filter(lesson => lesson.category === 'user')
    else if (tab === 'review') list = list.filter(lessonHasDue)

    const query = search.trim().toLowerCase()
    if (query) {
      list = list.filter(lesson =>
        lesson.title.toLowerCase().includes(query)
        || (lesson.book?.toLowerCase().includes(query) ?? false)
        || (lesson.topic?.toLowerCase().includes(query) ?? false),
      )
    }

    return list
  }, [allLessons, tab, search])

  const cambridgeLessons = filtered.filter(lesson => lesson.category === 'cambridge' && isStructuredLesson(lesson))
  const bookGroups = useMemo(() => groupCambridgeLessons(cambridgeLessons), [cambridgeLessons])
  const userLessons = filtered.filter(lesson => lesson.category === 'user')

  function openAppend(lesson: Lesson, mode: 'sentence' | 'text') {
    setAppendTarget({ lessonId: lesson.id, lessonTitle: lesson.title, mode })
  }

  const userGridClass = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
    : 'flex flex-col gap-3'

  const cambridgeGridClass = viewMode === 'grid'
    ? 'grid grid-cols-1 xl:grid-cols-2 gap-4'
    : 'flex flex-col gap-3'

  const viewTransitionStyle = {
    animation: 'listeningViewFade 180ms ease-out',
  } as const

  return (
    <div className="listening-lesson-shell listening-library-page h-full min-h-0" style={{ background: 'var(--bg-primary)' }}>
      <div className="listening-lesson-scroll h-full min-h-0">
      <style>
        {`
          @keyframes listeningViewFade {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div className="listening-library-page__inner mx-auto max-w-[1040px] px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1
            className="text-3xl font-black leading-none tracking-tight sm:text-4xl"
            style={{ color: 'var(--text-primary)' }}
          >
            LIBRARY
          </h1>
          <h2
            className="mt-0.5 text-3xl font-black leading-none tracking-tight sm:text-4xl"
            style={{ color: 'var(--text-primary)' }}
          >
            ARCHIVES
          </h2>
          <div className="mt-3">
            <ListeningTtsStatusBadge />
          </div>
        </header>

        <div className="mb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {TABS.map(tabItem => {
                const active = tab === tabItem.id
                const Icon = 'icon' in tabItem ? tabItem.icon : undefined
                const count =
                  tabItem.id === 'all' ? allLessons.length
                  : tabItem.id === 'cambridge' ? allLessons.filter(lesson => lesson.category === 'cambridge').length
                  : tabItem.id === 'user' ? allLessons.filter(lesson => lesson.category === 'user').length
                  : allLessons.filter(lessonHasDue).length

                return (
                  <button
                    key={tabItem.id}
                    type="button"
                    onClick={() => setTab(tabItem.id)}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                    style={{
                      background: active ? 'var(--text-primary)' : 'var(--bg-card)',
                      color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
                      border: active ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    {Icon && <Icon size={13} />}
                    {tabItem.label}
                    <span className="text-xs opacity-70">· {count}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImportAudio(true)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                <Download size={15} />
                Import & Phiên âm
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="flex flex-1 items-center gap-2 rounded-full px-4 py-2.5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm bài nghe..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div className="flex items-center gap-1.5">
              {VIEW_MODES.map(({ id, label, icon: Icon }) => {
                const active = viewMode === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setViewMode(id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    style={{
                      background: active
                        ? 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))'
                        : 'var(--bg-card)',
                      border: active
                        ? '1px solid color-mix(in srgb, var(--color-primary) 30%, var(--border-color))'
                        : '1px solid var(--border-color)',
                      color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                    }}
                    title={label}
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div
            className="rounded-2xl py-16 text-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <Headphones size={36} className="mx-auto mb-3" style={{ color: 'var(--border-color)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Chưa có bài trong mục này
            </p>
          </div>
        ) : (
          <div key={viewMode} className="flex flex-col gap-8" style={viewTransitionStyle}>
            {bookGroups.length > 0 && (tab === 'all' || tab === 'cambridge' || tab === 'review') && (
              <section>
                {tab === 'all' && (
                  <h3
                    className="mb-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Library Archives
                  </h3>
                )}

                <div className={cambridgeGridClass}>
                  {bookGroups.map(group => (
                    <ListeningTopicAccordion
                      key={String(group.bookNum)}
                      group={group}
                      viewMode={viewMode}
                      defaultExpanded={String(group.bookNum) === '20'}
                      onStart={id => navigate(`/app/listening/${id}`)}
                      onAppendSentence={lesson => openAppend(lesson, 'sentence')}
                      onAppendText={lesson => openAppend(lesson, 'text')}
                    />
                  ))}
                </div>
              </section>
            )}

            {userLessons.length > 0 && (tab === 'all' || tab === 'user' || tab === 'review') && (
              <section>
                <h3
                  className="mb-3 text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  My Lessons
                </h3>

                <div className={userGridClass}>
                  {userLessons.map(lesson => (
                    <ListeningUserLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      viewMode={viewMode}
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
