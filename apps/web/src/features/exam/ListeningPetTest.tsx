import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listeningExamBackPath } from './examNavigation'
import ListeningSubmittedScreen from './ListeningSubmittedScreen'
import ListeningPetGapFillPartView from './ListeningPetGapFillPartView'
import ListeningPetMcPartView from './ListeningPetMcPartView'
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
import { usePartHighlights } from './usePartHighlights'
import { initialExamTimerSeconds } from './examTimer'
import type { ListeningExam } from './listeningExamData'
import { getListeningExamQuestions, getPartQuestions } from './listeningExamData'
import { useExamQuestionAudio } from './useExamQuestionAudio'
import { useListeningPlayLimits } from './useListeningPlayLimits'
import { hasExamAudioSource, ketSharedExamAudioSource } from './listeningExamAudio'
import { resetListeningSplitPanes } from './listeningScrollUtils'
import { useListeningSplitPane } from './useListeningSplitPane'
import { Bell, Check, ChevronLeft, ChevronRight, Edit3, Menu, Wifi } from 'lucide-react'

const STORAGE_PREFIX = 'exam-listening-draft:'

interface Props {
  exam: ListeningExam
}

export default function ListeningPetTest({ exam }: Props) {
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
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const storageKey = `${STORAGE_PREFIX}${exam.id}`
  const currentPart = exam.parts[partIndex] ?? null
  const { highlights, handleHighlightsChange, clearAllHighlights } = usePartHighlights(currentPart?.id)
  const partQuestions = useMemo(
    () => (currentPart ? getPartQuestions(currentPart) : []),
    [currentPart],
  )
  const currentQuestion = useMemo(
    () => allQuestions.find(q => q.id === activeQuestionId) ?? null,
    [activeQuestionId, allQuestions],
  )
  const examAudioSource = useMemo(() => ketSharedExamAudioSource(exam), [exam])
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
    play,
    seekToPct,
    stopPlayback,
    playError,
  } = useExamQuestionAudio()

  const { canPlay, playsLeft, recordPlay, resetPlayCounts } = useListeningPlayLimits(exam.examMode)
  const playKey = `exam-${exam.id}`
  const maxPlays = exam.examMode === 'exam' ? 2 : undefined
  const audioSource = examAudioSource
  const hasAudioFile = hasExamAudioSource(audioSource)
  const left = playsLeft(playKey, maxPlays)
  const blocked = !canPlay(playKey, maxPlays)

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: exam.examMode === 'practice',
    beforePlay: () => canPlay(playKey, maxPlays),
    onPlayCounted: () => recordPlay(playKey),
  }), [canPlay, exam.examMode, maxPlays, playKey, recordPlay])

  const resetTimer = useCallback(() => {
    setTimeLeft(initialExamTimerSeconds(PET_LISTENING_DURATION_MINUTES))
  }, [])

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
        questionIndex?: number
        submitted?: boolean
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
    } catch {
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    }
  }, [allQuestions, exam, storageKey])

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
    stopPlayback()
    resetPlayCounts()
    setAnswers({})
    setUnsure({})
    setTimeLeft(initialExamTimerSeconds(PET_LISTENING_DURATION_MINUTES))
    setPartIndex(0)
    setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    setSubmitted(false)
    if (fullMockId) {
      patchFullMockSession({ stage: 'listening', listening: undefined })
    }
  }, [clearAllHighlights, exam.id, exam.parts, fullMockId, resetPlayCounts, stopPlayback])

  const answeredCount = useMemo(
    () => allQuestions.filter(q => Boolean(answers[q.id])).length,
    [allQuestions, answers],
  )
  const activeQuestionIndex = activeQuestionId
    ? allQuestions.findIndex(q => q.id === activeQuestionId)
    : -1

  // Keep hooks before the submitted branch (Rules of Hooks).
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
    <div className={`listening-exam-shell listening-ket-cambridge listening-pet-cambridge${isResizing ? ' is-resizing' : ''}`}>
      <header className="listening-ket-cambridge__header">
        <button
          type="button"
          className="listening-ket-cambridge__brand"
          onClick={() => navigate(listeningExamBackPath(exam))}
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
            resetKey={currentPart.id}
          />
        )}
        <ExamHighlightProvider highlights={highlights}>
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
                onAnswer={(questionId, value) => setAnswers(prev => ({ ...prev, [questionId]: value }))}
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
                onAnswer={(questionId, value) => setAnswers(prev => ({ ...prev, [questionId]: value }))}
                onSelectQuestion={handleSelectQuestion}
              />
            )
          }

          if (!currentQuestion) return null

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
                onAnswer={value => setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))}
                onUnsureChange={value => setUnsure(prev => ({ ...prev, [currentQuestion.id]: value }))}
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
                    {questions.map(question => (
                      <button
                        key={question.id}
                        type="button"
                        className={`${activeQuestionId === question.id ? ' is-current' : ''}${answers[question.id] ? ' is-answered' : ''}`}
                        onClick={() => handleSelectQuestion(question.id)}
                      >
                        {question.number}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button
          type="button"
          className="listening-ket-cambridge__submit"
          onClick={() => setConfirmSubmit(true)}
          aria-label="Submit test"
        >
          <Check size={24} />
        </button>
      </footer>

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

