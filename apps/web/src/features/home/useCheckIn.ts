import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'
import type { ReviewLog } from '@ryan/db'

const CHECKIN_CARD_ID = '__checkin__'

function dateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calcCheckInStreak(logs: ReviewLog[]): number {
  if (!logs.length) return 0
  const days = new Set(logs.map(l => dateKey(new Date(l.at))))
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const key = dateKey(cursor)
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
    return all.filter(l => l.mode === 'checkin')
  }, []) ?? []

  const checkedInToday = useMemo(
    () => checkInLogs.some(l => dateKey(new Date(l.at)) === dateKey()),
    [checkInLogs],
  )

  const checkInStreak = useMemo(() => calcCheckInStreak(checkInLogs), [checkInLogs])

  async function checkIn(): Promise<boolean> {
    if (checkedInToday || pending) return false
    setPending(true)
    try {
      await db.reviewLog.add({
        cardId: CHECKIN_CARD_ID,
        rating: 0,
        mode: 'checkin',
        at: Date.now(),
      })
      return true
    } finally {
      setPending(false)
    }
  }

  return { checkedInToday, checkInStreak, checkIn, pending }
}
