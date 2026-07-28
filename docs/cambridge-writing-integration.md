# Cambridge Writing integration

Generated on July 27, 2026.

## Current state

1. `apps/web/src/features/exam/ExamTrackPage.tsx` uses `ExamSkillPicker` for Cambridge level pages.
2. Writing Cambridge already existed in the app, but it was organized as:
   - `/app/writing/cambridge`
   - `/app/writing/cambridge/:level`
   - `/app/writing/cambridge/:level/:genre`
3. This task switches the level route into a real test library and adds:
   - `/app/writing/cambridge/:level/:testId`
   - `/app/writing/cambridge/:level/:testId/:taskId`
4. The existing editor/grading flow is reused:
   - `WritingEditor`
   - `ScorePanel`
   - `writingRepo`
   - `writingStore`

## Data source decision

The local crawl folders are currently empty:

- `D:\App-English-Ryan\Crawl\Writing_Crawl\B1`
- `D:\App-English-Ryan\Crawl\Writing_Crawl\B2`
- `D:\App-English-Ryan\Crawl\Writing_Crawl\C1`
- `D:\App-English-Ryan\Crawl\Writing_Crawl\C2`

So the project is seeded from real CEQ Inspera captures stored in:

- `docs/research/ceq.inspera.com/writing/b1.questions.json`
- `docs/research/ceq.inspera.com/writing/b2.questions.json`
- `docs/research/ceq.inspera.com/writing/c1.questions.json`
- `docs/research/ceq.inspera.com/writing/c2.questions.json`

## Seed coverage

- `b1`: 1 test, 3 tasks
- `b2`: 1 test, 4 tasks
- `c1`: 1 test, 4 tasks
- `c2`: 1 test, 4 tasks

## Catalog layer

New package catalog module:

- `packages/catalog/src/cambridge/writing/schema.ts`
- `packages/catalog/src/cambridge/writing/seedData.ts`
- `packages/catalog/src/cambridge/writing/index.ts`

This layer now owns:

- normalized collections
- per-level manifest counts
- Zod validation
- seed-level helper lookup functions

## Import flow

Importer entry:

- `scripts/import-cambridge-writing.ts`

Current importer behavior:

1. validates the seed collections
2. scans local crawl folders
3. records that those folders are empty
4. writes `data-import/cambridge-writing-inventory.json`
5. writes generated JSON snapshots under `packages/catalog/src/cambridge/writing/`

This keeps runtime away from direct `D:\` reads.

## Runtime behavior

The Writing card now appears on Cambridge level pages for:

- `b1`
- `b2`
- `c1`
- `c2`

The card count comes from `CAMBRIDGE_WRITING_MANIFEST`, not hard-coded UI text.

When opening a task workspace:

1. the app looks for an existing `writingDoc` with matching `sourceMeta.taskId`
2. if none exists, it creates one automatically
3. the document is tagged with:
   - `examFamily=cambridge`
   - `level`
   - `testId`
   - `taskId`
   - `genre`
   - `sourcePromptId`

## Remaining gaps

1. The importer is still seed-first because the original crawl folders are empty.
2. Prompt images are not yet localized into `apps/web/public/exams/cambridge/writing/...`.
3. The older genre-based Cambridge Writing pages still exist in the repo but are no longer the active routing path.
