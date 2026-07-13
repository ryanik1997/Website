import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { AlertCircle, Check, CloudUpload, Loader2, Upload } from 'lucide-react'
import {
  countAdminPublishableContent,
  publishAllAdminContent,
  type AdminModuleCounts,
  type AdminPublishProgress,
  type AdminPublishResult,
} from './adminContentPublish'
import { parseDictionaryCsv, parseDictionaryJson, saveCustomDictionary } from '../dictionary/customDictionary'

const MODULE_LABELS: Record<keyof AdminModuleCounts, string> = {
  vocab: 'Từ vựng (preset)',
  lessons: 'Nghe — bài Cambridge',
  translation: 'Luyện dịch',
  sentence_structures: 'Cấu trúc câu',
  writing_prompts: 'Viết — đề bài (chưa có bài làm)',
  mindmaps: 'MindMap',
  dictionary: 'Từ điển import',
  reading_exams: 'Luyện thi — Reading',
  listening_exams: 'Luyện thi — Listening',
}

function formatModuleCount(key: keyof AdminModuleCounts, counts: AdminModuleCounts): string {
  if (key === 'vocab') {
    const v = counts.vocab
    return `${v.decks} bộ · ${v.cards} thẻ`
  }
  return String(counts[key])
}

function totalItems(counts: AdminModuleCounts): number {
  return (
    counts.vocab.groups + counts.vocab.decks + counts.vocab.cards
    + counts.lessons
    + counts.translation
    + counts.sentence_structures
    + counts.writing_prompts
    + counts.mindmaps
    + counts.dictionary
    + counts.reading_exams
    + counts.listening_exams
  )
}

