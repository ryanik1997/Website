/** Pure path helpers — no import from listeningExamAudio (tránh circular). */

function matchIeltsCamTest(title: string): { cam: string; test: string } | null {
  const match = title.match(/Cambridge\s*(\d+)\s*Test\s*(\d+)/i)
    ?? title.match(/Cam\s*(\d+)\s*Test\s*(\d+)/i)
    ?? title.match(/ielts.*?cam(?:bridge)?\s*(\d+).*?test\s*(\d+)/i)
  if (!match) return null
  return { cam: match[1]!, test: match[2]! }
}

export function inferIeltsCatalogAudioUrl(title: string): string | undefined {
  const m = matchIeltsCamTest(title)
  if (!m) return undefined
  return `/catalog/listening/ielts-cam${m.cam}-test${m.test}/listening.mp3`
}

/** Per-part file: …/ielts-cam20-test1/part2.mp3 (có trên disk catalog). */
export function inferIeltsCatalogPartAudioUrl(title: string, partNumber: number): string | undefined {
  const m = matchIeltsCamTest(title)
  if (!m || !partNumber || partNumber < 1) return undefined
  return `/catalog/listening/ielts-cam${m.cam}-test${m.test}/part${partNumber}.mp3`
}

/**
 * Catalog JSON hay gán cả 4 part → listening.mp3 (full).
 * Rewrite sang partN.mp3 khi URL trỏ full track.
 */
export function rewriteIeltsFullTrackToPartUrl(
  audioUrl: string | undefined,
  partNumber: number,
): string | undefined {
  if (!audioUrl || !partNumber || partNumber < 1) return undefined
  // Already a part file
  if (/\/part\d+\.mp3(?:\?|$)/i.test(audioUrl)) return audioUrl
  const m = audioUrl.match(/^(.*\/)listening\.mp3(\?.*)?$/i)
  if (!m) return undefined
  return `${m[1]}part${partNumber}.mp3${m[2] ?? ''}`
}

const CAMBRIDGE_CATALOG_AUDIO: Partial<Record<string, string>> = {
  ket: '/catalog/listening/ket-a2-test1/listening.mp3',
  pet: '/catalog/listening/pet-b1-test1/Test_1_Listening_PET_B1_Audio.mp3',
  fce: '/catalog/listening/fce-b2-test1/listening.mp3',
  cae: '/catalog/listening/cae-c1-test1/listening.mp3',
  cpe: undefined,
}

/**
 * Fallback khi không resolve được twin catalog.
 * Cẩn thận: mọi KET → Test 1 — chỉ dùng khi title không chỉ rõ Test N khác.
 */
export function defaultCatalogAudioByExamType(examType: string | undefined): string | undefined {
  if (!examType) return undefined
  return CAMBRIDGE_CATALOG_AUDIO[examType]
}
