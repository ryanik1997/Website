import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@ryan/db'

const DAY_MS = 86_400_000
const DAYS = 60

export interface StudyDayCell {
  date: string
  label: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

function dayKey(at: number): string {
  return new Date(at).toISOString().slice(0, 10)
}

function intensityLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

export function useStudyActivity60() {
  const reviewLogs = useLiveQuery(() => db.reviewLog.toArray(), []) ?? []

  return useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const countsByDay = new Map<string, number>()
    for (const log of reviewLogs) {
      const key = dayKey(log.at)
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1)
    }

    const days: StudyDayCell[] = []
    let maxCount = 0
    let totalInPeriod = 0
    let activeDays = 0

    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY_MS)
      const key = d.toISOString().slice(0, 10)
      const count = countsByDay.get(key) ?? 0
      if (count > maxCount) maxCount = count
      totalInPeriod += count
      if (count > 0) activeDays++
      days.push({
        date: key,
        label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' }),
        count,
        level: 0,
      })
    }

    for (const day of days) {
      day.level = intensityLevel(day.count, maxCount)
    }

    return { days, maxCount, totalInPeriod, activeDays }
  }, [reviewLogs])
}