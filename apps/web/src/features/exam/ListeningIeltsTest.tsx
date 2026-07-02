import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import ExamHeaderBack from './ExamHeaderBack'
import ExamPartFooter from './ExamPartFooter'
import { listeningExamBackPath } from './examNavigation'
import ExamTimerControls from './ExamTimerControls'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ListeningSubmittedScreen from './ListeningSubmittedScreen'
import { patchFullMockSession } from './fullMockSession'
import ListeningDualLetterMatchingPartView from './ListeningDualLetterMatchingPartView'
import ListeningLetterMatchingPartView from './ListeningLetterMatchingPartView'
import ListeningIeltsPartView from './ListeningIeltsPartView'
import ListeningSplitResizer from './ListeningSplitResizer'
import { isDualLetterMatchingPart, isGroupedLetterMatchingPart } from './listeningMultiPartLayout'
import type { ListeningExam } from './listeningExamData'
import { getListeningExamQuestions, getPartQuestions } from './listeningExamData'
import {
  hasExamAudioFile,
  resolveListeningAudioSource,
  sharedExamAudioSource,
} from './listeningExamAudio'
import { useExamQuestionAudio } from './useExamQuestionAudio'
import { useListeningPlayLimits } from './useListeningPlayLimits'
import { scrollListeningToQuestion } from './listeningScrollUtils'
import { useListeningSplitPane } from './useListeningSplitPane'
import { clearListeningDraft } from './examCompletion'
import { ExamHighlightProvider } from './examHighlightContext'
import ReadingHighlightToolbar from './ReadingHighlightToolbar'
import { notifyExamDraftRevision } from './useExamDraftRevision'
import { usePartHighlights } from './usePartHighlights'
import { initialExamTimerSeconds } from './examTimer'

const STORAGE_PREFIX = 'exam-listening-draft:'

interface Props {
  exam: ListeningExam
}

