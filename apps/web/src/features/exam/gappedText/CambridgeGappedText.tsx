import { useState, type DragEvent } from 'react'
import type { ReactNode } from 'react'
import './CambridgeGappedText.css'

export interface GappedTextOption {
  id: string
  label: string
  text: string
}

interface GapProps {
  number: number
  questionId: string
  value: string
  options: GappedTextOption[]
  pickedId: string | null
  draggedIdRef: React.MutableRefObject<string | null>
  onAssign: (questionId: string, optionId: string) => void
  onClear: (questionId: string) => void
  onSelectQuestion: (questionId: string) => void
}

export function GappedTextGap({
  number,
  questionId,
  value,
  options,
  pickedId,
  draggedIdRef,
  onAssign,
  onClear,
  onSelectQuestion,
}: GapProps) {
  const item = options.find(option => option.id.toLowerCase() === value.toLowerCase())
  const [isOver, setIsOver] = useState(false)

  return (
    <span className={`pet-rw-inline-gap gapped-text-gap${item ? ' is-filled' : ''}`}>
      <button
        type="button"
        className={`pet-rw-drag__slot pet-rw-drag__slot--inline${item ? ' is-filled' : ''}${isOver ? ' is-over' : ''}`}
        data-highlight-skip
        aria-label={item ? `Gap ${number}, answer ${item.id}` : pickedId ? `Gap ${number}, place ${pickedId} here` : `Gap ${number}, empty`}
        draggable={Boolean(item)}
        onClick={() => pickedId ? onAssign(questionId, pickedId) : onSelectQuestion(questionId)}
        onDragStart={event => {
          if (!item) return
          draggedIdRef.current = item.id
          event.dataTransfer.setData('text/plain', item.id)
          event.dataTransfer.effectAllowed = 'move'
        }}
        onDragEnd={() => { draggedIdRef.current = null }}
        onDragEnter={() => setIsOver(true)}
        onDragLeave={() => setIsOver(false)}
        onDragOver={event => event.preventDefault()}
        onDrop={event => {
          event.preventDefault()
          setIsOver(false)
          const optionId = event.dataTransfer.getData('text/plain') || draggedIdRef.current
          if (optionId) onAssign(questionId, optionId)
        }}
      >
        <span className="pet-rw-inline-gap__num">{number}</span>
        {item ? (
          <span className="pet-rw-drag__slot-value"><strong>{item.label}</strong> {item.text}</span>
        ) : (
          <span className="pet-rw-drag__slot-placeholder">…</span>
        )}
      </button>
      {item && (
        <button
          type="button"
          className="pet-rw-drag__slot-clear"
          data-highlight-skip
          aria-label={`Clear gap ${number}`}
          onClick={() => onClear(questionId)}
        >×</button>
      )}
    </span>
  )
}

interface BankProps {
  options: GappedTextOption[]
  assignedIds: Set<string>
  pickedId: string | null
  draggedIdRef: React.MutableRefObject<string | null>
  disabled?: boolean
  itemAriaPrefix?: string
  renderText: (option: GappedTextOption) => ReactNode
  onPick: (optionId: string | null) => void
  onReturn: (optionId: string) => void
}

export function GappedTextBank({
  options,
  assignedIds,
  pickedId,
  draggedIdRef,
  disabled,
  itemAriaPrefix = 'Paragraph',
  renderText,
  onPick,
  onReturn,
}: BankProps) {
  const [isOver, setIsOver] = useState(false)
  const returnDragged = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsOver(false)
    const optionId = event.dataTransfer.getData('text/plain') || draggedIdRef.current
    if (optionId && assignedIds.has(optionId.toUpperCase())) onReturn(optionId)
  }

  return (
    <div
      className={`pet-rw-drag__bank pet-rw-drag__bank--column gapped-text-bank${isOver ? ' is-over' : ''}`}
      data-highlight-skip
      aria-label="Paragraph bank"
      onClick={event => {
        if (pickedId && event.target === event.currentTarget) onReturn(pickedId)
      }}
      onDragEnter={() => setIsOver(true)}
      onDragLeave={() => setIsOver(false)}
      onDragOver={event => event.preventDefault()}
      onDrop={returnDragged}
    >
      {options.map(option => {
        const isUsed = assignedIds.has(option.id.toUpperCase())
        const isPicked = pickedId === option.id
        return (
          <button
            key={option.id}
            type="button"
            className={`pet-rw-drag__bank-card${isUsed ? ' is-used' : ''}${isPicked ? ' is-picked' : ''}`}
            data-highlight-skip
            data-gapped-text-option={option.id}
            draggable={!disabled}
            onDragStart={event => {
              draggedIdRef.current = option.id
              event.dataTransfer.setData('text/plain', option.id)
              event.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => { draggedIdRef.current = null }}
            onClick={() => isUsed ? onPick(option.id) : onPick(isPicked ? null : option.id)}
            aria-pressed={isPicked}
            aria-label={`${itemAriaPrefix} ${option.label}${isUsed ? ', already placed' : ''}`}
            disabled={disabled}
          >
            <span className="pet-rw-drag__bank-letter">{option.label}</span>
            <span className="pet-rw-drag__bank-text">{renderText(option)}</span>
          </button>
        )
      })}
    </div>
  )
}
