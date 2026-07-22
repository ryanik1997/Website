import { getCardStudyStatus, STATUS_LABELS, type CardStudyStatus } from './cardStatus'
import type { Srs } from '@ryan/db'
import { resolvePos, type PosLabel } from './posLabels'
import './vocabList.css'

const STATUS_CLASS: Record<CardStudyStatus, string> = {
  new: 'vocab-status-new',
  due: 'vocab-status-due',
  learned: 'vocab-status-learned',
}

function posClass(label: PosLabel): string {
  if (label === 'Động từ' || label === 'Cụm động từ') return 'vocab-pos-verb'
  if (label === 'Tính từ') return 'vocab-pos-adj'
  if (label === 'Trạng từ') return 'vocab-pos-adv'
  return 'vocab-pos'
}

export function StatusBadge({ srs }: { srs: Srs | undefined }) {
  const status = getCardStudyStatus(srs)
  return (
    <span className={`vocab-badge ${STATUS_CLASS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PosBadge({ phrase, pos }: { phrase: string; pos?: string }) {
  const label = resolvePos(phrase, pos)
  return (
    <span className={`vocab-badge ${posClass(label)}`}>
      {label}
    </span>
  )
}