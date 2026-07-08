import type { Deck } from '../local/schema'

const PRESET_ID_PREFIX = 'preset:'

/** Bộ từ vựng seed/admin — ID không phải UUID, không đẩy lên bảng decks cloud của user. */
export function isPresetDeck(deck: Deck): boolean {
  return deck.origin === 'preset' || deck.id.startsWith(PRESET_ID_PREFIX)
}