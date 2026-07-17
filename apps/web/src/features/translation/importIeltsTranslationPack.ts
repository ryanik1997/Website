/**
 * Parse gói `ielts_translation_pack` (Writing Master / Json Import)
 * → TranslationSet[] cho Dexie.
 */
import type { CefrLevel, TranslationCategory, TranslationGenre, TranslationSet } from '@ryan/db'

export interface IeltsTranslationPackSentence {
  id?: string
  vi?: string
  reference_en?: string
  en?: string
  english?: string
  reference?: string
  answer_en?: string
  hints?: string[] | string
  tags?: string[]
  difficulty?: string
  level?: string
}

export interface IeltsTranslationPackItem {
  id?: string
  title?: string
  level?: string
  description?: string
  direction?: string
  sentences?: IeltsTranslationPackSentence[]
  paragraphs?: IeltsTranslationPackSentence[]
  essays?: IeltsTranslationPackSentence[]
  tags?: string[]
}

export interface IeltsTranslationPackStep {
  id?: string
  step_no?: number
  title?: string
  badge?: string
  items?: IeltsTranslationPackItem[]
}

export interface IeltsTranslationPack {
  type?: string
  version?: string
  id?: string
  title?: string
  description?: string
  steps?: IeltsTranslationPackStep[]
  /** Một số file bọc `{ pack: {...} }` */
  pack?: IeltsTranslationPack
}

const now = () => Date.now()

function defaultSrs() {
  return { ease: 2.5, interval: 0, dueAt: now(), reps: 0 }
}

function asText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function sentenceEn(raw: IeltsTranslationPackSentence): string {
  return (
    asText(raw.reference_en)
    || asText(raw.en)
    || asText(raw.english)
    || asText(raw.reference)
    || asText(raw.answer_en)
  )
}

function sentenceHint(raw: IeltsTranslationPackSentence): string | undefined {
  if (Array.isArray(raw.hints)) {
    const joined = raw.hints.map(h => asText(h)).filter(Boolean).join(', ')
    return joined || undefined
  }
  const h = asText(raw.hints)
  return h || undefined
}

function mapDifficulty(
  raw: IeltsTranslationPackSentence,
  itemLevel?: string,
): 'easy' | 'medium' | 'hard' {
  const blob = `${asText(raw.difficulty)} ${asText(raw.level)} ${asText(itemLevel)}`.toLowerCase()
  if (/\bhard\b|khó|c1|c2|band\s*8/.test(blob)) return 'hard'
  if (/\beasy\b|dễ|a1|a2|basic/.test(blob)) return 'easy'
  return 'medium'
}

function mapCategory(step: IeltsTranslationPackStep): TranslationCategory {
  const blob = `${asText(step.id)} ${asText(step.title)} ${asText(step.badge)}`.toLowerCase()
  if (/collocation|vocab|từ vựng/.test(blob)) return 'collocation'
  if (/6\.5|band\s*6|paragraph_65|đoạn.*6/.test(blob)) return 'paragraph_65'
  if (/8\.0|band\s*8|paragraph_80|đoạn.*8/.test(blob)) return 'paragraph_80'
  if (/essay|bài\s*luận/.test(blob)) return 'essay_full'
  if (/task\s*1|biểu đồ|chart/.test(blob)) return 'ielts_task1'
  if (/task\s*2/.test(blob)) return 'ielts_task2'
  // step 1 / basic sentence / grammar
  return 'grammar_basic'
}

