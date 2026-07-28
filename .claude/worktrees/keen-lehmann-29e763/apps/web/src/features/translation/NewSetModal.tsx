import { useState } from 'react'
import { X } from 'lucide-react'
import { translationRepo } from '@ryan/db'
import type { TranslationSet } from '@ryan/db'
import { CATEGORY_LABELS } from './types'
import type { TranslationGenre } from './translationCatalog'

interface Props {
  onClose: () => void
  fixedCategory?: TranslationSet['category']
  fixedGenre?: TranslationGenre
  title?: string
}

const CATEGORIES: TranslationSet['category'][] = [
  'grammar_basic', 'collocation', 'paragraph_65', 'paragraph_80', 'essay_full', 'user',
]

export default function NewSetModal({
  onClose,
  fixedCategory,
  fixedGenre,
  title = 'Tạo bộ câu mới',
}: Props) {
  const [setTitle, setSetTitle] = useState('')
  const [category, setCategory] = useState<TranslationSet['category']>(fixedCategory ?? 'user')
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!setTitle.trim()) return
    setSaving(true)
    await translationRepo.create({
      title: setTitle.trim(),
      category: fixedCategory ?? category,
      genre: fixedGenre,
      sentences: [],
    })
    setSaving(false)
    onClose()
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--text-primary) 40%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Tên bộ câu
            </label>
            <input
              autoFocus
              value={setTitle}
              onChange={e => setSetTitle(e.target.value)}
              placeholder="VD: IELTS Writing — Opinion Essay"
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
              style={inputStyle}
            />
          </div>

          {!fixedCategory && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Loại bộ câu
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
                    style={{
                      borderColor: category === cat ? 'var(--color-primary)' : 'var(--border-color)',
                      background: category === cat
                        ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                        : 'var(--bg-secondary)',
                      color: category === cat ? 'var(--color-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex gap-2 px-5 py-4 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void create()}
            disabled={!setTitle.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            {saving ? 'Đang tạo…' : 'Tạo bộ câu'}
          </button>
        </div>
      </div>
    </div>
  )
}