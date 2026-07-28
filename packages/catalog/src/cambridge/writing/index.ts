import { CAMBRIDGE_WRITING_COLLECTION_MAP } from './seedData.ts'

export {
  CambridgeWritingCollectionSchema,
  CambridgeWritingTestSchema,
  CambridgeWritingTaskSchema,
  CambridgeWritingChoiceSchema,
  CambridgeWritingAssetSchema,
  CambridgeWritingSampleAnswerSchema,
  CambridgeWritingPromptBlockSchema,
  CambridgeWritingPresentationSchema,
  CambridgeWritingGenerationProvenanceSchema,
  CambridgeWritingManifestSchema,
  type CambridgeWritingCollection,
  type CambridgeWritingTest,
  type CambridgeWritingTask,
  type CambridgeWritingChoice,
  type CambridgeWritingAsset,
  type CambridgeWritingSampleAnswer,
  type CambridgeWritingPromptBlock,
  type CambridgeWritingPresentation,
  type CambridgeWritingGenerationProvenance,
  type CambridgeWritingLevel,
  type CambridgeWritingGenre,
  type CambridgeWritingManifest,
} from './schema.ts'

export {
  CAMBRIDGE_WRITING_COLLECTIONS,
  CAMBRIDGE_WRITING_COLLECTION_MAP,
  CAMBRIDGE_WRITING_MANIFEST,
} from './seedData.ts'

export function getCambridgeWritingCollection(level: 'a2' | 'b1' | 'b2' | 'c1' | 'c2') {
  return CAMBRIDGE_WRITING_COLLECTION_MAP[level]
}
