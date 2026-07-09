import { db, settingsRepo } from '@ryan/db'
import type { SentenceStructure } from '@ryan/db'
import { GLOBAL_CATALOG_VERSION, CATALOG_SETTING_KEY, isCatalogId } from './manifest'
import { CATALOG_SENTENCE_STRUCTURES } from './seeds/sentenceStructures'

export interface GlobalCatalogSyncResult {
  updated: boolean
  fromVersion: number
  toVersion: number
  modules: string[]
}

const now = () => Date.now()

function structureDedupeKey(s: Pick<SentenceStructure, 'title' | 'template'>): string {
  return `${s.title.trim().toLowerCase()}|${s.template.trim().toLowerCase()}`
}

/**
 * Seed cũ dùng UUID ngẫu nhiên; catalog dùng `catalog:ss:…` — cùng title/template
 * → list “Cấu trúc câu” bị double. Giữ 1 bản (ưu tiên catalog id).
 */
export async function dedupeLegacySentenceStructures(): Promise<number> {
  const all = await db.sentenceStructures.toArray()
  const groups = new Map<string, SentenceStructure[]>()
  for (const item of all) {
    const key = structureDedupeKey(item)
    const list = groups.get(key) ?? []
    list.push(item)
    groups.set(key, list)
  }

  let deleted = 0
  for (const group of groups.values()) {
    if (group.length < 2) continue
    const preferred =
      group.find(g => isCatalogId(g.id))
      ?? [...group].sort((a, b) => b.updatedAt - a.updatedAt)[0]
    for (const g of group) {
      if (g.id === preferred.id) continue
      await db.sentenceStructures.delete(g.id)
      deleted += 1
    }
  }
  return deleted
}

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
  await dedupeLegacySentenceStructures()
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

  // Luôn gỡ bản seed UUID trùng catalog (kể cả khi version đã đủ)
  await dedupeLegacySentenceStructures()

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