import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { lessonRepo } from '@ryan/db'
import { defaultSentence, splitIntoSentences } from './types'

interface Props { onClose: () => void }

type Step = 'input' | 'preview'

export default function CreateLessonModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [sentences, setSentences] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  function toPreview() {
    const parsed = splitIntoSentences(text)
    setSentences(parsed)
    setStep('preview')
  }

  async function create() {
    if (!title.trim() || !sentences.length) return
    setSaving(true)
    await lessonRepo.create({
      category: 'user',
      title: title.trim(),
      sentences: sentences.filter(s => s.trim()).map(defaultSentence),
      source: 'text',
    })
    setSaving(false)
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
        className="w-full max-w-2xl rounded-xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {step === 'input' ? 'Tạo bài nghe mới' : `Xem trước — ${sentences.length} câu`}
          </h3>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'input' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Tên bài nghe
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Cambridge IELTS 16 — Test 2"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Nội dung (paste đoạn văn — app sẽ tự tách câu)
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={'Paste nội dung bài nghe vào đây.\nMỗi câu kết thúc bằng dấu . ! ?'}
                  rows={10}
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none font-mono"
                  style={INPUT_STYLE}
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Phát hiện ~{splitIntoSentences(text).length} câu
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Kiểm tra và chỉnh sửa từng câu nếu cần. Mỗi câu sẽ là một bài dictation.
              </p>
              <div className="flex flex-col gap-2">
                {sentences.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="mt-2 shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                    >
                      {i + 1}
                    </span>
                    <input
                      value={s}
                      onChange={e => {
                        const next = [...sentences]
                        next[i] = e.target.value
                        setSentences(next)
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                      style={INPUT_STYLE}
                    />
                    <button
                      onClick={() => setSentences(ss => ss.filter((_, j) => j !== i))}
                      className="mt-2 p-1 rounded shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSentences(ss => [...ss, ''])}
                  className="text-sm mt-1 text-left"
                  style={{ color: 'var(--color-primary)' }}
                >
                  + Thêm câu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          {step === 'preview' ? (
            <button
              onClick={() => setStep('input')}
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Quay lại
            </button>
          ) : (
            <button onClick={onClose} className="text-sm" style={{ color: 'var(--text-muted)' }}>Hủy</button>
          )}

          {step === 'input' ? (
            <button
              onClick={toPreview}
              disabled={!title.trim() || splitIntoSentences(text).length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              Xem trước
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={create}
              disabled={saving || sentences.filter(s => s.trim()).length === 0}
              className="px-5 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Đang tạo...' : `Tạo bài (${sentences.filter(s => s.trim()).length} câu)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
