import { useNavigate } from 'react-router-dom'
import { EXAM_TRACKS } from './examTracks'
import './examHub.css'

export default function ExamHome() {
  const navigate = useNavigate()

  return (
    <div className="exam-hub-page">
      <div className="exam-hub-page__inner">
        <section className="exam-full-mock-hero">
          <p className="exam-hub-kicker">Luyện thi</p>
          <h1 className="exam-hub-title">Chọn track ôn thi</h1>
          <p className="exam-hub-desc">
            IELTS Academic hoặc Cambridge A2–C2 — luyện Reading + Listening, import thủ công JSON + media.
          </p>
        </section>

        <div className="exam-hub-tracks">
          {EXAM_TRACKS.map(track => (
            <button
              key={track.id}
              type="button"
              className="exam-hub-track-card"
              onClick={() => navigate(`/app/exam/track/${track.id}`)}
            >
              <p className="exam-hub-track-card__title">{track.title}</p>
              <p className="exam-hub-track-card__sub">{track.subtitle}</p>
              <p className="exam-hub-track-card__desc">{track.description}</p>
              <div className="exam-hub-track-skills">
                {track.skills.map(skill => (
                  <span key={skill} className="exam-hub-skill-tag">{skill}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}