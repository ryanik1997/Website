import { useState } from 'react'
import { X, AlertTriangle, CheckCircle2, LoaderCircle } from 'lucide-react'
import { formatImportSummary, importBackup } from './backupRestore'

interface Props {
  file: File
  onClose: () => void
}

type Step = 'confirm' | 'importing' | 'success' | 'error'

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

export default function ConfirmRestoreModal({ file, onClose }: Props) {
  const [step, setStep] = useState<Step>('confirm')
  const [summary, setSummary] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function confirmImport() {
    setStep('importing')
    setError(null)
    try {
      const { counts } = await importBackup(file)
      setSummary(formatImportSummary(counts))
      setStep('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nhập backup thất bại')
      setStep('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--text-primary) 40%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nhập backup
          </h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {step === 'importing' ? (
            <div className="py-8 flex flex-col items-center gap-3">
              <LoaderCircle size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang nhập…</p>
            </div>
          ) : step === 'success' ? (
            <div className="py-4 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 size={40} style={{ color: 'var(--color-primary)' }} />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nhập backup thành công!</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Đã nhập: {summary}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {file.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatFileSize(file.size)}
                </p>
              </div>

              <div
                className="flex gap-3 px-3 py-3 rounded-xl"
                style={{
                  background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)',
                }}
              >
                <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  Dữ liệu từ file sẽ được <strong>MERGE</strong> vào dữ liệu hiện tại (không xóa data cũ).
                </p>
              </div>

              {step === 'error' && error && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{
                    background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => void confirmImport()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                >
                  Xác nhận nhập
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}