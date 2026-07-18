import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Bell, BookOpen, CheckCheck, Flame, Search, Sparkles, Target, Trash2, Trophy, X } from 'lucide-react'
import {
  clearReadAppNotifications,
  getAppNotifications,
  markAllAppNotificationsRead,
  markAppNotificationRead,
  removeAppNotification,
  subscribeAppNotifications,
  type AppNotification,
  type AppNotificationCategory,
} from './notificationStore'

const CATEGORY_META: Record<AppNotificationCategory, { label: string; icon: typeof Bell }> = {
  review: { label: 'Ôn tập', icon: BookOpen },
  goal: { label: 'Mục tiêu', icon: Target },
  streak: { label: 'Chuỗi học', icon: Flame },
  exam: { label: 'Luyện thi', icon: Sparkles },
  achievement: { label: 'Thành tích', icon: Trophy },
  content: { label: 'Bài học mới', icon: Sparkles },
  system: { label: 'Hệ thống', icon: Bell },
}

function relativeTime(at: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - at) / 60_000))
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days} ngày trước` : new Date(at).toLocaleDateString('vi-VN')
}

export default function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const [notifications, setNotifications] = useState(getAppNotifications)
  const [open, setOpen] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const unreadCount = notifications.filter(item => !item.readAt).length
  useEffect(() => subscribeAppNotifications(() => setNotifications(getAppNotifications())), [])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')
    return notifications.filter(item => {
      if (unreadOnly && item.readAt) return false
      return !normalized || `${item.title} ${item.message} ${CATEGORY_META[item.category].label}`.toLocaleLowerCase('vi').includes(normalized)
    })
  }, [notifications, query, unreadOnly])

  function openItem(item: AppNotification) {
    markAppNotificationRead(item.id)
    if (item.actionUrl) {
      setOpen(false)
      navigate(item.actionUrl)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative flex items-center rounded-lg transition-colors hover:bg-[var(--bg-secondary)] ${compact ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'}`}
        style={{ color: 'var(--text-muted)' }}
        title="Thông báo"
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
      >
        <Bell size={17} />
        {!compact && <span className="text-sm font-medium">Thông báo</span>}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: 'var(--color-accent)', color: 'var(--bg-primary)' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal((
        <div className="fixed inset-0 z-[9999] flex justify-end isolate" role="dialog" aria-modal="true" aria-label="Trung tâm thông báo">
          <button type="button" className="absolute inset-0" style={{ background: 'color-mix(in srgb, var(--text-primary) 28%, transparent)' }} onClick={() => setOpen(false)} aria-label="Đóng" />
          <section className="relative h-full w-full max-w-md flex flex-col shadow-2xl" style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            <header className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Thông báo</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{unreadCount ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã xem hết thông báo'}</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]" aria-label="Đóng"><X size={19} /></button>
              </div>
              <div className="relative mt-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm thông báo..." className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button type="button" onClick={() => setUnreadOnly(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: !unreadOnly ? 'color-mix(in srgb, var(--color-primary) 14%, transparent)' : 'var(--bg-secondary)', color: !unreadOnly ? 'var(--color-primary)' : 'var(--text-muted)' }}>Tất cả</button>
                <button type="button" onClick={() => setUnreadOnly(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: unreadOnly ? 'color-mix(in srgb, var(--color-primary) 14%, transparent)' : 'var(--bg-secondary)', color: unreadOnly ? 'var(--color-primary)' : 'var(--text-muted)' }}>Chưa đọc</button>
                <button type="button" onClick={markAllAppNotificationsRead} disabled={!unreadCount} className="ml-auto flex items-center gap-1 text-xs disabled:opacity-40" style={{ color: 'var(--color-primary)' }}><CheckCheck size={14} /> Đọc tất cả</button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-3">
              {visible.length === 0 ? (
                <div className="h-full min-h-64 flex flex-col items-center justify-center text-center px-8"><Bell size={34} style={{ color: 'var(--text-muted)' }} /><p className="font-semibold mt-3">Không có thông báo</p><p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Thông báo ôn tập, mục tiêu và kết quả học sẽ xuất hiện tại đây.</p></div>
              ) : visible.map(item => {
                const meta = CATEGORY_META[item.category]
                const Icon = meta.icon
                return (
                  <article key={item.id} className="group relative rounded-xl border p-3 mb-2 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)]" style={{ borderColor: item.readAt ? 'var(--border-color)' : 'var(--color-primary)', background: item.readAt ? 'transparent' : 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }} onClick={() => openItem(item)}>
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}><Icon size={17} /></div>
                      <div className="min-w-0 flex-1 pr-7"><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>{meta.label}</span>{!item.readAt && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />}</div><h3 className="text-sm font-semibold mt-0.5">{item.title}</h3><p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>{item.message}</p><div className="flex items-center justify-between mt-2"><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{relativeTime(item.createdAt)}</span>{item.actionLabel && <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{item.actionLabel} →</span>}</div></div>
                    </div>
                    <button type="button" onClick={event => { event.stopPropagation(); removeAppNotification(item.id) }} className="absolute right-2 top-2 p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-[var(--bg-card)]" aria-label="Xóa thông báo"><Trash2 size={14} /></button>
                  </article>
                )
              })}
            </div>
            <footer className="p-3 border-t flex justify-end" style={{ borderColor: 'var(--border-color)' }}><button type="button" onClick={clearReadAppNotifications} className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Xóa các thông báo đã đọc</button></footer>
          </section>
        </div>
      ), document.body)}
    </>
  )
}
