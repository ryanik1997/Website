import type { SupabaseClient } from '@supabase/supabase-js'
import { db, type Deck, type Card, type Srs, type WritingDoc, type MindMap } from '../local/schema'
import { deckIdentityKey, isPresetDeck } from './presetDeck'
import { changedSince, createSyncWindow, SYNC_PAGE_SIZE, type SyncWindow } from './syncCursor'
import { getSyncServerTime } from './syncServerTime'

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
  updated_at?: string
}
type CloudWritingDoc = {
  id: string; type: string; genre?: string | null; prompt: string; text: string
  prompt_image?: string | null; updated_at: string
}
type CloudMindmap = {
  id: string; name: string; nodes: unknown; updated_at: string
}

type CloudTombstone = {
  entity_type: 'deck' | 'card' | 'writing_doc' | 'mindmap'
  entity_id: string
  deleted_at: string
}

const syncCursorKey = (userId: string) => `cloud-sync-cursor:${userId}`
const localSyncCursorKey = (userId: string) => `local-sync-cursor:${userId}`

export function incrementalPullTieBreaker(table: string): string {
  return table === 'srs' ? 'card_id' : 'id'
}

async function pullIncrementalPages(
  supabase: SupabaseClient,
  table: string,
  columns: string,
  userId: string,
  window: SyncWindow,
  opts?: { liveOnly?: boolean },
): Promise<unknown[]> {
  const rows: unknown[] = []
  for (let from = 0; ; from += SYNC_PAGE_SIZE) {
    let query = supabase
      .from(table)
      .select(columns)
      .eq('user_id', userId)
      .lte('updated_at', window.upperBoundIso)
      .order('updated_at', { ascending: true })
      .order(incrementalPullTieBreaker(table), { ascending: true })
      .range(from, from + SYNC_PAGE_SIZE - 1)
    if (window.pullAfterIso) query = query.gt('updated_at', window.pullAfterIso)
    if (opts?.liveOnly) query = query.is('deleted_at', null)
    const { data, error } = await query
    throwIfError(error, `${table} incremental pull`)
    const page = data ?? []
    rows.push(...page)
    if (page.length < SYNC_PAGE_SIZE) break
  }
  return rows
}

async function pullTombstonePages(
  supabase: SupabaseClient,
  userId: string,
  window: SyncWindow,
): Promise<CloudTombstone[]> {
  const rows: CloudTombstone[] = []
  for (let from = 0; ; from += SYNC_PAGE_SIZE) {
    let query = supabase
      .from('sync_tombstones')
      .select('entity_type,entity_id,deleted_at')
      .eq('user_id', userId)
      .lte('deleted_at', window.upperBoundIso)
      .order('deleted_at', { ascending: true })
      .order('entity_id', { ascending: true })
      .range(from, from + SYNC_PAGE_SIZE - 1)
    if (window.pullAfterIso) query = query.gt('deleted_at', window.pullAfterIso)
    const { data, error } = await query
    if (isMissingTableError(error)) return []
    throwIfError(error, 'sync_tombstones incremental pull')
    const page = (data ?? []) as CloudTombstone[]
    rows.push(...page)
    if (page.length < SYNC_PAGE_SIZE) break
  }
  return rows
}

export type SyncStats = {
  pushed: { decks: number; cards: number; srs: number; writingDocs: number; mindmaps: number }
  pulled: { decks: number; cards: number; srs: number; writingDocs: number; mindmaps: number }
  conflicts: number
}

function emptyStats(): SyncStats {
  return {
    pushed: { decks: 0, cards: 0, srs: 0, writingDocs: 0, mindmaps: 0 },
    pulled: { decks: 0, cards: 0, srs: 0, writingDocs: 0, mindmaps: 0 },
    conflicts: 0,
  }
}

