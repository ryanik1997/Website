import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { getStructureCompletionHistory } from '../features/sentence-structure/structureHistory'
import '../features/sentence-structure/structurePractice.css'

export default function SentenceStructureHistoryPage() {
  const history = getStructureCompletionHistory()
  const [expanded, setExpanded] = useState<number | null>(null)
  return (
    <div className="ss-shell ss-list-page ss-history-page">
      <header className="ss-topbar">
        <div className="ss-topbar-left">
          <Link to="/app/sentence-structure" className="ss-history-back"><ArrowLeft size={15} /> Cấu trúc câu</Link>
          <span className="ss-topbar-sub">LỊCH SỬ HOÀN THÀNH · 30 NGÀY</span>
        </div>
      </header>
      <main className="ss-history-page__main">
        <div className="ss-history-page__heading"><p>Grammar Atlas</p><h1>Lịch sử hoàn thành</h1><span>{history.length} lần luyện tập gần đây</span></div>
        {history.length === 0 ? <div className="ss-hub-empty">Chưa có cấu trúc nào được hoàn thành.</div> : (
          <div className="ss-history-page__list">{history.map((entry, index) => <button type="button" className="ss-history-page__entry" key={`${entry.completedAt}-${index}`} onClick={() => setExpanded(expanded === index ? null : index)}><span className="ss-history-page__check"><Check size={15} /></span><div><h2>{entry.title}</h2><p>{entry.source === 'ai' ? 'AI chấm đạt' : 'Khớp đúng mẫu'}</p>{expanded === index && entry.completedSentence && <blockquote className="ss-history-page__sentence">“{entry.completedSentence}”</blockquote>}</div><time>{new Date(entry.completedAt).toLocaleString('vi-VN')}</time></button>)}</div>
        )}
      </main>
    </div>
  )
}
