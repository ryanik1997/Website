import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Loader2, Trash2, X } from 'lucide-react'
import type { Lesson } from '@ryan/db'
import { lessonThumbLabel, thumbColor } from './listeningUtils'

interface Props {
  lesson: Lesson
  canDelete?: boolean
  deleting?: boolean
  onDelete?: () => void
}

export default function ListeningLessonHeader({
  lesson,
  canDelete = false,
  deleting = false,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setConfirmOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function openDeleteConfirm() {
    setMenuOpen(false)
    setConfirmOpen(true)
  }

  return (
    <>
      <div className="mb-6 flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
          style={{ background: thumbColor(lesson.id) }}
        >
          {lessonThumbLabel(lesson)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="text-xl font-black uppercase leading-tight tracking-tight sm:text-2xl"
                style={{ color: 'var(--text-primary)' }}
              >
                {lesson.title}
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Listening Dictation Practice
              </p>
            </div>

            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(open => !open)}
                className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold transition-colors"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
                aria-label="Tùy chọn bài học"
              >
                Tùy chọn
                <ChevronDown size={16} className={menuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-12 z-20 min-w-[220px] rounded-2xl p-2 shadow-2xl"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={openDeleteConfirm}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors"
                      style={{
                        color: '#dc2626',
                        background: 'transparent',
                      }}
                    >
                      <Trash2 size={15} />
                      Xóa bài học
                    </button>
                  ) : (
                    <div
                      className="rounded-xl px-3 py-2.5 text-sm"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Chỉ có thể xóa bài nghe do bạn tự tạo.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            onClick={event => event.stopPropagation()}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Xóa bài học
              </h3>
              <button
                type="button"
                onClick={() => !deleting && setConfirmOpen(false)}
                className="rounded p-1"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Bạn có chắc muốn xóa bài nghe này không?
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Hành động này không thể hoàn tác.
              </p>
            </div>

            <div
              className="flex items-center justify-end gap-2 border-t px-5 py-4"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#dc2626' }}
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
