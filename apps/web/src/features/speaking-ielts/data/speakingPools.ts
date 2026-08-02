import type { RouletteItem, RoulettePools } from '../speakingIeltsData'
import type { Part1Content, Part2Content, Part3Content, AnySpeakingContent, TopicGroup } from '../types/speakingContent'
import { PART1_QUESTIONS } from './part1'
import { PART2_CUE_CARDS } from './part2'
import { PART3_QUESTIONS } from './part3'

const SOURCE_URL = 'local-curated-speaking-pool'

function toRouletteItem(item: AnySpeakingContent): RouletteItem {
  if (item.part === 1) return { id: item.id, part: 1, topic: item.topic, prompt: item.question, sourceUrl: SOURCE_URL }
  if (item.part === 2) return { id: item.id, part: 2, topic: item.topic, prompt: item.cueCard, sourceUrl: SOURCE_URL }
  return { id: item.id, part: 3, topic: item.topic, prompt: item.question, sourceUrl: SOURCE_URL }
}

export const SPEAKING_POOLS_RAW = {
  1: PART1_QUESTIONS,
  2: PART2_CUE_CARDS,
  3: PART3_QUESTIONS,
} as const

export const SPEAKING_POOLS: RoulettePools = {
  1: PART1_QUESTIONS.map(toRouletteItem),
  2: PART2_CUE_CARDS.map(toRouletteItem),
  3: PART3_QUESTIONS.map(toRouletteItem),
}

// ── Related topic group mapping ────────────────────────────
export const RELATED_GROUPS: Record<string, readonly string[]> = {
  home: ['accommodation', 'family', 'hometown'],
  hometown: ['home', 'cities', 'countryside'],
  accommodation: ['home', 'cities', 'money'],
  family: ['home', 'friends', 'social-change'],
  friends: ['family', 'communication', 'leisure'],
  work: ['study', 'technology', 'money'],
  study: ['work', 'education', 'technology'],
  technology: ['education', 'communication', 'work'],
  education: ['study', 'work', 'science'],
  environment: ['travel', 'transport', 'science'],
  transport: ['travel', 'environment', 'cities'],
  travel: ['transport', 'culture', 'environment'],
  food: ['health', 'culture', 'traditions'],
  health: ['food', 'sports', 'public-services'],
  sports: ['health', 'leisure', 'education'],
  leisure: ['sports', 'media', 'books'],
  books: ['education', 'media', 'leisure'],
  music: ['art', 'culture', 'leisure'],
  films: ['media', 'art', 'culture'],
  art: ['culture', 'music', 'films'],
  culture: ['traditions', 'travel', 'art'],
  traditions: ['culture', 'history', 'family'],
  history: ['traditions', 'culture', 'education'],
  media: ['communication', 'technology', 'advertising'],
  advertising: ['media', 'shopping', 'money'],
  shopping: ['money', 'advertising', 'leisure'],
  money: ['work', 'shopping', 'public-services'],
  'public-services': ['health', 'money', 'cities'],
  cities: ['hometown', 'countryside', 'transport'],
  countryside: ['cities', 'environment', 'home'],
  communication: ['technology', 'media', 'friends'],
  science: ['education', 'environment', 'innovation'],
  innovation: ['technology', 'science', 'work'],
  'social-change': ['culture', 'family', 'work'],
}

export function getRelatedGroups(group: string | undefined): readonly string[] {
  if (!group) return []
  return RELATED_GROUPS[group] ?? []
}

// ── Session-based Part 3 picker ─────────────────────────────
export type Part3Session = {
  linkedGroup: string | undefined
  usedIds: Set<string>
}

export function createPart3Session(linkedGroup: string | undefined): Part3Session {
  return { linkedGroup, usedIds: new Set() }
}

export function resetPart3Session(session: Part3Session, linkedGroup: string | undefined): void {
  session.linkedGroup = linkedGroup
  session.usedIds.clear()
}

