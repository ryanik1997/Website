/**
 * Sync daily check-in (điểm danh) ↔ Supabase checkin_days.
 * Local mirror: reviewLog rows with mode=checkin, cardId=__checkin__.
 * Merge is set-union by day_key (YYYY-MM-DD) — never delete local days.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { db } from '@ryan/db'

export const CHECKIN_CARD_ID = '__checkin__'
export const CHECKIN_MODE = 'checkin' as const

type CloudCheckin = {
  day_key: string
  checked_at: string
}

/** Calculate the current attendance streak from check-in review logs. */
export function calcCheckInStreak(logs: Array<{ at: number }>): number {
  if (!logs.length) return 0
  const days = new Set(logs.map(log => checkInDateKey(new Date(log.at))))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const key = checkInDateKey(cursor)
    if (days.has(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function isMissingTableError(error: { message: string } | null): boolean {
  if (!error) return false
  const m = error.message.toLowerCase()
  return m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find')
}

/** Local calendar day key YYYY-MM-DD */
export function checkInDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Midday local for a day_key so streak math stays on that calendar day */
export function dayKeyToLocalMs(dayKey: string): number {
  const [y, m, d] = dayKey.split('-').map(Number)
  if (!y || !m || !d) return Date.now()
  return new Date(y, m - 1, d, 12, 0, 0, 0).getTime()
}

function isValidDayKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key)
}

async function loadLocalCheckinDays(): Promise<Map<string, number>> {
  const logs = await db.reviewLog.filter(l => l.mode === CHECKIN_MODE).toArray()
  const map = new Map<string, number>()
  for (const log of logs) {
    const key = checkInDateKey(new Date(log.at))
    const prev = map.get(key)
    if (prev == null || log.at < prev) map.set(key, log.at)
  }
  return map
}

/** Ensure local has a checkin row for dayKey (idempotent). */
export async function ensureLocalCheckInDay(dayKey: string, atMs?: number): Promise<boolean> {
  if (!isValidDayKey(dayKey)) return false
  const local = await loadLocalCheckinDays()
  if (local.has(dayKey)) return false
  await db.reviewLog.add({
    cardId: CHECKIN_CARD_ID,
    rating: 0,
    mode: CHECKIN_MODE,
    at: atMs ?? dayKeyToLocalMs(dayKey),
  })
  return true
}

/**
 * Push one day immediately after user taps check-in (best-effort).
 */
export async function pushCheckInDay(
  supabase: SupabaseClient,
  userId: string,
  dayKey: string,
  checkedAtMs = Date.now(),
): Promise<{ ok: boolean; skipped?: string }> {
  if (!isValidDayKey(dayKey)) return { ok: false, skipped: 'invalid day_key' }

  const { error } = await supabase.from('checkin_days').upsert(
    {
      user_id: userId,
      day_key: dayKey,
      checked_at: new Date(checkedAtMs).toISOString(),
    },
    { onConflict: 'user_id,day_key' },
  )

  if (error) {
    if (isMissingTableError(error)) {
      return {
        ok: false,
        skipped: 'Thiếu bảng checkin_days — admin chạy pnpm db:push (migration 017).',
      }
    }
    console.warn('[checkin] push day', error.message)
    return { ok: false, skipped: error.message }
  }
  return { ok: true }
}

/**
 * Bidirectional set-union of check-in days. Safe no-op if table missing.
 */
export async function syncCheckInDays(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ pushed: number; pulled: number; skipped?: string }> {
  let pushed = 0
  let pulled = 0

  const { data: cloudRows, error: pullErr } = await supabase
    .from('checkin_days')
    .select('day_key, checked_at')

  if (pullErr) {
    if (isMissingTableError(pullErr)) {
      return {
        pushed: 0,
        pulled: 0,
        skipped: 'Thiếu bảng checkin_days — admin chạy pnpm db:push (migration 017).',
      }
    }
    throw new Error(`checkin_days pull: ${pullErr.message}`)
  }

  const cloudMap = new Map<string, number>()
  for (const row of (cloudRows ?? []) as CloudCheckin[]) {
    if (!row?.day_key || !isValidDayKey(row.day_key)) continue
    const t = new Date(row.checked_at).getTime()
    cloudMap.set(row.day_key, Number.isFinite(t) ? t : dayKeyToLocalMs(row.day_key))
  }

  const localMap = await loadLocalCheckinDays()

  // Cloud → local
  for (const [dayKey, atMs] of cloudMap) {
    if (localMap.has(dayKey)) continue
    await ensureLocalCheckInDay(dayKey, atMs)
    localMap.set(dayKey, atMs)
    pulled++
  }

  // Local → cloud (days cloud lacks)
  const toPush: { user_id: string; day_key: string; checked_at: string }[] = []
  for (const [dayKey, atMs] of localMap) {
    if (cloudMap.has(dayKey)) continue
    toPush.push({
      user_id: userId,
      day_key: dayKey,
      checked_at: new Date(atMs).toISOString(),
    })
  }

  const CHUNK = 100
  for (let i = 0; i < toPush.length; i += CHUNK) {
    const chunk = toPush.slice(i, i + CHUNK)
    const { error } = await supabase.from('checkin_days').upsert(chunk, {
      onConflict: 'user_id,day_key',
    })
    if (error) {
      if (isMissingTableError(error)) {
        return {
          pushed,
          pulled,
          skipped: 'Thiếu bảng checkin_days — admin chạy pnpm db:push (migration 017).',
        }
      }
      throw new Error(`checkin_days upsert: ${error.message}`)
    }
    pushed += chunk.length
  }

  return { pushed, pulled }
}
