import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ArrowRight, Bell, ChevronLeft, ChevronRight, Loader2, Menu, Wifi } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ExamTimerControls from '../ExamTimerControls'
import ExamFontControls from '../ExamFontControls'
import { useReadingFontSettings } from '../useReadingFontSettings'
import ReadingSubmittedScreen from '../ReadingSubmittedScreen'
import { patchFullMockSession } from '../fullMockSession'
import { readingExamBackPath } from '../examNavigation'
import { getExamQuestions, getPartQuestions, isKetReadingWritingExam, type ReadingExam } from '../examData'
import { buildReadingReviewStatusMap, type ExamReviewStatus } from '../examReviewUtils'
import ExamReviewAiPanel from '../ExamReviewAiPanel'
import { useExamReviewAi } from '../useExamReviewAi'
import { useReviewEvidenceHighlights } from '../useReviewEvidenceHighlights'
import { buildCambridgeRwEvidenceBlocks } from '../buildCambridgeRwEvidenceBlocks'
import { getBuiltinReadingExam, resolveReadingExam } from '../examLoader'
import { fillReadingExamFromSources } from '../fillReadingExamMedia'
import { clearReadingDraft } from '../examCompletion'
import { notifyExamDraftRevision } from '../useExamDraftRevision'
import { useExamDraftGate } from '../useExamDraftGate'
import { readingExamDurationMinutes } from '../readingExamDuration'
import { initialExamTimerSeconds } from '../examTimer'
import CambridgeSelectionToolbar from '../annotations/CambridgeSelectionToolbar'
import { useStableTextSelection } from '../annotations/useStableTextSelection'
import RwExamMain from '../rwHighlight/RwExamMain'
import { rwDraftWithAnnotations, type RwDraftAnnotationFields } from '../rwHighlight/rwDraftAnnotations'
import { usePartHighlights } from '../usePartHighlights'
import { useIsAdmin } from '../../auth/useIsAdmin'
import {
  deleteReadingExamCloudImage,
  mergeReadingCloudImages,
  persistReadingPassageBlockImage,
  uploadReadingExamCloudImage,
} from '../readingExamCloudImages'
import { useReadingExamCloudImages } from '../useReadingExamCloudImages'
import KetRwFooter from './KetRwFooter'
import KetRwPartContent from './KetRwPartContent'
import './readingKetRw.css'

