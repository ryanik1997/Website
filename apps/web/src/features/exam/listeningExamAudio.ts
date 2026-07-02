import type { ListeningExam, ListeningPart } from './listeningExamData'
import type { ExamAudioSource } from './useExamQuestionAudio'

export function partAudioSource(part: ListeningPart): ExamAudioSource {
  return {
    audioKey: part.audioKey,
    audioUrl: part.audioUrl,
    ttsText: part.ttsText,
  }
}

function sameAudioSource(a: ExamAudioSource, b: ExamAudioSource): boolean {
  if (a.audioKey && b.audioKey && a.audioKey === b.audioKey) return true
  if (a.audioUrl && b.audioUrl && a.audioUrl === b.audioUrl) return true
  return false
}

/**
 * Một file MP3 chung cho cả bài — khi mọi part (có audio) trỏ cùng audioKey/audioUrl.
 * KET/PET/import ZIP thường dùng pattern này.
 */
export function sharedExamAudioSource(exam: ListeningExam): ExamAudioSource | null {
  const partsWithAudio = exam.parts
    .map(partAudioSource)
    .filter(hasExamAudioSource)
  if (partsWithAudio.length === 0) return null

  const first = partsWithAudio[0]
  const allShare = exam.parts.every(part => {
    const src = partAudioSource(part)
    if (!hasExamAudioSource(src)) return true
    return sameAudioSource(src, first)
  })

  return allShare ? first : null
}

/** @deprecated Dùng sharedExamAudioSource */
export function ketSharedExamAudioSource(exam: ListeningExam): ExamAudioSource {
  return sharedExamAudioSource(exam) ?? { audioKey: undefined, audioUrl: undefined, ttsText: undefined }
}

/** Audio cho IELTS / FCE / CAE / CPE: ưu tiên MP3 chung, không thì theo Part */
export function resolveListeningAudioSource(
  exam: ListeningExam,
  part: ListeningPart | null,
): ExamAudioSource {
  const shared = sharedExamAudioSource(exam)
  if (shared) return shared
  if (part) return partAudioSource(part)
  return { audioKey: undefined, audioUrl: undefined, ttsText: undefined }
}

export function hasExamAudioSource(source: ExamAudioSource): boolean {
  return Boolean(source.audioKey || source.audioUrl || source.ttsText?.trim())
}

export function hasExamAudioFile(source: ExamAudioSource): boolean {
  return Boolean(source.audioKey || source.audioUrl)
}