function toRouletteItemFromPart3(q: Part3Content): RouletteItem {
  return { id: q.id, part: 3, topic: q.topic, prompt: q.question, sourceUrl: SOURCE_URL }
}

export function pickPart3ForSession(
  session: Part3Session,
  previousId?: string,
  random: () => number = Math.random,
): RouletteItem | undefined {
  const { linkedGroup, usedIds } = session

  // 1. Try unused items from the linked group
  const linkedPool = linkedGroup
    ? PART3_QUESTIONS.filter(q => q.linkedPart3Group === linkedGroup && !usedIds.has(q.id) && q.id !== previousId)
    : []
  if (linkedPool.length > 0) {
    const picked = linkedPool[Math.floor(random() * linkedPool.length)]
    usedIds.add(picked.id)
    return toRouletteItemFromPart3(picked)
  }

  // 2. Try unused items from related groups
  const related = getRelatedGroups(linkedGroup)
  const relatedPool = PART3_QUESTIONS.filter(
    q => related.includes(q.linkedPart3Group) && !usedIds.has(q.id) && q.id !== previousId,
  )
  if (relatedPool.length > 0) {
    const picked = relatedPool[Math.floor(random() * relatedPool.length)]
    usedIds.add(picked.id)
    return toRouletteItemFromPart3(picked)
  }

  // 3. Fallback to any unused item from the full pool
  const fallbackPool = PART3_QUESTIONS.filter(q => !usedIds.has(q.id) && q.id !== previousId)
  if (fallbackPool.length > 0) {
    const picked = fallbackPool[Math.floor(random() * fallbackPool.length)]
    usedIds.add(picked.id)
    return toRouletteItemFromPart3(picked)
  }

  // 4. Last resort: reset and pick from linked group or full pool
  usedIds.clear()
  const resetPool = linkedGroup
    ? PART3_QUESTIONS.filter(q => q.linkedPart3Group === linkedGroup && q.id !== previousId)
    : PART3_QUESTIONS.filter(q => q.id !== previousId)
  if (resetPool.length > 0) {
    const picked = resetPool[Math.floor(random() * resetPool.length)]
    usedIds.add(picked.id)
    return toRouletteItemFromPart3(picked)
  }

  // 5. Absolute last resort: pick anything except previous
  const anyPool = PART3_QUESTIONS.filter(q => q.id !== previousId)
  if (anyPool.length > 0) {
    const picked = anyPool[Math.floor(random() * anyPool.length)]
    usedIds.add(picked.id)
    return toRouletteItemFromPart3(picked)
  }

  return undefined
}

// ── Legacy helpers (backward-compatible) ────────────────────
export function getPart3PoolForGroup(linkedPart3Group: string | undefined): Part3Content[] {
  if (!linkedPart3Group) return PART3_QUESTIONS
  const filtered = PART3_QUESTIONS.filter(q => q.linkedPart3Group === linkedPart3Group)
  return filtered.length > 0 ? filtered : PART3_QUESTIONS
}

export function getPart2LinkedGroup(part2Id: string | undefined): string | undefined {
  if (!part2Id) return undefined
  const card = PART2_CUE_CARDS.find(c => c.id === part2Id)
  return card?.linkedPart3Group
}

export function getPart2Prompts(part2Id: string | undefined): [string, string, string, string] | undefined {
  if (!part2Id) return undefined
  const card = PART2_CUE_CARDS.find(c => c.id === part2Id)
  return card?.prompts
}

export function getPart2ClosingInstruction(part2Id: string | undefined): string | undefined {
  if (!part2Id) return undefined
  const card = PART2_CUE_CARDS.find(c => c.id === part2Id)
  return card?.closingInstruction
}

export function getSpeakingItem(id: string): AnySpeakingContent | undefined {
  return [...PART1_QUESTIONS, ...PART2_CUE_CARDS, ...PART3_QUESTIONS].find(item => item.id === id)
}
