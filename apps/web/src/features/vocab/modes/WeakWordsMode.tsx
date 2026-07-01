import { FileWarning, Play, AlertTriangle } from 'lucide-react'
import type { Deck } from '@ryan/db'
import { useVocabStore } from '../vocabStore'
import { useDeckWeakWords } from '../study/useDeckWeakWords'
import { easeLabel } from '../study/weakWords'
import { StatusBadge } from '../CardBadges'
import { speakPhrase } from '../study/speakPhrase'

export default function WeakWordsMode({
  deckId,
  deck,
}: {
  deckId: string
  deck: Deck
}) {
  const rows = useDeckWeakWords(deckId)
  const startStudy = useVocabStore(s => s.startStudy)

  if (rows === undefined) {
    return (
      <div className="vs-main">
        <p className="text-center py-16 text-sm vs-loading">Đang tải...</p>
      </div>
    )
  }

  const topic = [deck.unit, deck.book].filter(Boolean).join(' · ') || deck.name

  return (
    <>
      <div className="vs-session-bar">
        <div className="vs-session-left">
          <div className="vs-session-counter" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
            <FileWarning size={22} color="#fff" />
          </div>
          <div className="vs-session-info">
            <h3>Từ yếu</h3>
            <div className="vs-session-meta">
              <span><b>{rows.length}</b> từ cần củng cố</span>
              <span className="dot" />
              <span>{topic}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="vs-btn-primary"
          disabled={rows.length === 0}
          onClick={() => startStudy('srs', 'weak')}
        >
          <Play size={14} />
          Ôn SRS từ yếu
        </button>
      </div>

      <div className="vs-main">
        <div className="vs-panel-page">
          <div className="vs-info-banner warn">
            <AlertTriangle size={16} />
            <p>
              Từ được đánh dấu <strong>yếu</strong> khi quên ≥1 lần, độ nhớ (ease) thấp, hoặc đang trong giai đoạn học lại.
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="vs-panel-empty">
              <div className="text-5xl mb-4">🎯</div>
              <h3>Chưa có từ yếu!</h3>
              <p>Bạn đang nhớ tốt — tiếp tục ôn đều để giữ vững.</p>
            </div>
          ) : (
            <div className="vs-data-table-wrap">
              <table className="vs-data-table">
                <thead>
                  <tr>
                    <th>Từ / Cụm từ</th>
                    <th>Nghĩa tiếng Việt</th>
                    <th>Câu ví dụ</th>
                    <th>Lần quên</th>
                    <th>Độ khó</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ card, srs }) => (
                    <tr key={card.id}>
                      <td>
                        <button
                          type="button"
                          className="vs-word-link"
                          onClick={() => speakPhrase(card.phrase)}
                          title="Nghe phát âm"
                        >
                          <span className="vs-word-main">{card.phrase}</span>
                          {card.ipaUS && <span className="vs-word-ipa">[{card.ipaUS}]</span>}
                        </button>
                      </td>
                      <td>{card.meaning}</td>
                      <td className="vs-td-example">{card.example ?? '—'}</td>
                      <td>
                        <span className={`vs-pill ${srs.lapses >= 2 ? 'bad' : 'warn'}`}>
                          {srs.lapses} lần
                        </span>
                      </td>
                      <td>
                        <span className="vs-pill muted">{easeLabel(srs.ease)}</span>
                        <span className="vs-ease-num">{srs.ease.toFixed(1)}</span>
                      </td>
                      <td><StatusBadge srs={srs} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}