function throwIfError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`)
}

/** Cloud decks/cards/srs/writing dùng UUID; bỏ id lạ (preset, import cũ) khỏi push. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isCloudUuid(id: string | null | undefined): boolean {
  return typeof id === 'string' && UUID_RE.test(id)
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

function toMs(isoOrMs: string | number | null | undefined): number {
  if (isoOrMs == null) return 0
  if (typeof isoOrMs === 'number') return Number.isFinite(isoOrMs) ? isoOrMs : 0
  const t = new Date(isoOrMs).getTime()
  return Number.isNaN(t) ? 0 : t
}

/**
 * Last-write-wins. On equal timestamps prefer local (device that just came online
 * after offline edits usually has the freshest intent).
 * Returns 'local' | 'cloud' | 'equal-local'.
 */
function pickWinner(localTs: number, cloudTs: number): 'local' | 'cloud' {
  if (localTs > cloudTs) return 'local'
  if (cloudTs > localTs) return 'cloud'
  return 'local'
}

function srsLocalTs(s: Srs): number {
  return s.updatedAt ?? s.lastReviewedAt ?? 0
}

function srsCloudTs(s: CloudSrs): number {
  if (s.updated_at) return toMs(s.updated_at)
  if (s.last_reviewed_at) return toMs(s.last_reviewed_at)
  return toMs(s.due_at)
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

function cloudDeckToLocal(d: CloudDeck): Deck {
  return {
    id: d.id,
    groupId: d.group_name ?? '',
    name: d.name,
    book: d.book ?? undefined,
    unit: d.unit ?? undefined,
    origin: 'user',
    createdAt: toMs(d.created_at) || Date.now(),
    updatedAt: toMs(d.updated_at) || Date.now(),
  }
}

function cloudCardToLocal(c: CloudCard): Card {
  return {
    id: c.id,
    deckId: c.deck_id,
    phrase: c.phrase,
    meaning: c.meaning,
    example: c.example ?? undefined,
    ipaUS: c.ipa_us ?? undefined,
    ipaUK: c.ipa_uk ?? undefined,
    pos: c.pos ?? undefined,
    createdAt: toMs(c.created_at) || Date.now(),
    updatedAt: toMs(c.updated_at) || Date.now(),
  }
}

function cloudSrsToLocal(s: CloudSrs, deckId: string): Srs {
  return {
    cardId: s.card_id,
    deckId,
    ease: Number(s.ease),
    interval: s.interval_days,
    reps: s.reps,
    lapses: s.lapses,
    dueAt: toMs(s.due_at) || Date.now(),
    lastReviewedAt: s.last_reviewed_at ? toMs(s.last_reviewed_at) : undefined,
    updatedAt: s.updated_at ? toMs(s.updated_at) : undefined,
    state: s.state as 'new' | 'learning' | 'review',
  }
}

function cloudWritingToLocal(d: CloudWritingDoc): WritingDoc {
  return {
    id: d.id,
    type: d.type as WritingDoc['type'],
    genre: (d.genre ?? undefined) as WritingDoc['genre'],
    prompt: d.prompt,
    text: d.text,
    promptImage: d.prompt_image ?? undefined,
    updatedAt: toMs(d.updated_at) || Date.now(),
  }
}

function cloudMindmapToLocal(m: CloudMindmap): MindMap {
  return {
    id: m.id,
    name: m.name,
    nodes: m.nodes,
    updatedAt: toMs(m.updated_at) || Date.now(),
  }
}

function deckToCloud(d: Deck, userId: string) {
  return {
    id: d.id,
    user_id: userId,
    group_name: d.groupId ?? null,
    name: d.name,
    book: d.book ?? null,
    unit: d.unit ?? null,
    updated_at: new Date(d.updatedAt).toISOString(),
  }
}

function cardToCloud(c: Card, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    deck_id: c.deckId,
    phrase: c.phrase,
    meaning: c.meaning,
    example: c.example ?? null,
    ipa_us: c.ipaUS ?? null,
    ipa_uk: c.ipaUK ?? null,
    pos: c.pos ?? null,
    updated_at: new Date(c.updatedAt).toISOString(),
  }
}

function mapSrsToCloud(s: Srs, userId: string) {
  return {
    card_id: s.cardId,
    user_id: userId,
    ease: s.ease,
    interval_days: s.interval,
    reps: s.reps,
    lapses: s.lapses,
    due_at: new Date(s.dueAt).toISOString(),
    last_reviewed_at: s.lastReviewedAt ? new Date(s.lastReviewedAt).toISOString() : null,
    state: s.state,
  }
}

function mindmapToCloud(m: MindMap, userId: string) {
  return {
    id: m.id,
    user_id: userId,
    name: m.name,
    nodes: m.nodes ?? {},
    updated_at: new Date(m.updatedAt).toISOString(),
  }
}

/**
 * True when local Dexie has no *user* content (new device).
 * Bỏ qua deck/card preset của app — nếu không, máy mới seed preset sẽ không bao giờ pull cloud.
 */
export async function isLocalEmpty(): Promise<boolean> {
  const [allDecks, writingDocs, mindmaps] = await Promise.all([
    db.decks.toArray(),
    db.writingDocs.count(),
    db.mindmaps.count(),
  ])
  const userDecks = allDecks.filter(d => !isPresetDeck(d))
  if (userDecks.length > 0) return false
  if (writingDocs > 0 || mindmaps > 0) return false

  const presetIds = new Set(allDecks.filter(isPresetDeck).map(d => d.id))
  const userCardCount = await db.cards
    .filter(c => !presetIds.has(c.deckId))
    .count()
  return userCardCount === 0
}

/**
 * Bidirectional sync with last-write-wins conflict resolution.
 * Offline edits on device A and B: when both come online, the side with
 * the newer `updated_at` (or SRS last review) wins; losers are overwritten.
 */
export async function syncBidirectional(
  supabase: SupabaseClient,
  userId: string,
): Promise<SyncStats> {
  const stats = emptyStats()

  const localUpperBoundIso = new Date().toISOString()
  const [cursorSetting, localCursorSetting, serverTime] = await Promise.all([
    db.settings.get(syncCursorKey(userId)),
    db.settings.get(localSyncCursorKey(userId)),
    getSyncServerTime(supabase, localUpperBoundIso),
  ])
  const upperBound = serverTime.iso
  const cursorIso = typeof cursorSetting?.value === 'string' ? cursorSetting.value : null
  const syncWindow = createSyncWindow(cursorIso, upperBound)
  const localSyncWindow = createSyncWindow(
    typeof localCursorSetting?.value === 'string' ? localCursorSetting.value : null,
    localUpperBoundIso,
  )

  const [allDecks, allCards, allSrs, localWriting, localMindmaps, mmTombstones, deckTombstones, cardTombstones] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.srs.toArray(),
    db.writingDocs.toArray(),
    db.mindmaps.toArray(),
    db.mindmapTombstones.toArray(),
    db.deckTombstones.toArray(),
    db.cardTombstones.toArray(),
  ])
  const mmTombstoneIds = new Set(mmTombstones.map(t => t.id))
  const deckTombstoneIds = new Set(deckTombstones.map(t => t.id).filter(isCloudUuid))
  const cardTombstoneIds = new Set(cardTombstones.map(t => t.id).filter(isCloudUuid))

  // Chỉ user content + UUID hợp lệ → cloud (preset / catalog id không ghi đè RLS)
  const presetDeckIds = new Set(allDecks.filter(isPresetDeck).map(d => d.id))

  const [cloudDecksRaw, cloudCardsRaw, cloudSrsRaw, cloudWritingRaw, cloudMindmapsRaw, cloudTombstones] = await Promise.all([
    pullIncrementalPages(supabase, 'decks', '*', userId, syncWindow, { liveOnly: true }),
    pullIncrementalPages(supabase, 'cards', '*', userId, syncWindow, { liveOnly: true }),
    pullIncrementalPages(supabase, 'srs', '*', userId, syncWindow),
    pullIncrementalPages(supabase, 'writing_docs', '*', userId, syncWindow, { liveOnly: true }),
    pullIncrementalPages(supabase, 'mindmaps', '*', userId, syncWindow),
    pullTombstonePages(supabase, userId, syncWindow),
  ])

  const cloudDecks = cloudDecksRaw as CloudDeck[]
  const cloudCards = cloudCardsRaw as CloudCard[]
  const cloudSrsList = cloudSrsRaw as CloudSrs[]
  const cloudWriting = cloudWritingRaw as CloudWritingDoc[]
  const cloudMindmaps = cloudMindmapsRaw as CloudMindmap[]

  const tombstoneDeckIds = new Set(cloudTombstones.filter(t => t.entity_type === 'deck').map(t => t.entity_id))
  const tombstoneCardIds = new Set(cloudTombstones.filter(t => t.entity_type === 'card').map(t => t.entity_id))
  const tombstoneWritingIds = new Set(cloudTombstones.filter(t => t.entity_type === 'writing_doc').map(t => t.entity_id))
  const tombstoneMindmapIds = new Set(cloudTombstones.filter(t => t.entity_type === 'mindmap').map(t => t.entity_id))

  const localDecks = allDecks.filter(
    d => !isPresetDeck(d) && isCloudUuid(d.id) && !tombstoneDeckIds.has(d.id),
  )
  const localCards = allCards.filter(
    c => !presetDeckIds.has(c.deckId)
      && isCloudUuid(c.id)
      && isCloudUuid(c.deckId)
      && !tombstoneDeckIds.has(c.deckId)
      && !tombstoneCardIds.has(c.id),
  )
  const syncableCardIds = new Set(localCards.map(c => c.id))
  const localSrs = allSrs.filter(s => syncableCardIds.has(s.cardId) && isCloudUuid(s.cardId))
  const localWritingSync = localWriting.filter(
    d => isCloudUuid(d.id) && !tombstoneWritingIds.has(d.id),
  )
  const localMindmapsLive = localMindmaps.filter(m => !tombstoneMindmapIds.has(m.id))

  const localDecksChanged = localDecks.filter(d => changedSince(localSyncWindow, d.updatedAt))
  const localCardsChanged = localCards.filter(c => changedSince(localSyncWindow, c.updatedAt))
  const localSrsChanged = localSrs.filter(s => changedSince(localSyncWindow, srsLocalTs(s)))
  const localWritingChanged = localWritingSync.filter(d => changedSince(localSyncWindow, d.updatedAt))
  const localMindmapsChanged = localMindmapsLive.filter(m => changedSince(localSyncWindow, m.updatedAt))

  await db.transaction('rw', db.decks, db.cards, db.srs, db.writingDocs, db.mindmaps, async () => {
    if (tombstoneDeckIds.size) {
      const ids = [...tombstoneDeckIds]
      const cardIds = (await db.cards.where('deckId').anyOf(ids).primaryKeys()) as string[]
      await db.srs.bulkDelete(cardIds)
      await db.cards.where('deckId').anyOf(ids).delete()
      await db.decks.bulkDelete(ids)
    }
    if (tombstoneCardIds.size) {
      const ids = [...tombstoneCardIds]
      await db.srs.bulkDelete(ids)
      await db.cards.bulkDelete(ids)
    }
    if (tombstoneWritingIds.size) await db.writingDocs.bulkDelete([...tombstoneWritingIds])
    if (tombstoneMindmapIds.size) await db.mindmaps.bulkDelete([...tombstoneMindmapIds])
  })

  /**
   * Ghost: bản preset từng bị push cloud với UUID (trước khi chặn isPresetDeck).
   * Mỗi lần pull tạo lại deck trùng tên cạnh `preset:…` → double Bộ từ vựng.
   * Map cloud deck id → local preset id; không pull deck/card ghost.
   */
  const localPresetByKey = new Map<string, string>()
  for (const d of allDecks) {
    if (!isPresetDeck(d)) continue
    localPresetByKey.set(deckIdentityKey(d.groupId, d.name), d.id)
  }
  const ghostCloudDeckIds = new Set<string>()
  for (const remote of cloudDecks) {
    const key = deckIdentityKey(remote.group_name ?? '', remote.name)
    const localPresetId = localPresetByKey.get(key)
    if (localPresetId && remote.id !== localPresetId) {
      ghostCloudDeckIds.add(remote.id)
    }
  }

  // Soft-delete ghost trên cloud (user sở hữu) — lần sau không pull lại
  if (ghostCloudDeckIds.size) {
    const ghostIds = [...ghostCloudDeckIds]
    const nowIso = new Date().toISOString()
    const chunkSize = 40
    for (let i = 0; i < ghostIds.length; i += chunkSize) {
      const chunk = ghostIds.slice(i, i + chunkSize)
      const { error: ghostDeckErr } = await supabase
        .from('decks')
        .update({ deleted_at: nowIso })
        .eq('user_id', userId)
        .in('id', chunk)
      if (ghostDeckErr) {
        console.warn('[sync] soft-delete ghost preset decks', ghostDeckErr.message)
      }
      const { error: ghostCardErr } = await supabase
        .from('cards')
        .update({ deleted_at: nowIso })
        .eq('user_id', userId)
        .in('deck_id', chunk)
      if (ghostCardErr) {
        console.warn('[sync] soft-delete ghost preset cards', ghostCardErr.message)
      }
    }
  }

  const cloudDecksLive = cloudDecks.filter(d => !ghostCloudDeckIds.has(d.id) && !deckTombstoneIds.has(d.id))
  const cloudCardsLive = cloudCards.filter(
    c => !ghostCloudDeckIds.has(c.deck_id)
      && !deckTombstoneIds.has(c.deck_id)
      && !cardTombstoneIds.has(c.id),
  )

  // Đẩy tombstone deck → cloud (hard delete, cards + srs cascade theo FK)
  // Làm trước diff → tránh pull ngược deck đã xoá local.
  if (deckTombstoneIds.size) {
    const ids = [...deckTombstoneIds]
    const chunkSize = 80
    let allOk = true
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize)
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('user_id', userId)
        .in('id', chunk)
      if (error) {
        allOk = false
        console.warn('[sync] deck tombstone delete', error.message)
      }
    }
    if (allOk) {
      await db.deckTombstones.bulkDelete(ids)
    }
  }

  // Đẩy tombstone card đơn lẻ → cloud (srs cascade)
  if (cardTombstoneIds.size) {
    const ids = [...cardTombstoneIds]
    const chunkSize = 80
    let allOk = true
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize)
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('user_id', userId)
        .in('id', chunk)
      if (error) {
        allOk = false
        console.warn('[sync] card tombstone delete', error.message)
      }
    }
    if (allOk) {
      await db.cardTombstones.bulkDelete(ids)
    }
  }

  // ── Decks ────────────────────────────────────────────────
  const localDeckMap = new Map(localDecks.map(d => [d.id, d]))
  const localDeckChangedIds = new Set(localDecksChanged.map(d => d.id))
  const cloudDeckMap = new Map(cloudDecksLive.map(d => [d.id, d]))
  const decksToLocal: Deck[] = []
  const decksToCloud: Deck[] = []

  for (const local of localDecksChanged) {
    const remote = cloudDeckMap.get(local.id)
    if (!remote) {
      decksToCloud.push(local)
      continue
    }
    const winner = pickWinner(local.updatedAt, toMs(remote.updated_at))
    if (winner === 'local') {
      decksToCloud.push(local)
      if (local.updatedAt !== toMs(remote.updated_at)) stats.conflicts += 1
    } else {
      decksToLocal.push(cloudDeckToLocal(remote))
      stats.conflicts += 1
    }
  }
  for (const remote of cloudDecksLive) {
    if (!localDeckMap.has(remote.id) || !localDeckChangedIds.has(remote.id)) {
      // Không tạo deck user mới nếu đã có preset cùng group+tên (kể cả seed sau sync)
      const key = deckIdentityKey(remote.group_name ?? '', remote.name)
      if (localPresetByKey.has(key)) continue
      decksToLocal.push(cloudDeckToLocal(remote))
    }
  }

  if (decksToLocal.length) {
    await db.decks.bulkPut(decksToLocal)
    stats.pulled.decks = decksToLocal.length
  }

  // ── Cards ────────────────────────────────────────────────
  const localCardMap = new Map(localCards.map(c => [c.id, c]))
  const localCardChangedIds = new Set(localCardsChanged.map(c => c.id))
  const cloudCardMap = new Map(cloudCardsLive.map(c => [c.id, c]))
  const cardsToLocal: Card[] = []
  const cardsToCloud: Card[] = []

  for (const local of localCardsChanged) {
    const remote = cloudCardMap.get(local.id)
    if (!remote) {
      cardsToCloud.push(local)
      continue
    }
    const winner = pickWinner(local.updatedAt, toMs(remote.updated_at))
    if (winner === 'local') {
      cardsToCloud.push(local)
      if (local.updatedAt !== toMs(remote.updated_at)) stats.conflicts += 1
    } else {
      cardsToLocal.push(cloudCardToLocal(remote))
      stats.conflicts += 1
    }
  }
  for (const remote of cloudCardsLive) {
    if (!localCardMap.has(remote.id) || !localCardChangedIds.has(remote.id)) {
      // Bỏ thẻ thuộc deck ghost / preset id
      if (ghostCloudDeckIds.has(remote.deck_id)) continue
      if (presetDeckIds.has(remote.deck_id)) continue
      cardsToLocal.push(cloudCardToLocal(remote))
    }
  }

  if (cardsToLocal.length) {
    await db.cards.bulkPut(cardsToLocal)
    stats.pulled.cards = cardsToLocal.length
  }

  // After pull, deck map for SRS
  const cardDeckMap = new Map<string, string>()
  for (const c of localCards) cardDeckMap.set(c.id, c.deckId)
  for (const c of cardsToLocal) cardDeckMap.set(c.id, c.deckId)
  for (const c of cloudCardsLive) {
    if (!cardDeckMap.has(c.id)) cardDeckMap.set(c.id, c.deck_id)
  }

  // Card ids thuộc ghost deck (đã soft-delete) — không pull SRS
  const ghostCardIds = new Set(
    cloudCards.filter(c => ghostCloudDeckIds.has(c.deck_id)).map(c => c.id),
  )

  // ── SRS ──────────────────────────────────────────────────
  const localSrsMap = new Map(localSrs.map(s => [s.cardId, s]))
  const localSrsChangedIds = new Set(localSrsChanged.map(s => s.cardId))
  const cloudSrsMap = new Map(
    cloudSrsList.filter(s => !ghostCardIds.has(s.card_id)).map(s => [s.card_id, s]),
  )
  const srsToLocal: Srs[] = []
  const srsToCloud: Srs[] = []

  for (const local of localSrsChanged) {
    const remote = cloudSrsMap.get(local.cardId)
    if (!remote) {
      srsToCloud.push(local)
      continue
    }
    const winner = pickWinner(srsLocalTs(local), srsCloudTs(remote))
    if (winner === 'local') {
      srsToCloud.push(local)
      if (srsLocalTs(local) !== srsCloudTs(remote)) stats.conflicts += 1
    } else {
      srsToLocal.push(cloudSrsToLocal(remote, cardDeckMap.get(remote.card_id) ?? local.deckId))
      stats.conflicts += 1
    }
  }
  for (const remote of cloudSrsList) {
    if (ghostCardIds.has(remote.card_id)) continue
    if (!localSrsMap.has(remote.card_id) || !localSrsChangedIds.has(remote.card_id)) {
      const deckId = cardDeckMap.get(remote.card_id) ?? ''
      if (deckId && presetDeckIds.has(deckId)) continue
      srsToLocal.push(cloudSrsToLocal(remote, deckId))
    }
  }

  if (srsToLocal.length) {
    await db.srs.bulkPut(srsToLocal)
    stats.pulled.srs = srsToLocal.length
  }

  // ── Writing docs ─────────────────────────────────────────
  const localWritingMap = new Map(localWritingSync.map(d => [d.id, d]))
  const localWritingChangedIds = new Set(localWritingChanged.map(d => d.id))
  const cloudWritingMap = new Map(cloudWriting.map(d => [d.id, d]))
  const writingToLocal: WritingDoc[] = []
  const writingToCloud: WritingDoc[] = []

  for (const local of localWritingChanged) {
    const remote = cloudWritingMap.get(local.id)
    if (!remote) {
      writingToCloud.push(local)
      continue
    }
    const winner = pickWinner(local.updatedAt, toMs(remote.updated_at))
    if (winner === 'local') {
      writingToCloud.push(local)
      if (local.updatedAt !== toMs(remote.updated_at)) stats.conflicts += 1
    } else {
      writingToLocal.push(cloudWritingToLocal(remote))
      stats.conflicts += 1
    }
  }
  for (const remote of cloudWriting) {
    if (!localWritingMap.has(remote.id) || !localWritingChangedIds.has(remote.id)) {
      writingToLocal.push(cloudWritingToLocal(remote))
    }
  }

  if (writingToLocal.length) {
    await db.writingDocs.bulkPut(writingToLocal)
    stats.pulled.writingDocs = writingToLocal.length
  }

  // ── Mindmaps ─────────────────────────────────────────────
  // 1) Đẩy tombstone → cloud (hard delete) trước khi so sánh, tránh pull ngược
  if (mmTombstoneIds.size) {
    const ids = [...mmTombstoneIds]
    const chunkSize = 80
    let allOk = true
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize)
      const { error } = await supabase
        .from('mindmaps')
        .delete()
        .eq('user_id', userId)
        .in('id', chunk)
      if (error) {
        allOk = false
        console.warn('[sync] mindmap tombstone delete', error.message)
      }
    }
    if (allOk) {
      await db.mindmapTombstones.bulkDelete(ids)
    }
  }

  // 2) Loại tombstoned IDs khỏi cloud list — không pull ngược ngay cả khi delete cloud lỗi
  const cloudMindmapsLive = cloudMindmaps.filter(m => !mmTombstoneIds.has(m.id))

  const localMmMap = new Map(localMindmapsLive.map(m => [m.id, m]))
  const localMindmapChangedIds = new Set(localMindmapsChanged.map(m => m.id))
  const cloudMmMap = new Map(cloudMindmapsLive.map(m => [m.id, m]))
  const mmToLocal: MindMap[] = []
  const mmToCloud: MindMap[] = []

  for (const local of localMindmapsChanged) {
    const remote = cloudMmMap.get(local.id)
    if (!remote) {
      mmToCloud.push(local)
      continue
    }
    const winner = pickWinner(local.updatedAt, toMs(remote.updated_at))
    if (winner === 'local') {
      mmToCloud.push(local)
      if (local.updatedAt !== toMs(remote.updated_at)) stats.conflicts += 1
    } else {
      mmToLocal.push(cloudMindmapToLocal(remote))
      stats.conflicts += 1
    }
  }
  for (const remote of cloudMindmapsLive) {
    if (!localMmMap.has(remote.id) || !localMindmapChangedIds.has(remote.id)) {
      mmToLocal.push(cloudMindmapToLocal(remote))
    }
  }

  if (mmToLocal.length) {
    await db.mindmaps.bulkPut(mmToLocal)
    stats.pulled.mindmaps = mmToLocal.length
  }

  // ── Push winners + local-only ────────────────────────────
  // Chỉ push UUID user (đã lọc). Chunk để tránh payload quá lớn.
  const pushErrors: string[] = []
  async function upsertChunked(
    table: string,
    rows: Record<string, unknown>[],
    onConflict: string,
  ): Promise<number> {
    if (!rows.length) return 0
    const size = 80
    let ok = 0
    for (let i = 0; i < rows.length; i += size) {
      const chunk = rows.slice(i, i + size)
      const { error } = await supabase.from(table).upsert(chunk, { onConflict })
      if (error) {
        pushErrors.push(`${table}: ${error.message}`)
        console.warn(`[sync] ${table} upsert chunk`, error.message)
      } else {
        ok += chunk.length
      }
    }
    return ok
  }

  // Ensure parent decks exist on cloud before cards (local-only decks first)
  const acknowledgedAt = toMs(syncWindow.upperBoundIso)
  stats.pushed.decks = await upsertChunked(
    'decks',
    decksToCloud.map(d => deckToCloud(d, userId)),
    'id',
  )
  if (stats.pushed.decks) {
    await db.decks.bulkPut(decksToCloud.map(d => ({ ...d, updatedAt: acknowledgedAt })))
  }

  // Cards that reference decks only on cloud after pull — ensure any card's deck is pushed if local user deck
  const deckIdsOnCloud = new Set([...cloudDeckMap.keys(), ...decksToCloud.map(d => d.id)])
  const missingDeckIds = new Set<string>()
  for (const c of cardsToCloud) {
    if (!deckIdsOnCloud.has(c.deckId) && localDeckMap.has(c.deckId)) {
      missingDeckIds.add(c.deckId)
    }
  }
  if (missingDeckIds.size) {
    const extra = [...missingDeckIds].map(id => localDeckMap.get(id)!).filter(Boolean)
    if (extra.length) {
      stats.pushed.decks += await upsertChunked(
        'decks',
        extra.map(d => deckToCloud(d, userId)),
        'id',
      )
    }
  }

  stats.pushed.cards = await upsertChunked(
    'cards',
    cardsToCloud.map(c => cardToCloud(c, userId)),
    'id',
  )
  if (stats.pushed.cards) {
    await db.cards.bulkPut(cardsToCloud.map(c => ({ ...c, updatedAt: acknowledgedAt })))
  }

  stats.pushed.srs = await upsertChunked(
    'srs',
    srsToCloud.map(s => mapSrsToCloud(s, userId)),
    'card_id',
  )
  if (stats.pushed.srs) {
    await db.srs.bulkPut(srsToCloud.map(s => ({ ...s, updatedAt: acknowledgedAt })))
  }

  if (writingToCloud.length) {
    try {
      await upsertWritingDocs(supabase, userId, writingToCloud)
      stats.pushed.writingDocs = writingToCloud.length
      await db.writingDocs.bulkPut(writingToCloud.map(d => ({ ...d, updatedAt: acknowledgedAt })))
    } catch (e) {
      pushErrors.push(e instanceof Error ? e.message : 'writing_docs upsert')
    }
  }

  if (mmToCloud.length) {
    const n = await upsertChunked(
      'mindmaps',
      mmToCloud.map(m => mindmapToCloud(m, userId)),
      'id',
    )
    stats.pushed.mindmaps = n
    if (n) await db.mindmaps.bulkPut(mmToCloud.map(m => ({ ...m, updatedAt: acknowledgedAt })))
  }

  // Chỉ fail hard nếu không push được gì quan trọng + có lỗi (tránh báo RLS khi đã dọn vocab)
  if (pushErrors.length) {
    // Never advance the incremental cursor after a partial push. Retrying an
    // already-upserted chunk is idempotent; skipping a failed chunk is data loss.
    throw new Error(pushErrors.join('; '))
  }

  if (serverTime.authoritative) {
    await db.settings.put({ key: syncCursorKey(userId), value: syncWindow.upperBoundIso })
  }
  await db.settings.put({ key: localSyncCursorKey(userId), value: localSyncWindow.upperBoundIso })

  return stats
}
