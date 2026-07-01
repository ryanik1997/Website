import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown, Eye, Loader2, Trash2, X,
} from 'lucide-react'

export type LessonTab = 'practice' | 'transcript' | 'shadowing'

const TABS: { id: LessonTab; label: string; icon?: typeof Eye }[] = [
  { id: 'practice', label: 'Luyện tập' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'shadowing', label: 'Shadowing', icon: Eye },
]

interface Props {
  active: LessonTab
  onChange: (tab: LessonTab) => void
  canDelete?: boolean
  deleting?: boolean
  onDelete?: () => void
}

export default function ListeningTabs({
  active,
  onChange,
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
      <div
        className="relative mb-6 min-w-0 overflow-x-hidden border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 pr-14">
          {TABS.map(t => {
            const isActive = active === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap pb-3 text-sm font-bold uppercase tracking-wide transition-colors"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {Icon && <Icon size={14} />}
                {t.label}
              </button>
            )
          })}
        </div>

        <div ref={menuRef} className="absolute bottom-2 right-0">
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
            aria-label="Tùy chọn bài học"
          >
            <ChevronDown size={16} className={menuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-11 z-20 min-w-[220px] rounded-2xl p-2 shadow-2xl"
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
                  style={{ color: '#dc2626' }}
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
