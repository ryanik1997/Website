import { useRef, useState } from 'react'
import { X, ImagePlus, Trash2 } from 'lucide-react'
import { writingRepo } from '@ryan/db'
import type { WritingDoc, WritingGenre } from '@ryan/db'
import { readWritingImage } from './writingImage'
import { IELTS_DOC_TYPE_OPTIONS, type DocTypeOption } from './writingTypes'

type DocType = WritingDoc['type']

export default function NewDocModal({
  onClose,
  onCreated,
  docTypeOptions = IELTS_DOC_TYPE_OPTIONS,
  title = 'Tạo bài viết mới',
  fixedType,
  fixedGenre,
}: {
  onClose: () => void
  onCreated: (id: string) => void
  docTypeOptions?: DocTypeOption[]
  title?: string
  fixedType?: DocType
  fixedGenre?: WritingGenre
}) {
  const [type, setType] = useState<DocType>(fixedType ?? docTypeOptions[0]?.id ?? 'ielts_task2')
  const [prompt, setPrompt] = useState('')
  const [promptImage, setPromptImage] = useState<string | undefined>()
  const [imageBusy, setImageBusy] = useState(false)
  const [imageErr, setImageErr] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const cfg = docTypeOptions.find(d => d.id === type) ?? docTypeOptions[0]!
  const needsPrompt = type !== 'master'

  async function onPickImage(file: File) {
    setImageErr('')
    setImageBusy(true)
    try {
      setPromptImage(await readWritingImage(file))
    } catch (e) {
      setImageErr(e instanceof Error ? e.message : 'Không thể tải ảnh.')
    } finally {
      setImageBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function create() {
    if (needsPrompt && !prompt.trim()) return
    setSaving(true)
    const doc = await writingRepo.createDoc(fixedType ?? type, prompt.trim(), promptImage, fixedGenre)
    setSaving(false)
    onCreated(doc.id)
    onClose()
  }

  const INPUT_STYLE = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          {!fixedType && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Loại bài</p>
              <div className="flex flex-col gap-2">
                {docTypeOptions.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl text-left border transition-colors"
                    style={{
                      borderColor: type === t.id ? 'var(--color-primary)' : 'var(--border-color)',
                      background: type === t.id
                        ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                        : 'var(--bg-secondary)',
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 transition-colors"
                      style={{
                        borderColor: type === t.id ? 'var(--color-primary)' : 'var(--border-color)',
                        background: type === t.id ? 'var(--color-primary)' : 'transparent',
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Đề bài {needsPrompt && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              autoFocus
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={cfg.placeholder}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
              style={INPUT_STYLE}
            />
            {cfg.target && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{cfg.target}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Ảnh đề bài (JPG, WEBP) — tuỳ chọn
            </label>
            {promptImage ? (
              <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                <img src={promptImage} alt="Preview" className="w-full max-h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => setPromptImage(undefined)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
                  title="Xóa ảnh"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={imageBusy}
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: 'var(--border-color)', color: 'var(--color-primary)' }}
              >
                <ImagePlus size={16} />
                {imageBusy ? 'Đang xử lý…' : 'Import ảnh JPG / WEBP'}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/webp,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) void onPickImage(f)
              }}
            />
            {imageErr && (
              <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{imageErr}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
          >
            Hủy
          </button>
          <button
            onClick={create}
            disabled={saving || (needsPrompt && !prompt.trim())}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Đang tạo...' : 'Tạo bài'}
          </button>
        </div>
      </div>
    </div>
  )
}