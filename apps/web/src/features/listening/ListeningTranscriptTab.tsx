import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import CopyButton from '../../components/CopyButton'
import { lessonRepo } from '@ryan/db'
import type { LessonSentence } from './types'

interface Props {
  lessonId: string
  sentences: LessonSentence[]
  onSentencesChange?: () => void
}

export default function ListeningTranscriptTab({ lessonId, sentences, onSentencesChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const [draftVi, setDraftVi] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(s: LessonSentence) {
    setEditingId(s.id)
    setDraftText(s.text)
    setDraftVi(s.vi ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setDraftText('')
    setDraftVi('')
  }

  async function saveEdit(sentenceId: string) {
    setSaving(true)
    const updated = sentences.map(s =>
      s.id === sentenceId ? { ...s, text: draftText.trim(), vi: draftVi.trim() || undefined } : s,
    )
    await lessonRepo.update(lessonId, { sentences: updated })
    setSaving(false)
    setEditingId(null)
    onSentencesChange?.()
  }

  return (
    <div className="flex flex-col gap-3">
      {sentences.map((s, i) => {
        const isEditing = editingId === s.id
        return (
          <div
            key={s.id}
            className="rounded-xl p-4 transition-shadow"
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${isEditing ? 'var(--color-primary)' : 'var(--border-color)'}`,
              boxShadow: isEditing ? '0 4px 20px color-mix(in srgb, var(--color-primary) 12%, transparent)' : undefined,
              borderLeft: isEditing ? '4px solid var(--color-primary)' : undefined,
            }}
          >
            <div className="flex gap-3">
              <span
                className="text-sm font-bold tabular-nums w-6 shrink-0 pt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <>
                    <textarea
                      value={draftText}
                      onChange={e => setDraftText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg text-sm mb-2 outline-none resize-none"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                    <input
                      value={draftVi}
                      onChange={e => setDraftVi(e.target.value)}
                      placeholder="Bản dịch tiếng Việt (tuỳ chọn)"
                      className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={saving || !draftText.trim()}
                        onClick={() => void saveEdit(s.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                        style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                      >
                        <Check size={14} />
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                      >
                        <X size={14} />
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 select-text">
                        <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {s.text}
                        </p>
                        {s.vi ? (
                          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.vi}</p>
                        ) : (
                          <p className="text-xs mt-1.5 italic" style={{ color: 'var(--text-muted)' }}>
                            Chưa có bản dịch — bấm biểu tượng bút để thêm
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100">
                        <CopyButton
                          text={s.vi ? `${s.text}\n${s.vi}` : s.text}
                          title="Copy câu"
                        />
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          title="Sửa câu"
                          className="inline-flex items-center justify-center p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}