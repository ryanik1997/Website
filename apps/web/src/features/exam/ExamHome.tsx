import { useNavigate } from 'react-router-dom'
import { EXAM_TRACKS } from './examTracks'
import {
  MoonIllustration,
  SunAnimationStyles,
  SunIllustration,
} from '../../pages/landing/LegacySunMascot'
import './examHub.css'

export default function ExamHome() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const isNight = hour >= 18 || hour < 6

  return (
    <div className="exam-hub-page exam-home">
      <SunAnimationStyles />
      <div className="exam-hub-page__inner exam-home__inner">
        <section className="exam-home__hero">
          <div className="exam-home__hero-copy">
            <p className="exam-home__eyebrow"><span /> Exam studio · 2026</p>
            <h1 className="exam-home__title">Luyện thi<br /><em>có chủ đích.</em></h1>
            <p className="exam-home__desc">Một không gian tập trung cho Reading và Listening — chọn đúng track, giữ nhịp học, tiến bộ rõ ràng.</p>
            <div className="exam-home__signal"><span className="exam-home__signal-dot" /> Hai lộ trình · một nhịp học</div>
          </div>
          <div className="exam-home__orb exam-home__orb--mascot" aria-hidden>
            {isNight ? <MoonIllustration /> : <SunIllustration />}
          </div>
        </section>

        <div className="exam-home__section-head">
          <div><p className="exam-home__eyebrow">01 — Chọn lộ trình</p><h2>Begin where<br /><em>you are.</em></h2></div>
          <p>Hai hệ thống bài thi được sắp xếp để bạn luôn biết bước tiếp theo.</p>
        </div>

        <div className="exam-hub-tracks exam-home__tracks">
          {EXAM_TRACKS.map(track => (
            <button key={track.id} type="button" className={`exam-hub-track-card exam-home__track exam-home__track--${track.id}`} onClick={() => navigate(`/app/exam/track/${track.id}`)}>
              <div className="exam-home__track-top"><span className="exam-home__track-index">{track.id === 'ielts' ? 'A' : 'B'}</span><span className="exam-home__arrow">↗</span></div>
              <p className="exam-hub-track-card__sub">{track.subtitle}</p>
              <p className="exam-hub-track-card__title">{track.title}</p>
              <p className="exam-hub-track-card__desc">{track.description}</p>
              <div className="exam-hub-track-skills exam-home__skills">{track.skills.map(skill => <span key={skill} className="exam-hub-skill-tag">{skill}</span>)}</div>
              <span className="exam-home__track-footer">Explore track <b>→</b></span>
            </button>
          ))}
        </div>
        <footer className="exam-home__footer"><span>RYAN ENGLISH</span><span>READ · LISTEN · REPEAT</span><span>Scroll to begin ↓</span></footer>
      </div>
    </div>
  )
}
