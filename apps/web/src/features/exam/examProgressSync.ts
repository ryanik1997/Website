/**
 * Sync Reading/Listening exam drafts (localStorage) ↔ Supabase exam_progress.
 * Conflict resolution: last-write-wins by payload.updatedAt (ms).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { db, changedSince, createSyncWindow, getSyncServerTime, SYNC_PAGE_SIZE } from '@ryan/db'
import {
  LISTENING_DRAFT_PREFIX,
  READING_DRAFT_PREFIX,
} from './examCompletion'
import { notifyExamDraftRevision } from './useExamDraftRevision'

export type ExamSkill = 'reading' | 'listening'

type CloudExamProgress = {
  skill: ExamSkill
  exam_id: string
  payload: Record<string, unknown>
  updated_at: string
}

function isMissingTableError(error: { message: string } | null): boolean {
  if (!error) return false
  const m = error.message.toLowerCase()
  return m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find')
}

function toMs(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    if (Number.isFinite(n) && n > 1e11) return n
    const t = new Date(value).getTime()
    return Number.isNaN(t) ? 0 : t
  }
  return 0
}

function parsePayload(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null
  try {
    const obj = JSON.parse(raw) as unknown
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null
    return obj as Record<string, unknown>
  } catch {
    return null
  }
}

function ensureUpdatedAt(payload: Record<string, unknown>): Record<string, unknown> {
  if (toMs(payload.updatedAt) > 0) return payload
  // Legacy drafts without timestamp: treat as "just now" so first online push wins
  // once, then stamp so subsequent merges are stable.
  return { ...payload, updatedAt: Date.now() }
}

function collectLocalDrafts(skill: ExamSkill): Map<string, Record<string, unknown>> {
  const prefix = skill === 'reading' ? READING_DRAFT_PREFIX : LISTENING_DRAFT_PREFIX
  const out = new Map<string, Record<string, unknown>>()
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key || !key.startsWith(prefix)) continue
      const examId = key.slice(prefix.length)
      if (!examId) continue
      const payload = parsePayload(window.localStorage.getItem(key))
      if (!payload) continue
      const stamped = ensureUpdatedAt(payload)
      // Persist stamp if we added it
      if (stamped.updatedAt !== payload.updatedAt) {
        try {
          window.localStorage.setItem(key, JSON.stringify(stamped))
        } catch {
          /* quota */
        }
      }
      out.set(examId, stamped)
    }
  } catch {
    /* private mode */
  }
  return out
}

function writeLocalDraft(skill: ExamSkill, examId: string, payload: Record<string, unknown>): void {
  const prefix = skill === 'reading' ? READING_DRAFT_PREFIX : LISTENING_DRAFT_PREFIX
  const stamped = ensureUpdatedAt(payload)
  try {
    window.localStorage.setItem(`${prefix}${examId}`, JSON.stringify(stamped))
  } catch {
    /* quota */
  }
}

/**
 * Bidirectional merge of exam drafts. Safe no-op if table missing (migration not applied).
 */
