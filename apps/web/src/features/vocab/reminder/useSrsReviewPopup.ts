import { useCallback, useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { isSrsReviewDue } from '@ryan/core'
import { db } from '@ryan/db'
import type { SyncState } from '../../auth/useSyncManager'

export const SRS_POPUP_INTERVAL_MS = 30 * 60 * 1000
const LAST_SHOWN_KEY = 'ryan-srs-reminder-last-shown-at'

/** Chỉ thẻ đã ôn trước đó và đến hạn — không đếm ~30k thẻ seed "new". */
async function countDueSrs(): Promise<number> {
  const t = Date.now()
  const rows = await db.srs.where('dueAt').belowOrEqual(t).toArray()
  return rows.filter(s => isSrsReviewDue(s, t)).length
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

function shouldShowNow(): boolean {
  const last = readLastShown()
  return Date.now() - last >= SRS_POPUP_INTERVAL_MS
}

export function useSrsReviewPopup(syncState: SyncState) {
  const [open, setOpen] = useState(false)
  const prevSyncState = useRef<SyncState>(syncState)

  const dueCount = useLiveQuery(() => countDueSrs(), [], undefined)

  const showIfDue = useCallback((count: number | undefined) => {
    if (!count || count <= 0) return
    if (!shouldShowNow()) return
    writeLastShown(Date.now())
    setOpen(true)
  }, [])

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
    const id = setInterval(() => {
      void countDueSrs().then(count => showIfDue(count))
    }, SRS_POPUP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [showIfDue])

  const dismiss = useCallback(() => {
    writeLastShown(Date.now())
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
