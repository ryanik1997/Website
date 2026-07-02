import { db, settingsRepo } from '@ryan/db'
import type { SentenceStructure } from '@ryan/db'
import { GLOBAL_CATALOG_VERSION, CATALOG_SETTING_KEY } from './manifest'
import { CATALOG_SENTENCE_STRUCTURES } from './seeds/sentenceStructures'

export interface GlobalCatalogSyncResult {
  updated: boolean
  fromVersion: number
  toVersion: number
  modules: string[]
}

const now = () => Date.now()

async function upsertCatalogStructures(): Promise<void> {
  const ts = now()
  for (const item of CATALOG_SENTENCE_STRUCTURES) {
    const existing = await db.sentenceStructures.get(item.id)
    const record: SentenceStructure = {
      ...item,
      createdAt: existing?.createdAt ?? ts,
      updatedAt: ts,
      starred: existing?.starred ?? item.starred,
    }
    await db.sentenceStructures.put(record)
  }
}

/**
 * Đồng bộ nội dung global từ catalog (ship cùng deploy).
 * Gọi 1 lần khi vào /app — khi GLOBAL_CATALOG_VERSION tăng, upsert lại data catalog.
 *
 * Module registry (mở rộng sau):
 * - sentenceStructures ✅
 * - vocab decks/cards (TODO)
 * - writing prompts (TODO)
 * - translation sets (TODO)
 * - listening lessons (TODO)
 */
export async function syncGlobalCatalog(): Promise<GlobalCatalogSyncResult> {
  const fromVersion = (await settingsRepo.getSetting(CATALOG_SETTING_KEY) as number | undefined) ?? 0
  if (fromVersion >= GLOBAL_CATALOG_VERSION) {
    return { updated: false, fromVersion, toVersion: fromVersion, modules: [] }
  }

  const modules: string[] = []

  await upsertCatalogStructures()
  modules.push('sentenceStructures')

  await settingsRepo.putSetting(CATALOG_SETTING_KEY, GLOBAL_CATALOG_VERSION)

  return {
    updated: true,
    fromVersion,
    toVersion: GLOBAL_CATALOG_VERSION,
    modules,
  }
}