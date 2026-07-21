import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listeningExamBackPath } from './examNavigation'
import ListeningSubmittedScreen from './ListeningSubmittedScreen'
import ListeningTranscriptSidePanel from './ListeningTranscriptSidePanel'
import ListeningPetGapFillPartView from './ListeningPetGapFillPartView'
import ListeningPetMcPartView from './ListeningPetMcPartView'
import ListeningKetPart1PictureView from './ListeningKetPart1PictureView'
import ListeningQuestionAnswerPanel from './ListeningQuestionAnswerPanel'
import ListeningQuestionPromptPanel from './ListeningQuestionPromptPanel'
import {
  isPetExtractPart,
  isPetGroupedGapFillPart,
  isPetInterviewPart,
  isPetPicturePart,
  isPetSpecialPartLayout,
  PET_LISTENING_DURATION_MINUTES,
} from './listeningPetPartLayout'
import { patchFullMockSession } from './fullMockSession'
import { clearListeningDraft } from './examCompletion'
import { ExamHighlightProvider } from './examHighlightContext'
import ReadingHighlightToolbar from './ReadingHighlightToolbar'
import { notifyExamDraftRevision } from './useExamDraftRevision'
import { useExamDraftGate } from './useExamDraftGate'
import { usePartHighlights } from './usePartHighlights'
import ExamTimerControls from './ExamTimerControls'
import { initialExamTimerSeconds } from './examTimer'
import type { ListeningExam } from './listeningExamData'
import { getListeningExamQuestions, getPartQuestions } from './listeningExamData'
import { buildListeningReviewStatusMap, examReviewPillStyle, type ExamReviewStatus } from './examReviewUtils'
import ListeningReviewActiveBar from './ListeningReviewActiveBar'
import ListeningReviewTranscriptToolbar from './ListeningReviewTranscriptToolbar'
import ExamReviewAiPanel from './ExamReviewAiPanel'
import { useExamReviewAi } from './useExamReviewAi'
import { useListeningReviewTranscript } from './useListeningReviewTranscript'
import { useExamQuestionAudio } from './useExamQuestionAudio'
import { useAudioSync } from './useAudioSync'
import { useListeningPlayLimits } from './useListeningPlayLimits'
import { registerListeningAutoPlay } from './listeningExamAutoPlayBridge'
import {
  hasExamAudioSource,
  resolveListeningAudioSource,
  sharedExamAudioSource,
} from './listeningExamAudio'
import { resetListeningSplitPanes } from './listeningScrollUtils'
import { useListeningSplitPane } from './useListeningSplitPane'
import { Bell, Check, ChevronLeft, ChevronRight, Edit3, Menu, Wifi } from 'lucide-react'

const STORAGE_PREFIX = 'exam-listening-draft:'

interface Props {
  exam: ListeningExam
  sessionStarted?: boolean
}

