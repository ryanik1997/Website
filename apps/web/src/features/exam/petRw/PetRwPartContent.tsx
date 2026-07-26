import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReadingPart, ReadingQuestion } from '../examData'
import type { ExamReviewStatus } from '../examReviewUtils'
import { countWords, getPartQuestions } from '../examData'
import { readingExamMediaKey } from '../importReadingManualUtils'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import RwInstruction from '../rwHighlight/RwInstruction'
import RwMcRadioQuestion from '../rwHighlight/RwMcRadioQuestion'
import { rwGapTextSegment } from '../rwHighlight/rwGapTextSegment'
import { useBlobMediaUrl } from '../useBlobMediaUrl'
import KetRwSplitPane from '../ketRw/KetRwSplitPane'
import { ensureGapDots, questionByNumber, splitKetGapText } from '../ketRw/ketRwGapUtils'
import PetRwDragMatch from './PetRwDragMatch'
import {
  getBodyTextBlocks,
  optionBankFromPassage,
  partHasFullPageImage,
  personImageFileForQuestion,
} from './petRwPassageUtils'

interface Props {
  examId: string
  part: ReadingPart
  answers: Record<string, string>
  activeQuestionId: string | null
  onSelectQuestion: (id: string) => void
  onAnswer: (id: string, value: string) => void
  reviewMode?: boolean
  reviewStatusMap?: Record<string, ExamReviewStatus>
  allowPersonPhotoUpload?: boolean
  onPersonPhotoUpload?: (questionNumber: number, file: File) => void
  personPhotoPreviewUrl?: (questionNumber: number) => string | undefined
}

function PassageImage({ imageKey, imageUrl, alt }: { imageKey?: string; imageUrl?: string; alt: string }) {
  const src = useBlobMediaUrl(imageKey, imageUrl)
  if (!src) return null
  return <img src={src} alt={alt} className="pet-rw-page-image" />
}

