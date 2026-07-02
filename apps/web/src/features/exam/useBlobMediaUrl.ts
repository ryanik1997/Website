import { useEffect, useState } from 'react'
import { audioRepo } from '@ryan/db'
import { resolveExamMediaUrl } from './examMediaUrl'

/** Resolve ảnh/audio preview từ public URL hoặc Dexie blob key */
export function useBlobMediaUrl(blobKey?: string, staticUrl?: string): string | null {
  const resolvedStatic = resolveExamMediaUrl(staticUrl)
  const [url, setUrl] = useState<string | null>(resolvedStatic ?? null)

  useEffect(() => {
    if (resolvedStatic) {
      setUrl(resolvedStatic)
      return
    }
    if (!blobKey) {
      setUrl(null)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    void audioRepo.get(blobKey).then(record => {
      if (cancelled) return
      if (record?.blob) {
        objectUrl = URL.createObjectURL(record.blob)
        setUrl(objectUrl)
      } else {
        setUrl(null)
      }
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [blobKey, resolvedStatic])

  return url
}