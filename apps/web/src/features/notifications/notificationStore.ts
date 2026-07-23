export type AppNotificationCategory =
  | 'review'
  | 'goal'
  | 'streak'
  | 'exam'
  | 'achievement'
  | 'content'
  | 'system'

export type AppNotificationPriority = 'normal' | 'important' | 'urgent'

export interface AppNotification {
  id: string
  category: AppNotificationCategory
  title: string
  message: string
  createdAt: number
  readAt?: number
  actionUrl?: string
  actionLabel?: string
  dedupeKey?: string
  priority?: AppNotificationPriority
}

export type NewAppNotification = Omit<AppNotification, 'id' | 'createdAt' | 'readAt'> & {
  id?: string
  createdAt?: number
  /** Cập nhật thông báo tiến độ hiện có thay vì giữ lại con số cũ. */
  replaceExisting?: boolean
}

const STORAGE_KEY = 'ryan-app-notifications-v1'
const CHANGE_EVENT = 'ryan-app-notifications-change'
const MAX_ITEMS = 250

function safeRead(): AppNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter(item => item?.id && item?.title) : []
  } catch {
    return []
  }
}

function save(items: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getAppNotifications(): AppNotification[] {
  return safeRead().sort((a, b) => b.createdAt - a.createdAt)
}

export function pushAppNotification(input: NewAppNotification): AppNotification | null {
  const items = safeRead()
  const existingIndex = input.dedupeKey
    ? items.findIndex(item => item.dedupeKey === input.dedupeKey)
    : -1
  if (existingIndex >= 0 && !input.replaceExisting) return null

  const { replaceExisting: _replaceExisting, ...notificationInput } = input
  if (existingIndex >= 0) {
    const existing = items[existingIndex]
    const changed = existing.title !== input.title || existing.message !== input.message
    const updated: AppNotification = {
      ...existing,
      ...notificationInput,
      id: existing.id,
      createdAt: changed ? Date.now() : existing.createdAt,
      readAt: changed ? undefined : existing.readAt,
    }
    items.splice(existingIndex, 1)
    save([updated, ...items])
    return updated
  }

  const item: AppNotification = {
    ...notificationInput,
    id: input.id ?? crypto.randomUUID(),
    createdAt: input.createdAt ?? Date.now(),
  }
  save([item, ...items])
  return item
}

export function removeAppNotificationByDedupeKey(dedupeKey: string): void {
  const items = safeRead()
  const next = items.filter(item => item.dedupeKey !== dedupeKey)
  if (next.length !== items.length) save(next)
}

export function markAppNotificationRead(id: string): void {
  save(safeRead().map(item => item.id === id && !item.readAt ? { ...item, readAt: Date.now() } : item))
}

export function markAllAppNotificationsRead(): void {
  const now = Date.now()
  save(safeRead().map(item => item.readAt ? item : { ...item, readAt: now }))
}

export function removeAppNotification(id: string): void {
  save(safeRead().filter(item => item.id !== id))
}

export function clearReadAppNotifications(): void {
  save(safeRead().filter(item => !item.readAt))
}

export function subscribeAppNotifications(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', onStorage)
  }
}
