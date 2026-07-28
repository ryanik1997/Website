/**
 * Nút "Lưu lỗi → Exam mistakes" dùng trên màn kết quả đề.
 */
import { useState } from 'react'
import { BookmarkPlus, Check, Loader2 } from 'lucide-react'
import { addExamMistake } from './examVocabDecks'

export type ExamMistakePayload = {
  phrase: string
  meaning: string
  example?: string
  sourceExamId?: string
  sourceLabel?: string
  book?: string
  test?: number | string
}

interface Props {
  items: ExamMistakePayload[]
  /** Compact single-item mode */
  item?: ExamMistakePayload
  className?: string
  label?: string
}

export default function AddExamMistakeButton({ items, item, className, label }: Props) {
  const list = item ? [item] : items
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleClick() {
    if (!list.length || state === 'saving') return
    setState('saving')
    try {
      let created = 0
      for (const row of list) {
        if (!row.phrase?.trim()) continue
        const r = await addExamMistake(row)
        if (r.created) created++
      }
      setMsg(created > 0 ? `Đã thêm ${created} thẻ vào Exam mistakes` : 'Đã có trong deck (không trùng)')
      setState('done')
    } catch {
      setMsg('Lỗi lưu thẻ')
      setState('error')
    }
  }

  if (!list.length) return null

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={state === 'saving' || state === 'done'}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{
          borderColor: 'var(--color-primary)',
          color: state === 'done' ? 'var(--color-accent)' : 'var(--color-primary)',
          background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
        }}
      >
        {state === 'saving' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : state === 'done' ? (
          <Check size={16} />
        ) : (
          <BookmarkPlus size={16} />
        )}
        {label ?? (list.length > 1 ? `Lưu ${list.length} lỗi → Vocab` : 'Lưu lỗi → Exam mistakes')}
      </button>
      {msg && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{msg}</p>
      )}
    </div>
  )
}
