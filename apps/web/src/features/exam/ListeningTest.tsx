import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import ListeningIeltsTest from './ListeningIeltsTest'
import ListeningFceTest from './ListeningFceTest'
import ListeningKetTest from './ListeningKetTest'
import ListeningPetTest from './ListeningPetTest'
import { isKetStyleListening, isPetStyleListening } from './listeningExamData'
import { resolveListeningExam } from './listeningExamLoader'
import './listeningTest.css'

export default function ListeningTest() {
  const { examId } = useParams<{ examId: string }>()
  const exam = useLiveQuery(
    () => (examId ? resolveListeningExam(examId) : null),
    [examId],
  )

  if (exam === undefined) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div
          className="rounded-2xl border px-5 py-4 text-sm"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          Không tìm thấy bài Listening.
        </div>
      </div>
    )
  }

  const shell = (child: ReactNode) => (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {child}
    </div>
  )

  if (isKetStyleListening(exam.examType)) {
    return shell(<ListeningKetTest exam={exam} />)
  }

  if (isPetStyleListening(exam.examType)) {
    return shell(<ListeningPetTest exam={exam} />)
  }

  if (exam.examType === 'fce' || exam.examType === 'cae' || exam.examType === 'cpe') {
    return shell(<ListeningFceTest exam={exam} />)
  }

  return shell(<ListeningIeltsTest exam={exam} />)
}
