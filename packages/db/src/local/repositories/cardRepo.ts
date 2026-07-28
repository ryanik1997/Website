import { db } from '../schema'
import type { Card, Srs } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => Date.now()

/** Khóa so khớp phrase — trim, gộp whitespace, bỏ dấu phụ (NFD) khi so. */
function phraseKeyOf(phrase: string): string {
  return phrase
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/** Ưu tiên thẻ có SRS tiến bộ hơn, rồi nội dung đầy đủ hơn, rồi cũ hơn. */
function scoreCard(card: Card, srs: Srs | undefined): number {
  let score = 0
  if (srs) {
    score += srs.reps * 100
    score += srs.lapses * 10
    if (srs.state === 'review') score += 50
    else if (srs.state === 'learning') score += 20
    if (srs.lastReviewedAt) score += 5
  }
  if (card.example?.trim()) score += 3
  if (card.ipaUS?.trim() || card.ipaUK?.trim()) score += 2
  if (card.pos?.trim()) score += 1
  if (card.meaning?.trim()) score += 1
  return score
}

function mergeCardFields(keeper: Card, other: Card): Partial<Card> {
  const patch: Partial<Card> = {}
  if (!keeper.meaning?.trim() && other.meaning?.trim()) patch.meaning = other.meaning
  if (!keeper.example?.trim() && other.example?.trim()) patch.example = other.example
  if (!keeper.ipaUS?.trim() && other.ipaUS?.trim()) patch.ipaUS = other.ipaUS
  if (!keeper.ipaUK?.trim() && other.ipaUK?.trim()) patch.ipaUK = other.ipaUK
  if (!keeper.pos?.trim() && other.pos?.trim()) patch.pos = other.pos
  if (!keeper.sourceKind && other.sourceKind) patch.sourceKind = other.sourceKind
  if (!keeper.sourceLabel && other.sourceLabel) patch.sourceLabel = other.sourceLabel
  if (!keeper.sourceExamId && other.sourceExamId) patch.sourceExamId = other.sourceExamId
  return patch
}

export const cardRepo = {
  byDeck: (deckId: string) => db.cards.where('deckId').equals(deckId).toArray(),
  count:  (deckId: string) => db.cards.where('deckId').equals(deckId).count(),

  async add(
    deckId: string,
    data: Pick<
      Card,
      'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos' | 'sourceKind' | 'sourceExamId' | 'sourceLabel'
    >,
  ): Promise<Card> {
    const card: Card = { id: uid(), deckId, ...data, createdAt: now(), updatedAt: now() }
    await db.cards.add(card)
    // Init SRS state — new cards are immediately due
    await db.srs.add({
      cardId: card.id, deckId,
      ease: 2.5, interval: 0, reps: 0, lapses: 0,
      dueAt: now(), updatedAt: now(), state: 'new',
    })
    await db.decks.update(deckId, { updatedAt: now() })
    return card
  },

  /**
   * Thêm thẻ nếu chưa có phrase trùng trong deck (so khớp không phân biệt hoa thường).
   * Trả về card mới hoặc card đã có.
   */
  async addUnique(
    deckId: string,
    data: Pick<
      Card,
      'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos' | 'sourceKind' | 'sourceExamId' | 'sourceLabel'
    >,
  ): Promise<{ card: Card; created: boolean }> {
    const phraseKey = phraseKeyOf(data.phrase)
    const existing = await db.cards
      .where('deckId')
      .equals(deckId)
      .filter(c => phraseKeyOf(c.phrase) === phraseKey)
      .first()
    if (existing) {
      // Bổ sung example/source nếu thẻ cũ thiếu
      const patch: Partial<Card> = {}
      if (!existing.example && data.example) patch.example = data.example
      if (!existing.ipaUS && data.ipaUS) patch.ipaUS = data.ipaUS
      if (!existing.ipaUK && data.ipaUK) patch.ipaUK = data.ipaUK
      if (!existing.pos && data.pos) patch.pos = data.pos
      if (!existing.sourceLabel && data.sourceLabel) patch.sourceLabel = data.sourceLabel
      if (!existing.sourceExamId && data.sourceExamId) patch.sourceExamId = data.sourceExamId
      if (!existing.sourceKind && data.sourceKind) patch.sourceKind = data.sourceKind
      if (Object.keys(patch).length) {
        await db.cards.update(existing.id, { ...patch, updatedAt: now() })
        return { card: { ...existing, ...patch }, created: false }
      }
      return { card: existing, created: false }
    }
    const card = await cardRepo.add(deckId, data)
    return { card, created: true }
  },

  update: (
    id: string,
    patch: Partial<Pick<Card, 'phrase' | 'meaning' | 'example' | 'ipaUS' | 'ipaUK' | 'pos' | 'sourceKind' | 'sourceExamId' | 'sourceLabel'>>,
  ) => db.cards.update(id, { ...patch, updatedAt: now() }),

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.cards, db.srs, db.cardTombstones, async () => {
      await db.cardTombstones.put({ id, deletedAt: now() })
      await db.srs.delete(id)
      await db.cards.delete(id)
    })
  },

  /**
   * Gộp thẻ trùng phrase trong một deck (không phân biệt hoa thường).
   * Giữ thẻ có SRS/tiến độ tốt nhất, merge field thiếu, xóa bản trùng + SRS.
   * @returns số thẻ đã xóa
   */
  async dedupeByPhrase(deckId: string): Promise<number> {
    const cards = await db.cards.where('deckId').equals(deckId).toArray()
    if (cards.length < 2) return 0

    const byPhrase = new Map<string, Card[]>()
    for (const card of cards) {
      const key = phraseKeyOf(card.phrase)
      if (!key) continue
      const list = byPhrase.get(key) ?? []
      list.push(card)
      byPhrase.set(key, list)
    }

    let removed = 0
    const ts = now()

    for (const group of byPhrase.values()) {
      if (group.length < 2) continue

      const withSrs = await Promise.all(
        group.map(async card => ({
          card,
          srs: await db.srs.get(card.id),
        })),
      )

      withSrs.sort((a, b) => {
        const sa = scoreCard(a.card, a.srs)
        const sb = scoreCard(b.card, b.srs)
        if (sb !== sa) return sb - sa
        return a.card.createdAt - b.card.createdAt
      })

      const keeper = withSrs[0]!
      let keeperCard = keeper.card
      let keeperSrs = keeper.srs

      for (let i = 1; i < withSrs.length; i++) {
        const dupe = withSrs[i]!
        const fieldPatch = mergeCardFields(keeperCard, dupe.card)
        if (Object.keys(fieldPatch).length) {
          await db.cards.update(keeperCard.id, { ...fieldPatch, updatedAt: ts })
          keeperCard = { ...keeperCard, ...fieldPatch }
        }

        // Giữ SRS tốt hơn nếu keeper chưa có / kém hơn
        if (dupe.srs) {
          if (!keeperSrs || scoreCard(dupe.card, dupe.srs) > scoreCard(keeperCard, keeperSrs)) {
            const mergedSrs: Srs = {
              ...dupe.srs,
              cardId: keeperCard.id,
              deckId,
            }
            await db.srs.put(mergedSrs)
            keeperSrs = mergedSrs
          }
        }

        // Chuyển reviewLog sang keeper (tránh mất lịch sử ôn)
        const logs = await db.reviewLog.where('cardId').equals(dupe.card.id).toArray()
        for (const log of logs) {
          if (log.id != null) {
            await db.reviewLog.update(log.id, { cardId: keeperCard.id })
          }
        }

        await db.srs.delete(dupe.card.id)
        await db.cards.delete(dupe.card.id)
        removed++
      }
    }

    if (removed > 0) {
      await db.decks.update(deckId, { updatedAt: ts })
    }
    return removed
  },

  /**
   * Dedupe phrase trùng trên mọi deck (hoặc danh sách deckId).
   * @returns tổng số thẻ đã xóa
   */
  async dedupeAllDecks(deckIds?: string[]): Promise<number> {
    const ids =
      deckIds ??
      (await db.decks.toArray()).map(d => d.id)
    let total = 0
    for (const id of ids) {
      total += await cardRepo.dedupeByPhrase(id)
    }
    return total
  },
}
