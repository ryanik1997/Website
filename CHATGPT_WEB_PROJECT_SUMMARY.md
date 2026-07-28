# Ryan English Website - Project Summary for ChatGPT Web

## 1. Project goal

This is a large English-learning web app focused on:

- Vocabulary study with SRS
- Reading practice
- Listening practice
- Writing practice
- Cambridge-style exam simulations
- Admin tools for importing, publishing, and reviewing exam content

The current immediate task is **UI/layout fidelity for PET B1 Reading**, especially making the local page match a crawled Inspera/Cambridge-style reference as closely as possible.

---

## 2. Tech stack

- Monorepo with `pnpm`
- Frontend: `Vite + React + TypeScript`
- Local data: `Dexie` / IndexedDB
- Backend/auth/storage: `Supabase`
- Media hosting: `Cloudflare R2`
- Deployment: `Vercel`

Main folders:

- `apps/web/` - main React app
- `packages/core/` - shared business logic
- `packages/db/` - Dexie schema and sync logic
- `packages/ui/` - shared UI components
- `server/` - local server utilities/APIs
- `supabase/migrations/` - SQL migrations

---

## 3. App structure

Important routes:

- `/` - landing page
- `/app/*` - authenticated app
- `/app/exam/*` - exam experiences
- `/app/admin/*` - admin/import/publish/performance tools

The app has many exam runners for Cambridge-like flows:

- KET Reading/Listening
- PET Reading/Listening
- FCE/CAE/CPE
- IELTS

The user often wants **one exam type to visually match another**, for example:

- PET Reading should resemble Inspera/Cambridge shell
- PET Reading can borrow shell/layout cues from KET Listening A2 if they are visually close

---

## 4. Current high-priority issue

### PET B1 Reading layout is still not 100% matching the target

Target local route:

- `http://localhost:5173/app/exam/reading/catalog-reading-pet-b1-test1`

Reference assets:

- Desired screenshot: `D:\App-English-Ryan\Website\Fixbug\Bug_3\want.png`
- Current/older screenshot: `D:\App-English-Ryan\Website\Fixbug\Bug_3\hientai.jpg`

Reference crawl/source material:

- `D:\App-English-Ryan\Crawl\PET_B1_Reading\Layout`

The user says the page is **close but not identical yet**, and wants it to look like the `want` image as closely as possible.

### Important extra reference

The user specifically said:

- "Tham khảo thêm layout của KET Listening A2. Nó rất giống"

So the KET Listening shell is a strong visual reference for:

- header height/proportions
- footer proportions
- part tabs
- question navigation pills
- Cambridge-style spacing and flatness

Relevant KET Listening source files:

- `apps/web/src/features/exam/ListeningKetTest.tsx`
- `apps/web/src/features/exam/ListeningPetTest.tsx`
- `apps/web/src/features/exam/listeningTest.css`

Relevant PET Reading source files:

- `apps/web/src/features/exam/petRw/ReadingPetRwTest.tsx`
- `apps/web/src/features/exam/petRw/readingPetRw.css`

---

## 5. What has already been done for the PET Reading issue

### Crawl and reference capture

The Inspera PET B1 Reading page was crawled from:

- `https://ceq.inspera.com/player/?assessmentRunId=160272732&context=exam#/section/8847633289244/question/143495812`

Artifacts were saved into:

- `D:\App-English-Ryan\Crawl\PET_B1_Reading\Layout`

Saved artifacts include:

- screenshots
- rendered HTML
- CSS/styles
- page text
- design tokens
- component/topology notes
- network log
- API responses
- question HTML
- question media

### PET Reading implementation changes already made

Recent PET Reading work has already:

- cleaned up `ReadingPetRwTest.tsx`
- cleaned up `readingPetRw.css`
- restructured page into `header -> rubric -> content -> footer`
- moved PET Reading closer to an Inspera/Cambridge shell
- then refined it again to borrow more from KET Listening A2 shell

Recent shell refinements include:

- header moved toward a Cambridge/KET-style 72px grid
- title/range information moved into the center area
- footer changed to a flatter Cambridge-style 2-column shell
- part tabs flattened
- question nav pills made smaller and closer to KET Listening style
- submit/check button isolated on the right

TypeScript check passed after these changes:

- `pnpm --filter web exec tsc --noEmit`

---

## 6. Current blocker for visual verification

Automated Playwright comparison is blocked because the local route redirects to login in headless browser automation.

Problem:

- opening `http://localhost:5173/app/exam/reading/catalog-reading-pet-b1-test1` in automated smoke testing redirects to the login page

Impact:

- no reliable automated screenshot of the authenticated PET Reading page yet
- visual alignment is currently being done by code inspection + static reference comparison, not a final logged-in browser screenshot

So a good next step is:

1. Open a logged-in browser session manually
2. Visit the PET Reading route
3. Compare directly against `want.png`
4. Fine-tune spacing and shell details

---

## 7. Other known project issues

These are active or recently noted issues outside the PET Reading layout:

- Local data sometimes appears missing; likely related to origin/account/session confusion rather than intentional deletion
- Google login still needs smoke testing on localhost and production
- Some local dependency/type issues were previously noted in the environment
- Old Supabase audio is gone, but R2 audio is available

There were also previous performance and optimization tasks that are already mostly handled:

- Admin SPA performance tracking
- Vocab page TBT optimization
- Listening transcript sync and segment timing

Those are not the main issue right now.

---

## 8. Relevant design intent

The user cares a lot about:

- visual fidelity
- matching real exam UI closely
- Cambridge/Inspera-like shell behavior
- not just approximate styling, but near pixel-level similarity

For the PET Reading page, the most likely remaining mismatches are:

- exact header spacing
- footer height and alignment
- part tab width/spacing
- question nav pill sizing/placement
- rubric spacing
- image/question vertical rhythm

---

## 9. What kind of help is needed from ChatGPT Web

Please analyze this as a **UI fidelity / exam-runner shell matching problem**, not a generic React refactor.

Helpful output would be:

1. A concrete plan to make PET Reading match the reference more closely
2. Specific CSS/layout adjustments likely still missing
3. Advice on how to systematically compare PET Reading shell vs KET Listening shell
4. Suggestions for how to structure the header/footer so PET Reading can reuse more of the Cambridge shell pattern
5. Any likely causes of "still feels off" even after large CSS cleanup

Please focus on:

- layout fidelity
- spacing fidelity
- shell consistency
- component reuse strategy

Avoid suggesting broad rewrites unless clearly necessary.

---

## 10. Most relevant files to inspect first

- `apps/web/src/features/exam/petRw/ReadingPetRwTest.tsx`
- `apps/web/src/features/exam/petRw/readingPetRw.css`
- `apps/web/src/features/exam/ListeningKetTest.tsx`
- `apps/web/src/features/exam/ListeningPetTest.tsx`
- `apps/web/src/features/exam/listeningTest.css`
- `session_summary.md`

Reference files/assets:

- `D:\App-English-Ryan\Website\Fixbug\Bug_3\want.png`
- `D:\App-English-Ryan\Website\Fixbug\Bug_3\hientai.jpg`
- `D:\App-English-Ryan\Crawl\PET_B1_Reading\Layout`

---

## 11. Short summary

This is a React/Vite English-learning app with a large exam system. The current problem is that the PET B1 Reading local page is improved but still not visually identical to a crawled Inspera/Cambridge reference. The best comparison model inside the codebase is KET Listening A2 shell/layout, which is visually very similar. The task is to close the remaining fidelity gap without unnecessary rewrites.
