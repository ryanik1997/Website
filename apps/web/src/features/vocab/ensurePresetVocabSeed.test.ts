import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSetting: vi.fn(),
  putSetting: vi.fn(),
  seedPresetDecks: vi.fn(),
}))

vi.mock('@ryan/db', () => ({
  settingsRepo: {
    getSetting: mocks.getSetting,
    putSetting: mocks.putSetting,
  },
}))

vi.mock('./vocabSeedDecks', () => ({
  seedPresetDecks: mocks.seedPresetDecks,
}))

import { ensurePresetVocabSeed } from './ensurePresetVocabSeed'
import {
  PRESET_VOCAB_SEED_VERSION,
  PRESET_VOCAB_SEED_VERSION_KEY,
} from './vocabSeedVersion'

describe('ensurePresetVocabSeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not load the seed bundle when the stored version is current', async () => {
    mocks.getSetting.mockResolvedValue(PRESET_VOCAB_SEED_VERSION)

    await expect(ensurePresetVocabSeed()).resolves.toBe(false)

    expect(mocks.getSetting).toHaveBeenCalledWith(PRESET_VOCAB_SEED_VERSION_KEY)
    expect(mocks.seedPresetDecks).not.toHaveBeenCalled()
    expect(mocks.putSetting).not.toHaveBeenCalled()
  })

  it('loads and records the seed when the stored version is stale', async () => {
    mocks.getSetting.mockResolvedValue(PRESET_VOCAB_SEED_VERSION - 1)
    mocks.seedPresetDecks.mockResolvedValue(undefined)

    await expect(ensurePresetVocabSeed()).resolves.toBe(true)

    expect(mocks.seedPresetDecks).toHaveBeenCalledOnce()
    expect(mocks.putSetting).toHaveBeenCalledWith(
      PRESET_VOCAB_SEED_VERSION_KEY,
      PRESET_VOCAB_SEED_VERSION,
    )
  })

  it('does not advance the version when seeding fails', async () => {
    mocks.getSetting.mockResolvedValue(undefined)
    mocks.seedPresetDecks.mockRejectedValue(new Error('seed failed'))

    await expect(ensurePresetVocabSeed()).rejects.toThrow('seed failed')
    expect(mocks.putSetting).not.toHaveBeenCalled()
  })
})
