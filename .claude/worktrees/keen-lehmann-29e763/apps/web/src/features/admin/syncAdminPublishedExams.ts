import { db, examRepo, listeningExamRepo, settingsRepo } from '@ryan/db'
import { supabase } from '../../lib/supabase'

/**
 * Prune đề Reading/Listening Admin đã publish nhưng vừa xoá.
 *
 * Vì `listAllReadingExams` / `listAllListeningExams` đọc thẳng từ cloud
 * `reading_exam_published` / `listening_exam_published`, khi Admin xoá cloud
 * là đề biến khỏi Library. Tuy nhiên một số flow phụ (`persistReadingPartImage`,
 * cache khi user vào edit ảnh, `readingExamCloudImages.ts`) có thể ghi lại bản
 * local vào `examRepo` với cùng id. Nếu Admin xoá cloud rồi mà bản local vẫn còn
 * → `resolveReadingExam` vẫn trả về được → đề "sống lại" khi mở chi tiết.
 *
 * Cơ chế: mỗi lần sync ghi lại danh sách id publish hiện tại vào settings.
 * Lần sau nếu id nào biến mất khỏi cloud → prune bản local + audio blob liên quan.
 * Đề user tự import (không nằm trong danh sách publish) không bị đụng.
 */

const READING_PUBLISHED_IDS_KEY = 'admin_published_reading_exam_ids'
const LISTENING_PUBLISHED_IDS_KEY = 'admin_published_listening_exam_ids'

async function pruneReadingExamAudio(examId: string): Promise<void> {
  const prefix = `reading-exam:${examId}:`
  const keys = await db.audioBlobs.where('key').startsWith(prefix).primaryKeys()
  if (keys.length) await db.audioBlobs.bulkDelete(keys as string[])
}

async function pruneListeningExamAudio(examId: string): Promise<void> {
  const prefix = `listening-exam:${examId}:`
  const keys = await db.audioBlobs.where('key').startsWith(prefix).primaryKeys()
  if (keys.length) await db.audioBlobs.bulkDelete(keys as string[])
}

async function syncPublishedReading(): Promise<{ pruned: number }> {
  const { data, error } = await supabase
    .from('reading_exam_published')
    .select('id')
  if (error) {
    console.warn('[syncAdminPublishedExams] reading list:', error.message)
    return { pruned: 0 }
  }
  const cloudIds = new Set((data ?? []).map(r => (r as { id: string }).id))
  const previousIds = (await settingsRepo.getSetting(READING_PUBLISHED_IDS_KEY) as string[] | undefined) ?? []
  const staleIds = previousIds.filter(id => !cloudIds.has(id))
  for (const id of staleIds) {
    await pruneReadingExamAudio(id)
    await examRepo.delete(id)
  }
  await settingsRepo.putSetting(READING_PUBLISHED_IDS_KEY, [...cloudIds])
  return { pruned: staleIds.length }
}

async function syncPublishedListening(): Promise<{ pruned: number }> {
  const { data, error } = await supabase
    .from('listening_exam_published')
    .select('id')
  if (error) {
    console.warn('[syncAdminPublishedExams] listening list:', error.message)
    return { pruned: 0 }
  }
  const cloudIds = new Set((data ?? []).map(r => (r as { id: string }).id))
  const previousIds = (await settingsRepo.getSetting(LISTENING_PUBLISHED_IDS_KEY) as string[] | undefined) ?? []
  const staleIds = previousIds.filter(id => !cloudIds.has(id))
  for (const id of staleIds) {
    await pruneListeningExamAudio(id)
    await listeningExamRepo.delete(id)
  }
  await settingsRepo.putSetting(LISTENING_PUBLISHED_IDS_KEY, [...cloudIds])
  return { pruned: staleIds.length }
}

/** Chạy khi vào /app cùng lượt với các sync khác. */
export async function syncAdminPublishedExams(): Promise<{
  readingPruned: number
  listeningPruned: number
}> {
  const [reading, listening] = await Promise.all([
    syncPublishedReading(),
    syncPublishedListening(),
  ])
  return {
    readingPruned: reading.pruned,
    listeningPruned: listening.pruned,
  }
}
