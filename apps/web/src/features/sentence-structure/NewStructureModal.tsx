import { useState, type CSSProperties } from 'react'
import { X } from 'lucide-react'
import { sentenceStructureRepo } from '@ryan/db'
import { STRUCTURE_CATEGORIES } from './types'

export default function NewStructureModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState('Just because [A] doesn\'t mean [B].')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(STRUCTURE_CATEGORIES[0].label)
  const [exampleA, setExampleA] = useState('')
  const [exampleB, setExampleB] = useState('')
  const [exampleNoteVi, setExampleNoteVi] = useState('')
  const [saving, setSaving] = useState(false)

  const inputStyle = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  async function save() {
    if (!title.trim() || !template.trim()) return
    if (!template.includes('[A]') || !template.includes('[B]')) return
    setSaving(true)
    const doc = await sentenceStructureRepo.create({
      title: title.trim(),
      template: template.trim(),
      description: description.trim() || 'Luyện điền A và B theo mẫu câu.',
      category,
      exampleA: exampleA.trim() || '...',
      exampleB: exampleB.trim() || '...',
      exampleNoteVi: exampleNoteVi.trim() || 'Ví dụ minh họa cho cấu trúc này.',
    })
    setSaving(false)
    onCreated(doc.id)
    onClose()
  }

  const valid = title.trim() && template.includes('[A]') && template.includes('[B]')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Thêm cấu trúc câu</h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3 overflow-y-auto text-sm">
          <Field label="Tiêu đề" value={title} onChange={setTitle} placeholder="VD: Just because ... doesn't mean ..." style={inputStyle} />
          <Field label="Mẫu câu (dùng [A] và [B])" value={template} onChange={setTemplate} placeholder="Just because [A] doesn't mean [B]." style={inputStyle} />
          <Field label="Mô tả (tiếng Việt)" value={description} onChange={setDescription} placeholder="Giải thích ngắn khi nào dùng..." style={inputStyle} />
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Nhóm</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={inputStyle}
            >
              {STRUCTURE_CATEGORIES.map(c => (
                <option key={c.id} value={c.label}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ví dụ A" value={exampleA} onChange={setExampleA} placeholder="you fail once" style={inputStyle} />
            <Field label="Ví dụ B" value={exampleB} onChange={setExampleB} placeholder="you should give up" style={inputStyle} />
          </div>
          <Field label="Ghi chú tiếng Việt" value={exampleNoteVi} onChange={setExampleNoteVi} placeholder="Chỉ vì... không có nghĩa là..." style={inputStyle} multiline />
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !valid}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Đang lưu...' : 'Thêm bài'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, style, multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  style: CSSProperties
  multiline?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
          style={style}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
          style={style}
        />
      )}
    </div>
  )
}