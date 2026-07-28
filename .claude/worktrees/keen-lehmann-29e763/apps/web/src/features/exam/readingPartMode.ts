export function parseReadingPart(value: string | null): 1 | 2 | 3 | null {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= 3 ? n as 1 | 2 | 3 : null
}

export function readingDraftKey(examId: string, part: 1 | 2 | 3 | null): string {
  return `exam-reading-draft:${examId}${part === null ? '' : `:p${part}`}`
}
