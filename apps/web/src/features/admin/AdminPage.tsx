import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Shield, Search, X, Check, RefreshCw, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { db } from '@ryan/db'
import AdminPublishExamsPanel from './AdminPublishExamsPanel'

// ── Types ──────────────────────────────────────────────────────────────────

type Plan = 'free' | 'trial' | 'basic' | 'pro' | 'lifetime'
type Duration = '1m' | '3m' | '12m' | 'lifetime'

interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  plan: Plan
  plan_expires_at: string | null
  is_admin: boolean
}

interface PaymentRequest {
  id: string
  user_id: string
  user_email: string
  plan_id: string
  price: string
  status: 'pending' | 'activated' | 'cancelled'
  created_at: string
  activated_at: string | null
}

function UserAvatar({ profile }: { profile: Profile }) {
  const [imageFailed, setImageFailed] = useState(false)
  const label = profile.display_name ?? profile.email ?? '?'

  if (profile.avatar_url && !imageFailed) {
    return (
      <img
        src={profile.avatar_url}
        className="w-8 h-8 rounded-full shrink-0 object-cover"
        alt={`Avatar của ${label}`}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
      aria-label={`Avatar mặc định của ${label}`}
    >
      {label[0].toUpperCase()}
    </div>
  )
}

type AdminTab = 'users' | 'requests' | 'exams'

// ── Helpers ────────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<Plan, { label: string; color: string }> = {
  free:     { label: 'Free',     color: '#94a3b8' },
  trial:    { label: 'Trial',    color: '#f59e0b' },
  basic:    { label: 'Basic',    color: '#6366f1' },
  pro:      { label: 'Pro',      color: '#8b5cf6' },
  lifetime: { label: 'Lifetime', color: '#22c55e' },
}

const DURATIONS: { id: Duration; label: string; months: number | null }[] = [
  { id: '1m',       label: '1 tháng',   months: 1   },
  { id: '3m',       label: '3 tháng',   months: 3   },
  { id: '12m',      label: '1 năm',     months: 12  },
  { id: 'lifetime', label: 'Vĩnh viễn', months: null },
]

function calcExpiry(plan: Plan, dur: Duration): string | null {
  if (plan === 'free' || plan === 'lifetime' || dur === 'lifetime') return null
  const d = new Date()
  d.setMonth(d.getMonth() + (DURATIONS.find(x => x.id === dur)?.months ?? 1))
  return d.toISOString()
}

function calcExpiryFromPlan(planId: string): string | null {
  if (planId === 'lifetime' || planId === 'free') return null
  const d = new Date()
  if (planId === 'pro') {
    d.setMonth(d.getMonth() + 1)
    return d.toISOString()
  }
  d.setMonth(d.getMonth() + 12)
  return d.toISOString()
}

function planFromRequestId(planId: string): Plan {
  const valid: Plan[] = ['free', 'trial', 'basic', 'pro', 'lifetime']
  return valid.includes(planId as Plan) ? (planId as Plan) : 'pro'
}

