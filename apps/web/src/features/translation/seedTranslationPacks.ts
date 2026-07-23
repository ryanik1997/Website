/**
 * Seed / upsert gói Luyện dịch IELTS.
 * - grammar_basic: 8 × 25
 * - collocation / paragraph_65 / essay_full: 15 × 25
 * - paragraph_80: 10 × 25
 * - + pack JSON import (không đè genre đã seed)
 */
import { db, type TranslationSet } from '@ryan/db'
import { translationSetsFromIeltsPack } from './importIeltsTranslationPack'
import packsJson from './seedData/ieltsTranslationPacks.json'
import { buildGrammarBasic25Sets } from './seedData/grammarBasic25'
import { buildCollocation25Sets } from './seedData/collocation25'
import { buildParagraph65_25Sets } from './seedData/paragraph65_25'
import { buildParagraph80_25Sets } from './seedData/paragraph80_25'
import { buildEssayFull25Sets } from './seedData/essayFull25'

const SETTING_KEY = 'translation_seed_pack_version'
/** Bump khi thêm/sửa seed */
export const TRANSLATION_SEED_PACK_VERSION = 6

const SEEDED_CATEGORIES = [
  'grammar_basic',
  'collocation',
  'paragraph_65',
  'paragraph_80',
  'essay_full',
] as const

function collectSeedSets(): TranslationSet[] {
  const createdAt = Date.now()
  const out: TranslationSet[] = [
    ...buildGrammarBasic25Sets(createdAt),
    ...buildCollocation25Sets(createdAt),
    ...buildParagraph65_25Sets(createdAt),
    ...buildParagraph80_25Sets(createdAt),
    ...buildEssayFull25Sets(createdAt),
  ]

  // JSON import — bỏ set trùng genre đã có seed 25 câu
  const covered = new Set(
    out
      .filter(s => (SEEDED_CATEGORIES as readonly string[]).includes(s.category))
      .map(s => `${s.category}:${s.genre}`),
  )
  const packs = packsJson as unknown[]
  for (const pack of packs) {
    for (const set of translationSetsFromIeltsPack(pack, { createdAt })) {
      if (set.genre && covered.has(`${set.category}:${set.genre}`)) continue
      out.push(set)
    }
  }
  return out
}

function mergeSentences(
  seed: TranslationSet,
  existing: TranslationSet,
): TranslationSet {
  const prevById = new Map(existing.sentences.map(s => [s.id, s]))
  return {
    ...seed,
    sentences: seed.sentences.map(s => {
      const prev = prevById.get(s.id)
      return prev?.srsState ? { ...s, srsState: prev.srsState } : s
    }),
    createdAt: existing.createdAt,
  }
}

/**
 * Upsert bộ seed.
 * force / version tăng / seed nhiều câu hơn local → merge (giữ SRS theo id câu).
 */
export async function seedTranslationPacks(opts?: { force?: boolean }): Promise<{
  inserted: number
  updated: number
  skipped: number
  total: number
}> {
  const seedSets = collectSeedSets()
  const localVersion =
    ((await db.settings.get(SETTING_KEY))?.value as number | undefined) ?? 0
  const force = Boolean(opts?.force) || localVersion < TRANSLATION_SEED_PACK_VERSION

  let inserted = 0
  let updated = 0
  let skipped = 0

  for (const set of seedSets) {
    const existing = await db.translationSets.get(set.id)
    if (!existing) {
      await db.translationSets.put(set)
      inserted++
      continue
    }

    const shouldUpdate =
      force
      || existing.sentences.length < set.sentences.length
      || existing.title !== set.title
      || existing.genre !== set.genre

    if (!shouldUpdate) {
      skipped++
      continue
    }

    await db.translationSets.put(mergeSentences(set, existing))
    updated++
  }

  // Gỡ set cũ (import/sample) nếu đã có seed ổn định
  const stablePrefix: Record<string, string> = {
    grammar_basic: 'tr-grammar-',
    collocation: 'tr-collocation-',
    paragraph_65: 'tr-p65-',
    paragraph_80: 'tr-p80-',
    essay_full: 'tr-essay-',
  }
  for (const category of Object.keys(stablePrefix)) {
    const all = await db.translationSets.where('category').equals(category).toArray()
    const prefix = stablePrefix[category]!
    const hasStable = new Set(all.filter(s => s.id.startsWith(prefix)).map(s => s.genre))
    for (const s of all) {
      if (s.id.startsWith(prefix)) continue
      if (s.genre && hasStable.has(s.genre)) {
        await db.translationSets.delete(s.id)
      }
    }
  }

  await db.settings.put({ key: SETTING_KEY, value: TRANSLATION_SEED_PACK_VERSION })
  return { inserted, updated, skipped, total: seedSets.length }
}

/** Seed mẫu cũ (không đè grammar/collocation 25) + seed packs. */
export async function ensureTranslationSeedData(): Promise<void> {
  const { getSampleTranslationSets } = await import('./sampleSets')
  const samples = getSampleTranslationSets()
  const count = await db.translationSets.count()
  if (count === 0) {
    for (const pack of samples) {
      if (pack.category === 'grammar_basic' || pack.category === 'collocation') continue
      const id = `tr-sample-${pack.category}-${(pack.genre ?? 'other').toString()}`
      await db.translationSets.put({
        id,
        title: pack.title,
        category: pack.category,
        genre: pack.genre,
        cefr: pack.cefr,
        sentences: pack.sentences,
        createdAt: Date.now(),
      })
    }
  }
  await seedTranslationPacks()
}