function mapGenre(
  category: TranslationCategory,
  item: IeltsTranslationPackItem,
  title: string,
): TranslationGenre {
  const blob = `${asText(item.id)} ${title} ${asText(item.description)} ${(item.tags ?? []).join(' ')}`.toLowerCase()

  if (category === 'grammar_basic') {
    if (/perfect\s*continuous|hoàn thành tiếp diễn/.test(blob)) return 'present_perfect_continuous'
    if (/present\s*continuous|hiện tại tiếp diễn|tiếp diễn/.test(blob)) return 'present_continuous'
    if (/present\s*perfect|hiện tại hoàn thành|hoàn thành/.test(blob)) return 'present_perfect'
    if (/simple\s*present|present\s*simple|hiện tại đơn/.test(blob)) return 'present_simple'
    if (/uncountable|không đếm/.test(blob)) return 'uncountable_nouns'
    if (/plural|singular|số ít|số nhiều/.test(blob)) return 'singular_plural'
    if (/passive|bị động/.test(blob)) return 'passive_voice'
    if (/compar|so sánh/.test(blob)) return 'comparison_struct'
    return 'other'
  }

  if (/education|giáo dục/.test(blob)) return 'topic_education'
  if (/environment|môi trường/.test(blob)) return 'topic_environment'
  if (/technology|công nghệ/.test(blob)) return 'topic_technology'
  if (/health|sức khỏe/.test(blob)) return 'topic_health'
  if (/work|career|công việc/.test(blob)) return 'topic_work'
  if (/travel|du lịch/.test(blob)) return 'topic_travel'
  if (/food|thực phẩm/.test(blob)) return 'topic_food'
  if (/hobb|sở thích/.test(blob)) return 'topic_hobbies'
  if (/family|gia đình/.test(blob)) return 'topic_family'
  if (/social\s*media|mạng xã hội/.test(blob)) return 'topic_social_media'
  if (/shop|mua sắm/.test(blob)) return 'topic_shopping'
  if (/city|urban|đô thị/.test(blob)) return 'topic_city_life'
  if (/transport|giao thông/.test(blob)) return 'topic_transport'
  if (/culture|văn hóa/.test(blob)) return 'topic_culture'
  if (/crime|tội phạm/.test(blob)) return 'topic_crime'

  return 'other'
}

function mapCefr(level?: string): CefrLevel | undefined {
  const l = asText(level).toUpperCase()
  if (l.includes('C2')) return 'C2'
  if (l.includes('C1')) return 'C1'
  if (l.includes('B2') || /BAND\s*8|8\.0/.test(l)) return 'B2'
  if (l.includes('B1') || /BAND\s*6|6\.5/.test(l)) return 'B1'
  if (l.includes('A2') || l.includes('BASIC')) return 'A2'
  return undefined
}

function unitsFromItem(item: IeltsTranslationPackItem): IeltsTranslationPackSentence[] {
  if (Array.isArray(item.sentences) && item.sentences.length) return item.sentences
  if (Array.isArray(item.paragraphs) && item.paragraphs.length) return item.paragraphs
  if (Array.isArray(item.essays) && item.essays.length) return item.essays
  return []
}

function stableSetId(packId: string, stepId: string, itemId: string): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'x'
  return `tr-import-${slug(packId)}-${slug(stepId)}-${slug(itemId)}`
}

function stableSentenceId(setId: string, rawId: string | undefined, index: number): string {
  if (rawId?.trim()) return `${setId}__${rawId.trim()}`
  return `${setId}__s${index + 1}`
}

/** Unwrap pack root. */
export function normalizeIeltsTranslationPack(raw: unknown): IeltsTranslationPack | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as IeltsTranslationPack
  const pack = obj.pack && typeof obj.pack === 'object' ? obj.pack : obj
  if (pack.type && pack.type !== 'ielts_translation_pack') {
    // vẫn cho phép nếu có steps
    if (!Array.isArray(pack.steps)) return null
  }
  if (!Array.isArray(pack.steps) || !pack.steps.length) return null
  return pack
}

/**
 * Convert 1 pack JSON → danh sách TranslationSet (mỗi item = 1 bộ).
 */
export function translationSetsFromIeltsPack(
  raw: unknown,
  opts?: { createdAt?: number },
): TranslationSet[] {
  const pack = normalizeIeltsTranslationPack(raw)
  if (!pack) return []

  const packId = asText(pack.id) || 'pack'
  const createdAt = opts?.createdAt ?? now()
  const sets: TranslationSet[] = []

  for (const step of pack.steps ?? []) {
    const stepId = asText(step.id) || `step-${step.step_no ?? sets.length + 1}`
    const category = mapCategory(step)
    for (const item of step.items ?? []) {
      const units = unitsFromItem(item)
      if (!units.length) continue

      const itemId = asText(item.id) || asText(item.title) || `item-${sets.length + 1}`
      const title = asText(item.title) || asText(pack.title) || 'Bộ dịch'
      const setId = stableSetId(packId, stepId, itemId)
      const genre = mapGenre(category, item, title)

      const sentences = units
        .map((u, index) => {
          const vi = asText(u.vi)
          const en = sentenceEn(u)
          if (!vi || !en) return null
          return {
            id: stableSentenceId(setId, u.id, index),
            vi,
            en,
            hint: sentenceHint(u),
            difficulty: mapDifficulty(u, item.level),
            srsState: defaultSrs(),
          }
        })
        .filter((s): s is NonNullable<typeof s> => Boolean(s))

      if (!sentences.length) continue

      sets.push({
        id: setId,
        title,
        category,
        genre,
        cefr: mapCefr(item.level),
        sentences,
        createdAt,
      })
    }
  }

  return sets
}
