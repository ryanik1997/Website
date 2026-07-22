import { useCallback, useState } from 'react'
import { EXAM_IMPORTS_ONLY_STORAGE_KEY } from './examListFilter'

function readImportsOnlyPreference(): boolean {
  try {
    return localStorage.getItem(EXAM_IMPORTS_ONLY_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function useExamImportsOnlyFilter() {
  const [importsOnly, setImportsOnly] = useState(readImportsOnlyPreference)

  const toggleImportsOnly = useCallback(() => {
    setImportsOnly(prev => {
      const next = !prev
      try {
        localStorage.setItem(EXAM_IMPORTS_ONLY_STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore quota / private mode */
      }
      return next
    })
  }, [])

  return { importsOnly, toggleImportsOnly }
}