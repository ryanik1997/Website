import { audioRepo } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import type { ListeningExam, ListeningPart, ListeningQuestion } from './listeningExamData'

/** Mode A private bucket — signed via content-sign (no public URL). */
const BUCKET = 'exam-media'
const PATH_PREFIX = 'catalog/listening-publish'

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

async function assertAdminSessionForUpload(): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error(
      'Upload media thất bại: chưa đăng nhập (session Supabase). Đăng nhập lại rồi thử publish.',
    )
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Upload media thất bại: không đọc được profile (${profileError.message})`)
  }
  if (profile?.is_admin !== true) {
    throw new Error(
      'Upload media thất bại: tài khoản không có quyền admin trên server (profiles.is_admin). ' +
        'Chạy UPDATE profiles SET is_admin = true WHERE email = \'...\' rồi đăng xuất/đăng nhập lại.',
    )
  }
}

async function uploadBlob(
  examId: string,
  pathSuffix: string,
  blob: Blob,
  fallbackExt: string,
): Promise<string> {
  const ext = extFromBlob(blob, fallbackExt)
  const objectPath = `${PATH_PREFIX}/${sanitizeExamId(examId)}/${pathSuffix}.${ext}`
  const contentType = blob.type || (fallbackExt === 'mp3' ? 'audio/mpeg' : 'application/octet-stream')

  const upload = supabase.storage
    .from(BUCKET)
    .upload(objectPath, blob, { upsert: true, contentType })
  const result = await Promise.race([
    upload,
    new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error(`Upload media timeout sau 120 giây (${objectPath})`)),
        120_000,
      )
    }),
  ])
  const { error } = result

  if (error) {
    const msg = error.message || ''
    if (/row-level security|rls/i.test(msg)) {
      throw new Error(
        `Upload media thất bại (${objectPath}): ${msg}. ` +
          'Bucket exam-media chỉ cho admin upload; cần migration 023 (admin SELECT + upsert) ' +
          'và profiles.is_admin = true. Chạy: pnpm db:push',
      )
    }
    throw new Error(`Upload media thất bại (${objectPath}): ${msg}`)
  }

  // App-relative path → resolvePlayableMediaUrl → content-sign
  return `/${objectPath}`
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
  const needsUpload = exam.parts.some(
    part =>
      Boolean(part.audioKey?.trim())
      || Boolean(part.partImageKey?.trim())
      || part.questions.some(
        q =>
          Boolean(q.audioKey?.trim())
          || Boolean(q.pictureImageKey?.trim())
          || q.options.some(opt => Boolean(opt.imageKey?.trim())),
      ),
  )
  if (needsUpload) await assertAdminSessionForUpload()

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
