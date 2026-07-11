import { audioRepo } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import type { ListeningExam, ListeningPart, ListeningQuestion } from './listeningExamData'

const BUCKET = 'listening-exam-media'

function sanitizeExamId(examId: string): string {
  return examId.replace(/[^a-zA-Z0-9._-]+/g, '_')
}

function extFromBlob(blob: Blob, fallback: string): string {
  const mime = (blob.type || '').toLowerCase()
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3'
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('webm')) return 'webm'
  if (mime.includes('ogg')) return 'ogg'
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  return fallback
}

async function uploadBlob(
  examId: string,
  pathSuffix: string,
  blob: Blob,
  fallbackExt: string,
): Promise<string> {
  const ext = extFromBlob(blob, fallbackExt)
  const storagePath = `${sanitizeExamId(examId)}/${pathSuffix}.${ext}`
  const contentType = blob.type || (fallbackExt === 'mp3' ? 'audio/mpeg' : 'application/octet-stream')

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, { upsert: true, contentType })

  if (error) throw new Error(`Upload media thất bại (${storagePath}): ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function uploadKeyIfPresent(
  examId: string,
  pathSuffix: string,
  key: string | undefined,
  fallbackExt: string,
): Promise<string | undefined> {
  if (!key?.trim()) return undefined
  try {
    const record = await audioRepo.get(key)
    if (!record?.blob || record.blob.size === 0) {
      console.warn('[listening publish] blob trống:', key)
      return undefined
    }
    return await uploadBlob(examId, pathSuffix, record.blob, fallbackExt)
  } catch (err) {
    console.warn('[listening publish] upload key failed', key, err)
    throw err
  }
}

/**
 * Đưa blob local (audioKey / *ImageKey) lên Supabase Storage → public URL.
 * Gọi trước khi publish JSON — Firefox / user khác mới nghe được MP3.
 */
export async function materializeListeningMediaForPublish(
  exam: ListeningExam,
): Promise<ListeningExam> {
  const parts: ListeningPart[] = []

  for (const part of exam.parts) {
    const audioUrl =
      (await uploadKeyIfPresent(exam.id, `part${part.partNumber}-audio`, part.audioKey, 'mp3'))
      ?? part.audioUrl

    const partImageUrl =
      (await uploadKeyIfPresent(exam.id, `part${part.partNumber}-img`, part.partImageKey, 'jpg'))
      ?? part.partImageUrl

    const questions: ListeningQuestion[] = []
    for (const q of part.questions) {
      const pictureImageUrl =
        (await uploadKeyIfPresent(
          exam.id,
          `part${part.partNumber}-q${q.number}-pic`,
          q.pictureImageKey,
          'jpg',
        ))
        ?? q.pictureImageUrl

      const questionAudioUrl =
        (await uploadKeyIfPresent(
          exam.id,
          `part${part.partNumber}-q${q.number}-audio`,
          q.audioKey,
          'mp3',
        ))
        ?? q.audioUrl

      const options = []
      for (let oi = 0; oi < q.options.length; oi += 1) {
        const opt = q.options[oi]!
        const imageUrl =
          (await uploadKeyIfPresent(
            exam.id,
            `part${part.partNumber}-q${q.number}-opt${opt.id || oi}`,
            opt.imageKey,
            'jpg',
          ))
          ?? opt.imageUrl
        options.push({
          ...opt,
          imageKey: undefined,
          imageUrl,
        })
      }

      questions.push({
        ...q,
        audioKey: undefined,
        pictureImageKey: undefined,
        audioUrl: questionAudioUrl,
        pictureImageUrl,
        options,
      })
    }

    parts.push({
      ...part,
      audioKey: undefined,
      partImageKey: undefined,
      audioUrl,
      partImageUrl,
      questions,
    })
  }

  return { ...exam, parts }
}

/** true nếu sau materialize vẫn không có audio public nào */
export function listeningExamMissingPublicAudio(exam: ListeningExam): boolean {
  return !exam.parts.some(p => Boolean(p.audioUrl?.trim()) || p.questions.some(q => Boolean(q.audioUrl?.trim())))
}
