import type { SupabaseClient } from '@supabase/supabase-js'
import { db, type Deck, type Card, type Srs, type WritingDoc, type MindMap } from '../local/schema'

type CloudDeck = {
  id: string; group_name: string | null; name: string
  book: string | null; unit: string | null
  created_at: string; updated_at: string
}
type CloudCard = {
  id: string; deck_id: string; phrase: string; meaning: string
  example: string | null; ipa_us: string | null; ipa_uk: string | null; pos: string | null
  created_at: string; updated_at: string
}
type CloudSrs = {
  card_id: string; ease: number; interval_days: number
  reps: number; lapses: number; due_at: string
  last_reviewed_at: string | null; state: string
}
type CloudWritingDoc = {
  id: string; type: string; genre?: string | null; prompt: string; text: string
  prompt_image?: string | null; updated_at: string
}
type CloudMindmap = {
  id: string; name: string; nodes: unknown; updated_at: string
}

function throwIfError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`)
}

function isMissingTableError(error: { message: string } | null): boolean {
  if (!error) return false
  const m = error.message.toLowerCase()
  return m.includes('does not exist') || m.includes('schema cache') || m.includes('could not find')
}

function isMissingColumnError(error: { message: string } | null, column: string): boolean {
  if (!error) return false
  const m = error.message.toLowerCase()
  return m.includes('could not find') && m.includes(column.toLowerCase())
}

function writingDocRow(d: WritingDoc, userId: string, opts: { includeImage: boolean; includeGenre: boolean }) {
  const row: Record<string, unknown> = {
    id: d.id,
    user_id: userId,
    type: d.type,
    prompt: d.prompt,
    text: d.text,
    updated_at: new Date(d.updatedAt).toISOString(),
  }
  if (opts.includeGenre) row.genre = d.genre ?? null
  if (opts.includeImage) row.prompt_image = d.promptImage ?? null
  return row
}

async function upsertWritingDocs(
  supabase: SupabaseClient,
  userId: string,
  writingDocs: WritingDoc[],
): Promise<void> {
  if (!writingDocs.length) return

  let includeImage = true
  let includeGenre = true
  let docs = writingDocs

  for (let attempt = 0; attempt < 4; attempt++) {
    const rows = docs.map(d => writingDocRow(d, userId, { includeImage, includeGenre }))
    const { error } = await supabase.from('writing_docs').upsert(rows, { onConflict: 'id' })
    if (!error) return

    if (includeImage && isMissingColumnError(error, 'prompt_image')) {
      includeImage = false
      continue
    }
    if (includeGenre && isMissingColumnError(error, 'genre')) {
      includeGenre = false
      continue
    }
    throwIfError(error, 'writing_docs upsert')
  }
}

/**
 * Push local Dexie → Supabase sau khi user đăng nhập.
 * Chiến lược: upsert — server dùng updated_at để resolve conflict.
 */
export async function syncLocalToCloud(supabase: SupabaseClient, userId: string) {
  const [decks, cards, srsList, writingDocs, mindmaps] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.srs.toArray(),
    db.writingDocs.toArray(),
    db.mindmaps.toArray(),
  ])

  if (decks.length) {
    const { error } = await supabase.from('decks').upsert(
      decks.map((d: Deck) => ({
        id: d.id, user_id: userId,
        group_name: d.groupId ?? null,
        name: d.name, book: d.book ?? null, unit: d.unit ?? null,
        updated_at: new Date(d.updatedAt).toISOString(),
      })),
      { onConflict: 'id' },
    )
    throwIfError(error, 'decks upsert')
  }

  if (cards.length) {
    const { error } = await supabase.from('cards').upsert(
      cards.map((c: Card) => ({
        id: c.id, user_id: userId, deck_id: c.deckId,
        phrase: c.phrase, meaning: c.meaning,
        example: c.example ?? null,
        ipa_us: c.ipaUS ?? null, ipa_uk: c.ipaUK ?? null, pos: c.pos ?? null,
        updated_at: new Date(c.updatedAt).toISOString(),
      })),
      { onConflict: 'id' },
    )
    throwIfError(error, 'cards upsert')
  }

  if (srsList.length) {
    const { error } = await supabase.from('srs').upsert(
      srsList.map((s: Srs) => ({
        card_id: s.cardId, user_id: userId,
        ease: s.ease, interval_days: s.interval,
        reps: s.reps, lapses: s.lapses,
        due_at: new Date(s.dueAt).toISOString(),
        last_reviewed_at: s.lastReviewedAt ? new Date(s.lastReviewedAt).toISOString() : null,
        state: s.state,
      })),
      { onConflict: 'card_id' },
    )
    throwIfError(error, 'srs upsert')
  }

  await upsertWritingDocs(supabase, userId, writingDocs)

  if (mindmaps.length) {
    const { error } = await supabase.from('mindmaps').upsert(
      mindmaps.map((m: MindMap) => ({
        id: m.id,
        user_id: userId,
        name: m.name,
        nodes: m.nodes ?? {},
        updated_at: new Date(m.updatedAt).toISOString(),
      })),
      { onConflict: 'id' },
    )
    throwIfError(error, 'mindmaps upsert')
  }
}

/**
 * Pull Supabase → Dexie khi user đăng nhập thiết bị mới (local trống).
 */
export async function syncCloudToLocal(supabase: SupabaseClient) {
  const [
    { data: decks, error: decksErr },
    { data: cards, error: cardsErr },
    { data: srsList, error: srsErr },
    { data: writingDocs, error: writingErr },
    mindmapsResult,
  ] = await Promise.all([
    supabase.from('decks').select('*').is('deleted_at', null),
    supabase.from('cards').select('*').is('deleted_at', null),
    supabase.from('srs').select('*'),
    supabase.from('writing_docs').select('*').is('deleted_at', null),
    supabase.from('mindmaps').select('*'),
  ])

  throwIfError(decksErr, 'decks pull')
  throwIfError(cardsErr, 'cards pull')
  throwIfError(srsErr, 'srs pull')
  throwIfError(writingErr, 'writing_docs pull')

  let mindmaps = mindmapsResult.data
  if (mindmapsResult.error) {
    if (!isMissingTableError(mindmapsResult.error)) {
      throwIfError(mindmapsResult.error, 'mindmaps pull')
    }
    mindmaps = []
  }

  if (decks?.length) {
    await db.decks.bulkPut((decks as CloudDeck[]).map(d => ({
      id: d.id, groupId: d.group_name ?? '',
      name: d.name, book: d.book ?? undefined, unit: d.unit ?? undefined,
      createdAt: new Date(d.created_at).getTime(),
      updatedAt: new Date(d.updated_at).getTime(),
    })))
  }

  if (cards?.length) {
    await db.cards.bulkPut((cards as CloudCard[]).map(c => ({
      id: c.id, deckId: c.deck_id,
      phrase: c.phrase, meaning: c.meaning,
      example: c.example ?? undefined,
      ipaUS: c.ipa_us ?? undefined, ipaUK: c.ipa_uk ?? undefined, pos: c.pos ?? undefined,
      createdAt: new Date(c.created_at).getTime(),
      updatedAt: new Date(c.updated_at).getTime(),
    })))
  }

  if (srsList?.length) {
    const cardDeckMap = new Map(
      (cards as CloudCard[] | null)?.map(c => [c.id, c.deck_id]) ?? [],
    )
    await db.srs.bulkPut((srsList as CloudSrs[]).map(s => ({
      cardId: s.card_id,
      deckId: cardDeckMap.get(s.card_id) ?? '',
      ease: Number(s.ease), interval: s.interval_days,
      reps: s.reps, lapses: s.lapses,
      dueAt: new Date(s.due_at).getTime(),
      lastReviewedAt: s.last_reviewed_at ? new Date(s.last_reviewed_at).getTime() : undefined,
      state: s.state as 'new' | 'learning' | 'review',
    })))
  }

  if (writingDocs?.length) {
    await db.writingDocs.bulkPut((writingDocs as CloudWritingDoc[]).map(d => ({
      id: d.id,
      type: d.type as WritingDoc['type'],
      genre: (d.genre ?? undefined) as WritingDoc['genre'],
      prompt: d.prompt,
      text: d.text,
      promptImage: d.prompt_image ?? undefined,
      updatedAt: new Date(d.updated_at).getTime(),
    })))
  }

  if (mindmaps?.length) {
    await db.mindmaps.bulkPut((mindmaps as CloudMindmap[]).map(m => ({
      id: m.id,
      name: m.name,
      nodes: m.nodes,
      updatedAt: new Date(m.updated_at).getTime(),
    })))
  }
}

/** True when local Dexie has no user content (new device). */
export async function isLocalEmpty(): Promise<boolean> {
  const [decks, cards, writingDocs, mindmaps] = await Promise.all([
    db.decks.count(),
    db.cards.count(),
    db.writingDocs.count(),
    db.mindmaps.count(),
  ])
  return decks + cards + writingDocs + mindmaps === 0
}