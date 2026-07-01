import { useEffect, useRef, useState } from 'react'
import {
  Link, Navigate, useLocation, useNavigate, useParams,
} from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AlertTriangle, CheckCircle2, ChevronLeft, Loader2,
} from 'lucide-react'
import { db, lessonRepo } from '@ryan/db'
import ListeningLessonHeader from './ListeningLessonHeader'
import ListeningTabs, { type LessonTab } from './ListeningTabs'
import ListeningPracticeTab from './ListeningPracticeTab'
import ListeningTranscriptTab from './ListeningTranscriptTab'
import ListeningShadowingTab from './ListeningShadowingTab'
import ListeningSidebarCards from './ListeningSidebarCards'
import { parseSentences } from './types'
import { useListeningStore } from './listeningStore'

type DebugMode =
  | 'all'
  | 'no-tabs'
  | 'no-content'
  | 'no-sidebar'
  | 'no-controls'
  | 'only-tabs'
  | 'only-content'
  | 'only-sidebar'

function readDebugMode(search: string): DebugMode {
  const value = new URLSearchParams(search).get('lsnDebug')
  switch (value) {
    case 'no-tabs':
    case 'no-content':
    case 'no-sidebar':
    case 'no-controls':
    case 'only-tabs':
    case 'only-content':
    case 'only-sidebar':
      return value
    default:
      return 'all'
  }
}

type PracticeDebugMode =
  | 'all'
  | 'audio-only'
  | 'input-only'
  | 'actions-only'
  | 'dots-only'
  | 'no-audio'
  | 'no-input'
  | 'no-actions'
  | 'no-dots'

function readPracticeDebugMode(search: string): PracticeDebugMode {
  const value = new URLSearchParams(search).get('lsnPracticeDebug')
  switch (value) {
    case 'audio-only':
    case 'input-only':
    case 'actions-only':
    case 'dots-only':
    case 'no-audio':
    case 'no-input':
    case 'no-actions':
    case 'no-dots':
      return value
    default:
      return 'all'
  }
}

function describeNode(node: HTMLElement) {
  const className = typeof node.className === 'string' ? node.className.trim() : ''
  return {
    tag: node.tagName.toLowerCase(),
    className,
    id: node.id || '',
    scrollWidth: node.scrollWidth,
    clientWidth: node.clientWidth,
    offsetWidth: node.offsetWidth,
  }
}

