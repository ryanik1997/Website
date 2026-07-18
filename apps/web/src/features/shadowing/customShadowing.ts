import { supabase } from '../../lib/supabase'
import type { ShadowingSubtitle, ShadowingVideo } from './types'

const CACHE_KEY = 'ryan-shadowing-custom-lessons:v1'
const MAX_CACHED_LESSONS = 20

export type CustomShadowingLesson = {
  video: ShadowingVideo
  subtitles: ShadowingSubtitle[]
  cachedAt: number
}

type CaptionResponse = {
  video?: ShadowingVideo
  subtitles?: ShadowingSubtitle[]
  error?: string
  code?: string
}

export function extractYoutubeId(raw: string): string | null {
  const value = raw.trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    let id = ''
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] ?? ''
    else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      id = url.searchParams.get('v') ?? ''
      if (!id) {
        const parts = url.pathname.split('/').filter(Boolean)
        if (['shorts', 'embed', 'live'].includes(parts[0] ?? '')) id = parts[1] ?? ''
      }
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

function loadAll(): CustomShadowingLesson[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]') as CustomShadowingLesson[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function loadCustomShadowingLesson(videoId: string): CustomShadowingLesson | null {
  return loadAll().find(item => item.video.youtubeId === videoId) ?? null
}

export function saveCustomShadowingLesson(lesson: CustomShadowingLesson): void {
  const next = [lesson, ...loadAll().filter(item => item.video.youtubeId !== lesson.video.youtubeId)]
    .slice(0, MAX_CACHED_LESSONS)
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(next))
  } catch {
    // A transcript may exceed the browser quota. The lesson can still open in this navigation.
  }
}

async function functionErrorMessage(error: unknown): Promise<string> {
  const fallback = 'Không thể lấy phụ đề YouTube. Vui lòng thử lại.'
  if (!error || typeof error !== 'object') return fallback
  const value = error as {
    message?: string
    context?: Response | { body?: string; json?: { error?: string } }
  }
  try {
    const context = value.context
    if (context instanceof Response) {
      const body = await context.clone().json().catch(() => null) as { error?: string } | null
      return body?.error || value.message || fallback
    }
    const body = context?.json ?? (context?.body ? JSON.parse(context.body) : null)
    return body?.error || value.message || fallback
  } catch {
    return value.message || fallback
  }
}

export async function importYoutubeShadowingLesson(rawUrl: string): Promise<CustomShadowingLesson> {
  const videoId = extractYoutubeId(rawUrl)
  if (!videoId) throw new Error('URL YouTube không hợp lệ.')

  const cached = loadCustomShadowingLesson(videoId)
  if (cached) return cached

  const { data, error } = await supabase.functions.invoke<CaptionResponse>('youtube-captions', {
    body: { videoId },
  })
  if (error) throw new Error(await functionErrorMessage(error))
  if (!data?.video || !Array.isArray(data.subtitles) || data.subtitles.length === 0) {
    throw new Error(data?.error || 'Video không có phụ đề tiếng Anh khả dụng.')
  }

  const lesson = { video: data.video, subtitles: data.subtitles, cachedAt: Date.now() }
  saveCustomShadowingLesson(lesson)
  return lesson
}
