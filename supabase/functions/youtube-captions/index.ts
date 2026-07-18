import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { fetchYouTubePlayer } from './playerPage.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const MAX_VIDEO_SECONDS = 7_200
const MAX_SEGMENTS = 2_000

function effectivePlan(plan: string | null | undefined, expiresAt: string | null | undefined) {
  const value = plan ?? 'free'
  if (value === 'free' || value === 'lifetime' || !expiresAt) return value
  return new Date(expiresAt).getTime() >= Date.now() ? value : 'free'
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ',
  }
  return value
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity: string) => {
      if (entity[0] === '#') {
        const hex = entity[1]?.toLowerCase() === 'x'
        const number = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
        return Number.isFinite(number) ? String.fromCodePoint(number) : ''
      }
      return named[entity.toLowerCase()] ?? ''
    })
    .replace(/\s+/g, ' ')
    .trim()
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${minutes}:${secs.toString().padStart(2, '0')}`
}

type CaptionTrack = { baseUrl?: string; languageCode?: string; kind?: string; name?: { simpleText?: string } }
type Json3Event = { tStartMs?: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }
type PlayerData = Awaited<ReturnType<typeof fetchYouTubePlayer>>['player']

async function fetchPlayerThroughRelay(videoId: string, signal: AbortSignal): Promise<{
  player: PlayerData
  captionJson: { events?: Json3Event[] } | null
} | null> {
  const secret = Deno.env.get('YOUTUBE_CAPTIONS_RELAY_SECRET') ?? ''
  const vercelBypass = Deno.env.get('VERCEL_AUTOMATION_BYPASS_SECRET') ?? ''
  const relayUrl = Deno.env.get('YOUTUBE_CAPTIONS_RELAY_URL')
    ?? 'https://ryanenglishv2.vercel.app/api/youtube-captions-relay'
  if (!secret) return null

  const response = await fetch(relayUrl, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-relay-secret': secret,
      ...(vercelBypass ? { 'x-vercel-protection-bypass': vercelBypass } : {}),
    },
    body: JSON.stringify({ videoId }),
  })
  if (!response.ok) return null
  return await response.json().catch(() => null)
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!token) return json({ error: 'Cần đăng nhập để nhập video YouTube.', code: 'NO_JWT' }, 401)
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: 'Server misconfigured' }, 500)

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: auth } = await userClient.auth.getUser(token)
  if (!auth.user) return json({ error: 'Phiên đăng nhập không hợp lệ.', code: 'BAD_TOKEN' }, 401)

  const admin = createClient(supabaseUrl, serviceKey)
  const { data: profile } = await admin.from('profiles')
    .select('plan,plan_expires_at,is_admin,suspended_at')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (profile?.suspended_at) return json({ error: 'Tài khoản đang bị khóa.', code: 'ACCOUNT_SUSPENDED' }, 403)
  const plan = effectivePlan(profile?.plan, profile?.plan_expires_at)
  if (profile?.is_admin !== true && plan !== 'pro' && plan !== 'lifetime') {
    return json({ error: 'Tính năng này yêu cầu gói Pro.', code: 'PRO_REQUIRED' }, 403)
  }

  const body = await req.json().catch(() => null) as { videoId?: unknown } | null
  const videoId = typeof body?.videoId === 'string' ? body.videoId.trim() : ''
  if (!VIDEO_ID.test(videoId)) return json({ error: 'URL YouTube không hợp lệ.', code: 'BAD_VIDEO_ID' }, 400)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const relay = await fetchPlayerThroughRelay(videoId, controller.signal).catch(() => null)
    const direct = relay?.player ? null : await fetchYouTubePlayer(videoId, controller.signal)
    const player = relay?.player ?? direct?.player ?? null
    const attempts = relay?.player ? ['relay:ok'] : ['relay:failed', ...(direct?.attempts ?? [])]
    if (!player) {
      console.warn('[youtube-captions] player fetch failed', { videoId, attempts })
      return json({
        error: 'YouTube đang chặn kết nối lấy phụ đề. Vui lòng thử lại sau.',
        code: 'YOUTUBE_BLOCKED',
      }, 502)
    }
    if (player.playabilityStatus?.status !== 'OK') {
      return json({ error: player.playabilityStatus?.reason || 'Video không công khai hoặc không cho phép phát.', code: 'VIDEO_UNAVAILABLE' }, 422)
    }
    if (player.videoDetails?.isLiveContent) return json({ error: 'Chưa hỗ trợ video đang phát trực tiếp.', code: 'LIVE_UNSUPPORTED' }, 422)

    const durationSeconds = Number(player.videoDetails?.lengthSeconds ?? 0)
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > MAX_VIDEO_SECONDS) {
      return json({ error: 'Video phải dài từ vài giây đến tối đa 2 giờ.', code: 'DURATION_LIMIT' }, 422)
    }

    const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
    const englishTracks = tracks.filter(track => track.languageCode?.toLowerCase().startsWith('en'))
    const track = englishTracks.find(item => item.kind !== 'asr') ?? englishTracks[0]
    if (!track?.baseUrl) {
      return json({ error: 'Video không có phụ đề tiếng Anh khả dụng.', code: 'NO_ENGLISH_CAPTIONS' }, 422)
    }

    let captionJson = relay?.captionJson ?? null
    if (!captionJson) {
      const captionUrl = new URL(track.baseUrl)
      captionUrl.searchParams.set('fmt', 'json3')
      const captionResponse = await fetch(captionUrl, { signal: controller.signal })
      if (!captionResponse.ok) return json({ error: 'YouTube từ chối tải phụ đề của video này.', code: 'CAPTION_FETCH_FAILED' }, 502)
      captionJson = await captionResponse.json().catch(() => null) as { events?: Json3Event[] } | null
    }
    const subtitles = (captionJson?.events ?? [])
      .map((event, index) => {
        const text = decodeEntities((event.segs ?? []).map(segment => segment.utf8 ?? '').join(''))
        const startTime = Math.max(0, Number(event.tStartMs ?? 0) / 1_000)
        const duration = Math.max(.1, Number(event.dDurationMs ?? 0) / 1_000)
        return { id: `yt-${videoId}-${index}`, text, startTime, duration, ipa: null, vietnameseText: null }
      })
      .filter(item => item.text.length > 0)
      .slice(0, MAX_SEGMENTS)
    if (!subtitles.length) return json({ error: 'Phụ đề YouTube trả về trống.', code: 'EMPTY_CAPTIONS' }, 422)

    return json({
      video: {
        id: `youtube-${videoId}`,
        youtubeId: videoId,
        title: decodeEntities(player.videoDetails?.title ?? 'YouTube Shadowing'),
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        category: 'YouTube của tôi',
        level: '',
        duration: formatDuration(durationSeconds),
        segments: subtitles.length,
        createdAt: new Date().toISOString(),
      },
      subtitles,
      captionLanguage: track.languageCode,
      autoGenerated: track.kind === 'asr',
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return json({ error: 'YouTube phản hồi quá chậm. Vui lòng thử lại.', code: 'TIMEOUT' }, 504)
    }
    return json({ error: 'Không thể kết nối tới dịch vụ phụ đề YouTube.', code: 'UPSTREAM_ERROR' }, 502)
  } finally {
    clearTimeout(timeout)
  }
})
