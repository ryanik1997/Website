import { useStudyActivity60 } from './useStudyActivity60'
import './studyActivityGrid.css'
import { useI18n } from '../../lib/language'

const LEGEND_LEVELS = [0, 1, 2, 3, 4] as const

export default function StudyActivityGrid() {
  const { t } = useI18n()
  const { days, totalInPeriod, activeDays } = useStudyActivity60()

  return (
    <section className="study-heatmap">
      <div className="study-heatmap-head">
        <div>
          <h2 className="study-heatmap-title">{t('home.activityTitle')}</h2>
          <p className="study-heatmap-sub">{t('home.activitySub')}</p>
        </div>
        <div className="study-heatmap-stats">
          <div className="study-heatmap-stat-val">{totalInPeriod.toLocaleString('vi-VN')}</div>
          <div className="study-heatmap-stat-label">{t('home.studySessions')}</div>
        </div>
      </div>

      <div className="study-heatmap-body">
        <div className="study-heatmap-grid" role="img" aria-label={t('home.activityTitle')}>
          {days.map(day => (
            <div
              key={day.date}
              className={`study-heatmap-cell study-heatmap-cell--${day.level}`}
              title={`${day.label}: ${day.count > 0 ? `${day.count} ${t('home.studySessions')}` : t('home.continue')}`}
            />
          ))}
        </div>
      </div>

      <div className="study-heatmap-foot">
        <div className="study-heatmap-range">
          <span>{t('home.less')}</span>
          <div className="study-heatmap-range-cells">
            {LEGEND_LEVELS.map(level => (
              <div key={level} className={`study-heatmap-cell study-heatmap-cell--${level}`} />
            ))}
          </div>
          <span>{t('home.more')}</span>
        </div>
        <span className="study-heatmap-meta">
          {t('home.activeDays').replace('{count}', String(activeDays))}
        </span>
      </div>
    </section>
  )
}
