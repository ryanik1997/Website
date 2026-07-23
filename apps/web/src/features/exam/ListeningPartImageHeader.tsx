import { useEffect, useState } from 'react'
import ReadingHighlightableText from './ReadingHighlightableText'
import { useExamHighlights } from './examHighlightContext'
import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'

interface Props {
  partId: string
  passageTitle?: string
  partImageUrl?: string
}

export default function ListeningPartImageHeader({
  partId,
  passageTitle,
  partImageUrl,
}: Props) {
  const highlights = useExamHighlights()
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!partImageUrl?.trim()) {
        setImageSrc(null)
        return
      }
      try {
        const url = await resolvePlayableMediaUrl(partImageUrl)
        if (!cancelled) setImageSrc(url ?? null)
      } catch {
        if (!cancelled) setImageSrc(null)
      }
    })()
    return () => { cancelled = true }
  }, [partImageUrl])

  if (!passageTitle && !imageSrc) return null

  return (
    <div className="listening-part-image-header">
      {passageTitle && (
        <ReadingHighlightableText
          blockId={`${partId}-passage-title`}
          text={passageTitle}
          highlights={highlights}
          className="listening-part-image-header__title"
          as="h3"
        />
      )}
      {imageSrc && (
        <img
          className="listening-part-image-header__img"
          src={imageSrc}
          alt={passageTitle ? `Illustration: ${passageTitle}` : 'Listening illustration'}
          data-highlight-skip
        />
      )}
    </div>
  )
}
