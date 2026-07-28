import {
  RefreshCw, Play, RotateCcw, HelpCircle, Briefcase, Headphones,
  CalendarClock, Sparkles,
} from 'lucide-react'
import type { Deck } from '@ryan/db'
import { useVocabStore } from '../vocabStore'
import { useDeckReviewHub } from '../study/useDeckReviewHub'

const QUICK_ACTIONS = [
  { mode: 'srs' as const, label: 'Lặp lại SRS', desc: 'Ôn thẻ đến hạn', icon: RotateCcw, accent: 'indigo' },
  { mode: 'quiz' as const, label: 'Trắc nghiệm', desc: 'Kiểm tra nghĩa nhanh', icon: HelpCircle, accent: 'amber' },
  { mode: 'type' as const, label: 'Đoán nghĩa', desc: 'Gõ từ tiếng Anh', icon: Briefcase, accent: 'amber' },
  { mode: 'listen' as const, label: 'Nghe & Gõ', desc: 'Luyện nghe + gõ lại', icon: Headphones, accent: 'violet' },
]

export default function ReviewHubMode({
  deckId,
  deck,
}: {
  deckId: string
  deck: Deck
}) {
  const hub = useDeckReviewHub(deckId)
  const startStudy = useVocabStore(s => s.startStudy)

  if (!hub) {
    return (
      <div className="vs-main">
        <p className="text-center py-16 text-sm vs-loading">Đang tải...</p>
      </div>
    )
  }

  const topic = [deck.unit, deck.book].filter(Boolean).join(' · ') || deck.name
  const maxBucket = Math.max(1, ...hub.upcoming.map(b => b.count))

  return (
    <>
      <div className="vs-session-bar">
        <div className="vs-session-left">
          <div className="vs-session-counter" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
            <RefreshCw size={22} color="#fff" />
          </div>
          <div className="vs-session-info">
            <h3>Ôn tập</h3>
            <div className="vs-session-meta">
              <span><b>{hub.dueNow}</b> cần ôn</span>
              {hub.newCount > 0 && (
                <>
                  <span className="dot" />
                  <span><b>{hub.newCount}</b> từ mới</span>
                </>
              )}
              <span className="dot" />
              <span>{topic}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="vs-btn-primary"
          disabled={hub.dueNow === 0 && hub.newCount === 0}
          onClick={() => startStudy('srs')}
        >
          <Play size={14} />
          {hub.dueNow > 0
            ? `Bắt đầu ôn (${hub.dueNow})`
            : hub.newCount > 0
              ? `Học từ mới (${Math.min(hub.newCount, 50)})`
              : 'Bắt đầu ôn (0)'}
        </button>
      </div>

      <div className="vs-main">
        <div className="vs-panel-page">
          <div className="vs-review-hero">
            <div className="vs-review-hero-icon">
              <Sparkles size={28} />
            </div>
            <div className="vs-review-hero-text">
              <h2>
                {hub.dueNow > 0
                  ? 'Đến giờ ôn tập!'
                  : hub.newCount > 0
                    ? 'Sẵn sàng học từ mới'
                    : 'Bạn đã ôn xong hôm nay'}
              </h2>
              <p>
                {hub.dueNow > 0
                  ? <>Bạn có <strong>{hub.dueNow}</strong> từ trong <strong>{deck.name}</strong> cần được ôn lại
                    {hub.newCount > 0 ? <> · <strong>{hub.newCount}</strong> từ mới chưa học</> : null}.</>
                  : hub.newCount > 0
                    ? <>Chưa có thẻ cần ôn lại. Có <strong>{hub.newCount}</strong> từ mới trong <strong>{deck.name}</strong> — bấm học để bắt đầu (SRS chỉ đếm “ôn lại” sau khi bạn đã rating).</>
                    : <>Không có thẻ đến hạn — xem lịch ôn sắp tới bên dưới.</>}
              </p>
            </div>
          </div>

          <div className="vs-stat-grid">
            <div className="vs-stat-card">
              <span className="vs-stat-card-val red">{hub.dueNow}</span>
              <span className="vs-stat-card-label">Cần ôn ngay</span>
            </div>
            <div className="vs-stat-card">
              <span className="vs-stat-card-val amber">{hub.newCount}</span>
              <span className="vs-stat-card-label">Từ mới</span>
            </div>
            <div className="vs-stat-card">
              <span className="vs-stat-card-val purple">{hub.scheduled}</span>
              <span className="vs-stat-card-label">Đã lên lịch</span>
            </div>
            <div className="vs-stat-card">
              <span className="vs-stat-card-val">{hub.weakCount}</span>
              <span className="vs-stat-card-label">Từ yếu</span>
            </div>
          </div>

          <div className="vs-panel-grid-2">
            <div className="vs-panel-card">
              <div className="vs-panel-card-head">
                <CalendarClock size={18} />
                <h4>Lịch ôn sắp tới</h4>
              </div>
              {hub.upcoming.length === 0 ? (
                <p className="vs-panel-muted">Chưa có lịch ôn.</p>
              ) : (
                <div className="vs-timeline">
                  {hub.upcoming.map(b => (
                    <div key={b.dateKey} className={`vs-timeline-row ${b.isToday ? 'today' : ''} ${b.isPast ? 'past' : ''}`}>
                      <span className="vs-timeline-label">{b.label}</span>
                      <div className="vs-timeline-bar-wrap">
                        <div
                          className="vs-timeline-bar"
                          style={{ width: `${Math.max(8, (b.count / maxBucket) * 100)}%` }}
                        />
                      </div>
                      <span className="vs-timeline-count">{b.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="vs-panel-card">
              <div className="vs-panel-card-head">
                <Play size={18} />
                <h4>Chế độ ôn nhanh</h4>
              </div>
              <div className="vs-quick-grid">
                {QUICK_ACTIONS.map(({ mode, label, desc, icon: Icon, accent }) => (
                  <button
                    key={mode}
                    type="button"
                    className={`vs-quick-card accent-${accent}`}
                    onClick={() => startStudy(mode)}
                  >
                    <Icon size={20} />
                    <span className="vs-quick-title">{label}</span>
                    <span className="vs-quick-desc">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}