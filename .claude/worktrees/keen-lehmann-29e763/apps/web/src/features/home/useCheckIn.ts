import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import type { ReviewLog } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import {
  CHECKIN_CARD_ID,
  CHECKIN_MODE,
  calcCheckInStreak,
  checkInDateKey,
  pushCheckInDay,
} from './checkInSync'

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
