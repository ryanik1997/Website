import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { lessonRepo } from '@ryan/db'
import { splitIntoSentences } from './types'

interface Props {
  lessonId: string
  lessonTitle: string
  mode: 'sentence' | 'text'
  onClose: () => void
  onSaved?: () => void
}

export default function AppendSentencesModal({ lessonId, lessonTitle, mode, onClose, onSaved }: Props) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const preview = mode === 'text' ? splitIntoSentences(value) : []
  const canSave = mode === 'sentence' ? value.trim().length > 0 : preview.length > 0

  async function save() {
    if (!canSave) return
    setSaving(true)
    setError('')
    try {
      const texts = mode === 'sentence' ? [value.trim()] : preview
      await lessonRepo.appendSentences(lessonId, texts)
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thêm được câu.')
      setSaving(false)
    }
  }

  const INPUT_STYLE = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {mode === 'sentence' ? 'Thêm câu' : 'Thêm văn bản'}
            </h3>
            <p className="text-xs mt-0.5 truncate max-w-[280px]" style={{ color: 'var(--text-muted)' }}>
              {lessonTitle}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          {error && (
            <p className="text-sm mb-3" style={{ color: 'var(--color-accent)' }}>{error}</p>
          )}

          {mode === 'sentence' ? (
            <textarea
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Nhập một câu tiếng Anh..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none"
              style={INPUT_STYLE}
            />
          ) : (
            <>
              <textarea
                autoFocus
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={'Dán đoạn văn tiếng Anh.\nApp tự tách theo dấu . ! ?'}
                rows={8}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none font-mono"
                style={INPUT_STYLE}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Sẽ thêm ~{preview.length || splitIntoSentences(value).length} câu vào bài hiện có
              </p>
            </>
          )}
        </div>

        <div
          className="flex justify-between items-center px-5 py-4 border-t shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button type="button" onClick={onClose} className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!canSave || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            {saving ? 'Đang lưu...' : mode === 'sentence' ? 'Thêm câu' : `Thêm ${preview.length || 0} câu`}
            {!saving && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}