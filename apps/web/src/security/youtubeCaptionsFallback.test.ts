import { describe, expect, it } from 'vitest'
import { fetchYouTubePlayer } from '../../../../supabase/functions/youtube-captions/playerPage'

describe('YouTube caption player fallback', () => {
  it('falls back to mobile when desktop YouTube blocks the edge IP', async () => {
    const calls: string[] = []
    const fetcher = (async (input: string | URL | Request) => {
      const url = String(input)
      calls.push(url)
      if (url.startsWith('https://www.youtube.com/')) return new Response('blocked', { status: 403 })
      return new Response(`var ytInitialPlayerResponse = ${JSON.stringify({
        playabilityStatus: { status: 'OK' },
        videoDetails: { title: 'Fallback works', lengthSeconds: '120' },
        captions: { playerCaptionsTracklistRenderer: { captionTracks: [{ languageCode: 'en', baseUrl: 'https://captions.test' }] } },
      })};`)
    }) as typeof fetch

    const result = await fetchYouTubePlayer('_CwYFdjj63s', new AbortController().signal, fetcher)

    expect(result.player?.playabilityStatus?.status).toBe('OK')
    expect(result.player?.captions?.playerCaptionsTracklistRenderer?.captionTracks).toHaveLength(1)
    expect(result.attempts).toEqual(['desktop:403'])
    expect(calls).toHaveLength(2)
    expect(calls[1]).toMatch(/^https:\/\/m\.youtube\.com\/watch/)
  })

  it('keeps upstream statuses when every player page fails', async () => {
    const fetcher = (async (input: string | URL | Request) => {
      return new Response('blocked', { status: String(input).includes('m.youtube.com') ? 429 : 403 })
    }) as typeof fetch

    const result = await fetchYouTubePlayer('_CwYFdjj63s', new AbortController().signal, fetcher)

    expect(result.player).toBeNull()
    expect(result.attempts).toEqual(['desktop:403', 'mobile:429'])
  })
})
