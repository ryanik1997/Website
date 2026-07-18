import { afterEach, describe, expect, it, vi } from 'vitest'
import relay from '../../../../api/youtube-captions-relay'

const originalSecret = process.env.YOUTUBE_CAPTIONS_RELAY_SECRET

afterEach(() => {
  vi.unstubAllGlobals()
  if (originalSecret === undefined) delete process.env.YOUTUBE_CAPTIONS_RELAY_SECRET
  else process.env.YOUTUBE_CAPTIONS_RELAY_SECRET = originalSecret
})

describe('YouTube captions Vercel relay', () => {
  it('rejects requests without the shared secret', async () => {
    process.env.YOUTUBE_CAPTIONS_RELAY_SECRET = 'test-secret'
    const response = await relay.fetch(new Request('https://relay.test/api/youtube-captions-relay', {
      method: 'POST',
      body: JSON.stringify({ videoId: '_CwYFdjj63s' }),
    }))
    expect(response.status).toBe(401)
  })

  it('returns player and captions without becoming an open URL proxy', async () => {
    process.env.YOUTUBE_CAPTIONS_RELAY_SECRET = 'test-secret'
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.startsWith('https://www.youtube.com/watch')) return new Response('blocked', { status: 403 })
      if (url.startsWith('https://m.youtube.com/watch')) {
        return new Response(`var ytInitialPlayerResponse = ${JSON.stringify({
          playabilityStatus: { status: 'OK' },
          videoDetails: { title: 'Relay works', lengthSeconds: '120' },
          captions: { playerCaptionsTracklistRenderer: { captionTracks: [{ languageCode: 'en', baseUrl: 'https://www.youtube.com/api/timedtext?id=fixed' }] } },
        })};`)
      }
      if (url.startsWith('https://www.youtube.com/api/timedtext')) {
        return new Response(JSON.stringify({ events: [{ tStartMs: 0, segs: [{ utf8: 'Hello' }] }] }))
      }
      throw new Error(`Unexpected URL: ${url}`)
    }))

    const response = await relay.fetch(new Request('https://relay.test/api/youtube-captions-relay', {
      method: 'POST',
      headers: { 'x-relay-secret': 'test-secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: '_CwYFdjj63s', url: 'https://attacker.test/' }),
    }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.player.videoDetails.title).toBe('Relay works')
    expect(body.captionJson.events[0].segs[0].utf8).toBe('Hello')
  })
})
