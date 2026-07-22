import { useCallback, useState } from 'react'

/**
 * Prevents exam draft save effects from overwriting localStorage with empty
 * initial state before the load effect restores a saved draft.
 *
 * Usage:
 *   const { isHydrated, markHydrated } = useExamDraftGate(storageKey)
 *   // end of load effect: markHydrated()
 *   // start of save effect: if (!isHydrated) return
 */
export function useExamDraftGate(storageKey: string) {
  const [hydratedKey, setHydratedKey] = useState<string | null>(null)
  const isHydrated = Boolean(storageKey) && hydratedKey === storageKey

  const markHydrated = useCallback(() => {
    if (!storageKey) return
    setHydratedKey(storageKey)
  }, [storageKey])

  return { isHydrated, markHydrated }
}
