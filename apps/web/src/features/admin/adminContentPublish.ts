import { db } from '@ryan/db'
import { supabase } from '../../lib/supabase'
import { PRESET_GROUP_IDS } from '../vocab/vocabSeedDecks'
import { normalizeVocabPublishPayload } from '../vocab/vocabPublishNormalize'
import {
  listPublishableLocalExams,
  publishAllLocalExamsToCloud,
  type BatchPublishResult,
} from './publishLocalExamsBatch'
import { getCustomDictionary } from '../dictionary/customDictionary'

export const ADMIN_PUBLISH_VERSION_KEY = 'admin_publish_version'

export type AdminPublishModuleId =
  | 'vocab'
  | 'lessons'
  | 'translation'
  | 'sentence_structures'
  | 'writing_prompts'
  | 'mindmaps'
  | 'dictionary'
  | 'reading_exams'
  | 'listening_exams'

export interface AdminModuleCounts {
  vocab: { groups: number; decks: number; cards: number }
  lessons: number
  translation: number
  sentence_structures: number
  writing_prompts: number
  mindmaps: number
  dictionary: number
  reading_exams: number
  listening_exams: number
}

export interface AdminPublishProgress {
  phase: 'module' | 'exam'
  module: AdminPublishModuleId
  current: number
  total: number
  label: string
}

export interface AdminPublishResult {
  version: number
  modules: AdminPublishModuleId[]
  moduleCounts: AdminModuleCounts
  exams: BatchPublishResult
  errors: string[]
}

const MODULE_ORDER: AdminPublishModuleId[] = [
  'vocab',
  'lessons',
  'translation',
  'sentence_structures',
  'writing_prompts',
  'mindmaps',
  'dictionary',
  'reading_exams',
  'listening_exams',
]

const PRESET_GROUP_SET = new Set<string>(PRESET_GROUP_IDS)

/**
 * Thu thập vocab preset + **chuẩn hoá id ổn định** (deck + card).
 * Payload publish luôn idempotent → client bulkPut không double khi re-publish.
 */
async function collectVocab() {
  // Mọi deck trong group hệ thống (kể cả origin lệch) — normalize sẽ gộp theo slug
  const presetDecks = await db.decks
    .filter(d => PRESET_GROUP_SET.has(d.groupId) || d.origin === 'preset')
    .toArray()
  const deckIds = new Set(presetDecks.map(d => d.id))
  const groups = await db.groups.filter(g => PRESET_GROUP_SET.has(g.id)).toArray()
  const cards = deckIds.size
    ? await db.cards.filter(c => deckIds.has(c.deckId)).toArray()
    : []
  return normalizeVocabPublishPayload({ groups, decks: presetDecks, cards })
}

async function collectLessons() {
  return db.lessons.filter(l => l.category === 'cambridge').toArray()
}

async function collectTranslation() {
  const all = await db.translationSets.toArray()
  return all.filter(s => s.category !== 'user')
}

async function collectSentenceStructures() {
  return db.sentenceStructures.toArray()
}

async function collectWritingPrompts() {
  const all = await db.writingDocs.toArray()
  return all.filter(d => !d.text.trim())
}

async function collectMindmaps() {
  return db.mindmaps.toArray()
}

export async function countAdminPublishableContent(): Promise<AdminModuleCounts> {
  const [vocab, lessons, translation, structures, writing, mindmaps, dictionary, exams] = await Promise.all([
    collectVocab(),
    collectLessons(),
    collectTranslation(),
    collectSentenceStructures(),
    collectWritingPrompts(),
    collectMindmaps(),
    getCustomDictionary(),
    listPublishableLocalExams(),
  ])
  return {
    vocab: {
      groups: vocab.groups.length,
      decks: vocab.decks.length,
      cards: vocab.cards.length,
    },
    lessons: lessons.length,
    translation: translation.length,
    sentence_structures: structures.length,
    writing_prompts: writing.length,
    mindmaps: mindmaps.length,
    dictionary: dictionary.length,
    reading_exams: exams.reading.length,
    listening_exams: exams.listening.length,
  }
}

function moduleItemCount(module: AdminPublishModuleId, counts: AdminModuleCounts): number {
  switch (module) {
    case 'vocab':
      return counts.vocab.groups + counts.vocab.decks + counts.vocab.cards
    case 'lessons':
      return counts.lessons
    case 'translation':
      return counts.translation
    case 'sentence_structures':
      return counts.sentence_structures
    case 'writing_prompts':
      return counts.writing_prompts
    case 'mindmaps':
      return counts.mindmaps
    case 'dictionary':
      return counts.dictionary
    case 'reading_exams':
      return counts.reading_exams
    case 'listening_exams':
      return counts.listening_exams
    default:
      return 0
  }
}

