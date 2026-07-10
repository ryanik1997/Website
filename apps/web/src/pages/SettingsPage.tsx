import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Palette, Bot, User, Mail, MessageCircle, ExternalLink, Check, Bell, Database, Download, Upload, Cloud, LoaderCircle, Headphones, Sparkles, Camera } from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { db } from '@ryan/db'
import { canUse, type Plan, type Feature } from '@ryan/core'
import { THEMES, getTheme, setTheme, type Theme } from '../lib/theme'
import { SUPPORT_EMAIL, supportMailto } from '../lib/contact'
import { supabase } from '../lib/supabase'
import AiSettingsPanel from '../features/settings/AiSettingsPanel'
import { useNotifications } from '../features/notifications/useNotifications'
import { estimateBackupSize, exportBackup } from '../features/settings/backupRestore'
import ConfirmRestoreModal from '../features/settings/ConfirmRestoreModal'
import { useSyncManager, formatSyncTime } from '../features/auth/useSyncManager'
import ListeningTtsStatusBadge from '../features/listening/ListeningTtsStatusBadge'

type Tab = 'appearance' | 'ai' | 'account'

const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: 'appearance', label: 'Giao diện', icon: Palette },
  { id: 'ai',         label: 'AI',        icon: Bot },
  { id: 'account',    label: 'Tài khoản', icon: User },
]

const PLAN_META: Record<Plan, { label: string; color: string; desc: string }> = {
  free:     { label: 'Free',     color: '#94a3b8', desc: 'Từ vựng cơ bản + cài đặt' },
  trial:    { label: 'Trial',    color: '#f59e0b', desc: 'Dùng thử AI 5 lần/ngày' },
  basic:    { label: 'Basic',    color: '#6366f1', desc: 'SRS + backup, không AI' },
  pro:      { label: 'Pro',      color: '#8b5cf6', desc: 'AI Writing + MindMap 20 lần/ngày' },
  lifetime: { label: 'Lifetime', color: '#22c55e', desc: 'Toàn bộ tính năng, không giới hạn' },
}

const FEATURE_LABELS: Partial<Record<Feature, string>> = {
  sentence_patterns: 'Mẫu câu',
  vocab_basic: 'Từ vựng cơ bản',
  settings: 'Cài đặt',
  vocab_srs: 'SRS ôn tập',
  review_reminder: 'Nhắc ôn tập',
  backup: 'Sao lưu',
  export: 'Xuất dữ liệu',
  writing_ai: 'AI chấm Writing',
  mindmap_ai: 'AI MindMap',
  dictionary_ai: 'AI Từ điển',
  ai_router: 'AI Router',
  all: 'Tất cả tính năng',
}

const ALL_FEATURES: Feature[] = [
  'vocab_basic', 'vocab_srs', 'writing_ai', 'mindmap_ai', 'dictionary_ai', 'backup', 'export', 'review_reminder',
]

const CONTACTS = [
  {
    icon: Mail,
    label: 'Email hỗ trợ',
    value: SUPPORT_EMAIL,
    href: supportMailto(),
  },
  {
    icon: MessageCircle,
    label: 'Zalo / Messenger',
    value: 'Liên hệ nâng cấp gói',
    href: supportMailto('Nâng cấp gói Ryan English'),
  },
]

