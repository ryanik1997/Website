import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExamResult from './ExamResult'
import { getReadingExam } from './examData'

const STORAGE_PREFIX = 'exam-reading-draft:'

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function ReadingTest() {
  const navigate = useNavigate()
  const { examId } = useParams<{ examId: string }>()
  const exam = useMemo(() => (examId ? getReadingExam(examId) : null), [examId])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(() => (exam?.durationMinutes ?? 60) * 60)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const questions = useMemo(() => exam?.parts.flatMap(part => part.questions) ?? [], [exam])
  const currentQuestion = questions[currentQuestionIndex] ?? null
  const currentPart = exam?.parts.find(part => part.questions.some(question => question.id === currentQuestion?.id)) ?? null
  const storageKey = exam ? `${STORAGE_PREFIX}${exam.id}` : ''

  useEffect(() => {
    if (!exam) return
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) {
      setAnswers({})
      setTimeLeft(exam.durationMinutes * 60)
      return
    }

    try {
      const saved = JSON.parse(savedRaw) as {
        answers?: Record<string, string>
        timeLeft?: number
        submitted?: boolean
      }
      setAnswers(saved.answers ?? {})
      setTimeLeft(typeof saved.timeLeft === 'number' ? saved.timeLeft : exam.durationMinutes * 60)
      setSubmitted(Boolean(saved.submitted))
    } catch {
      setAnswers({})
      setTimeLeft(exam.durationMinutes * 60)
    }
  }, [exam, storageKey])

  useEffect(() => {
    if (!exam) return
    window.localStorage.setItem(storageKey, JSON.stringify({
      answers,
      timeLeft,
      submitted,
    }))
  }, [answers, exam, storageKey, submitted, timeLeft])

  useEffect(() => {
    if (!exam || submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [exam, submitted, timeLeft])

  if (!exam) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="rounded-2xl border px-5 py-4 text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          Khong tim thay bai Reading.
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <ExamResult
        exam={exam}
        answers={answers}
        onRetry={() => {
          window.localStorage.removeItem(storageKey)
          setAnswers({})
          setTimeLeft(exam.durationMinutes * 60)
          setCurrentQuestionIndex(0)
          setSubmitted(false)
        }}
        onBack={() => navigate('/app/exam')}
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <header
        className="border-b px-4 py-4 sm:px-6"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--color-primary)' }}>
              Luyen thi IELTS
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {exam.title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              Reading test, passage ben trai va cau hoi ben phai. Du lieu mau de mo rong sau.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="rounded-2xl border px-4 py-3"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 10%, var(--bg-card))',
                borderColor: 'color-mix(in srgb, var(--color-primary) 22%, var(--border-color))',
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
                Thoi gian con lai
              </p>
              <p className="mt-1 text-xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {formatClock(timeLeft)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0 flex-col overflow-hidden px-4 py-4 sm:px-6">
        <div className="grid flex-1 min-h-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section
            className="min-h-0 overflow-y-auto rounded-[28px] border p-5 sm:p-6"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  {currentPart?.title ?? 'Part'}
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {currentPart?.passageTitle}
                </h2>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{
                  background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)',
                  color: 'var(--color-accent)',
                }}
              >
                {exam.bandHint}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {currentPart?.passage.map((paragraph, index) => (
                <p
                  key={`${currentPart.id}-${index}`}
                  className="text-sm leading-7 sm:text-[15px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <aside className="flex min-h-0 flex-col gap-4">
            <section
              className="rounded-[28px] border p-5 sm:p-6"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
                    Question {currentQuestion?.number}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {currentQuestion?.type === 'true-false-not-given' ? 'True / False / Not Given' : 'Multiple Choice'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
                    Tien do
                  </p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {currentQuestionIndex + 1}/{questions.length}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-base font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {currentQuestion?.prompt}
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {currentQuestion?.options.map(option => {
                  const checked = answers[currentQuestion.id] === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.id }))}
                      className="flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
                      style={{
                        background: checked
                          ? 'color-mix(in srgb, var(--color-primary) 11%, var(--bg-card))'
                          : 'var(--bg-primary)',
                        borderColor: checked
                          ? 'color-mix(in srgb, var(--color-primary) 32%, var(--border-color))'
                          : 'var(--border-color)',
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold uppercase"
                        style={{
                          borderColor: checked ? 'var(--color-primary)' : 'var(--border-color)',
                          color: checked ? 'var(--color-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {option.id}
                      </span>
                      <span className="text-sm leading-6" style={{ color: 'var(--text-primary)' }}>
                        {option.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section
              className="rounded-[28px] border p-5"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {questions.map((question, index) => {
                  const isActive = index === currentQuestionIndex
                  const isAnswered = Boolean(answers[question.id])
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className="rounded-xl px-0 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
                      style={{
                        background: isActive
                          ? 'var(--text-primary)'
                          : isAnswered
                            ? 'color-mix(in srgb, var(--color-primary) 12%, var(--bg-card))'
                            : 'var(--bg-primary)',
                        color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                        border: `1px solid ${isActive ? 'var(--text-primary)' : 'var(--border-color)'}`,
                      }}
                    >
                      {question.number}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] disabled:opacity-40"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex-1 rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] disabled:opacity-40"
                  style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                >
                  Next →
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
