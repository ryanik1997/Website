import { useNavigate } from 'react-router-dom'
import { BookOpen, PenLine, Headphones } from 'lucide-react'
import TidSunMascot from '../../components/TidSunMascot'
import './examHub.css'

const PRACTICE_TRACKS = [
  {
    id: 'reading',
    subtitle: 'Reading · IELTS & Cambridge',
    title: 'Luyện đọc',
    description: 'Bộ câu hỏi Reading trộn từ nhiều nguồn — luyện kỹ năng đọc hiểu với đa dạng chủ đề.',
    skills: ['IELTS', 'Cambridge'],
    icon: BookOpen,
  },
  {
    id: 'listening',
    subtitle: 'Listening · IELTS & Cambridge',
    title: 'Luyện nghe',
    description: 'Trộn câu hỏi Listening từ các đề thi — cải thiện phản xạ nghe mọi trình độ.',
    skills: ['IELTS', 'Cambridge'],
    icon: Headphones,
  },
  {
    id: 'mixed',
    subtitle: 'Tổng hợp · Đa kỹ năng',
    title: 'Luyện hỗn hợp',
    description: 'Kết hợp Reading, Listening và các dạng bài khác — luyện tập toàn diện.',
    skills: ['IELTS', 'Cambridge', 'Reading', 'Listening'],
    icon: PenLine,
  },
]

export default function PracticePage() {
  const navigate = useNavigate()
  return (
    <div className="exam-hub-page exam-home">
      <div className="exam-hub-page__inner exam-home__inner">
        <section className="exam-home__hero">
          <div className="exam-home__hero-copy">
            <p className="exam-home__eyebrow"><span /> Practice · 2026</p>
            <h1 className="exam-home__title">Luyện tập<br /><em>ngẫu nhiên.</em></h1>
            <p className="exam-home__desc">Câu hỏi tổng hợp từ nhiều nguồn — luyện kỹ năng mọi lúc, mọi nơi.</p>
            <div className="exam-home__signal"><span className="exam-home__signal-dot" /> IELTS · Cambridge · Nghe · Đọc</div>
          </div>
          <div className="exam-home__tid-sun-stage" aria-hidden>
            <TidSunMascot />
          </div>
        </section>

        <div className="exam-home__section-head">
          <div><p className="exam-home__eyebrow">01 — Chọn dạng</p><h2>Pick your<br /><em>practice.</em></h2></div>
          <p>Chọn kỹ năng bạn muốn luyện — câu hỏi sẽ được trộn từ tất cả các nguồn có sẵn.</p>
        </div>

        <div className="exam-hub-tracks exam-home__tracks">
          {PRACTICE_TRACKS.map((track, i) => {
            const Icon = track.icon
            return (
              <button key={track.id} type="button" className={`exam-hub-track-card exam-home__track exam-home__track--${track.id}`} onClick={() => navigate(`/app/practice/${track.id}`)}>
                <div className="exam-home__track-top">
                  <span className="exam-home__track-index">{String.fromCharCode(65 + i)}</span>
                  <Icon size={22} style={{ color: 'var(--text-muted)' }} />
                </div>
                <p className="exam-hub-track-card__sub">{track.subtitle}</p>
                <p className="exam-hub-track-card__title">{track.title}</p>
                <p className="exam-hub-track-card__desc">{track.description}</p>
                <div className="exam-hub-track-skills exam-home__skills">
                  {track.skills.map(skill => (
                    <span key={skill} className="exam-hub-skill-tag">{skill}</span>
                  ))}
                </div>
                <span className="exam-home__track-footer">Begin practice <b>→</b></span>
              </button>
            )
          })}
        </div>
        <footer className="exam-home__footer">
          <span>RYAN ENGLISH</span>
          <span>PRACTICE · IMPROVE · MASTER</span>
          <span>Select a track ↓</span>
        </footer>
      </div>
    </div>
  )
}
