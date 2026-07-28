import { ChevronDown, X } from 'lucide-react'
import type { Deck } from '@ryan/db'
import type { DeckStudyStats } from './useDeckStudyStats'

interface Props {
  deck: Deck
  stats: DeckStudyStats
  onExit: () => void
}

export default function DeckStatBar({ deck, stats, onExit }: Props) {
  const subtitle = [deck.book, deck.unit].filter(Boolean).join(' · ') || 'Bộ từ vựng'

  return (
    <div className="vs-statbar">
      <div className="vs-deck-title">
        <span className="vs-deck-name">{deck.name}</span>
        <span className="vs-deck-sub">{subtitle}</span>
      </div>
      <div className="vs-stat-divider" />
      <div className="vs-stat">
        <span className="vs-stat-value">{stats.total}</span>
        <span className="vs-stat-label">Total Cards</span>
      </div>
      <div className="vs-stat-divider" />
      <div className="vs-stat">
        <span className="vs-stat-value purple">{stats.learned}</span>
        <span className="vs-stat-label">Learned</span>
      </div>
      <div className="vs-stat-divider" />
      <div className="vs-stat">
        <span className="vs-stat-value green">{stats.progress}%</span>
        <span className="vs-stat-label">Progress</span>
      </div>
      <div className="vs-stat-divider" />
      <div className="vs-stat">
        <span className="vs-stat-value amber">{stats.newCount}</span>
        <span className="vs-stat-label">Từ mới</span>
      </div>
      <div className="vs-stat-divider" />
      <div className="vs-stat">
        <span className="vs-stat-value red">{stats.dueNow}</span>
        <span className="vs-stat-label">Cần ôn ngay</span>
      </div>
      <div className="vs-stat-divider" />
      <div className="vs-stat">
        <span className="vs-stat-value">{stats.scheduled}</span>
        <span className="vs-stat-label">Đã vào lịch</span>
      </div>
      {stats.nextReviewLabel && (
        <>
          <div className="vs-stat-divider" />
          <div className="vs-stat">
            <span className="vs-stat-value purple" style={{ fontSize: 14 }}>{stats.nextReviewLabel}</span>
            <span className="vs-stat-label">Lần ôn kế tiếp</span>
          </div>
        </>
      )}
      <div className="vs-spacer" />
      <button type="button" className="vs-btn-exit" onClick={onExit}>
        <X size={14} />
        Thoát
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>
    </div>
  )
}