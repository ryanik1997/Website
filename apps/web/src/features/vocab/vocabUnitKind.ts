/** Phân loại thẻ: từ đơn (get) vs cụm từ (get off the train). */

export type VocabUnitKind = 'single' | 'phrase'

export const VOCAB_UNIT_KIND_LABELS: Record<VocabUnitKind, string> = {
  single: 'Từ vựng đơn lẻ',
  phrase: 'Cụm từ vựng',
}

/** Cụm = có khoảng trắng, hoặc POS là cụm / phrasal. */
export function classifyPhrase(phrase: string, pos?: string): VocabUnitKind {
  const p = phrase.trim()
  if (!p) return 'single'
  if (/\s/.test(p)) return 'phrase'

  const posKey = (pos ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
  if (
    posKey.includes('cum') ||
    posKey.includes('phrasal') ||
    posKey === 'phrase' ||
    posKey.includes('collocation')
  ) {
    return 'phrase'
  }
  return 'single'
}

export function matchesUnitKind(
  phrase: string,
  unitKind: VocabUnitKind,
  pos?: string,
): boolean {
  return classifyPhrase(phrase, pos) === unitKind
}

export function filterCardsByUnitKind<T extends { phrase: string; pos?: string }>(
  cards: T[],
  unitKind: VocabUnitKind,
): T[] {
  return cards.filter(c => matchesUnitKind(c.phrase, unitKind, c.pos))
}
