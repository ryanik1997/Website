export const DEFAULT_NEW_TESTS_PER_LEVEL = 35

function readNewTestCount() {
  const raw = process.env.NEW_TESTS_PER_LEVEL
  if (raw === undefined || raw === '') return DEFAULT_NEW_TESTS_PER_LEVEL
  const value = Number.parseInt(raw, 10)
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`NEW_TESTS_PER_LEVEL must be a positive integer, received: ${raw}`)
  }
  return value
}

export const NEW_TESTS_PER_LEVEL = readNewTestCount()

const about100 = { min: 100, max: 100, displayText: 'about 100 words' }

export const CAMBRIDGE_WRITING_LEVEL_CONFIGS = {
  b1: {
    level: 'b1', examName: 'PET', newTestCount: NEW_TESTS_PER_LEVEL, testTaskCount: 3,
    tasks: [
      { partNumber: 1, taskNumber: 1, genre: 'email', compulsory: true, wordLimit: about100, presentation: 'email-with-notes' },
      { partNumber: 2, taskNumber: 2, genre: 'article', compulsory: false, wordLimit: about100, presentation: 'announcement' },
      { partNumber: 2, taskNumber: 3, genre: 'story', compulsory: false, wordLimit: about100, presentation: 'story-opening' },
    ],
  },
  b2: {
    level: 'b2', examName: 'FCE', newTestCount: NEW_TESTS_PER_LEVEL, testTaskCount: 4,
    tasks: [
      { partNumber: 1, taskNumber: 1, genre: 'essay', compulsory: true, minWords: 140, maxWords: 190, template: 'essay-notes' },
      { partNumber: 2, taskNumber: 2, genre: 'review', compulsory: false, minWords: 140, maxWords: 190, template: 'announcement' },
      { partNumber: 2, taskNumber: 3, genre: 'article', compulsory: false, minWords: 140, maxWords: 190, template: 'announcement' },
      { partNumber: 2, taskNumber: 4, genre: 'email', compulsory: false, minWords: 140, maxWords: 190, template: 'email' },
    ],
  },
  c1: {
    level: 'c1', examName: 'CAE', newTestCount: NEW_TESTS_PER_LEVEL, testTaskCount: 4,
    tasks: [
      { partNumber: 1, taskNumber: 1, genre: 'essay', compulsory: true, minWords: 220, maxWords: 260, template: 'essay-notes-opinions' },
      { partNumber: 2, taskNumber: 2, genre: 'proposal', compulsory: false, minWords: 220, maxWords: 260, template: 'plain' },
      { partNumber: 2, taskNumber: 3, genre: 'email', compulsory: false, minWords: 220, maxWords: 260, template: 'plain' },
      { partNumber: 2, taskNumber: 4, genre: 'review', compulsory: false, minWords: 220, maxWords: 260, template: 'announcement' },
    ],
  },
  c2: {
    level: 'c2', examName: 'CPE', newTestCount: NEW_TESTS_PER_LEVEL, testTaskCount: 4,
    tasks: [
      { partNumber: 1, taskNumber: 1, genre: 'essay', compulsory: true, minWords: 240, maxWords: 280, template: 'source-texts' },
      { partNumber: 2, taskNumber: 2, genre: 'review', compulsory: false, minWords: 280, maxWords: 320, template: 'plain' },
      { partNumber: 2, taskNumber: 3, genre: 'report', compulsory: false, minWords: 280, maxWords: 320, template: 'plain' },
      { partNumber: 2, taskNumber: 4, genre: 'article', compulsory: false, minWords: 280, maxWords: 320, template: 'plain' },
    ],
  },
}

export const CAMBRIDGE_WRITING_LEVELS = Object.keys(CAMBRIDGE_WRITING_LEVEL_CONFIGS)

export function getLevelConfig(level) {
  const config = CAMBRIDGE_WRITING_LEVEL_CONFIGS[level]
  if (!config) throw new Error(`Unsupported Cambridge Writing AI level: ${level}`)
  return config
}

export function formatNumber(value) {
  return String(value).padStart(2, '0')
}

export function getTestId(level, testNumber) {
  return `${level}-test-${formatNumber(testNumber)}`
}

export function getTaskId(level, testNumber, taskNumber) {
  return `${getTestId(level, testNumber)}-task-${formatNumber(taskNumber)}`
}

export function getTestTitle(level, testNumber) {
  const config = getLevelConfig(level)
  return `${config.examName} ${level.toUpperCase()} AI Practice Test ${formatNumber(testNumber)}`
}

export function getConfiguredRange(level) {
  const config = getLevelConfig(level)
  return { from: 2, to: config.newTestCount + 1 }
}
