import { useCallback, useRef, useState } from 'react'
import { X, Upload, LoaderCircle, CheckCircle2, Download } from 'lucide-react'
import { cardRepo } from '@ryan/db'
import {
  downloadCSVTemplate,
  parseImportFile,
  type ImportCardRow,
} from './importExport'
import { PosBadge } from './CardBadges'
import './vocabList.css'

interface Props {
  deckId: string
  deckName: string
  onClose: () => void
}

type Step = 'pick' | 'preview' | 'importing' | 'success'

export default function ImportModal({ deckId, deckName, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('pick')
  const [rows, setRows] = useState<ImportCardRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((file: File) => {
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        const parsed = parseImportFile(text, file.name)
        setRows(parsed)
        setStep('preview')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không đọc được file')
        setStep('pick')
      }
    }
    reader.onerror = () => setError('Không đọc được file')
    reader.readAsText(file, 'UTF-8')
  }, [])

  async function runImport() {
    setStep('importing')
    setError(null)
    let count = 0
    try {
      for (const row of rows) {
        await cardRepo.add(deckId, {
          phrase: row.phrase,
          meaning: row.meaning,
          example: row.example,
          ipaUS: row.ipaUS,
          ipaUK: undefined,
          pos: row.pos,
        })
        count++
      }
      setImportedCount(count)
      setStep('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import thất bại')
      setStep('preview')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--text-primary) 40%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Nhập từ vựng
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Vào bộ: {deckName}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1 flex flex-col gap-4">
          {step === 'success' ? (
            <div className="text-center py-6 flex flex-col items-center gap-3">
              <CheckCircle2 size={40} style={{ color: 'var(--color-primary)' }} />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Đã import {importedCount} từ!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
              >
                Đóng
              </button>
            </div>
          ) : step === 'importing' ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <LoaderCircle size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Đang import {rows.length} từ…
              </p>
            </div>
          ) : step === 'preview' ? (
            <>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Tìm thấy {rows.length} từ
              </p>
              {rows.length > 500 && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  Import nhiều có thể mất vài giây
                </p>
              )}
              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['phrase', 'loại từ', 'meaning', 'example'].map(h => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold uppercase"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>{row.phrase}</td>
                        <td className="px-3 py-2">
                          <PosBadge phrase={row.phrase} pos={row.pos} />
                        </td>
                        <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>{row.meaning}</td>
                        <td className="px-3 py-2 truncate max-w-[8rem]" style={{ color: 'var(--text-muted)' }}>
                          {row.example ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 5 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  … và {rows.length - 5} từ khác
                </p>
              )}
              {error && (
                <p className="text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--color-primary)' }}>
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStep('pick'); setRows([]); setError(null) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  Chọn file khác
                </button>
                <button
                  type="button"
                  onClick={() => void runImport()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                >
                  Import {rows.length} từ vào deck
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
                style={{
                  borderColor: dragOver ? 'var(--color-primary)' : 'var(--border-color)',
                  background: dragOver ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'var(--bg-secondary)',
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
              >
                <Upload size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                  Kéo thả file .csv hoặc .json vào đây
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                >
                  Chọn file
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                    e.target.value = ''
                  }}
                />
              </div>

              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="flex items-center gap-2 text-xs font-medium self-start transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-primary)' }}
              >
                <Download size={14} />
                Tải file mẫu .csv
              </button>

              {error && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--color-primary)' }}
                >
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}