import { parseListeningAnswerKeyFromText } from './cambridgeAnswerKeyParse'

/** Parse answer key 1–40 → Map<number, answer> (PDF hoặc answer-key.txt). */
export function parseListeningAnswerKey(text: string): Map<number, string> {
  return parseListeningAnswerKeyFromText(text)
}

export function answerKeyCoverage(map: Map<number, string>): number {
  return map.size
}