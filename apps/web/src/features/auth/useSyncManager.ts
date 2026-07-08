import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { syncLocalToCloud, syncCloudToLocal, isLocalEmpty } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import { useAuth } from './AuthContext'

export type SyncState = 'idle' | 'syncing' | 'done' | 'error'

const LAST_SYNC_KEY = 'ryan-last-sync'
const SYNC_INTERVAL_MS = 5 * 60 * 1000

export interface SyncManagerValue {
  syncState: SyncState
  lastSyncAt: string | null
  triggerSync: () => void
  error: string | null
}

const SyncContext = createContext<SyncManagerValue | null>(null)

function readLastSyncAt(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY)
}

function writeLastSyncAt(iso: string): void {
  localStorage.setItem(LAST_SYNC_KEY, iso)
}

export function formatSyncTime(iso: string | null): string {
  if (!iso) return 'Chưa sync'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Chưa sync'
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

/** Map Supabase/PostgREST errors to actionable Vietnamese hints. */
export function friendlySyncError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('mindmaps') && (m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find'))) {
    return 'Thiếu bảng mindmaps trên Supabase — admin cần chạy file supabase/migrations/003_writing_mindmap_sync.sql trong SQL Editor.'
  }
  if (m.includes('writing_docs') && m.includes('check constraint')) {
    return 'Loại bài viết chưa khớp schema cloud (IELTS Task 1/2, Cambridge A2–C2). Admin chạy: pnpm db:push — hoặc SQL 007_writing_type_constraint_repair.sql trong Supabase SQL Editor.'
  }
  if (m.includes('prompt_image') && (m.includes('does not exist') || m.includes('could not find'))) {
    return 'Thiếu cột prompt_image trên Supabase — admin chạy pnpm db:push (migration 005/007).'
  }
  if (m.includes('row-level security') || m.includes('rls') || m.includes('jwt')) {
    return 'Phiên đăng nhập không hợp lệ — thử đăng xuất và đăng nhập lại.'
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Không kết nối được Supabase — kiểm tra mạng hoặc cấu hình VITE_SUPABASE_URL.'
  }
  if (m.includes('invalid input syntax for type uuid') && m.includes('preset:')) {
    return 'Bộ từ preset (IELTS, Oxford, …) không đồng bộ cloud — chỉ deck do bạn tạo được sync. Hãy refresh trang và thử lại.'
  }
  return message
}

function useSyncManagerImpl(): SyncManagerValue {
  const { user } = useAuth()
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(() => readLastSyncAt())
  const [error, setError] = useState<string | null>(null)
  const isSyncing = useRef(false)
  const loginSynced = useRef<string | null>(null)

  const runSync = useCallback(async () => {
    if (!user) return
    if (isSyncing.current) return

    isSyncing.current = true
    setSyncState('syncing')
    setError(null)

    try {
      const empty = await isLocalEmpty()
      if (empty) {
        await syncCloudToLocal(supabase)
      } else {
        await syncLocalToCloud(supabase, user.id)
      }
      const now = new Date().toISOString()
      writeLastSyncAt(now)
      setLastSyncAt(now)
      setSyncState('done')
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Đồng bộ thất bại'
      setError(friendlySyncError(raw))
      setSyncState('error')
    } finally {
      isSyncing.current = false
    }
  }, [user])

  const triggerSync = useCallback(() => {
    void runSync()
  }, [runSync])

  useEffect(() => {
    if (!user?.id) {
      loginSynced.current = null
      setSyncState('idle')
      return
    }
    if (loginSynced.current === user.id) return
    loginSynced.current = user.id
    void runSync()
  }, [user?.id, runSync])

  useEffect(() => {
    if (!user) return
    const interval = window.setInterval(() => {
      if (navigator.onLine) void runSync()
    }, SYNC_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [user, runSync])

  useEffect(() => {
    if (!user) return
    function onOnline() {
      void runSync()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [user, runSync])

  return { syncState, lastSyncAt, triggerSync, error }
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const value = useSyncManagerImpl()
  return createElement(SyncContext.Provider, { value }, children)
}

export function useSyncManager(): SyncManagerValue {
  const ctx = useContext(SyncContext)
  if (!ctx) {
    throw new Error('useSyncManager must be used within SyncProvider')
  }
  return ctx
}