import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { LearningStatus } from '@ryan/db'
import { LEARNING_STATUS_LABELS } from './structureLibrary'

const STATUSES = Object.keys(LEARNING_STATUS_LABELS) as LearningStatus[]

export default function LearningStatusChip({
  status,
  onChange,
}: {
  status: LearningStatus
  onChange: (status: LearningStatus) => Promise<void>
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [open, setOpen] = useState(false)
  const [displayStatus, setDisplayStatus] = useState(status)

  useEffect(() => setDisplayStatus(status), [status])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        rootRef.current?.querySelector<HTMLButtonElement>('.ss-status-chip')?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  function focusOption(index: number) {
    optionRefs.current[(index + STATUSES.length) % STATUSES.length]?.focus()
  }

  function handleMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'ArrowDown') { event.preventDefault(); focusOption(index + 1) }
    if (event.key === 'ArrowUp') { event.preventDefault(); focusOption(index - 1) }
    if (event.key === 'Home') { event.preventDefault(); focusOption(0) }
    if (event.key === 'End') { event.preventDefault(); focusOption(STATUSES.length - 1) }
  }

  async function select(nextStatus: LearningStatus) {
    const previous = displayStatus
    setDisplayStatus(nextStatus)
    setOpen(false)
    try {
      await onChange(nextStatus)
    } catch {
      setDisplayStatus(previous)
    }
  }

  return (
    <div className="ss-status-control" ref={rootRef}>
      <button
        type="button"
        className={`ss-status-chip ss-status-chip--${displayStatus}`}
        aria-label={`Trạng thái học tập: ${LEARNING_STATUS_LABELS[displayStatus]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen(value => !value)
          window.setTimeout(() => optionRefs.current[STATUSES.indexOf(displayStatus)]?.focus(), 0)
        }}
      >
        {LEARNING_STATUS_LABELS[displayStatus]}
        <ChevronDown size={12} aria-hidden="true" />
      </button>
      {open && (
        <div className="ss-status-menu" role="menu" aria-label="Chọn trạng thái học tập" onKeyDown={handleMenuKey}>
          {STATUSES.map((itemStatus, index) => (
            <button
              key={itemStatus}
              type="button"
              role="menuitemradio"
              aria-checked={itemStatus === displayStatus}
              ref={node => { optionRefs.current[index] = node }}
              onClick={() => void select(itemStatus)}
            >
              <span className={`ss-status-dot ss-status-dot--${itemStatus}`} aria-hidden="true" />
              {LEARNING_STATUS_LABELS[itemStatus]}
              {itemStatus === displayStatus && <Check size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