export default function AdminPublishExamsPanel() {
  const counts = useLiveQuery(() => countAdminPublishableContent(), [])
    ?? {
      vocab: { groups: 0, decks: 0, cards: 0 },
      lessons: 0,
      translation: 0,
      sentence_structures: 0,
      writing_prompts: 0,
      mindmaps: 0,
      dictionary: 0,
      reading_exams: 0,
      listening_exams: 0,
    }
  const [publishing, setPublishing] = useState(false)
  const [publishingMode, setPublishingMode] = useState<'changed' | 'all' | null>(null)
  const [progress, setProgress] = useState<AdminPublishProgress | null>(null)
  const [result, setResult] = useState<AdminPublishResult | null>(null)
  const [dictionaryNotice, setDictionaryNotice] = useState<string | null>(null)
  const dictionaryInputRef = useRef<HTMLInputElement>(null)

  const total = totalItems(counts)

  async function handleDictionaryImport(file: File) {
    setDictionaryNotice(null)
    try {
      const text = await file.text()
      const entries = file.name.toLowerCase().endsWith('.csv')
        ? parseDictionaryCsv(text)
        : parseDictionaryJson(text)
      if (!entries.length) throw new Error('Không tìm thấy entry hợp lệ trong file.')
      await saveCustomDictionary(entries)
      setDictionaryNotice(`Đã import ${entries.length} từ. Nhấn Publish để User nhận dữ liệu.`)
    } catch (error) {
      setDictionaryNotice(error instanceof Error ? error.message : 'Không thể import từ điển.')
    } finally {
      if (dictionaryInputRef.current) dictionaryInputRef.current.value = ''
    }
  }

  async function handlePublishChanged() {
    if (publishing) return
    setPublishing(true)
    setPublishingMode('changed')
    setResult(null)
    setProgress(null)
    try {
      setResult(await publishAllAdminContent(setProgress))
    } catch (err) {
      setResult({
        version: 0,
        modules: [],
        moduleCounts: counts,
        exams: {
          reading: { published: 0, skipped: 0, failed: 0 },
          listening: { published: 0, skipped: 0, failed: 0 },
          errors: [],
        },
        errors: [err instanceof Error ? err.message : 'Publish failed'],
      })
    } finally {
      setPublishing(false)
      setPublishingMode(null)
      setProgress(null)
    }
  }

  async function handlePublishAll() {
    if (total === 0 || publishing) return
    const ok = window.confirm(
      `Publish toàn bộ nội dung Admin (${total} mục) lên Supabase?\n\n`
      + 'Mọi user sẽ nhận sau khi refresh / mở lại app.\n'
      + 'Dữ liệu cá nhân (SRS, bài viết đã làm, deck user) không bị đẩy.',
    )
    if (!ok) return

    setPublishing(true)
    setPublishingMode('all')
    setResult(null)
    setProgress(null)
    try {
      const batch = await publishAllAdminContent(setProgress, { forceAll: true })
      setResult(batch)
    } catch (err) {
      setResult({
        version: 0,
        modules: [],
        moduleCounts: counts,
        exams: {
          reading: { published: 0, skipped: 0, failed: 0 },
          listening: { published: 0, skipped: 0, failed: 0 },
          errors: [],
        },
        errors: [err instanceof Error ? err.message : 'Publish thất bại'],
      })
    } finally {
      setPublishing(false)
      setPublishingMode(null)
      setProgress(null)
    }
  }

  const moduleKeys = Object.keys(MODULE_LABELS) as (keyof AdminModuleCounts)[]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div
        className="rounded-xl border p-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-start gap-3">
          <CloudUpload size={22} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Publish nội dung Admin lên cloud
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Một nút cho toàn bộ app: Từ vựng, Viết, Nghe, Luyện thi, Cấu trúc câu, MindMap, Luyện dịch.
              Đọc từ IndexedDB máy Admin → Supabase → user tự sync khi vào app.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {moduleKeys.map(key => (
            <div
              key={key}
              className="rounded-lg px-3 py-2.5"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <p className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {key === 'vocab' ? counts.vocab.decks : counts[key]}
              </p>
              <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                {MODULE_LABELS[key]}
              </p>
              {key === 'vocab' && counts.vocab.cards > 0 ? (
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {counts.vocab.cards} thẻ
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <ul className="mt-4 space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <li>• <strong>Từ vựng:</strong> bộ <code>preset</code> + thẻ trong bộ đó</li>
          <li>• <strong>Viết:</strong> chỉ đề bài trống (chưa có nội dung user gõ)</li>
          <li>• <strong>Nghe:</strong> bài <code>cambridge</code> + đề Listening import</li>
          <li>• <strong>Luyện thi:</strong> đề Reading/Listening import (không gồm <code>catalog-*</code>)</li>
          <li>• Không publish: SRS, deck cá nhân, bài viết đã làm, bài nghe user</li>
        </ul>

        <div className="mt-4 rounded-lg p-3" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Import từ điển JSON / CSV</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Từ trùng sẽ dùng bản Admin import. Hiện có {counts.dictionary} từ tùy chỉnh.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dictionaryInputRef.current?.click()}
              className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
              style={{ color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
            >
              <Upload size={14} /> Import
            </button>
            <input
              ref={dictionaryInputRef}
              type="file"
              accept=".json,.csv,application/json,text/csv"
              className="hidden"
              onChange={event => {
                const file = event.target.files?.[0]
                if (file) void handleDictionaryImport(file)
              }}
            />
          </div>
          {dictionaryNotice ? (
            <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>{dictionaryNotice}</p>
          ) : null}
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            CSV: word,pos,level,ipaUS,ipaUK,meaning,example,exampleVi,collocations,synonyms
          </p>
          <div className="flex gap-3 mt-2 text-[11px]">
            <a
              href="/templates/dictionary-import-template.json"
              download
              style={{ color: 'var(--color-primary)' }}
            >
              Tải JSON mẫu
            </a>
            <a
              href="/templates/dictionary-import-template.csv"
              download
              style={{ color: 'var(--color-primary)' }}
            >
              Tải CSV mẫu
            </a>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void handlePublishChanged()}
          disabled={publishing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
          title="Chỉ publish dữ liệu mới hoặc đã chỉnh sửa"
        >
          {publishingMode === 'changed' ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
          Publish
        </button>
        <button
          type="button"
          onClick={() => void handlePublishAll()}
          disabled={publishing || total === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
        >
          {publishingMode === 'all' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang publish…
            </>
          ) : (
            <>
              <CloudUpload size={16} />
              Publish tất cả ({total} mục)
            </>
          )}
        </button>
        </div>

        {publishing && progress ? (
          <p className="mt-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {progress.current}/{progress.total} — {progress.label}
          </p>
        ) : null}
      </div>

      {total === 0 && !publishing ? (
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
          Không có nội dung Admin cần publish trên máy này.
        </p>
      ) : null}

      {result ? (
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <Check size={18} style={{ color: '#22c55e' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Hoàn tất {result.version > 0 ? `(v${result.version})` : ''}
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Reading: {result.exams.reading.published} · Listening: {result.exams.listening.published}
            {result.modules.length > 0 ? ` · Modules: ${result.modules.join(', ')}` : ''}
          </p>
          {result.errors.length > 0 ? (
            <ul className="space-y-2">
              {result.errors.map((msg, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs rounded-lg px-3 py-2"
                  style={{ background: 'color-mix(in srgb, #ef4444 8%, var(--bg-secondary))' }}
                >
                  <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                  <span style={{ color: 'var(--text-primary)' }}>{msg}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              User mở lại app hoặc hard refresh để nhận nội dung mới.
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
