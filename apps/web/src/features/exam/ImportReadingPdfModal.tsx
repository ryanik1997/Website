import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X, Upload, Loader2, FileText, AlertCircle, Check, BookOpen,
} from 'lucide-react'
import {
  AI_PROVIDERS,
  parseReadingPdfFull,
  READING_PDF_MAX_BYTES,
  validateReadingImport,
  type AIProvider,
  type ParsedReadingPart,
  type ParseProgressEvent,
  type ReadingImportValidation,
} from '@ryan/core'
import { examRepo, writingRepo } from '@ryan/db'
import { extractPdfContent, type PdfExtractMethod, type PdfPageContent } from './pdfContent'
import { preloadPdfJs, type ExtractPdfProgress } from './pdfExtract'
import {
  buildImportedReadingExam,
  countInferredAnswers,
  countQuestions,
  defaultExamTitle,
  expectedReadingPartsForLevel,
  parsedPartsToReadingParts,
  readingPdfFormatForLevel,
  titleFromPdfFilename,
} from './importReadingUtils'
import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import { examRecordFromReading } from './examLoader'
import {
  attachPageImagesToParts,
  detectPartPageRanges,
  savePdfPageImages,
  shouldPreservePdfPageImages,
} from './readingPdfPageImages'

interface Props {
  onClose: () => void
  onCreated?: (examId: string) => void
  cambridgeLevel?: CambridgeLevelSlug
}

type Step = 'upload' | 'parsing' | 'preview'

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function isPdfFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.pdf')
    && (file.type === 'application/pdf' || file.type === '')
}

function partQuestionCount(part: ParsedReadingPart): number {
  return part.questionGroups.reduce((sum, g) => sum + g.questions.length, 0)
}

function progressLabel(
  events: ParseProgressEvent[],
  extractProgress?: ExtractPdfProgress | null,
): string {
  const last = events[events.length - 1]
  if (!last) return 'Đang khởi tạo…'
  if (last.phase === 'extract') {
    if (last.status === 'done') return 'Đã đọc PDF — đang gọi AI…'
    if (extractProgress?.stage === 'loading-lib') return 'Đang tải thư viện PDF…'
    if (extractProgress?.stage === 'opening') return 'Đang mở file PDF…'
    if (extractProgress?.stage === 'reading' && extractProgress.page && extractProgress.total) {
      return `Đang đọc PDF… trang ${extractProgress.page}/${extractProgress.total}`
    }
    return 'Đang đọc PDF…'
  }
  if (last.phase === 'full' && last.status === 'start') return 'Đang phân tích full test…'
  if (last.phase === 'full' && last.status === 'error') return 'Full test lỗi — chuyển parse từng part…'
  if (last.phase === 'part') {
    if (last.status === 'start') return `Đang phân tích Part ${last.partNumber}…`
    if (last.status === 'done') return `Part ${last.partNumber} xong`
    if (last.status === 'skip') return `Bỏ qua Part ${last.partNumber} (thiếu text)`
    if (last.status === 'error') return `Part ${last.partNumber} lỗi — thử part khác…`
  }
  return 'Đang xử lý…'
}

function methodLabel(method: PdfExtractMethod | null): string {
  if (method === 'vision-ocr') return 'Vision OCR (PDF scan)'
  if (method === 'text-layer') return 'Text layer'
  return ''
}

