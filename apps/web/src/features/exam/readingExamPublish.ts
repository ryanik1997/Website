import { supabase } from '../../lib/supabase'
import type { ReadingExam, ReadingPart } from './examData'

interface PublishedRow {
  id: string
  title: string
  duration_minutes: number
  band_hint: string | null
  parts: ReadingPart[]
  exam_track: string | null
  cambridge_level: string | null
  source: string
  source_filename: string | null
}

function rowToExam(row: PublishedRow): ReadingExam {
  return {
    id: row.id,
    title: row.title,
    durationMinutes: row.duration_minutes,
    bandHint: row.band_hint ?? '',
    parts: row.parts,
    examTrack: (row.exam_track as ReadingExam['examTrack']) ?? undefined,
    cambridgeLevel: (row.cambridge_level as ReadingExam['cambridgeLevel']) ?? undefined,
  }
}

/** Bỏ imageKey local — chỉ giữ URL cloud để user khác thiết bị thấy được. */
function stripLocalMediaKeys(exam: ReadingExam): ReadingExam {
  return {
    ...exam,
    parts: exam.parts.map(part => ({
      ...part,
      passage: part.passage.map(block => ({ ...block, imageKey: undefined })),
      questionGroups: part.questionGroups.map(group => ({ ...group, imageKey: undefined })),
    })),
  }
}

/** Admin publish đề Reading lên Supabase — mọi user thấy. */
export async function publishReadingExamToCloud(
  exam: ReadingExam,
  meta?: { source?: string; sourceFilename?: string },
): Promise<void> {
  const clean = stripLocalMediaKeys(exam)
  const { data: userData } = await supabase.auth.getUser()
  const payload = {
    id: clean.id,
    title: clean.title,
    duration_minutes: clean.durationMinutes,
    band_hint: clean.bandHint ?? null,
    parts: clean.parts as unknown as Record<string, unknown>[],
    exam_track: clean.examTrack ?? null,
    cambridge_level: clean.cambridgeLevel ?? null,
    source: meta?.source ?? 'manual',
    source_filename: meta?.sourceFilename ?? null,
    published_by: userData.user?.id ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data: existing } = await supabase
    .from('reading_exam_published')
    .select('id')
    .eq('id', clean.id)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('reading_exam_published')
      .update(payload)
      .eq('id', clean.id)
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await supabase
    .from('reading_exam_published')
    .insert(payload)
  if (error) throw new Error(error.message)
}

export async function getPublishedReadingExam(examId: string): Promise<ReadingExam | null> {
  const { data, error } = await supabase
    .from('reading_exam_published')
    .select('id, title, duration_minutes, band_hint, parts, exam_track, cambridge_level, source, source_filename')
    .eq('id', examId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return rowToExam(data as unknown as PublishedRow)
}

export async function listPublishedReadingExams(): Promise<ReadingExam[]> {
  const { data, error } = await supabase
    .from('reading_exam_published')
    .select('id, title, duration_minutes, band_hint, parts, exam_track, cambridge_level, source, source_filename')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(row => rowToExam(row as unknown as PublishedRow))
}

/** Gỡ đề Reading đã publish (Admin xóa — tránh đề “sống lại” sau khi xóa local). */
export async function deletePublishedReadingExam(examId: string): Promise<void> {
  const { error } = await supabase
    .from('reading_exam_published')
    .delete()
    .eq('id', examId)
  if (error) throw new Error(error.message)
}