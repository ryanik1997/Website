import { useEffect } from 'react'
import { syncGlobalCatalog } from '@ryan/catalog'
import { syncAdminPublishedContent } from '../admin/syncAdminPublishedContent'

/**
 * Chạy khi vào /app — catalog sau deploy + nội dung Admin publish trên Supabase.
 */
export default function GlobalCatalogSync() {
  useEffect(() => {
    void syncGlobalCatalog()
    void syncAdminPublishedContent()
  }, [])

  return null
}