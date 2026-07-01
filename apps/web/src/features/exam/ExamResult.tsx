import type { ReadingExam } from './examData'

interface Props {
  exam: ReadingExam
  answers: Record<string, string>
  onRetry: () => void
  onBack: () => void
}

export default function ExamResult({ exam, answers, onRetry, onBack }: Props) {
  const questions = exam.parts.flatMap(part => part.questions)
  const correctCount = questions.filter(question => answers[question.id] === question.answer).length
  const scoreText = `${correctCount}/${questions.length}`

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div
          className="rounded-[28px] border p-6 sm:p-7"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--color-primary)' }}>
                Ket qua bai thi
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                {exam.title}
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Da nop bai Reading. Xem dap an, giai thich va lam lai neu can.
              </p>
            </div>

            <div
              className="rounded-2xl border px-4 py-3"
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 10%, var(--bg-card))',
                borderColor: 'color-mix(in srgb, var(--color-primary) 24%, var(--border-color))',
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                Tong diem
              </p>
              <p className="mt-1 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {scoreText}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.55fr)]">
          <div className="flex flex-col gap-4">
            {exam.parts.map(part => (
              <section
                key={part.id}
                className="rounded-[24px] border p-5 sm:p-6"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                    {part.title}
                  </p>
                  <h2 className="mt-1 text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {part.passageTitle}
                  </h2>
                </div>

                <div className="flex flex-col gap-4">
                  {part.questions.map(question => {
                    const userAnswer = answers[question.id] ?? ''
                    const isCorrect = userAnswer === question.answer

                    return (
                      <article
                        key={question.id}
                        className="rounded-2xl border p-4"
                        style={{
                          background: 'var(--bg-primary)',
                          borderColor: isCorrect
                            ? 'color-mix(in srgb, #22c55e 42%, var(--border-color))'
                            : 'color-mix(in srgb, #ef4444 32%, var(--border-color))',
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                            Cau {question.number}
                          </span>
                          <span
                            className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                            style={{
                              background: isCorrect
                                ? 'color-mix(in srgb, #22c55e 14%, transparent)'
                                : 'color-mix(in srgb, #ef4444 12%, transparent)',
                              color: isCorrect ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {isCorrect ? 'Dung' : 'Sai'}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {question.prompt}
                        </p>

                        <div className="mt-3 grid gap-2">
                          <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Ban chon: </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                              {question.options.find(option => option.id === userAnswer)?.label ?? 'Chua tra loi'}
                            </span>
                          </div>
                          <div className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Dap an dung: </span>
                            <span style={{ color: 'var(--text-primary)' }}>
                              {question.options.find(option => option.id === question.answer)?.label ?? question.answer}
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {question.explanation}
                        </p>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <aside className="flex flex-col gap-4">
            <div
              className="rounded-[24px] border p-5"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
                Tiep theo
              </p>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Ban co the lam lai bai Reading nay hoac quay ve thu vien Luyen thi de chon de khac.
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5"
                  style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                >
                  Lam lai
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em]"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Quay lai thu vien thi
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
