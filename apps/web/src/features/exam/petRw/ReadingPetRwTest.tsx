import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { audioRepo } from '@ryan/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Bell, Edit3, Loader2, Menu, Wifi } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ExamTimerControls from '../ExamTimerControls'
import { useReadingFontSettings } from '../useReadingFontSettings'
import ReadingSubmittedScreen from '../ReadingSubmittedScreen'
import { patchFullMockSession } from '../fullMockSession'
import { getExamQuestions, getPartQuestions, isPetReadingWritingExam, type ReadingExam } from '../examData'
import { buildReadingReviewStatusMap, type ExamReviewStatus } from '../examReviewUtils'
import ExamReviewAiPanel from '../ExamReviewAiPanel'
import { useExamReviewAi } from '../useExamReviewAi'
import { useReviewEvidenceHighlights } from '../useReviewEvidenceHighlights'
import { buildCambridgeRwEvidenceBlocks } from '../buildCambridgeRwEvidenceBlocks'
import { resolveReadingExam } from '../examLoader'
import { clearReadingDraft } from '../examCompletion'
import { notifyExamDraftRevision } from '../useExamDraftRevision'
import { useExamDraftGate } from '../useExamDraftGate'
import { readingExamDurationMinutes } from '../readingExamDuration'
import { initialExamTimerSeconds } from '../examTimer'
import PetRwFooter from './PetRwFooter'
import { readingExamMediaKey } from '../importReadingManualUtils'
import CambridgeSelectionToolbar from '../annotations/CambridgeSelectionToolbar'
import { useStableTextSelection } from '../annotations/useStableTextSelection'
import RwExamMain from '../rwHighlight/RwExamMain'
import { rwDraftWithAnnotations, type RwDraftAnnotationFields } from '../rwHighlight/rwDraftAnnotations'
import { usePartHighlights } from '../usePartHighlights'
import PetRwPartContent from './PetRwPartContent'
import { personImageFileForQuestion } from './petRwPassageUtils'
import '../ketRw/readingKetRw.css'
import './readingPetRw.css'

const STORAGE_PREFIX = 'exam-reading-draft:'

