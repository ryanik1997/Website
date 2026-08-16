/**
 * Shared Reading release exclusions — single source of truth.
 *
 * Bodies may exist on disk but are intentionally NOT part of the released
 * manifest/meta. See tmp/r2-reading-reconciliation.md §4 for per-ID evidence.
 * Import this from build scripts (mode-c-pack-catalog, reconciler, guards) so
 * the release set cannot drift between tools.
 */
export const RELEASE_READING_EXCLUSIONS = new Set([
  'catalog-ket-a2-generated-01', // EXCLUDE_FIXTURE — generated AI pilot
  'catalog-ket-cam1-test1', // BLOCKED_DUPLICATE of catalog-reading-ket-a2-test1
  'catalog-reading-cae-c1-test24', // BLOCKED_MISSING_VAULT — no answers
])

/**
 * Allow-listed IELTS answer exceptions (1,921 questions / 1,919 answers).
 * No value is fabricated; scoring for these questions stays unavailable until
 * the underlying source data is repaired.
 */
export const IELTS_ANSWER_EXCEPTIONS = [
  {
    testId: 'catalog-cam-11-3-reading',
    tidFile: 'reading-cam-11-3.json',
    part: 1,
    questionNumber: 9,
    classification: 'TRANSFORM_DROPPED',
    note: 'answer "nylon" exists in crawl Cam11_Test3.json under duplicate id 8; phantom empty Q9 in runtime',
  },
  {
    testId: 'catalog-cam-12-2-reading',
    tidFile: 'reading-cam-12-2.json',
    part: 1,
    questionNumber: 11,
    classification: 'SOURCE_MISSING',
    note: 'crawl Cam12_Test2.json id 11 has empty text+answer; not provable locally',
  },
]
