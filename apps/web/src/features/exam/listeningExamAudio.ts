import type { ListeningExam, ListeningPart } from './listeningExamData'
import type { ExamAudioSource } from './useExamQuestionAudio'
import {
  defaultCatalogAudioByExamType,
  inferIeltsCatalogAudioUrl,
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

/** Audio cho IELTS / FCE / CAE / CPE: ưu tiên MP3 chung, không thì theo Part */
export function resolveListeningAudioSource(
  exam: ListeningExam,
  part: ListeningPart | null,
): ExamAudioSource {
  const shared = sharedExamAudioSource(exam)
  if (shared) return shared
  if (part) return withCatalogAudioFallback(exam, partAudioSource(part))
  return withCatalogAudioFallback(exam, {
    audioKey: undefined,
    audioUrl: undefined,
    ttsText: undefined,
  })
}

export function hasExamAudioSource(source: ExamAudioSource): boolean {
  return Boolean(source.audioKey || source.audioUrl || source.ttsText?.trim())
}

export function hasExamAudioFile(source: ExamAudioSource): boolean {
  return Boolean(source.audioKey || source.audioUrl)
}
