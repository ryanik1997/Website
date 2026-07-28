import { useState } from 'react'
import { X } from 'lucide-react'
import { mindmapRepo } from '@ryan/db'
import { createNode } from './types'
import { IELTS_MINDMAP_TEMPLATES } from './ieltsTopicTemplates'

interface Props {
  onClose: () => void
  onCreated: (id: string) => void
}

export default function NewMindmapModal({ onClose, onCreated }: Props) {
  const [word, setWord] = useState('')
  const [saving, setSaving] = useState(false)
  const [templateId, setTemplateId] = useState<string | null>(null)

  async function create() {
    setSaving(true)
    try {
      if (templateId) {
        const tpl = IELTS_MINDMAP_TEMPLATES.find(t => t.id === templateId)
        if (!tpl) return
        const root = tpl.build()
        const map = await mindmapRepo.create(`IELTS · ${tpl.label}`, root)
        onCreated(map.id)
        onClose()
        return
      }
      const w = word.trim()
      if (!w) return
      const root = createNode(w)
      const map = await mindmapRepo.create(w, root)
      onCreated(map.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Tạo MindMap mới
          </h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
          Template IELTS topic
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {IELTS_MINDMAP_TEMPLATES.map(t => {
            const active = templateId === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTemplateId(active ? null : t.id)
                  if (!active) setWord(t.topic)
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                style={{
                  borderColor: active ? 'var(--color-primary)' : 'var(--border-color)',
                  background: active
                    ? 'color-mix(in srgb, var(--color-primary) 14%, transparent)'
                    : 'var(--bg-secondary)',
                  color: active ? 'var(--color-primary)' : 'var(--text-primary)',
                }}
                title={t.labelVi}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
          {templateId ? 'Tên (từ template)' : 'Từ trung tâm'}
        </label>
        <input
          autoFocus
          value={word}
          onChange={e => {
            setWord(e.target.value)
            setTemplateId(null)
          }}
          onKeyDown={e => e.key === 'Enter' && void create()}
          placeholder="VD: abandon, environment, technology..."
          disabled={Boolean(templateId)}
          className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none mb-5 disabled:opacity-70"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />

        <div className="flex justify-end gap-2">
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
            onClick={() => void create()}
            disabled={saving || (!templateId && !word.trim())}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Đang tạo...' : templateId ? 'Tạo từ template' : 'Tạo'}
          </button>
        </div>
      </div>
    </div>
  )
}
