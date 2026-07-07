import { useState } from 'react'
import { X } from 'lucide-react'
import { deckRepo } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { GROUP_LABELS, PRESET_GROUP_IDS, type PresetGroupId } from './vocabSeedDecks'

interface Props {
  deck?: Deck
  defaultGroupId?: string
  onClose: () => void
}

type CategoryId = PresetGroupId | 'default'

const CATEGORY_OPTIONS: { id: CategoryId; label: string; hint?: string }[] = [
  { id: 'default', label: 'Của tôi', hint: 'Bộ từ riêng của bạn' },
  ...PRESET_GROUP_IDS.map(id => ({ id, label: GROUP_LABELS[id] })),
]

export default function DeckEditorModal({ deck, defaultGroupId, onClose }: Props) {
  const [name, setName] = useState(deck?.name ?? '')
  const initialGroup: CategoryId = (() => {
    if (deck) {
      return (PRESET_GROUP_IDS as readonly string[]).includes(deck.groupId)
        ? (deck.groupId as PresetGroupId)
        : 'default'
    }
    if (defaultGroupId && (PRESET_GROUP_IDS as readonly string[]).includes(defaultGroupId)) {
      return defaultGroupId as PresetGroupId
    }
    return 'default'
  })()
  const [groupId, setGroupId] = useState<CategoryId>(initialGroup)
  const [saving, setSaving] = useState(false)
  const isPreset = deck?.origin === 'preset'

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    if (deck) {
      const patch: Parameters<typeof deckRepo.update>[1] = { name: name.trim() }
      if (!isPreset) patch.groupId = groupId
      await deckRepo.update(deck.id, patch)
    } else {
      await deckRepo.create(name.trim(), { groupId })
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

        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Tên bộ thẻ
        </label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Ví dụ: Từ vựng IELTS Writing Task 2..."
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />

        <label className="block text-xs font-medium mb-1.5 mt-4" style={{ color: 'var(--text-muted)' }}>
          Phân loại
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(opt => {
            const active = groupId === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isPreset}
                onClick={() => setGroupId(opt.id)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: active ? 'var(--color-primary)' : 'var(--bg-secondary)',
                  color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: active ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {isPreset ? (
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Bộ thẻ mặc định không đổi được phân loại.
          </p>
        ) : (
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Bộ thẻ sẽ hiện trong tab {CATEGORY_OPTIONS.find(o => o.id === groupId)?.label} ở trang từ vựng.
          </p>
        )}

        <div className="flex justify-end gap-2 mt-5">
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
