import { CAMBRIDGE_WRITING_LEVEL_CONFIG, getCambridgeSeedCollection } from './cambridgeWritingSeedCatalog'

export const CAMBRIDGE_WRITING_ROUTE_LEVELS = CAMBRIDGE_WRITING_LEVEL_CONFIG

export type CambridgeRouteLevel = keyof typeof CAMBRIDGE_WRITING_ROUTE_LEVELS

export function isCambridgeRouteLevel(value: string | undefined): value is CambridgeRouteLevel {
  return value === 'a2' || value === 'b1' || value === 'b2' || value === 'c1' || value === 'c2'
}

export function getCambridgeRouteLevel(value: string | undefined) {
  if (!isCambridgeRouteLevel(value)) return null
  return CAMBRIDGE_WRITING_ROUTE_LEVELS[value]
}

export function getCambridgeRouteCollection(level: CambridgeRouteLevel) {
  return getCambridgeSeedCollection(level)
}

export function getCambridgeRouteManifest(level: CambridgeRouteLevel) {
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
