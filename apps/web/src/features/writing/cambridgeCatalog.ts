import type { WritingDoc, WritingGenre } from '@ryan/db'
import { CAMBRIDGE_DOC_TYPES } from './writingTypes'

export type CambridgeLevelSlug = 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

export type CambridgeGenre = Extract<
  WritingGenre,
  | 'email' | 'note' | 'story' | 'article' | 'essay' | 'letter' | 'editor_letter'
  | 'report' | 'review' | 'proposal' | 'other'
>

export interface CambridgeLevel {
  slug: CambridgeLevelSlug
  type: WritingDoc['type']
  exam: string
  label: string
  desc: string
  color: string
}

export interface CambridgeGenreDef {
  id: CambridgeGenre
  label: string
  labelVi: string
  desc: string
  icon: string
}

export const CAMBRIDGE_LEVELS: CambridgeLevel[] = [
  {
    slug: 'a2',
    type: 'cambridge_a2',
    exam: 'KET',
    label: 'Cambridge A2',
    desc: 'Email, note, tin nhắn ngắn (~35–45 từ)',
    color: '#3b82f6',
  },
  {
    slug: 'b1',
    type: 'cambridge_b1',
    exam: 'PET',
    label: 'Cambridge B1',
    desc: 'Email, article, story (~100 từ)',
    color: '#2563eb',
  },
  {
    slug: 'b2',
    type: 'cambridge_b2',
    exam: 'FCE',
    label: 'Cambridge B2',
    desc: 'Essay, report, review, email (~140–190 từ)',
    color: '#1d4ed8',
  },
  {
    slug: 'c1',
    type: 'cambridge_c1',
    exam: 'CAE',
    label: 'Cambridge C1',
    desc: 'Essay, proposal, report (~180–220 từ)',
    color: '#1e40af',
  },
  {
    slug: 'c2',
    type: 'cambridge_c2',
    exam: 'CPE',
    label: 'Cambridge C2',
    desc: 'Essay, article, discursive (~250–300 từ)',
    color: '#172554',
  },
]

const GENRE: Record<CambridgeGenre, CambridgeGenreDef> = {
  email: { id: 'email', label: 'Email', labelVi: 'Email', desc: 'Viết email trả lời / thư điện tử', icon: '✉' },
  note: { id: 'note', label: 'Note / Message', labelVi: 'Ghi chú / Tin nhắn', desc: 'Note, message, postcard ngắn', icon: '📝' },
  story: { id: 'story', label: 'Story', labelVi: 'Truyện ngắn', desc: 'Viết truyện ngắn theo gợi ý', icon: '📖' },
  article: { id: 'article', label: 'Article', labelVi: 'Bài báo', desc: 'Article cho tạp chí / website', icon: '📰' },
  essay: { id: 'essay', label: 'Essay', labelVi: 'Bài luận', desc: 'Opinion / discursive essay', icon: '✍' },
  letter: { id: 'letter', label: 'Letter', labelVi: 'Thư', desc: 'Formal / informal letter', icon: '💌' },
  editor_letter: {
    id: 'editor_letter',
    label: 'Letter',
    labelVi: 'Thư gửi biên tập viên / Thư trang trọng',
    desc: 'Letter to the editor, formal letter (CAE/CPE)',
    icon: '📜',
  },
  report: { id: 'report', label: 'Report', labelVi: 'Báo cáo', desc: 'Report mô tả sự kiện / khảo sát', icon: '📊' },
  review: { id: 'review', label: 'Review', labelVi: 'Review', desc: 'Review phim, sách, sự kiện', icon: '⭐' },
  proposal: { id: 'proposal', label: 'Proposal', labelVi: 'Đề xuất', desc: 'Proposal / suggestion', icon: '💡' },
  other: { id: 'other', label: 'Khác', labelVi: 'Khác / Chưa phân loại', desc: 'Bài chưa gắn loại cụ thể', icon: '⋯' },
}

/** Loại bài theo từng cấp độ Cambridge */
export const GENRES_BY_LEVEL: Record<CambridgeLevelSlug, CambridgeGenre[]> = {
  a2: ['email', 'note', 'story', 'other'],
  b1: ['email', 'article', 'story', 'letter', 'editor_letter', 'other'],
  b2: ['essay', 'article', 'email', 'letter', 'editor_letter', 'report', 'review', 'other'],
  c1: ['essay', 'proposal', 'report', 'review', 'letter', 'editor_letter', 'other'],
  c2: ['essay', 'article', 'proposal', 'report', 'review', 'editor_letter', 'other'],
}

export function getLevel(slug: string | undefined): CambridgeLevel | undefined {
  return CAMBRIDGE_LEVELS.find(l => l.slug === slug)
}

export function getGenreDef(id: string | undefined): CambridgeGenreDef | undefined {
  if (!id || !(id in GENRE)) return undefined
  return GENRE[id as CambridgeGenre]
}

export function genresForLevel(slug: CambridgeLevelSlug): CambridgeGenreDef[] {
  return GENRES_BY_LEVEL[slug].map(id => GENRE[id])
}

export function isValidGenreForLevel(level: CambridgeLevelSlug, genre: string): boolean {
  return GENRES_BY_LEVEL[level].includes(genre as CambridgeGenre)
}

/** Suy loại bài từ đề (bài cũ chưa có genre) */
export function inferCambridgeGenre(prompt: string): CambridgeGenre {
  const p = prompt.toLowerCase()
  if (/\b(e-?mail|email)\b/.test(p)) return 'email'
  if (/\b(story|narrative)\b/.test(p)) return 'story'
  if (/\b(note|message|postcard|text message)\b/.test(p)) return 'note'
  if (/\b(article)\b/.test(p)) return 'article'
  if (/\b(essay|discuss|opinion|agree|disagree)\b/.test(p)) return 'essay'
  if (/\b(report)\b/.test(p)) return 'report'
  if (/\b(review)\b/.test(p)) return 'review'
  if (/\b(proposal|suggest)\b/.test(p)) return 'proposal'
  if (/\b(editor|biên tập|newspaper|magazine)\b/.test(p) && /\b(letter)\b/.test(p)) return 'editor_letter'
  if (/\b(formal letter|thư trang trọng|letter to)\b/.test(p)) return 'editor_letter'
  if (/\b(letter)\b/.test(p)) return 'letter'
  return 'other'
}

export function effectiveGenre(doc: WritingDoc): CambridgeGenre {
  if (doc.genre && doc.genre in GENRE) return doc.genre as CambridgeGenre
  return inferCambridgeGenre(doc.prompt)
}

export function docMatchesGenre(doc: WritingDoc, genre: WritingGenre): boolean {
  if (!(CAMBRIDGE_DOC_TYPES as string[]).includes(doc.type)) return false
  return effectiveGenre(doc) === genre
}

export function genreLabel(genre: CambridgeGenre): string {
  return GENRE[genre]?.labelVi ?? genre
}