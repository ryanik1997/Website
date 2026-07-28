import { useEffect, useState } from 'react'
import { audioRepo } from '@ryan/db'
import { resolveExamMediaUrl } from './examMediaUrl'

/**
 * Resolve ảnh/audio từ Dexie blob key và/hoặc URL tĩnh (catalog / cloud).
 *
 * Ưu tiên **blobKey** (media import local) trước static URL.
 * Trước đây static thắng → import ZIP xong vẫn hiện ảnh catalog (sai).
 */
export function useBlobMediaUrl(blobKey?: string, staticUrl?: string): string | null {
  const resolvedStatic = resolveExamMediaUrl(staticUrl)
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    async function load() {
      if (blobKey) {
        try {
          const record = await audioRepo.get(blobKey)
          if (cancelled) return
          if (record?.blob) {
            objectUrl = URL.createObjectURL(record.blob)
            setUrl(objectUrl)
            return
          }
        } catch {
          /* fall through to static */
        }
      }

      if (cancelled) return
      setUrl(resolvedStatic ?? null)
    }

    void load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [blobKey, resolvedStatic])

  return url
}
