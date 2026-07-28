/**
 * Regression: catalog không được đè audio/ảnh import (KET Test 3 ≠ Test 1).
 * Run: pnpm --filter web exec tsx scripts/test-listening-media-policy.mts
 *   or: npx vite-node apps/web/scripts/test-listening-media-policy.mts
 */
import {
  allowDefaultCatalogAudioByExamType,
  extractListeningTestNumber,
  isValidCatalogListeningTwin,
  preferLocalAudioUrl,
  preferLocalListeningMedia,
  preferLocalPictureUrl,
  shouldAttachCatalogAudio,
} from '../src/features/exam/listeningLocalMediaPolicy.ts'
import {
  findCatalogListeningTwin,
  mergeCatalogListeningMedia,
  resolveListeningCatalogAudioUrl,
} from '../src/features/exam/listeningExamCatalogMerge.ts'
import type { ListeningExam } from '../src/features/exam/listeningExamData.ts'
import { partAudioSource, sharedExamAudioSource } from '../src/features/exam/listeningExamAudio.ts'

let failed = 0
function assert(cond: unknown, msg: string) {
  if (!cond) {
    failed += 1
    console.error('FAIL:', msg)
  } else {
    console.log('ok:', msg)
  }
}

// ── pure policy ──────────────────────────────────────────────
assert(extractListeningTestNumber('KET A2 Listening — Book 1 — Test 3') === '3', 'extract Test 3')
assert(extractListeningTestNumber('KET A2 Listening — Test 1') === '1', 'extract Test 1')
assert(allowDefaultCatalogAudioByExamType('KET Test 3') === false, 'no default audio for Test 3')
assert(allowDefaultCatalogAudioByExamType('KET Test 1') === true, 'default ok for Test 1')
assert(allowDefaultCatalogAudioByExamType('KET A2 Listening') === true, 'default ok no test num')

assert(
  !isValidCatalogListeningTwin(
    { examType: 'ket', title: 'KET A2 Listening — Book 1 — Test 3' },
    { examType: 'ket', title: 'KET A2 Listening — Book 1 — Test 1' },
  ),
  'twin Test3 vs Test1 invalid',
)
assert(
  isValidCatalogListeningTwin(
    { examType: 'ket', title: 'KET A2 Listening — Book 1 — Test 1' },
    { examType: 'ket', title: 'KET A2 Listening — Book 1 — Test 1' },
  ),
  'twin Test1 exact valid',
)

assert(shouldAttachCatalogAudio({ audioKey: 'blob:1' }) === false, 'no catalog when blob')
assert(shouldAttachCatalogAudio({ audioUrl: '/x.mp3' }) === false, 'no catalog when url')
assert(shouldAttachCatalogAudio({}) === true, 'catalog when empty')

assert(
  preferLocalAudioUrl({ audioKey: 'k', audioUrl: '/catalog/listening/ket-a2-test1/listening.mp3' })
    === undefined,
  'strip catalog url when blob',
)
assert(
  preferLocalPictureUrl(
    { pictureImageKey: 'img', pictureImageUrl: '/catalog/wrong.jpg' },
  ) === undefined,
  'strip catalog pic when blob',
)

// ── preferLocalListeningMedia ────────────────────────────────
const dirty = preferLocalListeningMedia({
  title: 'KET Test 3',
  examType: 'ket',
  parts: [{
    audioKey: 'local-mp3',
    audioUrl: '/catalog/listening/ket-a2-test1/listening.mp3',
    questions: [{
      audioKey: 'q',
      audioUrl: '/catalog/listening/ket-a2-test1/listening.mp3',
      pictureImageKey: 'board',
      pictureImageUrl: '/catalog/listening/ket-a2-test1/q1.jpg',
      options: [{ id: 'A', imageKey: 'a', imageUrl: '/catalog/x.jpg' }],
    }],
  }],
})
assert(dirty.parts[0]!.audioUrl === undefined, 'sanitize part audioUrl')
assert(dirty.parts[0]!.questions[0]!.audioUrl === undefined, 'sanitize q audioUrl')
assert(dirty.parts[0]!.questions[0]!.pictureImageUrl === undefined, 'sanitize pictureImageUrl')
assert(dirty.parts[0]!.questions[0]!.options![0]!.imageUrl === undefined, 'sanitize option imageUrl')

// ── twin / resolve ───────────────────────────────────────────
const twin3 = findCatalogListeningTwin({
  examType: 'ket',
  title: 'KET A2 Listening — Book 1 — Test 3',
})
assert(twin3 === null, 'no catalog twin for KET Test 3')

const url3 = resolveListeningCatalogAudioUrl({
  examType: 'ket',
  title: 'KET A2 Listening — Book 1 — Test 3',
})
assert(url3 === undefined, 'no catalog audio URL for Test 3')

// ── merge full exam (import-like) ────────────────────────────
const imported: ListeningExam = {
  id: 'listening-import-test3',
  title: 'KET A2 Listening — Book 1 — Test 3',
  durationMinutes: 30,
  examType: 'ket',
  examMode: 'practice',
  parts: [
    {
      id: 'p1',
      partNumber: 1,
      rangeLabel: '1-5',
      audioKey: 'listening-exam:import:shared-listening',
      // stale wrong catalog from old bug
      audioUrl: '/catalog/listening/ket-a2-test1/listening.mp3',
      questions: [
        {
          id: 'q1',
          number: 1,
          type: 'picture-mc',
          prompt: 'Q1',
          answer: 'A',
          explanation: '',
          pictureImageKey: 'board-q1',
          pictureImageUrl: '/catalog/listening/ket-a2-test1/q1.jpg',
          options: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
            { id: 'C', label: 'C' },
          ],
        },
      ],
    },
  ],
}

const merged = mergeCatalogListeningMedia(imported)
assert(
  merged.parts[0]!.audioKey === 'listening-exam:import:shared-listening',
  'merge keeps local audioKey',
)
assert(merged.parts[0]!.audioUrl === undefined, 'merge strips wrong catalog audioUrl')
assert(merged.parts[0]!.questions[0]!.pictureImageUrl === undefined, 'merge strips wrong picture URL')

const playSrc = sharedExamAudioSource(merged)
assert(playSrc?.audioKey === 'listening-exam:import:shared-listening', 'play uses local key')
assert(playSrc?.audioUrl === undefined, 'play has no catalog URL')

const partSrc = partAudioSource(merged.parts[0]!)
assert(partSrc.audioUrl === undefined, 'partAudioSource strips catalog when blob')

if (failed) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}
console.log('\nAll listening media policy checks passed.')
