import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Bell, Loader2, Maximize2, Menu, Minimize2, Type, Wifi,
} from 'lucide-react'
import ExamHeaderBack from './ExamHeaderBack'
import ExamPartFooter from './ExamPartFooter'
import ExamTimerControls from './ExamTimerControls'
import { readingExamBackPath } from './examNavigation'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ReadingSubmittedScreen from './ReadingSubmittedScreen'
import { patchFullMockSession } from './fullMockSession'
import ReadingFontPanel from './ReadingFontPanel'
import { ExamHighlightProvider } from './examHighlightContext'
import ReadingHighlightToolbar from './ReadingHighlightToolbar'
import ReadingPassagePanel from './ReadingPassagePanel'
import ReadingQuestionPanel from './ReadingQuestionPanel'
import type { ReadingHighlight, TextNote } from './readingHighlightUtils'
import {
  ensureReadingFontsLoaded,
  getFontFamilyCss,
  loadFontFamilyId,
  loadFontSize,
} from './readingFontSettings'
import { getExamQuestions, getPartQuestions } from './examData'
import { resolveReadingExam } from './examLoader'
import { useIsAdmin } from '../auth/useIsAdmin'
import { resolveExamMediaUrl } from './examMediaUrl'
import {
  deleteReadingExamCloudImage,
  mergeReadingCloudImages,
  persistReadingPlacementImage,
  uploadReadingExamCloudImage,
} from './readingExamCloudImages'
import { useReadingExamCloudImages } from './useReadingExamCloudImages'
import { clearReadingDraft } from './examCompletion'
import { notifyExamDraftRevision } from './useExamDraftRevision'
import { readingExamDurationMinutes } from './readingExamDuration'
import { initialExamTimerSeconds } from './examTimer'
import ReadingKetRwTest from './ketRw/ReadingKetRwTest'
import ReadingPetRwTest from './petRw/ReadingPetRwTest'
import ReadingFceRwTest from './fceRw/ReadingFceRwTest'
import ReadingCaeRwTest from './caeRw/ReadingCaeRwTest'
import ReadingCpeRwTest from './cpeRw/ReadingCpeRwTest'
import {
  isCaeReadingWritingExam,
  isCpeReadingWritingExam,
  isFceReadingWritingExam,
  isKetReadingWritingExam,
  isPetReadingWritingExam,
} from './examData'
import './readingTest.css'

const STORAGE_PREFIX = 'exam-reading-draft:'
const SPLIT_STORAGE_KEY = 'exam-reading-split-pct'
const SPLIT_MIN = 28
const SPLIT_MAX = 72

