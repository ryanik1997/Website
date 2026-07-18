import { fetchYouTubePlayer } from '../supabase/functions/youtube-captions/playerPage'

declare const process: { env: Record<string, string | undefined> }

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/
const MAX_CAPTION_BYTES = 5_000_000

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

    const expectedSecret = process.env.YOUTUBE_CAPTIONS_RELAY_SECRET ?? ''
    const suppliedSecret = request.headers.get('x-relay-secret') ?? ''
    if (!expectedSecret || suppliedSecret !== expectedSecret) return json({ error: 'Unauthorized' }, 401)

    const body = await request.json().catch(() => null) as { videoId?: unknown } | null
    const videoId = typeof body?.videoId === 'string' ? body.videoId.trim() : ''
    if (!VIDEO_ID.test(videoId)) return json({ error: 'Bad video ID' }, 400)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)
    try {
      const { player, attempts } = await fetchYouTubePlayer(videoId, controller.signal)
      if (!player) return json({ error: 'YouTube blocked relay', attempts }, 502)

      const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
      const englishTracks = tracks.filter(track => track.languageCode?.toLowerCase().startsWith('en'))
      const track = englishTracks.find(item => item.kind !== 'asr') ?? englishTracks[0]
      if (!track?.baseUrl) return json({ player, captionJson: null })

      const captionUrl = new URL(track.baseUrl)
      captionUrl.searchParams.set('fmt', 'json3')
      const captionResponse = await fetch(captionUrl, { signal: controller.signal })
      if (!captionResponse.ok) {
        return json({ error: 'Caption fetch failed', status: captionResponse.status }, 502)
      }
      const captionText = await captionResponse.text()
      if (captionText.length > MAX_CAPTION_BYTES) return json({ error: 'Caption response too large' }, 413)
      const captionJson = JSON.parse(captionText)
      return json({ player, captionJson })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return json({ error: 'Relay timeout' }, 504)
      return json({ error: 'Relay upstream error' }, 502)
    } finally {
      clearTimeout(timeout)
    }
  },
}
