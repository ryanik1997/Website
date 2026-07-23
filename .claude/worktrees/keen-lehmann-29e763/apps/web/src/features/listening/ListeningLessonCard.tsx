import { ChevronRight, Trash2 } from 'lucide-react'
import type { Lesson } from '@ryan/db'
import { lessonStats, statusLabel, thumbColor, lessonThumbLabel } from './listeningUtils'

interface Props {
  lesson: Lesson
  onOpen: () => void
  onDelete?: () => void
}

export default function ListeningLessonCard({ lesson, onOpen, onDelete }: Props) {
  const isCambridge = lesson.category === 'cambridge'
  const { count, due, studied } = lessonStats(lesson)
  const status = statusLabel(due, studied)

  return (
    <div
      className="group flex items-center gap-4 px-4 py-4 rounded-[14px] transition-shadow hover:shadow-md"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: due > 0 ? 'var(--color-accent)' : 'transparent',
          boxShadow: due > 0 ? '0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent)' : undefined,
        }}
      />

      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 text-sm font-black text-white leading-tight text-center px-1"
        style={{ background: thumbColor(lesson.id) }}
      >
        {lessonThumbLabel(lesson)}
      </div>

      <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-left">
        <h4
          className="text-sm sm:text-base font-bold uppercase tracking-wide truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {lesson.title}
        </h4>
        <p className="text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5" style={{ color: 'var(--text-muted)' }}>
          <span>{count} câu</span>
          <span aria-hidden>·</span>
          <span>{isCambridge ? 'Cambridge' : 'Whisper'}</span>
          <span aria-hidden>·</span>
          <span style={{ color: due > 0 ? 'var(--color-accent)' : undefined }}>{status}</span>
        </p>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        {!isCambridge && onDelete && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
            title="Xóa bài"
          >
            <Trash2 size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          title="Mở bài"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}