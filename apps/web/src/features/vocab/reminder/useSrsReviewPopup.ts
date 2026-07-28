import { useCallback, useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { SyncState } from '../../auth/useSyncManager'
import { millisecondsUntilSrsReminder } from './srsReminderTiming'
import { countValidDueSrs } from '../dueSrs'

export const SRS_POPUP_INTERVAL_OPTIONS = [5, 15, 25, 30] as const
export type SrsPopupIntervalMinutes = typeof SRS_POPUP_INTERVAL_OPTIONS[number]
export const SRS_POPUP_INTERVAL_KEY = 'ryan-srs-reminder-interval-minutes'
export const SRS_POPUP_INTERVAL_CHANGED_EVENT = 'ryan-srs-reminder-interval-changed'
const DEFAULT_SRS_POPUP_INTERVAL_MINUTES: SrsPopupIntervalMinutes = 30
const LAST_SHOWN_KEY = 'ryan-srs-reminder-last-shown-at'

function isValidInterval(value: number): value is SrsPopupIntervalMinutes {
  return SRS_POPUP_INTERVAL_OPTIONS.includes(value as SrsPopupIntervalMinutes)
}

export function getSrsPopupIntervalMinutes(): SrsPopupIntervalMinutes {
  try {
    const value = Number(localStorage.getItem(SRS_POPUP_INTERVAL_KEY))
    return isValidInterval(value) ? value : DEFAULT_SRS_POPUP_INTERVAL_MINUTES
  } catch {
    return DEFAULT_SRS_POPUP_INTERVAL_MINUTES
  }
}

export function setSrsPopupIntervalMinutes(minutes: SrsPopupIntervalMinutes): void {
  try {
    localStorage.setItem(SRS_POPUP_INTERVAL_KEY, String(minutes))
    window.dispatchEvent(new Event(SRS_POPUP_INTERVAL_CHANGED_EVENT))
  } catch {
    /* ignore unavailable storage */
  }
}

export function useSrsPopupIntervalMinutes(): [SrsPopupIntervalMinutes, (minutes: SrsPopupIntervalMinutes) => void] {
  const [minutes, setMinutes] = useState(getSrsPopupIntervalMinutes)
  useEffect(() => {
    const sync = () => setMinutes(getSrsPopupIntervalMinutes())
    window.addEventListener(SRS_POPUP_INTERVAL_CHANGED_EVENT, sync)
    return () => window.removeEventListener(SRS_POPUP_INTERVAL_CHANGED_EVENT, sync)
  }, [])
  const update = useCallback((next: SrsPopupIntervalMinutes) => {
    setSrsPopupIntervalMinutes(next)
    setMinutes(next)
  }, [])
  return [minutes, update]
}

/** Chỉ thẻ đã ôn trước đó và đến hạn — không đếm ~30k thẻ seed "new". */
async function countDueSrs(): Promise<number> {
  return countValidDueSrs()
}

function readLastShown(): number {
  try {
    const raw = localStorage.getItem(LAST_SHOWN_KEY)
    if (!raw) return 0
    const n = Number(raw)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function writeLastShown(ts: number): void {
  try {
    localStorage.setItem(LAST_SHOWN_KEY, String(ts))
  } catch {
    /* ignore quota / private mode */
  }
}

function shouldShowNow(intervalMinutes: SrsPopupIntervalMinutes): boolean {
  const last = readLastShown()
  return Date.now() - last >= intervalMinutes * 60 * 1000
}

export function useSrsReviewPopup(syncState: SyncState) {
  const [open, setOpen] = useState(false)
  const [lastShownAt, setLastShownAt] = useState(readLastShown)
  const [intervalMinutes] = useSrsPopupIntervalMinutes()
  const prevSyncState = useRef<SyncState>(syncState)

  const dueCount = useLiveQuery(() => countDueSrs(), [], undefined)

  const showIfDue = useCallback((count: number | undefined) => {
    if (!count || count <= 0) return
    if (!shouldShowNow(intervalMinutes)) return
    const shownAt = Date.now()
    writeLastShown(shownAt)
    setLastShownAt(shownAt)
    setOpen(true)
  }, [intervalMinutes])

  // Sau khi sync cloud xong: nếu đã qua 30 phút và có từ due → hiện
  useEffect(() => {
    const wasSyncing = prevSyncState.current === 'syncing'
    prevSyncState.current = syncState
    if (wasSyncing && syncState === 'done') {
      showIfDue(dueCount)
    }
  }, [syncState, dueCount, showIfDue])

  // Nhắc lại mỗi 30 phút (khi tab đang mở)
  useEffect(() => {
    let cancelled = false
    let timerId: ReturnType<typeof setTimeout> | undefined
    const intervalMs = intervalMinutes * 60 * 1000

    const schedule = (delay: number) => {
      timerId = setTimeout(() => {
        void countDueSrs().then(count => {
          if (cancelled) return
          if (count > 0) {
            showIfDue(count)
          } else {
            schedule(intervalMs)
          }
        })
      }, delay)
    }

    schedule(millisecondsUntilSrsReminder(lastShownAt, intervalMinutes))
    return () => {
      cancelled = true
      if (timerId !== undefined) clearTimeout(timerId)
    }
  }, [intervalMinutes, lastShownAt, showIfDue])

  useEffect(() => {
    const checkWhenActive = () => {
      if (document.visibilityState === 'hidden') return
      void countDueSrs().then(count => showIfDue(count))
    }
    window.addEventListener('focus', checkWhenActive)
    document.addEventListener('visibilitychange', checkWhenActive)
    return () => {
      window.removeEventListener('focus', checkWhenActive)
      document.removeEventListener('visibilitychange', checkWhenActive)
    }
  }, [showIfDue])

  const dismiss = useCallback(() => {
    const dismissedAt = Date.now()
    writeLastShown(dismissedAt)
    setLastShownAt(dismissedAt)
    setOpen(false)
  }, [])

  const refresh = useCallback(() => countDueSrs(), [])

  return {
    open,
    dueCount: dueCount ?? 0,
    dueLoading: dueCount === undefined,
    dismiss,
    refresh,
  }
}
