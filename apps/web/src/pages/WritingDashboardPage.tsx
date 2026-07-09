import { Link } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, TrendingUp, AlertTriangle, Sparkles,
  Target, ThumbsUp, AlertCircle,
} from 'lucide-react'
import { useWritingDashboard } from '../features/writing/useWritingDashboard'
import '../features/writing/writingDashboard.css'

function scorePct(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100))
}

function scoreMaxHint(data: { criteriaAvgs: { key: string }[] }): number {
  const isCam = data.criteriaAvgs.some(c =>
    ['content', 'communicativeAchievement', 'organisation', 'language'].includes(c.key),
  )
  return isCam ? 5 : 9
}

export default function WritingDashboardPage() {
  const data = useWritingDashboard()

  if (data === undefined) {
    return (
      <div className="wd-page flex items-center justify-center min-h-[320px]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--color-primary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải thống kê…</p>
        </div>
      </div>
    )
  }

  if (data.totalGradings === 0) {
    return (
      <div className="wd-page">
        <div className="wd-inner">
          <div className="wd-head" style={{ marginBottom: '1rem' }}>
            <div>
              <h1 className="wd-title">Dashboard thống kê</h1>
              <p className="wd-sub">
                {data.totalDocs > 0
                  ? `Bạn có ${data.totalDocs} bài viết — chưa có lần chấm AI nào`
                  : 'Chưa có bài viết nào được chấm'}
              </p>
            </div>
            <Link to="/app/writing" className="wd-back">
              <ArrowLeft size={14} />
              Quay lại
            </Link>
          </div>

          <div className="wd-stats" style={{ marginBottom: '1.25rem' }}>
            <div className="wd-stat">
              <div className="wd-stat-val">—</div>
              <div className="wd-stat-label">Điểm TB</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-val">0</div>
              <div className="wd-stat-label">Lần chấm AI</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-val">{data.totalDocs}</div>
              <div className="wd-stat-label">Bài viết</div>
            </div>
          </div>

          <div className="wd-empty">
            <BarChart3 size={40} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h2 className="wd-empty-title">Chưa có dữ liệu thống kê</h2>
            <p className="wd-empty-desc">
              Viết bài và bấm <strong>Chấm điểm AI</strong> ít nhất một lần.
              Dashboard sẽ tổng hợp điểm mạnh, điểm yếu và lỗi hay gặp từ các lần chấm.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link to="/app/writing/practice" className="wd-empty-cta">
                <Sparkles size={14} />
                Luyện viết IELTS
              </Link>
              <Link
                to="/app/writing/cambridge"
                className="wd-empty-cta"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                Luyện Cambridge
              </Link>
            </div>
          </div>

          {data.errorBankItems.length > 0 && (
            <section className="wd-panel" style={{ marginTop: '1rem' }}>
              <div className="wd-panel-head">
                <AlertCircle size={14} />
                Lỗi đã ghi nhận (chưa có điểm)
              </div>
              <div className="wd-panel-body">
                <div className="wd-list">
                  {data.errorBankItems.slice(0, 5).map(item => (
                    <div key={item.title} className="wd-list-item">
                      <span className="wd-list-text">{item.title}</span>
                      <span className="wd-list-count">×{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    )
  }

  const trendSource = data.dailyTrend30.length > 0 ? data.dailyTrend30 : data.bandTrend
  const maxTrend = Math.max(1, ...trendSource.map(p => p.band), scoreMaxHint(data))
  const isCambridge = data.criteriaAvgs.some(c =>
    ['content', 'communicativeAchievement', 'organisation', 'language'].includes(c.key),
  )
  const scoreMax = isCambridge ? 5 : 9
  const scoreLabel = isCambridge ? 'Điểm trung bình' : 'Band trung bình'

  return (
    <div className="wd-page">
      <div className="wd-inner">
        <div className="wd-head">
          <div>
            <h1 className="wd-title">Dashboard thống kê</h1>
            <p className="wd-sub">
              {data.totalGradings} lần chấm · {data.gradingsLast30} trong 30 ngày — lịch chấm & xu hướng band
            </p>
          </div>
          <Link to="/app/writing" className="wd-back">
            <ArrowLeft size={14} />
            Quay lại
          </Link>
        </div>

        <div className="wd-stats wd-stats--4">
          <div className="wd-stat">
            <div className="wd-stat-val">{data.avgBand.toFixed(1)}</div>
            <div className="wd-stat-label">{scoreLabel} (all)</div>
          </div>
          <div className="wd-stat">
            <div className="wd-stat-val">
              {data.avgBandLast30 > 0 ? data.avgBandLast30.toFixed(1) : '—'}
            </div>
            <div className="wd-stat-label">TB 30 ngày</div>
          </div>
          <div className="wd-stat">
            <div className="wd-stat-val">{data.gradingsLast30}</div>
            <div className="wd-stat-label">Chấm (30 ngày)</div>
          </div>
          <div className="wd-stat">
            <div className="wd-stat-val">{data.totalDocs}</div>
            <div className="wd-stat-label">Bài viết</div>
          </div>
        </div>

        <div className="wd-grid">
          <section className="wd-panel wd-panel--wide">
            <div className="wd-panel-head">
              <BarChart3 size={14} />
              Lịch chấm 30 ngày
            </div>
            <div className="wd-panel-body">
              <div className="wd-cal-legend">
                <span>Ít</span>
                <span className="wd-cal-swatch wd-cal-swatch--0" />
                <span className="wd-cal-swatch wd-cal-swatch--1" />
                <span className="wd-cal-swatch wd-cal-swatch--2" />
                <span className="wd-cal-swatch wd-cal-swatch--3" />
                <span>Nhiều / band cao</span>
              </div>
              <div className="wd-cal-grid">
                {data.calendar30.map(day => {
                  const intensity = day.count === 0
                    ? 0
                    : Math.min(3, 1 + Math.floor((day.avgBand / scoreMax) * 2.5))
                  return (
                    <div
                      key={day.dateKey}
                      className={`wd-cal-cell wd-cal-cell--${intensity}`}
                      title={
                        day.count
                          ? `${day.label}: ${day.count} lần · TB ${day.avgBand}`
                          : `${day.label}: không chấm`
                      }
                    >
                      <span className="wd-cal-day">{day.label.slice(0, 2)}</span>
                      {day.count > 0 && (
                        <span className="wd-cal-band">{day.avgBand.toFixed(1)}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {trendSource.length > 0 && (
            <section className="wd-panel wd-panel--wide">
              <div className="wd-panel-head">
                <TrendingUp size={14} />
                {data.dailyTrend30.length > 0 ? 'Xu hướng band / ngày (30 ngày)' : 'Xu hướng điểm gần đây'}
              </div>
              <div className="wd-panel-body">
                <div className="wd-trend">
                  {trendSource.map((p, i) => (
                    <div
                      key={`${p.at}-${i}`}
                      className="wd-trend-col"
                      title={`${p.label}: ${p.band}${p.count ? ` (${p.count} lần)` : ''}`}
                    >
                      <div className="wd-trend-bar-wrap">
                        <div
                          className="wd-trend-bar"
                          style={{ height: `${Math.max(8, (p.band / maxTrend) * 100)}%` }}
                        />
                      </div>
                      <span className="wd-trend-val">{p.band % 1 === 0 ? p.band.toFixed(0) : p.band.toFixed(1)}</span>
                      <span className="wd-trend-label">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="wd-panel">
            <div className="wd-panel-head">
              <Target size={14} />
              Tiêu chí chấm (TB)
            </div>
            <div className="wd-panel-body">
              {data.criteriaAvgs.map(c => (
                <div key={c.key} className="wd-criterion">
                  <div className="wd-criterion-top">
                    <span className="wd-criterion-name">{c.label}</span>
                    <span className="wd-criterion-band">{c.avg.toFixed(1)}</span>
                  </div>
                  <div className="wd-criterion-track">
                    <div className="wd-criterion-fill" style={{ width: `${scorePct(c.avg, scoreMax)}%` }} />
                  </div>
                </div>
              ))}
              {data.weakest && (
                <div className="wd-highlight wd-highlight--weak" style={{ marginTop: '0.85rem' }}>
                  <strong>Điểm yếu nhất:</strong> {data.weakest.label} ({data.weakest.avg.toFixed(1)})
                </div>
              )}
              {data.strongest && data.strongest.key !== data.weakest?.key && (
                <div className="wd-highlight wd-highlight--strong" style={{ marginTop: '0.5rem' }}>
                  <strong>Điểm mạnh nhất:</strong> {data.strongest.label} ({data.strongest.avg.toFixed(1)})
                </div>
              )}
            </div>
          </section>

          <section className="wd-panel">
            <div className="wd-panel-head">
              <ThumbsUp size={14} />
              Điểm mạnh thường gặp
            </div>
            <div className="wd-panel-body">
              {data.strengths.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa đủ dữ liệu</p>
              ) : (
                <div className="wd-list">
                  {data.strengths.map((item, i) => (
                    <div key={item.text} className="wd-list-item">
                      <span className="wd-list-rank">{i + 1}</span>
                      <span className="wd-list-text">{item.text}</span>
                      {item.count > 1 && <span className="wd-list-count">×{item.count}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="wd-panel wd-panel--wide">
            <div className="wd-panel-head">
              <AlertCircle size={14} />
              Lỗi hay sai / Cần cải thiện
            </div>
            <div className="wd-panel-body">
              {data.commonErrors.length === 0 && data.errorBankItems.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa ghi nhận lỗi lặp lại</p>
              ) : (
                <div className="wd-list">
                  {data.commonErrors.map((item, i) => (
                    <div key={item.text} className="wd-list-item">
                      <span className="wd-list-rank" style={{
                        background: 'color-mix(in srgb, var(--color-accent) 15%, var(--bg-card))',
                        color: 'var(--color-accent)',
                      }}
                      >
                        {i + 1}
                      </span>
                      <span className="wd-list-text">{item.text}</span>
                      <span className="wd-list-count">×{item.count}</span>
                    </div>
                  ))}
                  {data.errorBankItems.map(item => (
                    <div key={item.title} className="wd-list-item">
                      <span className="wd-list-rank">
                        <AlertTriangle size={10} />
                      </span>
                      <span className="wd-list-text">{item.title}</span>
                      <span className="wd-list-count">×{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="wd-panel wd-panel--wide">
            <div className="wd-panel-head">
              <TrendingUp size={14} />
              Gợi ý luyện tập
            </div>
            <div className="wd-panel-body">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {data.weakest
                  ? `Ưu tiên luyện ${data.weakest.label} — tiêu chí có band thấp nhất (${data.weakest.avg.toFixed(1)}). `
                  : ''}
                {data.commonErrors[0]
                  ? `Lỗi lặp lại nhiều nhất: «${data.commonErrors[0].text}». `
                  : ''}
                Viết thêm bài và chấm AI để dashboard cập nhật chính xác hơn.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}