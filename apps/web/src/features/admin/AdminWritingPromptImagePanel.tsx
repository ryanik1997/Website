import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, ImagePlus, Loader2, Upload } from 'lucide-react'
import { db, writingRepo, type WritingDoc } from '@ryan/db'
import { useIsAdmin } from '../auth/useIsAdmin'
import {
  CAMBRIDGE_WRITING_ROUTE_LEVELS,
  getCambridgeRouteCollection,
  type CambridgeRouteLevel,
} from '../writing/cambridgeWritingRouteCatalog'

type SaveState = 'idle' | 'saving' | 'done'

const LEVEL_OPTIONS = Object.values(CAMBRIDGE_WRITING_ROUTE_LEVELS)

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error('Không đọc được file ảnh.'))
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.readAsDataURL(file)
  })
}

async function upsertWritingPromptImage(
  level: CambridgeRouteLevel,
  testId: string,
  taskId: string,
  promptImage: string,
): Promise<void> {
  const levelConfig = CAMBRIDGE_WRITING_ROUTE_LEVELS[level]
  const test = getCambridgeRouteCollection(level).tests.find(item => item.id === testId)
  const task = test?.tasks.find(item => item.id === taskId)
  if (!levelConfig || !test || !task) {
    throw new Error('Không tìm thấy task Writing để gắn ảnh.')
  }

  const all = await db.writingDocs.where('type').equals(levelConfig.type).toArray()
  const existing = all
    .filter((doc) =>
      doc.sourceMeta?.examFamily === 'cambridge'
      && doc.sourceMeta?.taskId === task.id
      && doc.sourceMeta?.docRole === 'prompt_seed',
    )
    .sort((a, b) => b.updatedAt - a.updatedAt)[0]

  const prompt = [task.instruction, task.promptText].filter(Boolean).join('\n\n')
  const sourceMeta: NonNullable<WritingDoc['sourceMeta']> = {
    examFamily: 'cambridge',
    level,
    testId: test.id,
    taskId: task.id,
    genre: task.genre as WritingDoc['genre'],
    sourcePromptId: task.id,
    docRole: 'prompt_seed',
  }

  if (existing) {
    await db.writingDocs.update(existing.id, {
      prompt,
      promptImage,
      genre: task.genre as WritingDoc['genre'],
      sourceMeta,
      updatedAt: Date.now(),
    })
    return
  }

  await writingRepo.createDoc(
    levelConfig.type,
    prompt,
    promptImage,
    task.genre as WritingDoc['genre'],
    sourceMeta,
  )
}

export default function AdminWritingPromptImagePanel() {
  const isAdmin = useIsAdmin()
  const inputRef = useRef<HTMLInputElement>(null)
  const [level, setLevel] = useState<CambridgeRouteLevel>('a2')
  const [testId, setTestId] = useState('ket-a2-book4-test2')
  const [taskId, setTaskId] = useState('ket-a2-book4-test2-task-31')
  const [pickedFile, setPickedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<SaveState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const tests = useMemo(() => getCambridgeRouteCollection(level).tests, [level])
  const tasks = useMemo(() => tests.find((item) => item.id === testId)?.tasks ?? [], [testId, tests])
  const selectedTask = tasks.find((item) => item.id === taskId) ?? null

  const importedPrompts = useLiveQuery(async () => {
    const all = await db.writingDocs.toArray()
    return all
      .filter((doc) =>
        doc.sourceMeta?.examFamily === 'cambridge'
        && doc.sourceMeta?.docRole === 'prompt_seed'
        && !!doc.promptImage,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8)
  }, []) ?? []

  function resetTask(nextLevel: CambridgeRouteLevel) {
    const nextTests = getCambridgeRouteCollection(nextLevel).tests
    const nextTest = nextTests[0]
    const nextTask = nextTest?.tasks[0]
    setLevel(nextLevel)
    setTestId(nextTest?.id ?? '')
    setTaskId(nextTask?.id ?? '')
    setMessage(null)
  }

  function handlePick(file: File | null) {
    setPickedFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
    setStatus('idle')
    setMessage(null)
  }

  async function handleSave() {
    if (isAdmin !== true) {
      setMessage('Bạn không có quyền import ảnh Writing.')
      return
    }
    if (!pickedFile) {
      setMessage('Chọn ảnh trước khi lưu.')
      return
    }
    if (!selectedTask) {
      setMessage('Task Writing chưa hợp lệ.')
      return
    }

    setStatus('saving')
    setMessage(null)
    try {
      const promptImage = await readFileAsDataUrl(pickedFile)
      await upsertWritingPromptImage(level, testId, taskId, promptImage)
      setStatus('done')
      setMessage(`Đã lưu ảnh cho ${selectedTask.title}.`)
    } catch (error) {
      setStatus('idle')
      setMessage(error instanceof Error ? error.message : 'Lưu ảnh thất bại.')
    }
  }

  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-start gap-3">
        <ImagePlus size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Import ảnh đề Writing Cambridge
          </h3>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Upload ảnh cho từng task Writing. User mở route tương ứng sẽ tự dùng ảnh này ở pane trái.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Level</span>
          <select
            value={level}
            onChange={(event) => resetTask(event.target.value as CambridgeRouteLevel)}
            className="w-full rounded-lg border px-3 py-2"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {LEVEL_OPTIONS.map((option) => (
              <option key={option.level} value={option.level}>{option.displayName}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Test</span>
          <select
            value={testId}
            onChange={(event) => {
              const nextTestId = event.target.value
              const nextTaskId = tests.find((item) => item.id === nextTestId)?.tasks[0]?.id ?? ''
              setTestId(nextTestId)
              setTaskId(nextTaskId)
              setMessage(null)
            }}
            className="w-full rounded-lg border px-3 py-2"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {tests.map((option) => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Task</span>
          <select
            value={taskId}
            onChange={(event) => {
              setTaskId(event.target.value)
              setMessage(null)
            }}
            className="w-full rounded-lg border px-3 py-2"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {tasks.map((option) => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handlePick(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          <Upload size={14} />
          Chọn ảnh
        </button>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {pickedFile?.name ?? 'Chưa chọn file'}
        </span>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={status === 'saving' || !pickedFile}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60"
          style={{ background: 'var(--color-primary)', color: '#fff' }}
        >
          {status === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          Lưu ảnh task
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-sm" style={{ color: status === 'done' ? '#15803d' : 'var(--text-muted)' }}>
          {status === 'done' ? <Check size={14} className="mr-1 inline-block" /> : null}
          {message}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div
          className="min-h-[180px] rounded-xl border p-3"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview prompt" className="max-h-[360px] w-full rounded-lg object-contain" />
          ) : (
            <div className="grid h-full place-items-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Chọn ảnh để xem preview
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Ảnh đã import gần đây</p>
          <div className="mt-2 space-y-2">
            {importedPrompts.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có task nào gắn ảnh.</p>
            ) : importedPrompts.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border px-3 py-2 text-xs"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <p className="font-semibold">{doc.sourceMeta?.taskId ?? doc.id}</p>
                <p style={{ color: 'var(--text-muted)' }}>
                  {doc.sourceMeta?.level?.toUpperCase()} · {doc.sourceMeta?.testId}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
