import { CAMBRIDGE_WRITING_LEVEL_CONFIG, getCambridgeSeedCollection } from './cambridgeWritingSeedCatalog'
import ketReadingBook4Test2 from '../../../../../packages/catalog/data/reading-ket-a2-book4-test2.json'

export const CAMBRIDGE_WRITING_ROUTE_LEVELS = {
  a2: {
    level: 'a2',
    examName: 'KET',
    displayName: 'KET · A2',
    trackPath: '/app/exam/track/cambridge/a2',
    writingPath: '/app/writing/cambridge/a2',
    type: 'cambridge_a2',
  },
  ...CAMBRIDGE_WRITING_LEVEL_CONFIG,
} as const

export type CambridgeRouteLevel = keyof typeof CAMBRIDGE_WRITING_ROUTE_LEVELS

export function isCambridgeRouteLevel(value: string | undefined): value is CambridgeRouteLevel {
  return value === 'a2' || value === 'b1' || value === 'b2' || value === 'c1' || value === 'c2'
}

export function getCambridgeRouteLevel(value: string | undefined) {
  if (!isCambridgeRouteLevel(value)) return null
  return CAMBRIDGE_WRITING_ROUTE_LEVELS[value]
}

const ketA2Book4Test2 = ketReadingBook4Test2 as {
  id: string
  title: string
  parts: Array<{
    id: string
    partNumber: number
    passageTitle?: string
    passage: Array<{ text?: string; imageUrl?: string }>
    questionGroups?: Array<{
      instruction?: string
      questions?: Array<{ id: string; number: number; prompt: string; minWords?: number }>
    }>
  }>
}

const a2Part6 = ketA2Book4Test2.parts.find((part) => part.partNumber === 6)!
const a2Part7 = ketA2Book4Test2.parts.find((part) => part.partNumber === 7)!

export const CAMBRIDGE_A2_WRITING_COLLECTION = {
  level: 'a2',
  examName: 'KET',
  title: 'KET · A2 Writing Route Collection',
  testCount: 1,
  taskCount: 2,
  tests: [
    {
      id: 'ket-a2-book4-test2',
      level: 'a2',
      testNumber: 1,
      title: 'KET A2 Writing · Book 4 · Test 2',
      sourceExamId: ketA2Book4Test2.id,
      tasks: [
        {
          id: 'ket-a2-book4-test2-task-31',
          partNumber: 6,
          taskNumber: 31,
          title: 'Question 31',
          genre: 'email',
          instruction: a2Part6.questionGroups?.[0]?.instruction ?? 'Write 25 words or more.',
          promptText: a2Part6.passage.map((block) => block.text ?? '').filter(Boolean).join('\n\n'),
          wordLimit: {
            min: a2Part6.questionGroups?.[0]?.questions?.[0]?.minWords ?? 25,
            max: null,
            displayText: a2Part6.questionGroups?.[0]?.instruction ?? '25 words or more',
          },
          metadata: {
            compulsory: true,
            sourceQuestionNumber: '31',
            ketSourcePartId: a2Part6.id,
            ketQuestionPrompt: a2Part6.questionGroups?.[0]?.questions?.[0]?.prompt ?? '',
          },
        },
        {
          id: 'ket-a2-book4-test2-task-32',
          partNumber: 7,
          taskNumber: 32,
          title: 'Question 32',
          genre: 'story',
          instruction: a2Part7.questionGroups?.[0]?.instruction ?? 'Write 35 words or more.',
          promptText: a2Part7.questionGroups?.[0]?.questions?.[0]?.prompt ?? '',
          wordLimit: {
            min: a2Part7.questionGroups?.[0]?.questions?.[0]?.minWords ?? 35,
            max: null,
            displayText: a2Part7.questionGroups?.[0]?.instruction ?? '35 words or more',
          },
          metadata: {
            compulsory: true,
            sourceQuestionNumber: '32',
            ketSourcePartId: a2Part7.id,
            ketQuestionPrompt: a2Part7.questionGroups?.[0]?.questions?.[0]?.prompt ?? '',
            ketImageUrls: a2Part7.passage.map((block) => block.imageUrl ?? '').filter(Boolean),
          },
        },
      ],
    },
  ],
} as const

export function getCambridgeRouteCollection(level: CambridgeRouteLevel) {
  return level === 'a2' ? CAMBRIDGE_A2_WRITING_COLLECTION : getCambridgeSeedCollection(level)
}

export function getCambridgeRouteManifest(level: CambridgeRouteLevel) {
  if (level === 'a2') return { testCount: 1, taskCount: 2 }
  const collection = getCambridgeSeedCollection(level)
  return {
    testCount: collection.tests.length,
    taskCount: collection.tests.reduce((sum, test) => sum + test.tasks.length, 0),
  }
}

export function getCambridgeRouteTest(level: CambridgeRouteLevel, testId: string) {
  return getCambridgeRouteCollection(level).tests.find((test) => test.id === testId) ?? null
}

export function getCambridgeRouteTask(level: CambridgeRouteLevel, testId: string, taskId: string) {
  const test = getCambridgeRouteTest(level, testId)
  if (!test) return null
  return test.tasks.find((task) => task.id === taskId) ?? null
}
