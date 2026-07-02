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

/** Tên file ảnh composite gợi ý khi import (A2–C2 Part 1) */
export function compositePictureFileCandidates(
  questionNumber: number,
  explicit?: string,
): string[] {
  const names = [
    explicit,
    `q${questionNumber}.jpg`,
    `q${questionNumber}.jpeg`,
    `q${questionNumber}.png`,
    `q${questionNumber}.webp`,
    `part1-q${questionNumber}.jpg`,
    `part1-q${questionNumber}.jpeg`,
    `part1-q${questionNumber}.png`,
  ].filter((n): n is string => Boolean(n?.trim()))

  return [...new Set(names.map(n => n.trim()))]
}