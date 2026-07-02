import { CATALOG_LISTENING_EXAMS } from '@ryan/catalog'
import type { ListeningExam, ListeningPart, ListeningQuestion } from './listeningExamData'
import { hasExamAudioSource, partAudioSource } from './listeningExamAudio'
import { usesCompositePictureBoard } from './listeningPictureMc'

function normalizeExamTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Tìm đề builtin catalog khớp examType + title (dùng khi import / resolve) */
export function findCatalogListeningTwin(
  exam: Pick<ListeningExam, 'examType' | 'title'>,
): ListeningExam | null {
  const localNorm = normalizeExamTitle(exam.title)
  const match = CATALOG_LISTENING_EXAMS.find(
    c => c.examType === exam.examType && normalizeExamTitle(c.title) === localNorm,
  )
  return (match as ListeningExam | undefined) ?? null
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

  if (local.type === 'picture-mc' && catalog.pictureImageUrl) {
    merged = {
      ...merged,
      pictureImageUrl: local.pictureImageUrl ?? catalog.pictureImageUrl,
      pictureImageKey: local.pictureImageKey ?? catalog.pictureImageKey,
    }
  } else if (local.type === 'picture-mc' && !usesCompositePictureBoard(local) && catalog.pictureImageUrl) {
    merged = {
      ...merged,
      pictureImageUrl: catalog.pictureImageUrl,
      pictureImageKey: local.pictureImageKey ?? catalog.pictureImageKey,
    }
  }

  if (!merged.audioUrl && catalog.audioUrl) {
    merged = { ...merged, audioUrl: catalog.audioUrl }
  }
  if (!merged.ttsText && catalog.ttsText) {
    merged = { ...merged, ttsText: catalog.ttsText }
  }

  return merged
}

function mergePartMedia(local: ListeningPart, catalog: ListeningPart | undefined): ListeningPart {
  if (!catalog) return local

  let merged: ListeningPart = { ...local }

  if (!merged.audioUrl && catalog.audioUrl) {
    merged = { ...merged, audioUrl: catalog.audioUrl }
  }
  if (!merged.ttsText && catalog.ttsText) {
    merged = { ...merged, ttsText: catalog.ttsText }
  }
  if (!merged.passageTitle && catalog.passageTitle) {
    merged = { ...merged, passageTitle: catalog.passageTitle }
  }
  if (!merged.notePassage?.length && catalog.notePassage?.length) {
    merged = { ...merged, notePassage: catalog.notePassage }
  }
  if (!merged.partImageUrl && catalog.partImageUrl) {
    merged = { ...merged, partImageUrl: catalog.partImageUrl }
  }
  if (!hasExamAudioSource(partAudioSource(local))) {
    merged = {
      ...merged,
      audioKey: local.audioKey ?? catalog.audioKey,
      audioUrl: merged.audioUrl ?? catalog.audioUrl,
      ttsText: merged.ttsText ?? catalog.ttsText,
    }
  } else if (!merged.audioUrl && catalog.audioUrl) {
    merged = { ...merged, audioUrl: catalog.audioUrl }
  }

  const questions = local.questions.map(q => {
    const catQ = catalog.questions.find(cq => cq.number === q.number)
    return mergeQuestionMedia(q, catQ)
  })

  return { ...merged, questions }
}

/** Bổ sung audioUrl / pictureImageUrl từ builtin catalog khi bản import thiếu blob */
export function mergeCatalogListeningMedia(local: ListeningExam): ListeningExam {
  const catalog = findCatalogListeningTwin(local)
  if (!catalog) return local

  const parts = local.parts.map(part => {
    const catPart = catalog.parts.find(p => p.partNumber === part.partNumber)
    return mergePartMedia(part, catPart)
  })

  return { ...local, parts }
}

export function listeningExamNeedsCatalogMedia(exam: ListeningExam): boolean {
  const noPartAudio = !exam.parts.some(part => hasExamAudioSource(partAudioSource(part)))
  const noQuestionAudio = !exam.parts.some(part =>
    part.questions.some(q => Boolean(q.audioKey || q.audioUrl)),
  )
  const noPictures = exam.parts.some(part =>
    part.questions.some(
      q => q.type === 'picture-mc' && !usesCompositePictureBoard(q),
    ),
  )
  return noPartAudio && noQuestionAudio || noPictures
}