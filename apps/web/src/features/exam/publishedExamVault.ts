import { supabase } from '../../lib/supabase'
import {
  createExamAnswersVault,
  publishedAnswersPath,
} from './examAnswerSecurity'

type PublishableExam = Record<string, unknown> & { id: string }
type PublishedSkill = 'listening' | 'reading'

/**
 * Persist answer keys before publishing the stripped runtime body.
 * Storage is private; access is only through content-sign after entitlement.
 */
export async function uploadPublishedExamVault(
  exam: PublishableExam,
  skill: PublishedSkill,
): Promise<string> {
  const path = publishedAnswersPath(exam.id, skill)
  const vault = createExamAnswersVault(exam)
  const body = new Blob([JSON.stringify(vault)], { type: 'application/json' })
  const { error } = await supabase.storage
    .from('exam-media')
    .upload(path, body, {
      upsert: true,
      contentType: 'application/json',
      cacheControl: 'private, max-age=60',
    })

  if (error) {
    throw new Error(`Không thể lưu answer vault: ${error.message}`)
  }
  return path
}

export async function deletePublishedExamVault(
  examId: string,
  skill: PublishedSkill,
): Promise<void> {
  const { error } = await supabase.storage
    .from('exam-media')
    .remove([publishedAnswersPath(examId, skill)])
  if (error) throw new Error(`Không thể xóa answer vault: ${error.message}`)
}
