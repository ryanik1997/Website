import { useEffect, useState } from 'react'
import { audioRepo } from '@ryan/db'
import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'

/**
 * Resolve ảnh/audio từ Dexie blob key và/hoặc URL tĩnh (catalog / cloud).
 *
 * Ưu tiên **blobKey** (media import local) trước static URL.
 * Mode A: static /catalog/* → signed URL in production.
 */
export function useBlobMediaUrl(blobKey?: string, staticUrl?: string): string | null {
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
      if (!staticUrl?.trim()) {
        setUrl(null)
        return
      }
      try {
        const resolved = await resolvePlayableMediaUrl(staticUrl)
        if (cancelled) return
        setUrl(resolved ?? null)
      } catch (err) {
        console.warn('[useBlobMediaUrl] resolve failed', staticUrl, err)
        if (!cancelled) setUrl(null)
      }
    }

    void load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [blobKey, staticUrl])

  return url
}
