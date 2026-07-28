import { settingsRepo } from '@ryan/db'
import {
  PRESET_VOCAB_SEED_VERSION,
  PRESET_VOCAB_SEED_VERSION_KEY,
} from './vocabSeedVersion'

/** Load the large preset bundle only when this browser needs a seed migration. */
export async function ensurePresetVocabSeed(): Promise<boolean> {
  const storedVersion = await settingsRepo.getSetting(PRESET_VOCAB_SEED_VERSION_KEY)
  if (storedVersion === PRESET_VOCAB_SEED_VERSION) return false

  const { seedPresetDecks } = await import('./vocabSeedDecks')
  await seedPresetDecks()
  await settingsRepo.putSetting(PRESET_VOCAB_SEED_VERSION_KEY, PRESET_VOCAB_SEED_VERSION)
  return true
}
