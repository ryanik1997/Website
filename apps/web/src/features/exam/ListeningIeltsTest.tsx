import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ListeningExamAudioBar from './ListeningExamAudioBar'
import FullMockStageResult from './FullMockStageResult'
import ListeningExamResult from './ListeningExamResult'
import { getFullMockTest } from './fullMockData'
import {
  appendFullMockQuery,
  clearFullMockSession,
  patchFullMockSession,
} from './fullMockSession'
import { ListeningPartAnswerPanel, ListeningPartPromptPanel } from './ListeningPartQuestionPanel'
import ListeningSplitResizer from './ListeningSplitResizer'
import type { ListeningExam } from './listeningExamData'
import { getListeningExamQuestions, getPartQuestions, isListeningAnswerCorrect } from './listeningExamData'
import { useExamQuestionAudio } from './useExamQuestionAudio'
import { useListeningPlayLimits } from './useListeningPlayLimits'
import { useListeningSplitPane } from './useListeningSplitPane'

const STORAGE_PREFIX = 'exam-listening-draft:'

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

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
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60)
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
  } = useExamQuestionAudio()

  const { canPlay, playsLeft, recordPlay } = useListeningPlayLimits(exam.examMode)
  const partPlayKey = currentPart ? `part-${currentPart.id}` : ''
  const partMaxPlays = currentPart?.maxPlays
  const partAudioSource = {
    audioKey: currentPart?.audioKey,
    audioUrl: currentPart?.audioUrl,
    ttsText: currentPart?.ttsText,
  }
  const hasPartAudio = Boolean(currentPart?.audioKey || currentPart?.audioUrl)
  const partLeft = playsLeft(partPlayKey, partMaxPlays)
  const partBlocked = !canPlay(partPlayKey, partMaxPlays)

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
      setTimeLeft(typeof saved.timeLeft === 'number' ? saved.timeLeft : exam.durationMinutes * 60)
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
    stopPlayback()
  }, [partIndex, stopPlayback])

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

  const makePartPlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: exam.examMode === 'practice',
    beforePlay: () => canPlay(partPlayKey, partMaxPlays),
    onPlayCounted: () => recordPlay(partPlayKey),
  }), [canPlay, exam.examMode, partMaxPlays, partPlayKey, recordPlay])

  if (submitted) {
    const fullMock = fullMockId ? getFullMockTest(fullMockId) : null
    if (fullMock) {
      const correct = allQuestions.filter(q => isListeningAnswerCorrect(q, answers[q.id] ?? '')).length
      return (
        <FullMockStageResult
          mockTitle={fullMock.title}
          stage="listening"
          stageLabel="Listening"
          scoreText={`${correct}/${allQuestions.length}`}
          nextLabel="Tiếp Writing"
          onContinue={() => {
            patchFullMockSession({
              stage: 'writing',
              listening: {
                correct,
                total: allQuestions.length,
                answers: { ...answers },
                unsure: { ...unsure },
              },
            })
            navigate(appendFullMockQuery(`/app/exam/writing/${fullMock.id}`, fullMock.id))
          }}
          onExit={() => {
            clearFullMockSession()
            navigate('/app/exam')
          }}
        />
      )
    }

    return (
      <ListeningExamResult
        exam={exam}
        answers={answers}
        unsure={unsure}
        onRetry={() => {
          window.localStorage.removeItem(storageKey)
          setAnswers({})
          setUnsure({})
          setTimeLeft(exam.durationMinutes * 60)
          setPartIndex(0)
          setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
          setSubmitted(false)
        }}
        onBack={() => navigate('/app/exam')}
      />
    )
  }

  const answeredCount = allQuestions.filter(q => Boolean(answers[q.id])).length

  const scrollToQuestion = useCallback((questionId: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(`listening-q-${questionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      document.getElementById(`listening-a-${questionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [])

  const handleSelectQuestion = useCallback((questionId: string) => {
    setActiveQuestionId(questionId)
    scrollToQuestion(questionId)
  }, [scrollToQuestion])

  return (
    <div className={`listening-exam-shell listening-exam-shell--ielts${isResizing ? ' is-resizing' : ''}`}>
      <header className="listening-exam-header">
        <button type="button" className="listening-exam-header__back" onClick={() => navigate('/app/exam')}>
          <ArrowLeft size={14} />
          Quay lại
        </button>
        <h1 className="listening-exam-header__title">{exam.title}</h1>
        <div className="listening-exam-header__timer">
          <Clock size={15} />
          {formatTimer(timeLeft)}
        </div>
      </header>

      <div
        ref={bodyRef}
        className="listening-exam-body"
        style={{ '--le-split-pct': `${splitPct}%` } as CSSProperties}
      >
        {currentPart && (
          <>
            <ListeningPartPromptPanel
              part={currentPart}
              activeQuestionId={activeQuestionId}
              onSelectQuestion={handleSelectQuestion}
              audioSlot={(
                <div className="listening-ielts-audio-inline">
                  {exam.examMode === 'exam' && (
                    <span className="listening-ielts-mode-badge">Chế độ thi</span>
                  )}
                  <ListeningExamAudioBar
                    source={partAudioSource}
                    playing={playing}
                    buffering={buffering}
                    progressPct={progressPct}
                    timeLabel={timeLabel}
                    hasAudioFile={hasPartAudio}
                    allowSeek={exam.examMode === 'practice'}
                    allowSlow={exam.examMode === 'practice'}
                    playsLeft={partLeft}
                    playBlocked={partBlocked}
                    onPlayNormal={() => void play(partAudioSource, makePartPlayOpts(1))}
                    onPlaySlow={() => void play(partAudioSource, makePartPlayOpts(0.75))}
                    onSeek={pct => seekToPct(pct, exam.examMode === 'practice')}
                    onStop={stopPlayback}
                  />
                </div>
              )}
            />
            <ListeningSplitResizer
              bodyRef={bodyRef}
              isResizing={isResizing}
              onPointerDown={onResizerPointerDown}
              onPointerMove={onResizerPointerMove}
              onPointerUp={onResizerPointerUp}
            />
            <ListeningPartAnswerPanel
              part={currentPart}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onSelectQuestion={handleSelectQuestion}
              onAnswer={handleAnswer}
            />
          </>
        )}
      </div>

      <footer className="listening-exam-footer listening-exam-footer--ielts">
        <div className="listening-ielts-footer-parts">
          {exam.parts.map((part, index) => {
            const qs = getPartQuestions(part)
            const answered = answeredInPart(index)
            const isCurrent = index === partIndex
            return (
              <div key={part.id} className={`listening-ielts-footer-part${isCurrent ? ' is-current' : ''}`}>
                <button type="button" className="listening-ielts-footer-part__tab" onClick={() => goToPart(index)}>
                  Part {part.partNumber}
                  {!isCurrent && (
                    <span className="listening-ielts-footer-part__count">{answered}/{qs.length}</span>
                  )}
                </button>
                {isCurrent && qs.map(q => (
                  <button
                    key={q.id}
                    type="button"
                    className={`listening-ielts-q-pill${activeQuestionId === q.id ? ' is-current' : ''}${answers[q.id] ? ' is-answered' : ''}`}
                    onClick={() => handleSelectQuestion(q.id)}
                  >
                    {q.number}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
        <div className="listening-ielts-footer-nav">
          <button
            type="button"
            className="listening-exam-btn listening-exam-btn--ghost listening-ielts-nav-btn"
            disabled={partIndex <= 0}
            onClick={() => goToPart(partIndex - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="listening-exam-btn listening-exam-btn--primary"
            onClick={() => setConfirmSubmit(true)}
          >
            Submit
          </button>
          <button
            type="button"
            className="listening-exam-btn listening-exam-btn--ghost listening-ielts-nav-btn"
            disabled={partIndex >= exam.parts.length - 1}
            onClick={() => goToPart(partIndex + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <p className="listening-exam-footer__count">
          Đã trả lời {answeredCount}/{allQuestions.length} câu
        </p>
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