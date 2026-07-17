import rawVideos from './data/shadowingVideos.json'
import rawSubtitles from './data/shadowingSubtitles.json'
import rawViOverrides from './data/shadowingViOverrides.json'
import type {
  ShadowingCategoryFilter,
  ShadowingLevelFilter,
  ShadowingMode,
  ShadowingSubtitle,
  ShadowingVideo,
} from './types'

export const SHADOWING_VIDEOS = rawVideos as ShadowingVideo[]

type SubtitlesPayload = {
  meta?: { totalSegments?: number; videosWithSubtitles?: number }
  byYoutubeId: Record<string, ShadowingSubtitle[]>
}

const SUBTITLES = rawSubtitles as SubtitlesPayload
/** Offline bulk VI: { [youtubeId]: { [segmentId]: vi } } */
const VI_OVERRIDES = rawViOverrides as Record<string, Record<string, string>>

export function getSubtitlesForYoutubeId(youtubeId: string): ShadowingSubtitle[] {
  const base = SUBTITLES.byYoutubeId[youtubeId] ?? []
  const ov = VI_OVERRIDES[youtubeId]
  if (!ov) return base
  return base.map(seg => {
    const vi = ov[seg.id]
    if (!vi || seg.vietnameseText) return seg
    return { ...seg, vietnameseText: vi }
  })
}

export const SIDEBAR_CATEGORIES: Array<{
  id: ShadowingCategoryFilter
  label: string
  hot?: boolean
}> = [
  { id: 'all', label: 'Tất cả bài học' },
  { id: 'IELTS Speaking for Success', label: 'IELTS Speaking', hot: true },
  { id: 'Movie short clip', label: 'Movie short clip', hot: true },
  { id: 'PreF', label: 'PreF listening' },
  { id: 'TED-Ed', label: 'TED-Ed' },
  { id: 'Real Easy English', label: 'Real Easy English' },
  { id: 'BBC Learning English', label: 'BBC Learning English' },
  { id: 'Kurzgesagt – In a Nutshell', label: 'Kurzgesagt' },
]

export const SIDEBAR_LEVELS: Array<{ id: ShadowingLevelFilter; label: string }> = [
  { id: 'C2', label: 'C2 - Thành thạo' },
  { id: 'C1', label: 'C1 - Nâng cao' },
  { id: 'B2', label: 'B2 - Trung cấp' },
  { id: 'B1', label: 'B1 - Trung cấp thấp' },
  { id: 'A2', label: 'A2 - Sơ cấp' },
  { id: 'A1', label: 'A1 - Mới bắt đầu' },
]

export const MODE_TABS: Array<{ id: ShadowingMode; label: string }> = [
  { id: 'shadowing', label: 'SHADOWING' },
  { id: 'dictation', label: 'DICTATION' },
  { id: 'quiz', label: 'QUIZ' },
]

export function getShadowingVideoByKey(key: string): ShadowingVideo | undefined {
  return SHADOWING_VIDEOS.find(v => v.id === key || v.youtubeId === key)
}

export function lessonHref(video: ShadowingVideo, mode: ShadowingMode = 'shadowing'): string {
  return `/app/shadowing/${encodeURIComponent(video.youtubeId)}?mode=${mode}`
}

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`
}

export function youtubeEmbedUrl(youtubeId: string, startSeconds?: number): string {
  const start = startSeconds != null && startSeconds > 0 ? Math.floor(startSeconds) : 0
  const base = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1`
  return start > 0 ? `${base}&start=${start}&autoplay=1` : base
}

export function filterShadowingVideos(opts: {
  category: ShadowingCategoryFilter
  level: ShadowingLevelFilter
  search: string
}): ShadowingVideo[] {
  const q = opts.search.trim().toLowerCase()
  return SHADOWING_VIDEOS.filter(v => {
    if (opts.category !== 'all' && v.category !== opts.category) return false
    if (opts.level !== 'all' && v.level !== opts.level) return false
    if (!q) return true
    return (
      v.title.toLowerCase().includes(q)
      || v.category.toLowerCase().includes(q)
      || v.level.toLowerCase().includes(q)
    )
  })
}

export function countByCategory(category: ShadowingCategoryFilter): number {
  if (category === 'all') return SHADOWING_VIDEOS.length
  return SHADOWING_VIDEOS.filter(v => v.category === category).length
}