function tabFromParam(value: string | null): Tab {
  if (value === 'ai' || value === 'account' || value === 'appearance') return value
  return 'appearance'
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => tabFromParam(searchParams.get('tab')))
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const { user } = useAuth()

  function selectTab(next: Tab) {
    setTab(next)
    setSearchParams(next === 'appearance' ? {} : { tab: next }, { replace: true })
  }

  const plan = useLiveQuery(
    () => db.settings.get('plan').then(s => (s?.value as Plan) ?? 'free'),
    [],
  ) ?? 'free'

  const planExpiresAt = useLiveQuery(
    () => db.settings.get('plan_expires_at').then(s => (s?.value as string | null) ?? null),
    [],
  )

  function handleThemeChange(t: Theme) {
    setTheme(t)
    setThemeState(t)
  }

  const planMeta = PLAN_META[plan]
  const now = Date.now()
  const expired = planExpiresAt ? new Date(planExpiresAt).getTime() < now : false
  const daysLeft = planExpiresAt && !expired
    ? Math.ceil((new Date(planExpiresAt).getTime() - now) / 86_400_000)
    : null

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Cài đặt</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Giao diện, AI và thông tin tài khoản
          </p>
        </header>

        {/* Tab bar */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => selectTab(id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: tab === id ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent',
                color: tab === id ? 'var(--color-primary)' : 'var(--text-muted)',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {tab === 'appearance' && (
            <AppearanceTab theme={theme} onChange={handleThemeChange} />
          )}
          {tab === 'ai' && (
            <AiSettingsPanel />
          )}
          {tab === 'account' && (
            <AccountTab
              user={user}
              plan={plan}
              planMeta={planMeta}
              planExpiresAt={planExpiresAt ?? null}
              expired={expired}
              daysLeft={daysLeft}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function AppearanceTab({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
  const {
    permission,
    isSupported,
    isEnabled,
    reminderTime,
    requestAndSchedule,
    cancelReminder,
    setReminderTime,
  } = useNotifications()

  const statusLabel = !isSupported
    ? 'Trình duyệt không hỗ trợ'
    : permission === 'denied'
      ? 'Đã chặn'
      : isEnabled
        ? 'Đã bật'
        : 'Chưa bật'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chủ đề giao diện</p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Chọn chế độ sáng / tối vừa / tối. Lưu tự động trên thiết bị này.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all"
              style={{
                borderColor: theme === t.id ? 'var(--color-primary)' : 'var(--border-color)',
                background: theme === t.id
                  ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                  : 'var(--bg-secondary)',
              }}
            >
              {theme === t.id && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <Check size={12} className="text-white" />
                </span>
              )}
              <div
                className="w-full h-16 rounded-lg overflow-hidden border"
                style={{ borderColor: t.preview.bg, background: t.preview.bg }}
              >
                <div className="flex gap-1.5 p-2">
                  <div className="w-8 h-10 rounded" style={{ background: t.preview.card }} />
                  <div className="flex-1 flex flex-col gap-1 pt-0.5">
                    <div className="h-1.5 rounded-full w-3/4" style={{ background: t.preview.text, opacity: 0.7 }} />
                    <div className="h-1.5 rounded-full w-1/2" style={{ background: t.preview.text, opacity: 0.3 }} />
                    <div className="h-3 w-10 rounded mt-1" style={{ background: t.preview.accent }} />
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium" style={{ color: theme === t.id ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                {t.icon} {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="pt-6 border-t flex flex-col gap-4"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
          >
            <Bell size={18} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Nhắc nhở ôn từ hàng ngày
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Trạng thái:{' '}
              <span style={{ color: isEnabled ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                {statusLabel}
              </span>
            </p>
          </div>
        </div>

        {isSupported && permission === 'granted' && isEnabled && (
          <div>
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Giờ nhắc
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        )}

        {isSupported && (
          <div className="flex flex-col sm:flex-row gap-2">
            {!isEnabled ? (
              <button
                type="button"
                onClick={() => void requestAndSchedule()}
                disabled={permission === 'denied'}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                Bật thông báo
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelReminder}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                }}
              >
                Tắt thông báo
              </button>
            )}
          </div>
        )}

        {permission === 'denied' && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Trình duyệt đã chặn thông báo. Vào Settings trình duyệt để bật lại.
          </p>
        )}

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Thông báo chỉ hiện khi bạn đang mở tab Ryan English.
        </p>
      </div>
    </div>
  )
}

function AccountTab({
  user,
  plan,
  planMeta,
  planExpiresAt,
  expired,
  daysLeft,
}: {
  user: ReturnType<typeof useAuth>['user']
  plan: Plan
  planMeta: (typeof PLAN_META)[Plan]
  planExpiresAt: string | null
  expired: boolean
  daysLeft: number | null
}) {
  const enabledFeatures = ALL_FEATURES.filter(f => canUse(plan, f))
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [profileErr, setProfileErr] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDisplayName((user?.user_metadata?.full_name as string | undefined) ?? '')
    setAvatarUrl((user?.user_metadata?.avatar_url as string | undefined) ?? '')
  }, [user?.id, user?.user_metadata])

  async function handleSaveProfile(overrides?: { displayName?: string; avatarUrl?: string }) {
    if (!user) return

    const nextName = (overrides?.displayName ?? displayName).trim()
    const nextAvatar = (overrides?.avatarUrl ?? avatarUrl).trim()

    setSavingProfile(true)
    setProfileMsg(null)
    setProfileErr(null)

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: nextName || null,
        avatar_url: nextAvatar || null,
      },
    })

    if (authError) {
      setSavingProfile(false)
      setProfileErr(authError.message)
      return
    }

    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .update({
        display_name: nextName || null,
        avatar_url: nextAvatar || null,
      })
      .eq('id', user.id)

    setSavingProfile(false)

    if (profileError) {
      setProfileErr(profileError.message)
      return
    }

    setProfileMsg('Đã cập nhật thông tin tài khoản.')
  }

  async function handleAvatarPicked(file: File) {
    if (!file.type.startsWith('image/')) {
      setProfileErr('Chỉ hỗ trợ file ảnh.')
      return
    }
    if (file.size > 1_500_000) {
      setProfileErr('Ảnh quá lớn. Hãy chọn file dưới 1.5MB.')
      return
    }

    setProfileErr(null)
    setProfileMsg(null)

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(new Error('Không đọc được file ảnh.'))
      reader.readAsDataURL(file)
    })

    setAvatarUrl(dataUrl)
    await handleSaveProfile({ avatarUrl: dataUrl })
  }

  return (
    <div className="flex flex-col gap-6">
      <section
        className="rounded-xl p-4 flex flex-col gap-5"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {(avatarUrl || user?.user_metadata?.avatar_url) ? (
              <img
                src={avatarUrl || String(user?.user_metadata?.avatar_url ?? '')}
                className="w-16 h-16 rounded-full shrink-0 object-cover"
                alt=""
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ background: 'var(--color-primary)' }}
              >
                {((displayName || (user?.user_metadata?.full_name as string | undefined) || user?.email || '?')[0] ?? '?').toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -right-1 -bottom-1 h-7 w-7 rounded-full border flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              title="Chọn ảnh từ máy"
            >
              <Camera size={13} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) void handleAvatarPicked(file)
                e.target.value = ''
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {displayName.trim() || user?.user_metadata?.full_name || 'Người dùng'}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Tên hiển thị</span>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Nhập tên hiển thị"
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Ảnh đại diện URL</span>
            <input
              type="url"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border px-3 py-2.5 text-sm"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void handleSaveProfile()}
            disabled={!user || savingProfile}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            {savingProfile ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                Đang lưu...
              </>
            ) : 'Lưu thông tin'}
          </button>

          {profileMsg && (
            <p className="text-xs" style={{ color: 'var(--color-primary)' }}>{profileMsg}</p>
          )}
          {profileErr && (
            <p className="text-xs" style={{ color: 'var(--color-accent)' }}>{profileErr}</p>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Chọn ảnh từ máy sẽ tự động lưu avatar. Nếu sửa tên hoặc URL, nhấn Lưu thông tin để cập nhật tài khoản.
          </p>
        </div>
      </section>

      {/* User card */}
      <section className="flex items-center gap-4">
        {user?.user_metadata?.avatar_url ? (
          <img src={user.user_metadata.avatar_url} className="w-14 h-14 rounded-full shrink-0" alt="" />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: 'var(--color-primary)' }}
          >
            {(user?.user_metadata?.full_name ?? user?.email ?? '?')[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {user?.user_metadata?.full_name ?? 'Người dùng'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>
      </section>

      {/* Plan card */}
      <section
        className="rounded-xl p-4"
        style={{ background: `color-mix(in srgb, ${planMeta.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${planMeta.color} 25%, transparent)` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold" style={{ color: planMeta.color }}>
            Gói {planMeta.label}
          </span>
          {planExpiresAt ? (
            <span className="text-xs" style={{ color: expired ? '#ef4444' : 'var(--text-muted)' }}>
              {expired
                ? '⚠ Đã hết hạn'
                : daysLeft === 0
                  ? 'Hết hạn hôm nay'
                  : daysLeft! <= 7
                    ? `Còn ${daysLeft} ngày`
                    : `Hết hạn ${new Date(planExpiresAt).toLocaleDateString('vi-VN')}`}
            </span>
          ) : plan !== 'free' ? (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Vĩnh viễn</span>
          ) : null}
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{planMeta.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {enabledFeatures.map(f => (
            <span
              key={f}
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            >
              {FEATURE_LABELS[f] ?? f}
            </span>
          ))}
        </div>
      </section>

      <CloudSyncSection />

      <BackupSection />

      <KokoroSetupSection />

      {/* Contact */}
      <section>
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Liên hệ & hỗ trợ</p>
        <div className="flex flex-col gap-2">
          {CONTACTS.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
              >
                <Icon size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
              <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
            </a>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Muốn nâng cấp gói? Liên hệ admin để được kích hoạt. Sau khi nâng cấp, đăng xuất và đăng nhập lại để cập nhật.
        </p>
      </section>
    </div>
  )
}

function CloudSyncSection() {
  const { syncState, lastSyncAt, triggerSync, error } = useSyncManager()
  const { signOut } = useAuth()
  const syncing = syncState === 'syncing'
  const sessionBroken = Boolean(
    error && /phiên đăng nhập|hết hạn|đăng xuất/i.test(error),
  )

  return (
    <section
      className="rounded-xl p-4 flex flex-col gap-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
        >
          <Cloud size={18} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Đồng bộ đám mây
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Lần cuối: {formatSyncTime(lastSyncAt)}
            {syncState === 'done' && !error ? ' · OK' : ''}
          </p>
          {syncState === 'error' && error && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-accent)' }}>
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={triggerSync}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary, #fff)' }}
        >
          {syncing ? (
            <>
              <LoaderCircle size={15} className="animate-spin" />
              Đang đồng bộ…
            </>
          ) : (
            'Đồng bộ ngay'
          )}
        </button>
        {sessionBroken && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              background: 'var(--bg-card)',
            }}
          >
            Đăng xuất & đăng nhập lại
          </button>
        )}
      </div>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Đồng bộ hai chiều (LWW): từ vựng, SRS, bài viết, mindmap, tiến độ Reading/Listening.
        Khi offline xong online, bản cập nhật mới hơn thắng.
      </p>
    </section>
  )
}

function BackupSection() {
  const [sizeEstimate, setSizeEstimate] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void estimateBackupSize().then(setSizeEstimate)
  }, [])

  async function handleExport() {
    setExporting(true)
    setExportMsg(null)
    try {
      await exportBackup()
      setExportMsg('Đã xuất file backup!')
      void estimateBackupSize().then(setSizeEstimate)
    } catch {
      setExportMsg('Xuất backup thất bại. Thử lại sau.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section
      className="rounded-xl p-4 flex flex-col gap-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
        >
          <Database size={18} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Dữ liệu & Backup
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {sizeEstimate ?? 'Đang ước tính…'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleExport()}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-opacity"
        style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
      >
        <Download size={15} />
        {exporting ? 'Đang xuất…' : 'Xuất backup'}
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-90"
        style={{
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          background: 'var(--bg-card)',
        }}
      >
        <Upload size={15} />
        Nhập backup
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) setRestoreFile(file)
          e.target.value = ''
        }}
      />

      {exportMsg && (
        <p className="text-xs text-center" style={{ color: 'var(--color-primary)' }}>
          {exportMsg}
        </p>
      )}

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Backup Web: từ vựng, bài viết, mindmap, cài đặt (không gồm file âm thanh).
        Cũng nhận file <strong>Electron</strong> (Vocabulary export v2 / legacy flashcard) — merge vào web rồi bấm Đồng bộ đám mây.
      </p>

      {restoreFile && (
        <ConfirmRestoreModal
          file={restoreFile}
          onClose={() => {
            setRestoreFile(null)
            void estimateBackupSize().then(setSizeEstimate)
          }}
        />
      )}
    </section>
  )
}

function KokoroSetupSection() {
  return (
    <section
      className="rounded-xl p-4 flex flex-col gap-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
        >
          <Headphones size={18} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Giọng đọc Kokoro local
            </p>
            <ListeningTtsStatusBadge compact />
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Cài Kokoro trên máy để Listening có giọng đọc tự nhiên hơn. Nếu chưa cài, app vẫn chạy bình thường với giọng trình duyệt.
          </p>
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Cài nhanh trên Windows
        </p>
        <div className="flex flex-col gap-3">
          {[
            'Cài Python 3.10, 3.11 hoặc 3.12 và bật Add Python to PATH.',
            'Trong thư mục dự án, chạy file `server\\scripts\\install-kokoro-local.bat` một lần để cài môi trường Kokoro.',
            'Mỗi lần muốn dùng Kokoro, chạy `server\\scripts\\start-kokoro-local.bat`, rồi mở lại Listening.',
          ].map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                {index + 1}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
          File gửi cho user
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Để đơn giản nhất, gửi cả thư mục app cho user. User double-click <code>Cai-Kokoro.bat</code> một lần để cài, sau đó double-click <code>Bat-Kokoro.bat</code> mỗi khi muốn dùng giọng Kokoro.
        </p>
        <div
          className="rounded-lg px-3 py-2 text-sm font-mono"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          Cài đặt một lần: <code>Cai-Kokoro.bat</code>
        </div>
        <div
          className="rounded-lg px-3 py-2 text-sm font-mono"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          Bật mỗi lần dùng: <code>Bat-Kokoro.bat</code>
        </div>
        <div
          className="rounded-lg px-3 py-2 text-sm font-mono"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          Nếu dùng CMD: <code>server\scripts\install-kokoro-local.bat</code> rồi <code>server\scripts\start-kokoro-local.bat</code>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Lưu ý: user cần cài Node.js + Python 3.10-3.12 trước. Khi chạy <code>Bat-Kokoro.bat</code>, hãy giữ cửa sổ terminal mở trong lúc dùng web app.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Khi Kokoro chạy
            </p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Badge sẽ hiện <strong style={{ color: 'var(--text-primary)' }}>Kokoro local</strong>. Các nút nghe trong Listening sẽ ưu tiên audio từ Kokoro.
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Headphones size={15} style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Nếu chưa cài
            </p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Badge sẽ hiện <strong style={{ color: 'var(--text-primary)' }}>Browser voice</strong>. App tự động dùng giọng của trình duyệt, không bị lỗi.
          </p>
        </div>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Nếu chạy file cài đặt mà vẫn không lên Kokoro, kiểm tra Python đã cài đúng chưa rồi mở lại `server\\README.md` để xem phần lỗi thường gặp.
      </p>
    </section>
  )
}
