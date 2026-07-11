import type { Card, Deck } from '@ryan/db'
import { PRESET_GROUP_IDS } from './vocabSeedDecks'

export const ADMIN_PUBLISHED_VOCAB_VERSION_KEY = 'admin_published_vocab_version'

const PRESET_GROUP_SET = new Set<string>(PRESET_GROUP_IDS)

export function isPublishedPresetDeck(deck: Pick<Deck, 'groupId' | 'origin'>): boolean {
  return deck.origin === 'preset' && PRESET_GROUP_SET.has(deck.groupId)
}

export function computePublishedVocabPrunePlan(
  localDecks: Deck[],
  localCards: Card[],
  publishedDecks: Deck[],
  publishedCards: Card[],
): {
  staleDeckIds: string[]
  staleCardIds: string[]
} {
  const localPresetDecks = localDecks.filter(isPublishedPresetDeck)
  const localPresetDeckIds = new Set(localPresetDecks.map(deck => deck.id))
  const publishedDeckIds = new Set(publishedDecks.map(deck => deck.id))
  const publishedCardIds = new Set(publishedCards.map(card => card.id))

  const staleDeckIds = localPresetDecks
    .filter(deck => !publishedDeckIds.has(deck.id))
    .map(deck => deck.id)
  const staleDeckIdSet = new Set(staleDeckIds)

  const staleCardIds = localCards
    .filter(card => localPresetDeckIds.has(card.deckId))
    .filter(card => !staleDeckIdSet.has(card.deckId))
    .filter(card => !publishedCardIds.has(card.id))
    .map(card => card.id)

  return { staleDeckIds, staleCardIds }
}
