import { useNavigate } from 'react-router-dom'
import { EXAM_LIBRARY } from './examData'

export default function ExamHome() {
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section
          className="rounded-[32px] border px-5 py-6 sm:px-7 sm:py-8"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--bg-card) 88%, var(--color-primary) 12%), var(--bg-card))',
            borderColor: 'var(--border-color)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.26em]" style={{ color: 'var(--color-primary)' }}>
            Luyen thi
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Mock Test IELTS
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: 'var(--text-muted)' }}>
            Bat dau voi Reading Mock Test co timer, passage ben trai va cau hoi ben phai. Listening va Writing da duoc dat san route de mo rong sau.
          </p>
        </section>

        <section className="grid gap-4">
          {EXAM_LIBRARY.map(item => (
            <article
              key={item.id}
              className="rounded-[28px] border p-5 transition-transform hover:-translate-y-0.5 sm:p-6"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--color-primary)' }}>
                    IELTS Academic
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.skills.map(skill => (
                      <span
                        key={skill}
                        className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{
                          background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex w-full max-w-sm flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/app/exam/reading/ielts-reading-01')}
                    className="rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5"
                    style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                  >
                    Lam Reading
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/app/exam/listening')}
                    className="rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em]"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Lam Listening
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/app/exam/writing')}
                    className="rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em]"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Lam Writing
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/app/exam/reading/ielts-reading-01')}
                    className="rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em]"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--color-accent) 26%, var(--border-color))',
                      color: 'var(--color-accent)',
                    }}
                  >
                    Full Test (tam thoi vao Reading)
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
