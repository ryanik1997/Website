import { useEffect, useRef, useState } from 'react'
import type { SyncState } from './useSyncManager'

interface Props {
  userId: string | undefined
  syncState: SyncState
}

type ToastKind = 'restoring' | 'done' | null

export default function SyncOnLogin({ userId, syncState }: Props) {
  const [toast, setToast] = useState<ToastKind>(null)
  const seenUser = useRef<string | null>(null)

  useEffect(() => {
    if (!userId) {
      seenUser.current = null
      setToast(null)
      return
    }
    if (seenUser.current === userId) return
    seenUser.current = userId
    setToast('restoring')
  }, [userId])

  useEffect(() => {
    if (!userId) return
    if (syncState === 'syncing' && toast !== 'restoring') {
      setToast('restoring')
    }
    if (syncState === 'done' && toast === 'restoring') {
      setToast('done')
      const timer = window.setTimeout(() => setToast(null), 2000)
      return () => window.clearTimeout(timer)
    }
  }, [syncState, userId, toast])

  useEffect(() => {
    if (toast !== 'restoring') return
    const timer = window.setTimeout(() => setToast(null), 8000)
    return () => window.clearTimeout(timer)
  }, [toast])

  if (!toast || !userId) return null

  const message = toast === 'restoring'
    ? 'Đang khôi phục dữ liệu…'
    : 'Đã đồng bộ xong!'

  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
      }}
    >
      {message}
    </div>
  )
}