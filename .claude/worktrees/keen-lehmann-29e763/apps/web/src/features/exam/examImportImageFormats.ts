/**
 * Định dạng ảnh import Luyện thi (IELTS + Cambridge Reading/Listening).
 * JSON thường ghi imageFile: "q1.jpg" / "part1-q1.jpg" — file thực có thể là .webp.
 */

export const EXAM_IMPORT_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const

export type ExamImportImageExt = (typeof EXAM_IMPORT_IMAGE_EXTENSIONS)[number]

/** Regex đuôi ảnh (kèm chấm). */
export const EXAM_IMPORT_IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif)$/i

export function isExamImportImageFileName(name: string): boolean {
  return EXAM_IMPORT_IMAGE_EXT_RE.test(name.trim())
}

export function isExamImportImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) {
    // browser đôi khi type rỗng với webp từ ZIP — vẫn check tên
    if (file.type === 'image/webp' || file.type === 'image/png' || file.type === 'image/jpeg'
      || file.type === 'image/gif' || file.type === 'image/jpg') {
      return true
    }
  }
  return isExamImportImageFileName(file.name)
}

export function normalizeImportFileKey(name: string): string {
  return name.trim().toLowerCase().replace(/\\/g, '/').split('/').pop() ?? name.trim().toLowerCase()
}

export function stripImageExtension(filename: string): string {
  return normalizeImportFileKey(filename).replace(EXAM_IMPORT_IMAGE_EXT_RE, '')
}

export function mimeFromImageFileName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return 'application/octet-stream'
}

/**
 * Đảm bảo Blob/File từ ZIP có MIME đúng (webp hay bị type rỗng → UI/IDB lỗi).
 */
export function ensureImageFileMime(file: File): File {
  if (!isExamImportImageFileName(file.name)) return file
  const want = mimeFromImageFileName(file.name)
  if (file.type === want) return file
  return new File([file], file.name, { type: want, lastModified: file.lastModified })
}

/**
 * Danh sách tên thử khi JSON ghi "foo.jpg" nhưng ZIP có "foo.webp".
 * Giữ tên gốc trước, rồi các đuôi chuẩn.
 * Không đụng file audio (.mp3 …) — chỉ exact match.
 */
export function imageFileNameCandidates(filename?: string): string[] {
  if (!filename?.trim()) return []
  const key = normalizeImportFileKey(filename)
  const out: string[] = [key]
  // Có đuôi không phải ảnh (mp3, json, …) → không đổi đuôi
  if (key.includes('.') && !EXAM_IMPORT_IMAGE_EXT_RE.test(key)) return out
  const base = stripImageExtension(key)
  if (!base) return out
  for (const ext of EXAM_IMPORT_IMAGE_EXTENSIONS) {
    const cand = `${base}.${ext}`
    if (!out.includes(cand)) out.push(cand)
  }
  return out
}

/**
 * Resolve file ảnh trong media map: exact name + đổi đuôi jpg/png/webp/gif.
 */
export function resolveImageMediaFile(
  map: Map<string, File>,
  filename?: string,
): File | null {
  for (const cand of imageFileNameCandidates(filename)) {
    const hit = map.get(normalizeImportFileKey(cand))
    if (hit) return ensureImageFileMime(hit)
  }
  return null
}

/** Thử nhiều basename (part2-p1, part2-person1, …) × mọi đuôi ảnh. */
export function resolveImageMediaFileAny(
  map: Map<string, File>,
  basenames: string[],
): File | null {
  for (const raw of basenames) {
    const base = stripImageExtension(raw) || normalizeImportFileKey(raw)
    for (const ext of EXAM_IMPORT_IMAGE_EXTENSIONS) {
      const hit = map.get(`${base}.${ext}`)
      if (hit) return ensureImageFileMime(hit)
    }
    // raw đã có đuôi
    const direct = resolveImageMediaFile(map, raw)
    if (direct) return direct
  }
  return null
}

/** accept= cho input file (HTML). */
export const EXAM_IMPORT_IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif,image/*'

/**
 * Tìm ảnh Writing/Cambridge theo stem (part9-page → .jpg|.webp|…)
 * rồi fallback regex prefix (part9-…).
 */
export function findImportImageByStems(
  files: File[],
  stems: string[],
  prefixRe?: RegExp,
): File | null {
  const map = new Map<string, File>()
  for (const f of files) {
    if (!isExamImportImageFile(f)) continue
    map.set(normalizeImportFileKey(f.name), ensureImageFileMime(f))
  }
  const hit = resolveImageMediaFileAny(map, stems)
  if (hit) return hit
  if (prefixRe) {
    const loose = files.find(f =>
      isExamImportImageFile(f) && prefixRe.test(normalizeImportFileKey(f.name)),
    )
    if (loose) return ensureImageFileMime(loose)
  }
  return null
}
