# Cambridge Writing pipeline research (Task 7)

## Current corpus/counts

- Canonical AI scope is B1/B2/C1/C2 only; A2 is intentionally excluded from generation (`a2Generated: 0`).
- Plan default is 50 new tests per level, test numbers 02–51: 200 tests and 750 tasks total (B1 = 3 tasks/test; B2/C1/C2 = 4 tasks/test).
- The checked-in generated corpus currently contains the checkpoint only: 20 tests / 75 tasks (B1 5/15, B2 5/20, C1 5/20, C2 5/20), Test 02–06 for each level.
- `tmp/cambridge-writing-validation-report.json` reports schema/identity/level/string/content-hash validation PASS (20 tests, 75 tasks, zero failures) only with `allowUnreviewed`; all 20 are `draft` + `unreviewed`, quality score absent, independent AI verification skipped. No generated test is published or human-approved.
- The final report therefore correctly remains incomplete: acceptance requires 200 tests / 750 tasks, validation valid, and verified quality gates.

## Pipeline map

1. `plan-cambridge-writing-corpus.mjs` creates deterministic rows. Tests 02–06 use authored checkpoint designs; 07–51 use generic topic-family cycles. It validates unique IDs, design fingerprints, and semantic scenario keys.
2. `generate-cambridge-writing-tests.mjs` calls the configured generation provider, normalizes task IDs/contracts, caches by prompt/input hash, and stages/quarantines failures. It writes provenance as `ai-generated`/`unreviewed`.
3. `verify-cambridge-writing-tests.mjs` applies deterministic originality first, then independent verifier review; optional revision loops can regenerate failed tasks. `--skip-ai` promotion deliberately keeps `unreviewed` provenance.
4. `validate-cambridge-writing-corpus.mjs` parses `TestSchema`, asserts identity, checks strings/placeholders/level-specific blocks, content hashes, provenance, score >= 88 (unless `--allow-unreviewed`), duplicate IDs, banned phrases, and corpus similarity.
5. `promote-cambridge-writing-tests.mjs` is the publication gate; `build-cambridge-writing-index.mjs` imports generated JSON into `generatedData.ts`.

## Root/schema conflicts and drift

- `packages/catalog/src/cambridge/writing/manifest.json` still reports `testCount: 1` for B1–C2 (seed Test 01), while `packages/catalog/data/cambridge-writing/` and generatedData contain Tests 02–06 as well (6 tests/level at runtime if seed + generated are combined). Any consumer treating the source manifest as total corpus count will under-report.
- The generated index is source-controlled output and currently imports 20 JSON files. It must be rebuilt after each promotion; stale index/manifest is an easy root conflict.
- Schema allows `provenance` to be optional for historical/manual seeds, but validator requires provenance for every generated record. This is intentional compatibility, but a schema-valid record can still fail corpus acceptance.
- `CambridgeWritingLevelSchema` includes `a2`, while the AI level config intentionally omits A2. Index/build scripts explicitly reject AI-generated A2. Keep this distinction when reporting totals.
- `status` defaults to `draft`; promotion status and provenance review status are separate fields. The final report's `draft/published/humanApproved` counts are status-based, not verification-based.

## Missing/weak test coverage

- `cambridge-writing-ai.test.mts` has 6 pipeline contract tests (plan, IDs, schema/provenance, cache isolation, schema-example hygiene, similarity), plus fixture-level similarity tests. It does not exercise real staged files across all 20 records or all validator level checks against malformed generated JSON.
- No provider integration is tested here (DeepSeek/Groq HTTP, timeout/retry, malformed envelope, rate-limit handling); current task scope explicitly avoids provider calls.
- No end-to-end test covers generate → verify/revise → promote → rebuild index → runtime catalog loading. Promotion and index scripts are only indirectly covered by reports/builds.
- No regression asserts manifest counts match seed + generated index, so the one-test manifest drift can recur unnoticed.
- C2 source-text word-boundary/capping and B1/B2/C1 presentation templates are validated structurally, but there is no renderer/browser assertion for every generated template/task.

## Evidence reviewed

`packages/catalog/src/cambridge/writing/schema.ts`; `scripts/writing/{cambridge-writing-level-config,plan,generate,verify,validate,promote,build-cambridge-writing-index}.mjs`; `scripts/writing/cambridge-writing-ai.test.mts`; `tmp/cambridge-writing-{validation-report,checkpoint-02-06,final-report}.json`.
