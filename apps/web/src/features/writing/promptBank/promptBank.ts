import { useEffect, useState } from 'react'
import { db, writingRepo, type WritingDoc } from '@ryan/db'
import type { IeltsGenre, IeltsTrackSlug } from '../ieltsCatalog'

export interface TidWritingTask {
  id: string
  taskType: 'task1' | 'task2'
  genre: IeltsGenre
  title: string
  prompt: string
  /** Đường dẫn tĩnh dưới public/, null nếu đề không có ảnh */
  image: string | null
  /** Hướng dẫn viết + sample crawl sẵn (HTML), hiển thị thay cho AI guide */
  guideHtml: string | null
  createdAt: string | null
}

const TASKS_PATH = '/catalog/writing/tid/tasks.json'

let cache: TidWritingTask[] | null = null
let pending: Promise<TidWritingTask[]> | null = null

export function loadTidTasks(): Promise<TidWritingTask[]> {
  if (cache) return Promise.resolve(cache)
  pending ??= (async () => {
    const { resolvePlayableMediaUrl } = await import('../../../lib/protectedMedia')
    const url = await resolvePlayableMediaUrl(TASKS_PATH)
    if (!url) throw new Error('Không resolve được ngân hàng đề')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Không tải được ngân hàng đề (${res.status})`)
    const tasks = await res.json() as TidWritingTask[]
    cache = tasks
    return tasks
  })().finally(() => {
    pending = null
  })
  return pending
}

export function useTidTasks(): { tasks: TidWritingTask[] | null; error: string | null } {
  const [tasks, setTasks] = useState<TidWritingTask[] | null>(cache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cache) return
    let alive = true
    loadTidTasks()
      .then(t => alive && setTasks(t))
      .catch(e => alive && setError(e instanceof Error ? e.message : 'Lỗi tải ngân hàng đề'))
    return () => {
      alive = false
    }
  }, [])

  return { tasks, error }
}

export function trackForTask(task: TidWritingTask): IeltsTrackSlug {
  return task.taskType
}

/** Tìm đề ngân hàng khớp với một bài viết (khớp theo prompt). */
export async function findTidTaskForPrompt(prompt: string): Promise<TidWritingTask | null> {
  try {
    const tasks = await loadTidTasks()
    return tasks.find(t => t.prompt === prompt) ?? null
  } catch {
    return null
  }
}

function docTypeFor(task: TidWritingTask): WritingDoc['type'] {
  return task.taskType === 'task1' ? 'ielts_task1' : 'ielts_task2'
}

/** promptImage phải là data URL (được gửi thẳng cho AI khi chấm/hướng dẫn). */
async function toDataUrl(path: string): Promise<string | undefined> {
  try {
    const res = await fetch(path)
    if (!res.ok) return undefined
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return undefined
  }
}

/**
 * Bắt đầu luyện một đề: nếu đã có bài viết từ đề này thì mở lại,
 * chưa có thì tạo WritingDoc mới với prompt + ảnh + genre của đề.
 * Trả về id doc để setActiveDoc.
 */
export async function startTidTask(task: TidWritingTask): Promise<string> {
  const type = docTypeFor(task)
  const existing = (await db.writingDocs.toArray()).find(
    d => d.type === type && d.prompt === task.prompt,
  )
  if (existing) return existing.id
  const promptImage = task.image ? await toDataUrl(task.image) : undefined
  const doc = await writingRepo.createDoc(type, task.prompt, promptImage, task.genre)
  return doc.id
}
