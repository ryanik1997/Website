import type { WritingDoc, WritingGenre } from '@ryan/db'

export type IeltsTrackSlug = 'task1' | 'task2' | 'free'

export type IeltsGenre = Extract<
  WritingGenre,
  | 'line_graph' | 'bar_chart' | 'pie_chart' | 'table' | 'process' | 'map' | 'mixed'
  | 'opinion' | 'discussion' | 'problem_solution' | 'advantages_disadvantages' | 'two_part'
  | 'essay' | 'paragraph' | 'letter' | 'other'
>

export interface IeltsTrack {
  slug: IeltsTrackSlug
  type: WritingDoc['type']
  badge: string
  label: string
  desc: string
  color: string
}

export interface IeltsGenreDef {
  id: IeltsGenre
  label: string
  labelVi: string
  desc: string
  icon: string
}

export const IELTS_TRACKS: IeltsTrack[] = [
  {
    slug: 'task1',
    type: 'ielts_task1',
    badge: 'Task 1',
    label: 'IELTS Task 1',
    desc: 'Mô tả biểu đồ, bảng, quy trình, bản đồ (~150 từ)',
    color: '#8b5cf6',
  },
  {
    slug: 'task2',
    type: 'ielts_task2',
    badge: 'Task 2',
    label: 'IELTS Task 2',
    desc: 'Opinion, discussion, problem-solution (~250 từ)',
    color: '#6366f1',
  },
  {
    slug: 'free',
    type: 'master',
    badge: 'Free',
    label: 'Viết tự do',
    desc: 'Bài viết tự do — AI nhận xét tổng thể',
    color: '#10b981',
  },
]

const GENRE: Record<IeltsGenre, IeltsGenreDef> = {
  line_graph: { id: 'line_graph', label: 'Line graph', labelVi: 'Biểu đồ đường', desc: 'Xu hướng theo thời gian', icon: '📈' },
  bar_chart: { id: 'bar_chart', label: 'Bar chart', labelVi: 'Biểu đồ cột', desc: 'So sánh số liệu giữa các nhóm', icon: '📊' },
  pie_chart: { id: 'pie_chart', label: 'Pie chart', labelVi: 'Biểu đồ tròn', desc: 'Tỷ lệ phần trăm / thành phần', icon: '🥧' },
  table: { id: 'table', label: 'Table', labelVi: 'Bảng số liệu', desc: 'Mô tả và so sánh dữ liệu bảng', icon: '📋' },
  process: { id: 'process', label: 'Process', labelVi: 'Quy trình', desc: 'Diagram / life cycle / stages', icon: '⚙' },
  map: { id: 'map', label: 'Map', labelVi: 'Bản đồ', desc: 'Thay đổi theo thời gian / so sánh vị trí', icon: '🗺' },
  mixed: { id: 'mixed', label: 'Mixed charts', labelVi: 'Biểu đồ kết hợp', desc: 'Nhiều dạng chart trong một đề', icon: '🔀' },
  opinion: { id: 'opinion', label: 'Opinion', labelVi: 'Quan điểm', desc: 'Agree/disagree, to what extent', icon: '💭' },
  discussion: { id: 'discussion', label: 'Discussion', labelVi: 'Thảo luận', desc: 'Discuss both views and opinion', icon: '⚖' },
  problem_solution: { id: 'problem_solution', label: 'Problem–Solution', labelVi: 'Vấn đề – Giải pháp', desc: 'Nguyên nhân, hệ quả, cách xử lý', icon: '🔧' },
  advantages_disadvantages: { id: 'advantages_disadvantages', label: 'Advantages–Disadvantages', labelVi: 'Lợi – Hại', desc: 'Phân tích ưu và nhược điểm', icon: '➕' },
  two_part: { id: 'two_part', label: 'Two-part question', labelVi: 'Câu hỏi kép', desc: 'Hai câu hỏi trong cùng một đề', icon: '❓' },
  essay: { id: 'essay', label: 'Essay', labelVi: 'Bài luận', desc: 'Viết tự do dạng essay', icon: '✍' },
  paragraph: { id: 'paragraph', label: 'Paragraph', labelVi: 'Đoạn văn', desc: 'Luyện viết một đoạn ngắn', icon: '📝' },
  letter: { id: 'letter', label: 'Letter', labelVi: 'Thư', desc: 'Formal / informal letter', icon: '💌' },
  other: { id: 'other', label: 'Khác', labelVi: 'Khác / Chưa phân loại', desc: 'Bài chưa gắn loại cụ thể', icon: '⋯' },
}

