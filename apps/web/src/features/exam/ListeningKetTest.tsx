import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FullMockStageResult from './FullMockStageResult'
import ListeningExamResult from './ListeningExamResult'
import ListeningQuestionAnswerPanel from './ListeningQuestionAnswerPanel'
import ListeningQuestionPromptPanel from './ListeningQuestionPromptPanel'
import ListeningSplitResizer from './ListeningSplitResizer'
import { getFullMockTest } from './fullMockData'
import {
  appendFullMockQuery,
  clearFullMockSession,
  patchFullMockSession,
} from './fullMockSession'
import type { ListeningExam } from './listeningExamData'
import { getListeningExamQuestions, isListeningAnswerCorrect } from './listeningExamData'
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

export default function ListeningKetTest({ exam }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock')
  const questions = useMemo(() => getListeningExamQuestions(exam), [exam])
  const bodyRef = useRef<HTMLDivElement>(null)
  const {
    splitPct,
    isResizing,
    onResizerPointerDown,
    onResizerPointerMove,
    onResizerPointerUp,
  } = useListeningSplitPane()

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [unsure, setUnsure] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const storageKey = `${STORAGE_PREFIX}${exam.id}`
  const currentQuestion = questions[questionIndex] ?? null
  const currentPart = useMemo(() => {
    if (!currentQuestion) return null
    return exam.parts.find(part => part.questions.some(q => q.id === currentQuestion.id)) ?? null
  }, [currentQuestion, exam.parts])
  const partAudioSource = useMemo(() => ({
    audioKey: currentPart?.audioKey,
    audioUrl: currentPart?.audioUrl,
    ttsText: currentPart?.ttsText,
  }), [currentPart])
  const totalQuestions = questions.length

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
  const playKey = currentQuestion ? `q-${currentQuestion.id}` : ''
  const maxPlays = exam.examMode === 'exam' ? 3 : undefined
  const audioSource = currentQuestion ? {
    audioKey: currentQuestion.audioKey ?? partAudioSource.audioKey,
    audioUrl: currentQuestion.audioUrl ?? partAudioSource.audioUrl,
    ttsText: currentQuestion.ttsText ?? partAudioSource.ttsText,
  } : { audioKey: undefined, audioUrl: undefined, ttsText: undefined }
  const hasAudioFile = Boolean(audioSource.audioKey || audioSource.audioUrl)
  const left = playsLeft(playKey, maxPlays)
  const blocked = !canPlay(playKey, maxPlays)

  const makePlayOpts = useCallback((rate: number) => ({
    rate,
    allowSeek: exam.examMode === 'practice',
    beforePlay: () => canPlay(playKey, maxPlays),
    onPlayCounted: () => recordPlay(playKey),
  }), [canPlay, exam.examMode, maxPlays, playKey, recordPlay])

  useEffect(() => {
    stopPlayback()
  }, [currentQuestion?.id, stopPlayback])

  useEffect(() => {
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) return
    try {
      const saved = JSON.parse(savedRaw) as {
        answers?: Record<string, string>
        unsure?: Record<string, boolean>
        timeLeft?: number
        questionIndex?: number
        submitted?: boolean
      }
      setAnswers(saved.answers ?? {})
      setUnsure(saved.unsure ?? {})
      setTimeLeft(typeof saved.timeLeft === 'number' ? saved.timeLeft : exam.durationMinutes * 60)
      setQuestionIndex(typeof saved.questionIndex === 'number' ? saved.questionIndex : 0)
      setSubmitted(Boolean(saved.submitted))
    } catch { /* ignore */ }
  }, [exam.durationMinutes, storageKey])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({
      answers,
      unsure,
      timeLeft,
      questionIndex,
      submitted,
    }))
  }, [answers, questionIndex, storageKey, submitted, timeLeft, unsure])

  useEffect(() => {
    if (submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }
    const timer = window.setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [submitted, timeLeft])

  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= totalQuestions) return
    setQuestionIndex(index)
  }, [totalQuestions])

  if (submitted) {
    const fullMock = fullMockId ? getFullMockTest(fullMockId) : null
    if (fullMock) {
      const correct = questions.filter(q => isListeningAnswerCorrect(q, answers[q.id] ?? '')).length
      return (
        <FullMockStageResult
          mockTitle={fullMock.title}
          stage="listening"
          stageLabel="Listening"
          scoreText={`${correct}/${questions.length}`}
          nextLabel="Tiếp Writing"
          onContinue={() => {
            patchFullMockSession({
              stage: 'writing',
              listening: {
                correct,
                total: questions.length,
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
          setQuestionIndex(0)
          setSubmitted(false)
        }}
        onBack={() => navigate('/app/exam')}
      />
    )
  }

  const answeredCount = questions.filter(q => Boolean(answers[q.id])).length

  return (
    <div className={`listening-exam-shell${isResizing ? ' is-resizing' : ''}`}>
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
        {currentQuestion && (
          <>
            <ListeningQuestionPromptPanel
              question={currentQuestion}
              partInstruction={currentPart?.instruction}
              partLabel={currentPart ? `Part ${currentPart.partNumber} · ${currentPart.rangeLabel}` : undefined}
              audioBar={{
                source: audioSource,
                playing,
                buffering,
                progressPct,
                timeLabel,
                hasAudioFile,
                allowSeek: exam.examMode === 'practice',
                allowSlow: exam.examMode === 'practice',
                playsLeft: left,
                playBlocked: blocked,
                onPlayNormal: () => void play(audioSource, makePlayOpts(1)),
                onPlaySlow: () => void play(audioSource, makePlayOpts(0.75)),
                onSeek: pct => seekToPct(pct, exam.examMode === 'practice'),
                onStop: stopPlayback,
              }}
            />
            <ListeningSplitResizer
              bodyRef={bodyRef}
              isResizing={isResizing}
              onPointerDown={onResizerPointerDown}
              onPointerMove={onResizerPointerMove}
              onPointerUp={onResizerPointerUp}
            />
            <ListeningQuestionAnswerPanel
              question={currentQuestion}
              answer={answers[currentQuestion.id] ?? ''}
              unsure={Boolean(unsure[currentQuestion.id])}
              onAnswer={value => setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))}
              onUnsureChange={value => setUnsure(prev => ({ ...prev, [currentQuestion.id]: value }))}
            />
          </>
        )}
      </div>

      <div className="listening-exam-card-actions listening-exam-card-actions--split">
        <button type="button" className="listening-exam-btn listening-exam-btn--primary" onClick={() => setConfirmSubmit(true)}>
          Submit
        </button>
        <button
          type="button"
          className="listening-exam-btn listening-exam-btn--next"
          disabled={questionIndex >= totalQuestions - 1}
          onClick={() => goToQuestion(questionIndex + 1)}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      <footer className="listening-exam-footer">
        <div className="listening-exam-footer__dots">
          {questions.map((q, index) => (
            <button
              key={q.id}
              type="button"
              className={`listening-exam-footer__dot${index === questionIndex ? ' is-current' : ''}${answers[q.id] ? ' is-answered' : ''}`}
              aria-label={`Câu ${q.number}`}
              onClick={() => goToQuestion(index)}
            />
          ))}
        </div>
        <p className="listening-exam-footer__count">
          {questionIndex + 1} / {totalQuestions} câu
          {answeredCount > 0 && ` · Đã trả lời ${answeredCount}`}
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
              Bạn đã trả lời {answeredCount}/{totalQuestions} câu.
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