# R2 Static Exam Content Migration — Task 1 Audit

## Status: BLOCKED (configuration gate)

Audit date: 2026-08-02. Production frontend: `https://ryanenglishv2.vercel.app`.

No Supabase migration/history/schema/database operation was performed. No source content was deleted or uploaded.

## Executive findings

1. Static exam content is **not all in Supabase**. The repository currently uses four distinct sources:
   - generated catalog JSON and answer vaults under `apps/web/public/catalog/exams/`;
   - package stubs/meta under `packages/catalog/data/`;
   - eagerly bundled IELTS Reading JSON via `import.meta.glob`;
   - bundled TypeScript IELTS Speaking pools;
   - IELTS Writing bank from `/catalog/writing/tid/tasks.json`, resolved through protected media.
2. `.vercelignore` excludes `apps/web/public/catalog/**`, while production catalog stubs use signed Supabase `exam-media` paths for body/vault hydration. The Vercel build deliberately relies on committed package stubs plus remote content.
3. Cloudflare R2 is already used only for catalog listening audio through a hard-coded public `r2.dev` URL. That is not a complete exam-content data layer.
4. No Wrangler configuration was found. The repo has `@aws-sdk/client-s3` and R2 diagnostic/audio upload scripts.
5. Required R2 account/bucket credentials are unavailable in the current process/local env files, and the bucket name cannot be safely proven.
6. Vercel has none of the new content variables: `VITE_EXAM_CONTENT_BASE_URL`, `VITE_EXAM_CONTENT_MANIFEST`, `VITE_EXAM_CONTENT_SOURCE`.
7. Because the R2 identity/credentials gate failed, Task 1 stopped before exporter/upload implementation. No production manifest was published.

## Content inventory before migration

Counts below are live repository/runtime counts, not assumptions. “Questions/answers” for catalog modules were read from runtime body files and separate answer vaults. Asset counts are unique references in test JSON, not necessarily unique physical blobs across all directories.

| Module | Source type | Local path/table | Tests/items | Questions | Answers | Assets | Dynamic import | Target R2 prefix |
|---|---|---|---:|---:|---:|---|---|---|
| IELTS Reading | Eager Vite JSON bundle | `apps/web/src/features/exam/tidIeltsReading/data/reading-cam-*.json` | 48 tests | 1,921 | 1,919 | 0 image refs detected | `import.meta.glob(..., { eager: true })`; route module itself lazy-loaded | `ielts/reading/academic/` |
| IELTS Listening | Generated catalog body + private answer vault | `apps/web/public/catalog/exams/listening/catalog-listening-ielts-*.json`; `.answers.json` | 48 tests | 1,920 | 1,920 | 48 audio refs; 15 image refs | body/answer loaders dynamically imported | `ielts/listening/academic/` |
| IELTS Speaking | TypeScript curated pools | `apps/web/src/features/speaking-ielts/data/part1.ts`, `part2.ts`, `part3.ts`, `speakingPools.ts` | 170 / 105 / 340 items | n/a | n/a | supporting JSON exists; no required audio bank in pool contract | route lazy-loaded; pools statically bundled inside route chunk | `ielts/speaking/` |
| IELTS Writing | Protected generated JSON + image bank | `apps/web/public/catalog/writing/tid/tasks.json` | 356 tasks (236 Task 1, 120 Task 2) | n/a | n/a | 352 image refs | protected-media resolver dynamically imported | `ielts/writing/academic/` |
| Cambridge Reading A2 | Generated body + answer vault | `apps/web/public/catalog/exams/reading/` | 25 | 780 | 780 | 86 image refs | body/vault loaders dynamic | `cambridge/reading/a2/` |
| Cambridge Reading B1 | Generated body + answer vault | same | 40 | 1,280 | 1,280 | 11 image refs | body/vault loaders dynamic | `cambridge/reading/b1/` |
| Cambridge Reading B2 | Generated body + answer vault | same | 27 | 1,404 | 1,404 | 0 asset refs | body/vault loaders dynamic | `cambridge/reading/b2/` |
| Cambridge Reading C1 | Generated body + answer vault | same | 23 | 1,290 | 1,290 | 2 image refs | body/vault loaders dynamic | `cambridge/reading/c1/` |
| Cambridge Reading C2 | Generated body + answer vault | same | 1 | 57 | 57 | 2 image refs | body/vault loaders dynamic | `cambridge/reading/c2/` |
| Cambridge Listening A2 | Generated body + answer vault | `apps/web/public/catalog/exams/listening/` | 1 | 25 | 25 | 1 audio, 5 image refs | body/vault loaders dynamic | `cambridge/listening/a2/` |
| Cambridge Listening B1 | Generated body + answer vault | same | 33 | 825 | 825 | 129 audio, 231 image refs | body/vault loaders dynamic | `cambridge/listening/b1/` |
| Cambridge Listening B2 | Generated body + answer vault | same | 96 | 2,880 | 2,880 | 381 audio, 1 image ref | body/vault loaders dynamic | `cambridge/listening/b2/` |
| Cambridge Listening C1 | Generated body + answer vault | same | 31 | 930 | 930 | 121 audio refs | body/vault loaders dynamic | `cambridge/listening/c1/` |
| Cambridge Listening C2 | No manifest/runtime entries found | n/a | 0 | 0 | 0 | 0 | n/a | `cambridge/listening/c2/` (must remain absent, not fabricated) |