export const GENRES_BY_TRACK: Record<IeltsTrackSlug, IeltsGenre[]> = {
  task1: ['line_graph', 'bar_chart', 'pie_chart', 'table', 'process', 'map', 'mixed', 'other'],
  task2: ['opinion', 'discussion', 'problem_solution', 'advantages_disadvantages', 'two_part', 'other'],
  free: ['essay', 'paragraph', 'letter', 'other'],
}

/** type ielts (cũ) gộp vào Task 2 */
export function typesForTrack(track: IeltsTrack): WritingDoc['type'][] {
  if (track.slug === 'task2') return ['ielts_task2', 'ielts']
  return [track.type]
}

export function getIeltsTrack(slug: string | undefined): IeltsTrack | undefined {
  return IELTS_TRACKS.find(t => t.slug === slug)
}

export function getIeltsGenreDef(id: string | undefined): IeltsGenreDef | undefined {
  if (!id || !(id in GENRE)) return undefined
  return GENRE[id as IeltsGenre]
}

export function genresForTrack(slug: IeltsTrackSlug): IeltsGenreDef[] {
  return GENRES_BY_TRACK[slug].map(id => GENRE[id])
}

export function isValidGenreForTrack(track: IeltsTrackSlug, genre: string): boolean {
  return GENRES_BY_TRACK[track].includes(genre as IeltsGenre)
}

export function inferIeltsGenre(doc: WritingDoc): IeltsGenre {
  const p = doc.prompt.toLowerCase()
  const t = doc.type

  if (t === 'ielts_task1') {
    if (/\b(line graph|line chart)\b/.test(p)) return 'line_graph'
    if (/\b(bar chart|column chart)\b/.test(p)) return 'bar_chart'
    if (/\b(pie chart)\b/.test(p)) return 'pie_chart'
    if (/\b(table)\b/.test(p)) return 'table'
    if (/\b(process|diagram|cycle|stages?|flow)\b/.test(p)) return 'process'
    if (/\b(map|plan|layout)\b/.test(p)) return 'map'
    if (/\b(chart|graph)\b/.test(p)) return 'mixed'
    return 'other'
  }

  if (t === 'ielts_task2' || t === 'ielts') {
    if (/\b(discuss both|both views|some people.*others)\b/.test(p)) return 'discussion'
    if (/\b(advantages?|disadvantages?|benefits?|drawbacks?)\b/.test(p)) return 'advantages_disadvantages'
    if (/\b(problem|solution|cause|reason)\b/.test(p)) return 'problem_solution'
    if (/\b(why|what|how).*\?.*\?/i.test(doc.prompt) || /\band\b.*\?/.test(p)) return 'two_part'
    if (/\b(agree|disagree|opinion|extent|believe)\b/.test(p)) return 'opinion'
    return 'other'
  }

  if (/\b(letter)\b/.test(p)) return 'letter'
  if (/\b(paragraph)\b/.test(p)) return 'paragraph'
  return 'essay'
}

export function effectiveIeltsGenre(doc: WritingDoc): IeltsGenre {
  const g = doc.genre
  if (g && g in GENRE) return g as IeltsGenre
  return inferIeltsGenre(doc)
}

export function docMatchesIeltsGenre(doc: WritingDoc, track: IeltsTrack, genre: IeltsGenre): boolean {
  if (!typesForTrack(track).includes(doc.type)) return false
  return effectiveIeltsGenre(doc) === genre
}

export function ieltsGenreLabel(genre: IeltsGenre): string {
  return GENRE[genre]?.labelVi ?? genre
}