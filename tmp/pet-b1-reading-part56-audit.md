# PET B1 Reading Part 5/6 audit

- Discovered canonical tests: 2 (`catalog-reading-pet-b1-test1`, `catalog-reading-pet-b1-test13`).
- Expected range: Test 01-51.
- Missing canonical test files: 49. Test 13 exists only in the public runtime catalog body/answer-vault path; the source catalog data directory contains Test 01 only.
- Scope decision: user confirmed “only the real tests in the app”, so the rewrite was limited to these 2 tests.
- Part 5 rebuilt: 2 texts / 12 questions. Part 6 rebuilt: 2 texts / 12 questions.
- Parts 1-4 were preserved. No missing tests were invented.
- Structural and answer-vault checks pass for both tests; web TypeScript and diff check pass.

## Source classification

- Test 01: canonical static source is `packages/catalog/data/reading-pet-b1-test1.json`; `scripts/build-catalog.mjs` maps the static `pet-reading-test1` bundle into runtime.
- Test 13: no source JSON exists in `packages/catalog/data`, `Tainguyen`, or a raw crawl input. The only discovered artifact is the external import bundle `D:/App-English-Ryan/Crawl/PET_B1_Reading/Tests/test-13/pet-b1-test13-import`, which is an already-converted runtime bundle, not a current generator input.
- The runtime catalog is normally built from `Tainguyen` plus static bundles by `scripts/build-catalog.mjs`; that pipeline has no Test 13 source entry.

## Durability and idempotency

- The rewrite script is guarded to the exact allow-list `{catalog-reading-pet-b1-test1, catalog-reading-pet-b1-test13}`.
- It was run twice. SHA256 comparison of all four runtime body/vault files showed `secondRunCreatedDiff: false`.
- Test 01 is durable through its canonical source. Test 13 remains runtime-only; a future import/catalog sync can overwrite it. No source file was invented.
- The external import bundle was not promoted to a new repository source, so this is recorded technical debt rather than a false source-of-truth claim.

## Test 13 generation checkpoint

- Part 5 generated: `Learning to Cook Under Pressure` with six vocabulary/collocation items (Q21–26), four options each.
- Part 6 generated: `Planning a Wildlife Walk` with six grammar/function-word gaps (Q27–32), one-word answers and no options.
- Answer vault contains 12 Part 5/6 answers for Test 13.
- Quality revision after UI review: Test 13 Part 5 is now 165 words and Part 6 is 141 words (excluding titles), within the requested B1 passage range; the six gaps and answer keys remain unchanged.