Global generated manifest currently contains **163 Reading** and **209 Listening** entries. All manifest-referenced body files were present in `apps/web/public/catalog/exams/{skill}` during this audit.

Reading has a separate pre-export index drift that must be reconciled before selecting an authoritative release set:

| Reading source | Count |
|---|---:|
| `manifest.json` entries | 163 |
| `catalog-reading-meta.json` entries | 166 |
| Runtime body JSON files | 169 |

Meta but not manifest: `catalog-cam-11-2-reading`, `catalog-ket-a2-generated-01`, `catalog-ket-cam1-test1`.

Runtime but not manifest additionally includes `catalog-reading-cae-c1-test24`, `catalog-reading-pet-b1-test2`, and `catalog-reading-pet-b1-test3`. An R2 exporter must fail on this drift rather than silently upload whichever directory happens to contain more files.

### Count caveats that must become export guards

- IELTS Reading has 1,921 questions but only 1,919 non-empty answers. The two missing answers must be identified and explicitly resolved or allow-listed before release validation can pass.
- Runtime generated catalog bodies have separate answer vaults. Public R2 export must never copy `.answers.json` into the public release.
- Source/package JSON can still contain inline answers before `mode-c-pack-catalog` strips them. Export must use the runtime body/vault separation or run the same stripping logic.
- No Cambridge Listening C2 corpus exists in the current manifest. An exporter must assert the current baseline rather than fabricate content.
- Reading manifest/meta/runtime disagree at 163/166/169. The release source set must be explicitly reconciled before export.

## Current data flow and routes

| Capability | Route | Current data selection |
|---|---|---|
| Exam catalog | `/app/exam/track/:trackId/:arg2?/:arg3?` | `@ryan/catalog` generated stubs/meta plus IndexedDB/published Supabase rows where applicable |
| Reading test | `/app/exam/reading/:examId` | catalog stubs hydrate through `catalogExamBody.ts`; IELTS CAM IDs additionally map to bundled TID JSON |
| Listening test | `/app/exam/listening/:examId` | catalog stubs hydrate through `catalogExamBody.ts`; media is resolved separately |
| IELTS Speaking | `/app/speaking/ielts/*` | bundled TypeScript pools |
| IELTS Writing library | `/app/writing` and `/app/writing/practice/:track` | `/catalog/writing/tid/tasks.json` through `resolvePlayableMediaUrl` |

Catalog body loading currently calls `resolvePlayableMediaUrl('/catalog/exams/...')`. In production signed mode, this invokes Supabase Edge Function `content-sign` for private bucket `exam-media`. Listening MP3 paths under `catalog/listening/` are special-cased to public R2.

## Answer-key security

| Source | Current state | Task 1 rule |
|---|---|---|
| Generated Reading/Listening runtime | bodies and `.answers.json` vaults are separate; vault paths are forced signed/private | Public R2 may receive stripped bodies only. Vaults must remain in current private scoring source until private R2/backend is designed. |
| IELTS Reading bundled TID JSON | answer/explanation fields are shipped in frontend route bundle | Record as existing exposure; do not make it worse. A future exporter should strip answers from public objects and preserve current scoring until a private vault exists. |
| IELTS Speaking | no answer keys | public content candidate |
| IELTS Writing | prompts/guides/images; user essays remain IndexedDB/Supabase | prompts/assets can be public if licensing permits; user documents never move to R2 |

## Ignore/deployment effects

### `.gitignore`

- ignores all `.env.*` except examples;
- ignores `Tainguyen/` raw source;
- ignores bulk MP3/WAV and several listening media trees;
- therefore Git is not a complete source for raw audio.

### `.vercelignore`

Explicitly excludes:

- `apps/web/public/catalog/**`
- `apps/web/public/data/**`
- `apps/web/public/books/**`
- `apps/web/public/ielts-wizard/**`
- all local environment files.

