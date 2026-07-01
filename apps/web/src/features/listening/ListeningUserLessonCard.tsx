import { ChevronRight, Plus, Trash2, FileText } from 'lucide-react'
import type { Lesson } from '@ryan/db'
import { lessonStats, thumbColor, lessonThumbLabel } from './listeningUtils'

interface Props {
  lesson: Lesson
  onOpen: () => void
  onAppendSentence: () => void
  onAppendText: () => void
  onDelete?: () => void
}

export default function ListeningUserLessonCard({
  lesson,
  onOpen,
  onAppendSentence,
  onAppendText,
  onDelete,
}: Props) {
  const { count, due, studied } = lessonStats(lesson)
  const status = due > 0 ? `${due} cần ôn` : studied > 0 ? 'Đã học' : 'Mới'
  const sourceLabel = lesson.source === 'whisper' || lesson.source === 'import' ? 'Whisper' : 'Văn bản'

  return (
    <div
      className="group flex flex-wrap items-center gap-3 px-4 py-4 rounded-[14px] transition-shadow hover:shadow-md"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 text-sm font-black text-white"
        style={{ background: thumbColor(lesson.id) }}
      >
        {lessonThumbLabel(lesson)}
      </div>

      <button type="button" onClick={onOpen} className="flex-1 min-w-[140px] text-left">
        <h4
          className="text-sm sm:text-base font-bold uppercase tracking-wide truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {lesson.title}
        </h4>
        <p className="text-xs mt-1 flex flex-wrap items-center gap-x-2" style={{ color: 'var(--text-muted)' }}>
          <span>{count} câu</span>
          <span aria-hidden>·</span>
          <span>{sourceLabel}</span>
          {lesson.topic && (
            <>
              <span aria-hidden>·</span>
              <span>{lesson.topic}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span style={{ color: due > 0 ? 'var(--color-accent)' : undefined }}>{status}</span>
        </p>
      </button>

      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto sm:ml-auto">
        <button
          type="button"
          onClick={onAppendSentence}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
          style={{
            background: 'color-mix(in srgb, var(--color-accent) 14%, var(--bg-secondary))',
            color: 'var(--color-accent)',
          }}
        >
          <Plus size={12} />
          Thêm câu
        </button>
        <button
          type="button"
          onClick={onAppendText}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-secondary))',
            color: 'var(--color-primary)',
          }}
        >
          <FileText size={12} />
          Văn bản
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-accent)' }}
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