import { lessonRepo, type Lesson } from '@ryan/db'
import type { ListeningExam, ListeningPart } from '../exam/listeningExamData'
import { resolveListeningAudioSource } from '../exam/listeningExamAudio'
import { defaultSentence, splitIntoSentences, type LessonSentence } from './types'

function notePassageToText(part: ListeningPart): string {
  const bits: string[] = []
  if (part.notePassage?.length) {
    for (const b of part.notePassage) {
      if (typeof b === 'string') bits.push(b)
      else if (b && typeof b === 'object' && 'text' in b) {
        bits.push(String((b as { text?: string }).text ?? ''))
      }
    }
  }
  if (part.notePassageSections?.length) {
    for (const sec of part.notePassageSections) {
      if (sec.title) bits.push(sec.title)
      for (const b of sec.blocks ?? []) {
        if (typeof b === 'string') bits.push(b)
        else if (b && typeof b === 'object' && 'text' in b) {
          bits.push(String((b as { text?: string }).text ?? ''))
        }
      }
    }
  }
  return bits.filter(Boolean).join(' ')
}

/**
 * Trích text luyện dictation/cloze từ 1 Part exam.
 * Ưu tiên ttsText → note passage → prompt câu hỏi.
 */
export function extractPracticeTextsFromPart(part: ListeningPart): string[] {
  const tts = part.ttsText?.trim()
  if (tts && tts.length > 20) {
    const parts = splitIntoSentences(tts)
    return parts.length ? parts : [tts]
  }

  const note = notePassageToText(part)
  if (note.length > 40) {
    const parts = splitIntoSentences(note)
    if (parts.length) return parts
  }

  const fromQs: string[] = []
  for (const q of part.questions ?? []) {
    const line = [q.gapLead, q.prompt, q.gapTrail, q.context]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    // Bỏ dòng quá ngắn / chỉ là nhãn
    if (line.length >= 12 && /[a-zA-Z]{3,}/.test(line)) {
      fromQs.push(line)
    }
  }
  if (fromQs.length) return fromQs

  if (part.audioIntro?.trim()) return splitIntoSentences(part.audioIntro.trim())
  if (part.instruction?.trim()) return [part.instruction.trim()]
  return []
}

export function buildLessonTitleFromExam(exam: ListeningExam, part: ListeningPart): string {
  return `${exam.title} · Part ${part.partNumber} (Dictation)`
}

/** Idempotent-ish: tìm lesson đã tạo từ exam+part */
export async function findLinkedLesson(
  examId: string,
  partId: string,
): Promise<Lesson | undefined> {
  const { db } = await import('@ryan/db')
  const lessons = await db.lessons.toArray()
  return lessons.find(
    l => l.sourceExamId === examId && l.sourceExamPartId === partId,
  )
}

export async function createOrOpenPracticeFromExamPart(
  exam: ListeningExam,
  part: ListeningPart,
): Promise<{ lesson: Lesson; created: boolean }> {
  const existing = await findLinkedLesson(exam.id, part.id)
  if (existing) return { lesson: existing, created: false }

  const texts = extractPracticeTextsFromPart(part)
  if (!texts.length) {
    throw new Error('Part này chưa có text để luyện dictation. Thêm ttsText hoặc transcript.')
  }

  const sentences: LessonSentence[] = texts.map(t => defaultSentence(t))
  const audio = resolveListeningAudioSource(exam, part)

  const lesson = await lessonRepo.create({
    category: 'user',
    title: buildLessonTitleFromExam(exam, part),
    sentences,
    source: 'exam',
    sourceExamId: exam.id,
    sourceExamPartId: part.id,
    linkedAudioKey: audio.audioKey,
    linkedAudioUrl: audio.audioUrl,
    topic: `Exam · ${exam.examType} · Part ${part.partNumber}`,
    book: exam.title,
    test: undefined,
    part: part.partNumber,
  })

  return { lesson, created: true }
}

export async function createPracticeFromWholeExam(
  exam: ListeningExam,
): Promise<{ lesson: Lesson; created: boolean }> {
  // Gộp part 1 nếu có, không thì part đầu có text
  for (const part of exam.parts) {
    const texts = extractPracticeTextsFromPart(part)
    if (texts.length) {
      return createOrOpenPracticeFromExamPart(exam, part)
    }
  }
  throw new Error('Đề chưa có text/tts để tạo bài luyện nghe.')
}