Production must therefore obtain excluded protected content remotely. This is a concrete deployment fact, but not by itself proof of the user-visible IELTS failure.

## R2 configuration audit

| Item | Result |
|---|---|
| Existing public development URL | `https://pub-5f3…dbea.r2.dev` (masked; currently hard-coded in media code/scripts) |
| Custom domain | Not found / cannot prove |
| Bucket name | Not available / cannot prove |
| Account ID | Missing from current environment |
| Access key ID | Missing from current environment |
| Secret access key | Missing from current environment |
| Cloudflare API token | Missing from current environment |
| Wrangler config | None found |
| Upload tooling | AWS SDK scripts exist for CAE/listening assets only |
| S3 client dependency | `@aws-sdk/client-s3` already present |
| CORS configuration | No repository definition found; remote policy cannot be audited without bucket access |
| Production Vercel content env | All three required variables missing |

No secret value was printed or written to this report.

One known CAE audio object was probed with production `Origin` plus a byte range. It returned `206`, `audio/mpeg`, `Accept-Ranges: bytes`, the correct 1,024-byte partial length, and immutable one-year cache control. The response did **not** include `Access-Control-Allow-Origin`, so generic browser `fetch`/HEAD CORS requirements are not yet satisfied/proven even though direct media playback may work without a CORS-enabled media element.

## Production issue diagnosis

### Evidence obtained

- Production deployment itself is Ready at `https://ryanenglishv2.vercel.app`.
- Automated unauthenticated probing from this environment receives Vercel Security Checkpoint HTTP `429`, so authenticated browser Network evidence for the IELTS catalog could not be captured.
- Production has only Supabase frontend variables; it has no R2 exam-content source/base/manifest variables.
- The current frontend has no shared R2 exam-content loader or feature flag.
- Generated public catalog directories are excluded from Vercel deployment.

### Conclusion

The specific user-visible “IELTS bank missing” root cause is **not yet proven**. Plausible paths include failed signed Supabase hydration, absent remote storage objects, auth/plan errors, or the bundled/catalog ID split. There is no evidence yet of an R2 manifest 404/CORS issue because production does not use an R2 manifest at all.

A production authenticated Network capture is still required. Do not label this “caused by Supabase migration” without that evidence.

## Required object-key and release design

Task 1 should use immutable release roots:

```text
releases/<release-id>/ielts/reading/academic/catalog.json
releases/<release-id>/ielts/reading/academic/<stable-test-id>.json
releases/<release-id>/ielts/listening/academic/catalog.json
releases/<release-id>/ielts/listening/academic/<stable-test-id>.json
releases/<release-id>/ielts/listening/academic/<stable-test-id>/audio/<filename>
releases/<release-id>/ielts/listening/academic/<stable-test-id>/images/<filename>
releases/<release-id>/ielts/speaking/catalog.json
releases/<release-id>/ielts/speaking/part1.json
releases/<release-id>/ielts/speaking/part2.json
releases/<release-id>/ielts/speaking/part3.json
releases/<release-id>/ielts/writing/academic/catalog.json
releases/<release-id>/ielts/writing/academic/<stable-test-id>.json
releases/<release-id>/cambridge/{reading|listening}/{a2|b1|b2|c1|c2}/...
manifests/releases/<release-id>.json
manifests/production.json
```

Release objects and release catalogs: `public, max-age=31536000, immutable`.

Production manifest: `public, max-age=60, must-revalidate` and published last.

## Safety gate and blockers

Per specification, missing R2 bucket identity/credentials requires **BLOCKED**. The following are required before upload implementation/execution can be verified:

1. `R2_ACCOUNT_ID`
2. `R2_ACCESS_KEY_ID`
3. `R2_SECRET_ACCESS_KEY`
4. `R2_BUCKET_NAME`
5. Confirmed public custom domain or approved public `r2.dev` URL
6. Read/write permissions limited to the intended bucket/prefix
7. Existing bucket CORS policy or permission to configure it
8. Licensing confirmation that the static Cambridge/IELTS content is permitted in a public bucket

The credentials must be supplied through ignored local environment configuration or CI/Vercel secrets, never committed.

## Work deliberately not performed

- No Supabase schema/history/database change.
- No R2 upload.
- No production manifest publication.
- No source deletion.
- No Vercel env mutation or redeploy.
- No frontend switch to an unverified R2 source.
- No claim that public/private answer-key separation is complete.

## Rollback design for the future release

Until R2 is verified, production remains on `legacy`. Future rollout must preserve both rollback controls:

1. repoint `manifests/production.json` to the previous immutable release; or
2. set `VITE_EXAM_CONTENT_SOURCE=legacy` and redeploy.

No old release or legacy source should be deleted during Task 1.