export default function ListeningIeltsTest({ exam }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock')
  const allQuestions = useMemo(() => getListeningExamQuestions(exam), [exam])

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [unsure, setUnsure] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(initialExamTimerSeconds(exam.durationMinutes))
  const [partIndex, setPartIndex] = useState(0)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const {
    splitPct,
    isResizing,
    onResizerPointerDown,
    onResizerPointerMove,
    onResizerPointerUp,
  } = useListeningSplitPane()

  const storageKey = `${STORAGE_PREFIX}${exam.id}`
  const currentPart = exam.parts[partIndex] ?? null
  const { highlights, handleHighlightsChange, clearAllHighlights } = usePartHighlights(currentPart?.id)
  const partQuestions = useMemo(
    () => (currentPart ? getPartQuestions(currentPart) : []),
    [currentPart],
  )
  const isDualLetterMatching = Boolean(currentPart && isDualLetterMatchingPart(currentPart))
  const isLetterMatching = Boolean(currentPart && isGroupedLetterMatchingPart(currentPart))

  const {
    playing,
    buffering,
    progressPct,
    timeLabel,
    play,
    seekToPct,
    stopPlayback,
    playError,
  } = useExamQuestionAudio()

  const usesSharedExamAudio = useMemo(() => Boolean(sharedExamAudioSource(exam)), [exam])
  const activeAudioSource = useMemo(
    () => resolveListeningAudioSource(exam, currentPart),
    [exam, currentPart],
  )
  const hasActiveAudioFile = hasExamAudioFile(activeAudioSource)

  const { canPlay, playsLeft, recordPlay, resetPlayCounts } = useListeningPlayLimits(exam.examMode)
  const playKey = usesSharedExamAudio ? `exam-${exam.id}` : (currentPart ? `part-${currentPart.id}` : '')
  const maxPlays = usesSharedExamAudio
    ? (exam.examMode === 'exam' ? 2 : undefined)
    : currentPart?.maxPlays
  const playsRemaining = playsLeft(playKey, maxPlays)
  const playBlocked = !canPlay(playKey, maxPlays)

  useEffect(() => {
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) {
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
      return
    }
    try {
      const saved = JSON.parse(savedRaw) as {
        answers?: Record<string, string>
        unsure?: Record<string, boolean>
        timeLeft?: number
        partIndex?: number
        activeQuestionId?: string | null
        submitted?: boolean
      }
      setAnswers(saved.answers ?? {})
      setUnsure(saved.unsure ?? {})
      setTimeLeft(
        typeof saved.timeLeft === 'number'
          ? saved.timeLeft
          : initialExamTimerSeconds(exam.durationMinutes),
      )
      setPartIndex(typeof saved.partIndex === 'number' ? saved.partIndex : 0)
      setActiveQuestionId(saved.activeQuestionId ?? getPartQuestions(exam.parts[0])[0]?.id ?? null)
      setSubmitted(Boolean(saved.submitted))
    } catch {
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    }
  }, [exam, storageKey])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({
      answers,
      unsure,
      timeLeft,
      partIndex,
      activeQuestionId,
      submitted,
    }))
    notifyExamDraftRevision()
  }, [activeQuestionId, answers, partIndex, storageKey, submitted, timeLeft, unsure])

  useEffect(() => {
    if (submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }
    const timer = window.setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [submitted, timeLeft])

  useEffect(() => {
    if (!currentPart) return
    if (!partQuestions.some(q => q.id === activeQuestionId)) {
      setActiveQuestionId(partQuestions[0]?.id ?? null)
    }
  }, [activeQuestionId, currentPart, partQuestions])

  const goToPart = useCallback((index: number) => {
    if (index < 0 || index >= exam.parts.length) return
    const qs = getPartQuestions(exam.parts[index])
    setPartIndex(index)
    setActiveQuestionId(qs[0]?.id ?? null)
  }, [exam.parts])

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setActiveQuestionId(questionId)
  }, [])

  const answeredInPart = useCallback((index: number) => {
    return getPartQuestions(exam.parts[index]).filter(q => Boolean(answers[q.id])).length
  }, [answers, exam.parts])

  const resetTimer = useCallback(() => {
    setTimeLeft(initialExamTimerSeconds(exam.durationMinutes))
  }, [exam.durationMinutes])

  const goAdjacentQuestion = useCallback((delta: number) => {
    if (!activeQuestionId) return
    const idx = allQuestions.findIndex(q => q.id === activeQuestionId)
    const next = allQuestions[idx + delta]
    if (!next) return

    const nextPartIndex = exam.parts.findIndex(part =>
      getPartQuestions(part).some(q => q.id === next.id),
    )
    if (nextPartIndex >= 0 && nextPartIndex !== partIndex) {
      setPartIndex(nextPartIndex)
    }
    setActiveQuestionId(next.id)
  }, [activeQuestionId, allQuestions, exam.parts, partIndex])

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: exam.examMode === 'practice',
    beforePlay: () => canPlay(playKey, maxPlays),
    onPlayCounted: () => recordPlay(playKey),
  }), [canPlay, exam.examMode, maxPlays, playKey, recordPlay])

  const scrollToQuestion = useCallback((questionId: string) => {
    window.requestAnimationFrame(() => {
      scrollListeningToQuestion(bodyRef.current, questionId)
    })
  }, [])

  const handleSelectQuestion = useCallback((questionId: string) => {
    setActiveQuestionId(questionId)
  }, [])

  useEffect(() => {
    if (submitted || !activeQuestionId) return
    scrollToQuestion(activeQuestionId)
  }, [activeQuestionId, partIndex, scrollToQuestion, submitted])

  const handleRetry = useCallback(() => {
    clearListeningDraft(exam.id)
    clearAllHighlights()
    stopPlayback()
    resetPlayCounts()
    setAnswers({})
    setUnsure({})
    setTimeLeft(initialExamTimerSeconds(exam.durationMinutes))
    setPartIndex(0)
    setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    setSubmitted(false)
    if (fullMockId) {
      patchFullMockSession({ stage: 'listening', listening: undefined })
    }
  }, [clearAllHighlights, exam.durationMinutes, exam.id, exam.parts, fullMockId, resetPlayCounts, stopPlayback])

  const answeredCount = useMemo(
    () => allQuestions.filter(q => Boolean(answers[q.id])).length,
    [allQuestions, answers],
  )

  // ── Hooks phải kết thúc trước nhánh submitted (Rules of Hooks) ──
  if (submitted) {
    return (
      <ListeningSubmittedScreen
        exam={exam}
        answers={answers}
        unsure={unsure}
        allQuestions={allQuestions}
        fullMockId={fullMockId}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <div className={`listening-exam-shell listening-exam-shell--ielts${isResizing ? ' is-resizing' : ''}`}>
      <header className="listening-exam-header">
        <ExamHeaderBack onClick={() => navigate(listeningExamBackPath(exam))} />
        <h1 className="listening-exam-header__title">{exam.title}</h1>
        <ExamTimerControls timeLeft={timeLeft} onReset={resetTimer} />
      </header>

      <div
        ref={bodyRef}
        className="listening-exam-body"
        style={{ '--le-split-pct': `${splitPct}%` } as CSSProperties}
      >
        {currentPart && (
          <ReadingHighlightToolbar
            rootRef={bodyRef}
            highlights={highlights}
            onHighlightsChange={handleHighlightsChange}
            resetKey={currentPart.id}
          />
        )}
        <ExamHighlightProvider highlights={highlights}>
        {currentPart && (() => {
          const resizer = (
            <ListeningSplitResizer
              bodyRef={bodyRef}
              isResizing={isResizing}
              onPointerDown={onResizerPointerDown}
              onPointerMove={onResizerPointerMove}
              onPointerUp={onResizerPointerUp}
            />
          )
          const audioBarProps = {
            source: activeAudioSource,
            playing,
            buffering,
            progressPct,
            timeLabel,
            hasAudioFile: hasActiveAudioFile,
            allowSeek: exam.examMode === 'practice',
            playsLeft: playsRemaining,
            playBlocked,
            playError,
            onPlayNormal: () => void play(activeAudioSource, makePlayOpts(1)),
            onSeek: (pct: number) => seekToPct(pct, exam.examMode === 'practice'),
            onStop: stopPlayback,
          }

          if (isDualLetterMatching) {
            return (
              <ListeningDualLetterMatchingPartView
                part={currentPart}
                questions={partQuestions}
                answers={answers}
                activeQuestionId={activeQuestionId}
                audioBar={audioBarProps}
                resizer={resizer}
                onAnswer={handleAnswer}
                onSelectQuestion={handleSelectQuestion}
              />
            )
          }

          if (isLetterMatching) {
            return (
              <ListeningLetterMatchingPartView
                part={currentPart}
                questions={partQuestions}
                answers={answers}
                activeQuestionId={activeQuestionId}
                audioBar={audioBarProps}
                resizer={resizer}
                onAnswer={handleAnswer}
                onSelectQuestion={handleSelectQuestion}
              />
            )
          }

          return (
            <ListeningIeltsPartView
              part={currentPart}
              questions={partQuestions}
              answers={answers}
              activeQuestionId={activeQuestionId}
              audioBar={audioBarProps}
              examMode={exam.examMode}
              onAnswer={handleAnswer}
              onSelectQuestion={handleSelectQuestion}
            />
          )
        })()}
        </ExamHighlightProvider>
      </div>

      <ExamPartFooter
        parts={exam.parts}
        getPartQuestions={index => {
          const part = exam.parts[index]
          return part ? getPartQuestions(part) : []
        }}
        partIndex={partIndex}
        activeQuestionId={activeQuestionId}
        answers={answers}
        allQuestions={allQuestions}
        answeredInPart={answeredInPart}
        onGoToPart={goToPart}
        onSelectQuestion={handleSelectQuestion}
        onAdjacentQuestion={goAdjacentQuestion}
        onSubmit={() => setConfirmSubmit(true)}
        submitLabel="Submit"
      />

      {confirmSubmit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'color-mix(in srgb, var(--bg-primary) 35%, transparent)' }}
          onClick={() => setConfirmSubmit(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border p-5 shadow-2xl"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Nộp bài Listening?</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Bạn đã trả lời {answeredCount}/{allQuestions.length} câu.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="listening-exam-btn listening-exam-btn--ghost" onClick={() => setConfirmSubmit(false)}>
                Tiếp tục làm
              </button>
              <button type="button" className="listening-exam-btn listening-exam-btn--primary" onClick={() => { setConfirmSubmit(false); setSubmitted(true) }}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}