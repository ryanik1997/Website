import { useLiveQuery } from 'dexie-react-hooks'
import { Play, Languages, Plus, Trash2, X, Check, Pencil } from 'lucide-react'
import { useState } from 'react'
import { db, translationRepo } from '@ryan/db'
import type { TranslationSentence } from '@ryan/db'
import { useTranslationStore } from './translationStore'
import { DIFFICULTY_LABELS, isDue, isSentenceTranslated } from './types'

export default function TranslationDetail() {
  const { activeSetId, startPractice, startPracticeSentence } = useTranslationStore()
  const set = useLiveQuery(
    () => activeSetId ? db.translationSets.get(activeSetId) : undefined,
    [activeSetId],
  )
  const [showAdd, setShowAdd] = useState(false)
  const [vi, setVi] = useState('')
  const [en, setEn] = useState('')
  const [hint, setHint] = useState('')
  const [difficulty, setDifficulty] = useState<TranslationSentence['difficulty']>('medium')
  const [saving, setSaving] = useState(false)
  const [renamingTitle, setRenamingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')

  if (!activeSetId || !set) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Languages size={44} className="mx-auto mb-4" style={{ color: 'var(--border-color)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chọn bộ câu</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Chọn một bộ từ danh sách bên trái để xem chi tiết
          </p>
        </div>
      </div>
    )
  }

  const setId = set.id
  const setTitle = set.title
  const sentences = set.sentences
  const due = sentences.filter(isDue).length
  const practiced = sentences.filter(s => (s.srsState?.reps ?? 0) > 0).length

  async function saveTitle() {
    const next = draftTitle.trim()
    if (!next) {
      setRenamingTitle(false)
      return
    }
    if (next !== setTitle) await translationRepo.updateTitle(setId, next)
    setRenamingTitle(false)
  }

  async function addSentence() {
    if (!vi.trim() || !en.trim()) return
    setSaving(true)
    await translationRepo.addSentence(setId, {
      vi: vi.trim(),
      en: en.trim(),
      hint: hint.trim() || undefined,
      difficulty,
    })
    setVi('')
    setEn('')
    setHint('')
    setDifficulty('medium')
    setShowAdd(false)
    setSaving(false)
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="px-6 py-4 border-b shrink-0"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {renamingTitle ? (
              <input
                autoFocus
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') void saveTitle()
                  if (e.key === 'Escape') setRenamingTitle(false)
                }}
                onBlur={() => void saveTitle()}
                className="w-full max-w-md px-2 py-1 rounded text-base font-semibold border outline-none mb-1"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            ) : (
              <div className="flex items-center gap-1.5 mb-1 min-w-0">
                <h2 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {set.title}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setDraftTitle(set.title)
                    setRenamingTitle(true)
                  }}
                  className="p-1 rounded shrink-0 opacity-60 hover:opacity-100"
                  style={{ color: 'var(--text-muted)' }}
                  title="Đổi tên chủ đề"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{sentences.length} câu</span>
              {due > 0 && (
                <span style={{ color: 'var(--color-primary)' }}>• {due} cần ôn</span>
              )}
              {practiced > 0 && <span>• {practiced} đã luyện</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={startPractice}
            disabled={sentences.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shrink-0 disabled:opacity-40"
            style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          >
            <Play size={14} />
            Luyện tập
          </button>
        </div>

        {practiced > 0 && sentences.length > 0 && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round((practiced / sentences.length) * 100)}%`,
                  background: 'var(--color-primary)',
                }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {Math.round((practiced / sentences.length) * 100)}% đã luyện
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {showAdd ? (
          <div
            className="rounded-xl border p-4 mb-4 flex flex-col gap-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Thêm câu mới</p>
              <button type="button" onClick={() => setShowAdd(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            <textarea
              value={vi}
              onChange={e => setVi(e.target.value)}
              placeholder="Câu tiếng Việt (đề bài)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={inputStyle}
            />
            <textarea
              value={en}
              onChange={e => setEn(e.target.value)}
              placeholder="Đáp án tiếng Anh"
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={inputStyle}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              lang="en"
            />
            <input
              value={hint}
              onChange={e => setHint(e.target.value)}
              placeholder="Gợi ý từ khóa (tuỳ chọn)"
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={inputStyle}
            />
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium border"
                  style={{
                    borderColor: difficulty === d ? 'var(--color-primary)' : 'var(--border-color)',
                    color: difficulty === d ? 'var(--color-primary)' : 'var(--text-muted)',
                    background: difficulty === d
                      ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                      : 'transparent',
                  }}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void addSentence()}
              disabled={!vi.trim() || !en.trim() || saving}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              <Check size={14} />
              {saving ? 'Đang lưu…' : 'Thêm câu'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 text-sm font-medium mb-4 transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            <Plus size={14} />
            Thêm câu thủ công
          </button>
        )}

        {sentences.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Bộ này chưa có câu nào. Thêm câu thủ công hoặc import sau.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sentences.map((s, i) => (
              <SentenceRow
                key={s.id}
                index={i + 1}
                sentence={s}
                onPractice={() => startPracticeSentence(s.id)}
                onDelete={async () => {
                  if (!confirm('Xóa câu này?')) return
                  await translationRepo.deleteSentence(setId, s.id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SentenceRow({
  index, sentence, onPractice, onDelete,
}: {
  index: number
  sentence: TranslationSentence
  onPractice: () => void
  onDelete: () => void
}) {
  const due = isDue(sentence)
  const translated = isSentenceTranslated(sentence)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPractice}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPractice()
        }
      }}
      title="Bấm để dịch câu này"
      className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,var(--bg-card))]"
      style={{
        background: translated
          ? 'color-mix(in srgb, var(--color-primary) 11%, var(--bg-card))'
          : 'var(--bg-card)',
        border: `1px solid ${translated
          ? 'color-mix(in srgb, var(--color-primary) 45%, var(--border-color))'
          : 'var(--border-color)'}`,
      }}
    >
      <span
        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
        style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
      >
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{sentence.vi}</p>
        {sentence.hint && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Gợi ý: {sentence.hint}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
            color: 'var(--color-accent)',
          }}
        >
          {DIFFICULTY_LABELS[sentence.difficulty]}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: translated
              ? 'color-mix(in srgb, var(--color-success) 22%, transparent)'
              : 'color-mix(in srgb, var(--text-muted) 15%, transparent)',
            color: translated ? 'var(--color-success)' : 'var(--text-muted)',
          }}
        >
          {translated && <Check size={11} strokeWidth={2.5} aria-hidden="true" />}
          {translated ? 'Đã dịch' : 'Chưa dịch'}
        </span>
        {due && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
              color: 'var(--color-primary)',
            }}
          >
            Ôn hôm nay
          </span>
        )}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-secondary)]"
          style={{ color: 'var(--text-muted)' }}
          title="Xóa câu"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