function InlineMcGap({
  number,
  question,
  value,
  open,
  onToggle,
  onSelect,
}: {
  number: number
  question?: ReadingQuestion
  value: string
  open: boolean
  onToggle: () => void
  onSelect: (optionId: string) => void
}) {
  const selectedLabel = question?.options.find(
    o => o.id.toLowerCase() === value.toLowerCase(),
  )?.label
  return (
    <span className="ket-rw-gap-mc">
      <button
        type="button"
        className={`ket-rw-gap-mc__btn${open ? ' is-open' : ''}${value ? ' is-filled' : ''}`}
        data-highlight-skip
        onClick={onToggle}
      >
        <span>{number}</span>
        {selectedLabel && <span className="ket-rw-gap-mc__value">{selectedLabel}</span>}
      </button>
      {open && question && (
        <div className="ket-rw-gap-mc__menu" role="listbox">
          {question.options.map(opt => (
            <button
              key={opt.id}
              type="button"
              role="option"
              className={`ket-rw-gap-mc__option${value === opt.id ? ' is-selected' : ''}`}
              onClick={() => onSelect(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

// ── Part 4 two-way drag helpers ──

type Part4DragPayload =
  | { source: 'bank'; optionId: string }
  | { source: 'gap'; optionId: string; sourceQuestionId: string }

const PART4_DND_MIME = 'application/x-pet-reading-part4-option'
const PART4_GAP_MIME = 'application/x-pet-part4-gap'

function writePart4DragPayload(dataTransfer: DataTransfer, payload: Part4DragPayload) {
  dataTransfer.setData(PART4_DND_MIME, JSON.stringify(payload))
  dataTransfer.setData('text/plain', payload.optionId)
  if (payload.source === 'gap') {
    dataTransfer.setData(PART4_GAP_MIME, '1')
  }
  dataTransfer.effectAllowed = 'move'
}

function readPart4DragPayload(dataTransfer: DataTransfer): Part4DragPayload | null {
  const raw = dataTransfer.getData(PART4_DND_MIME)
  if (raw) {
    try {
      const v = JSON.parse(raw) as Partial<Part4DragPayload>
      if (v.source === 'bank' && typeof v.optionId === 'string') {
        return { source: 'bank', optionId: v.optionId }
      }
      if (v.source === 'gap' && typeof v.optionId === 'string' && typeof v.sourceQuestionId === 'string') {
        return { source: 'gap', optionId: v.optionId, sourceQuestionId: v.sourceQuestionId }
      }
    } catch {
      /* invalid JSON */
    }
  }
  const legacy = dataTransfer.getData('text/plain')
  return legacy ? { source: 'bank', optionId: legacy } : null
}

type InlineGapTextVariant = 'default' | 'cambridge-box'

function InlineGapText({
  number,
  value,
  onChange,
  onFocus,
  variant = 'default',
}: {
  number: number
  value: string
  onChange: (v: string) => void
  onFocus?: () => void
  variant?: InlineGapTextVariant
}) {
  if (variant === 'cambridge-box') {
    return (
      <span className="pet-rw-part6-gap">
        <input
          type="text"
          className="pet-rw-part6-gap__input"
          value={value}
          placeholder={String(number)}
          aria-label={`Question ${number}`}
          autoComplete="off"
          spellCheck={false}
          data-highlight-skip
          onFocus={onFocus}
          onChange={event => onChange(event.target.value)}
        />
      </span>
    )
  }

  return (
    <span className="ket-rw-gap-text">
      <span className="ket-rw-gap-text__num">{number}</span>
      <input
        type="text"
        className="ket-rw-gap-input"
        aria-label={`Gap ${number}`}
        data-highlight-skip
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
    </span>
  )
}

// ── Part 5 — Horizontal chooser gap ──

function Part5InlineMcGap({
  number,
  question,
  value,
  open,
  onToggle,
  onClose,
  onSelect,
  disabled,
}: {
  number: number
  question: ReadingQuestion
  value: string
  open: boolean
  onToggle: () => void
  onClose: () => void
  onSelect: (optionId: string) => void
  disabled?: boolean
}) {
  const alignRight = number === 22 || number === 24 || number === 26

  return (
    <span
      className={[
        'pet-rw-part5-gap',
        open ? 'is-open' : '',
        value ? 'is-filled' : '',
        alignRight ? 'align-right' : '',
      ].filter(Boolean).join(' ')}
    >
      {open && !disabled && (
        <span
          className="pet-rw-part5-gap__chooser"
          role="listbox"
          aria-label={`Question ${number} options`}
        >
          <button
            type="button"
            className="pet-rw-part5-gap__close"
            aria-label="Close choices"
            onClick={onClose}
          >
            ×
          </button>
          {question.options.map(option => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={value.toLowerCase() === option.id.toLowerCase()}
              className={[
                'pet-rw-part5-gap__option',
                value.toLowerCase() === option.id.toLowerCase() ? 'is-selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(option.id)}
            >
              {option.label}
            </button>
          ))}
        </span>
      )}
      <button
        type="button"
        className="pet-rw-part5-gap__field"
        data-highlight-skip
        disabled={disabled}
        onClick={onToggle}
      >
        {value ? (
          <span className="pet-rw-part5-gap__value">
            {question.options.find(o => o.id.toLowerCase() === value.toLowerCase())?.label}
          </span>
        ) : (
          <span className="pet-rw-part5-gap__number">{number}</span>
        )}
      </button>
    </span>
  )
}

function InlineGapDrop({
  number,
  question,
  value,
  bank,
  pickedId,
  onAssign,
  onSelectQuestion,
  showOptionId = true,
  showEmptyPlaceholder = true,
  dragEnabled = false,
  part4Payload,
  onFilledDragStart,
  onFilledDragEnd,
}: {
  number: number
  question: ReadingQuestion
  value: string
  bank: Array<{ id: string; label: string }>
  pickedId: string | null
  onAssign: (questionId: string, optionId: string) => void
  onSelectQuestion: (id: string) => void
  showOptionId?: boolean
  showEmptyPlaceholder?: boolean
  dragEnabled?: boolean
  part4Payload?: Part4DragPayload | null
  onFilledDragStart?: (
    event: React.DragEvent<HTMLButtonElement>,
    payload: { questionId: string; optionId: string },
  ) => void
  onFilledDragEnd?: () => void
}) {
  const item = bank.find(b => b.id.toLowerCase() === value.toLowerCase())
  const canDragFilled = dragEnabled && Boolean(item) && Boolean(value)
  const isDraggingFrom =
    part4Payload?.source === 'gap' &&
    part4Payload.sourceQuestionId === question.id

  return (
    <span className="pet-rw-inline-gap">
      <button
        type="button"
        className={[
          'pet-rw-drag__slot',
          'pet-rw-drag__slot--inline',
          value ? 'is-filled' : '',
          canDragFilled ? 'is-draggable' : '',
          isDraggingFrom ? 'is-dragging' : '',
        ].filter(Boolean).join(' ')}
        draggable={canDragFilled}
        data-question-id={question.id}
        data-option-id={value || undefined}
        data-highlight-skip
        onClick={() => {
          if (pickedId) {
            onAssign(question.id, pickedId)
            return
          }
          onSelectQuestion(question.id)
        }}
        onDragStart={event => {
          if (!item || !value || !dragEnabled) {
            event.preventDefault()
            return
          }
          onFilledDragStart?.(event, {
            questionId: question.id,
            optionId: value,
          })
        }}
        onDragEnd={onFilledDragEnd}
        onDragOver={e => e.preventDefault()}
        onDrop={event => {
          event.preventDefault()
          if (!dragEnabled) return
          const payload = readPart4DragPayload(event.dataTransfer)
          if (!payload) return
          // Drop on same gap → no-op
          if (payload.source === 'gap' && payload.sourceQuestionId === question.id) return
          onAssign(question.id, payload.optionId)
        }}
      >
        <span className="pet-rw-inline-gap__num">{number}</span>
        {item ? (
          <span className="pet-rw-drag__slot-value">
            {showOptionId ? <><strong>{item.id}</strong> </> : null}
            {item.label}
          </span>
        ) : showEmptyPlaceholder ? (
          <span className="pet-rw-drag__slot-placeholder">…</span>
        ) : null}
      </button>
    </span>
  )
}

export default function PetRwPartContent({
  examId,
  part,
  answers,
  activeQuestionId,
  onSelectQuestion,
  onAnswer,
  reviewMode = false,
  reviewStatusMap,
  allowPersonPhotoUpload = false,
  onPersonPhotoUpload,
  personPhotoPreviewUrl,
}: Props) {
  const questions = useMemo(() => getPartQuestions(part), [part])
  const partId = part.id || `${examId}-part-${part.partNumber}`
  const group = part.questionGroups[0]
  const [openGap, setOpenGap] = useState<number | null>(null)
  const [pickedBankId, setPickedBankId] = useState<string | null>(null)

  const activeQuestion = questions.find(q => q.id === activeQuestionId)
  // Trong development, log rõ khi ID không hợp lệ — không fallback im lặng
  if (!activeQuestion && import.meta.env.DEV) {
    console.error('[PET] Active question not found', {
      activeQuestionId,
      questionIds: questions.map(q => q.id),
    })
  }
  const renderedQuestion = activeQuestion ?? questions[0]
  const instructionRange = group?.range ?? part.rangeLabel
  const instructionText = group?.instruction ?? ''

  const renderMcGapPassage = (
    passageKey: string,
    text: string,
    gapQuestions: ReadingQuestion[],
  ) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return rwGapTextSegment(partId, passageKey, i, seg.value)
          const q = questionByNumber(gapQuestions, seg.number)
          if (!q) return <span key={`g-${i}`}>({seg.number})</span>
          const ans = answers[q.id] ?? ''
          return (
            <InlineMcGap
              key={`g-${seg.number}`}
              number={seg.number}
              question={q}
              value={ans}
              open={openGap === seg.number}
              onToggle={() => {
                onSelectQuestion(q.id)
                setOpenGap(openGap === seg.number ? null : seg.number)
              }}
              onSelect={optId => {
                onAnswer(q.id, optId)
                setOpenGap(null)
              }}
            />
          )
        })}
      </p>
    )
  }

  const renderOpenGapPassage = (
    passageKey: string,
    text: string,
    gapQuestions: ReadingQuestion[],
    gapVariant: InlineGapTextVariant = 'default',
  ) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return rwGapTextSegment(partId, passageKey, i, seg.value)
          const q = questionByNumber(gapQuestions, seg.number)
          if (!q) return <span key={`g-${i}`}>({seg.number})</span>
          return (
            <InlineGapText
              key={`g-${seg.number}`}
              number={seg.number}
              value={answers[q.id] ?? ''}
              variant={gapVariant}
              onFocus={() => onSelectQuestion(q.id)}
              onChange={v => {
                onSelectQuestion(q.id)
                onAnswer(q.id, v)
              }}
            />
          )
        })}
      </p>
    )
  }

  const assignGapLetter = (questionId: string, optionId: string) => {
    const q = questions.find(x => x.id === questionId)
    if (!q) return
    const prev = questions.find(
      x => x.id !== questionId && answers[x.id]?.toUpperCase() === optionId.toUpperCase(),
    )
    if (prev) onAnswer(prev.id, '')
    onAnswer(questionId, optionId.toLowerCase())
    setPickedBankId(null)
    onSelectQuestion(questionId)
  }

  const part5BodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (part.partNumber !== 5 || openGap === null) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!part5BodyRef.current?.contains(target)) {
        setOpenGap(null)
        return
      }
      const gap = (target as Element).closest?.('.pet-rw-part5-gap')
      if (!gap) {
        setOpenGap(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenGap(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [part.partNumber, openGap])

  const [part4DragPayload, setPart4DragPayload] = useState<Part4DragPayload | null>(null)
  const [isPart4BankDropActive, setIsPart4BankDropActive] = useState(false)

  const clearPart4DragState = () => {
    setPart4DragPayload(null)
    setIsPart4BankDropActive(false)
  }

  const renderPassageGapDrops = (
    passageKey: string,
    text: string,
    gapQuestions: ReadingQuestion[],
    bank: Array<{ id: string; label: string }>,
    showOptionId = true,
    showEmptyPlaceholder = true,
    isPart4 = false,
  ) => {
    const gapNums = gapQuestions.map(q => q.number)
    const prepared = ensureGapDots(text, gapNums)
    const segments = splitKetGapText(prepared)
    return (
      <p className="ket-rw-inline-passage">
        {segments.map((seg, i) => {
          if (seg.kind === 'text') return rwGapTextSegment(partId, passageKey, i, seg.value)
          const q = questionByNumber(gapQuestions, seg.number)
          if (!q) return <span key={`g-${i}`}>({seg.number})</span>
          return (
            <InlineGapDrop
              key={`g-${seg.number}`}
              number={seg.number}
              question={q}
              value={answers[q.id] ?? ''}
              bank={bank}
              pickedId={pickedBankId}
              onAssign={assignGapLetter}
              onSelectQuestion={onSelectQuestion}
              showOptionId={showOptionId}
              showEmptyPlaceholder={showEmptyPlaceholder}
              dragEnabled={isPart4 && !reviewMode}
              part4Payload={isPart4 ? part4DragPayload : undefined}
              onFilledDragStart={
                isPart4
                  ? (event, { questionId, optionId }) => {
                      const payload: Part4DragPayload = {
                        source: 'gap',
                        optionId,
                        sourceQuestionId: questionId,
                      }
                      setPart4DragPayload(payload)
                      writePart4DragPayload(event.dataTransfer, payload)
                    }
                  : undefined
              }
              onFilledDragEnd={isPart4 ? clearPart4DragState : undefined}
            />
          )
        })}
      </p>
    )
  }

  if (part.partNumber === 1 && renderedQuestion) {
    const imgIndex = renderedQuestion.number - 1
    const signBlock = part.passage[imgIndex]
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <section
              data-testid="pet-rw-active-question"
              data-question-id={renderedQuestion.id}
            >
              <div className="pet-rw-part1-image-frame">
                <PassageImage
                  imageKey={signBlock?.imageKey}
                  imageUrl={signBlock?.imageUrl}
                  alt={`Sign ${renderedQuestion.number}`}
                />
              </div>
              <RwMcRadioQuestion
                partId={partId}
                question={renderedQuestion}
                answers={answers}
                onSelectQuestion={onSelectQuestion}
                onAnswer={onAnswer}
                reviewMode={reviewMode}
                reviewStatus={reviewStatusMap?.[renderedQuestion.id]}
              />
            </section>
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 2) {
    const pageImage = partHasFullPageImage(part.passage)
    const bank = optionBankFromPassage(part.passage, group!, {
      partNumber: 2,
      compact: Boolean(pageImage),
    })
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        {pageImage ? (
          <div className="ket-rw-body is-single">
            <div className="ket-rw-pane-full">
              <PassageImage
                imageKey={pageImage.imageKey}
                imageUrl={pageImage.imageUrl}
                alt="Part 2"
              />
              <PetRwDragMatch
                partId={partId}
                slots={questions}
                bank={bank}
                answers={answers}
                activeQuestionId={activeQuestionId}
                slotImageKey={q => readingExamMediaKey(examId, personImageFileForQuestion(q.number))}
                slotPhotoPreviewUrl={q => personPhotoPreviewUrl?.(q.number)}
                allowPhotoUpload={allowPersonPhotoUpload}
                onPhotoUpload={onPersonPhotoUpload}
                onAnswer={onAnswer}
                onSelectQuestion={onSelectQuestion}
              />
            </div>
          </div>
        ) : (
          <PetRwDragMatch
            variant="cambridge-part-2"
            partId={partId}
            slots={questions}
            bank={bank}
            bankTitle={part.passageTitle}
            answers={answers}
            activeQuestionId={activeQuestionId}
            bankOnRight
            showBankLetters={false}
            slotImageKey={q => readingExamMediaKey(examId, personImageFileForQuestion(q.number))}
            slotPhotoPreviewUrl={q => personPhotoPreviewUrl?.(q.number)}
            allowPhotoUpload={allowPersonPhotoUpload}
            onPhotoUpload={onPersonPhotoUpload}
            onAnswer={onAnswer}
            onSelectQuestion={onSelectQuestion}
          />
        )}
      </>
    )
  }

  if (part.partNumber === 3) {
    // Ưu tiên subtitle làm heading chính nếu có
    const displayTitle =
      part.passageSubtitle?.trim()
        ? part.passageSubtitle
        : part.passageTitle ?? ''

    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          variant="resizable"
          initialSplitPct={50}
          splitStorageKey="pet-rw-part3-split-pct"
          scrollResetKey={partId}
          left={(
            <>
              <h2 className="pet-rw-part3-title">
                <RwHighlightText blockId={`${partId}-title`} text={displayTitle} />
              </h2>
              {getBodyTextBlocks(part.passage).map((block, idx) => (
                <p key={`p3-${idx}`} className="ket-rw-paragraph">
                  <RwHighlightText blockId={`${partId}-p3-${idx}`} text={block.text ?? ''} />
                </p>
              ))}
            </>
          )}
          right={questions.map(q => (
            <RwMcRadioQuestion
              key={q.id}
              partId={partId}
              question={q}
              answers={answers}
              onSelectQuestion={onSelectQuestion}
              onAnswer={onAnswer}
              reviewMode={reviewMode}
              reviewStatus={reviewStatusMap?.[q.id]}
            />
          ))}
        />
      </>
    )
  }

  if (part.partNumber === 4) {
    const pageImage = partHasFullPageImage(part.passage)
    const bank = optionBankFromPassage(part.passage, group!, { partNumber: 4 })

    // Clean title: ưu tiên subtitle, loại bỏ prefix "Part 4 –"
    const rawTitle =
      part.passageSubtitle?.trim()
      || part.passageTitle
        ?.replace(/^Part\s*4\s*[—–-]\s*/i, '')
        .trim()
      || ''

    // Loại bỏ body block đầu nếu trùng title
    const normalizeComparableText = (value?: string) =>
      String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

    const bodyBlocks = getBodyTextBlocks(part.passage)
      .filter((block, index) => {
        if (index !== 0) return true
        return (
          normalizeComparableText(block.text)
          !== normalizeComparableText(rawTitle)
        )
      })

    // Options đã dùng biến mất khỏi bank
    const usedOptionIds = new Set(
      questions
        .map(q => answers[q.id]?.toUpperCase())
        .filter(Boolean),
    )

    const availableBank = bank.filter(
      option => !usedOptionIds.has(option.id.toUpperCase()),
    )

    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        {pageImage ? (
          <div className="ket-rw-body is-single">
            <PassageImage imageKey={pageImage.imageKey} imageUrl={pageImage.imageUrl} alt="Part 4" />
          </div>
        ) : (
          <div className="pet-rw-part4-body">
            <section className="pet-rw-part4-article">
              <h2 className="pet-rw-part4-title">
                <RwHighlightText blockId={`${partId}-title`} text={rawTitle} />
              </h2>

              {bodyBlocks.map((block, idx) => (
                <div key={`p4b-${idx}`} className="pet-rw-part4-paragraph">
                  {renderPassageGapDrops(`p4b-${idx}`, block.text ?? '', questions, bank, false, false, true)}
                </div>
              ))}
            </section>

            <aside
              className={[
                'pet-rw-part4-bank',
                isPart4BankDropActive ? 'is-return-drop-active' : '',
              ].filter(Boolean).join(' ')}
              aria-label="Sentence choices"
              onDragEnter={event => {
                if (reviewMode) return
                // .types always readable in dragenter/dragover — don't use getData()
                if (!event.dataTransfer.types.includes(PART4_GAP_MIME)) return
                event.preventDefault()
                setIsPart4BankDropActive(true)
              }}
              onDragOver={event => {
                if (reviewMode) return
                if (!event.dataTransfer.types.includes(PART4_GAP_MIME)) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setIsPart4BankDropActive(true)
              }}
              onDragLeave={event => {
                const current = event.currentTarget
                const next = event.relatedTarget as Node | null
                if (!next || !current.contains(next)) {
                  setIsPart4BankDropActive(false)
                }
              }}
              onDrop={event => {
                event.preventDefault()
                if (reviewMode) {
                  clearPart4DragState()
                  return
                }
                const payload = readPart4DragPayload(event.dataTransfer)
                if (!payload || payload.source !== 'gap') {
                  clearPart4DragState()
                  return
                }
                const currentValue = answers[payload.sourceQuestionId] ?? ''
                if (currentValue.toLowerCase() !== payload.optionId.toLowerCase()) {
                  clearPart4DragState()
                  return
                }
                onAnswer(payload.sourceQuestionId, '')
                onSelectQuestion(payload.sourceQuestionId)
                setPickedBankId(null)
                clearPart4DragState()
              }}
            >
              <div className="pet-rw-part4-bank-list">
                {availableBank.map(option => {
                  const isPicked = pickedBankId === option.id
                  const isDragging = part4DragPayload?.source === 'bank' && part4DragPayload.optionId === option.id
                  return (
                    <div
                      key={option.id}
                      className={[
                        'pet-rw-part4-bank-card',
                        isPicked ? 'is-picked' : '',
                        isDragging ? 'is-dragging' : '',
                      ].filter(Boolean).join(' ')}
                      data-highlight-skip
                      draggable={!reviewMode}
                      onDragStart={event => {
                        if (reviewMode) {
                          event.preventDefault()
                          return
                        }
                        const payload: Part4DragPayload = {
                          source: 'bank',
                          optionId: option.id,
                        }
                        setPart4DragPayload(payload)
                        writePart4DragPayload(event.dataTransfer, payload)
                      }}
                      onDragEnd={clearPart4DragState}
                      onClick={() => {
                        setPickedBankId(pickedBankId === option.id ? null : option.id)
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <RwHighlightText
                        blockId={`${partId}-bank-${option.id}`}
                        text={option.label}
                      />
                    </div>
                  )
                })}
              </div>
            </aside>
          </div>
        )}
      </>
    )
  }

  if (part.partNumber === 5) {
    const cleanTitle =
      part.passageSubtitle?.trim()
      || part.passageTitle
        ?.replace(/^Part\s*5\s*[—–-]\s*/i, '')
        .trim()
      || ''

    const normalizeComparableText = (value?: string) =>
      String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

    const bodyBlocks = getBodyTextBlocks(part.passage)
      .filter((block, index) => {
        if (index !== 0) return true
        return (
          normalizeComparableText(block.text)
          !== normalizeComparableText(cleanTitle)
        )
      })

    const renderPart5McGapPassage = (
      passageKey: string,
      text: string,
      gapQuestions: ReadingQuestion[],
    ) => {
      const gapNums = gapQuestions.map(q => q.number)
      const prepared = ensureGapDots(text, gapNums)
      const segments = splitKetGapText(prepared)
      return (
        <p className="pet-rw-part5-inline-passage">
          {segments.map((seg, i) => {
            if (seg.kind === 'text') return rwGapTextSegment(partId, passageKey, i, seg.value)
            const q = questionByNumber(gapQuestions, seg.number)
            if (!q) return <span key={`g-${i}`}>({seg.number})</span>
            return (
              <Part5InlineMcGap
                key={`g-${seg.number}`}
                number={seg.number}
                question={q}
                value={answers[q.id] ?? ''}
                open={openGap === seg.number}
                disabled={reviewMode}
                onToggle={() => {
                  if (!reviewMode) {
                    onSelectQuestion(q.id)
                    setOpenGap(openGap === seg.number ? null : seg.number)
                  }
                }}
                onClose={() => setOpenGap(null)}
                onSelect={optionId => {
                  onSelectQuestion(q.id)
                  onAnswer(q.id, optionId)
                  setOpenGap(null)
                }}
              />
            )
          })}
        </p>
      )
    }

    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="pet-rw-part5-body">
          <div ref={part5BodyRef} className="pet-rw-part5-content">
            <h2 className="pet-rw-part5-title">
              <RwHighlightText blockId={`${partId}-title`} text={cleanTitle} />
            </h2>
            {bodyBlocks.map((block, idx) => (
              <div key={`p5-${idx}`} className="pet-rw-part5-paragraph">
                {renderPart5McGapPassage(`p5-${idx}`, block.text ?? '', questions)}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 6) {
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h2 className="ket-rw-passage-title">
              <RwHighlightText blockId={`${partId}-title`} text={part.passageTitle ?? ''} />
            </h2>
            {getBodyTextBlocks(part.passage).map((block, idx) => (
              <div key={`p6-${idx}`} className="ket-rw-paragraph">
                {renderOpenGapPassage(`p6-${idx}`, block.text ?? '', questions, 'cambridge-box')}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (part.partNumber === 7) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <KetRwSplitPane
          left={(
            <div className="ket-rw-writing-prompt">
              <h3>Question {wq?.number ?? 33}</h3>
              <p>Write <strong>{wq?.minWords ?? 100} words or more</strong>.</p>
              <div className="ket-rw-writing-prompt__body">
                {part.passage.map((block, idx) => (
                  <PassageImage
                    key={`p7-${idx}`}
                    imageKey={block.imageKey}
                    imageUrl={block.imageUrl}
                    alt={`Writing prompt ${idx + 1}`}
                  />
                ))}
                {part.passage.filter(b => b.text?.trim()).map((block, idx) => (
                  <p key={`p7t-${idx}`} className="ket-rw-paragraph">
                    <RwHighlightText blockId={`${partId}-p7t-${idx}`} text={block.text ?? ''} />
                  </p>
                ))}
              </div>
              {wq && (
                <p>
                  <RwHighlightText blockId={`${partId}-wq-prompt`} text={wq.prompt} />
                </p>
              )}
            </div>
          )}
          right={wq ? (
            <>
              <textarea
                className="ket-rw-writing-area"
                data-highlight-skip
                value={text}
                onChange={e => onAnswer(wq.id, e.target.value)}
                onFocus={() => onSelectQuestion(wq.id)}
                rows={14}
                placeholder="Write your answer here…"
              />
              <p className="ket-rw-word-count">Words: {countWords(text)}</p>
            </>
          ) : null}
        />
      </>
    )
  }

  if (part.partNumber === 8) {
    const wq = questions[0]
    const text = wq ? answers[wq.id] ?? '' : ''
    return (
      <>
        <RwInstruction partId={partId} range={instructionRange} text={instructionText} />
        <div className="ket-rw-body is-single">
          <div className="ket-rw-pane-full">
            <h3 className="ket-rw-passage-title">Question {wq?.number ?? 34}</h3>
            {wq && (
              <p className="ket-rw-q-prompt">
                <RwHighlightText blockId={`${partId}-wq-prompt`} text={wq.prompt} />
              </p>
            )}
            <div className="ket-rw-pictures">
              {part.passage.map((block, idx) => (
                <PassageImage
                  key={`p8-${idx}`}
                  imageKey={block.imageKey}
                  imageUrl={block.imageUrl}
                  alt={`Story picture ${idx + 1}`}
                />
              ))}
            </div>
            {wq && (
              <>
                <textarea
                  className="ket-rw-writing-area"
                  data-highlight-skip
                  value={text}
                  onChange={e => onAnswer(wq.id, e.target.value)}
                  onFocus={() => onSelectQuestion(wq.id)}
                  rows={10}
                  placeholder="Write your story here…"
                />
                <p className="ket-rw-word-count">Words: {countWords(text)}</p>
              </>
            )}
          </div>
        </div>
      </>
    )
  }

  return null
}
