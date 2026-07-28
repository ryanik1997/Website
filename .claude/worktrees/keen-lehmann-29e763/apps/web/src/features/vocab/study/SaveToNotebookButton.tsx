import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { notebookRepo, phraseKeyOf, db } from '@ryan/db'
import type { Card } from '@ryan/db'
import { useLiveQuery } from 'dexie-react-hooks'

type Props = {
  card: Card
  deckId?: string
  className?: string
  /** compact icon-only */
  compact?: boolean
}

/**
 * Nút lưu từ hiện tại vào sổ ghi chú (Dexie notebookEntries).
 * Idempotent theo phrase — bấm lại cập nhật metadata, không tạo bản ghi trùng.
 */
export default function SaveToNotebookButton({ card, deckId, className, compact }: Props) {
  const key = phraseKeyOf(card.phrase)
  const existing = useLiveQuery(
    () => db.notebookEntries.where('phraseKey').equals(key).first(),
    [key],
  )
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState<'saved' | 'updated' | null>(null)

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(null), 1600)
    return () => window.clearTimeout(t)
  }, [flash])

  const onSave = useCallback(async (e: MouseEvent) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const { created } = await notebookRepo.save({
        phrase: card.phrase,
        meaning: card.meaning,
        example: card.example,
        ipaUS: card.ipaUS,
        ipaUK: card.ipaUK,
        pos: card.pos,
        sourceCardId: card.id,
        sourceDeckId: deckId ?? card.deckId,
        source: 'study',
      })
      setFlash(created ? 'saved' : 'updated')
    } finally {
      setBusy(false)
    }
  }, [busy, card, deckId])

  const saved = Boolean(existing)
  const label = flash === 'saved'
    ? 'Đã lưu!'
    : flash === 'updated'
      ? 'Đã cập nhật'
      : saved
        ? 'Đã trong sổ'
        : 'Lưu sổ ghi chú'

  return (
    <button
      type="button"
      className={className ?? 'vs-btn-secondary'}
      onClick={onSave}
      disabled={busy}
      title={saved ? 'Cập nhật trong sổ ghi chú' : 'Lưu vào sổ ghi chú'}
      aria-label={label}
      style={
        saved
          ? {
              background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
            }
          : undefined
      }
    >
      {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
      {!compact && <span>{label}</span>}
    </button>
  )
}