export default function ReadingPetRwTest() {
  const navigate = useNavigate()
  const { examId } = useParams<{ examId: string }>()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock')
  const exam = useLiveQuery(
    () => (examId ? resolveReadingExam(examId) : null),
    [examId],
  ) as ReadingExam | null | undefined

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const examDurationMinutes = exam ? readingExamDurationMinutes(exam) : 45
  const [timeLeft, setTimeLeft] = useState(() => initialExamTimerSeconds(examDurationMinutes))
  const [partIndex, setPartIndex] = useState(0)
  // Track active question per Part — khi quay lại Part cũ vẫn nhớ câu đã chọn
  const [activeQuestionByPart, setActiveQuestionByPart] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const {
    fontStyle,
  } = useReadingFontSettings()
  const petSelectionRootRef = useRef<HTMLDivElement>(null)
  const [personPhotoPreviews, setPersonPhotoPreviews] = useState<Record<number, string>>({})
  // Ref riêng cho cleanup — cần giá trị mới nhất khi unmount
  const photoCleanupRef = useRef(personPhotoPreviews)
  photoCleanupRef.current = personPhotoPreviews

  const allQuestions = useMemo(() => (exam ? getExamQuestions(exam) : []), [exam])
  const currentPart = exam?.parts[partIndex] ?? null
  const currentQuestions = useMemo(() => (currentPart ? getPartQuestions(currentPart) : []), [currentPart])
  const storageKey = exam ? `${STORAGE_PREFIX}${exam.id}` : ''
  const { isHydrated, markHydrated } = useExamDraftGate(storageKey)
  const {
    highlights,
    notes,
    highlightsByPart,
    notesByPart,
    handleHighlightsChange,
    handleNotesChange,
    commitHighlightRanges,
    commitNoteRanges,
    commitDeleteNoteRanges,
    commitDeleteHighlightRanges,
    setAnnotationsByPart,
    clearAllHighlights,
  } = usePartHighlights(currentPart?.id)

  // Derived activeQuestionId — hoàn toàn từ state, không cần effect reset
  const storedQuestionId = activeQuestionByPart[partIndex]
  const activeQuestionId = useMemo(() => {
    const storedIsValid = currentQuestions.some(q => q.id === storedQuestionId)
    if (storedIsValid) return storedQuestionId
    return currentQuestions[0]?.id ?? null
  }, [currentQuestions, storedQuestionId])

  useEffect(() => {
    if (!exam) return
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionByPart({})
      markHydrated()
      return
    }
    try {
      const saved = JSON.parse(savedRaw) as {
        answers?: Record<string, string>
        timeLeft?: number
        submitted?: boolean
        partIndex?: number
        activeQuestionByPart?: Record<number, string>
        activeQuestionId?: string | null /* legacy */
      } & RwDraftAnnotationFields
      setAnswers(saved.answers ?? {})
      setTimeLeft(
        typeof saved.timeLeft === 'number'
          ? saved.timeLeft
          : initialExamTimerSeconds(readingExamDurationMinutes(exam)),
      )
      setSubmitted(Boolean(saved.submitted))
      setReviewMode(false)
      setPartIndex(typeof saved.partIndex === 'number' ? saved.partIndex : 0)
      setActiveQuestionByPart(saved.activeQuestionByPart ?? {})
      setAnnotationsByPart(saved.highlightsByPart ?? {}, saved.notesByPart ?? {})
    } catch {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionByPart({})
    }
    markHydrated()
  }, [exam, setAnnotationsByPart, storageKey, markHydrated])

  useEffect(() => {
    if (!exam) return
    if (!isHydrated) return
    try {
    window.localStorage.setItem(storageKey, JSON.stringify(
      rwDraftWithAnnotations({
        answers,
        timeLeft,
        submitted,
        partIndex,
        activeQuestionByPart,
      }, highlightsByPart, notesByPart),
    ))
    notifyExamDraftRevision()
    } catch {
      /* quota */
    }
  }, [activeQuestionByPart, answers, exam, highlightsByPart, isHydrated, notesByPart, partIndex, storageKey, submitted, timeLeft])

  useEffect(() => {
    if (!exam || submitted || reviewMode) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }
    const timer = window.setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [exam, reviewMode, submitted, timeLeft])

  const handleSelectQuestion = useCallback((questionId: string) => {
    const isValid = currentQuestions.some(q => q.id === questionId)
    if (!isValid) {
      if (import.meta.env.DEV) {
        console.error('[PET] Invalid question ID', {
          questionId,
          partIndex,
          validIds: currentQuestions.map(q => q.id),
        })
      }
      return
    }
    setActiveQuestionByPart(prev => ({ ...prev, [partIndex]: questionId }))
  }, [currentQuestions, partIndex])

  const handleAnswer = useCallback((questionId: string, value: string) => {
    if (reviewMode) return
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setActiveQuestionByPart(prev => ({ ...prev, [partIndex]: questionId }))
  }, [reviewMode, partIndex])

  const handlePersonPhotoUpload = useCallback(async (questionNumber: number, file: File) => {
    if (!exam) return
    const key = readingExamMediaKey(exam.id, personImageFileForQuestion(questionNumber))
    await audioRepo.put(key, file)
    const url = URL.createObjectURL(file)
    setPersonPhotoPreviews(prev => {
      const old = prev[questionNumber]
      if (old) URL.revokeObjectURL(old)
      return { ...prev, [questionNumber]: url }
    })
  }, [exam])

  useEffect(() => () => {
    for (const url of Object.values(photoCleanupRef.current)) {
      URL.revokeObjectURL(url)
    }
  }, [])

  const goToPart = useCallback((index: number) => {
    if (!exam || index < 0 || index >= exam.parts.length) return
    // Chỉ set partIndex — activeQuestionId được dẫn xuất tự động
    // Nếu Part chưa có trong activeQuestionByPart, derived logic lấy Q1
    setPartIndex(index)
  }, [exam])

  const goAdjacentQuestion = useCallback((offset: -1 | 1) => {
    const currentIndex = currentQuestions.findIndex(q => q.id === activeQuestionId)
    const nextQuestion = currentQuestions[currentIndex + offset]
    if (nextQuestion) {
      handleSelectQuestion(nextQuestion.id)
    }
  }, [currentQuestions, activeQuestionId, handleSelectQuestion])

  const resetTimer = useCallback(() => {
    if (!exam) return
    setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
  }, [exam])

  const answeredCount = useMemo(
    () => Object.values(answers).filter(v => v?.trim()).length,
    [answers],
  )

  const handleSubmit = useCallback(() => {
    setConfirmSubmit(false)
    setSubmitted(true)
    setReviewMode(false)
  }, [])

  const handleExit = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleRetry = useCallback(() => {
    if (!exam) return
    clearReadingDraft(exam.id)
    clearAllHighlights()
    setAnswers({})
    setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
    setPartIndex(0)
    setActiveQuestionByPart({})
    setSubmitted(false)
    setReviewMode(false)
    if (fullMockId) patchFullMockSession({ stage: 'reading', reading: undefined })
  }, [clearAllHighlights, exam, fullMockId])

  const reviewStatusMap = useMemo((): Record<string, ExamReviewStatus> => {
    if (!exam || !reviewMode) return {}
    return buildReadingReviewStatusMap(exam, answers)
  }, [answers, exam, reviewMode])

  const getQuestionReviewStatus = useCallback((questionId: string): ExamReviewStatus | null => {
    if (!reviewMode) return null
    return reviewStatusMap[questionId] ?? null
  }, [reviewMode, reviewStatusMap])

  const { aiText: reviewAiText, hideAi: hideReviewAi, evidences: reviewAiEvidences } = useExamReviewAi(
    exam?.id,
    'reading',
    reviewMode,
  )
  const reviewActiveQuestionNumber = useMemo(() => {
    if (!reviewMode || !activeQuestionId) return null
    return allQuestions.find(q => q.id === activeQuestionId)?.number ?? null
  }, [activeQuestionId, allQuestions, reviewMode])

  const evidenceBlocks = useMemo(
    () => buildCambridgeRwEvidenceBlocks(currentPart),
    [currentPart],
  )
  const displayHighlights = useReviewEvidenceHighlights(
    reviewMode,
    reviewAiEvidences,
    reviewActiveQuestionNumber,
    evidenceBlocks,
    highlights,
  )
  const {
    selection,
    clearSelection,
  } = useStableTextSelection({
    rootRef: petSelectionRootRef,
    disabled: reviewMode,
  })

  useEffect(() => {
    clearSelection()
  }, [currentPart?.id, clearSelection])

  /* DEV debug state */
  useEffect(() => {
    if (!import.meta.env.DEV) return

    window.__PET_ANNOTATION_DEBUG__ = {
      partId: currentPart?.id,
      partNumber: currentPart?.partNumber,
      selection,
      highlights,
      notes,
      highlightsByPart,
      notesByPart,
      dom: {
        marks: document.querySelectorAll('mark.reading-test-highlight').length,
        yellowMarks: document.querySelectorAll('mark.reading-test-highlight--yellow').length,
        noteMarks: document.querySelectorAll('.reading-test-note').length,
      },
    }
  }, [currentPart?.id, currentPart?.partNumber, highlights, highlightsByPart, notes, notesByPart, selection])

  const activeQuestion = currentQuestions.find(q => q.id === activeQuestionId) ?? currentQuestions[0] ?? null
  const activeQuestionIndex = activeQuestion ? currentQuestions.findIndex(q => q.id === activeQuestion.id) : -1

  // Log câu hỏi sau sanitize để chẩn đoán runtime
  if (import.meta.env.DEV && currentQuestions.length > 0) {
    console.table(
      currentQuestions.map((q, index) => ({
        index,
        id: q.id,
        number: q.number,
        prompt: String(q.prompt ?? '').slice(0, 50),
      })),
    )
  }

  if (exam === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!exam || !isPetReadingWritingExam(exam)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy đề PET B1.</p>
      </div>
    )
  }

  if (submitted && !reviewMode) {
    return (
      <ReadingSubmittedScreen
        exam={exam}
        answers={answers}
        fullMockId={fullMockId}
        onRetry={handleRetry}
        onReviewWithPaper={() => {
          setReviewMode(true)
          setPartIndex(0)
          setActiveQuestionByPart({})
        }}
      />
    )
  }

  return (
    <div
      className={[
        'pet-rw-shell',
        'ket-rw-shell',
        currentPart
          ? `is-part-${currentPart.partNumber}`
          : '',
        reviewMode
          ? 'is-review'
          : '',
      ].filter(Boolean).join(' ')}
      style={fontStyle}
      data-active-part-index={partIndex}
      data-active-part-number={currentPart?.partNumber ?? ''}
      data-active-part-id={currentPart?.id ?? ''}
      data-active-question-id={activeQuestionId ?? ''}
      data-highlight-count={highlights.length}
      data-note-count={notes.length}
    >
      {reviewMode && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-semibold" style={{ background: 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <span>Chế độ xem lại đề — đáp án đã khóa</span>
          <button type="button" className="rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }} onClick={() => setReviewMode(false)}>Về báo cáo</button>
        </div>
      )}
      {reviewMode && reviewAiText && (
        <ExamReviewAiPanel
          aiText={reviewAiText}
          activeQuestionNumber={reviewActiveQuestionNumber}
          onClose={hideReviewAi}
        />
      )}
      <header className="pet-rw-header">
        <div className="pet-rw-header__identity">
          <button
            type="button"
            className="pet-rw-icon-btn"
            aria-label="Exit"
            title="Exit"
            onClick={handleExit}
          >
            <ArrowLeft size={16} />
          </button>
          <img src="/logo-ceq.png" alt="Cambridge English" className="pet-rw-header__logo" />
          <strong className="pet-rw-candidate-id">Candidate ID</strong>
        </div>
        <div className="pet-rw-header__actions">
          {!reviewMode && (
            <div className="pet-rw-header__timer">
              <ExamTimerControls timeLeft={timeLeft} onReset={resetTimer} onChange={setTimeLeft} />
            </div>
          )}
          <button type="button" className="pet-rw-icon-btn" aria-label="Connection">
            <Wifi size={16} />
          </button>
          <button type="button" className="pet-rw-icon-btn" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <button type="button" className="pet-rw-icon-btn" aria-label="Menu">
            <Menu size={18} />
          </button>
          <button type="button" className="pet-rw-icon-btn" aria-label="Formatting">
            <Edit3 size={16} />
          </button>
        </div>
      </header>

      <main className="pet-rw-main">
        <RwExamMain
          partId={currentPart?.id}
          highlights={displayHighlights}
          notes={notes}
          onHighlightsChange={next => handleHighlightsChange(next.filter(h => h.kind !== 'evidence'))}
          onNotesChange={handleNotesChange}
          mainRef={petSelectionRootRef}
          readOnly={reviewMode}
          selectionToolbar="none"
        >
          {currentPart && (
            <PetRwPartContent
              examId={exam.id}
              part={currentPart}
              answers={answers}
              activeQuestionId={activeQuestionId}
              onSelectQuestion={handleSelectQuestion}
              onAnswer={handleAnswer}
              allowPersonPhotoUpload={currentPart.partNumber === 2}
              onPersonPhotoUpload={handlePersonPhotoUpload}
              personPhotoPreviewUrl={n => personPhotoPreviews[n]}
              reviewMode={reviewMode}
              reviewStatusMap={reviewStatusMap}
            />
          )}
        </RwExamMain>

        <CambridgeSelectionToolbar
          selection={selection}
          highlights={highlights}
          notes={notes}
          onCommitHighlight={commitHighlightRanges}
          onCommitDeleteHighlight={commitDeleteHighlightRanges}
          onCommitNote={commitNoteRanges}
          onCommitDeleteNote={commitDeleteNoteRanges}
          onClose={clearSelection}
        />
      </main>

      <div className="pet-rw-adjacent-nav" aria-label="Question navigation">
        <button
          type="button"
          disabled={activeQuestionIndex <= 0}
          onClick={() => goAdjacentQuestion(-1)}
          aria-label="Previous question"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          type="button"
          disabled={activeQuestionIndex < 0 || activeQuestionIndex >= currentQuestions.length - 1}
          onClick={() => goAdjacentQuestion(1)}
          aria-label="Next question"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <PetRwFooter
        parts={exam.parts}
        activePartIndex={partIndex}
        activeQuestionId={activeQuestionId}
        answers={answers}
        onSelectPart={goToPart}
        onSelectQuestion={handleSelectQuestion}
        onSubmit={() => setConfirmSubmit(true)}
        reviewMode={reviewMode}
        getQuestionReviewStatus={getQuestionReviewStatus}
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
            aria-labelledby="pet-rw-submit-title"
            onClick={e => e.stopPropagation()}
          >
            <h3 id="pet-rw-submit-title" className="ket-rw-modal__title">
              Nộp bài Reading & Writing?
            </h3>
            <p className="ket-rw-modal__text">
              Đã trả lời {answeredCount}/{allQuestions.length} mục.
              {answeredCount === 0
                ? ' Bài trống vẫn nộp được — Reading sẽ là 0 điểm.'
                : ' Reading chấm tự động; Writing (Part 7–8) chấm bằng AI sau khi nộp.'}
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
