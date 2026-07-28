/**
 * Chuẩn hoá payload vocab cho Admin Publish / client merge.
 * - Deck id → stablePresetDeckId(group, name)
 * - Card id → stablePresetCardId(deckId, phrase)
 * → re-publish idempotent, không double deck/card.
 */
import type { Card, Deck, Group } from '@ryan/db'
import {
  PRESET_GROUP_IDS,
} from './vocabConstants'
import {
  stablePresetCardId,
  stablePresetDeckId,
} from './presetIds'

const PRESET_GROUP_SET = new Set<string>(PRESET_GROUP_IDS)

export interface VocabPublishPayload {
  groups: Group[]
  decks: Deck[]
  cards: Card[]
}

function cardRichness(c: Card): number {
  let n = 0
  if (c.meaning?.trim()) n += 2
  if (c.example?.trim()) n += 3
  if (c.ipaUS?.trim() || c.ipaUK?.trim()) n += 2
  if (c.pos?.trim()) n += 1
  if (c.sourceLabel?.trim()) n += 1
  return n
}

function mergeCardPreferRicher(a: Card, b: Card): Card {
  const rich = cardRichness(b) > cardRichness(a) ? b : a
  const other = rich === a ? b : a
  return {
    ...rich,
    meaning: rich.meaning?.trim() || other.meaning,
    example: rich.example?.trim() || other.example,
    ipaUS: rich.ipaUS?.trim() || other.ipaUS,
    ipaUK: rich.ipaUK?.trim() || other.ipaUK,
    pos: rich.pos?.trim() || other.pos,
    sourceKind: rich.sourceKind || other.sourceKind,
    sourceLabel: rich.sourceLabel || other.sourceLabel,
    sourceExamId: rich.sourceExamId || other.sourceExamId,
    createdAt: Math.min(a.createdAt, b.createdAt),
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  }
}

/**
 * Chuẩn hoá raw groups/decks/cards → payload publish/merge an toàn.
 * Bỏ deck ngoài group preset; gộp deck/card trùng theo id ổn định.
 */
export function normalizeVocabPublishPayload(input: {
  groups?: Group[]
  decks?: Deck[]
  cards?: Card[]
}): VocabPublishPayload {
  const groups = (input.groups ?? []).filter(g => PRESET_GROUP_SET.has(g.id))

  const deckIdRemap = new Map<string, string>()
  const decksByStable = new Map<string, Deck>()

  for (const d of input.decks ?? []) {
    if (!PRESET_GROUP_SET.has(d.groupId)) continue
    const name = (d.name ?? '').trim()
    if (!name) continue
    const id = stablePresetDeckId(d.groupId, name)
    deckIdRemap.set(d.id, id)

    const next: Deck = {
      ...d,
      id,
      name,
      origin: 'preset',
    }
    const prev = decksByStable.get(id)
    if (!prev) {
      decksByStable.set(id, next)
      continue
    }
    // Giữ meta đầy đủ hơn / mới hơn
    decksByStable.set(id, {
      ...prev,
      ...next,
      id,
      name,
      origin: 'preset',
      description: next.description?.trim() || prev.description,
      book: next.book?.trim() || prev.book,
      color: next.color || prev.color,
      icon: next.icon || prev.icon,
      createdAt: Math.min(prev.createdAt, next.createdAt),
      updatedAt: Math.max(prev.updatedAt, next.updatedAt),
    })
  }

  const cardsByStable = new Map<string, Card>()
  for (const c of input.cards ?? []) {
    const phrase = (c.phrase ?? '').trim()
    if (!phrase) continue
    const deckId = deckIdRemap.get(c.deckId) ?? c.deckId
    if (!decksByStable.has(deckId)) continue

    const id = stablePresetCardId(deckId, phrase)
    const next: Card = {
      ...c,
      id,
      deckId,
      phrase,
      meaning: (c.meaning ?? '').trim(),
    }
    const prev = cardsByStable.get(id)
    cardsByStable.set(id, prev ? mergeCardPreferRicher(prev, next) : next)
  }

  return {
    groups,
    decks: [...decksByStable.values()],
    cards: [...cardsByStable.values()],
  }
}
