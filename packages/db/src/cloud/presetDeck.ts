import type { Deck } from '../local/schema'

const PRESET_ID_PREFIX = 'preset:'

/** Bộ từ vựng seed/admin — ID không phải UUID, không đẩy lên bảng decks cloud của user. */
export function isPresetDeck(deck: Deck): boolean {
  return deck.origin === 'preset' || deck.id.startsWith(PRESET_ID_PREFIX)
}

/** Chuẩn hoá tên deck để so khớp preset local ↔ bản UUID ghost trên cloud. */
export function normalizeDeckNameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/** group + name → khóa gộp double (preset seed vs UUID sync nhầm). */
export function deckIdentityKey(groupId: string, name: string): string {
  return `${(groupId || '').trim().toLowerCase()}|${normalizeDeckNameKey(name)}`
}
