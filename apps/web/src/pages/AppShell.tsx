import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  PenLine,
  Headphones,
  Home,
  Settings,
  LogOut,
  GitBranch,
  Shield,
  Cloud,
  LoaderCircle,
  AlertCircle,
  Blocks,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '../features/auth/AuthContext'
import { SyncProvider, useSyncManager, formatSyncTime } from '../features/auth/useSyncManager'
import { usePlanSync } from '../features/auth/usePlanSync'
import DictionaryFAB from '../features/dictionary/DictionaryFAB'
import DictionaryModal from '../features/dictionary/DictionaryModal'
import { db } from '@ryan/db'
import { setTheme } from '../lib/theme'
import { useNotifications } from '../features/notifications/useNotifications'
import { useSrsReviewPopup } from '../features/vocab/reminder/useSrsReviewPopup'
import SrsReviewReminderModal from '../features/vocab/reminder/SrsReviewReminderModal'
import GlobalCatalogSync from '../features/catalog/GlobalCatalogSync'

const NAV: Array<{
  to: string
  icon: typeof Home
  label: string
}> = [
  { to: '/app/home', icon: Home, label: 'Tổng quan' },
  { to: '/app/vocab', icon: BookOpen, label: 'Từ vựng' },
  { to: '/app/writing', icon: PenLine, label: 'Viết' },
  { to: '/app/listening', icon: Headphones, label: 'Nghe' },
  { to: '/app/exam', icon: ClipboardCheck, label: 'Luyện thi' },
  { to: '/app/sentence-structure', icon: Blocks, label: 'Cấu trúc câu' },
  { to: '/app/mindmap', icon: GitBranch, label: 'MindMap' },
  { to: '/app/settings', icon: Settings, label: 'Cài đặt' },
]

export default function AppShell() {
  return (
    <SyncProvider>
      <AppShellInner />
    </SyncProvider>
  )
}

function AppShellInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('ryan-sidebar-collapsed') === '1',
  )
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { syncState, lastSyncAt, triggerSync, error } = useSyncManager()
  usePlanSync()
  useNotifications()
  const srsPopup = useSrsReviewPopup(syncState)
  const isAdmin = useLiveQuery(
    () => db.settings.get('is_admin').then(s => s?.value as boolean ?? false),
    [],
  )
  const plan = useLiveQuery(
    () => db.settings.get('plan').then(s => (s?.value as string) ?? 'free'),
    [],
  )
  const planExpiresAt = useLiveQuery(
    () => db.settings.get('plan_expires_at').then(s => (s?.value as string | null) ?? null),
    [],
  )

  useEffect(() => {
    localStorage.setItem('ryan-sidebar-collapsed', sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      <aside
        className={`flex flex-col shrink-0 border-r transition-[width] duration-200 ${
          sidebarCollapsed ? 'w-20' : 'w-52'
        }`}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: 'var(--bg-primary)',
              }}
            >
              R
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-none truncate" style={{ color: 'var(--text-primary)' }}>
                  Ryan English
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  IELTS · AI · SRS
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to !== '/app/writing'}
              className={({ isActive }) =>
                `flex items-center px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                } ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`
              }
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={17} className="shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 truncate">{label}</span>}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                `flex items-center px-2.5 py-2 rounded-lg text-sm font-medium transition-colors mt-0.5 ${
                  isActive
                    ? 'text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                } ${sidebarCollapsed ? 'justify-center' : 'gap-2.5'}`
              }
              title={sidebarCollapsed ? 'Admin' : undefined}
            >
              <Shield size={17} className="shrink-0" />
              {!sidebarCollapsed && <span className="flex-1">Admin</span>}
            </NavLink>
          )}
        </nav>

        <ThemeSwitcher compact={sidebarCollapsed} />

        {user && (
          <SyncStatusIndicator
            syncState={syncState}
            lastSyncAt={lastSyncAt}
            error={error}
            onRetry={triggerSync}
            compact={sidebarCollapsed}
          />
        )}

        <div className="p-2.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            type="button"
            onClick={() => navigate('/app/settings?tab=account')}
            className={`w-full px-1 mb-2 flex items-center rounded-xl transition-colors hover:bg-[var(--bg-secondary)] ${sidebarCollapsed ? 'justify-center py-1.5' : 'gap-2.5 py-1.5'}`}
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full shrink-0" alt="" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                {(user?.user_metadata?.full_name ?? user?.email ?? '?')[0].toUpperCase()}
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.user_metadata?.full_name ?? 'Người dùng'}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>
            )}
          </button>

          {!sidebarCollapsed && <div className="h-px mb-2 mx-1" style={{ background: 'var(--border-color)' }} />}

          {!sidebarCollapsed && <PlanStatus plan={plan ?? 'free'} expiresAt={planExpiresAt ?? null} />}

          <button
            type="button"
            onClick={signOut}
            title="Đăng xuất"
            className={`group flex px-2 py-1.5 rounded-lg w-full transition-colors mt-1 hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] ${
              sidebarCollapsed ? 'justify-center items-center' : 'items-center gap-1.5'
            }`}
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={14} className="shrink-0" />
            {!sidebarCollapsed && (
              <span
                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--color-accent)' }}
              >
                Đăng xuất
              </span>
            )}
          </button>
        </div>

        <div className="p-2.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Mở rộng thanh chức năng' : 'Thu gọn thanh chức năng'}
            title={sidebarCollapsed ? 'Mở rộng thanh chức năng' : 'Thu gọn thanh chức năng'}
            onClick={() => setSidebarCollapsed(value => !value)}
            className="h-8 w-full rounded-lg border flex items-center justify-center transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden select-text">
        <Outlet />
      </main>

      <GlobalCatalogSync />
      <DictionaryFAB />
      <DictionaryModal />
      <SrsReviewReminderModal
        open={srsPopup.open}
        dueCount={srsPopup.dueCount}
        dueLoading={srsPopup.dueLoading}
        onClose={srsPopup.dismiss}
      />
    </div>
  )
}

