/**
 * Merge media từ builtin catalog vào đề Listening (import / published / local).
 * Policy: apps/web/src/features/exam/listeningLocalMediaPolicy.ts
 */
import { CATALOG_LISTENING_EXAMS } from '@ryan/catalog'
import type { ListeningExam, ListeningPart, ListeningQuestion } from './listeningExamData'
import {
  defaultCatalogAudioByExamType,
  inferIeltsCatalogAudioUrl,
} from './listeningCatalogAudioPaths'
import { hasExamAudioSource, partAudioSource } from './listeningExamAudio'
import {
  allowDefaultCatalogAudioByExamType,
  extractListeningTestNumber,
  isValidCatalogListeningTwin,
  normalizeExamTitleKey,
  preferLocalListeningMedia,
  preferLocalAudioUrl,
  preferLocalPartImageUrl,
  preferLocalPictureUrl,
  shouldAttachCatalogAudio,
} from './listeningLocalMediaPolicy'
import { usesCompositePictureBoard } from './listeningPictureMc'

export { inferIeltsCatalogAudioUrl } from './listeningCatalogAudioPaths'
export {
  preferLocalListeningMedia,
  shouldAttachCatalogAudio,
  extractListeningTestNumber,
  isValidCatalogListeningTwin,
} from './listeningLocalMediaPolicy'

/** Audio URL từ builtin catalog hoặc path suy ra — không bao giờ gán Test 1 cho Test N. */
export function resolveListeningCatalogAudioUrl(
  exam: Pick<ListeningExam, 'examType' | 'title'>,
): string | undefined {
  const twin = findCatalogListeningTwin(exam)
  if (twin) {
    const fromTwin = catalogSharedListeningAudioUrl(twin)
    if (fromTwin) return fromTwin
  }
  if (exam.examType === 'ielts') return inferIeltsCatalogAudioUrl(exam.title)
  if (!allowDefaultCatalogAudioByExamType(exam.title)) return undefined
  return defaultCatalogAudioByExamType(exam.examType)
}

/** Tìm đề builtin catalog khớp examType + title (exact / cùng số Test). */
export function findCatalogListeningTwin(
  exam: Pick<ListeningExam, 'examType' | 'title'>,
): ListeningExam | null {
  const localNorm = normalizeExamTitleKey(exam.title)
  const sameType = CATALOG_LISTENING_EXAMS.filter(c => c.examType === exam.examType)

  const asTwin = (c: (typeof sameType)[number]): Pick<ListeningExam, 'examType' | 'title'> => ({
    examType: c.examType,
    title: c.title,
  })

  const exact = sameType.find(c => normalizeExamTitleKey(c.title) === localNorm)
  if (exact && isValidCatalogListeningTwin(exam, asTwin(exact))) {
    return exact as ListeningExam
  }

  const testNum = extractListeningTestNumber(exam.title)
  if (testNum != null) {
    const byTest = sameType.find(c => extractListeningTestNumber(c.title) === testNum)
    if (byTest && isValidCatalogListeningTwin(exam, asTwin(byTest))) {
      return byTest as ListeningExam
    }
    // Có số Test — catalog không có → null (không map Test 3 → Test 1)
    return null
  }

  // Không ghi số Test: chỉ 1 đề builtin cùng type → dùng làm twin layout/media
  if (sameType.length === 1) {
    const only = sameType[0]!
    if (isValidCatalogListeningTwin(exam, asTwin(only))) return only as ListeningExam
  }

  return null
}

export function diagnoseCatalogListeningMatch(
  exam: Pick<ListeningExam, 'examType' | 'title'>,
): string | null {
  const twin = findCatalogListeningTwin(exam)
  if (twin) {
    return `Catalog match: ${twin.title}`
  }

  const testNum = extractListeningTestNumber(exam.title)
  if (exam.examType === 'ielts') {
    const inferred = inferIeltsCatalogAudioUrl(exam.title)
    if (inferred) return `Catalog fallback URL từ title: ${inferred}`
    return 'Title không match fallback catalog IELTS (cần dạng Cambridge N Test M).'
  }

  if (testNum != null && !allowDefaultCatalogAudioByExamType(exam.title)) {
    return `Title ghi Test ${testNum} nhưng không có catalog twin cùng test; fallback theo examType bị chặn để tránh map nhầm audio.`
  }

  const fallback = defaultCatalogAudioByExamType(exam.examType)
  if (fallback) {
    return `Không có catalog twin exact; đang fallback theo examType: ${fallback}`
  }

  return 'Không có catalog twin và cũng không có fallback catalog khả dụng cho examType này.'
}

export function catalogSharedListeningAudioUrl(twin: ListeningExam): string | undefined {
  for (const part of twin.parts) {
    if (part.audioUrl) return part.audioUrl
  }
  for (const part of twin.parts) {
    for (const q of part.questions) {
      if (q.audioUrl) return q.audioUrl
    }
  }
  return undefined
}

export function catalogPartImageUrl(twin: ListeningExam, partNumber: number): string | undefined {
  return twin.parts.find(p => p.partNumber === partNumber)?.partImageUrl
}

export function catalogPictureImageUrl(twin: ListeningExam, questionNumber: number): string | undefined {
  for (const part of twin.parts) {
    const q = part.questions.find(cq => cq.number === questionNumber)
    if (q?.pictureImageUrl) return q.pictureImageUrl
  }
  return undefined
}

