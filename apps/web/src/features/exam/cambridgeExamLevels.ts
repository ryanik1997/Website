import type { ReadingExam } from './examData'
import { getCambridgeExamFormat } from './cambridgeExamFormats'
import type { ListeningExamType } from './listeningExamData'

export type CambridgeLevelSlug = 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

export interface CambridgeExamLevel {
  slug: CambridgeLevelSlug
  exam: string
  label: string
  cefr: string
  subtitle: string
  description: string
  skills: Array<'reading' | 'listening'>
  listeningExamTypes: ListeningExamType[]
  defaultBandHint: string
}

function levelDescription(slug: CambridgeLevelSlug): string {
  const fmt = getCambridgeExamFormat(slug)
  if (!fmt) return 'Đề mẫu Reading + Listening.'
  const r = fmt.reading
  const l = fmt.listening
  const readingNote = r.note ? ` ${r.note}` : ''
  const listeningNote = l.note ? ` ${l.note}` : ''
  return [
    `Reading: ${r.durationMinutes} phút · ${r.parts} parts · ${r.questions} câu (${r.weightPercent}%).${readingNote}`,
    `Listening: ${l.durationMinutes} phút · ${l.parts} parts · ${l.questions} câu (${l.weightPercent}%).${listeningNote}`,
    'Đề mẫu builtin đúng cấu trúc Part — bấm Làm bài để thử.',
  ].join(' ')
}

export const CAMBRIDGE_EXAM_LEVELS: CambridgeExamLevel[] = [
  {
    slug: 'a2',
    exam: 'KET',
    label: 'Cambridge A2 (Key)',
    cefr: 'A2',
    subtitle: 'Reading · Listening',
    description: levelDescription('a2'),
    skills: ['reading', 'listening'],
    listeningExamTypes: ['ket'],
    defaultBandHint: 'A2 Key',
  },
  {
    slug: 'b1',
    exam: 'PET',
    label: 'Cambridge B1 (Preliminary)',
    cefr: 'B1',
    subtitle: 'Reading · Listening',
    description: levelDescription('b1'),
    skills: ['reading', 'listening'],
    listeningExamTypes: ['pet'],
    defaultBandHint: 'B1 Preliminary',
  },
  {
    slug: 'b2',
    exam: 'FCE',
    label: 'Cambridge B2 (First)',
    cefr: 'B2',
    subtitle: 'Reading · Listening',
    description: levelDescription('b2'),
    skills: ['reading', 'listening'],
    listeningExamTypes: ['fce'],
    defaultBandHint: 'B2 First',
  },
  {
    slug: 'c1',
    exam: 'CAE',
    label: 'Cambridge C1 (Advanced)',
    cefr: 'C1',
    subtitle: 'Reading · Listening',
    description: levelDescription('c1'),
    skills: ['reading', 'listening'],
    listeningExamTypes: ['cae'],
    defaultBandHint: 'C1 Advanced',
  },
  {
    slug: 'c2',
    exam: 'CPE',
    label: 'Cambridge C2 (Proficiency)',
    cefr: 'C2',
    subtitle: 'Reading · Listening',
    description: levelDescription('c2'),
    skills: ['reading', 'listening'],
    listeningExamTypes: ['cpe'],
    defaultBandHint: 'C2 Proficiency',
  },
]

export function getCambridgeExamLevel(slug: string): CambridgeExamLevel | null {
  return CAMBRIDGE_EXAM_LEVELS.find(l => l.slug === slug) ?? null
}

export function isCambridgeLevelSlug(slug: string): slug is CambridgeLevelSlug {
  return CAMBRIDGE_EXAM_LEVELS.some(l => l.slug === slug)
}

export function filterReadingForCambridgeLevel(
  exams: ReadingExam[],
  slug: CambridgeLevelSlug,
): ReadingExam[] {
  return exams.filter(e => e.examTrack === 'cambridge' && e.cambridgeLevel === slug)
}

export function filterReadingForIelts(exams: ReadingExam[]): ReadingExam[] {
  return exams.filter(e => !e.examTrack || e.examTrack === 'ielts')
}