import type { Plan } from '@ryan/core'

/**
 * Giới hạn số lần bấm Play / câu trong practice (thư viện).
 * Exam mode vẫn dùng useListeningPlayLimits (theo examMode + maxPlays part).
 * null = không giới hạn.
 */
export function listeningPracticeMaxPlays(plan: Plan): number | null {
  switch (plan) {
    case 'free':
      return 5
    case 'basic':
      return 12
    case 'trial':
    case 'pro':
    case 'lifetime':
      return null
    default:
      return 5
  }
}

export function playsLeftLabel(used: number, max: number | null): string | null {
  if (max == null) return null
  const left = Math.max(0, max - used)
  return `${left}/${max} lượt nghe`
}
