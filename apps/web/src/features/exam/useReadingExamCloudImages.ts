import { useCallback, useEffect, useState } from 'react'
import {
  listReadingExamCloudImages,
  type ReadingExamCloudImage,
} from './readingExamCloudImages'

export function useReadingExamCloudImages(examId: string | undefined) {
  const [images, setImages] = useState<ReadingExamCloudImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!examId) {
      setImages([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const rows = await listReadingExamCloudImages(examId)
      setImages(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được ảnh đề.')
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [examId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { images, loading, error, refresh }
}