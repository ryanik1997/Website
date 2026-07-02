import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import ExamHeaderBack from './ExamHeaderBack'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getFullMockTest } from './fullMockData'
import {
  clearFullMockSession,
  loadFullMockSession,
  patchFullMockSession,
} from './fullMockSession'
import './examHub.css'
import './listeningTest.css'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function WritingMockTest() {
  const navigate = useNavigate()
  const { mockId: routeMockId } = useParams<{ mockId: string }>()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock') ?? routeMockId ?? null
  const mock = fullMockId ? getFullMockTest(fullMockId) : null

  const [taskIndex, setTaskIndex] = useState(0)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const tasks = mock?.writingTasks ?? []
  const currentTask = tasks[taskIndex] ?? null
  const currentText = currentTask ? (texts[currentTask.id] ?? '') : ''
  const wordCount = useMemo(() => countWords(currentText), [currentText])

  useEffect(() => {
    if (!mock || !currentTask) return
    setTimeLeft(currentTask.durationMinutes * 60)
  }, [mock, currentTask?.id, currentTask])

  useEffect(() => {
    if (!currentTask || submitted) return
    if (timeLeft <= 0) {
      if (taskIndex < tasks.length - 1) {
        setTaskIndex(i => i + 1)
      } else {
        setSubmitted(true)
      }
      return
    }
    const t = window.setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [currentTask, submitted, taskIndex, tasks.length, timeLeft])

  const finishFullMock = useCallback(() => {
    if (!mock) return
    const task1 = texts.task1 ?? ''
    const task2 = texts.task2 ?? ''
    patchFullMockSession({
      stage: 'done',
      writing: {
        task1,
        task2,
        task1Words: countWords(task1),
        task2Words: countWords(task2),
      },
    })
    navigate(`/app/exam/full/${mock.id}/summary`)
  }, [mock, navigate, texts])

  const handleRetry = useCallback(() => {
    setTexts({})
    setTaskIndex(0)
    setSubmitted(false)
    const first = tasks[0]
    if (first) {
      setTimeLeft(first.durationMinutes * 60)
    }
  }, [tasks])

  const handleSubmitTask = useCallback(() => {
    if (taskIndex < tasks.length - 1) {
      setTaskIndex(i => i + 1)
      return
    }
    setSubmitted(true)
  }, [taskIndex, tasks.length])

  if (!mock || !fullMockId) {
    return (
      <div className="flex h-full items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-md text-center rounded-2xl border p-6" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Writing Mock</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Vào từ Full Mock Test IELTS để làm Writing Task 1 & 2.
          </p>
          <button type="button" className="exam-hub-cta mt-4" onClick={() => navigate('/app/exam/track/ielts')}>
            Về IELTS
          </button>
        </div>
      </div>
    )
  }

  const session = loadFullMockSession()
  if (!session || session.mockId !== mock.id || session.stage !== 'writing') {
    return (
      <div className="flex h-full items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Phiên Full Test không hợp lệ. Bắt đầu lại từ đầu.
        </p>
      </div>
    )
  }

  // ── Hooks phải kết thúc trước nhánh submitted (Rules of Hooks) ──
  if (submitted) {
    const task1 = texts.task1 ?? ''
    const task2 = texts.task2 ?? ''
    const totalWords = countWords(task1) + countWords(task2)

    return (
      <div className="listening-exam-shell">
        <div className="flex h-full min-h-0 flex-col overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
            <div
              className="rounded-[28px] border p-6"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
                Full Mock Test
              </p>
              <h1 className="mt-2 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {mock.title} — Writing
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Đã hoàn thành Writing. Xem tổng kết hoặc làm lại phần Writing.
              </p>
              <div
                className="mt-5 rounded-2xl border px-4 py-3"
                style={{
                  borderColor: 'color-mix(in srgb, var(--color-primary) 28%, var(--border-color))',
                  background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-card))',
                }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                  Tổng số từ
                </p>
                <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{totalWords} từ</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Task 1: {countWords(task1)} · Task 2: {countWords(task2)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                className="listening-exam-btn listening-exam-btn--ghost"
                onClick={() => {
                  if (confirm('Thoát Writing? Tiến độ Full Test sẽ mất.')) {
                    clearFullMockSession()
                    navigate('/app/exam')
                  }
                }}
              >
                Thoát Full Test
              </button>
              <button
                type="button"
                className="listening-exam-btn listening-exam-btn--ghost"
                onClick={handleRetry}
              >
                Làm lại Writing
              </button>
              <button
                type="button"
                className="listening-exam-btn listening-exam-btn--primary"
                onClick={finishFullMock}
              >
                Xem tổng kết Full Test
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="listening-exam-shell">
      <header className="listening-exam-header">
        <ExamHeaderBack
          onClick={() => {
            if (confirm('Quay lại? Tiến độ Writing trong Full Test sẽ mất.')) {
              clearFullMockSession()
              navigate('/app/exam/track/ielts')
            }
          }}
        />
        <h1 className="listening-exam-header__title">{mock.title} — Writing</h1>
        <div className="listening-exam-header__timer">
          <Clock size={15} />
          {formatTimer(timeLeft)}
        </div>
      </header>

      <main className="listening-exam-main">
        <div className="listening-exam-main__wrap">
          {currentTask && (
            <article className="listening-exam-card">
              <header className="listening-exam-card__head">
                <h2 className="listening-exam-card__qnum">{currentTask.title}</h2>
                <span className="text-xs font-semibold" style={{ color: wordCount >= currentTask.minWords ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                  {wordCount} / {currentTask.minWords}+ từ
                </span>
              </header>
              <p className="listening-exam-card__prompt" style={{ whiteSpace: 'pre-wrap' }}>
                {currentTask.prompt}
              </p>
              <textarea
                className="listening-writing-area"
                value={currentText}
                onChange={e => setTexts(prev => ({ ...prev, [currentTask.id]: e.target.value }))}
                placeholder="Viết bài của bạn tại đây…"
                rows={14}
              />
              <div className="listening-exam-card-actions">
                <button
                  type="button"
                  className="listening-exam-btn listening-exam-btn--primary"
                  onClick={handleSubmitTask}
                >
                  {taskIndex < tasks.length - 1 ? 'Task tiếp theo' : 'Hoàn thành Full Test'}
                </button>
              </div>
            </article>
          )}
        </div>
      </main>

      <footer className="listening-exam-footer">
        <p className="listening-exam-footer__count">
          Task {taskIndex + 1} / {tasks.length}
        </p>
      </footer>
    </div>
  )
}