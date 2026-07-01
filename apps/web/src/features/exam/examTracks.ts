export type ExamTrackId = 'ielts' | 'cambridge'

export interface ExamTrack {
  id: ExamTrackId
  title: string
  subtitle: string
  description: string
  skills: Array<'reading' | 'listening'>
}

export const EXAM_TRACKS: ExamTrack[] = [
  {
    id: 'ielts',
    title: 'IELTS Academic',
    subtitle: 'Reading · Listening',
    description: 'Listening: 4 parts · 40 câu · ~30 phút (gõ đáp án khi nghe). Reading + Listening mẫu sẵn. (Writing ở module Viết.)',
    skills: ['reading', 'listening'],
  },
  {
    id: 'cambridge',
    title: 'Cambridge A2–C2',
    subtitle: 'KET · PET · FCE · CAE · CPE',
    description: 'Luyện thi theo từng cấp độ CEFR: Reading + Listening. Import PDF Reading và JSON/ZIP Listening riêng cho mỗi level.',
    skills: ['reading', 'listening'],
  },
]

export function getExamTrack(id: string): ExamTrack | null {
  if (id === 'ket') return getExamTrack('cambridge')
  return EXAM_TRACKS.find(t => t.id === id) ?? null
}