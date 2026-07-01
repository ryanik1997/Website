import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BookOpen, FileUp, Trash2 } from 'lucide-react'
import { examRepo } from '@ryan/db'
import { EXAM_LIBRARY } from './examData'
import { listAllReadingExams } from './examLoader'
import ImportReadingPdfModal from './ImportReadingPdfModal'
import type { ReadingExam } from './examData'
import { getPartQuestions } from './examData'

export default function ExamHome() {
  const navigate = useNavigate()
  const [showImportPdf, setShowImportPdf] = useState(false)

  const readingExams = useLiveQuery(() => listAllReadingExams(), []) ?? []

  const importedExams = readingExams.filter(exam => exam.id.startsWith('reading-pdf-'))

  async function deleteImported(exam: ReadingExam) {
    if (!exam.id.startsWith('reading-pdf-')) return
    if (!confirm(`Xóa đề "${exam.title}"?`)) return
    await examRepo.delete(exam.id)
  }

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
            Luyện thi
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Mock Test IELTS
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: 'var(--text-muted)' }}>
            Reading Mock Test theo giao diện IELTS. Import PDF để tạo đề Part 1–3 (passage + câu hỏi) và lưu trên máy.
          </p>
          <button
            type="button"
            onClick={() => setShowImportPdf(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5"
            style={{
              background: 'color-mix(in srgb, var(--color-accent) 18%, var(--bg-card))',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <FileUp size={16} />
            Import PDF Reading
          </button>
        </section>

        {importedExams.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
              Đề Reading import ({importedExams.length})
            </h2>
            <div className="grid gap-3">
              {importedExams.map(exam => {
                const qCount = exam.parts.reduce((sum, p) => sum + getPartQuestions(p).length, 0)
                return (
                  <article
                    key={exam.id}
                    className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                      >
                        <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {exam.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {exam.parts.length} part · {qCount} câu · {exam.bandHint}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/app/exam/reading/${exam.id}`)}
                        className="rounded-full px-4 py-2.5 text-sm font-bold"
                        style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                      >
                        Làm bài
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteImported(exam)}
                        className="rounded-full border p-2.5"
                        style={{ borderColor: 'var(--border-color)', color: '#dc2626' }}
                        title="Xóa đề"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

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
                    Làm Reading
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/app/exam/listening')}
                    className="rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em]"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Làm Listening
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/app/exam/writing')}
                    className="rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.18em]"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Làm Writing
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {showImportPdf && (
        <ImportReadingPdfModal
          onClose={() => setShowImportPdf(false)}
          onCreated={id => {
            setShowImportPdf(false)
            navigate(`/app/exam/reading/${id}`)
          }}
        />
      )}
    </div>
  )
}