export default function ImportReadingPdfModal({ onClose, onCreated, cambridgeLevel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [extractedChars, setExtractedChars] = useState(0)
  const [extractMethod, setExtractMethod] = useState<PdfExtractMethod | null>(null)
  const [extractedPages, setExtractedPages] = useState<PdfPageContent[]>([])
  const [parsedParts, setParsedParts] = useState<ParsedReadingPart[]>([])
  const [validation, setValidation] = useState<ReadingImportValidation | null>(null)
  const [previewPartIndex, setPreviewPartIndex] = useState(0)
  const [showInferredOnly, setShowInferredOnly] = useState(false)
  const [parseProgress, setParseProgress] = useState<ParseProgressEvent[]>([])
  const [visionProgress, setVisionProgress] = useState('')
  const [extractProgress, setExtractProgress] = useState<ExtractPdfProgress | null>(null)
  const [error, setError] = useState('')
  const [providerUsed, setProviderUsed] = useState<AIProvider | null>(null)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const pickFile = useCallback((next: File) => {
    setError('')
    if (!isPdfFile(next)) {
      setError('Chỉ hỗ trợ file PDF (.pdf).')
      return
    }
    if (next.size > READING_PDF_MAX_BYTES) {
      setError(`File quá lớn — tối đa ${formatBytes(READING_PDF_MAX_BYTES)}.`)
      return
    }
    setFile(next)
    setTitle(prev => prev.trim() || titleFromPdfFilename(next.name))
    setParsedParts([])
    setValidation(null)
    setPreviewPartIndex(0)
    setExtractedChars(0)
    setExtractMethod(null)
    setExtractedPages([])
    setProviderUsed(null)
    setParseProgress([])
    setVisionProgress('')
    setExtractProgress(null)
    setStep('upload')
  }, [])

  useEffect(() => {
    preloadPdfJs()
  }, [])

  async function runParse() {
    if (!file) return
    setError('')
    setStep('parsing')
    setParseProgress([])
    setExtractProgress(null)

    try {
      const preferred = ((await writingRepo.getSetting('ai_provider')) as AIProvider) ?? 'openai'
      const apiKey = ((await writingRepo.getSetting(`ai_key_${preferred}`)) as string) ?? ''
      if (!apiKey.trim()) {
        setError('Cần API key AI. Vào Cài đặt → AI (OpenAI, Gemini hoặc Groq).')
        setStep('upload')
        return
      }

      setParseProgress([{ phase: 'extract', status: 'start' }])
      const pdfFormat = readingPdfFormatForLevel(cambridgeLevel)
      const { text, method, pages } = await extractPdfContent(file, {
        apiKey,
        provider: preferred,
        preservePageImages: shouldPreservePdfPageImages(pdfFormat),
        onPageProgress: setExtractProgress,
        onVisionProgress: (done, total) => setVisionProgress(`Vision OCR: ${done}/${total} trang`),
      })
      setExtractProgress(null)
      setParseProgress(prev => [...prev, { phase: 'extract', status: 'done' }])
      setExtractedChars(text.length)
      setExtractMethod(method)
      setExtractedPages(pages)
      const parts = await parseReadingPdfFull(text, apiKey, preferred, event => {
        setParseProgress(prev => [...prev, event])
      }, { format: pdfFormat })
      await writingRepo.recordUsage('reading_pdf_import', Math.ceil(text.length / 4))

      setParsedParts(parts)
      setValidation(validateReadingImport(parts, pdfFormat))
      setPreviewPartIndex(0)
      setProviderUsed(preferred)
      setTitle(prev => prev.trim() || defaultExamTitle(parts))
      setStep('preview')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Không thể phân tích PDF.')
      setStep('upload')
    }
  }

  async function saveExam() {
    if (!parsedParts.length || !file || !validation?.canSave) return
    setSaving(true)
    setError('')

    try {
      const examId = `reading-pdf-${crypto.randomUUID()}`
      const pdfFormat = readingPdfFormatForLevel(cambridgeLevel)
      let parts = parsedPartsToReadingParts(examId, parsedParts)

      const pagesWithImages = extractedPages.filter(p => p.dataUrl)
      if (pagesWithImages.length > 0) {
        const pageKeys = await savePdfPageImages(examId, pagesWithImages)
        const partPageRanges = detectPartPageRanges(pagesWithImages, pdfFormat)
        parts = attachPageImagesToParts(parts, pageKeys, partPageRanges, {
          format: pdfFormat,
          forcePart1Images: pdfFormat === 'ket-a2' || extractMethod === 'vision-ocr',
        })
      }

      const exam = buildImportedReadingExam(
        examId,
        title.trim() || defaultExamTitle(parsedParts),
        parts,
        file.name,
        cambridgeLevel
          ? { examTrack: 'cambridge', cambridgeLevel }
          : { examTrack: 'ielts' },
      )

      await examRepo.create(examRecordFromReading(exam, 'pdf', file.name))
      onCreated?.(examId)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Không thể lưu đề.')
    } finally {
      setSaving(false)
    }
  }

  const questionCount = countQuestions(parsedParts)
  const inferredCount = countInferredAnswers(parsedParts)
  const pageImageCount = extractedPages.filter(p => p.dataUrl).length
  const previewPart = parsedParts[previewPartIndex] ?? null

  const filteredGroups = previewPart?.questionGroups.map(group => ({
    ...group,
    questions: showInferredOnly
      ? group.questions.filter(q => q.answerConfidence === 'inferred')
      : group.questions,
  })).filter(g => g.questions.length > 0) ?? []

  const previewQuestionCount = filteredGroups.reduce((s, g) => s + g.questions.length, 0)
  const expectedPartCount = expectedReadingPartsForLevel(cambridgeLevel)
  const hasFullTest = parsedParts.length >= expectedPartCount

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 45%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4 shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Import PDF Reading
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 'upload' && (
            <>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {cambridgeLevel === 'a2'
                  ? 'Upload PDF KET A2 → AI trích câu hỏi + giữ ảnh trang làm đề bài (passage fallback). PDF scan: Vision OCR từng trang.'
                  : cambridgeLevel === 'b1'
                    ? 'Upload PDF PET B1 → AI trích câu hỏi + giữ ảnh trang khi passage yếu. PDF scan: Vision OCR.'
                    : 'Upload PDF → trích Part 1–3 bằng AI. PDF scan tự động dùng Vision OCR (OpenAI/Gemini).'}
              </p>

              <div
                role="button"
                tabIndex={0}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const dropped = e.dataTransfer.files[0]
                  if (dropped) pickFile(dropped)
                }}
                onClick={() => inputRef.current?.click()}
                onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.click() }}
                className="rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors"
                style={{
                  borderColor: dragOver ? 'var(--color-primary)' : 'var(--border-color)',
                  background: dragOver
                    ? 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-card))'
                    : 'var(--bg-secondary)',
                }}
              >
                <Upload size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Kéo thả PDF hoặc bấm để chọn
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Tối đa {formatBytes(READING_PDF_MAX_BYTES)} · text layer hoặc scan (Vision)
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) pickFile(f)
                  }}
                />
              </div>

              {file && (
                <div
                  className="mt-4 flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}
                >
                  <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {file.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatBytes(file.size)}</p>
                  </div>
                </div>
              )}

              <label className="block mt-4">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Tên đề (tuỳ chọn)
                </span>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Cambridge 20 — Reading Test 1"
                  className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </label>
            </>
          )}

          {step === 'parsing' && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {progressLabel(parseProgress, extractProgress)}
              </p>
              {visionProgress && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{visionProgress}</p>
              )}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {extractProgress
                  ? extractProgress.stage === 'loading-lib'
                    ? 'Lần đầu có thể mất vài giây để tải thư viện PDF…'
                    : 'Đang trích chữ từ PDF…'
                  : parseProgress.some(e => e.phase === 'part' || e.phase === 'full')
                    ? 'DeepSeek/OpenAI đang phân tích — KET/PET có thể mất 1–3 phút (5–6 lần gọi API).'
                    : 'Có thể mất 30–180 giây tùy provider và số part.'}
              </p>
            </div>
          )}

          {step === 'preview' && parsedParts.length > 0 && previewPart && validation && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary) 8%, var(--bg-card))',
                  borderColor: 'color-mix(in srgb, var(--color-primary) 22%, var(--border-color))',
                }}
              >
                <div className="flex items-start gap-2">
                  <Check size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {hasFullTest
                        ? `Đã trích đủ ${expectedPartCount} parts`
                        : `Đã trích ${parsedParts.length} part${parsedParts.length > 1 ? 's' : ''}`}
                      {' · '}
                      <span style={{ color: 'var(--color-primary)' }}>Tin cậy {validation.score}%</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {extractedChars.toLocaleString()} ký tự · {methodLabel(extractMethod)}
                      {pageImageCount > 0 ? ` · ${pageImageCount} ảnh trang` : ''}
                      {extractMethod || pageImageCount > 0 ? ' · ' : ''}
                      {questionCount} câu
                      {inferredCount > 0 ? ` · ${inferredCount} đáp án đoán` : ''}
                      {providerUsed ? ` · ${AI_PROVIDERS.find(p => p.id === providerUsed)?.name}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {(validation.warnings.length > 0 || validation.errors.length > 0) && (
                <div
                  className="rounded-xl border px-3 py-2.5 text-xs space-y-1"
                  style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}
                >
                  {validation.errors.map(msg => (
                    <p key={msg} style={{ color: 'var(--color-accent)' }}>• {msg}</p>
                  ))}
                  {validation.warnings.map(msg => (
                    <p key={msg} style={{ color: 'var(--text-muted)' }}>• {msg}</p>
                  ))}
                </div>
              )}

              <label>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Tên đề
                </span>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                />
              </label>

              <div className="flex flex-wrap gap-2 items-center">
                {parsedParts.map((part, index) => {
                  const qCount = partQuestionCount(part)
                  const active = index === previewPartIndex
                  return (
                    <button
                      key={part.partNumber}
                      type="button"
                      onClick={() => setPreviewPartIndex(index)}
                      className="rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
                      style={{
                        background: active
                          ? 'var(--color-primary)'
                          : 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                        color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
                        border: active ? 'none' : '1px solid var(--border-color)',
                      }}
                    >
                      Part {part.partNumber} · {qCount} câu
                    </button>
                  )
                })}
                {inferredCount > 0 && (
                  <label className="ml-auto flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={showInferredOnly}
                      onChange={e => setShowInferredOnly(e.target.checked)}
                    />
                    Chỉ câu đáp án đoán
                  </label>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                  Passage — Part {previewPart.partNumber}
                </p>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {previewPart.passageTitle}
                </h3>
                {previewPart.passageSubtitle && (
                  <p className="text-sm italic mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {previewPart.passageSubtitle}
                  </p>
                )}
                <div
                  className="mt-2 max-h-36 overflow-y-auto rounded-lg border p-3 text-sm leading-relaxed"
                  style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  {previewPart.passage.map((block, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {block.label && <span className="font-bold mr-1">{block.label}</span>}
                      {block.text}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                  Câu hỏi Part {previewPart.partNumber} ({previewQuestionCount})
                </p>
                <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
                  {filteredGroups.map(group => (
                    <div key={group.range}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                        {group.range}
                      </p>
                      {group.questions.map(q => (
                        <p key={q.number} className="text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>
                          <span className="font-bold">{q.number}.</span> {q.prompt}
                          {q.answerConfidence === 'inferred' && (
                            <span className="reading-test-inferred-badge">Đoán</span>
                          )}
                        </p>
                      ))}
                    </div>
                  ))}
                  {showInferredOnly && previewQuestionCount === 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Không có câu đáp án đoán trong part này.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-accent) 35%, var(--border-color))',
                background: 'color-mix(in srgb, var(--color-accent) 10%, var(--bg-card))',
                color: 'var(--text-primary)',
              }}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
              <span>{error}</span>
            </div>
          )}

          {step === 'upload' && !error.includes('API key') && (
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Cần API key trong{' '}
              <Link to="/app/settings?tab=ai" className="underline" style={{ color: 'var(--color-primary)' }}>
                Cài đặt → AI
              </Link>
              . OpenAI/Gemini cho full test + scan; Groq chỉ text layer ngắn.
            </p>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-4 shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            Huỷ
          </button>

          {step === 'upload' && (
            <button
              type="button"
              disabled={!file}
              onClick={() => void runParse()}
              className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              Phân tích
            </button>
          )}

          {step === 'preview' && (
            <button
              type="button"
              disabled={saving || !validation?.canSave}
              onClick={() => void saveExam()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Lưu & làm bài
            </button>
          )}
        </div>
      </div>
    </div>
  )
}