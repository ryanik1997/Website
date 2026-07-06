import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Upload, Loader2, FileJson, AlertCircle, Check, Headphones, Download, Archive } from 'lucide-react'
import { listeningExamRepo } from '@ryan/db'
import {
  buildListeningExamFromImport,
  countListeningImportQuestions,
  isListeningJsonFile,
  isListeningMediaFile,
  LISTENING_IMPORT_MAX_JSON_BYTES,
  LISTENING_IMPORT_MAX_MEDIA_BYTES,
  listeningImportTemplate,
  parseListeningImportJson,
  checkListeningImportMedia,
  validateListeningImport,
  validateListeningImportMedia,
  type ListeningImportPayload,
} from './importListeningUtils'
import { extractListeningZip } from './importListeningZip'
import { examRecordFromListening } from './listeningExamLoader'
import type { ListeningExamType } from './listeningExamData'
import {
  buildIeltsListeningImportTemplate,
  downloadJsonTemplate,
  ieltsListeningTemplateFilename,
  type IeltsListeningTemplateKind,
} from './ieltsListeningImportTemplates'
import {
  buildIeltsListeningP2Template,
  ieltsListeningP2TemplateFilename,
  type IeltsListeningP2TemplateKind,
} from './ieltsListeningP2Templates'
import {
  buildIeltsListeningP3Template,
  ieltsListeningP3TemplateFilename,
  type IeltsListeningP3TemplateKind,
} from './ieltsListeningP3Templates'
import {
  buildIeltsListeningP4Template,
  ieltsListeningP4TemplateFilename,
  type IeltsListeningP4TemplateKind,
} from './ieltsListeningP4Templates'

interface Props {
  onClose: () => void
  onCreated?: (examId: string) => void
  defaultExamType?: ListeningExamType
}

