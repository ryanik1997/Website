import Dexie, { type Table } from 'dexie'

export interface Group      { id: string; name: string; order: number; createdAt: number }
export interface Deck {
  id: string; groupId: string; name: string
  book?: string; unit?: string
  color?: string; icon?: string
  /** 'preset' = do app tạo sẵn (không cho xóa), 'user' = user tự tạo (xóa được). Undefined = legacy — coi như preset nếu nằm trong group hệ thống. */
  origin?: 'preset' | 'user'
  createdAt: number; updatedAt: number
}
export interface Card       { id: string; deckId: string; phrase: string; meaning: string; example?: string; ipaUS?: string; ipaUK?: string; pos?: string; createdAt: number; updatedAt: number }
export interface Srs        { cardId: string; deckId: string; ease: number; interval: number; reps: number; lapses: number; dueAt: number; lastReviewedAt?: number; state: 'new' | 'learning' | 'review' }
export interface ReviewLog  { id?: number; cardId: string; rating: number; mode: string; at: number }
export interface DictEntry  { word: string; data: unknown; fetchedAt: number }
export interface Lesson {
  id: string
  category: 'user' | 'cambridge'
  title: string
  sentences: unknown[]
  createdAt: number
  /** Nhóm sách — VD: Cambridge 20, KET A2 */
  book?: string
  bookNum?: number
  test?: number
  part?: number
  topic?: string
  source?: 'text' | 'whisper' | 'import'
}

export interface TranslationSentence {
  id: string
  vi: string
  en: string
  hint?: string
  difficulty: 'easy' | 'medium' | 'hard'
  srsState?: { ease: number; interval: number; dueAt: number; reps: number; translatedAt?: number }
}

/** Chủ đề bộ câu dịch — khớp translationCatalog.ts */
export type TranslationGenre =
  | 'present_simple' | 'present_continuous' | 'present_perfect' | 'present_perfect_continuous'
  | 'uncountable_nouns' | 'singular_plural' | 'passive_voice' | 'comparison_struct'
  | 'topic_education' | 'topic_environment' | 'topic_technology' | 'topic_health'
  | 'topic_work' | 'topic_travel' | 'topic_food' | 'topic_hobbies' | 'topic_family'
  | 'topic_social_media' | 'topic_shopping' | 'topic_city_life' | 'topic_transport'
  | 'topic_culture' | 'topic_crime'
  | 'custom' | 'other'

export type TranslationCategory =
  | 'ielts_task2' | 'ielts_task1' | 'daily' | 'user'
  | 'grammar_basic' | 'collocation' | 'paragraph_65' | 'paragraph_80' | 'essay_full'

export interface TranslationSet {
  id: string
  title: string
  category: TranslationCategory
  /** Phân loại chủ đề trong từng track */
  genre?: TranslationGenre
  sentences: TranslationSentence[]
  createdAt: number
}
export interface AudioBlob  { key: string; blob: Blob }
/** Phân loại bài viết — Cambridge + IELTS */
export type WritingGenre =
  | 'email' | 'note' | 'story' | 'article' | 'essay' | 'letter' | 'editor_letter'
  | 'report' | 'review' | 'proposal'
  | 'line_graph' | 'bar_chart' | 'pie_chart' | 'table' | 'process' | 'map' | 'mixed'
  | 'opinion' | 'discussion' | 'problem_solution' | 'advantages_disadvantages' | 'two_part'
  | 'paragraph' | 'other'

/** @deprecated Dùng WritingGenre */
export type CambridgeGenre = WritingGenre

export interface WritingDoc {
  id: string
  type:
    | 'ielts' | 'ielts_task1' | 'ielts_task2' | 'master'
    | 'cambridge_a2' | 'cambridge_b1' | 'cambridge_b2' | 'cambridge_c1' | 'cambridge_c2'
  /** Phân loại bài: Cambridge (email, story…) hoặc IELTS (line_graph, opinion…) */
  genre?: WritingGenre
  prompt: string
  text: string
  /** Data URL ảnh đề (jpg/webp) — Task 1 chart hoặc minh họa */
  promptImage?: string
  updatedAt: number
}
export interface WritingHistory { id?: number; docId: string; textHash: string; score: unknown; at: number }
export interface ErrorBank  { id?: number; signature: string; title: string; count: number }
export interface MindMap    { id: string; name: string; nodes: unknown; layout?: string; updatedAt: number }
export interface AiUsage    { day: string; feature: string; count: number; tokens: number }
export interface Setting    { key: string; value: unknown }

