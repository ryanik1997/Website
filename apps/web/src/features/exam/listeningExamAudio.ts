import type { ListeningExam, ListeningPart } from './listeningExamData'
import type { ExamAudioSource } from './useExamQuestionAudio'
import {
  defaultCatalogAudioByExamType,
  inferIeltsCatalogAudioUrl,
  inferIeltsCatalogPartAudioUrl,
  rewriteIeltsFullTrackToPartUrl,
} from './listeningCatalogAudioPaths'
import {
  allowDefaultCatalogAudioByExamType,
  hasLocalAudioBlob,
  shouldAttachCatalogAudio,
} from './listeningLocalMediaPolicy'

export function partAudioSource(part: ListeningPart): ExamAudioSource {
  return {
    audioKey: part.audioKey,
    // Có blob local → không expose URL catalog (player chỉ dùng blob)
    audioUrl: hasLocalAudioBlob(part) ? undefined : part.audioUrl,
    ttsText: part.ttsText,
    startPct: part.audioStartPct,
    endPct: part.audioEndPct,
  }
}

function sameAudioSource(a: ExamAudioSource, b: ExamAudioSource): boolean {
  if (a.audioKey && b.audioKey && a.audioKey === b.audioKey) return true
  if (a.audioUrl && b.audioUrl && a.audioUrl === b.audioUrl) return true
  return false
}

/**
 * Fallback catalog khi không có blob.
 * Không map KET Test N → audio Test 1 (allowDefaultCatalogAudioByExamType).
 * Twin exact được merge ở mergeCatalogListeningMedia trước khi play.
 */
function catalogAudioFallbackUrl(exam: ListeningExam): string | undefined {
  if (exam.examType === 'ielts') return inferIeltsCatalogAudioUrl(exam.title)
  if (!allowDefaultCatalogAudioByExamType(exam.title)) return undefined
  return defaultCatalogAudioByExamType(exam.examType)
}

function withCatalogAudioFallback(
  exam: ListeningExam,
  source: ExamAudioSource,
): ExamAudioSource {
  if (!shouldAttachCatalogAudio(source) || source.ttsText?.trim()) {
    return {
      ...source,
      audioUrl: hasLocalAudioBlob(source) ? undefined : source.audioUrl,
    }
  }
  const catalogUrl = catalogAudioFallbackUrl(exam)
  if (!catalogUrl) return source
  return { ...source, audioUrl: catalogUrl }
}

/**
 * Một file MP3 chung cho cả bài — khi mọi part (có audio) trỏ cùng audioKey/audioUrl.
 * KET/PET/import ZIP thường dùng pattern này.
 */
export function sharedExamAudioSource(exam: ListeningExam): ExamAudioSource | null {
  const partsWithAudio = exam.parts
    .map(partAudioSource)
    .filter(hasExamAudioSource)
  if (partsWithAudio.length === 0) {
    const catalogUrl = catalogAudioFallbackUrl(exam)
    if (catalogUrl) return { audioUrl: catalogUrl }
    return null
  }

  const first = partsWithAudio[0]!
  const allShare = exam.parts.every(part => {
    const src = partAudioSource(part)
    if (!hasExamAudioSource(src)) return true
    return sameAudioSource(src, first)
  })

  if (!allShare) return null
  return withCatalogAudioFallback(exam, first)
}

/**
 * @deprecated Dùng resolveListeningAudioSource(exam, part).
 * Fallback part 0 khi multi-part — không còn trả source rỗng (bug 5× part*.mp3).
 */
export function ketSharedExamAudioSource(exam: ListeningExam): ExamAudioSource {
  return resolveListeningAudioSource(exam, exam.parts[0] ?? null)
}

/**
 * Audio cho IELTS / FCE / CAE / CPE.
 * IELTS: ưu tiên partN.mp3 (catalog disk) khi JSON gán chung listening.mp3;
 * không gộp 1 full file cho mọi Part nếu đã resolve được file riêng.
 */
export function resolveListeningAudioSource(
  exam: ListeningExam,
  part: ListeningPart | null,
): ExamAudioSource {
  // IELTS: prefer per-part file (part1.mp3 …) over shared full listening.mp3
  if (exam.examType === 'ielts' && part) {
    const fromPart = partAudioSource(part)

    // Có blob local riêng (audioKey) → giữ nguyên
    if (fromPart.audioKey) {
      return withCatalogAudioFallback(exam, fromPart)
    }

    // Full track + explicit segment % (fallback khi thiếu partN.mp3) — không rewrite sang partN
    if (fromPart.startPct != null || fromPart.endPct != null) {
      return withCatalogAudioFallback(exam, fromPart)
    }

    const alreadyPartFile = Boolean(fromPart.audioUrl && /\/part\d+\.mp3(?:\?|$)/i.test(fromPart.audioUrl))
    const partFileUrl =
      (alreadyPartFile ? fromPart.audioUrl : undefined)
      ?? rewriteIeltsFullTrackToPartUrl(fromPart.audioUrl, part.partNumber)
      ?? inferIeltsCatalogPartAudioUrl(exam.title, part.partNumber)

    // JSON/catalog trỏ full track hoặc chưa có URL → dùng partN.mp3
    if (partFileUrl) {
      return withCatalogAudioFallback(exam, {
        audioUrl: partFileUrl,
        ttsText: fromPart.ttsText,
      })
    }

    if (hasExamAudioSource(fromPart) || fromPart.startPct != null) {
      return withCatalogAudioFallback(exam, fromPart)
    }
  }

  const shared = sharedExamAudioSource(exam)
  if (shared) {
    // Still attach segment when returning shared for non-IELTS? keep as-is
    if (exam.examType === 'ielts' && part) {
      // Last resort: shared full + optional segment %
      const partFileUrl =
        rewriteIeltsFullTrackToPartUrl(shared.audioUrl, part.partNumber)
        ?? inferIeltsCatalogPartAudioUrl(exam.title, part.partNumber)
      if (partFileUrl) {
        return withCatalogAudioFallback(exam, {
          audioUrl: partFileUrl,
          ttsText: part.ttsText ?? shared.ttsText,
        })
      }
      return {
        ...shared,
        startPct: part.audioStartPct ?? shared.startPct,
        endPct: part.audioEndPct ?? shared.endPct,
      }
    }
    return shared
  }
  if (part) return withCatalogAudioFallback(exam, partAudioSource(part))
  return withCatalogAudioFallback(exam, {
    audioKey: undefined,
    audioUrl: undefined,
    ttsText: undefined,
  })
}

/** True khi mọi part resolve ra cùng 1 file (không tính rewrite IELTS partN). */
export function examUsesSharedFullAudio(exam: ListeningExam): boolean {
  if (exam.examType === 'ielts') {
    const ids = exam.parts.map(p => {
      const s = resolveListeningAudioSource(exam, p)
      return s.audioKey || s.audioUrl || ''
    }).filter(Boolean)
    if (ids.length === 0) return false
    return ids.every(id => id === ids[0])
  }
  return Boolean(sharedExamAudioSource(exam))
}

export function hasExamAudioSource(source: ExamAudioSource): boolean {
  return Boolean(source.audioKey || source.audioUrl || source.ttsText?.trim())
}

export function hasExamAudioFile(source: ExamAudioSource): boolean {
  return Boolean(source.audioKey || source.audioUrl)
}
