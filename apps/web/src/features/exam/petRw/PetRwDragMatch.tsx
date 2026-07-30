import { useCallback, useState } from 'react'
import type { ReadingQuestion } from '../examData'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import type { PetRwBankOption } from './petRwPassageUtils'
import { readPetRwDragPayload, writePetRwDragPayload, PET_RW_GAP_MIME } from './dnd/petRwDndTypes'
import type { PetRwDragPayload } from './dnd/petRwDndTypes'
import PetRwPersonPhotoSlot from './PetRwPersonPhotoSlot'
import KetRwSplitPane from '../ketRw/KetRwSplitPane'

type PetRwDragMatchVariant = 'default' | 'cambridge-part-2'

interface Props {
  partId: string
  slots: ReadingQuestion[]
  bank: PetRwBankOption[]
  bankTitle?: string
  answers: Record<string, string>
  activeQuestionId: string | null
  bankOnRight?: boolean
  showBankLetters?: boolean
  variant?: PetRwDragMatchVariant
  slotImageKey?: (question: ReadingQuestion) => string | undefined
  slotImageUrl?: (question: ReadingQuestion) => string | undefined
  slotPhotoPreviewUrl?: (question: ReadingQuestion) => string | undefined
  allowPhotoUpload?: boolean
  reviewMode?: boolean
  onPhotoUpload?: (questionNumber: number, file: File) => void
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

export default function PetRwDragMatch({
  partId,
  slots,
  bank,
  bankTitle,
  answers,
  activeQuestionId,
  bankOnRight = true,
  showBankLetters = true,
  variant = 'default',
  slotImageKey,
  slotImageUrl,
  slotPhotoPreviewUrl,
  allowPhotoUpload = false,
  reviewMode = false,
  onPhotoUpload,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [dragPayload, setDragPayload] = useState<PetRwDragPayload | null>(null)
  const [isBankDropActive, setIsBankDropActive] = useState(false)
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null)
  const isCambridgePart2 = variant === 'cambridge-part-2'

  const clearDragState = useCallback(() => {
    setDragPayload(null)
    setIsBankDropActive(false)
    setDragOverSlotId(null)
  }, [])

  const usedByQuestion = useCallback((optionId: string) => {
    return slots.find(q => answers[q.id]?.toUpperCase() === optionId.toUpperCase())?.id ?? null
  }, [answers, slots])

  const assignOption = useCallback((questionId: string, optionId: string) => {
    const prevOwner = usedByQuestion(optionId)
    if (prevOwner && prevOwner !== questionId) {
      onAnswer(prevOwner, '')
    }
    onAnswer(questionId, optionId.toLowerCase())
    setPickedId(null)
    onSelectQuestion(questionId)
  }, [onAnswer, onSelectQuestion, usedByQuestion])

  const removeOption = useCallback((questionId: string) => {
    onAnswer(questionId, '')
    onSelectQuestion(questionId)
  }, [onAnswer, onSelectQuestion])

  // ── Bank panel ──

  const bankPanel = (
    <div
      className={isCambridgePart2 ? 'pet-rw-drag__bank' : 'pet-rw-drag__bank'}
      onDragEnter={event => {
        if (!isCambridgePart2) return
        if (!event.dataTransfer.types.includes(PET_RW_GAP_MIME)) return
        event.preventDefault()
        setIsBankDropActive(true)
      }}
      onDragOver={event => {
        if (!isCambridgePart2) return
        if (!event.dataTransfer.types.includes(PET_RW_GAP_MIME)) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setIsBankDropActive(true)
      }}
      onDragLeave={event => {
        if (!isCambridgePart2) return
        const current = event.currentTarget
        const next = event.relatedTarget as Node | null
        if (!next || !current.contains(next)) {
          setIsBankDropActive(false)
        }
      }}
      onDrop={event => {
        event.preventDefault()
        if (!isCambridgePart2) return
        const payload = readPetRwDragPayload(event.dataTransfer)
        if (!payload || payload.source !== 'gap') {
          clearDragState()
          return
        }
        const currentValue = answers[payload.sourceQuestionId] ?? ''
        if (currentValue.toLowerCase() !== payload.optionId.toLowerCase()) {
          clearDragState()
          return
        }
        onAnswer(payload.sourceQuestionId, '')
        onSelectQuestion(payload.sourceQuestionId)
        setPickedId(null)
        clearDragState()
      }}
    >
      {bank.map(option => {
        const isUsed = Boolean(usedByQuestion(option.id))
        const isPicked = pickedId === option.id
        const isDragging = dragPayload?.source === 'bank' && dragPayload.optionId === option.id

        if (isCambridgePart2) {
          // Part 2: show all options (used dimmed) inside a <div> wrapper
          const part2BankClasses = [
            'pet-rw-drag__bank-card',
            isUsed ? 'is-used' : '',
            isPicked ? 'is-picked' : '',
            isDragging ? 'is-dragging' : '',
          ].filter(Boolean).join(' ')
          return (
            <div
              key={option.id}
              className={part2BankClasses}
              data-highlight-skip
              draggable={!reviewMode && !isUsed}
              onDragStart={event => {
                if (isUsed) return
                const payload: PetRwDragPayload = { source: 'bank', optionId: option.id }
                setDragPayload(payload)
                writePetRwDragPayload(event.dataTransfer, payload)
              }}
              onDragEnd={clearDragState}
              onClick={() => {
                if (isUsed) return
                setPickedId(pickedId === option.id ? null : option.id)
              }}
              role="button"
              tabIndex={isUsed ? -1 : 0}
            >
              {option.title ? (
                <>
                  <p className="pet-rw-drag__bank-heading">
                    {showBankLetters && (
                      <span className="pet-rw-drag__bank-letter">{option.id}</span>
                    )}
                    <span className="pet-rw-drag__bank-title">
                      <RwHighlightText
                        blockId={`${partId}-bank-${option.id}-title`}
                        text={option.title}
                      />
                    </span>
                  </p>
                  {option.body && (
                    <p className="pet-rw-drag__bank-text">
                      <RwHighlightText
                        blockId={`${partId}-bank-${option.id}-body`}
                        text={option.body}
                      />
                    </p>
                  )}
                </>
              ) : (
                <>
                  {showBankLetters && (
                    <span className="pet-rw-drag__bank-letter">{option.id}</span>
                  )}
                  <p className="pet-rw-drag__bank-text">
                    <RwHighlightText
                      blockId={`${partId}-bank-${option.id}`}
                      text={option.label}
                    />
                  </p>
                </>
              )}
            </div>
          )
        }

        // Default variant bank card
        const bankClasses = [
          'pet-rw-drag__bank-card',
          isUsed ? 'is-used' : '',
          isPicked ? 'is-picked' : '',
          isDragging ? 'is-dragging' : '',
        ].filter(Boolean).join(' ')

        return (
          <div
            key={option.id}
            className={bankClasses}
            data-highlight-skip
            draggable={!isUsed}
            onDragStart={e => {
              if (isUsed) return
              e.dataTransfer.setData('text/plain', option.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onClick={() => {
              if (isUsed) return
              setPickedId(pickedId === option.id ? null : option.id)
            }}
            role="button"
            tabIndex={isUsed ? -1 : 0}
          >
            {option.title ? (
              <>
                <p className="pet-rw-drag__bank-heading">
                  {showBankLetters && (
                    <span className="pet-rw-drag__bank-letter">{option.id}</span>
                  )}
                  <span className="pet-rw-drag__bank-title">
                    <RwHighlightText
                      blockId={`${partId}-bank-${option.id}-title`}
                      text={option.title}
                    />
                  </span>
                </p>
                {option.body && (
                  <p className="pet-rw-drag__bank-text">
                    <RwHighlightText
                      blockId={`${partId}-bank-${option.id}-body`}
                      text={option.body}
                    />
                  </p>
                )}
              </>
            ) : (
              <>
                {showBankLetters && (
                  <span className="pet-rw-drag__bank-letter">{option.id}</span>
                )}
                <p className="pet-rw-drag__bank-text">
                  <RwHighlightText
                    blockId={`${partId}-bank-${option.id}`}
                    text={option.label}
                  />
                </p>
              </>
            )}
          </div>
        )
      })}
    </div>
  )

  // ── Slot helpers ──

  const handleSlotDrop = (questionId: string, event: React.DragEvent) => {
    event.preventDefault()
    if (reviewMode) return
    const payload = readPetRwDragPayload(event.dataTransfer)
    if (!payload) return
    if (payload.source === 'gap' && payload.sourceQuestionId === questionId) {
      clearDragState()
      return
    }
    assignOption(questionId, payload.optionId)
    clearDragState()
  }

  const handleFilledDragStart = (
    event: React.DragEvent,
    questionId: string,
    optionId: string,
  ) => {
    event.dataTransfer.effectAllowed = 'move'
    const payload: PetRwDragPayload = { source: 'gap', optionId, sourceQuestionId: questionId }
    setDragPayload(payload)
    writePetRwDragPayload(event.dataTransfer, payload)
  }

  // ── Slot renderers ──

  const renderSlotContent = (question: ReadingQuestion, answerId: string, bankItem: PetRwBankOption | undefined) => {
    const isDragOver = dragOverSlotId === question.id

    if (bankItem && answerId) {
      // Filled state: full card with title + description + remove
      const isDraggingFrom = dragPayload?.source === 'gap' && dragPayload.sourceQuestionId === question.id
      return (
        <div
          className={[
            'pet-rw-drag__slot',
            'is-filled',
            isDraggingFrom ? 'is-dragging' : '',
          ].filter(Boolean).join(' ')}
          data-highlight-skip
          draggable={!reviewMode}
          onDragStart={event => handleFilledDragStart(event, question.id, answerId)}
          onDragEnd={clearDragState}
          onDragOver={e => { e.preventDefault(); setDragOverSlotId(question.id) }}
          onDragLeave={() => setDragOverSlotId(null)}
          onDrop={event => handleSlotDrop(question.id, event)}
          role="button"
          tabIndex={0}
          aria-label={isCambridgePart2
            ? `Use ${bankItem.title ?? bankItem.body ?? bankItem.label} for question ${question.number}`
            : undefined}
        >
          <div className="pet-rw-part2-selected-content">
            <strong className="pet-rw-part2-selected-title">
              <RwHighlightText
                blockId={`${partId}-q-${question.id}-selected-title`}
                text={bankItem.title ?? bankItem.label}
              />
            </strong>
            {bankItem.body && (
              <>
                {' '}
                <span className="pet-rw-part2-selected-description">
                  <RwHighlightText
                    blockId={`${partId}-q-${question.id}-selected-body`}
                    text={bankItem.body}
                  />
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            className="pet-rw-drag__slot-clear pet-rw-part2-selected-remove"
            aria-label={`Remove ${bankItem.title ?? bankItem.label} from question ${question.number}`}
            onClick={e => {
              e.stopPropagation()
              removeOption(question.id)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                removeOption(question.id)
              }
            }}
          >
            ×
          </button>
        </div>
      )
    }

    // Empty state: dashed drop zone with question number
    return (
      <div
        className={[
          'pet-rw-drag__slot',
          isDragOver ? 'is-drag-over' : '',
        ].filter(Boolean).join(' ')}
        data-highlight-skip
        onDragOver={e => { e.preventDefault(); setDragOverSlotId(question.id) }}
        onDragLeave={() => setDragOverSlotId(null)}
        onDrop={event => handleSlotDrop(question.id, event)}
        onClick={() => {
          if (pickedId) {
            assignOption(question.id, pickedId)
            return
          }
          onSelectQuestion(question.id)
        }}
        role="button"
        tabIndex={0}
        aria-label={`Drop an answer for question ${question.number}`}
      >
        <span className="pet-rw-drag__slot-placeholder">
          {isCambridgePart2 ? question.number : 'Drop here'}
        </span>
      </div>
    )
  }

  // ── Slots panel ──

  const slotsPanel = (
    <div className="pet-rw-drag__slots">
      {slots.map(question => {
        const isActive = activeQuestionId === question.id
        const answerId = answers[question.id] ?? ''
        const bankItem = bank.find(b => b.id.toUpperCase() === answerId.toUpperCase())
        const imgKey = slotImageKey?.(question)
        const imgUrl = slotImageUrl?.(question)
        const isDragOver = dragOverSlotId === question.id

        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            className={[
              'pet-rw-person',
              isActive ? 'is-active' : '',
              isDragOver ? 'is-drop-target' : '',
            ].filter(Boolean).join(' ')}
          >
            <div className="pet-rw-person__head">
              <PetRwPersonPhotoSlot
                questionNumber={question.number}
                imageKey={imgKey}
                imageUrl={imgUrl}
                previewUrl={slotPhotoPreviewUrl?.(question)}
                editable={allowPhotoUpload}
                onUpload={onPhotoUpload}
              />
              <p className="pet-rw-person__prompt">
                {!isCambridgePart2 && (
                  <span className="pet-rw-person__num">{question.number}</span>
                )}
                <RwHighlightText
                  blockId={`${partId}-q-${question.id}-prompt`}
                  text={question.prompt}
                />
              </p>
            </div>

            {renderSlotContent(question, answerId, bankItem)}
          </div>
        )
      })}
    </div>
  )

  // ── Layout ──

  if (isCambridgePart2) {
    return (
      <KetRwSplitPane
        variant="fixed-scrollbar"
        sequentialScroll
        scrollResetKey={partId}
        left={(
          <section className="pet-rw-part2-column pet-rw-part2-column--people">
            <h2 className="pet-rw-part2-heading">People</h2>
            {slotsPanel}
          </section>
        )}
        right={(
          <section className={[
            'pet-rw-part2-column',
            'pet-rw-part2-column--markets',
            isBankDropActive ? 'is-return-drop-active' : '',
          ].filter(Boolean).join(' ')}
          >
            <h2 className="pet-rw-part2-heading">{bankTitle?.trim() || 'City Markets'}</h2>
            {bankPanel}
          </section>
        )}
      />
    )
  }

  // Default variant — unchanged
  return (
    <div className={`pet-rw-drag${bankOnRight ? ' bank-right' : ' bank-left'}`}>
      {!bankOnRight && bankPanel}
      {slotsPanel}
      {bankOnRight && bankPanel}
    </div>
  )
}
