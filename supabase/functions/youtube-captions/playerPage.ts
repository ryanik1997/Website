export type YouTubePlayerResponse = {
  playabilityStatus?: { status?: string; reason?: string }
  videoDetails?: { title?: string; lengthSeconds?: string; isLiveContent?: boolean }
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{ baseUrl?: string; languageCode?: string; kind?: string; name?: { simpleText?: string } }>
    }
  }
}

type Fetcher = typeof fetch

const PLAYER_MARKER = 'ytInitialPlayerResponse'
const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36'
const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131 Mobile Safari/537.36'

export function extractJsonObject(source: string, marker: string): Record<string, unknown> | null {
  const markerAt = source.indexOf(marker)
  if (markerAt < 0) return null
  const start = source.indexOf('{', markerAt + marker.length)
  if (start < 0) return null
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < source.length; i += 1) {
    const char = source[i]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        try { return JSON.parse(source.slice(start, i + 1)) }
        catch { return null }
      }
    }
  }
  return null
}

export async function fetchYouTubePlayer(
  videoId: string,
  signal: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<{ player: YouTubePlayerResponse | null; attempts: string[] }> {
  const sources = [
    {
      label: 'desktop',
      url: `https://www.youtube.com/watch?v=${videoId}&hl=en`,
      userAgent: DESKTOP_USER_AGENT,
    },
    {
      label: 'mobile',
      url: `https://m.youtube.com/watch?v=${videoId}&hl=en`,
      userAgent: MOBILE_USER_AGENT,
    },
  ]
  const attempts: string[] = []

  for (const source of sources) {
    try {
      const response = await fetcher(source.url, {
        signal,
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': source.userAgent,
        },
      })
      if (!response.ok) {
        attempts.push(`${source.label}:${response.status}`)
        continue
      }
      const html = await response.text()
      const player = extractJsonObject(html, PLAYER_MARKER) as YouTubePlayerResponse | null
      if (player) return { player, attempts }
      attempts.push(`${source.label}:no-player`)
    } catch (error) {
      if (signal.aborted) throw error
      attempts.push(`${source.label}:network-error`)
    }
  }

  return { player: null, attempts }
}
