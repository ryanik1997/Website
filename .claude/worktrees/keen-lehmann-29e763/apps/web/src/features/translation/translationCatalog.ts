import type { TranslationSet } from '@ryan/db'

export type TranslationTrackSlug =
  | 'grammar_basic'
  | 'collocation'
  | 'paragraph_65'
  | 'paragraph_80'
  | 'essay_full'
  | 'mine'

export type TranslationGenre =
  // Cấu trúc cơ bản
  | 'present_simple' | 'present_continuous' | 'present_perfect' | 'present_perfect_continuous'
  | 'uncountable_nouns' | 'singular_plural' | 'passive_voice' | 'comparison_struct'
  // Chủ đề chung
  | 'topic_education' | 'topic_environment' | 'topic_technology' | 'topic_health'
  | 'topic_work' | 'topic_travel' | 'topic_food' | 'topic_hobbies' | 'topic_family'
  | 'topic_social_media' | 'topic_shopping' | 'topic_city_life' | 'topic_transport'
  | 'topic_culture' | 'topic_crime'
  | 'custom' | 'other'

export interface TranslationTrack {
  slug: TranslationTrackSlug
  category: TranslationSet['category']
  badge: string
  label: string
  desc: string
  color: string
  /** Band 8.0 / Essay — hiện tên chủ đề tiếng Anh trên thẻ */
  englishGenreLabels?: boolean
}

export interface TranslationGenreDef {
  id: TranslationGenre
  label: string
  labelVi: string
  desc: string
  icon: string
}

export const TRANSLATION_TRACKS: TranslationTrack[] = [
  {
    slug: 'grammar_basic',
    category: 'grammar_basic',
    badge: 'Grammar',
    label: 'Cấu trúc cơ bản',
    desc: 'Hiện tại đơn, tiếp diễn, hoàn thành, bị động, so sánh…',
    color: '#6366f1',
  },
  {
    slug: 'collocation',
    category: 'collocation',
    badge: 'Collocation',
    label: 'Collocations & Vocab',
    desc: 'Cụm từ và từ vựng theo chủ đề IELTS Writing',
    color: '#8b5cf6',
  },
  {
    slug: 'paragraph_65',
    category: 'paragraph_65',
    badge: 'Band 6.5',
    label: 'Dịch đoạn văn Band 6.5',
    desc: 'Luyện dịch đoạn văn mức band 6.5 theo từng chủ đề',
    color: '#0ea5e9',
  },
  {
    slug: 'paragraph_80',
    category: 'paragraph_80',
    badge: 'Band 8.0',
    label: 'Dịch đoạn văn Band 8.0',
    desc: 'Đoạn văn band 8.0 — Education, Environment, Technology…',
    color: '#10b981',
    englishGenreLabels: true,
  },
  {
    slug: 'essay_full',
    category: 'essay_full',
    badge: 'Essay',
    label: 'Dịch Essay hoàn chỉnh',
    desc: 'Bài essay đầy đủ theo chủ đề — band cao',
    color: '#f59e0b',
    englishGenreLabels: true,
  },
  {
    slug: 'mine',
    category: 'user',
    badge: 'Của tôi',
    label: 'Bộ câu của tôi',
    desc: 'Tự tạo và quản lý bộ câu riêng',
    color: '#ec4899',
  },
]

const GRAMMAR_GENRES: TranslationGenre[] = [
  'present_simple', 'present_continuous', 'present_perfect', 'present_perfect_continuous',
  'uncountable_nouns', 'singular_plural', 'passive_voice', 'comparison_struct',
]

const TOPIC_GENRES_15: TranslationGenre[] = [
  'topic_education', 'topic_environment', 'topic_technology', 'topic_health',
  'topic_work', 'topic_travel', 'topic_food', 'topic_hobbies', 'topic_family',
  'topic_social_media', 'topic_shopping', 'topic_city_life', 'topic_transport',
  'topic_culture', 'topic_crime',
]

const TOPIC_GENRES_10: TranslationGenre[] = [
  'topic_education', 'topic_environment', 'topic_technology', 'topic_health',
  'topic_work', 'topic_travel', 'topic_food', 'topic_hobbies', 'topic_family',
  'topic_social_media',
]