/** Đề Reading import (PDF) — parts lưu JSON ReadingPart[] */
export interface ReadingExamRecord {
  id: string
  title: string
  durationMinutes: number
  bandHint: string
  parts: unknown[]
  source: 'pdf' | 'manual'
  sourceFilename?: string
  examTrack?: 'ielts' | 'cambridge'
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2'
  createdAt: number
  updatedAt: number
}

/** Đề Listening import (JSON + MP3/ảnh) — parts lưu JSON ListeningPart[] */
export interface ListeningExamRecord {
  id: string
  title: string
  durationMinutes: number
  bandHint: string
  examType: 'ket' | 'ielts' | 'pet' | 'fce' | 'cae' | 'cpe'
  examMode: 'practice' | 'exam'
  parts: unknown[]
  source: 'import' | 'manual'
  sourceFilename?: string
  createdAt: number
  updatedAt: number
}

/** Cấu trúc câu — luyện điền A / B theo mẫu */
export interface SentenceStructure {
  id: string
  title: string
  template: string
  description: string
  category: string
  exampleA: string
  exampleB: string
  exampleNoteVi: string
  starred?: boolean
  createdAt: number
  updatedAt: number
}

export class RyanDB extends Dexie {
  groups!:         Table<Group, string>
  decks!:          Table<Deck, string>
  cards!:          Table<Card, string>
  srs!:            Table<Srs, string>
  reviewLog!:      Table<ReviewLog, number>
  dictionaryCache!:Table<DictEntry, string>
  lessons!:        Table<Lesson, string>
  translationSets!: Table<TranslationSet, string>
  audioBlobs!:     Table<AudioBlob, string>
  writingDocs!:    Table<WritingDoc, string>
  writingHistory!: Table<WritingHistory, number>
  errorBank!:      Table<ErrorBank, number>
  mindmaps!:       Table<MindMap, string>
  aiUsage!:        Table<AiUsage, [string, string]>
  settings!:       Table<Setting, string>
  sentenceStructures!: Table<SentenceStructure, string>
  readingExams!:      Table<ReadingExamRecord, string>
  listeningExams!:    Table<ListeningExamRecord, string>

  constructor() {
    super('RyanEnglishDB')
    this.version(1).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
    })
    this.version(2).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
    })
    // v3: Deck.color + Deck.icon (optional fields — indexes unchanged)
    this.version(3).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
    })
    // v4: Lesson.book/test/part metadata (optional — indexes unchanged)
    this.version(4).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
    })
    // v5: WritingDoc.promptImage (optional — indexes unchanged)
    this.version(5).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
    })
    // v6: WritingDoc.genre (Cambridge phân loại email/story/…)
    this.version(6).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, genre, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
    })
    // v7: Cấu trúc câu (điền A/B theo mẫu)
    this.version(7).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, genre, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
      sentenceStructures: '&id, category, starred, updatedAt',
    })
    // v8: TranslationSet.genre (hub 3 bước)
    this.version(8).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, genre, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, genre, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
      sentenceStructures: '&id, category, starred, updatedAt',
    })
    // v9: TranslationSet category mở rộng (grammar, collocation, paragraph, essay)
    this.version(9).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, genre, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, genre, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
      sentenceStructures: '&id, category, starred, updatedAt',
    })
    // v10: Reading exams import từ PDF
    this.version(10).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, genre, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, genre, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
      sentenceStructures: '&id, category, starred, updatedAt',
      readingExams:    '&id, source, createdAt, updatedAt',
    })
    // v11: Listening exams import JSON + media
    this.version(11).stores({
      groups:          '&id, order',
      decks:           '&id, groupId, updatedAt',
      cards:           '&id, deckId, phrase',
      srs:             '&cardId, deckId, dueAt, state',
      reviewLog:       '++id, cardId, at',
      dictionaryCache: '&word, fetchedAt',
      lessons:         '&id, category, createdAt',
      translationSets: '&id, category, genre, createdAt',
      audioBlobs:      '&key',
      writingDocs:     '&id, type, genre, updatedAt',
      writingHistory:  '++id, docId, textHash, at',
      errorBank:       '++id, &signature',
      mindmaps:        '&id, updatedAt',
      aiUsage:         '[day+feature], day',
      settings:        '&key',
      sentenceStructures: '&id, category, starred, updatedAt',
      readingExams:    '&id, source, createdAt, updatedAt',
      listeningExams:  '&id, examType, source, createdAt, updatedAt',
    })
  }
}

export const db = new RyanDB()
