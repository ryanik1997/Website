import { db, type Lesson } from '@ryan/db'
import { defaultSentence, type LessonSentence } from './types'

import { resolvePlayableMediaUrl } from '../../lib/protectedMedia'

const SEED_KEY = 'listening_seed_tid_dictation_v1'
/** Patches Vietnamese translations into already-seeded TID lessons (preserves SRS). */
const VI_PATCH_KEY = 'listening_seed_tid_vi_v1'
/** Mode A: path under private bucket exam-media (or public/data in local DEV). */
const SEED_PATH = '/data/tid-dictation-lessons.json'

interface SeedSentence {
  pos: number
  text: string
  vi?: string
  audioUrl?: string
  t0?: number
  t1?: number
}

interface SeedLesson {
  id: string
  tidLessonId: string
  title: string
  book: string
  bookNum: number
  test: number
  part: number
  fullAudioUrl?: string | null
  localDir?: string
  sentences: SeedSentence[]
}

interface SeedPayload {
  version: number
  lessonCount: number
  sentenceCount: number
  viPresent?: boolean
  viFilled?: number
  lessons: SeedLesson[]
}

function toSentences(lesson: SeedLesson): LessonSentence[] {
  return lesson.sentences.map(s =>
    defaultSentence(s.text, {
      id: `${lesson.id}-s-${s.pos}`,
      audioUrl: s.audioUrl,
      t0: typeof s.t0 === 'number' ? s.t0 : undefined,
      t1: typeof s.t1 === 'number' ? s.t1 : undefined,
      vi: s.vi?.trim() || undefined,
    }),
  )
}

async function fetchSeedPayload(): Promise<SeedPayload | null> {
  try {
    const url = await resolvePlayableMediaUrl(SEED_PATH)
    if (!url) throw new Error('No seed URL')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json() as SeedPayload
  } catch (err) {
    console.warn('[listening] TID dictation seed fetch failed:', err)
    return null
  }
}

/**
 * Seed TID dictation packs into IndexedDB for /app/listening.
 * - Stable lesson ids: tid-d-{lesson_id}
 * - Replaces demo Cambridge packs with the same book/test/part
 * - Idempotent via settings key; existing tid lessons keep SRS state
 */
export async function seedTidDictation(): Promise<{ created: number; skipped: number }> {
  const flag = await db.settings.get(SEED_KEY)
  if (flag?.value) {
    // Still try to patch VI if available
    await patchTidDictationVietnamese()
    return { created: 0, skipped: 0 }
  }

  const payload = await fetchSeedPayload()
  if (!payload?.lessons?.length) {
    await db.settings.put({ key: SEED_KEY, value: true })
    return { created: 0, skipped: 0 }
  }

  const existing = await db.lessons.toArray()
  const byId = new Map(existing.map(l => [l.id, l]))
  const bySlot = new Map<string, Lesson>()
  for (const l of existing) {
    if (l.category !== 'cambridge') continue
    if (l.book == null || l.test == null || l.part == null) continue
    bySlot.set(`${l.book}::${l.test}::${l.part}`, l)
  }

  let created = 0
  let skipped = 0
  const now = Date.now()

  // Bulk write in chunks to avoid blocking UI too long
  const chunkSize = 25
  for (let i = 0; i < payload.lessons.length; i += chunkSize) {
    const chunk = payload.lessons.slice(i, i + chunkSize)
    await db.transaction('rw', db.lessons, async () => {
      for (const pack of chunk) {
        if (byId.has(pack.id)) {
          skipped += 1
          continue
        }

        const slotKey = `${pack.book}::${pack.test}::${pack.part}`
        const collision = bySlot.get(slotKey)
        if (collision && collision.id !== pack.id && collision.topic !== 'tid-dictation') {
          // Drop demo / weaker pack occupying the same Cambridge slot
          await db.lessons.delete(collision.id)
          bySlot.delete(slotKey)
          byId.delete(collision.id)
        }

        const sentences = toSentences(pack)
        if (!sentences.length) {
          skipped += 1
          continue
        }

        const lesson: Lesson = {
          id: pack.id,
          category: 'cambridge',
          title: pack.title,
          book: pack.book,
          bookNum: pack.bookNum,
          test: pack.test,
          part: pack.part,
          topic: 'tid-dictation',
          source: 'import',
          linkedAudioUrl: pack.fullAudioUrl || undefined,
          sentences,
          createdAt: now + i,
        }
        await db.lessons.put(lesson)
        byId.set(pack.id, lesson)
        bySlot.set(slotKey, lesson)
        created += 1
      }
    })
    // Yield to main thread between chunks
    await new Promise(r => setTimeout(r, 0))
  }

  await db.settings.put({ key: SEED_KEY, value: true })
  // If seed already has VI, record watermark so patch can skip or only extend later
  if (payload.viPresent || (payload.viFilled ?? 0) > 0) {
    await db.settings.put({ key: VI_PATCH_KEY, value: payload.viFilled ?? 1 })
  }
  console.info(`[listening] TID dictation seeded: created=${created} skipped=${skipped} total=${payload.lessonCount}`)
  return { created, skipped }
}

