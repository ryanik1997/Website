/**
 * Catalog cấu trúc câu ship cùng app — **mỗi template một bản** (không clone).
 * Mục tiêu: 365 cấu trúc khác nhau (core + extra, dedupe template).
 * Sync: bump GLOBAL_CATALOG_VERSION trong manifest.ts
 */
import { CORE_SENTENCE_STRUCTURES } from './sentenceStructures.core'
import { EXTRA_SENTENCE_STRUCTURES } from './sentenceStructures.extra'
import {
  expandSentenceStructures,
  TARGET_STRUCTURE_COUNT,
} from './sentenceStructures.expand'

export { VARIANTS_PER_CORE, TARGET_STRUCTURE_COUNT } from './sentenceStructures.expand'
export { CORE_SENTENCE_STRUCTURES } from './sentenceStructures.core'
export { EXTRA_SENTENCE_STRUCTURES } from './sentenceStructures.extra'

export const CATALOG_SENTENCE_STRUCTURES = expandSentenceStructures(
  [...CORE_SENTENCE_STRUCTURES, ...EXTRA_SENTENCE_STRUCTURES],
  {
    targetCount: TARGET_STRUCTURE_COUNT,
    priorityTemplates: CORE_SENTENCE_STRUCTURES.map((s) => s.template),
  },
)

/** Số mẫu catalog ship (sau dedupe + cap 365). */
export const CATALOG_STRUCTURE_COUNT = CATALOG_SENTENCE_STRUCTURES.length
