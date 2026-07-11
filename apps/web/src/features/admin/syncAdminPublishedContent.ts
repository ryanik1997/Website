import { cardRepo, db, settingsRepo } from '@ryan/db'
import type {
  Card,
  Lesson,
  MindMap,
  SentenceStructure,
  TranslationSet,
  WritingDoc,
} from '@ryan/db'
import { supabase } from '../../lib/supabase'
import { dedupePresetDecks } from '../vocab/vocabSeedDecks'
import {
  ADMIN_PUBLISHED_VOCAB_VERSION_KEY,
  computePublishedVocabPrunePlan,
} from '../vocab/vocabPublishedSync'
import {
  normalizeVocabPublishPayload,
  type VocabPublishPayload,
} from '../vocab/vocabPublishNormalize'
import { ADMIN_PUBLISH_VERSION_KEY } from './adminContentPublish'

export interface AdminContentSyncResult {
  updated: boolean
  fromVersion: number
  toVersion: number
  modules: string[]
}

/** Tạo SRS mặc định cho thẻ publish mới (chưa có tiến độ). */
async function ensureSrsForCards(cards: Card[]): Promise<void> {
  if (!cards.length) return
  const now = Date.now()
  const existing = await db.srs.bulkGet(cards.map(c => c.id))
  const missing = cards.filter((_, i) => !existing[i])
  if (!missing.length) return
  await db.srs.bulkPut(
    missing.map(c => ({
      cardId: c.id,
      deckId: c.deckId,
      ease: 2.5,
      interval: 0,
      reps: 0,
      lapses: 0,
      dueAt: now,
      state: 'new' as const,
    })),
  )
}

/**
 * Merge vocab publish → local.
 * 1) Chuẩn hoá deck/card id ổn định (cả payload cũ UUID)
 * 2) bulkPut idempotent
 * 3) SRS thiếu + dedupe an toàn (legacy double)
 */
async function mergeVocab(payload: VocabPublishPayload | Record<string, unknown>): Promise<void> {
  const raw = payload as VocabPublishPayload
  const normalized = normalizeVocabPublishPayload({
    groups: raw.groups,
    decks: raw.decks,
    cards: raw.cards,
  })

  const [localDecks, localCards] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
  ])
  const prunePlan = computePublishedVocabPrunePlan(
    localDecks,
    localCards,
    normalized.decks,
    normalized.cards,
  )

  if (prunePlan.staleCardIds.length) {
    await db.srs.bulkDelete(prunePlan.staleCardIds)
    await db.reviewLog.where('cardId').anyOf(prunePlan.staleCardIds).delete()
    await db.cards.bulkDelete(prunePlan.staleCardIds)
  }
  for (const deckId of prunePlan.staleDeckIds) {
    const staleDeckCardIds = (await db.cards.where('deckId').equals(deckId).primaryKeys()) as string[]
    if (staleDeckCardIds.length) {
      await db.reviewLog.where('cardId').anyOf(staleDeckCardIds).delete()
    }
    await db.srs.where('deckId').equals(deckId).delete()
    await db.cards.where('deckId').equals(deckId).delete()
    await db.decks.delete(deckId)
  }

  if (normalized.groups.length) {
    await db.groups.bulkPut(normalized.groups)
  }
  if (normalized.decks.length) {
    await db.decks.bulkPut(normalized.decks)
  }
  if (normalized.cards.length) {
    await db.cards.bulkPut(normalized.cards)
    await ensureSrsForCards(normalized.cards)
  }

  // Legacy: deck/card UUID còn sót sau publish cũ → gộp
  await dedupePresetDecks()
  const deckIds = normalized.decks.map(d => d.id)
  if (deckIds.length) {
    await cardRepo.dedupeAllDecks(deckIds)
  }
}

async function mergeLessons(lessons: Lesson[]): Promise<void> {
  if (!lessons.length) return
  await db.lessons.bulkPut(lessons)
}

async function mergeTranslation(sets: TranslationSet[]): Promise<void> {
  if (!sets.length) return
  await db.translationSets.bulkPut(sets)
}

async function mergeSentenceStructures(items: SentenceStructure[]): Promise<void> {
  if (!items.length) return
  await db.sentenceStructures.bulkPut(items)
}

async function mergeWritingPrompts(docs: WritingDoc[]): Promise<void> {
  if (!docs.length) return
  const prompts = docs.filter(d => !d.text.trim())
  if (!prompts.length) return
  await db.writingDocs.bulkPut(prompts)
}

async function mergeMindmaps(items: MindMap[]): Promise<void> {
  if (!items.length) return
  await db.mindmaps.bulkPut(items)
}

async function mergeModule(module: string, payload: unknown): Promise<void> {
  switch (module) {
    case 'vocab':
      await mergeVocab(payload as VocabPublishPayload)
      break
    case 'lessons':
      await mergeLessons(payload as Lesson[])
      break
    case 'translation':
      await mergeTranslation(payload as TranslationSet[])
      break
    case 'sentence_structures':
      await mergeSentenceStructures(payload as SentenceStructure[])
      break
    case 'writing_prompts':
      await mergeWritingPrompts(payload as WritingDoc[])
      break
    case 'mindmaps':
      await mergeMindmaps(payload as MindMap[])
      break
    default:
      break
  }
}

/** User pull nội dung Admin đã publish — gọi khi vào /app. */
export async function syncAdminPublishedContent(): Promise<AdminContentSyncResult> {
  const localVersion = (await settingsRepo.getSetting(ADMIN_PUBLISH_VERSION_KEY) as number | undefined) ?? 0

  const { data: meta, error: metaErr } = await supabase
    .from('admin_publish_meta')
    .select('version, modules')
    .eq('id', 'global')
    .maybeSingle()

  if (metaErr) {
    console.warn('Không tải admin_publish_meta:', metaErr.message)
    return { updated: false, fromVersion: localVersion, toVersion: localVersion, modules: [] }
  }

  const remoteVersion = (meta?.version as number | undefined) ?? 0
  if (remoteVersion <= localVersion) {
    return { updated: false, fromVersion: localVersion, toVersion: localVersion, modules: [] }
  }

  const { data: rows, error: rowsErr } = await supabase
    .from('admin_published_modules')
    .select('module, payload')

  if (rowsErr) {
    console.warn('Không tải admin_published_modules:', rowsErr.message)
    return { updated: false, fromVersion: localVersion, toVersion: localVersion, modules: [] }
  }

  const modules: string[] = []
  for (const row of rows ?? []) {
    const mod = row.module as string
    await mergeModule(mod, row.payload)
    if (mod === 'vocab') {
      await settingsRepo.putSetting(ADMIN_PUBLISHED_VOCAB_VERSION_KEY, remoteVersion)
    }
    modules.push(mod)
  }

  await settingsRepo.putSetting(ADMIN_PUBLISH_VERSION_KEY, remoteVersion)

  return {
    updated: true,
    fromVersion: localVersion,
    toVersion: remoteVersion,
    modules,
  }
}
