import { db, settingsRepo } from '@ryan/db'
import type { SentenceStructure } from '@ryan/db'
import { GLOBAL_CATALOG_VERSION, CATALOG_SETTING_KEY, isCatalogId } from './manifest'
import { CATALOG_SENTENCE_STRUCTURES } from './seeds/sentenceStructures'
import {
  baseStructureTitle,
  normalizeStructureTemplate,
} from './seeds/sentenceStructures.expand'

export interface GlobalCatalogSyncResult {
  updated: boolean
  fromVersion: number
  toVersion: number
  modules: string[]
  deletedDuplicates?: number
}

const now = () => Date.now()

/** Dedupe theo template (không theo title · 02) — 1 bản / pattern. */
export function structureDedupeKey(s: Pick<SentenceStructure, 'title' | 'template'>): string {
  return normalizeStructureTemplate(s.template)
}

function preferStructure(a: SentenceStructure, b: SentenceStructure): SentenceStructure {
  // 1) catalog id gốc (không :v / extra)
  const aCore = isCatalogId(a.id) && !a.id.includes(':v') && !a.id.includes(':extra') && !a.id.includes('extra-')
  const bCore = isCatalogId(b.id) && !b.id.includes(':v') && !b.id.includes(':extra') && !b.id.includes('extra-')
  if (aCore && !bCore) return a
  if (bCore && !aCore) return b
  // 2) bất kỳ catalog id
  if (isCatalogId(a.id) && !isCatalogId(b.id)) return a
  if (isCatalogId(b.id) && !isCatalogId(a.id)) return b
  // 3) title không có · 02
  const aBase = baseStructureTitle(a.title) === a.title.trim()
  const bBase = baseStructureTitle(b.title) === b.title.trim()
  if (aBase && !bBase) return a
  if (bBase && !aBase) return b
  // 4) mới hơn
  return a.updatedAt >= b.updatedAt ? a : b
}

/**
 * Gỡ:
 * - UUID seed trùng template catalog
 * - catalog:ss:*:v02… clone cũ (1670 expand)
 * - extra-* pad
 * Giữ 1 bản / template (ưu tiên catalog id gốc).
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
    if (group.length < 2) {
      // Vẫn xóa clone id :v0N nếu là bản đơn lẻ spoof? keep
      continue
    }
    let preferred = group[0]!
    for (let i = 1; i < group.length; i++) {
      preferred = preferStructure(preferred, group[i]!)
    }
    for (const g of group) {
      if (g.id === preferred.id) continue
      await db.sentenceStructures.delete(g.id)
      deleted += 1
    }
  }

  // Dọn catalog variant còn sót (id :v02) dù không cùng group (template khác do lỗi encoding)
  const leftover = await db.sentenceStructures.toArray()
  const liveCatalogIds = new Set(CATALOG_SENTENCE_STRUCTURES.map(s => s.id))
  for (const row of leftover) {
    if (!isCatalogId(row.id)) continue
    const isVariant = /:v\d+$/i.test(row.id) || /:extra-/i.test(row.id) || /extra-\d+$/i.test(row.id)
    if (isVariant && !liveCatalogIds.has(row.id)) {
      await db.sentenceStructures.delete(row.id)
      deleted += 1
    }
  }

  return deleted
}

async function upsertCatalogStructures(): Promise<void> {
  const ts = now()
  const liveIds = new Set(CATALOG_SENTENCE_STRUCTURES.map(s => s.id))

  for (const item of CATALOG_SENTENCE_STRUCTURES) {
    const existing = await db.sentenceStructures.get(item.id)
    const record: SentenceStructure = {
      ...item,
      title: baseStructureTitle(item.title),
      createdAt: existing?.createdAt ?? ts,
      updatedAt: ts,
      starred: existing?.starred ?? item.starred,
    }
    await db.sentenceStructures.put(record)
  }

  // Xóa catalog id không còn trong ship list (clone 1670 cũ)
  const all = await db.sentenceStructures.toArray()
  for (const row of all) {
    if (!isCatalogId(row.id)) continue
    if (!liveIds.has(row.id)) {
      await db.sentenceStructures.delete(row.id)
    }
  }

  await dedupeLegacySentenceStructures()
}

/**
 * Đồng bộ nội dung global từ catalog (ship cùng deploy).
 * Gọi 1 lần khi vào /app — khi GLOBAL_CATALOG_VERSION tăng, upsert lại data catalog.
 */
export async function syncGlobalCatalog(): Promise<GlobalCatalogSyncResult> {
  const fromVersion = (await settingsRepo.getSetting(CATALOG_SETTING_KEY) as number | undefined) ?? 0

  // Luôn dedupe (kể cả version đã đủ) — gỡ clone · 02 còn trong Dexie
  const deletedAlways = await dedupeLegacySentenceStructures()

  if (fromVersion >= GLOBAL_CATALOG_VERSION) {
    const catalogIds = CATALOG_SENTENCE_STRUCTURES.map(s => s.id)
    const existing = await db.sentenceStructures.bulkGet(catalogIds)
    const missing = existing.some(row => !row)
    // Còn orphan catalog:ss:…:v0N?
    const all = await db.sentenceStructures.toArray()
    const liveIds = new Set(catalogIds)
    const orphans = all.filter(r => isCatalogId(r.id) && !liveIds.has(r.id))
    if (!missing && orphans.length === 0) {
      return {
        updated: deletedAlways > 0,
        fromVersion,
        toVersion: fromVersion,
        modules: deletedAlways > 0 ? ['sentenceStructures'] : [],
        deletedDuplicates: deletedAlways,
      }
    }
    await upsertCatalogStructures()
    const deleted = await dedupeLegacySentenceStructures()
    return {
      updated: true,
      fromVersion,
      toVersion: GLOBAL_CATALOG_VERSION,
      modules: ['sentenceStructures'],
      deletedDuplicates: deletedAlways + deleted,
    }
  }

  await upsertCatalogStructures()
  const deleted = await dedupeLegacySentenceStructures()
  await settingsRepo.putSetting(CATALOG_SETTING_KEY, GLOBAL_CATALOG_VERSION)

  return {
    updated: true,
    fromVersion,
    toVersion: GLOBAL_CATALOG_VERSION,
    modules: ['sentenceStructures'],
    deletedDuplicates: deletedAlways + deleted,
  }
}
