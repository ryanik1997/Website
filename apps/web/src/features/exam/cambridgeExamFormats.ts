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
      label: 'Reading & Writing (Parts 1–7)',
      durationMinutes: 60,
      parts: 7,
      questions: 32,
      weightPercent: 50,
      note: 'Reading Parts 1–5 + Writing Parts 6–7 trong cùng đề (60 phút).',
    },
    listening: {
      label: 'Listening',
      durationMinutes: 25,
      parts: 5,
      questions: 25,
      weightPercent: 25,
      note: '25 phút làm bài (gồm thời gian nghe + điền đáp án).',
    },
  },
  {
    slug: 'b1',
    exam: 'PET',
    reading: {
      label: 'Reading & Writing',
      durationMinutes: 45,
      parts: 8,
      questions: 34,
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