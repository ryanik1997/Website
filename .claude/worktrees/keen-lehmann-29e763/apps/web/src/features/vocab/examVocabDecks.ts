/**
 * System decks for exam-driven vocab:
 * - Exam mistakes (global)
 * - Cambridge / IELTS book · test decks
 */
import { db, cardRepo } from '@ryan/db'
import type { Card, Deck } from '@ryan/db'

export const EXAM_VOCAB_GROUP_ID = 'exam-vocab'
export const EXAM_MISTAKES_DECK_ID = 'deck-exam-mistakes'

const GROUP_ORDER = 5

async function ensureExamGroup(): Promise<void> {
  const g = await db.groups.get(EXAM_VOCAB_GROUP_ID)
  if (!g) {
    await db.groups.add({
      id: EXAM_VOCAB_GROUP_ID,
      name: 'Exam · Cambridge',
      order: GROUP_ORDER,
      createdAt: Date.now(),
    })
  }
}

/** Deck cố định "Exam mistakes" — lỗi từ đề thi / listening */
export async function ensureExamMistakesDeck(): Promise<Deck> {
  await ensureExamGroup()
  const existing = await db.decks.get(EXAM_MISTAKES_DECK_ID)
  if (existing) return existing

  const deck: Deck = {
    id: EXAM_MISTAKES_DECK_ID,
    groupId: EXAM_VOCAB_GROUP_ID,
    name: 'Exam mistakes',
    description: 'Từ / cụm sai trong đề Reading · Listening — ôn lại bằng SRS',
    book: 'Exam',
    unit: 'Mistakes',
    color: '#ef4444',
    icon: '⚠️',
    origin: 'preset',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await db.decks.add(deck)
  return deck
}

/** Id ổn định theo book + test (slug) */
export function camDeckId(book: string, test?: number | string): string {
  const b = book.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cam'
  const t = test != null && String(test).trim() !== '' ? String(test).trim() : 'all'
  return `deck-cam-${b}-t${t}`
}

/** Deck theo sách Cambridge / Cam X Test Y */
export async function ensureCamTestDeck(opts: {
  book: string
  test?: number | string
  title?: string
  description?: string
}): Promise<Deck> {
  await ensureExamGroup()
  const id = camDeckId(opts.book, opts.test)
  const existing = await db.decks.get(id)
  if (existing) return existing

  const testLabel = opts.test != null ? ` Test ${opts.test}` : ''
  const name = opts.title?.trim() || `${opts.book}${testLabel}`
  const deck: Deck = {
    id,
    groupId: EXAM_VOCAB_GROUP_ID,
    name,
    description: opts.description?.trim()
      || `Từ vựng theo ${opts.book}${testLabel} — context từ đề`,
    book: opts.book,
    unit: opts.test != null ? `Test ${opts.test}` : undefined,
    color: '#6366f1',
    icon: '📘',
    origin: 'preset',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await db.decks.add(deck)
  return deck
}

export type ExamMistakeInput = {
  phrase: string
  meaning: string
  example?: string
  sourceExamId?: string
  sourceLabel?: string
  /** Nếu có: cũng ghi vào deck Cam book/test */
  book?: string
  test?: number | string
}

/** Lưu 1 lỗi vào Exam mistakes (+ optional Cam deck) */
export async function addExamMistake(input: ExamMistakeInput): Promise<{
  mistakesCard: Card
  camCard?: Card
  created: boolean
}> {
  const phrase = input.phrase.trim()
  const meaning = input.meaning.trim() || '—'
  if (!phrase) throw new Error('phrase required')

  const mistakesDeck = await ensureExamMistakesDeck()
  const { card: mistakesCard, created } = await cardRepo.addUnique(mistakesDeck.id, {
    phrase,
    meaning,
    example: input.example?.trim() || undefined,
    sourceKind: 'exam',
    sourceExamId: input.sourceExamId,
    sourceLabel: input.sourceLabel,
  })

  let camCard: Card | undefined
  if (input.book?.trim()) {
    const camDeck = await ensureCamTestDeck({
      book: input.book.trim(),
      test: input.test,
    })
    const r = await cardRepo.addUnique(camDeck.id, {
      phrase,
      meaning,
      example: input.example?.trim() || undefined,
      sourceKind: 'exam',
      sourceExamId: input.sourceExamId,
      sourceLabel: input.sourceLabel,
    })
    camCard = r.card
  }

  return { mistakesCard, camCard, created }
}

/** Seed system decks once (Vocabulary page mount) */
export async function seedExamVocabDecks(): Promise<void> {
  await ensureExamMistakesDeck()
  // Starter Cam structure — user fills from exams; empty decks OK
  const starters: Array<{ book: string; test?: number }> = [
    { book: 'Cambridge 15', test: 1 },
    { book: 'Cambridge 15', test: 2 },
    { book: 'Cambridge 16', test: 1 },
    { book: 'IELTS Academic' },
  ]
  for (const s of starters) {
    await ensureCamTestDeck(s)
  }
}
