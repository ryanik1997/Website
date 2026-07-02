import type { CambridgeLevelSlug } from './cambridgeExamLevels'

export interface CambridgeSkillFormat {
  label: string
  durationMinutes: number
  parts: number
  questions: number
  weightPercent?: number
  note?: string
}

export interface CambridgeLevelFormat {
  slug: CambridgeLevelSlug
  exam: string
  reading: CambridgeSkillFormat
  listening: CambridgeSkillFormat
}

export const CAMBRIDGE_EXAM_FORMATS: CambridgeLevelFormat[] = [
  {
    slug: 'a2',
    exam: 'KET',
    reading: {
      label: 'Reading (Parts 1–5)',
      durationMinutes: 30,
      parts: 5,
      questions: 32,
      weightPercent: 50,
      note: 'Chỉ phần Reading (30 phút). Writing Parts 6–7 ở module Viết.',
    },
    listening: {
      label: 'Listening',
      durationMinutes: 30,
      parts: 5,
      questions: 25,
      weightPercent: 25,
      note: 'Thêm 6 phút chuyển đáp án sau khi nghe.',
    },
  },
  {
    slug: 'b1',
    exam: 'PET',
    reading: {
      label: 'Reading',
      durationMinutes: 45,
      parts: 6,
      questions: 32,
      weightPercent: 25,
    },
    listening: {
      label: 'Listening',
      durationMinutes: 30,
      parts: 4,
      questions: 25,
      weightPercent: 25,
    },
  },
  {
    slug: 'b2',
    exam: 'FCE',
    reading: {
      label: 'Reading and Use of English',
      durationMinutes: 75,
      parts: 7,
      questions: 52,
      weightPercent: 40,
    },
    listening: {
      label: 'Listening',
      durationMinutes: 40,
      parts: 4,
      questions: 30,
      weightPercent: 20,
    },
  },
  {
    slug: 'c1',
    exam: 'CAE',
    reading: {
      label: 'Reading and Use of English',
      durationMinutes: 90,
      parts: 8,
      questions: 56,
      weightPercent: 40,
    },
    listening: {
      label: 'Listening',
      durationMinutes: 40,
      parts: 4,
      questions: 30,
      weightPercent: 20,
    },
  },
  {
    slug: 'c2',
    exam: 'CPE',
    reading: {
      label: 'Reading and Use of English',
      durationMinutes: 90,
      parts: 7,
      questions: 53,
      weightPercent: 40,
    },
    listening: {
      label: 'Listening',
      durationMinutes: 40,
      parts: 4,
      questions: 30,
      weightPercent: 20,
    },
  },
]

export function getCambridgeExamFormat(slug: CambridgeLevelSlug): CambridgeLevelFormat | null {
  return CAMBRIDGE_EXAM_FORMATS.find(f => f.slug === slug) ?? null
}

export function cambridgeReadingBandHint(slug: CambridgeLevelSlug, sampleQuestions: number): string {
  const fmt = getCambridgeExamFormat(slug)
  if (!fmt) return 'Cambridge Reading'
  return `${fmt.exam} · ${fmt.reading.label} · Sample ${sampleQuestions}/${fmt.reading.questions} câu · ${fmt.reading.parts} parts`
}

export function cambridgeListeningBandHint(slug: CambridgeLevelSlug, sampleQuestions: number): string {
  const fmt = getCambridgeExamFormat(slug)
  if (!fmt) return 'Cambridge Listening'
  const transfer = fmt.listening.note ? ` · ${fmt.listening.note}` : ''
  return `${fmt.exam} · ${fmt.listening.parts} parts · Sample ${sampleQuestions}/${fmt.listening.questions} câu · ${fmt.listening.durationMinutes} phút${transfer}`
}