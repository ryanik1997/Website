import { useState } from 'react'
import { X } from 'lucide-react'
import { deckRepo } from '@ryan/db'
import type { Deck } from '@ryan/db'
import { GROUP_LABELS, PRESET_GROUP_IDS, type PresetGroupId } from './vocabConstants'
import './deckCards.css'

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

const DECK_ICON_OPTIONS = [
  '📚', '💻', '🌿', '✈️', '🎓', '💼', '🔬', '🏛️',
  '⚕️', '🏙️', '🏦', '🎯', '🗣️', '📝', '🧠', '🌍',
  '🔥', '⭐', '💡', '🧩', '📖', '🎧', '🎨', '⚙️',
]

const DECK_COLOR_OPTIONS = [
  '#2EC4B6', '#4CAF82', '#5B8DD9', '#9B59B6', '#E05C5C',
  '#E09B3D', '#E05C8A', '#2563EB', '#0D9488', '#7C3AED',
  '#DB2777', '#B45309', '#1D3557', '#457B9D', '#6366f1',
]

function deckDescription(deck?: Deck): string {
  if (!deck) return ''
  return (deck.description ?? deck.book ?? '').trim()
}

export default function DeckEditorModal({ deck, defaultGroupId, onClose }: Props) {
  const [name, setName] = useState(deck?.name ?? '')
  const [description, setDescription] = useState(deckDescription(deck))
  const [icon, setIcon] = useState(deck?.icon ?? '📚')
  const [color, setColor] = useState(deck?.color ?? DECK_COLOR_OPTIONS[0]!)
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
    const desc = description.trim()
    if (deck) {
      const patch: Parameters<typeof deckRepo.update>[1] = {
        name: name.trim(),
        description: desc || undefined,
        icon: icon || undefined,
        color: color || undefined,
      }
      if (!isPreset) patch.groupId = groupId
      // Preset cũ lưu mô tả ở `book` — đồng bộ khi sửa
      if (isPreset && deck.book && !deck.description) {
        patch.book = desc || deck.book
      }
      await deckRepo.update(deck.id, patch)
    } else {
      await deckRepo.create(name.trim(), {
        groupId,
        description: desc || undefined,
        icon: icon || '📚',
        color,
      })
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {deck ? 'Sửa bộ thẻ' : 'Tạo bộ thẻ mới'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Preview — cùng surface với lưới bộ thẻ */}
        <div
          className="vocab-deck-card vocab-deck-card--preview"
          style={{ ['--deck-accent' as string]: color }}
        >
          <div className="vocab-deck-card__surface" aria-hidden />
          <div className="vocab-deck-card__orb vocab-deck-card__orb--a" aria-hidden />
          <div className="vocab-deck-card__orb vocab-deck-card__orb--b" aria-hidden />
          <div className="vocab-deck-card__sheen" aria-hidden />
          <div className="vocab-deck-card__grain" aria-hidden />
          <div className="vocab-deck-card__hit">
            <span className="vocab-deck-card__icon" aria-hidden>
              {icon || '📚'}
            </span>
            <div className="vocab-deck-card__body">
              <p className="vocab-deck-card__meta">Xem trước</p>
              <h4 className="vocab-deck-card__title">{name.trim() || 'Tên bộ thẻ'}</h4>
              <p className="vocab-deck-card__desc">
                {description.trim() || 'Mô tả ngắn sẽ hiện ở đây…'}
              </p>
            </div>
          </div>
        </div>

        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Tên bộ thẻ
        </label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void save()}
          placeholder="Ví dụ: Công nghệ"
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />

        <label className="block text-xs font-medium mb-1.5 mt-4" style={{ color: 'var(--text-muted)' }}>
          Mô tả (hiện dưới tên)
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder="Ví dụ: Thuật ngữ công nghệ, AI và chuyển đổi số."
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />

        <label className="block text-xs font-medium mb-1.5 mt-4" style={{ color: 'var(--text-muted)' }}>
          Icon góc phải
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DECK_ICON_OPTIONS.map(emoji => {
            const active = icon === emoji
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all"
                style={{
                  background: active ? 'color-mix(in srgb, var(--color-primary) 18%, var(--bg-secondary))' : 'var(--bg-secondary)',
                  border: active ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                }}
                title={emoji}
              >
                {emoji}
              </button>
            )
          })}
        </div>

        <label className="block text-xs font-medium mb-1.5 mt-4" style={{ color: 'var(--text-muted)' }}>
          Màu thẻ
        </label>
        <div className="flex flex-wrap gap-2">
          {DECK_COLOR_OPTIONS.map(c => {
            const active = color.toLowerCase() === c.toLowerCase()
            return (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  background: c,
                  outline: active ? '2px solid var(--text-primary)' : 'none',
                  outlineOffset: 2,
                  transform: active ? 'scale(1.08)' : undefined,
                }}
                aria-label={`Màu ${c}`}
              />
            )
          })}
        </div>

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
                  color: active ? 'var(--color-on-primary, #fff)' : 'var(--text-primary)',
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
            Bộ thẻ mặc định không đổi được phân loại — vẫn sửa được mô tả, icon và màu.
          </p>
        ) : (
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Bộ thẻ sẽ hiện trong tab {CATEGORY_OPTIONS.find(o => o.id === groupId)?.label} ở trang từ vựng.
          </p>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void save()}
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
