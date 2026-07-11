import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import type { ReviewLog } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import {
  CHECKIN_CARD_ID,
  CHECKIN_MODE,
  checkInDateKey,
  pushCheckInDay,
} from './checkInSync'

function calcCheckInStreak(logs: ReviewLog[]): number {
  if (!logs.length) return 0
  const days = new Set(logs.map(l => checkInDateKey(new Date(l.at))))
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

export function useCheckIn() {
  const [pending, setPending] = useState(false)
  const checkInLogs = useLiveQuery(async () => {
    const all = await db.reviewLog.toArray()
    return all.filter(l => l.mode === CHECKIN_MODE)
  }, []) ?? []

  const checkedInToday = useMemo(
    () => checkInLogs.some(l => checkInDateKey(new Date(l.at)) === checkInDateKey()),
    [checkInLogs],
  )

  const checkInStreak = useMemo(() => calcCheckInStreak(checkInLogs), [checkInLogs])

  async function checkIn(): Promise<boolean> {
    if (checkedInToday || pending) return false
    setPending(true)
    try {
      const at = Date.now()
      const dayKey = checkInDateKey(new Date(at))
      await db.reviewLog.add({
        cardId: CHECKIN_CARD_ID,
        rating: 0,
        mode: CHECKIN_MODE,
        at,
      })

      // Best-effort cloud push when logged in (full merge still runs on sync)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (userId && navigator.onLine) {
          const result = await pushCheckInDay(supabase, userId, dayKey, at)
          if (result.skipped) console.info('[checkin] push:', result.skipped)
        }
      } catch (err) {
        console.warn('[checkin] cloud push failed (will retry on sync)', err)
      }

      return true
    } finally {
      setPending(false)
    }
  }

  return { checkedInToday, checkInStreak, checkIn, pending }
}
