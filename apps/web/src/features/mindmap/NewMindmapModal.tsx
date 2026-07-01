import { useState } from 'react'
import { X } from 'lucide-react'
import { mindmapRepo } from '@ryan/db'
import { createNode } from './types'

interface Props {
  onClose: () => void
  onCreated: (id: string) => void
}

export default function NewMindmapModal({ onClose, onCreated }: Props) {
  const [word, setWord] = useState('')
  const [saving, setSaving] = useState(false)

  async function create() {
    const w = word.trim()
    if (!w) return
    setSaving(true)
    const root = createNode(w)
    const map = await mindmapRepo.create(w, root)
    setSaving(false)
    onCreated(map.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl shadow-2xl p-6"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Tạo MindMap mới
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Từ trung tâm
        </label>
        <input
          autoFocus
          value={word}
          onChange={e => setWord(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && create()}
          placeholder="VD: abandon, environment, technology..."
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none mb-5"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
          >
            Hủy
          </button>
          <button
            onClick={create}
            disabled={saving || !word.trim()}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Đang tạo...' : 'Tạo'}
          </button>
        </div>
      </div>
    </div>
  )
}