export default function ReadingTest() {
  const navigate = useNavigate()
  const { examId } = useParams<{ examId: string }>()
  const [searchParams] = useSearchParams()
  const fullMockId = searchParams.get('fullMock')
  const exam = useLiveQuery(
    () => (examId ? resolveReadingExam(examId) : null),
    [examId],
  )
  const useKetRwShell = exam ? isKetReadingWritingExam(exam) : false
  const usePetRwShell = exam ? isPetReadingWritingExam(exam) : false
  const useFceRwShell = exam ? isFceReadingWritingExam(exam) : false
  const useCaeRwShell = exam ? isCaeReadingWritingExam(exam) : false
  const useCpeRwShell = exam ? isCpeReadingWritingExam(exam) : false

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const examDurationMinutes = exam ? readingExamDurationMinutes(exam) : 60
  const [timeLeft, setTimeLeft] = useState(() => initialExamTimerSeconds(examDurationMinutes))
  const [partIndex, setPartIndex] = useState(0)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [splitPct, setSplitPct] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const [fontSize, setFontSize] = useState(loadFontSize)
  const [fontFamilyId, setFontFamilyId] = useState(loadFontFamilyId)
  const [fontPanelOpen, setFontPanelOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [highlightsByPart, setHighlightsByPart] = useState<Record<string, ReadingHighlight[]>>({})
  const [notesByPart, setNotesByPart] = useState<Record<string, TextNote[]>>({})
  const [imageError, setImageError] = useState<string | null>(null)
  const isAdmin = useIsAdmin()
  const shellRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const splitPctRef = useRef(splitPct)
  splitPctRef.current = splitPct

  const allQuestions = useMemo(() => (exam ? getExamQuestions(exam) : []), [exam])

  const useIeltsReadingShell = Boolean(
    exam && !useKetRwShell && !usePetRwShell && !useFceRwShell && !useCaeRwShell && !useCpeRwShell,
  )
  const { images: cloudImages, error: cloudImagesError, refresh: refreshCloudImages } = useReadingExamCloudImages(
    useIeltsReadingShell ? examId : undefined,
  )
  const displayExam = useMemo(() => {
    if (!exam) return null
    if (!useIeltsReadingShell) return exam
    return mergeReadingCloudImages(exam, cloudImages)
  }, [exam, cloudImages, useIeltsReadingShell])

  const currentPart = displayExam?.parts[partIndex] ?? exam?.parts[partIndex] ?? null
  const partQuestions = useMemo(
    () => (currentPart ? getPartQuestions(currentPart) : []),
    [currentPart],
  )
  const storageKey = exam ? `${STORAGE_PREFIX}${exam.id}` : ''
  const partHighlights = currentPart ? (highlightsByPart[currentPart.id] ?? []) : []
  const partNotes = currentPart ? (notesByPart[currentPart.id] ?? []) : []

  const handlePartHighlightsChange = useCallback((highlights: ReadingHighlight[]) => {
    if (!currentPart) return
    setHighlightsByPart(prev => ({ ...prev, [currentPart.id]: highlights }))
  }, [currentPart])

  const handlePartNotesChange = useCallback((notes: TextNote[]) => {
    if (!currentPart) return
    setNotesByPart(prev => ({ ...prev, [currentPart.id]: notes }))
  }, [currentPart])

  useEffect(() => {
    ensureReadingFontsLoaded()
  }, [])

  const handlePartTopImagePick = useCallback(async (partNumber: number, file: File) => {
    if (!examId || isAdmin !== true) return
    setImageError(null)
    try {
      const uploaded = await uploadReadingExamCloudImage(examId, partNumber, 'top', file)
      await persistReadingPlacementImage(examId, partNumber, 'top', uploaded.publicUrl)
      await refreshCloudImages()
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Không lưu được ảnh đầu passage.')
    }
  }, [examId, isAdmin, refreshCloudImages])

  const handlePartTopImageClear = useCallback(async (partNumber: number) => {
    if (isAdmin !== true || !examId) return
    setImageError(null)
    try {
      const target = cloudImages.find(img => img.partNumber === partNumber && img.slot === 'top')
      if (target) await deleteReadingExamCloudImage(target)
      await persistReadingPlacementImage(examId, partNumber, 'top', undefined)
      await refreshCloudImages()
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Không xóa được ảnh.')
    }
  }, [cloudImages, examId, isAdmin, refreshCloudImages])

  const handlePartBottomImagePick = useCallback(async (partNumber: number, file: File) => {
    if (!examId || isAdmin !== true) return
    setImageError(null)
    try {
      const uploaded = await uploadReadingExamCloudImage(examId, partNumber, 'bottom', file)
      await persistReadingPlacementImage(examId, partNumber, 'bottom', uploaded.publicUrl)
      await refreshCloudImages()
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Không lưu được ảnh cuối passage.')
    }
  }, [examId, isAdmin, refreshCloudImages])

  const handlePartBottomImageClear = useCallback(async (partNumber: number) => {
    if (isAdmin !== true || !examId) return
    setImageError(null)
    try {
      const target = cloudImages.find(img => img.partNumber === partNumber && img.slot === 'bottom')
      if (target) await deleteReadingExamCloudImage(target)
      await persistReadingPlacementImage(examId, partNumber, 'bottom', undefined)
      await refreshCloudImages()
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Không xóa được ảnh.')
    }
  }, [cloudImages, examId, isAdmin, refreshCloudImages])

  useEffect(() => {
    function syncFullscreen() {
      setIsFullscreen(document.fullscreenElement === shellRef.current)
    }
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current
    if (!shell) return

    try {
      if (document.fullscreenElement === shell) {
        await document.exitFullscreen()
      } else {
        await shell.requestFullscreen()
      }
    } catch (error) {
      console.warn('Không thể bật toàn màn hình', error)
    }
  }, [])

  useEffect(() => {
    const savedSplit = window.localStorage.getItem(SPLIT_STORAGE_KEY)
    if (savedSplit) {
      const parsed = Number(savedSplit)
      if (!Number.isNaN(parsed)) {
        setSplitPct(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, parsed)))
      }
    }
  }, [])

  useEffect(() => {
    if (!exam || useKetRwShell || usePetRwShell || useFceRwShell || useCpeRwShell) return
    const savedRaw = window.localStorage.getItem(storageKey)
    if (!savedRaw) {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
      setHighlightsByPart({})
      setNotesByPart({})
      return
    }

    try {
      const saved = JSON.parse(savedRaw) as {
        answers?: Record<string, string>
        timeLeft?: number
        submitted?: boolean
        partIndex?: number
        activeQuestionId?: string | null
        highlightsByPart?: Record<string, ReadingHighlight[]>
        notesByPart?: Record<string, TextNote[]>
      }
      setAnswers(saved.answers ?? {})
      setTimeLeft(
        typeof saved.timeLeft === 'number'
          ? saved.timeLeft
          : initialExamTimerSeconds(readingExamDurationMinutes(exam)),
      )
      setSubmitted(Boolean(saved.submitted))
      setPartIndex(typeof saved.partIndex === 'number' ? saved.partIndex : 0)
      setActiveQuestionId(saved.activeQuestionId ?? getPartQuestions(exam.parts[0])[0]?.id ?? null)
      setHighlightsByPart(saved.highlightsByPart ?? {})
      setNotesByPart(saved.notesByPart ?? {})
    } catch {
      setAnswers({})
      setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
      setPartIndex(0)
      setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
      setHighlightsByPart({})
      setNotesByPart({})
    }
  }, [exam, storageKey, useCpeRwShell, useFceRwShell, useKetRwShell, usePetRwShell])

  useEffect(() => {
    if (!exam || useKetRwShell || usePetRwShell || useFceRwShell || useCpeRwShell || !currentPart) return
    if (!partQuestions.some(q => q.id === activeQuestionId)) {
      setActiveQuestionId(partQuestions[0]?.id ?? null)
    }
  }, [activeQuestionId, currentPart, exam, partIndex, partQuestions])

  useEffect(() => {
    if (!exam || useKetRwShell || usePetRwShell || useFceRwShell || useCpeRwShell) return
    window.localStorage.setItem(storageKey, JSON.stringify({
      answers,
      timeLeft,
      submitted,
      partIndex,
      activeQuestionId,
      highlightsByPart,
      notesByPart,
    }))
    notifyExamDraftRevision()
  }, [activeQuestionId, answers, exam, highlightsByPart, notesByPart, partIndex, storageKey, submitted, timeLeft, useCpeRwShell, useFceRwShell, useKetRwShell, usePetRwShell])

  useEffect(() => {
    if (!exam || useKetRwShell || usePetRwShell || useFceRwShell || useCpeRwShell || submitted) return
    if (timeLeft <= 0) {
      setSubmitted(true)
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [exam, submitted, timeLeft, useCpeRwShell, useFceRwShell, useKetRwShell, usePetRwShell])

  const resetPaneScroll = useCallback(() => {
    const body = bodyRef.current
    if (!body) return
    body.querySelector<HTMLElement>('.reading-test-passage')?.scrollTo({ top: 0, behavior: 'auto' })
    body.querySelector<HTMLElement>('.reading-test-questions')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const handleSelectQuestion = useCallback((questionId: string) => {
    setActiveQuestionId(questionId)
  }, [])

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setActiveQuestionId(questionId)
  }, [])

  const answeredInPart = useCallback((index: number) => {
    if (!exam) return 0
    return getPartQuestions(exam.parts[index]).filter(q => Boolean(answers[q.id])).length
  }, [answers, exam])

  const goToPart = useCallback((index: number) => {
    if (!exam || index < 0 || index >= exam.parts.length) return

    const questions = getPartQuestions(exam.parts[index])
    const first = questions[0]
    if (!first) return

    setPartIndex(index)
    resetPaneScroll()
    setActiveQuestionId(first.id)
  }, [exam, resetPaneScroll])

  const clampSplit = useCallback((pct: number) => (
    Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, pct))
  ), [])

  const updateSplitFromClientX = useCallback((clientX: number) => {
    const body = bodyRef.current
    if (!body) return
    const rect = body.getBoundingClientRect()
    if (rect.width <= 0) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setSplitPct(clampSplit(pct))
  }, [clampSplit])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    window.localStorage.setItem(SPLIT_STORAGE_KEY, String(splitPctRef.current))
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const onMove = (event: MouseEvent) => {
      updateSplitFromClientX(event.clientX)
    }

    const onUp = () => stopResizing()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isResizing, stopResizing, updateSplitFromClientX])

  const onResizerPointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsResizing(true)
    updateSplitFromClientX(event.clientX)
  }, [updateSplitFromClientX])

  const onResizerPointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return
    updateSplitFromClientX(event.clientX)
  }, [isResizing, updateSplitFromClientX])

  const onResizerPointerUp = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isResizing) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    stopResizing()
  }, [isResizing, stopResizing])

  const resetTimer = useCallback(() => {
    if (!exam) return
    setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
  }, [exam])

  const goAdjacentQuestion = useCallback((delta: number) => {
    if (!activeQuestionId) return
    const idx = allQuestions.findIndex(q => q.id === activeQuestionId)
    const next = allQuestions[idx + delta]
    if (!next) return

    const nextPartIndex = exam?.parts.findIndex(part =>
      getPartQuestions(part).some(q => q.id === next.id),
    ) ?? partIndex

    if (nextPartIndex !== partIndex) {
      setPartIndex(nextPartIndex)
      resetPaneScroll()
    }
    handleSelectQuestion(next.id)
  }, [activeQuestionId, allQuestions, exam, handleSelectQuestion, partIndex, resetPaneScroll])

  const handleRetry = useCallback(() => {
    if (!exam) return
    clearReadingDraft(exam.id)
    setAnswers({})
    setTimeLeft(initialExamTimerSeconds(readingExamDurationMinutes(exam)))
    setPartIndex(0)
    setActiveQuestionId(getPartQuestions(exam.parts[0])[0]?.id ?? null)
    setHighlightsByPart({})
    setSubmitted(false)
    if (fullMockId) {
      patchFullMockSession({ stage: 'reading', reading: undefined })
    }
  }, [exam, fullMockId])

  if (exam && useKetRwShell) {
    return <ReadingKetRwTest />
  }

  if (exam && usePetRwShell) {
    return <ReadingPetRwTest />
  }

  if (exam && useFceRwShell) {
    return <ReadingFceRwTest />
  }

  if (exam && useCaeRwShell) {
    return <ReadingCaeRwTest />
  }

  if (exam && useCpeRwShell) {
    return <ReadingCpeRwTest />
  }

  if (exam === undefined) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="rounded-2xl border px-5 py-4 text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
          Không tìm thấy bài Reading.
        </div>
      </div>
    )
  }

  // ── Hooks phải kết thúc trước nhánh submitted (Rules of Hooks) ──
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
    <div
      ref={shellRef}
      className={`reading-test-shell${isResizing ? ' is-resizing' : ''}${isFullscreen ? ' is-fullscreen' : ''}`}
      style={{
        '--rt-split-pct': `${splitPct}%`,
        '--rt-font-size': `${fontSize}px`,
        '--rt-font-family': getFontFamilyCss(fontFamilyId),
      } as CSSProperties}
    >
      <header className="reading-test-header">
        <ExamHeaderBack onClick={() => navigate(readingExamBackPath(exam))} />
        <div className="reading-test-header__lead">
          <p className="reading-test-header__title">{currentPart?.passageTitle ?? exam.title}</p>
        </div>

        <div className="reading-test-header__actions">
          <ExamTimerControls timeLeft={timeLeft} onReset={resetTimer} />
          <button type="button" className="reading-test-submit" onClick={() => setConfirmSubmit(true)}>
            Submit Test
          </button>
          <div className="reading-test-header__font-wrap">
            <button
              type="button"
              data-reading-font-trigger
              className={`reading-test-icon-btn${fontPanelOpen ? ' is-active' : ''}`}
              title="Cỡ chữ & kiểu chữ"
              aria-label="Cỡ chữ & kiểu chữ"
              aria-expanded={fontPanelOpen}
              onClick={() => setFontPanelOpen(open => !open)}
            >
              <Type size={15} />
            </button>
            <ReadingFontPanel
              open={fontPanelOpen}
              fontSize={fontSize}
              fontFamilyId={fontFamilyId}
              onClose={() => setFontPanelOpen(false)}
              onFontSizeChange={setFontSize}
              onFontFamilyChange={setFontFamilyId}
            />
          </div>
          <button
            type="button"
            className={`reading-test-icon-btn${isFullscreen ? ' is-active' : ''}`}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            aria-pressed={isFullscreen}
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button type="button" className="reading-test-icon-btn" title="Kết nối" aria-label="Kết nối">
            <Wifi size={15} />
          </button>
          <button type="button" className="reading-test-icon-btn" title="Thông báo" aria-label="Thông báo">
            <Bell size={15} />
          </button>
          <button type="button" className="reading-test-icon-btn" title="Menu" aria-label="Menu">
            <Menu size={15} />
          </button>
        </div>
      </header>

      {(imageError || (isAdmin === true && cloudImagesError)) && (
        <p
          className="mx-4 mt-2 rounded-lg border px-3 py-2 text-xs"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-accent) 40%, var(--border-color))',
            color: 'var(--color-accent)',
          }}
        >
          {imageError ?? cloudImagesError}
        </p>
      )}

      <div ref={bodyRef} className="reading-test-body">
        {currentPart && (
          <ReadingHighlightToolbar
            rootRef={bodyRef}
            highlights={partHighlights}
            onHighlightsChange={handlePartHighlightsChange}
            notes={partNotes}
            onNotesChange={handlePartNotesChange}
            resetKey={currentPart.id}
          />
        )}

        <ExamHighlightProvider highlights={partHighlights} notes={partNotes}>
        {currentPart && (
          <ReadingPassagePanel
            part={currentPart}
            highlights={partHighlights}
            cambridgeLevel={exam.cambridgeLevel}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={handleSelectQuestion}
            partTopImageUrl={useIeltsReadingShell
              ? resolveExamMediaUrl(currentPart.topImageUrl)
              : undefined}
            onPartTopImagePick={useIeltsReadingShell && isAdmin === true
              ? file => { void handlePartTopImagePick(currentPart.partNumber, file) }
              : undefined}
            onPartTopImageClear={useIeltsReadingShell && isAdmin === true
              ? () => { void handlePartTopImageClear(currentPart.partNumber) }
              : undefined}
            partBottomImageUrl={useIeltsReadingShell
              ? resolveExamMediaUrl(currentPart.bottomImageUrl)
              : undefined}
            onPartBottomImagePick={useIeltsReadingShell && isAdmin === true
              ? file => { void handlePartBottomImagePick(currentPart.partNumber, file) }
              : undefined}
            onPartBottomImageClear={useIeltsReadingShell && isAdmin === true
              ? () => { void handlePartBottomImageClear(currentPart.partNumber) }
              : undefined}
          />
        )}

        <button
          type="button"
          className={`reading-test-resizer${isResizing ? ' is-dragging' : ''}`}
          aria-label="Kéo để chỉnh độ rộng passage và câu hỏi"
          onPointerDown={onResizerPointerDown}
          onPointerMove={onResizerPointerMove}
          onPointerUp={onResizerPointerUp}
          onPointerCancel={onResizerPointerUp}
        >
          <span className="reading-test-resizer__grip" aria-hidden>
            ↔
          </span>
        </button>

        {currentPart && (
          <ReadingQuestionPanel
            groups={currentPart.questionGroups}
            answers={answers}
            activeQuestionId={activeQuestionId}
            highlights={partHighlights}
            cambridgeLevel={exam.cambridgeLevel}
            partNumber={currentPart.partNumber}
            onSelectQuestion={handleSelectQuestion}
            onAnswer={handleAnswer}
          />
        )}
        </ExamHighlightProvider>
      </div>

      <ExamPartFooter
        parts={exam.parts}
        getPartQuestions={index => {
          const part = exam.parts[index]
          return part ? getPartQuestions(part) : []
        }}
        partIndex={partIndex}
        activeQuestionId={activeQuestionId}
        answers={answers}
        allQuestions={allQuestions}
        answeredInPart={answeredInPart}
        onGoToPart={goToPart}
        onSelectQuestion={handleSelectQuestion}
        onAdjacentQuestion={goAdjacentQuestion}
        onSubmit={() => setConfirmSubmit(true)}
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
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Nộp bài Reading?
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Bạn đã trả lời {Object.keys(answers).length}/{allQuestions.length} câu. Sau khi nộp, bạn sẽ xem kết quả và đáp án.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onClick={() => setConfirmSubmit(false)}
              >
                Tiếp tục làm
              </button>
              <button
                type="button"
                className="reading-test-submit"
                onClick={() => {
                  setConfirmSubmit(false)
                  setSubmitted(true)
                }}
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}