type Step = 'upload' | 'preview' | 'saving'

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function ImportListeningModal({ onClose, onCreated, defaultExamType = 'ket' }: Props) {
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [payload, setPayload] = useState<ListeningImportPayload | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)

  const processJson = useCallback(async (file: File) => {
    setError(null)
    if (file.size > LISTENING_IMPORT_MAX_JSON_BYTES) {
      setError(`JSON quá lớn (tối đa ${formatBytes(LISTENING_IMPORT_MAX_JSON_BYTES)}).`)
      return
    }
    try {
      const text = await file.text()
      const parsed = parseListeningImportJson(text)
      setJsonFile(file)
      setSourceLabel(file.name)
      setPayload(parsed)
      setWarnings([
        ...validateListeningImport(parsed),
        ...validateListeningImportMedia(parsed, mediaFiles),
      ])
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đọc được JSON.')
    }
  }, [])

  const addMediaFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter(isListeningMediaFile)
    const totalSize = list.reduce((s, f) => s + f.size, mediaFiles.reduce((s, f) => s + f.size, 0))
    if (totalSize > LISTENING_IMPORT_MAX_MEDIA_BYTES) {
      setError(`Media quá lớn (tối đa ${formatBytes(LISTENING_IMPORT_MAX_MEDIA_BYTES)}).`)
      return
    }
    setMediaFiles(prev => {
      const map = new Map(prev.map(f => [f.name.toLowerCase(), f]))
      for (const f of list) map.set(f.name.toLowerCase(), f)
      return Array.from(map.values())
    })
    setError(null)
  }, [mediaFiles])

  const processZip = useCallback(async (file: File) => {
    setError(null)
    try {
      const bundle = await extractListeningZip(file)
      setJsonFile(bundle.jsonFile)
      setSourceLabel(bundle.zipName)
      setPayload(bundle.payload)
      setMediaFiles(bundle.mediaFiles)
      setWarnings([
        ...validateListeningImport(bundle.payload),
        ...validateListeningImportMedia(bundle.payload, bundle.mediaFiles),
      ])
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không giải nén được ZIP.')
    }
  }, [])

  async function handleSave() {
    if (!payload) return
    setSaving(true)
    setStep('saving')
    setError(null)
    try {
      const exam = await buildListeningExamFromImport(payload, mediaFiles)
      await listeningExamRepo.create(examRecordFromListening(exam, 'import', sourceLabel ?? jsonFile?.name))
      onCreated?.(exam.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu đề thất bại.')
      setStep('preview')
    } finally {
      setSaving(false)
    }
  }

  function downloadTemplate(kind?: IeltsListeningTemplateKind) {
    if (defaultExamType === 'ielts' && kind) {
      downloadJsonTemplate(
        buildIeltsListeningImportTemplate(kind),
        ieltsListeningTemplateFilename(kind),
      )
      return
    }
    downloadJsonTemplate(
      listeningImportTemplate(defaultExamType),
      `listening-import-${defaultExamType}-template.json`,
    )
  }

  function downloadP2Template(kind: IeltsListeningP2TemplateKind) {
    downloadJsonTemplate(
      buildIeltsListeningP2Template(kind),
      ieltsListeningP2TemplateFilename(kind),
    )
  }

  function downloadP3Template(kind: IeltsListeningP3TemplateKind) {
    downloadJsonTemplate(
      buildIeltsListeningP3Template(kind),
      ieltsListeningP3TemplateFilename(kind),
    )
  }

  function downloadP4Template(kind: IeltsListeningP4TemplateKind) {
    downloadJsonTemplate(
      buildIeltsListeningP4Template(kind),
      ieltsListeningP4TemplateFilename(kind),
    )
  }

  const isIelts = defaultExamType === 'ielts'
  const p2TemplateButtons: Array<{ kind: IeltsListeningP2TemplateKind; label: string }> = [
    { kind: 'p2-a6', label: 'a6 Table+MC+Map' },
    { kind: 'p2-a7', label: 'a7 Notes+MC+TWO' },
    { kind: 'p2-a8', label: 'a8 MC+Match+Table' },
    { kind: 'p2-a9', label: 'a9 Diagram+Match' },
    { kind: 'p2-a10', label: 'a10 MC+TWO×2' },
    { kind: 'p2-a11', label: 'a11 Match+MC' },
    { kind: 'p2-a12', label: 'a12 MC+Map' },
    { kind: 'p2-a13', label: 'a13 TWO×2+Match' },
    { kind: 'p2-a14', label: 'a14 MC+Map' },
    { kind: 'p2-a15', label: 'a15 MC+Table' },
  ]
  const p3TemplateButtons: Array<{ kind: IeltsListeningP3TemplateKind; label: string }> = [
    { kind: 'p3-c1', label: 'c1 MC+Sent+Notes' },
    { kind: 'p3-c2', label: 'c2 Notes+Table' },
    { kind: 'p3-c3', label: 'c3 TWO×2+MC' },
    { kind: 'p3-c4', label: 'c4 MC+Match' },
    { kind: 'p3-c5', label: 'c5 TWO×2+Match' },
    { kind: 'p3-c6', label: 'c6 MC+Flow' },
    { kind: 'p3-c7', label: 'c7 Table+Match' },
  ]
  const p4TemplateButtons: Array<{ kind: IeltsListeningP4TemplateKind; label: string }> = [
    { kind: 'p4-d1', label: 'd1 Sections+bullets' },
    { kind: 'p4-d2', label: 'd2 ONE WORD (Cam20)' },
    { kind: 'p4-d3', label: 'd3 Generic lecture' },
    { kind: 'p4-d4', label: 'd4 MC+Notes' },
  ]

  useEffect(() => {
    if (!payload || step !== 'preview') return
    setWarnings([
      ...validateListeningImport(payload),
      ...validateListeningImportMedia(payload, mediaFiles),
    ])
  }, [mediaFiles, payload, step])

  const qCount = payload ? countListeningImportQuestions(payload) : 0
  const mediaChecks = payload ? checkListeningImportMedia(payload, mediaFiles) : []
  const missingRequiredMedia = mediaChecks.filter(m => m.required && !m.found)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 45%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <Headphones size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Import thủ công Listening
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:opacity-80">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'upload' && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl border p-4 text-sm space-y-2"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              >
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cách import Listening</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  {isIelts ? (
                    <>
                      <li>Chọn mẫu JSON theo layout Part 1: form (a3), bảng (a2), <strong>hỗn hợp bảng+Choose TWO</strong> (a4), <strong>MC+điền từ</strong> (a5).</li>
                      <li>Part 1 form → <code>notePassage</code> + <code>notePassageLayout: &quot;form&quot;</code>.</li>
                      <li>Part 1 bảng → <code>noteTable</code> hoặc <code>noteTables[]</code> + layout <code>table</code>.</li>
                      <li>Part 1 hỗn hợp → xếp <code>questions</code> đúng thứ tại: gap → MC/Choose TWO → gap.</li>
                      <li>Audio: <code>listening.mp3</code> (một file ~30 phút cho cả bài).</li>
                      <li><strong>ZIP</strong> = <code>exam.json</code> + <code>listening.mp3</code> cùng cấp.</li>
                      <li>Preview → <strong>Lưu & làm bài</strong>.</li>
                    </>
                  ) : (
                    <>
                      <li>Bấm <strong>Tải JSON mẫu</strong> → điền parts, câu hỏi, đáp án.</li>
                      <li>Thêm file âm thanh: <code>q1.mp3</code>, <code>part1.mp3</code>… (hoặc <code>ttsText</code> nếu không có MP3).</li>
                      <li>Ảnh Part 1: <code>q1.jpg</code> … <code>q5.jpg</code> (mỗi câu 1 ảnh chứa A+B+C).</li>
                      <li>Audio: <code>listening.mp3</code> (một file cho cả bài).</li>
                      <li><strong>ZIP</strong> gồm tất cả file cùng cấp — chỉ đặt file vào <code>Tainguyen/</code> chưa tự import.</li>
                      <li>Preview → <strong>Lưu & làm bài</strong>.</li>
                    </>
                  )}
                </ol>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadTemplate(isIelts ? 'full' : undefined)}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <Download size={14} />
                  {isIelts ? 'Mẫu đủ 4 parts' : 'Tải JSON mẫu'}
                </button>
                {isIelts && (
                  <>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('p1-form')}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <Download size={14} />
                      Part 1 — Form (a3)
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('p1-table')}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <Download size={14} />
                      Part 1 — Bảng (a2)
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('p1-mixed-a4')}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <Download size={14} />
                      Part 1 — Bảng+TWO (a4)
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTemplate('p1-mixed-a5')}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <Download size={14} />
                      Part 1 — MC+Notes (a5)
                    </button>
                  </>
                )}
              </div>

              {isIelts && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Part 2 — mẫu theo Giaodien/Part2-Listening (a6–a14)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p2TemplateButtons.map(({ kind, label }) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => downloadP2Template(kind)}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        <Download size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isIelts && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Part 3 — mẫu theo Giaodien/Part3-Listening (c1–c7)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p3TemplateButtons.map(({ kind, label }) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => downloadP3Template(kind)}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        <Download size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isIelts && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Part 4 — lecture notes (d1–d3)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p4TemplateButtons.map(({ kind, label }) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => downloadP4Template(kind)}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        <Download size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="rounded-xl border border-dashed p-6 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => zipInputRef.current?.click()}
              >
                <Archive size={28} className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Chọn file ZIP bundle
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  exam.json + listening.mp3 + q1.jpg …
                </p>
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) void processZip(f)
                  }}
                />
              </div>

              <div
                className="rounded-xl border border-dashed p-6 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => jsonInputRef.current?.click()}
              >
                <FileJson size={28} className="mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Chọn file JSON đề Listening
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {jsonFile ? jsonFile.name : 'listening-import.json'}
                </p>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f && isListeningJsonFile(f)) void processJson(f)
                  }}
                />
              </div>

              <div
                className="rounded-xl border border-dashed p-5 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => mediaInputRef.current?.click()}
              >
                <Upload size={22} className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Thêm MP3 / ảnh (tuỳ chọn)
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {mediaFiles.length > 0
                    ? `${mediaFiles.length} file · ${formatBytes(mediaFiles.reduce((s, f) => s + f.size, 0))}`
                    : 'Có thể bỏ qua — dùng TTS tạm'}
                </p>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.jpg,.jpeg,.png,.webp,.gif,audio/*,image/*"
                  multiple
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) addMediaFiles(e.target.files)
                  }}
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
                  {payload.examType.toUpperCase()} · {payload.examMode ?? 'practice'} · {qCount} câu ·{' '}
                  {payload.durationMinutes} phút · {mediaFiles.length} file media
                </p>
              </div>

              {mediaChecks.length > 0 && (
                <div
                  className="rounded-xl border p-3 text-xs space-y-1"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    File media trong bundle
                  </p>
                  {mediaChecks.map(item => (
                    <p
                      key={item.label}
                      style={{ color: item.found ? 'var(--color-primary)' : 'var(--color-accent)' }}
                    >
                      {item.found ? '✓' : '✗'} {item.label}
                      {item.required && !item.found ? ' (bắt buộc)' : ''}
                    </p>
                  ))}
                </div>
              )}

              {warnings.length > 0 && (
                <div
                  className="rounded-xl border p-3 text-xs space-y-1"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-accent) 35%, var(--border-color))',
                    color: 'var(--text-muted)',
                  }}
                >
                  {warnings.map(w => (
                    <p key={w}>• {w}</p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {payload.parts.map(part => (
                  <div
                    key={part.partNumber}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Part {part.partNumber}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}> — {part.rangeLabel} · {part.questions.length} câu</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-xs font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onClick={() => mediaInputRef.current?.click()}
              >
                <Upload size={14} />
                Thêm MP3 / ảnh ({mediaFiles.length} file)
              </button>

              {error && (
                <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p>
              )}
            </div>
          )}

          {step === 'saving' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang lưu đề và media…</p>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between gap-2 border-t px-5 py-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Link
            to="/app/settings?tab=ai"
            className="text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
            onClick={onClose}
          >
            Cần TTS? Cài đặt AI
          </Link>
          <div className="flex gap-2">
            {step === 'preview' && (
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onClick={() => setStep('upload')}
              >
                Quay lại
              </button>
            )}
            {step === 'preview' && (
              <button
                type="button"
                disabled={saving || qCount === 0 || missingRequiredMedia.length > 0}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                onClick={() => void handleSave()}
              >
                <Check size={16} />
                Lưu & làm bài
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}