export default function ListeningLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const setActiveLesson = useListeningStore(s => s.setActiveLesson)
  const [deleting, setDeleting] = useState(false)
  const [leavingAfterDelete, setLeavingAfterDelete] = useState(false)
  const [deleteState, setDeleteState] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [tab, setTab] = useState<LessonTab>('practice')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [showResultImmediately, setShowResultImmediately] = useState(true)
  const [showFullAnswer, setShowFullAnswer] = useState(false)
  const shellRef = useRef<HTMLDivElement | null>(null)

  const lesson = useLiveQuery(
    () => (lessonId ? db.lessons.get(lessonId) : undefined),
    [lessonId],
  )

  useEffect(() => {
    setActiveLesson(lessonId ?? null)
    return () => setActiveLesson(null)
  }, [lessonId, setActiveLesson])

  useEffect(() => {
    if (!deleteState) return
    const timer = window.setTimeout(() => setDeleteState(null), 3200)
    return () => window.clearTimeout(timer)
  }, [deleteState])

  useEffect(() => {
    if (!leavingAfterDelete) return
    const timer = window.setTimeout(() => {
      navigate('/app/listening', { replace: true })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [leavingAfterDelete, navigate])

  useEffect(() => {
    const shell = shellRef.current
    if (!shell) return

    let lastSignature = ''

    function squashHorizontalOverflow() {
      const shellWidth = shell.clientWidth
      const nodes = shell.querySelectorAll<HTMLElement>('*')
      const offenders: HTMLElement[] = []

      shell.querySelectorAll<HTMLElement>('[data-listening-overflow-debug="true"]').forEach(node => {
        node.removeAttribute('data-listening-overflow-debug')
        node.style.outline = ''
        node.style.outlineOffset = ''
      })

      nodes.forEach(node => {
        if (node.scrollWidth <= shellWidth + 1) return
        if (!shell.contains(node)) return

        offenders.push(node)
        node.style.maxWidth = '100%'
        node.style.overflowX = 'hidden'
        node.style.outline = '2px solid #ef4444'
        node.style.outlineOffset = '-1px'
        node.setAttribute('data-listening-overflow-debug', 'true')
      })

      const signature = offenders
        .map(node => {
          const info = describeNode(node)
          return `${info.tag}|${info.id}|${info.className}|${info.scrollWidth}|${info.clientWidth}`
        })
        .join('::')

      if (!offenders.length || signature === lastSignature) return
      lastSignature = signature

      console.groupCollapsed('[Listening overflow debug]')
      console.log('Shell width:', shellWidth)
      offenders.forEach((node, index) => {
        console.log(`Offender ${index + 1}:`, describeNode(node), node)
      })
      console.groupEnd()
    }

    squashHorizontalOverflow()

    const resizeObserver = new ResizeObserver(() => squashHorizontalOverflow())
    resizeObserver.observe(shell)

    const mutationObserver = new MutationObserver(() => squashHorizontalOverflow())
    mutationObserver.observe(shell, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    const timer = window.setTimeout(squashHorizontalOverflow, 120)

    return () => {
      window.clearTimeout(timer)
      mutationObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [tab, sentenceIndex, lessonId])

  const currentLesson = lesson ?? null
  const sentences = currentLesson ? parseSentences(currentLesson.sentences) : []
  const safeIndex = Math.min(sentenceIndex, Math.max(0, sentences.length - 1))
  const current = sentences[safeIndex] ?? null
  const canDeleteLesson = currentLesson?.category === 'user'
  const debugMode = readDebugMode(location.search)
  const practiceDebugMode = readPracticeDebugMode(location.search)

  const showTabs = debugMode !== 'no-tabs' && debugMode !== 'only-content' && debugMode !== 'only-sidebar'
  const showContent = debugMode !== 'no-content' && debugMode !== 'only-tabs' && debugMode !== 'only-sidebar'
  const showSidebar = debugMode !== 'no-sidebar' && debugMode !== 'only-tabs' && debugMode !== 'only-content'
  const showPracticeControls = debugMode !== 'no-controls'

  function markComplete(id: string) {
    setCompletedIds(prev => new Set(prev).add(id))
  }

  async function handleDeleteLesson() {
    if (!currentLesson || !canDeleteLesson || deleting) return

    setDeleting(true)
    let deleted = false

    try {
      await lessonRepo.delete(currentLesson.id)
      setTab('practice')
      setSentenceIndex(0)
      setCompletedIds(new Set())
      setShowResultImmediately(true)
      setShowFullAnswer(false)
      setActiveLesson(null)
      setDeleteState({ type: 'success', message: 'Da xoa bai nghe.' })
      setLeavingAfterDelete(true)
      deleted = true
    } catch (error) {
      console.error('Khong the xoa bai nghe', error)
      setDeleteState({
        type: 'error',
        message: 'Khong the xoa bai nghe. Vui long thu lai.',
      })
    } finally {
      if (!deleted) {
        setDeleting(false)
      }
    }
  }

  if (!lessonId) return <Navigate to="/app/listening" replace />
  if (leavingAfterDelete) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Da xoa bai nghe. Dang quay ve thu vien...
          </span>
        </div>
      </div>
    )
  }
  if (lesson === undefined) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dang tai...</p>
      </div>
    )
  }
  if (!currentLesson) return <Navigate to="/app/listening" replace />

  return (
    <div ref={shellRef} className="listening-lesson-shell h-full min-h-0 overflow-y-auto overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      <style>
        {`
          .listening-lesson-shell,
          .listening-lesson-shell * {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .listening-lesson-shell::-webkit-scrollbar,
          .listening-lesson-shell *::-webkit-scrollbar {
            width: 0;
            height: 0;
            display: none;
            background: transparent;
          }

          /* Chặn thanh cuộn ngang thừa trong header/tabs listening nếu có class cũ còn render. */
          .listening-lesson-shell div.flex.min-w-0.gap-6.overflow-x-auto {
            overflow-x: hidden !important;
            max-width: 100%;
          }

          .listening-lesson-shell div.flex.min-w-0.gap-6.overflow-x-auto > * {
            max-width: 100%;
          }
        `}
      </style>

      <div className="mx-auto min-w-0 max-w-[1080px] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
        <Link
          to="/app/listening"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} />
          Quay lai thu vien
        </Link>

        <ListeningLessonHeader lesson={currentLesson} />

        {showTabs && (
          <ListeningTabs
            active={tab}
            onChange={setTab}
            canDelete={canDeleteLesson}
            deleting={deleting}
            onDelete={() => void handleDeleteLesson()}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {showContent && (
            <div className="flex flex-col gap-4 lg:col-span-2">
              {sentences.length === 0 ? (
                <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Bai nay chua co cau nao.
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
                      debugMode={practiceDebugMode}
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

              {showPracticeControls && tab === 'practice' && sentences.length > 0 && (
                <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide">
                  <label className="flex cursor-pointer items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={showResultImmediately}
                      onChange={e => setShowResultImmediately(e.target.checked)}
                      className="accent-[var(--color-primary)]"
                    />
                    Hien ket qua ngay
                  </label>
                  <label className="flex cursor-pointer items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={showFullAnswer}
                      onChange={e => setShowFullAnswer(e.target.checked)}
                      className="accent-[var(--color-primary)]"
                    />
                    Hien dap an day du
                  </label>
                </div>
              )}
            </div>
          )}

          {showSidebar && (
            <div className="lg:col-span-1">
              <ListeningSidebarCards
                sentence={current}
                showTranslation={current ? completedIds.has(current.id) : false}
                pronunciationRevealed={current ? completedIds.has(current.id) : false}
              />
            </div>
          )}
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