/**
 * Merge Vietnamese (`vi`) into existing TID lessons without resetting SRS progress.
 * Re-runs when seed gains more translations (tracks `viFilled` watermark).
 */
export async function patchTidDictationVietnamese(): Promise<{ patched: number; skipped: number }> {
  const payload = await fetchSeedPayload()
  if (!payload?.lessons?.length) return { patched: 0, skipped: 0 }

  const viFilled = typeof payload.viFilled === 'number'
    ? payload.viFilled
    : payload.lessons.reduce(
      (n, l) => n + (l.sentences || []).filter(s => s.vi?.trim()).length,
      0,
    )

  // Wait until seed JSON actually has translations
  if (viFilled <= 0 && !payload.viPresent) {
    return { patched: 0, skipped: 0 }
  }

  const flag = await db.settings.get(VI_PATCH_KEY)
  const lastFilled = typeof flag?.value === 'number' ? flag.value : (flag?.value ? Number.MAX_SAFE_INTEGER : 0)
  // Already applied this (or a fuller) translation snapshot
  if (lastFilled >= viFilled && lastFilled > 0) {
    return { patched: 0, skipped: 0 }
  }

  const bySeedId = new Map(payload.lessons.map(l => [l.id, l]))
  let patched = 0
  let skipped = 0

  const existing = await db.lessons
    .filter(l => l.id.startsWith('tid-d-') || l.topic === 'tid-dictation')
    .toArray()

  const chunkSize = 20
  for (let i = 0; i < existing.length; i += chunkSize) {
    const chunk = existing.slice(i, i + chunkSize)
    await db.transaction('rw', db.lessons, async () => {
      for (const lesson of chunk) {
        const pack = bySeedId.get(lesson.id)
        if (!pack) {
          skipped += 1
          continue
        }
        const viByPos = new Map<number, string>()
        const viByText = new Map<string, string>()
        for (const s of pack.sentences || []) {
          const vi = s.vi?.trim()
          if (!vi) continue
          viByPos.set(s.pos, vi)
          viByText.set(s.text.trim(), vi)
        }
        if (!viByPos.size && !viByText.size) {
          skipped += 1
          continue
        }

        let changed = false
        const sentences = (lesson.sentences as LessonSentence[]).map((s, idx) => {
          // Prefer stable id suffix -s-{pos}
          const m = typeof s.id === 'string' ? /-s-(\d+)$/.exec(s.id) : null
          const pos = m ? Number(m[1]) : idx + 1
          const vi = viByPos.get(pos) || viByText.get(s.text.trim())
          if (!vi || s.vi === vi) return s
          changed = true
          return { ...s, vi }
        })

        if (!changed) {
          skipped += 1
          continue
        }
        await db.lessons.update(lesson.id, { sentences })
        patched += 1
      }
    })
    await new Promise(r => setTimeout(r, 0))
  }

  await db.settings.put({ key: VI_PATCH_KEY, value: viFilled })
  console.info(`[listening] TID VI patched: patched=${patched} skipped=${skipped} viFilled=${viFilled}`)
  return { patched, skipped }
}

/** Force re-seed (dev): clears flag and re-imports missing ids only. */
export async function resetTidDictationSeedFlag(): Promise<void> {
  await db.settings.delete(SEED_KEY)
  await db.settings.delete(VI_PATCH_KEY)
}
