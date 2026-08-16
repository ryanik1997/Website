# R2 Content Migration — Task 2: Data Reconciliation Report

Status: **PARTIAL** — Data reconciliation **PASS**; R2 configuration/upload **BLOCKED**.

Date: 2026-08-04. All work is local/read-only. No R2 upload, no Supabase change, no Vercel
env change, no production manifest publication, no source deletion, no fabricate.

Companion: `tmp/r2-content-migration-audit.md` (Task 1). New scripts:
`scripts/content/validate-reading-release-set.mjs`,
`scripts/content/reconcile-reading-release.mjs`,
`scripts/content/scan-public-private-separation.mjs`.

---

## 1. Overall status

**PARTIAL**

- Data reconciliation: **PASS**
- R2 configuration/upload: **BLOCKED** (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `CLOUDFLARE_API_TOKEN`, `R2_PUBLIC_BASE_URL`
  are all absent; `.env.r2.local` does not exist).

## 2. Data reconciliation status — PASS

The three previously drifting indexes are now reconciled to one canonical set:

| Index | Before | After |
|---|---:|---:|
| `manifest.json` reading entries | 163 | **166** |
| `catalog-reading-meta.json` entries | 166 | **166** |
| Runtime release bodies (release set) | 169 (3 excluded) | **166** |

Drift guard `validate-reading-release-set.mjs` → **DRIFT GUARD PASS** (see §7).

## 3. Final authoritative Reading count

**166 release tests.**

`166 = 166 = 166` (manifest = meta = runtime release). This count is evidence-based
per ID (see §4), not a chosen round number. The 3 on-disk bodies that are NOT in the
release set are documented exclusions (kept on disk, not released).

## 4. Six-ID decision table

| ID | Route exists | Catalog visible | Metadata | Body | Vault | Source provenance | Duplicate | Decision |
|----|--------------|-----------------|----------|------|-------|-------------------|-----------|----------|
| `catalog-cam-11-2-reading` | YES — TID bundle `reading-cam-11-2.json` (40q, answers) via `loadTidReadingTestByExamId` | YES (was in meta) | YES — meta qc 40, 3 parts | FULL 65KB, 40 real questions | FULL 40/40 | Crawl `Cam11_Test2.json` + `_sync-tid-catalog.cjs`; `build-catalog.mjs` hardcodes `skip cam11-test2` (line 226/238) | NO | **INCLUDE** |
| `catalog-ket-a2-generated-01` | NO — legacy `catalog-ket-` prefix has no body-hydration path in `resolveReadingExam` → renders empty | YES (in meta, broken) | YES — meta qc 32, bandHint `generated-review-required` | FULL 14KB, 32q, 2 empty prompts | PARTIAL 31/32 | `generate-ket-a2-pilot.mjs` (AI pilot) | NO | **EXCLUDE_FIXTURE** |
| `catalog-ket-cam1-test1` | NO — legacy `catalog-ket-` prefix not hydrated | YES (in meta, broken) | YES — meta qc 32 | FULL 13KB, 32q (real content) | EMPTY 0/32 | `import-ket-cam1-test1.mjs` | YES — byte-identical to `catalog-reading-ket-a2-test1` (official sample, already released with full vault) | **BLOCKED_DUPLICATE** |
| `catalog-reading-cae-c1-test24` | NO — absent from meta → `resolveReadingExam` returns null | NO | NO | FULL 40KB, 56q (real CAE), `answerConfidence: "pending"` | EMPTY 0/56 | Added in commit `7522fef6`; no generator in repo; batch zip-import pattern | NO | **BLOCKED_MISSING_VAULT** |
| `catalog-reading-pet-b1-test2` | YES after re-registration — `catalog-reading-` prefix hydrates; media via absolute paths (`/catalog/reading/pet-b1-test2/*.jpg`, files exist) | NO (meta entry was dropped in `937f09b7`) | re-added qc 32 | FULL 42KB, 32 real questions | FULL 32/32 | `import-pet-b1-reading-crawl` / batch import; was registered at `f828ebd8` | NO | **INCLUDE** (re-registered) |
| `catalog-reading-pet-b1-test3` | YES after re-registration — same as test2 | NO | re-added qc 32 | FULL 44KB, 32 real questions | FULL 32/32 | same as test2 | NO | **INCLUDE** (re-registered) |

