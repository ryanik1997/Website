import { CATALOG_SENTENCE_STRUCTURES } from '@ryan/catalog'
import type { StructureSeed } from './types'

/** @deprecated Dùng CATALOG_SENTENCE_STRUCTURES + syncGlobalCatalog */
export const SAMPLE_STRUCTURES: StructureSeed[] = CATALOG_SENTENCE_STRUCTURES.map(
  ({ id: _id, ...rest }) => rest,
)