import { useCallback, useEffect, useState } from 'react'
import { db } from '@ryan/db'
import { pushAppNotification, removeAppNotificationByDedupeKey } from './notificationStore'
import { LISTENING_DRAFT_PREFIX, READING_DRAFT_PREFIX } from '../exam/examCompletion'
import { getValidDueSrsRows } from '../vocab/dueSrs'

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

function localDayKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function createLearningProgressNotifications(now: number): Promise<void> {
  pushAppNotification({
    category: 'system',
    title: 'Trung tâm thông báo đã sẵn sàng',
    message: 'Tại đây bạn sẽ nhận nhắc ôn, mục tiêu, chuỗi học, luyện thi, thành tích và cập nhật bài học.',
    dedupeKey: 'notification-center-welcome-v1',
  })

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const recentLogs = await db.reviewLog.where('at').aboveOrEqual(startOfToday.getTime() - 30 * 86_400_000).toArray()
  const todayKey = localDayKey(now)
  const todayReviews = recentLogs.filter(log => localDayKey(log.at) === todayKey).length

  if (todayReviews >= 20) {
    pushAppNotification({
      category: 'goal',
      title: 'Đã hoàn thành mục tiêu hôm nay',
      message: `Bạn đã ôn ${todayReviews} thẻ. Một phiên học rất hiệu quả!`,
      actionUrl: '/app/vocab',
      actionLabel: 'Xem tiến độ',
      dedupeKey: `daily-review-goal-${todayKey}`,
    })
  }

  const activeDays = new Set(recentLogs.map(log => localDayKey(log.at)))
  let streak = 0
  const cursor = new Date(now)
  if (!activeDays.has(todayKey)) cursor.setDate(cursor.getDate() - 1)
  while (activeDays.has(localDayKey(cursor.getTime()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  if (todayReviews > 0 && streak >= 3) {
    pushAppNotification({
      category: 'streak',
      title: `Chuỗi học ${streak} ngày`,
      message: 'Bạn đang duy trì thói quen rất tốt. Hẹn gặp lại vào ngày mai!',
      actionUrl: '/app/home',
      actionLabel: 'Xem tổng quan',
      dedupeKey: `streak-kept-${todayKey}`,
    })
  } else if (todayReviews === 0 && streak >= 2 && new Date(now).getHours() >= 18) {
    pushAppNotification({
      category: 'streak',
      title: 'Đừng để mất chuỗi học',
      message: `Chỉ cần một phiên ôn ngắn để nối tiếp chuỗi ${streak} ngày của bạn.`,
      actionUrl: '/app/vocab',
      actionLabel: 'Học ngay',
      priority: 'urgent',
      dedupeKey: `streak-risk-${todayKey}`,
    })
  }
}

type ExamDraft = {
  answers?: Record<string, unknown>
  partIndex?: number
  submitted?: boolean
  updatedAt?: number
}

function readExamDraft(raw: string | null): ExamDraft | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as ExamDraft
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

async function createExamProgressNotifications(now: number): Promise<void> {
  const drafts: Array<{ skill: 'reading' | 'listening'; examId: string; draft: ExamDraft }> = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key) continue
    const skill = key.startsWith(READING_DRAFT_PREFIX)
      ? 'reading'
      : key.startsWith(LISTENING_DRAFT_PREFIX)
        ? 'listening'
        : null
    if (!skill) continue
    const prefix = skill === 'reading' ? READING_DRAFT_PREFIX : LISTENING_DRAFT_PREFIX
    const draft = readExamDraft(localStorage.getItem(key))
    const examId = key.slice(prefix.length)
    if (draft && examId) drafts.push({ skill, examId, draft })
  }

  const recentIncomplete = drafts
    .filter(({ draft }) => {
      const answered = Object.keys(draft.answers ?? {}).length
      const updatedAt = Number(draft.updatedAt ?? 0)
      return !draft.submitted && answered > 0 && updatedAt > now - 30 * 86_400_000
    })
    .sort((a, b) => Number(b.draft.updatedAt ?? 0) - Number(a.draft.updatedAt ?? 0))
    .slice(0, 8)

  const activeKeys = new Set(recentIncomplete.map(({ skill, examId }) => `exam-resume-${skill}-${examId}`))
  for (const { skill, examId } of drafts) {
    const key = `exam-resume-${skill}-${examId}`
    if (!activeKeys.has(key)) removeAppNotificationByDedupeKey(key)
  }

  for (const { skill, examId, draft } of recentIncomplete) {
    const answered = Object.keys(draft.answers ?? {}).length
    const part = Math.max(1, Number(draft.partIndex ?? 0) + 1)
    const record = skill === 'reading'
      ? await db.readingExams.get(examId)
      : await db.listeningExams.get(examId)
    const skillLabel = skill === 'reading' ? 'Reading' : 'Listening'
    const title = record?.title || `${skillLabel} – bài đang làm`
    pushAppNotification({
      category: 'exam',
      title: `Tiếp tục ${title}`,
      message: `Bạn đang ở Part ${part} và đã trả lời ${answered} câu. Tiến độ vẫn được giữ nguyên.`,
      actionUrl: `/app/exam/${skill}/${encodeURIComponent(examId)}`,
      actionLabel: `Tiếp tục Part ${part}`,
      dedupeKey: `exam-resume-${skill}-${examId}`,
      replaceExisting: true,
    })
  }
}

async function tryShowReminder(): Promise<void> {
  const today = todayString()
  const t = Date.now()
  await createLearningProgressNotifications(t)
  await createExamProgressNotifications(t)
  const count = (await getValidDueSrsRows(t)).length
  if (count === 0) {
    removeAppNotificationByDedupeKey(`srs-due-${today}`)
    return
  }

  pushAppNotification({
    category: 'review',
    title: `${count} thẻ đang đến hạn`,
    message: 'Ôn ngay để ghi nhớ lâu hơn và giữ nhịp học hôm nay.',
    actionUrl: VOCAB_URL,
    actionLabel: 'Ôn tập ngay',
    priority: 'important',
    dedupeKey: `srs-due-${today}`,
    replaceExisting: true,
  })

  if (!isNotificationSupported()) return
  if (readPermission() !== 'granted') return
  if (!isReminderEnabled()) return
  if (!isPastReminderTime(getReminderTime())) return
  if (localStorage.getItem(SRS_LAST_NOTIFIED_KEY) === today) return

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
  const shouldRun = listeners.size > 0

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
