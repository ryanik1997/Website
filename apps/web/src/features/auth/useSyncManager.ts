import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { syncBidirectional } from '@ryan/db'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useAuth } from './AuthContext'
import { syncExamProgress } from '../exam/examProgressSync'
import { syncCheckInDays } from '../home/checkInSync'
import { syncAdminPublishedExams } from '../admin/syncAdminPublishedExams'
import {
  loginSyncDelay,
  periodicSyncDelay,
  reconnectSyncDelay,
  retrySyncDelay,
  SYNC_CHANGE_DEBOUNCE_MS,
} from './syncTiming'

export type SyncState = 'idle' | 'syncing' | 'done' | 'error'

const LAST_SYNC_KEY = 'ryan-last-sync'

async function seedPresetDecksForSync(): Promise<void> {
  const { seedPresetDecks } = await import('../vocab/vocabSeedDecks')
  await seedPresetDecks()
}

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
    // User chỉ ghi data cá nhân (deck/card/srs/writing/mindmap/exam_progress của mình).
    // Luyện thi & Vocab mặc định = bảng admin publish — user chỉ đọc, không ghi.
    if (
      m.includes('reading_exam_published')
      || m.includes('listening_exam_published')
      || m.includes('admin_published')
      || m.includes('reading_exam_images')
    ) {
      return 'Bảng Luyện thi / Vocab chung chỉ Admin được ghi. User import đề hoặc tạo deck riêng vẫn lưu máy (và sync data cá nhân). Đăng xuất/đăng nhập nếu vừa được cấp admin.'
    }
    return (
      'Không có quyền ghi dữ liệu cá nhân lên đám mây (RLS). '
      + 'User chỉ đồng bộ deck/từ/writing/mindmap của chính mình — không ghi đề Luyện thi chung. '
      + 'Thử: đăng xuất → đăng nhập lại. Admin chạy migration 015_user_data_rls_harden.sql nếu nhiều user cùng lỗi.'
    )
  }
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('fetch failed')) {
    return 'Không kết nối được Supabase — kiểm tra mạng hoặc cấu hình VITE_SUPABASE_URL.'
  }
  if (m.includes('invalid input syntax for type uuid') && m.includes('preset:')) {
    return 'Bộ từ preset (IELTS, Oxford, …) không đồng bộ cloud — chỉ deck do bạn tạo được sync. Hãy refresh trang và thử lại.'
  }
  if (m.includes('exam_progress') && (m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find'))) {
    return 'Thiếu bảng exam_progress trên Supabase — admin chạy pnpm db:push (migration 014).'
  }
  if (m.includes('checkin_days') && (m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find'))) {
    return 'Thiếu bảng checkin_days trên Supabase — admin chạy pnpm db:push (migration 017).'
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
  const syncAgain = useRef(false)
  const loginSynced = useRef<string | null>(null)
  const retryAttempt = useRef(0)
  const retryTimer = useRef<number | null>(null)
  const manualTimer = useRef<number | null>(null)
  const reconnectTimer = useRef<number | null>(null)

  const runSync = useCallback(async () => {
    if (!user) return
    if (isSyncing.current) {
      syncAgain.current = true
      return
    }

    isSyncing.current = true
    setSyncState('syncing')
    setError(null)

    try {
      const { userId } = await ensureFreshSession()

      // Seed + dedupe preset TRƯỚC sync — để nhận diện ghost UUID trên cloud (tránh double Bộ từ vựng)
      try {
        await seedPresetDecksForSync()
      } catch (seedErr) {
        console.warn('[sync] seedPresetDecks before', seedErr)
      }

      // Bidirectional LWW: merge decks/cards/srs/writing/mindmaps (offline→online safe)
      await syncBidirectional(supabase, userId)

      // Sau pull: gộp lại deck/card trùng (preset vs ghost, phrase double)
      try {
        await seedPresetDecksForSync()
      } catch (seedErr) {
        console.warn('[sync] seedPresetDecks after', seedErr)
      }

      // Reading/Listening exam drafts (localStorage ↔ exam_progress)
      try {
        const examResult = await syncExamProgress(supabase, userId)
        if (examResult.skipped) {
          console.info('[sync] exam_progress:', examResult.skipped)
        }
      } catch (examErr) {
        // Non-fatal: vocab/writing still synced
        console.warn('[sync] exam progress', examErr)
      }

      // Điểm danh (reviewLog checkin ↔ checkin_days)
      try {
        const checkInResult = await syncCheckInDays(supabase, userId)
        if (checkInResult.skipped) {
          console.info('[sync] checkin_days:', checkInResult.skipped)
        } else if (checkInResult.pushed || checkInResult.pulled) {
          console.info(
            '[sync] checkin_days: pushed',
            checkInResult.pushed,
            'pulled',
            checkInResult.pulled,
          )
        }
      } catch (checkInErr) {
        console.warn('[sync] check-in', checkInErr)
      }

      // Admin publish prune: đề Reading/Listening Admin xoá → dọn cache local
      try {
        const pruneResult = await syncAdminPublishedExams()
        if (pruneResult.readingPruned || pruneResult.listeningPruned) {
          console.info(
            '[sync] admin exams pruned: reading',
            pruneResult.readingPruned,
            'listening',
            pruneResult.listeningPruned,
          )
        }
      } catch (pruneErr) {
        console.warn('[sync] admin exam prune', pruneErr)
      }

      const now = new Date().toISOString()
      writeLastSyncAt(now)
      setLastSyncAt(now)
      setSyncState('done')
      retryAttempt.current = 0
      if (retryTimer.current != null) {
        window.clearTimeout(retryTimer.current)
        retryTimer.current = null
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Đồng bộ thất bại'
      console.warn('[sync]', raw, e)
      setError(friendlySyncError(raw))
      setSyncState('error')
      const delay = retrySyncDelay(retryAttempt.current)
      if (delay != null && navigator.onLine) {
        retryAttempt.current += 1
        if (retryTimer.current != null) window.clearTimeout(retryTimer.current)
        retryTimer.current = window.setTimeout(() => void runSync(), delay)
      }
    } finally {
      isSyncing.current = false
      if (syncAgain.current) {
        syncAgain.current = false
        if (retryTimer.current != null) {
          window.clearTimeout(retryTimer.current)
          retryTimer.current = null
        }
        window.setTimeout(() => void runSync(), 0)
      }
    }
  }, [user])

  const triggerSync = useCallback(() => {
    if (manualTimer.current != null) window.clearTimeout(manualTimer.current)
    manualTimer.current = window.setTimeout(() => void runSync(), SYNC_CHANGE_DEBOUNCE_MS)
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
    }, loginSyncDelay())
    return () => window.clearTimeout(t)
  }, [user?.id, runSync])

  useEffect(() => {
    if (!user) return
    let timer: number | null = null
    let cancelled = false
    const schedule = () => {
      timer = window.setTimeout(async () => {
        if (!cancelled && navigator.onLine) await runSync()
        if (!cancelled) schedule()
      }, periodicSyncDelay())
    }
    schedule()
    return () => {
      cancelled = true
      if (timer != null) window.clearTimeout(timer)
    }
  }, [user, runSync])

  useEffect(() => {
    if (!user) return
    function onOnline() {
      if (reconnectTimer.current != null) window.clearTimeout(reconnectTimer.current)
      reconnectTimer.current = window.setTimeout(() => void runSync(), reconnectSyncDelay())
    }
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('online', onOnline)
      if (reconnectTimer.current != null) window.clearTimeout(reconnectTimer.current)
    }
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

  useEffect(() => () => {
    if (retryTimer.current != null) window.clearTimeout(retryTimer.current)
    if (manualTimer.current != null) window.clearTimeout(manualTimer.current)
    if (reconnectTimer.current != null) window.clearTimeout(reconnectTimer.current)
  }, [])

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
