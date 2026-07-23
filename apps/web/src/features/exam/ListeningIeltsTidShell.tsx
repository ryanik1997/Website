/**
 * IELTS Listening — TID real_test shell (theieltsdictionary.com 1:1 layout).
 * Single-column paper exam: header · part banner · questions · footer pills · Play overlay.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Headphones,
  Maximize2,
  Menu,
  Minimize2,
  Play,
  Type,
  Wifi,
} from 'lucide-react'
import ExamHeaderBack from './ExamHeaderBack'
import { listeningExamBackPath } from './examNavigation'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import ListeningSubmittedScreen from './ListeningSubmittedScreen'
import ListeningTranscriptSidePanel from './ListeningTranscriptSidePanel'
import { patchFullMockSession } from './fullMockSession'
import ListeningDualLetterMatchingPartView from './ListeningDualLetterMatchingPartView'
import ListeningLetterMatchingPartView from './ListeningLetterMatchingPartView'
import ListeningIeltsPartView from './ListeningIeltsPartView'
import { isDualLetterMatchingPart, isGroupedLetterMatchingPart } from './listeningMultiPartLayout'
import type { ListeningExam } from './listeningExamData'
import { getListeningExamQuestions, getPartQuestions } from './listeningExamData'
import { buildListeningReviewStatusMap, type ExamReviewStatus } from './examReviewUtils'
import ListeningReviewActiveBar from './ListeningReviewActiveBar'
import ExamReviewAiPanel from './ExamReviewAiPanel'
import { useExamReviewAi } from './useExamReviewAi'
import ListeningReviewTranscriptToolbar from './ListeningReviewTranscriptToolbar'
import { useListeningReviewTranscript } from './useListeningReviewTranscript'
import {
  hasExamAudioFile,
  resolveListeningAudioSource,
} from './listeningExamAudio'
import { useExamQuestionAudio } from './useExamQuestionAudio'
import { useListeningPlayLimits } from './useListeningPlayLimits'
import { registerListeningAutoPlay } from './listeningExamAutoPlayBridge'
import { scrollListeningToQuestion } from './listeningScrollUtils'
import { clearListeningDraft } from './examCompletion'
import { ExamHighlightProvider } from './examHighlightContext'
import ReadingHighlightToolbar from './ReadingHighlightToolbar'
import { notifyExamDraftRevision } from './useExamDraftRevision'
import { useExamDraftGate } from './useExamDraftGate'
import { usePartHighlights } from './usePartHighlights'
import { formatExamTimer, initialExamTimerSeconds } from './examTimer'
/* App highlight/note/copy toolbar styles (position:fixed popup) */
import './readingTest.css'
import './listeningIeltsTid.css'

const STORAGE_PREFIX = 'exam-listening-draft:'
const ACCENT = '#418ec8'

const FONT_PRESETS = [
  {
    id: 'georgia',
    label: 'Georgia',
    family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    size: 16,
  },
  { id: 'lora', label: 'Lora', family: 'Lora, ui-serif, Georgia, serif', size: 16 },
  {
    id: 'large',
    label: 'Lớn hơn',
    family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    size: 18,
  },
  {
    id: 'small',
    label: 'Nhỏ hơn',
    family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    size: 14,
  },
] as const

interface Props {
  exam: ListeningExam
  /** When false, shell owns the Play overlay (IELTS TID real_test). */
  sessionStarted?: boolean
}

function partBannerText(part: { rangeLabel?: string; partNumber: number; questions: { number: number }[] }) {
  const nums = part.questions.map(q => q.number).sort((a, b) => a - b)
  if (part.rangeLabel?.trim()) {
    const m = part.rangeLabel.match(/\d+/g)
    if (m && m.length >= 2) {
      return `Read the text and answer questions ${m[0]}-${m[m.length - 1]}`
    }
  }
  if (!nums.length) return `Part ${part.partNumber}`
  return `Read the text and answer questions ${nums[0]}-${nums[nums.length - 1]}`
}

