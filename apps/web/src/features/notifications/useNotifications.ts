import { useCallback, useEffect, useState } from 'react'
import { db } from '@ryan/db'

export const SRS_REMINDER_TIME_KEY = 'srs-reminder-time'
export const SRS_LAST_NOTIFIED_KEY = 'srs-last-notified'
const DEFAULT_REMINDER_TIME = '08:00'
const CHECK_INTERVAL_MS = 60_000
const VOCAB_URL = '/app/vocab'

type Listener = () => void
const listeners = new Set<Listener>()
let checkInterval: ReturnType<typeof setInterval> | null = null

function emit() {
  listeners.forEach(l => l())
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getReminderTime(): string {
  return localStorage.getItem(SRS_REMINDER_TIME_KEY) ?? DEFAULT_REMINDER_TIME
}

export function isReminderEnabled(): boolean {
  return localStorage.getItem(SRS_REMINDER_TIME_KEY) !== null
}

function readPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

function currentTimeHHMM(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function isPastReminderTime(reminderTime: string): boolean {
  return currentTimeHHMM() >= reminderTime
}

async function tryShowReminder(): Promise<void> {
  if (!isNotificationSupported()) return
  if (readPermission() !== 'granted') return
  if (!isReminderEnabled()) return

  const reminderTime = getReminderTime()
  if (!isPastReminderTime(reminderTime)) return

  const today = todayString()
  if (localStorage.getItem(SRS_LAST_NOTIFIED_KEY) === today) return

  const count = await db.srs.where('dueAt').belowOrEqual(Date.now()).count()
  if (count === 0) return

  const reg = await navigator.serviceWorker.ready
  await reg.showNotification('Ryan English', {
    body: `Bạn có ${count} thẻ cần ôn hôm nay!`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'srs-reminder',
    data: { url: VOCAB_URL },
  } as NotificationOptions)
  localStorage.setItem(SRS_LAST_NOTIFIED_KEY, today)
}

function syncChecker(): void {
  const shouldRun = isNotificationSupported()
    && readPermission() === 'granted'
    && isReminderEnabled()

  if (shouldRun && !checkInterval) {
    tryShowReminder().catch(() => {})
    checkInterval = setInterval(() => {
      tryShowReminder().catch(() => {})
    }, CHECK_INTERVAL_MS)
  } else if (!shouldRun && checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register('/sw.js').catch(() => {})
  }
}

export function useNotifications() {
  const [, bump] = useState(0)
  const refresh = useCallback(() => bump(n => n + 1), [])

  useEffect(() => {
    listeners.add(refresh)
    syncChecker()

    let permStatus: PermissionStatus | null = null
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then(status => {
          permStatus = status
          status.addEventListener('change', refresh)
        })
        .catch(() => {})
    }

    return () => {
      permStatus?.removeEventListener('change', refresh)
      listeners.delete(refresh)
      if (listeners.size === 0 && checkInterval) {
        clearInterval(checkInterval)
        checkInterval = null
      }
    }
  }, [refresh])

  const permission = readPermission()
  const enabled = isReminderEnabled()
  const reminderTime = getReminderTime()

  useEffect(() => {
    syncChecker()
  }, [permission, enabled, reminderTime])

  const requestAndSchedule = useCallback(async () => {
    if (!isNotificationSupported()) return
    try {
      await registerServiceWorker()
      const result = await Notification.requestPermission()
      if (result === 'granted') {
        localStorage.setItem(
          SRS_REMINDER_TIME_KEY,
          localStorage.getItem(SRS_REMINDER_TIME_KEY) ?? DEFAULT_REMINDER_TIME,
        )
      }
    } finally {
      emit()
      syncChecker()
    }
  }, [])

  const cancelReminder = useCallback(() => {
    localStorage.removeItem(SRS_REMINDER_TIME_KEY)
    localStorage.removeItem(SRS_LAST_NOTIFIED_KEY)
    emit()
    syncChecker()
  }, [])

  const setReminderTime = useCallback((time: string) => {
    localStorage.setItem(SRS_REMINDER_TIME_KEY, time)
    emit()
  }, [])

  return {
    permission,
    isSupported: isNotificationSupported(),
    isEnabled: enabled && permission === 'granted',
    reminderTime,
    requestAndSchedule,
    cancelReminder,
    setReminderTime,
  }
}