import {
  CAMBRIDGE_WRITING_COLLECTION_MAP,
  CAMBRIDGE_WRITING_MANIFEST,
  type CambridgeWritingLevel,
  type CambridgeWritingTask,
} from '@ryan/catalog'

export const CAMBRIDGE_WRITING_LEVEL_CONFIG = {
  b1: {
    level: 'b1',
    examName: 'PET',
    displayName: 'PET · B1',
    trackPath: '/app/exam/track/cambridge/b1',
    writingPath: '/app/writing/cambridge/b1',
    type: 'cambridge_b1',
  },
  b2: {
    level: 'b2',
    examName: 'FCE',
    displayName: 'FCE · B2',
    trackPath: '/app/exam/track/cambridge/b2',
    writingPath: '/app/writing/cambridge/b2',
    type: 'cambridge_b2',
  },
  c1: {
    level: 'c1',
    examName: 'CAE',
    displayName: 'CAE · C1',
    trackPath: '/app/exam/track/cambridge/c1',
    writingPath: '/app/writing/cambridge/c1',
    type: 'cambridge_c1',
  },
  c2: {
    level: 'c2',
    examName: 'CPE',
    displayName: 'CPE · C2',
    trackPath: '/app/exam/track/cambridge/c2',
    writingPath: '/app/writing/cambridge/c2',
    type: 'cambridge_c2',
  },
} as const

export type CambridgeSeedLevel = keyof typeof CAMBRIDGE_WRITING_LEVEL_CONFIG

export function isCambridgeSeedLevel(value: string | undefined): value is CambridgeSeedLevel {
  return value === 'b1' || value === 'b2' || value === 'c1' || value === 'c2'
}

export function getCambridgeSeedLevel(value: string | undefined) {
  if (!isCambridgeSeedLevel(value)) return null
  return CAMBRIDGE_WRITING_LEVEL_CONFIG[value]
}

export function getCambridgeSeedCollection(level: CambridgeSeedLevel) {
  return CAMBRIDGE_WRITING_COLLECTION_MAP[level as CambridgeWritingLevel]
}

export function getCambridgeSeedManifest(level: CambridgeSeedLevel) {
  return CAMBRIDGE_WRITING_MANIFEST[level]
}

export function getCambridgeSeedTest(level: CambridgeSeedLevel, testId: string) {
  return getCambridgeSeedCollection(level).tests.find(test => test.id === testId) ?? null
}

export function getCambridgeSeedTask(level: CambridgeSeedLevel, testId: string, taskId: string): CambridgeWritingTask | null {
  const test = getCambridgeSeedTest(level, testId)
  if (!test) return null
  return test.tasks.find(task => task.id === taskId) ?? null
}
