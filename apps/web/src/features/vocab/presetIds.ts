/** Stable IDs for preset vocab decks/cards. Kept separate from seed data so
 * sync/admin normalization can use them without loading the full seed payload.
 */
export function stablePresetDeckId(groupId: string, deckName: string): string {
  const slug = deckName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `preset:${groupId}:${slug || 'deck'}`
}

export function phraseKeyForCard(phrase: string): string {
  return phrase
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function hashPhraseKey(key: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < key.length; i++) {
    const c = key.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 0x01000193)
    h2 = Math.imul(h2 ^ c, 0x811c9dc5)
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)
}

export function stablePresetCardId(deckId: string, phrase: string): string {
  const key = phraseKeyForCard(phrase)
  if (!key) return `pcard:${deckId}:empty`
  return `pcard:${deckId}:${hashPhraseKey(key)}`
}

export function isStablePresetCardId(id: string): boolean {
  return id.startsWith('pcard:')
}

export function isStablePresetDeckId(id: string): boolean {
  return id.startsWith('preset:')
}