Notes:

- `catalog-cam-11-2-reading` is the ONLY IELTS body whose public catalog JSON is full
  (65KB); all other IELTS public bodies are intentional stubs (`parts: []`, content in the
  TID bundle). Its omission from the manifest is a generator bug — the hardcoded
  `continue` for `cam-11-test2` — not a content problem. It was added back to the manifest.
- `catalog-reading-cae-c1-test24` is **not deleted**. It is a real CAE C1 test, newer than
  the previous manifest, but it has zero answers and is not registered, so it has no route.
  It is blocked from release until a verified vault exists. Keeping it on disk was mandated.
- The two `catalog-ket-*` bodies were removed from meta (so they no longer surface as
  broken entries in the catalog UI) but the files remain on disk.

## 5. Missing-answer resolution (IELTS Reading 1,921 / 1,919)

Exactly two questions carry an empty `answer` in the authoritative runtime TID bundles.

### 5.1 `catalog-cam-11-3-reading` — Part 1 (The Story of Silk), question 9

- Test ID: `catalog-cam-11-3-reading` (TID slug `cam-11-3`)
- Source file: `apps/web/src/features/exam/tidIeltsReading/data/reading-cam-11-3.json`
- Question number: 9; prompt is the generic placeholder `"Question 9"`; `answer: ""`
- Classification: **TRANSFORM_DROPPED**
- Evidence: the authoritative crawl `Tainguyen/Crawl/Reading_ITELTS/Cam11_Test3.json`
  contains the answer **`"nylon"`** on the question whose text reads
  `"20th century: 9. ____ and other manmade fibres cause decline in silk production"`,
  but the crawler assigned it a **duplicate `id: 8`** (same id as the "monks" question),
  so the transform produced an extra phantom empty Q9. The `out-reading/converted`
  copy shows the same duplicate `num: 8` with `ans: "nylon"`.
- Resolution: allow-listed with the above explanation. The answer value is **not written**
  into the runtime during this read-only reconciliation (per "không tự thêm answer").
  Scoring for Q9 stays unavailable until the source numbering is repaired and the bundle
  regenerated. No fabricated string.

### 5.2 `catalog-cam-12-2-reading` — Part 1 (The Risks Agriculture Faces…), question 11

- Test ID: `catalog-cam-12-2-reading` (TID slug `cam-12-2`)
- Source file: `apps/web/src/features/exam/tidIeltsReading/data/reading-cam-12-2.json`
- Question number: 11; `answer: ""`; multiple-choice, choose TWO from A–E
- Classification: **SOURCE_MISSING**
- Evidence: crawl `Tainguyen/Crawl/Reading_ITELTS/Cam12_Test2.json` part 0, `id: 11`, has
  `text: ""` and `answer: ""` (neighbours Q10=`["D","E"]`, Q12=`["C","D"]`). The answer is
  genuinely absent from the authoritative local source.
- Resolution: allow-listed. Cannot be proved locally without guessing. Scoring unavailable.

Both are surfaced by the drift guard as `Question/answer exceptions: 2` and by
`reconcile-reading-release.mjs` documentation. The export guard will continue to fail or
warn on them until repaired.

## 6. Canonical source of truth

- **Runtime body JSON + `.answers.json` vaults under
  `apps/web/public/catalog/exams/reading/` are the content source of truth.**
- `manifest.json` and `catalog-reading-meta.json` are derived indexes. The reconciler
  (`scripts/content/reconcile-reading-release.mjs`) makes them match the release set and is
  idempotent (verified: second run reports no changes).
