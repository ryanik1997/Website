import type { CambridgeWritingAsset, CambridgeWritingGenre, CambridgeWritingLevel } from '@ryan/catalog'

export const EXAM_PREFIX = {
  a2: 'ket',
  b1: 'pet',
  b2: 'fce',
  c1: 'cae',
  c2: 'cpe',
} as const

export const GENRES_BY_LEVEL = {
  a2: ['email', 'story', 'other'],
  b1: ['email', 'article', 'story', 'essay', 'other'],
  b2: ['essay', 'article', 'email', 'letter', 'review', 'report', 'story', 'other'],
  c1: ['essay', 'letter', 'proposal', 'report', 'review', 'email', 'other'],
  c2: ['essay', 'article', 'letter', 'report', 'review', 'other'],
} satisfies Record<CambridgeWritingLevel, CambridgeWritingGenre[]>

export type CambridgeWritingTaskFormValue = {
  clientId: string
  partNumber: number
  taskNumber: number
  title: string
  genre: CambridgeWritingGenre
  instruction: string
  promptText: string
  promptHtml: string
  minWords: number | null
  maxWords: number | null
  wordLimitDisplayText: string
  compulsory: boolean
  imageAssets: CambridgeWritingAsset[]
}

export type CambridgeWritingTestFormValue = {
  testNumber: number
  title: string
  sourceUrl: string
  tasks: CambridgeWritingTaskFormValue[]
}

export function createCambridgeWritingTestId(level: CambridgeWritingLevel, testNumber: number) {
  return [EXAM_PREFIX[level], level, 'writing', `test-${String(testNumber).padStart(2, '0')}`].join('-')
}

export function createCambridgeWritingTaskId(testId: string, taskNumber: number) {
  return `${testId}-task-${String(taskNumber).padStart(2, '0')}`
}

export function createTaskClientId() {
  return crypto.randomUUID()
}

export function getNextTestNumber(tests: Array<{ test: { testNumber: number } } | { testNumber: number }>) {
  const numbers = tests.map(item => ('test' in item ? item.test.testNumber : item.testNumber))
  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1
}

export function getDefaultTitle(level: CambridgeWritingLevel, testNumber: number) {
  const examNames = {
    a2: 'KET A2',
    b1: 'PET B1',
    b2: 'FCE B2',
    c1: 'CAE C1',
    c2: 'CPE C2',
  } as const
  return `${examNames[level]} Writing · Test ${String(testNumber).padStart(2, '0')}`
}

export function createEmptyTask(nextTaskNumber = 1): CambridgeWritingTaskFormValue {
  return {
    clientId: createTaskClientId(),
    partNumber: 1,
    taskNumber: nextTaskNumber,
    title: `Question ${nextTaskNumber}`,
    genre: 'email',
    instruction: '',
    promptText: '',
    promptHtml: '',
    minWords: null,
    maxWords: null,
    wordLimitDisplayText: '',
    compulsory: true,
    imageAssets: [],
  }
}

export function getTaskPromptStatus(task: CambridgeWritingTaskFormValue) {
  return Boolean(task.instruction.trim() || task.promptText.trim() || task.promptHtml.trim() || task.imageAssets.length > 0)
}

export function validateCambridgeWritingTestForm(value: CambridgeWritingTestFormValue) {
  const errors: string[] = []
  const warnings: string[] = []

  if (!Number.isInteger(value.testNumber) || value.testNumber < 1) {
    errors.push('testNumber: Test number must be at least 1.')
  }
  if (!value.title.trim()) {
    errors.push('title: Title is required.')
  }
  if (value.tasks.length === 0) {
    errors.push('tasks: At least one task is required.')
  }

  const seenTaskNumbers = new Set<number>()
  value.tasks.forEach((task, index) => {
    if (!Number.isInteger(task.partNumber) || task.partNumber < 1) {
      errors.push(`tasks.${index}.partNumber: Part number is required.`)
    }
    if (!Number.isInteger(task.taskNumber) || task.taskNumber < 1) {
      errors.push(`tasks.${index}.taskNumber: Task number is required.`)
    } else if (seenTaskNumbers.has(task.taskNumber)) {
      errors.push(`tasks.${index}.taskNumber: Task number must be unique.`)
    } else {
      seenTaskNumbers.add(task.taskNumber)
    }
    if (!task.title.trim()) {
      errors.push(`tasks.${index}.title: Task title is required.`)
    }
    if (task.minWords != null && task.maxWords != null && task.minWords > task.maxWords) {
      errors.push(`tasks.${index}.maxWords: Max words must be greater than or equal to min words.`)
    }
    if (!getTaskPromptStatus(task)) {
      warnings.push(`Task ${index + 1} đang thiếu prompt.`)
    }
  })

  return { ok: errors.length === 0, errors, warnings }
}
