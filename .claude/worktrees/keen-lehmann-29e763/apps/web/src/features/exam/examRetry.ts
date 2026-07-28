/** Xóa bản nháp localStorage để bắt đầu lại từ đầu */
export function clearExamDraftStorage(storageKey: string): void {
  if (!storageKey) return
  window.localStorage.removeItem(storageKey)
}