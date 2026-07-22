import { useState, useEffect, useCallback, useRef } from 'react'

export function timerMinutesForType(type: string): number | null {
  if (type === 'ielts_task1') return 20
  if (type === 'ielts_task2' || type === 'ielts') return 60
  if (type === 'cambridge_a2') return 20
  if (type === 'cambridge_b1') return 30
  if (type === 'cambridge_b2') return 40
  if (type === 'cambridge_c1') return 45
  if (type === 'cambridge_c2') return 60
  return null
}

function formatMmSs(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function useWritingTimer(docId: string | undefined, type: string) {
  const minutes = timerMinutesForType(type)
  const totalSec = minutes ? minutes * 60 : 0
  const [remaining, setRemaining] = useState(totalSec)
  const [paused, setPaused] = useState(false)
  const docRef = useRef(docId)

  useEffect(() => {
    if (docRef.current !== docId) {
      docRef.current = docId
      setRemaining(totalSec)
      setPaused(false)
    }
  }, [docId, totalSec])

  useEffect(() => {
    if (!minutes || paused || remaining <= 0) return
    const t = window.setInterval(() => {
      setRemaining(r => Math.max(0, r - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [minutes, paused, remaining])

  const reset = useCallback(() => {
    setRemaining(totalSec)
    setPaused(false)
  }, [totalSec])

  const togglePause = useCallback(() => setPaused(p => !p), [])

  return {
    enabled: !!minutes,
    remaining,
    label: formatMmSs(remaining),
    urgent: remaining > 0 && remaining <= 60,
    warn: remaining > 0 && remaining <= 300,
    paused,
    togglePause,
    reset,
  }
}