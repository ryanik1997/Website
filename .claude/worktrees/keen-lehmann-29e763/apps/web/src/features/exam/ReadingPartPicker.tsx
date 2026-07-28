import { ChevronRight, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { resolveReadingExam } from './examLoader'
import { IELTS_READING_PASSAGE_RANGES } from './ieltsReadingWizard/ieltsReadingWizardConfig'

export default function ReadingPartPicker() {
  const navigate = useNavigate()
  const { examId } = useParams<{ examId: string }>()
  const exam = useLiveQuery(() => examId ? resolveReadingExam(examId) : null, [examId])

  if (exam === undefined) return <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}><Loader2 className="animate-spin" style={{ color: 'var(--color-primary)' }} /></div>
  if (!exam) return <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>Không tìm thấy bài Reading.</div>

  const open = (part?: number) => navigate(`/app/exam/reading/${exam.id}${part ? `?part=${part}` : ''}`)
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-8" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <button type="button" className="mb-8 self-start text-sm" style={{ color: 'var(--text-muted)' }} onClick={() => navigate(-1)}>← Quay lại</button>
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--color-primary)' }}>IELTS Reading</p>
      <h1 className="mt-2 text-3xl font-bold">Chọn cách làm bài</h1>
      <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Chọn một passage để luyện tập, hoặc làm toàn bài như hiện tại.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {exam.parts.slice(0, 3).map(part => {
          const range = IELTS_READING_PASSAGE_RANGES[part.partNumber as 1 | 2 | 3]
          const count = range ? range[1] - range[0] + 1 : 0
          return <button key={part.id} type="button" className="group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }} onClick={() => open(part.partNumber)}>
            <div className="flex items-center justify-between"><span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Passage {part.partNumber}</span><ChevronRight size={20} /></div>
            <h2 className="mt-5 text-xl font-bold">{part.passageTitle}</h2>
            {range && <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Q{range[0]}–{range[1]} · {count} câu</p>}
          </button>
        })}
        <button type="button" className="group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 sm:col-span-2" style={{ borderColor: 'var(--color-primary)', background: 'var(--bg-card)' }} onClick={() => open()}>
          <div className="flex items-center justify-between"><span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>Full Test</span><ChevronRight size={20} /></div>
          <h2 className="mt-5 text-xl font-bold">Toàn bài</h2><p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>40 câu · 3 passages</p>
        </button>
      </div>
    </main>
  )
}
