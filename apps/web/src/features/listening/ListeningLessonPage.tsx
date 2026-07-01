import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft } from 'lucide-react'
import { db } from '@ryan/db'
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
  const setActiveLesson = useListeningStore(s => s.setActiveLesson)

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

  const sentences = parseSentences(lesson.sentences)
  const safeIndex = Math.min(sentenceIndex, Math.max(0, sentences.length - 1))
  const current = sentences[safeIndex]

  function markComplete(id: string) {
    setCompletedIds(prev => new Set(prev).add(id))
  }

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

        <ListeningLessonHeader lesson={lesson} />
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
                    lessonId={lesson.id}
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
                    lessonId={lesson.id}
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
    </div>
  )
}