/** Pure path helpers — no import from listeningExamAudio (tránh circular). */

export function inferIeltsCatalogAudioUrl(title: string): string | undefined {
  const match = title.match(/Cambridge\s*(\d+)\s*Test\s*(\d+)/i)
    ?? title.match(/Cam\s*(\d+)\s*Test\s*(\d+)/i)
    ?? title.match(/ielts.*?cam(?:bridge)?\s*(\d+).*?test\s*(\d+)/i)
  if (!match) return undefined
  return `/catalog/listening/ielts-cam${match[1]}-test${match[2]}/listening.mp3`
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
