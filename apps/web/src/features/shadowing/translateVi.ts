/**
 * On-demand EN→VI translation (same public API TID uses for missing vietnamese_text).
 * Results cached in localStorage per videoId + segment id.
 */

const CACHE_PREFIX = 'ryan-shadowing-vi:'
const MAX_Q_LEN = 450

export type ViCacheMap = Record<string, string>

function cacheKey(videoKey: string): string {
  return `${CACHE_PREFIX}${videoKey}`
}

export function loadViCache(videoKey: string): ViCacheMap {
  try {
    const raw = localStorage.getItem(cacheKey(videoKey))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ViCacheMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveViCache(videoKey: string, map: ViCacheMap): void {
  try {
    localStorage.setItem(cacheKey(videoKey), JSON.stringify(map))
  } catch {
    // quota — ignore
  }
}

async function translateOne(text: string, signal?: AbortSignal): Promise<string | null> {
  const q = text.trim().slice(0, MAX_Q_LEN)
  if (!q) return null
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|vi`
  const res = await fetch(url, { signal })
  if (!res.ok) return null
  const data = (await res.json()) as {
    responseData?: { translatedText?: string }
    responseStatus?: number
  }
  const t = data.responseData?.translatedText?.trim()
  if (!t || t.toLowerCase() === q.toLowerCase()) return null
  // MyMemory sometimes returns "QUERY LENGTH LIMIT..." messages
  if (/QUERY LENGTH|MYMEMORY WARNING/i.test(t)) return null
  return t
}

/** Translate a single segment; returns VI or null. */
export async function translateSegmentVi(
  text: string,
  signal?: AbortSignal,
): Promise<string | null> {
  try {
    return await translateOne(text, signal)
  } catch {
    return null
  }
}

/**
 * Batch-translate missing segments for one video (rate-limited).
 * Calls onProgress after each successful translation.
 */
export async function translateSegmentsBatch(
  items: Array<{ id: string; text: string; existingVi?: string | null }>,
  opts: {
    videoKey: string
    concurrency?: number
    signal?: AbortSignal
    onProgress?: (done: number, total: number, map: ViCacheMap) => void
  },
): Promise<ViCacheMap> {
  const map = loadViCache(opts.videoKey)
  const pending = items.filter(it => {
    if (it.existingVi?.trim()) {
      map[it.id] = it.existingVi.trim()
      return false
    }
    if (map[it.id]?.trim()) return false
    return Boolean(it.text.trim())
  })

  const total = pending.length
  let done = 0
  opts.onProgress?.(done, total, { ...map })

  // Sequential with small delay — MyMemory free tier is strict
  for (const item of pending) {
    if (opts.signal?.aborted) break
    const vi = await translateOne(item.text, opts.signal)
    if (vi) {
      map[item.id] = vi
      saveViCache(opts.videoKey, map)
    }
    done += 1
    opts.onProgress?.(done, total, { ...map })
    await new Promise(r => setTimeout(r, 350))
  }

  return map
}
