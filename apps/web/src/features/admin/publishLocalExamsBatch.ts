import { isCatalogListeningExamId, isCatalogReadingExamId } from '@ryan/catalog'
import { examRepo, listeningExamRepo, type ListeningExamRecord, type ReadingExamRecord } from '@ryan/db'
import type { ListeningExam, ListeningPart } from '../exam/listeningExamData'
import { mergeCatalogListeningMedia } from '../exam/listeningExamCatalogMerge'
import { deletePublishedListeningExam, publishListeningExamToCloud } from '../exam/listeningExamPublish'
import { normalizeListeningExamForDisplay } from '../exam/listeningImportNormalize'
import { deletePublishedReadingExam, publishReadingExamToCloud } from '../exam/readingExamPublish'
import { supabase } from '../../lib/supabase'
import type { ReadingExam, ReadingPart } from '../exam/examData'

export interface BatchPublishProgress {
  skill: 'reading' | 'listening'
  current: number
  total: number
  examId: string
  title: string
}

export interface BatchPublishCounts {
  published: number
  skipped: number
  failed: number
}

export interface BatchPublishError {
  skill: 'reading' | 'listening'
  examId: string
  title: string
  message: string
}

export interface BatchPublishResult {
  reading: BatchPublishCounts
  listening: BatchPublishCounts
  errors: BatchPublishError[]
}

function readingRecordToExam(record: ReadingExamRecord): ReadingExam {
  return {
    id: record.id,
    title: record.title,
    durationMinutes: record.durationMinutes,
    bandHint: record.bandHint,
    parts: record.parts as ReadingPart[],
    examTrack: record.examTrack,
    cambridgeLevel: record.cambridgeLevel,
  }
}

function listeningRecordToExam(record: ListeningExamRecord): ListeningExam {
  return {
    id: record.id,
    title: record.title,
    durationMinutes: record.durationMinutes,
    bandHint: record.bandHint,
    examType: record.examType,
    examMode: record.examMode,
    parts: record.parts as ListeningPart[],
  }
}

export function isPublishableReadingId(id: string): boolean {
  return !isCatalogReadingExamId(id)
}

export function isPublishableListeningId(id: string): boolean {
  return !isCatalogListeningExamId(id) && id.startsWith('listening-import-')
}

export async function countPublishableLocalExams(): Promise<{ reading: number; listening: number }> {
  const [reading, listening] = await Promise.all([
    examRepo.list(),
    listeningExamRepo.list(),
  ])
  return {
    reading: reading.filter(r => isPublishableReadingId(r.id)).length,
    listening: listening.filter(r => isPublishableListeningId(r.id)).length,
  }
}

export async function listPublishableLocalExams(): Promise<{
  reading: ReadingExamRecord[]
  listening: ListeningExamRecord[]
}> {
  const [reading, listening] = await Promise.all([
    examRepo.list(),
    listeningExamRepo.list(),
  ])
  return {
    reading: reading.filter(r => isPublishableReadingId(r.id)),
    listening: listening.filter(r => isPublishableListeningId(r.id)),
  }
}

export async function publishAllLocalExamsToCloud(
  onProgress?: (progress: BatchPublishProgress) => void,
  options?: { forceAll?: boolean },
): Promise<BatchPublishResult> {
  const { reading, listening } = await listPublishableLocalExams()
  const result: BatchPublishResult = {
    reading: { published: 0, skipped: 0, failed: 0 },
    listening: { published: 0, skipped: 0, failed: 0 },
    errors: [],
  }

  // Incremental publish: a cloud row whose publish timestamp is newer than
  // the local Dexie update has not changed and can be skipped safely.
  const cloudReadingUpdated = new Map<string, number>()
  const cloudListeningUpdated = new Map<string, number>()
  try {
    const [{ data: cloudReading }, { data: cloudListening }] = await Promise.all([
      supabase.from('reading_exam_published').select('id, updated_at'),
      supabase.from('listening_exam_published').select('id, updated_at'),
    ])
    for (const row of cloudReading ?? []) {
      cloudReadingUpdated.set(row.id, Date.parse(row.updated_at ?? '') || 0)
    }
    for (const row of cloudListening ?? []) {
      cloudListeningUpdated.set(row.id, Date.parse(row.updated_at ?? '') || 0)
    }
  } catch {
    // Metadata lookup failure falls back to the previous full publish behavior.
  }

  const readingChanged = reading.filter(record => {
    const cloudUpdatedAt = cloudReadingUpdated.get(record.id)
    const changed = options?.forceAll === true || cloudUpdatedAt == null || record.updatedAt > cloudUpdatedAt
    if (!changed) result.reading.skipped += 1
    return changed
  })
  const listeningChanged = listening.filter(record => {
    const cloudUpdatedAt = cloudListeningUpdated.get(record.id)
    const changed = options?.forceAll === true || cloudUpdatedAt == null || record.updatedAt > cloudUpdatedAt
    if (!changed) result.listening.skipped += 1
    return changed
  })

  const total = readingChanged.length + listeningChanged.length
  let step = 0

  for (const record of readingChanged) {
    step += 1
    onProgress?.({
      skill: 'reading',
      current: step,
      total,
      examId: record.id,
      title: record.title,
    })
    try {
      const exam = readingRecordToExam(record)
      await publishReadingExamToCloud(exam, {
        source: record.source,
        sourceFilename: record.sourceFilename,
      })
      result.reading.published += 1
    } catch (err) {
      result.reading.failed += 1
      result.errors.push({
        skill: 'reading',
        examId: record.id,
        title: record.title,
        message: err instanceof Error ? err.message : 'Publish thất bại',
      })
    }
  }

  for (const record of listeningChanged) {
    step += 1
    onProgress?.({
      skill: 'listening',
      current: step,
      total,
      examId: record.id,
      title: record.title,
    })
    try {
      let exam = listeningRecordToExam(record)
      exam = normalizeListeningExamForDisplay(exam)
      exam = mergeCatalogListeningMedia(exam)
      await publishListeningExamToCloud(exam, {
        source: record.source,
        sourceFilename: record.sourceFilename,
      })
      result.listening.published += 1
    } catch (err) {
      result.listening.failed += 1
      result.errors.push({
        skill: 'listening',
        examId: record.id,
        title: record.title,
        message: err instanceof Error ? err.message : 'Publish thất bại',
      })
    }
  }

  // Batch Publish is authoritative for admin-imported exams: remove cloud
  // rows that no longer exist in the admin's local publishable set.
  try {
    const [{ data: cloudReading }, { data: cloudListening }] = await Promise.all([
      supabase.from('reading_exam_published').select('id'),
      supabase.from('listening_exam_published').select('id'),
    ])
    const readingIds = new Set(reading.map(record => record.id))
    const listeningIds = new Set(listening.map(record => record.id))
    for (const row of cloudReading ?? []) {
      if (!readingIds.has(row.id)) await deletePublishedReadingExam(row.id)
    }
    for (const row of cloudListening ?? []) {
      if (!listeningIds.has(row.id)) await deletePublishedListeningExam(row.id)
    }
  } catch (err) {
    result.errors.push({
      skill: 'reading',
      examId: '__prune__',
      title: 'Prune exam cloud',
      message: err instanceof Error ? err.message : 'Không thể dọn đề đã xóa trên cloud',
    })
  }

  return result
}
