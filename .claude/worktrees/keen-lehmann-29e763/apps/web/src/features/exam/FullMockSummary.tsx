import { useNavigate, useParams } from 'react-router-dom'
import { getFullMockTest } from './fullMockData'
import { clearFullMockSession, loadFullMockSession } from './fullMockSession'
import './examHub.css'

export default function FullMockSummary() {
  const navigate = useNavigate()
  const { mockId } = useParams<{ mockId: string }>()
  const mock = mockId ? getFullMockTest(mockId) : null
  const session = loadFullMockSession()

  if (!mock || !session || session.mockId !== mock.id) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không có dữ liệu Full Test.</p>
      </div>
    )
  }

  const elapsedMin = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000))

  return (
    <div className="exam-hub-page">
      <div className="exam-hub-page__inner">
        <section className="exam-full-mock-hero">
          <p className="exam-hub-kicker">Hoàn thành Full Test</p>
          <h1 className="exam-hub-title">{mock.title}</h1>
          <p className="exam-hub-desc">Thời gian làm bài: ~{elapsedMin} phút</p>

          <div className="exam-full-summary-grid">
            {session.reading && (
              <article className="exam-full-summary-card">
                <p className="exam-full-summary-label">Reading</p>
                <p className="exam-full-summary-value">
                  {session.reading.correct}/{session.reading.total}
                </p>
              </article>
            )}
            {session.listening && (
              <article className="exam-full-summary-card">
                <p className="exam-full-summary-label">Listening</p>
                <p className="exam-full-summary-value">
                  {session.listening.correct}/{session.listening.total}
                </p>
              </article>
            )}
            {session.writing && (
              <article className="exam-full-summary-card">
                <p className="exam-full-summary-label">Writing</p>
                <p className="exam-full-summary-value">
                  {session.writing.task1Words + session.writing.task2Words} từ
                </p>
                <p className="exam-full-summary-sub">
                  T1: {session.writing.task1Words} · T2: {session.writing.task2Words}
                </p>
              </article>
            )}
          </div>

          <p className="exam-hub-desc" style={{ marginTop: '1rem' }}>
            Writing chưa chấm band trong Full Test. Dùng module Writing để chấm AI sau.
          </p>

          <div className="exam-hub-actions">
            <button
              type="button"
              className="exam-hub-cta"
              onClick={() => {
                clearFullMockSession()
                navigate(`/app/exam/full/${mock.id}`)
              }}
            >
              Làm lại Full Test
            </button>
            <button
              type="button"
              className="exam-hub-cta exam-hub-cta--ghost"
              onClick={() => {
                clearFullMockSession()
                navigate('/app/exam')
              }}
            >
              Về Luyện thi
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}