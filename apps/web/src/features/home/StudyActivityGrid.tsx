import { useStudyActivity60 } from './useStudyActivity60'
import './studyActivityGrid.css'

const LEGEND_LEVELS = [0, 1, 2, 3, 4] as const

export default function StudyActivityGrid() {
  const { days, totalInPeriod, activeDays } = useStudyActivity60()

  return (
    <section className="study-heatmap">
      <div className="study-heatmap-head">
        <div>
          <h2 className="study-heatmap-title">60 ngày học gần nhất</h2>
          <p className="study-heatmap-sub">Ngày học nhiều ô đậm hơn · ít thì nhạt hơn</p>
        </div>
        <div className="study-heatmap-stats">
          <div className="study-heatmap-stat-val">{totalInPeriod.toLocaleString('vi-VN')}</div>
          <div className="study-heatmap-stat-label">lượt học</div>
        </div>
      </div>

      <div className="study-heatmap-body">
        <div className="study-heatmap-grid" role="img" aria-label="Biểu đồ hoạt động học 60 ngày">
          {days.map(day => (
            <div
              key={day.date}
              className={`study-heatmap-cell study-heatmap-cell--${day.level}`}
              title={day.count > 0 ? `${day.label}: ${day.count} lượt học` : `${day.label}: chưa học`}
            />
          ))}
        </div>
      </div>

      <div className="study-heatmap-foot">
        <div className="study-heatmap-range">
          <span>Ít</span>
          <div className="study-heatmap-range-cells">
            {LEGEND_LEVELS.map(level => (
              <div key={level} className={`study-heatmap-cell study-heatmap-cell--${level}`} />
            ))}
          </div>
          <span>Nhiều</span>
        </div>
        <span className="study-heatmap-meta">
          {activeDays} / 60 ngày có hoạt động
        </span>
      </div>
    </section>
  )
}