import { useEffect } from 'react'
import { syncGlobalCatalog } from '@ryan/catalog'

/**
 * Chạy khi vào /app — áp dụng nội dung catalog mới sau deploy.
 * Đề Reading/Listening builtin đã có trong bundle; Dexie modules (cấu trúc câu, …) sync tại đây.
 */
export default function GlobalCatalogSync() {
  useEffect(() => {
    void syncGlobalCatalog()
  }, [])

  return null
}