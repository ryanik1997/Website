import { useCallback, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import ListeningExamStartOverlay from './ListeningExamStartOverlay'
import ListeningIeltsTest from './ListeningIeltsTest'
import ListeningFceTest from './ListeningFceTest'
import ListeningKetTest from './ListeningKetTest'
import ListeningPetTest from './ListeningPetTest'
import { triggerListeningAutoPlay } from './listeningExamAutoPlayBridge'
import { isKetStyleListening, isPetStyleListening } from './listeningExamData'
import { resolveListeningExam } from './listeningExamLoader'
import './listeningTest.css'

export default function ListeningTest() {
  const { examId } = useParams<{ examId: string }>()
  const exam = useLiveQuery(
    () => (examId ? resolveListeningExam(examId) : null),
    [examId],
  )
  const [sessionStarted, setSessionStarted] = useState(false)

  const handlePlayStart = useCallback(async () => {
    // Giữ user gesture: phát audio trong cùng stack click (không dùng useEffect)
    setSessionStarted(true)
    try {
      await triggerListeningAutoPlay()
    } catch (err) {
      console.warn('[listening] auto-play sau overlay Play thất bại', err)
    }
  }, [])

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

  let body: ReactNode
  if (isKetStyleListening(exam.examType)) {
    body = <ListeningKetTest exam={exam} sessionStarted={sessionStarted} />
  } else if (isPetStyleListening(exam.examType)) {
    body = <ListeningPetTest exam={exam} sessionStarted={sessionStarted} />
  } else if (exam.examType === 'fce' || exam.examType === 'cae' || exam.examType === 'cpe') {
    body = <ListeningFceTest exam={exam} sessionStarted={sessionStarted} />
  } else {
    body = <ListeningIeltsTest exam={exam} sessionStarted={sessionStarted} />
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className={`flex h-full min-h-0 flex-col overflow-hidden${sessionStarted ? '' : ' listening-exam-shell--locked'}`}
        aria-hidden={!sessionStarted}
      >
        {body}
      </div>
      {!sessionStarted && (
        <ListeningExamStartOverlay
          examMode={exam.examMode}
          onPlay={handlePlayStart}
        />
      )}
    </div>
  )
}
