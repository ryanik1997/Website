import type { ReadingQuestion, ReadingQuestionGroup } from './examData'

/** Bỏ "(first answer)" / "(second answer)" / số cuối prompt. */
export function normalizeReadingChooseTwoPrompt(prompt: string): string {
  return prompt
    .replace(/\s*\((?:first|second|1st|2nd)\s+answer\)\s*$/i, '')
    .replace(/\s*\(\d+\)\s*$/, '')
    .trim()
}

function optionSignature(options: ReadingQuestion['options'] | undefined): string {
  if (!options?.length) return ''
  return options.map(o => `${String(o.id).toLowerCase()}:${o.label}`).join('|')
}

function hasChooseTwoInstruction(text: string | undefined): boolean {
  if (!text) return false
  return /choose\s+two\b/i.test(text) || /which\s+two\b/i.test(text)
}

/**
 * Nhận diện nhóm Reading "Choose TWO" (2 câu MC cùng options + cùng prompt gốc).
 * Wizard/import: 2 câu multiple-choice, mỗi câu 1 chữ đáp án.
 */
export function isReadingChooseTwoGroup(group: ReadingQuestionGroup): boolean {
  const questions = group.questions ?? []
  if (questions.length !== 2) return false
  if (!questions.every(q => q.type === 'multiple-choice')) return false

  const opts0 = questions[0].options ?? []
  if (opts0.length < 3) return false

  const sig = optionSignature(opts0)
  if (!sig || !questions.every(q => optionSignature(q.options) === sig)) return false

  if (hasChooseTwoInstruction(group.instruction) || hasChooseTwoInstruction(group.range)) {
    return true
  }

  const base = normalizeReadingChooseTwoPrompt(questions[0].prompt)
  if (base && questions.every(q => normalizeReadingChooseTwoPrompt(q.prompt) === base)) {
    if (/which\s+two\b/i.test(base) || /choose\s+two\b/i.test(base)) return true
    // Cùng prompt + cùng options ≥4 (A–E) — mẫu IELTS Choose TWO
    if (opts0.length >= 4) return true
  }

  return false
}

/**
 * Chia group multiple-choice thành các cặp Choose TWO + phần còn lại (MC thường).
 * VD: AI gộp Q10–13 (2× Choose TWO) vào 1 group.
 */
export function splitReadingMcGroupForChooseTwo(
  group: ReadingQuestionGroup,
): ReadingQuestionGroup[] {
  const questions = group.questions ?? []
  if (group.type !== 'multiple-choice' || questions.length < 2) return [group]

  if (isReadingChooseTwoGroup(group)) return [group]

  const chunks: ReadingQuestion[][] = []
  let i = 0
  while (i < questions.length) {
    const a = questions[i]
    const b = questions[i + 1]
    if (b) {
      const pairGroup: ReadingQuestionGroup = {
        ...group,
        questions: [a, b],
      }
      if (isReadingChooseTwoGroup(pairGroup)) {
        chunks.push([a, b])
        i += 2
        continue
      }
    }
    chunks.push([a])
    i += 1
  }

  // Không có cặp nào → giữ nguyên
  if (chunks.every(c => c.length === 1)) return [group]

  return chunks.map((qs, index) => {
    const start = qs[0]?.number
    const end = qs[qs.length - 1]?.number
    const isPair = qs.length === 2 && isReadingChooseTwoGroup({ ...group, questions: qs })
    return {
      ...group,
      id: `${group.id}-seg${index}`,
      range: start != null && end != null && start !== end
        ? `Questions ${start}–${end}`
        : start != null
          ? `Question ${start}`
          : group.range,
      instruction: isPair
        ? (hasChooseTwoInstruction(group.instruction)
          ? group.instruction
          : 'Choose TWO correct answers.')
        : group.instruction,
      questions: qs,
    }
  })
}

/** Gán / bỏ chọn option cho cặp Choose TWO (giống Listening). */
export function toggleReadingChooseTwoOption(
  optionId: string,
  questions: ReadingQuestion[],
  answers: Record<string, string>,
  onAnswer: (questionId: string, value: string) => void,
  onSelectQuestion: (questionId: string) => void,
): void {
  const [first, second] = questions
  if (!first) return

  const id = optionId.toLowerCase()
  const firstVal = (answers[first.id] ?? '').toLowerCase()
  const secondVal = second ? (answers[second.id] ?? '').toLowerCase() : ''

  if (firstVal === id) {
    onAnswer(first.id, '')
    onSelectQuestion(first.id)
    return
  }
  if (second && secondVal === id) {
    onAnswer(second.id, '')
    onSelectQuestion(second.id)
    return
  }

  // Lưu chữ thường để khớp answer key / scoring
  const store = id

  if (!firstVal) {
    onAnswer(first.id, store)
    onSelectQuestion(first.id)
    return
  }
  if (second && !secondVal) {
    onAnswer(second.id, store)
    onSelectQuestion(second.id)
    return
  }
  if (second) {
    // Đã đủ 2 — thay đáp án thứ hai
    onAnswer(second.id, store)
    onSelectQuestion(second.id)
  }
}
