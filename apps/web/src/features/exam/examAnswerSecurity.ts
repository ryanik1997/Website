export const PUBLISHED_ANSWER_FIELDS = [
  'answer',
  'acceptableAnswers',
  'explanation',
  'modelAnswer',
  'correct',
  'correctAnswer',
  'correctAnswers',
  'solution',
  'solutions',
  'answerKey',
  'key',
  'feedback',
] as const

const ANSWER_FIELD_SET = new Set<string>(PUBLISHED_ANSWER_FIELDS)

type JsonRecord = Record<string, unknown>

export interface PublishedAnswersVault {
  examId: string
  version: 1
  mode: 'answers-vault'
  answers: Record<string, JsonRecord>
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Remove answer-bearing fields at every depth before an exam body is sent to
 * reading_exam_published / listening_exam_published.
 */
export function stripExamAnswerFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => stripExamAnswerFields(item)) as T
  }
  if (!isRecord(value)) return value

  const clean: JsonRecord = {}
  for (const [key, nested] of Object.entries(value)) {
    if (ANSWER_FIELD_SET.has(key)) continue
    clean[key] = stripExamAnswerFields(nested)
  }
  return clean as T
}

function collectQuestions(exam: JsonRecord): JsonRecord[] {
  const questions: JsonRecord[] = []
  const parts = Array.isArray(exam.parts) ? exam.parts : []

  for (const rawPart of parts) {
    if (!isRecord(rawPart)) continue
    for (const question of Array.isArray(rawPart.questions) ? rawPart.questions : []) {
      if (isRecord(question)) questions.push(question)
    }
    for (const rawGroup of Array.isArray(rawPart.questionGroups) ? rawPart.questionGroups : []) {
      if (!isRecord(rawGroup)) continue
      for (const question of Array.isArray(rawGroup.questions) ? rawGroup.questions : []) {
        if (isRecord(question)) questions.push(question)
      }
    }
  }

  return questions
}

/** Extract only the secret scoring/review fields, keyed by stable question id. */
export function createExamAnswersVault(
  exam: JsonRecord & { id: string },
): PublishedAnswersVault {
  const answers: Record<string, JsonRecord> = {}

  for (const question of collectQuestions(exam)) {
    const id = typeof question.id === 'string' ? question.id.trim() : ''
    if (!id) continue

    const entry: JsonRecord = {}
    for (const field of PUBLISHED_ANSWER_FIELDS) {
      if (question[field] !== undefined) entry[field] = question[field]
    }
    if (Object.keys(entry).length) answers[id] = entry
  }

  return {
    examId: exam.id,
    version: 1,
    mode: 'answers-vault',
    answers,
  }
}

export function publishedAnswersPath(
  examId: string,
  skill: 'listening' | 'reading',
): string {
  return `catalog/exams/${skill}/${examId}.answers.json`
}
