import { useRef, useState } from 'react'
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  Check,
  FileText,
  Headphones,
  ChevronRight,
} from 'lucide-react'
import { listeningExamRepo } from '@ryan/db'
import { extractDocxContent } from './docxExtract'
import { buildListeningPayloadFromDocx } from './ieltsListeningDocxImport'
import {
  buildListeningExamFromImport,
  countListeningImportQuestions,
  validateListeningImport,
  validateListeningImportMedia,
  type ListeningImportPayload,
} from './importListeningUtils'
import { examRecordFromListening } from './listeningExamLoader'
import './ieltsListeningWizard/ieltsListeningWizard.css'

interface Props {
  onClose: () => void
  onCreated?: (examId: string) => void
}

type Step = 'setup' | 'preview' | 'saving'

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function ImportListeningWordModal({ onClose, onCreated }: Props) {
  const docxInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('setup')
  const [title, setTitle] = useState('IELTS Listening — Cambridge 11 Test 1')
  const [cambridge, setCambridge] = useState('11')
  const [test, setTest] = useState('1')
  const [answerKey, setAnswerKey] = useState('')
  const [docxFile, setDocxFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [payload, setPayload] = useState<ListeningImportPayload | null>(null)
  const [extraMedia, setExtraMedia] = useState<File[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleParse() {
    setError(null)
    if (!docxFile) {
      setError('Chọn file Word (.docx).')
      return
    }
    if (!answerKey.trim()) {
      setError('Dán Answer Key 1–40.')
      return
    }

    setParsing(true)
    try {
      const content = await extractDocxContent(docxFile)
      const result = buildListeningPayloadFromDocx(content, {
        title,
        cambridge,
        test,
        answerKey,
      })
      setPayload(result.payload)
      setExtraMedia(result.mediaFiles)
      setWarnings([
        ...result.warnings,
        ...validateListeningImport(result.payload),
        ...validateListeningImportMedia(result.payload, [
          ...(audioFile ? [audioFile] : []),
          ...result.mediaFiles,
        ]),
      ])
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đọc được file Word.')
    } finally {
      setParsing(false)
    }
  }

  async function handleSave() {
    if (!payload) return
    setSaving(true)
    setStep('saving')
    setError(null)
    try {
      const media = [
        ...(audioFile ? [audioFile] : []),
        ...extraMedia,
      ]
      const exam = await buildListeningExamFromImport(payload, media)
      const label = `word-cam${cambridge}-test${test}`
      await listeningExamRepo.create(examRecordFromListening(exam, 'import', label))
      onCreated?.(exam.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu đề thất bại.')
      setStep('preview')
    } finally {
      setSaving(false)
    }
  }

  const qCount = payload ? countListeningImportQuestions(payload) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 45%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Import Word — IELTS Listening
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Lưu đề ngay từ .docx · không AI · khác <strong>Import Wizard</strong> (có nút Import DOCX)
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:opacity-80">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'setup' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Word cần có <strong>SECTION 1–4</strong> (hoặc Questions 1–10 / 11–20 / …).
                Gap đánh dấu bằng <code>___</code> hoặc <code>[1]</code>. Ảnh map/diagram nhúng trong Word.
                Không dùng AI — giữ nguyên từng dòng như file Word.
              </p>

              <div className="ielts-wizard-meta-row">
                <div className="ielts-wizard-field">
                  <label htmlFor="word-title">Tiêu đề</label>
                  <input id="word-title" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="ielts-wizard-field">
                  <label htmlFor="word-cam">Cam</label>
                  <input id="word-cam" value={cambridge} onChange={e => setCambridge(e.target.value)} inputMode="numeric" />
                </div>
                <div className="ielts-wizard-field">
                  <label htmlFor="word-test">Test</label>
                  <input id="word-test" value={test} onChange={e => setTest(e.target.value)} inputMode="numeric" />
                </div>
              </div>

              <div
                className="rounded-xl border border-dashed p-5 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => docxInputRef.current?.click()}
              >
                <Upload size={22} className="mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {docxFile ? docxFile.name : 'Chọn file Word (.docx)'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {docxFile ? formatBytes(docxFile.size) : 'Đề đủ 4 parts + ảnh nhúng'}
                </p>
                <input
                  ref={docxInputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={e => setDocxFile(e.target.files?.[0] ?? null)}
                />
              </div>

              <div className="ielts-wizard-field">
                <label htmlFor="word-key">Answer Key — câu 1–40</label>
                <textarea
                  id="word-key"
                  className="ielts-wizard-textarea"
                  style={{ minHeight: '8rem' }}
                  value={answerKey}
                  onChange={e => setAnswerKey(e.target.value)}
                  placeholder={'1 charlton\n2 115\n…\n40 consumption'}
                />
              </div>

              <div
                className="rounded-xl border border-dashed p-4 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => audioInputRef.current?.click()}
              >
                <Headphones size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {audioFile ? audioFile.name : 'Upload listening.mp3 (bắt buộc khi lưu)'}
                </p>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  className="hidden"
                  onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {error && (
                <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-accent)' }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </p>
              )}
            </div>
          )}

          {step === 'preview' && payload && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{payload.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {payload.bandHint} · {qCount}/40 câu · {payload.parts.length} parts
                  {audioFile ? ` · ${audioFile.name}` : ' · (chưa có audio)'}
                  {extraMedia.length ? ` · ${extraMedia.length} ảnh từ Word` : ''}
                </p>
              </div>

              {warnings.length > 0 && (
                <div
                  className="rounded-xl border p-3 text-xs space-y-1 max-h-40 overflow-y-auto"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-accent) 35%, var(--border-color))',
                    color: 'var(--text-muted)',
                  }}
                >
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Ghi chú ({warnings.length})
                  </p>
                  {warnings.map(w => (
                    <p key={w}>• {w}</p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {payload.parts.map(part => {
                  const gaps = part.notePassage?.filter(b => b.type === 'gap').length ?? 0
                  return (
                    <div
                      key={part.partNumber}
                      className="rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Part {part.partNumber}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {` — ${part.questions.length} câu`}
                        {part.passageTitle ? ` · ${part.passageTitle}` : ''}
                        {gaps ? ` · ${gaps} gap` : ''}
                        {part.imageFile ? ` · ${part.imageFile}` : ''}
                      </span>
                    </div>
                  )
                })}
              </div>

              {error && (
                <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p>
              )}
            </div>
          )}

          {step === 'saving' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang lưu đề…</p>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {step === 'preview' && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => setStep('setup')}
            >
              Quay lại
            </button>
          )}

          {step === 'setup' && (
            <button
              type="button"
              disabled={parsing || !docxFile || !answerKey.trim()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              onClick={() => void handleParse()}
            >
              {parsing ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              Phân tích Word
            </button>
          )}

          {step === 'preview' && (
            <button
              type="button"
              disabled={saving || !audioFile || qCount < 30}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              onClick={() => void handleSave()}
              title={!audioFile ? 'Cần listening.mp3' : undefined}
            >
              <Check size={16} />
              Lưu đề
            </button>
          )}
        </div>
      </div>
    </div>
  )
}