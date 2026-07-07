import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bell, Loader2, Menu, Wifi } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ExamTimerControls from '../ExamTimerControls'
import ReadingSubmittedScreen from '../ReadingSubmittedScreen'
import { patchFullMockSession } from '../fullMockSession'
import { readingExamBackPath } from '../examNavigation'
import { getExamQuestions, getPartQuestions, isKetReadingWritingExam, type ReadingExam } from '../examData'
import { resolveReadingExam } from '../examLoader'
import { clearReadingDraft } from '../examCompletion'
import { notifyExamDraftRevision } from '../useExamDraftRevision'
import { readingExamDurationMinutes } from '../readingExamDuration'
import { initialExamTimerSeconds } from '../examTimer'
import RwExamMain from '../rwHighlight/RwExamMain'
import { rwDraftWithAnnotations, type RwDraftAnnotationFields } from '../rwHighlight/rwDraftAnnotations'
import { usePartHighlights } from '../usePartHighlights'
import KetRwFooter from './KetRwFooter'
import KetRwPartContent from './KetRwPartContent'
import './readingKetRw.css'

const STORAGE_PREFIX = 'exam-reading-draft:'

interface Props {
  /** Khi false vẫn dùng shell KET nhưng đề 5-part legacy */
  fullPaper?: boolean
}

