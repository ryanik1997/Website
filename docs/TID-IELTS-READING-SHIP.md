# Ship: TID IELTS Reading shell → Ryan English web

**Date:** 2026-07-16  
**Source:** `ai-website-cloner-template` reading practice clone  
**Target:** `apps/web` route `/app/exam/reading/:examId` for **IELTS** exams

## What changed

1. **New module** `apps/web/src/features/exam/tidIeltsReading/`
   - `TidIeltsReadingExam.tsx` — TID practice UI (split panes, notes/matching/TFNG, timer, resizer)
   - `data/reading-cam-*.json` — 48 Cam 9–20 tests (enriched from TID API)
   - `loadTidReadingTest.ts` — maps exam ids → `cam-{book}-{test}`
   - CSS for bold/align

2. **`ReadingTest.tsx`**
   - When `isIeltsReading` and TID data exists → render `TidIeltsReadingExam`
   - KET/PET/FCE/CAE/CPE shells unchanged

3. **Catalog data** `packages/catalog/data/reading-ielts-cam*-test*.json`
   - Rebuilt from TID JSON (passageHtml + block fields preserved for future)

## URL mapping

| App exam id | TID data |
|-------------|----------|
| `catalog-cam-9-1-reading` | `cam-9-1` |
| `catalog-cam-18-1-reading` | `cam-18-1` |
| `reading-ielts-cam19-test2` | `cam-19-2` |

Open: `/app/exam/reading/catalog-cam-9-1-reading`  
Library: `/app/exam/track/ielts` → Reading

## Verify

```bash
pnpm --filter web dev
# open IELTS Reading Cam 9 Test 1
```

```bash
pnpm --filter web exec tsc --noEmit
```

## Not in this ship

- Full mock session score wiring for TID answers (optional next)
- Bookmark / entity dictionary / report screen parity with theieltsdictionary.com
- Replacing Cambridge KET–CPE reading shells
