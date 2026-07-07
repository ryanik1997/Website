import { supabase } from '../../lib/supabase'
import type { ListeningExam, ListeningPart } from './listeningExamData'

interface PublishedRow {
  id: string
  title: string
  duration_minutes: number
  band_hint: string | null
  exam_type: string
  exam_mode: string
  parts: ListeningPart[]
  source: string
  source_filename: string | null
}

function rowToExam(row: PublishedRow): ListeningExam {
  return {
    id: row.id,
    title: row.title,
    durationMinutes: row.duration_minutes,
    bandHint: row.band_hint ?? '',
    examType: row.exam_type as ListeningExam['examType'],
    examMode: row.exam_mode as ListeningExam['examMode'],
    parts: row.parts,
  }
}

/** Bỏ blob key local — giữ audioUrl/imageUrl public để user khác thiết bị nghe/xem được. */
function stripLocalMediaKeys(exam: ListeningExam): ListeningExam {
  return {
    ...exam,
    parts: exam.parts.map(part => ({
      ...part,
      audioKey: undefined,
      partImageKey: undefined,
      questions: part.questions.map(q => ({
        ...q,
        audioKey: undefined,
        pictureImageKey: undefined,
        options: q.options.map(opt => ({ ...opt, imageKey: undefined })),
      })),
    })),
  }
}

/** Admin publish đề Listening lên Supabase — mọi user thấy. */
export async function publishListeningExamToCloud(
  exam: ListeningExam,
  meta?: { source?: string; sourceFilename?: string },
): Promise<void> {
  const clean = stripLocalMediaKeys(exam)
  const { data: userData } = await supabase.auth.getUser()
  const payload = {
    id: clean.id,
    title: clean.title,
    duration_minutes: clean.durationMinutes,
    band_hint: clean.bandHint ?? null,
    exam_type: clean.examType,
    exam_mode: clean.examMode,
    parts: clean.parts as unknown as Record<string, unknown>[],
    source: meta?.source ?? 'manual',
    source_filename: meta?.sourceFilename ?? null,
    published_by: userData.user?.id ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data: existing } = await supabase
    .from('listening_exam_published')
    .select('id')
    .eq('id', clean.id)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('listening_exam_published')
      .update(payload)
      .eq('id', clean.id)
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await supabase
    .from('listening_exam_published')
    .insert(payload)
  if (error) throw new Error(error.message)
}

export async function getPublishedListeningExam(examId: string): Promise<ListeningExam | null> {
  const { data, error } = await supabase
    .from('listening_exam_published')
    .select('id, title, duration_minutes, band_hint, exam_type, exam_mode, parts, source, source_filename')
    .eq('id', examId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return rowToExam(data as unknown as PublishedRow)
}

export async function listPublishedListeningExams(): Promise<ListeningExam[]> {
  const { data, error } = await supabase
    .from('listening_exam_published')
    .select('id, title, duration_minutes, band_hint, exam_type, exam_mode, parts, source, source_filename')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(row => rowToExam(row as unknown as PublishedRow))
}