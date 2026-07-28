import { buildWordDiff, normalizeWord, splitWords } from '../listening/practiceUtils'

export type SpeakingScore = {
  /** 0–100 */
  percent: number
  correct: number
  total: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export function scoreSpeaking(transcript: string, target: string): SpeakingScore {
  const total = splitWords(target).length || 1
  if (!transcript.trim()) {
    return { percent: 0, correct: 0, total, grade: 'F' }
  }
  const diff = buildWordDiff(transcript, target)
  const correct = diff.filter(d => d.status === 'correct').length
  const percent = Math.round((correct / total) * 100)
  let grade: SpeakingScore['grade'] = 'F'
  if (percent >= 90) grade = 'A'
  else if (percent >= 75) grade = 'B'
  else if (percent >= 60) grade = 'C'
  else if (percent >= 40) grade = 'D'
  return { percent, correct, total, grade }
}

/** Loose match: allow extra filler words by checking coverage of target words in transcript bag. */
export function scoreSpeakingLoose(transcript: string, target: string): SpeakingScore {
  const tw = splitWords(target).map(normalizeWord).filter(Boolean)
  const uw = new Set(splitWords(transcript).map(normalizeWord).filter(Boolean))
  const total = tw.length || 1
  const correct = tw.filter(w => uw.has(w)).length
  const percent = Math.round((correct / total) * 100)
  let grade: SpeakingScore['grade'] = 'F'
  if (percent >= 90) grade = 'A'
  else if (percent >= 75) grade = 'B'
  else if (percent >= 60) grade = 'C'
  else if (percent >= 40) grade = 'D'
  return { percent, correct, total, grade }
}
