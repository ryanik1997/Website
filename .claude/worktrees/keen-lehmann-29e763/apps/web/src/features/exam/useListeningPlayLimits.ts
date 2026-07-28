import { useCallback, useState } from 'react'
import type { ListeningExamMode } from './listeningExamData'

export function useListeningPlayLimits(examMode: ListeningExamMode) {
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({})

  const canPlay = useCallback((key: string, maxPlays?: number) => {
    if (examMode !== 'exam' || maxPlays == null) return true
    return (playCounts[key] ?? 0) < maxPlays
  }, [examMode, playCounts])

  const playsLeft = useCallback((key: string, maxPlays?: number): number | null => {
    if (examMode !== 'exam' || maxPlays == null) return null
    return Math.max(0, maxPlays - (playCounts[key] ?? 0))
  }, [examMode, playCounts])

  const recordPlay = useCallback((key: string) => {
    setPlayCounts(prev => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }))
  }, [])

  const resetPlayCounts = useCallback(() => setPlayCounts({}), [])

  return { canPlay, playsLeft, recordPlay, resetPlayCounts }
}