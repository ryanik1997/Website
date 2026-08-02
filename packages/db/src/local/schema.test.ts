import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { RyanDB, type SentenceStructure } from './schema'

const V17_STORES = {
  groups: '&id, order',
  decks: '&id, groupId, updatedAt',
  cards: '&id, deckId, phrase',
  srs: '&cardId, deckId, dueAt, state, [deckId+dueAt]',
  reviewLog: '++id, cardId, at, mode, [mode+at]',
  dictionaryCache: '&word, fetchedAt',
  lessons: '&id, category, createdAt',
  translationSets: '&id, category, genre, createdAt',
  audioBlobs: '&key, createdAt, lastAccessedAt',
  writingDocs: '&id, type, genre, updatedAt',
  writingHistory: '++id, docId, textHash, at',
  errorBank: '++id, &signature',
  mindmaps: '&id, updatedAt',
  mindmapTombstones: '&id, deletedAt',
  deckTombstones: '&id, deletedAt',
  cardTombstones: '&id, deletedAt',
  aiUsage: '[day+feature], day',
  settings: '&key',
  sentenceStructures: '&id, category, starred, updatedAt',
  readingExams: '&id, source, createdAt, updatedAt',
  listeningExams: '&id, examType, source, createdAt, updatedAt',
  notebookEntries: '&id, &phraseKey, sourceCardId, sourceDeckId, createdAt',
  examBackups: '&id, skill, updatedAt, title',
}

beforeEach(() => {
  Dexie.dependencies.indexedDB = indexedDB
  Dexie.dependencies.IDBKeyRange = IDBKeyRange
})

describe('RyanDB v18 migration', () => {
  it('keeps v17 data and adds empty cambridgeWritingTests table', async () => {
    const name = `RyanEnglishDB-test-${crypto.randomUUID()}`

    const legacy = new Dexie(name)
    legacy.version(17).stores(V17_STORES)
    await legacy.open()
    await legacy.table('settings').put({ key: 'legacy-flag', value: true })
    await legacy.table('sentenceStructures').put({
      id: 'legacy-structure',
      title: 'Legacy',
      template: 'S + V',
      description: '',
      category: 'other',
      exampleA: '',
      exampleB: '',
      exampleNoteVi: '',
      createdAt: 1,
      updatedAt: 1,
    } satisfies SentenceStructure)
    await legacy.close()

    const upgraded = new RyanDB(name)
    await upgraded.open()

    expect(upgraded.tables.some(table => table.name === 'cambridgeWritingTests')).toBe(true)
    expect(await upgraded.settings.get('legacy-flag')).toEqual({ key: 'legacy-flag', value: true })
    expect(await upgraded.cambridgeWritingTests.count()).toBe(0)
    expect((await upgraded.sentenceStructures.get('legacy-structure'))?.learningStatus ?? 'not_started').toBe('not_started')

    await upgraded.delete()
  })
})
