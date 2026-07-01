import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X, Upload, Loader2, ChevronRight, AlertCircle, Headphones, Check,
} from 'lucide-react'
import {
  AI_PROVIDERS,
  transcribeAudio,
  resolveTranscribeCredentials,
  transcribeProviderLabel,
  TRANSCRIBE_MAX_BYTES,
  type AIProvider,
  type TranscribeProvider,
} from '@ryan/core'
import { audioRepo, lessonRepo, writingRepo } from '@ryan/db'
import { defaultSentence, splitIntoSentences } from './types'

interface Props {
  onClose: () => void
  onCreated?: (lessonId: string) => void
}

type Step = 'upload' | 'transcribing' | 'preview'

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function titleFromFilename(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

function isMp3File(file: File): boolean {
  const ext = file.name.toLowerCase().endsWith('.mp3')
  const mime = file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.type === ''
  return ext && mime
}

export default function ImportAudioModal({ onClose, onCreated }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [sentences, setSentences] = useState<string[]>([])
  const [error, setError] = useState('')
  const [providerUsed, setProviderUsed] = useState<TranscribeProvider | null>(null)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const pickFile = useCallback((next: File) => {
    setError('')
    if (!isMp3File(next)) {
      setError('Chỉ hỗ trợ file MP3 (.mp3).')
      return
    }
    if (next.size > TRANSCRIBE_MAX_BYTES) {
      setError(`File quá lớn — tối đa ${formatBytes(TRANSCRIBE_MAX_BYTES)}.`)
      return
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setFile(next)
    setAudioUrl(URL.createObjectURL(next))
    setTitle(prev => prev.trim() || titleFromFilename(next.name))
    setTranscript('')
    setSentences([])
    setProviderUsed(null)
    setStep('upload')
  }, [audioUrl])

  async function runTranscribe() {
    if (!file) return
    setError('')
    setStep('transcribing')

    try {
      const preferred = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
      const keys: Partial<Record<AIProvider, string>> = {}
      for (const p of AI_PROVIDERS) {
        keys[p.id] = ((await writingRepo.getSetting(`ai_key_${p.id}`)) as string) ?? ''
      }

      const creds = resolveTranscribeCredentials(preferred, keys)
      if (!creds) {
        setError(
          'Cần API key OpenAI hoặc Groq để phiên âm. Vào Cài đặt → AI và nhập key (Groq miễn phí khuyến nghị).',
        )
        setStep('upload')
        return
      }

      const { text } = await transcribeAudio(file, creds.apiKey, creds.provider, file.name)
      const parsed = splitIntoSentences(text)
      const finalSentences = parsed.length > 0 ? parsed : [text]

      await writingRepo.recordUsage('listening_transcribe', Math.ceil(text.length / 4))

      setProviderUsed(creds.provider)
      setTranscript(text)
      setSentences(finalSentences)
      setStep('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 320) : 'Phiên âm thất bại.')
      setStep('upload')
    }
  }

  async function createLesson() {
    const clean = sentences.map(s => s.trim()).filter(Boolean)
    if (!title.trim() || !clean.length || !file) return
    setSaving(true)
    setError('')
    try {
      const lesson = await lessonRepo.create({
        category: 'user',
        title: title.trim(),
        sentences: clean.map(defaultSentence),
        source: 'whisper',
      })
      await audioRepo.put(audioRepo.lessonKey(lesson.id), file)
      onCreated?.(lesson.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tạo được bài nghe.')
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
        className="w-full max-w-2xl rounded-xl shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Import & Phiên âm
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Tải MP3 → AI chuyển thành text → tạo bài dictation
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div
              className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm mb-4"
              style={{
                background: 'color-mix(in srgb, var(--color-accent) 12%, var(--bg-secondary))',
                color: 'var(--color-accent)',
                border: '1px solid color-mix(in srgb, var(--color-accent) 25%, var(--border-color))',
              }}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                {error}
                {error.includes('Cài đặt') && (
                  <>
                    {' '}
                    <Link to="/app/settings?tab=ai" className="underline font-semibold" onClick={onClose}>
                      Mở Cài đặt AI
                    </Link>
                  </>
                )}
              </span>
            </div>
          )}

          {step === 'transcribing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Đang phiên âm audio...
              </p>
              <p className="text-xs text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
                Dùng Whisper API (OpenAI hoặc Groq). File dài có thể mất vài phút.
              </p>
            </div>
          )}

          {step === 'upload' && (
            <div className="flex flex-col gap-4">
              <div
                role="button"
                tabIndex={0}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const f = e.dataTransfer.files[0]
                  if (f) pickFile(f)
                }}
                onClick={() => inputRef.current?.click()}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
                className="flex flex-col items-center justify-center gap-3 py-10 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
                style={{
                  borderColor: dragOver ? 'var(--color-primary)' : 'var(--border-color)',
                  background: dragOver
                    ? 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-secondary))'
                    : 'var(--bg-secondary)',
                }}
              >
                <Upload size={28} style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Kéo thả file MP3 hoặc bấm để chọn
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Tối đa {formatBytes(TRANSCRIBE_MAX_BYTES)} · Tiếng Anh
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="audio/mpeg,.mp3"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) pickFile(f)
                    e.target.value = ''
                  }}
                />
              </div>

              {file && audioUrl && (
                <div
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-2">
                    <Headphones size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                      {file.name}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatBytes(file.size)}
                    </span>
                  </div>
                  <audio controls src={audioUrl} className="w-full h-9" />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Tên bài nghe
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: IELTS Listening Test 2"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={INPUT_STYLE}
                />
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Cần API key <strong style={{ color: 'var(--text-primary)' }}>Groq</strong> hoặc{' '}
                <strong style={{ color: 'var(--text-primary)' }}>OpenAI</strong> trong{' '}
                <Link to="/app/settings?tab=ai" className="underline" onClick={onClose}>
                  Cài đặt → AI
                </Link>
                . Groq Whisper miễn phí, nhanh.
              </p>
            </div>
          )}

          {step === 'preview' && (
            <div>
              {providerUsed && (
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
                  style={{
                    background: 'color-mix(in srgb, var(--color-primary) 14%, var(--bg-secondary))',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Check size={12} />
                  {transcribeProviderLabel(providerUsed)} · {sentences.length} câu
                </p>
              )}

              <details className="mb-4">
                <summary
                  className="text-xs font-semibold cursor-pointer uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Xem transcript đầy đủ
                </summary>
                <p
                  className="mt-2 text-sm leading-relaxed p-3 rounded-lg select-text"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {transcript}
                </p>
              </details>

              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Chỉnh sửa từng câu trước khi tạo bài dictation.
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
                      type="button"
                      onClick={() => setSentences(ss => ss.filter((_, j) => j !== i))}
                      className="mt-2 p-1 rounded shrink-0"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
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

        <div
          className="flex justify-between items-center px-6 py-4 border-t shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {step === 'preview' ? (
            <button
              type="button"
              onClick={() => setStep('upload')}
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

          {step === 'upload' && (
            <button
              type="button"
              onClick={() => void runTranscribe()}
              disabled={!file || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              Phiên âm
              <ChevronRight size={14} />
            </button>
          )}

          {step === 'preview' && (
            <button
              type="button"
              onClick={() => void createLesson()}
              disabled={saving || sentences.filter(s => s.trim()).length === 0 || !title.trim()}
              className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              {saving ? 'Đang tạo...' : `Tạo bài (${sentences.filter(s => s.trim()).length} câu)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}