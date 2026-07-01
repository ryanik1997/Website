import { useMemo, useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { lessonRepo } from '@ryan/db'
import { buildCambridgeTitle } from './listeningMeta'
import { defaultSentence, splitIntoSentences } from './types'

interface Props { onClose: () => void }

type Step = 'input' | 'preview'
type Mode = 'user' | 'cambridge'

export default function CreateLessonModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [mode, setMode] = useState<Mode>('user')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [sentences, setSentences] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [book, setBook] = useState('Cambridge 20')
  const [bookNum, setBookNum] = useState('20')
  const [test, setTest] = useState('3')
  const [part, setPart] = useState('1')

  const INPUT_STYLE = {
    background: 'var(--bg-secondary)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }

  const parsedCount = useMemo(() => splitIntoSentences(text).length, [text])
  const normalizedBook = book.trim()
  const trimmedTitle = title.trim()
  const testNum = Number.parseInt(test, 10)
  const partNum = Number.parseInt(part, 10)
  const parsedBookNum = Number.parseInt(bookNum, 10)
  const hasStructuredMeta = Boolean(
    normalizedBook
    && Number.isFinite(testNum)
    && testNum > 0
    && Number.isFinite(partNum)
    && partNum > 0,
  )
  const structuredTitle = hasStructuredMeta ? buildCambridgeTitle(normalizedBook, testNum, partNum) : ''
  const effectiveTitle = mode === 'cambridge' ? structuredTitle : trimmedTitle
  const canPreview = mode === 'cambridge'
    ? hasStructuredMeta && parsedCount > 0
    : Boolean(trimmedTitle && parsedCount > 0)

  function toPreview() {
    setSentences(splitIntoSentences(text))
    setStep('preview')
  }

  async function create() {
    const cleanedSentences = sentences.filter(s => s.trim()).map(defaultSentence)
    if (!effectiveTitle || !cleanedSentences.length) return

    setSaving(true)
    try {
      if (mode === 'cambridge') {
        const exists = await lessonRepo.existsStructured(normalizedBook, testNum, partNum)
        if (exists) {
          alert(`Da ton tai ${normalizedBook} - Test ${testNum} - Part ${partNum}.`)
          return
        }

        await lessonRepo.create({
          category: 'cambridge',
          title: effectiveTitle,
          book: normalizedBook,
          bookNum: Number.isFinite(parsedBookNum) ? parsedBookNum : undefined,
          test: testNum,
          part: partNum,
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {step === 'input' ? 'Tao bai nghe moi' : `Xem truoc - ${sentences.length} cau`}
          </h3>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'input' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Loai bai nghe
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
                        className="px-3 py-2 rounded-lg text-sm font-semibold"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        Ten bo sach
                      </label>
                      <input
                        autoFocus
                        value={book}
                        onChange={e => setBook(e.target.value)}
                        placeholder="VD: Cambridge 20"
                        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        So sach
                      </label>
                      <input
                        value={bookNum}
                        onChange={e => setBookNum(e.target.value)}
                        inputMode="numeric"
                        placeholder="VD: 20"
                        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        Test
                      </label>
                      <input
                        value={test}
                        onChange={e => setTest(e.target.value)}
                        inputMode="numeric"
                        placeholder="VD: 3"
                        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        Part
                      </label>
                      <input
                        value={part}
                        onChange={e => setPart(e.target.value)}
                        inputMode="numeric"
                        placeholder="VD: 1"
                        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                        style={INPUT_STYLE}
                      />
                    </div>
                  </div>

                  <div
                    className="rounded-lg px-3 py-2.5 text-sm"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    {structuredTitle || 'Nhap book, test va part hop le'}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Ten bai nghe
                  </label>
                  <input
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: IELTS Listening Test 3"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                    style={INPUT_STYLE}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Noi dung
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder={'Paste noi dung bai nghe vao day.\nMoi cau ket thuc bang dau . ! ?'}
                  rows={10}
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none resize-none font-mono"
                  style={INPUT_STYLE}
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Phat hien ~{parsedCount} cau
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Kiem tra va chinh sua tung cau neu can. Moi cau se la mot bai dictation.
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
                  + Them cau
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          {step === 'preview' ? (
            <button
              onClick={() => setStep('input')}
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {'<-'} Quay lai
            </button>
          ) : (
            <button onClick={onClose} className="text-sm" style={{ color: 'var(--text-muted)' }}>Huy</button>
          )}

          {step === 'input' ? (
            <button
              onClick={toPreview}
              disabled={!canPreview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              Xem truoc
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={create}
              disabled={saving || sentences.filter(s => s.trim()).length === 0}
              className="px-5 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Dang tao...' : `Tao bai (${sentences.filter(s => s.trim()).length} cau)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
