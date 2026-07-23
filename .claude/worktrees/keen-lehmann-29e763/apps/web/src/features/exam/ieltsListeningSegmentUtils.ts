import type { ListeningQuestion } from './listeningExamData'

export function normalizeGroupPrompt(prompt: string): string {
  return prompt.replace(/\s*\(\d+\)\s*$/, '').trim()
}

function optionSignature(options: ListeningQuestion['options']): string {
  return options.map(o => `${o.id}:${o.label}`).join('|')
}

/** Đáp án Choose TWO trong exam.json: "A/E", "C/E"… */
function hasChooseTwoSlashAnswer(question: ListeningQuestion): boolean {
  return /[/|]/.test(question.answer.trim())
}

/**
 * Nhận dạng cặp "Which TWO" (2 câu matching liên tiếp).
 * Dùng cho mọi Part 1–3 IELTS — builtin, import, đề user tạo.
 */
export function isChooseTwoGroup(questions: ListeningQuestion[]): boolean {
  if (questions.length !== 2) return false
  if (!questions.every(q => q.type === 'matching')) return false

  const base = normalizeGroupPrompt(questions[0].prompt)
  if (!questions.every(q => normalizeGroupPrompt(q.prompt) === base)) return false

  const opts = questions[0].options
  if (opts.length < 4) return false

  // Prompt chuẩn IELTS: "Which TWO …"
  if (/which\s+two\b/i.test(base)) return true

  // Answer Key / JSON: cả 2 câu answer dạng "A/E"
  if (questions.every(hasChooseTwoSlashAnswer)) return true

  // Fallback: options có nhãn đầy đủ (không chỉ "A", "B"…)
  return opts.some(o => o.label.trim().length > 3)
}

export function isLetterMatchingGroup(questions: ListeningQuestion[]): boolean {
  if (questions.length < 2) return false
  if (!questions.every(q => q.type === 'matching')) return false
  if (isChooseTwoGroup(questions)) return false
  const sig = optionSignature(questions[0].options)
  if (!sig) return false
  return questions.every(q => optionSignature(q.options) === sig)
}

export function isMapLabelGroup(questions: ListeningQuestion[]): boolean {
  if (!isLetterMatchingGroup(questions)) return false
  if (questions.some(q => q.diagramLabel === true)) return false
  return questions.some(q => q.mapLabel === true)
}

export function isDiagramLabelGroup(questions: ListeningQuestion[]): boolean {
  if (!isLetterMatchingGroup(questions)) return false
  return questions.some(q => q.diagramLabel === true)
}

export function isFlowChartGroup(questions: ListeningQuestion[]): boolean {
  if (!isLetterMatchingGroup(questions)) return false
  return questions.some(q => q.flowChart === true)
}

/** Flow-chart gap-fill (ONE WORD) — không có bank A–G (Cam16 T2 P3). */
export function isGapFillFlowChartGroup(questions: ListeningQuestion[]): boolean {
  if (questions.length < 2) return false
  return questions.every(q => q.type === 'gap-fill' && q.flowChart === true)
}

export interface IeltsSectionMeta {
  range?: string
  instruction?: string
  title?: string
}

export function sectionMetaFromQuestions(questions: ListeningQuestion[]): IeltsSectionMeta {
  const first = questions[0]
  if (!first) return {}
  return {
    range: first.sectionRange,
    instruction: first.sectionInstruction,
    title: first.sectionTitle,
  }
}