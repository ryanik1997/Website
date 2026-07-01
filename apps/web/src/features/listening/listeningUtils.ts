import type { Lesson } from '@ryan/db'
import { parseSentences } from './types'

export const THUMB_PALETTE = [
  '#E09B3D', '#9B59B6', '#5B8DD9', '#4CAF82',
  '#2EC4B6', '#E05C8A', '#1BA39C', '#E05C5C',
]

export function thumbColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % THUMB_PALETTE.length
  return THUMB_PALETTE[h]!
}

export function cambridgeBadge(title: string): string {
  const ielts = title.match(/IELTS\s*(\d+)/i)
  if (ielts) return `IELTS ${ielts[1]}`
  const num = title.match(/(\d+)/)
  if (num) return num[1]!
  return title.slice(0, 2).toUpperCase()
}

export function lessonThumbLabel(lesson: Lesson): string {
  if (lesson.category === 'cambridge') {
    if (lesson.bookNum != null) return String(lesson.bookNum)
    return cambridgeBadge(lesson.title)
  }
  return lesson.title.trim().charAt(0).toUpperCase() || '?'
}

export function lessonHasDue(lesson: Lesson): boolean {
  return parseSentences(lesson.sentences).some(s => s.dueAt <= Date.now())
}

export function lessonStats(lesson: Lesson) {
  const sentences = parseSentences(lesson.sentences)
  const due = sentences.filter(s => s.dueAt <= Date.now()).length
  const studied = sentences.filter(s => s.reps > 0).length
  return { count: sentences.length, due, studied }
}

export function statusLabel(due: number, studied: number): string {
  if (due > 0) return `${due} cần ôn`
  if (studied > 0) return 'Đã học'
  return 'Mới'
}