import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ListeningExamStartOverlay from './ListeningExamStartOverlay'
import ListeningIeltsTidShell from './ListeningIeltsTidShell'
import ListeningFceTest from './ListeningFceTest'
import ListeningKetTest from './ListeningKetTest'
import ListeningPetTest from './ListeningPetTest'
import { triggerListeningAutoPlay } from './listeningExamAutoPlayBridge'
import { isKetStyleListening, isPetStyleListening, type ListeningExam } from './listeningExamData'
import { resolveListeningExam } from './listeningExamLoader'
import './listeningTest.css'

export default function ListeningTest() {
  const { examId } = useParams<{ examId: string }>()
  const [exam, setExam] = useState<ListeningExam | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)

  useEffect(() => {
    let cancelled = false
    setExam(undefined)
    setLoadError(null)
    setSessionStarted(false)
    if (!examId) {
      setExam(null)
      return
    }
    void resolveListeningExam(examId)
      .then(e => {
        if (!cancelled) setExam(e)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setExam(null)
        setLoadError(err instanceof Error ? err.message : 'Không tải được đề Listening.')
      })
    return () => { cancelled = true }
  }, [examId])

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
          className="rounded-2xl border px-5 py-4 text-sm max-w-md text-center"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          {loadError || 'Không tìm thấy bài Listening.'}
        </div>
      </div>
    )
  }

  // IELTS: full TID real_test shell (owns overlay + layout 1:1 theieltsdictionary)
  if (exam.examType === 'ielts') {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <ListeningIeltsTidShell exam={exam} />
      </div>
    )
  }

  let body: ReactNode
  if (isKetStyleListening(exam.examType)) {
    body = <ListeningKetTest exam={exam} sessionStarted={sessionStarted} />
  } else if (isPetStyleListening(exam.examType)) {
    body = <ListeningPetTest exam={exam} sessionStarted={sessionStarted} />
  } else {
    body = <ListeningFceTest exam={exam} sessionStarted={sessionStarted} />
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