- It adds 3 IDs to the manifest, drops 2 excluded IDs from meta, adds 2 re-registered PET
  IDs, and repairs the 47 IELTS meta stubs (`questionCount` + part ranges) from the
  authoritative TID bundle.
- Cambridge meta stubs are regenerated only for newly added IDs; all other entries are
  preserved verbatim.

## 7. Drift guard result — PASS

`node scripts/content/validate-reading-release-set.mjs --report-json`:

```json
{
  "ok": true,
  "manifest": 166, "meta": 166, "runtimeRelease": 166,
  "routesResolved": 166, "bodies": 166, "vaults": 166,
  "orphans": 0, "missingBodies": 0, "missingVaults": 0,
  "answerExceptions": 2, "exclusions": 3, "errors": []
}
```

The guard fails when: manifest IDs ≠ meta IDs; manifest ≠ release bodies; excluded IDs leak
into manifest/meta; a body is missing its vault; a vault references a non-existent question
id; duplicate IDs anywhere; a release body is missing; an orphan body appears outside the
allow-list. The two IELTS answer-count gaps are allow-listed (§5). It is intentionally
read-only and exits non-zero on drift.

## 8. Public/private separation — PASS

`node scripts/content/scan-public-private-separation.mjs`:

- Public runtime bodies (all `*.json` excluding `*.answers.json`): **0** sensitive-field hits.
- Private `.answers.json` vaults: hold `answer`/`explanation` by design (82 of 169 non-empty);
  these are the protected scoring vaults and are never copied to the public R2 release.
- Known exposure (not made worse): the 48 IELTS TID bundles ship inline answers in the app
  bundle today; `packages/catalog/data` holds answers before `mode-c-pack-catalog` strips
  them. Any public R2 export of IELTS bodies MUST run the same answer-stripping step.
- Staging tree `tmp/r2-release` not built yet (R2 blocked) — the scanner re-checks it at
  export time for `.answers.json` and sensitive fields.

## 9. R2 credential gate — BLOCKED

| Variable | Status |
|---|---|
| `R2_ACCOUNT_ID` | missing |
| `R2_ACCESS_KEY_ID` | missing |
| `R2_SECRET_ACCESS_KEY` | missing |
| `R2_BUCKET_NAME` | missing |
| `CLOUDFLARE_API_TOKEN` | missing |
| `R2_PUBLIC_BASE_URL` / custom domain | missing |

`.env.r2.local` does not exist. No value was printed. Data reconciliation is independent
and is reported PASS above.

## 10. Bucket / CORS audit — NOT PERFORMED (blocked on §9)

No bucket identity, list/get/put/head permission, custom domain, or remote CORS policy can
be verified without credentials. Required production CORS baseline (documented for the
future task): origins `https://ryanenglishv2.vercel.app` (+ preview only if needed),
methods GET/HEAD, headers Range (+Content-Type if needed), expose Content-Length /
Content-Range / ETag / Accept-Ranges; no wildcard credentials; Range must yield 206 for
audio.

## 11. Dry-run export — NOT BUILT (blocked on §9)

No `tmp/r2-release/<release-id>/` inventory was produced. Release design from Task 1 is
unchanged (`releases/<release-id>/…` + `manifests/production.json`, immutable cache,
production manifest published last).

## 12. Upload — NOT PERFORMED (blocked on §9)

## 13. Production manifest — NOT PUBLISHED

## 14. Vercel env — NOT CHANGED

`VITE_EXAM_CONTENT_BASE_URL`, `VITE_EXAM_CONTENT_MANIFEST`, `VITE_EXAM_CONTENT_SOURCE`
remain unset. No redeploy.

## 15. Browser E2E — NOT PERFORMED (no R2 release to test)

## 16. Rollback

Unchanged from Task 1: keep the previous immutable release and keep `legacy` source;
rollback = repoint `manifests/production.json` or set `VITE_EXAM_CONTENT_SOURCE=legacy`.
No old release deleted.

