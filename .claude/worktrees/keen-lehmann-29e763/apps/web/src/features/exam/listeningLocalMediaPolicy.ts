/**
 * Quy tắc media Listening: blob/import local LUÔN thắng catalog.
 *
 * Lỗi lịch sử: merge catalog gắn /catalog/.../ket-a2-test1 lên mọi đề KET
 * (kể cả Test 3 import) → phát nhầm audio / ảnh.
 *
 * Mọi đường merge / fallback / phát audio phải đi qua helper ở file này.
 */

export type MediaRef = {
  audioKey?: string
  audioUrl?: string
  ttsText?: string
  pictureImageKey?: string
  pictureImageUrl?: string
  partImageKey?: string
  partImageUrl?: string
  imageKey?: string
  imageUrl?: string
}

export function hasLocalAudioBlob(ref: Pick<MediaRef, 'audioKey'>): boolean {
  return Boolean(ref.audioKey?.trim())
}

export function hasAnyLocalPicture(ref: {
  pictureImageKey?: string
  pictureImageUrl?: string
  imageKey?: string
  options?: Array<{ imageKey?: string; imageUrl?: string }>
}): boolean {
  if (ref.pictureImageKey?.trim() || ref.imageKey?.trim()) return true
  if (ref.options?.some(o => o.imageKey?.trim())) return true
  return false
}

/** Chỉ được gắn catalog audio URL khi chưa có blob local và chưa có URL. */
export function shouldAttachCatalogAudio(
  ref: Pick<MediaRef, 'audioKey' | 'audioUrl'>,
): boolean {
  if (hasLocalAudioBlob(ref)) return false
  if (ref.audioUrl?.trim()) return false
  return true
}

/**
 * Chọn audioUrl sau merge.
 * Có blob local → xóa/không giữ URL catalog (tránh player fallback nhầm đề).
 */
export function preferLocalAudioUrl(
  ref: Pick<MediaRef, 'audioKey' | 'audioUrl'>,
  catalogUrl?: string,
): string | undefined {
  if (hasLocalAudioBlob(ref)) return undefined
  const local = ref.audioUrl?.trim()
  if (local) return local
  const cat = catalogUrl?.trim()
  return cat || undefined
}

export function preferLocalPictureUrl(
  ref: { pictureImageKey?: string; pictureImageUrl?: string },
  catalogUrl?: string,
): string | undefined {
  if (ref.pictureImageKey?.trim()) return undefined
  const local = ref.pictureImageUrl?.trim()
  if (local) return local
  return catalogUrl?.trim() || undefined
}

export function preferLocalPartImageUrl(
  ref: { partImageKey?: string; partImageUrl?: string },
  catalogUrl?: string,
): string | undefined {
  if (ref.partImageKey?.trim()) return undefined
  const local = ref.partImageUrl?.trim()
  if (local) return local
  return catalogUrl?.trim() || undefined
}

export function normalizeExamTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** "Test 3" / "test3" trong title; null nếu không có. */
export function extractListeningTestNumber(title: string): string | null {
  const m = normalizeExamTitleKey(title).match(/\btest\s*(\d+)\b/)
  return m?.[1] ?? null
}

/**
 * Catalog twin chỉ khi cùng examType và:
 * - title exact, hoặc
 * - cùng số Test (bắt buộc khớp số — không map Test 3 → Test 1)
 *
 * Không fallback “cùng level chỉ 1 đề” khi local đã ghi Test N.
 */
export function isValidCatalogListeningTwin(
  local: { examType?: string; title: string },
  catalog: { examType?: string; title: string },
): boolean {
  if ((local.examType ?? '') !== (catalog.examType ?? '')) return false

  const ln = normalizeExamTitleKey(local.title)
  const cn = normalizeExamTitleKey(catalog.title)
  if (ln === cn) return true

  const localTest = extractListeningTestNumber(local.title)
  const catTest = extractListeningTestNumber(catalog.title)

  if (localTest != null) {
    return catTest === localTest
  }

  // Local không ghi số Test → cho phép twin cùng type nếu catalog cũng không số,
  // hoặc caller chỉ có 1 candidate (xử lý ở findCatalogListeningTwin).
  if (catTest != null && catTest !== '1') {
    // catalog là Test N cụ thể, local generic → không ép
    return false
  }

  return true
}

/**
 * Có được dùng default /catalog/.../{ket|pet}-test1 khi không có twin không?
 * Không: nếu title local chỉ rõ Test ≠ 1.
 */
export function allowDefaultCatalogAudioByExamType(title: string): boolean {
  const n = extractListeningTestNumber(title)
  if (n == null) return true
  return n === '1'
}

type QuestionLike = {
  audioKey?: string
  audioUrl?: string
  ttsText?: string
  pictureImageKey?: string
  pictureImageUrl?: string
  options?: Array<{ imageKey?: string; imageUrl?: string; id?: string; label?: string }>
}

type PartLike = {
  audioKey?: string
  audioUrl?: string
  ttsText?: string
  partImageKey?: string
  partImageUrl?: string
  questions: QuestionLike[]
}

/**
 * Sanitize sau mọi merge: gỡ URL catalog xung đột với blob local.
 * Sửa luôn đề đã import (Dexie) khi load — không cần re-import.
 */
export function preferLocalListeningMedia<T extends { parts: PartLike[] }>(exam: T): T {
  const parts = exam.parts.map(part => {
    const audioUrl = preferLocalAudioUrl(part)
    const partImageUrl = preferLocalPartImageUrl(part)

    const questions = part.questions.map(q => {
      const pictureImageUrl = preferLocalPictureUrl(q)
      const qAudioUrl = preferLocalAudioUrl(q)
      const options = (q.options ?? []).map(opt => ({
        ...opt,
        imageUrl: opt.imageKey?.trim() ? undefined : opt.imageUrl,
      }))
      return {
        ...q,
        audioUrl: qAudioUrl,
        pictureImageUrl,
        options,
      }
    })

    return {
      ...part,
      audioUrl,
      partImageUrl,
      questions,
    }
  })

  return { ...exam, parts } as T
}
