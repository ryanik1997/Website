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
  return /choose\s+two\b/i.test(text)
    || /which\s+two\b/i.test(text)
    || /two\s+(?:correct\s+)?(?:letters|answers|options)\b/i.test(text)
    || /boxes\s+\d+\s+and\s+\d+/i.test(text)
}

/**
 * AI/import hay chỉ gắn options lên câu 1 của cặp Choose TWO (câu 2 options=[]).
 * Copy options (+ prompt gốc) để UI multi-select hoạt động.
 */
export function normalizeReadingChooseTwoGroup(
  group: ReadingQuestionGroup,
): ReadingQuestionGroup {
  const questions = group.questions ?? []
  if (questions.length !== 2) return group
  if (!questions.every(q => !q.type || q.type === 'multiple-choice')) return group

  const opts0 = questions[0].options ?? []
  const opts1 = questions[1].options ?? []
  const instrHit = hasChooseTwoInstruction(group.instruction)
    || hasChooseTwoInstruction(group.range)
    || /which\s+two\b|choose\s+two\b/i.test(questions[0].prompt ?? '')

  // Cặp 2 MC + instruction Choose TWO + chỉ câu đầu có bank A–E
  const needShare = instrHit
    && opts0.length >= 3
    && (opts1.length < 3 || optionSignature(opts0) !== optionSignature(opts1))

  if (!needShare && opts0.length >= 3 && opts1.length >= 3) {
    // Đã đủ options — chuẩn hoá type
    return {
      ...group,
      type: 'multiple-choice',
      questions: questions.map(q => ({ ...q, type: 'multiple-choice' as const })),
    }
  }

  if (!needShare) return group

  const shared = opts0.map(o => ({ ...o }))
  const basePrompt = normalizeReadingChooseTwoPrompt(questions[0].prompt || questions[1].prompt || '')
  return {
    ...group,
    type: 'multiple-choice',
    instruction: group.instruction?.trim()
      || 'Choose TWO correct answers, A–E.',
    questions: [
      {
        ...questions[0],
        type: 'multiple-choice',
        prompt: questions[0].prompt?.trim()
          || (basePrompt ? `${basePrompt} (first answer)` : questions[0].prompt),
        options: shared,
      },
      {
        ...questions[1],
        type: 'multiple-choice',
        prompt: questions[1].prompt?.trim()
          || (basePrompt ? `${basePrompt} (second answer)` : questions[1].prompt),
        options: shared.map(o => ({ ...o })),
      },
    ],
  }
}

/**
 * Nhận diện nhóm Reading "Choose TWO" (2 câu MC cùng options + cùng prompt gốc).
 * Wizard/import: 2 câu multiple-choice, mỗi câu 1 chữ đáp án.
 * Lưu ý: AI hay bỏ options ở câu 2 — gọi normalizeReadingChooseTwoGroup trước khi detect/render.
 */
export function isReadingChooseTwoGroup(group: ReadingQuestionGroup): boolean {
  const normalized = normalizeReadingChooseTwoGroup(group)
  const questions = normalized.questions ?? []
  if (questions.length !== 2) return false
  if (!questions.every(q => q.type === 'multiple-choice')) return false

  const opts0 = questions[0].options ?? []
  if (opts0.length < 3) return false

  const sig = optionSignature(opts0)
  // Cho phép câu 2 thiếu options nếu instruction Choose TWO (đã share trong normalize)
  const optsMatch = questions.every(q => {
    const o = q.options ?? []
    if (o.length < 3) return false
    return optionSignature(o) === sig
  })
  if (!sig || !optsMatch) return false

  if (hasChooseTwoInstruction(normalized.instruction) || hasChooseTwoInstruction(normalized.range)) {
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
