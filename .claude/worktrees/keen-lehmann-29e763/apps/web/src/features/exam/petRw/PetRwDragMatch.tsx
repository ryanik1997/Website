import { useCallback, useState } from 'react'
import type { ReadingQuestion } from '../examData'
import RwHighlightText from '../rwHighlight/RwHighlightText'
import type { PetRwBankOption } from './petRwPassageUtils'
import PetRwPersonPhotoSlot from './PetRwPersonPhotoSlot'

interface Props {
  partId: string
  slots: ReadingQuestion[]
  bank: PetRwBankOption[]
  answers: Record<string, string>
  activeQuestionId: string | null
  bankOnRight?: boolean
  showBankLetters?: boolean
  slotImageKey?: (question: ReadingQuestion) => string | undefined
  slotImageUrl?: (question: ReadingQuestion) => string | undefined
  slotPhotoPreviewUrl?: (question: ReadingQuestion) => string | undefined
  allowPhotoUpload?: boolean
  onPhotoUpload?: (questionNumber: number, file: File) => void
  onAnswer: (questionId: string, value: string) => void
  onSelectQuestion: (questionId: string) => void
}

export default function PetRwDragMatch({
  partId,
  slots,
  bank,
  answers,
  activeQuestionId,
  bankOnRight = true,
  showBankLetters = true,
  slotImageKey,
  slotImageUrl,
  slotPhotoPreviewUrl,
  allowPhotoUpload = false,
  onPhotoUpload,
  onAnswer,
  onSelectQuestion,
}: Props) {
  const [pickedId, setPickedId] = useState<string | null>(null)

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

  const bankPanel = (
    <div className="pet-rw-drag__bank">
      {bank.map(option => {
        const isUsed = Boolean(usedByQuestion(option.id))
        const isPicked = pickedId === option.id
        return (
          <div
            key={option.id}
            className={`pet-rw-drag__bank-card${isUsed ? ' is-used' : ''}${isPicked ? ' is-picked' : ''}`}
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

  const slotsPanel = (
    <div className="pet-rw-drag__slots">
      {slots.map(question => {
        const isActive = activeQuestionId === question.id
        const answerId = answers[question.id] ?? ''
        const bankItem = bank.find(b => b.id.toUpperCase() === answerId.toUpperCase())
        const imgKey = slotImageKey?.(question)
        const imgUrl = slotImageUrl?.(question)
        return (
          <div
            key={question.id}
            id={`reading-q-${question.id}`}
            className={`pet-rw-person${isActive ? ' is-active' : ''}`}
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
                <span className="pet-rw-person__num">{question.number}</span>
                <RwHighlightText
                  blockId={`${partId}-q-${question.id}-prompt`}
                  text={question.prompt}
                />
              </p>
            </div>
            <button
              type="button"
              className={`pet-rw-drag__slot${answerId ? ' is-filled' : ''}`}
              data-highlight-skip
              onClick={() => {
                if (pickedId) {
                  assignOption(question.id, pickedId)
                  return
                }
                onSelectQuestion(question.id)
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const opt = e.dataTransfer.getData('text/plain')
                if (opt) assignOption(question.id, opt)
              }}
            >
              {bankItem ? (
                <span className="pet-rw-drag__slot-value">
                  {showBankLetters && <strong>{bankItem.id}</strong>}
                  {bankItem.title ?? bankItem.label}
                </span>
              ) : (
                <span className="pet-rw-drag__slot-placeholder">Drop here</span>
              )}
              {answerId && (
                <span
                  className="pet-rw-drag__slot-clear"
                  role="button"
                  tabIndex={0}
                  onClick={e => {
                    e.stopPropagation()
                    onAnswer(question.id, '')
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      onAnswer(question.id, '')
                    }
                  }}
                >
                  ×
                </span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className={`pet-rw-drag${bankOnRight ? ' bank-right' : ' bank-left'}`}>
      {!bankOnRight && bankPanel}
      {slotsPanel}
      {bankOnRight && bankPanel}
    </div>
  )
}