export function catalogQuestionAudioUrl(twin: ListeningExam, questionNumber: number): string | undefined {
  for (const part of twin.parts) {
    const q = part.questions.find(cq => cq.number === questionNumber)
    if (q?.audioUrl) return q.audioUrl
  }
  return undefined
}

function mergeQuestionMedia(
  local: ListeningQuestion,
  catalog: ListeningQuestion | undefined,
): ListeningQuestion {
  if (!catalog) return local

  let merged = local

  if (local.type === 'picture-mc') {
    const catalogPic = catalog.pictureImageUrl
    const pictureImageUrl = preferLocalPictureUrl(local, catalogPic)
    const pictureImageKey = local.pictureImageKey
      ?? (!local.pictureImageKey && !local.pictureImageUrl ? catalog.pictureImageKey : undefined)
    merged = {
      ...merged,
      pictureImageKey: local.pictureImageKey ?? pictureImageKey,
      pictureImageUrl,
    }
  }

  merged = {
    ...merged,
    audioUrl: preferLocalAudioUrl(local, catalog.audioUrl),
    ttsText: local.ttsText || catalog.ttsText,
  }

  return merged
}

function mergePartMedia(local: ListeningPart, catalog: ListeningPart | undefined): ListeningPart {
  if (!catalog) {
    return {
      ...local,
      audioUrl: preferLocalAudioUrl(local),
      partImageUrl: preferLocalPartImageUrl(local),
      questions: local.questions.map(q => ({
        ...q,
        audioUrl: preferLocalAudioUrl(q),
        pictureImageUrl: preferLocalPictureUrl(q),
        options: q.options?.map(o => ({
          ...o,
          imageUrl: o.imageKey?.trim() ? undefined : o.imageUrl,
        })) ?? q.options,
      })),
    }
  }

  let merged: ListeningPart = {
    ...local,
    audioUrl: preferLocalAudioUrl(local, catalog.audioUrl),
    partImageUrl: preferLocalPartImageUrl(local, catalog.partImageUrl),
    ttsText: local.ttsText || catalog.ttsText,
    passageTitle: local.passageTitle || catalog.passageTitle,
    notePassage: local.notePassage?.length ? local.notePassage : catalog.notePassage,
    noteTable: local.noteTable?.rows?.length ? local.noteTable : catalog.noteTable,
    noteTables: local.noteTables?.length ? local.noteTables : catalog.noteTables,
    notePassageSections: local.notePassageSections?.length
      ? local.notePassageSections
      : catalog.notePassageSections,
    notePassageLayout: local.notePassageLayout || catalog.notePassageLayout,
  }

  if (!hasExamAudioSource(partAudioSource(local))) {
    merged = {
      ...merged,
      audioKey: local.audioKey ?? catalog.audioKey,
      audioUrl: preferLocalAudioUrl(
        { audioKey: local.audioKey ?? catalog.audioKey, audioUrl: local.audioUrl },
        catalog.audioUrl,
      ),
      ttsText: local.ttsText ?? catalog.ttsText ?? merged.ttsText,
    }
  }

  const questions = local.questions.map(q => {
    const catQ = catalog.questions.find(cq => cq.number === q.number)
    return mergeQuestionMedia(q, catQ)
  })

  return { ...merged, questions }
}

/**
 * Bổ sung media catalog khi thiếu blob.
 * Luôn kết thúc bằng preferLocalListeningMedia (gỡ URL xung đột blob).
 */
export function mergeCatalogListeningMedia(local: ListeningExam): ListeningExam {
  const catalog = findCatalogListeningTwin(local)
  const twinAudioUrl = catalog ? catalogSharedListeningAudioUrl(catalog) : undefined
  // Chỉ fallback type-default khi twin hợp lệ hoặc title cho phép (Test 1 / không số)
  const fallbackAudioUrl = twinAudioUrl
    ?? (catalog || allowDefaultCatalogAudioByExamType(local.title)
      ? resolveListeningCatalogAudioUrl(local)
      : undefined)

  let parts = catalog
    ? local.parts.map(part => {
        const catPart = catalog.parts.find(p => p.partNumber === part.partNumber)
        return mergePartMedia(part, catPart)
      })
    : local.parts.map(part => mergePartMedia(part, undefined))

  if (fallbackAudioUrl) {
    parts = parts.map(part => {
      if (!shouldAttachCatalogAudio(part)) return part
      return { ...part, audioUrl: fallbackAudioUrl }
    })
  }

  return preferLocalListeningMedia({ ...local, parts })
}

export function listeningExamNeedsCatalogMedia(exam: ListeningExam): boolean {
  const noPartAudio = !exam.parts.some(part => hasExamAudioSource(partAudioSource(part)))
  const noQuestionAudio = !exam.parts.some(part =>
    part.questions.some(q => Boolean(q.audioKey || q.audioUrl)),
  )
  const noPictures = exam.parts.some(part =>
    part.questions.some(
      q => q.type === 'picture-mc' && !usesCompositePictureBoard(q) && !q.pictureImageKey,
    ),
  )
  return (noPartAudio && noQuestionAudio) || noPictures
}
