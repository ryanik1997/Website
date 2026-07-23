import { ChevronRight, FileText, Plus, Trash2 } from 'lucide-react'
import type { Lesson } from '@ryan/db'
import { lessonStats, lessonThumbLabel, thumbColor } from './listeningUtils'

export type ListeningLibraryViewMode = 'list' | 'grid' | 'compact'

interface Props {
  lesson: Lesson
  viewMode?: ListeningLibraryViewMode
  onOpen: () => void
  onAppendSentence: () => void
  onAppendText: () => void
  onDelete?: () => void
}

export default function ListeningUserLessonCard({
  lesson,
  viewMode = 'list',
  onOpen,
  onAppendSentence,
  onAppendText,
  onDelete,
}: Props) {
  const { count, due, studied } = lessonStats(lesson)
  const status = due > 0 ? `${due} cần ôn` : studied > 0 ? 'Đã học' : 'Mới'
  const sourceLabel = lesson.source === 'whisper' || lesson.source === 'import' ? 'Whisper' : 'Văn bản'

  if (viewMode === 'compact') {
    return (
      <div
        className="listening-bao-card group flex items-center gap-3 rounded-xl px-3 py-3 transition-shadow hover:shadow-sm"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
          style={{ background: thumbColor(lesson.id) }}
        >
          {lessonThumbLabel(lesson)}
        </div>

        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h4 className="truncate text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {lesson.title}
          </h4>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span>{count} câu</span>
            <span aria-hidden>·</span>
            <span>{sourceLabel}</span>
            <span aria-hidden>·</span>
            <span style={{ color: due > 0 ? 'var(--color-accent)' : undefined }}>{status}</span>
          </p>
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg p-2 transition-colors hover:opacity-80"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          title="Mở bài"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div
        className="listening-bao-card group flex h-full flex-col rounded-[18px] p-4 transition-shadow hover:shadow-md"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
            style={{ background: thumbColor(lesson.id) }}
          >
            {lessonThumbLabel(lesson)}
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: due > 0
                ? 'color-mix(in srgb, var(--color-accent) 14%, var(--bg-secondary))'
                : 'color-mix(in srgb, var(--color-primary) 12%, var(--bg-secondary))',
              color: due > 0 ? 'var(--color-accent)' : 'var(--color-primary)',
            }}
          >
            {status}
          </span>
        </div>

        <button type="button" onClick={onOpen} className="mb-4 text-left">
          <h4
            className="line-clamp-2 text-sm font-bold uppercase tracking-wide"
            style={{ color: 'var(--text-primary)' }}
          >
            {lesson.title}
          </h4>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {count} câu · {sourceLabel}
            {lesson.topic ? ` · ${lesson.topic}` : ''}
          </p>
        </button>

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAppendSentence}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
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
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
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
              className="rounded-lg p-2"
              style={{ color: 'var(--color-accent)' }}
              title="Xóa bài"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="ml-auto rounded-lg p-2 transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            title="Mở bài"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="listening-bao-card group flex flex-wrap items-center gap-3 rounded-[14px] px-4 py-4 transition-shadow hover:shadow-md"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div
        className="h-14 w-14 shrink-0 rounded-xl text-sm font-black text-white sm:h-16 sm:w-16 flex items-center justify-center"
        style={{ background: thumbColor(lesson.id) }}
      >
        {lessonThumbLabel(lesson)}
      </div>

      <button type="button" onClick={onOpen} className="min-w-[140px] flex-1 text-left">
        <h4
          className="truncate text-sm font-bold uppercase tracking-wide sm:text-base"
          style={{ color: 'var(--text-primary)' }}
        >
          {lesson.title}
        </h4>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs" style={{ color: 'var(--text-muted)' }}>
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

      <div className="flex w-full flex-wrap items-center gap-1.5 sm:ml-auto sm:w-auto">
        <button
          type="button"
          onClick={onAppendSentence}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
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
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
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
            className="rounded-lg p-2 opacity-70 transition-opacity group-hover:opacity-100"
            style={{ color: 'var(--color-accent)' }}
            title="Xóa bài"
          >
            <Trash2 size={15} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg p-2 transition-colors hover:opacity-80"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          title="Mở bài"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
