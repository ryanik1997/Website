import { useState } from 'react'
import { X } from 'lucide-react'
import { deckRepo } from '@ryan/db'
import type { Deck } from '@ryan/db'

interface Props {
  deck?: Deck
  onClose: () => void
}

export default function DeckEditorModal({ deck, onClose }: Props) {
  const [name, setName] = useState(deck?.name ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    if (deck) {
      await deckRepo.update(deck.id, { name: name.trim() })
    } else {
      await deckRepo.create(name.trim())
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {deck ? 'Sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
          </h3>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Tên bộ thẻ..."
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
          >
            Hủy
          </button>
          <button
            onClick={save}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Đang lưu...' : deck ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </div>
    </div>
  )
}
