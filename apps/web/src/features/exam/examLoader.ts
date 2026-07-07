import type { ReadingExamRecord } from '@ryan/db'
import { examRepo } from '@ryan/db'
import type { ReadingExam, ReadingPart } from './examData'
import { READING_EXAMS } from './examData'
import { getPublishedReadingExam, listPublishedReadingExams } from './readingExamPublish'

function recordToExam(record: ReadingExamRecord): ReadingExam {
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

export function getBuiltinReadingExam(examId: string): ReadingExam | null {
  return READING_EXAMS.find(exam => exam.id === examId) ?? null
}

export async function resolveReadingExam(examId: string): Promise<ReadingExam | null> {
  const local = await examRepo.get(examId)
  if (local) return recordToExam(local)

  try {
    const published = await getPublishedReadingExam(examId)
    if (published) return published
  } catch (err) {
    console.warn('Không tải được đề Reading published:', err)
  }

  return getBuiltinReadingExam(examId)
}

export async function listAllReadingExams(): Promise<ReadingExam[]> {
  const imported = (await examRepo.list()).map(recordToExam)
  const builtinIds = new Set(READING_EXAMS.map(e => e.id))

  let published: ReadingExam[] = []
  try {
    published = await listPublishedReadingExams()
  } catch (err) {
    console.warn('Không tải danh sách đề Reading published:', err)
  }

  const publishedIds = new Set(published.map(e => e.id))
  const publishedOnly = published.filter(e => !builtinIds.has(e.id))
  const localOnly = imported.filter(e => !builtinIds.has(e.id) && !publishedIds.has(e.id))
  return [...READING_EXAMS, ...publishedOnly, ...localOnly]
}

export function examRecordFromReading(exam: ReadingExam, source: 'pdf' | 'manual', sourceFilename?: string) {
  return {
    id: exam.id,
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    bandHint: exam.bandHint,
    parts: exam.parts as unknown[],
    source,
    sourceFilename,
    examTrack: exam.examTrack,
    cambridgeLevel: exam.cambridgeLevel,
  }
}