async function publishModule(
  module: AdminPublishModuleId,
  payload: unknown,
  itemCount: number,
  userId: string | undefined,
  options?: { skipUnchanged?: boolean },
): Promise<boolean> {
  if (options?.skipUnchanged) {
    const { data: existing, error: readError } = await supabase
      .from('admin_published_modules')
      .select('payload, item_count')
      .eq('module', module)
      .maybeSingle()
    if (readError) throw new Error(`${module}: ${readError.message}`)
    if (
      existing
      && existing.item_count === itemCount
      && JSON.stringify(existing.payload) === JSON.stringify(payload)
    ) {
      return false
    }
  }

  const { error } = await supabase
    .from('admin_published_modules')
    .upsert({
      module,
      payload: payload as Record<string, unknown>,
      item_count: itemCount,
      published_by: userId ?? null,
      updated_at: new Date().toISOString(),
    })
  if (error) throw new Error(`${module}: ${error.message}`)
  return true
}

export async function publishAllAdminContent(
  onProgress?: (progress: AdminPublishProgress) => void,
  options?: { forceAll?: boolean; examsOnly?: boolean },
): Promise<AdminPublishResult> {
  const counts = await countAdminPublishableContent()
  const totalSteps = options?.examsOnly ? 1 : MODULE_ORDER.length
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  const errors: string[] = []
  const publishedModules: AdminPublishModuleId[] = []

  let step = 0
  for (const module of options?.examsOnly ? [] : MODULE_ORDER) {
    if (module === 'reading_exams' || module === 'listening_exams') continue

    step += 1
    onProgress?.({
      phase: 'module',
      module,
      current: step,
      total: totalSteps,
      label: module,
    })

    try {
      let payload: unknown
      let itemCount = moduleItemCount(module, counts)

      switch (module) {
        case 'vocab':
          payload = await collectVocab()
          break
        case 'lessons':
          payload = await collectLessons()
          break
        case 'translation':
          payload = await collectTranslation()
          break
        case 'sentence_structures':
          payload = await collectSentenceStructures()
          break
        case 'writing_prompts':
          payload = await collectWritingPrompts()
          break
        case 'mindmaps':
          payload = await collectMindmaps()
          break
        case 'dictionary':
          payload = await getCustomDictionary()
          break
        default:
          payload = []
      }

      const didPublish = await publishModule(module, payload, itemCount, userId, {
        skipUnchanged: options?.forceAll !== true,
      })
      if (didPublish) publishedModules.push(module)
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `${module}: publish thất bại`)
    }
  }

  step += 1
  onProgress?.({
    phase: 'exam',
    module: 'reading_exams',
    current: step,
    total: totalSteps,
    label: 'Đề Reading + Listening',
  })

  let exams: BatchPublishResult = {
    reading: { published: 0, skipped: 0, failed: 0 },
    listening: { published: 0, skipped: 0, failed: 0 },
    errors: [],
  }

  try {
    exams = await publishAllLocalExamsToCloud(p => {
      onProgress?.({
        phase: 'exam',
        module: p.skill === 'reading' ? 'reading_exams' : 'listening_exams',
        current: step,
        total: totalSteps,
        label: p.title,
      })
    }, { forceAll: options?.forceAll })
    if (exams.reading.published > 0) publishedModules.push('reading_exams')
    if (exams.listening.published > 0) publishedModules.push('listening_exams')
    for (const e of exams.errors) {
      errors.push(`[${e.skill}] ${e.title}: ${e.message}`)
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Publish đề thi thất bại')
  }

  const { data: metaRow } = await supabase
    .from('admin_publish_meta')
    .select('version')
    .eq('id', 'global')
    .maybeSingle()

  const nextVersion = ((metaRow?.version as number | undefined) ?? 0) + 1
  const { error: metaErr } = await supabase
    .from('admin_publish_meta')
    .upsert({
      id: 'global',
      version: nextVersion,
      modules: publishedModules,
      published_by: userId ?? null,
      published_at: new Date().toISOString(),
    })
  if (metaErr) throw new Error(metaErr.message)

  await db.settings.put({ key: ADMIN_PUBLISH_VERSION_KEY, value: nextVersion })

  return {
    version: nextVersion,
    modules: publishedModules,
    moduleCounts: counts,
    exams,
    errors,
  }
}
