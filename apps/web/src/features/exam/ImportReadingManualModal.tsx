import { useCallback, useRef, useState } from 'react'
import { X, Upload, Loader2, FileJson, AlertCircle, Check, BookOpen, Download, Archive } from 'lucide-react'
import { examRepo } from '@ryan/db'
import { examRecordFromReading } from './examLoader'
import { extractReadingZip } from './importReadingZip'
import {
  buildReadingExamFromImport,
  countReadingImportQuestions,
  isReadingJsonFile,
  isReadingMediaFile,
  READING_IMPORT_MAX_JSON_BYTES,
  READING_IMPORT_MAX_MEDIA_BYTES,
  readingImportTemplate,
  parseReadingImportJson,
  validateReadingManualImport,
  type ReadingImportPayload,
} from './importReadingManualUtils'
import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import {
  cambridgeImportGuideLines,
  cambridgeImportGuideNote,
} from './cambridgeReadingImportTemplates'
import type { ReadingExamTrack } from './examData'

interface Props {
  onClose: () => void
  onCreated?: (examId: string) => void
  examTrack?: ReadingExamTrack
  cambridgeLevel?: CambridgeLevelSlug
}

type Step = 'upload' | 'preview' | 'saving'

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function ImportReadingManualModal({
  onClose,
  onCreated,
  examTrack = 'ielts',
  cambridgeLevel,
}: Props) {
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [payload, setPayload] = useState<ReadingImportPayload | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)

  const processJson = useCallback(async (file: File) => {
    setError(null)
    if (file.size > READING_IMPORT_MAX_JSON_BYTES) {
      setError(`JSON quá lớn (tối đa ${formatBytes(READING_IMPORT_MAX_JSON_BYTES)}).`)
      return
    }
    try {
      const text = await file.text()
      const parsed = parseReadingImportJson(text)
      setJsonFile(file)
      setSourceLabel(file.name)
      setPayload(parsed)
      setWarnings(validateReadingManualImport(parsed))
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đọc được JSON.')
    }
  }, [])

  const addMediaFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter(isReadingMediaFile)
    const totalSize = list.reduce((s, f) => s + f.size, mediaFiles.reduce((s, f) => s + f.size, 0))
    if (totalSize > READING_IMPORT_MAX_MEDIA_BYTES) {
      setError(`Ảnh quá lớn (tối đa ${formatBytes(READING_IMPORT_MAX_MEDIA_BYTES)}).`)
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
      const bundle = await extractReadingZip(file)
      setJsonFile(bundle.jsonFile)
      setSourceLabel(bundle.zipName)
      setPayload(bundle.payload)
      setMediaFiles(bundle.mediaFiles)
      setWarnings(validateReadingManualImport(bundle.payload))
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
      const exam = await buildReadingExamFromImport(payload, mediaFiles)
      if (!exam.examTrack && examTrack) exam.examTrack = examTrack
      if (!exam.cambridgeLevel && cambridgeLevel) exam.cambridgeLevel = cambridgeLevel
      await examRepo.create(examRecordFromReading(exam, 'manual', sourceLabel ?? jsonFile?.name))
      onCreated?.(exam.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu đề thất bại.')
      setStep('preview')
    } finally {
      setSaving(false)
    }
  }

  function downloadTemplate() {
    const json = JSON.stringify(readingImportTemplate(examTrack, cambridgeLevel), null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reading-manual-${examTrack}${cambridgeLevel ? `-${cambridgeLevel}` : ''}-template.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const qCount = payload ? countReadingImportQuestions(payload) : 0
  const imageCount = mediaFiles.length

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
            <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Import thủ công Reading
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
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cách import Reading</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>Bấm <strong>Tải JSON mẫu</strong> → mở bằng Notepad/VS Code.</li>
                  <li><strong>Part 1 (A2/B1 signs):</strong> có thể dùng ảnh <code>part1-page.jpg</code>.</li>
                  <li><strong>Part còn lại (A2–C2):</strong> copy text từ PDF vào <code>passage[].text</code> — cần text để <strong>Highlight</strong>.</li>
                  <li>Điền câu hỏi + đáp án vào <code>questionGroups</code>.</li>
                  <li>Upload JSON (+ ảnh Part 1 nếu có) hoặc ZIP → Preview → <strong>Lưu & làm bài</strong>.</li>
                </ol>
                <p className="text-xs pt-1">
                  {cambridgeImportGuideNote(cambridgeLevel)}
                  {' '}Chỉ ảnh không Highlight được.
                </p>
                {cambridgeLevel && (
                  <ul className="text-xs space-y-1 pt-2 list-disc list-inside leading-relaxed">
                    {cambridgeImportGuideLines(cambridgeLevel).map(line => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-xs font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <Download size={14} />
                Tải JSON mẫu
              </button>

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
                  exam.json + part1-p1.jpg + …
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
                  Chọn file JSON đề Reading
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {jsonFile ? jsonFile.name : 'reading-manual.json'}
                </p>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f && isReadingJsonFile(f)) void processJson(f)
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
                  Thêm ảnh đoạn văn (tuỳ chọn)
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {mediaFiles.length > 0
                    ? `${mediaFiles.length} ảnh · ${formatBytes(mediaFiles.reduce((s, f) => s + f.size, 0))}`
                    : 'part1-p0.jpg, part1-p1.webp…'}
                </p>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
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
                  {payload.examTrack?.toUpperCase() ?? examTrack.toUpperCase()}
                  {payload.cambridgeLevel ? ` · ${payload.cambridgeLevel.toUpperCase()}` : ''}
                  {' · '}{qCount} câu · {payload.durationMinutes} phút · {imageCount} ảnh
                </p>
              </div>

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
                {payload.parts.map(part => {
                  const passageBlocks = part.passage?.length ?? 0
                  const partQuestions = part.questionGroups.reduce((s, g) => s + g.questions.length, 0)
                  const imageRefs = (part.passage ?? []).filter(b => b.imageFile).length
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
                        {' '}— {part.passageTitle} · {partQuestions} câu · {passageBlocks} khối văn bản
                        {imageRefs > 0 ? ` · ${imageRefs} ảnh trong JSON` : ''}
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
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang lưu đề và ảnh…</p>
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
              disabled={saving || qCount === 0}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              onClick={() => void handleSave()}
            >
              <Check size={16} />
              Lưu & làm bài
            </button>
          )}
        </div>
      </div>
    </div>
  )
}