export default function ListeningPetTest({ exam, sessionStarted = true }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock')
  const allQuestions = useMemo(() => getListeningExamQuestions(exam), [exam])
  const bodyRef = useRef<HTMLDivElement>(null)
  const { isResizing } = useListeningSplitPane()

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [unsure, setUnsure] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(initialExamTimerSeconds(PET_LISTENING_DURATION_MINUTES))
  const [partIndex, setPartIndex] = useState(0)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [transcriptPanelOpen, setTranscriptPanelOpen] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const storageKey = `${STORAGE_PREFIX}${exam.id}`
  const { isHydrated, markHydrated } = useExamDraftGate(storageKey)
  const currentPart = exam.parts[partIndex] ?? null
  const {
    highlights,
    notes,
    highlightsByPart,
    notesByPart,
    handleHighlightsChange,
    handleNotesChange,
    setAnnotationsByPart,
    clearAllHighlights,
  } = usePartHighlights(currentPart?.id)
  const partQuestions = useMemo(
    () => (currentPart ? getPartQuestions(currentPart) : []),
    [currentPart],
  )
  const currentQuestion = useMemo(
    () => allQuestions.find(q => q.id === activeQuestionId) ?? null,
    [activeQuestionId, allQuestions],
  )
  const audioSource = useMemo(
    () => resolveListeningAudioSource(exam, currentPart),
    [exam, currentPart],
  )
  const isPicturePart = Boolean(currentPart && isPetPicturePart(exam.examType, currentPart))
  const isExtractPart = Boolean(currentPart && isPetExtractPart(exam.examType, currentPart))
  const isGroupedGapFill = Boolean(currentPart && isPetGroupedGapFillPart(exam.examType, currentPart))
  const isInterviewPart = Boolean(currentPart && isPetInterviewPart(exam.examType, currentPart))
  const isPartLayout = Boolean(currentPart && isPetSpecialPartLayout(exam.examType, currentPart))

  const {
    playing,
    buffering,
    progressPct,
    timeLabel,
    audioCurrentTime,
    audioDuration,
    play,
    seekToPct,
    stopPlayback,
    resetPlayback,
    playError,
    speed,
    toggleSpeed,
  } = useExamQuestionAudio()

  const { markManualInteraction } = useAudioSync({
    audioCurrentTime,
    audioDuration,
    playing,
    exam,
    currentPart,
    submitted,
    reviewMode,
    activeQuestionId,
    onQuestionChange: setActiveQuestionId,
    onPartChange: setPartIndex,
    scrollRoot: bodyRef.current,
  })

  const { canPlay, playsLeft, recordPlay, resetPlayCounts } = useListeningPlayLimits(exam.examMode)
  const playKey = useMemo(() => {
    if (sharedExamAudioSource(exam)) return `exam-${exam.id}`
    if (currentPart) return `exam-${exam.id}-part-${currentPart.partNumber}`
    return `exam-${exam.id}`
  }, [exam, currentPart])
  const maxPlays = exam.examMode === 'exam' ? 2 : undefined
  const hasAudioFile = hasExamAudioSource(audioSource)
  const left = playsLeft(playKey, maxPlays)
  const blocked = !canPlay(playKey, maxPlays)

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: exam.examMode === 'practice',
    beforePlay: () => canPlay(playKey, maxPlays),
    onPlayCounted: () => recordPlay(playKey),
  }), [canPlay, exam.examMode, maxPlays, playKey, recordPlay])

  /** Đề import nhiều part*.mp3: chuyển part → auto phát audio part đó. */
  const autoPlayPartAudio = useCallback((index: number) => {
    if (submitted || reviewMode || !sessionStarted) return
    if (sharedExamAudioSource(exam)) return
    const part = exam.parts[index]
    if (!part) return
    const source = resolveListeningAudioSource(exam, part)
    if (!hasExamAudioSource(source)) return
    const key = `exam-${exam.id}-part-${part.partNumber}`
    if (!canPlay(key, maxPlays)) return
    void play(source, {
      rate: 1,
      allowSeek: exam.examMode === 'practice',
      beforePlay: () => canPlay(key, maxPlays),
      onPlayCounted: () => recordPlay(key),
    })
  }, [canPlay, exam, maxPlays, play, recordPlay, reviewMode, sessionStarted, submitted])

  useEffect(() => {
    registerListeningAutoPlay(() => {
      if (submitted || reviewMode) return
      if (!hasAudioFile && !audioSource.ttsText?.trim()) return
      return play(audioSource, makePlayOpts(1))
    })
    return () => registerListeningAutoPlay(null)
  }, [audioSource, hasAudioFile, makePlayOpts, play, reviewMode, submitted])

  const resetTimer = useCallback(() => {
    setTimeLeft(initialExamTimerSeconds(PET_LISTENING_DURATION_MINUTES))
  }, [])

  useEffect(() => {
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) {
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
      markHydrated()
      return
    }
    try {
      const saved = JSON.parse(savedRaw) as {
        answers?: Record<string, string>
        unsure?: Record<string, boolean>
        timeLeft?: number
        partIndex?: number
        activeQuestionId?: string | null
        questionIndex?: number
        submitted?: boolean
        highlightsByPart?: Record<string, import('./readingHighlightUtils').ReadingHighlight[]>
        notesByPart?: Record<string, import('./readingHighlightUtils').TextNote[]>
      }
      setAnswers(saved.answers ?? {})
      setUnsure(saved.unsure ?? {})
      setTimeLeft(
        typeof saved.timeLeft === 'number'
          ? saved.timeLeft
          : initialExamTimerSeconds(PET_LISTENING_DURATION_MINUTES),
      )
      setSubmitted(Boolean(saved.submitted))

      if (typeof saved.partIndex === 'number' && saved.activeQuestionId) {
        setPartIndex(saved.partIndex)
        setActiveQuestionId(saved.activeQuestionId)
      } else if (typeof saved.questionIndex === 'number') {
        const q = allQuestions[saved.questionIndex]
        if (q) {
          const pi = exam.parts.findIndex(part => part.questions.some(x => x.id === q.id))
          setPartIndex(pi >= 0 ? pi : 0)
          setActiveQuestionId(q.id)
        } else {
          setPartIndex(0)
          setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
        }
      } else {
        setPartIndex(typeof saved.partIndex === 'number' ? saved.partIndex : 0)
        setActiveQuestionId(saved.activeQuestionId ?? getPartQuestions(exam.parts[0])[0]?.id ?? null)
      }
      setAnnotationsByPart(saved.highlightsByPart ?? {}, saved.notesByPart ?? {})
    } catch {
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    }
    markHydrated()
  }, [allQuestions, exam, setAnnotationsByPart, storageKey, markHydrated])

  useEffect(() => {
    if (!isHydrated) return
    try {
    window.localStorage.setItem(storageKey, JSON.stringify({
      answers,
      unsure,
      timeLeft,
      partIndex,
      activeQuestionId,
      submitted,
      highlightsByPart,
      notesByPart,
      updatedAt: Date.now(),
    }))
    notifyExamDraftRevision()
    } catch {
      /* quota */
    }
  }, [activeQuestionId, answers, highlightsByPart, notesByPart, partIndex, storageKey, submitted, timeLeft, unsure, isHydrated])

  useEffect(() => {
    if (!sessionStarted || submitted || reviewMode) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }
    const timer = window.setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [reviewMode, sessionStarted, submitted, timeLeft])

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
    autoPlayPartAudio(index)
  }, [exam.parts, autoPlayPartAudio])

  const handleSelectQuestion = useCallback((questionId: string) => {
    setActiveQuestionId(questionId)
  }, [])

  const answeredInPart = useCallback((index: number) => {
    return getPartQuestions(exam.parts[index]).filter(q => Boolean(answers[q.id])).length
  }, [answers, exam.parts])

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

  useEffect(() => {
    if (submitted || isPartLayout) return
    window.requestAnimationFrame(() => resetListeningSplitPanes(bodyRef.current))
  }, [activeQuestionId, isPartLayout, submitted])

  const handleRetry = useCallback(() => {
    clearListeningDraft(exam.id)
    clearAllHighlights()
    resetPlayback()
    resetPlayCounts()
    setAnswers({})
    setUnsure({})
    setTimeLeft(initialExamTimerSeconds(PET_LISTENING_DURATION_MINUTES))
    setPartIndex(0)
    setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    setSubmitted(false)
    setReviewMode(false)
    if (fullMockId) {
      patchFullMockSession({ stage: 'listening', listening: undefined })
    }
  }, [clearAllHighlights, exam.id, exam.parts, fullMockId, resetPlayCounts, resetPlayback])

  const answeredCount = useMemo(
    () => allQuestions.filter(q => Boolean(answers[q.id])).length,
    [allQuestions, answers],
  )
  const activeQuestionIndex = activeQuestionId
    ? allQuestions.findIndex(q => q.id === activeQuestionId)
    : -1

  const reviewStatusMap = useMemo((): Record<string, ExamReviewStatus> => {
    if (!reviewMode) return {}
    return buildListeningReviewStatusMap(exam, answers)
  }, [answers, exam, reviewMode])

  const { aiText: reviewAiText, hideAi: hideReviewAi } = useExamReviewAi(
    exam.id,
    'listening',
    reviewMode,
  )
  const reviewActiveQuestionNumber = useMemo(() => {
    if (!reviewMode || !activeQuestionId) return null
    return allQuestions.find(q => q.id === activeQuestionId)?.number ?? null
  }, [activeQuestionId, allQuestions, reviewMode])

  const {
    showToolbar: showTranscriptToolbar,
    loading: transcriptLoading,
    error: transcriptError,
    aiCount: transcriptAiCount,
    importedCount: transcriptImportedCount,
    transcriptForActive,
    runAi: runTranscriptAi,
  } = useListeningReviewTranscript(exam, reviewMode, currentQuestion)

  // Keep hooks before the submitted branch (Rules of Hooks).
  if (submitted && !reviewMode) {
    return (
      <ListeningSubmittedScreen
        exam={exam}
        answers={answers}
        unsure={unsure}
        allQuestions={allQuestions}
        fullMockId={fullMockId}
        onRetry={handleRetry}
        onReviewWithPaper={() => {
          setReviewMode(true)
          setPartIndex(0)
          setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
        }}
      />
    )
  }

  return (
    <div
      className={`listening-exam-shell listening-ket-cambridge listening-pet-cambridge${isResizing ? ' is-resizing' : ''}${reviewMode ? ' is-review' : ''}`}
      onPointerDownCapture={markManualInteraction}
    >
      {reviewMode && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-semibold" style={{ background: 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <span>Chế độ xem lại đề — pill xanh = đúng · đỏ = sai · vàng = bỏ qua</span>
          <button type="button" className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }} onClick={() => setReviewMode(false)}>Về báo cáo</button>
        </div>
      )}
      {showTranscriptToolbar && (
        <ListeningReviewTranscriptToolbar
          loading={transcriptLoading}
          error={transcriptError}
          aiCount={transcriptAiCount}
          importedCount={transcriptImportedCount}
          onRunAi={force => void runTranscriptAi(force)}
          variant="cambridge"
        />
      )}
      {reviewMode && (
        <ListeningReviewActiveBar
          question={currentQuestion}
          userAnswer={currentQuestion ? (answers[currentQuestion.id] ?? '') : ''}
          status={currentQuestion ? (reviewStatusMap[currentQuestion.id] ?? null) : null}
          transcriptOverride={transcriptForActive}
        />
      )}
      {reviewMode && reviewAiText && (
        <ExamReviewAiPanel
          aiText={reviewAiText}
          activeQuestionNumber={reviewActiveQuestionNumber}
          onClose={hideReviewAi}
        />
      )}
      <header className="listening-ket-cambridge__header">
        <button
          type="button"
          className="listening-ket-cambridge__brand"
          onClick={() => {
            if (reviewMode) { setReviewMode(false); return }
            navigate(listeningExamBackPath(exam))
          }}
          aria-label="Back to exam list"
        >
          <span className="listening-ket-cambridge__crest">C</span>
          <span>
            <strong>CAMBRIDGE</strong>
            <em>English</em>
          </span>
        </button>
        <div className="listening-ket-cambridge__candidate">
          <strong>Candidate ID</strong>
          <span>Audio is playing</span>
        </div>
        <div className="listening-ket-cambridge__tools" aria-label="Exam tools">
          {!reviewMode && (
            <ExamTimerControls timeLeft={timeLeft} onReset={resetTimer} onChange={setTimeLeft} />
          )}
          <button
            type="button"
            className={`listening-transcript-toggle${transcriptPanelOpen ? ' is-on' : ''}`}
            onClick={() => setTranscriptPanelOpen(o => !o)}
            title="Xem transcript (split màn hình)"
          >
            <Edit3 size={14} />
            Transcript
          </button>
          <Wifi size={19} />
          <Bell size={19} />
          <Menu size={22} />
          <Edit3 size={19} />
          <button
            type="button"
            className="listening-ket-cambridge__exit"
            onClick={() => navigate(listeningExamBackPath(exam))}
          >
            Exit
          </button>
        </div>
      </header>

      <div
        ref={bodyRef}
        className="listening-exam-body listening-ket-cambridge__body"
      >
        {currentPart && (
          <ReadingHighlightToolbar
            rootRef={bodyRef}
            highlights={highlights}
            onHighlightsChange={handleHighlightsChange}
            notes={notes}
            onNotesChange={handleNotesChange}
            resetKey={currentPart.id}
          />
        )}
        <ExamHighlightProvider highlights={highlights} notes={notes}>
        {currentPart && (isPartLayout || (isPicturePart && currentQuestion)) && (() => {
          const resizer = null
          const audioBarProps = {
            source: audioSource,
            playing,
            buffering,
            progressPct,
            timeLabel,
            hasAudioFile,
            allowSeek: exam.examMode === 'practice',
            playsLeft: left,
            playBlocked: blocked,
            playError,
            onPlayNormal: () => void play(audioSource, makePlayOpts(1)),
            speed,
            onToggleSpeed: toggleSpeed,
            onSeek: (pct: number) => seekToPct(pct, exam.examMode === 'practice'),
            onStop: stopPlayback,
          }

          if (isGroupedGapFill) {
            return (
              <ListeningPetGapFillPartView
                part={currentPart}
                questions={partQuestions}
                answers={answers}
                activeQuestionId={activeQuestionId}
                audioBar={audioBarProps}
                resizer={null}
                onAnswer={(questionId, value) => { if (reviewMode) return; setAnswers(prev => ({ ...prev, [questionId]: value })) }}
                onSelectQuestion={handleSelectQuestion}
              />
            )
          }

          if (isExtractPart || isInterviewPart) {
            return (
              <ListeningPetMcPartView
                part={currentPart}
                questions={partQuestions}
                answers={answers}
                activeQuestionId={activeQuestionId}
                audioBar={audioBarProps}
                showContext={isExtractPart}
                resizer={null}
                onAnswer={(questionId, value) => { if (reviewMode) return; setAnswers(prev => ({ ...prev, [questionId]: value })) }}
                onSelectQuestion={handleSelectQuestion}
                reviewMode={reviewMode}
                reviewStatusMap={reviewStatusMap}
              />
            )
          }

          if (!currentQuestion) return null

          const isPart1Picture =
            currentPart.partNumber === 1
            && (currentQuestion.type === 'picture-mc' || Boolean(currentQuestion.pictureImageUrl || currentQuestion.pictureImageKey))

          if (isPart1Picture) {
            return (
              <ListeningKetPart1PictureView
                part={currentPart}
                question={currentQuestion}
                answer={answers[currentQuestion.id] ?? ''}
                unsure={Boolean(unsure[currentQuestion.id])}
                audioBar={audioBarProps}
                onAnswer={value => { if (reviewMode) return; setAnswers(prev => ({ ...prev, [currentQuestion.id]: value })) }}
                onUnsureChange={value => setUnsure(prev => ({ ...prev, [currentQuestion.id]: value }))}
                reviewMode={reviewMode}
                reviewStatus={reviewStatusMap[currentQuestion.id] ?? null}
              />
            )
          }

          return (
            <div className="listening-ket-cambridge__stage">
              <div className="listening-ket-cambridge__instruction-card">
                <strong>{currentPart.rangeLabel}</strong>
                {currentPart.instruction && <span>{currentPart.instruction}</span>}
              </div>
              <div className="listening-ket-cambridge__question">
              <ListeningQuestionPromptPanel
                question={currentQuestion}
                partInstruction=""
                partLabel=""
                audioBar={audioBarProps}
              />
              <ListeningQuestionAnswerPanel
                question={currentQuestion}
                answer={answers[currentQuestion.id] ?? ''}
                unsure={Boolean(unsure[currentQuestion.id])}
                onAnswer={value => { if (reviewMode) return; setAnswers(prev => ({ ...prev, [currentQuestion.id]: value })) }}
                onUnsureChange={value => setUnsure(prev => ({ ...prev, [currentQuestion.id]: value }))}
                reviewMode={reviewMode}
                reviewStatus={reviewStatusMap[currentQuestion.id] ?? null}
                transcriptOverride={transcriptForActive}
              />
              </div>
              {resizer}
            </div>
          )
        })()}
        </ExamHighlightProvider>
        <div className="listening-ket-cambridge__side-mark" aria-hidden="true">^</div>
        <div className="listening-ket-cambridge__float-nav">
          <button
            type="button"
            className="listening-ket-cambridge__arrow listening-ket-cambridge__arrow--back"
            disabled={activeQuestionIndex <= 0}
            onClick={() => goAdjacentQuestion(-1)}
            aria-label="Previous question"
          >
            <ChevronLeft size={30} />
          </button>
          <button
            type="button"
            className="listening-ket-cambridge__arrow listening-ket-cambridge__arrow--next"
            disabled={activeQuestionIndex >= allQuestions.length - 1}
            onClick={() => goAdjacentQuestion(1)}
            aria-label="Next question"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      </div>

      <footer className="listening-ket-cambridge__footer">
        <div className="listening-ket-cambridge__footer-parts">
          {exam.parts.map((part, index) => {
            const questions = getPartQuestions(part)
            const answered = answeredInPart(index)
            const isCurrent = index === partIndex
            return (
              <div
                key={part.id}
                className={`listening-ket-cambridge__footer-part${isCurrent ? ' is-current' : ''}`}
              >
                <button type="button" onClick={() => goToPart(index)}>
                  <strong>Part {part.partNumber}</strong>
                  {!isCurrent && <span>{answered} of {questions.length}</span>}
                </button>
                {isCurrent && (
                  <div className="listening-ket-cambridge__qnav">
                    {questions.map(question => {
                      const isActive = activeQuestionId === question.id
                      const rev = reviewMode ? (reviewStatusMap[question.id] ?? null) : null
                      return (
                        <button
                          key={question.id}
                          type="button"
                          className={`${isActive ? ' is-current' : ''}${!rev && answers[question.id] ? ' is-answered' : ''}`}
                          style={examReviewPillStyle(rev, isActive)}
                          title={rev === 'correct' ? 'Đúng' : rev === 'wrong' ? 'Sai' : rev === 'skipped' ? 'Bỏ qua' : undefined}
                          onClick={() => handleSelectQuestion(question.id)}
                        >
                          {question.number}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button
          type="button"
          className="listening-ket-cambridge__submit"
          onClick={() => {
            if (reviewMode) { setReviewMode(false); return }
            setConfirmSubmit(true)
          }}
          aria-label={reviewMode ? 'Back to report' : 'Submit test'}
        >
          <Check size={24} />
        </button>
      </footer>

      <ListeningTranscriptSidePanel
        exam={exam}
        currentPart={currentPart}
        open={transcriptPanelOpen}
        onClose={() => setTranscriptPanelOpen(false)}
        audioCurrentTime={audioCurrentTime}
        audioDuration={audioDuration}
        playing={playing}
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
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Submit Listening?</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              You have answered {answeredCount}/{allQuestions.length} questions.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="listening-exam-btn listening-exam-btn--ghost" onClick={() => setConfirmSubmit(false)}>
                Continue
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

