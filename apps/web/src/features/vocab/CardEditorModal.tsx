import { useState, useId } from 'react'
import { X } from 'lucide-react'
import { cardRepo } from '@ryan/db'
import type { Card } from '@ryan/db'
import { POS_OPTIONS, inferPos, resolvePos } from './posLabels'

interface Props {
  deckId: string
  card?: Card
  onClose: () => void
}

type FormData = { phrase: string; meaning: string; example: string; ipaUS: string; pos: string }

const INPUT_CLS = 'w-full px-3 py-2 rounded-lg text-sm border outline-none'
const INPUT_STYLE = { background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }

export default function CardEditorModal({ deckId, card, onClose }: Props) {
  const id = useId()
  const [form, setForm] = useState<FormData>({
    phrase: card?.phrase ?? '',
    meaning: card?.meaning ?? '',
    example: card?.example ?? '',
    ipaUS: card?.ipaUS ?? '',
    pos: card?.pos ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function suggestPos() {
    if (!form.phrase.trim()) return
    setForm(f => ({ ...f, pos: inferPos(f.phrase) }))
  }

  async function save(andClose = true) {
    if (!form.phrase.trim() || !form.meaning.trim()) return
    setSaving(true)
    const data = {
      phrase: form.phrase.trim(),
      meaning: form.meaning.trim(),
      example: form.example.trim() || undefined,
      ipaUS: form.ipaUS.trim() || undefined,
      ipaUK: undefined as string | undefined,
      pos: resolvePos(form.phrase.trim(), form.pos.trim() || undefined),
    }
    if (card) {
      await cardRepo.update(card.id, data)
    } else {
      await cardRepo.add(deckId, data)
    }
    setSaving(false)
    if (andClose) {
      onClose()
    } else {
      setForm({ phrase: '', meaning: '', example: '', ipaUS: '', pos: '' })
      setTimeout(() => (document.getElementById(`${id}-phrase`) as HTMLInputElement)?.focus(), 50)
    }
  }

  const disabled = saving || !form.phrase.trim() || !form.meaning.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {card ? 'Sửa từ' : 'Thêm từ mới'}
          </h3>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Từ / Cụm từ *</label>
            <input
              id={`${id}-phrase`}
              autoFocus
              value={form.phrase}
              onChange={set('phrase')}
              onBlur={suggestPos}
              placeholder="abandon"
              className={INPUT_CLS}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Nghĩa tiếng Việt *</label>
            <input
              value={form.meaning}
              onChange={set('meaning')}
              placeholder="từ bỏ, bỏ rơi"
              className={INPUT_CLS}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Loại từ</label>
            <select
              value={form.pos}
              onChange={set('pos')}
              className={INPUT_CLS}
              style={INPUT_STYLE}
            >
              <option value="">Tự nhận diện khi lưu</option>
              {POS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Câu ví dụ</label>
            <textarea
              value={form.example}
              onChange={set('example')}
              placeholder="She abandoned her car in the snow."
              rows={2}
              className={`${INPUT_CLS} resize-none`}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Phát âm IPA (US)</label>
            <input
              value={form.ipaUS}
              onChange={set('ipaUS')}
              placeholder="/əˈbændən/"
              className={INPUT_CLS}
              style={INPUT_STYLE}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          {!card && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              "Thêm & tiếp" để thêm nhiều từ liên tục
            </p>
          )}
          <div className={`flex gap-2 ${card ? 'ml-auto' : ''}`}>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
            >
              Hủy
            </button>
            {!card && (
              <button
                onClick={() => save(false)}
                disabled={disabled}
                className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                Thêm & tiếp
              </button>
            )}
            <button
              onClick={() => save(true)}
              disabled={disabled}
              className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Đang lưu...' : card ? 'Lưu' : 'Thêm & đóng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}