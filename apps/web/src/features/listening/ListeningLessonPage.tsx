import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { CheckCircle2, ChevronLeft, AlertTriangle } from 'lucide-react'
import { db, lessonRepo } from '@ryan/db'
import ListeningLessonHeader from './ListeningLessonHeader'
import ListeningTabs, { type LessonTab } from './ListeningTabs'
import ListeningPracticeTab from './ListeningPracticeTab'
import ListeningTranscriptTab from './ListeningTranscriptTab'
import ListeningShadowingTab from './ListeningShadowingTab'
import ListeningSidebarCards from './ListeningSidebarCards'
import { parseSentences } from './types'
import { useListeningStore } from './listeningStore'

export default function ListeningLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const setActiveLesson = useListeningStore(s => s.setActiveLesson)
  const [deleting, setDeleting] = useState(false)
  const [deleteState, setDeleteState] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    setActiveLesson(lessonId ?? null)
    return () => setActiveLesson(null)
  }, [lessonId, setActiveLesson])
  const [tab, setTab] = useState<LessonTab>('practice')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [showResultImmediately, setShowResultImmediately] = useState(true)
  const [showFullAnswer, setShowFullAnswer] = useState(false)
  const lesson = useLiveQuery(
    () => (lessonId ? db.lessons.get(lessonId) : undefined),
    [lessonId],
  )

  if (!lessonId) return <Navigate to="/app/listening" replace />
  if (lesson === undefined) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
      </div>
    )
  }
  if (!lesson) return <Navigate to="/app/listening" replace />

  const currentLesson = lesson
  const sentences = parseSentences(currentLesson.sentences)
  const safeIndex = Math.min(sentenceIndex, Math.max(0, sentences.length - 1))
  const current = sentences[safeIndex]
  const canDeleteLesson = currentLesson.category === 'user'

  function markComplete(id: string) {
    setCompletedIds(prev => new Set(prev).add(id))
  }

  async function handleDeleteLesson() {
    if (!canDeleteLesson || deleting) return

    setDeleting(true)

    try {
      await lessonRepo.delete(currentLesson.id)
      setActiveLesson(null)
      setDeleteState({ type: 'success', message: 'Đã xóa bài nghe. Đang quay về thư viện...' })
      window.setTimeout(() => navigate('/app/listening', { replace: true }), 650)
    } catch (error) {
      console.error('Khong the xoa bai nghe', error)
      setDeleteState({
        type: 'error',
        message: 'Không thể xóa bài nghe. Vui lòng thử lại.',
      })
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!deleteState) return
    const timer = window.setTimeout(() => setDeleteState(null), 3200)
    return () => window.clearTimeout(timer)
  }, [deleteState])

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          to="/app/listening"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} />
          Quay lại thư viện
        </Link>

        <ListeningLessonHeader
          lesson={currentLesson}
          canDelete={canDeleteLesson}
          deleting={deleting}
          onDelete={() => void handleDeleteLesson()}
        />
        <ListeningTabs active={tab} onChange={setTab} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {sentences.length === 0 ? (
              <p className="text-sm py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                Bài này chưa có câu nào.
              </p>
            ) : (
              <>
                {tab === 'practice' && current && (
                  <ListeningPracticeTab
                    lessonId={currentLesson.id}
                    sentenceIndex={safeIndex}
                    total={sentences.length}
                    sentence={current}
                    onIndexChange={setSentenceIndex}
                    onSentenceComplete={markComplete}
                    showResultImmediately={showResultImmediately}
                    showFullAnswer={showFullAnswer}
                  />
                )}
                {tab === 'transcript' && (
                  <ListeningTranscriptTab
                    lessonId={currentLesson.id}
                    sentences={sentences}
                    onSentencesChange={() => {}}
                  />
                )}
                {tab === 'shadowing' && current && (
                  <ListeningShadowingTab
                    sentence={current}
                    sentenceIndex={safeIndex}
                    total={sentences.length}
                    onIndexChange={setSentenceIndex}
                  />
                )}
              </>
            )}

            {tab === 'practice' && sentences.length > 0 && (
              <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={showResultImmediately}
                    onChange={e => setShowResultImmediately(e.target.checked)}
                    className="accent-[var(--color-primary)]"
                  />
                  Hiện kết quả ngay
                </label>
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={showFullAnswer}
                    onChange={e => setShowFullAnswer(e.target.checked)}
                    className="accent-[var(--color-primary)]"
                  />
                  Hiện đáp án đầy đủ
                </label>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <ListeningSidebarCards
              sentence={current ?? null}
              showTranslation={current ? completedIds.has(current.id) : false}
              pronunciationRevealed={current ? completedIds.has(current.id) : false}
            />
          </div>
        </div>
      </div>

      {deleteState && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-50">
          <div
            className="flex max-w-sm items-start gap-2 rounded-2xl px-4 py-3 shadow-2xl"
            style={{
              background: deleteState.type === 'success'
                ? 'color-mix(in srgb, #22c55e 12%, var(--bg-card))'
                : 'color-mix(in srgb, #ef4444 10%, var(--bg-card))',
              color: deleteState.type === 'success' ? '#166534' : '#b91c1c',
              border: deleteState.type === 'success'
                ? '1px solid color-mix(in srgb, #22c55e 24%, var(--border-color))'
                : '1px solid color-mix(in srgb, #ef4444 20%, var(--border-color))',
            }}
          >
            {deleteState.type === 'success' ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            )}
            <span className="text-sm font-medium">{deleteState.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