const GENRE: Record<TranslationGenre, TranslationGenreDef> = {
  present_simple: {
    id: 'present_simple', label: 'Simple present', labelVi: 'Hiện tại đơn',
    desc: 'Thói quen, sự thật, lịch trình', icon: '🕐',
  },
  present_continuous: {
    id: 'present_continuous', label: 'Present continuous', labelVi: 'Hiện tại tiếp diễn',
    desc: 'Hành động đang diễn ra, kế hoạch gần', icon: '⏳',
  },
  present_perfect: {
    id: 'present_perfect', label: 'Present perfect', labelVi: 'Hiện tại hoàn thành',
    desc: 'Kinh nghiệm, kết quả ảnh hưởng hiện tại', icon: '✓',
  },
  present_perfect_continuous: {
    id: 'present_perfect_continuous', label: 'Present perfect continuous', labelVi: 'Hiện tại hoàn thành tiếp diễn',
    desc: 'Hành động bắt đầu quá khứ, còn tiếp diễn', icon: '↻',
  },
  uncountable_nouns: {
    id: 'uncountable_nouns', label: 'Uncountable nouns', labelVi: 'Danh từ không đếm được',
    desc: 'Information, advice, furniture…', icon: '📦',
  },
  singular_plural: {
    id: 'singular_plural', label: 'Singular / Plural', labelVi: 'Số ít / Số nhiều',
    desc: 'Agreement, irregular plurals', icon: '🔢',
  },
  passive_voice: {
    id: 'passive_voice', label: 'Passive voice', labelVi: 'Câu bị động',
    desc: 'Be + V3, formal writing', icon: '⇄',
  },
  comparison_struct: {
    id: 'comparison_struct', label: 'Comparisons', labelVi: 'Câu so sánh',
    desc: 'Comparative, superlative, as…as', icon: '⚖',
  },
  topic_education: {
    id: 'topic_education', label: 'Education', labelVi: 'Giáo dục',
    desc: 'Schools, learning, skills, exams', icon: '🎓',
  },
  topic_environment: {
    id: 'topic_environment', label: 'Environment', labelVi: 'Môi trường',
    desc: 'Climate, pollution, sustainability', icon: '🌿',
  },
  topic_technology: {
    id: 'topic_technology', label: 'Technology', labelVi: 'Công nghệ',
    desc: 'AI, digital life, innovation', icon: '💻',
  },
  topic_health: {
    id: 'topic_health', label: 'Health', labelVi: 'Sức khỏe',
    desc: 'Wellness, diet, healthcare', icon: '❤',
  },
  topic_work: {
    id: 'topic_work', label: 'Work', labelVi: 'Công việc',
    desc: 'Career, employment, workplace', icon: '💼',
  },
  topic_travel: {
    id: 'topic_travel', label: 'Travel', labelVi: 'Du lịch',
    desc: 'Tourism, transport, destinations', icon: '✈',
  },
  topic_food: {
    id: 'topic_food', label: 'Food', labelVi: 'Thực phẩm',
    desc: 'Diet, cuisine, agriculture', icon: '🍽',
  },
  topic_hobbies: {
    id: 'topic_hobbies', label: 'Hobbies', labelVi: 'Sở thích',
    desc: 'Leisure, sports, free time', icon: '🎯',
  },
  topic_family: {
    id: 'topic_family', label: 'Family', labelVi: 'Gia đình',
    desc: 'Parenting, relationships, generations', icon: '👨‍👩‍👧',
  },
  topic_social_media: {
    id: 'topic_social_media', label: 'Social Media', labelVi: 'Mạng xã hội',
    desc: 'Platforms, influence, privacy', icon: '📱',
  },
  topic_shopping: {
    id: 'topic_shopping', label: 'Shopping', labelVi: 'Mua sắm',
    desc: 'Consumerism, retail, online shopping', icon: '🛒',
  },
  topic_city_life: {
    id: 'topic_city_life', label: 'City Life', labelVi: 'Cuộc sống đô thị',
    desc: 'Urbanisation, housing, lifestyle', icon: '🏙',
  },
  topic_transport: {
    id: 'topic_transport', label: 'Transport', labelVi: 'Giao thông',
    desc: 'Traffic, public transport, infrastructure', icon: '🚌',
  },
  topic_culture: {
    id: 'topic_culture', label: 'Culture', labelVi: 'Văn hóa',
    desc: 'Traditions, arts, globalisation', icon: '🎭',
  },
  topic_crime: {
    id: 'topic_crime', label: 'Crime', labelVi: 'Tội phạm',
    desc: 'Law, punishment, safety', icon: '⚖',
  },
  custom: {
    id: 'custom', label: 'Custom', labelVi: 'Tự tạo',
    desc: 'Bộ câu do bạn thêm', icon: '✏',
  },
  other: {
    id: 'other', label: 'Other', labelVi: 'Khác',
    desc: 'Chưa phân loại cụ thể', icon: '⋯',
  },
}