export default function ReadingKetRwTest({ fullPaper: _fullPaper }: Props) {
  const navigate = useNavigate()
  const { examId } = useParams<{ examId: string }>()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock')
  const exam = useLiveQuery(
    () => (examId ? resolveReadingExam(examId) : null),
    [examId],
  ) as ReadingExam | null | undefined

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const examDurationMinutes = exam ? readingExamDurationMinutes(exam) : 60
  const [timeLeft, setTimeLeft] = useState(() => initialExamTimerSeconds(examDurationMinutes))
  const [partIndex, setPartIndex] = useState(0)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const allQuestions = useMemo(() => (exam ? getExamQuestions(exam) : []), [exam])
  const currentPart = exam?.parts[partIndex] ?? null
  const storageKey = exam ? `${STORAGE_PREFIX}${exam.id}` : ''
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

  useEffect(() => {
    if (!exam) return
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
      return
    }
    try {
      const saved = JSON.parse(savedRaw) as {
        answers?: Record<string, string>
        timeLeft?: number
        submitted?: boolean
        partIndex?: number
        activeQuestionId?: string | null
      } & RwDraftAnnotationFields
      setAnswers(saved.answers ?? {})
      setTimeLeft(
        typeof saved.timeLeft === 'number'
          ? saved.timeLeft
          : initialExamTimerSeconds(readingExamDurationMinutes(exam)),
      )
      setSubmitted(Boolean(saved.submitted))
      setPartIndex(typeof saved.partIndex === 'number' ? saved.partIndex : 0)
      setActiveQuestionId(saved.activeQuestionId ?? getPartQuestions(exam.parts[0])[0]?.id ?? null)
      setAnnotationsByPart(saved.highlightsByPart ?? {}, saved.notesByPart ?? {})
    } catch {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    }
  }, [exam, setAnnotationsByPart, storageKey])

  useEffect(() => {
    if (!exam || !currentPart) return
    const partQs = getPartQuestions(currentPart)
    if (!partQs.some(q => q.id === activeQuestionId)) {
      setActiveQuestionId(partQs[0]?.id ?? null)
    }
  }, [activeQuestionId, currentPart, exam])

  useEffect(() => {
    if (!exam) return
    window.localStorage.setItem(storageKey, JSON.stringify(
      rwDraftWithAnnotations({
        answers,
        timeLeft,
        submitted,
        partIndex,
        activeQuestionId,
      }, highlightsByPart, notesByPart),
    ))
    notifyExamDraftRevision()
  }, [activeQuestionId, answers, exam, highlightsByPart, notesByPart, partIndex, storageKey, submitted, timeLeft])

  useEffect(() => {
    if (!exam || submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }
    const timer = window.setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [exam, submitted, timeLeft])

  const handleSelectQuestion = useCallback((questionId: string) => {
    setActiveQuestionId(questionId)
  }, [])

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setActiveQuestionId(questionId)
  }, [])

  const goToPart = useCallback((index: number) => {
    if (!exam || index < 0 || index >= exam.parts.length) return
    const first = getPartQuestions(exam.parts[index])[0]
    if (!first) return
    setPartIndex(index)
    setActiveQuestionId(first.id)
  }, [exam])

  const goAdjacentQuestion = useCallback((delta: number) => {
    if (!activeQuestionId || !exam) return
    const idx = allQuestions.findIndex(q => q.id === activeQuestionId)
    const next = allQuestions[idx + delta]
    if (!next) return
    const nextPartIndex = exam.parts.findIndex(p => getPartQuestions(p).some(q => q.id === next.id))
    if (nextPartIndex >= 0 && nextPartIndex !== partIndex) setPartIndex(nextPartIndex)
    setActiveQuestionId(next.id)
  }, [activeQuestionId, allQuestions, exam, partIndex])

  const resetTimer = useCallback(() => {
    if (!exam) return
    setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
  }, [exam])

  const handleExit = useCallback(() => {
    if (!exam) return
    navigate(readingExamBackPath(exam))
  }, [exam, navigate])

  const answeredCount = useMemo(
    () => Object.values(answers).filter(v => v?.trim()).length,
    [answers],
  )

  const handleSubmit = useCallback(() => {
    setConfirmSubmit(false)
    setSubmitted(true)
  }, [])

  const handleRetry = useCallback(() => {
    if (!exam) return
    clearReadingDraft(exam.id)
    clearAllHighlights()
    setAnswers({})
    setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
    setPartIndex(0)
    setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    setSubmitted(false)
    if (fullMockId) patchFullMockSession({ stage: 'reading', reading: undefined })
  }, [clearAllHighlights, exam, fullMockId])

  if (exam === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!exam || !isKetReadingWritingExam(exam)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy đề KET A2.</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <ReadingSubmittedScreen
        exam={exam}
        answers={answers}
        fullMockId={fullMockId}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <div className="ket-rw-shell">
      <header className="ket-rw-header">
        <div className="ket-rw-header__brand">
          <span className="ket-rw-header__shield" aria-hidden>CE</span>
          <span>Cambridge English</span>
        </div>
        <span className="ket-rw-header__candidate">Candidate ID</span>
        <div className="ket-rw-header__actions">
          <ExamTimerControls timeLeft={timeLeft} onReset={resetTimer} />
          <button type="button" className="ket-rw-icon-btn" aria-label="Connection">
            <Wifi size={16} />
          </button>
          <button type="button" className="ket-rw-icon-btn" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <button type="button" className="ket-rw-icon-btn" aria-label="Menu">
            <Menu size={16} />
          </button>
          <button
            type="button"
            className="ket-rw-submit"
            style={{ marginLeft: '0.35rem' }}
            onClick={() => setConfirmSubmit(true)}
          >
            Submit
          </button>
        </div>
      </header>

      <RwExamMain
        partId={currentPart?.id}
        highlights={highlights}
        notes={notes}
        onHighlightsChange={handleHighlightsChange}
        onNotesChange={handleNotesChange}
      >
        {currentPart && (
          <KetRwPartContent
            part={currentPart}
            answers={answers}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={handleSelectQuestion}
            onAnswer={handleAnswer}
          />
        )}
      </RwExamMain>

      <KetRwFooter
        exam={exam}
        partIndex={partIndex}
        activeQuestionId={activeQuestionId}
        answers={answers}
        allQuestions={allQuestions}
        onGoToPart={goToPart}
        onSelectQuestion={handleSelectQuestion}
        onAdjacentQuestion={goAdjacentQuestion}
        onExit={handleExit}
      />

      {confirmSubmit && (
        <div
          className="ket-rw-modal-backdrop"
          role="presentation"
          onClick={() => setConfirmSubmit(false)}
        >
          <div
            className="ket-rw-modal"
            role="dialog"
            aria-labelledby="ket-rw-submit-title"
            onClick={e => e.stopPropagation()}
          >
            <h3 id="ket-rw-submit-title" className="ket-rw-modal__title">
              Nộp bài Reading & Writing?
            </h3>
            <p className="ket-rw-modal__text">
              Đã trả lời {answeredCount}/{allQuestions.length} mục.
              {answeredCount === 0
                ? ' Bài trống vẫn nộp được — Reading sẽ là 0 điểm.'
                : ' Reading chấm tự động; Writing (Part 6–7) chấm bằng AI sau khi nộp.'}
            </p>
            <div className="ket-rw-modal__actions">
              <button
                type="button"
                className="ket-rw-btn-ghost"
                onClick={() => setConfirmSubmit(false)}
              >
                Tiếp tục
              </button>
              <button
                type="button"
                className="ket-rw-submit"
                onClick={handleSubmit}
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