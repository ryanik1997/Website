export { db } from './local/schema'
export type {
  Group, Deck, Card, Srs, ReviewLog, DictEntry,
  Lesson, TranslationSet, TranslationSentence, TranslationGenre, TranslationCategory, CefrLevel,
  AudioBlob, WritingDoc, WritingGenre, CambridgeGenre, WritingHistory,
  ErrorBank, MindMap, AiUsage, Setting, SentenceStructure, ReadingExamRecord, ListeningExamRecord,
  NotebookEntry, ExamBackupRecord,
} from './local/schema'
export { deckRepo } from './local/repositories/deckRepo'
export { cardRepo } from './local/repositories/cardRepo'
export { srsRepo } from './local/repositories/srsRepo'
export { lessonRepo } from './local/repositories/lessonRepo'
export { translationRepo } from './local/repositories/translationRepo'
export { writingRepo } from './local/repositories/writingRepo'
export { settingsRepo } from './local/repositories/settingsRepo'
export { dictRepo } from './local/repositories/dictRepo'
export { mindmapRepo } from './local/repositories/mindmapRepo'
export { audioRepo } from './local/repositories/audioRepo'
export { sentenceStructureRepo } from './local/repositories/sentenceStructureRepo'
export { examRepo } from './local/repositories/examRepo'
export { examBackupRepo } from './local/repositories/examBackupRepo'
export { listeningExamRepo } from './local/repositories/listeningExamRepo'
export { notebookRepo, phraseKeyOf } from './local/repositories/notebookRepo'
export type { NotebookSaveInput } from './local/repositories/notebookRepo'
export {
  syncBidirectional,
  isLocalEmpty,
  isCloudUuid,
} from './cloud/sync'
export type { SyncStats } from './cloud/sync'
export { changedSince, createSyncWindow, SYNC_CURSOR_OVERLAP_MS, SYNC_PAGE_SIZE } from './cloud/syncCursor'
export type { SyncWindow } from './cloud/syncCursor'
export { getSyncServerTime, isMissingSyncSchemaError } from './cloud/syncServerTime'
export type { SyncServerTime } from './cloud/syncServerTime'
export { isPresetDeck, deckIdentityKey, normalizeDeckNameKey } from './cloud/presetDeck'
export {
  clearLocalUserData,
  clearUserScopedLocalStorage,
  ensureLocalUserIsolation,
  getLocalUserOwnerId,
  setLocalUserOwnerId,
  LOCAL_OWNER_KEY,
} from './local/clearLocalUserData'
