import { useState } from 'react'
import { X, Check } from 'lucide-react'

export default function EditWritingPromptModal({
  initialPrompt,
  onClose,
  onSave,
}: {
  initialPrompt: string
  onClose: () => void
  onSave: (prompt: string) => Promise<void>
}) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!prompt.trim()) return
    setSaving(true)
    try {
      await onSave(prompt.trim())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Sửa đề bài
          </h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Đề bài
          </label>
          <textarea
            autoFocus
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={6}
            placeholder="Nhập đề bài IELTS…"
            className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void save()
            }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Dòng đầu = tiêu đề ngắn · Ctrl+Enter để lưu
          </p>
        </div>

        <div
          className="flex justify-end gap-2 px-5 py-4 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
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
            disabled={saving || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            <Check size={14} />
            {saving ? 'Đang lưu…' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}