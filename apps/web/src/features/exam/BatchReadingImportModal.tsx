import { useMemo, useRef, useState } from 'react'
import { AlertCircle, Check, Copy, FileArchive, Loader2, Upload, X } from 'lucide-react'
import { importReadingZipBatch, type BatchReadingZipImportItemResult } from './import/batchReadingZipImport'
import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import type { ReadingExamTrack } from './examData'
import { useIsAdmin } from '../auth/useIsAdmin'

interface Props {
  onClose: () => void
  onImported?: () => void
  examTrack?: ReadingExamTrack
  cambridgeLevel?: CambridgeLevelSlug
}

export default function BatchReadingImportModal({
  onClose,
  onImported,
  examTrack = 'cambridge',
  cambridgeLevel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isAdmin = useIsAdmin()
  const [files, setFiles] = useState<File[]>([])
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const [results, setResults] = useState<BatchReadingZipImportItemResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'dry-run' | 'import'>('idle')
  const [error, setError] = useState<string | null>(null)

  const blockingErrors = useMemo(
    () => results.some(result => result.status === 'failed' || result.errors.length > 0),
    [results],
  )
  const tableRows: BatchReadingZipImportItemResult[] = results.length
    ? results
    : files.map(file => ({
      fileName: file.name,
      status: 'pending',
      errors: [],
      warnings: [],
    }))

  function handleFiles(next: FileList | null) {
    const picked = Array.from(next ?? []).filter(file => file.name.toLowerCase().endsWith('.zip'))
    setFiles(picked)
    setResults([])
    setError(null)
  }

  async function runDryRun() {
    if (isAdmin !== true) {
      setError('Bạn không có quyền import hàng loạt.')
      return
    }
    if (!files.length) {
      setError('Chọn ít nhất 1 file ZIP.')
      return
    }
    setIsProcessing(true)
    setPhase('dry-run')
    setError(null)
    try {
      const nextResults = await importReadingZipBatch(files, {
        dryRun: true,
        overwriteExisting,
        examTrack,
        cambridgeLevel,
        publishToCloud: examTrack === 'ielts' && isAdmin === true,
      })
      setResults(nextResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dry-run thất bại.')
    } finally {
      setIsProcessing(false)
    }
  }

  async function runImport() {
    if (isAdmin !== true) {
      setError('Bạn không có quyền import hàng loạt.')
      return
    }
    if (!files.length) {
      setError('Chọn ít nhất 1 file ZIP.')
      return
    }
    setIsProcessing(true)
    setPhase('import')
    setError(null)
    try {
      const nextResults = await importReadingZipBatch(files, {
        dryRun: false,
        overwriteExisting,
        examTrack,
        cambridgeLevel,
        publishToCloud: examTrack === 'ielts' && isAdmin === true,
      })
      setResults(nextResults)
      if (nextResults.some(result => result.status === 'success')) {
        onImported?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import thất bại.')
    } finally {
      setIsProcessing(false)
    }
  }

  async function copyReport() {
    const payload = JSON.stringify(results, null, 2)
    await navigator.clipboard.writeText(payload)
  }

  function downloadReport() {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch-reading-import-report.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 45%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <FileArchive size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Import hàng loạt Reading
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:opacity-80">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={14} />
              Chọn ZIP files
            </button>
            <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={overwriteExisting}
                onChange={event => setOverwriteExisting(event.target.checked)}
              />
              Overwrite existing exams
            </label>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Tổng số file: {files.length}
            </span>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".zip,application/zip"
            className="hidden"
            onChange={event => handleFiles(event.target.files)}
          />

          {files.length > 0 && (
            <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              {files.map(file => file.name).join(' • ')}
            </p>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: '#ef4444', color: '#b91c1c' }}>
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
            <table className="w-full text-left text-sm">
              <thead style={{ background: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-3 py-2">File</th>
                  <th className="px-3 py-2">Exam ID</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(result => (
                  <tr key={result.fileName} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-3 py-2 align-top">{result.fileName}</td>
                    <td className="px-3 py-2 align-top">{result.examId ?? '—'}</td>
                    <td className="px-3 py-2 align-top">
                      {result.status === 'success' && <span style={{ color: '#15803d' }}>Success</span>}
                      {result.status === 'failed' && <span style={{ color: '#b91c1c' }}>Failed</span>}
                      {result.status === 'skipped' && <span style={{ color: '#92400e' }}>Skipped</span>}
                      {result.status === 'pending' && <span style={{ color: 'var(--text-muted)' }}>Pending</span>}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div>{result.message ?? result.errors[0] ?? `${result.questionCount ?? 0} questions`}</div>
                      {result.warnings.length > 0 && (
                        <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {result.warnings[0]}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {phase === 'dry-run' && isProcessing ? 'Đang kiểm tra ZIP...' : null}
            {phase === 'import' && isProcessing ? 'Đang import ZIP...' : null}
            {!isProcessing && results.some(result => result.status === 'success') ? (
              <span className="inline-flex items-center gap-1" style={{ color: '#15803d' }}>
                <Check size={14} />
                Imported {results.filter(result => result.status === 'success').length} file
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={copyReport}
              disabled={!results.length}
            >
              <Copy size={14} />
              Copy report
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={downloadReport}
              disabled={!results.length}
            >
              <FileArchive size={14} />
              Tải report JSON
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={onClose}
              disabled={isProcessing}
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={runDryRun}
              disabled={isProcessing || !files.length}
            >
              {isProcessing && phase === 'dry-run' ? <Loader2 size={14} className="animate-spin" /> : null}
              Kiểm tra trước
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ background: 'var(--color-primary)', color: '#fff', opacity: blockingErrors ? 0.6 : 1 }}
              onClick={runImport}
              disabled={isProcessing || !files.length || blockingErrors}
            >
              {isProcessing && phase === 'import' ? <Loader2 size={14} className="animate-spin" /> : null}
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
