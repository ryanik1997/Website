import { useMemo, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { lessonRepo } from '@ryan/db'
import { buildCambridgeTitle } from './listeningMeta'
import { defaultSentence, splitIntoSentences } from './types'

interface Props {
  onClose: () => void
}

type Step = 'input' | 'preview'
type Mode = 'user' | 'cambridge'

interface CambridgeFormState {
  book: string
  bookNum: string
  test: string
  part: string
}

const DEFAULT_CAMBRIDGE_FORM: CambridgeFormState = {
  book: 'Cambridge 20',
  bookNum: '20',
  test: '3',
  part: '1',
}

function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export default function CreateLessonModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [mode, setMode] = useState<Mode>('user')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [sentences, setSentences] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [cambridge, setCambridge] = useState<CambridgeFormState>(DEFAULT_CAMBRIDGE_FORM)

  const INPUT_STYLE = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  const trimmedTitle = title.trim()
  const normalizedBook = cambridge.book.trim()
  const parsedTest = parsePositiveInt(cambridge.test)
  const parsedPart = parsePositiveInt(cambridge.part)
  const parsedBookNum = parsePositiveInt(cambridge.bookNum)
  const parsedSentences = useMemo(() => splitIntoSentences(text), [text])
  const parsedCount = parsedSentences.length

  const structuredTitle = useMemo(() => {
    if (!normalizedBook || parsedTest == null || parsedPart == null) return ''
    return buildCambridgeTitle(normalizedBook, parsedTest, parsedPart)
  }, [normalizedBook, parsedTest, parsedPart])

  const effectiveTitle = mode === 'cambridge' ? structuredTitle : trimmedTitle
  const canPreview = mode === 'cambridge'
    ? Boolean(structuredTitle && parsedCount > 0)
    : Boolean(trimmedTitle && parsedCount > 0)

  function updateCambridge<K extends keyof CambridgeFormState>(key: K, value: CambridgeFormState[K]) {
    setCambridge(prev => ({ ...prev, [key]: value }))
  }

  function handlePreview() {
    setSentences(parsedSentences)
    setStep('preview')
  }

  async function create() {
    const cleanedSentences = sentences
      .map(sentence => sentence.trim())
      .filter(Boolean)
      .map(defaultSentence)

    if (!effectiveTitle || cleanedSentences.length === 0) return

    setSaving(true)

    try {
      // Cambridge mode cần metadata có cấu trúc để hiện đúng trong Library.
      if (mode === 'cambridge') {
        if (!normalizedBook || parsedTest == null || parsedPart == null) {
          alert('Vui lòng nhập đầy đủ bộ sách, Test và Part hợp lệ.')
          return
        }

        const exists = await lessonRepo.existsStructured(normalizedBook, parsedTest, parsedPart)
        if (exists) {
          alert(`Đã tồn tại ${normalizedBook} - Test ${parsedTest} - Part ${parsedPart}.`)
          return
        }

        await lessonRepo.create({
          category: 'cambridge',
          title: effectiveTitle,
          book: normalizedBook,
          bookNum: parsedBookNum ?? undefined,
          test: parsedTest,
          part: parsedPart,
          sentences: cleanedSentences,
          source: 'text',
        })
      } else {
        await lessonRepo.create({
          category: 'user',
          title: effectiveTitle,
          sentences: cleanedSentences,
          source: 'text',
        })
      }

      onClose()
    } catch (error) {
      console.error('Không thể tạo bài nghe', error)
      alert('Không thể tạo bài nghe. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex w-full max-w-2xl flex-col rounded-xl shadow-2xl"
        style={{ background: 'var(--bg-card)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4 shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {step === 'input' ? 'Tạo bài nghe mới' : `Xem trước - ${sentences.length} câu`}
          </h3>
          <button type="button" onClick={onClose} className="rounded p-1" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'input' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Loại bài nghe
                </label>
                <div className="flex gap-2">
                  {([
                    { id: 'user', label: 'My Lesson' },
                    { id: 'cambridge', label: 'Cambridge Test' },
                  ] as const).map(option => {
                    const active = mode === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setMode(option.id)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold"
                        style={{
                          background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                          color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
                          border: active ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                        }}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {mode === 'cambridge' ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Tên bộ sách
                      </label>
                      <input
                        autoFocus
                        value={cambridge.book}
                        onChange={e => updateCambridge('book', e.target.value)}
                        placeholder="VD: Cambridge 20"
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Số sách
                      </label>
                      <input
                        value={cambridge.bookNum}
                        onChange={e => updateCambridge('bookNum', e.target.value)}
                        inputMode="numeric"
                        placeholder="VD: 20"
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Test
                      </label>
                      <input
                        value={cambridge.test}
                        onChange={e => updateCambridge('test', e.target.value)}
                        inputMode="numeric"
                        placeholder="VD: 3"
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Part
                      </label>
                      <input
                        value={cambridge.part}
                        onChange={e => updateCambridge('part', e.target.value)}
                        inputMode="numeric"
                        placeholder="VD: 1"
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                  </div>

                  <div
                    className="rounded-lg border px-3 py-2.5 text-sm"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {structuredTitle || 'Nhập bộ sách, Test và Part hợp lệ để tạo bài Cambridge.'}
                  </div>
                </>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Tên bài nghe
                  </label>
                  <input
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: IELTS Listening Test 3"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
                    style={INPUT_STYLE}
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Nội dung
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={'Paste nội dung bài nghe vào đây.\nMỗi câu kết thúc bằng dấu . ! ?'}
                  rows={10}
                  className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm font-mono outline-none"
                  style={INPUT_STYLE}
                />
                <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Phát hiện khoảng {parsedCount} câu
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                Kiểm tra và chỉnh sửa từng câu nếu cần. Mỗi câu sẽ là một bài dictation.
              </p>
              <div className="flex flex-col gap-2">
                {sentences.map((sentence, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span
                      className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                    >
                      {index + 1}
                    </span>
                    <input
                      value={sentence}
                      onChange={e => {
                        const next = [...sentences]
                        next[index] = e.target.value
                        setSentences(next)
                      }}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                      style={INPUT_STYLE}
                    />
                    <button
                      type="button"
                      onClick={() => setSentences(current => current.filter((_, currentIndex) => currentIndex !== index))}
                      className="mt-2 shrink-0 rounded p-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setSentences(current => [...current, ''])}
                  className="mt-1 text-left text-sm"
                  style={{ color: 'var(--color-primary)' }}
                >
                  + Thêm câu
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between border-t px-6 py-4 shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {step === 'preview' ? (
            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Quay lại
            </button>
          ) : (
            <button type="button" onClick={onClose} className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Hủy
            </button>
          )}

          {step === 'input' ? (
            <button
              type="button"
              onClick={handlePreview}
              disabled={!canPreview}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              Xem trước
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={create}
              disabled={saving || sentences.every(sentence => !sentence.trim())}
              className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Đang tạo...' : `Tạo bài (${sentences.filter(sentence => sentence.trim()).length} câu)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
