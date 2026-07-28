/** Auto-generated preset seed: 100 singles + 100 phrases per deck (+ IPA + examples).
 * Enrich IPA/examples: node scripts/enrich-preset-vocab.mjs
 * Regenerate:
 *   node scripts/gen-preset-single-100.mjs
 *   node scripts/gen-preset-phrase-100.mjs
 */
import type { PresetGroupId } from '../vocabConstants'
import { PRESET_VOCAB_SEED_VERSION } from '../vocabSeedVersion'
import singles from './preset-singles.json'
import phrases from './preset-phrases.json'

export type PresetSeedCard = {
  deckName: string
  phrase: string
  meaning: string
  example?: string
  pos?: string
  ipaUS?: string
  ipaUK?: string
}

/** @deprecated Use PRESET_VOCAB_SEED_VERSION from vocabSeedVersion. */
export const PRESET_VOCAB_CARDS_VERSION = PRESET_VOCAB_SEED_VERSION

function mergeGroup(a: PresetSeedCard[] = [], b: PresetSeedCard[] = []): PresetSeedCard[] {
  return [...a, ...b]
}

export const PRESET_VOCAB_SEED: Record<PresetGroupId, PresetSeedCard[]> = {
  ielts: mergeGroup(singles.ielts as PresetSeedCard[], phrases.ielts as PresetSeedCard[]),
  oxford: mergeGroup(singles.oxford as PresetSeedCard[], phrases.oxford as PresetSeedCard[]),
  toeic: mergeGroup(singles.toeic as PresetSeedCard[], phrases.toeic as PresetSeedCard[]),
  academic: mergeGroup(singles.academic as PresetSeedCard[], phrases.academic as PresetSeedCard[]),
  sat: mergeGroup(singles.sat as PresetSeedCard[], phrases.sat as PresetSeedCard[]),
  toefl: mergeGroup(singles.toefl as PresetSeedCard[], phrases.toefl as PresetSeedCard[]),
}
