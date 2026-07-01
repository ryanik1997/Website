import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Headphones, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { db, lessonRepo } from '@ryan/db'
import type { Lesson } from '@ryan/db'
import { useListeningStore } from './listeningStore'
import { parseSentences } from './types'
import CreateLessonModal from './CreateLessonModal'
import PanelHeader from '../../components/PanelHeader'
import PanelEmpty from '../../components/PanelEmpty'

const TABS = [
  { id: 'all' as const, label: 'Tất cả' },
  { id: 'user' as const, label: 'Của tôi' },
  { id: 'cambridge' as const, label: 'Cambridge' },
]

export default function LessonPanel() {
  const { activeLessonId, setActiveLesson, tab, setTab } = useListeningStore()
  const [showCreate, setShowCreate] = useState(false)

  const lessons = useLiveQuery(
    () => tab === 'all'
      ? db.lessons.orderBy('createdAt').reverse().toArray()
      : db.lessons.where('category').equals(tab).reverse().sortBy('createdAt'),
    [tab],
  )

  return (
    <div
      className="w-60 flex flex-col shrink-0 border-r"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <PanelHeader
        title="Bài nghe"
        subtitle={lessons?.length ? `${lessons.length} bài` : undefined}
        actions={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--color-primary)' }}
            title="Tạo bài nghe mới"
          >
            <Plus size={16} />
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-0.5 p-2 shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              background: tab === t.id ? 'var(--bg-secondary)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {!lessons?.length ? (
          <PanelEmpty
            icon={Headphones}
            message={tab === 'cambridge' ? 'Đang tải Cambridge packs...' : 'Chưa có bài nghe nào'}
            action={tab !== 'cambridge' ? { label: '+ Tạo bài nghe', onClick: () => setShowCreate(true) } : undefined}
          />
        ) : (
          lessons.map(lesson => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              active={lesson.id === activeLessonId}
              onSelect={() => setActiveLesson(lesson.id)}
              onDelete={async () => {
                if (!confirm(`Xóa bài "${lesson.title}"?`)) return
                await lessonRepo.delete(lesson.id)
                if (activeLessonId === lesson.id) setActiveLesson(null)
              }}
            />
          ))
        )}
      </div>

      {showCreate && <CreateLessonModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function LessonItem({
  lesson, active, onSelect, onDelete,
}: {
  lesson: Lesson; active: boolean; onSelect: () => void; onDelete: () => void
}) {
  const sentences = parseSentences(lesson.sentences)
  const due = sentences.filter(s => s.dueAt <= Date.now()).length
  const isCambridge = lesson.category === 'cambridge'

  return (
    <div
      className="group flex items-center rounded-lg mb-0.5 transition-colors"
      style={{ background: active ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent' }}
    >
      <button onClick={onSelect} className="flex-1 text-left px-3 py-2.5 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: active ? 'var(--color-primary)' : 'var(--text-primary)' }}
        >
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
            {sentences.length} câu
          </span>
          {isCambridge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#6366f122', color: '#818cf8' }}>
              CAM
            </span>
          )}
          {due > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: '#f9731622', color: '#f97316' }}>
              {due} ôn
            </span>
          )}
        </div>
      </button>
      {!isCambridge && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="mr-1 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ef444422]"
          style={{ color: 'var(--text-muted)' }}
          title="Xóa bài nghe"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}