function SyncStatusIndicator({
  syncState,
  lastSyncAt,
  error,
  onRetry,
  compact,
}: {
  syncState: ReturnType<typeof useSyncManager>['syncState']
  lastSyncAt: string | null
  error: string | null
  onRetry: () => void
  compact?: boolean
}) {
  if (compact) {
    if (syncState === 'syncing') {
      return (
        <div className="px-3 pb-2 flex justify-center" style={{ color: 'var(--text-muted)' }} title="Đang đồng bộ">
          <LoaderCircle size={16} className="animate-spin shrink-0" />
        </div>
      )
    }

    if (syncState === 'error') {
      return (
        <button
          type="button"
          onClick={onRetry}
          className="px-3 pb-2 flex justify-center w-full transition-opacity hover:opacity-80"
          title={error ?? 'Lỗi đồng bộ'}
        >
          <AlertCircle size={16} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
        </button>
      )
    }

    return (
      <div className="px-3 pb-2 flex justify-center" style={{ color: 'var(--text-muted)' }} title="Đã đồng bộ">
        <Cloud size={16} className="shrink-0" />
      </div>
    )
  }

  if (syncState === 'syncing') {
    return (
      <div className="px-3 pb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        <LoaderCircle size={16} className="animate-spin shrink-0" />
        <span className="text-xs">Đang đồng bộ…</span>
      </div>
    )
  }

  if (syncState === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="px-3 pb-2 flex flex-col gap-1 w-full text-left transition-opacity hover:opacity-80"
        title={error ?? 'Lỗi đồng bộ'}
      >
        <span className="flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
          <span className="text-xs" style={{ color: 'var(--color-accent)' }}>Lỗi đồng bộ — bấm thử lại</span>
        </span>
        {error && (
          <span className="text-[10px] leading-snug pl-6 line-clamp-3" style={{ color: 'var(--text-muted)' }}>
            {error}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="px-3 pb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
      <Cloud size={16} className="shrink-0" />
      <span className="text-xs">Đã đồng bộ lúc {formatSyncTime(lastSyncAt)}</span>
    </div>
  )
}

const PLAN_STYLE: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'var(--text-muted)' },
  trial: { label: 'Trial', color: 'var(--color-accent)' },
  basic: { label: 'Basic', color: 'var(--color-primary)' },
  pro: { label: 'Pro', color: 'var(--color-primary)' },
  lifetime: { label: 'Lifetime', color: 'var(--color-accent)' },
}

function PlanStatus({ plan, expiresAt }: { plan: string; expiresAt: string | null }) {
  const cfg = PLAN_STYLE[plan] ?? PLAN_STYLE.free
  const now = Date.now()
  const expired = expiresAt ? new Date(expiresAt).getTime() < now : false
  const daysLeft = expiresAt && !expired
    ? Math.ceil((new Date(expiresAt).getTime() - now) / 86_400_000)
    : null

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
      style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-secondary))' }}
    >
      <span className="text-[11px] font-bold shrink-0" style={{ color: cfg.color }}>
        {cfg.label.toUpperCase()}
      </span>
      {expiresAt && (
        <span className="text-[10px]" style={{ color: expired ? 'var(--color-accent)' : 'var(--text-muted)' }}>
          {expired
            ? 'Hết hạn'
            : daysLeft === 0
              ? 'Hết hạn hôm nay!'
              : daysLeft !== null && daysLeft <= 7
                ? `còn ${daysLeft} ngày`
                : new Date(expiresAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
        </span>
      )}
      {!expiresAt && plan !== 'free' && (
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Vĩnh viễn</span>
      )}
    </div>
  )
}

function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const DOTS = [
    { id: 'light' as const, color: 'var(--bg-secondary)', border: 'var(--border-color)', label: 'Sáng' },
    { id: 'mid' as const, color: '#1e1e2e', border: '#313244', label: 'Tối nhẹ' },
    { id: 'dark' as const, color: '#0a0a0f', border: '#2a2a3a', label: 'Tối' },
  ]
  const [active, setActive] = useState(() => localStorage.getItem('ryan-theme') ?? 'light')

  return (
    <div
      className={`px-3 py-2.5 flex border-t ${compact ? 'flex-col items-center gap-2' : 'items-center gap-2'}`}
      style={{ borderColor: 'var(--border-color)' }}
    >
      {!compact && <span className="text-[11px] flex-1" style={{ color: 'var(--text-muted)' }}>Giao diện</span>}
      <div className="flex gap-1.5">
        {DOTS.map(d => (
          <button
            key={d.id}
            type="button"
            title={d.label}
            onClick={() => { setTheme(d.id); setActive(d.id) }}
            className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: d.color,
              borderColor: active === d.id ? 'var(--color-primary)' : d.border,
              outline: active === d.id ? '2px solid color-mix(in srgb, var(--color-primary) 40%, transparent)' : 'none',
              outlineOffset: '1px',
            }}
          />
        ))}
      </div>
    </div>
  )
}