export const GENRES_BY_TRACK: Record<TranslationTrackSlug, TranslationGenre[]> = {
  grammar_basic: GRAMMAR_GENRES,
  collocation: TOPIC_GENRES_15,
  paragraph_65: TOPIC_GENRES_15,
  paragraph_80: TOPIC_GENRES_10,
  essay_full: TOPIC_GENRES_15,
  mine: ['custom'],
}

export function getTranslationTrack(slug: string | undefined): TranslationTrack | undefined {
  return TRANSLATION_TRACKS.find(t => t.slug === slug)
}

export function getTranslationGenreDef(id: string | undefined): TranslationGenreDef | undefined {
  if (!id || !(id in GENRE)) return undefined
  return GENRE[id as TranslationGenre]
}

export function genresForTrack(slug: TranslationTrackSlug): TranslationGenreDef[] {
  return GENRES_BY_TRACK[slug].map(id => GENRE[id])
}

export function isValidGenreForTrack(track: TranslationTrackSlug, genre: string): boolean {
  return GENRES_BY_TRACK[track].includes(genre as TranslationGenre)
}

export function genreDisplayLabel(track: TranslationTrack | undefined, genre: TranslationGenre): string {
  const def = GENRE[genre]
  if (!def) return genre
  if (track?.englishGenreLabels) return def.label
  return def.labelVi
}

const TOPIC_TITLE_PATTERNS: Partial<Record<TranslationGenre, RegExp>> = {
  topic_education: /giáo dục|education|school|học/,
  topic_environment: /môi trường|environment|pollution|climate/,
  topic_technology: /công nghệ|technology|digital|ai/,
  topic_health: /sức khỏe|health|wellness|medical/,
  topic_work: /công việc|work|career|job/,
  topic_travel: /du lịch|travel|tourism/,
  topic_food: /thực phẩm|food|diet|cuisine/,
  topic_hobbies: /sở thích|hobbies|leisure|sport/,
  topic_family: /gia đình|family|parent/,
  topic_social_media: /mạng xã hội|social media/,
  topic_shopping: /mua sắm|shopping|consumer/,
  topic_city_life: /đô thị|city life|urban/,
  topic_transport: /giao thông|transport|traffic/,
  topic_culture: /văn hóa|culture|tradition/,
  topic_crime: /tội phạm|crime|law/,
}

export function inferTranslationGenre(set: TranslationSet): TranslationGenre {
  const t = set.title.toLowerCase()

  if (set.category === 'user') return 'custom'

  if (set.category === 'grammar_basic') {
    if (/hiện tại đơn|simple present/.test(t)) return 'present_simple'
    if (/tiếp diễn|continuous/.test(t)) return 'present_continuous'
    if (/hoàn thành tiếp diễn|perfect continuous/.test(t)) return 'present_perfect_continuous'
    if (/hoàn thành|perfect/.test(t)) return 'present_perfect'
    if (/không đếm|uncountable/.test(t)) return 'uncountable_nouns'
    if (/số ít|plural|singular/.test(t)) return 'singular_plural'
    if (/bị động|passive/.test(t)) return 'passive_voice'
    if (/so sánh|compar/.test(t)) return 'comparison_struct'
    return 'other'
  }

  for (const [genre, pattern] of Object.entries(TOPIC_TITLE_PATTERNS) as [TranslationGenre, RegExp][]) {
    if (pattern.test(t)) return genre
  }

  // Legacy categories (bộ mẫu cũ)
  if (set.category === 'ielts_task2') return 'topic_education'
  if (set.category === 'ielts_task1') return 'topic_environment'
  if (set.category === 'daily') return 'topic_travel'

  return 'other'
}

export function effectiveTranslationGenre(set: TranslationSet): TranslationGenre {
  const g = set.genre
  if (g && g in GENRE) return g as TranslationGenre
  return inferTranslationGenre(set)
}

export function setMatchesTrackGenre(
  set: TranslationSet,
  track: TranslationTrack,
  genre: TranslationGenre,
): boolean {
  if (set.category !== track.category) return false
  return effectiveTranslationGenre(set) === genre
}

export function translationGenreLabel(
  genre: TranslationGenre,
  track?: TranslationTrack,
): string {
  return genreDisplayLabel(track, genre)
}