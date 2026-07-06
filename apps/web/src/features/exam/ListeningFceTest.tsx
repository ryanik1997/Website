import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Check, ChevronLeft, ChevronRight, Edit3, Menu, Wifi } from 'lucide-react'
import { listeningExamBackPath } from './examNavigation'
import ListeningSubmittedScreen from './ListeningSubmittedScreen'
import ListeningFceGapFillPartView from './ListeningFceGapFillPartView'
import ListeningFceMatchingPartView from './ListeningFceMatchingPartView'
import ListeningFceMcPartView from './ListeningFceMcPartView'
import ListeningDualLetterMatchingPartView from './ListeningDualLetterMatchingPartView'
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
import { hasExamAudioSource, resolveListeningAudioSource } from './listeningExamAudio'
import { useListeningSplitPane } from './useListeningSplitPane'
import { isDualLetterMatchingPart, isGroupedLetterMatchingPart } from './listeningMultiPartLayout'

const STORAGE_PREFIX = 'exam-listening-draft:'

interface Props {
  exam: ListeningExam
}

export default function ListeningFceTest({ exam }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock')
  const allQuestions = useMemo(() => getListeningExamQuestions(exam), [exam])
  const bodyRef = useRef<HTMLDivElement>(null)
  const { isResizing } = useListeningSplitPane()

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [unsure, setUnsure] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(initialExamTimerSeconds(exam.durationMinutes))
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

  const audioSource = useMemo(
    () => resolveListeningAudioSource(exam, currentPart),
    [exam, currentPart],
  )
  const hasAudioFile = hasExamAudioSource(audioSource)
  const { canPlay, playsLeft, recordPlay, resetPlayCounts } = useListeningPlayLimits(exam.examMode)
  const playKey = `exam-${exam.id}`
  const maxPlays = exam.examMode === 'exam' ? 2 : undefined
  const left = playsLeft(playKey, maxPlays)
  const blocked = !canPlay(playKey, maxPlays)

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: exam.examMode === 'practice',
    beforePlay: () => canPlay(playKey, maxPlays),
    onPlayCounted: () => recordPlay(playKey),
  }), [canPlay, exam.examMode, maxPlays, playKey, recordPlay])

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
  const activeQuestionIndex = activeQuestionId
    ? allQuestions.findIndex(q => q.id === activeQuestionId)
    : -1

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
    <div className={`listening-exam-shell listening-ket-cambridge listening-fce-cambridge${exam.examType === 'cae' || exam.examType === 'cpe' ? ' listening-cae-cambridge' : ''}${exam.examType === 'cpe' ? ' listening-cpe-cambridge' : ''}${isResizing ? ' is-resizing' : ''}`}>
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
          {currentPart && (() => {
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

            if (currentPart.questions.every(question => question.type === 'gap-fill')) {
              return (
                <ListeningFceGapFillPartView
                  part={currentPart}
                  questions={partQuestions}
                  answers={answers}
                  activeQuestionId={activeQuestionId}
                  audioBar={audioBarProps}
                  resizer={null}
                  onAnswer={handleAnswer}
                  onSelectQuestion={setActiveQuestionId}
                />
              )
            }

            if (isDualLetterMatchingPart(currentPart)) {
              return (
                <ListeningDualLetterMatchingPartView
                  part={currentPart}
                  questions={partQuestions}
                  answers={answers}
                  activeQuestionId={activeQuestionId}
                  audioBar={audioBarProps}
                  resizer={null}
                  onAnswer={handleAnswer}
                  onSelectQuestion={setActiveQuestionId}
                />
              )
            }

            if (isGroupedLetterMatchingPart(currentPart)) {
              return (
                <ListeningFceMatchingPartView
                  part={currentPart}
                  questions={partQuestions}
                  answers={answers}
                  activeQuestionId={activeQuestionId}
                  audioBar={audioBarProps}
                  resizer={null}
                  onAnswer={handleAnswer}
                  onSelectQuestion={setActiveQuestionId}
                />
              )
            }

            return (
                <ListeningFceMcPartView
                  part={currentPart}
                  questions={partQuestions}
                  answers={answers}
                  activeQuestionId={activeQuestionId}
                  audioBar={audioBarProps}
                  showAllQuestions={currentPart.partNumber === 4 || ((exam.examType === 'cae' || exam.examType === 'cpe') && currentPart.partNumber === 3)}
                  resizer={null}
                  onAnswer={handleAnswer}
                onSelectQuestion={setActiveQuestionId}
              />
            )
          })()}
        </ExamHighlightProvider>

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
                        onClick={() => setActiveQuestionId(question.id)}
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
