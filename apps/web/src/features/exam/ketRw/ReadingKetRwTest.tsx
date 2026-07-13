import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bell, Loader2, Wifi } from 'lucide-react'
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
    <div className={`ket-rw-shell${reviewMode ? ' is-review' : ''}`} style={fontStyle}>
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
        <div className="ket-rw-header__brand">
          <span className="ket-rw-header__shield" aria-hidden>CE</span>
          <span>Cambridge English</span>
        </div>
        <span className="ket-rw-header__candidate">Candidate ID</span>
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
          <ExamFontControls
            open={fontPanelOpen}
            fontSize={fontSize}
            fontFamilyId={fontFamilyId}
            onToggle={() => setFontPanelOpen(v => !v)}
            onClose={() => setFontPanelOpen(false)}
            onFontSizeChange={setFontSize}
            onFontFamilyChange={setFontFamilyId}
          />
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
        highlights={displayHighlights}
        notes={notes}
        onHighlightsChange={next => handleHighlightsChange(next.filter(h => h.kind !== 'evidence'))}
        onNotesChange={handleNotesChange}
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
            canEditPassagePortraits={isAdmin === true && [2, 6, 7].includes(currentPart.partNumber) && !reviewMode}
            onPassagePortraitPick={
              isAdmin === true && [2, 6, 7].includes(currentPart.partNumber) && !reviewMode
                ? handlePassagePortraitPick
                : undefined
            }
            onPassagePortraitClear={
              isAdmin === true && [2, 6, 7].includes(currentPart.partNumber) && !reviewMode
                ? handlePassagePortraitClear
                : undefined
            }
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
        onExit={reviewMode ? () => setReviewMode(false) : handleExit}
        reviewMode={reviewMode}
        getQuestionReviewStatus={getQuestionReviewStatus}
        exitLabel={reviewMode ? 'Về báo cáo' : undefined}
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
