import { useCallback, useEffect, useMemo, useState } from 'react'

export type SelectionStatus = 'undecided' | 'yes' | 'no'

function buildStorageKey(level: string, testId: string) {
  return `cambridge-writing-selection:${level}:${testId}`
}

export function useCambridgeWritingQuestionSelection(
  level: string,
  testId: string,
  taskIds: string[],
) {
  const storageKey = useMemo(() => buildStorageKey(level, testId), [level, testId])
  const taskIdsKey = taskIds.join('\u0000')
  const [selection, setSelection] = useState<Record<string, SelectionStatus>>({})

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      const parsed = raw ? JSON.parse(raw) as Record<string, SelectionStatus> : {}
      const normalized = Object.fromEntries(
        taskIds.map((taskId) => [taskId, parsed[taskId] ?? 'undecided']),
      ) as Record<string, SelectionStatus>
      setSelection(normalized)
    } catch {
      setSelection(
        Object.fromEntries(taskIds.map((taskId) => [taskId, 'undecided'])) as Record<string, SelectionStatus>,
      )
    }
  }, [storageKey, taskIdsKey])

  useEffect(() => {
    if (taskIds.length === 0) return
    window.localStorage.setItem(storageKey, JSON.stringify(selection))
  }, [selection, storageKey, taskIds.length])

  const updateSelection = useCallback((taskId: string, nextStatus: SelectionStatus) => {
    setSelection((previous) => {
      if (nextStatus !== 'yes') {
        return { ...previous, [taskId]: nextStatus }
      }
      return Object.fromEntries(
        taskIds.map((id) => [id, id === taskId ? 'yes' : 'no']),
      ) as Record<string, SelectionStatus>
    })
  }, [taskIdsKey])

  const selectedCount = useMemo(
    () => taskIds.filter((taskId) => selection[taskId] === 'yes').length,
    [selection, taskIds],
  )

  return {
    selection,
    selectedCount,
    updateSelection,
  }
}
