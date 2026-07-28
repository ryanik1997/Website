import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Layers } from 'lucide-react'
import { getFullMockTest } from './fullMockData'
import { appendFullMockQuery, startFullMockSession } from './fullMockSession'
import './examHub.css'

export default function FullMockIntro() {
  const navigate = useNavigate()
  const { mockId } = useParams<{ mockId: string }>()
  const mock = mockId ? getFullMockTest(mockId) : null

  if (!mock) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy Full Mock Test.</p>
      </div>
    )
  }

  const activeId = mock.id
  const activeReadingId = mock.readingExamId

  function handleStart() {
    startFullMockSession(activeId)
    navigate(appendFullMockQuery(`/app/exam/reading/${activeReadingId}`, activeId))
  }

  return (
    <div className="exam-hub-page">
      <div className="exam-hub-page__inner">
        <button type="button" className="exam-hub-back" onClick={() => navigate('/app/exam/track/ielts')}>
          <ArrowLeft size={14} />
          IELTS Academic
        </button>

        <section className="exam-full-mock-hero">
          <p className="exam-hub-kicker">Full Mock Test</p>
          <h1 className="exam-hub-title">{mock.title}</h1>
          <p className="exam-hub-desc">
            Làm liên tiếp Reading → Listening → Writing. Tiến độ và điểm từng kỹ năng được lưu tự động.
          </p>

          <div className="exam-full-mock-meta">
            <span className="exam-full-mock-pill">
              <Clock size={14} />
              ~{mock.durationMinutes} phút
            </span>
            <span className="exam-full-mock-pill">
              <Layers size={14} />
              3 kỹ năng
            </span>
          </div>

          <ol className="exam-full-mock-steps">
            <li><strong>Reading</strong> — 60 phút, nộp bài để sang Listening</li>
            <li><strong>Listening</strong> — 30 phút, chế độ thi IELTS</li>
            <li><strong>Writing</strong> — Task 1 + Task 2 (chưa chấm AI trong Full Test)</li>
          </ol>

          <button type="button" className="exam-hub-cta" onClick={handleStart}>
            Bắt đầu Full Test
          </button>
        </section>
      </div>
    </div>
  )
}