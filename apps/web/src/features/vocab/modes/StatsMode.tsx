import { BarChart3, TrendingUp, Target, Flame, Brain } from 'lucide-react'
import type { Deck } from '@ryan/db'
import { useDeckAnalytics } from '../study/useDeckAnalytics'

const MODE_LABELS: Record<string, string> = {
  srs: 'Lặp lại',
  quiz: 'Trắc nghiệm',
  type: 'Đoán nghĩa',
  listen: 'Nghe & Gõ',
}

const RATING_LABELS = ['Quên', 'Khó', 'Nhớ', 'Dễ']
const RATING_CLS = ['rt-forgot', 'rt-hard', 'rt-good', 'rt-easy']

export default function StatsMode({
  deckId,
  deck,
}: {
  deckId: string
  deck: Deck
}) {
  const stats = useDeckAnalytics(deckId)

  if (!stats) {
    return (
      <div className="vs-main">
        <p className="text-center py-16 text-sm vs-loading">Đang tải...</p>
      </div>
    )
  }

  const topic = [deck.unit, deck.book].filter(Boolean).join(' · ') || deck.name
  const totalStatus = stats.statusCounts.new + stats.statusCounts.due + stats.statusCounts.learned
  const modeTotal = Object.values(stats.modeCounts).reduce((a, b) => a + b, 0) || 1
  const ratingTotal = stats.ratingCounts.reduce((a, b) => a + b, 0) || 1

  return (
    <>
      <div className="vs-session-bar">
        <div className="vs-session-left">
          <div className="vs-session-counter" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <BarChart3 size={22} color="#fff" />
          </div>
          <div className="vs-session-info">
            <h3>Thống kê</h3>
            <div className="vs-session-meta">
              <span><b>{stats.totalReviews}</b> lượt ôn</span>
              <span className="dot" />
              <span>{topic}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="vs-main">
        <div className="vs-panel-page">
          <div className="vs-stat-grid">
            <div className="vs-stat-card">
              <TrendingUp size={18} className="vs-stat-card-icon" />
              <span className="vs-stat-card-val purple">{stats.totalReviews}</span>
              <span className="vs-stat-card-label">Tổng lượt ôn</span>
            </div>
            <div className="vs-stat-card">
              <Target size={18} className="vs-stat-card-icon" />
              <span className="vs-stat-card-val green">{stats.accuracyPct}%</span>
              <span className="vs-stat-card-label">Tỷ lệ nhớ (≥3)</span>
            </div>
            <div className="vs-stat-card">
              <Flame size={18} className="vs-stat-card-icon" />
              <span className="vs-stat-card-val amber">{stats.streakDays}</span>
              <span className="vs-stat-card-label">Streak ngày</span>
            </div>
            <div className="vs-stat-card">
              <Brain size={18} className="vs-stat-card-icon" />
              <span className="vs-stat-card-val">{stats.avgEase}</span>
              <span className="vs-stat-card-label">Ease trung bình</span>
            </div>
          </div>

          <div className="vs-panel-grid-2">
            <div className="vs-panel-card">
              <div className="vs-panel-card-head">
                <BarChart3 size={18} />
                <h4>Hoạt động 14 ngày</h4>
              </div>
              <div className="vs-activity-chart">
                {stats.dailyActivity.map(d => (
                  <div key={d.date} className="vs-activity-col" title={`${d.label}: ${d.count} lượt`}>
                    <div className="vs-activity-bar-wrap">
                      <div className="vs-activity-bar" style={{ height: `${Math.max(4, d.pct)}%` }} />
                    </div>
                    <span className="vs-activity-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vs-panel-card">
              <div className="vs-panel-card-head">
                <Target size={18} />
                <h4>Phân bố đánh giá</h4>
              </div>
              <div className="vs-rating-bars">
                {stats.ratingCounts.map((n, i) => (
                  <div key={i} className="vs-rating-bar-row">
                    <span className={`vs-rating-bar-label ${RATING_CLS[i]}`}>{RATING_LABELS[i]}</span>
                    <div className="vs-rating-bar-track">
                      <div
                        className={`vs-rating-bar-fill ${RATING_CLS[i]}`}
                        style={{ width: `${Math.round((n / ratingTotal) * 100)}%` }}
                      />
                    </div>
                    <span className="vs-rating-bar-num">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="vs-panel-grid-2">
            <div className="vs-panel-card">
              <div className="vs-panel-card-head">
                <BarChart3 size={18} />
                <h4>Chế độ học</h4>
              </div>
              <div className="vs-mode-bars">
                {Object.entries(stats.modeCounts).sort((a, b) => b[1] - a[1]).map(([mode, count]) => (
                  <div key={mode} className="vs-mode-bar-row">
                    <span className="vs-mode-bar-label">{MODE_LABELS[mode] ?? mode}</span>
                    <div className="vs-mode-bar-track">
                      <div
                        className="vs-mode-bar-fill"
                        style={{ width: `${Math.round((count / modeTotal) * 100)}%` }}
                      />
                    </div>
                    <span className="vs-mode-bar-num">{count}</span>
                  </div>
                ))}
                {modeTotal <= 1 && Object.keys(stats.modeCounts).length === 0 && (
                  <p className="vs-panel-muted">Chưa có dữ liệu ôn tập.</p>
                )}
              </div>
            </div>

            <div className="vs-panel-card">
              <div className="vs-panel-card-head">
                <Brain size={18} />
                <h4>Trạng thái thẻ</h4>
              </div>
              <div className="vs-status-donut-rows">
                {([
                  ['new', 'Từ mới', 'amber', stats.statusCounts.new],
                  ['due', 'Cần ôn', 'red', stats.statusCounts.due],
                  ['learned', 'Đã học', 'green', stats.statusCounts.learned],
                ] as const).map(([, label, color, count]) => (
                  <div key={label} className="vs-status-row">
                    <span className={`vs-status-dot ${color}`} />
                    <span className="vs-status-label">{label}</span>
                    <div className="vs-status-track">
                      <div
                        className={`vs-status-fill ${color}`}
                        style={{ width: `${totalStatus ? Math.round((count / totalStatus) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="vs-status-num">{count}</span>
                  </div>
                ))}
              </div>

              {stats.topWeak.length > 0 && (
                <div className="vs-top-weak">
                  <p className="vs-top-weak-title">Từ yếu nhất</p>
                  <ul>
                    {stats.topWeak.map(w => (
                      <li key={w.phrase}>
                        <span className="vs-top-weak-word">{w.phrase}</span>
                        <span className="vs-top-weak-meta">{w.lapses} quên · ease {w.ease}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}