declare global {
  interface Window {
    __KET_ANNOTATION_DEBUG__?: unknown
  }
}

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
  const [reviewMode, setReviewMode] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const {
    fontSize,
    setFontSize,
    fontFamilyId,
    setFontFamilyId,
    fontPanelOpen,
    setFontPanelOpen,
    fontStyle,
  } = useReadingFontSettings()

  const isAdmin = useIsAdmin()
  const [imageError, setImageError] = useState<string | null>(null)
  const { images: cloudImages, error: cloudImagesError, refresh: refreshCloudImages } = useReadingExamCloudImages(
    examId,
  )
  const displayExam = useMemo(() => {
    if (!exam) return null
    const merged = mergeReadingCloudImages(exam, cloudImages)
    // Chỉ vá media từ catalog CÙNG id (hoặc đúng đề builtin).
    // Không lấy catalog-ket-a2-test1 làm donor cho mọi import Test 2/3/4
    // → trước đây ghép passage Part 4 Test 1 vào Test 2 (double gap 19–24).
    const donor = getBuiltinReadingExam(merged.id)
    if (!donor) return merged
    return fillReadingExamFromSources(merged, [donor])
  }, [exam, cloudImages])

  const allQuestions = useMemo(() => (exam ? getExamQuestions(exam) : []), [exam])
  const activeQuestionIndex = activeQuestionId
    ? allQuestions.findIndex(q => q.id === activeQuestionId)
    : -1
  const currentPart = displayExam?.parts[partIndex] ?? exam?.parts[partIndex] ?? null
  const storageKey = exam ? `${STORAGE_PREFIX}${exam.id}` : ''
  const { isHydrated, markHydrated } = useExamDraftGate(storageKey)
  const handlePassagePortraitPick = useCallback(async (blockIndex: number, file: File) => {
    if (!examId || isAdmin !== true || !currentPart) return
    setImageError(null)
    try {
      const uploaded = await uploadReadingExamCloudImage(
        examId,
        currentPart.partNumber,
        'passage',
        file,
        blockIndex,
      )
      await persistReadingPassageBlockImage(examId, currentPart.partNumber, blockIndex, uploaded.publicUrl)
      await refreshCloudImages()
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Không lưu được ảnh chân dung.')
    }
  }, [currentPart, examId, isAdmin, refreshCloudImages])

  const handlePassagePortraitClear = useCallback(async (blockIndex: number) => {
    if (!examId || isAdmin !== true || !currentPart) return
    setImageError(null)
    try {
      const target = cloudImages.find(
        img =>
          img.partNumber === currentPart.partNumber
          && img.slot === 'passage'
          && img.itemIndex === blockIndex,
      )
      if (target) await deleteReadingExamCloudImage(target)
      await persistReadingPassageBlockImage(examId, currentPart.partNumber, blockIndex, undefined)
      await refreshCloudImages()
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Không xóa được ảnh.')
    }
  }, [cloudImages, currentPart, examId, isAdmin, refreshCloudImages])

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

  /* Highlight / Note kiểu Cambridge — dùng chung cơ chế với PET B1 */
  const ketSelectionRootRef = useRef<HTMLDivElement>(null)
  const { selection, clearSelection } = useStableTextSelection({
    rootRef: ketSelectionRootRef,
    disabled: reviewMode,
  })

  useEffect(() => {
    clearSelection()
  }, [currentPart?.id, clearSelection])

  useEffect(() => {
    if (!exam) return
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
      markHydrated()
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
      setReviewMode(false)
      setPartIndex(typeof saved.partIndex === 'number' ? saved.partIndex : 0)
      setActiveQuestionId(saved.activeQuestionId ?? getPartQuestions(exam.parts[0])[0]?.id ?? null)
      setAnnotationsByPart(saved.highlightsByPart ?? {}, saved.notesByPart ?? {})
    } catch {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    }
    markHydrated()
  }, [exam, setAnnotationsByPart, storageKey, markHydrated])

  useEffect(() => {
    if (!exam || !currentPart) return
    const partQs = getPartQuestions(currentPart)
    if (!partQs.some(q => q.id === activeQuestionId)) {
      setActiveQuestionId(partQs[0]?.id ?? null)
    }
  }, [activeQuestionId, currentPart, exam])

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
        activeQuestionId,
      }, highlightsByPart, notesByPart),
    ))
    notifyExamDraftRevision()
    } catch {
      /* quota */
    }
  }, [activeQuestionId, answers, exam, highlightsByPart, isHydrated, notesByPart, partIndex, storageKey, submitted, timeLeft])

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
    setActiveQuestionId(questionId)
  }, [])

  const handleAnswer = useCallback((questionId: string, value: string) => {
    if (reviewMode) return
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setActiveQuestionId(questionId)
  }, [reviewMode])

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
    setReviewMode(false)
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

  /* DEV debug state */
  useEffect(() => {
    if (!import.meta.env.DEV) return

    window.__KET_ANNOTATION_DEBUG__ = {
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
          setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
        }}
      />
    )
  }

  return (
    <div
      className={[
        'ket-rw-shell',
        reviewMode ? 'is-review' : '',
        currentPart ? `is-part-${currentPart.partNumber}` : '',
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
        <div
          className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-semibold"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-card))',
            borderBottom: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <span>Chế độ xem lại đề — đáp án đã khóa</span>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            onClick={() => setReviewMode(false)}
          >
            Về báo cáo
          </button>
        </div>
      )}
      {reviewMode && reviewAiText && (
        <ExamReviewAiPanel
          aiText={reviewAiText}
          activeQuestionNumber={reviewActiveQuestionNumber}
          onClose={hideReviewAi}
        />
      )}
      <header className="ket-rw-header">
        <div className="ket-rw-header__identity">
          <button
            type="button"
            className="ket-rw-icon-btn"
            aria-label="Exit"
            title="Exit"
            onClick={reviewMode ? () => setReviewMode(false) : handleExit}
          >
            <ArrowLeft size={16} />
          </button>
          <img src="/logo-ceq.png" alt="Cambridge English" className="ket-rw-header__logo" />
          <strong className="ket-rw-header__candidate">Candidate ID</strong>
        </div>
        <div className="ket-rw-header__actions">
          {!reviewMode && (
            <ExamTimerControls timeLeft={timeLeft} onReset={resetTimer} onChange={setTimeLeft} />
          )}
          <button type="button" className="ket-rw-icon-btn" aria-label="Connection">
            <Wifi size={16} />
          </button>
          <button type="button" className="ket-rw-icon-btn" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <button type="button" className="ket-rw-icon-btn" aria-label="Menu">
            <Menu size={18} />
          </button>
          <ExamFontControls
            open={fontPanelOpen}
            fontSize={fontSize}
            fontFamilyId={fontFamilyId}
            onToggle={() => setFontPanelOpen(v => !v)}
            onClose={() => setFontPanelOpen(false)}
            onFontSizeChange={setFontSize}
            onFontFamilyChange={setFontFamilyId}
          />
        </div>
      </header>

      <RwExamMain
        partId={currentPart?.id}
        highlights={displayHighlights}
        notes={notes}
        onHighlightsChange={next => handleHighlightsChange(next.filter(h => h.kind !== 'evidence'))}
        onNotesChange={handleNotesChange}
        mainRef={ketSelectionRootRef}
        readOnly={reviewMode}
        selectionToolbar="none"
      >
        {(imageError || cloudImagesError) && (
          <p
            className="px-4 py-2 text-sm"
            style={{ color: 'var(--color-error, #b91c1c)', borderBottom: '1px solid var(--border-color)' }}
            role="alert"
          >
            {imageError ?? cloudImagesError}
          </p>
        )}
        {currentPart && (
          <KetRwPartContent
            part={currentPart}
            answers={answers}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={handleSelectQuestion}
            onAnswer={handleAnswer}
            reviewMode={reviewMode}
            reviewStatusMap={reviewStatusMap}
            canEditPassagePortraits={isAdmin === true && currentPart.partNumber === 2 && !reviewMode}
            onPassagePortraitPick={
              isAdmin === true && currentPart.partNumber === 2 && !reviewMode
                ? handlePassagePortraitPick
                : undefined
            }
            onPassagePortraitClear={
              isAdmin === true && currentPart.partNumber === 2 && !reviewMode
                ? handlePassagePortraitClear
                : undefined
            }
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

      <div className="ket-rw-floating-nav" aria-label="Question navigation">
        <button
          type="button"
          className="ket-rw-floating-nav__btn"
          disabled={!activeQuestionId || allQuestions.findIndex(q => q.id === activeQuestionId) <= 0}
          onClick={() => goAdjacentQuestion(-1)}
          aria-label="Previous question"
        >
          <ChevronLeft size={34} strokeWidth={3.2} />
        </button>

        <button
          type="button"
          className="ket-rw-floating-nav__btn is-next"
          disabled={
            !activeQuestionId
            || allQuestions.findIndex(q => q.id === activeQuestionId) >= allQuestions.length - 1
          }
          onClick={() => goAdjacentQuestion(1)}
          aria-label="Next question"
        >
          <ChevronRight size={34} strokeWidth={3.2} />
        </button>
      </div>

      <KetRwFooter
        exam={exam}
        partIndex={partIndex}
        activeQuestionId={activeQuestionId}
        answers={answers}
        onGoToPart={goToPart}
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