export default function ListeningIeltsTidShell({ exam, sessionStarted: sessionStartedProp }: Props) {
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
  const [transcriptPanelOpen, setTranscriptPanelOpen] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [audioStarted, setAudioStarted] = useState(Boolean(sessionStartedProp))
  const [fontPreset, setFontPreset] = useState<(typeof FONT_PRESETS)[number]>(FONT_PRESETS[0])
  const [fontMenuOpen, setFontMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

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
    resetPlayback,
    playError,
    speed,
    toggleSpeed,
  } = useExamQuestionAudio()

  const activeAudioSource = useMemo(
    () => resolveListeningAudioSource(exam, currentPart),
    [exam, currentPart],
  )
  const hasActiveAudioFile = hasExamAudioFile(activeAudioSource)

  const { resetPlayCounts } = useListeningPlayLimits(exam.examMode)
  // TID shell: không giới hạn lượt nghe / không chặn phát sau tua
  const playBlocked = false
  const playsRemaining = null

  // TID shell: luôn cho phép tua / pause-resume
  const allowAudioSeek = true

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: allowAudioSeek,
    // Không dùng beforePlay — tránh chặn im lặng sau seek/resume
    beforePlay: () => true,
  }), [allowAudioSeek])

  // Draft hydrate
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
        submitted?: boolean
        highlightsByPart?: Record<string, import('./readingHighlightUtils').ReadingHighlight[]>
        notesByPart?: Record<string, import('./readingHighlightUtils').TextNote[]>
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
      setReviewMode(false)
      setAnnotationsByPart(saved.highlightsByPart ?? {}, saved.notesByPart ?? {})
      if (saved.submitted) setAudioStarted(true)
    } catch {
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    }
    markHydrated()
  }, [exam, setAnnotationsByPart, storageKey, markHydrated])

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
    } catch { /* quota */ }
  }, [activeQuestionId, answers, highlightsByPart, notesByPart, partIndex, storageKey, submitted, timeLeft, unsure, isHydrated])

  // Countdown remaining (TID style)
  useEffect(() => {
    if (!audioStarted || submitted || reviewMode) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      setReviewMode(false)
      return
    }
    const timer = window.setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [audioStarted, reviewMode, submitted, timeLeft])

  useEffect(() => {
    if (!currentPart) return
    if (!partQuestions.some(q => q.id === activeQuestionId)) {
      setActiveQuestionId(partQuestions[0]?.id ?? null)
    }
  }, [activeQuestionId, currentPart, partQuestions])

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const goToPart = useCallback((index: number) => {
    if (index < 0 || index >= exam.parts.length) return
    const part = exam.parts[index]
    const qs = getPartQuestions(part)
    setPartIndex(index)
    setActiveQuestionId(qs[0]?.id ?? null)
    // TID: mỗi Part có audio riêng — đổi Part thì load & phát audio part đó
    if (!submitted && !reviewMode && audioStarted) {
      resetPlayback()
      const source = resolveListeningAudioSource(exam, part)
      if (hasExamAudioFile(source) || source.ttsText?.trim()) {
        void play(source, makePlayOpts(1)).catch(err => {
          console.warn('[tid-listening] auto-play on part change failed', err)
        })
      }
    }
  }, [audioStarted, exam, makePlayOpts, play, resetPlayback, reviewMode, submitted])

  const handleAnswer = useCallback((questionId: string, value: string) => {
    if (reviewMode) return
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setActiveQuestionId(questionId)
  }, [reviewMode])

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
    registerListeningAutoPlay(() => {
      if (submitted || reviewMode || !audioStarted) return
      if (!hasActiveAudioFile && !activeAudioSource.ttsText?.trim()) return
      return play(activeAudioSource, makePlayOpts(1))
    })
    return () => registerListeningAutoPlay(null)
  }, [activeAudioSource, audioStarted, hasActiveAudioFile, makePlayOpts, play, reviewMode, submitted])

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
    resetPlayback()
    resetPlayCounts()
    setAnswers({})
    setUnsure({})
    setTimeLeft(initialExamTimerSeconds(exam.durationMinutes))
    setPartIndex(0)
    setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    setSubmitted(false)
    setReviewMode(false)
    setAudioStarted(false)
    if (fullMockId) {
      patchFullMockSession({ stage: 'listening', listening: undefined })
    }
  }, [clearAllHighlights, exam.durationMinutes, exam.id, exam.parts, fullMockId, resetPlayCounts, resetPlayback])

  const reviewStatusMap = useMemo((): Record<string, ExamReviewStatus> => {
    if (!reviewMode) return {}
    return buildListeningReviewStatusMap(exam, answers)
  }, [answers, exam, reviewMode])

  const getQuestionReviewStatus = useCallback((questionId: string): ExamReviewStatus | null => {
    if (!reviewMode) return null
    return reviewStatusMap[questionId] ?? null
  }, [reviewMode, reviewStatusMap])

  const answeredCount = useMemo(
    () => allQuestions.filter(q => Boolean(answers[q.id])).length,
    [allQuestions, answers],
  )

  const { aiText: reviewAiText, hideAi: hideReviewAi } = useExamReviewAi(
    exam.id,
    'listening',
    reviewMode,
  )
  const reviewActiveQuestionNumber = useMemo(() => {
    if (!reviewMode || !activeQuestionId) return null
    return allQuestions.find(q => q.id === activeQuestionId)?.number ?? null
  }, [activeQuestionId, allQuestions, reviewMode])

  const activeReviewQuestion = useMemo(
    () => allQuestions.find(q => q.id === activeQuestionId) ?? null,
    [activeQuestionId, allQuestions],
  )
  const {
    showToolbar: showTranscriptToolbar,
    loading: transcriptLoading,
    error: transcriptError,
    aiCount: transcriptAiCount,
    importedCount: transcriptImportedCount,
    transcriptForActive,
    runAi: runTranscriptAi,
  } = useListeningReviewTranscript(exam, reviewMode, activeReviewQuestion)

  const startAudio = useCallback(async () => {
    setAudioStarted(true)
    if (!hasActiveAudioFile && !activeAudioSource.ttsText?.trim()) return
    try {
      await play(activeAudioSource, makePlayOpts(1))
    } catch (err) {
      console.warn('[tid-listening] play after overlay failed', err)
    }
  }, [activeAudioSource, hasActiveAudioFile, makePlayOpts, play])

  const handlePlayToggle = useCallback(() => {
    if (playing) {
      stopPlayback()
      return
    }
    void play(activeAudioSource, makePlayOpts(speed)).catch(err => {
      console.warn('[tid-listening] play failed', err)
    })
  }, [activeAudioSource, makePlayOpts, play, playing, speed, stopPlayback])

  const handleSeek = useCallback((pct: number) => {
    seekToPct(pct, allowAudioSeek)
  }, [allowAudioSeek, seekToPct])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await rootRef.current?.requestFullscreen?.()
    } else {
      await document.exitFullscreen?.()
    }
  }

  const audioBarProps = {
    source: activeAudioSource,
    playing,
    buffering,
    progressPct,
    timeLabel,
    hasAudioFile: hasActiveAudioFile,
    allowSeek: allowAudioSeek,
    playsLeft: playsRemaining,
    playBlocked,
    playError,
    onPlayNormal: handlePlayToggle,
    speed,
    onToggleSpeed: toggleSpeed,
    onSeek: handleSeek,
    onStop: stopPlayback,
  }

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
      ref={rootRef}
      className={`listening-tid-root${reviewMode ? ' is-review' : ''}${!audioStarted ? ' is-locked' : ''}`}
    >
      {/* ── TID Header ── */}
      <header className="listening-tid-header">
        <div className="listening-tid-header__back-wrap">
          <ExamHeaderBack
            label="Quay lại"
            onClick={() => {
              if (reviewMode) {
                setReviewMode(false)
                return
              }
              navigate(listeningExamBackPath(exam))
            }}
          />
        </div>

        <div className="listening-tid-header__meta">
          <div className="listening-tid-header__title">
            {reviewMode ? 'Xem lại · ' : ''}{exam.title}
          </div>
          {!reviewMode && (
            <div className="listening-tid-header__timer">
              <Headphones size={14} strokeWidth={2} aria-hidden />
              <span className="listening-tid-header__timer-val">{formatExamTimer(timeLeft)}</span>
              <span className="listening-tid-header__timer-label">remaining</span>
            </div>
          )}
        </div>

        <div className="listening-tid-header__actions">
          <button
            type="button"
            className="listening-tid-btn-check"
            style={{ backgroundColor: ACCENT }}
            onClick={() => {
              if (reviewMode) {
                setReviewMode(false)
                return
              }
              setConfirmSubmit(true)
            }}
          >
            {reviewMode ? 'Về báo cáo' : 'Kiểm Tra'}
          </button>

          <div className="listening-tid-font-wrap">
            <button
              type="button"
              className="listening-tid-icon-btn"
              aria-label="Phông chữ"
              onClick={() => setFontMenuOpen(o => !o)}
            >
              <Type size={22} />
            </button>
            {fontMenuOpen && (
              <div className="listening-tid-font-menu">
                {FONT_PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={fontPreset.id === p.id ? 'is-active' : undefined}
                    onClick={() => {
                      setFontPreset(p)
                      setFontMenuOpen(false)
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="listening-tid-icon-btn"
            aria-label="Toggle Fullscreen"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
          </button>
          <button
            type="button"
            className={`listening-tid-transcript-btn${transcriptPanelOpen ? ' is-on' : ''}`}
            onClick={() => setTranscriptPanelOpen(o => !o)}
            title="Xem transcript (split màn hình)"
            aria-pressed={transcriptPanelOpen}
          >
            <Edit3 size={15} />
            Transcript
          </button>
          <span className="listening-tid-icon-btn" aria-hidden>
            <Wifi size={20} />
          </span>
          <span className="listening-tid-icon-btn" aria-hidden>
            <Bell size={20} />
          </span>
          <span className="listening-tid-icon-btn" aria-hidden>
            <Menu size={22} />
          </span>
        </div>
      </header>

      {/* ── Part banner ── */}
      {currentPart && !reviewMode && (
        <div className="listening-tid-part-banner">
          <div className="listening-tid-part-banner__title">Part {currentPart.partNumber}</div>
          <div className="listening-tid-part-banner__range">{partBannerText(currentPart)}</div>
        </div>
      )}

      {/* ── Audio bar (top) — app ListeningExamAudioBar: play/pause/seek/speed ── */}
      {audioStarted && !submitted && (
        <div className="listening-tid-audio-bar" data-highlight-skip>
          <ListeningExamAudioBar
            source={activeAudioSource}
            playing={playing}
            buffering={buffering}
            progressPct={progressPct}
            timeLabel={timeLabel}
            hasAudioFile={hasActiveAudioFile}
            allowSeek={allowAudioSeek}
            playsLeft={playsRemaining}
            playBlocked={playBlocked}
            playError={playError}
            onPlayNormal={handlePlayToggle}
            speed={speed}
            onToggleSpeed={toggleSpeed}
            onSeek={handleSeek}
            onStop={stopPlayback}
          />
        </div>
      )}

      {showTranscriptToolbar && (
        <ListeningReviewTranscriptToolbar
          loading={transcriptLoading}
          error={transcriptError}
          aiCount={transcriptAiCount}
          importedCount={transcriptImportedCount}
          onRunAi={force => void runTranscriptAi(force)}
          variant="ielts"
        />
      )}

      {reviewMode && (
        <ListeningReviewActiveBar
          question={activeReviewQuestion}
          userAnswer={activeQuestionId ? (answers[activeQuestionId] ?? '') : ''}
          status={activeQuestionId ? (reviewStatusMap[activeQuestionId] ?? null) : null}
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

      {/* ── Question paper ── */}
      <div
        ref={bodyRef}
        className="listening-tid-body"
        style={{ fontFamily: fontPreset.family, fontSize: fontPreset.size }}
      >
        <ExamHighlightProvider highlights={highlights} notes={notes}>
          <div className="listening-tid-paper" data-exam-highlight-zone>
            {currentPart && (() => {
              if (isDualLetterMatching) {
                return (
                  <ListeningDualLetterMatchingPartView
                    part={currentPart}
                    questions={partQuestions}
                    answers={answers}
                    activeQuestionId={activeQuestionId}
                    audioBar={audioBarProps}
                    resizer={null}
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
                    resizer={null}
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
                  reviewMode={reviewMode}
                  reviewStatusMap={reviewStatusMap}
                />
              )
            })()}
          </div>
        </ExamHighlightProvider>
      </div>

      {/* Toolbar portal-level: outside overflow scroll so fixed popup sits on selection (app default) */}
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

      {/* ── Play overlay (TID real_test) ── */}
      {!audioStarted && !reviewMode && (
        <div className="listening-tid-overlay" role="dialog" aria-modal="true">
          <div className="listening-tid-overlay__panel">
            <Headphones size={72} strokeWidth={1.5} className="listening-tid-overlay__icon" aria-hidden />
            <p className="listening-tid-overlay__text">
              You will be listening to an audio clip during this test.
              <br />
              You will not be permitted to pause or rewind the audio while answering the questions.
            </p>
            <p className="listening-tid-overlay__hint">To continue, click Play</p>
            <button
              type="button"
              className="listening-tid-overlay__play"
              onClick={() => void startAudio()}
            >
              <Play size={18} fill="currentColor" />
              Play
            </button>
          </div>
        </div>
      )}

      {/* ── Floating prev/next ── */}
      <div className="listening-tid-float-nav">
        <button
          type="button"
          className="listening-tid-float-nav__btn listening-tid-float-nav__btn--prev"
          disabled={partIndex <= 0}
          onClick={() => goToPart(partIndex - 1)}
          aria-label="Previous part"
        >
          <ChevronLeft size={24} color="#fff" />
        </button>
        <button
          type="button"
          className="listening-tid-float-nav__btn listening-tid-float-nav__btn--next"
          disabled={partIndex >= exam.parts.length - 1}
          onClick={() => goToPart(partIndex + 1)}
          aria-label="Next part"
        >
          <ChevronRight size={24} color="#fff" />
        </button>
      </div>

      {/* ── TID Footer ── */}
      <footer className="listening-tid-footer">
        <div className="listening-tid-footer__scroll">
          {exam.parts.map((part, idx) => {
            const qs = getPartQuestions(part)
            const active = idx === partIndex
            const done = answeredInPart(idx)
            return (
              <div
                key={part.id}
                className={`listening-tid-footer__part${active ? ' is-active' : ''}`}
              >
                <button
                  type="button"
                  className="listening-tid-footer__part-tab"
                  onClick={() => goToPart(idx)}
                >
                  <span className="listening-tid-footer__part-label">Part {part.partNumber}</span>
                  {!active && (
                    <span className="listening-tid-footer__part-count">
                      {done} of {qs.length}
                    </span>
                  )}
                </button>
                {active && (
                  <div className="listening-tid-footer__pills">
                    {qs.map(q => {
                      const isQ = activeQuestionId === q.id
                      const answered = Boolean(answers[q.id]?.trim())
                      const rev = getQuestionReviewStatus(q.id)
                      return (
                        <button
                          key={q.id}
                          type="button"
                          className={[
                            'listening-tid-footer__pill',
                            isQ ? 'is-current' : '',
                            answered && !rev ? 'is-answered' : '',
                            rev === 'correct' ? 'is-ok' : '',
                            rev === 'wrong' ? 'is-bad' : '',
                            rev === 'skipped' ? 'is-skip' : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => {
                            setPartIndex(idx)
                            handleSelectQuestion(q.id)
                            requestAnimationFrame(() => scrollToQuestion(q.id))
                          }}
                        >
                          {q.number}
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
          className="listening-tid-footer__submit"
          onClick={() => {
            if (reviewMode) {
              setReviewMode(false)
              return
            }
            setConfirmSubmit(true)
          }}
          title={reviewMode ? 'Về báo cáo' : 'Submit'}
          aria-label="Submit"
        >
          ✓
        </button>
      </footer>

      <ListeningTranscriptSidePanel
        exam={exam}
        currentPart={currentPart}
        open={transcriptPanelOpen}
        onClose={() => setTranscriptPanelOpen(false)}
      />

      {confirmSubmit && !reviewMode && (
        <div
          className="listening-tid-confirm"
          onClick={() => setConfirmSubmit(false)}
        >
          <div
            className="listening-tid-confirm__card"
            onClick={e => e.stopPropagation()}
          >
            <h3>Nộp bài Listening?</h3>
            <p>
              Bạn đã trả lời {answeredCount}/{allQuestions.length} câu.
            </p>
            <div className="listening-tid-confirm__actions">
              <button type="button" onClick={() => setConfirmSubmit(false)}>
                Tiếp tục làm
              </button>
              <button
                type="button"
                className="is-primary"
                onClick={() => {
                  setConfirmSubmit(false)
                  setSubmitted(true)
                  setReviewMode(false)
                  stopPlayback()
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
