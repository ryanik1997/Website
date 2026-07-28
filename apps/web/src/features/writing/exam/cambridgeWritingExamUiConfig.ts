import type { CambridgeWritingLevel } from '@ryan/catalog'

export type AdvancedWritingLevel = Extract<CambridgeWritingLevel, 'b2' | 'c1' | 'c2'>

export interface CambridgeWritingExamUiConfig {
  level: AdvancedWritingLevel
  examName: 'FCE' | 'CAE' | 'CPE'
  part1WordRange: { min: number; max: number }
  part2WordRange: { min: number; max: number }
  part2TaskNumbers: number[]
}

export const CAMBRIDGE_ADVANCED_WRITING_CONFIG: Record<AdvancedWritingLevel, CambridgeWritingExamUiConfig> = {
  b2: {
    level: 'b2',
    examName: 'FCE',
    part1WordRange: { min: 140, max: 190 },
    part2WordRange: { min: 140, max: 190 },
    part2TaskNumbers: [2, 3, 4],
  },
  c1: {
    level: 'c1',
    examName: 'CAE',
    part1WordRange: { min: 220, max: 260 },
    part2WordRange: { min: 220, max: 260 },
    part2TaskNumbers: [2, 3, 4],
  },
  c2: {
    level: 'c2',
    examName: 'CPE',
    part1WordRange: { min: 240, max: 280 },
    part2WordRange: { min: 280, max: 320 },
    part2TaskNumbers: [2, 3, 4],
  },
}

export function isAdvancedWritingLevel(level: CambridgeWritingLevel): level is AdvancedWritingLevel {
  return level === 'b2' || level === 'c1' || level === 'c2'
}
