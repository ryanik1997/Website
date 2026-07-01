import { useCallback, useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import type { SyncState } from '../../auth/useSyncManager'

export const SRS_POPUP_INTERVAL_MS = 30 * 60 * 1000

async function countDueSrs(): Promise<number> {
  return db.srs.where('dueAt').belowOrEqual(Date.now()).count()
}

export function useSrsReviewPopup(syncState: SyncState) {
  const [open, setOpen] = useState(false)
  const prevSyncState = useRef<SyncState>(syncState)

  const dueCount = useLiveQuery(() => countDueSrs(), [], undefined)

  // Dexie live — khi có từ due (sau F5, vào /app, hoặc data vừa load xong)
  useEffect(() => {
    if (dueCount !== undefined && dueCount > 0) setOpen(true)
  }, [dueCount])

  // Sau khi sync cloud xong — kiểm tra lại (tránh miss lúc DB còn trống / đang sync)
  useEffect(() => {
    const wasSyncing = prevSyncState.current === 'syncing'
    prevSyncState.current = syncState
    if (wasSyncing && syncState === 'done' && (dueCount ?? 0) > 0) {
      setOpen(true)
    }
  }, [syncState, dueCount])

  // Nhắc lại mỗi 30 phút
  useEffect(() => {
    const id = setInterval(() => {
      void countDueSrs().then(count => {
        if (count > 0) setOpen(true)
      })
    }, SRS_POPUP_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const dismiss = useCallback(() => setOpen(false), [])

  const refresh = useCallback(() => countDueSrs(), [])

  return {
    open,
    dueCount: dueCount ?? 0,
    dueLoading: dueCount === undefined,
    dismiss,
    refresh,
  }
}