export async function syncExamProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ pushed: number; pulled: number; conflicts: number; skipped?: string }> {
  let pushed = 0
  let pulled = 0
  let conflicts = 0

  const cursorKey = `cloud-sync-cursor:exam-progress:${userId}`
  const localCursorKey = `local-sync-cursor:exam-progress:${userId}`
  const localUpperBoundIso = new Date().toISOString()
  const [cursorSetting, localCursorSetting, serverTime] = await Promise.all([
    db.settings.get(cursorKey),
    db.settings.get(localCursorKey),
    getSyncServerTime(supabase, localUpperBoundIso),
  ])
  const window = createSyncWindow(
    typeof cursorSetting?.value === 'string' ? cursorSetting.value : null,
    serverTime.iso,
  )
  const localWindow = createSyncWindow(
    typeof localCursorSetting?.value === 'string' ? localCursorSetting.value : null,
    localUpperBoundIso,
  )

  const cloudRows: CloudExamProgress[] = []
  let pullErr: { message: string } | null = null
  for (let from = 0; ; from += SYNC_PAGE_SIZE) {
    let query = supabase
      .from('exam_progress')
      .select('skill, exam_id, payload, updated_at')
      .eq('user_id', userId)
      .lte('updated_at', window.upperBoundIso)
      .order('updated_at', { ascending: true })
      .order('skill', { ascending: true })
      .order('exam_id', { ascending: true })
      .range(from, from + SYNC_PAGE_SIZE - 1)
    if (window.pullAfterIso) query = query.gt('updated_at', window.pullAfterIso)
    const result = await query
    if (result.error) { pullErr = result.error; break }
    const page = (result.data ?? []) as CloudExamProgress[]
    cloudRows.push(...page)
    if (page.length < SYNC_PAGE_SIZE) break
  }

  if (pullErr) {
    if (isMissingTableError(pullErr)) {
      return {
        pushed: 0,
        pulled: 0,
        conflicts: 0,
        skipped: 'Thiếu bảng exam_progress — admin chạy pnpm db:push (migration 014).',
      }
    }
    throw new Error(`exam_progress pull: ${pullErr.message}`)
  }

  const cloudByKey = new Map<string, CloudExamProgress>()
  for (const row of cloudRows) {
    cloudByKey.set(`${row.skill}:${row.exam_id}`, row)
  }

  const rowsToUpsert: {
    user_id: string
    skill: ExamSkill
    exam_id: string
    payload: Record<string, unknown>
    updated_at: string
  }[] = []

  let localChanged = false

  for (const skill of ['reading', 'listening'] as ExamSkill[]) {
    const localMap = collectLocalDrafts(skill)

    for (const [examId, localPayload] of localMap) {
      const key = `${skill}:${examId}`
      const remote = cloudByKey.get(key)
      const localTs = toMs(localPayload.updatedAt)

      if (!remote) {
        if (!changedSince(localWindow, localTs)) continue
        rowsToUpsert.push({
          user_id: userId,
          skill,
          exam_id: examId,
          payload: localPayload,
          updated_at: new Date(localTs || Date.now()).toISOString(),
        })
        continue
      }

      const remotePayload =
        remote.payload && typeof remote.payload === 'object' && !Array.isArray(remote.payload)
          ? (remote.payload as Record<string, unknown>)
          : {}
      const remoteTs = Math.max(toMs(remotePayload.updatedAt), toMs(remote.updated_at))

      if (localTs >= remoteTs) {
        if (localTs !== remoteTs) conflicts += 1
        rowsToUpsert.push({
          user_id: userId,
          skill,
          exam_id: examId,
          payload: localPayload,
          updated_at: new Date(localTs || Date.now()).toISOString(),
        })
      } else {
        writeLocalDraft(skill, examId, { ...remotePayload, updatedAt: remoteTs })
        pulled += 1
        conflicts += 1
        localChanged = true
      }
    }

    // Cloud-only drafts → local
    for (const [key, remote] of cloudByKey) {
      if (!key.startsWith(`${skill}:`)) continue
      const examId = key.slice(skill.length + 1)
      const localExisting = localMap.get(examId)
      if (localExisting && changedSince(localWindow, toMs(localExisting.updatedAt))) continue
      const remotePayload =
        remote.payload && typeof remote.payload === 'object' && !Array.isArray(remote.payload)
          ? (remote.payload as Record<string, unknown>)
          : {}
      writeLocalDraft(skill, examId, {
        ...remotePayload,
        updatedAt: Math.max(toMs(remotePayload.updatedAt), toMs(remote.updated_at)) || Date.now(),
      })
      pulled += 1
      localChanged = true
    }
  }

  if (rowsToUpsert.length) {
    // Chunk to avoid payload limits
    const CHUNK = 50
    for (let i = 0; i < rowsToUpsert.length; i += CHUNK) {
      const chunk = rowsToUpsert.slice(i, i + CHUNK)
      const { error } = await supabase.from('exam_progress').upsert(chunk, {
        onConflict: 'user_id,skill,exam_id',
      })
      if (error) {
        if (isMissingTableError(error)) {
          return {
            pushed: 0,
            pulled,
            conflicts,
            skipped: 'Thiếu bảng exam_progress — admin chạy pnpm db:push (migration 014).',
          }
        }
        throw new Error(`exam_progress upsert: ${error.message}`)
      }
      for (const row of chunk) {
        writeLocalDraft(row.skill, row.exam_id, { ...row.payload, updatedAt: toMs(window.upperBoundIso) })
      }
      pushed += chunk.length
    }
  }

  if (serverTime.authoritative) {
    await db.settings.put({ key: cursorKey, value: window.upperBoundIso })
  }
  await db.settings.put({ key: localCursorKey, value: localWindow.upperBoundIso })

  if (localChanged) notifyExamDraftRevision()

  return { pushed, pulled, conflicts }
}

/**
 * Stamp updatedAt on an exam draft object before localStorage write.
 * Call from test UIs when saving drafts.
 */
export function withDraftUpdatedAt<T extends Record<string, unknown>>(payload: T): T & { updatedAt: number } {
  return { ...payload, updatedAt: Date.now() }
}
