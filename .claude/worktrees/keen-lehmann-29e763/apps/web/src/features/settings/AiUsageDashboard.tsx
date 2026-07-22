import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Activity, BarChart3 } from 'lucide-react'
import { writingRepo } from '@ryan/db'
import { AI_USAGE_FEATURE_META } from './aiUsageMeta'

interface FeatureStat {
  id: string
  label: string
  hint: string
  todayCount: number
  weekCount: number
  todayTokens: number
  weekTokens: number
}

function dayKeys(days: number): string[] {
  const keys: string[] = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  for (let i = 0; i < days; i++) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    keys.push(x.toISOString().slice(0, 10))
  }
  return keys
}

function formatTokens(n: number): string {
  if (n <= 0) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function AiUsageDashboard() {
  const rows = useLiveQuery(() => writingRepo.listUsageSince(7), []) ?? []

  const stats = useMemo((): FeatureStat[] => {
    const today = new Date().toISOString().slice(0, 10)
    const weekSet = new Set(dayKeys(7))
    const byFeature = new Map<string, FeatureStat>()

    for (const meta of AI_USAGE_FEATURE_META) {
      byFeature.set(meta.id, {
        id: meta.id,
        label: meta.label,
        hint: meta.hint,
        todayCount: 0,
        weekCount: 0,
        todayTokens: 0,
        weekTokens: 0,
      })
    }

    for (const r of rows) {
      if (!weekSet.has(r.day)) continue
      let s = byFeature.get(r.feature)
      if (!s) {
        s = {
          id: r.feature,
          label: r.feature,
          hint: 'Tính năng AI khác',
          todayCount: 0,
          weekCount: 0,
          todayTokens: 0,
          weekTokens: 0,
        }
        byFeature.set(r.feature, s)
      }
      s.weekCount += r.count
      s.weekTokens += r.tokens
      if (r.day === today) {
        s.todayCount += r.count
        s.todayTokens += r.tokens
      }
    }

    // Meta features first (stable order), then any extra keys
    const ordered: FeatureStat[] = []
    for (const meta of AI_USAGE_FEATURE_META) {
      ordered.push(byFeature.get(meta.id)!)
      byFeature.delete(meta.id)
    }
    for (const extra of byFeature.values()) ordered.push(extra)
    return ordered
  }, [rows])

  const todayTotal = stats.reduce((s, x) => s + x.todayCount, 0)
  const weekTotal = stats.reduce((s, x) => s + x.weekCount, 0)
  const todayTokens = stats.reduce((s, x) => s + x.todayTokens, 0)
  const maxToday = Math.max(1, ...stats.map(s => s.todayCount))
  const activeToday = stats.filter(s => s.todayCount > 0)

  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
      aria-label="Thống kê gọi AI"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)' }}
          >
            <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Dashboard AI
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Số lần gọi theo từng phần (máy này)
            </p>
          </div>
        </div>
        <Activity size={16} style={{ color: 'var(--text-muted)' }} aria-hidden />
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        <StatTile label="Hôm nay" value={`${todayTotal}`} sub="lần gọi" />
        <StatTile label="7 ngày" value={`${weekTotal}`} sub="lần gọi" />
        <StatTile label="Token hôm nay" value={formatTokens(todayTokens)} sub="ước lượng" />
      </div>

      <ul className="px-3 pb-3 flex flex-col gap-1.5" role="list">
        {stats.map(s => {
          const pct = Math.round((s.todayCount / maxToday) * 100)
          const has = s.todayCount > 0 || s.weekCount > 0
          return (
            <li
              key={s.id}
              className="rounded-xl px-3 py-2.5"
              style={{
                background: has
                  ? 'color-mix(in srgb, var(--color-primary) 6%, var(--bg-card))'
                  : 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {s.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {s.hint}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {s.todayCount}
                    <span className="text-[10px] font-semibold ml-0.5" style={{ color: 'var(--text-muted)' }}>
                      hôm nay
                    </span>
                  </p>
                  <p className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {s.weekCount} / 7 ngày · {formatTokens(s.weekTokens)} tok
                  </p>
                </div>
              </div>
              <div
                className="mt-2 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-secondary)' }}
                aria-hidden
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${s.todayCount > 0 ? Math.max(pct, 6) : 0}%`,
                    background: s.todayCount > 0
                      ? 'linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 65%, var(--color-primary)))'
                      : 'transparent',
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      {activeToday.length === 0 && (
        <p className="px-4 pb-3 text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
          Chưa có lần gọi AI nào hôm nay. Dùng Writing, Luyện thi, Cấu trúc câu… để bắt đầu thống kê.
        </p>
      )}
    </section>
  )
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      className="rounded-xl px-2.5 py-2 text-center border"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-lg font-black tabular-nums leading-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}
