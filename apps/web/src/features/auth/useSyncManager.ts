import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { syncLocalToCloud, syncCloudToLocal, isLocalEmpty } from '@ryan/db'
import type { Session } from '@supabase/supabase-js'
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
  if (
    m.includes('jwt expired')
    || m.includes('invalid jwt')
    || m.includes('invalid claim')
    || m.includes('session from session_id claim in jwt does not exist')
    || m.includes('refresh_token')
    || m.includes('not authenticated')
    || m.includes('no session')
  ) {
    return 'Phiên đăng nhập hết hạn — thử đăng xuất và đăng nhập lại.'
  }
  if (m.includes('row-level security') || m.includes('violates row-level security') || m.includes('rls')) {
    return 'Không có quyền ghi lên đám mây (RLS). Kiểm tra đã đăng nhập đúng tài khoản; nếu vẫn lỗi, đăng xuất/đăng nhập lại.'
  }
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('fetch failed')) {
    return 'Không kết nối được Supabase — kiểm tra mạng hoặc cấu hình VITE_SUPABASE_URL.'
  }
  if (m.includes('invalid input syntax for type uuid') && m.includes('preset:')) {
    return 'Bộ từ preset (IELTS, Oxford, …) không đồng bộ cloud — chỉ deck do bạn tạo được sync. Hãy refresh trang và thử lại.'
  }
  if (m.includes('invalid input syntax for type uuid')) {
    return 'Dữ liệu local có id không hợp lệ khi đồng bộ. Thử backup, rồi xóa dữ liệu hỏng hoặc liên hệ admin.'
  }
  // Tránh map mọi lỗi chứa "jwt" substring mơ hồ
  if (m.includes('jwt') && (m.includes('expired') || m.includes('invalid') || m.includes('malformed'))) {
    return 'Phiên đăng nhập không hợp lệ — thử đăng xuất và đăng nhập lại.'
  }
  return message
}

/**
 * Đảm bảo access token còn hạn và hợp lệ trước khi gọi PostgREST.
 * getUser() xác thực với server Auth; refresh nếu local session sắp hết.
 */
async function ensureFreshSession(): Promise<{ userId: string; session: Session }> {
  const { data: current, error: getErr } = await supabase.auth.getSession()
  if (getErr) throw new Error(getErr.message)

  let session = current.session
  if (!session) throw new Error('no session')

  const expiresAt = session.expires_at ?? 0
  const nowSec = Math.floor(Date.now() / 1000)
  const needsRefresh = !expiresAt || expiresAt - nowSec < 120

  if (needsRefresh) {
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession()
    if (refreshErr) throw new Error(refreshErr.message || 'refresh_token failed')
    session = refreshed.session
    if (!session) throw new Error('no session')
  }

  // Xác thực JWT với server (bắt token hỏng / revoked sớm, tránh lỗi RLS mơ hồ)
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) {
    // Thử refresh một lần rồi getUser lại
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession()
    if (refreshErr) throw new Error(userErr.message || refreshErr.message || 'invalid jwt')
    session = refreshed.session
    if (!session) throw new Error('no session')
    const retry = await supabase.auth.getUser()
    if (retry.error || !retry.data.user) {
      throw new Error(retry.error?.message || 'invalid jwt')
    }
    return { userId: retry.data.user.id, session }
  }

  const userId = userData.user?.id ?? session.user?.id
  if (!userId) throw new Error('no session')
  return { userId, session }
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
      const { userId } = await ensureFreshSession()

      const empty = await isLocalEmpty()
      if (empty) {
        await syncCloudToLocal(supabase)
      } else {
        // Máy có nội dung user: push local, rồi (tuỳ chọn) không overwrite local
        await syncLocalToCloud(supabase, userId)
      }

      // Thiết bị đã có preset nhưng chưa có user data local: pull bổ sung cloud
      // (isLocalEmpty false vì preset → không vào nhánh trên). Chỉ pull khi local
      // không có deck user — đã cover bởi isLocalEmpty.
      // Nếu local có user data: push là đủ.

      const now = new Date().toISOString()
      writeLastSyncAt(now)
      setLastSyncAt(now)
      setSyncState('done')
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Đồng bộ thất bại'
      console.warn('[sync]', raw, e)
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
    // Đợi một nhịp sau login để session storage settle
    const t = window.setTimeout(() => {
      void runSync()
    }, 400)
    return () => window.clearTimeout(t)
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

  // Khi token refresh / token refreshed — retry sync nếu lần trước lỗi phiên
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        if (error && /phiên đăng nhập|hết hạn|jwt/i.test(error)) {
          void runSync()
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [error, runSync])

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
