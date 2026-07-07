import { db, settingsRepo } from '@ryan/db'
import type {
  Card,
  Deck,
  Group,
  Lesson,
  MindMap,
  SentenceStructure,
  TranslationSet,
  WritingDoc,
} from '@ryan/db'
import { supabase } from '../../lib/supabase'
import { ADMIN_PUBLISH_VERSION_KEY } from './adminContentPublish'

export interface AdminContentSyncResult {
  updated: boolean
  fromVersion: number
  toVersion: number
  modules: string[]
}

interface VocabPayload {
  groups?: Group[]
  decks?: Deck[]
  cards?: Card[]
}

async function mergeVocab(payload: VocabPayload): Promise<void> {
  if (payload.groups?.length) {
    await db.groups.bulkPut(payload.groups)
  }
  if (payload.decks?.length) {
    await db.decks.bulkPut(
      payload.decks.map(d => ({ ...d, origin: 'preset' as const })),
    )
  }
  if (payload.cards?.length) {
    await db.cards.bulkPut(payload.cards)
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
      await mergeVocab(payload as VocabPayload)
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