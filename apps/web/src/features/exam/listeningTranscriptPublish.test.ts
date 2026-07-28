import { describe, expect, it } from 'vitest'
import { preparePublishedWhisperData } from './audioSyncUtils'

describe('Listening transcript publish data', () => {
  it('embeds locally generated text and segment timestamps into the Part JSON', () => {
    expect(preparePublishedWhisperData({
      storedTranscript: 'Cloud-ready transcript',
      storedSegmentsJson: JSON.stringify([
        { id: 1, start: 0, end: 2.5, text: 'Cloud-ready transcript' },
      ]),
    })).toEqual({
      transcript: 'Cloud-ready transcript',
      transcriptSegments: [
        { id: 1, start: 0, end: 2.5, text: 'Cloud-ready transcript' },
      ],
    })
  })

  it('preserves already-published segments instead of replacing them with local data', () => {
    expect(preparePublishedWhisperData({
      publishedSegments: [{ id: 2, start: 1, end: 3, text: 'Published' }],
      storedSegmentsJson: JSON.stringify([{ id: 8, start: 0, end: 1, text: 'Local' }]),
    }).transcriptSegments).toEqual([{ id: 2, start: 1, end: 3, text: 'Published' }])
  })
})
