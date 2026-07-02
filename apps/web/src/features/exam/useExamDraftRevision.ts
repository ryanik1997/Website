import { useCallback, useSyncExternalStore } from 'react'

const REVISION_EVENT = 'exam-draft-revision'

export function notifyExamDraftRevision(): void {
  const next = Number(window.localStorage.getItem('exam-draft-revision') ?? '0') + 1
  window.localStorage.setItem('exam-draft-revision', String(next))
  window.dispatchEvent(new Event(REVISION_EVENT))
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(REVISION_EVENT, onStoreChange)
  window.addEventListener('storage', onStoreChange)
  return () => {
    window.removeEventListener(REVISION_EVENT, onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

/** Re-render khi localStorage draft đề thi thay đổi (nộp bài, làm lại). */
export function useExamDraftRevision(): number {
  const getSnapshot = useCallback(() => {
    return Number(window.localStorage.getItem('exam-draft-revision') ?? '0')
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => 0)
}