function fmtExpiry(isoStr: string | null): string {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  const expired = d < new Date()
  return (expired ? '⚠ Hết hạn ' : '') + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isExpired(isoStr: string | null): boolean {
  return !!isoStr && new Date(isoStr) < new Date()
}

// ── Upgrade Modal ──────────────────────────────────────────────────────────

function UpgradeModal({
  profile, onClose, onSaved,
}: { profile: Profile; onClose: () => void; onSaved: (id: string, plan: Plan, expiresAt: string | null) => void }) {
  const [plan, setPlan]     = useState<Plan>(profile.plan)
  const [dur, setDur]       = useState<Duration>('12m')
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)

  const expiryPreview = calcExpiry(plan, dur)
  const needsDur = plan !== 'free' && plan !== 'lifetime'

  async function save() {
    setSaving(true)
    const expiresAt = calcExpiry(plan, dur)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ plan, plan_expires_at: expiresAt })
      .eq('id', profile.id)
    setSaving(false)
    if (error) { alert('Lỗi: ' + error.message); return }
    setDone(true)
    onSaved(profile.id, plan, expiresAt)
    setTimeout(onClose, 1400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl shadow-2xl"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Nâng cấp tài khoản
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {profile.display_name ?? profile.email}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {done ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#22c55e22' }}>
                <Check size={22} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#22c55e' }}>Đã cập nhật thành công!</p>
            </div>
          ) : (
            <>
              {/* Plan selector */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Gói dịch vụ</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.entries(PLAN_CONFIG) as [Plan, typeof PLAN_CONFIG[Plan]][]).map(([p, cfg]) => (
                    <button
                      key={p}
                      onClick={() => setPlan(p)}
                      className="py-2 rounded-lg text-xs font-semibold border transition-colors"
                      style={{
                        borderColor: plan === p ? cfg.color : 'var(--border-color)',
                        background: plan === p ? `${cfg.color}20` : 'var(--bg-secondary)',
                        color: plan === p ? cfg.color : 'var(--text-muted)',
                      }}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration (hidden for free/lifetime) */}
              {needsDur && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Thời hạn</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DURATIONS.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDur(d.id)}
                        className="py-2 rounded-lg text-xs font-medium border transition-colors"
                        style={{
                          borderColor: dur === d.id ? 'var(--color-primary)' : 'var(--border-color)',
                          background: dur === d.id ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'var(--bg-secondary)',
                          color: dur === d.id ? 'var(--color-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="rounded-xl px-4 py-3" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Gói mới</span>
                  <span className="font-semibold" style={{ color: PLAN_CONFIG[plan].color }}>
                    {PLAN_CONFIG[plan].label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span style={{ color: 'var(--text-muted)' }}>Hết hạn</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {expiryPreview ? new Date(expiryPreview).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    }) : 'Vĩnh viễn'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  Hủy
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [searchParams] = useSearchParams()
  const isAdmin = useLiveQuery(
    () => db.settings.get('is_admin').then(s => s?.value as boolean ?? false),
    [],
  )
  const [tab, setTab] = useState<AdminTab>('users')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading]   = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [query, setQuery]       = useState(() => searchParams.get('search') ?? '')
  const [upgrading, setUpgrading] = useState<Profile | null>(null)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  useEffect(() => { fetchProfiles() }, [])
  useEffect(() => { fetchPaymentRequests() }, [])

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setQuery(search)
      setTab('users')
    }
  }, [searchParams])

  async function fetchProfiles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, plan, plan_expires_at, is_admin')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (!error && data) setProfiles(data as unknown as Profile[])
  }

  async function fetchPaymentRequests() {
    setRequestsLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('payment_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setRequestsLoading(false)
    if (!error && data) setRequests(data as PaymentRequest[])
  }

  async function activateRequest(req: PaymentRequest) {
    setActivatingId(req.id)
    const plan = planFromRequestId(req.plan_id)
    const expiresAt = calcExpiryFromPlan(req.plan_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileErr } = await (supabase as any)
      .from('profiles')
      .update({ plan, plan_expires_at: expiresAt })
      .eq('id', req.user_id)
    if (profileErr) {
      alert('Lỗi kích hoạt: ' + profileErr.message)
      setActivatingId(null)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: reqErr } = await (supabase as any)
      .from('payment_requests')
      .update({ status: 'activated', activated_at: new Date().toISOString() })
      .eq('id', req.id)
    setActivatingId(null)
    if (reqErr) {
      alert('Lỗi cập nhật request: ' + reqErr.message)
      return
    }
    setRequests(rs => rs.filter(r => r.id !== req.id))
    setProfiles(ps => ps.map(p =>
      p.id === req.user_id ? { ...p, plan, plan_expires_at: expiresAt } : p,
    ))
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return q
      ? profiles.filter(p =>
          p.email?.toLowerCase().includes(q) ||
          p.display_name?.toLowerCase().includes(q),
        )
      : profiles
  }, [profiles, query])

  const stats = useMemo(() => ({
    total: profiles.length,
    pro: profiles.filter(p => p.plan === 'pro' || p.plan === 'lifetime').length,
    trial: profiles.filter(p => p.plan === 'trial').length,
    expired: profiles.filter(p => isExpired(p.plan_expires_at)).length,
  }), [profiles])

  const pendingCount = requests.length

  function handleSaved(id: string, plan: Plan, expiresAt: string | null) {
    setProfiles(ps => ps.map(p => p.id === id ? { ...p, plan, plan_expires_at: expiresAt } : p))
  }

  // ── Access denied ──
  if (isAdmin === false) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-sm">
          <Shield size={44} className="mx-auto mb-4" style={{ color: 'var(--border-color)' }} />
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Không có quyền truy cập</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Trang này chỉ dành cho Admin. Để cấp quyền, chạy lệnh sau trong Supabase SQL Editor:
          </p>
          <code
            className="block mt-3 px-4 py-3 rounded-lg text-xs text-left"
            style={{ background: 'var(--bg-secondary)', color: 'var(--color-primary)' }}
          >
            {"UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';"}
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b shrink-0"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Quản lý người dùng
            </h1>
          </div>
          <button
            onClick={() => { void fetchProfiles(); void fetchPaymentRequests() }}
            disabled={loading || requestsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <RefreshCw size={13} className={(loading || requestsLoading) ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        <div className="flex gap-1 mb-4">
          {([
            { id: 'users' as const, label: 'Danh sách user' },
            { id: 'requests' as const, label: 'Yêu cầu kích hoạt', badge: pendingCount },
            { id: 'exams' as const, label: 'Publish nội dung' },
          ]).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: tab === t.id ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'var(--bg-secondary)',
                color: tab === t.id ? 'var(--color-primary)' : 'var(--text-muted)',
              }}
            >
              {t.label}
              {t.badge ? (
                <span
                  className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
                  style={{ background: 'var(--color-accent)', color: 'var(--bg-primary)' }}
                >
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Tổng users', value: stats.total,   color: 'var(--text-primary)' },
            { label: 'Pro / Lifetime', value: stats.pro, color: '#22c55e' },
            { label: 'Trial', value: stats.trial,        color: '#f59e0b' },
            { label: 'Hết hạn', value: stats.expired,   color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3 text-center" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {tab === 'users' && (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm theo email hoặc tên..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border outline-none"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'exams' ? (
          <AdminPublishExamsPanel />
        ) : tab === 'requests' ? (
          requestsLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
              Không có yêu cầu kích hoạt đang chờ.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Email', 'Gói', 'Giá', 'Thời gian', 'Hành động'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${i === 4 ? 'text-right' : ''}`}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr
                    key={req.id}
                    className="transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderTop: i > 0 ? '1px solid var(--border-color)' : undefined }}
                  >
                    <td className="px-5 py-3" style={{ color: 'var(--text-primary)' }}>{req.user_email}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                        style={{
                          background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {req.plan_id}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-muted)' }}>{req.price}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(req.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void activateRequest(req)}
                        disabled={activatingId === req.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                        style={{
                          background: 'var(--color-primary)',
                          color: 'var(--bg-primary)',
                        }}
                      >
                        {activatingId === req.id ? 'Đang kích hoạt…' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            {query ? 'Không tìm thấy kết quả.' : 'Chưa có người dùng nào.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Người dùng', 'Gói', 'Hết hạn', 'Hành động'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${i === 3 ? 'text-right' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile, i) => {
                const cfg = PLAN_CONFIG[profile.plan] ?? PLAN_CONFIG.free
                const expired = isExpired(profile.plan_expires_at)

                return (
                  <tr
                    key={profile.id}
                    className="transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderTop: i > 0 ? '1px solid var(--border-color)' : undefined }}
                  >
                    {/* User */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar profile={profile} />
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {profile.display_name ?? '—'}
                            {profile.is_admin && (
                              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle" style={{ background: '#6366f120', color: '#818cf8' }}>
                                ADMIN
                              </span>
                            )}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: `${cfg.color}20`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="px-5 py-3 text-xs" style={{ color: expired ? '#ef4444' : 'var(--text-muted)' }}>
                      {fmtExpiry(profile.plan_expires_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setUpgrading(profile)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-auto"
                        style={{
                          background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        Nâng cấp
                        <ChevronDown size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {upgrading && (
        <UpgradeModal
          profile={upgrading}
          onClose={() => setUpgrading(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
