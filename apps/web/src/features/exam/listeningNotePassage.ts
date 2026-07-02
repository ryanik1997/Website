import type { ListeningNotePassageBlock, ListeningQuestion } from './listeningExamData'

/** Lấy khối notePassage tương ứng một đoạn gap-fill liên tiếp trong Part. */
export function notePassageForGapSegment(
  blocks: ListeningNotePassageBlock[],
  segmentQuestions: ListeningQuestion[],
): ListeningNotePassageBlock[] | null {
  if (!blocks.length || !segmentQuestions.length) return null

  const numSet = new Set(segmentQuestions.map(q => q.number))
  const gapIndices = blocks
    .map((block, index) => (block.type === 'gap' && block.number != null && numSet.has(block.number) ? index : -1))
    .filter(index => index >= 0)

  if (!gapIndices.length) return null

  const start = gapIndices.reduce((min, index) => {
    let cursor = index
    while (cursor > 0 && blocks[cursor - 1].type !== 'gap') cursor -= 1
    return Math.min(min, cursor)
  }, gapIndices[0])

  const end = gapIndices.reduce((max, index) => {
    let cursor = index
    while (cursor < blocks.length - 1 && blocks[cursor + 1].type !== 'gap') cursor += 1
    return Math.max(max, cursor)
  }, gapIndices[0])

  return blocks
    .slice(start, end + 1)
    .filter(block => block.type !== 'gap' || (block.number != null && numSet.has(block.number)))
}

export function validateNotePassageBlocks(
  blocks: ListeningNotePassageBlock[] | undefined,
  gapQuestionNumbers: number[],
  partLabel: string,
): string[] {
  if (!blocks?.length) return []
  if (gapQuestionNumbers.length === 0) return []

  const warnings: string[] = []
  const gapSet = new Set(gapQuestionNumbers)
  const passageGapNumbers = blocks
    .filter((block): block is ListeningNotePassageBlock & { number: number } =>
      block.type === 'gap' && typeof block.number === 'number')
    .map(block => block.number)

  for (const number of passageGapNumbers) {
    if (!gapSet.has(number)) {
      warnings.push(`${partLabel}: notePassage gap ${number} không có trong questions.`)
    }
  }

  for (const number of gapQuestionNumbers) {
    if (!passageGapNumbers.includes(number)) {
      warnings.push(`${partLabel}: câu ${number} thiếu trong notePassage (IELTS note-completion).`)
    }
  }

  for (const block of blocks) {
    if (block.type === 'gap' && (block.number == null || block.number < 1)) {
      warnings.push(`${partLabel}: notePassage gap thiếu number hợp lệ.`)
    }
    if ((block.type === 'static' || block.type === 'section') && !block.text?.trim()) {
      warnings.push(`${partLabel}: notePassage ${block.type} thiếu text.`)
    }
  }

  return warnings
}