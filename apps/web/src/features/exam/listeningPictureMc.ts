import type { ListeningQuestion } from './listeningExamData'

/** Một ảnh lớn chứa A+B+C (đề in) — ưu tiên hơn 3 file riêng */
export function usesCompositePictureBoard(question: ListeningQuestion): boolean {
  if (question.type !== 'picture-mc') return false
  return Boolean(question.pictureImageKey || question.pictureImageUrl)
}

/** Legacy: mỗi option một ảnh (q1-a.jpg …) */
export function usesSplitPictureOptions(question: ListeningQuestion): boolean {
  if (question.type !== 'picture-mc') return false
  if (usesCompositePictureBoard(question)) return false
  return question.options.some(o => o.imageKey || o.imageUrl)
}

export function isPictureMcQuestion(question: ListeningQuestion): boolean {
  return question.type === 'picture-mc'
}

/** Tên file ảnh composite gợi ý khi import (A2–C2 Part 1) — jpg/png/webp/gif */
export function compositePictureFileCandidates(
  questionNumber: number,
  explicit?: string,
): string[] {
  const n = questionNumber
  const stems = [`q${n}`, `part1-q${n}`, `part1_q${n}`]
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const
  const names: string[] = []
  if (explicit?.trim()) names.push(explicit.trim())
  for (const stem of stems) {
    for (const ext of exts) names.push(`${stem}.${ext}`)
  }
  return [...new Set(names)]
}