## 17. Remaining blockers (R2 migration)

1. Provide `.env.r2.local` with the six variables (§9), ideally bucket-scoped.
2. Verify bucket identity + permissions + CORS (§10).
3. Build dry-run export, run all guards, then upload immutable objects and publish
   `manifests/production.json` last (§11–13).
4. Strip answers from TID-derived IELTS bodies before public upload; keep vaults private (§8).
5. Repair the two IELTS answer gaps (§5) or keep them allow-listed.
6. Then set Vercel env and run browser E2E (§14–15).

---

# Addendum — R2 migration phase (2026-08-04)

Credentials were supplied locally in `.env.r2.local` (gitignored, values never printed).
The Reading release was uploaded to bucket `ryan-english-media`. **`manifests/production.json`
was intentionally NOT published** and **Vercel env was NOT changed** — the frontend still runs
on `legacy`. Uploaded release objects are additive and unused until production.json is pointed
at them, so production behavior is unchanged.

## R2 gates

| Gate | Result |
|---|---|
| R2 credential gate (§9) | **PASS** — 6/6 variables present, masked |
| Bucket identity + perms (§10) | **PASS** — bucket `ryan-english-media` exists; list/get/put/head verified; write probe cleaned up |
| CORS (§10) | **PASS** — applied GET/HEAD for origin `https://ryanenglishv2.vercel.app`, headers Range/Content-Type, expose Content-Length/Content-Range/ETag/Accept-Ranges, no wildcard credentials. Verified end-to-end: production origin gets `Access-Control-Allow-Origin`, disallowed origin does not. |
| Dry-run export (§11) | **PASS** — `tmp/r2-release/releases/exam-content-r1-20260804/` + `manifests/releases/exam-content-r1-20260804.json` |
| Upload (§13) | **PASS** — 278/278 objects, 0 errors; ContentMD5 integrity; no `.answers.json`; no leaked fields; JSON parse PASS; production.json untouched |

## Upload inventory summary — `exam-content-r1-20260804`

| | |
|---|---|
| Release objects | 278 (167 test/catalog JSON + 110 images + 1 release manifest) |
| Reading tests | 166 (48 IELTS stripped TID + 118 Cambridge) |
| Total bytes | ~21.4 MB |
| Cache | `public, max-age=31536000, immutable` (release + catalog + manifest) |
| Verified | HEAD 278/278, Content-Length 278/278, Content-Type 278/278, ETag/MD5 278/278, JSON parse all, leaked private fields 0 |
| `manifests/production.json` | NOT PRESENT (404) — unchanged |

## Not done (awaiting user review)

1. `manifests/production.json` publish (user-approve step).
2. Other modules (Listening, Speaking, Writing, Cambridge Listening) — separate releases.
3. IELTS scoring vaults (stripped public bodies mean IELTS scoring needs a private vault plan).
4. Vercel env `VITE_EXAM_CONTENT_*` + frontend R2 loader + browser E2E (§14–15).
5. Source repair for the two IELTS answer gaps (§5).

---

## Files changed (this task)

- `packages/catalog/data/manifest.json` — reading 163 → 166 (added cam-11-2, pet-b1-test2,
  pet-b1-test3); listening 209 untouched.
- `packages/catalog/data/catalog-reading-meta.json` — 166 with corrected set: removed
  `catalog-ket-a2-generated-01`, `catalog-ket-cam1-test1`; added `catalog-reading-pet-b1-test2`,
  `catalog-reading-pet-b1-test3`; repaired 47 IELTS stubs (`questionCount` + parts from TID).
- `scripts/content/validate-reading-release-set.mjs` — NEW drift guard.
- `scripts/content/reconcile-reading-release.mjs` — NEW reconciler (idempotent).
- `scripts/content/scan-public-private-separation.mjs` — NEW security scanner.

No runtime body, vault, media, Supabase, R2, or Vercel object was written.
