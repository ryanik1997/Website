### Ðã hoàn thành (mới nhất — FCE B2 Reading crawl pages 2–26 đã normalize vào catalog)

- Thêm converter riêng `scripts/reading/convert-fce-b2-pages-to-parts.mjs` + core module `scripts/reading/fce-b2-pages-to-parts.mjs` để chuyển crawl JSON `pages` của `D:\App-English-Ryan\Tainguyen\Import Cambridge\FCE_B2\Reading\fce-reading-test2..26` sang schema `ReadingExam.parts`.
- Converter đọc 25 test, ghép answer page theo `questionNumber`, validate 7 parts / 1300 câu, và xuất đủ report tạm:
  - `tmp/fce-b2-test1-schema.json`
  - `tmp/fce-b2-pages-inventory.json`
  - `tmp/fce-b2-conversion-report.json`
  - `tmp/fce-b2-conversion-report.md`
- `scripts/build-catalog.mjs` nay gọi converter FCE B2 Reading cho test 2–26 thay vì đọc raw crawl pages trực tiếp, nên build lại không còn ghi shell `parts: []`.
- Verify hiện tại:
  - `node scripts/reading/convert-fce-b2-pages-to-parts.mjs --from=2 --to=26` PASS
  - `node scripts/build-catalog.mjs` PASS
  - `pnpm --filter web exec tsc --noEmit` PASS
- Kết quả data thật:
  - `packages/catalog/data/reading-fce-b2-test2.json` … `reading-fce-b2-test26.json` đều có `parts.length === 7`
  - title đã giữ đúng `FCE B2 Reading — Book X — Test N`

### Lỗi còn tồn tại

- `node scripts/build-catalog.mjs` vẫn tạo nhiều warning CRLF khi ghi lại catalog JSON.
- Git worktree còn một file tạm do môi trường tạo ra: `~$skills-inventory.xlsx` đã bị builder chạm tới trạng thái xóa.

### Next session start prompt

FCE B2 Reading crawl pages 2–26 đã được normalize và build lại thành catalog thật. Nếu cần làm tiếp, kiểm tra:
1. `packages/catalog/data/reading-fce-b2-test13.json`
2. `packages/catalog/data/reading-fce-b2-test26.json`
3. `tmp/fce-b2-conversion-report.json`

Route để smoke:
- `/app/exam/track/cambridge/b2/reading`
- `/app/exam/reading/catalog-reading-fce-b2-test2`
- `/app/exam/reading/catalog-reading-fce-b2-test13`
- `/app/exam/reading/catalog-reading-fce-b2-test26`
### Ðã hoàn thành (m?i nh?t — FCE B2 Reading bundle dã du?c sync vào app)

- Ch?y `node scripts/build-catalog.mjs` d? d?ng b? catalog t? `D:\App-English-Ryan\Tainguyen` vào app.
- FCE B2 Reading `catalog-reading-fce-b2-test1` hi?n dã có trong:
  - `packages/catalog/data/reading-fce-b2-test1.json`
  - `packages/catalog/data/catalog-reading-meta.json`
  - `apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test1.json`
  - `apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test1.answers.json`
- `packages/catalog/data/manifest.json` du?c refresh `builtAt` theo l?n build m?i nh?t.

### L?i còn t?n t?i

- `node scripts/build-catalog.mjs` hi?n v?n t?o r?t nhi?u warning CRLF khi ghi l?i các file catalog JSON.
- Git worktree còn m?t file t?m do môi tru?ng t?o ra: `~$skills-inventory.xlsx` dã b? builder ch?m t?i tr?ng thái xóa.

### Next session start prompt

FCE B2 Reading dã du?c sync vào app b?ng build-catalog. Tru?c khi s?a ti?p, ki?m tra:
1. `packages/catalog/data/manifest.json`
2. `packages/catalog/data/catalog-reading-meta.json`
3. `apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test1.json`

N?u c?n m? r?ng thêm, import ti?p các bundle FCE B2 Reading khác t? `D:\App-English-Ryan\Tainguyen\Import Cambridge\FCE_B2\Reading`.
## >>> TR?NG THÁI G?N NH?T — Agent m?i d?c ph?n này tru?c, không d?c h?t file <<<

**Ngày:** 2026-07-27

### Ðã hoàn thành (m?i nh?t — Cambridge Writing seed library B1/C2 dã d?ng du?c)

- Dùng 4 seed Inspera th?t làm ngu?n kh?i d?ng cho Writing Cambridge:
  - B1: `assessmentRunId=146726796`
  - B2: `assessmentRunId=146732614`
  - C1: `assessmentRunId=415313797`
  - C2: `assessmentRunId=146745736`
- Chu?n hóa schema/catalog m?i t?i `packages/catalog/src/cambridge/writing/`:
  - `schema.ts` d?nh nghia `CambridgeWritingCollection/Test/Task/Choice/Asset/SampleAnswer/Manifest`
  - `seedData.ts` ch?a prompt th?t dã crawl t? Inspera
  - `manifest.json` + `b1|b2|c1|c2/index.json` + t?ng file test JSON du?c generate b?i script import
- Thêm importer `scripts/import-cambridge-writing.ts` + script root `pnpm import:cambridge-writing --all`
  - Verify ngày **2026-07-27**: importer ch?y xong:
    - `b1`: 1 test / 3 tasks
    - `b2`: 1 test / 4 tasks
    - `c1`: 1 test / 4 tasks
    - `c2`: 1 test / 4 tasks
  - Inventory ghi t?i `data-import/cambridge-writing-inventory.json`
  - Ghi nh?n th?c t?: `D:\App-English-Ryan\Crawl\Writing_Crawl\B1` dang có `Question_1.png..Question_3.png`; `B2/C1/C2` còn r?ng nên hi?n dùng seed JSON t? `docs/research/ceq.inspera.com/writing/`
- M? route/library/workspace m?i cho Cambridge Writing:
  - `/app/writing/cambridge/:level`
  - `/app/writing/cambridge/:level/:testId`
  - `/app/writing/cambridge/:level/:testId/:taskId`
- `ExamTrackPage` và `ExamSkillPicker` dã có card `Writing` cho Cambridge B1/B2/C1/C2; card l?y count t? manifest seed thay vì Dexie docs.
- `writingRepo.createDoc()` nh?n thêm `sourceMeta`; `WritingDoc` có `sourceMeta` d? map ngu?c doc v?i `level/testId/taskId` t? seed route.
- `WritingCambridgeTaskPage` t? tìm doc cu theo `sourceMeta.taskId`; n?u chua có thì auto-create doc m?i r?i m? `WritingEditor`.
- `apps/web/src/pages/WritingCambridgePage.tsx` chuy?n CTA seeded levels sang thu vi?n d? th?t; A2 v?n disabled.
- Tài li?u bàn giao dã có:
  - `docs/research/ceq.inspera.com/writing/WRITING_SAMPLE_SUMMARY.md`
  - `docs/cambridge-writing-integration.md`
- Verify:
  - `pnpm import:cambridge-writing --all` PASS
  - `pnpm --filter web build` ch?y h?t `tsc && vite build && strip-public-media`; log có `? built in 1m 39s`. L?n ch?y trong harness b? timeout sau khi build xong nên d?c theo log, không ph?i l?i compile/runtime.

### L?i còn t?n t?i
- Cambridge Writing hi?n m?i là **seed-first integration**:
  - B1 có thêm 3 ?nh câu h?i trong `D:\App-English-Ryan\Crawl\Writing_Crawl\B1` nhung UI seed route chua render ?nh d? th?t
  - B2/C1/C2 chua có b? file crawl th?t trong `D:\App-English-Ryan\Crawl\Writing_Crawl\*`, dang dùng prompt JSON dã chu?n hóa t? Inspera
- `packages/catalog/src/cambridge/writing/index.ts` và `seedData.ts` dang dùng import duôi `.ts` d? script Node ESM ch?y tr?c ti?p. Build web v?n PASS; n?u sau này dóng gói package catalog riêng thì nh? ki?m tra l?i strategy export/runtime.

### Next session start prompt

Cambridge Writing seed integration dã d?ng du?c trên web b?ng 4 seed Inspera th?t. Tru?c khi s?a ti?p, d?c:
1. `docs/cambridge-writing-integration.md`
2. `packages/catalog/src/cambridge/writing/schema.ts`
3. `apps/web/src/pages/WritingCambridgeTaskPage.tsx`

Các route m?i:
- `/app/writing/cambridge/:level`
- `/app/writing/cambridge/:level/:testId`
- `/app/writing/cambridge/:level/:testId/:taskId`

M?c verify g?n nh?t ngày **2026-07-27**:
- `pnpm import:cambridge-writing --all` PASS
- `pnpm --filter web build` build xong (`? built in 1m 39s`), nhung command b? harness timeout sau khi hoàn t?t log.

Vi?c ti?p theo h?p lý nh?t:
1. Render ?nh prompt th?t cho B1 t? `D:\App-English-Ryan\Crawl\Writing_Crawl\B1\Question_1.png..3.png`
2. Khi có file th?t cho B2/C1/C2, m? r?ng importer d? kéo ?nh/PDF assets vào schema thay vì ch? prompt text
3. Cân nh?c thêm card/library/import flow cho Writing gi?ng Reading n?u mu?n admin publish seed thành catalog r?ng hon

### Ðã hoàn thành (m?i nh?t — FCE B2 Reading bundle dã du?c sync vào app)

- Ch?y `node scripts/build-catalog.mjs` d? d?ng b? catalog t? `D:\App-English-Ryan\Tainguyen` vào app.
- FCE B2 Reading `catalog-reading-fce-b2-test1` hi?n dã có trong:
  - `packages/catalog/data/reading-fce-b2-test1.json`
  - `packages/catalog/data/catalog-reading-meta.json`
  - `apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test1.json`
  - `apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test1.answers.json`
- `packages/catalog/data/manifest.json` du?c refresh `builtAt` theo l?n build m?i nh?t.

### L?i còn t?n t?i

- `node scripts/build-catalog.mjs` hi?n v?n t?o r?t nhi?u warning CRLF khi ghi l?i các file catalog JSON.
- Git worktree còn m?t file t?m do môi tru?ng t?o ra: `~$skills-inventory.xlsx` dã b? builder ch?m t?i tr?ng thái xóa.

### Next session start prompt

FCE B2 Reading dã du?c sync vào app b?ng build-catalog. Tru?c khi s?a ti?p, ki?m tra:
1. `packages/catalog/data/manifest.json`
2. `packages/catalog/data/catalog-reading-meta.json`
3. `apps/web/public/catalog/exams/reading/catalog-reading-fce-b2-test1.json`

N?u c?n m? r?ng thêm, import ti?p các bundle FCE B2 Reading khác t? `D:\App-English-Ryan\Tainguyen\Import Cambridge\FCE_B2\Reading`.
## >>> TR?NG THÁI G?N NH?T — Agent m?i d?c ph?n này tru?c, không d?c h?t file <<<

**Ngày:** 2026-07-26

### Ðã hoàn thành (m?i nh?t — FCE B2 Reading kh?p Inspera CEQ 1:1)

**Crawl b?n g?c Cambridge** (skill `clone-website` + Playwright MCP qua Chrome debug port 9222)

Ngu?n: `ceq.inspera.com/player/?assessmentRunId=160272655` — B2 First Digital Sample Test 1, player release **3.51.0**.
Artifacts trong `docs/research/ceq.inspera.com/`:
- `PAGE_TOPOLOGY.md` — spec shell 3 t?ng, b?ng 7 parts, tokens
- `global-tokens.json` — **~280 CSS variables** c?a theme `ceq-theme` (b?ng màu g?c, không ph?i u?c lu?ng)
- `player.css` — 588 KB CSS g?c
- `layout-regions.json`, `part1-gap-popup-open.json`, `part2.json`, `parts3-7.json`
- `footer-header-part6-states.json` — computed style **theo t?ng tr?ng thái** (quan tr?ng: do th?t, không suy t? tên bi?n)

Ki?n trúc b?n g?c: `App__app > App__mainScreen > App__contentContainer(y=72,h=758) > DisplayTypeContainer > QuestionDisplay`. Header 72px + footer 53px fixed, ch? `contentContainer` cu?n.

| Part | Interaction class | B? c?c |
|---|---|---|
| 1 | `inlineChoiceInteraction` `presentation-horizontalPopup` | 1 c?t, popup ngang m? **lên trên** |
| 2/3/4 | `textEntry` | 1 c?t, `double-line-spacing` |
| 5/7 | `choiceInteraction` `vertical` | 2 c?t, câu h?i ph?i x=739 w=628 |
| 6 | `gapMatchInteraction` kéo–th? | `split-5050`, tokens bên ph?i |

**Tái c?u trúc UI** — `readingFceRw.css` thêm layer Inspera scope trong `.fce-rw-shell`, map h? `--ket-*` sang token g?c. KET/PET/CAE/CPE **không b? ?nh hu?ng**.

- Header 72px, `Candidate ID` sát trái + canh trên (x=216,y=8, weight 600), logo Cambridge English th?t `168×43` t?i t? CDN Inspera ? `apps/web/public/exam/cambridge-english-logo.png`
- Footer: ô part n?n `#efefef`, part m? ? **n?n tr?ng + vi?n trên den 2px** + ch? 600; s? câu ch?n = **vi?n `2px #2a6c96`, KHÔNG tô n?n** (l?n d?u làm sai vì suy t? tên bi?n `--footer--selected-question-no-bg`)
- Part 6 kéo–th?: ô gap **300×23px** `2px dashed #418ec8` radius 5px; token **max 528px, min-h 43px, margin 5px** `1px solid #919191` radius 4px `cursor:move`; ?n ch? cái A/B/C (Cambridge không hi?n)
- C?m nút ph?i header cách rìa 16px (tru?c sát mép)

**T?n d?ng l?i code có s?n** (rà `ketRw` / `petRw` / `fceRw`)

- `RwPart5McGap` — FCE t? vi?t `InlineMcGap` riêng trong khi component này dã t?n t?i và làm **dúng pattern Inspera** (ô tr?ng ? chooser den ngang phía trên), KET P4 + PET P5 dang dùng. Xoá `InlineMcGap` + block CSS trùng: **-133 dòng**. FCE có thêm click-ngoài-dóng / Escape / `role=listbox` / `aria-selected` mà b?n cu không có.
- S?a `rwPart5McGap.css` sang s? do th?t ? **KET A2 P4 và PET B1 P5 cung chính xác hon theo**: 128?**144px**, font 15?**16px**, vi?n `#a7a7a7`?**`#949494`**, vi?n m? `#238ed0` 1px?**`#418ec8` 2px**, n?n chooser `#333`?**`#404040`**, hover `#494949`?**`#2a6c96`**, ô khi m? thêm n?n `#272727` ch? tr?ng.
- `CambridgeSelectionToolbar` + `useStableTextSelection` — chuy?n FCE t? `ReadingHighlightToolbar` (m?c d?nh) sang b?n PET. Verify browser: bôi den ? toolbar Note/Highlight hi?n dúng.
- **Không** t?n d?ng `PetRwDragMatch`: nó t? render `KetRwSplitPane` + slot d?ng list, FCE c?n gap inline trong bài d?c ? ph?i thêm variant th? ba, dài hon ~35 dòng inline hi?n có.

**Part 6 kéo–th? — b? sung 3 th? thi?u + fix 1 bug**

- Ph?n h?i khi rê qua ô (`is-over` ? `#fa5101`, token `--gapmatch--dropzone-border-active`)
- Nút `×` xoá dáp án (class có s?n trong CSS PET, FCE chua render)
- Bàn phím: th? bank `div[role=button]` ? `<button>` th?t, Enter/Space ch?y, không c?n handler phím
- **Bug có s?n**: token dã d?t b? `disabled` ? không nh?c sang gap khác du?c. B? `disabled`, gi? `.is-used` ch? d? làm m?.

Test m?i `apps/web/src/features/exam/__tests__/fceRwPart6Drag.test.tsx` (4 test) — chính test này b?t du?c bug trên.

**Verify:** `tsc --noEmit` PASS · exam suite **161/162** (1 fail `catalogCamReading` d?m 47 d? IELTS — có s?n t? tru?c, không liên quan) · `pnpm build` PASS.

**H? t?ng:** thêm MCP server `playwright` vào `.mcp.json` (CDP `localhost:9222`). Script m? Chrome debug profile riêng n?m ? scratchpad, không c?n dóng Chrome dang dùng.

### Ðã hoàn thành (d?ng b? chrome KET ? PET)
- **Footer KET A2 Reading = layout PET B1:** `KetRwFooter.tsx` b? Exit/Prev/Next kh?i footer, thêm ô Submit `?` 77px ? cell cu?i; part tab + question pills n?m cùng m?t hàng; part dang m? n?n tr?ng (`flex: 0 1 auto` + `min-width: max-content`, can trái, nhãn in d?m), các part còn l?i chia d?u. Pill là s? tr?n, pill active = ô 22px vi?n `2px solid #111` n?n tr?ng. Footer cao 52px, n?n `--ket-footer-bg: #ebebeb`, ô submit `#e0e1e1`, `border-top: 3px solid #fff`.
- Exit chuy?n lên header (icon ArrowLeft), Prev/Next thành `.ket-rw-adjacent-nav` n?i (`right:32px bottom:88px`, teal `#008f95`, disabled `#ddd`) — gi?ng PET.
- Vì `KetRwFooter` dùng chung nên FCE/CAE/CPE Reading cung du?c c?p nh?t cùng ki?u (header exit + nav n?i + submit ?).
- **KET A2 top = layout crawl Cambridge (gi?ng PET B1):** shell KET thêm class `ket-a2-crawl`; header d?i sang logo `/logo-ceq.png` 43px + "Candidate ID" d?m, bên ph?i là timer + Wifi/Bell/Menu/`ExamFontControls` (b? nút Submit ? header — n?p bài qua ô ? footer). CSS m?i cu?i `readingKetRw.css` (scope `.ket-a2-crawl`, không d?ng FCE/CAE/CPE): header 72px n?n tr?ng vi?n trên `2px #238ed0`, main n?n `#f4f8f9` padding 16px, ô instruction vi?n `#d2d7da` bo 5px, Part 1 sign-box khung tr?ng vi?n `#d9dee2`, s? câu ô vi?n `2px #238ed0`, radio list hàng 44px vi?n `#edf0f1`, hover `#e7e7e7`, ch?n `#cfe3f5`.
- PET B1 gi? nguyên b?n g?c (dã `git checkout` hoàn tác th? nghi?m d?i header PET).
- **Fix d? li?u KET A2 Part 2 Q13 — option C m?t tên ngu?i:** option C c?a câu 13 (matching 3 ngu?i) ch?a nguyên do?n passage thay vì tên. L?i có ? **c? 14 d? book4–book7**, c? 2 b?n `apps/web/public/catalog/exams/reading/*.json` và `packages/catalog/data/*.json`. Ðã s?a hàng lo?t b?ng cách l?y `passage[2].label`; verify không còn option nào > 60 ký t? b?t thu?ng ? Part 2 (các option dài ? Part 1/3 là câu hoàn ch?nh, h?p l?). Answer key dùng ch? cái A/B/C nên không ?nh hu?ng.
- **C?nh báo regression:** `scripts/build-catalog.mjs` copy nguyên `qJson.options` t? ngu?n Tainguyen (dòng 527, 693) ? ch?y `pnpm build:catalog` khi có Tainguyen s? ghi dè l?i l?i này. C?n s?a ngu?n ho?c thêm guard trong build script.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS. Chua smoke b?ng browser dang nh?p (driver Playwright b? ch?n ? Cloudflare login) — c?n user reload trang xác nh?n.

### Ðã hoàn thành
- **KET A2 Reading Part 2 (Q7–13) — layout Cambridge 1:1 (ch? UI, không d?ng d? li?u d?):**
  - `ReadingKetRwTest.tsx`: shell nh?n thêm class `is-part-{partNumber}` (gi?ng PET) d? scope CSS theo part; header có nút Menu.
  - `KetRwPartContent.tsx`: profile Part 2 tách tên riêng ra dòng tiêu d? `.ket-rw-profile__name` (thay vì label inline trong do?n); gi? nguyên portrait admin và blockId highlight cu. Thêm state bookmark t?m trong phiên (không ghi vào d?/draft).
  - `RwMcRadioQuestion.tsx`: thêm prop tùy ch?n `isActive` / `showFlag` / `flagged` / `onToggleFlag` (m?c d?nh t?t ? PET/FCE/CAE/CPE không d?i).
  - `readingKetRw.css`: block m?i `.ket-rw-shell.is-part-2` — h?p d? bài tr?ng vi?n xám n?i trên n?n `#f4f7f6`, hai pane tr?ng, thanh chia d?m `#8f9395` 10px + tay kéo vuông tr?ng 30px, tiêu d? bài d?c 24px bold, tên riêng bold dòng riêng, s? câu ch? den (khung xanh `#238ed0` ch? ? câu dang ch?n), bang dáp án `#f8f8f8` cao 44px cách nhau b?ng du?ng tr?ng 2px, bookmark góc ph?i câu dang ch?n.
  - Verify: `tsc --noEmit` không phát sinh l?i m?i ? `ketRw/` và `rwHighlight/` (ch? còn l?i môi tru?ng s?n có: `@types/node`, Testing Library, Supabase). **Chua ch?y du?c dev server / vitest** do node_modules thi?u Rollup + `@vitest/utils` ? chua smoke b?ng m?t.
- **Admin-only Batch Reading ZIP Import (Library Archives / Reading):**
  - Thêm nút `Import hàng lo?t Reading` c?nh `Import th? công Reading` trong `ExamTrackPage.tsx`, dùng dúng admin gate hi?n có `useIsAdmin()` / `db.settings.is_admin`; non-admin không th?y nút và modal t? ch?n n?u b? g?i trái phép.
  - Thêm modal `BatchReadingImportModal.tsx`: ch?n nhi?u file `.zip`, dry-run validate tru?c, checkbox `Overwrite existing exams`, import th?t, b?ng k?t qu? theo file, `Copy report` và t?i `report.json`.
  - Thêm service `apps/web/src/features/exam/import/batchReadingZipImport.ts`: scan ZIP theo path th?c t? `catalog/exams/reading/*.json`, `*.answers.json`, `catalog/reading/**`; validate body/answers/meta/assets; skip duplicate m?c d?nh, overwrite khi b?t option.
  - Reuse persistence path c?a manual import Reading: merge answers vault vào body runtime r?i luu qua `examRepo.create(examRecordFromReading(..., 'manual'))`, backup qua `backupReadingExam()`, và ch? publish cloud khi di theo lu?ng IELTS admin (`publishToCloud` option).
  - Asset handling local: passage/group images trong ZIP du?c persist vào Dexie blob store qua `audioRepo.put()` + `readingExamMediaKey()`, r?i rewrite sang `imageKey` d? runtime hi?n ?nh ?n mà không c?n ghi vào `public/`.
  - Thêm unit test `batchReadingZipImport.test.ts` d? 12 case b?t bu?c: valid single/multi zip, thi?u body/answers, mismatch answers, duplicate skip/overwrite, non-zip, PET B1 31 câu, thi?u ?nh Part 1...
  - Verify: `pnpm --filter web exec -- tsc --noEmit` PASS, `pnpm --filter web exec vitest run src/features/exam/__tests__/batchReadingZipImport.test.ts` PASS (12/12).
- **KET A2 Reading — Tái c?u trúc layout toàn di?n t? crawl (branch `ket-a2-layout-from-crawl`):**
  - **Bottom Part/Question navigation:** Refactor `KetRwFooter.tsx` sang layout Cambridge/Inspera g?m part tabs ngang, active part hi?n question pills, inactive part hi?n answered count, submit ? ? cell cu?i. Floating Prev/Next buttons ? góc ph?i phía trên footer. Không dùng PET compact style.
  - **Part 4 MC gaps — nhi?u iteration visual:** PET-style inline chooser ? dark bar chooser v?i nút X ? white/gray bar v?i selected word ? cu?i cùng là Cambridge target: ô tr?ng/xám #f8f8f8 vi?n xám #aeb4ba 1px, ch? den, ch? s? câu + selected word, border xanh ch? khi focus/open. X? lý dots placeholder b?ng `stripPlaceholderDotsAroundGap()`.
  - **Part 5 input style:** Match Part 4 gray box style — solid box `height: 1.55rem`, `border: 1px solid #aeb4ba`, `background: #f8f8f8`, s? câu + input trong m?t kh?i li?n, focus-within vi?n xanh.
  - **Part 6 writing area:** Ði?u ch?nh textarea: gi?m width ? gi?m height ? `aspect-ratio: 2/1` v?i `flex: 0 0 auto` d? không b? flex kéo giãn.
  - **Part 7 image container:** `max-width: 50%` gi?m khung ?nh xu?ng ½.
  - **Background t?ng th?:** Ð?i t? `var(--bg-primary)` ? `#F4F7F6` qua bi?n `--ket-body-bg` trong `.ket-rw-shell`.
  - **Ch?n doán Part 4 click issue:** S? d?ng manual diagnosis kit (5 snippets) xác nh?n programmatic click ho?t d?ng, mouse click ho?t d?ng, không có overlay/pointer-events/CSS issue. Root cause là stale bundle t? snippet diagnosis tru?c.
  - **T?t c? typecheck:** `pnpm --filter web exec tsc --noEmit` ? 0 errors.
  - **Không s?a data d?, answer key, catalog, db, migrations, PET B1.**

### Files changed (session FCE B2 ? Inspera)
- `apps/web/src/features/exam/fceRw/ReadingFceRwTest.tsx` — logo th?t, CambridgeSelectionToolbar, useStableTextSelection
- `apps/web/src/features/exam/fceRw/FceRwPartContent.tsx` — dùng `RwPart5McGap`, xoá `InlineMcGap`, Part 6 drag (is-over / clear / keyboard)
- `apps/web/src/features/exam/fceRw/readingFceRw.css` — layer Inspera scope `.fce-rw-shell`
- `apps/web/src/features/exam/rwHighlight/rwPart5McGap.css` — s? do th?t (**?nh hu?ng c? KET P4 + PET P5**)
- `apps/web/src/features/exam/__tests__/fceRwPart6Drag.test.tsx` — m?i
- `apps/web/public/exam/cambridge-english-logo.png` — m?i
- `docs/research/ceq.inspera.com/*` , `docs/design-references/ceq.inspera.com/*` — artifacts crawl
- `.mcp.json` — thêm server `playwright`

### Files changed (session tru?c)
- `apps/web/src/features/exam/ExamTrackPage.tsx`
- `apps/web/src/features/exam/BatchReadingImportModal.tsx`
- `apps/web/src/features/exam/import/batchReadingZipImport.ts`
- `apps/web/src/features/exam/__tests__/batchReadingZipImport.test.ts`
- `apps/web/src/features/exam/ketRw/ReadingKetRwTest.tsx`
- `apps/web/src/features/exam/ketRw/KetRwFooter.tsx`
- `apps/web/src/features/exam/ketRw/KetRwPartContent.tsx`
- `apps/web/src/features/exam/ketRw/readingKetRw.css`

### L?i còn t?n t?i
- **FCE B2 Reading khoá b?ng màu sáng Inspera** ? không d?i theo theme mid/dark, trái rule 2–3 trong CLAUDE.md. Ðó là cái giá c?a "gi?ng 100%". Chua quy?t có thêm nhánh `@media`/`[data-theme]` hay không.
- **C?m control ph?i header FCE** còn timer `- 00:00 + ?`, `T` (font), `Submit` — Cambridge th?t không có (ch? 4 icon: wifi / chuông / ? / ?). Ð? xu?t ch? duy?t: gom timer + font vào menu ?, Submit d?i xu?ng nút ? góc ph?i footer.
- **`KetRwFooter` ? `PetRwFooter` trùng logic ~100 dòng** (khác m?i ti?n t? class `ket-rw-footer-part` vs `pet-rw-footer__part` và d?u tick ?/?). G?p ph?i s?a c? `readingPetRw.css` 1375 dòng + `petRwFooter.test.tsx` ? **khuy?n ngh? không làm** tr? khi s?a footer thu?ng xuyên.
- `catalogCamReading.test.ts` fail (k? v?ng 47 d? IELTS seeded) — có t? tru?c, chua di?u tra.
- Logo Cambridge th?t hi?n ch? áp cho `fceRw`; KET/PET/CAE/CPE v?n dùng shield `CE` cu.
- Batch Reading ZIP import hi?n dã persist ch?c cho `passage.imageUrl` và `questionGroup.imageUrl`. N?u m?t bundle tuong lai dùng `topImageUrl` / `bottomImageUrl` local-only thì modal s? c?nh báo gi? nguyên URL; chua có local blob slot riêng cho 2 field này.
- (Gi? nguyên t? session tru?c)
- User báo d? li?u local không còn hi?n th?. B?n vá Admin Performance không xóa d? li?u; c?n ki?m tra dang dùng dúng `http://localhost:5173` (không ph?i `127.0.0.1`/port khác) và dúng tài kho?n.
- Google login c?n smoke production + localhost.
- Node_modules local thi?u/sai dependency/type package: Vite không start vì thi?u Rollup; TypeScript l?i Supabase/Testing Library/Node types.

### Next session start prompt

FCE B2 Reading v?a du?c tái c?u trúc kh?p Inspera CEQ 3.51.0. Spec g?c n?m ? `docs/research/ceq.inspera.com/PAGE_TOPOLOGY.md` + `global-tokens.json` — **d?c file dó tru?c khi ch?nh CSS FCE, d?ng doán màu t? tên bi?n** (session này dã sai m?t l?n: `--footer--selected-question-no-bg: #2a6c96` g?i ý tô n?n, nhung render th?t là vi?n).

Mu?n do l?i b?n g?c: ch?y script m? Chrome debug (port 9222, profile riêng ? scratchpad), dang nh?p Inspera, MCP `playwright` dã c?u hình s?n trong `.mcp.json`.

Vi?c ti?p theo còn treo, ch? user duy?t:
1. Gom timer + font vào menu ?, d?i Submit xu?ng nút ? footer (gi?ng Cambridge) — d?i hành vi UI, không ch? CSS.
2. Quy?t d?nh theme mid/dark cho FCE Reading.
3. Áp logo Cambridge th?t cho KET/PET/CAE/CPE (hi?n ch? FCE).

Chua QA visual ? 768px và 390px — m?i d?i chi?u 1440px.

---

**Vi?c cu chua xong:** Open `/app/exam/track/cambridge/b1/reading` as Admin and smoke the `Import hàng lo?t Reading` modal with real bundles from `D:\App-English-Ryan\Crawl\PET_B1_Reading\Tests\test-3..12`. Focus on dry-run rows, duplicate skip/overwrite, Part 1 image rendering after import, and submit/review answer availability. If needed next, extend local asset persistence for `topImageUrl` / `bottomImageUrl`.

---
## 2026-07-23 - Nen video nen landing page

- Thay URL CloudFront cua video nen 14,142,575 bytes bang asset noi bo `apps/web/public/landing-video.mp4`, H.264 CRF 28, 1280x716, 755,492 bytes.
- Giu nguyen poster, `preload="none"` va delayed-load 3.5 giay.
- Production build PASS. Chrome QA PASS: autoplay dang chay, `readyState=4`, duration 12.0417 giay, khong co media error; screenshot luu tai `artifacts/landing-video-compression/landing-page-compressed-video.png`.
- Next session start prompt: review Vercel preview cua ban nen video landing; chi promote production sau khi duoc phe duyet.

EOF
## 2026-07-20 â€” Upload part1.mp3 cho KET practice-16

- Upload file `part1.mp3` (4.19 MB) tá»« `D:\App-English-Ryan\Crawl\Import_KET_A2_Listening\test-16\` lÃªn Supabase storage `exam-media/catalog/listening-publish/listening-import-ket-a2-practice-16/part1-audio.mp3` â€” upsert thay tháº¿ file cÅ©.
- DÃ¹ng `scripts/publish-ket-practice-listening.mjs` lÃ m reference: service role key qua SUPABASE_ACCESS_TOKEN, bucket `exam-media`, storage prefix `catalog/listening-publish`.
- Verify: upload OK, khÃ´ng lá»—i.
- CÃ i Vercel CLI (`npm install -g vercel`), deploy production: alias `https://ryanenglishv2.vercel.app` Ready, DB up to date, build PASS, strip-media OK.

## 2026-07-17 â€” Fix RLS upload listening media (exam-media upsert)

### Session 2026-07-19 â€” Fix review paper váº«n hiá»‡n `ÄÃ¡p Ã¡n Ä‘Ãºng: â€”`

- Root cause cÃ²n sÃ³t sau báº£n vÃ¡ hydrate trÆ°á»›c: `Object.assign` thay toÃ n bá»™ `parts`, trong khi cÃ¡c mÃ n Listening/Reading Ä‘Ã£ memo hÃ³a danh sÃ¡ch/cÃ¢u há»i theo tham chiáº¿u DTO cÅ©; bÃ¡o cÃ¡o cÃ³ answer key nhÆ°ng paper váº«n Ä‘á»c object cÃ¢u há»i cÅ© cÃ³ `answer` rá»—ng.
- `promoteHydratedExamForReview` nay Ä‘á»“ng bá»™ sÃ¢u táº¡i chá»—, giá»¯ nguyÃªn tham chiáº¿u object/array hiá»‡n há»¯u Ä‘á»ƒ má»i memoized question nháº­n answer key trÆ°á»›c khi báº­t review mode.
- Regression test xÃ¡c nháº­n cáº£ root exam láº«n cÃ¡c tham chiáº¿u `parts`, `questions`, `question` Ä‘Ã£ capture Ä‘á»u tháº¥y Ä‘Ã¡p Ã¡n `B`. Test 1/1, TypeScript vÃ  `git diff --check` PASS.

### Session 2026-07-19 â€” Fix Q9/Q10 KET Book 3 Test 1 nháº­p `1` váº«n Ä‘Ãºng

- Dá»¯ liá»‡u gá»‘c Ä‘Ãºng: Q9 = `8.15`/`eight fifteen`, Q10 = `10.50`; ID hai cÃ¢u khÃ´ng trÃ¹ng.
- Root cause: matcher gap-fill cuá»‘i cÃ¹ng dÃ¹ng substring hai chiá»u, nÃªn `8.15`.includes(`1`) vÃ  `10.50`.includes(`1`) Ä‘á»u tráº£ true.
- TÃ¡ch matcher thuáº§n Ä‘á»ƒ test khÃ´ng kÃ©o catalog/DB; Ä‘Ã¡p Ã¡n chá»©a chá»¯ sá»‘ nay chá»‰ khá»›p chÃ­nh xÃ¡c hoáº·c sá»‘ nguyÃªn tÆ°Æ¡ng Ä‘Æ°Æ¡ng (`8` = `08`), khÃ´ng cháº¥p nháº­n chá»¯ sá»‘ con trong giá»/giÃ¡.
- Feedback loop trÆ°á»›c fix RED Ä‘Ãºng triá»‡u chá»©ng; sau fix scoped tests 3/3, TypeScript vÃ  `git diff --check` PASS.

### Session 2026-07-19 â€” Audit Ä‘á»“ng bá»™ matcher toÃ n bá»™ Luyá»‡n thi

- Audit cÃ¡c Ä‘Æ°á»ng cháº¥m tá»± Ä‘á»™ng xÃ¡c nháº­n Listening vÃ  Reading gap-fill/sentence-completion Ä‘á»u tá»«ng dÃ¹ng substring hai chiá»u; khÃ´ng chá»‰ sá»‘ `1`, fragment chá»¯ nhÆ° `a` cÅ©ng cÃ³ thá»ƒ khá»›p sai vá»›i `radio`. Multiple-choice, matching vÃ  TID Reading dÃ¹ng exact comparison nÃªn khÃ´ng máº¯c lá»—i nÃ y.
- Loáº¡i bá» hoÃ n toÃ n fuzzy substring á»Ÿ matcher Listening/Reading. Chá»‰ exact normalized answer, answer variants/`acceptableAnswers`, vÃ  sá»‘ nguyÃªn tÆ°Æ¡ng Ä‘Æ°Æ¡ng (`8` = `08`) Ä‘Æ°á»£c cháº¥p nháº­n.
- TÃ¡ch pure matcher cho cáº£ hai skill Ä‘á»ƒ regression test khÃ´ng kÃ©o catalog/DB. Feedback loop trÆ°á»›c fix RED á»Ÿ cáº£ Listening vÃ  Reading; sau fix exam scoped tests 14/14, TypeScript, scan khÃ´ng cÃ²n pattern substring vÃ  `git diff --check` PASS.

### Session 2026-07-19 â€” Äá»“ng bá»™ khung áº£nh PET B1 Part 1 vá»›i KET A2

- PET B1 Listening Part 1 khÃ´ng cÃ²n render qua prompt/answer panel generic; nhÃ¡nh picture Part 1 nay dÃ¹ng chung `ListeningKetPart1PictureView` vá»›i KET A2.
- Composite image, ba áº£nh rá»i, contain frame, radio, footer audio/unsure vÃ  responsive vÃ¬ váº­y cÃ³ cÃ¹ng layout; cÃ¡c Part PET khÃ¡c giá»¯ nguyÃªn.
- Verify: TypeScript PASS, scoped Listening tests 4/4 vÃ  `git diff --check` PASS.

### Session 2026-07-19 â€” Sync tÆ°Æ¡ng thÃ­ch khi migration 031 chÆ°a Ä‘Æ°á»£c push

- Root cause lá»—i `sync_server_time ... schema cache`: frontend hardening Ä‘Ã£ gá»i RPC tá»« migration 031, nhÆ°ng migrations 031â€“034 váº«n Ä‘ang á»Ÿ staging/chÆ°a cÃ³ trÃªn database hiá»‡n táº¡i.
- ThÃªm `getSyncServerTime`: chá»‰ fallback sang timestamp local khi PostgREST bÃ¡o Ä‘Ãºng lá»—i RPC/schema thiáº¿u; lá»—i máº¡ng/quyá»n khÃ¡c váº«n throw. Fallback Ä‘Æ°á»£c Ä‘Ã¡nh dáº¥u non-authoritative nÃªn sync chÃ­nh, exam progress vÃ  check-in khÃ´ng ghi tiáº¿n cloud cursor, trÃ¡nh clock client lÃ m bá» sÃ³t dá»¯ liá»‡u.
- Main sync cÅ©ng coi báº£ng `sync_tombstones` chÆ°a tá»“n táº¡i lÃ  danh sÃ¡ch rá»—ng Ä‘á»ƒ database pre-031 khÃ´ng lÃ m cháº¿t toÃ n bá»™ sync; delete ledger Ä‘áº§y Ä‘á»§ sáº½ tá»± hoáº¡t Ä‘á»™ng sau khi migration Ä‘Æ°á»£c Ã¡p.
- Feedback loop trÆ°á»›c fix RED Ä‘Ãºng PGRST202; sau fix sync/scalability tests 7/7, TypeScript vÃ  `git diff --check` PASS.

### Session 2026-07-19 â€” Cháº©n Ä‘oÃ¡n YouTube captions váº«n bÃ¡o blocked

- Feedback loop production xÃ¡c nháº­n relay URL tráº£ HTTP 429 + `X-Vercel-Mitigated: challenge`/Security Checkpoint; Vercel Function logs trá»‘ng, nÃªn request chÆ°a tá»›i `youtube-captions-relay` vÃ  thÃ´ng bÃ¡o hiá»‡n táº¡i quy lá»—i cho YouTube sai táº§ng.
- Supabase remote cÃ³ cáº£ `VERCEL_AUTOMATION_BYPASS_SECRET` vÃ  `YOUTUBE_CAPTIONS_RELAY_SECRET`; Vercel project cÃ³ relay secret production. Firewall cÃ³ `Challenge Scrapers` vÃ  `Block AI Bots`; browser-like UA váº«n bá»‹ system challenge.
- Project Hobby khÃ´ng há»— trá»£ IP/System Bypass (`vercel firewall overview` tráº£ unavailable). KhÃ´ng tá»± pause system mitigations vÃ¬ Ä‘Ã¢y lÃ  thay Ä‘á»•i báº£o máº­t rá»™ng 24 giá».
- HÆ°á»›ng xá»­ lÃ½ cáº§n quyá»n/chá»n lá»±a: rotate + Ä‘á»“ng bá»™ láº¡i Automation Bypass secret Vercelâ†’Supabase rá»“i smoke, hoáº·c tÃ¡ch relay sang endpoint/project riÃªng khÃ´ng báº­t checkpoint nhÆ°ng váº«n giá»¯ `x-relay-secret`.

### Session 2026-07-18 â€” Hardening local-first sync cho táº£i 1000 user

- Chuyá»ƒn sync chÃ­nh, exam progress vÃ  check-in sang pull incremental cÃ³ watermark server, phÃ¢n trang 500 báº£n ghi, thá»© tá»± phá»¥ á»•n Ä‘á»‹nh vÃ  tombstone truyá»n xÃ³a; cursor cloud/local chá»‰ tiáº¿n sau khi push thÃ nh cÃ´ng. Cursor local tÃ¡ch khá»i thá»i gian server Ä‘á»ƒ thiáº¿t bá»‹ lá»‡ch Ä‘á»“ng há»“ váº«n phÃ¡t hiá»‡n thay Ä‘á»•i offline.
- Batch upsert, timestamp LWW do Postgres ghi, trigger `updated_at`, retry full-jitter, login/reconnect jitter, debounce 4 giÃ¢y vÃ  chu ká»³ sync 5â€“6 phÃºt; dá»n timer retry/reconnect Ä‘á»ƒ trÃ¡nh burst trÃ¹ng.
- ThÃªm migrations 031â€“034 cho index sync/RLS, tombstone, server time, atomic rate/usage counters; Edge Functions dÃ¹ng RPC counter nguyÃªn tá»­ vÃ  timeout 8 giÃ¢y cho Resend.
- Dexie v16 thÃªm compound index SRS/review log, bulk/LRU audio cache cÃ³ quota 400 MB hoáº·c 20% browser quota vÃ  bá» qua blob Ä‘Æ¡n vÆ°á»£t ngÃ¢n sÃ¡ch.
- ThÃªm bá»™ k6 200â†’1000 VU, fixture token, script EXPLAIN sync vÃ  tÃ i liá»‡u cháº¡y an toÃ n. ChÆ°a cháº¡y lÃªn production vÃ  chÆ°a push migration/deploy function.
- Verify: typecheck PASS; hardening 14/14 PASS; full suite 157/158 PASS, lá»—i baseline ngoÃ i pháº¡m vi váº«n lÃ  `catalogCamReading.test.ts` ká»³ vá»ng 47 nhÆ°ng catalog hiá»‡n cÃ³ 48. Production build Ä‘Ã£ qua TypeScript/Vite transform nhÆ°ng command tá»•ng bá»‹ timeout khi render chunk sau bÆ°á»›c rebuild catalog.

### Session 2026-07-18 â€” SRS due label contrast on Light

- Added the first complete in-app Notification Center: sidebar bell + unread badge, persistent local inbox (250-item cap), All/Unread filters, Vietnamese full-text search, mark-one/mark-all read, delete/clear-read, category icon/label, relative time and action links to the relevant screen. The notification event API covers review, goal, streak, exam, achievement, new content and system events with dedupe keys. Automatic real-data notifications now include due SRS cards, 20-card daily goal completion, 3+ day streak celebration/risk after 18:00, and a one-time onboarding notice. Existing browser SRS notifications remain supported. TypeScript passes; production Vite build reached chunk rendering but the command exceeded the 120-second tool timeout.
- Fixed Notification Center overlap: render the drawer through a `document.body` portal at the global modal layer, above the sidebar, corner mascot and Dictionary FAB; opening it now also locks background body scrolling. TypeScript and diff checks pass.
- Fixed stale SRS notification counts: progress notifications can now replace an existing deduped record, re-open it as unread only when the count/content changes, and remove the daily due notice when no cards remain; the inbox and SRS popup therefore converge on the same live Dexie due count instead of retaining an earlier snapshot (e.g. 14 vs 1).
- Expanded app-wide continuation reminders from real synced exam drafts. The notification checker scans `exam-reading-draft:*` and `exam-listening-draft:*`, keeps up to 8 recently edited incomplete exams (30-day window), shows Reading/Listening title when locally available, current Part and answered-question count, and links directly back to the exact exam. Submitted, empty, old or displaced drafts have their resume notice removed automatically. TypeScript and diff checks pass.
- Audited Home `Tháº» Ä‘áº¿n háº¡n (due: N)` and the `current/target` value. `due: N` now uses one shared valid-due query across Home, SRS popup and Notification Center, excluding orphan SRS rows whose card/deck no longer exists (a likely cause of 14 in the inbox vs 1 selectable card). The progress numerator no longer counts every vocab mode/duplicate retry; it counts unique card IDs reviewed in actual SRS mode. â€œTodayâ€ now follows local timezone instead of UTC. TypeScript and diff checks pass.
- Updated the `/app/vocab` SRS `Due now` label to use the Light theme danger token instead of a fixed yellow, improving readability on a light background.
- Mid and Dark retain the existing yellow through the theme-scoped `--vs-due-color` token.
- Moved the 9-mode study switcher below the active study content, so the current session information and flashcard appear first.
- Restyled the selected-deck vocabulary list as two-column lesson cards: pale-blue word area, mint example area, black outline and offset shadow, while keeping audio/edit/delete actions.
- Added an icon-only Save to Notebook control immediately beside the audio control on each vocabulary card; it reuses the existing idempotent notebook save flow and reflects saved state.
- Notebook entries saved from study now show source classification: the originating deck and its Book/Unit (or deck description) as topic chips.
- Notebook now scales to large collections with full-text search (including deck/topic), deck and topic filters, and a live visible-result count; filters collapse cleanly on mobile.
- Restored KET A2 Listening Books 3â€“14 from `D:\App-English-Ryan\Crawl\Import_KET_A2_Listening`: all 44 published entries have 25 questions, per-part audio and Part 1 pictures. The initial all-at-once command hit a session timeout; idempotent batches 01â€“44 completed successfully.
- Fixed the missing-media cause: the KET publish script had used the retired public `listening-exam-media` bucket. It now uploads private media to `exam-media/catalog/listening-publish/...` and stores signed-media paths understood by the app. Re-published tests 01â€“44.
- Fixed the remaining KET media display issue: `resolveListeningExam` had prioritized a stale IndexedDB import over the restored cloud entry. For the stable restored KET practice IDs, it now uses the cloud record first (with local/offline fallback), so Part 1 images and the full per-part audio load.
- Fixed localhost playback for restored KET media: `protectedMedia` previously treated every `/catalog/*` path as a Vite public file in dev. `catalog/listening-publish/*` is now marked storage-only and always resolved through `content-sign`, including on localhost; regression test added and passing.
- Fixed production `/app/exam` empty/filtered data for Admin/Pro: `freePlanCatalogGate` previously trusted only IndexedDB plan state, which defaults to Free on a new or unsynced browser. It now reads the authenticated Supabase profile first and uses IndexedDB only as an offline fallback. Type-check and 9 scoped tests passed; deployed production `dpl_5b6cyNgNEKr5tM8j8aKTzs4WeXja` Ready and main alias updated.
- Fixed production showing only the 53 published KET imports: a second Free fallback still removed the bundled catalog despite the user already passing `ProOnlyRoute`. Authenticated route sessions now keep the complete metadata catalog (179 Listening + 77 Reading); RLS/content-sign continue protecting bodies, answers and media. Added a pure visibility regression seam (12/12 scoped tests), deployed `dpl_C3rC4XuKi9pAX5EfJcDoyrQF7eWZ` Ready and updated the main alias.
- Restored KET A2 Listening Cam/Book 1 Test 1â€“4, Book 2 Test 1â€“4 and Book 3 Test 1â€“2 from the 10 Tainguyen ZIP bundles. Eight legacy rows were updated in place; Book 1 Test 1 and Book 3 Test 1 were added. All 10 now use private `exam-media/catalog/listening-publish/...`, each has full shared audio, 5 Part 1 images, 25 questions and a 25-answer vault (250 total).
- Hardened `backfill-published-exam-vaults.mjs`: zero-answer published bodies now preserve existing vault files instead of overwriting them with empty vaults. Restored and re-backfilled all 44 Book 3+ practice rows afterward; 1,100 existing answers were regenerated with zero failures while the new 250-answer Cam 1â€“3 vaults remained intact.
- Fixed the SRS review reminder not repeating after the selected 5-minute interval. The old fixed interval was anchored to AppShell mount, so a dismissal between ticks could delay the reminder by almost another cycle. Scheduling now starts from the actual last show/dismiss timestamp and rechecks immediately when a throttled background tab becomes active. Added deterministic timing tests (3/3), TypeScript passes, and deployed production `dpl_6wa5d9JgrkR6ryFJZ2vJSeCJcpm9` Ready with the main alias updated.
- Security follow-up: updated `backfill-published-exam-vaults.mjs` to obtain service role from deploy PAT when needed, then backfilled all 53 Listening rows. It extracted 1,100 answer records to private vaults and stripped answer fields from published bodies (0 failures), including after the media re-publish.

- User: `Upload media tháº¥t báº¡i (.../part1-audio.mp3): new row violates row-level security policy` khi publish Listening (route `/app/exam/track/cambridge/c1/listening`).
- NguyÃªn nhÃ¢n: publish upload lÃªn private bucket `exam-media` vá»›i `upsert: true`, nhÆ°ng migration 019 chá»‰ cÃ³ admin INSERT/UPDATE/DELETE â€” **khÃ´ng cÃ³ SELECT**. Storage upsert cáº§n SELECT Ä‘á»ƒ pre-check / return row â†’ RLS fail.
- Fix: migration `023_exam_media_admin_upsert.sql` â€” admin-only SELECT + re-assert INSERT/UPDATE/DELETE `to authenticated` + grant execute `is_current_user_admin`. **ÄÃ£ push remote** (`pnpm db:push`).
- Client: `listeningExamCloudMedia.ts` preflight session + `profiles.is_admin`; message lá»—i RLS gá»£i Ã½ migration 023.
- Test: `phase1Hardening.test.ts` 4/4 PASS (thÃªm assert migration 023).
- User action: hard refresh, publish láº¡i Ä‘á»; náº¿u váº«n lá»—i admin â†’ kiá»ƒm tra `profiles.is_admin = true` rá»“i logout/login.

## 2026-07-17 â€” Deploy frontend security lÃªn Vercel production

- Vercel CLI login Ä‘Ãºng `ryanik1997`; project liÃªn káº¿t `ryanenglishv2`.
- Deploy Ä‘áº§u `dpl_959LwP33UBGWig26T327GSkx8pKz` lá»—i do `.vercelignore` loáº¡i private `apps/web/public/catalog` nhÆ°ng `build-catalog.mjs --if-present` váº«n yÃªu cáº§u thÆ° má»¥c nÃ y Ä‘á»ƒ skip.
- Fix `scripts/build-catalog.mjs`: Vercel dÃ¹ng committed `packages/catalog/data/manifest.json` khi khÃ´ng cÃ³ `Tainguyen`; private media khÃ´ng bá»‹ Ä‘Æ°a láº¡i vÃ o deploy.
- Verify: mÃ´ phá»ng thiáº¿u `Tainguyen` PASS; production build PASS + strip private media; `pnpm security:check` 9/9 PASS.
- Production deploy `dpl_HTKAuSqTSYw6gntRLNkCTdvXXZ9D` Ready; alias `https://ryanenglishv2.vercel.app` Ä‘Ã£ cáº­p nháº­t.
- Smoke `/`, `/terms`, `/privacy`: HTTP 200, CSP cÃ³ máº·t, `X-Frame-Options: DENY`.
- CÃ²n smoke browser: Turnstile login, Google OAuth, signed PDF/media vÃ  admin publish Listening MP3.

## 2026-07-17 â€” Re-verify Security HIGH + production backend

- XÃ¡c nháº­n code Security HIGH cÃ³ Ä‘á»§ Phase 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, Phase 4 vÃ  migration 023.
- Bá»™ verify Ä‘Æ°á»£c bÃ¡o cÃ¡o: `phase1Hardening`, `phase2Hardening`, `phase4Legal`, `BookReaderPage` tá»•ng 10/10 PASS; `tsc --noEmit` PASS.
- Äá»‘i chiáº¿u Git: working tree khÃ´ng hoÃ n toÃ n sáº¡ch vÃ¬ cÃ²n `.claude/settings.local.json` untracked; HEAD thá»±c táº¿ lÃºc kiá»ƒm tra lÃ  `b1db15f7`, khÃ´ng pháº£i `86e26916`.
- Cháº¡y láº¡i `pnpm db:push` production: Supabase project `ntcagvtkwxwsmlxlumfo` tráº£ `Remote database is up to date`; migrations 017â€“023 Ä‘Ã£ cÃ³ trÃªn remote.
- Redeploy `content-sign` thÃ nh cÃ´ng lÃªn project `ntcagvtkwxwsmlxlumfo`. CLI láº§n Ä‘áº§u thiáº¿u token; láº§n hai chá»‰ náº¡p `SUPABASE_ACCESS_TOKEN` tá»« `.env.deploy` trong process, khÃ´ng ghi/in secret.
- KhÃ´ng cháº¡y láº¡i backfill/upload: session trÆ°á»›c Ä‘Ã£ audit production vÃ  ghi nháº­n 51 Listening rows Ä‘Æ°á»£c tÃ¡ch 1.275 answers vÃ o vault; 2.011/2.012 private media Ä‘Ã£ upload, thiáº¿u duy nháº¥t CAE audio 82.94MB vÆ°á»£t giá»›i háº¡n Supabase Free 50MB.
- Frontend production Ä‘Ã£ deploy Ready á»Ÿ `https://ryanenglishv2.vercel.app`; HTTP smoke `/`, `/terms`, `/privacy` PASS.
- CÃ²n ngoÃ i code: smoke browser Turnstile/OAuth/signed media/admin publish; táº¡o vÃ  review Vercel Firewall draft; xá»­ lÃ½ CAE audio >50MB; cáº¥u hÃ¬nh kÃªnh gá»­i security alert/PITR/legal review náº¿u cáº§n.

## 2026-07-17 â€” Signup legal consent + email security alerts

- Biáº¿n tab `ÄÄƒng kÃ½` tá»« trang trÃ­ thÃ nh signup email/password tháº­t; dÃ¹ng Turnstile hiá»‡n cÃ³, yÃªu cáº§u password >= 8 kÃ½ tá»± vÃ  báº¯t buá»™c `TermsConsentCheckbox`.
- Consent version `2026-07-16` Ä‘Æ°á»£c gá»­i trong Auth metadata. Migration `024_signup_consent_and_security_email.sql` má»Ÿ rá»™ng `handle_new_user()` Ä‘á»ƒ ghi server timestamp vÃ o `profiles` ngay cáº£ khi báº­t email confirmation/chÆ°a cÃ³ session.
- Vá»›i signup cÃ³ session vÃ  Google OAuth signup, app lÆ°u pending version ngáº¯n háº¡n rá»“i gá»i RPC `accept_legal_terms`; pending Ä‘Æ°á»£c xÃ³a khi thÃ nh cÃ´ng hoáº·c signup lá»—i Ä‘á»ƒ khÃ´ng ghi nháº§m á»Ÿ login sau.
- Alert quota >=300 request/24h dÃ¹ng Resend trong `content-sign`. RPC `claim_content_security_alert_email` claim nguyÃªn tá»­ má»™t email/user/ngÃ y; náº¿u Resend lá»—i thÃ¬ release claim Ä‘á»ƒ request sau retry. DB queue váº«n giá»¯ nguyÃªn.
- Migration 024 Ä‘Ã£ push production; `content-sign` má»›i Ä‘Ã£ deploy production.
- Frontend commit `3321c983` Ä‘Ã£ deploy Vercel production Ready táº¡i deployment `ryanenglishv2-okqsjcn1x-ryanenglish.vercel.app`; alias chÃ­nh giá»¯ `https://ryanenglishv2.vercel.app`.
- HEAD smoke vÃ o alias chÃ­nh tráº£ HTTP 429 tá»« lá»›p Vercel, nÃªn chÆ°a xÃ¡c nháº­n UI signup báº±ng production browser.
- Blocker email production: Supabase project chÆ°a cÃ³ cÃ¡c secret `RESEND_API_KEY`, `ADMIN_EMAIL`, `APP_ORIGIN`; `.env.deploy` cÅ©ng khÃ´ng cÃ³. Cho Ä‘áº¿n khi set secret, function chá»‰ cáº£nh bÃ¡o log + lÆ°u DB, chÆ°a gá»­i email tháº­t.
- Verify: scoped security/auth 13/13 PASS; `tsc --noEmit` PASS; production build PASS + strip private media; `git diff --check` PASS.
- Full web suite: 117/118 PASS. Lá»—i duy nháº¥t ngoÃ i patch: `catalogCamReading.test.ts` hardcode 47 nhÆ°ng catalog hiá»‡n cÃ³ 48 Ä‘á».

## 2026-07-17 â€” Writing subpages: ná»n lÆ°á»›i Ä‘á»“ng bá»™

- Má»i route con `/app/writing/*` dÃ¹ng backdrop `grid`, khÃ´ng cÃ³ ribbon; `/app/writing` hub giá»¯ style ribbon hiá»‡n cÃ³.
- ThÃªm `.writing-shell` vÃ o CSS transparent layer cá»§a backdrop Ä‘á»ƒ editor Writing khÃ´ng che Ã´ lÆ°á»›i xanh nháº¡t.
- Verify: `appShellBackdrop.test.ts` 62/62 PASS; `pnpm --filter web exec -- tsc --noEmit` PASS.

## 2026-07-17 â€” Speaking AI MVP theo Plan/SpeakAI.txt

- Entitlement/retention: admin + Pro cÃ²n háº¡n + Lifetime dÃ¹ng Speaking AI khÃ´ng giá»›i háº¡n; Free/Trial/Basic giá»¯ quota 600 giÃ¢y/ngÃ y. API tráº£ access metadata Ä‘á»ƒ UI hiá»‡n Ä‘Ãºng quyá»n.
- Migration `027_speaking_ai_entitlements_retention.sql`: cron cháº¡y háº±ng ngÃ y, xÃ³a message/usage quÃ¡ 30 ngÃ y vÃ  conversation rá»—ng; function dá»n dá»¯ liá»‡u khÃ´ng cho anon/authenticated gá»i trá»±c tiáº¿p.
- UI Speaking AI hiá»ƒn thá»‹ `KhÃ´ng giá»›i háº¡n` cho Pro/admin vÃ  thÃ´ng bÃ¡o lá»‹ch sá»­ tá»± xÃ³a sau 30 ngÃ y; web bump v0.2.6.
- Production: migration 027 (kÃ¨m pg_cron) Ä‘Ã£ push, Edge Function Ä‘Ã£ deploy; commit `4948d481`; Vercel Ready táº¡i `ryanenglishv2-cujd3xzkk-ryanenglish.vercel.app`, alias `https://ryanenglishv2.vercel.app`.
- Verify entitlement/retention: scoped 6/6 PASS, `tsc --noEmit` PASS; full suite 130/131 PASS. Lá»—i duy nháº¥t ngoÃ i feature váº«n lÃ  catalog Reading test hardcode 47 khi catalog cÃ³ 48.
- Fix tiáº¿p: thÃªm i18n `nav.speakingAi` cho VI/EN Ä‘á»ƒ toolbar khÃ´ng hiá»‡n raw key; regression test 1/1 vÃ  `tsc --noEmit` PASS.
- ThÃªm route riÃªng `/app/speaking-ai` trong sidebar AppShell; trang Ä‘Æ°á»£c lazy-load vÃ  dÃ¹ng backdrop grid/ribbon chung.
- Trang chá»n level A1â€“C1, 7 mode, 6 topic vÃ  má»Ÿ láº¡i cÃ¡c phiÃªn lá»‹ch sá»­ Ä‘Ã£ lÆ°u; tráº¡ng thÃ¡i rÃµ `Ready â†’ Recording â†’ Processing â†’ AI Speaking`; cÃ³ transcript, correction, natural alternative, giáº£i thÃ­ch VI, vocabulary, replay, 0.75x/1x/1.25x, nÃ³i cháº­m vÃ  retry/error.
- `useSpeakingRecorder`: MediaRecorder giá»¯ audio cá»¥c bá»™ Ä‘á»ƒ replay; Web Speech API (`SpeechRecognition`, `en-US`) táº¡o transcript trá»±c tiáº¿p trÃªn Chrome/Edge; giá»›i háº¡n 60 giÃ¢y, permission error rÃµ vÃ  cleanup stream/object URL.
- Edge Function `speaking-ai` chuyá»ƒn sang DeepSeek Chat Completions JSON mode (`deepseek-v4-flash` máº·c Ä‘á»‹nh): chá»‰ nháº­n transcript, khÃ´ng upload audio; JWT user báº¯t buá»™c, timeout 25s, conversation ownership check vÃ  khÃ´ng log/lá»™ API key.
- Migration `025_speaking_ai_mvp.sql`: `speaking_conversations`, `speaking_messages`, `speaking_usage`; RLS own-read/delete; transcript/feedback lÆ°u tá»‘i Ä‘a 30 ngÃ y, audio khÃ´ng lÆ°u; quota máº·c Ä‘á»‹nh 600 giÃ¢y/ngÃ y/user.
- Tá»‘i Ä‘a 12 phiÃªn gáº§n nháº¥t Ä‘Æ°á»£c táº£i vÃ  chá»n láº¡i trÃªn trang. TTS dÃ¹ng engine hiá»‡n cÃ³ vÃ  fallback browser.
- Production backend: migration 026 Ä‘Ã£ push vÃ  Edge Function `speaking-ai` báº£n DeepSeek Ä‘Ã£ deploy lÃªn project `ntcagvtkwxwsmlxlumfo`.
- Frontend commit `cb8925de` Ä‘Ã£ deploy Vercel production Ready táº¡i `ryanenglishv2-ott507of9-ryanenglish.vercel.app`.
- Báº£n DeepSeek commit `2aa07056`, web v0.2.5 Ä‘Ã£ deploy production Ready: `ryanenglishv2-4n5yrjrw7-ryanenglish.vercel.app`, alias `https://ryanenglishv2.vercel.app`.
- `DEEPSEEK_API_KEY` Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t trong Supabase Secrets production (khÃ´ng lÆ°u repo/frontend); request kiá»ƒm tra trá»±c tiáº¿p vá»›i `deepseek-v4-flash` PASS.
- Verify báº£n DeepSeek: Speaking AI tests 3/3 PASS; `tsc --noEmit` PASS; production web build PASS + strip private media; full suite 120/121 PASS. Lá»—i duy nháº¥t ngoÃ i patch váº«n lÃ  catalog Reading ká»³ vá»ng 47 nhÆ°ng hiá»‡n cÃ³ 48.
- Migration `026_speaking_ai_deepseek.sql` Ä‘á»•i provider máº·c Ä‘á»‹nh sang `deepseek`; client chá»‰ gá»­i transcript + metadata, khÃ´ng cÃ²n FileReader/base64/audioData.

### Next session start prompt

Review/cháº¡y migrations 031â€“034 trÃªn staging, cháº¡y `scripts/load/explain-sync.sql`, sau Ä‘Ã³ k6 báº±ng 1000 token staging vÃ  kiá»ƒm tra p95/error/correctness trÆ°á»›c production. Bá»• sung transaction duy nháº¥t cho Speaking AI usage + message persistence vÃ  lá»‹ch prune tombstone/rate counters.

Smoke Speaking AI báº±ng Chrome/Edge: permission, record 5â€“10s, live transcript, reply, TTS, correction, close/reopen history vÃ  quota. Safari/Firefox cÃ³ thá»ƒ khÃ´ng há»— trá»£ Web Speech API Ä‘áº§y Ä‘á»§.

Set Supabase secrets `RESEND_API_KEY`, `ADMIN_EMAIL`, `APP_ORIGIN`, redeploy `content-sign`, rá»“i test má»™t alert cÃ³ kiá»ƒm soÃ¡t. Smoke signup email-confirmation + Google consent vÃ  kiá»ƒm tra `profiles.terms_accepted_at/terms_version/privacy_accepted_at`. Sá»­a baseline catalog test 47â†’48 sau khi xÃ¡c nháº­n Ä‘á» thá»© 48 há»£p lá»‡.

Smoke browser production táº¡i `https://ryanenglishv2.vercel.app`, gá»“m Turnstile login, signed PDF/media vÃ  retry publish Listening MP3 admin. Sau Ä‘Ã³ táº¡o Vercel Firewall draft vÃ  review diff trÆ°á»›c khi publish. Audio CAE 82.94MB váº«n cáº§n nÃ©n dÆ°á»›i 50MB hoáº·c nÃ¢ng Supabase Pro.

## 2026-07-16 â€” Security audit + káº¿ hoáº¡ch nÃ¢ng báº£o máº­t má»©c HIGH

- Audit toÃ n bá»™ lá»›p báº£o máº­t trÆ°á»›c deploy Vercel: 19 migrations, `content-sign` edge function, `vercel.json`, `.vercelignore`, `strip-public-media-from-dist.mjs`, publish flow.
- **2 lá»— há»•ng CRITICAL phÃ¡t hiá»‡n, CHÆ¯A VÃ â€” báº¯t buá»™c fix trÆ°á»›c deploy:**
  1. `reading_exam_published` / `listening_exam_published` cÃ³ policy `for select using (true)` khÃ´ng giá»›i háº¡n role â†’ anon key (náº±m trong bundle) crawl Ä‘Æ°á»£c toÃ n bá»™ Ä‘á» **kÃ¨m Ä‘Ã¡p Ã¡n** (`parts` jsonb chá»©a `answer` + `explanation`; publish flow chá»‰ strip `imageKey`).
  2. `books/the-song-of-achilles.pdf` (sÃ¡ch cÃ³ báº£n quyá»n) sáº½ public trÃªn Vercel â€” `.vercelignore` cÃ³ dÃ²ng `!apps/web/public/**/*.pdf` re-include, strip script chá»‰ xÃ³a `catalog/`+`data/`. Rá»§i ro DMCA. `ielts-wizard/` (8.4MB áº£nh Ä‘á») cÅ©ng public tÆ°Æ¡ng tá»±.
- Äiá»ƒm máº¡nh xÃ¡c nháº­n: Mode A Fortress Ä‘Ãºng chuáº©n (4.3GB catalog private Storage + signed URL 90s + plan gate + rate limit 45/user/phÃºt), Mode D answer vault, RLS user-data Ä‘áº§y Ä‘á»§ (015), headers/CSP/robots tá»‘t, BYOK khÃ´ng lá»™ key server.
- **Káº¿ hoáº¡ch chi tiáº¿t 6 phase Ä‘Ã£ ghi táº¡i `Security/SECURITY_HARDENING_PLAN.txt`** â€” thá»© tá»± thi cÃ´ng: Phase 1 (vÃ¡ 2 lá»— trÃªn: migration `020_harden_published_exams.sql` + strip answers khi publish + chuyá»ƒn books/ielts-wizard vÃ o signed flow) â†’ Phase 5.1 (Vercel firewall) â†’ Phase 2 (daily quota + Turnstile) â†’ Phase 4 (Terms/copyright) â†’ Phase 3 (UI, kÃ¨m ghi chÃº trung thá»±c: layout/UI khÃ´ng cháº·n tuyá»‡t Ä‘á»‘i Ä‘Æ°á»£c báº±ng ká»¹ thuáº­t, chá»‰ báº±ng phÃ¡p lÃ½ + anti-bot).

### Next session start prompt

Thi cÃ´ng Phase 1 trong `Security/SECURITY_HARDENING_PLAN.txt`: (1) migration 020 scope policy `to authenticated` + strip `answer`/`explanation` trong `readingExamPublish.ts`/`listeningExamPublish.ts` + backfill script; (2) Ä‘Æ°a `books/` + `ielts-wizard/` vÃ o private Storage qua `content-sign` (thÃªm `books/` vÃ o ALLOWED_ROOTS + `.pdf` vÃ o ALLOWED_EXT + sá»­a `toStorageObjectPath` + `BookReaderPage` dÃ¹ng `resolvePlayableMediaUrl`); (3) cháº¡y checklist verify 1.4. KHÃ”NG deploy trÆ°á»›c khi xong Phase 1.

## 2026-07-16 â€” Rebuild PDF loading: fetch buffer thay vÃ¬ PDF.js tá»± táº£i URL (fix lá»—i 204)

- User bÃ¡o `Unexpected server response (204)` khi má»Ÿ `/books/the-song-of-achilles.pdf` trong reader.
- Cháº©n Ä‘oÃ¡n: file PDF há»£p lá»‡ (1MB, header `%PDF-1.4`), dev server tráº£ 200 + 206 range Ä‘Ãºng qua curl â†’ lá»—i náº±m á»Ÿ táº§ng transport cá»§a PDF.js trong browser. **User xÃ¡c nháº­n nguyÃªn nhÃ¢n: Internet Download Manager báº¯t range request cá»§a PDF.js** (trÃ¹ng pattern IDM Ä‘Ã£ ghi nháº­n session trÆ°á»›c).
- Rebuild theo yÃªu cáº§u user (thay tháº¿ thay vÃ¬ vÃ¡): `BookReaderPage` giá» tá»± `fetch(pdfUrl, { cache: 'no-store' })` â†’ kiá»ƒm tra `ok`/204/buffer rá»—ng â†’ Ä‘Æ°a `data: Uint8Array` cho `pdfjs.getDocument` thay vÃ¬ `url`. PDF.js khÃ´ng cÃ²n tá»± má»Ÿ network request nÃªn khÃ´ng cÃ²n bá»‹ intercept.
- Error message rÃµ rÃ ng khi server tráº£ lá»—i: `KhÃ´ng táº£i Ä‘Æ°á»£c PDF (HTTP xxx).`
- Test cáº­p nháº­t: (1) fetch Ä‘Ãºng URL + `getDocument` nháº­n `data` Uint8Array, khÃ´ng nháº­n `url`; (2) test má»›i: server tráº£ 204 â†’ hiá»‡n lá»—i `HTTP 204`, khÃ´ng gá»i `getDocument`.
- Verify: 2/2 BookReaderPage tests PASS; `pnpm --filter web exec tsc --noEmit` PASS.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a verify báº±ng browser tháº­t (browser automation khÃ´ng expose); náº¿u IDM váº«n báº¯t cáº£ `fetch()` XHR thÃ¬ cáº§n user thÃªm `localhost` vÃ o IDM exclusion list.

### Next session start prompt

Hard refresh `/app/reading-corner/sach/read/cv01`; xÃ¡c nháº­n khÃ´ng cÃ²n lá»—i 204, trang 1 render trÃªn canvas, bá»™ Ä‘áº¿m `1 / 278`. Náº¿u váº«n lá»—i â†’ kiá»ƒm tra IDM: Options â†’ File types â†’ thÃªm `localhost` vÃ o "Don't start downloading from the following sites".

## 2026-07-16 â€” Import audio IELTS Listening theo Part (Desktop Dethi)

- Nguá»“n: `C:\Users\ADMIN\OneDrive\Desktop\Dethi\Äá» thi IELTS` â€” **188/192** file Section/Part MP3 (map Cam 9â€“20).
- ÄÃ­ch app: `apps/web/public/catalog/listening/ielts-cam{B}-test{T}/part{N}.mp3`
- ÄÃ­ch tÃ i nguyÃªn: `Tainguyen\IELTS\Listening\Listening IELTS_Test{T}_Cam{B}\part{N}.mp3`
- Catalog JSON: `audioUrl` â†’ `partN.mp3`; xÃ³a segment fallback khi cÃ³ file part.
- **Thiáº¿u:** Cam 20 Test 1 (khÃ´ng cÃ³ file trong folder nguá»“n) â€” váº«n full `listening.mp3` + segment %.
- Script: `scripts/import-ielts-part-audio-from-dethi.mjs`
- App: Ä‘á»•i Part â†’ auto play audio part; `resolveListeningAudioSource` Æ°u tiÃªn per-part.

## 2026-07-16 â€” Fix PDF Viewer 0/0 báº±ng PDF.js renderer

- áº¢nh user cho tháº¥y iframe native PDF Viewer má»Ÿ nhÆ°ng bÃ¡o `0 trÃªn 0`, vÃ¹ng tÃ i liá»‡u trá»‘ng.
- CLI parser `unpdf/getDocumentProxy` Ä‘á»c file thÃ nh **278 trang**, chá»©ng minh file nguá»“n há»£p lá»‡; native blob iframe lÃ  lá»›p gÃ¢y lá»—i trong mÃ´i trÆ°á»ng hiá»‡n táº¡i.
- Loáº¡i bá» hoÃ n toÃ n `blob:` iframe/native PDF Viewer khá»i `BookReaderPage`.
- Reader má»›i: fetch `arrayBuffer` â†’ `resolvePDFJSImport` â†’ `getDocumentProxy` â†’ `renderPageAsImage` trang hiá»‡n táº¡i thÃ nh data URL.
- Chá»‰ render má»™t trang má»—i láº§n á»Ÿ scale 1.6 Ä‘á»ƒ giá»¯ hiá»‡u nÄƒng cho 278 trang; thÃªm nÃºt trang trÆ°á»›c/sau, bá»™ Ä‘áº¿m `page / 278`, loading/render/error states.
- Cleanup abort fetch, há»§y PDF proxy vÃ  bá» káº¿t quáº£ render cÅ© khi Ä‘á»•i trang nhanh.
- Regression test yÃªu cáº§u PDF.js render trang 1, áº£nh data URL, bá»™ Ä‘áº¿m `1 / 278` vÃ  tuyá»‡t Ä‘á»‘i khÃ´ng cÃ³ iframe; test Ä‘á» trÆ°á»›c fix â†’ xanh.
- Verify: 8 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; `pnpm --filter web build` PASS; live module cÃ³ PDF.js renderer, khÃ´ng cÃ³ native iframe; reader route 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a kiá»ƒm tra áº£nh trang tháº­t báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach/read/cv01`; xÃ¡c nháº­n trang 1 hiá»ƒn thá»‹ dÆ°á»›i dáº¡ng áº£nh, bá»™ Ä‘áº¿m `1 / 278`, nÃºt trang sau render trang 2, khÃ´ng cÃ²n toolbar PDF `0/0` vÃ  khÃ´ng hiá»‡n IDM.

## 2026-07-16 â€” Reader PDF ná»™i bá»™ trÃ¡nh IDM báº¯t download

- áº¢nh user xÃ¡c nháº­n click Ä‘Ã£ hoáº¡t Ä‘á»™ng nhÆ°ng Internet Download Manager báº¯t URL `.pdf` vÃ  má»Ÿ dialog download thay vÃ¬ browser reader.
- Regression test yÃªu cáº§u action â€œÄá»c sÃ¡châ€ trá» route app `/app/reading-corner/sach/read/cv01`, khÃ´ng trá» trá»±c tiáº¿p file PDF; test Ä‘á» trÆ°á»›c fix.
- ThÃªm lazy route `reading-corner/sach/read/:bookId` vÃ  `BookReaderPage`.
- Reader tÃ¬m metadata trong books catalog, `fetch()` PDF, táº¡o `blob:` URL báº±ng `URL.createObjectURL`, rá»“i gáº¯n blob URL vÃ o iframe PDF viewer; IDM khÃ´ng nháº­n direct `.pdf` navigation Ä‘á»ƒ cháº·n.
- Reader cÃ³ toolbar tÃªn sÃ¡ch/tÃ¡c giáº£, nÃºt quay láº¡i ká»‡, loading/error state, cleanup AbortController + revokeObjectURL.
- NÃºt trong modal trá» reader route `_self`; FLIP/pointer fixes giá»¯ nguyÃªn.
- ThÃªm unit test reader: fetch Ä‘Ãºng PDF, iframe dÃ¹ng blob URL, cleanup revoke.
- Verify: 8 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; reader route 200; live module cÃ³ createObjectURL; PDF endpoint 200 `application/pdf`.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a render iframe PDF tháº­t báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`, má»Ÿ The Song of Achilles vÃ  báº¥m â€œÄá»c sÃ¡châ€; xÃ¡c nháº­n chuyá»ƒn tá»›i `/app/reading-corner/sach/read/cv01`, khÃ´ng hiá»‡n IDM, PDF hiá»ƒn thá»‹ trong iframe blob vÃ  nÃºt â€œKá»‡ sÃ¡châ€ quay láº¡i Ä‘Ãºng.

## 2026-07-16 â€” Fix láº§n 2 hit-test nÃºt Äá»c sÃ¡ch trong khÃ´ng gian 3D

- User xÃ¡c nháº­n chá»‰ táº¯t pointer cá»§a bÃ¬a váº«n chÆ°a click Ä‘Æ°á»£c; nguyÃªn nhÃ¢n tiáº¿p theo Ä‘Æ°á»£c khÃ³a báº±ng regression: `.book-inside` váº«n á»Ÿ `translateZ(-1px)` vÃ  z1, náº±m trÃªn máº·t pháº³ng 3D Ã¢m.
- Khi modal open, nÃ¢ng `.book-inside` lÃªn `z-index: 3`, `translateZ(1px)`, giá»¯ `pointer-events: auto`.
- ChÃ­nh `[data-book-preview-action]` cÃ³ `position: relative`, `z-index: 5`, `pointer-events: auto`, `translateZ(8px)`; active state giá»¯ translateZ khi scale.
- BÃ¬a open tiáº¿p tá»¥c `pointer-events: none`; link PDF tiáº¿p tá»¥c `_self`.
- Regression CSS kiá»ƒm tra Ä‘á»§ cover pointer-none, inside pointer-auto/z3/Z+1 vÃ  action pointer-auto/z5/Z+8; test Ä‘á» trÆ°á»›c fix â†’ xanh.
- Verify: 7 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; live CSS cÃ³ Ä‘á»§ Z layers; PDF endpoint 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a click tháº­t báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`, má»Ÿ The Song of Achilles, Ä‘á»£i animation xong vÃ  click â€œÄá»c sÃ¡châ€; kiá»ƒm tra hover/click link trÃªn Chrome/Electron vÃ  xÃ¡c nháº­n chuyá»ƒn tá»›i PDF.

## 2026-07-16 â€” Fix nÃºt Äá»c sÃ¡ch bá»‹ bÃ¬a 3D block click

- áº¢nh user cho tháº¥y nÃºt â€œÄá»c sÃ¡châ€ hiá»ƒn thá»‹ nhÆ°ng khÃ´ng click Ä‘Æ°á»£c; regression CSS xÃ¡c nháº­n bÃ¬a Ä‘Ã£ `rotateY(-150deg)` nhÆ°ng hitbox váº«n giá»¯ `pointer-events`, náº±m z2 trÃªn trang trong z1.
- ThÃªm `pointer-events: none` cho `.book-modal-content.is-open .book-cover`; khi bÃ¬a má»Ÿ xong, lá»›p bÃ¬a khÃ´ng cÃ²n cháº·n click.
- `.book-inside` vá»‘n Ä‘Ã£ chuyá»ƒn `pointer-events: auto` á»Ÿ tráº¡ng thÃ¡i open, nÃªn link PDF nháº­n click trá»±c tiáº¿p sau fix.
- Giá»¯ link PDF `target="_self"` Ä‘á»ƒ khÃ´ng phá»¥ thuá»™c popup/tab má»›i.
- Regression test kiá»ƒm tra Ä‘á»“ng thá»i cover open = pointer none vÃ  inside open = pointer auto; test Ä‘á» trÆ°á»›c fix â†’ xanh sau fix.
- Verify: 7 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; live CSS cÃ³ pointer override; PDF endpoint 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a click tháº­t báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`, má»Ÿ The Song of Achilles, Ä‘á»£i bÃ¬a xoay má»Ÿ rá»“i click â€œÄá»c sÃ¡châ€; xÃ¡c nháº­n nÃºt nháº­n hover/click vÃ  tab hiá»‡n táº¡i chuyá»ƒn Ä‘áº¿n PDF.

## 2026-07-16 â€” Fix láº§n 2 nÃºt Äá»c sÃ¡ch: Ä‘iá»u hÆ°á»›ng cÃ¹ng tab

- User xÃ¡c nháº­n native anchor `target="_blank"` váº«n khÃ´ng má»Ÿ trong mÃ´i trÆ°á»ng hiá»‡n táº¡i; káº¿t luáº­n mÃ´i trÆ°á»ng cháº·n tab/cá»­a sá»• má»›i, khÃ´ng pháº£i lá»—i PDF vÃ¬ endpoint luÃ´n 200 `application/pdf`.
- Regression test Ä‘á»•i yÃªu cáº§u cá»§a action PDF sang `target="_self"`; test Ä‘á» khi code cÃ²n `_blank`.
- NÃºt â€œÄá»c sÃ¡châ€ váº«n lÃ  anchor native nhÆ°ng nay Ä‘iá»u hÆ°á»›ng cÃ¹ng tab tá»›i `/books/the-song-of-achilles.pdf`; khÃ´ng dÃ¹ng popup, `window.open` hoáº·c tab má»›i.
- Clone trong FLIP modal giá»¯ nguyÃªn `_self` vÃ  tabIndex 0; ngÆ°á»i dÃ¹ng dÃ¹ng nÃºt Back cá»§a browser Ä‘á»ƒ quay láº¡i ká»‡.
- Verify: regression test Ä‘á» â†’ xanh; 6 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; PDF endpoint 200 `application/pdf`.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a click navigation tháº­t báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`, má»Ÿ The Song of Achilles, click â€œÄá»c sÃ¡châ€; xÃ¡c nháº­n tab hiá»‡n táº¡i chuyá»ƒn tháº³ng Ä‘áº¿n PDF vÃ  nÃºt Back quay láº¡i ká»‡.

## 2026-07-16 â€” Fix nÃºt Äá»c sÃ¡ch khÃ´ng má»Ÿ PDF

- User xÃ¡c nháº­n click â€œÄá»c sÃ¡châ€ khÃ´ng má»Ÿ gÃ¬ dÃ¹ PDF endpoint Ä‘Ã£ 200; nguyÃªn nhÃ¢n Ä‘Ã¡ng tin cáº­y nháº¥t lÃ  cÆ¡ cháº¿ `window.open()` báº±ng JS bá»‹ trÃ¬nh duyá»‡t/in-app environment cháº·n.
- Regression test yÃªu cáº§u action cá»§a sÃ¡ch Ä‘Ã£ import pháº£i lÃ  `HTMLAnchorElement` native vá»›i `href`, `target="_blank"` vÃ  `rel="noopener noreferrer"`; test Ä‘á» khi action cÃ²n lÃ  button.
- `BilingualBooksPage` render `<a>` native cho sÃ¡ch cÃ³ `pdfUrl`; sÃ¡ch chÆ°a cÃ³ PDF tiáº¿p tá»¥c render `<button>` â€œÄá»c thá»­â€.
- Preview controller chá»‰ gáº¯n fallback handler â€œÄ‘ang biÃªn táº­pâ€ cho `HTMLButtonElement`; anchor PDF Ä‘Æ°á»£c clone nguyÃªn váº¹n, tabIndex chuyá»ƒn 0 vÃ  Ä‘á»ƒ trÃ¬nh duyá»‡t xá»­ lÃ½ navigation trá»±c tiáº¿p.
- CSS action bá»• sung inline-flex/center/text-decoration none Ä‘á»ƒ anchor giá»¯ Ä‘Ãºng giao diá»‡n nÃºt cÅ©.
- Verify: regression test Ä‘á» â†’ xanh; 6 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; live module cÃ³ native href; PDF endpoint tiáº¿p tá»¥c 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a click native anchor báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`, má»Ÿ The Song of Achilles vÃ  click â€œÄá»c sÃ¡châ€; xÃ¡c nháº­n browser má»Ÿ `/books/the-song-of-achilles.pdf` á»Ÿ tab má»›i. Náº¿u mÃ´i trÆ°á»ng váº«n cháº·n tab má»›i, chuyá»ƒn `target` sang `_self`.

## 2026-07-16 â€” Import The Song of Achilles PDF vÃ o ká»‡ sÃ¡ch

- Nguá»“n: `D:\App-English-Ryan\Tainguyen\Book\The Song of Achilles.pdf` (1,018,904 bytes).
- Sao chÃ©p nguyÃªn váº¹n vÃ o `apps/web/public/books/the-song-of-achilles.pdf`; SHA-256 nguá»“n/Ä‘Ã­ch cÃ¹ng `0C70B3FB6DD44BE73C036769A82127E0299E5D5F2904AF259609541D955C9F16`.
- Catalog `cv01` vá»‘n Ä‘Ã£ cÃ³ bÃ¬a/title/author, nay thÃªm `pdfUrl: /books/the-song-of-achilles.pdf`.
- `BookCover` há»— trá»£ `pdfUrl`; preview cá»§a sÃ¡ch cÃ³ PDF hiá»ƒn thá»‹ nÃºt â€œÄá»c sÃ¡châ€, sÃ¡ch chÆ°a cÃ³ file váº«n lÃ  â€œÄá»c thá»­â€.
- Preview controller Ä‘á»c `data-book-preview-url` vÃ  má»Ÿ PDF báº±ng tab má»›i vá»›i `noopener,noreferrer`; fallback â€œÄ‘ang biÃªn táº­pâ€ giá»¯ nguyÃªn cho sÃ¡ch chÆ°a import.
- ThÃªm regression test catalogâ†’DOM vÃ  test controller má»Ÿ Ä‘Ãºng PDF.
- Verify: 6 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; Vite HEAD `/books/the-song-of-achilles.pdf` tráº£ 200, `application/pdf`, Ä‘Ãºng 1,018,904 bytes.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a click PDF báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`, click â€œThe Song of Achillesâ€, Ä‘á»£i animation má»Ÿ sÃ¡ch, báº¥m â€œÄá»c sÃ¡châ€ vÃ  xÃ¡c nháº­n PDF má»Ÿ á»Ÿ tab má»›i; smoke-test Ä‘Ã³ng modal/drag shelf váº«n bÃ¬nh thÆ°á»ng.

## 2026-07-16 â€” Fix StudySession grid lÃ m xuyÃªn báº£ng Vocabulary

- Feedback áº£nh xÃ¡c nháº­n `.vocab-study-shell` transparent lÃ m toÃ n bá»™ báº£ng tá»«, toolbar vÃ  chá»¯ phÃ­a dÆ°á»›i xuyÃªn qua mÃ n hÃ¬nh há»c, gÃ¢y chá»“ng lá»›p.
- Äá»•i study shell tá»« transparent sang background kÃ­n gá»“m mÃ u `--reading-corner-bg` + hai linear-gradient grid 32px.
- StudySession tiáº¿p tá»¥c khÃ´ng cÃ³ ribbon; ná»n grid riÃªng cá»§a overlay che sáº¡ch CardPanel phÃ­a dÆ°á»›i nhÆ°ng card há»c, stat bar, mode tabs vÃ  controls váº«n náº±m phÃ­a trÃªn.
- Regression test Ä‘á»•i yÃªu cáº§u tá»« transparent sang opaque grid surface: pháº£i cÃ³ background color, grid line vÃ  background-size 32px; test Ä‘á» trÆ°á»›c fix â†’ xanh sau fix.
- Verify: 64 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; live Vite CSS cÃ³ selector/mÃ u/grid size; `/app/vocab` HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered sau fix vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/vocab`, má»Ÿ SRS khi báº£ng deck Ä‘ang hiá»‡n phÃ­a dÆ°á»›i; xÃ¡c nháº­n chá»‰ tháº¥y ná»n xanh grid + UI há»c, khÃ´ng cÃ²n hÃ ng tá»«/toolbar xuyÃªn qua, rá»“i smoke-test 8 mode cÃ²n láº¡i vÃ  light/mid/dark.

## 2026-07-16 â€” Grid cho toÃ n bá»™ cháº¿ Ä‘á»™ há»c Vocabulary

- Ãp dá»¥ng Ã´ lÆ°á»›i cá»§a `/app/vocab` cho cáº£ 9 mode dÃ¹ng chung `StudySession`: SRS, Quiz, Type, Listen & Type, Speaking, Weak Words, Review, Stats vÃ  Notebook.
- NguyÃªn nhÃ¢n lá»›p grid bá»‹ che trong mode há»c: `.vocab-study-shell` lÃ  overlay `absolute inset-0 z-40` vÃ  cÃ³ `background: var(--vs-shell-bg)`.
- Trong `.app-shell--grid`, Ã©p riÃªng `.vocab-study-shell` vá» transparent; stat bar, mode tabs, flashcard, quiz card, input, báº£ng thá»‘ng kÃª vÃ  notebook card váº«n giá»¯ surface riÃªng.
- KhÃ´ng render ribbon vÃ¬ `/app/vocab` tiáº¿p tá»¥c á»Ÿ backdrop mode `grid`.
- Regression assertion Ä‘Ã£ Ä‘á» trÆ°á»›c fix vÃ¬ thiáº¿u selector study shell, sau fix xanh.
- Verify: 64 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; live Vite CSS chá»©a selector má»›i; `/app/vocab` HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/vocab`; má»Ÿ láº§n lÆ°á»£t SRS, Quiz, Type, Listen & Type, Speaking, Weak Words, Review, Stats, Notebook vÃ  xÃ¡c nháº­n grid 32px hiá»‡n phÃ­a sau, khÃ´ng cÃ³ ribbon, card/input/panel váº«n rÃµ á»Ÿ light/mid/dark.

## 2026-07-16 â€” Fix grid Vocabulary bá»‹ CardPanel che

- Repro theo tráº¡ng thÃ¡i `activeDeckId`: route `/app/vocab` Ä‘Ã£ Ä‘Ãºng mode `grid`, nhÆ°ng `CardPanel` full-height váº«n phá»§ `var(--bg-primary)` nÃªn ngÆ°á»i dÃ¹ng khÃ´ng tháº¥y Ã´ lÆ°á»›i khi má»™t deck Ä‘ang Ä‘Æ°á»£c nhá»›/má»Ÿ.
- ThÃªm hook `.vocab-card-panel` cho cáº£ tráº¡ng thÃ¡i deck Ä‘ang táº£i/chÆ°a cÃ³ vÃ  tráº¡ng thÃ¡i deck Ä‘Ã£ má»Ÿ.
- Trong `.app-shell--grid`, Ã©p riÃªng `.vocab-card-panel` vá» `background: transparent !important`; header, báº£ng, card vÃ  modal bÃªn trong giá»¯ surface riÃªng.
- ThÃªm regression test render CardPanel tháº­t vá»›i store/query mock, Ä‘á»“ng thá»i kiá»ƒm tra selector CSS grid-mode tá»“n táº¡i.
- Verify: regression loop Ä‘á» 2/2 trÆ°á»›c fix â†’ xanh; tá»•ng 63 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; diff-check PASS; live Vite CSS/module PASS; `/app/vocab` HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/vocab` khi Ä‘ang á»Ÿ danh sÃ¡ch deck vÃ  khi má»™t deck Ä‘Ã£ má»Ÿ; xÃ¡c nháº­n grid 32px Ä‘á»u hiá»‡n, khÃ´ng cÃ³ ribbon, header/báº£ng/card váº«n dá»… Ä‘á»c á»Ÿ light/mid/dark.

## 2026-07-16 â€” Grid-only cho Writing subpages vÃ  Vocabulary

- TÃ¡ch backdrop AppShell thÃ nh 3 mode: `none`, `grid`, `ribbon`; mode `grid` render Ã´ lÆ°á»›i nhÆ°ng khÃ´ng táº¡o ba pháº§n tá»­ ribbon.
- Chuyá»ƒn `/app/vocab` tá»« ribbon sang grid-only.
- Báº­t grid-only cho Writing Translate hub + 6 track, Writing Practice hub + Task 1/Task 2/Free, Cambridge hub + A2/B1/B2/C1/C2 vÃ  Writing Dashboard.
- Danh sÃ¡ch ngÆ°á»i dÃ¹ng láº·p B2 vÃ  thiáº¿u C2; map thÃªm C2 theo cáº¥u trÃºc Cambridge A2â€“C2 hiá»‡n cÃ³.
- DÃ¹ng lá»›p chung `.app-shell--backdrop` Ä‘á»ƒ gá»¡ ná»n ngoÃ i cá»§a Writing layout, `.cb-hub`, `.wd-page` vÃ  Vocabulary `.app-page-surface`; card/form/header bÃªn trong váº«n giá»¯ surface riÃªng.
- CÃ¡c trang backdrop cÅ© váº«n dÃ¹ng mode `ribbon`; cÃ¡c route ngoÃ i whitelist váº«n `none`.
- Verify: 61 route mode tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; `pnpm --filter web build` PASS; 5 URL Ä‘áº¡i diá»‡n HTTP 200; diff-check PASS.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/vocab`, `/app/writing/translate/grammar_basic`, `/app/writing/practice/task2`, `/app/writing/cambridge/c2`, `/app/writing/dashboard`; xÃ¡c nháº­n chá»‰ cÃ³ grid 32px, tuyá»‡t Ä‘á»‘i khÃ´ng cÃ³ ribbon, card/form váº«n rÃµ á»Ÿ light/mid/dark.

## 2026-07-16 â€” Grid + ribbon cho Exam Track, Shadowing lesson vÃ  Sentence catalog

- Má»Ÿ rá»™ng `hasAppRibbonBackdrop()` cho Ä‘Ãºng cÃ¡c route Exam Track IELTS/Cambridge Ä‘Æ°á»£c yÃªu cáº§u, gá»“m level A2â€“C2 vÃ  cÃ¡c trang Listening/Reading.
- Báº­t backdrop cho route bÃ i há»c Shadowing má»™t cáº¥p nhÆ° `/app/shadowing/28EFRJaA2JQ`; query `?mode=shadowing` khÃ´ng áº£nh hÆ°á»Ÿng vÃ¬ AppShell match theo pathname.
- Báº­t backdrop cho má»i Sentence Structure ID dáº¡ng `catalog:ss:*`, há»— trá»£ cáº£ dáº¥u `:` trá»±c tiáº¿p vÃ  `%3A` URL-encoded.
- Gá»¡ ná»n Ä‘áº·c chá»‰ á»Ÿ container ngoÃ i: `.exam-hub-page`, `.exam-skill-picker`, `.shadowing-detail`, `.ss-shell`; card, player, transcript vÃ  panel váº«n giá»¯ surface riÃªng.
- Táº¯t dot texture `ss-shell::before` Ä‘á»ƒ khÃ´ng chá»“ng lÃªn grid 32px dÃ¹ng chung.
- Verify: 41 matcher tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; `pnpm --filter web build` PASS; 4 URL Ä‘áº¡i diá»‡n HTTP 200; live Vite CSS chá»©a Ä‘á»§ selector má»›i.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y. `pnpm build` Ä‘Ã£ cháº¡y `build:catalog` vÃ  lÃ m má»›i cÃ¡c file catalog sinh tá»± Ä‘á»™ng; giá»¯ nguyÃªn, khÃ´ng tá»± Ã½ hoÃ n tÃ¡c worktree.

### Next session start prompt

Hard refresh má»™t route má»—i nhÃ³m: `/app/exam/track/cambridge/c2/reading`, `/app/exam/track/ielts/listening`, `/app/shadowing/28EFRJaA2JQ?mode=shadowing`, vÃ  má»™t `/app/sentence-structure/catalog:ss:*`; xÃ¡c nháº­n grid/ribbon hiá»‡n sau ná»™i dung, card/player váº«n rÃµ á»Ÿ cáº£ light/mid/dark.

## 2026-07-16 â€” ThÃªm Ã´ lÆ°á»›i cho cÃ¡c trang con Reading Corner

- `/bao` vÃ  article reader giá»¯ grid dÃ¹ng chung `.snb-ribbon-grid` Ä‘Ã£ cÃ³.
- `/sach` bá»• sung `.library-camera::before`: grid 32Ã—32px mÃ u amber nháº¡t 14%, opacity .42, soft-light.
- Grid sÃ¡ch náº±m z2 trÃªn áº£nh ná»n nhÆ°ng dÆ°á»›i header/bookcase z4+, pointer-events none nÃªn khÃ´ng che áº£nh bÃ¬a hoáº·c cháº·n drag/click/FLIP.
- Verify: child-grid assertion PASS; 4 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; live CSS PASS; `/sach` vÃ  `/bao` HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Hard refresh `/app/reading-corner/sach` vÃ  `/bao`; kiá»ƒm tra Ã´ lÆ°á»›i 32px Ä‘á»§ nháº¹ trÃªn áº£nh thÆ° viá»‡n vÃ  rÃµ trÃªn ná»n xanh, khÃ´ng che card/bookcase.

## 2026-07-16 â€” ThÃªm nÃºt Quay láº¡i cho Reading Corner hub

- `/app/reading-corner` thÃªm `Link.rc-hub-back` á»Ÿ Ä‘áº§u ná»™i dung, Ä‘iá»u hÆ°á»›ng vá» `/app/home`.
- NÃºt cÃ³ icon mÅ©i tÃªn trÃ¡i, glass surface theo theme tokens, blur 10px, hover dá»‹ch trÃ¡i nháº¹ vÃ  focus-visible.
- NÃºt náº±m trong flow trÆ°á»›c header nÃªn khÃ´ng che tiÃªu Ä‘á» trÃªn mobile.
- ThÃªm `ReadingCornerHub.test.tsx` xÃ¡c nháº­n link â€œQuay láº¡iâ€ cÃ³ `href=/app/home`.
- Verify: 4 Reading Corner tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; live hub module PASS.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Hard refresh `/app/reading-corner`; kiá»ƒm tra nÃºt Quay láº¡i trÃªn desktop/mobile vÃ  xÃ¡c nháº­n Ä‘iá»u hÆ°á»›ng vá» `/app/home`.

## 2026-07-16 â€” Gá»¡ mouse tilt, thay báº±ng ambient background drift

- XÃ³a toÃ n bá»™ `sceneRef`, `cameraRef`, preview tilt refs, mousemove/mouseleave listeners, RAF lerp vÃ  CSS vars/rotateX/rotateY cá»§a camera.
- `.library-camera` giá»¯ láº¡i lÃ m wrapper tÄ©nh cho background/scene; `stage.is-preview-open` váº«n giá»¯ vÃ¬ chá»‰ khÃ³a shelf khi FLIP modal má»Ÿ.
- `.library-bg` cháº¡y `ambient-drift` Ä‘á»™c láº­p: scale 1â†’1.03, 30s ease-in-out alternate infinite, transform-origin center bottom.
- KhÃ´ng thÃªm scroll parallax/listener Ä‘á»ƒ trÃ¡nh chi phÃ­ vÃ  xung Ä‘á»™t drag shelf.
- Reduced-motion táº¯t ambient animation, transform vÃ  will-change.
- XÃ³a regression test camera tilt; giá»¯ test khÃ´ng cÃ³ RAF lÃºc render vÃ  toÃ n bá»™ drag/click/FLIP tests.
- Verify: source assertion khÃ´ng mousemove/RAF/camera rotate PASS; 3 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; live module khÃ´ng tilt + live ambient CSS PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; xÃ¡c nháº­n rÃª chuá»™t khÃ´ng lÃ m scene nghiÃªng, background zoom ráº¥t cháº­m 30s, hover/drag/FLIP váº«n hoáº¡t Ä‘á»™ng vÃ  reduced-motion táº¯t drift.

## 2026-07-16 â€” Fix focus halo sÃ¡t bÃ¬a + dáº£i tá»‘i ngang hÃ ng 2

- Feedback loop Ä‘á» xÃ¡c nháº­n 3 váº¥n Ä‘á» cÃ¹ng tá»“n táº¡i: bottom fade `position:fixed`, focus shadow Ã¡p trá»±c tiáº¿p lÃªn `.book`, shelf occlusion dÃ¹ng 88% shadow.
- Focus halo chuyá»ƒn sang `.book::before`, inset -8px vÃ  radius 8px; `:focus-visible` chá»‰ báº­t opacity. Ring dÃ¹ng spread 6px 50% + glow 24px/4px 30%, táº¡o khoáº£ng há»Ÿ tá»± nhiÃªn.
- Focused book z11 Ä‘á»ƒ halo khÃ´ng bá»‹ shelf front z8 che; contact shadow tiáº¿p tá»¥c dÃ¹ng `.book::after`.
- Bottom fade chuyá»ƒn tá»« `.library-scene::before` fixed sang `.library-camera::after` absolute bottom, nÃªn chá»‰ xuáº¥t hiá»‡n á»Ÿ cuá»‘i tháº­t cá»§a toÃ n bá»™ scene thay vÃ¬ Ä‘Ã¡y viewport/hÃ ng 2.
- Shelf-front shadow vÃ  lower-row occlusion giáº£m 18â†’16px, shadow mix 88%â†’60% (effective khoáº£ng 24% tá»« base rgba .4).
- Verify: original red loop GREEN; 4 camera/drag/click/FLIP tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; live CSS fix PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; Tab vÃ o sÃ¡ch kiá»ƒm tra halo cÃ¡ch bÃ¬a ~8px, cuá»™n qua hÃ ng 2 xÃ¡c nháº­n khÃ´ng cÃ²n dáº£i chá»¯ nháº­t tá»‘i vÃ  kiá»ƒm tra fade chá»‰ xuáº¥t hiá»‡n á»Ÿ cuá»‘i scene.

## 2026-07-16 â€” Warm UI rings, glass pills vÃ  bottom fade

- Chá»‰ sá»­a `readingCorner.css`; khÃ´ng Ä‘á»•i DOM/handlers/animation sÃ¡ch.
- Book `:focus-visible` bá» outline xanh/tÃ­m, dÃ¹ng amber ring 3px 70% + glow 20px 40%; váº«n giá»¯ keyboard accessibility.
- NÃºt â€œGÃ³c Ä‘á»câ€ vÃ  â€œÄá»c BÃ¡o Song Ngá»¯â€ dÃ¹ng walnut glass 50%, blur 10px, amber border 30%, cream text vÃ  shadow 4px/12px.
- Hover pill pha nháº¹ `--library-accent`, selector cÃ³ specificity cao hÆ¡n rule tráº¯ng legacy.
- `.library-scene::before` táº¡o bottom fade fixed 100â€“150px, transparent â†’ dark walnut 96% á»Ÿ 90%; z850, pointer-events none. Grain tiáº¿p tá»¥c á»Ÿ `::after` z900.
- Verify: 4 camera/hover/click/FLIP tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; warm UI CSS assertion PASS; scoped diff-check PASS; live CSS PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; dÃ¹ng Tab kiá»ƒm tra amber focus ring, hover hai glass pill vÃ  cuá»™n xuá»‘ng cuá»‘i Ä‘á»ƒ kiá»ƒm tra fade khÃ´ng che click/drag sÃ¡ch.

## 2026-07-16 â€” Header depth + dust motes cho library scene

- ThÃªm `.library-header-depth` cao 280â€“480px phÃ­a sau intro, `backdrop-filter: blur(2.5px) brightness(.85)` vÃ  mask fade xuá»‘ng dÆ°á»›i; bookcase ngoÃ i vÃ¹ng nÃ y giá»¯ nguyÃªn nÃ©t.
- `.library-intro::before` táº¡o overlay nÃ¢u Ä‘en feathered báº±ng linear-gradient + radial mask, khÃ´ng cÃ³ card/border cá»©ng.
- `.library-intro::after` táº¡o warm radial glow vÃ ng 15%, lá»›n hÆ¡n intro vÃ  blur 36px; content náº±m z2 phÃ­a trÃªn.
- H1 dÃ¹ng text-shadow 3 lá»›p: contact 2px/4px, ambient 8px/24px vÃ  rim light tráº¯ng 1px.
- ThÃªm Ä‘Ãºng 18 `.library-dust__particle` deterministic; size 2â€“4px, duration 8â€“15s, negative delay, drift riÃªng; animation chá»‰ transform/opacity.
- Dust náº±m trong `.library-camera`, cÃ¹ng tilt vá»›i scene nhÆ°ng pointer-events none; reduced-motion táº¯t animation vÃ  will-change.
- Mobile giá»¯ vertical padding intro Ä‘á»ƒ mask/glow khÃ´ng bá»‹ cáº¯t; thÃªm WebKit mask fallback.
- Verify: 4 camera/click/FLIP tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; header-depth assertion PASS; scoped diff-check PASS; live module/CSS PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; kiá»ƒm tra header feather/glow, blur chá»‰ á»Ÿ vÃ¹ng trÃªn, 18 dust motes, camera tilt vÃ  reduced-motion/mobile; xÃ¡c nháº­n bookcase váº«n sáº¯c nÃ©t.

## 2026-07-16 â€” Camera tilt + spine depth tÆ°Æ¡ng tÃ¡c

- ThÃªm `.library-camera` bÃªn trong `.library-scene`; scene giá»¯ scroll/viewport á»•n Ä‘á»‹nh, camera chá»©a background + intro + bookcase vÃ  nháº­n transform 3D.
- Mousemove fine-pointer chuáº©n hÃ³a -1..1, target rotateX tá»‘i Ä‘a Â±4Â°, rotateY Â±6Â°; RAF lerp há»‡ sá»‘ .08 vÃ  chá»‰ tiáº¿p tá»¥c khi cÃ²n sai sá»‘, khÃ´ng cÃ³ loop idle.
- Touch/coarse pointer vÃ  `prefers-reduced-motion` khÃ´ng Ä‘Äƒng kÃ½ tilt; CSS reduced-motion táº¯t transform/will-change camera.
- Khi FLIP modal má»Ÿ: `previewOpenRef`, class `.is-preview-open` vÃ  reset callback Ä‘Æ°a target vá» 0; CSS Ã©p camera 0Â° ngay Ä‘á»ƒ ná»™i dung Ä‘á»c á»•n Ä‘á»‹nh.
- Má»—i `.book` cÃ³ `--book-cover-y` deterministic theo ID trong khoáº£ng -6..6Â° vÃ  `--book-cover-image`.
- Shelf `.book-cover` dÃ¹ng preserve-3d/rotateY; `::before` táº¡o gÃ¡y 8â€“12px rotateY(90Â°), láº¥y chÃ­nh áº£nh bÃ¬a vÃ  brightness .7. Modal khÃ´ng káº¿ thá»«a vars outer book nÃªn váº«n má»Ÿ pháº³ng.
- Occlusion giá»¯ shelf front z8 cao hÆ¡n book z7; shadow overlay táº§ng trÃªn z10 tiáº¿p tá»¥c che tá»± nhiÃªn Ä‘áº§u sÃ¡ch táº§ng dÆ°á»›i.
- Regression test má»›i kiá»ƒm tra RAF lerp, camera vars, preview reset class vÃ  toÃ n bá»™ cover angle range.
- Verify: 4 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; interactive-depth assertion PASS; scoped diff-check PASS; live camera module/CSS PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; rÃª chuá»™t Ä‘áº¿n 4 gÃ³c, kiá»ƒm tra tilt â‰¤6Â°, drag shelf, hover sÃ¡ch, spine depth vÃ  camera reset khi modal má»Ÿ; thá»­ thÃªm touch/mobile/reduced-motion.

## 2026-07-16 â€” Äá»“ng cháº¥t áº£nh tháº­t vÃ  CSS bookcase

- Root scene thÃªm class `.library-scene`; `::after` phá»§ SVG `feTurbulence` noise 180Ã—180, opacity .05, blend overlay lÃªn cáº£ áº£nh ná»n vÃ  bookcase.
- `.bookcase-container` cÃ³ color grade `saturate(.92) contrast(1.05) brightness(.98) sepia(.05)`, shadow blend lá»›n 100px/40px Ä‘á»ƒ má»m viá»n.
- Container overlay káº¿t há»£p side vignette 30%, warm radial highlight á»Ÿ giá»¯a-trÃªn vÃ  orange grade 8%â†’5%, `mix-blend-mode: soft-light`.
- BÃ¬a trÃªn shelf dÃ¹ng aging filter `saturate(.9) contrast(1.03) brightness(.97)` + wash vÃ ng nÃ¢u 6% multiply.
- Modal FLIP explicit `filter:none` vÃ  áº©n aging pseudo-layer, nÃªn preview dÃ¹ng áº£nh bÃ¬a gá»‘c sáº¯c nÃ©t.
- Contact shadow má»—i sÃ¡ch Ä‘á»•i thÃ nh dáº£i 5px opacity .5 vá»›i box-shadow 2px/3px, sÃ¡t máº·t ká»‡; hover váº«n bÃ¹ translate Ä‘á»ƒ bÃ³ng á»Ÿ láº¡i shelf.
- KhÃ´ng Ä‘á»•i drag/open/close handlers hoáº·c transition transform cá»§a sÃ¡ch.
- Verify: 3 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; compositing CSS assertion PASS; live CSS/module PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; kiá»ƒm tra warm grade/noise/vignette, cáº¡nh bookcase hÃ²a ná»n, contact shadow vÃ  Ä‘á»™ sáº¯c nÃ©t bÃ¬a trong modal trÃªn desktop/mobile.

## 2026-07-16 â€” GhÃ©p áº£nh thÆ° viá»‡n tháº­t phÃ­a sau CSS bookcase

- Nguá»“n: `Crawl/Giaodien/library.jpg` (889,520 bytes); copy vÃ o `apps/web/public/images/bilingual/library-bg.jpg`.
- `BilingualBooksPage` thÃªm `.library-bg`, `.library-bg-overlay` vÃ  `.bookcase-container`; bookcase/shelf-row/book DOM bÃªn trong giá»¯ nguyÃªn.
- Background fixed/cover/center-bottom vá»›i fallback `#3d2b1f`, thay hoÃ n toÃ n ná»n grid xanh trÃªn route `/reading-corner/sach`.
- Overlay dÃ¹ng radial vignette tá»‘i nháº¥t á»Ÿ trung tÃ¢m + gradient dá»c Ä‘á»ƒ giáº£m chi tiáº¿t áº£nh tháº­t phÃ­a sau bookcase.
- `bookcase-container` max-width 1180px, centered, shadow `0 20px 60px rgba(0,0,0,.6)` qua CSS variable; pseudo-elements táº¡o ambient depth vÃ  edge blending.
- Intro chuyá»ƒn sang text tráº¯ng/muted cÃ³ text-shadow Ä‘á»ƒ Ä‘á»c rÃµ trÃªn áº£nh ná»n.
- KhÃ´ng báº­t mousemove parallax trong patch nÃ y Ä‘á»ƒ trÃ¡nh tranh pointer vá»›i drag-to-scroll tá»«ng shelf vÃ  giá»¯ hiá»‡u nÄƒng á»•n Ä‘á»‹nh.
- Regression test bá»• sung xÃ¡c nháº­n 3 lá»›p background/container; 3 hover/click/FLIP tests váº«n PASS.
- Verify: asset size PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; live asset 889,520 bytes, CSS/module PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; kiá»ƒm tra áº£nh cover trÃªn desktop/mobile, vignette trung tÃ¢m, text contrast, shadow/blend bookcase vÃ  FLIP sau khi scroll ngang. Chá»‰ thÃªm parallax náº¿u drag shelf váº«n á»•n.

## 2026-07-16 â€” TÄƒng chiá»u sÃ¢u 3D CSS cho bookcase

- Chá»‰ sá»­a `readingCorner.css`; khÃ´ng Ä‘á»•i component, drag handlers hay FLIP controller.
- Side-left/right dÃ¹ng clip-path hÃ¬nh thang vÃ  `perspective(800px) rotateY(Â±7deg)` vá»›i transform-origin á»Ÿ mÃ©p ngoÃ i, táº¡o cáº£m giÃ¡c vÃ¡ch má»Ÿ vá» phÃ­a ngÆ°á»i xem.
- Shelf-top dÃ¹ng máº·t sÃ¡ng `#c9946b`, highlight trÃªn-trÃ¡i, border-bottom tá»‘i vÃ  inset fold shadow; shelf-front dÃ¹ng gradient xuá»‘ng `#4a2f18` cÃ¹ng repeating wood grain 2â€“6px.
- Shelf front z8 vÃ  `::after` táº¡o bÃ³ng 18px xuá»‘ng compartment káº¿ tiáº¿p; thÃªm overlay tÆ°Æ¡ng á»©ng trÃªn Ä‘á»‰nh `.shelf-books` tá»« row thá»© hai Ä‘á»ƒ bÃ³ng cháº¡m pháº§n Ä‘áº§u bÃ¬a.
- Top/bottom/side frame cÃ³ repeating-linear-gradient vÃ¢n gá»— opacity tháº¥p; rim light Ä‘á»“ng nháº¥t tá»« trÃªn-trÃ¡i, cáº¡nh dÆ°á»›i/pháº£i tá»‘i hÆ¡n.
- Bá» `filter: blur(5px)` khá»i shelf shadow; toÃ n bá»™ lá»›p má»›i lÃ  static transform/gradient/box-shadow, khÃ´ng thÃªm animation loop.
- Verify: 3 hover/click/FLIP tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; 3D CSS assertion PASS; live Vite CSS PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; kiá»ƒm tra side panels xiÃªn, Ä‘Æ°á»ng gáº¥p shelf-top/front, vÃ¢n gá»—, bÃ³ng trÃªn Ä‘áº§u sÃ¡ch táº§ng dÆ°á»›i vÃ  rim light trÃªn-trÃ¡i á»Ÿ desktop/mobile.

## 2026-07-16 â€” NÃ¢ng cáº¥p cÃ¡c ká»‡ rá»i thÃ nh bookcase hoÃ n chá»‰nh

- Tham chiáº¿u `Crawl/Giaodien/sheft.jpg`: tá»§ thÆ° viá»‡n walnut tá»‘i, khung crown dÃ y, back panel kÃ­n vÃ  Ã¡nh sÃ¡ng áº¥m tá»« trÃªn.
- Bá»c 3 shelf-row trong `.bookcase`; thÃªm `.bookcase-back`, top, bottom, side-left/right, light overlay vÃ  2 divider dá»c.
- Frame dÃ¹ng CSS variables walnut `#6f4729 / #5c3a21 / #3d2615`; top/bottom 32â€“40px, side 22â€“28px, highlight mÃ©p vÃ  shadow táº¡o khá»‘i.
- Back panel `#4a3728` cÃ³ vÃ¢n dá»c nháº¹, inset side shadow vÃ  bÃ³ng radial/linear riÃªng á»Ÿ gÃ³c trÃªn tá»«ng shelf-row.
- Shelf front tÄƒng lÃªn 14â€“17px, kÃ©o sÃ¡t mÃ©p trong hai trá»¥; bá» support rá»i cá»§a tá»«ng row Ä‘á»ƒ toÃ n bá»™ thanh ngang trá»Ÿ thÃ nh má»™t pháº§n cá»§a khung tá»§.
- Light overlay phá»§ interior tá»« sÃ¡ng nháº¹ phÃ­a trÃªn xuá»‘ng tá»‘i phÃ­a dÆ°á»›i; pointer-events none nÃªn drag/click sÃ¡ch khÃ´ng bá»‹ áº£nh hÆ°á»Ÿng.
- Responsive dÆ°á»›i 700px: frame side 18px, top 30px, bottom 32px; áº©n divider Ä‘á»ƒ giá»¯ diá»‡n tÃ­ch sÃ¡ch vÃ  horizontal scroll.
- Regression test bá»• sung xÃ¡c nháº­n back/top/bottom, 2 side vÃ  2 divider; click/FLIP tests váº«n PASS.
- Verify: 3 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; live bookcase module/CSS PASS; route HTTP 200.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a cÃ³ screenshot rendered tá»± Ä‘á»™ng vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; Ä‘á»‘i chiáº¿u `sheft.jpg`: kiá»ƒm tra crown frame, panel sau kÃ­n, shelf ná»‘i trá»¥, divider, Ã¡nh sÃ¡ng top-down, horizontal scroll vÃ  FLIP trÃªn desktop/mobile.

## 2026-07-16 â€” NÃ¢ng cáº¥p shelf bar thÃ nh ká»‡ gá»— hai lá»›p

- Chá»‰ sá»­a `readingCorner.css`, khÃ´ng Ä‘á»•i HTML/React/controller.
- `.shelf-bar` lÃ  máº·t trÆ°á»›c 10â€“12px vá»›i gradient `#8b5e3c â†’ #6b4423`; `::before` táº¡o máº·t trÃªn 7px vá»›i gradient `#d4a574 â†’ #b8895a` vÃ  highlight be máº£nh.
- Giáº£m bo gÃ³c cÃ²n 2â€“4px; thÃªm shadow `0 8px 16px rgba(0,0,0,.25)` qua CSS variable.
- `.shelf-row` cÃ³ hai giÃ¡ Ä‘á»¡ dá»c 18Ã—36px báº±ng layered background, cÃ¹ng tone gá»— tá»‘i.
- `.book::after` táº¡o bÃ³ng ellipse dÆ°á»›i tá»«ng cuá»‘n; khi hover bÃ³ng bÃ¹ `translateY` Ä‘á»ƒ náº±m gáº§n máº·t ká»‡ trong lÃºc bÃ¬a Ä‘Æ°á»£c rÃºt lÃªn.
- Äiá»u chá»‰nh stacking: sÃ¡ch z7, hover z9, shelf z6 Ä‘á»ƒ bÃ³ng náº±m trÃªn máº·t gá»— nhÆ°ng ká»‡ váº«n Ä‘á»¡ Ä‘Ãºng Ä‘Ã¡y sÃ¡ch.
- Verify: CSS assertion PASS; live Vite CSS PASS; scoped diff-check PASS; `pnpm --filter web exec tsc --noEmit` PASS; 3 click/FLIP tests PASS.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; kiá»ƒm tra máº·t trÃªn sÃ¡ng, máº·t trÆ°á»›c tá»‘i, hai giÃ¡ Ä‘á»¡ vÃ  bÃ³ng ellipse á»Ÿ cáº£ ba theme; xÃ¡c nháº­n hover/click FLIP khÃ´ng Ä‘á»•i.

## 2026-07-16 â€” Fix click sÃ¡ch trÃªn ká»‡ khÃ´ng má»Ÿ FLIP preview

- Root cause: drag-to-scroll gá»i `setPointerCapture()` ngay tá»« `pointerdown`, khiáº¿n browser cÃ³ thá»ƒ retarget click tá»« `.book` sang `.shelf-track`; handler `openBook()` khÃ´ng cháº¡y.
- Fix: `pointerdown` chá»‰ lÆ°u tráº¡ng thÃ¡i; chá»‰ capture pointer vÃ  báº­t `is-dragging` sau khi di chuyá»ƒn ngang vÆ°á»£t threshold 6px.
- Click bÃ¬nh thÆ°á»ng tiáº¿p tá»¥c vÃ o `bookPreviewController.openBook()`; kÃ©o ngang váº«n giá»¯ pointer sau khi xÃ¡c Ä‘á»‹nh Ä‘Ãºng gesture.
- Regression test má»›i mÃ´ phá»ng pointerdown trÃªn sÃ¡ch, xÃ¡c nháº­n chÆ°a capture vÃ  click táº¡o `.book-preview-overlay`.
- Verify: red test tÃ¡i hiá»‡n Ä‘Ãºng 1 láº§n capture ngoÃ i Ã½ muá»‘n; sau fix 3 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; route HTTP 200 vÃ  live click/FLIP module PASS.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Hard refresh `/app/reading-corner/sach`; click trá»±c tiáº¿p bÃ¬a Ä‘á»ƒ kiá»ƒm tra FLIP + láº­t má»Ÿ, sau Ä‘Ã³ kÃ©o ngang trÃªn cÃ¹ng bÃ¬a Ä‘á»ƒ xÃ¡c nháº­n khÃ´ng má»Ÿ nháº§m modal.

## 2026-07-16 â€” Äá»•i coverflow thÃ nh ká»‡ sÃ¡ch thÆ° viá»‡n táº¡i /reading-corner/sach

- Bá» hoÃ n toÃ n orbit 3D, `requestAnimationFrame`, gÃ³c quay tÃ­ch lÅ©y vÃ  auto-rotate; khÃ´ng cÃ²n transform Ä‘á»‹nh vá»‹ tuyá»‡t Ä‘á»‘i tá»«ng sÃ¡ch.
- Chia 27 cuá»‘n thÃ nh 3 `.shelf-row`, má»—i hÃ ng 9 cuá»‘n; `.shelf-books` dÃ¹ng Flexbox, Ä‘Ã¡y sÃ¡ch cháº¡m `.shelf-bar`.
- Thanh ká»‡ dÃ¹ng gradient/shadow theo CSS theme tokens; ná»n trang chuyá»ƒn sang `--reading-corner-bg` vÃ  grid token nÃªn há»— trá»£ SÃ¡ng/Tá»‘i vá»«a/Tá»‘i.
- 3/27 cuá»‘n (11%) nghiÃªng deterministic 4â€“8 Ä‘á»™; hover rÃºt riÃªng sÃ¡ch Ä‘ang chá»n lÃªn 24px vÃ  scale 1.05 báº±ng transform.
- Má»—i `.shelf-track` cuá»™n ngang riÃªng, áº©n scrollbar, cÃ³ scroll-snap, drag-to-scroll báº±ng Pointer Events vÃ  Shift + wheel; threshold 6px trÃ¡nh kÃ©o nháº§m thÃ nh click.
- Khá»‘i text â€œTÃ­nh nÄƒng Ä‘ang Ä‘Æ°á»£c cáº­p nháº­tâ€ chuyá»ƒn thÃ nh intro phÃ­a trÃªn toÃ n bá»™ ká»‡.
- Giá»¯ nguyÃªn FLIP + láº­t bÃ¬a: controller tiáº¿p tá»¥c láº¥y `getBoundingClientRect()` trá»±c tiáº¿p tá»« vá»‹ trÃ­ sÃ¡ch trÃªn ká»‡ vÃ  tráº£ Ä‘Ãºng vá» Ä‘Ã³ khi Ä‘Ã³ng.
- Regression test `BilingualBooksPage.test.tsx`: 3 ká»‡, 3 shelf bar, 27 sÃ¡ch, 3 sÃ¡ch nghiÃªng vÃ  khÃ´ng khá»Ÿi cháº¡y auto-rotate.
- Verify: 4 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped diff-check PASS; route HTTP 200; live shelf module PASS; source assertion khÃ´ng cÃ²n orbit/rAF PASS.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a smoke-test trá»±c quan báº±ng browser automation vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Má»Ÿ `/app/reading-corner/sach`, kiá»ƒm tra desktop/mobile: sÃ¡ch cháº¡m ká»‡, hover khÃ´ng bá»‹ clip, kÃ©o ngang khÃ´ng má»Ÿ nháº§m modal, FLIP Ä‘i/vá» Ä‘Ãºng vá»‹ trÃ­ sau khi hÃ ng Ä‘Ã£ scroll.

## 2026-07-16 â€” Preview má»Ÿ sÃ¡ch báº±ng FLIP táº¡i Reading Corner /sach

- Má»—i cuá»‘n trong coverflow cÃ³ cáº¥u trÃºc `.book-modal-content` gá»“m `.book-cover` vÃ  `.book-inside`; pháº§n trong dÃ¹ng metadata tháº­t tá»« catalog, cÃ³ placeholder mÃ´ táº£ vÃ  nÃºt â€œÄá»c thá»­â€.
- ThÃªm controller DOM thuáº§n `bookPreviewController.ts` vá»›i `openBook(bookElement)` / `closeBook()`: clone sÃ¡ch, overlay fixed + blur, FLIP transform vá» giá»¯a mÃ n hÃ¬nh, láº­t bÃ¬a `rotateY(-150deg)`, rá»“i Ä‘áº£o animation vá» Ä‘Ãºng vá»‹ trÃ­ gá»‘c.
- ÄÃ³ng Ä‘Æ°á»£c báº±ng nÃºt X, click vÃ¹ng tá»‘i hoáº·c Escape; khÃ³a scroll, quáº£n lÃ½ focus, há»— trá»£ Enter/Space vÃ  `prefers-reduced-motion`.
- Coverflow chuyá»ƒn sang gÃ³c quay tÃ­ch lÅ©y Ä‘á»ƒ pause tháº­t khi modal má»Ÿ, khÃ´ng nháº£y vá»‹ trÃ­ lÃºc resume.
- Animation chá»‰ thay Ä‘á»•i `transform` vÃ  `opacity`; kÃ­ch thÆ°á»›c modal Ä‘Æ°á»£c xÃ¡c láº­p má»™t láº§n trÆ°á»›c transition.
- Regression test `bookPreviewController.test.ts` kiá»ƒm tra clone, má»Ÿ ruá»™t sÃ¡ch, khÃ³a body vÃ  phá»¥c há»“i source khi Ä‘Ã³ng.
- Verify: 19 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS; scoped `git diff --check` PASS; route HTTP 200 vÃ  live Vite module PASS.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a kiá»ƒm tra click/screenshot báº±ng in-app Browser vÃ¬ browser control khÃ´ng Ä‘Æ°á»£c expose trong phiÃªn nÃ y.

### Next session start prompt

Smoke-test trá»±c quan `/app/reading-corner/sach`: click nhiá»u vá»‹ trÃ­ trÃªn vÃ²ng cung, kiá»ƒm tra FLIP Ä‘i/vá», láº­t bÃ¬a, Escape/click ngoÃ i vÃ  resume auto-rotate trÃªn desktop/mobile.

## 2026-07-16 â€” Fix ná»n/ribbon khi chuyá»ƒn theme Tá»‘i vÃ  Tá»‘i vá»«a

- Root cause: 5 token ná»n Reading Corner/ribbon chá»‰ Ä‘Æ°á»£c khai bÃ¡o á»Ÿ theme SÃ¡ng, nÃªn theme `mid` vÃ  `dark` váº«n káº¿ thá»«a ná»n xanh nháº¡t cÃ¹ng ribbon sÃ¡ng, gÃ¢y sai tÆ°Æ¡ng pháº£n.
- ThÃªm palette riÃªng cho `--reading-corner-bg`, `--reading-corner-grid-line`, `--reading-ribbon-soft/mid/core` trong cáº£ `[data-theme="mid"]` vÃ  `[data-theme="dark"]`.
- Reading Corner `/app/reading-corner` vÃ  `/bao` dÃ¹ng `var(--reading-corner-bg)` thay mÃ u ná»n hardcode; tiÃªu Ä‘á», mÃ´ táº£ vÃ  eyebrow cÃ³ override theme-aware Ä‘á»ƒ giá»¯ Ä‘á»™ Ä‘á»c.
- ThÃªm regression test `styles/themeBackdropTokens.test.ts`, báº¯t buá»™c theme Tá»‘i/Tá»‘i vá»«a khai bÃ¡o Ä‘á»§ 5 token.
- Verify: 19 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS. `git diff --check` chá»‰ cÃ²n dÃ²ng tráº¯ng cuá»‘i `listeningTest.css` thuá»™c thay Ä‘á»•i cÃ³ sáºµn, khÃ´ng liÃªn quan báº£n vÃ¡ nÃ y.
- Lá»—i cÃ²n tá»“n táº¡i liÃªn quan báº£n vÃ¡: chÆ°a ghi nháº­n.

### Next session start prompt

Kiá»ƒm tra tiáº¿p giao diá»‡n theme SÃ¡ng/Tá»‘i vá»«a/Tá»‘i trÃªn Login, 9 AppShell hub, `/app/reading-corner` vÃ  `/app/reading-corner/bao`; cÃ¡c token ná»n/ribbon Ä‘Ã£ cÃ³ regression test táº¡i `apps/web/src/styles/themeBackdropTokens.test.ts`.

## 2026-07-16 â€” Fix CTA Landing khÃ´ng cÃ²n má»Ÿ Google OAuth trá»±c tiáº¿p

- Root cause: `LandingPage.startFree()` váº«n gá»i `signInWithGoogle()` khi user chÆ°a Ä‘Äƒng nháº­p, nÃªn hai nÃºt â€œVÃ o lá»›p há»câ€ / â€œBáº¯t Ä‘áº§u miá»…n phÃ­â€ bá» qua mÃ n hÃ¬nh login custom.
- Fix: má»i CTA miá»…n phÃ­ Ä‘iá»u hÆ°á»›ng tá»›i `/app`; `ProtectedRoute` render `LoginPage` giá»‘ng mockup khi chÆ°a Ä‘Äƒng nháº­p. Google OAuth chá»‰ cháº¡y sau khi báº¥m nÃºt Ä‘Äƒng nháº­p bÃªn trong `LoginPage`.
- Táº¯t `VITE_DEV_AUTH_BYPASS` trong `apps/web/.env.local`; Vite dev Ä‘ang phá»¥c vá»¥ giÃ¡ trá»‹ `"0"` nÃªn `/app` khÃ´ng cÃ²n bá» qua login.
- Äá»“ng thá»i bá» mÃ u hardcode cÃ²n sÃ³t trong `loginPage.css`, thay báº±ng CSS variables.
- Verify: CTA source assertion PASS; `pnpm --filter web exec tsc --noEmit` PASS; localhost `5173` vÃ  `3000` Ä‘á»u HTTP 200.
- LÆ°u Ã½: `localhost:3000` hiá»‡n lÃ  má»™t app Next.js khÃ¡c (`/_next/...`), khÃ´ng pháº£i Vite app trong repo nÃ y; Ryan English Website dev cháº¡y táº¡i `http://localhost:5173`.

## 2026-07-16 â€” ÄÆ°a mascot máº·t trá»i Login ra ngoÃ i card

- Login tiáº¿p tá»¥c dÃ¹ng chung `SunnyMascotSvg` vá»›i trang Tá»•ng quan.
- ThÃªm `login-page__stage` vÃ  `login-page__sun-float`; chiá»u cao mascot Ä‘Æ°á»£c cá»™ng vÃ o layout trÆ°á»›c card nÃªn máº·t trá»i náº±m hoÃ n toÃ n bÃªn ngoÃ i, khÃ´ng overlap header.
- Chuyá»ƒn Ä‘á»™ng ná»•i map theo mascot Tá»•ng quan vÃ  há»— trá»£ `prefers-reduced-motion`.
- Verify: layout invariant PASS; live Vite CSS PASS; `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Login email/máº­t kháº©u nháº­p Ä‘Æ°á»£c + Ä‘á»•i font

- Root cause: hai Ã´ Email/Máº­t kháº©u trÆ°á»›c Ä‘Ã¢y lÃ  `<div aria-hidden>` trang trÃ­, khÃ´ng pháº£i form control.
- Äá»•i thÃ nh `<form>` vá»›i input email/password tháº­t, controlled state, autofill, validation, focus state vÃ  lá»—i inline.
- `AuthContext` thÃªm `signInWithPassword()` dÃ¹ng Supabase Auth; nÃºt â€œÄÄƒng nháº­p ngayâ€ submit email/máº­t kháº©u, nÃºt Google giá»¯ OAuth riÃªng.
- Typography trang Login Ä‘á»•i tá»« Instrument Serif sang `Segoe UI Variable Display` + `Segoe UI Variable`; thÃªm token `--color-danger` cho Ä‘á»§ light/mid/dark.
- Regression test: `LoginPage.test.tsx` xÃ¡c nháº­n nháº­p vÃ  submit Ä‘Ãºng email/password.
- Verify: 3 tests PASS; live Vite form PASS; `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Login dÃ¹ng chung ná»n lÆ°á»›i vá»›i Reading Corner

- ThÃªm token dÃ¹ng chung `--reading-corner-bg` vÃ  `--reading-corner-grid-line` trong `globals.css`.
- `rc-hub` vÃ  Login cÃ¹ng dÃ¹ng ná»n xanh nháº¡t, lÆ°á»›i tráº¯ng 32px; Login map thÃªm lá»›p noise nháº¹ giá»‘ng `rc-hub-ambient`.
- Bá» radial tÃ­m cÅ© á»Ÿ Login Ä‘á»ƒ mÃ u ná»n khÃ´ng lá»‡ch `/app/reading-corner`.
- Verify: shared-token invariant PASS; live Vite CSS PASS; LoginPage test PASS; `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Login cÃ³ ribbon nhÆ° Reading Corner /bao

- ThÃªm 3 ribbon chÃ©o cá»‘ Ä‘á»‹nh phÃ­a sau card Login, map Ä‘Ãºng geometry `280vmax`, gÃ³c 45Â°, offset, opacity vÃ  thá»i lÆ°á»£ng animation tá»« `/app/reading-corner/bao`.
- TÃ¡ch palette ribbon thÃ nh token dÃ¹ng chung `--reading-ribbon-soft/mid/core`; Reading Corner vÃ  Login cÃ¹ng sá»­ dá»¥ng.
- `prefers-reduced-motion` táº¯t ribbon animation; form vÃ  mascot giá»¯ z-index phÃ­a trÃªn.
- Regression test xÃ¡c nháº­n Login render Ä‘á»§ 3 ribbon.
- Verify: LoginPage test PASS; ribbon mapping invariant PASS; live Vite module PASS; `pnpm --filter web exec tsc --noEmit` PASS.
- Sau feedback, riÃªng ribbon Login Ä‘á»•i sang `rotate(-45deg)` Ä‘á»ƒ hÆ°á»›ng tá»« trÃ¡i dÆ°á»›i lÃªn gÃ³c pháº£i mÃ n hÃ¬nh; live Vite CSS PASS.

## 2026-07-16 â€” Ná»n xanh + ribbon cho 9 hub AppShell

- ThÃªm backdrop chung táº¡i `AppShell`: ná»n xanh Reading Corner, lÆ°á»›i tráº¯ng 32px, noise nháº¹ vÃ  3 ribbon `-45deg`.
- Chá»‰ báº­t á»Ÿ Ä‘Ãºng route gá»‘c: `/app/home`, `/app/vocab`, `/app/writing`, `/app/listening`, `/app/shadowing`, `/app/exam`, `/app/sentence-structure`, `/app/settings`, `/app/admin`.
- KhÃ´ng báº­t á»Ÿ Reading Corner vÃ¬ cÃ³ ná»n riÃªng; khÃ´ng báº­t á»Ÿ bÃ i há»c, bÃ i luyá»‡n vÃ  exam player full-screen.
- LÃ m trong suá»‘t outer surface cá»§a Home, Vocab, Writing, Listening, Shadowing, Exam, Sentence Structure, Settings vÃ  Admin; card/sidebar/toolbars giá»¯ ná»n riÃªng.
- File má»›i: `pages/appShellBackdrop.ts`, `.css`, `.test.ts`; AppShell render backdrop theo pathname.
- Verify: 17 tests PASS; shared-surface invariant PASS; live AppShell module PASS; `pnpm --filter web exec tsc --noEmit` PASS.
- Fix bá»• sung `/app/writing`: `WritingLayout` cÃ³ 2 wrapper inline background phá»§ backdrop; thÃªm class `writing-layout` / `writing-layout__content` vÃ  override trong suá»‘t chá»‰ khi route hub active. Verify: 16 route tests PASS; live WritingLayout PASS; tsc PASS.

## 2026-07-16 â€” Ribbon cho Reading Corner hub vÃ  /bao

- TÃ¡ch `ReadingRibbonBackdrop.tsx` dÃ¹ng chung cho `/app/reading-corner` vÃ  `/app/reading-corner/bao`.
- Hub GÃ³c Ä‘á»c thÃªm Ä‘á»§ 3 ribbon trÃªn ná»n xanh lÆ°á»›i; outer `rc-hub--ribbon` chuyá»ƒn transparent Ä‘á»ƒ backdrop hiá»‡n Ä‘Ãºng.
- Ribbon `/bao` Ä‘á»•i tá»« `rotate(45deg)` sang `rotate(-45deg)`, Ä‘á»“ng nháº¥t hÆ°á»›ng trÃ¡i dÆ°á»›i lÃªn gÃ³c pháº£i.
- Article reader váº«n dÃ¹ng cháº¿ Ä‘á»™ grid-only, khÃ´ng ribbon.
- Verify: live 2 route modules PASS; live Reading Corner CSS PASS; 16 route tests PASS; `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” IELTS Listening TID shell rewrite (gáº§n 100% theieltsdictionary)

- Viáº¿t láº¡i `ListeningIeltsTidShell` + `listeningIeltsTid.css`: header logo/title/timer remaining/Kiá»ƒm Tra/font/fullscreen, part banner `#f1f2ec`, paper single-column, overlay Play Ä‘en, footer Part pills + âœ“, float prev/next + audio.
- `ListeningTest`: IELTS khÃ´ng dÃ¹ng overlay/shell cÅ© â€” TidShell tá»± quáº£n Play + layout.
- Giá»¯ catalog Ä‘á» + map options + note form (`ListeningIeltsPartView`), draft/submit/review.
- áº¨n audio-bar/split legacy trong CSS.
- Verify: tsc PASS.

## 2026-07-16 â€” Fix IELTS map Q16â€“20 + embed Tainguyen images

- **Bug:** Cam19 Test1 Q16â€“20 (map label) `options: []` â†’ select trá»‘ng, khÃ´ng chá»n Ä‘Æ°á»£c.
- **Fix runtime:** `listeningLetterOptions.ts` + Map/Diagram blocks suy Aâ€“H tá»« instruction/answers.
- **Fix data:** patch 14 catalog JSON map options; sync **19 áº£nh** Tainguyen â†’ `public/catalog/listening/ielts-cam*/` (map.jpg, diagram.jpg, Questions_*.jpg).
- Matching block hiá»ƒn thá»‹ `partImageUrl` khi cÃ³ hÃ¬nh; `examMediaUrl` encode path segment.
- Script: `scripts/sync-listening-images-from-tainguyen.mjs`
- Verify: tsc PASS.

## 2026-07-16 â€” Ship IELTS Listening TID shell (thay track UI)

- Route `/app/exam/listening/:examId` (IELTS): dÃ¹ng `ListeningIeltsTidShell` thay `ListeningIeltsTest`.
- Layout TID: header logo + title + timer + **Kiá»ƒm Tra**, part banner `#f1f2ec`, footer part tabs; giá»¯ PartView (note/map/MC/matching), draft, submit, review, audio local.
- CSS: `listeningIeltsTid.css`; overlay Play Ä‘en kiá»ƒu real_test.
- Data/audio sáºµn: catalog Cam 9â€“20 + `public/catalog/listening/ielts-cam*/listening.mp3` (48 file).
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.
- Track list váº«n `/app/exam/track/ielts` â†’ skill listening; KET/PET/FCE khÃ´ng Ä‘á»•i.

## 2026-07-16 â€” Fix CTA Landing vÃ o Ä‘Ãºng giao diá»‡n lá»›p há»c

- NÃºt Landing â€œVÃ o lá»›p há»câ€ / â€œBáº¯t Ä‘áº§u miá»…n phÃ­â€ gá»i `/app`; route index `/app` Ä‘á»•i tá»« `/app/vocab` sang `/app/home`.
- OAuth callback sau Google login Ä‘á»•i tá»« `/app/vocab` sang `/app`, Ä‘á»ƒ ngÆ°á»i dÃ¹ng má»›i cÅ©ng vÃ o Ä‘Ãºng mÃ n Tá»•ng quan.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Rollback visual redesign Tá»•ng quan

- Gá»¡ cÃ¡c override `Premium dashboard layer` vÃ  `CTA landing destination` trong `homePage.css`; Tá»•ng quan quay vá» layout Home cÅ© thay vÃ¬ hero H1 quÃ¡ lá»›n.
- KhÃ´ng Ä‘á»•i route `/app` hoáº·c logic Ä‘a ngÃ´n ngá»¯.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

# Session Summary â€” Ryan English Website

## 2026-07-16 â€” Login gate giá»‘ng mockup TID

- Khi user chÆ°a Ä‘Äƒng nháº­p vÃ  báº¥m CTA Landing vÃ o `/app`, `ProtectedRoute` khÃ´ng redirect vá» Landing ná»¯a mÃ  render `LoginPage`.
- Redesign `LoginPage` theo áº£nh `Crawl/Giaodien/giao_dien.jpg`: ná»n grid, mascot máº·t trá»i, header xanh, tab Ä‘Äƒng nháº­p/Ä‘Äƒng kÃ½, form visual vÃ  nÃºt Google.
- File: `apps/web/src/features/auth/LoginPage.tsx`, `apps/web/src/features/auth/loginPage.css`, `ProtectedRoute.tsx`.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## ThÃ´ng tin dá»± Ã¡n
- **ThÆ° má»¥c:** `D:/App-English-Ryan/Website/`
- **Stack:** Vite + React + TypeScript + Tailwind + pnpm workspaces
- **Supabase project:** `ntcagvtkwxwsmlxlumfo`
- **Dev server:** `pnpm dev` â†’ `http://localhost:5173`

## 2026-07-15 â€” Listening playback speed

- IELTS vÃ  Cambridge Listening dÃ¹ng chung nÃºt tá»‘c Ä‘á»™ cáº¡nh nÃºt Play.
- Chu ká»³ tá»‘c Ä‘á»™: **1Ã— â†’ 0.75Ã— â†’ 0.5Ã— â†’ 1Ã—**; thay Ä‘á»•i ngay trÃªn audio Ä‘ang phÃ¡t.
- Cáº­p nháº­t `ListeningExamAudioBar.tsx`, `useExamQuestionAudio.ts`, cÃ¡c test IELTS/KET/PET/FCE vÃ  CSS.
- Verify: `pnpm -C apps/web build` PASS.

## 2026-07-15 â€” Fix publish loading vÃ´ háº¡n

- Listening media upload trÆ°á»›c Ä‘Ã¢y khÃ´ng cÃ³ timeout; náº¿u Supabase Storage khÃ´ng pháº£n há»“i, nÃºt Publish giá»¯ loading vÃ´ háº¡n.
- ThÃªm timeout 120 giÃ¢y cho tá»«ng upload media vÃ  reset progress khi báº¯t Ä‘áº§u Publish má»¥c má»›i.
- Verify: `pnpm -C apps/web build` PASS.

## 2026-07-16 â€” Giai Ä‘oáº¡n 1 Ä‘a ngÃ´n ngá»¯ giao diá»‡n

- ThÃªm `apps/web/src/lib/language.tsx` vá»›i English + Tiáº¿ng Viá»‡t, `LanguageProvider`, `useI18n` vÃ  lÆ°u preference vÃ o localStorage + Dexie `settingsRepo`.
- ThÃªm lá»±a chá»n ngÃ´n ngá»¯ trong Settings â†’ Giao diá»‡n.
- AppShell tá»± cáº­p nháº­t nhÃ£n navigation theo ngÃ´n ngá»¯ Ä‘Ã£ chá»n.
- Ná»™i dung bÃ i há»c/Ä‘á» thi chÆ°a dá»‹ch; chá»‰ dá»‹ch khung giao diá»‡n chÃ­nh trong giai Ä‘oáº¡n 1.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Giai Ä‘oáº¡n 2 má»Ÿ rá»™ng ngÃ´n ngá»¯ giao diá»‡n

- Má»Ÿ rá»™ng `language.tsx` tá»« 2 lÃªn Ä‘á»§ **17 ngÃ´n ngá»¯**: English, Arabic, German, Greek, Spanish, Indonesian, Japanese, Korean, Malay, Portuguese, Russian, Thai, Turkish, Ukrainian, Vietnamese, Simplified Chinese, Traditional Chinese.
- ThÃªm nhÃ£n báº£n Ä‘á»‹a vÃ  báº£n dá»‹ch navigation + cÃ¡c nhÃ£n chÃ­nh cá»§a Settings cho tá»«ng ngÃ´n ngá»¯.
- Giá»¯ cÆ¡ cháº¿ lÆ°u preference localStorage + Dexie `settingsRepo`; ngÃ´n ngá»¯ chÆ°a cÃ³ báº£n dá»‹ch á»Ÿ khu vá»±c khÃ¡c sáº½ fallback vá» Vietnamese.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Giai Ä‘oáº¡n 3 RTL vÃ  locale

- Arabic tá»± Ä‘áº·t `dir="rtl"`; cÃ¡c ngÃ´n ngá»¯ cÃ²n láº¡i dÃ¹ng `dir="ltr"`.
- Cáº­p nháº­t `document.documentElement.lang` khi Ä‘á»•i ngÃ´n ngá»¯.
- ThÃªm `formatLocaleDate()` vá»›i locale tÆ°Æ¡ng á»©ng cho ngÃ y thÃ¡ng.
- Tab Settings dÃ¹ng nhÃ£n dá»‹ch theo ngÃ´n ngá»¯ Ä‘Ã£ chá»n.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS; `pnpm -C apps/web build` PASS.

## 2026-07-16 â€” Giai Ä‘oáº¡n 4 AppShell vÃ  Tá»•ng quan

- ThÃªm nhÃ³m key dá»‹ch dÃ¹ng chung cho tráº¡ng thÃ¡i app vÃ  cÃ¡c hÃ nh Ä‘á»™ng chÃ­nh cá»§a Tá»•ng quan.
- Quick actions trÃªn HomePage láº¥y nhÃ£n tá»« i18n nÃªn Ä‘á»•i theo ngÃ´n ngá»¯: Vocabulary, Writing, Listening, Translate, MindMap.
- Giá»¯ nguyÃªn dá»¯ liá»‡u thá»‘ng kÃª, streak vÃ  ná»™i dung há»c táº­p.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Bá»• sung dá»‹ch text cÃ²n sÃ³t á»Ÿ AppShell/Home

- Chuyá»ƒn thÃªm fallback user, Ä‘Äƒng xuáº¥t, sidebar expand/collapse, tráº¡ng thÃ¡i Ä‘á»“ng bá»™, theme label vÃ  lifetime plan sang i18n.
- Chuyá»ƒn nhÃ£n thá»‘ng kÃª Home vÃ  tiÃªu Ä‘á» nhÃ³m â€œHá»c ngayâ€ sang i18n.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Map toÃ n bá»™ giao diá»‡n trang Tá»•ng quan

- Chuyá»ƒn greeting, subtitle, mascot message, quick-action descriptions vÃ  thá»‘ng kÃª Home sang i18n.
- Chuyá»ƒn StudyActivityGrid: tiÃªu Ä‘á», mÃ´ táº£, legend, aria-label vÃ  active-day text.
- Chuyá»ƒn CheckInButton: Ä‘iá»ƒm danh, streak Ä‘iá»ƒm danh vÃ  tráº¡ng thÃ¡i Ä‘Ã£ Ä‘iá»ƒm danh.
- Chuyá»ƒn DailyGoalCard: má»¥c tiÃªu, chá»‰nh sá»­a/lÆ°u, cÃ¡c dÃ²ng goal vÃ  completion message.
- Chuyá»ƒn StreakCelebration: tiÃªu Ä‘á» vÃ  thÃ´ng bÃ¡o streak.
- Vá»›i ngÃ´n ngá»¯ chÆ°a cÃ³ báº£n dá»‹ch riÃªng cho key má»›i, fallback dÃ¹ng English thay vÃ¬ Vietnamese Ä‘á»ƒ trÃ¡nh trá»™n ngÃ´n ngá»¯.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Map giao diá»‡n Vocabulary

- Chuyá»ƒn trang `/app/vocab` sang i18n cho tiÃªu Ä‘á», sá»­a deck trÃ¹ng, notebook, táº¡o deck, loáº¡i tá»« vÃ  tráº¡ng thÃ¡i repair.
- Chuyá»ƒn DeckGrid cho bá»™ lá»c, confirm/error xoÃ¡ deck.
- Chuyá»ƒn CardPanel cho chá»n deck, export/import, thÃªm tá»« vÃ  empty state.
- Dá»¯ liá»‡u deck/card khÃ´ng thay Ä‘á»•i.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-16 â€” Bá»• sung 120 guide Task 2 TID Writing

- ThÃªm `scripts/fill-tid-task2-guides.mjs` Ä‘á»ƒ sinh guide HTML tÄ©nh theo 6 genre Task 2.
- Bá»• sung guide + outline + useful language + thesis direction + model answer cho **120/120** Ä‘á» thiáº¿u.
- Cáº­p nháº­t `apps/web/public/catalog/writing/tid/tasks.json`: **356/356** Ä‘á» cÃ³ `guideHtml`; Task 1 khÃ´ng thay Ä‘á»•i.
- KhÃ´ng gá»i AI/API.
- Verify: validator missing guides = 0; `pnpm --filter web exec tsc --noEmit` PASS.

---

## 2026-07-15 â€” Tá»•ng quan: mascot máº·t trá»i + bubble

- TÃ¡ch SVG máº·t trá»i mÃ n káº¿t quáº£ â†’ `components/SunnyMascotSvg.tsx` (ExamPracticeResultReport tÃ¡i dÃ¹ng, UI khÃ´ng Ä‘á»•i).
- Header `/app` (HomePage) hiá»‡n mascot + bubble lá»i thoáº¡i theo giá»/streak (`getMascotLine`); CSS `home-sun-mascot*` trong homePage.css; mobile áº©n bubble. Verify: web typecheck PASS.

## 2026-07-15 â€” Fix undefined questions khi má»Ÿ Import Listening

- Preview modal dÃ¹ng `Array.isArray(part.questions)` trÆ°á»›c khi Ä‘á»c `.length`.
- Validator cÅ©ng chuáº©n hÃ³a `questions` thiáº¿u thÃ nh máº£ng rá»—ng.
- Verify: `pnpm -C apps/web build` PASS.

## 2026-07-15 â€” ExamHome hero: mascot máº·t trá»i/máº·t trÄƒng

- Orb tÃ­m Â«FOCUS / 01Â» á»Ÿ `/app/exam` â†’ mascot **máº·t trá»i** (ban ngÃ y) / **máº·t trÄƒng** (18hâ€“6h) tÃ¡i dÃ¹ng `LegacySunMascot` tá»« landing.
- áº¨n speech bubble (text riÃªng cá»§a landing) qua `.exam-home__orb--mascot .sun-bubble { display:none }`.
- File: `ExamHome.tsx`, `examHub.css`. Verify: web typecheck PASS.

## 2026-07-15 â€” Fix crash Import ZIP IELTS/Cambridge Listening

- `collectExpectedMediaFiles()` vÃ  diagnostics khÃ´ng cÃ²n dÃ¹ng `part.questions` trá»±c tiáº¿p khi payload ZIP thiáº¿u/khÃ´ng chuáº©n máº£ng.
- DÃ¹ng guard `Array.isArray(...)`, modal khÃ´ng cÃ²n crash vá»›i `TypeError: part.questions is not iterable`.
- Verify: `pnpm -C apps/web build` PASS.

## 2026-07-15 â€” KhÃ´i phá»¥c KET A2 Listening sau lá»—i prune

- NguyÃªn nhÃ¢n: `Publish má»¥c má»›i` gá»i batch cÃ³ prune cloud, xÃ³a cÃ¡c practice 02â€“44 khÃ´ng cÃ³ local record trÃªn mÃ¡y Admin.
- Fix: thÃªm `options.prune`; `Publish má»¥c má»›i` dÃ¹ng `{ prune: false }`, chá»‰ `Publish táº¥t cáº£` má»›i prune.
- KhÃ´i phá»¥c cloud KET practice 02â€“44 tá»« nguá»“n `Crawl/Import_KET_A2_Listening` (Ä‘Ã£ publish thÃ nh cÃ´ng 02â€“44 qua cÃ¡c batch).
- Verify: web typecheck PASS.

## 2026-07-15 â€” Cáº¥u trÃºc cÃ¢u: 365 template khÃ¡c nhau

- Gá»™p `CORE` (~167) + `EXTRA` (~266) trong `packages/catalog/src/seeds/`.
- Dedupe theo template (khÃ´ng clone Â·02), Æ°u tiÃªn core, cap **365** báº£n unique.
- `GLOBAL_CATALOG_VERSION` â†’ **32** (sync láº¡i khi vÃ o `/app`).
- File: `sentenceStructures.extra.ts`, `sentenceStructures.expand.ts`, `sentenceStructures.ts`, `manifest.ts`.
- Hard-refresh `/app/sentence-structure` Ä‘á»ƒ tháº¥y Ä‘á»§ 365.

## 2026-07-15 â€” KhÃ´i phá»¥c nÃºt Publish má»¥c má»›i

- Admin Publish cÃ³ láº¡i nÃºt `Publish má»¥c má»›i` cáº¡nh `Publish táº¥t cáº£`.
- NÃºt gá»i batch publish Reading/Listening local vÃ  kÃ¨m transcript Whisper Ä‘Ã£ lÆ°u.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Publish transcript Whisper lÃªn cloud

- ThÃªm `ListeningPart.transcript` cho transcript toÃ n Part.
- Admin publish tá»± láº¥y `exam-listening-whisper:{examId}:{partNumber}` tá»« localStorage vÃ  Ä‘Æ°a vÃ o `parts` JSONB cá»§a `listening_exam_published`.
- User Ä‘á»c Ä‘á» published sáº½ tháº¥y transcript cloud trong panel; khÃ´ng thay Ä‘á»•i cÃ¢u há»i/Ä‘Ã¡p Ã¡n.
- Verify: web typecheck PASS.

## 2026-07-15 â€” XÃ³a toolbar Sao chÃ©p trÃ¹ng trong Exam

- Global `TextSelectionToolbar` khÃ´ng cÃ²n hiá»ƒn thá»‹ trong vÃ¹ng `[data-exam-highlight-zone]`.
- Transcript/Exam chá»‰ cÃ²n má»™t toolbar Reading/Exam vá»›i má»™t nÃºt `Sao chÃ©p`.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Fix toolbar transcript Ä‘Ã¨ dÃ²ng trÆ°á»›c

- Toolbar nháº­n diá»‡n `.listening-transcript-panel` vÃ  Æ°u tiÃªn Ä‘áº·t bÃªn dÆ°á»›i vÃ¹ng text Ä‘Æ°á»£c chá»n.
- Chá»‰ Ä‘áº·t phÃ­a trÃªn khi gáº§n cuá»‘i viewport Ä‘á»ƒ trÃ¡nh bá»‹ cáº¯t.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Fix toolbar overlap khi chá»n transcript

- `ReadingHighlightToolbar` tá»± chuyá»ƒn xuá»‘ng dÆ°á»›i Ä‘oáº¡n chá»n náº¿u Ä‘oáº¡n chá»n gáº§n mÃ©p trÃªn viewport.
- TrÃ¡nh toolbar Sao chÃ©p/Highlight Ä‘Ã¨ lÃªn dÃ²ng transcript.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Äá»“ng bá»™ Highlight/Note transcript vá»›i Reading/Exam

- Transcript panel dÃ¹ng trá»±c tiáº¿p `ReadingHighlightToolbar` vÃ  `ReadingHighlightableText`.
- Toolbar cÃ³ Sao chÃ©p, TÃ´ sÃ¡ng, Note, Bá» tÃ´ sÃ¡ng vÃ  XÃ³a note giá»‘ng Reading/Exam.
- Annotation lÆ°u local theo `examId + Part`, dÃ¹ng Ä‘Ãºng `readingHighlightUtils` vÃ  mÃ u `var(--exam-highlight-bg)`.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Bá» Highlight/Note transcript

- Báº¥m trá»±c tiáº¿p vÃ o Ä‘oáº¡n highlight Ä‘á»ƒ bá» highlight.
- Má»—i note cÃ³ nÃºt `Bá» note`.
- MÃ u highlight dÃ¹ng `var(--exam-highlight-bg)`, Ä‘á»“ng bá»™ Reading/Exam.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Highlight/Note cho transcript cÃ³ sáºµn

- Transcript tá»« `q.ttsText`/audioscript giá» cÅ©ng chá»n Ä‘Æ°á»£c Ä‘á»ƒ Highlight hoáº·c Note, khÃ´ng chá»‰ transcript Whisper.
- DÃ¹ng chung lÆ°u trá»¯ local theo Ä‘á»/Part.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Note/Highlight transcript Whisper

- Transcript Whisper trong Listening há»— trá»£ bÃ´i chá»n Ä‘oáº¡n vÄƒn.
- `Highlight` tÃ´ vÃ ng vÃ  lÆ°u local theo `examId + Part`.
- `Note` há»i ná»™i dung ghi chÃº, lÆ°u local vÃ  hiá»ƒn thá»‹ láº¡i dÆ°á»›i transcript.
- Verify: web typecheck PASS.

## 2026-07-15 â€” Ãp dá»¥ng Whisper transcript cho IELTS Listening

- Má»i Ä‘á» `examType: 'ielts'` khÃ´ng cÃ²n Ä‘á»c transcript DeepSeek cÅ© trong localStorage.
- IELTS Listening dÃ¹ng chung nÃºt Whisper `base.en`, transcript lÆ°u theo `examId + partNumber`.
- CÃ¢u há»i vÃ  Ä‘Ã¡p Ã¡n IELTS khÃ´ng bá»‹ thay Ä‘á»•i.

## 2026-07-15 â€” XÃ³a transcript DeepSeek sai khá»i KET A2 catalog

- `ListeningTranscriptSidePanel.tsx` tá»± xÃ³a transcript map cÅ© trong localStorage vá»›i má»i `catalog-listening-*`.
- KET A2 Test 1 khÃ´ng cÃ²n hiá»ƒn thá»‹ transcript DeepSeek cÅ©; chá»‰ dÃ¹ng `ttsText` chuáº©n hoáº·c transcript Whisper local má»›i.
- Verify: server typecheck PASS.

## 2026-07-15 â€” Phase Whisper transcript theo Part

- `ListeningTranscriptSidePanel.tsx`: thay nÃºt táº¡o transcript AI báº±ng nÃºt Whisper local `base.en`.
- Gá»­i audio URL cá»§a Part hiá»‡n táº¡i tá»›i `POST /api/stt`, lÆ°u transcript táº¡i localStorage theo `examId + partNumber` vÃ  hiá»ƒn thá»‹ láº¡i khi má»Ÿ panel.
- Transcript Whisper chá»‰ lÃ  vÄƒn báº£n tham kháº£o toÃ n Part; khÃ´ng dÃ¹ng Ä‘á»ƒ suy Ä‘oÃ¡n cÃ¢u há»i/Ä‘Ã¡p Ã¡n.
- Server typecheck PASS. Web typecheck cÃ²n lá»—i catalog type cÃ³ sáºµn á»Ÿ `listeningExamCatalogMerge.ts`/`packages/catalog/src/builtinExams.ts`.

## 2026-07-15 â€” Mount local STT router

- `server/src/index.ts` import vÃ  mount `sttRouter` táº¡i `/api/stt`.
- Trang `/` cÃ´ng bá»‘ `ttsHealth`, `tts`, `sttHealth`, `stt`.
- Verify: `pnpm --filter server typecheck` vÃ  `pnpm --filter web exec tsc --noEmit` Ä‘á»u pass.

## 2026-07-15 â€” Äá»•i local Whisper transcript sang `base.en`

- Server STT máº·c Ä‘á»‹nh dÃ¹ng `faster-whisper` `base.en` thay cho `tiny.en` Ä‘á»ƒ nháº­n dáº¡ng tá»‘t hÆ¡n sá»‘, tÃªn riÃªng vÃ  spelling trong Listening Cambridge A2â€“C2.
- CÃ³ thá»ƒ ghi Ä‘Ã¨ báº±ng biáº¿n mÃ´i trÆ°á»ng `WHISPER_MODEL`; khÃ´ng thay Ä‘á»•i viá»‡c táº¡o cÃ¢u há»i/Ä‘Ã¡p Ã¡n.

## 2026-07-15 â€” KhÃ³a táº¡o Ä‘á» KET A2 báº±ng AI

- `ImportReadingPdfModal.tsx`: khÃ´ng cho cháº¡y DeepSeek/OpenAI khi import PDF Cambridge A2; nÃºt PhÃ¢n tÃ­ch bá»‹ khÃ³a vÃ  hÆ°á»›ng dáº«n dÃ¹ng ZIP chuáº©n cÃ³ `exam.json` + `answer-key`.
- LÃ½ do: Whisper `tiny.en` chá»‰ nháº­n dáº¡ng lá»i nÃ³i thÃ nh transcript, khÃ´ng thá»ƒ dá»±ng chÃ­nh xÃ¡c cÃ¢u há»i/Ä‘Ã¡p Ã¡n/hÃ¬nh áº£nh Cambridge; Test 1 KET A2 chuáº©n Ä‘Ã£ cÃ³ catalog.
- IELTS vÃ  cÃ¡c luá»“ng AI khÃ¡c váº«n giá»¯ nguyÃªn.
- Cáº§n verify: `pnpm --filter web exec tsc --noEmit`.

## Tráº¡ng thÃ¡i hiá»‡n táº¡i

- **Transcript AI lÆ°u vÄ©nh viá»…n (2026-07-15):** `examListeningTranscriptStorage.ts` sessionStorage â†’ **localStorage** (migrate tá»± Ä‘á»™ng); panel transcript cÃ³ nÃºt Â«Táº¡o transcript báº±ng AIÂ» (Sparkles) khi part thiáº¿u transcript â€” merge vá»›i map cÅ©, táº¡o 1 láº§n khÃ´ng gá»i láº¡i. `tsc` pass
- **Transcript split khi lÃ m bÃ i (2026-07-15):** `ListeningTranscriptSidePanel.tsx` má»›i â€” nÃºt Â«TranscriptÂ» trÃªn header 4 test runner (KET/PET/FCE-CAE-CPE/IELTS) má»Ÿ panel fixed bÃªn pháº£i, kÃ©o cáº¡nh trÃ¡i resize (280â€“720px, lÆ°u localStorage), Esc Ä‘Ã³ng; nguá»“n: `q.ttsText` (Audioscript import) + AI map sessionStorage, lá»c theo part hiá»‡n táº¡i; CSS `.listening-transcript-panel*` trong listeningTest.css. `tsc` pass
- **MS PET stack dá»c (2026-07-15):** `.listening-pet-mc__question` bá» grid 2 cá»™t (cÃ¢u trÃ¡i / options pháº£i) â†’ flex column, options náº±m dÆ°á»›i cÃ¢u há»i
- **BÃ¬a sÃ¡ch Cambridge library (2026-07-15):** `getCambridgeBrandBookCoverColor` (cambridgeLibraryGrouping.ts) â€” bá» `color-mix` vá»›i base brand (ra toÃ n nÃ¢u); dÃ¹ng `BOOK_PALETTE` 14 mÃ u Ä‘a dáº¡ng nhÆ° IELTS, offset theo brand; Book 1 giá»¯ mÃ u brand. `tsc` pass
- **Auto-play part audio (2026-07-15):** Ä‘á» Listening import chia `part1..part5.mp3` â€” báº¥m chuyá»ƒn part trong `goToPart` tá»± phÃ¡t audio part Ä‘Ã³ (KET/PET/FCE-CAE-CPE: helper `autoPlayPartAudio`; IELTS: inline, key `part-{id}`). Chá»‰ khi khÃ´ng dÃ¹ng 1 MP3 shared, khÃ´ng á»Ÿ review/submitted, tÃ´n trá»ng play limits (exam mode); gá»i trong click gesture nÃªn khÃ´ng vÆ°á»›ng autoplay policy. `tsc --noEmit` pass
- **UI MS (2026-07-15):** redesign MS/MC listening trong `apps/web/src/features/exam/listeningTest.css` â€” KET A2 (`.listening-ket-p3__*`), PET B1 (`.listening-pet-mc__*`), FCE/CAE/CPE B2â€“C2 (`.listening-fce-mc__*`, `.listening-fce__num`), KET Part 4/fallback (`.listening-ket-cambridge__question .listening-exam-option*` + `__qnum`): card double-bezel/gradient, badge sá»‘ pill gradient, custom radio spring (tham chiáº¿u `Crawl/Giaodien/not.jpg`); components khÃ´ng Ä‘á»•i
- **Branch:** `project_14726` / `feat/reading-part-picker` (git repo `D:/App-English-Ryan/Website`)
- **Phase:** Import batch **KET A2 Listening practice** (44 Ä‘á») â€” **published 02â€“44 cloud**
- **Session:** **2026-07-15** â€” sentence-structure catalog **1670** (GLOBAL v28)
- **Session trÆ°á»›c:** vocab white-screen fix; essay_full / translate seeds
- **Next:** Hard refresh `/app/sentence-structure` â†’ list 1670 cáº¥u trÃºc
- **Vocab seed:** `seedData/presetVocabCards.ts` + `seedPresetCards()` (dynamic import, khÃ´ng cháº·n route)
- **Production:** https://ryanenglishv2.vercel.app â€” **deployed v0.2.4**
- **Migrations Supabase:** 001â€“**016** (Ä‘Ã£ push); **017â€“018** â€” cáº§n `pnpm db:push` náº¿u chÆ°a
- **Dev:** `pnpm dev` â†’ hard refresh Ä‘á»ƒ náº¡p `listening_exam_published`

### Bundle Ä‘á» sáºµn trong `Tainguyen/`
| Ká»¹ nÄƒng | Level | File | Tráº¡ng thÃ¡i |
|---------|-------|------|------------|
| Reading | A2 KET | `ket-reading-test1` | **Builtin** `catalog-reading-ket-a2-test1` |
| Reading | B1 PET | `pet-reading-test1` | **Builtin** `catalog-reading-pet-b1-test1` |
| Reading | B2 FCE | `fce-reading-test1` | **Builtin** `catalog-reading-fce-b2-test1` |
| Listening | A2 KET | `ket-listening-test1` | **Builtin** `catalog-listening-ket-a2-test1` |
| Listening | A2 KET practice 44 | `listening-import-ket-a2-practice-NN` | **ZIP 44/44** + **cloud publish 02â€“44** (B3T4â€¦B14T2); test-01 local pilot B3T3 |
| Listening | B1 PET | `pet-listening-test1` | **Builtin** `catalog-listening-pet-b1-test1` |
| Listening | B2 FCE | `fce-Listening-test1` | **Builtin** `catalog-listening-fce-b2-test1` |
| Reading | C1 CAE | `cae-Reading-test1` | **Builtin** `catalog-reading-cae-c1-test1` â€” **10 parts RW** (P1â€“8 Reading + P9â€“10 Writing, 120 phÃºt) |
| Reading | C2 CPE | `cpe-Reading-test1` | **Builtin** `catalog-reading-cpe-c2-test1` â€” **9 parts RW** (P1â€“7 Reading + P8â€“9 Writing, 120 phÃºt) |
| Listening | C1 CAE | `cae-Listening-test1` | **Builtin** `catalog-listening-cae-c1-test1` |
| Listening | IELTS Cam 9â€“20 | `IELTS/Listening/Listening IELTS_Test*_Cam*` (48 Ä‘á») | **Builtin** `catalog-listening-ielts-cam{X}-test{Y}` â€” restored 2026-07-12 |
| Reading | IELTS Cam 9â€“11 (má»™t pháº§n) | `IELTS/Reading IELTS_Test*_Cam*` | **Builtin 9 Ä‘á»** cÃ³ `exam.json` (Cam9 T1â€“4, Cam10 T1â€“4, Cam11 T3); 39 folder cÃ²n PDF/scaffold |

---

## Session 2026-07-12 â€” Cá»©u catalog IELTS 48 Listening + 9 Reading

### NguyÃªn nhÃ¢n â€œmáº¥tâ€
- 2026-07-04/05: user request â€œXÃ³a sáº¡ch 48 Ä‘á» máº«uâ€ â†’ disable `discoverIeltsListeningBundles`, empty `generatedIeltsListening.ts`, xÃ³a 48 JSON catalog.
- **Nguá»“n Tainguyen + MP3 public váº«n cÃ²n** â€” khÃ´ng máº¥t file gá»‘c.

### ÄÃ£ lÃ m
- [x] Restore 48 JSON `packages/catalog/data/listening-ielts-cam*.json` + `generatedIeltsListening.ts` (git `ded4557` + rebuild)
- [x] Báº­t láº¡i discover Listening: `Tainguyen/IELTS/Listening/` (+ fallback flat `IELTS/`)
- [x] Discover Reading IELTS chá»‰ folder cÃ³ `exam.json` â†’ **9 Ä‘á»** + `generatedIeltsReading.ts`
- [x] `pnpm`/`node scripts/build-catalog.mjs` â€” 48 listening + 9 reading IELTS + Cambridge static
- [x] Wire `GENERATED_IELTS_READING_EXAMS` vÃ o `builtinExams.ts`
- [x] Bump `GLOBAL_CATALOG_VERSION` **23 â†’ 24** (Dexie re-sync catalog)
- [x] Fix TS: `listeningExamCatalogMerge` cast `examType as ListeningExamType` (JSON widen)
- [x] `npx tsc --noEmit` (apps/web) â€” pass

### CÃ²n láº¡i
- [x] Deploy production **v0.2.4** â€” `pnpm deploy:web` â†’ https://ryanenglishv2.vercel.app (commit `e0f0581`)
- [x] Push branch `feat/reading-part-picker`
- [x] **Auto-backup Ä‘á»** (2026-07-12): Dexie `examBackups` v15, OPFS, auto-download JSON khi LÆ°u Wizard/Import; Settings toggle; full app backup v4 gá»“m examBackups
- [x] Pilot Cam11 Reading T1 + fix white screen (`features` string â†’ `{id,name}`)
- [ ] Build `exam.json` cho ~38 Reading IELTS cÃ²n láº¡i (PDF trong folder scaffold)
- [ ] User: hard refresh production Ä‘á»ƒ catalog v24 náº¡p láº¡i

### Lá»‡nh verify
```bash
node scripts/build-catalog.mjs   # IELTS listening: 48, reading: 9
# apps/web: npx tsc --noEmit
```

---

## Cáº¥u trÃºc monorepo

```
Website/
â”œâ”€â”€ apps/web/               â† Vite + React app chÃ­nh
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ App.tsx         â† Routes: / (landing) + /app/* (protected)
â”‚   â”‚   â”œâ”€â”€ main.tsx        â† AuthProvider wrap
â”‚   â”‚   â”œâ”€â”€ features/auth/  â† AuthContext, LoginPage, ProtectedRoute, AuthCallback, useSync
â”‚   â”‚   â”œâ”€â”€ lib/            â† supabase.ts, database.types.ts
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ landing/LandingPage.tsx  â† Trang chá»§ public + animated sun
â”‚   â”‚   â”‚   â””â”€â”€ AppShell.tsx            â† Sidebar + nav /app/*
â”‚   â”‚   â””â”€â”€ styles/globals.css          â† 3 theme: light / mid / dark
â”‚   â”œâ”€â”€ .env.local          â† VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (Ä‘Ã£ Ä‘iá»n)
â”‚   â””â”€â”€ tailwind.config.js
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ core/               â† SRS scheduler (SM-2) + License plans (TS thuáº§n)
â”‚   â”œâ”€â”€ db/                 â† Dexie schema (14 báº£ng) + sync cloudâ†”local
â”‚   â””â”€â”€ ui/                 â† Button, Card components
â”œâ”€â”€ server/                 â† Local TTS Kokoro gateway â€” `pnpm dev:server` â†’ :8787
â”œâ”€â”€ supabase/
â”‚   â””â”€â”€ migrations/001_initial_schema.sql  â† ÄÃƒ CHáº Y trÃªn Supabase
â””â”€â”€ pnpm-workspace.yaml
```

---

## Viá»‡c Ä‘Ã£ hoÃ n thÃ nh (session 2026-06-30)

### Fix trang tráº¯ng `/app/vocab` (2026-07-15)
- **NguyÃªn nhÃ¢n:** (1) Vite dev serve `VocabularyPage.tsx` rá»—ng (Content-Length 0) â†’ `React.lazy` render `undefined`; (2) UI import tÄ©nh `vocabSeedDecks` + ~7MB JSON seed; (3) `DeckGrid` NÃ— `useLiveQuery` (100+ deck) dá»… treo main thread
- [x] TÃ¡ch `GROUP_LABELS` â†’ `vocabConstants` â€” DeckGrid/Editor khÃ´ng import seed JSON
- [x] `VocabularyPage` dynamic-import seed + repair
- [x] `DeckGrid` gá»™p 1 query stats theo `unitKind` (khÃ´ng cÃ²n hook per-card)
- [x] Lazy VocabularyPage retry náº¿u module rá»—ng; táº¯t SW register á»Ÿ DEV
- [x] `examVocabDecks` báº¯t race Dexie ConstraintError (StrictMode)
- [x] Verify Playwright mock-auth: cÃ³ Â«Bá»™ tá»« vá»±ngÂ» + tabs; `tsc --noEmit` pass

### Tá»« Ä‘iá»ƒn offline Part2â€“5 (2026-07-15)
- [x] Nguá»“n: `samuraitruong/open-vn-en-dict` (MIT)
- [x] P2â€“P4 6k each Â· **P5 +6k** (`build-dict-part5.mjs` â†’ `offlinePart5.json`)
- [x] Tá»•ng raw ~**24.3k** (P1 300 + 24k); wire P1â€“P5 + cá»¥m
- [x] Popup true.jpg + enrichDictResult
- [x] Hard refresh â†’ offline; UI P2â€“P5

### Vocab seed 100 tá»« Ä‘Æ¡n + 100 cá»¥m + IPA/example (2026-07-15)
- [x] singles + phrases (~31200 tháº»)
- [x] `enrich-preset-vocab.mjs` â€” IPA US/UK (CMUdict) + example gáº¯n phrase; seed **v4**
- [x] `seedPresetCards` **patch** tháº» cÅ© (IPA/example thiáº¿u hoáº·c generic)
- [x] Hard refresh `/app/vocab` â†’ tháº¥y IPA + vÃ­ dá»¥ Ä‘áº§y Ä‘á»§

### Vocab thÃªm bá»™ preset rá»—ng (2026-07-15)
- [x] Láº§n 1â€“3: +6/nhÃ³m má»—i láº§n â†’ **26 bá»™/nhÃ³m** (156 preset)
- [x] Má»Ÿ `/app/vocab` â†’ seed deck má»›i tá»± táº¡o (idempotent)

### Vocab 2 cáº¥u trÃºc: Tá»« Ä‘Æ¡n | Cá»¥m tá»« (2026-07-15) â€” HOÃ€N THÃ€NH
- [x] `vocabUnitKind.ts` â€” phÃ¢n loáº¡i: cÃ³ khoáº£ng tráº¯ng / POS cá»¥m â†’ phrase; cÃ²n láº¡i single
- [x] Tab cáº¥p 1 trÃªn `/app/vocab`: **Tá»« vá»±ng Ä‘Æ¡n láº»** | **Cá»¥m tá»« vá»±ng**
- [x] Lá»c sá»‘ Ä‘áº¿m deck, danh sÃ¡ch tháº», SRS/Quiz/Type/Nghe/Speak, stats/weak/review theo `unitKind`
- [x] `tsc --noEmit` pass

### Vocab preset seed 100 tá»«/nhÃ³m (2026-07-15) â€” HOÃ€N THÃ€NH
- [x] `scripts/gen-preset-vocab-seed.mjs` â€” sinh 600 tháº» (IELTS/Oxford/TOEIC/Academic/SAT/TOEFL Ã— 100)
- [x] `apps/web/src/features/vocab/seedData/presetVocabCards.ts` â€” data seed
- [x] `seedPresetCards()` â€” stable `pcard:` + SRS; **khÃ´ng** skip khi admin publish (fix deck rá»—ng)
- [x] Fix: `seedPresetDecks` trÆ°á»›c Ä‘Ã¢y return sá»›m náº¿u `admin_published_vocab_version > 0` â†’ khÃ´ng náº¡p tháº»
- [x] Prune publish **giá»¯** tháº» `sourceLabel` `preset-seed*`; sau `mergeVocab` gá»i láº¡i `seedPresetCards`
- [x] `tsc --noEmit` pass
- [ ] User: hard refresh `/app/vocab` â†’ má»Ÿ bá»™ (vd. IELTS â†’ MÃ´i trÆ°á»ng) â†’ ~12â€“13 tá»«/bá»™

### Vocab Study UI â€” Premium redesign (Giaodien/*.html) â€” HOÃ€N THÃ€NH
- [x] `study/vocabStudy.css` â€” dark gradient shell, stat bar, mode tabs, flashcard/quiz/game card
- [x] `study/DeckStatBar.tsx` â€” Total/Leared/Progress/Tá»« má»›i/Cáº§n Ã´n/ÄÃ£ vÃ o lá»‹ch/Láº§n Ã´n káº¿ tiáº¿p
- [x] `study/StudyModeTabs.tsx` â€” 3 mode active + placeholder tabs (Listening, Tá»« yáº¿uâ€¦)
- [x] `study/useDeckStudyStats.ts` â€” live stats tá»« Dexie SRS
- [x] `study/speakPhrase.ts` â€” Kokoro local TTS (lang `a` US); fallback Web Speech; SRS auto-phÃ¡t khi láº­t vá» máº·t trÆ°á»›c
- [x] `StudySession.tsx` â€” wire shell + stat bar + mode tabs
- [x] `SrsMode.tsx` â€” flashcard Láº·p láº¡i: tags, flip Space, rating gradient 1â€“4, Há»i AI, phÃ¡t Ã¢m
- [x] `QuizMode.tsx` â€” Tráº¯c nghiá»‡m: 2Ã—2 options, gradient word, example + voice, keyboard 1â€“4
- [x] `TypeMode.tsx` â€” ÄoÃ¡n nghÄ©a: nhÃ¬n VI â†’ gÃµ EN, letter pills, blank example, Gá»£i Ã½/KhÃ´ng biáº¿t/Kiá»ƒm tra, SRS update
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass
- [x] `vocabStudy.css` theme-aware â€” ná»n/text/card theo `data-theme` light/mid/dark (dÃ¹ng `--bg-*`, `--text-*`, `--color-*`)
- [x] Danh sÃ¡ch tá»« (`CardPanel`) â€” cá»™t **Tráº¡ng thÃ¡i** (Tá»« má»›i / Cáº§n Ã´n / ÄÃ£ há»c) + badge **tá»« loáº¡i** (Danh tá»«, Äá»™ng tá»«â€¦)
- [x] **Nghe & GÃµ** (`ListenTypeMode`) â€” mode má»›i theo `Giaodien/Nghe & GÃµ láº¡i tá»« vá»±ng.html`: TTS + tá»‘c Ä‘á»™, gÃµ láº¡i, gá»£i Ã½/bá» qua/xem Ä‘Ã¡p Ã¡n, panel hÆ°á»›ng dáº«n + tiáº¿n Ä‘á»™
- [x] **SRS popup nháº¯c Ã´n** â€” `SrsReviewReminderModal`: chim animated, Ä‘áº¿m tá»« due, chá»n deck â†’ SRS; hiá»‡n khi vÃ o `/app` (F5/login) + má»—i 30 phÃºt
- [x] Fix popup sau F5: `useSrsReviewPopup` dÃ¹ng `useLiveQuery` + re-check sau `syncState === 'done'`
- [x] Import tá»± gÃ¡n `pos` qua `posLabels.ts` (infer + chuáº©n hÃ³a noun/verb/adj â†’ tiáº¿ng Viá»‡t)
- [x] **Há»c láº¡i** â€” `StudyDoneActions` trÃªn mÃ n hÃ¬nh hoÃ n thÃ nh (SRS/Quiz/Type/Listen): nÃºt Há»c láº¡i + Quay láº¡i/Xong
- [x] **SRS flip 3D** â€” Space/click láº­t tháº» vá»›i animation `rotateY` (`.vs-flip-scene` / `.vs-flip-inner.is-flipped`)
- [x] **Tá»« yáº¿u** (`WeakWordsMode`) â€” báº£ng tá»« yáº¿u (lapses/ease), nÃºt Ã”n SRS tá»« yáº¿u; `isWeakWord()` + `studyFilter: 'weak'`
- [x] **Ã”n táº­p** (`ReviewHubMode`) â€” hero Ä‘áº¿n giá» Ã´n, stat pills, lá»‹ch Ã´n sáº¯p tá»›i, cháº¿ Ä‘á»™ Ã´n nhanh
- [x] **Thá»‘ng kÃª** (`StatsMode`) â€” bento dashboard: hoáº¡t Ä‘á»™ng 14 ngÃ y, phÃ¢n bá»‘ rating/mode/tráº¡ng thÃ¡i, top tá»« yáº¿u
- [x] `StudyModeTabs` â€” 7 tab active (khÃ´ng cÃ²n placeholder disabled); `CardPanel` thÃªm nÃºt Ã”n táº­p / Tá»« yáº¿u / Thá»‘ng kÃª

### Listening â€” Cáº¥u trÃºc Test/Part + ThÃªm cÃ¢u/vÄƒn báº£n (Giaodien/8.jpg) â€” HOÃ€N THÃ€NH
- [x] `Lesson` metadata: `book`, `bookNum`, `test`, `part`, `topic`, `source` (Dexie v4)
- [x] `listeningMeta.ts` â€” nhÃ³m Cambridge theo sÃ¡ch â†’ Test â†’ Part
- [x] `cambridgePacks.ts` â€” seed Cambridge 20 (Test 1 Parts 1â€“4, Test 2 Part 1) + KET A2
- [x] `ListeningTopicAccordion.tsx` â€” UI accordion nhÆ° hÃ¬nh 8 (Dictation, Báº¯t Ä‘áº§u, + ThÃªm cÃ¢u, + VÄƒn báº£n)
- [x] `ListeningUserLessonCard.tsx` â€” My Lessons: + ThÃªm cÃ¢u, + VÄƒn báº£n
- [x] `AppendSentencesModal.tsx` â€” thÃªm 1 cÃ¢u hoáº·c dÃ¡n vÄƒn báº£n (tÃ¡ch cÃ¢u tá»± Ä‘á»™ng)
- [x] `lessonRepo.appendSentences()` â€” append vÃ o bÃ i Ä‘Ã£ cÃ³
- [x] Seed `listening_seed_v2` â€” bá»• sung bÃ i cÃ³ cáº¥u trÃºc Test/Part
- [x] XÃ³a/áº©n **BÃ i Cambridge (cÅ©)** â€” `purgeLegacyCambridge()` xÃ³a bÃ i flat khá»i DB, UI chá»‰ hiá»‡n bÃ i cÃ³ `book/test/part`

### Listening â€” Import & PhiÃªn Ã¢m (MP3 â†’ text) â€” HOÃ€N THÃ€NH
- [x] `packages/core/src/ai/transcribeAudio.ts` â€” Whisper API (OpenAI `whisper-1` / Groq `whisper-large-v3`), dÃ¹ng API key tá»« CÃ i Ä‘áº·t AI
- [x] `packages/db/audioRepo.ts` â€” lÆ°u blob MP3 local (`lesson:{id}`)
- [x] `ImportAudioModal.tsx` â€” upload MP3 (â‰¤25MB) â†’ phiÃªn Ã¢m â†’ preview cÃ¢u â†’ táº¡o bÃ i user
- [x] `ListeningLibraryPage` â€” nÃºt **Import & PhiÃªn Ã¢m** má»Ÿ modal, sau táº¡o redirect vÃ o bÃ i má»›i
- [x] Cáº§n API key **Groq** hoáº·c **OpenAI** (DeepSeek/Gemini chÆ°a há»— trá»£ STT)

### Copy text trong app â€” HOÃ€N THÃ€NH
- [x] `lib/copyToClipboard.ts` â€” Clipboard API + `execCommand` fallback
- [x] `components/TextSelectionToolbar.tsx` â€” toolbar "Copy" khi bÃ´i Ä‘en text (toÃ n app, trá»« input/textarea)
- [x] `components/CopyButton.tsx` â€” nÃºt copy tÃ¡i sá»­ dá»¥ng
- [x] `App.tsx` â€” mount `TextSelectionToolbar` global
- [x] `globals.css` + `AppShell` main â€” `user-select: text` cho ná»™i dung
- [x] `ListeningTranscriptTab` â€” text chá»n Ä‘Æ°á»£c + nÃºt Copy/Sá»­a (khÃ´ng bá»c trong `<button>`)
- [x] `ListeningSidebarCards` â€” Copy báº£n dá»‹ch + cÃ¢u gá»‘c
- [x] `SrsMode` â€” cho phÃ©p chá»n text khi Ä‘Ã£ láº­t tháº»
- [x] `DictionaryModal` â€” Copy toÃ n bá»™ káº¿t quáº£ tra tá»«

### Local TTS â†’ Frontend Listening â€” BÆ¯á»šC 3 HOÃ€N THÃ€NH
- [x] `apps/web/src/features/listening/tts.ts` â€” wrapper gá»i `POST /api/tts`, `HTMLAudioElement`, prefetch, fallback Web Speech API
- [x] `ttsConfig.ts` â€” `VITE_TTS_SERVICE_URL` (default `http://localhost:8787`)
- [x] `useListeningPlayback.ts` â€” progress bar theo audio tháº­t khi Kokoro active (RAF 60fps, `scaleX`, buffering state)
- [x] `LessonDetail.tsx`, `DictationSession.tsx` â€” dÃ¹ng wrapper + hiá»‡n cáº£nh bÃ¡o khi TTS local chÆ°a sáºµn sÃ ng
- [x] `ListeningSidebarCards.tsx` â€” **xÃ³a badge `ListeningTtsStatusBadge` ("Kokoro local")** á»Ÿ card "Luyá»‡n phÃ¡t Ã¢m" (theo `Giaodien/7.jpg`)
- [x] `server/src/index.ts` â€” CORS cho dev frontend `:5173`
- [x] `pnpm --filter web exec tsc --noEmit` + `pnpm --filter web build` â€” pass

#### Dev flow Listening + Kokoro:
```bash
pnpm dev:server    # terminal 1 â€” :8787
pnpm dev           # terminal 2 â€” :5173
# Optional: VITE_TTS_SERVICE_URL=http://localhost:8787 in apps/web/.env.local
```

---

### Local TTS Service (Kokoro) â€” BÆ¯á»šC 1 + 2 HOÃ€N THÃ€NH
- [x] **BÆ°á»›c 1:** Express + TypeScript gateway (`pnpm dev:server` â†’ :8787)
- [x] **BÆ°á»›c 2:** Kokoro engine tháº­t qua Python child process (:8788)
- [x] `GET /api/tts/health` â€” Node + Kokoro status (available/ready/deps/cache dir)
- [x] `POST /api/tts` â€” tráº£ `audio/wav` tháº­t, filesystem cache SHA-256 (text+voice+speed)
- [x] `server/python/kokoro_server.py` + `requirements.txt` + `scripts/setup-kokoro.ps1`
- [x] Graceful 503 JSON khi Kokoro chÆ°a ready; Node khÃ´ng crash
- [x] ChÆ°a Ä‘á»¥ng `apps/web` Listening / `tts.ts`
- [x] Verified: health OK, synth WAV OK (first run cháº­m do táº£i model HF), cache HIT OK

#### Cháº¡y TTS service:
```bash
pnpm install --ignore-scripts
powershell -ExecutionPolicy Bypass -File server/scripts/setup-kokoro.ps1   # láº§n Ä‘áº§u
pnpm dev:server          # http://localhost:8787
pnpm --filter server typecheck
```

---

### Supabase â€” ÄÃƒ SETUP XONG
- [x] SQL migration cháº¡y thÃ nh cÃ´ng (6 báº£ng + RLS + triggers)
  - `profiles`, `decks`, `cards`, `srs`, `writing_docs`, `ai_usage`
  - Row Level Security: má»—i user chá»‰ tháº¥y data cá»§a mÃ¬nh
  - Trigger `handle_new_user`: tá»± táº¡o profile khi user Ä‘Äƒng nháº­p láº§n Ä‘áº§u
- [x] Google OAuth báº­t â€” Client ID/Secret Ä‘Ã£ Ä‘iá»n
- [x] Redirect URL: `http://localhost:5173/auth/callback`
- [x] Site URL: `http://localhost:5173`

### Code Ä‘Ã£ viáº¿t
- [x] Monorepo skeleton (pnpm workspaces, 5 packages)
- [x] AuthContext + Google OAuth flow
- [x] Landing page (`/`) â€” public, cÃ³ animated sun (xoay + ná»•i + chá»›p máº¯t)
- [x] Protected routes (`/app/*`) â€” redirect vá» `/` náº¿u chÆ°a login
- [x] AppShell sidebar vá»›i user info + logout + theme switcher
- [x] Dexie schema Ä‘áº§y Ä‘á»§ (local-first)
- [x] Sync layer: `syncLocalToCloud` + `syncCloudToLocal`
- [x] `packages/core`: SRS scheduler (SM-2) + License plans

### Landing page details
- Header: logo + chuÃ´ng + nÃºt KhÃ¡ch (dropdown: ÄÄƒng nháº­p / Táº¡o tÃ i khoáº£n)
- Hero: "Luyá»‡n thi / IELTS/ CAMBRIDGE" + animated sun mascot
- Sun animation: xoay tia (12s), ná»•i lÃªn xuá»‘ng (4s), chá»›p máº¯t, láº¯c smile, chat bubble "báº¡n cá»© viá»‡c focus... Ä‘Ã£ cÃ³ Ryan lo!"
- Features section: 6 cards (Vocab SRS, Writing AI, Listening, MindMap, Dictionary, Offline-first)
- Pricing section: tab switcher (Free 0Ä‘ / Pro 99k / Lifetime 599k) + 3 cá»™t desktop / 1 card mobile
- PaymentModal: QR chuyá»ƒn khoáº£n (`public/images/qr-payment.jpg`) khi CTA Pro/Lifetime; mailto kÃ­ch hoáº¡t
- Footer: brand + liÃªn há»‡ email + anchor links (#features, #pricing)
- ToÃ n bá»™ UI dÃ¹ng CSS variables (khÃ´ng hardcode gray/indigo)

### Plan Management + Admin Page â€” HOÃ€N THÃ€NH (session 2026-06-30)

#### Kiáº¿n trÃºc (HÆ°á»›ng B â€” Supabase-based):
- Schema `profiles` Ä‘Ã£ cÃ³ sáºµn `plan` + `plan_expires_at` tá»« migration 001
- Migration 002 chá»‰ cáº§n thÃªm `is_admin` + admin RLS policies

**Files:**
- [x] `supabase/migrations/002_admin_plan.sql` â€” ADD COLUMN is_admin + is_current_user_admin() function + 2 RLS policies (admin read all / admin update plan)
- [x] `features/auth/usePlanSync.ts` â€” hook Ä‘á»c plan+is_admin tá»« Supabase sau login â†’ lÆ°u vÃ o db.settings
- [x] `features/admin/AdminPage.tsx` â€” trang quáº£n lÃ½ user: stats 4 Ã´ + search + báº£ng users + UpgradeModal
- [x] `App.tsx` â€” route `/app/admin`
- [x] `AppShell.tsx` â€” gá»i `usePlanSync()` + nav item Admin (chá»‰ hiá»‡n náº¿u is_admin=true)

#### Notes quan trá»ng:
- `usePlanSync` cháº¡y 1 láº§n sau login, lÆ°u plan vÃ o db.settings â†’ `canUse(plan, feature)` dÃ¹ng ngay
- is_admin Ä‘Æ°á»£c set THá»¦ CÃ”NG trong Supabase SQL Editor: `UPDATE profiles SET is_admin=true WHERE email='...'`
- Admin page: search theo email/display_name, UpgradeModal cho chá»n plan + thá»i háº¡n (1m/3m/12m/lifetime)
- calcExpiry: free/lifetime â†’ null, cÃ¡c gÃ³i khÃ¡c â†’ now + months
- TypeScript cast `supabase as any` cho update plan (database.types.ts chÆ°a include cá»™t má»›i)
- RLS helper function `is_current_user_admin()` dÃ¹ng SECURITY DEFINER Ä‘á»ƒ trÃ¡nh recursion

#### CÃ¡ch dÃ¹ng (Flow):
1. Cháº¡y `002_admin_plan.sql` trong Supabase SQL Editor
2. Cháº¡y `UPDATE profiles SET is_admin=true WHERE email='your@gmail.com'`
3. ÄÄƒng xuáº¥t + Ä‘Äƒng nháº­p láº¡i â†’ nav Admin xuáº¥t hiá»‡n
4. VÃ o Admin â†’ tÃ¬m user â†’ "NÃ¢ng cáº¥p" â†’ chá»n gÃ³i + thá»i háº¡n â†’ LÆ°u
5. User Ä‘Äƒng xuáº¥t + Ä‘Äƒng nháº­p láº¡i â†’ plan má»›i cÃ³ hiá»‡u lá»±c

### Module MindMap â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `packages/core/src/ai/mindmapPrompt.ts` â€” buildMindmapExpandPrompt â†’ JSON {children:[]}
- [x] `packages/db/src/local/repositories/mindmapRepo.ts` â€” CRUD mindmaps (create/saveTree/rename/delete)
- [x] `features/mindmap/types.ts` â€” MindNode type + createNode/flattenNodes/updateNode/appendChildren/removeNode + **radialLayout** algorithm (depth 0-3, dynamic R1, spread angle per branch)
- [x] `mindmapStore.ts` â€” Zustand (activeMapId)
- [x] `MindmapListPanel.tsx` â€” danh sÃ¡ch mindmap + node count + xÃ³a
- [x] `NewMindmapModal.tsx` â€” nháº­p tá»« trung tÃ¢m â†’ táº¡o root node
- [x] `MindmapCanvas.tsx` â€” custom SVG canvas: dot grid + bezier lines + positioned pill nodes + action toolbar (AI Expand / Add / Rename / Delete / Collapse)
- [x] `MindmapPage.tsx` â€” layout 2 panel
- [x] `App.tsx` â€” thÃªm route `/app/mindmap`
- [x] `AppShell.tsx` â€” thÃªm nav item MindMap + GitBranch icon

#### Notes quan trá»ng MindMap:
- Layout thuáº§n custom: SVG bezier lines + absolutely positioned divs (khÃ´ng dÃ¹ng React Flow)
- radialLayout: Level 1 R1=max(180, n*38), Level 2 R2=145 spread 75%, Level 3 R3=110
- Node interaction: click=select, double-click=rename inline, toolbar bÃªn dÆ°á»›i node Ä‘Æ°á»£c chá»n
- AI Expand: PRO gate (canUse plan 'mindmap_ai') â†’ gá»i AI â†’ parse JSON â†’ appendChildren â†’ save
- Collapse: toggle node.collapsed â†’ layout bá» qua subtree Ä‘Ã³
- Dot grid: SVG pattern repeating circle r=1
- MÃ u sáº¯c: 8 mÃ u BRANCH_COLORS, level 1 má»—i nhÃ¡nh 1 mÃ u, level 2+ inherit

### Module Dictionary â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `packages/core/src/ai/dictionaryPrompt.ts` â€” DictResult type, DictDefinition, buildDictionaryPrompt
- [x] `packages/db/src/local/repositories/dictRepo.ts` â€” get/save/isFresh (TTL 30 ngÃ y)/recent
- [x] `apps/web/src/features/dictionary/dictStore.ts` â€” Zustand (isOpen, initialQuery, open/close)
- [x] `DictionaryFAB.tsx` â€” FAB cá»‘ Ä‘á»‹nh bottom-right, detect text selection khi click
- [x] `DictionaryModal.tsx` â€” search bar + cache lookup + AI call + result (IPA/POS/Level/Definitions/Collocations/Synonyms/TTS)
- [x] `SaveToDeckModal.tsx` â€” chá»n deck + inline táº¡o deck má»›i + thÃªm card + success state
- [x] `AppShell.tsx` â€” gáº¯n FAB + Modal vÃ o layout chÃ­nh (available toÃ n bá»™ /app pages)

#### Notes quan trá»ng Dictionary:
- FAB detect window.getSelection() â†’ pre-fill query khi cÃ³ text Ä‘ang chá»n
- Cache: isFresh() check TTL 30 ngÃ y trÆ°á»›c khi gá»i AI
- API key/provider láº¥y tá»« db.settings (dÃ¹ng chung vá»›i Writing module)
- SaveToDeckModal: z-[60] (trÃªn DictionaryModal z-50), inline create deck khÃ´ng cáº§n modal con
- Collocations + Synonyms Ä‘á»u clickable â†’ tra tiáº¿p tá»« liÃªn quan
- TTS: speechSynthesis.speak() inline (khÃ´ng import tá»« listening module)

### Module Writing â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `packages/core/src/ai/provider.ts` â€” callAI, AI_PROVIDERS (OpenAI/DeepSeek/Groq/Gemini), AIMessage, AIResult
- [x] `packages/core/src/ai/writingPrompt.ts` â€” IELTSScore type, buildIELTSTask2Prompt, buildIELTSTask1Prompt, buildMasterPrompt
- [x] `packages/core/src/index.ts` â€” export ai layer
- [x] `packages/db` â€” WritingDoc.type má»Ÿ rá»™ng: 'ielts_task1'|'ielts_task2'|'master' (+ backward compat 'ielts')
- [x] `writingRepo.ts` â€” CRUD docs, hashText cache (SHA-256), aiUsage tracking, settings CRUD
- [x] `writingStore.ts` â€” Zustand (activeDocId, score, isGrading, gradingError)
- [x] `DocListPanel.tsx` â€” danh sÃ¡ch bÃ i, badge loáº¡i/tá»« sá»‘
- [x] `NewDocModal.tsx` â€” chá»n Task 1/Task 2/Free + nháº­p Ä‘á» bÃ i
- [x] `AiSettingsModal.tsx` â€” chá»n provider, nháº­p API key (áº©n/hiá»‡n), chá»n plan, xem usage hÃ´m nay
- [x] `ScorePanel.tsx` â€” Overall band (lá»›n) + 4 tiÃªu chÃ­ + Strengths/Improvements + history chips
- [x] `WritingEditor.tsx` â€” textarea vá»›i auto-save 1.5s debounce + word count bar + grade flow Ä‘áº§y Ä‘á»§
- [x] `WritingPage.tsx` â€” layout 2 panel

#### Notes quan trá»ng Writing:
- Grade flow: check API key â†’ check plan â†’ check rate limit â†’ check cache (SHA-256 hash) â†’ call AI â†’ save history â†’ recordUsage
- Cache: cÃ¹ng text â†’ tráº£ ngay tá»« writingHistory.textHash, khÃ´ng gá»i AI láº§n 2
- Rate limit: Free/Basic=0, Trial=5/ngÃ y, Pro=20/ngÃ y, Lifetime=âˆž
- Plan default: 'pro' (tá»± chá»n trong AiSettings, dÃ¹ng thá»­ chá»© khÃ´ng enforce)
- Táº¥t cáº£ 4 providers dÃ¹ng OpenAI-compatible API format
- response_format: { type: 'json_object' } â€” AI buá»™c tráº£ JSON
- Feedback viáº¿t báº±ng tiáº¿ng Viá»‡t (system prompt chá»‰ Ä‘á»‹nh)

### Module Listening â€” HOÃ€N THÃ€NH + PORT Tá»ª P15.8.302 (session 2026-06-30)
- [x] `types.ts` â€” LessonSentence, defaultSentence, splitIntoSentences, compareWords, accuracy, ratingFromAccuracy
- [x] `tts.ts` â€” Web Speech API wrapper (speak/stop/playSlow)
- [x] `cambridgePacks.ts` â€” 4 Cambridge packs mock (28 cÃ¢u), seeded vÃ o DB khi vÃ o trang láº§n Ä‘áº§u
- [x] `lessonRepo.ts` trong `packages/db` â€” CRUD lessons
- [x] `listeningStore.ts` â€” Zustand (activeLessonId, studying, tab)
- [x] `ListeningLibraryPage.tsx` â€” thÆ° viá»‡n bÃ i nghe (LIBRARY ARCHIVES UI)
- [x] `ListeningLessonPage.tsx` â€” chi tiáº¿t bÃ i: 3 tab Practice/Transcript/Shadowing + sidebar
- [x] `ListeningPracticeTab.tsx` â€” Ã” chá»¯/Cloze per-word inputs, audio progress bar, word diff live, cloze count +/âˆ’
- [x] `ListeningShadowingTab.tsx` â€” pitch contour canvas, Web Speech recognition, mic YIN capture
- [x] `practiceUtils.ts`, `BlankInputMode.tsx`, `WordDiffPanel.tsx` â€” logic blank/cloze/diff port tá»« reference
- [x] `useListeningPlayback.ts` â€” TTS + progress bar Æ°á»›c lÆ°á»£ng theo tá»‘c Ä‘á»™ Ä‘á»c
- [x] `pitchContour.ts`, `PitchContourCanvas.tsx`, `useMicPitchCapture.ts` â€” YIN pitch + canvas
- [x] `useSpeechRecognition.ts` â€” Web Speech API wrapper shadowing
- [x] `ListeningSidebarCards.tsx` â€” dá»‹ch nghÄ©a + phÃ¡t Ã¢m (dots locked Ä‘áº¿n khi hoÃ n thÃ nh cÃ¢u)
- [x] `CreateLessonModal.tsx`, `DictationSession.tsx` (legacy overlay)
- [x] Route `/app/listening/:lessonId` + `ListeningLayout.tsx` seed Cambridge packs

#### Notes quan trá»ng Listening:
- TTS: Web Speech API (khÃ´ng cáº§n server). `speak(text, rate=0.85)`, cháº­m `rate=0.6`
- Audio progress bar: Æ°á»›c lÆ°á»£ng duration (khÃ´ng cÃ³ HTMLAudioElement nhÆ° Electron app cÅ©)
- Pitch contour "Nghe máº«u": synthetic reference contour; "Báº¯t Ä‘áº§u Ä‘á»c": mic YIN tháº­t
- Cloze: `clozeCount=0` = áº©n táº¥t cáº£ tá»« eligible; +/- Ä‘iá»u chá»‰nh sá»‘ Ã´ trá»‘ng
- SRS sentences Ä‘Æ°á»£c lÆ°u embedded trong `lesson.sentences[]` (khÃ´ng dÃ¹ng báº£ng `srs`)
- Cambridge packs chá»‰ seed 1 láº§n (check `count > 0` trÆ°á»›c)
- Accuracy â†’ rating: â‰¥90%=4, â‰¥70%=3, â‰¥40%=2, <40%=1
- `pnpm --filter web exec tsc --noEmit` + `pnpm --filter web build` â€” pass

### Module Vocabulary â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] Repository layer: `deckRepo`, `cardRepo`, `srsRepo` trong `packages/db/src/local/repositories/`
- [x] `packages/db/src/index.ts` export Ä‘áº§y Ä‘á»§ repos
- [x] `vocabStore` (Zustand) â€” activeDeckId + studyMode state
- [x] `DeckPanel` â€” danh sÃ¡ch deck (live query), táº¡o/xÃ³a deck, badge "X Ã´n"
- [x] `CardPanel` â€” báº£ng tá»« (live query), thÃªm/sá»­a/xÃ³a tá»«, 3 nÃºt há»c
- [x] `DeckEditorModal` â€” táº¡o/sá»­a bá»™ tháº»
- [x] `CardEditorModal` â€” thÃªm/sá»­a tá»« (phrase/meaning/example/IPA), "ThÃªm & tiáº¿p"
- [x] `StudySession` â€” overlay toÃ n mÃ n hÃ¬nh, tab chuyá»ƒn cháº¿ Ä‘á»™
- [x] `SrsMode` â€” flip card + rate 1-4 (SM-2), progress bar, thá»‘ng kÃª cuá»‘i
- [x] `QuizMode` â€” 4 Ä‘Ã¡p Ã¡n, shuffle, highlight Ä‘Ãºng/sai, Ä‘iá»ƒm %
- [x] `TypeMode` â€” gÃµ nghÄ©a, fuzzy match variants, Ä‘Ã¡p Ã¡n khi sai
- [x] `VocabularyPage` â€” layout 2 panel + StudySession overlay
- [x] Build production thÃ nh cÃ´ng (tsc + vite build sáº¡ch)

#### Notes quan trá»ng:
- `cardRepo.add()` tá»± init SRS state (dueAt = now â†’ all new cards immediately due)
- `deckRepo.delete()` cascade xÃ³a cards + srs + reviewLog
- StudySession dÃ¹ng `absolute inset-0` â†’ VocabularyPage cáº§n `relative h-full`

---

### Vercel Deploy Prep â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `apps/web/vercel.json` â€” SPA rewrite: táº¥t cáº£ route (trá»« `/assets/*`) â†’ `index.html`
- [x] `apps/web/vite.config.ts` â€” `base: '/'`, `build.outDir: 'dist'` (explicit)
- [x] `apps/web/public/_redirects` â€” Netlify fallback: `/* /index.html 200`
- [x] `apps/web/.env.example` â€” template env vars (khÃ´ng cÃ³ giÃ¡ trá»‹ tháº­t)
- [x] `pnpm --filter web build` â€” sáº¡ch (tsc + vite build)

#### Vercel setup notes:
- **Deployed:** https://ryanenglishv2.vercel.app/
- **Root Directory: Äá»‚ TRá»NG** (repo root `Website/`) â€” KHÃ”NG Ä‘áº·t `apps/web`
  - Monorepo cáº§n `packages/*` + `pnpm-workspace.yaml` á»Ÿ root Ä‘á»ƒ build
  - Lá»—i `" apps/web" does not exist` = Root Directory cÃ³ **space thá»«a** hoáº·c sai path
- `vercel.json` (repo root) â€” build + output `apps/web/dist` + SPA routes
- `apps/web/spa.vercel.json` â€” Vite plugin copy vÃ o `dist/vercel.json` má»—i láº§n build
- **Output Directory:** `apps/web/dist` (root trá»‘ng) hoáº·c `dist` (root = apps/web) â€” KHÃ”NG Ä‘áº·t `public`
- **QUAN TRá»ŒNG:** `cleanUrls: false` â€” `cleanUrls: true` lÃ m rewrite `/index.html` bá»‹ ignore â†’ 404 SPA
- DÃ¹ng `routes` + `filesystem` handle thay vÃ¬ `rewrites` Ä‘Æ¡n giáº£n (Ä‘Ã¡ng tin hÆ¡n cho Vite SPA)
- Env vars (báº¯t buá»™c): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Supabase â†’ Auth â†’ URL Configuration:
  - Site URL: `https://ryanenglishv2.vercel.app`
  - Redirect URLs: `https://ryanenglishv2.vercel.app/` + `http://localhost:5173/`
- **BrowserRouter** (2026 fix login) â€” OAuth `#access_token` khÃ´ng cÃ²n phÃ¡ route; `recoverOAuthSession` cháº¡y trong `main.tsx` trÆ°á»›c khi render
- OAuth redirect vá» `/` (khÃ´ng dÃ¹ng `/auth/callback`) â€” trÃ¡nh 404 Vercel static
- `AuthContext` xá»­ lÃ½ `?code=` PKCE ngay khi app load
- Production deploy 2026-06-30: bundle `index-BQV91eba.js` (Ä‘Ã£ verify redirectTo = origin + `/`)
- **OAuth production: HOáº T Äá»˜NG** â€” Ä‘Äƒng nháº­p Gmail OK trÃªn https://ryanenglishv2.vercel.app/
- **OAuth fix:** Supabase redirect `#access_token=...` â†’ `recoverOAuthSession` (trÆ°á»›c React render) â†’ `setSession` â†’ URL `/app/vocab`. ÄÄƒng xuáº¥t â†’ `location.replace('/')`.
- Vite build copy `index.html` â†’ má»i route path + `404.html` (fallback khi rewrites khÃ´ng apply)
- **Commit `vercel.json` á»Ÿ repo root vÃ o Git** náº¿u deploy qua GitHub

---

## Lá»—i cÃ²n tá»“n táº¡i / ChÆ°a test

- [x] Google OAuth flow end-to-end trÃªn production â€” OK (2026-06-30)
- [x] Deploy production Vercel â€” OK https://ryanenglishv2.vercel.app/
- [x] **KET Listening 5Ã— part*.mp3 â€œKhÃ´ng tÃ¬m tháº¥y file audioâ€** â€” fix 2026-07-14 (`resolveListeningAudioSource` + currentPart); user confirm OK
- [ ] **KET A2 Listening practice test-02â€¦44** â€” chá» user Ä‘á»§ media (~1h) â†’ `node scripts/ket-practice-csv-to-exam.mjs 2-44` (hoáº·c `all`)
- [ ] **Listening Ã” CHá»® trÃªn mobile iOS** â€” user tá»«ng bÃ¡o ~75% fix; **chá» user hard refresh production vÃ  xÃ¡c nháº­n**
- [x] **Listening thanh cuá»™n ngang/dá»c thá»«a** (dÆ°á»›i tabs) â€” fix layout shell + áº©n scrollbar
- [ ] **Web Audio trÃªn iOS** â€” chime/buzz/phÃ¡o hoa cÃ³ thá»ƒ cáº§n gesture trÆ°á»›c (autoplay policy)
- [ ] **IELTS Cam20 Listening UI** â€” notePassage / Choose TWO / P1 báº£ng / Part 2 segment
- [ ] Náº¿u user Ä‘Ã£ import ZIP Cam20 cÅ© â†’ re-import ZIP má»›i
- [ ] `pnpm install --ignore-scripts` khi hook esbuild lá»—i
- [ ] **CAE C1 RW Part 10** â€” `part10-page.jpg` placeholder

---

### Module Settings + Code Splitting â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `lib/theme.ts` â€” getTheme/setTheme + THEMES preview config (dÃ¹ng chung AppShell + Settings)
- [x] `features/settings/useAiSettings.ts` â€” hook load/save/test AI settings (tÃ¡ch tá»« AiSettingsModal)
- [x] `features/settings/AiSettingsPanel.tsx` â€” provider grid + API key + test káº¿t ná»‘i + usage
- [x] `SettingsPage.tsx` â€” 3 tab: Giao diá»‡n (theme preview cards), AI (shared panel), TÃ i khoáº£n (plan + features + contact)
- [x] `AiSettingsModal.tsx` â€” refactor dÃ¹ng AiSettingsPanel (DRY)
- [x] `App.tsx` â€” React.lazy() + Suspense cho táº¥t cáº£ route pages
- [x] `components/PageFallback.tsx` â€” spinner loading khi lazy load chunk
- [x] Build production thÃ nh cÃ´ng â€” main chunk ~384KB (tá»« 588KB), pages tÃ¡ch riÃªng (Vocab 28KB, Writing 22KB...)

#### Notes quan trá»ng Settings:
- Theme: 3 cháº¿ Ä‘á»™ light/mid/dark, lÆ°u localStorage `ryan-theme`, preview card mini UI
- AI tab: tÃ¡i dÃ¹ng logic AiSettingsModal, thÃªm nÃºt "Kiá»ƒm tra káº¿t ná»‘i" (callAI test JSON)
- Account tab: plan tá»« db.settings (sync Supabase qua usePlanSync), hiá»ƒn thá»‹ features enabled qua canUse()
- Contact: email ryanik1997@gmail.com + hÆ°á»›ng dáº«n nÃ¢ng cáº¥p qua admin
- Plan selector trong AI settings Ä‘Ã£ bá» (plan giá» sync tá»« Supabase, khÃ´ng override thá»§ cÃ´ng)
- Deep link tab: `/app/settings?tab=ai` hoáº·c `?tab=account` (HashRouter)

### SRS Push Reminder (local SW) â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `public/sw.js` â€” push + notificationclick â†’ `/app/vocab`; **+ cache-first catalog audio** (2026-07-07)
- [x] `features/notifications/useNotifications.ts` â€” local schedule, Dexie due count, localStorage
- [x] `SettingsPage` tab Giao diá»‡n â€” section "Nháº¯c nhá»Ÿ Ã´n tá»« hÃ ng ngÃ y"
- [x] `App.tsx` â€” Ä‘Äƒng kÃ½ SW on load; `AppShell` â€” `useNotifications()` interval
- Best-effort: chá»‰ cháº¡y khi tab má»Ÿ, khÃ´ng cáº§n VAPID/server

### AppShell Sidebar Polish â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] Logo mark gradient R + tagline IELTS Â· AI Â· SRS
- [x] Nav badges Ã´n tá»« (vocab SRS + listening dueAt) real-time
- [x] ThemeSwitcher 3 dot swatches + active ring
- [x] User area: avatar w-8, divider, logout hover text
- [x] Sidebar `w-52`

### License Backend (Payment notify) â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] Edge Function `notify-payment` â€” Resend email admin + lÆ°u `payment_requests`
- [x] `004_payment_requests.sql` â€” báº£ng + RLS (user read own, admin all)
- [x] `PaymentModal` â€” nÃºt "ThÃ´ng bÃ¡o Ä‘Ã£ chuyá»ƒn" (chá»‰ khi Ä‘Ã£ login)
- [x] `AdminPage` â€” tab "YÃªu cáº§u kÃ­ch hoáº¡t", badge pending, 1-click KÃ­ch hoáº¡t
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Deploy Edge Function:
```bash
npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo
```
Secrets: `RESEND_API_KEY`, `ADMIN_EMAIL` (tuá»³ chá»n `APP_ORIGIN`)
Cháº¡y `004_payment_requests.sql` trong Supabase SQL Editor trÆ°á»›c khi test.

### Supabase Cloud Sync â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `sync.ts` má»Ÿ rá»™ng â€” writingDocs + mindmaps push/pull, `isLocalEmpty()`, error handling
- [x] `003_writing_mindmap_sync.sql` â€” mindmaps table + writing_docs type constraint
- [x] `useSyncManager.ts` + `SyncProvider` â€” login/auto 5min/online/manual sync
- [x] `SyncOnLogin.tsx` â€” toast khÃ´i phá»¥c / Ä‘á»“ng bá»™ xong
- [x] `AppShell` â€” sync indicator sidebar; Settings tab TÃ i khoáº£n â€” "Äá»“ng bá»™ Ä‘Ã¡m mÃ¢y"
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Notes quan trá»ng Cloud Sync:
- Thiáº¿t bá»‹ má»›i (local trá»‘ng) â†’ `syncCloudToLocal`; cÃ³ data â†’ `syncLocalToCloud`
- `ryan-last-sync` trong localStorage
- **Cháº¡y `003_writing_mindmap_sync.sql` trÃªn Supabase trÆ°á»›c khi test**

### Daily Goal + Streak Celebration â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `settingsRepo.ts` â€” getSetting / putSetting, export tá»« `@ryan/db`
- [x] `useDailyGoal.ts` â€” goal words/translations, progress tá»« reviewLog hÃ´m nay
- [x] `DailyGoalCard.tsx` â€” progress bars, inline edit target (âš™)
- [x] `StreakCelebration.tsx` â€” overlay confetti, 1 láº§n/ngÃ y (localStorage)
- [x] `HomePage` â€” DailyGoalCard, StreakCelebration, Translation quick action, flame badge streakâ‰¥3
- [x] `PracticeSession` â€” ghi reviewLog mode `translation` khi rate
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Notes quan trá»ng Daily Goal:
- Settings keys: `daily_goal_words` (10), `daily_goal_translations` (5)
- Vocab count: reviewLog mode srs/quiz/type; translation: mode `translation`
- Celebrate key: `ryan-streak-celebrated-YYYY-MM-DD`

### Backup/Restore toÃ n bá»™ data â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `features/settings/backupRestore.ts` â€” exportBackup, importBackup (bulkPut merge), estimateBackupSize
- [x] `ConfirmRestoreModal.tsx` â€” xÃ¡c nháº­n merge, loading, success summary, error
- [x] `SettingsPage` tab TÃ i khoáº£n â€” section "Dá»¯ liá»‡u & Backup" (xuáº¥t/nháº­p JSON)
- [x] Format backup v1: 13 báº£ng (khÃ´ng audioBlobs, khÃ´ng dictionaryCache)
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Notes quan trá»ng Backup:
- File: `ryan-english-backup-YYYY-MM-DD.json`
- Restore MERGE qua `bulkPut` â€” khÃ´ng xÃ³a data cÅ©
- Æ¯á»›c tÃ­nh size: ~750 bytes/record

### Translation Practice â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] Dexie schema v2: `TranslationSet` + `TranslationSentence` (SRS nhÃºng trong sentence)
- [x] `translationRepo.ts` â€” CRUD + addSentence/deleteSentence/updateSrsState
- [x] `sampleSets.ts` â€” 3 bá»™ máº«u seed (IELTS T2Ã—10, IELTS T1Ã—8, DailyÃ—10)
- [x] `translationStore.ts` â€” activeSetId, practicing
- [x] `TranslationListPanel` â€” sidebar + badge category + due count + xÃ³a (user only)
- [x] `NewSetModal` â€” táº¡o bá»™ cÃ¢u rá»—ng
- [x] `TranslationDetail` â€” danh sÃ¡ch cÃ¢u + thÃªm/xÃ³a inline
- [x] `PracticeSession` â€” overlay luyá»‡n dá»‹ch, fuzzy compare, highlight, SRS rating
- [x] `TranslationPage` â€” layout 2 panel + seed on mount
- [x] Route `/app/translation` + nav "Dá»‹ch cÃ¢u" (Languages icon, giá»¯a Nghe vÃ  MindMap)
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Notes quan trá»ng Translation:
- Fuzzy compare: normalize lowercase, bá» dáº¥u cÃ¢u, match tá»« (cho phÃ©p lá»‡ch 1 kÃ½ tá»±)
- Highlight: Ä‘Ãºng = `--color-primary`, thiáº¿u = `--color-accent`, thá»«a = `--text-muted`
- SRS Ä‘Æ¡n giáº£n: Dá»… +3 ngÃ y, á»”n +1 ngÃ y, KhÃ³ Ã´n láº¡i ngay
- Seed check `translationRepo.count() > 0` trÆ°á»›c khi insert máº«u

### Import/Export tá»« vá»±ng â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `features/vocab/importExport.ts` â€” export CSV/JSON (RFC 4180), parse CSV/JSON (version 1), template CSV
- [x] `features/vocab/ImportModal.tsx` â€” drop zone, preview 5 dÃ²ng, import qua `cardRepo.add()`, cáº£nh bÃ¡o >500 tá»«
- [x] `CardPanel.tsx` â€” nÃºt **Xuáº¥t** (dropdown CSV/JSON, disabled khi rá»—ng) + **Nháº­p** (má»Ÿ ImportModal)
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Notes quan trá»ng Import/Export:
- CSV header: `phrase,meaning,example,ipaUS,pos` â€” `phrase` + `meaning` báº¯t buá»™c
- JSON format: `{ version: 1, deck: { name, book, unit }, cards: [...] }`
- Import chá»‰ thÃªm vÃ o deck hiá»‡n táº¡i (khÃ´ng táº¡o deck má»›i tá»« JSON)
- UI dÃ¹ng CSS variables, khÃ´ng hardcode mÃ u

### Module Pages Äá»“ng Nháº¥t (PanelHeader + PanelEmpty) â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `components/PanelHeader.tsx` â€” header chuáº©n cho left/right panel (title, subtitle, actions slot, border)
- [x] `components/PanelEmpty.tsx` â€” empty state chuáº©n (icon, message, optional action)
- [x] Ãp dá»¥ng PanelHeader: `DeckPanel`, `CardPanel`, `LessonPanel`, `DocListPanel`, `MindmapListPanel`, `TranslationListPanel`
- [x] Ãp dá»¥ng PanelEmpty: `DeckPanel`, `LessonPanel`, `DocListPanel`, `MindmapListPanel`, `TranslationListPanel`
- [x] Äá»“ng nháº¥t left panel width â†’ `w-60` (240px) â€” LessonPanel + TranslationListPanel tá»« `w-64` â†’ `w-60`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Notes quan trá»ng Panel unify:
- Header: `px-4 py-3.5`, `text-sm` title, `text-xs` subtitle, CSS variables only
- CardPanel header dÃ¹ng PanelHeader nhÆ°ng giá»¯ nguyÃªn study/export/import/thÃªm tá»« trong `actions`
- Right panel detail headers (LessonDetail, TranslationDetail...) chÆ°a Ä‘á»•i â€” chá»‰ left list panels + CardPanel

### HomePage Dashboard Polish â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] Dynamic greeting/subtitle theo giá» + streak
- [x] StatCard accent bar + quick actions grid
- [x] Onboarding checklist shimmer animation (`globals.css` `.progress-shimmer`)
- [x] **StudyActivityGrid** â€” thay checklist "Báº¯t Ä‘áº§u vá»›i Ryan English" báº±ng lÆ°á»›i 60 ngÃ y há»c (`reviewLog`, 10Ã—6 Ã´, Ä‘áº­m/nháº¡t theo lÆ°á»£t há»c)

### Onboarding Empty States â€” HOÃ€N THÃ€NH (session 2026-06-30)
- [x] `components/EmptyStateCard.tsx` â€” welcome card dÃ¹ng chung (icon, CTA, tip, footer link)
- [x] `VocabularyPage.tsx` â€” khi chÆ°a cÃ³ deck: welcome + nÃºt "Táº¡o bá»™ tháº» ngay" â†’ DeckEditorModal
- [x] `WritingPage.tsx` â€” khi chÆ°a cÃ³ bÃ i: welcome + "Táº¡o bÃ i viáº¿t Ä‘áº§u tiÃªn" â†’ NewDocModal; link Settings > AI
- [x] `features/home/useHomeStats.ts` â€” stats tá»« Dexie: wordsStudied, docCount, streak (reviewLog), onboarding 5 bÆ°á»›c
- [x] `HomePage.tsx` â€” dashboard: 3 stat cards + 4 quick actions + checklist onboarding (hiá»‡n khi < 5/5)
- [x] Build production thÃ nh cÃ´ng (tsc + vite build sáº¡ch)

#### Notes quan trá»ng Onboarding:
- Empty state chá»‰ render khi `useLiveQuery` tráº£ vá» máº£ng rá»—ng (khÃ´ng flash loading)
- Streak tÃ­nh tá»« `reviewLog` â€” ngÃ y liÃªn tiáº¿p cÃ³ Ã´n táº­p SRS
- Onboarding 5 bÆ°á»›c: táº¡o deck â†’ 10 tá»« â†’ SRS review â†’ writing doc â†’ API key
- Writing empty state áº©n DocListPanel; Vocabulary empty state áº©n DeckPanel/CardPanel
- Táº¥t cáº£ UI dÃ¹ng CSS variables (`--bg-card`, `--color-primary`...)

### Writing UI â€” Giaodien redesign + import áº£nh (session 2026-06-30)
- [x] `writingStudy.css` â€” layout Focus & Precision, theme-aware (light/mid/dark)
- [x] `WritingEditor.tsx` â€” 2 cá»™t: Ä‘á» bÃ i (trÃ¡i) + editor (pháº£i), timer, action bar, AI feedback drawer
- [x] `WritingTopicPanel.tsx` â€” badge, áº£nh Ä‘á», prompt glass box, hÆ°á»›ng dáº«n
- [x] Import JPG/WEBP â€” `writingImage.ts` (nÃ©n, validate), modal táº¡o bÃ i + panel Ä‘á»
- [x] Dexie v5 `promptImage` + sync `prompt_image` + migration `005_writing_prompt_image.sql`

### Writing â€” Cambridge A2â€“C2 track (session 2026-06-30)
- [x] `writingUiConfig.ts` â€” nhÃ£n UI riÃªng Cambridge (kicker, title, placeholder, submit) vs IELTS
- [x] `writingPrompt.ts` â€” `CambridgeScore` 4 tiÃªu chÃ­ (Content, Communicative Achievement, Organisation, Language, 0â€“5); `buildCambridgePrompt` / `buildWritingGradePrompt`
- [x] `ScorePanel.tsx` â€” hiá»ƒn thá»‹ Ä‘iá»ƒm Cambridge (0â€“5 + level) hoáº·c band IELTS tÃ¹y loáº¡i bÃ i
- [x] `WritingCambridgePage` + `WritingLibraryPage` â€” route `/app/writing/cambridge`
- [x] Fix nhÃ£n IELTS trÃªn trang Cambridge: `DocListPanel` auto-chá»n bÃ i Ä‘Ãºng track; `WritingEditor` prop `allowedTypes`
- [x] Fix tsc: `WritingEditor` framework merge; `useWritingDashboard` `getCriterionBand` cho cáº£ 2 framework
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass
- [x] Fix Dashboard thá»‘ng kÃª trá»‘ng: layout `AppShell`/`WritingLayout` + `wd-page` height; empty state cÃ³ UI Ä‘áº§y Ä‘á»§; `parseScore` legacy; errorBank sort in-memory
- [x] Supabase migrations push: `006_cambridge_writing_types.sql` + `007_writing_type_constraint_repair.sql` (fix writing_docs type check + prompt_image); cáº­p nháº­t `friendlySyncError`
- [x] **Cáº¥u trÃºc cÃ¢u** â€” sidebar `/app/sentence-structure`: danh sÃ¡ch + Ä‘iá»n A/B, láº­t tháº», kiá»ƒm tra; seed 6 máº«u; Dexie v7 `sentenceStructures`
- [x] Cambridge hub 3 bÆ°á»›c: `/cambridge` (chá»n A2â€“C2) â†’ `/cambridge/:level` (email/story/â€¦) â†’ `/cambridge/:level/:genre` (editor + tÃ¬m kiáº¿m); field `genre` Dexie v6 + migration `008_writing_genre.sql`
- [x] IELTS hub 3 bÆ°á»›c: `/practice` (Task 1/2/Free) â†’ `/practice/:track` (line graph, opinionâ€¦) â†’ `/practice/:track/:genre` (editor); `ieltsCatalog.ts` + `WritingGenre` má»Ÿ rá»™ng
- [x] **Luyá»‡n dá»‹ch IELTS hub 3 bÆ°á»›c** â€” `/translate` â†’ `/translate/:track` â†’ `/translate/:track/:genre`; `translationCatalog.ts`; Dexie v8 genre + v9 category
- [x] **Translation tracks má»›i:** Cáº¥u trÃºc cÆ¡ báº£n (8 grammar), Collocations & Vocab (15 chá»§ Ä‘á»), Dá»‹ch Ä‘oáº¡n Band 6.5 (15), Band 8.0 (10), Essay hoÃ n chá»‰nh (15), Cá»§a tÃ´i

### Translation â€” label ÄÃ£ dá»‹ch / ChÆ°a dá»‹ch + báº¥m cÃ¢u Ä‘á»ƒ dá»‹ch (session 2026-06-30)
- [x] `TranslationSentence.srsState.translatedAt` â€” Ä‘Ã¡nh dáº¥u khi user báº¥m Kiá»ƒm tra trong `PracticeSession`
- [x] `translationRepo.markTranslated()` + `isSentenceTranslated()` helper
- [x] `SentenceRow` â€” badge cáº¡nh Dá»…/TB/KhÃ³: **ÄÃ£ dá»‹ch** (primary) / **ChÆ°a dá»‹ch** (muted)
- [x] `applyPracticeRating` giá»¯ `translatedAt` khi rate SRS
- [x] Báº¥m báº¥t ká»³ cÃ¢u nÃ o trong danh sÃ¡ch â†’ `startPracticeSentence(id)` má»Ÿ luyá»‡n dá»‹ch 1 cÃ¢u
- [x] NÃºt **Luyá»‡n táº­p** váº«n cháº¡y phiÃªn Ä‘áº§y Ä‘á»§ (Æ°u tiÃªn cÃ¢u cáº§n Ã´n)
- [x] **Practice UI redesign** (`translationPractice.css`) â€” badge VNâ†’English, cÃ¢u VI lá»›n, chip áº©n tá»«
- [x] `translationChips.ts` â€” má»—i tá»« trong Ä‘Ã¡p Ã¡n EN = 1 chip; má»Ÿ theo thá»© tá»± khi gÃµ Ä‘Ãºng tá»« (live, ká»ƒ cáº£ tá»« láº·p)
- [x] Chip khÃ³a hiá»‡n `â—â—â—` / `N tá»«`; má»Ÿ xanh + nÃºt nghe TTS; **Hiá»‡n táº¥t cáº£** / **áº¨n gá»£i Ã½**
- [x] Smart Segment panel sau kiá»ƒm tra; Enter Ä‘á»ƒ ná»™p; Cháº¥m AI riÃªng (placeholder)
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Session 2026-06-30 â†’ 2026-07-01 â€” Listening Ã” CHá»® + pháº£n há»“i Ã¢m thanh/phÃ¡o hoa

#### Listening Ã” CHá»® â€” fix máº¥t chá»¯ khi gÃµ
- [x] `BlankInputMode.tsx` â€” input DOM thuáº§n (port P15.8.302), `forwardRef` + `collectAnswer()` Ä‘á»c DOM
- [x] `ListeningAudioBar.tsx` â€” tÃ¡ch progress TTS, trÃ¡nh re-render 60fps lÃ m máº¥t kÃ½ tá»±
- [x] `practiceUtils.collectBlankAnswer` (boxes) â€” `join(' ')` trá»±c tiáº¿p, bá» placeholder `â€¦`
- [x] `globals.css` â€” width px Ä‘á»™ng; `readOnly` khi khÃ³a (khÃ´ng `disabled`)
- [x] WordDiff live: 1 panel trong `BlankInputMode` khi báº­t "Hiá»‡n káº¿t quáº£ ngay"

#### Listening â€” celebrate khi Ä‘Ãºng 100%
- [x] `lib/studyFeedback.ts` + `components/StudyFireworks.tsx` (tÃ¡ch dÃ¹ng chung)
- [x] `ListeningPracticeTab` â€” Kiá»ƒm tra â†’ 100% â†’ chime + phÃ¡o hoa

#### Vocab â€” Ã¢m thanh Ä‘Ãºng/sai
- [x] `useStudyAnswerFeedback.ts` â€” hook Quiz / Type / Nghe & GÃµ
- [x] ÄÃºng â†’ chime + phÃ¡o hoa; Sai / Bá» qua / KhÃ´ng biáº¿t â†’ buzz
- [x] SRS **khÃ´ng** cÃ³ (cháº¿ Ä‘á»™ rating 1â€“4, khÃ´ng Ä‘Ãºng/sai nhá»‹ phÃ¢n)

#### SRS â€” Space phÃ¡t audio
- [x] `SrsMode.doFlip` â€” má»—i láº§n Space/láº­t tháº» Ä‘á»u `speakPhrase(card.phrase)` (trÆ°á»›c chá»‰ phÃ¡t khi quay vá» máº·t trÆ°á»›c)

#### Deploy
- [x] Nhiá»u láº§n `pnpm deploy:prod` â€” production OK **https://ryanenglishv2.vercel.app**
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Key files session nÃ y
| File | Vai trÃ² |
|------|---------|
| `features/listening/BlankInputMode.tsx` | Input DOM thuáº§n, `collectAnswer()` |
| `features/listening/ListeningAudioBar.tsx` | TÃ¡ch progress TTS, trÃ¡nh re-render input |
| `features/listening/ListeningPracticeTab.tsx` | Practice + celebrate 100% |
| `features/listening/practiceUtils.ts` | `collectBlankAnswer`, word diff |
| `lib/studyFeedback.ts` | Chime, buzz, fireworks dÃ¹ng chung |
| `components/StudyFireworks.tsx` | Canvas phÃ¡o hoa ~2.8s |
| `features/vocab/study/useStudyAnswerFeedback.ts` | Hook pháº£n há»“i Quiz/Type/Nghe&GÃµ |
| `features/vocab/modes/SrsMode.tsx` | Space â†’ phÃ¡t audio má»—i láº§n láº­t |

#### Reference (Electron cÅ©)
- `D:\App-English-Ryan\ProjectGitHub\App English_P15.8.302\assets\chunks\ryan-v24-13-script-172-listening-dictation-core.js` â€” `.ry-lsn-blank` DOM, `collectBlankAnswer()` join values

#### Cáº§n test láº¡i (user chÆ°a confirm 100%)
- [ ] Listening Ã” CHá»® trÃªn **mobile iOS** â€” hard refresh production, test gÃµ "do" vÃ  cÃ¢u dÃ i
- [ ] Ã‚m thanh Web Audio trÃªn iOS sau tÆ°Æ¡ng tÃ¡c Ä‘áº§u tiÃªn (autoplay policy)

### Luyá»‡n thi Reading â€” IELTS UI (session 2026-07-01)
- [x] `examData.ts` â€” 3 parts (kÄkÄpÅ / elms / sleep), TFNG + matching paragraph + matching features + MC
- [x] `readingTest.css` â€” split-pane IELTS shell (passage trÃ¡i, cÃ¢u há»i pháº£i, footer Part pills)
- [x] `ReadingTest.tsx` â€” header timer + Submit, bottom nav, lÆ°u draft localStorage
- [x] `ReadingQuestionPanel.tsx` â€” TRUE/FALSE/NOT GIVEN, matching Aâ€“G, features Aâ€“C
- [x] `ExamResult.tsx` + `ExamHome.tsx` â€” cáº­p nháº­t theo schema má»›i
- [x] Route: `/app/exam/reading/ielts-reading-01`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Session 2026-07-01 â€” Listening fix thanh cuá»™n thá»«a

- [x] `globals.css` â€” `.listening-lesson-shell` + `.listening-lesson-scroll` (overflow-x hidden, scrollbar áº©n)
- [x] `ListeningLessonPage` â€” bá» debug MutationObserver/inline style; shell 2 lá»›p (hidden + scroll)
- [x] `ListeningTabs` â€” `overflow-hidden` + `flex-wrap` (khÃ´ng cÃ²n `overflow-x-auto`)
- [x] `ListeningPracticeTab` â€” `min-w-0 overflow-hidden` card + textarea
- [x] `ListeningLibraryPage` â€” dÃ¹ng chung scroll shell
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Luyá»‡n thi â€” chá»‰ Reading + Listening (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] IELTS + Cambridge track: bá» Writing khá»i hub (Writing á»Ÿ module Viáº¿t); bá» nÃºt Full Mock IELTS trÃªn `ExamTrackPage`
- [x] Cambridge: Reading thay Writing; import PDF gáº¯n `cambridgeLevel`

### IELTS â€” Ä‘á» máº«u Listening 4Ã—10 (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `ieltsExamFormats.ts` â€” metadata 4 parts Â· 40 cÃ¢u Â· ~30 phÃºt Â· Academic & GT Â· gÃµ khi nghe
- [x] `ielts-listening-sample-01` â€” Part1 form (10 gap) Â· Part2 monologue (5 MC+5 matching) Â· Part3 academic (6 gap+4 MC) Â· Part4 lecture (6 gap+4 MC)
- [x] Hiá»‡n trÃªn `/app/exam/track/ielts`; `bandHint` hiá»ƒn thá»‹ cáº¥u trÃºc Ä‘á»

### Cambridge â€” Ä‘á» máº«u theo format thi tháº­t A2â€“C2 (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `cambridgeExamFormats.ts` â€” metadata parts/cÃ¢u/phÃºt/% theo KET/PET/FCE/CAE/CPE
- [x] `cambridgeSampleBuilders.ts` â€” helpers táº¡o Part + cÃ¢u há»i
- [x] `cambridgeReadingSamples.ts` â€” Reading Ä‘Ãºng sá»‘ Part (A2:5, B1:6, B2:7, C1:8, C2:7); bandHint `Sample X/Y cÃ¢u`
- [x] `cambridgeListeningSamples.ts` â€” Listening Ä‘Ãºng sá»‘ Part (A2:5Ã—25, B1:4Ã—25, B2â€“C2:4Ã—30 cÃ¢u)
- [x] `cambridgeExamLevels.ts` â€” mÃ´ táº£ format thi trÃªn hub; ExamTrackPage hiá»‡n `bandHint`

### Cambridge A2â€“C2 â€” Luyá»‡n thi (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `cambridgeExamLevels.ts` â€” 5 cáº¥p A2 (KET) â†’ C2 (CPE), skills Reading + Listening (Writing á»Ÿ module Viáº¿t)
- [x] `examTracks.ts` â€” hub 2 track: IELTS + Cambridge A2â€“C2 (bá» KET riÃªng, redirect `/track/ket` â†’ `/track/cambridge/a2`)
- [x] `ExamTrackPage` â€” `/app/exam/track/cambridge` chá»n level; `/cambridge/:level` Ä‘á» + import + link Writing
- [x] `ListeningExamType` má»Ÿ rá»™ng: `pet` | `fce` | `cae` | `cpe` (B1â€“C2 dÃ¹ng UI multi-part nhÆ° IELTS)
- [x] `ImportListeningModal` â€” template JSON theo `defaultExamType` tá»«ng level
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Listening Phase 3 â€” hub + ZIP + Full Mock (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `examTracks.ts` + `ExamHome` hub 2 track (IELTS / Cambridge A2â€“C2)
- [x] `ExamTrackPage` â€” `/app/exam/track/:trackId/:level?`, Full Mock + import + danh sÃ¡ch Ä‘á»
- [x] `importListeningZip.ts` + `fflate` â€” import ZIP bundle (exam.json + MP3/áº£nh)
- [x] `fullMockData` + `fullMockSession` â€” Full Test IELTS `ielts-mock-01`
- [x] `FullMockIntro` â†’ Reading â†’ Listening â†’ `WritingMockTest` â†’ `FullMockSummary`
- [x] Reading/Listening ná»™p trong Full Mock hiá»‡n `FullMockStageResult` + chuyá»ƒn ká»¹ nÄƒng
- [x] `WritingMockTest` â€” Task 1 + Task 2 (Ä‘áº¿m tá»«, timer, chÆ°a cháº¥m AI)
- [x] Routes: `/app/exam/full/:mockId`, `/summary`, `/writing/:mockId`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Listening Phase 2 â€” import + IELTS + Dexie (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] Dexie v11 `listeningExams` + `listeningExamRepo`
- [x] `ImportListeningModal` â€” JSON + MP3/áº£nh (q1.mp3, q1-a.jpg, part1.mp3), template táº£i vá»
- [x] `importListeningUtils.ts` â€” parse, validate, lÆ°u blob `audioRepo`
- [x] `ListeningIeltsTest` â€” audio sticky theo Part, gap-fill/MC/matching, giá»›i háº¡n lÆ°á»£t nghe (exam mode)
- [x] `ListeningKetTest` â€” tÃ¡ch tá»« shell Phase 1, há»— trá»£ `examMode`
- [x] Äá» builtin `ielts-listening-sample-01` (Part 1â€“2)
- [x] Backup v3 gá»“m `listeningExams`
- [x] `ExamHome` â€” Import Listening + xÃ³a Ä‘á» import
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Listening KET Phase 1 â€” card UI (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `listeningExamData.ts` â€” schema + Ä‘á» máº«u `ket-listening-sample-01` (6 cÃ¢u, `audioKey`/`audioUrl`/`imageUrl` optional)
- [x] `useExamQuestionAudio.ts` â€” MP3 tá»« `audioRepo` hoáº·c URL, fallback TTS `ttsText`
- [x] `ListeningQuestionCard` + `ListeningExamAudioBar` â€” PhÃ¡t / PhÃ¡t cháº­m, picture MC placeholder
- [x] `ListeningTest.tsx` â€” header timer, ChÆ°a cháº¯c cháº¯n, Submit/Next, dots nav, draft localStorage
- [x] `ListeningExamResult.tsx` â€” cháº¥m Ä‘iá»ƒm + giáº£i thÃ­ch
- [x] Route `/app/exam/listening/:examId` + `ExamHome` section Listening
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Reading â€” Highlight passage khi lÃ m bÃ i (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `readingHighlightUtils.ts` â€” offset-based highlights theo `blockId`, merge/trá»« range, parse Selection
- [x] `ReadingHighlightableText.tsx` â€” render `<mark>` cho tá»«ng khá»‘i text
- [x] `ReadingHighlightToolbar.tsx` â€” toolbar chung Highlight / Bá» highlight / Copy (passage + cÃ¢u há»i)
- [x] `ReadingPassagePanel.tsx` + `ReadingQuestionPanel.tsx` â€” highlight passage vÃ  panel cÃ¢u há»i/Ä‘Ã¡p Ã¡n
- [x] `ReadingTest.tsx` â€” `highlightsByPart` chá»‰ trong session (khÃ´ng lÆ°u localStorage); máº¥t khi thoÃ¡t/F5
- [x] `readingTest.css` â€” `.reading-test-highlight` theme-aware; `user-select: text` passage + questions
- [x] `TextSelectionToolbar` â€” bá» qua `[data-reading-highlight-zone]` (trÃ¡nh toolbar trÃ¹ng)
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Import PDF Reading â€” Sprint 1â€“3 (session 2026-07-01) â€” HOÃ€N THÃ€NH

**Sprint 1 â€” Tin cáº­y**
- [x] Backup v2 â€” `readingExams` trong `backupRestore.ts` (import v1+v2)
- [x] `answerConfidence: 'key' | 'inferred'` â€” badge "ÄoÃ¡n" preview + ExamResult
- [x] `parseReadingPdfFull()` â€” thá»­ full trÆ°á»›c, fallback parse tá»«ng part + progress UI
- [x] `readingPdfValidate.ts` â€” score tin cáº­y %, warnings trÆ°á»›c khi lÆ°u

**Sprint 2 â€” Äá»™ phá»§ IELTS**
- [x] Dáº¡ng cÃ¢u má»›i: `gap-fill`, `summary-completion`, `sentence-completion`
- [x] `ReadingQuestionPanel` â€” input ONE WORD + word bank pills
- [x] `isReadingAnswerCorrect()` â€” cháº¥m gap-fill fuzzy

**Sprint 3 â€” Scan PDF + performance**
- [x] Hybrid `pdfContent.ts` â€” text layer trÆ°á»›c, Vision OCR (OpenAI/Gemini) náº¿u scan
- [x] `pdfVision.ts` â€” render trang â†’ batch Vision OCR
- [x] Lazy-load `ImportReadingPdfModal` + dynamic `pdfjs-dist` â€” ExamHome ~7KB (tÃ¡ch chunk pdf ~477KB)

#### Flow Import PDF Reading
1. Luyá»‡n thi â†’ **Import PDF Reading**
2. Upload PDF (â‰¤12MB) â€” text layer hoáº·c scan (Vision OCR tá»± Ä‘á»™ng)
3. API key CÃ i Ä‘áº·t â†’ AI (OpenAI/Gemini khuyáº¿n nghá»‹ full test + scan)
4. Parse Part 1â€“3 â†’ score tin cáº­y + preview (lá»c cÃ¢u Ä‘Ã¡p Ã¡n Ä‘oÃ¡n) â†’ **LÆ°u & lÃ m bÃ i**
5. Backup v2 gá»“m `readingExams`

#### Giá»›i háº¡n cÃ²n láº¡i
- Vision OCR tá»‘n token/cháº­m (~20 trang max); cháº¥t lÆ°á»£ng phá»¥ thuá»™c áº£nh scan
- Groq khÃ´ng Vision â€” scan cáº§n Ä‘á»•i OpenAI/Gemini
- ChÆ°a sync `readingExams` lÃªn Supabase cloud
- ChÆ°a cÃ³ UI sá»­a Ä‘á» import sau khi lÆ°u

### Import PDF Reading â€” KET A2 parser (session 2026-07-01)
- [x] `readingPdfKetPrompt.ts` â€” prompt 5 parts KET, `splitPdfTextForKetParts()`, parse full + fallback tá»«ng part
- [x] `parseReadingPdfFull(..., { format: 'ket-a2' })` â€” tá»± chá»n parser KET khi import tá»« Cambridge A2
- [x] `validateReadingImport(parts, 'ket-a2')` â€” validation 5 parts (Q1â€“6, 7â€“13, 14â€“18, 19â€“24, 25â€“30)
- [x] `ImportReadingPdfModal` â€” UI 5 parts khi `cambridgeLevel === 'a2'`
- [x] `ParsedReadingPart.partNumber` â†’ `number` (há»— trá»£ part 4â€“5)

### Fix KET split â€” cáº¯t nháº§m Part 5 (session 2026-07-01)
- [x] `splitPdfTextForKetParts` â€” bá» regex `writing\s+part` (khá»›p nháº§m footer "Reading and Writing PART 5" â†’ máº¥t Part 5)
- [x] Chá»‰ cáº¯t PDF khi cÃ³ Writing Part 6+ (`part 7`â€¦)

### Import PDF Reading â€” PET B1 parser (session 2026-07-01)
- [x] `readingPdfPetPrompt.ts` â€” prompt 6 parts PET, `splitPdfTextForPetParts()`, parse full + fallback tá»«ng part
- [x] `parseReadingPdfFull(..., { format: 'pet-b1' })` â€” tá»± chá»n khi import tá»« Cambridge B1
- [x] `validateReadingImport(parts, 'pet-b1')` â€” validation 6 parts Â· 32 cÃ¢u (Q1â€“5, 6â€“10, 11â€“15, 16â€“20, 21â€“26, 27â€“32)
- [x] `readingPdfFormatForLevel()` / `expectedReadingPartsForLevel()` â€” map a2â†’ket, b1â†’pet

### Gá»¡ Import PDF/OCR Reading (session 2026-07-01)
- [x] Bá» nÃºt **Import PDF Reading** khá»i `ExamTrackPage` â€” chá»‰ cÃ²n **Import thá»§ cÃ´ng**
- [x] JSON máº«u KET A2: 5 parts Â· 30 cÃ¢u + hÆ°á»›ng dáº«n trong modal
- [x] HÆ°á»›ng dáº«n import trong modal Reading + Listening

### Import PDF OCR â€” giá»¯ áº£nh trang/passage (session 2026-07-01) â€” ÄÃƒ Gá»  KHá»ŽI UI
- [x] `pdfContent.ts` â€” `ExtractPdfResult.pages[]` (text + `dataUrl`); `preservePageImages` cho KET/PET
- [x] `pdfVision.ts` â€” OCR **tá»«ng trang** (detail high), giá»¯ áº£nh gá»‘c â€” khÃ´ng cÃ²n plain-text-only batch
- [x] `pdfExtract.ts` â€” `extractTextFromPdfPerPage()`
- [x] `readingPdfPageImages.ts` â€” detect partâ†’pages (KET/PET markers), lÆ°u blob `reading-exam:{id}:page-N`, gáº¯n `imageKey` passage fallback
- [x] `ImportReadingPdfModal` â€” lÆ°u áº£nh khi save; KET Part 1 luÃ´n gáº¯n áº£nh trang khi cÃ³
- [x] `ReadingPassagePanel` â€” KET Part 1 hiá»‡n áº£nh passage trÆ°á»›c signs
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### HÃ nh vi má»›i
- PDF scan KET A2: Vision OCR tá»«ng trang â†’ AI parse cÃ¢u há»i â†’ áº£nh trang gáº¯n vÃ o passage khi text yáº¿u
- Part 1 KET: Æ°u tiÃªn áº£nh trang (signs) dÃ¹ passage text cÃ³ hay khÃ´ng
- Part 2â€“5: fallback `passage: [{ imageKey }]` khi passage < 80 kÃ½ tá»±

### Import thá»§ cÃ´ng Reading + Listening (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `importReadingManualUtils.ts` â€” parse/validate JSON Ä‘á» Reading, lÆ°u áº£nh Ä‘oáº¡n vÄƒn vÃ o `audioRepo`
- [x] `importReadingZip.ts` â€” ZIP bundle (exam.json + áº£nh)
- [x] `ImportReadingManualModal.tsx` â€” upload JSON/ZIP + áº£nh, preview, lÆ°u Dexie (`source: manual`)
- [x] `ReadingPassageBlock.imageKey` + `ReadingPassagePanel` hiá»ƒn thá»‹ áº£nh Ä‘oáº¡n vÄƒn
- [x] `ExamTrackPage` â€” nÃºt **Import thá»§ cÃ´ng Reading** (JSON + áº£nh) + **Import thá»§ cÃ´ng Listening** (Ä‘Ã£ cÃ³ JSON/ZIP)
- [x] XÃ³a Ä‘á» import: `reading-pdf-*` + `reading-manual-*`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

#### Flow Import thá»§ cÃ´ng Reading
1. Luyá»‡n thi â†’ track IELTS/Cambridge â†’ **Import thá»§ cÃ´ng Reading**
2. Táº£i JSON máº«u â†’ Ä‘iá»n passage (text + `imageFile`) + questionGroups
3. Upload áº£nh (`part1-p1.jpg`â€¦) hoáº·c ZIP bundle
4. Preview â†’ **LÆ°u & lÃ m bÃ i** â€” áº£nh hiá»ƒn thá»‹ trong panel passage trÃ¡i

#### Import Reading Cambridge A2â€“C2 â€” template + prompt chuáº©n (session 2026-07-01)
- [x] `cambridgeReadingImportTemplates.ts` â€” LEVEL_PARTS Ä‘á»§ A2â€“C2; A2 Part 4 = MC chá»n tá»« (khÃ´ng gap-fill)
- [x] JSON máº«u táº£i trong modal theo level â€” Ä‘á»§ sá»‘ cÃ¢u má»—i part (khÃ´ng chá»‰ 2 cÃ¢u máº«u)
- [x] `cambridgeImportGuideLines()` â€” báº£ng parts trong modal Import Reading
- [x] `validateReadingManualImport` â€” cáº£nh bÃ¡o A2 Part 4 sai type
- [x] `HDSD/Prompt-Reading-Cambridge.txt` â€” prompt AI cho A2â€“C2
- [x] `HDSD/Prompt.txt` + `HDSD/Import De Thi.txt` â€” cáº­p nháº­t Part 4 KET = MC

#### Bundle KET A2 Reading Test 1 (Claude â†’ ZIP) â€” Cáº¦N Sá»¬A PART 4
- [x] Claude tráº£ folder `C:\Users\ADMIN\Downloads\ket-reading-test1` â€” 5 parts Â· 30 cÃ¢u Â· 6 áº£nh Part 1
- [x] `exam.json` Ä‘Ã£ chuáº©n schema (`passageTitle`, `type`, `passage[].text` Part 2â€“5)
- [x] ZIP: `C:\Users\ADMIN\Downloads\ket-reading-test1.zip` (~348 KB)
- [x] Copy vÃ o repo: `Tainguyen/ket-reading-test1/` + `Tainguyen/ket-reading-test1.zip`
- [ ] User import trÃªn app â†’ xÃ¡c nháº­n Part 1 áº£nh + Part 2â€“5 highlight

#### Fix PET B1 Reading Test 1 â€” láº·p cá»™t + Ä‘Ã¡p Ã¡n (session 2026-07-01)
- [x] `ReadingPassagePanel` â€” B1 Part 2/4: áº©n block `Danh sÃ¡ch Aâ€“H` cá»™t trÃ¡i (passage Ä‘Ã£ cÃ³ Ä‘á»§ ná»™i dung)
- [x] `ReadingQuestionPanel` â€” B1 matching: áº©n `List of features/sentences` cá»™t pháº£i (chá»‰ cÃ¢u há»i + pills Aâ€“H)
- [x] `scripts/build-pet-b1-test1.py` â€” Part 2: passage `label` Aâ€“H + `features[]` tÃªn ngáº¯n; Part 4: cÃ¢u Aâ€“H trong passage + `features[]` chá»‰ text cÃ¢u (khÃ´ng prefix chá»¯ cÃ¡i)
- [x] Regenerate `Tainguyen/pet-reading-test1.zip` + `exam.json` (6 parts Â· 32 cÃ¢u)
- [x] `cambridgeReadingImportTemplates.ts` â€” B1 Part 2/4: máº«u features ngáº¯n (full text â†’ passage[])
- [ ] User **xÃ³a Ä‘á» cÅ©** + import láº¡i `pet-reading-test1.zip` â†’ xÃ¡c nháº­n Part 2/4 khÃ´ng láº·p (a8/a9)

#### Flow Import thá»§ cÃ´ng Listening (Ä‘Ã£ cÃ³)
1. **Import thá»§ cÃ´ng Listening** â†’ JSON/ZIP + MP3/áº£nh cÃ¢u há»i
2. TÃªn file: `q1.mp3`, `q1-a.jpg`, `part1.mp3`â€¦

### Fix Import PDF káº¹t / timeout "Äá»c PDF quÃ¡ lÃ¢u" (session 2026-07-01)
- [x] `pdfExtract.ts` â€” worker cá»‘ Ä‘á»‹nh `/pdf.worker.min.mjs`; khÃ´ng `await task.destroy()` (fire-and-forget 2s â€” trÃ¡nh treo 45s)
- [x] Timeout theo bÆ°á»›c: má»Ÿ PDF 30s, má»—i trang 20s, tá»•ng 120s; `useWorkerFetch: false`
- [x] `vite.config.ts` â€” plugin copy `pdf.worker.min.mjs` â†’ `public/`; `optimizeDeps.exclude: pdfjs-dist`
- [x] Tiáº¿n trÃ¬nh: táº£i pdf.js â†’ má»Ÿ file â†’ trang X/Y; `preloadPdfJs()` khi má»Ÿ modal
- [x] `ImportReadingPdfModal` â€” nÃºt **PhÃ¢n tÃ­ch**; label AI sau extract
- [x] `pnpm --filter web build` â€” pass

---

### Mindmap â€” connector polish (session 2026-06-30)
- [x] `connectors.ts` â€” anchor theo layout: Tree/Fishbone (trÃ¡iâ†”pháº£i), Treeâ†“ (trÃªnâ†”dÆ°á»›i), Round (bezier theo hÆ°á»›ng ra/vÃ o)
- [x] Tree/Fishbone/Treeâ†“ dÃ¹ng Ä‘Æ°á»ng elbow (khÃ´ng cáº¯t ngang qua pill)
- [x] TÄƒng `EDGE_PAD`/`LINE_GAP`, `strokeLinecap: butt` â€” trÃ¡nh nÃ©t trÃ²n xuyÃªn vÃ o chá»¯
- [x] Node pill: ná»n Ä‘áº·c hÆ¡n + `overflow-hidden` + `isolation`

---

## Modules chÆ°a build / cÃ²n láº¡i

1. ~~**Vocabulary**~~ âœ… DONE
2. ~~**Listening**~~ âœ… DONE
3. ~~**Writing**~~ âœ… DONE
4. ~~**MindMap**~~ âœ… DONE
5. ~~**Dictionary**~~ âœ… DONE
6. ~~**Settings**~~ âœ… DONE
7. ~~**Translation Practice**~~ âœ… DONE
8. ~~**Supabase Cloud Sync**~~ âœ… DONE (cáº§n cháº¡y migration 003 trÃªn Supabase)
9. **License/Plan** â€” Edge Function notify-payment âœ… code xong; deploy + migration 004
10. **(Optional)** PanelHeader cho right panel detail headers

---

## Credentials (KHÃ”NG commit)

- Supabase URL: `https://ntcagvtkwxwsmlxlumfo.supabase.co`
- Anon key: trong `apps/web/.env.local`
- Google OAuth Client ID: `889427125348-ald12qq5haovti1l724h55phnrcon3p4.apps.googleusercontent.com`

---

## Deploy

- **Production URL:** https://ryanenglishv2.vercel.app
- **User yÃªu cáº§u auto deploy** sau má»—i láº§n code xong â€” agent cháº¡y `pnpm deploy:prod` khi hoÃ n thÃ nh tÃ­nh nÄƒng

### Quy trÃ¬nh deploy (cÃ³ `supabase db push`)

Migrations cháº¡y **má»™t láº§n cho cáº£ há»‡ thá»‘ng** â€” khÃ´ng per-user.

```bash
# Láº§n Ä‘áº§u: copy .env.deploy.example â†’ .env.deploy, Ä‘iá»n:
#   SUPABASE_ACCESS_TOKEN  (dashboard/account/tokens)
#   SUPABASE_DB_PASSWORD   (Project Settings â†’ Database)

pnpm db:push          # push supabase/migrations/*.sql lÃªn remote
pnpm db:push:dry      # xem trÆ°á»›c migrations sáº½ apply (khÃ´ng ghi DB)
pnpm deploy:prod      # db:push â†’ build â†’ vercel deploy --prod
```

- Script: `scripts/db-push.mjs` â€” project ref `ntcagvtkwxwsmlxlumfo`
- CI (tuá»³ chá»n): `.github/workflows/deploy.yml` â€” cáº§n secrets GitHub
- Edge Function (riÃªng): `npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo`

---

### Import thá»§ cÃ´ng Listening KET A2 Test 1 (session 2026-07-01) â€” HOÃ€N THÃ€NH
- [x] `ListeningQuestionCard.tsx` â€” gap-fill input + matching pills Aâ€“H; part instruction + part audio fallback
- [x] `ListeningKetTest.tsx` â€” truyá»n `partInstruction` + `partAudioSource` cho card
- [x] `importListeningUtils.ts` â€” dedupe MP3/áº£nh trÃ¹ng tÃªn (1 file `listening.mp3` cho 5 parts)
- [x] `scripts/build-ket-a2-listening-test1.py` â€” 5 parts Â· 25 cÃ¢u + copy `listening.mp3`
- [x] Bundle: `Tainguyen/ket-listening-test1.zip` (~12 MB) + OneDrive `ket-listening-test1.zip`
- [x] `HDSD/Prompt-KET-A2-Listening.txt` + cáº­p nháº­t `Import De Thi.txt`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass
- [ ] User import ZIP â†’ xÃ¡c nháº­n Part 2 gap-fill + Part 5 matching + audio phÃ¡t OK
- [ ] (Tuá»³ chá»n) Extract áº£nh Part 1 tá»« PDF â†’ `q1-a.jpg` â€¦ `q5-c.jpg`

#### Flow Import Listening KET A2
1. Luyá»‡n thi â†’ Cambridge â†’ A2 â†’ **Import thá»§ cÃ´ng Listening**
2. Upload `ket-listening-test1.zip` (exam.json + listening.mp3)
3. Preview â†’ LÆ°u & lÃ m bÃ i â€” UI KET 1 cÃ¢u/mÃ n, há»— trá»£ picture-mc / gap-fill / MC / matching

---

### Global Catalog â€” hÆ°á»›ng 3 (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `packages/catalog/` â€” manifest `GLOBAL_CATALOG_VERSION`, builtin exams, `syncGlobalCatalog()`
- [x] `scripts/build-catalog.mjs` â€” Tainguyen â†’ `public/catalog/` + `packages/catalog/data/`
- [x] Builtin Ä‘á»: KET/PET/FCE Reading + KET Listening (ID `catalog-*`) â€” má»i user sau deploy
- [x] `GlobalCatalogSync` trong `AppShell` â€” upsert Cáº¥u trÃºc cÃ¢u catalog (ID cá»‘ Ä‘á»‹nh `catalog:ss:*`)
- [x] `pnpm build:catalog` cháº¡y trÆ°á»›c `pnpm build`; web `v0.2.0`
- [x] `packages/catalog/README.md` â€” quy trÃ¬nh admin cáº­p nháº­t + deploy
- [ ] TODO sau: vocab decks/cards, writing prompts, translation, listening lessons â†’ `syncGlobalCatalog`

#### Admin cáº­p nháº­t ná»™i dung cho má»i user (khÃ´ng import tay)
1. Sá»­a `Tainguyen/.../exam.json` (+ media) hoáº·c seed trong `packages/catalog/src/seeds/`
2. `pnpm build:catalog` (Ä‘á» thi) + bump `GLOBAL_CATALOG_VERSION` (Dexie seeds)
3. `pnpm deploy:prod`

---

### Listening picture-mc â€” áº£nh composite A2â€“C2 (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] Part 1 `picture-mc`: **1 áº£nh/cÃ¢u** (`q1.jpg` chá»©a A+B+C) thay vÃ¬ 3 file riÃªng
- [x] `ListeningPictureBoard` + `ListeningPictureChoiceRow` â€” tranh trÃ¡i, nÃºt A/B/C pháº£i
- [x] Import + `build-catalog` + legacy `q1-a.jpg` váº«n há»— trá»£
- [x] `exam.json` KET + HDSD cáº­p nháº­t

### KET Listening â€” Part 2 gap-fill + Part 5 drag-drop (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `ListeningKetGapFillPartView` â€” Part 2 (cÃ¢u 6â€“10): Ä‘á» + audio trÃ¡i, táº¥t cáº£ Ã´ Ä‘iá»n chá»— trá»‘ng gá»™p cá»™t pháº£i
- [x] `ListeningKetMatchingPartView` â€” Part 5 (cÃ¢u 21â€“25): tÃªn + Ã´ vuÃ´ng kÃ©o tháº£ trÃ¡i (theo `Giaodien/a1.jpg`), bank Aâ€“H pháº£i
- [x] KÃ©o tháº£ hoáº·c chá»n Ä‘Ã¡p Ã¡n â†’ báº¥m Ã´; má»—i chá»¯ cÃ¡i dÃ¹ng má»™t láº§n; nÃºt Ã— xÃ³a Ã´
- [x] `listeningKetPartLayout.ts` â€” detect part gap-fill / matching

### Listening Luyá»‡n thi â€” audio khÃ´ng dá»«ng khi Ä‘á»•i Part (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `ListeningKetTest` / `ListeningIeltsTest` â€” bá» `stopPlayback()` khi `partIndex` Ä‘á»•i (KET + IELTS + Cambridge PET/FCE/CAE/CPE)
- [x] `ListeningQuestionCard` â€” bá» dá»«ng audio khi Ä‘á»•i cÃ¢u
- [x] KET timer cá»‘ Ä‘á»‹nh **25 phÃºt** (`KET_LISTENING_DURATION_MINUTES`)

### Listening KET â€” fix audio khÃ´ng phÃ¡t (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `useExamQuestionAudio` â€” thá»­ láº§n lÆ°á»£t blob Dexie â†’ `audioUrl` catalog; blob rá»—ng/há»ng khÃ´ng cháº·n fallback
- [x] `listeningExamCatalogMerge` â€” luÃ´n bá»• sung `audioUrl` tá»« builtin khi import thiáº¿u
- [x] `listeningExamLoader` â€” má»i Ä‘á» `source: import` Ä‘á»u merge media catalog (match title/examType)
- [x] `playHtmlAudio` â€” `preload` + `canplay`; log URL khi lá»—i
- [x] Verify local: `GET /catalog/listening/ket-a2-test1/listening.mp3` â†’ 200 (~21MB)

### PET B1 Listening â€” UI + bundle + prompt HDSD (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `ListeningPetTest` â€” 4 Part, 25 cÃ¢u, timer **30 phÃºt**, audio liÃªn tá»¥c khi Ä‘á»•i Part
- [x] `ListeningPetMcPartView` â€” Part 2 (context + prompt) & Part 4 (audioIntro + MC)
- [x] `ListeningPetGapFillPartView` â€” Part 3 (`passageTitle` + `gapLead`/`gapTrail`)
- [x] Part 1: **7 cÃ¢u** picture-mc (`q1.jpg` â€¦ `q7.jpg` composite A+B+C)
- [x] `Tainguyen/pet-listening-test1/exam.json` + ZIP (~21 MB) â€” Ä‘Ã¡p Ã¡n Answer Key chÃ­nh thá»©c
- [x] `pnpm pack:listening:pet` â€” Ä‘Ã³ng gÃ³i bundle
- [x] HDSD: `Prompt-PET-B1-Listening.txt`, `Import Listening PET B1.txt`, cáº­p nháº­t `Import De Thi.txt` + `Prompt-PET-B1.txt`
- [x] `Prompt-KET-A2-Listening.txt` â€” `durationMinutes` 25, hÆ°á»›ng dáº«n pack/import

### Luyá»‡n thi â€” LÃ m láº¡i + Quay láº¡i + Reading KET 30 phÃºt (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `FullMockStageResult` + `handleRetry` â€” nÃºt **LÃ m láº¡i** sau submit (Reading/Listening/Writing/Full Mock)
- [x] `ExamHeaderBack` + `examNavigation.ts` â€” nÃºt **Quay láº¡i** khi Ä‘ang lÃ m bÃ i (má»i cháº¿ Ä‘á»™)
- [x] `KET_READING_DURATION_MINUTES = 30` â€” Reading A2 cá»‘ Ä‘á»‹nh 30 phÃºt

### Luyá»‡n thi â€” FCE B2 Listening Test 1 builtin (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `Tainguyen/fce-Listening-test1/exam.json` â€” 4 parts Â· 30 cÃ¢u (Part 1 MC, Part 2 gap-fill Spectacled Bears, Part 3 matching, Part 4 MC)
- [x] Part 2: `passageTitle` + `imageFile: q2.jpg` â†’ `ListeningPartImageHeader` (má»™t áº£nh gáº¥u nhÆ° Giaodien/a7.jpg)
- [x] Catalog builtin `catalog-listening-fce-b2-test1` + `pnpm pack:listening:fce` â†’ ZIP import
- [x] `build-catalog.mjs` + `builtinExams.ts` â€” ship media `listening.mp3` + `q2.jpg`
- [x] FCE Part 3 matching (a9.jpg) â€” `ListeningLetterMatchingPartView`: Aâ€“H bÃªn trÃ¡i, kÃ©o/tháº£ chá»¯ cÃ¡i vÃ o Ã´ Speaker 19â€“23
- [x] HDSD FCE B2 Listening â€” `Prompt-FCE-B2-Listening.txt`, `Import Listening FCE B2.txt`, cáº­p nháº­t `Import De Thi.txt` + `Prompt-FCE-B2.txt`

### Luyá»‡n thi â€” CAE C1 Reading Test 1 builtin (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] Nguá»“n: `Tainguyen/cae-Reading-test1/` (PDF `Test_1_Reading_CAE_C1.pdf` + `answer keys.pdf`) â†’ `scripts/build-cae-reading-test1.py`
- [x] `exam.json` ban Ä‘áº§u â€” 8 parts Â· **56 cÃ¢u** Â· 90 phÃºt (Part 1â€“4 Use of English, Part 5â€“8 Reading)
- [x] **Cáº­p nháº­t 2026-07-06:** â†’ **10 parts Â· 58 má»¥c Â· 120 phÃºt** (P9 Q57 + P10 Q58 Writing) â€” xem má»¥c **CAE C1 Reading & Writing** cuá»‘i file
- [x] Catalog builtin `catalog-reading-cae-c1-test1` + `build-catalog.mjs` + `builtinExams.ts`
- [x] `cambridgeReadingImportTemplates.ts` â€” C1 Part 6: 37â€“40 cross-text, Part 7: 41â€“46 gapped text, Part 8: 47â€“56 multiple matching
- [x] `pnpm pack:reading:cae` â†’ `Tainguyen/cae-Reading-test1.zip` (exam.json only â€” khÃ´ng áº£nh)
- [x] HDSD: `Prompt-CAE-C1-Reading.txt`, `Import Reading CAE C1.txt`, cáº­p nháº­t `Import De Thi.txt`
- [x] UI Reading: áº©n danh sÃ¡ch features trÃ¹ng khi passage Ä‘Ã£ cÃ³ label Aâ€“G (B2/C1 Part 6â€“8); placeholder Part 4 = `3â€“6 words`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Luyá»‡n thi â€” IELTS Listening Cam 9 + Cam 20 Test 1 builtin (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] Nguá»“n: `Tainguyen/IELTS/Listening IELTS_Test1_Cam9|Cam20/` (PDF + Answer Key + MP3)
- [x] `scripts/build-ielts-listening-tests.py` â€” 2Ã— exam.json Â· 40 cÃ¢u Â· 4 parts Â· `listening.mp3`
- [x] **Fix Cam 9 Test 1 ná»™i dung Ä‘Ãºng** (JOB INQUIRY / SPORTS WORLD / Spirosâ€“Hiroko / Whales) â€” trÆ°á»›c Ä‘Ã³ nháº§m Ä‘á» khÃ¡c
- [x] `ListeningIeltsPartView` â€” UI má»™t cá»™t theo `Giaodien/a1â€“a4`: note-completion inline (`gapLead`/`gapTrail`), MC dá»c, Choose TWO
- [x] ZIP import: `pnpm pack:listening:ielts-cam9` â†’ **flat** `exam.json` + `listening.mp3` (khÃ´ng thÆ° má»¥c con/PDF); `importListeningZip` bá» qua PDF
- [x] Catalog: `catalog-listening-ielts-cam9-test1` + `catalog-listening-ielts-cam20-test1`
- [x] `isListeningAnswerCorrect` â€” Ä‘Ã¡p Ã¡n thay tháº¿ `A/E` (Choose TWO) + gap-fill `/` variants
- [x] `pnpm pack:listening:ielts-cam9` / `ielts-cam20` + `pnpm build:ielts-listening`
- [x] HDSD: `Prompt-IELTS-Listening-Cam9-Cam20.txt`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass
- [x] **`notePassage` system** â€” `static` | `section` | `gap` trÃªn `ListeningPart`; render `ListeningIeltsNotePassageBox.tsx` + `listeningNotePassage.ts`; validation import IELTS; catalog merge pass-through
- [x] **Fix Cam 9 static lines** â€” P1 (12 hours, refereesâ€¦), P4 (Several other theories, Cape Cod, Thurstonâ€¦) trong `build-ielts-listening-tests.py`
- [x] **Fix Cam 20 Ä‘Ã¡p Ã¡n thiáº¿u** (`Giaodien/a5â€“a10`): `notePassage` P1/P4 Ä‘áº§y Ä‘á»§ static + `gapLead`/`gapTrail`; Choose TWO P2â€“P3 `choose_two()` nhÃ£n Ä‘áº§y Ä‘á»§ (khÃ´ng cÃ²n "A A"); rebuild catalog + ZIP
- [x] Rebuild: `python scripts/build-ielts-listening-tests.py` â†’ `pnpm build:catalog` â†’ `pnpm pack:listening:ielts-cam9` / `ielts-cam20` â€” `tsc` pass
- [x] **Cam20 P1 table layout** â€” `notePassageLayout: table` + `noteTable` (4 cá»™t nhÆ° Ä‘á» giáº¥y); `ListeningIeltsNoteTable.tsx`; so `Giaodien/a2` giá»‘ng `a1` (báº£ng cÃ³ viá»n, Ã´ trá»‘ng inline)
- [x] **IELTS import templates** â€” modal 5 nÃºt (full / P1 form a3 / table a2 / mixed a4 / mixed a5); `noteTables[]` cho Part 1 báº£ng+Choose TWO+báº£ng; `ieltsListeningImportTemplates.ts`; `HDSD/Import Listening IELTS.txt` + Prompt IELTS; `Tainguyen/templates/ielts-listening-*.json`
- [x] **IELTS Listening Part 2 UI** (`Giaodien/Part2-Listening/a6â€“a14`) â€” segment: gaps / MC / matching / choose-two / diagram / map; `ListeningIeltsSectionHeader`, `ListeningIeltsMatchingBlock`, `ListeningIeltsMapBlock`, `ListeningIeltsDiagramBlock`; `sectionRange`/`sectionInstruction`/`sectionTitle`/`mapLabel`/`diagramLabel`; CSS `listeningTest.css`
- [x] **Part 2 import templates** â€” modal 9 nÃºt (a6â€“a14); `ieltsListeningP2Templates.ts`; `Tainguyen/templates/ielts-listening-p2-a*.json`; export `pnpm export:ielts-p2` (`scripts/export-ielts-p2-templates.ts`, ngoÃ i `tsc` web)
- [x] **Cam9/Cam20 P2 catalog** â€” `build-ielts-listening-tests.py`: gapLead `â€¢`, section meta Cam9 SPORTS WORLD + Cam20 Pottery; rebuild catalog
- [x] **IELTS Listening Part 3 UI** (`Giaodien/Part3-Listening/c1â€“c7`) â€” `notePassageSections[]`, `ListeningIeltsFlowChartBlock` (c6), segment flowchart; templates `ieltsListeningP3Templates.ts`; modal 7 nÃºt; `pnpm export:ielts-p3`; Cam9 P3 section meta + Cam20 P3 Choose TWOÃ—3 + MC section headers
- [x] **HDSD prompt ChatGPT Part 1/2/3** â€” `HDSD/Prompt-IELTS-Listening-Part1.txt`, `Part2.txt`, `Part3.txt` (báº£ng nháº­n dáº¡ng a/c, quy táº¯c JSON, prompt máº«u copy-dÃ¡n, checklist); cáº­p nháº­t `Import Listening IELTS.txt` + `Prompt-IELTS-Listening-Cam9-Cam20.txt`
- [x] **IELTS Listening Part 4** â€” lecture notes d1â€“d3 (Cam9 Whales, Cam20 Rivers, generic); `ieltsListeningP4Templates.ts`; modal 3 nÃºt; `pnpm export:ielts-p4`; `HDSD/Prompt-IELTS-Listening-Part4.txt`
- [x] **HDSD ChatGPT tá»•ng 4 parts** â€” `HDSD/ChatGPT-IELTS-Listening-4-Parts.txt` (workflow A/B, nháº­n dáº¡ng a/c/d, prompt copy-dÃ¡n, ghÃ©p exam.json, checklist); cáº­p nháº­t `Import Listening IELTS.txt` + `Prompt-IELTS-Listening-Cam9-Cam20.txt`
- [x] **Choose TWO A/E** â€” tÃ i liá»‡u `Giaodien/two-choice.jpg`; `ChooseTwoBlock` clickable (chá»n 2 Ä‘Ã¡p Ã¡n trÃªn list Aâ€“E); `isChooseTwoGroup` nháº­n dáº¡ng má»i "Which TWO" / answer slash; Ã¡p dá»¥ng tá»•ng quÃ¡t Part 1â€“3 qua `ListeningIeltsPartView`
- [x] **IELTS bundle pipeline (pilot Cam9 Test 2)** â€” `meta.json` + `exam_partN.json`; `pnpm ielts:merge|validate|pack|bundle`; `ieltsListeningBundle.ts`; pilot `Listening IELTS_Test2_Cam9` (**HOÃ€N CHá»ˆNH** Â· 4 parts Â· 40 cÃ¢u Â· `pnpm ielts:bundle`)
- [x] **Cam9 Test 2 Part 2** â€” `exam_part2.json` (a6: báº£ng Parks + MC Longfield + map Hinchingbrooke); `map.jpg` tá»« PDF; Ä‘Ã¡p Ã¡n Key: trees, friday, farm, C, B, A, A, I, F, E
- [x] **Cam9 Test 2 Part 3** â€” `exam_part3.json` (MC 21â€“24 Self-Access Centre + notes 25â€“30); meta `p3-mc4+notes6`; Key: C, B, B, C, reading, CD, workbooks, timetable/schedule, alarm, email/emails
- [x] **Cam9 Test 2 Part 4** â€” `exam_part4.json` (d1: Business Cultures â€” Power/Role/Task culture, ONE WORD); Key: central, conversation, effectively, risk, levels, description, technical, change, responsibility, flexible
- [x] Cam9 Test 2 completely removed from builtin samples (per user: "xÃ³a sáº¡ch Ä‘á» máº«u"). User will import manually from Tainguyen/IELTS/Listening IELTS_Test2_Cam9/ (P1 = ACCOMMODATION FORM â€“ STUDENT INFORMATION). Updated generatedIeltsListening.ts, manifest.json, removed forces in loader.
- [x] **Cam9 Test 4 bundle** â€” `Listening IELTS_Test4_Cam9` (**HOÃ€N CHá»ˆNH** Â· 4 parts Â· 40 cÃ¢u Â· `pnpm ielts:bundle`); P4 Q37â€“40 báº£ng 3 cá»™t khá»›p `Questions 37_40.jpg` (bullets + break, "urban areas", "when in cities", "Large survey starting soon"); P2 Q19â€“20 notes Ä‘Ãºng PDF (park + pizza + museum)

### Luyá»‡n thi â€” CAE C1 Listening Test 1 builtin (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `Tainguyen/cae-Listening-test1/exam.json` â€” 4 parts Â· 30 cÃ¢u (Part 1 MC 3 extracts, Part 2 gap-fill TRIP TO SOUTH AFRICA, Part 3 MC A/B/C/D, Part 4 dual matching)
- [x] Part 4 dual-task (a10.jpg) â€” `ListeningDualLetterMatchingPartView`: TASK ONE 21â€“25 + TASK TWO 26â€“30, hai báº£ng Aâ€“H riÃªng, kÃ©o/tháº£ vÃ o Speaker 1â€“5
- [x] `isDualLetterMatchingPart()` + `dualMatchingTaskGroups()` trong `listeningMultiPartLayout.ts`
- [x] Catalog builtin `catalog-listening-cae-c1-test1` + `pnpm pack:listening:cae` + `build-catalog.mjs` + `builtinExams.ts`
- [x] HDSD CAE C1 Listening â€” `Prompt-CAE-C1-Listening.txt`, `Import Listening CAE C1.txt`, cáº­p nháº­t `Import De Thi.txt`

### Luyá»‡n thi â€” Highlight tÃ´ sÃ¡ng Listening IELTS + Cambridge A2â€“C2 (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] DÃ¹ng chung logic Reading: `ReadingHighlightToolbar`, `ReadingHighlightableText`, `usePartHighlights`, `ExamHighlightZone`
- [x] Ãp dá»¥ng toÃ n bá»™ Listening: `ListeningKetTest`, `ListeningPetTest`, `ListeningIeltsTest` (IELTS + FCE/CAE/CPE)
- [x] VÃ¹ng tÃ´ sÃ¡ng: hÆ°á»›ng dáº«n, Ä‘á» bÃ i, gap-fill notes, MC/matching options; audio/Ã´ nháº­p cÃ³ `data-highlight-skip`
- [x] Highlight lÆ°u theo Part; reset khi **LÃ m láº¡i**
- [x] Theme **light**: tÃ´ sÃ¡ng exam (`--exam-highlight-bg`) mÃ u vÃ ng `#fff3a3`; mid/dark giá»¯ accent tÃ­m

### Luyá»‡n thi â€” ÄÃ£ lÃ m + LÃ m láº¡i trÃªn danh sÃ¡ch Ä‘á» (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `examCompletion.ts` â€” Ä‘á»c draft localStorage (`submitted` + Ä‘iá»ƒm Ä‘Ãºng/tá»•ng); `injectKetGapFillQuestionMarkers` â€” KET Part 2 hiá»‡n `and:(10) â€¦`
- [x] `useExamDraftRevision.ts` â€” re-render `ExamTrackPage` khi ná»™p bÃ i / lÃ m láº¡i
- [x] `ExamTrackPage` â€” badge **ÄÃ£ lÃ m**, meta `ÄÃºng X/Y cÃ¢u`, nÃºt **Xem káº¿t quáº£** + **LÃ m láº¡i** tá»«ng Ä‘á» Reading/Listening
- [x] `ExamResult` / `ListeningExamResult` â€” **Vá» luyá»‡n thi** + **LÃ m láº¡i** cáº¡nh nhau; back vá» Ä‘Ãºng track Cambridge/IELTS (`examNavigation.ts`)
- [x] `ListeningKetGapFillPartView` â€” ghi chÃº Part 2 cÃ³ sá»‘ cÃ¢u trÆ°á»›c chá»— trá»‘ng (vd. `Send a letter and:(10) â€¦`)

### Luyá»‡n thi â€” Footer thá»‘ng nháº¥t + Reset timer (session 2026-07-02) â€” HOÃ€N THÃ€NH
- [x] `ExamPartFooter.tsx` â€” thanh ngang Part + pills sá»‘ cÃ¢u + Prev/Next cÃ¢u + Submit (dÃ¹ng chung Reading/Listening)
- [x] `ExamTimerControls.tsx` + `examTimer.ts` â€” Ä‘á»“ng há»“ + nÃºt reset (RotateCcw) cáº¡nh timer
- [x] `ListeningKetTest.tsx` â€” refactor `partIndex` + `activeQuestionId` (migrate draft `questionIndex` cÅ©); footer giá»‘ng Reading
- [x] `ListeningIeltsTest.tsx` â€” footer dÃ¹ng `ExamPartFooter`; nav prev/next **cÃ¢u** (khÃ´ng chá»‰ Part)
- [x] `ReadingTest.tsx` â€” dÃ¹ng shared footer + timer reset
- [x] `listeningTest.css` â€” CSS vars footer pills trÃªn `.listening-exam-shell`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

---

## Káº¿ hoáº¡ch ngÃ y mai â€” Import ~100 Ä‘á» Listening IELTS

**Má»¥c tiÃªu:** User Ä‘Æ°a PDF + Answer Key + MP3 hÃ ng loáº¡t; agent há»— trá»£ táº¡o JSON, validate, gá»™p Ä‘á», Ä‘Æ°a vÃ o app.

### Chuáº©n folder (Ä‘Ã£ pilot Cam9 Test 2)

```
Tainguyen/IELTS/Listening IELTS_Test{N}_Cam{9|10|â€¦|20}/
  meta.json              â† cambridge, test, template tá»«ng part (p1-a3, p2-a6â€¦)
  exam_part1.json â€¦ exam_part4.json
  listening.mp3
  map.jpg / diagram.jpg / a3.jpg â€¦ (náº¿u cÃ³)
  Answer key.pdf         (tuá»³ chá»n)
```

### Workflow má»—i Ä‘á» (láº·p Ã—100)

| BÆ°á»›c | Viá»‡c | Lá»‡nh / file |
|------|------|-------------|
| 1 | Nháº­n dáº¡ng dáº¡ng Part 1â€“4 | `HDSD/ChatGPT-IELTS-Listening-4-Parts.txt` + `Prompt-Part1â€¦4.txt` |
| 2 | ChatGPT â†’ `exam_partN.json` | ÄÃ­nh kÃ¨m PDF part + Key + máº«u `Tainguyen/templates/ielts-listening-*.json` |
| 3 | Validate + merge | `pnpm ielts:validate "IELTS/â€¦"` â†’ `pnpm ielts:bundle "IELTS/â€¦"` |
| 4 | Import thá»­ (1 Ä‘á») | ZIP hoáº·c builtin catalog |
| 5 | Batch catalog | ThÃªm entry `build-catalog.mjs` + `builtinExams.ts` â†’ `pnpm build:catalog` |

**Lá»‡nh bundle (1 Ä‘á»):**
```bash
pnpm ielts:bundle "IELTS/Listening IELTS_Test2_Cam9"
pnpm ielts:validate "IELTS/Listening IELTS_Test2_Cam9" --partial   # dev part láº»
```

### Pilot thÃ nh cÃ´ng (máº«u copy)

| Äá» | ID catalog | Parts | Ghi chÃº |
|----|------------|-------|---------|
| Cam9 Test 2 | (removed from builtin samples) | 4Ã—40 cÃ¢u | User will import from Tainguyen/IELTS/Listening IELTS_Test2_Cam9/ (correct P1: ACCOMMODATION FORM) |
| Cam9 Test 4 | (removed from builtin samples) | 4Ã—40 cÃ¢u | `Tainguyen/IELTS/Listening IELTS_Test4_Cam9.zip` â€” P4 table Q37â€“40, `diagram.jpg` P2 |

### Scale 100 Ä‘á» â€” agent sáº½ há»— trá»£

- [ ] Thá»‘ng nháº¥t naming: `Listening IELTS_Test{N}_Cam{X}` + `meta.json` template
- [ ] Batch validate: script quÃ©t folder `Tainguyen/IELTS/` (náº¿u cáº§n viáº¿t thÃªm)
- [ ] Batch `build-catalog.mjs`: generate BUNDLES[] tá»« manifest hoáº·c glob (trÃ¡nh sá»­a tay 100 dÃ²ng)
- [ ] Choose TWO / map / gap: so Answer Key trÆ°á»›c khi merge
- [ ] Deploy 1 láº§n sau khi catalog á»•n: `pnpm build:catalog` â†’ `pnpm deploy:prod`

### TÃ i liá»‡u tham chiáº¿u

- `HDSD/ChatGPT-IELTS-Listening-4-Parts.txt` â€” workflow ChatGPT tá»•ng
- `HDSD/Import Listening IELTS.txt` â€” import UI + bundle pipeline
- `apps/web/src/features/exam/ieltsListeningBundle.ts` â€” merge/validate logic
- `Giaodien/two-choice.jpg` â€” Choose TWO (answer `A/E`, UI 2 Ã´)

### Fix audio IELTS Listening (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] `build-catalog.mjs` â€” auto-discover 25 Ä‘á» IELTS (Cam9â€“14 + Cam20 T1) tá»« `Tainguyen/IELTS/`
- [x] Generate `packages/catalog/src/generatedIeltsListening.ts` + copy MP3 â†’ `public/catalog/listening/`
- [x] `GLOBAL_CATALOG_VERSION` bump **1 â†’ 2**
- [x] `pnpm build:catalog` + `tsc --noEmit` pass
- [ ] User: hard refresh (`Ctrl+Shift+R`) hoáº·c xÃ³a Ä‘á» import cÅ© â†’ dÃ¹ng Ä‘á» builtin; `pnpm deploy:prod` cho production

### IELTS Listening Cam15â€“16 batch (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] `scripts/build-ielts-cam15-16-listening.py` â€” 8 Ä‘á» Ã— 4 parts Ã— 40 cÃ¢u
- [x] Cam15 T3 P1 â€” PDF Ä‘á»§ Part 1 (Employment Agency: Possible Jobs); layout form theo Ä‘á» giáº¥y (First Job / Second Job, bullets tá»«ng dÃ²ng)
- [x] Map images: Cam15 T2/T4, Cam16 T1/T4 â†’ `map.jpg`
- [x] `pnpm ielts:validate` â€” 8/8 pass, khÃ´ng cáº£nh bÃ¡o
- [x] `pnpm ielts:pack` â€” 8 ZIP (exam.json + listening.mp3 + map náº¿u cÃ³)
- [x] `pnpm build:catalog` â€” **33 Ä‘á»** IELTS auto-discovered (Cam9â€“16 + Cam20 T1)
- [x] `GLOBAL_CATALOG_VERSION` bump **2 â†’ 3** (sau Ä‘Ã³ **3 â†’ 4** khi fix Cam15 T3 P1 tá»« PDF gá»‘c)
- [x] `pnpm --filter web exec tsc --noEmit` pass

### IELTS Listening Cam17â€“18 batch (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] `scripts/dump-ielts-cam17-18.py` + `ielts-cam17-18-dump.txt`
- [x] `scripts/build-ielts-cam17-18-listening.py` â€” 8 Ä‘á» Ã— 4 parts Ã— 40 cÃ¢u
- [x] Cam18 T2 P1 â€” PDF Ä‘á»§ Q1â€“5 (Milo's Restaurants); layout dual noteTables theo Ä‘á» giáº¥y
- [x] Cam18 T2 map â€” `map.jpg` tá»« PDF page 3 (School, Sports centre, Clinicâ€¦)
- [x] `pnpm ielts:validate` â€” 8/8 pass
- [x] `pnpm ielts:pack` â€” 8 ZIP
- [x] `pnpm build:catalog` â€” **41 Ä‘á»** IELTS (Cam9â€“18 + Cam20 T1)
- [x] `GLOBAL_CATALOG_VERSION` bump **4 â†’ 5** (sau Ä‘Ã³ **5 â†’ 6** khi fix Cam18 T2 P1 tá»« PDF gá»‘c)

### IELTS Listening Cam19â€“20 batch (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] `scripts/dump-ielts-cam19-20.py` + `ielts-cam19-20-dump.txt`
- [x] `scripts/build-ielts-cam19-20-listening.py` â€” 8 Ä‘á» Ã— 4 parts Ã— 40 cÃ¢u (Cam19 T1â€“T4 + Cam20 T1â€“T4)
- [x] Cam20 T1 migrate sang bundle format (`exam_part1â€“4.json` + `meta.json`)
- [x] Map images: Cam19 T1 (Farley House), Cam20 T3 (archaeology site) â†’ `map.jpg`
- [x] `pnpm ielts:validate` â€” 8/8 pass (fix notePassage static rá»—ng Cam20 T2/T3)
- [x] `pnpm ielts:pack` â€” 8 ZIP
- [x] `pnpm build:catalog` â€” **48 Ä‘á»** IELTS (Cam9â€“20)
- [x] `GLOBAL_CATALOG_VERSION` bump **6 â†’ 7**

### IELTS Part 1 layout fix â€” 48 Ä‘á» (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] `normalize_part1()` trong `build-ielts-cam11-12-listening.py` â€” auto `notePassageLayout`, `passageTitle`, bullet sau section `:`
- [x] `scripts/fix-all-ielts-p1.py` + `scripts/rebuild-all-ielts-listening.py`
- [x] UI: Part 1 `passageTitle` cÄƒn giá»¯a, to hÆ¡n (`listening-ielts-notes__title--part1`)
- [x] Renderer: `groupNotePassageIntoLines` mode `form` tÃ¡ch dÃ²ng sau gap
- [x] Cam9 T1 bundle (`exam_part1.json`), Cam12 v2 bullets, Cam20 T1 bá» `notePassage` trÃ¹ng báº£ng
- [x] Rebuild 48 Ä‘á» + `pnpm build:catalog` â€” `GLOBAL_CATALOG_VERSION` **8 â†’ 9**

### IELTS Part 4 layout fix â€” 48 Ä‘á» (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] `normalize_part4()` trong `build-ielts-cam11-12-listening.py` â€” auto `notePassageLayout: lecture`, `passageTitle`, bá» section trÃ¹ng title, bullets `â€¢`/`â€“`
- [x] `scripts/fix-all-ielts-p1.py` má»Ÿ rá»™ng xá»­ lÃ½ cáº£ `exam_part4.json` (48 Ä‘á»)
- [x] Renderer: `groupNotePassageIntoLines` mode `lecture` tÃ¡ch dÃ²ng sau gap (giá»‘ng `form`)
- [x] UI: Part 4 `passageTitle` cÄƒn giá»¯a phÃ­a trÃªn box (`partTitleAboveBox` â€” class `listening-ielts-notes__title--part1`)
- [x] `write_test()` normalize P4 + fix `merge_parts` dÃ¹ng payload Ä‘Ã£ normalize
- [x] `pnpm build:catalog` â€” `GLOBAL_CATALOG_VERSION` **9 â†’ 10**

### IELTS note lines renderer fix (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] **Root cause:** `groupNotePassageIntoLines` gom nhiá»u `static` block khi khÃ´ng nháº­n bullet `â€¢`/`â€“` â†’ "carer:time forâ€¦a [1]" (Cam20 T2 P1, case5 vs case6)
- [x] `groupNotePassageFormLines()` â€” má»—i `static` JSON = má»™t dÃ²ng; chá»‰ gom `static+gap(+trail)`; gap trail â‰  bullet má»›i
- [x] Ãp dá»¥ng cho `notePassageLayout: form` vÃ  `lecture` (Part 1 + Part 4)
- [x] `hasNoteLineMarker` / `noteLineMarkerKind` â€” nháº­n `â€¢ â€“ + * â–ª Â· â–º â€¦` (Cam11 T1: `+ Â£250 deposit`)
- [x] `GLOBAL_CATALOG_VERSION` **10 â†’ 11**

### IELTS note lines 100% Ä‘á» giáº¥y (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] Quy táº¯c cá»©ng: **má»—i static block JSON = má»™t dÃ²ng UI** â€” khÃ´ng ná»‘i dÃ i; chá»‰ gom `static + gap + trail` cÃ¹ng cÃ¢u
- [x] `atomizeNotePassageBlocks` / `_atomize_note_passage` â€” tÃ¡ch `\n` trong data
- [x] NotePassageBox bá» list mode (luÃ´n form/lecture strict)
- [x] CSS `.listening-ielts-notes__line` â€” `display:block`, `white-space:pre-wrap`
- [x] `GLOBAL_CATALOG_VERSION` **11 â†’ 12**

### IELTS map/diagram crop (session 2026-07-03) â€” HOÃ€N THÃ€NH
- [x] `find_map_diagram_clip_rect()` + `extract_map_image()` â€” render crop vÃ¹ng map/diagram, khÃ´ng extract nguyÃªn trang PDF
- [x] `find_fallback_plan_clip_rect()` â€” PDF scan (Cam9 T2) crop embedded image, bá» header/footer
- [x] `scripts/extract-all-ielts-plan-images.py` â€” auto quÃ©t `imageFile` trong `exam_part*.json` â†’ 15 áº£nh (map.jpg/diagram.jpg)
- [x] `PAGE_OVERRIDES` Cam9 T2 map â†’ page 3 (scan)
- [x] Fix nháº­n cÃ¢u há»i 16â€“20 vs sá»‘ label trÃªn map (Cam16 T4)
- [x] Re-extract 15/15 OK; `pnpm build:catalog`
- [x] Fix crop quÃ¡ tay (v2): union khá»‘i váº½ + padding; giá»¯ Ä‘á»§ mÃ©p map/compass/Ä‘Æ°á»ng; Cam9 T2 Ä‘Ãºng trang map (p4)
- [x] Note P1/P4 bullets + line breaks (v3): `_enrich_passage_bullets` má»Ÿ rá»™ng; `enrichNotePassageBullets` TS runtime; má»—i static = 1 dÃ²ng; CSS hanging indent
- [x] Note bullets conservative (v4): `_sanitize_passage_markers()` gá»¡ â€¢/â€“ sai (form label, gap trail, prose, intro); enrich tháº­n trá»ng; fix `'' in 'â€“-+âˆ’*'`; intro vs e.g. sub-list; Cam20 T2 P1 khá»›p case6
- [x] Note bullets colon sub-list (v5 / catalog v19): `_colon_introduces_sub_items()` â€” má»¥c sau dÃ²ng `:` (vd. `site:`, `ocean hotspots:`, `innovations include:`) dÃ¹ng `â€“`; giá»¯ `â€¢` cho intro `may include discussion of:`; `_find_colon_sub_parent()` lan context qua sibling; Cam19 P4 Ceide Fields khá»›p Ä‘á» giáº¥y
- [x] `GLOBAL_CATALOG_VERSION` **12 â†’ â€¦ â†’ 19**

### IELTS note inline gap fix (session 2026-07-03) â€” ÄÃƒ LÃ€M, USER BÃO VáºªN Lá»–I
- [x] `groupNotePassageFormLines` â€” khÃ´ng flush trÆ°á»›c gap khi `:` hoáº·c trail sau gap (` at 6 p.m.`)
- [x] `prepareNotePassageBlocks` â€” inject `gapLead` dÃ²ng `e.g.` dÃ¹ng `â€“` thay `â€¢`
- [x] `GapInlineCompact` â€” `suppressLead`/`suppressTrail` + so khá»›p bullet khi compare
- [x] `scripts/sync-ielts-inline-gaps.py` â€” gá»¡ 106 `gapLead`/`gapTrail` thá»«a (8 Ä‘á» Cam9â€“11)
- [x] `GLOBAL_CATALOG_VERSION` **20 â†’ 21**; `pnpm build:catalog` 48 Ä‘á»
- [ ] **User xÃ¡c nháº­n váº«n lá»—i** â€” cáº§n reproduce cá»¥ thá»ƒ trÃªn localhost (Ä‘á»/part/cÃ¢u nÃ o)

### Lá»—i cÃ²n tá»“n táº¡i (IELTS Listening notes â€” Æ°u tiÃªn session 2026-07-04)

**Bug user bÃ¡o (chÆ°a Ä‘Ã³ng):**
- P1: text inline gap váº«n **rá»›t dÃ²ng** (vd. `Interview arranged for: Thursday [9] at 6 p.m.` khÃ´ng 1 dÃ²ng)
- P4: **double text** `gapLead`/`gapTrail` (vd. `e.g. some parasitesâ€¦` láº·p 2 láº§n)
- P4: **bullet `â€¢` thá»«a** trÃªn dÃ²ng `e.g.` (pháº£i lÃ  `â€“` sub-bullet)
- CÃ³ thá»ƒ cÃ²n lá»—i trÃªn **Ä‘á» khÃ¡c Cam9 T1** dÃ¹ Ä‘Ã£ sync 48 Ä‘á»

**NguyÃªn nhÃ¢n Ä‘Ã£ xÃ¡c Ä‘á»‹nh (tham kháº£o khi fix):**
| Triá»‡u chá»©ng | File | Ghi chÃº |
|-------------|------|---------|
| Rá»›t dÃ²ng trÆ°á»›c gap | `listeningNotePassage.ts` â†’ `groupNotePassageFormLines` | Flush sai khi static â€œhoÃ n chá»‰nhâ€ nhÆ°ng gap+trail cÃ¹ng cÃ¢u |
| Double text | `prepareNotePassageBlocks` inject static + `GapInlineCompact` render láº¡i | Dedupe `suppressLead`/`suppressTrail` |
| `â€¢` trÃªn e.g. | `prepareNotePassageBlocks` inject `gapLead` | DÃ²ng `e.g.` â†’ `â€“` |
| JSON trÃ¹ng | `exam_part*.json` + `questions[].gapLead` | `sync-ielts-inline-gaps.py` Ä‘Ã£ cháº¡y; cÃ³ thá»ƒ cÃ²n case chÆ°a cover |

**Test case chuáº©n khi debug:**
- `catalog-listening-ielts-cam9-test1` â€” P1 Q9, P4 Q32
- So PDF: `Tainguyen/IELTS/Listening IELTS_Test1_Cam9/*.pdf`

**KhÃ¡c (IELTS import â€” khÃ´ng block notes bug):**
- Cam9 T4 P4: layout `table` (khÃ´ng lecture)
- Map scan cÃ²n dÃ²ng cÃ¢u há»i 15â€“20 dÆ°á»›i áº£nh
- Production chÆ°a deploy catalog v21
- 48 Ä‘á» chÆ°a audit PDF 100% (chá»‰ Cam9 T1 P1 rewrite Ä‘áº§y Ä‘á»§)

---

## 2026-07-11 â€” Fix trang tráº¯ng `/app/vocab`

- Root cause: import vÃ²ng giá»¯a `vocabSeedDecks` vÃ  `vocabPublishedSync` khiáº¿n `PRESET_GROUP_IDS` cÃ³ thá»ƒ bá»‹ Ä‘á»c trong TDZ.
- Fix: tÃ¡ch constants dÃ¹ng chung sang `apps/web/src/features/vocab/vocabConstants.ts`; giá»¯ re-export tÆ°Æ¡ng thÃ­ch.
- Verify: `pnpm --filter web exec tsc --noEmit` pass.

## Next session start prompt

```
Äá»c session_summary.md.

Session 2026-07-04 â€” Fix tiáº¿p IELTS Listening note P1/P4 (user bÃ¡o váº«n lá»—i).

BÆ°á»›c 1 â€” Reproduce vá»›i user:
- Há»i Ä‘á»/part/cÃ¢u cá»¥ thá»ƒ hoáº·c má»Ÿ Cam9 T1: P1 Q9, P4 Q32
- pnpm dev:web â†’ http://localhost:5173 â†’ hard refresh (Ctrl+Shift+R)
- Náº¿u data cÅ©: pnpm build:catalog (catalog v21)

BÆ°á»›c 2 â€” Debug renderer:
- apps/web/src/features/exam/listeningNotePassage.ts
  (groupNotePassageFormLines, prepareNotePassageBlocks, gapLeadRenderedAdjacent)
- apps/web/src/features/exam/ListeningIeltsNotePassageBox.tsx (GapInlineCompact suppress)
- apps/web/src/features/exam/listeningTest.css (::before bullet/sub)

BÆ°á»›c 3 â€” Debug data náº¿u renderer OK trÃªn script nhÆ°ng UI váº«n sai:
- Tainguyen/IELTS/.../exam_part1.json, exam_part4.json
- python scripts/audit-ielts-pdf-vs-json.py
- pnpm fix:ielts-notes (= sync-ielts-inline-gaps + fix-all-ielts-p1 + build:catalog)

ÄÃ£ lÃ m session 2026-07-03 (chÆ°a Ä‘á»§):
- Renderer inline gap + suppress double text
- sync 48 Ä‘á», catalog v21

ChÆ°a xong:
- User xÃ¡c nháº­n váº«n lá»—i rá»›t dÃ²ng / double text / bullet e.g.
- Audit PDF vs JSON cho 48 Ä‘á»
```

## Session 2026-07-04 â€” Fix 48 standalone HTML mocks (unique per PDF) + no line drops (rá»›t dÃ²ng)

### Váº¥n Ä‘á» user bÃ¡o
- Táº¥t cáº£ 48 file HTML trong Tainguyen/IELTS/.../*.html (vÃ  PDF to HTML/) **giá»‘ng há»‡t nhau** (chá»‰ Ä‘á»•i title).
- File sinh ra xáº¥u, khÃ´ng giá»‘ng template (assets/ielts-listening-template_Test1_Cam9.html).
- YÃªu cáº§u: **Má»—i Ä‘á» pháº£i khÃ¡c nhau**, ná»™i dung láº¥y tá»« file PDF tÆ°Æ¡ng á»©ng (khÃ´ng copy paste 1 cÃ¡i).

### NguyÃªn nhÃ¢n gá»‘c
- `gen.py` + `gen_ielts.py` dÃ¹ng regex má»ng manh thay tháº¿ `<div class="p-8">...` (khÃ´ng match Ä‘Æ°á»£c â†’ giá»¯ nguyÃªn ná»™i dung Cam9 máº«u).
- `render_form` quÃ¡ Ä‘Æ¡n giáº£n, chá»‰ render notePassage cÆ¡ báº£n, bá» qua questions/MC/options/passageTitle thá»±c cá»§a tá»«ng exam.json.
- KhÃ´ng dÃ¹ng dá»¯ liá»‡u Ä‘Ã£ parse sáº¡ch tá»« PDF (exam_part*.json, exam.json) má»™t cÃ¡ch Ä‘áº§y Ä‘á»§.

### ÄÃ£ lÃ m
- Viáº¿t láº¡i `gen.py` (loáº¡i bá» regex, build shell + inner Ä‘á»™ng):
  - Load exam.json + exam_partN.json (dá»¯ liá»‡u Ä‘Ã£ Ä‘Æ°á»£c build scripts + fix bullet/notePassage tá»« PDF).
  - Render Ä‘áº§y Ä‘á»§ 4 SECTION vá»›i:
    - `paper-box` + `notes-box` style (2px #374151 radius nhÆ° template)
    - `passageTitle` unique (Self-drive tours..., CRIME REPORT FORM, Business Cultures, ... )
    - `form-row` + `.form-label` + inline `.question-number` + `.answer-input`
    - `bullet-item` (â€¢ vÃ  â€“)
    - MC/choose-two: `.mcq-container` + `.option` + `onclick="selectOption/toggleMultiOption"`
  - Cáº­p nháº­t header (Test X, Cambridge Y) + title tag + footer.
  - Tá»± copy thÃªm báº£n vÃ o `Tainguyen/PDF to HTML/`.
- Cháº¡y `python gen.py` â†’ **48 file** (hash khÃ¡c nhau 100%).
- Re-run sau khi cáº£i thiá»‡n `render_blocks` (tá»± Ä‘á»™ng form-row khi label + gap, inline tail text).
- Má»—i HTML giá» cÃ³ ná»™i dung **khÃ¡c háº³n**, Ä‘Ãºng theo Ä‘á» PDF gá»‘c (JSON trung gian), giao diá»‡n giá»‘ng há»‡t template reference.

### Káº¿t quáº£
- Cam9 T1: JOB ENQUIRY + SPORTS WORLD + Whales (Ä‘Ãºng Ä‘á»)
- Cam10 T1: Self-drive tours in the USA + Leisure club + Spirit Bear
- Cam9 T2: CRIME REPORT FORM + Self-Access Centre + Business Cultures
- Táº¥t cáº£ cÃ³ inputs, options clickable, bullets Ä‘Ãºng, box viá»n Ä‘áº­m bo gÃ³c.
- ÄÃ£ loáº¡i bá» hoÃ n toÃ n ná»™i dung Cam9 máº«u khá»i 47 Ä‘á» cÃ²n láº¡i.

### Files liÃªn quan
- `gen.py` (cáº£i tiáº¿n)
- `Tainguyen/IELTS/Listening IELTS_Test*_Cam*/*.html` (48)
- `Tainguyen/PDF to HTML/*.html` (copies)

### Next
- Náº¿u cáº§n render Ä‘áº¹p hÆ¡n (table layout P1, map áº£nh nhÃºng, section header chi tiáº¿t hÆ¡n) â†’ cÃ³ thá»ƒ má»Ÿ rá»™ng render + dÃ¹ng thÃªm `meta.json` + áº£nh.
- Sau nÃ y muá»‘n regenerate chá»‰ cáº§n `python gen.py`.

---

## Session 2026-07-13 â€” Convert 47 Ä‘á» Reading qua pipeline normalize + template (fix layout)

### Gá»‘c rá»…
- Adapter cÅ© lÃ m pháº³ng noteTable/notePassage â†’ máº¥t báº£ng, nháº£y dÃ²ng.
- App cÃ³ sáºµn pipeline pure-function chuáº©n hÃ³a layout: `ieltsReadingAiNormalize.ts` + `readingNoteTableUtils.ts` + `ieltsReadingTemplateCatalog.ts` + `ieltsReadingPartTemplates.ts`. Cháº¡y offline (Node/tsx), khÃ´ng cáº§n browser.
- YÃªu cáº§u: KHÃ”NG viáº¿t láº¡i parser tay, import trá»±c tiáº¿p tá»« source.

### Branch + commits
- Branch: `feat/fix-reading-layout`
- Commits:
  - `1f1dd35` â€” step0: pipeline signature confirm
  - `df393ba` â€” chore: gitignore + remove `_recover_wizard` artefacts
  - `aa56810` â€” feat(reading): reverse-index all 73 wizard templates (BÆ°á»›c 1)
  - `de38422` â€” feat(reading): convert 47 IELTS Reading exams via template pipeline (BÆ°á»›c 2â€“4)
  - `08ebe77` â€” chore(reading): drop cam-7/cam-8 converted files (out of scope)

### BÆ°á»›c 0 â€” XÃ¡c minh signature (docs/READING-PIPELINE-CONFIRM.md)
- Pure (0 hit `window|dexie|indexedDB|fetch|document.`) â†’ cháº¡y Node/tsx an toÃ n.
- `normalizeAiReadingPart(part) â†’ part` (line 209)
- `alignQuestionGroupsToTemplate(part, templatePart)` (line 402)
- `forceTemplateSummaryWordBanks(part, templatePart)` (line 461)
- `forceTemplateHybridGroups(part, templatePart)` (line 562)
- `applyReadingTemplateTableStructure(part, templatePart)` (line 849) â€” **wrapper compose sáºµn** merge + align + force + notePassage
- `resolveReadingTemplateKind(passageNumber, kind)` â€” chá»‰ validate kind chuá»—i, KHÃ”NG detect tá»« displayType
- `getIeltsReadingWizardTemplatePart(passageNumber, kind)` â€” line 9166

### Quyáº¿t Ä‘á»‹nh user
1. **Template detect:** B â€” Reverse-index all templates (cháº¡y 73 builder, trÃ­ch type-triplet, build map)
2. **Wrapper:** dÃ¹ng `applyReadingTemplateTableStructure` (khÃ´ng sá»­a source, khÃ´ng export merge riÃªng)

### BÆ°á»›c 1 â€” Reverse-index (aa56810)
- Cháº¡y 73/73 template builder â†’ 0 lá»—i
- 63 unique type-triplet, 8 collision (first-wins per passage)
- Output: `out-reading/template-triplet-index.json`

### BÆ°á»›c 2â€“4 â€” Convert + validate (de38422)
- Scope: 47 Ä‘á» (cam-9..20 Ã— T1â€“T4, trá»« `cam-11-2`) Â· 141 passage
- Pipeline má»—i part: `normalizeAiReadingPart` â†’ (náº¿u matched) `applyReadingTemplateTableStructure(part, templatePart)`
- **Matched 52/141 (37%)** â€” apply wrapper
- **Fallback normalize-only 89/141 (63%)** â€” nguyÃªn nhÃ¢n:
  - Cam9 T1â€“T4: group-per-question (13 MC = 13 group riÃªng láº») do generator cÅ© â†’ triplet 8â€“14 pháº§n tá»­, khÃ´ng template nÃ o khá»›p
  - Cam12â€“20: nhiá»u passage cÃ³ triplet 4-group chÆ°a cÃ³ trong catalog (top: `matching-paragraph|summary-completion|multiple-choice|multiple-choice` Ã—6; `matching-paragraph|matching-features|summary-completion` Ã—4)
- Output: `out-reading/converted/reading-cam-{9..20}-{1..4}.json` (47 file) + `VALIDATE-REPORT.md`

### Cáº£nh bÃ¡o trÆ°á»›c/sau â€” KHÃ”NG tÃ¡i táº¡o Ä‘Æ°á»£c 345
- Validator Ä‘Æ°á»£c export (`validateAiReadingPartShape`, `validateAiReadingPartAgainstTemplate`, `validateReadingNoteTable`): **trÆ°á»›c 4 â†’ sau 4**
- Top loáº¡i sau: `missing-notePassage:3`, `missing-noteTable:1`. Top Ä‘á»: `reading-cam-16-4.json:4`
- Sá»‘ **345** trong spec khÃ´ng Ä‘áº¿n tá»« 3 validator nÃ y â€” nghi lÃ  surface khÃ¡c (runtime wizard warning / groupRoles counter / seed log). Cáº§n user chá»‰ Ä‘Ãºng nguá»“n.

### Files má»›i
- `scripts/reading/adapt-reading.mjs` â€” raw adapter giá»¯ displayType
- `scripts/reading/detect-template.mjs` â€” reverse-index detection
- `scripts/reading/run-pipeline.mjs` â€” pipeline runner qua tsx
- `scripts/reading/convert-and-validate.mts` â€” orchestrator (user Ä‘ang má»Ÿ file nÃ y)
- `docs/READING-PIPELINE-CONFIRM.md` â€” BÆ°á»›c 0 signature report
- `out-reading/template-triplet-index.json`
- `out-reading/converted/reading-cam-{9..20}-{1..4}.json` (47)
- `out-reading/VALIDATE-REPORT.md`
- `.gitignore` â€” thÃªm `_recover_wizard/`

### ChÆ°a xong / Blocker
- [ ] **63% passage fallback** â€” cáº§n bÆ°á»›c consolidate group (gá»™p 13 MC-per-group thÃ nh 1 group MC) TRÆ¯á»šC pipeline Ä‘á»ƒ match template Cam9. Náº±m ngoÃ i scope (bá»‹ cáº¥m "viáº¿t láº¡i normalize") â€” cáº§n user cho phÃ©p thÃªm consolidator riÃªng biá»‡t.
- [ ] **Nguá»“n sá»‘ 345** â€” user cáº§n xÃ¡c nháº­n validator/counter nÃ o cho ra 345, Ä‘á»ƒ Ä‘o before/after chÃ­nh xÃ¡c.
- [ ] **Seed + so máº¯t cam-20-2** â€” cáº§n user cháº¡y build-catalog vá»›i converted files rá»“i má»Ÿ cam-20-2 so screenshot TID gá»‘c (báº£ng ra báº£ng, notes Ä‘Ãºng gap, sentence-ending khÃ´ng nháº£y dÃ²ng).
- [ ] Bá»• sung template catalog cho 4-group triplet phá»• biáº¿n (giáº£m fallback tá»« 63% xuá»‘ng nhiá»u hÆ¡n).

### Next session start prompt
```
Äá»c session_summary.md pháº§n Session 2026-07-13.

Branch: feat/fix-reading-layout. ÄÃ£ cÃ³ 5 commit convert 47 Ä‘á» Reading qua pipeline.

Cáº§n user quyáº¿t:
(a) Cho phÃ©p viáº¿t consolidator gá»™p group-per-question Cam9 trÆ°á»›c pipeline?
(b) Sá»‘ 345 Ä‘áº¿n tá»« Ä‘Ã¢u (validate script/UI nÃ o)?
(c) ÄÆ°a out-reading/converted/*.json vÃ o build-catalog pipeline nhÆ° nÃ o?

Sau khi cÃ³ (a)(b)(c):
- Rerun pipeline vá»›i consolidator â†’ giáº£m fallback dÆ°á»›i 30%
- Äo láº¡i warnings Ä‘Ãºng surface 345
- pnpm build:catalog + seed láº¡i + user má»Ÿ cam-20-2 verify
```

### Follow-up (line drops / rá»›t dÃ²ng fix)
- User reported text dropping to new lines (real paper keeps the sentence + blank on 1 line).
- Rewrote render_blocks: more aggressive lookahead for gaps after any static; always wrap static+gap+tail into one flex container (bullet-item / form-row / generic display:flex nowrap).
- Reduced over-greedy chaining (only immediate tail after a gap; stop unless consecutive gaps).
- Re-ran `python gen.py` â†’ all 48 (the 47 + Cam9 T1) updated.
- Result: "text [n] trail", "label: text [n] more", plain note lines now stay inline in their div. Loose <span class=question-number> greatly reduced.
- Applies uniformly because generator is the single source for all HTMLs.

# Session Update - 2026-07-01

## Da lam trong phien nay
- Clean up `apps/web/src/features/listening/CreateLessonModal.tsx`:
  - giu Cambridge mode
  - don logic `create()`
  - gom state tao lesson
  - sua label/UI text
- Them tao Cambridge `Test 3` trong luong tao Listening lesson.
- Nang cap Kokoro UX:
  - start/check status ngay tu giao dien
  - them `ListeningTtsStatusBadge` than thien hon
  - co copy command, offline messaging, health polling
- Bat view mode that su cho Listening Library:
  - `list | grid | compact`
  - luu vao localStorage
  - grid cards duoc bo tri gon hon
  - them motion nhe cho view switch
- Them feedback dung dap an cho Listening practice:
  - sound + fireworks giong Vocab
  - auto next sau 5s
- Them xoa bai nghe trong trang chi tiet:
  - option trong dropdown
  - modal confirm
  - toast + loading + navigate ve `/app/listening`
- Fix mot phan bug sau khi xoa lesson:
  - reset state lesson
  - `navigate('/app/listening', { replace: true })`
  - giam kha nang white page do state cu
- Rut gon dev flow:
  - root `pnpm dev` huong toi chay web + server local
  - co huong auto open browser local
- Sua Google OAuth redirect:
  - `apps/web/src/features/auth/AuthContext.tsx`
  - `redirectTo` = `${window.location.origin}/auth/callback`
  - localhost va production dung chung callback dung origin

## Van de dang mo
- [x] **Listening thanh cuon ngang/dá»c thá»«a** (2026-07-01) â€” fix: bá» `overflow-x-auto` tabs, shell 2 lá»›p `.listening-lesson-shell` + `.listening-lesson-scroll`, áº©n scrollbar trong `globals.css`, bá» debug MutationObserver. **Chá» user hard refresh vÃ  xÃ¡c nháº­n.**
- Debug query váº«n cÃ²n: `lsnDebug`, `lsnPracticeDebug` (náº¿u cáº§n isolate component).

## File nong can mo lai o phien sau
- `apps/web/src/features/listening/ListeningLessonPage.tsx`
- `apps/web/src/features/listening/ListeningTabs.tsx`
- `apps/web/src/features/listening/ListeningPracticeTab.tsx`
- `apps/web/src/styles/globals.css`
- `apps/web/src/features/auth/AuthContext.tsx`
- `apps/web/src/features/auth/AuthCallback.tsx`

## Luu y ky thuat
- `pnpm --filter web build` dang bi chan boi loi xac thuc registry/pnpm cua moi truong:
  - `Refusing to run pnpm@9.15.0: its npm registry signature could not be verified`
- Day khong phai loi source code app.
- Repo da co route `/auth/callback` trong `App.tsx` va xu ly session trong `AuthCallback.tsx`.
- Supabase Dashboard van can whitelist:
  - `http://localhost:5173/auth/callback`
  - production domain `/auth/callback`

## Má»¥c tiÃªu Æ°u tiÃªn phiÃªn sau (2026-07-02, tiáº¿p)

### IELTS Listening â€” user confirm
1. Hard refresh â†’ Cam20 Test 1 â€” so `Giaodien/a5â€“a10`
2. Cam9 Test 1 â€” static lines P1/P4
3. OK â†’ `pnpm deploy:prod`

### Luyá»‡n thi â€” Import Ä‘á» (backlog)
- KET/PET/FCE/CAE Listening + Reading ZIP test
- PET Listening: `HDSD/Prompt-PET-B1-Listening.txt`

### KhÃ¡c (náº¿u user nháº¯c)
- Cam20 P1 table layout 4 cá»™t
- Listening lesson thanh cuá»™n thá»«a â€” `?lsnDebug=only-tabs`
- iOS Ã” CHá»® + Web Audio autoplay

## Session 2026-07-04 â€” Fix Cambridge IELTS 9 Test 2 Part 4 (Business Cultures)

### Váº¥n Ä‘á»
- Part 4 notePassage cho "Business Cultures" (Power/Role/Task culture) note format khÃ´ng khá»›p layout thá»±c táº¿ cá»§a Ä‘á».
- CÃ¡c dÃ²ng Ä‘áº·c Ä‘iá»ƒm tá»• chá»©c khÃ´ng cÃ³ cáº¥u trÃºc header "Characteristics of organization:" + danh sÃ¡ch con dÃ¹ng "â€“".
- Gap 31 (central) bá»‹ tÃ¡ch sai; tÆ°Æ¡ng tá»± nhiá»u chá»— khÃ¡c.
- User cung cáº¥p format chi tiáº¿t hÆ¡n vá»›i â— cho header items (Advantage, Disadvantage, Suitable employee, Characteristics..., Advantages, Disadvantages) vÃ  â€“ cho sub-items, kÃ¨m inline gaps Ä‘Ãºng vá»‹ trÃ­.

### ÄÃ£ fix (láº§n 2)
- Viáº¿t láº¡i toÃ n bá»™ `notePassage` blocks theo Ä‘Ãºng format user Ä‘Æ°a ra (káº¿t há»£p 2 tin nháº¯n):
  - â— Characteristics of organization:
    â€“ small
    â€“ [31] power source
    â€“ few rules and procedures
    â€“ communication by [32]
  - â— Advantage: can act quickly
  - â— Disadvantage: might not act [33]
  - â— Suitable employee:
    â€“ not afraid of [34]
    â€“ doesn't need job security
  - Role Culture + â— Characteristics... vá»›i â€“ large, many [35] / specialized departments / job [36]...
  - â— Advantages: / â— Disadvantages: / â— Suitable employee: vá»›i subs
  - Task Culture: â— Characteristic of organization: (singular nhÆ° user) + 3 â€“ subs
  - â— Advantages: [40]
- Sá»­ dá»¥ng literal "â— " (khÃ´ng bá»‹ strip hoÃ n toÃ n) + "â€“ " cho sub Ä‘á»ƒ renderer + CSS táº¡o Ä‘Ãºng bullet style.
- Cáº­p nháº­t gapLead/gapTrail trÃªn questions 31,33,34,35,36,37,38,39,40 Ä‘á»ƒ há»— trá»£ inline grouping tá»‘t hÆ¡n.
- Cáº­p nháº­t cáº£ exam_part4.json + exam.json.
- Cháº¡y `pnpm build:catalog` + repack ZIP.
- Giá»¯ láº¡i pháº§n cÃ²n láº¡i cá»§a Task (Disadvantages + Suitable) Ä‘á»ƒ Ä‘áº§y Ä‘á»§ 10 cÃ¢u.

### Files Ä‘Ã£ sá»­a
- Tainguyen/IELTS/Listening IELTS_Test2_Cam9/exam_part4.json
- Tainguyen/IELTS/Listening IELTS_Test2_Cam9/exam.json
- packages/catalog/data/listening-ielts-cam9-test2.json removed from active catalog samples (user imports manually)
- ZIP bundle

---

## Session 2026-07-04 â€” XÃ³a sáº¡ch 48 Ä‘á» máº«u IELTS Cam9-20 (user request)

### LÃ½ do
- User láº·p láº¡i: "XÃ³a sáº¡ch 48 Ä‘á» máº«u", "KhÃ´ng á»•n rá»“i báº¡n Æ¡i. HÃ£y xÃ³a sáº¡ch Ä‘á» máº«u trong app Ä‘i. MÃ¬nh qua hÆ°á»›ng khÃ¡c Ä‘á»ƒ import Ä‘á» vÃ´", "CÃ€NG FIX CÃ€NG Rá»I VÃ€ KHÃ”NG GIáº¢I QUYáº¾T ÄÆ¯á»¢C Váº¤N Äá»€", "tÃ”I KHÃ”NG xÃ³a cache hoáº·c xÃ³a Ä‘á» trong app Ä‘c".
- NguyÃªn nhÃ¢n rá»‘i: Dexie local + catalog builtin váº«n override ná»™i dung má»›i (Cam9 T2 Part1 pháº£i lÃ  ACCOMMODATION FORM, khÃ´ng pháº£i CRIME).
- Giáº£i phÃ¡p triá»‡t Ä‘á»ƒ: xÃ³a sáº¡ch 48 Cam9-20 khá»i catalog/builtin. User tá»± import thá»§ cÃ´ng tá»« Tainguyen (Ä‘Ãºng data).

### ÄÃ£ lÃ m (xÃ³a triá»‡t Ä‘á»ƒ)
- scripts/build-catalog.mjs: disable hoÃ n toÃ n discoverIeltsListeningBundles() + comment rÃµ + bá» gá»i writeGenerated. BUNDLES chá»‰ cÃ²n STATIC (KET/PET/FCE/CAE).
- packages/catalog/src/generatedIeltsListening.ts: xÃ³a háº¿t import + array rá»—ng GENERATED_IELTS_LISTENING_EXAMS = [], header giáº£i thÃ­ch.
- packages/catalog/data/manifest.json: xÃ³a sáº¡ch 48 entry ielts trong "listening", chá»‰ giá»¯ 4 non-ielts.
- XÃ³a 48 file listening-ielts-cam*.json trong packages/catalog/data/.
- XÃ³a 48 thÆ° má»¥c ielts-cam*-test* (kÃ¨m mp3) trong apps/web/public/catalog/listening/.
- builtinExams.ts, listeningExamData.ts, listeningExamLoader.ts: tá»± Ä‘á»™ng sáº¡ch (dá»±a CATALOG + GENERATED rá»—ng). KhÃ´ng cÃ²n force cam9 cÅ©.

### Káº¿t quáº£
- Catalog chá»‰ ship 4 Ä‘á» Listening (KET A2, PET B1, FCE B2, CAE C1).
- 48 IELTS Cam9-20 khÃ´ng cÃ²n lÃ  "Ä‘á» máº«u" builtin.
- User import tá»« Tainguyen/IELTS/... sáº½ khÃ´ng conflict.

### Lá»‡nh user cháº¡y
pnpm build:catalog   # (tÃ¹y chá»n, Ä‘Ã£ edit trá»±c tiáº¿p)
pnpm dev
â†’ hard refresh (Ctrl+Shift+R)
Sau Ä‘Ã³ dÃ¹ng Import thá»§ cÃ´ng Listening Ä‘á»ƒ Ä‘Æ°a Ä‘á» Tainguyen vÃ o.

### Verify
- tsc pass
- Chá»‰ cÃ²n catalog listening 4 entries
- KhÃ´ng cÃ³ "catalog-listening-ielts" active trong code paths

---

### Cam10 Test 3 Part 4 â€” Leaders / Conclusion (2026-07-04)
- `exam_part4.json`: bá»• sung Ä‘á»§ section **Leaders**, **Conclusion**, cÃ¡c dÃ²ng static (Prevention Focus, inspire promotion/prevention, káº¿t luáº­n sau Q40).
- `exam.json` + ZIP: `pnpm ielts:bundle "IELTS/Listening IELTS_Test3_Cam10"` â€” validate pass.
- `scripts/build-ielts-cam9-10-listening.py` `cam10_t3_p4()` Ä‘á»“ng bá»™ cÃ¹ng cáº¥u trÃºc.

### Cam11 Import DOCX Wizard â€” ngáº¯t dÃ²ng + phantom P4 (2026-07-04)
- **Triá»‡u chá»©ng:** Import DOCX Cam11 T1 â€” dÃ²ng trá»‘ng kÃ©p, gap sá»‘ tÃ¡ch thÃ nh paragraph riÃªng (`â— the` / `1` / `Room`); sau Táº¡o JSON Part 4 xuáº¥t hiá»‡n dÃ²ng Cam10 Leadership (*emphasise the results of a mistake*, *inspire prevention focus in followers*) khÃ´ng cÃ³ trong Word.
- **NguyÃªn nhÃ¢n:** `expandMultilineParagraphs` + `partLinesToExamText` join `\n\n`; `repairP4LectureSections` inject gap 39/40 cho má»i Part 4 cÃ³ gap 39.
- **Fix:** Wizard gá»i `extractDocxContent(..., { splitMultilineParagraphs: false })`; `partLinesToExamText` join `\n`; `isLeadershipLectureP4()` â€” chá»‰ repair Leaders/Conclusion khi Ä‘á» Leadership (Cam10 T3), khÃ´ng Ã¡p Ocean Biodiversity.
- **Verify:** Cam11 docx â†’ Part 1 ~41 dÃ²ng (gap inline), Part 4 Ocean Biodiversity, `phantom: false`; tsc pass.

### Cam10 Test 4 Part 1 â€” Address ngáº¯t dÃ²ng (a6 Thorndyke, 2026-07-04)
- **NguyÃªn nhÃ¢n:** AI Import Wizard hay gá»™p `Park Flats (Behind the` thÃ nh má»™t static block â†’ logic gom dÃ²ng khÃ´ng ná»‘i vÃ o `Address: Flat 4, [2]`.
- **Fix `listeningNotePassage.ts`:** `repairFormPassageInlineBlocks()` tÃ¡ch static gá»™p; `formLineCanContinue()` + regex má»Ÿ rá»™ng trong `isFormInlineSegment()`; `prepareNotePassageBlocks` gá»i repair trÆ°á»›c atomize.
- **Fix `ieltsListeningAiNormalize.ts`:** `repairP1FormPassage()` khi normalize AI Part 1; máº·c Ä‘á»‹nh `notePassageLayout: "form"` náº¿u thiáº¿u.
- **Káº¿t quáº£:** má»™t dÃ²ng `Address: Flat 4, | [2] | Park Flats | (Behind the | [3] | )`.

### Batch validate 48 Ä‘á» IELTS Listening (2026-07-04)
- Cháº¡y `pnpm ielts:validate` trÃªn cáº£ 48 folder `Tainguyen/IELTS/Listening IELTS_Test*_Cam*` â†’ **48 PASS, 0 FAIL**.
- Cam11 T1 pass; Part 4 = Ocean Biodiversity (JSON gá»‘c Ä‘Ãºng, khÃ´ng phantom Leadership).
- Chá»‰ cÃ³ **7 file .zip** sáºµn; 41 Ä‘á» cÃ²n láº¡i cáº§n `pnpm ielts:bundle` trÆ°á»›c khi import UI.

## Lá»—i cÃ²n tá»“n táº¡i (cáº­p nháº­t 2026-07-04)
- KhÃ´ng cÃ²n 48 Ä‘á» builtin IELTS trong catalog â†’ user import thá»§ cÃ´ng tá»« Tainguyen.
- **Import Wizard DOCX + AI** váº«n rá»§i ro (gá»™p dÃ²ng form, AI lá»‡ch layout) â€” **khÃ´ng dÃ¹ng** cho 48 Ä‘á» Ä‘Ã£ cÃ³ `exam_part*.json`.
- Náº¿u bug sau import ZIP: sá»­a `exam_partN.json` trong Tainguyen â†’ `pnpm ielts:bundle` â†’ import láº¡i ZIP.
- CÃ¡c media ielts trong dist/ (build cÅ©) sáº½ bá»‹ thay khi rebuild catalog.

## Káº¿ hoáº¡ch session tiáº¿p theo â€” Import 48 Ä‘á» IELTS Listening (ZIP)

**NguyÃªn táº¯c:** DÃ¹ng **Import thá»§ cÃ´ng Listening (ZIP)** â€” KHÃ”NG dÃ¹ng Import Wizard DOCX / Import Word cho bulk.

| BÆ°á»›c | Viá»‡c | Lá»‡nh / UI |
|------|------|-----------|
| 1 | Pack ZIP 48 Ä‘á» | `pnpm ielts:bundle "IELTS/Listening IELTS_Test{N}_Cam{X}"` hoáº·c batch PowerShell (xem Next prompt) |
| 2 | Pilot 3 Ä‘á» | Cam11 T1, Cam10 T3 (Leadership), Cam9 T2 â€” import ZIP, so UI vá»›i `IELTS_Test*_Listening_Cam*.html` |
| 3 | Import hÃ ng loáº¡t | Luyá»‡n thi â†’ IELTS â†’ **Import thá»§ cÃ´ng Listening** â†’ chá»n tá»«ng `.zip` |
| 4 | Kiá»ƒm tra UI | P1 gap inline, P2 map/diagram, P4 Ä‘Ãºng tiÃªu Ä‘á» lecture |
| 5 | (TÃ¹y chá»n) Ship catalog | Sau khi UI á»•n â†’ báº­t láº¡i builtin IELTS + `pnpm build:catalog` + deploy |

**TrÃ¡nh nháº§m 3 nÃºt Import Listening:**
| NÃºt | DÃ¹ng cho 48 Ä‘á»? |
|-----|-----------------|
| **Import thá»§ cÃ´ng Listening** (ZIP) | **CÃ³ â€” Ä‘Æ°á»ng chÃ­nh** |
| **Import Word** (DOCX parser) | KhÃ´ng (Ä‘Ã£ cÃ³ JSON trong Tainguyen) |
| **Import Wizard â†’ Import DOCX** (AI) | **KhÃ´ng** (dá»… lá»—i ngáº¯t dÃ²ng / phantom P4) |

### IELTS Reading Import Wizard (paste + AI, 2026-07-04)
- **Flow giá»‘ng Listening Wizard:** Setup (title, Cam/Test, Answer Key 1â€“40) â†’ Passage 1â€“3 (chá»n template, paste Word, AI JSON) â†’ Preview â†’ LÆ°u Dexie.
- **Files má»›i:** `ieltsReadingWizard/IeltsReadingImportWizard.tsx`, `WizardPassageStepPanel.tsx`.
- **Core Ä‘Ã£ cÃ³:** config, templates (18 layout), AI prompt/normalize/generate, persist (`ielts-reading-import-wizard-draft`).
- **ExamTrackPage:** nÃºt **Import Wizard Reading** trÃªn track IELTS + badge "CÃ³ nhÃ¡p".
- **CSS:** reuse `ieltsListeningWizard.css` + `.ielts-wizard-template-card--text` cho template khÃ´ng áº£nh.
- **Save:** `buildReadingExamFromImport` + `examRecordFromReading(exam, 'manual', wizard-camX-testY)`.

## Session 2026-07-05 â€” HTML mock Ä‘áº§y Ä‘á»§ tá»« exam_part*.json (user lÃ m DOCX riÃªng)

### Bá»‘i cáº£nh
- User sáº½ tá»± lÃ m file **DOCX** giá»‘ng Ä‘á» thi tháº­t nháº¥t.
- HTML trong `Tainguyen/IELTS/.../*.html` trÆ°á»›c Ä‘Ã³ **thiáº¿u** báº£ng, map, flow-chart, section headers, example.

### ÄÃ£ lÃ m
- Viáº¿t láº¡i `gen.py` â€” nguá»“n chÃ­nh `exam_part1â€“4.json` (fallback `exam.json`):
  - `noteTable` / `noteTables` (báº£ng P1 Cam20, P2 Cam9 T2, P4 tableâ€¦)
  - `map.jpg` / `diagram.jpg` nhÃºng relative
  - Section headers (`sectionRange`, `sectionInstruction`, `sectionTitle`)
  - MC, Choose TWO (gá»™p 2 cÃ¢u), map labeling Aâ€“I, flow-chart Aâ€“H, matching list
  - Example block P1, form/lecture layout, gap inline
- `pnpm gen:ielts-html` (= `python gen.py`) â€” regenerate 48 file + copy `Tainguyen/PDF to HTML/`
- Verify: Cam20 T1 cÃ³ báº£ng Restaurant; Cam9 T2 cÃ³ báº£ng Parks + MC Ä‘Ãºng JSON + `map.jpg` HINCHINGBROOKE; Cam9 T1 cÃ³ Example + Q9 inline

### Workflow Ä‘á» xuáº¥t (DOCX + HTML)
| BÆ°á»›c | User / Agent |
|------|----------------|
| 1 | User lÃ m DOCX theo Ä‘á» giáº¥y |
| 2 | (Tuá»³ chá»n) ChatGPT/Import Wizard â†’ `exam_partN.json` |
| 3 | `pnpm ielts:bundle` â†’ ZIP import app |
| 4 | `pnpm gen:ielts-html` â†’ HTML tham chiáº¿u so vá»›i DOCX/PDF |

### Cam11 Test 4 Part 1 â€” FESTIVAL EVENTS table + PLAYS (2026-07-05)
- **Triá»‡u chá»©ng:** notePassage tab-separated lá»™n xá»™n; Jazz thiáº¿u "Also appearing"; Duck races thiáº¿u prize [4]; Flower show venue/notes sai; Q8â€“10 mapLabel Aâ€“I.
- **Fix JSON:** `noteTables` 4 cá»™t Ä‘Ãºng True.jpg (break trong Notes Duck races); `[6] Hall`; PLAYS matching Aâ€“C.
- **ZIP:** `Listening IELTS_Test4_Cam11.zip` repack.

### Cam12 Test 1 Part 1 â€” FAMILY EXCURSIONS form notes (2026-07-05)
- **Tham chiáº¿u:** `Tainguyen/IELTS/Fix/Cam 12/Test 1/True.jpg`.
- **Triá»‡u chá»©ng:** Cyclists need â€” repair kit / food and drink / [8] gom má»™t dÃ²ng; Q4 `â€¢ â€¢`; sub-list thiáº¿u `â€“`.
- **Fix JSON:** `â€¢ Cyclists need:` + `â€“` sub-items; Q4 `â€¢` + gap; `np_section("Cost")`; terminal Q7 khÃ´ng bullet.
- **Fix build:** `cam12_t1_p1()` trong `build-ielts-cam12-v2-listening.py`; skip `_enrich_passage_bullets` khi JSON Ä‘Ã£ cÃ³ markers.
- **Fix renderer:** `shouldAppendToFormLine` â€” khÃ´ng gom chá»¯ `a` vÃ o dÃ²ng bullet trÆ°á»›c.
- **ZIP:** `Listening IELTS_Test1_Cam12.zip` repack PASS.

### Cam11 Test 4 Part 4 â€” Soil / COâ‚‚ lecture notes (2026-07-05)
- **Tham chiáº¿u:** `Tainguyen/IELTS/Fix/Cam 11/Test 4/True.jpg`.
- **Triá»‡u chá»©ng:** thiáº¿u nhiá»u bullet (Claims 13%, carbon lost, fertilizer, e.g. year-round); Q35â€“36 gom má»™t dÃ²ng; tiÃªu Ä‘á» sai; Australia/Future sections thiáº¿u text.
- **Fix JSON:** `notePassage` Ä‘áº§y Ä‘á»§ theo True.jpg; `passageTitle` THE USE OF SOIL TO REDUCE COâ‚‚ IN THE ATMOSPHERE; Q35/Q36 tÃ¡ch dÃ²ng; `notePassageLayout: lecture`.
- **Fix build:** `cam11_t4_p4()`; `_is_prose_after_section` â€” section káº¿t thÃºc `:` giá»¯ bullet list.
- **ZIP:** `Listening IELTS_Test4_Cam11.zip` repack PASS.

### Cam11 Test 4 Part 2 â€” MUSEUM COLLECTIONS + MUSEUM PLAN (2026-07-05)
- **Tham chiáº¿u:** `Tainguyen/IELTS/Fix/Cam 11/Test 4/True.jpg` + `MUSEUM PLAN.jpg`.
- **Triá»‡u chá»©ng:** Q11â€“20 táº¥t cáº£ `mapLabel: true` + options Aâ€“I; Q11â€“16 render map thay vÃ¬ matching bank Aâ€“G; Q17â€“20 thiáº¿u áº£nh plan; `notePassage` junk; `sectionTitle` sai.
- **Fix JSON:** Q11â€“16 matching Aâ€“G (nhÃ£n Ä‘áº§y Ä‘á»§, khÃ´ng `mapLabel`); Q17â€“20 `mapLabel` + Aâ€“H; `sectionTitle` MUSEUM COLLECTIONS / MUSEUM PLAN; `imageFile: map.jpg`.
- **Fix build:** `cam11_t4_p2()` â€” instruction Ä‘Ãºng True.jpg; prompts Q17â€“20 lowercase.
- **áº¢nh:** copy `MUSEUM PLAN.jpg` â†’ `map.jpg`; `meta.json` restore version 1.
- **ZIP:** `pnpm ielts:merge` + `validate` + `pack` â†’ `Listening IELTS_Test4_Cam11.zip` PASS.

### Cam11 Test 3 Part 4 â€” Ethnography in business notes (2026-07-05)
- **Triá»‡u chá»©ng:** Hospitals/Airlines dÃ­nh vÃ o dÃ²ng Computer companies; thiáº¿u bullet Uganda, Principles; trail [34] tÃ¡ch dÃ²ng + bullet thá»«a.
- **Fix JSON:** `notePassage` Ä‘áº§y Ä‘á»§ theo True.jpg; subsection = `section`; `passageTitle` ETHNOGRAPHY IN BUSINESS; `notePassageLayout: lecture`.
- **Fix renderer:** `isShortContinuation` nháº­n trail dÃ i (`to improve communicationâ€¦` â‰¤100 kÃ½ tá»±).

### Cam11 Test 3 Part 3 â€” báº£ng Q21â€“26 + matching REPORT PARTS (2026-07-05)
- **Triá»‡u chá»©ng:** notePassage inline lá»™n xá»™n (bullet, text dÃ­nh); Q27â€“30 hiá»‡n Aâ€“I + mapLabel sai; khÃ´ng cÃ³ báº£ng 2 cá»™t.
- **Fix JSON:** `noteTables` 3 hÃ ng Ä‘Ãºng True.jpg; bá» `notePassage`; Q27â€“30 matching Aâ€“D + `sectionTitle` REPORT PARTS.
- **Fix UI:** `ListeningIeltsNoteTable` placeholder trá»‘ng; `__cell` flex baseline; matching bank inline cho 4 option ngáº¯n.

### Cam11 Test 3 Part 2 â€” thiáº¿u map.jpg Q16â€“20 (2026-07-05)
- **Triá»‡u chá»©ng:** Questions 16â€“20 khÃ´ng hiá»‡n sÆ¡ Ä‘á»“ `map.jpg` (chá»‰ cÃ³ dropdown matching).
- **NguyÃªn nhÃ¢n:** `exam_part2.json` bá»‹ sai â€” Q16â€“20 thÃ nh `gap-fill`, thiáº¿u `imageFile`, `mapLabel`, `sectionTitle` PLANS FOR FACILITIES.
- **Fix:** Regenerate tá»« `cam11_t3_p2()` + `imageFile: "map.jpg"` + `mapLabel: true`; copy `map.jpg` tá»« Fix folder; ZIP repack.
- **UI:** `ListeningIeltsMapBlock` â€” layout stacked + option bank Aâ€“G khi cÃ³ nhÃ£n Ä‘áº§y Ä‘á»§.

### Cam11 Test 2 Part 4 â€” ngáº¯t dÃ²ng lecture Taylor Concert Hall (2026-07-05)
- **Triá»‡u chá»©ng:** `â— symbolic meaning` gom vÃ o dÃ²ng `physical and [31] context`; 3 bullet auditorium gom má»™t dÃ²ng dÃ i [37][38][39].
- **NguyÃªn nhÃ¢n:** `shouldAppendToFormLine` coi bullet má»›i lÃ  trail vÃ¬ `isShortContinuation(bareNoteText)` tráº£ true trÃªn text lowercase nhiá»u tá»« sau khi gá»¡ marker.
- **Fix:** `isMisplacedGapTrailBullet()` â€” chá»‰ gom bullet nháº§m trÃªn trail ngáº¯n (Room â€“ seats 100); bullet list item tháº­t â†’ dÃ²ng má»›i.
- **Káº¿t quáº£:** Introduction 3 bullet riÃªng; auditorium 3 dÃ²ng riÃªng; Building design / Evaluation Ä‘Ãºng.

### Cam11 Test 2 Part 1 â€” ngáº¯t dÃ²ng form Youth Council (2026-07-05)
- **Tham chiáº¿u:** `Tainguyen/IELTS/Fix/Cam 11/Test 2/True.jpg` (Ä‘Ãºng) vs `NotTrue.jpg` (app sai).
- **Triá»‡u chá»©ng:** bullet `â€¢` tá»± inject sau gap; `Street, Stamford, Lincs` / `, and is interested in the` tÃ¡ch dÃ²ng; `Example â€“ Name: Roger Brown` thÃ nh block example; `Occupationâ€¦[4] Studying [5]` gom má»™t dÃ²ng.
- **Fix `listeningNotePassage.ts`:** `formPassageWithoutBullets()`, `isExampleMarkerLine()` (chá»‰ `"Example"`), `FORM_COMMA_TRAIL_RE` / `FORM_ADDRESS_TRAIL_RE`, `during the week` trong `SAME_LINE_GAP_TRAIL_RE`; `isFormSubFieldStarter()` â€” `Studying` sau [4] = dÃ²ng má»›i thá»¥t lá».
- **Fix UI:** `listening-ielts-notes__line--indent` cho sub-field; title trong box khi `notePassageLayout: "form"`.
- **JSON:** `exam_part1.json` Ä‘Ã£ tÃ¡ch block Ä‘Ãºng; ZIP repack: `pnpm ielts:merge` + `pnpm ielts:pack` â†’ `Listening IELTS_Test2_Cam11.zip`.
- **DÃ²ng sau fix:** Occupationâ€¦[4] | Studying [5]â€¦ (2 dÃ²ng); Hobbies [6][7] cÃ¹ng dÃ²ng; khÃ´ng bullet thá»«a.

### Cam12 Test 3 Part 4 â€” mercury/birds lecture line splits (2026-07-05)
- **Triá»‡u chá»©ng:** Claire Q32/Q33 gom má»™t dÃ²ng; `â€“ the effects on bird song (usually learned from a bird's` bá»‹ tÃ¡ch máº¥t marker `â€“`.
- **NguyÃªn nhÃ¢n:** `repairFormPassageInlineBlocks()` tÃ¡ch nháº§m dÃ²ng cÃ³ ngoáº·c `(` trÃªn lecture notes cÃ³ `â€¢/â€“`.
- **Fix renderer:** `repairFormPassageInlineBlocks` â€” skip khi `notePassageHasStructuredMarkers()`; khÃ´ng tÃ¡ch block Ä‘Ã£ cÃ³ `â€¢/â€“`.
- **JSON:** `exam_part4.json` Ä‘Ã£ Ä‘Ãºng (coal/fish 2 dÃ²ng; Claire 3 dÃ²ng; Findings 3 dÃ²ng; Lab-based 2 dÃ²ng); `notePassageLayout: lecture`.
- **ZIP:** `Listening IELTS_Test3_Cam12.zip` merge + validate + pack PASS.
- **Q37:** Gá»™p `â€¢ Migrating birds such as [37]` + trail `containing mercuryâ€¦` má»™t dÃ²ng (bá» `â€¢` trÃªn trail block).

### Cam12 Test 4 Part 1 â€” address Q7 inline (2026-07-05)
- **Triá»‡u chá»©ng:** `address: 277` + gap + `Place, Dumfries` tÃ¡ch 2 dÃ²ng; sá»‘ nhÃ  sai `277` thay vÃ¬ `27`.
- **Fix JSON:** `â€¢ address: 27` + gap 7 + `Place, Dumfries`; prompt `Address: 27 â€¦ Place:`.
- **Fix renderer:** `FORM_ADDRESS_TRAIL_RE` nháº­n `Place,` (vÃ  road/lane/avenue/drive) â€” trail sau gap cÃ¹ng dÃ²ng.
- **ZIP:** `Listening IELTS_Test4_Cam12.zip` merge + validate + pack PASS.

### Cam13 Test 1 â€” P1 table + P2/P3 headers + flow-chart end (2026-07-05)
- **P1:** HÃ ng Example trÆ°á»›c The Food Studio; Bond's col3 hÃ ng 2 = small classes/[2]/[3]; recipes/[5]/lecture/[6] hÃ ng tiáº¿p; Q10 trail `is sometimes available`.
- **P2:** XÃ³a `sectionTitle` Traffic Changes in Granford (Q11).
- **P3:** XÃ³a `sectionTitle` Seed germination (Q21); `ListeningIeltsFlowChartBlock` Ä‘á»c `flowChartEnd` tá»« cÃ¢u cuá»‘i â†’ hiá»‡n `Investigate the findings.` sau Q30.
- **ZIP:** `Listening IELTS_Test1_Cam13.zip` merge + validate + pack PASS.

### Cam13 Test 1 Part 4 â€” urban animals lecture line splits (2026-07-05)
- **Intro:** Gá»™p 2 cÃ¢u má»™t dÃ²ng; bá» `It was` â†’ `Previously thoughtâ€¦`
- **Q31:** `â€¢ the [31] â€” because of its general adaptability` má»™t dÃ²ng (`EM_DASH_GAP_TRAIL_RE`)
- **Q32/Q33:** TÃ¡ch pigeon + `In factâ€¦[33]` hai dÃ²ng
- **Q40:** Gá»™p `Speciesâ€¦cities. However, some changes may not be [40]`
- **ZIP:** repack PASS

### Cam13 Test 1 Part 1 â€” COOKERY CLASSES table vs true.jpg (2026-07-05)
- **Tham chiáº¿u:** `Tainguyen/IELTS/Fix/Cam 13/Test 1/true.jpg`
- **Sá»­a:** 3 hÃ ng dá»¯ liá»‡u â€” HÃ ng 1: `Example` + `The Food Studio` (cÃ¹ng Ã´) | focus [1] | Other Info small classes/[2]/[3]; HÃ ng 2: Bond's | [4] | recipes [5]/lecture [6]; HÃ ng 3: The [7] Centre | [8] | [9]/[10] is sometimes available.
- **ZIP:** repack PASS

### Cam13 Test 2 â€” P1 Level B + P2/P3 titles + P4 line splits (2026-07-05)
- **P1:** `Level 8` â†’ `Level B`; bá» trail `kph`
- **P2:** XÃ³a `Information on company volunteering projects`
- **P3:** XÃ³a `Planning a presentation on nanotechnology`
- **P4:** Encoding 3 dÃ²ng; Consolidation 3 dÃ²ng; impairments 2 dÃ²ng (bá» `â€¢` trail block sai)
- **ZIP:** `Listening IELTS_Test2_Cam13.zip` repack PASS

### Cam13 Test 3 â€” P1â€“P4 fixes (2026-07-05)
- **P1:** TÃ¡ch `Lindaâ€¦[2]` / `Limited [3] in city centre` (`isMisplacedGapTrailBullet` â€” khÃ´ng gom `â€¢ Limited`)
- **P2:** XÃ³a `Physical activities`; bá» option C `set a time limit` (Q19â€“20)
- **P3:** XÃ³a `Project on using natural dyesâ€¦`; matching title `Natural dyes` â†’ `Problems`
- **P4:** `Possible reasons:` â†’ section; 3 dÃ²ng prose + `â€¢ to provide [37]â€¦` (`isProseLineBreakAhead`)
- **ZIP:** `Listening IELTS_Test3_Cam13.zip` repack PASS

### Cam13 Test 4 â€” P2 title + P4 Q38 order (2026-07-05)
- **P2:** XÃ³a `sectionTitle` The Snow Centre (Q11)
- **P4:** DÃ²ng Q38 (`The move towards the consumption of [38]â€¦`) Ä‘áº·t trÆ°á»›c section `Coffee in the 19th century` (Ä‘Ãºng Ä‘á» giáº¥y)
- **ZIP:** `Listening IELTS_Test4_Cam13.zip` repack PASS

### Cam14 Test 1 â€” P1 form + P2 title + P4 lecture (2026-07-05)
- **P1:** `Current address: [3] Apartments (No 15)` gá»™p 1 dÃ²ng; wallet Â£[4] / `â€¢ a [5]` tÃ¡ch 2 dÃ²ng; `Crime reference number allocated [10]` inline (bá» section)
- **Renderer:** `FORM_BUILDING_TRAIL_RE` + `isMisplacedGapTrailBullet` khÃ´ng gom `â€¢ a` sau gap (Cam14 T1 P1)
- **P2:** XÃ³a `sectionTitle` Induction talk for new apprentices (Q11)
- **P4:** Viáº¿t láº¡i `notePassage` â€” What's needed, Wave prose, lagoon bullets, Advantages/Problem sections, Ocean thermal energy conversion; `notePassageLayout: lecture`
- **Build:** `cam14_t1_p1/p2/p4()` trong `build-ielts-cam13-14-listening.py` khá»›p JSON
- **ZIP:** `Listening IELTS_Test1_Cam14.zip` validate + pack PASS

### Cam19 Test 3 â€” P1 notes + P3 flowchart (2026-07-05)
- **P1 Q1â€“6:** Äá»•i tá»« báº£ng 2 cá»™t sang `notePassageSections` â€” **Where to go** / **Fish market** / **Organic shop** / **Supermarket** + bullet `â€¢` (khá»›p True.jpg Fix/Cam 19); thÃªm `pm, earlier than closing time` sau Q3
- **P1 Q7â€“10:** Giá»¯ báº£ng Shopping / To buy / Other ideas
- **P3:** XÃ³a `flowChartEnd: Investigate the findings.` sau Q30
- **ZIP:** `Listening IELTS_Test3_Cam19.zip` merge + validate + pack PASS

### Cam19 Test 4 â€” P1 First day at work True.jpg (2026-07-05)
- **P1 Q1â€“6:** Äá»•i tá»« báº£ng 2 cá»™t sang `notePassageLayout: form` + `notePassageSections` â€” bullet `â€¢` + gap inline trong box **First day at work** (khá»›p True.jpg Fix/Cam 19); bá» `in staffroom` sau Q2
- **P1 Q7â€“10:** Header **Responsibility** (khÃ´ng Section); Sushi â†’ **Sushi takeaway counter**; Q8 chuyá»ƒn sang Task 1 `Re-stock with [8] boxes if needed`; Task 2 gá»™p `Wipe preparation area and clean the sink` + `Do not clean any knives`; Notes static
- **Build:** `cam19_t4_p1()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test4_Cam19.zip` merge + validate + pack PASS

### Cambridge A2â€“C2 â€” Library Archives UI (2026-07-05)
- **ExamTrackPage** `/app/exam/track/cambridge/{a2|b1|â€¦}` â€” Reading + Listening dÃ¹ng `IeltsLibraryArchive` giá»‘ng IELTS (`Giaodien/GiaodienListeningIELTS.jpg`)
- **BÃ¬a sÃ¡ch:** `KET` / `PET` / `FCE` / `CAE` / `CPE` + sá»‘ quyá»ƒn; tiÃªu Ä‘á» card `CAMBRIDGE KET 1`â€¦
- **NhÃ³m Ä‘á»:** `cambridgeLibraryGrouping.ts` â€” Test N â†’ Book ceil(N/4); search `Test 2`, `Book 1`
- **CSS:** `exam-hub-page--ielts` layout cho cáº£ Cambridge level pages

### Cam20 Test 4 â€” P4 Chembe Bird Sanctuary True.jpg (2026-07-05)
- **P4:** `passageTitle` "Research in the area around Chembe Bird Sanctuary" (bá» section trÃ¹ng); section 1 bullets `â€¢`; "Falling numbers" â€” parent `accidentally killed:` + sub `â€“ by [34]` / `â€“ by electrocutionâ€¦ [35]`; "Ways of protecting" â€” `frightening birds of prey by:` + sub `â€“ keeping a [38]` / `â€“ making a [39] â€“ e.g.â€¦`
- **Build:** `cam20_t4_p4()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test4_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 4 â€” P1 Advice on family visit True.jpg (2026-07-05)
- **P1:** `passageTitle` "Advice on family visit" (bá» section trÃ¹ng); gap inline Q1/Q3/Q9; Q2 `Â£ [2]`; Science Museum 2 dÃ²ng `â€¢`; Food 2 bullet `â€¢ Clacton Marketâ€¦ food` + `â€¢ need to have lunchâ€¦`; Free activities label + 2 bullet `â€¢`
- **Build:** `cam20_t4_p1()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test4_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 3 â€” P4 Inclusive design True.jpg + map.jpg (2026-07-05)
- **P4:** Khá»›p True.jpg Fix/Cam 20 â€” `passageTitle: Inclusive design`; **Definition** / **Examples** cÃ³ `â€¢` + gap inline; Q32 thÃªm ` problems` sau gap
- **To assist the elderly:** section + `â€¢` 2 má»¥c; **Impact** â€” Access / Safety / Comfort in the workplace + sub `â€“`
- **Build:** `cam20_t3_p4()` + `notePassageLayout: lecture`
- **map.jpg:** Copy `Tainguyen/.../Test3_Cam20/map.jpg` â†’ catalog `ielts-cam20-test3`
- **ZIP:** `Listening IELTS_Test3_Cam20.zip` merge + validate + pack PASS (gá»“m map.jpg)

### Cam20 Test 3 â€” P1 Furniture rental companies True.jpg (2026-07-05)
- **P1:** Khá»›p True.jpg Fix/Cam 20 â€” báº£ng 3 cá»™t **Furniture rental companies** + bullet `â€¢` trong Ã´ nhiá»u dÃ²ng
- **Peak notes:** `â€¢ The furnitureâ€¦` / `â€¢ Delivers in 1-2 days` / `â€¢ Special offerâ€¦`
- **Aaron row:** costs `â€¢ Mid-range prices` + `â€¢ 12% monthly fee for [5]`; notes chá»‰ `Also offers a cleaning service`
- **Larch notes:** `â€¢ Must have own [7]` + `â€¢ Minimum contract length: six months` (khÃ´ng `Must have enough space`)
- **Q8:** `[8] Rentals` â€” gap tÃªn cÃ´ng ty (answer `space` â†’ Space Rentals), khÃ´ng pháº£i sá»‘ 8 tÄ©nh
- **Build:** `CAM20_T3_P1_TABLE` + `cam20_t3_p1()` + `passageTitle`
- **ZIP:** `Listening IELTS_Test3_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 2 â€” P4 Developing food trend True.jpg (2026-07-05)
- **P4:** Khá»›p True.jpg Fix/Cam 20 â€” `passageTitle: Developing food trend` (khÃ´ng trends); bá» section trÃ¹ng tiÃªu Ä‘á»
- **Intro:** `â€¢` má»¥c chÃ­nh; `â€“` sub cho Sales of [32] vÃ  Famous [33]
- **Marketing campaigns:** label `The avocado:` / `Oat milk:` / `Norwegian skrei:` + sub `â€“`; Q34 inline `â€“ [34] were invitedâ€¦`; thÃªm dÃ²ng **A Swedish brand's media campaign received publicity by upsetting competitors.**
- **Ethical concerns:** `Quinoa:` + sub `â€“` cho Q39â€“40
- **Build:** `cam20_t2_p4()` + `notePassageLayout: lecture`
- **ZIP:** `Listening IELTS_Test2_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 2 â€” P1 carers notes True.jpg (2026-07-05)
- **P1:** Khá»›p True.jpg Fix/Cam 20 â€” gap inline (`â€¢ a [1]`, `â€¢ how much [2] the caring involves`, `â€“ [6] her`â€¦); bá» `sectionTitle` thá»«a **Local councils â€” practical support for carers**
- **Q6:** Sá»­a `â€“` tÃ¡ch dÃ²ng â†’ `â€“ ` + gap + ` her` (1 dÃ²ng, khÃ´ng gá»™p vá»›i Q5)
- **Build:** `cam20_t2_p1()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test2_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 1 â€” P4 Reclaiming urban rivers True.jpg (2026-07-05)
- **P4:** Khá»›p True.jpg Fix/Cam 20 â€” `â€¢` má»¥c chÃ­nh; `â€“` sub-list dÆ°á»›i `Industrial developmentâ€¦` vÃ  `In Los Angelesâ€¦`
- **Q33:** `Seals and even a [33] have been seen` (1 dÃ²ng, khÃ´ng bullet láº¡ giá»¯a gap)
- **Q38:** ThÃªm `in cities around the world` sau gap
- **Q39â€“40:** 1 bullet `Instead of road transport, goods could be transportedâ€¦ electric [39], or in the future, by [40]`
- **Build:** `CAM20_T1_P4_NOTE` + `cam20_t1_p4()` + `notePassageLayout: lecture`
- **ZIP:** `Listening IELTS_Test1_Cam20.zip` merge + validate + pack PASS

### Cam19 Test 4 â€” P4 Tree planting True.jpg (2026-07-05)
- **P4:** Khá»›p True.jpg â€” `passageTitle: Tree planting`; section **Reforestation projects should:** (khÃ´ng bullet); 5 má»¥c dÃ¹ng `â€¢`; **Large-scale** / **Lampang** / **Involving local communities** cÃ³ `â€¢` má»¥c chÃ­nh
- **Lampang:** sub-list `â€“ supporting many wildlife species` + `â€“ increasing the [37]â€¦ e.g., [38] were soon attracted` (1 dÃ²ng, khÃ´ng tÃ¡ch bullet giá»¯a Q37)
- **Mangrove project:** sub-list `â€“` cho 3 má»¥c dÆ°á»›i `The mangrove reforestation project:`
- **Build:** `cam19_t4_p4()` + `notePassageLayout: lecture`
- **ZIP:** `Listening IELTS_Test4_Cam19.zip` merge + validate + pack PASS

### Cam19 Test 2 â€” P1 table row + P4 Tardigrades True.jpg (2026-07-05)
- **P1 Q7â€“10:** ThÃªm dÃ²ng `5 minutes` / `noting things to practise at home` dÆ°á»›i hÃ ng `10 minutes` / `playing single notesâ€¦`
- **P4:** Khá»›p True.jpg â€” `â€¢` má»i má»¥c; `â€¢ a [32] round bodyâ€¦` 1 dÃ²ng; Cryptobiosis/Feeding/Conservation cÃ³ bullet; `â€¢ may eat other tardigrades` tÃ¡ch dÃ²ng
- **ZIP:** `Listening IELTS_Test2_Cam19.zip` merge + validate + pack PASS

### Cam19 Test 1 â€” P1 + P4 Fix/Cam 19 True.jpg (2026-07-05)
- **P1:** Bá» section trÃ¹ng `Hinchingbrooke Country Park` (chá»‰ `passageTitle` trong box); giá»¯ `The park` + bullet `â€¢` + gap inline
- **P4:** Khá»›p True.jpg â€” `â€¢` má»i má»¥c chÃ­nh; `â€“` chá»‰ sub dÆ°á»›i Discovery / Neolithic innovations; `â€¢ His [32] becameâ€¦` 1 dÃ²ng; `â€¢ Itemsâ€¦[34]`; `â€¢ Each fieldâ€¦` / `â€¢ The fieldsâ€¦` (khÃ´ng `â€“`); `â€¢` Reasons Q39â€“40

### Cam19 Test 1 â€” P4 bullets + map.jpg (2026-07-05)
- **P4:** ThÃªm `â€¢` / `â€“` Ä‘Ãºng Ä‘á» giáº¥y; tÃ¡ch **Neolithic innovations include:** â†’ `â€“ cooking indoors` / `â€“ pots used for storage and to make [36]` (3 dÃ²ng riÃªng)
- **Build:** `cam19_t1_p4()` + `notePassageLayout: lecture`, `passageTitle: Ceide Fields`
- **map.jpg:** Copy `Tainguyen/.../Test1_Cam19/map.jpg` â†’ catalog `ielts-cam19-test1`
- **ZIP:** `Listening IELTS_Test1_Cam19.zip` merge + validate + pack PASS (gá»“m map.jpg)

### Cam18 Test 2 â€” P1 notes + map.jpg (2026-07-05)
- **P1 Q1â€“5:** Äá»•i tá»« báº£ng 2 cá»™t (Section | Details) sang `notePassageLayout: form` + `notePassageSections` â€” **Benefits** / **Person specification** trong box, bullet + gap inline (khá»›p True.jpg Fix/Cam 18)
- **P1 Q6â€“10:** Giá»¯ `noteTables` (Location / Job title / â€¦)
- **map.jpg:** Copy `Tainguyen/.../Test2_Cam18/map.jpg` â†’ `apps/web/public/catalog/listening/ielts-cam18-test2/map.jpg`; ZIP pack gá»“m `map.jpg`
- **Build:** `cam18_t2_p1()` trong `build-ielts-cam17-18-listening.py`
- **ZIP:** `Listening IELTS_Test2_Cam18.zip` merge + validate + pack PASS

### Cam18 Test 1 â€” P1 Q6â€“Q7 two lines (2026-07-05)
- **P1 Q6â€“Q7:** TÃ¡ch `â€“ bus today was [6]` vÃ  `â€“ frequency of buses in the [7]` thÃ nh 2 dÃ²ng (trÆ°á»›c: gá»™p 1 dÃ²ng khi máº¥t marker `â€“`)
- **Renderer:** `shouldAppendToFormLine` â€” khÃ´ng gom gap-lead má»›i vÃ o dÃ²ng gap trÆ°á»›c (`isGapLeadBlock`)
- **ZIP:** `Listening IELTS_Test1_Cam18.zip` merge + validate + pack PASS

### Cam17 Test 3 â€” P1 Q8 one line (2026-07-05)
- **P1 Q8:** `Average temperature in summer: approx. [8] degrees` gá»™p 1 dÃ²ng (trÆ°á»›c: label / gap / `degrees` tÃ¡ch 3 dÃ²ng)
- **Renderer:** `isFormLabelWithInlineValue` khÃ´ng tÃ¡ch dÃ²ng khi cÃ³ gap ngay sau (`approx.` káº¿t thÃºc báº±ng `.`)

### Cam17 Test 2 â€” P1 notes layout (2026-07-05)
- **P1 Q1â€“7:** Äá»•i tá»« báº£ng 2 cá»™t (Section | Details) sang `notePassageLayout: form` + `notePassageSections` â€” tiÃªu Ä‘á» trong box, section **Library** / **Lunch club**, dÃ²ng Ä‘á»™c láº­p "Help for individuals needed next week", khÃ´ng bullet (khá»›p True.jpg)
- **P1 Q8â€“10:** Giá»¯ `noteTables` â€” báº£ng **Village social events**
- **Renderer:** `FORM_ROOM_IN_TRAIL_RE` â€” gá»™p `[3] Room in the village hall` cÃ¹ng dÃ²ng
- **Build:** `cam17_t2_p1()` trong `build-ielts-cam17-18-listening.py`
- **ZIP:** `Listening IELTS_Test2_Cam17.zip` merge + validate + pack PASS

## Listening IELTS Cam 9â€“20 â€” HOÃ€N THÃ€NH (2026-07-05)

- [x] **48/48** folder `Tainguyen/IELTS/Listening IELTS_Test*_Cam*` â€” `pnpm ielts:validate` PASS
- [x] Fix layout True.jpg (P1 form/table, P2 map, P3 flow-chart, P4 lecture/bullets) â€” Cam 9â€“20
- [x] Build scripts: `build-ielts-cam9-10` â€¦ `cam19-20-listening.py` + renderer fixes (`ListeningIeltsNotePassage`, form line groupingâ€¦)
- [x] `pnpm gen:ielts-html` â€” HTML tham chiáº¿u 48 Ä‘á»
- [ ] **Batch pack ZIP** â€” nhiá»u folder chÆ°a cÃ³ `.zip` cáº¡nh folder (cháº¡y lá»‡nh bÃªn dÆ°á»›i)
- [ ] **Import hÃ ng loáº¡t** vÃ o app + hard refresh
- [ ] **Deploy** `pnpm build:catalog` + `pnpm deploy:prod` khi user sáºµn sÃ ng

**ÄÆ°á»ng import chÃ­nh:** ZIP (`pnpm ielts:bundle`) â€” **khÃ´ng** dÃ¹ng Import Wizard DOCX hÃ ng loáº¡t.

---

## KET A2 Reading & Writing â€” Cam 1 Test 1 + AI cháº¥m Writing (2026-07-06)

- [x] `Tainguyen/Import Cambridge/KET_A2/KET A2_Cam 1/Test 1/exam.json` â€” 7 parts (Q1â€“32), `durationMinutes: 60`, Part 6 email + Part 7 story
- [x] ZIP: `Tainguyen/Import Cambridge/KET_A2/KET A2_Cam 1/ket-reading-test1.zip` (exam.json + part1-q1â€¦q6 + part7-p1â€¦p3)
- [x] AI cháº¥m Part 6â€“7: `ketRw/ketWritingGrade.ts` + `KetWritingGradePanel.tsx` â€” nÃºt "Cháº¥m Ä‘iá»ƒm AI" trÃªn `ExamResult` (Cambridge 0â€“5, Part 7 vision náº¿u OpenAI/Gemini)
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

---

## PET B1 Reading & Writing â€” shell 8 part + import áº£nh (2026-07-06)

- [x] `apps/web/src/features/exam/petRw/` â€” UI shell 8 part (P1 signs â€¦ P6 cloze, P7â€“P8 writing) giá»‘ng Giaodien `Reading_Writing_PET_B1`
- [x] `petWritingImportUtils.ts` â€” merge áº£nh Part 2/4/7/8; **Part 8 chá»‰ 1 áº£nh** `part8-page.jpg` (khÃ´ng tÃ¡ch p1â€¦p3 nhÆ° KET Part 7)
- [x] `cambridgeReadingImportTemplates.ts` â€” B1 template 8 parts (34 cÃ¢u), hint Part 8 = 1 áº£nh
- [x] `ReadingTest.tsx` route B1 â†’ `ReadingPetRwTest`; `ImportReadingManualModal` hint Part 8 (1 áº£nh)
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass
- [x] `HDSD/Prompt-PET-B1-Reading-Universal.txt` â€” cáº­p nháº­t 8 part RW; Part 8 = 1 áº£nh `part8-page.jpg`

**Import áº£nh PET (tuá»³ chá»n sau JSON):**

| File | Má»¥c Ä‘Ã­ch |
|------|----------|
| `part7-page.jpg` | Äá» Writing Part 7 |
| `part8-page.jpg` | **1 áº£nh** truyá»‡n Part 8 (3 khung trong 1 file) |
| `part2-page.jpg`, `part2-q6â€¦q10.jpg`, `part4-page.jpg` | Layout/áº£nh Part 2/4 |

---

## FCE B2 Reading & Writing â€” shell 9 part + import áº£nh (2026-07-06)

- [x] `apps/web/src/features/exam/fceRw/` â€” UI shell 9 part (P1â€“P7 Reading + P8 essay + P9 story) giá»‘ng Giaodien `Reading_Writing_FCE_B2`
- [x] `fceWritingImportUtils.ts` â€” Part 8 = `part8-page.jpg`; Part 9 = **1 áº£nh** `part9-page.jpg` (nhÆ° PET Part 8); merge cáº­p nháº­t passage khi part Ä‘Ã£ cÃ³ trong JSON
- [x] `cambridgeReadingImportTemplates.ts` â€” B2 template 9 parts (54 cÃ¢u), hint Part 8â€“9 áº£nh JPG
- [x] `ReadingTest.tsx` route B2 â†’ `ReadingFceRwTest`; `ImportReadingManualModal` hint Part 8â€“9
- [x] `cambridgeExamFormats.ts` + `readingExamDuration.ts` â€” 80 phÃºt, 9 parts
- [x] Catalog `reading-fce-b2-test1.json` â€” metadata Reading & Writing 80 phÃºt (7 parts builtin; Part 8â€“9 qua import áº£nh)
- [x] Part 7 UI + catalog: **Paragraph A** â€¦ **Paragraph D** (passage heading + options)
- [x] `HDSD/Prompt-FCE-B2-Reading-Universal.txt` â€” cáº­p nháº­t 9 part RW, Part 7 Paragraph, Part 8â€“9 áº£nh 1 file/part
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

**Import áº£nh FCE (sau JSON 7 hoáº·c 9 part):**

| File | Má»¥c Ä‘Ã­ch |
|------|----------|
| `part8-page.jpg` | Äá» Writing Part 8 (essay) |
| `part9-page.jpg` | **1 áº£nh** truyá»‡n Part 9 (3 khung trong 1 file) |

---

## CAE C1 Reading & Writing â€” shell 10 part + import áº£nh (2026-07-06)

- [x] `apps/web/src/features/exam/caeRw/` â€” UI shell 10 part (P1â€“P8 Reading + P9â€“P10 Writing) giá»‘ng Giaodien `Reading_Writing_CAE_C1`
- [x] `CaeRwPartContent.tsx` â€” P6 Reviewer Aâ€“D; P7 gapped text kÃ©o tháº£; P8 Consultant Aâ€“E; P9 Q57 + P10 Q58 (220â€“260 tá»«, má»—i part 1 áº£nh)
- [x] `caeWritingImportUtils.ts` â€” Part 9 = `part9-page.jpg` (Q57); Part 10 = `part10-page.jpg` (Q58)
- [x] `cambridgeReadingImportTemplates.ts` â€” C1 template 10 parts (58 má»¥c), hint Reviewer/Consultant/Part 9â€“10
- [x] `ReadingTest.tsx` route C1 â†’ `ReadingCaeRwTest`; `ImportReadingManualModal` merge Part 9â€“10
- [x] `examData.ts` â€” `isCaeReadingWritingExam()`; `cambridgeExamFormats.ts` + `readingExamDuration.ts` â€” 90 phÃºt (8 part) / 120 phÃºt (cÃ³ Part 9â€“10)
- [x] Catalog `reading-cae-c1-test1.json` + `Tainguyen/cae-Reading-test1/exam.json` â€” 10 parts; P6/P8 options Reviewer/Consultant; Part 9â€“10 Writing
- [x] Media: `part9-page.jpg`, `part10-page.jpg` trong `Tainguyen/` + `apps/web/public/catalog/reading/cae-c1-test1/`
- [x] `build-catalog.mjs` â€” giá»¯ `minWords` cho writing-task
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass
- [x] `HDSD/Prompt-CAE-C1-Reading-Universal.txt` â€” 10 part RW, Reviewer/Consultant, Part 9â€“10 JPG
- [ ] `part10-page.jpg` builtin â€” hiá»‡n **placeholder** (copy `Part9.jpg`); cáº§n áº£nh riÃªng Q58 khi cÃ³ screenshot

**Cáº¥u trÃºc 10 parts (58 má»¥c):**

| Part | CÃ¢u | UI |
|------|-----|-----|
| 1â€“5 | 1â€“36 | MC cloze, open cloze, keyword list, transformation, reading MC |
| 6 | 37â€“40 | Cross-text: **Reviewer A**â€¦**D** trÃ¡i, radio pháº£i |
| 7 | 41â€“46 | Gapped text: gap trÃ¡i + bank Aâ€“G kÃ©o tháº£ pháº£i |
| 8 | 47â€“56 | Multiple matching: **Consultant A**â€¦**E** |
| 9 | 57 | Writing task 1 â€” split pane, 220â€“260 tá»« |
| 10 | 58 | Writing task 2 â€” split pane, 220â€“260 tá»« |

**Import áº£nh CAE (sau JSON 8 hoáº·c 10 part):**

| File | Má»¥c Ä‘Ã­ch |
|------|----------|
| `part9-page.jpg` | Äá» Writing Part 9 (Q57) |
| `part10-page.jpg` | Äá» Writing Part 10 (Q58) |

**Screenshot ref:** `Giaodien/Taicautruc/Reading_Writing_CAE_C1/Part1.jpg` â€¦ `Part7.jpg`, `Part9.jpg`

---

## CPE C2 Reading & Writing â€” shell 9 part + import áº£nh (2026-07-06)

- [x] `apps/web/src/features/exam/cpeRw/` â€” UI shell 9 part (P1â€“P7 Reading + P8 essay + P9 choice) giá»‘ng Giaodien `Reading_Writing_CPE_C2`
- [x] `cpeWritingImportUtils.ts` â€” Part 8 = `part8-page.jpg` (essay 240â€“280); Part 9 = `part9-page.jpg` (Q2â€“Q4 choice 280â€“320)
- [x] `cambridgeReadingImportTemplates.ts` â€” C2 template 9 parts; Part 4 single-gap transform; Part 6 bank Aâ€“H tá»« passage
- [x] `ReadingTest.tsx` route C2 â†’ `ReadingCpeRwTest`; `ImportReadingManualModal` merge Part 8â€“9
- [x] Catalog `reading-cpe-c2-test1.json` + `Tainguyen/cpe-Reading-test1/` â€” 120 phÃºt
- [x] `HDSD/Prompt-CPE-C2-Reading-Universal.txt` â€” 9 part RW, rules Part 4/6/8â€“9, answer key Test 1; cáº­p nháº­t `Import De Thi.txt`, `Prompt-Reading-Cambridge.txt`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

**Import áº£nh CPE (sau JSON):**

| File | Má»¥c Ä‘Ã­ch |
|------|----------|
| `part8-page.jpg` | Äá» Writing Part 8 (essay) |
| `part9-page.jpg` | Äá» Writing Part 9 (choice Q2â€“Q4) |

**Test nhanh:** `/app/exam/reading/catalog-reading-cpe-c2-test1`

---

## Viá»‡c Ä‘Ã£ hoÃ n thÃ nh (session 2026-07-06 â€” HDSD + UX polish)

### HDSD prompts
- [x] **Listening Universal A2â€“C2** â€” `HDSD/Prompt-Listening-Cambridge.txt` (index) + 5 file `Prompt-{KET-A2|PET-B1|FCE-B2|CAE-C1|CPE-C2}-Listening-Universal.txt`
- [x] **Vocab import** â€” `HDSD/Prompt-Vocab-Universal.txt` (CSV/JSON, cá»™t `phrase` há»— trá»£ cá»¥m tá»«) + `Prompt-Vocab-Chu-De.txt` (6 nhÃ³m IELTS/Oxford/TOEIC/â€¦) + `Import Vocab.txt`

### UX exam
- [x] **NÃºt Exit** Listening FCE/CAE/CPE â€” `ListeningFceTest.tsx` header (`listening-ket-cambridge__exit`), `navigate(listeningExamBackPath(exam))` vá» track Cambridge tÆ°Æ¡ng á»©ng
- [x] **Fix theme Cambridge A2â€“C2 library** â€” token `--color-on-primary: #ffffff` (light/mid/dark) trong `globals.css`; thay `color: var(--bg-primary)` â†’ `var(--color-on-primary)` trÃªn nÃºt primary trong `examHub.css` + modal `ImportReadingManualModal`, `ImportListeningModal`, `ExamResult`

**NguyÃªn nhÃ¢n lá»—i theme:** `--bg-primary` = tráº¯ng (light) / Ä‘en (dark) â€” dÃ¹ng lÃ m mÃ u chá»¯ trÃªn ná»n `--color-primary` khiáº¿n dark theme máº¥t contrast.

**Test theme:** `/app/exam/track/cambridge/a2` â†’ Ä‘á»•i theme SÃ¡ng/Tá»‘i trong sidebar â€” nÃºt CTA, pill "Táº¤T Cáº¢", "LÃ m bÃ i" pháº£i giá»¯ chá»¯ tráº¯ng.

### Vocab (Ä‘Ã£ cÃ³ sáºµn trong app)
- Import cá»¥m tá»« qua cá»™t `phrase` â€” `features/vocab/importExport.ts`, `ImportModal.tsx`

---

## Lá»—i cÃ²n tá»“n táº¡i â€” Cambridge RW (cáº­p nháº­t 2026-07-06)

- [ ] **CAE Part 10 áº£nh** â€” `part10-page.jpg` chÆ°a cÃ³ screenshot riÃªng Q58 (Ä‘ang dÃ¹ng copy Part9)
- [ ] **`pnpm build:catalog`** â€” cáº§n Ä‘á»§ folder `Tainguyen/ket-reading-test1` â€¦ (má»™t sá»‘ chá»‰ cÃ³ `.zip`); CAE/CPE Ä‘Ã£ cÃ³ folder + áº£nh
- [ ] **Theme debt app-wide** â€” má»™t sá»‘ trang khÃ¡c váº«n dÃ¹ng `color: var(--bg-primary)` trÃªn nÃºt primary (Settings, Vocab, Listening libraryâ€¦); Cambridge library Ä‘Ã£ fix
- [x] **CPE C2 Reading** â€” RW shell 9 parts (`cpeRw/`) + catalog `reading-cpe-c2-test1`
- [x] **Prompt HDSD CAE** â€” `HDSD/Prompt-CAE-C1-Reading-Universal.txt`
- [x] **Prompt HDSD CPE** â€” `HDSD/Prompt-CPE-C2-Reading-Universal.txt` (9 parts RW, Part 4/6/8â€“9 rules, answer key Test 1)
- [x] **Prompt HDSD Listening Universal A2â€“C2** â€” `HDSD/Prompt-Listening-Cambridge.txt` + 5 file `Prompt-*-Listening-Universal.txt` (KET/PET/FCE/CAE/CPE)
- [x] **Prompt HDSD Vocab import** â€” `HDSD/Prompt-Vocab-Universal.txt` + `Prompt-Vocab-Chu-De.txt` + `Import Vocab.txt` (tá»« Ä‘Æ¡n + cá»¥m tá»«, 6 nhÃ³m chá»§ Ä‘á»)
- [x] **Fix theme Cambridge A2â€“C2 library** â€” token `--color-on-primary` trong `globals.css`; nÃºt CTA/filter pill trong `examHub.css` + modal import exam dÃ¹ng mÃ u chá»¯ cá»‘ Ä‘á»‹nh thay `var(--bg-primary)` (trÃ¡nh chá»¯ Ä‘en trÃªn ná»n tÃ­m khi dark theme)
- [x] TypeScript `pnpm --filter web exec tsc --noEmit` â€” pass (CAE RW)

---

## Next session start prompt
```
Äá»c session_summary.md ngay.

## ÄÃ£ xong (2026-07-06) â€” Cambridge Reading & Writing shells (5 level)
- KET A2: 7 parts RW + AI cháº¥m Writing P6â€“7
- PET B1: 8 parts RW; Part 8 = 1 áº£nh `part8-page.jpg`
- FCE B2: 9 parts RW; Part 8/9 JPG; Part 7 Paragraph Aâ€“D
- CAE C1: 10 parts RW; P6 Reviewer / P8 Consultant; P9/P10 Writing JPG â†’ `caeRw/` Â· `catalog-reading-cae-c1-test1`
- CPE C2: 9 parts RW; P4 transform 1 gap; P6 bank Aâ€“H; P8 essay + P9 choice â†’ `cpeRw/` Â· `catalog-reading-cpe-c2-test1`

## ÄÃ£ xong (2026-07-06) â€” HDSD + UX
- Listening Universal A2â€“C2: `HDSD/Prompt-Listening-Cambridge.txt` + 5 file level-specific
- Vocab import: `Prompt-Vocab-Universal.txt` + `Prompt-Vocab-Chu-De.txt` + `Import Vocab.txt` (cá»¥m tá»« qua `phrase`)
- Exit Listening FCE/CAE/CPE: `ListeningFceTest.tsx`
- Fix theme Cambridge library: `--color-on-primary` Â· `examHub.css` Â· modal import exam

## ÄÃ£ xong (2026-07-05)
- Listening IELTS Cam 9â€“20: validate 48/48 PASS
- Cambridge Library Archives â†’ /app/exam/track/cambridge/{a2|b1|b2|c1|c2}

## Æ¯u tiÃªn session má»›i (chá»n theo user)

### A â€” Verify + ship Cambridge RW
1. Hard refresh â†’ so tá»«ng level vá»›i Giaodien `Reading_Writing_*`
2. Thay `part10-page.jpg` CAE báº±ng screenshot Q58 tháº­t (náº¿u cÃ³)
3. `pnpm build:catalog` (khi Ä‘á»§ Tainguyen folders) + deploy

### B â€” IELTS Listening import (48 ZIP)
- Batch `pnpm ielts:bundle` â†’ Import thá»§ cÃ´ng Listening
- Pilot: Cam11 T1, Cam10 T3, Cam20 T4

### C â€” Reading IELTS
- [x] Pipeline bundle: `pnpm ielts:reading:{scaffold|export-pilots|validate|merge|pack|bundle|bundle:all}`
- [x] Scaffold 48 folder `Reading IELTS_Test{N}_Cam{X}` + HDSD/Prompt
- [x] 3 pilot ZIP (Cam10 T1, Cam11 T3 headings, Cam10 T4 YNNG)
- [ ] 45 Ä‘á» cÃ²n láº¡i â€” cáº§n OCR text â†’ AI â†’ exam_passage1â€“3.json
- [x] Wizard template má»Ÿ rá»™ng (18 layout P1â€“P3) â€” Viá»‡c 3
- [ ] Table/Note layout renderer (náº¿u Ä‘á» cÃ³ báº£ng trong cÃ¢u há»i)

### D â€” Theme debt app-wide
- Cambridge library Ä‘Ã£ fix `--color-on-primary`
- CÃ²n Settings, Vocab, Listening libraryâ€¦ dÃ¹ng `color: var(--bg-primary)` trÃªn nÃºt primary

### E â€” Cambridge Listening UI
- FCE/CAE/CPE Listening dÃ¹ng `ListeningFceTest` shell (screenshot-based)
- Recipe CAE: cuá»‘i `session_summary.md`

## Lá»‡nh thÆ°á»ng dÃ¹ng
pnpm dev
pnpm --filter web exec tsc --noEmit
pnpm build:catalog
pnpm ielts:bundle "IELTS/Listening IELTS_Test4_Cam20"

## Test nhanh
/app/exam/track/cambridge/a2          â€” library + Ä‘á»•i theme
/app/exam/reading/catalog-reading-cae-c1-test1
/app/exam/reading/catalog-reading-cpe-c2-test1
```

### Verify (session tiáº¿p)
- [x] `pnpm --filter web exec tsc --noEmit` pass
- [x] Prompt HDSD Reading CAE + CPE Universal
- [x] Prompt HDSD Listening Universal A2â€“C2 + Vocab import
- [x] Fix theme Cambridge A2â€“C2 library (`--color-on-primary`)
- [ ] CAE RW UI: 10 part footer, P9/P10 áº£nh + textarea, Reviewer/Consultant labels
- [ ] Thay `part10-page.jpg` áº£nh tháº­t Q58
- [ ] `pnpm build:catalog` full (khi Tainguyen folders Ä‘á»§)
- [ ] Deploy production RW shells
---

## IELTS Reading â€” YNNG + Matching Headings renderer (2026-07-07)

- [x] Types: `yes-no-not-given`, `matching-headings` (question); `ynng`, `matching-headings` (group); `headings[]`
- [x] `ReadingQuestionPanel` â€” `YnngGroup`, `MatchingHeadingsGroup` (+ `TriStateGroup` TFNG/YNNG)
- [x] `importReadingManualUtils` â€” validate + build; auto YNNG options khi import
- [x] `ExamResult` â€” format Ä‘Ã¡p Ã¡n heading (`i. labelâ€¦`)
- [x] Demo builtin `ielts-reading-types-demo` â€” Part 1 headings, Part 2 YNNG
- [x] `pnpm --filter web exec tsc --noEmit` pass

**Test:** `/app/exam/reading/ielts-reading-types-demo`

---

## IELTS Reading Wizard â€” template má»Ÿ rá»™ng (Viá»‡c 3, 2026-07-07) â€” HOÃ€N THÃ€NH 18 template

- [x] **18 template** per-passage picker (6 má»—i Passage) â€” cover layout Cam 9â€“20
- [x] **P1 (6):** `r1` TFNG+MC Â· `r1g` TFNG+Gap Â· `r1h` Headings+MC Â· `r1s` Sentence+MC Â· `r1hg` Headings+Gap Â· `r1m` Gap+MC
- [x] **P2 (6):** `r2` Match+MC Â· `r2y` YNNG+Match Â· `r2h` Headings+Gap+YNNG Â· `r2t` TFNG+Match Â· `r2g` Gap+Match Â· `r2s` Summary+YNNG+MC
- [x] **P3 (6):** `r3` TFNG+MC Â· `r3f` Gap+TFNG+Flow Â· `r3y` YNNG+MC Â· `r3gy` Gap+YNNG+MC Â· `r3sy` Summary+YNNG+MC Â· `r3gt` Gap+TFNG+MC
- [x] `ieltsReadingPartTemplates.ts` â€” builder + SAMPLE JSON cho 18 template
- [x] `ieltsReadingAiPrompt.ts` â€” `passageExtraRules()` chi tiáº¿t theo template
- [x] `ieltsReadingWizardEdit.ts` â€” `TEMPLATE_SIGNATURES` map gap/sentence-completion â†’ template má»›i
- [x] `ieltsReadingWizardPersist.ts` â€” fallback template kind khÃ´ng há»£p lá»‡
- [x] **áº¢nh preview layout** â€” 18 SVG schematic + lightbox zoom (giá»‘ng Listening Wizard)
- [x] `public/ielts-wizard/reading/p{1,2,3}/*.svg` + `scripts/generate-ielts-reading-wizard-previews.mjs`
- [x] `pnpm --filter web exec tsc --noEmit` pass

**Import Cam9 T1 qua Wizard:** P1 â†’ `r1g`, P2 â†’ `r2h`, P3 â†’ `r3f`

**Workflow 45 Ä‘á» cÃ²n láº¡i:** OCR PDF â†’ Wizard (chá»n template Ä‘Ãºng layout) â†’ AI JSON â†’ LÆ°u Dexie â†’ `pnpm ielts:reading:bundle:all` â†’ Import ZIP

**Test:** `/app/exam/track/ielts` â†’ Import Wizard Reading â†’ chá»n template tá»«ng Passage (6 option/passage)

---

## IELTS Reading Wizard â€” sá»­a Ä‘á» Ä‘Ã£ import (2026-07-07)

- [x] NÃºt **bÃºt chÃ¬** trÃªn Library Archives (Ä‘á» IELTS import 3 passages)
- [x] `ieltsReadingWizardEdit.ts` â€” náº¡p Ä‘á» Dexie â†’ wizard draft, suy template, tÃ¡i táº¡o answer key
- [x] Cháº¿ Ä‘á»™ sá»­a: Preview â†’ **Sá»­a passages** â†’ chá»‰ táº¡o láº¡i passage cáº§n fix â†’ **Cáº­p nháº­t Ä‘á»** (`examRepo.update`)
- [x] Giá»¯ `imageKey` áº£nh passage cÅ© khi cáº­p nháº­t (`mergePassageImageKeys`)
- [x] `pnpm --filter web exec tsc --noEmit` pass

**Workflow sá»­a P1:** Library â†’ Test â†’ bÃºt chÃ¬ â†’ Sá»­a passages â†’ Passage 1 â†’ Táº¡o JSON â†’ Cáº­p nháº­t Ä‘á»

---

## IELTS Reading â€” bundle pipeline + 48 scaffold (2026-07-07)

- [x] `ieltsReadingBundle.ts` + `scripts/ielts-reading-bundle.ts` (merge/validate/pack/bundle)
- [x] `scaffold-ielts-reading-folders.mjs` â€” 48 folder + meta.json + answer-key.txt
- [x] `export-ielts-reading-pilots.ts` â€” 3 pilot Ä‘á»§ 40 cÃ¢u
- [x] `batch-ielts-reading-bundle.mjs` â€” bundle hÃ ng loáº¡t khi Ä‘á»§ 3 passages
- [x] HDSD: `Import Reading IELTS.txt`, `Prompt-IELTS-Reading-Cam9-Cam20.txt`
- [x] Pilot ZIP: `Reading IELTS_Test1_Cam10`, `Test3_Cam11`, `Test4_Cam10`
- [x] **Cam9 Test 1** â€” `scripts/build-ielts-reading-cam9-test1.py` â†’ 3 passages Â· 40 cÃ¢u Â· ZIP sáºµn (`Reading IELTS_Test1_Cam9.zip`)
- [x] **Cam9 Tests 2â€“4** â€” `scripts/build-ielts-reading-cam9-tests-234.py` + `scripts/ielts_reading_cam9_lib.py` (parser plain text PDF/DOCX)
  - T2: Hearing/classroom noise Â· Venus in Transit Â· Neuroscientist/iconoclast
  - T3: Attitudes to language Â· Tidal power Â· Information theory/Voyager
  - T4: Marie Curie Â· Children's identity Â· Development of Museums
  - ZIP: `Reading IELTS_Test2_Cam9.zip`, `Test3_Cam9.zip`, `Test4_Cam9.zip` â€” **40 cÃ¢u má»—i test, khÃ´ng cáº£nh bÃ¡o**
  - Lá»‡nh gá»™p: `pnpm ielts:reading:build-cam9` (T1 + T2â€“4)
- [x] **Cam10 Tests 1â€“4** â€” `scripts/build-ielts-reading-cam10.py` + plain text tá»« PDF
  - T1: Stepwells Â· EU Transport Â· Psychology of innovation
  - T2: Tea/Industrial Revolution Â· Gifted children Â· Museums of fine art
  - T3: Tourism Â· Autumn leaves Â· Beyond the blue horizon
  - T4: Megafires Â· Second nature Â· Evolution backwards
  - ZIP: `Reading IELTS_Test1_Cam10.zip` â€¦ `Test4_Cam10.zip` â€” **40 cÃ¢u/test, khÃ´ng cáº£nh bÃ¡o**
  - Lá»‡nh: `pnpm ielts:reading:build-cam10`
- [ ] Cam11/12 Test 1 + 37 Ä‘á» cÃ²n láº¡i

**Lá»‡nh:** `pnpm ielts:reading:build-cam10` â†’ `pnpm ielts:reading:bundle "IELTS/Reading IELTS_Test{N}_Cam10"`

---

## FCE B2 Listening â€” Cambridge screenshot shell + Part 2 local image import (2026-07-06)

- [x] Screenshot source: `Giaodien/Taicautruc/Listening_FCE_B2/Part1.jpg` ... `Part4.jpg`.
- [x] `ListeningTest.tsx` routes `exam.examType === 'fce'` to `ListeningFceTest`.
- [x] `ListeningFceTest.tsx` â€” Cambridge shell reused from KET/PET: top Cambridge header, fixed footer 4 parts, qnav, prev/next floating buttons, submit modal, localStorage draft, shared audio continues across parts.
- [x] `ListeningFceMcPartView.tsx` â€” Part 1 shows only active MC question like screenshot; Part 4 shows all MC questions in one scrolling page. Options are full-width pale rows with radio circle.
- [x] `ListeningFceGapFillPartView.tsx` â€” Part 2 gap-fill layout for Spectacled Bears, title + optional part image, inline numbered gaps.
- [x] Part 2 has a small local image picker: user can click `Import` and choose an image from PC; preview replaces existing part image for current browser session only. It is not persisted to `exam.json`/Dexie.
- [x] `ListeningFceMatchingPartView.tsx` â€” Part 3 speaker matching: speakers + drop slots left, answer bank right, supports click-to-pick and drag/drop, one-use options.
- [x] `listeningTest.css` â€” scoped `.listening-fce-*` CSS, based on Cambridge screenshot spacing/colors. Does not intentionally alter KET/PET/IELTS.
- [ ] No test/build run for this change per user request.

### Recipe for next model: CAE C1 Listening UI

- Start from FCE implementation, not `ListeningIeltsTest`.
- Create CAE-specific shell/view files rather than overloading IELTS:
  - `ListeningCaeTest.tsx`
  - `ListeningCaeMcPartView.tsx` for CAE Part 1/3 MC
  - `ListeningCaeGapFillPartView.tsx` for CAE Part 2
  - reuse/adapt `ListeningDualLetterMatchingPartView` or make `ListeningCaeDualMatchingPartView.tsx` for Part 4 dual task
- Route in `ListeningTest.tsx`: `if (exam.examType === 'cae') return shell(<ListeningCaeTest exam={exam} />)`.
- Use screenshots from the corresponding CAE folder if present under `Giaodien/Taicautruc/Listening_CAE_C1`; if absent, use FCE shell proportions and CAE data shape in `Tainguyen/cae-Listening-test1/exam.json`.
- CAE known data shape:
  - Part 1: MC, 3 extracts / 6 questions.
  - Part 2: gap-fill, `passageTitle` TRIP TO SOUTH AFRICA.
  - Part 3: MC A/B/C/D.
  - Part 4: dual matching, 10 questions split Task One 21-25 + Task Two 26-30, already detected by `isDualLetterMatchingPart()` / `dualMatchingTaskGroups()`.
- Keep audio behavior same as FCE/PET: use `resolveListeningAudioSource(exam, currentPart)`, `playKey = exam-${exam.id}`, do not stop audio when changing parts.
- Keep all CAE CSS scoped as `.listening-cae-*`.
- If user asks for Part 2 image import in CAE too, copy the small local image picker pattern from `ListeningFceGapFillPartView.tsx`.

---

## Listening CAE C1 + CPE C2 restructure from screenshots (2026-07-06)

- User requested screenshot-based restructure from:
  - `Giaodien/Taicautruc/Listening_CAE_C1/Part1.jpg` ... `Part4.jpg`
  - `Giaodien/Taicautruc/Listening_CPE_C2/Part1.jpg` ... `Part4.jpg`
- Note: user typed "Reading Writing CPE C2" once, but the folder and screenshots are Listening CPE C2; implementation followed the screenshots.

### CAE C1 Listening

- [x] `ListeningTest.tsx` now routes `exam.examType === 'cae'` into `ListeningFceTest` instead of falling through to IELTS.
- [x] `ListeningFceTest.tsx` now adds class `listening-cae-cambridge` for CAE and dispatches parts by data shape:
  - all `gap-fill` questions -> `ListeningFceGapFillPartView`
  - `isDualLetterMatchingPart(currentPart)` -> `ListeningDualLetterMatchingPartView`
  - `isGroupedLetterMatchingPart(currentPart)` -> `ListeningFceMatchingPartView`
  - otherwise MC -> `ListeningFceMcPartView`
- [x] CAE Part 3 is shown as all MC questions in one scrollable page.
- [x] CAE Part 4 dual matching uses `ListeningDualLetterMatchingPartView`.
- [x] Fixed CAE Part 4 answer-bank wrapping bug:
  - bank rows now use `display: flex`
  - answer text uses `white-space: nowrap` on desktop
  - task layout is vertical task-by-task like screenshot
  - mobile/medium widths allow wrapping under `1100px`
- [x] CSS is scoped through `.listening-cae-cambridge`.

### CPE C2 Listening

- [x] `ListeningTest.tsx` now routes `exam.examType === 'cpe'` into `ListeningFceTest`.
- [x] `ListeningFceTest.tsx` now adds `listening-cpe-cambridge` and reuses CAE-style Cambridge shell via `listening-cae-cambridge`.
- [x] CPE Part 3 MC displays all questions in one scrollable page, same as CAE.
- [x] `cambridgeListeningSamples.ts` now has `buildCpeListening()` replacing the previous generic `multiPartListening('c2', 'cpe', ...)` sample.
- [x] CPE sample shape now matches screenshots:
  - Part 1: Questions 1-6, MC, three extracts/two questions each.
  - Part 2: Questions 7-15, gap-fill scientific expedition.
  - Part 3: Questions 16-20, MC with 4 options.
  - Part 4: Questions 21-30, dual matching internships, Task 1 + Task 2.
- [x] Added local helpers in `cambridgeListeningSamples.ts`:
  - `listeningMcOptions()` for 4-option CPE MC
  - `listeningMatching()` for Part 4 matching questions

### Files touched in this sequence

- `apps/web/src/features/exam/ListeningTest.tsx`
- `apps/web/src/features/exam/ListeningFceTest.tsx`
- `apps/web/src/features/exam/ListeningFceMcPartView.tsx`
- `apps/web/src/features/exam/ListeningDualLetterMatchingPartView.tsx`
- `apps/web/src/features/exam/listeningTest.css`
- `apps/web/src/features/exam/cambridgeListeningSamples.ts`
- `session_summary.md`

### Verification status

- [ ] No test run.
- [ ] No build run.
- Reason: user explicitly asked not to run test/build for the earlier screenshot restructure work.

---

## Reading IELTS â€” áº¢nh cloud Admin-only (session 2026-07-07) â€” HOÃ€N THÃ€NH

- [x] Migration `009_reading_exam_images.sql` â€” bucket `reading-exam-media` (public read) + báº£ng `reading_exam_images` + RLS (má»i user Ä‘á»c, chá»‰ Admin insert/update/delete)
- [x] `readingExamCloudImages.ts` â€” upload/list/delete/merge áº£nh theo `examId` + slot (`top`/`bottom`/`passage`/`group`)
- [x] `useReadingExamCloudImages.ts` + `useIsAdmin.ts` â€” hook load áº£nh + flag admin tá»« Dexie settings
- [x] `ReadingTest.tsx` â€” merge cloud images khi render; upload/xÃ³a chá»‰ khi `isAdmin`
- [x] `ReadingPassagePanel.tsx` / `ReadingPartTopImage.tsx` â€” user chá»‰ xem áº£nh, khÃ´ng tháº¥y slot upload
- [x] `IeltsReadingImportWizard.tsx` + `ImportReadingManualModal.tsx` â€” Admin import áº£nh â†’ `mediaStorage: 'cloud'`; user thÆ°á»ng khÃ´ng upload
- [x] `importReadingManualUtils.ts` â€” `mediaStorage: 'local' | 'cloud'`
- [x] `database.types.ts` â€” `reading_exam_images` + `profiles.is_admin` + `Relationships: []`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### HÃ nh vi
- Admin thÃªm áº£nh (trong Ä‘á» hoáº·c Import Wizard) â†’ lÆ°u Supabase Storage + metadata â†’ **má»i user tháº¥y**
- áº¢nh tá»“n táº¡i mÃ£i cho Ä‘áº¿n khi Admin xÃ³a
- User thÆ°á»ng: khÃ´ng cÃ³ nÃºt upload/xÃ³a áº£nh

### Deploy migration â€” ÄÃƒ CHáº Y (2026-07-07)
- `pnpm db:push` â†’ `009_reading_exam_images.sql` applied trÃªn Supabase

### Fix áº£nh khÃ´ng hiá»‡n (2026-07-07)
- NguyÃªn nhÃ¢n chÃ­nh: migration 009 chÆ°a push â†’ bucket/báº£ng khÃ´ng tá»“n táº¡i, upload tháº¥t báº¡i im láº·ng
- `isAdmin === true` (trÃ¡nh `undefined` â†’ lÆ°u local Dexie thay vÃ¬ cloud)
- Há»— trá»£ tÃªn file `part1-top.jpg`, `part1-bottom.jpg`, `part1-group-0.jpg`
- `topImageUrl`/`bottomImageUrl` trÃªn `ReadingPart` + persist Dexie overlay cho Ä‘á» builtin
- Hiá»‡n lá»—i upload/load áº£nh cho Admin trÃªn mÃ n Reading

### User khÃ´ng tháº¥y dá»¯ liá»‡u Admin Ä‘Ã£ thÃªm â€” cháº©n Ä‘oÃ¡n (2026-07-07)

**Hai lá»›p dá»¯ liá»‡u tÃ¡ch biá»‡t:**

| Lá»›p | Admin lÆ°u | User tháº¥y khi nÃ o |
|-----|-----------|-------------------|
| **áº¢nh** | Supabase `reading_exam_images` + Storage `reading-exam-media` | Má»Ÿ **Ä‘Ãºng `examId`** + cÃ³ ná»™i dung Ä‘á» |
| **Ná»™i dung Ä‘á»** (passage, cÃ¢u há»i) | TrÆ°á»›c Ä‘Ã¢y chá»‰ **Dexie local** (IndexedDB trÃ¬nh duyá»‡t Admin) | **KhÃ´ng** â€” má»—i mÃ¡y/tÃ i khoáº£n riÃªng |

**VÃ­ dá»¥ thá»±c táº¿:** áº£nh cloud cho `reading-manual-1783427421159` Ä‘Ã£ cÃ³ trÃªn Supabase, nhÆ°ng báº£n Ä‘á» JSON chÆ°a publish â†’ User khÃ´ng má»Ÿ Ä‘Æ°á»£c Ä‘á» / khÃ´ng tháº¥y áº£nh.

**CÃ¡c case khÃ¡c:**
- áº¢nh lÆ°u `imageKey` local (Dexie) khi `isAdmin` chÆ°a load â†’ chá»‰ Admin cÃ¹ng mÃ¡y tháº¥y
- Äá» import `reading-manual-*` khÃ´ng sync cloud (chá»‰ catalog builtin ship cÃ¹ng deploy)
- Äá» **builtin** `catalog-reading-...`: chá»‰ cáº§n áº£nh cloud theo `examId` â€” khÃ´ng cáº§n publish ná»™i dung Ä‘á»

### Publish Ä‘á» Reading lÃªn Supabase â€” CODE XONG, CHÆ¯A ROLLOUT Háº¾T Äá»€ (2026-07-07)

- [x] Migration `010_reading_exam_published.sql` â€” báº£ng `reading_exam_published` + RLS (má»i user Ä‘á»c, Admin ghi) â€” **Ä‘Ã£ `pnpm db:push`**
- [x] `readingExamPublish.ts` â€” `publishReadingExamToCloud`, `getPublishedReadingExam`, `listPublishedReadingExams`
- [x] `examLoader.ts` â€” `resolveReadingExam` / `listAllReadingExams` Æ°u tiÃªn: Dexie local â†’ **published Supabase** â†’ builtin catalog
- [x] `IeltsReadingImportWizard.tsx` + `ImportReadingManualModal.tsx` â€” Admin **LÆ°u** â†’ auto publish (khi `isAdmin === true`)
- [x] `database.types.ts` â€” `reading_exam_published`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Viá»‡c táº¡m hoÃ£n / Ä‘Ã£ cÃ³ cÃ¡ch thay tháº¿

1. **Re-publish Ä‘á» cÅ©** â€” dÃ¹ng **Admin â†’ Publish ná»™i dung** (mÃ¡y Ä‘Ã£ import); hoáº·c Reading Wizard â†’ Sá»­a â†’ LÆ°u; khÃ´ng báº¯t buá»™c import láº¡i ZIP
2. **Batch áº£nh** â€” gáº¯n áº£nh khi import xong Cam 9â€“20, rá»“i Publish ná»™i dung
3. **Verify cross-user** â€” Admin Publish â†’ User khÃ¡c hard refresh
4. ~~Script one-shot~~ â†’ thay báº±ng `publishAllAdminContent` + `AdminPublishExamsPanel`

**Workflow Ä‘á» xuáº¥t sau batch import:**
```
Import háº¿t Ä‘á» (Wizard/build script)
  â†’ Admin LÆ°u tá»«ng Ä‘á» (hoáº·c script publish) â€” áº£nh cloud + exam JSON lÃªn Supabase
  â†’ pnpm build:catalog (Ä‘á» builtin) HOáº¶C rely reading_exam_published (Ä‘á» manual)
  â†’ pnpm deploy:prod
  â†’ User hard refresh â†’ tháº¥y Ä‘á» + áº£nh
```

---

## Service Worker â€” cache catalog audio offline (session 2026-07-07) â€” HOÃ€N THÃ€NH

Giáº£m bandwidth Vercel khi user nghe láº¡i MP3 Listening: láº§n Ä‘áº§u táº£i tá»« network, láº§n sau láº¥y tá»« Cache Storage.

- [x] `apps/web/public/sw.js` â€” cache-first cho `GET /catalog/**/*.{mp3,m4a,wav,ogg,webm}`; giá»¯ push notifications; `skipWaiting` + `clients.claim`; xÃ³a cache cÅ© khi version Ä‘á»•i; dev fallback version `dev` khi placeholder chÆ°a inject
- [x] `apps/web/vite.config.ts` â€” plugin `injectSwCatalogCacheVersion`: thay `__CATALOG_CACHE_VERSION__` báº±ng `package.json` version lÃºc `closeBundle`
- [x] `apps/web/src/App.tsx` â€” `register('/sw.js')` + `reg.update()` on load
- [x] `pnpm --filter web build` â€” pass; `dist/sw.js` cÃ³ `ryan-catalog-0.2.0`

### CÃ¡ch hoáº¡t Ä‘á»™ng
1. User má»Ÿ app â†’ SW Ä‘Äƒng kÃ½ scope `/`
2. PhÃ¡t Listening MP3 tá»« `/catalog/.../listening.mp3` â†’ SW fetch network â†’ lÆ°u `ryan-catalog-{version}`
3. Láº§n sau (cÃ¹ng tab hoáº·c session má»›i): DevTools Network hiá»‡n `(from ServiceWorker)` â€” **khÃ´ng tá»‘n Vercel transfer**
4. Má»—i release bump `apps/web/package.json` version â†’ cache name má»›i â†’ user táº£i MP3 má»›i náº¿u file Ä‘á»•i

### Verify thá»§ cÃ´ng (production / preview)
- DevTools â†’ Application â†’ Cache Storage â†’ `ryan-catalog-*`
- Network: play MP3 2 láº§n â†’ request thá»© 2 `Size` = `(ServiceWorker)`

### ChÆ°a lÃ m (tuá»³ chá»n)
- Cache cross-origin Supabase `reading-exam-media` URLs

---

## Listening â€” publish Ä‘á» import lÃªn Supabase (session 2026-07-07) â€” HOÃ€N THÃ€NH

Giá»‘ng Reading: Admin LÆ°u â†’ má»i user tháº¥y Ä‘á» Listening import (`listening-import-*`).

- [x] Migration `011_listening_exam_published.sql` â€” **Ä‘Ã£ `pnpm db:push`**
- [x] `listeningExamPublish.ts` â€” publish / get / list
- [x] `listeningExamLoader.ts` â€” Dexie local â†’ **published Supabase** â†’ builtin catalog + `mergeCatalogListeningMedia`
- [x] `ImportListeningModal.tsx` + `IeltsListeningImportWizard.tsx` â€” Admin LÆ°u â†’ auto publish
- [x] `database.types.ts` â€” `listening_exam_published`

### MP3 / áº£nh sau publish
- IELTS title `Cambridge X Test Y` â†’ `audioUrl` / áº£nh tá»« `/catalog/listening/...` (deploy)
- KET/PET custom khÃ´ng khá»›p catalog â†’ user tháº¥y cÃ¢u há»i, **chÆ°a** nghe MP3 (blob chá»‰ mÃ¡y Admin) â€” tuá»³ chá»n upload cloud sau

---

## Admin â€” Publish ná»™i dung toÃ n app (session 2026-07-07) â€” HOÃ€N THÃ€NH

Má»™t nÃºt publish má»i module â€” **khÃ´ng cáº§n import láº¡i tá»«ng Ä‘á»**.

- [x] Migration `012_admin_published_modules.sql` â€” `admin_published_modules` + `admin_publish_meta` â€” **Ä‘Ã£ push**
- [x] `adminContentPublish.ts` â€” `publishAllAdminContent`, `countAdminPublishableContent`
- [x] `syncAdminPublishedContent.ts` â€” user pull khi vÃ o `/app` (gá»i tá»« `GlobalCatalogSync.tsx`)
- [x] `publishLocalExamsBatch.ts` â€” batch Reading/Listening (gá»i tá»« publish all)
- [x] `AdminPublishExamsPanel.tsx` â€” tab **Publish ná»™i dung** trong `/app/admin`
- [x] `scripts/build-catalog.mjs` â€” auto unzip `Tainguyen/{bundle}.zip` náº¿u thiáº¿u folder (fix Vercel build)
- [x] `pnpm deploy:prod` â€” production live

### Admin workflow
```
ThÃªm/sá»­a data trÃªn mÃ¡y Admin (IndexedDB)
  â†’ /app/admin â†’ tab "Publish ná»™i dung" â†’ Publish táº¥t cáº£
  â†’ Supabase (modules + reading_exam_published + listening_exam_published)
  â†’ User má»Ÿ /app â†’ syncAdminPublishedContent() tá»± merge
```

### Module publish (má»™t nÃºt)

| Module | Nguá»“n local | Ghi chÃº |
|--------|-------------|---------|
| Tá»« vá»±ng | `deck.origin === 'preset'` + tháº» | KhÃ´ng SRS |
| Viáº¿t | `writingDocs` text trá»‘ng | Äá» bÃ i thÆ° viá»‡n |
| Nghe | `lessons` category `cambridge` | KhÃ´ng bÃ i `user` |
| Luyá»‡n dá»‹ch | `translationSets` â‰  `user` | |
| Cáº¥u trÃºc cÃ¢u | `sentenceStructures` | |
| MindMap | `mindmaps` | |
| Luyá»‡n thi Reading | `reading-manual-*` â€¦ (trá»« `catalog-*`) | Báº£ng `reading_exam_published` |
| Luyá»‡n thi Listening | `listening-import-*` | Báº£ng `listening_exam_published` |

### KhÃ´ng publish
- SRS, deck/tá»« user, bÃ i viáº¿t Ä‘Ã£ gÃµ, bÃ i nghe user, Ä‘á» builtin `catalog-*`

### Auto publish khi LÆ°u (Admin)
- Reading: Wizard + Import modal â†’ `publishReadingExamToCloud`
- Listening: Import modal + Wizard â†’ `publishListeningExamToCloud`

---

## Luyá»‡n thi â€” Note cáº¡nh TÃ´ sÃ¡ng (session 2026-07-07) â€” HOÃ€N THÃ€NH

- [x] `readingHighlightUtils.ts` â€” `TextNote`, `segmentsFromAnnotations`, `upsertNotesForRanges`, `removeNotesInRanges`, `findNotesOverlappingRanges`
- [x] `examHighlightContext.tsx` â€” context `{ highlights, notes }`, hook `useExamNotes()`
- [x] `usePartHighlights.ts` â€” `notes`, `handleNotesChange`, `notesByPart`, `setAnnotationsByPart`
- [x] `ReadingHighlightToolbar.tsx` â€” nÃºt **Note** + panel textarea (LÆ°u / XÃ³a / ÄÃ³ng)
- [x] `ReadingHighlightableText.tsx` â€” gáº¡ch chÃ¢n wavy + tooltip `title` cho Ä‘oáº¡n cÃ³ note
- [x] `readingTest.css` â€” `.reading-test-note`, styles panel note trÃªn toolbar
- [x] **Reading IELTS shell** â€” `ReadingTest.tsx`: `notesByPart` persist draft `exam-reading-draft:{examId}`
- [x] **Listening** â€” `ListeningKetTest`, `ListeningPetTest`, `ListeningFceTest` (FCE/CAE/CPE), `ListeningIeltsTest`: notes persist draft `exam-listening-draft:{examId}`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### UX
1. BÃ´i Ä‘en text trong vÃ¹ng `data-exam-highlight-zone`
2. Toolbar: **TÃ´ sÃ¡ng** | **Note** | Bá» tÃ´ sÃ¡ng | Sao chÃ©p
3. **Note** â†’ textarea â†’ **LÆ°u note** (gáº¯n `blockId` + offset)
4. Text cÃ³ note: gáº¡ch chÃ¢n wavy; hover xem tooltip

### Cambridge RW A2â€“C2 (bá»• sung 2026-07-07)
- [x] `rwHighlight/` â€” `RwExamMain`, `RwHighlightText`, `RwInstruction`, `RwMcRadioQuestion`, `rwGapTextSegment`
- [x] 5 shell `*RwTest.tsx` â€” toolbar TÃ´ sÃ¡ng + Note, persist `highlightsByPart`/`notesByPart` trong draft
- [x] `KetRwPartContent`, `PetRwPartContent`, `FceRwPartContent`, `CaeRwPartContent`, `CpeRwPartContent`, `PetRwDragMatch` â€” text highlightable qua `ReadingHighlightableText`
- [x] `readingKetRw.css` â€” styles highlight/note trong `.ket-rw-main`

---

## ÄÃ£ xong (2026-07-09) â€” Security + isolation + draft race
- **C1 profiles:** migration `013_protect_profile_privileges.sql` â€” trigger cháº·n self-promote `is_admin`/`plan`
- **IndexedDB isolation:** `clearLocalUserData` + `ensureLocalUserIsolation` â€” wipe on logout / Ä‘á»•i user
- **notify-payment:** chá»‰ JWT user (reject anon/service key); HTML escape; identity tá»« claims
- **Plan default:** `?? 'free'` (writing/mindmap/structure/KET grade)
- **Exam draft race:** `useExamDraftGate` â€” hydrate xong má»›i save (Reading + Listening shells)

### Deploy báº¯t buá»™c
```
pnpm db:push
npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo
```

## ÄÃ£ xong (2026-07-09) â€” Writing: rewrite V2 + OCR Task1 + dashboard 30d + Cambridge RW AI
- **Rubric â†’ Version 2 side-by-side:** `buildWritingRewritePrompt` + `RewriteComparePanel` trong ScorePanel (so sÃ¡nh V1/V2, copy, Ã¡p dá»¥ng V2)
- **Task 1 graph OCR:** `buildChartDescribePrompt` + nÃºt â€œOCR & mÃ´ táº£ biá»ƒu Ä‘á»“â€ (vision OpenAI/Gemini); cháº¥m Task 1 gáº¯n áº£nh khi provider há»— trá»£ vision
- **Dashboard:** lá»‹ch cháº¥m 30 ngÃ y + TB 30 ngÃ y + xu hÆ°á»›ng band theo ngÃ y (`useWritingDashboard`, `WritingDashboardPage`)
- **Cambridge RW Writing:** `CambridgeRwWritingGradePanel` A2â€“C2 (thay KET-only); lÆ°u history `exam-rw:*` cho dashboard; model answer AI + **catalog** (`cambridgeWritingModelCatalog`) trÃªn result + hub Cambridge Writing
- Core: `attachImagesToUserMessage`, rewrite/chart/model answer types trong `writingPrompt.ts`
- `pnpm --filter web exec tsc --noEmit` â€” pass

### Verify Writing
1. `/app/writing/practice` â†’ Task 1: upload JPG â†’ OCR & mÃ´ táº£ â†’ cháº¥m AI â†’ **Viáº¿t láº¡i Version 2**
2. `/app/writing/dashboard` â†’ lá»‹ch 30 ngÃ y + cá»™t trend
3. Ná»™p Ä‘á» Cambridge RW â†’ Part Writing: Cháº¥m AI + Catalog máº«u / Táº¡o bÃ i máº«u AI
4. `/app/writing/cambridge` â†’ Model answer catalog

## Next session start prompt (cáº­p nháº­t 2026-07-09 â€” Writing pack)
```
Äá»c session_summary.md ngay.

## Context nhanh
- Writing: rewrite V2 side-by-side, Task1 OCR vision, dashboard 30d calendar
- Cambridge RW Writing AI + model catalog (A2â€“C2)
- ExamResult dÃ¹ng CambridgeRwWritingGradePanel

### Verify user
1. Writing practice: grade + rewrite V2
2. Dashboard 30 ngÃ y
3. Cambridge RW result: cháº¥m AI + catalog
```

## ÄÃ£ xong (2026-07-09) â€” Landing WebGL Magic Tome
- CÃ i `three` + `@types/three` (apps/web)
- `MagicTomeCanvas.tsx` â€” tome leather texture, cover canvas, spine gold, flip pages, ACES lights, particles
- `DictionaryBookScene` cinematic stage; `HERO_MASCOT_MODE = 'dictionary'`
- Fix strip â€œA Â· ARCANEâ€ má»ng (geometry/camera) â†’ sÃ¡ch dÃ y face-on
- `tsc --noEmit` pass

---

## ÄÃ£ xong (2026-07-09) â€” Skill picker Page1 + Library Archives
- `/app/exam/track/ielts` â†’ 2 tháº» Listening/Reading (Giaodien Page1)
- `/ielts/reading|listening` â†’ Library Archives (1 skill)
- Cambridge: `/cambridge` levels â†’ `/cambridge/a2` skill picker â†’ `/a2/reading|listening` library
- `ExamSkillPicker.tsx` + route `track/:trackId/:arg2?/:arg3?`

## ÄÃ£ xong (2026-07-09) â€” AI chá»‰ Ä‘oáº¡n Ä‘Ã¡p Ã¡n + tÃ´ cam
- AI báº¯t buá»™c **Äoáº¡n trong Ä‘á»** (quote nguyÃªn vÄƒn tá»« passage/NGUá»’N)
- LÆ°u evidences trong sessionStorage; match quote â†’ `ReadingHighlight kind=evidence`
- TÃ´ **cam** (`.reading-test-highlight--evidence`) + scroll tá»›i Ä‘oáº¡n khi Ä‘á»•i cÃ¢u review
- Reading IELTS + Cambridge RW; Listening: quote trong panel (source = note/prompt)
- `examAiEvidence.ts`, `useReviewEvidenceHighlights`, `buildReadingPassageHighlightBlocks`

## ÄÃ£ xong (2026-07-09) â€” AI phÃ¢n tÃ­ch style + xem cÃ¹ng Ä‘á»
- Panel AI report dÃ¹ng cÃ¹ng class/ná»n/chá»¯ vá»›i â€œBÃ i giáº£i chi tiáº¿tâ€
- `examAiAnalysisStorage` + `ExamReviewAiPanel` + `useExamReviewAi`
- NÃºt â€œXem cÃ¹ng Ä‘á» bÃ iâ€ trÃªn panel AI (vÃ  action bar) má»Ÿ review kÃ¨m AI
- Wire panel: ReadingTest, *RwTest (KETâ€“CPE), ListeningIelts/Ket/Pet/Fce
- `pnpm --filter web exec tsc --noEmit` â€” pass

## ÄÃ£ xong (2026-07-09) â€” BÃ¡o cÃ¡o káº¿t quáº£ Luyá»‡n thi (Reading_IELTS_Result)
- UI xanh lÆ°á»›i + sun mascot + stats: Ä‘Ãºng / bá» qua / sai / band
- `ExamPracticeResultReport` + `examBandScore` + CSS
- Wire `ExamResult` (Reading IELTS/Cambridge) + `ListeningExamResult`
- NÃºt: LÃ m láº¡i Â· Xem cÃ¹ng Ä‘á» bÃ i Â· BÃ i giáº£i chi tiáº¿t Â· Tháº£o luáº­n (disabled)


---

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3mfs (Match + Features + Summary) â† Part3_20
- Kind `p3-r3-match-features-summary` Â· code **r3mfs**
- Q27â€“31 matching-paragraph Aâ€“G Â· Q32â€“36 features Aâ€“E (Dan Maconâ€¦Bethany Smith) Â· Q37â€“40 summary ONE WORD
- SAMPLE: Livestock guard dogs; preview `Teamplate_Part3_20.jpg`
- KhÃ¡c **r3ms** (match â†’ summary â†’ features)
- Test: `apps/web/scripts/test-r3mfs.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3fem (Features + Endings + MC) â† Part3_19
- Kind `p3-r3-features-endings-mc` Â· code **r3fem**
- Q27â€“33 matching-features Aâ€“C (Martin Rees, Daniel Wolpert, Kathleen Richardson)
- Q34â€“36 sentence endings Aâ€“D (wordBank LIST OF OPTIONS)
- Q37â€“40 MC Aâ€“D (Q37 fear of machines khá»›p JPG)
- Preview: `Teamplate_Part3_19.jpg` â†’ `public/ielts-wizard/reading/p3/`
- Test: `apps/web/scripts/test-r3fem.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2h2n (Headings + Choose TWO + Notes) â† Part2_20
- Kind `p2-r2-headings-choose-two-notes` Â· code **r2h2n**
- Q14â€“19 matching-headings Aâ€“F (iâ€“vii) Â· Q20â€“21 Choose TWO Â· Q22â€“23 Choose TWO Â· Q24â€“26 notes ONE WORD (notePassage)
- SAMPLE: Saving coral reefs (London Zoo / tentacles / algae)
- Preview: `Teamplate_Part2_20.jpg` â†’ `public/ielts-wizard/reading/p2/`
- Test: `apps/web/scripts/test-r2h2n.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3ysb (YNNG + Summary bank + MC) â† Part3_18
- Kind `p3-r3-ynng-summary-bank-mc` Â· code **r3ysb**
- Q27â€“32 YNNG Â· Q33â€“37 summary bank Aâ€“H (Calls by the umpire) Â· Q38â€“40 MC Aâ€“D
- SAMPLE: **The Automated Ball-Strike System** (ABS baseball) â€” khá»›p Teamplate_Part3_18.jpg
- Preview: `Teamplate_Part3_18.jpg` â†’ `public/ielts-wizard/reading/p3/`
- Test: `apps/web/scripts/test-r3ysb.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2ms2 (Match + Summary + Choose TWO)
- Kind `p2-r2-match-summary-choose-two` Â· code **r2ms2**
- Q14â€“16 match Â· Q17â€“22 summary ONE WORD Â· Q23â€“24 + Q25â€“26 2Ã— Choose TWO Aâ€“E
- SAMPLE: Community gardens; preview táº¡m Teamplate_Part2_10.jpg
- KhÃ¡c **r2cs** (Choose TWO trÆ°á»›c summary); **r2msc** (sentence giá»¯a)

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2mfu (Match + Features + Summary)
- Kind `p2-r2-match-features-summary` Â· code **r2mfu**
- Q14â€“17 match Aâ€“F Â· Q18â€“23 features Aâ€“E Â· Q24â€“26 summary ONE WORD
- SAMPLE: Deep-sea mining (Cam19 T4 P2); preview Teamplate_Part2_19.jpg
- KhÃ¡c **r2mfs** (features Ã­t + sentence cuá»‘i); **r2msf** (sentence giá»¯a)

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3mgy (MC + Summary ONE WORD + YNNG)
- Kind `p3-r3-mc-summary-gap-ynng` Â· code **r3mgy**
- Q27â€“30 MC Aâ€“D Â· Q31â€“35 summary ONE WORD (note, no bank) Â· Q36â€“40 YNNG
- SAMPLE: The Unselfish Gene / hunter-gatherers (Cam19 T4 P3); preview Teamplate_Part3_17.jpg
- KhÃ¡c **r3my** (cÃ³ wordBank); **r3mey** (endings Aâ€“F)

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3mey (MC + Endings + YNNG)
- Kind `p3-r3-mc-endings-ynng` Â· code **r3mey**
- Q27â€“30 MC Aâ€“D Â· Q31â€“34 sentence endings Aâ€“F Â· Q35â€“40 YNNG
- SAMPLE: artificial speech translation (Cam19 T3 P3); preview Teamplate_Part3_16.jpg
- KhÃ¡c **r3my** (summary note Ä‘oáº¡n, khÃ´ng endings)

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2msf (Match + Sentence + Features)
- Kind `p2-r2-match-sentence-features` Â· code **r2msf**
- Q14â€“17 match Aâ€“H Â· Q18â€“22 sentence ONE WORD Â· Q23â€“26 features Aâ€“D
- SAMPLE: The global importance of wetlands (Cam19 T3 P2); preview Teamplate_Part2_18.jpg
- KhÃ¡c **r2mfs** (match â†’ features â†’ sentence)

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3sb (Summary bank + YNNG + MC)
- Kind `p3-r3-summary-bank-ynng-mc` Â· code **r3sb**
- Q27â€“32 summary bank Aâ€“K Â· Q33â€“37 YNNG Â· Q38â€“40 MC Aâ€“D
- SAMPLE: gifted child / Mirzakhani (Cam19 T2 P3); preview Teamplate_Part3_15.jpg
- Infer: bank â‰¥10 hoáº·c 6 gaps + 5 YNNG + 3 MC â†’ r3sb (khÃ¡c r3sy)

## ÄÃ£ xong (2026-07-09) â€” Fix Choose TWO chá»‰ chá»n 1 Ä‘Ã¡p Ã¡n (r2msc / Cam19 T2)
- **Root cause:** AI/import chá»‰ gáº¯n `options` Aâ€“E lÃªn cÃ¢u 1 (Q23/Q25); Q24/Q26 `options: []` â†’ `isReadingChooseTwoGroup` false â†’ UI MC chá»n 1
- `normalizeReadingChooseTwoGroup`: share options sang cÃ¢u 2; wire sanitize + ReadingQuestionPanel
- Cloud Cam19 T2 P2 (`reading-manual-1783587241597`) Ä‘Ã£ fill options Q24/Q26
- Test `scripts/test-r2msc-choose-two.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Nháº­n dáº¡ng xÃ¡o trá»™n dáº¡ng cÃ¢u (má»i template)
- `ieltsReadingGroupRoles.ts`: role Match/TFNG/YNNG/Choose TWO/Summary bank/Notes/Tableâ€¦
- `reorderPartGroupsToTemplate`: sáº¯p láº¡i groups vá» thá»© tá»± SAMPLE (role + dáº£i Q)
- `alignQuestionGroupsToTemplate` gá»i reorder trÆ°á»›c hybrid
- Infer: multiset role + cháº¥m assignment theo sá»‘ cÃ¢u (phÃ¢n biá»‡t r3my/r3ysm khi type order xÃ¡o)
- Test: `scripts/test-shuffle-groups.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2msc (Match + Sentence + Choose TWO)
- Kind `p2-r2-match-sentence-choose-two` Â· code **r2msc**
- Q14â€“18 match Aâ€“F Â· Q19â€“22 sentence ONE WORD Â· Q23â€“24 + Q25â€“26 2Ã— Choose TWO Aâ€“E
- SAMPLE: Athletes and stress (Cam19 T2 P2); preview Teamplate_Part2_17.jpg
- Prompt AI + infer signature

## ÄÃ£ xong (2026-07-09) â€” Template r3my cáº­p nháº­t Cam19 (MC + Summary Aâ€“J + YNNG)
- Kind `p3-r3-mc-summary-ynng` Â· code **r3my**
- SAMPLE: *The persistence and peril of misinformation* (Cam19 T1 P3)
- Q27â€“30 MC Aâ€“D Â· Q31â€“36 summary bank Aâ€“J Â· Q37â€“40 YNNG
- Prompt AI + infer `multiple-choice|summary-completion|ynng` (+ gap-fill alias)
- KhÃ¡c **r3ysm** (YNNG â†’ summary â†’ MC)

## ÄÃ£ xong (2026-07-09) â€” Cam19 T1 Reading P3 double YNNG + data fix
- **Bug:** Q37â€“40 `group.type=multiple-choice` + cÃ¢u YNNG â†’ UI MC hiá»‡n **A YES / B NO** chá»“ng instruction YES ifâ€¦ (double)
- **Sanitize + UI:** Ã©p `ynng` khi instruction/options lÃ  tri-state; radio luÃ´n 3 option ngáº¯n
- **Cloud fix** `reading-manual-1783584609723` (Cam 19 Test 1):
  - Q27â€“30 â†’ MC Aâ€“D (Ä‘Ã¡p Ã¡n D/A/C/D)
  - Q31â€“36 â†’ summary bank (H/J/G/B/E/C)
  - Q37â€“40 â†’ **ynng** (YES / NOT GIVEN / NO / NOT GIVEN)
- Script: `apps/web/scripts/fix-cam19-t1-p3-via-db.mts`

## ÄÃ£ xong (2026-07-09) â€” Template P1 r1tn (TFNG + Notes)
- Kind `p1-r1-tfng-notes` Â· code **r1tn**
- Q1â€“7 TFNG Â· Q8â€“13 notes ONE WORD (`notePassage` bullets) â€” Teamplate_Part1_14.jpg
- SAMPLE: tennis racket / materials, spin, training, gut, weights, grip
- Preview: `public/ielts-wizard/reading/p1/Teamplate_Part1_14.jpg`
- Infer: `tfng|gap-fill` + notePassage / â€œComplete the notesâ€ â†’ r1tn (khÃ´ng nháº§m r1g)
- Prompt AI + hybrid notePassage nhÆ° r1n8/r2tn

## ÄÃ£ xong (2026-07-09) â€” Fix r3ysm thiáº¿u LIST OF OPTIONS (Q31â€“36) â€” v2 cá»©ng
- **Root cause:** AI tráº£ sá»‘ nhÃ³m â‰  SAMPLE (vd. tÃ¡ch MC â†’ 4 groups) â†’ `forceTemplateHybridGroups` early-return â†’ khÃ´ng gáº¯n wordBank
- `forceTemplateSummaryWordBanks`: match theo **sá»‘ cÃ¢u Q31â€“36** (khÃ´ng phá»¥ thuá»™c index); luÃ´n Ã©p SAMPLE Aâ€“J
- `finalizeTemplateStructure`: cháº¡y word-bank Ã©p á»Ÿ **má»i** nhÃ¡nh `applyReadingTemplateTableStructure`
- `normalizeAiReadingPart`: extract bank tá»« alias (`listOfOptions`, options cÃ¢u Ä‘áº§uâ€¦); type â†’ summary-completion khi list of phrases
- Test `scripts/test-r3ysm-wordbank.mts` PASS (missing + partial + **4-group mismatch**)

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3ysm (YNNG + Summary bank + MC)
- Kind `p3-r3-ynng-summary-mc` Â· code **r3ysm**
- Q27â€“30 YNNG Â· Q31â€“36 summary word bank Aâ€“J Â· Q37â€“40 MC Aâ€“D
- Preview: `Teamplate_Part3_14.jpg` â†’ `public/ielts-wizard/reading/p3/`
- SAMPLE: Wegener / continental drift

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2mfy (MC + Features + YNNG)
- Kind `p2-r2-mc-features-ynng` Â· code **r2mfy**
- Q14â€“16 MC Aâ€“D Â· Q17â€“22 matching-features Aâ€“E Â· Q23â€“26 YNNG (claims of writer)
- Preview: `Teamplate_Part2_16.jpg` â†’ `public/ielts-wizard/reading/p2/`
- SAMPLE: Growth mindset (Binet, Dweck, Gelman, Bates, Yeager & Walton)

## ÄÃ£ xong (2026-07-09) â€” Template P1 r1ms2 (Match + Summary + Choose TWO)
- Kind `p1-r1-match-summary-choose-two` Â· code **r1ms2**
- Q1â€“5 match Aâ€“E Â· Q6â€“9 summary ONE WORD Â· Q10â€“11 Choose TWO Aâ€“E Â· Q12â€“13 MC
- Preview: `Teamplate_Part1_13.jpg` â†’ `public/ielts-wizard/reading/p1/`
- SAMPLE: Green roofs

## ÄÃ£ xong (2026-07-09) â€” Fix r2hmc thiáº¿u ná»™i dung (chuáº©n r2hm)
- SAMPLE passage dÃ i Ä‘á»§ 7 Ä‘oáº¡n; summary note liá»n (format Diamond r2hm); MC instruction Cam-style
- `forceTemplateHybridGroups`: merge **headings[]** + summary **note** tá»« SAMPLE khi AI thiáº¿u
- Prompt r2hmc: báº¯t buá»™c headings Ä‘áº§y Ä‘á»§ + note summary liá»n 24________â€¦; khÃ´ng noteTable
- Test: `scripts/test-r2hmc.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2hmc (Headings + MC + Summary)
- Kind `p2-r2-headings-mc-summary` Â· code **r2hmc**
- Q14â€“20 matching-headings Aâ€“G (iâ€“viii) Â· Q21â€“23 MC Aâ€“D Â· Q24â€“26 summary ONE WORD AND/OR A NUMBER (note)
- Preview: `Teamplate_Part2_15.jpg` â†’ `public/ielts-wizard/reading/p2/`
- SAMPLE: Steam car / Model E; khÃ¡c r2hm (thá»© tá»± headingsâ†’MCâ†’summary)

## ÄÃ£ xong (2026-07-09) â€” Template P1 r1msf (Match + Summary + Features)
- Kind `p1-r1-match-summary-features` Â· code **r1msf**
- Q1â€“4 matching-paragraph Aâ€“H Â· Q5â€“8 summary ONE WORD (note) Â· Q9â€“13 matching-features Aâ€“D
- Preview: `Teamplate_Part1_12.jpg` â†’ `public/ielts-wizard/reading/p1/`
- SAMPLE: Making buildings with wood (Cheeseman, Mannstrom, Surgenor, Preston & Lehne)
- KhÃ´ng noteTable (summary only)

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2mys (MC + YNNG + Summary bank)
- Kind `p2-r2-mc-ynng-summary` Â· code **r2mys**
- Q14â€“19 MC Aâ€“D Â· Q20â€“23 YNNG Â· Q24â€“26 summary word bank Aâ€“F (note + 24________)
- Preview: `Teamplate_Part2_14.jpg` â†’ `public/ielts-wizard/reading/p2/`
- KhÃ¡c r2ms: thá»© tá»± MC â†’ YNNG â†’ summary (khÃ´ng MC â†’ summary â†’ YNNG)
- SAMPLE: AI / UK health system

## ÄÃ£ xong (2026-07-09) â€” Template P2 r2mfs (Match + Features + Sentence)
- Kind `p2-r2-match-features-sentence` Â· code **r2mfs**
- Q14â€“18 matching-paragraph Aâ€“G Â· Q19â€“21 matching-features Aâ€“C (TSI/Salvage/Shelterwood) Â· Q22â€“26 sentence ONE WORD
- Preview: `Teamplate_Part2_13.jpg` â†’ `public/ielts-wizard/reading/p2/`
- Builder + catalog + AI prompt + infer; SAMPLE Forest management

## ÄÃ£ xong (2026-07-09) â€” Fix r1st gap 6 máº¥t (header rá»—ng)
- **Bug:** `normalizeReadingNoteTable` `.filter(Boolean)` bá» header `''` â†’ 4 cá»™t â†’ 3, máº¥t cá»™t Sale + gap 6
- **Fix:** giá»¯ header rá»—ng; SAMPLE r1st gaps [4,5,6,7]; test `test-r1st-gap6.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Template P1 r1st (Sentence + Table + TFNG)
- Kind `p1-r1-sentence-table-tfng` Â· code **r1st**
- Q1â€“3 sentence (TWO WORDS AND/OR A NUMBER) Â· Q4â€“7 noteTable 4 cá»™t Intensive vs aeroponic Â· Q8â€“13 TFNG
- Preview: `Teamplate_Part1_11.jpg` â†’ `public/ielts-wizard/reading/p1/`
- Builder + catalog + AI prompt + TABLE_TEMPLATE_KINDS + infer (khÃ¡c r1ntf: sentence, khÃ´ng notePassage)
- SAMPLE: Crop-growing skyscrapers / aeroponic urban farming

## ÄÃ£ xong (2026-07-09) â€” noteTable CHá»ˆ Ä‘Ãºng slot SAMPLE (TFNG sáº¡ch)
- **Cá»•ng cá»©ng** `enforceNoteTableOnlyOnTemplateSlots`: SAMPLE khÃ´ng table â†’ strip Háº¾T; chá»‰ giá»¯ khi index SAMPLE cÃ³ noteTable
- UI: render noteTable **chá»‰** khi instruction `Complete the tableâ€¦` (khÃ´ng TFNG/summary/sentence)
- `sanitizeGroup`: gá»¡ noteTable khá»i tfng/ynng/match/MC/summary/notes
- Infer wizard: `tfng|gap-fill` + noteTable chá»‰ â†’ r1tb náº¿u instruction table
- Test: TFNG+sentence strip table; summary strip; r1tb/r1nt OK

## ÄÃ£ xong (2026-07-09) â€” Chá»‘ng nhiá»…m table vÃ o Summary ONE WORD
- **Bug:** â€œComplete the summary below. Choose ONE WORD ONLYâ€¦â€ váº«n dÃ­nh noteTable (UI báº£ng)
- **Fix:** `isReadingSummaryInstruction` / `groupMustNotHaveNoteTable` â€” gá»¡ noteTable cho summary/notes/sentence
- rematerialize: SAMPLE khÃ´ng table â†’ strip háº¿t; cÃ³ table â†’ chá»‰ gáº¯n khi instruction **table** (khÃ´ng summary)
- UI `ReadingQuestionPanel` / `GapFillGroup`: khÃ´ng render noteTable náº¿u summary/notes
- Validate/import: khÃ´ng báº¯t noteTable cho summary
- Test: summary ONE WORD strip noteTable PASS; r1tb/r1nt OK

## ÄÃ£ xong (2026-07-09) â€” Template P3 r3ms (Match + Summary + Features)
- Kind `p3-r3-match-summary-features` Â· code **r3ms**
- Q27â€“31 matching-paragraph Aâ€“F Â· Q32â€“35 summary ONE WORD (note) Â· Q36â€“40 matching-features Aâ€“D
- Preview: `Teamplate_Part3_13.jpg` â†’ `public/ielts-wizard/reading/p3/`
- Builder + catalog + AI prompt + infer (khÃ¡c r3tb: summary note, khÃ´ng noteTable)
- SAMPLE: Space debris (Frueh / Krag / Sorge / Jah)

## ÄÃ£ xong (2026-07-09) â€” Chá»‘ng nhiá»…m noteTable sang template khÃ¡c
- **Bug:** rematerialize dá»±ng báº£ng tá»« má»i â€œONE WORD ONLYâ€; apply structure cháº¡y full pipeline cho má»i template
- **Fix:** `applyReadingTemplateTableStructure` phÃ¢n nhÃ¡nh:
  - SAMPLE khÃ´ng notes/table â†’ align + strip noteTable
  - chá»‰ notes â†’ merge notePassage, khÃ´ng rematerialize table
  - cÃ³ table â†’ full pipeline + strip index khÃ´ng cÃ³ table
- rematerialize: khÃ´ng build table náº¿u SAMPLE khÃ´ng cÃ³ noteTable
- Test: `test-no-table-infection.mts` (tfng-gap sáº¡ch, r1tb/r1nt OK)

## ÄÃ£ xong (2026-07-09) â€” Fix r1nt layout DeepSeek (notes|TFNG|table)
- **Lá»—i user:** `cÃ¢u 7 thiáº¿u trong noteTable`; `cáº§n gap-fill|tfng|gap-fill (nháº­n gap-fill|gap-fill|gap-fill)`; `thiáº¿u notePassage`
- **Root cause:** rematerialize gáº¯n noteTable vÃ o nhÃ³m Notes vÃ¬ â€œONE WORD ONLYâ€; AI tráº£ 3Ã— gap-fill
- **Fix:** `forceTemplateHybridGroups` Ã©p type + notePassage + TFNG theo index SAMPLE; rematerialize **khÃ´ng** nháº§m notesâ†’table; validate skip notes group
- Test: `scripts/test-r1nt-layout.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Fix r1tb DeepSeek â€œná»­a vá»iâ€ (láº§n 6)
- **Bug:** AI tráº£ 4â€“6 hÃ ng cÃ³ chá»¯ â†’ khÃ´ng bá»‹ coi list-like â†’ giá»¯ báº£ng thiáº¿u Aim/Method
- **Fix:** incomplete náº¿u rows < 85% SAMPLE; pickBest **máº·c Ä‘á»‹nh Ã©p SAMPLE** trá»« khi AI â‰¥ 90% sá»‘ hÃ ng SAMPLE
- Nuclear trong rematerialize: rows quÃ¡ Ã­t â†’ mergeTemplateLayoutWithPrompts
- Test D half-table 6 rows â†’ 11 rows Aim/Method PASS

## ÄÃ£ xong (2026-07-09) â€” Fix r1tb thiáº¿u Aim/Method (láº§n 5) â€” Ã©p SAMPLE layout
- mergeTemplateLayoutWithPrompts; pickBest Æ°u tiÃªn SAMPLE; repair fallback
- Test: content/listlike/oneword â€” 11 rows, Aim/Method, PASS

## ÄÃ£ xong (2026-07-09) â€” Fix r1tb table cÃ³ khung nhÆ°ng **khÃ´ng ná»™i dung** (láº§n 3)
- noteTableIsContentRich, pickBestNoteTable, enrich prompts
- Test: `scripts/test-r1tb-content.mts` + `test-r1tb-oneword.mts` PASS

## ÄÃ£ xong (2026-07-09) â€” Fix r1tb Q7â€“12 table bá»‹ thÃ nh one-word (láº§n 2)
- rematerialize + remap gap + rawJson normalize + rebuildPayload re-apply
- Test: `apps/web/scripts/test-r1tb-oneword.mts` PASS
- tsc pass

## ÄÃ£ xong (2026-07-09) â€” Fix r1tb Q7â€“12 table bá»‹ thÃ nh one-word (láº§n 1)
- Parse Ã´ string; forceTemplate; prompt cáº¥m one-word list (chÆ°a Ä‘á»§ vá»›i DeepSeek)

---

## Session 2026-07-09 â€” IELTS Reading Wizard (tÃ³m táº¯t)

### Template Reading má»›i
| Code | Kind | Passage | Layout | Preview |
|------|------|---------|--------|---------|
| r1my | p1-r1-match-ynng-features | P1 | Match Ä‘oáº¡n + YNNG + Features | Teamplate_Part1_8.jpg |
| r1nt | p1-r1-notes-tfng-table | P1 | Notes â†’ TFNG â†’ Table | Teamplate_Part1_9.jpg (Nutmeg) |
| r1ntf | p1-r1-notes-table-tfng | P1 | Notes â†’ Table â†’ TFNG | r1t.svg (Huarango) |
| r1tb | p1-r1-tfng-table | P1 | TFNG â†’ Table (nÃ—m merge) | Teamplate_Part1_10.jpg (Rocha bats) |
| r2cs | p2-r2-match-choose-two-summary | P2 | Match + 2Ã— Choose TWO + Summary | Teamplate_Part2_10.jpg |
| r2mt | p2-r2-match-tfng-choose-two | P2 | Match + TFNG + Choose TWO | Teamplate_Part2_11.jpg |
| r2tn | p2-r2-tfng-notes | P2 | TFNG + Notes (Silbo) | Teamplate_Part2_12.jpg |
| r3fy | p3-r3-features-ynng-summary | P3 | Features + YNNG + Summary | Teamplate_Part3_8.jpg |
| r3tn | p3-r3-tfng-notes-mc | P3 | TFNG + Notes + MC | Teamplate_Part3_9.jpg |
| r3em | p3-r3-endings-summary-mc | P3 | Endings + Summary bank + MC | Teamplate_Part3_10.jpg |
| r3hmy | p3-r3-headings-mc-ynng | P3 | Headings + MC + YNNG | Teamplate_Part3_11.jpg |

### Fix / harden UI & AI
- **Choose TWO Reading:** multi-select checkbox (2 slots) â€” `readingChooseTwoUtils.ts` + `ChooseTwoGroup`
- **ExamTrack tráº¯ng:** ErrorBoundary, safe rows, `getTemplateBuilders()` factory (khÃ´ng throw HMR)
- **Notes ngáº¯t dÃ²ng:** `break` type, decade section (1940s/1950s), AI + normalize
- **noteTable nÃ—m:** pad cá»™t, validate hÃ ng; r1nt validate notes vs table riÃªng
- **Sentence completion ngáº¯t dÃ²ng:** AI + `splitSummaryNoteParagraphs` + normalize note/prompt
- **r3tn notes** layout r1n8 Ä‘áº§y Ä‘á»§; answer Cam14 (large/microplastic/â€¦)

### Files chÃ­nh
`ieltsReadingPartTemplates.ts`, `ieltsReadingTemplateCatalog.ts`, `ieltsReadingWizardConfig.ts`,
`ieltsReadingWizardEdit.ts`, `ieltsReadingAiPrompt.ts`, `ieltsReadingAiNormalize.ts`,
`ReadingQuestionPanel.tsx`, `readingChooseTwoUtils.ts`, `readingNoteTableUtils.ts`,
`listeningNotePassage.ts`, `ExamTrackPage.tsx`, `ExamTrackErrorBoundary.tsx`

---

## ÄÃ£ xong (2026-07-07) â€” Admin Publish ná»™i dung (toÃ n app)
- Migration 012 â€” `admin_published_modules` + `admin_publish_meta`
- /app/admin â†’ tab "Publish ná»™i dung" â†’ má»™t nÃºt: vocab, viáº¿t, nghe, dá»‹ch, cáº¥u trÃºc cÃ¢u, mindmap, Ä‘á» Reading/Listening
- User: `syncAdminPublishedContent()` khi vÃ o /app (GlobalCatalogSync)
- Äá» cÅ©: Admin báº¥m Publish trÃªn mÃ¡y Ä‘Ã£ import â€” KHÃ”NG cáº§n import láº¡i tá»«ng file

## ÄÃ£ xong (2026-07-07) â€” Listening publish cloud
- Migration 011 `listening_exam_published` â€” Admin LÆ°u â†’ má»i user tháº¥y Ä‘á» import

## ÄÃ£ xong (2026-07-07) â€” Reading cloud: áº£nh + publish Ä‘á»
- Migration 009 (`reading_exam_images`) + 010 (`reading_exam_published`) â€” Ä‘Ã£ push Supabase
- áº¢nh: Admin upload â†’ cloud; User chá»‰ xem
- Publish Ä‘á»: Admin LÆ°u import â†’ `reading_exam_published`; `examLoader` load cho má»i user

## ÄÃ£ xong (2026-07-07) â€” Wizard Reading IELTS 18 template
- 6 template/passage (P1â€“P3) cover layout Cam 9â€“20
- 18 SVG preview + builders + AI prompt rules + edit signatures
- Test: /app/exam/track/ielts â†’ Import Wizard Reading â†’ 6 option má»—i passage

## ÄÃ£ xong (2026-07-09) â€” Reading P3 template r3hmy (Headings + MC + YNNG)
- Template `p3-r3-headings-mc-ynng` (`r3hmy`) â€” preview `Teamplate_Part3_11.jpg` (AI attitudes)
- Matching headings Q27â€“32 (Aâ€“F, iâ€“viii) + MC Q33â€“35 + YNNG Q36â€“40 (claims of writer)
- Builder `ieltsReadingP3HeadingsMcYnngPart()`; signature `matching-headings|multiple-choice|ynng`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_11.jpg`

## ÄÃ£ xong (2026-07-09) â€” Sentence completion: Ã©p ngáº¯t dÃ²ng P1â€“3
- AI: "Complete the sentencesâ€¦ NO MORE THAN TWO WORDS" â€” má»—i cÃ¢u 1 prompt 1 dÃ²ng; note multi-sentence = `\\n\\n`
- Normalize: `normalizeAiSentenceOrSummaryNote` + `normalizeAiSentencePrompts`
- UI: `splitSummaryNoteParagraphs` â€” single `\\n` cÅ©ng tÃ¡ch dÃ²ng khi sentence-style / â‰¥2 gap lines
- Template liÃªn quan: r1 sentence-mc, tfng-gap, headings-gap; r2 headings-tfng-sentence; r3 match-paragraph-sentence, gap-ynng/tfng-mcâ€¦

## ÄÃ£ xong (2026-07-09) â€” Reading P2 template r2tn (TFNG + Notes / Silbo)
- Template `p2-r2-tfng-notes` (`r2tn`) â€” preview `Teamplate_Part2_12.jpg` (Silbo Gomero)
- TFNG Q14â€“19 + notes ONE WORD Q20â€“26 (`notePassage` + 3 section: How produced / used / future)
- AI prompt: **Ã©p ngáº¯t dÃ²ng** â€” má»—i section = `{type:section}`, má»—i bullet 1 block, `break` giá»¯a section
- Infer: `tfng|gap-fill` + notePassage â†’ r2tn (khÃ´ng nháº§m r2fw diagram)
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_12.jpg`

## ÄÃ£ xong (2026-07-09) â€” noteTable luÃ´n lÆ°á»›i n cá»™t Ã— m dÃ²ng
- AI prompt: **LUÃ”N** headers[n] + rows[m], má»—i hÃ ng cells.length === n (pad [])
- `normalizeReadingNoteTable`: pad/cáº¯t má»i hÃ ng vá» Ä‘Ãºng n cá»™t
- `validateReadingNoteTable` + AI validate: bÃ¡o lá»—i hÃ ng sai sá»‘ cá»™t
- r1ntf / r1tt / má»i table-completion: title tÃ¡ch riÃªng, khÃ´ng nhÃ©t vÃ o header

## ÄÃ£ xong (2026-07-09) â€” Reading P1 template r1ntf (Notes + Table + TFNG)
- Template `p1-r1-notes-table-tfng` (`r1ntf`) â€” preview `r1t.svg` (Huarango tree)
- Notes Q1â€“5 (`notePassage`) + table Q6â€“8 (`noteTable` 2 cá»™t) + TFNG Q9â€“13
- KhÃ¡c r1nt (notesâ†’TFNGâ†’table): thá»© tá»± **notes â†’ table â†’ TFNG**
- Signature `gap-fill|gap-fill|tfng`; validate notePassage nhÃ³m 1 + noteTable nhÃ³m 2

## ÄÃ£ xong (2026-07-09) â€” Reading P1 template r1tb (TFNG + Table)
- Template `p1-r1-tfng-table` (`r1tb`) â€” preview `Teamplate_Part1_10.jpg` (Rocha bat study)
- TFNG Q1â€“6 + table Q7â€“13 (`noteTable` 2 cá»™t Ã— m dÃ²ng, merge Findings + skip)
- Builder `ieltsReadingP1TfngTablePart()` + `CAM_ROCHA_BAT_TABLE`; infer `tfng|gap-fill` + noteTable
- áº¢nh: `Tainguyen/IELTS/Template/Teamplate_Part1_10.jpg` â†’ `apps/web/public/ielts-wizard/reading/p1/`

## ÄÃ£ xong (2026-07-09) â€” Notes Reading: Ã©p ngáº¯t dÃ²ng (1940s/1950s)
- **Váº¥n Ä‘á»:** AI gá»™p heading tháº­p niÃªn (Cam15 Moore) â†’ UI khÃ´ng xuá»‘ng dÃ²ng
- **Fix render:** `isNoteDecadeOrEraHeading` + type `break`; atomize/group lines tÃ¡ch section
- **Fix AI:** prompt notes P1â€“3 báº¯t buá»™c section riÃªng cho 1930s/1940s/1950s + `break`
- **Normalize:** `normalizeAiNotePassage` convert decade static â†’ section, `\\n` â†’ blocks/break
- Types: `ReadingNotePassageBlock` + Listening thÃªm `break`

## ÄÃ£ xong (2026-07-09) â€” Reading P3 template r3em (Endings + Summary bank + MC)
- Template `p3-r3-endings-summary-mc` (`r3em`) â€” preview `Teamplate_Part3_10.jpg` (Fairy tales / Tehrani)
- Sentence endings Aâ€“F Q27â€“31 + summary word bank Aâ€“I Q32â€“36 (`note` inline) + MC Q37â€“40
- Builder `ieltsReadingP3EndingsSummaryMcPart()`; signature `summary-completion|summary-completion|multiple-choice`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_10.jpg`

## ÄÃ£ xong (2026-07-09) â€” Reading P1 template r1nt (Notes + TFNG + Table)
- Template `p1-r1-notes-tfng-table` (`r1nt`) â€” preview `Teamplate_Part1_9.jpg` (Nutmeg)
- Notes Q1â€“4 (`notePassage` nhÆ° r1n8) + TFNG Q5â€“7 + table Q8â€“13 (`noteTable` merge 17th century nhÆ° r1tt)
- Builder `ieltsReadingP1NotesTfngTablePart()` + `CAM_NUTMEG_NOTE_PASSAGE` + `CAM_NUTMEG_HISTORY_TABLE`
- Signature: `gap-fill|tfng|gap-fill` (notes â†’ TFNG â†’ table); TABLE_TEMPLATE_KINDS includes r1nt
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_9.jpg`

## ÄÃ£ xong (2026-07-09) â€” r3tn notes Q34â€“39 Ä‘á»§ layout r1n8
- `CAM_MARINE_DEBRIS_NOTE_PASSAGE`: section heading + bullet/sub-bullet + gap (giá»‘ng Glass r1n8)
- Äá»§ text tÄ©nh: plastic (not metal or wood), insufficient information on + 3 sub-bullets, Rochman closing
- Answer key Cam14: 34 large, 35 microplastic, 36 populations, 37 types, 38 survival, 39 disasters
- AI prompt: báº¯t buá»™c notePassage Ä‘áº§y Ä‘á»§, cáº¥m rÃºt gá»n thÃ nh `note` string

## ÄÃ£ xong (2026-07-09) â€” Fix crash TEMPLATE_BUILDERS / track IELTS tráº¯ng
- **Root cause:** `assertAllTemplateBuildersRegistered()` throw khi HMR catalog cáº­p nháº­t trÆ°á»›c builder body â†’ `ReferenceError: ieltsReadingP3TfngNotesMcPart is not defined` â†’ module fail â†’ ExamTrack Lazy crash
- **Fix:** TEMPLATE_BUILDERS dÃ¹ng lazy `() => fn()`; assert chá»‰ `console.error`, **khÃ´ng throw** lÃºc load module
- React Router Future Flag / DevTools messages = warning thÆ°á»ng, khÃ´ng pháº£i lá»—i trang

## ÄÃ£ xong (2026-07-09) â€” Reading P3 template r3tn (TFNG + Notes + MC)
- Template `p3-r3-tfng-notes-mc` (`r3tn`) â€” preview JPG `Teamplate_Part3_9.jpg` (Marine debris / Rochman)
- TFNG Q27â€“33 + notes ONE WORD Q34â€“39 (`notePassage` + notesTitle) + MC best title Q40
- Builder `ieltsReadingP3TfngNotesMcPart()` + `CAM_MARINE_DEBRIS_NOTE_PASSAGE`
- Signature: `tfng|gap-fill|multiple-choice` (+ notePassage)
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_9.jpg`

## ÄÃ£ xong (2026-07-09) â€” Reading P2 template r2mt (Match Ä‘oáº¡n + TFNG + Choose TWO)
- Template `p2-r2-match-tfng-choose-two` (`r2mt`) â€” preview JPG `Teamplate_Part2_11.jpg` (Zoos)
- Matching paragraph Q14â€“17 (Aâ€“G) + TFNG Q18â€“22 + Choose TWO Q23â€“24 (+ Q25â€“26 máº«u)
- Builder `ieltsReadingP2MatchTfngChooseTwoPart()`; signature `matching-paragraph|tfng|multiple-choice`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_11.jpg`

## ÄÃ£ xong (2026-07-09) â€” Fix Reading IELTS Choose TWO khÃ´ng chá»n 2 Ä‘Ã¡p Ã¡n
- **Root cause:** UI Reading render Choose TWO nhÆ° 2Ã— MC radio (má»—i cÃ¢u 1 list) â†’ user khÃ´ng multi-select Ä‘Æ°á»£c 2 option nhÆ° Listening
- **Fix:** `readingChooseTwoUtils.ts` + `ChooseTwoGroup` (checkbox, 2 slots) trong `ReadingQuestionPanel`
- Nháº­n diá»‡n: instruction "Choose TWO" / "Which TWO" + 2 cÃ¢u MC cÃ¹ng options; gá»™p AI 4 cÃ¢u â†’ split cáº·p
- CSS: `.reading-test-choose-two*` trong `readingTest.css`
- ÄÃ¡p Ã¡n váº«n 2 question id (má»—i Ã´ 1 chá»¯) â€” scoring khÃ´ng Ä‘á»•i

## ÄÃ£ xong (2026-07-09) â€” Reading P3 template r3fy (Features + YNNG + Summary)
- Template `p3-r3-features-ynng-summary` (`r3fy`) â€” preview JPG `Teamplate_Part3_8.jpg` (Guided play)
- Matching features Q27â€“31 (ngÆ°á»i Aâ€“G) + YNNG Q32â€“36 (claims of writer) + summary ONE WORD Q37â€“40 (`note` inline)
- Builder `ieltsReadingP3FeaturesYnngSummaryPart()` + `CAM_GUIDED_PLAY_SUMMARY_NOTE`
- Signature: `matching-features|ynng|gap-fill`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_8.jpg`

## ÄÃ£ xong (2026-07-09) â€” Reading P1 template r1my (Match Ä‘oáº¡n + YNNG + Features)
- Template `p1-r1-match-ynng-features` (`r1my`) â€” preview JPG `Teamplate_Part1_8.jpg`
- Matching paragraph Q1â€“3 (Aâ€“J) + YNNG Q4â€“6 (claims of writer) + matching features Aâ€“C Q7â€“13 (Hamiltonian/Jeffersonian/Jacksonian)
- Builder `ieltsReadingP1MatchYnngFeaturesPart()`; signature `matching-paragraph|ynng|matching-features`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_8.jpg`

## ÄÃ£ xong (2026-07-09) â€” Fix mÃ n tráº¯ng `/app/exam/track/ielts` (harden)
- **Repro sáº¡ch:** Playwright + mock auth â†’ track IELTS **render OK** (Library Archives + nÃºt Import)
- **Root cause cÃ³ thá»ƒ:** crash render tá»« Ä‘á» Dexie/localStorage lá»—i (`examType`/`parts`/`answer` undefined) â†’ React unmount tráº¯ng, khÃ´ng ErrorBoundary
- **Fix:**
  - `ExamTrackErrorBoundary` bá»c track page (hiá»‡n message thay vÃ¬ tráº¯ng)
  - `safeReadingRow` / `safeListeningRow` + `safeDraftFlag`
  - `listAllListeningExams` normalize + fallback `examType`/`parts`
  - `getPartQuestions` / `getListeningExamQuestions` / `isReadingAnswerCorrect` / draft completion â€” defensive
- User: **Ctrl+Shift+R** hard refresh sau HMR lá»—i transform

## ÄÃ£ xong (2026-07-09) â€” Reading P2 template r2cs (Match Ä‘oáº¡n + Choose TWO + Summary)
- Template `p2-r2-match-choose-two-summary` (`r2cs`) â€” preview JPG `Teamplate_Part2_10.jpg` (Cam14 T1 Bike-sharing)
- Matching paragraph Q14â€“18 (Aâ€“G, which section) + 2Ã— Choose TWO Q19â€“20 & Q21â€“22 + summary ONE WORD Q23â€“26 (`note` inline)
- Builder `ieltsReadingP2MatchChooseTwoSummaryPart()` + `CAM14_T1_BIKE_SUMMARY_NOTE`
- Signature: `matching-paragraph|multiple-choice|multiple-choice|gap-fill`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_10.jpg`

## ÄÃ£ xong (2026-07-07) â€” Reading P1 template r1n (Notes + TFNG)
- Template `p1-r1-notes-tfng` (`r1n`) â€” preview JPG `Question1_6.jpg` (Wildfires Q1â€“6)
- `notePassage` + `notesTitle` + `ReadingNotePassageBox.tsx` render notes inline
- Builder `ieltsReadingP1NotesTfngPart()` + Cam10 T4 `exam_passage1.json` rebuilt + bundle ZIP

## ÄÃ£ xong (2026-07-07) â€” Reading P2 template r2g (Summary + Match)
- Template `p2-r2-gap-match` (`r2g`) â€” preview JPG `Teamplate_Part2_1.jpg` (Cam10 T4 Second nature)
- Summary Q14â€“18: `note` inline `14________` â€¦ `18________` + `SummaryGapFillNote` UI
- Builder `ieltsReadingP2GapMatchPart()` + Cam10 T4 `exam_passage2.json` rebuilt + bundle ZIP

## ÄÃ£ xong (2026-07-07) â€” Reading P3 template r3tb (Match + Table + Features)
- Template `p3-r3-match-table-features` (`r3tb`) â€” preview JPG `Teamplate_Part3_1.jpg` (Cam11 T1 geo-engineering)
- Match Ä‘oáº¡n Q27â€“29 + table Q30â€“36 (`noteTable` Procedure|Aim) + match ngÆ°á»i Q37â€“40
- Builder `ieltsReadingP3MatchTableFeaturesPart()` + `CAM11_T1_GEO_ENGINEERING_TABLE`

## ÄÃ£ xong (2026-07-08) â€” Reading P1 template r1ts (TFNG + Match + Summary)
- Template `p1-r1-tfng-match-summary` (`r1ts`) â€” preview JPG `Teamplate_Part1_2.jpg` (Cam11 T4 Research using twins)
- TFNG Q1â€“4 + matching features Q5â€“9 (Galton/Bouchard/Reed) + summary word bank Aâ€“F Q10â€“13 (`note` inline)
- Builder `ieltsReadingP1TfngMatchSummaryPart()` + `CAM11_T4_EPIGENETIC_SUMMARY_NOTE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_2.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2te (TFNG + Endings + Summary)
- Template `p2-r2-tfng-endings-summary` (`r2te`) â€” preview JPG `Teamplate_Part2_4.jpg` (Cam11 T3 Great Migrations)
- TFNG Q14â€“18 + matching sentence endings Aâ€“G Q19â€“22 + summary ONE WORD Q23â€“26 (`note` inline)
- Builder `ieltsReadingP2TfngEndingsSummaryPart()` + `CAM11_T3_MIGRATION_ENDINGS_BANK` + `CAM11_T3_PRONGHORN_SUMMARY_NOTE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_4.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2fs (MC + TFNG + Endings)
- Template `p2-r2-mc-tfng-endings` (`r2fs`) â€” preview JPG `Teamplate_Part2_6.jpg` (Cam11 T4 An Introduction to Film Sound)
- Multiple choice Q14â€“18 + TFNG Q19â€“23 + matching sentence endings Aâ€“E Q24â€“26
- Builder `ieltsReadingP2McTfngEndingsPart()`

## ÄÃ£ xong (2026-07-08) â€” Reading P3 template r3hy (Headings + Summary + YNNG)
- Template `p3-r3-headings-summary-ynng` (`r3hy`) â€” preview JPG `Teamplate_Part3_4.jpg` (Cam11 T4 This Marvellous Invention)
- Matching headings Q27â€“32 (Aâ€“F) + summary word bank Aâ€“G Q33â€“36 + YNNG Q37â€“40
- Builder `ieltsReadingP3HeadingsSummaryYnngPart()`

## ÄÃ£ xong (2026-07-08) â€” Fix Reading Wizard `TEMPLATE_BUILDERS[kind] is not a function`
- `resolveReadingTemplateKind()` â€” fallback kind há»£p lá»‡ tá»« catalog/default khi localStorage hoáº·c kind lá»—i
- `assertAllTemplateBuildersRegistered()` â€” dev-time check catalog â†” builders
- `ieltsReadingWizardPersist` + `ieltsReadingAiGenerate` dÃ¹ng resolve trÆ°á»›c khi gá»i builder

## ÄÃ£ xong (2026-07-08) â€” Reading P3 template r3ag (Headings + Gap + YNNG)
- Template `p3-r3-headings-gap-ynng` (`r3ag`) â€” preview JPG `Teamplate_Part3_5.jpg` (Cam12 T5 What's the Purpose of Gaining Knowledge)
- Matching headings Q27â€“32 (Aâ€“F) + summary TWO WORDS Q33â€“36 (`note` inline) + YNNG Q37â€“40
- Builder `ieltsReadingP3HeadingsGapYnngPart()` + `CAM12_T5_KNOWLEDGE_HEADINGS` + `CAM12_T5_ARSON_SUMMARY_NOTE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_5.jpg`

## ÄÃ£ xong (2026-07-08) â€” Fix preview Part2_6 â†’ r2fs (MC + TFNG + Endings)
- `Teamplate_Part2_6.jpg` = Film Sound (trÃ¹ng Part2_5) â€” preview `r2fs`, khÃ´ng cÃ²n gÃ¡n nháº§m Falkirk
- `Teamplate_Part2_2.jpg` = Falkirk diagram â€” preview `r2fw`

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2fw (TFNG + Diagram)
- Template `p2-r2-tfng-diagram` (`r2fw`) â€” preview JPG `Teamplate_Part2_2.jpg` (Cam11 T1 The Falkirk Wheel)
- TFNG Q14â€“19 + diagram labeling ONE WORD Q20â€“26 (`imageFile: falkirk-wheel-diagram.jpg`)
- Builder `ieltsReadingP2TfngDiagramPart()`

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2fs (MC + TFNG + Endings)
- Template `p2-r2-mc-tfng-endings` (`r2fs`) â€” preview JPG `Teamplate_Part2_6.jpg` (Cam11 T4 An Introduction to Film Sound)
- Multiple choice Q14â€“18 + TFNG Q19â€“23 + matching sentence endings Aâ€“E Q24â€“26
- Builder `ieltsReadingP2McTfngEndingsPart()` + `CAM11_T4_FILM_SOUND_ENDINGS_BANK`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_6.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P3 template r3hy (Headings + Summary + YNNG)
- Template `p3-r3-headings-summary-ynng` (`r3hy`) â€” preview JPG `Teamplate_Part3_4.jpg` (Cam11 T4 This Marvellous Invention)
- Matching headings Q27â€“32 (Aâ€“F) + summary word bank Aâ€“G Q33â€“36 + YNNG Q37â€“40 (views of writer)
- Builder `ieltsReadingP3HeadingsSummaryYnngPart()` + `CAM11_T4_LANGUAGE_HEADINGS` + `CAM11_T4_LANGUAGE_WORD_BANK`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_4.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P3 template r3ps (Match Ä‘oáº¡n + Sentence)
- Template `p3-r3-match-paragraph-sentence` (`r3ps`) â€” preview JPG `Teamplate_Part3_3.jpg` (Cam11 T3 Mathematical Reasoning)
- Matching paragraph Q27â€“34 (Aâ€“G) + sentence completion ONE WORD Q35â€“40
- Builder `ieltsReadingP3MatchParagraphSentencePart()`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_3.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading IELTS: bá» auto cháº¡y theo cÃ¢u
- `ReadingTest.tsx` â€” bá» `useEffect` auto-scroll passage + cÃ¢u há»i khi Ä‘á»•i `activeQuestionId`
- `ReadingQuestionPanel.tsx` â€” bá» auto chuyá»ƒn cÃ¢u tiáº¿p theo sau khi Ä‘iá»n paragraph/heading/word bank/feature

## ÄÃ£ xong (2026-07-08) â€” Reading P3 template r3my (MC + Summary + YNNG)
- Template `p3-r3-mc-summary-ynng` (`r3my`) â€” preview JPG `Teamplate_Part3_2.jpg` (Cam11 T2 Art and the Brain)
- Multiple choice Q27â€“30 + summary word bank Aâ€“H Q31â€“33 (`note` inline) + YNNG Q34â€“39 (claims of writer)
- Builder `ieltsReadingP3McSummaryYnngPart()` + `CAM11_T2_ART_BRAIN_SUMMARY_NOTE` + `CAM11_T2_ART_BRAIN_WORD_BANK`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_2.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2hm (Headings + Summary + MC)
- Template `p2-r2-headings-summary-mc` (`r2hm`) â€” preview JPG `Teamplate_Part2_3.jpg` (Cam11 T4 Easter Island)
- Matching headings Q14â€“20 + summary ONE WORD Q21â€“24 (`note` inline) + Choose TWO Q25â€“26
- Builder `ieltsReadingP2HeadingsSummaryMcPart()` + `CAM11_T4_DIAMOND_SUMMARY_NOTE`

## ÄÃ£ xong (2026-07-08) â€” Fix mÃ n tráº¯ng `/app/exam/track/ielts`
- **Root cause:** `listeningNotePassage.ts` lá»—i cÃº phÃ¡p (duplicate `question`, string chÆ°a Ä‘Ã³ng) â†’ Vite khÃ´ng transform Ä‘Æ°á»£c â†’ lazy import `ExamTrackPage` fail (chuá»—i: `ieltsListeningWizardPersist` â†’ `importListeningUtils` â†’ `listeningNotePassage`)
- **Fix phá»¥:** `ExamTrackPage.tsx` â€” chuyá»ƒn redirect `ket` xuá»‘ng sau táº¥t cáº£ hooks (trÃ¡nh Rules of Hooks khi Ä‘á»•i route)
- Verify: `pnpm --filter web exec tsc --noEmit` + `vite build` pass; dev server restart â†’ hard refresh Ctrl+Shift+R

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2hms (Headings + Match + Summary)
- Template `p2-r2-headings-match-summary` (`r2hms`) â€” preview JPG `Teamplate_Part2_9.jpg` (Cam13 T1 Boredom)
- Matching headings Q14â€“19 (Aâ€“F, iâ€“viii) + match ideas Q20â€“23 (Aâ€“E) + summary ONE WORD Q24â€“26
- Builder `ieltsReadingP2HeadingsMatchSummaryPart()` + `CAM13_T1_BOREDOM_SUMMARY_NOTE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_9.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P1 template r1tt (Table + TFNG, merge Ã´)
- Template `p1-r1-table-tfng` (`r1tt`) â€” preview JPG `Teamplate_Part1_7.jpg` (Cam13 T4 Coconut palm)
- Table completion Q1â€“8 (`noteTable` 3 cá»™t, `rowSpan`/`colSpan`/`skip`) + TFNG Q9â€“13
- `R1TT_MERGE_TABLE_SAMPLE` â€” báº£ng máº«u "fruits" gá»™p 5 hÃ ng; váº«n há»— trá»£ báº£ng 2 cá»™t khÃ´ng merge (`CAM13_T1_NZ_WEBSITE_TABLE`)
- `examData.ts` + `readingNoteTableUtils.ts` + `ReadingNoteTable.tsx` â€” render merge cá»™t/hÃ ng
- AI prompt: quy táº¯c merge khi copy Word/PDF dáº¡ng báº£ng IELTS
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_7.jpg`
- Wizard edit: `gap-fill|tfng` + `noteTable` â†’ `r1tt` (khÃ¡c `r1n`/`r1n8` notePassage)

## ÄÃ£ xong (2026-07-08) â€” Fix sync cloud: preset deck ID khÃ´ng pháº£i UUID
- Lá»—i: `decks upsert: invalid input syntax for type uuid: "preset:academic:kinh-te-hoc"`
- NguyÃªn nhÃ¢n: `syncLocalToCloud` Ä‘áº©y cáº£ bá»™ preset (`preset:group:slug`) lÃªn Supabase â€” cá»™t `decks.id` lÃ  UUID
- Fix: `packages/db/src/cloud/presetDeck.ts` â€” `isPresetDeck()`; sync bá» qua deck/card/SRS preset
- Chá»‰ deck `origin: user` (UUID) Ä‘Æ°á»£c Ä‘á»“ng bá»™ cloud; preset láº¥y tá»« seed local + Admin publish

## ÄÃ£ xong (2026-07-08) â€” Vocab preset decks bá»‹ double
- Root cause: `seedPresetDecks` dÃ¹ng UUID ngáº«u nhiÃªn + React StrictMode/sync Admin publish táº¡o báº£n trÃ¹ng cÃ¹ng group+tÃªn
- Fix: `stablePresetDeckId()` + `put` idempotent + `dedupePresetDecks()` gá»™p tháº»/SRS vá» 1 bá»™
- `mergeVocab` remap ID preset trÆ°á»›c `bulkPut`; gá»i dedupe sau sync

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2hl (Headings + TFNG + Sentence)
- Template `p2-r2-headings-tfng-sentence` (`r2hl`) â€” preview JPG `Teamplate_Part2_7.jpg` (Cam12 T8 The Lost City)
- Matching headings Q14â€“20 (Aâ€“G) + TFNG Q21â€“24 + sentence completion ONE WORD Q25â€“26
- Builder `ieltsReadingP2HeadingsTfngSentencePart()` + `CAM12_T8_LOST_CITY_HEADINGS`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_7.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P2 template r2ms (MC + Summary + YNNG)
- Template `p2-r2-mc-summary-ynng` (`r2ms`) â€” preview JPG `Teamplate_Part2_8.jpg` (Cam12 T8 Bring back the big cats)
- Multiple choice Q14â€“18 + summary word bank Aâ€“F Q19â€“22 + YNNG Q23â€“26
- Builder `ieltsReadingP2McSummaryYnngPart()` + `CAM12_T8_LYNX_SUMMARY_NOTE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_8.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P1 template r1n8 (Notes 8 + TFNG)
- Template `p1-r1-notes-tfng-8` (`r1n8`) â€” preview JPG `Teamplate_Part1_5.jpg` (Cam12 T8 The history of glass)
- Note completion Q1â€“8 (`notePassage`, ONE WORD) + TFNG Q9â€“13
- Builder `ieltsReadingP1NotesTfng8Part()` + `CAM12_T8_GLASS_NOTE_PASSAGE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_5.jpg`
- Wizard edit: `gap-fill|tfng` + `notePassage` + â‰¥8 gaps â†’ `r1n8` (khÃ¡c `r1n` 6 gaps)

## ÄÃ£ xong (2026-07-08) â€” Reading P1 template r1hn (Headings + Notes)
- Template `p1-r1-headings-notes` (`r1hn`) â€” preview JPG `Teamplate_Part1_4.jpg` (Cam12 T5 Flying tortoises)
- Matching headings Q1â€“7 (Aâ€“G, iâ€“viii) + note completion Q8â€“13 (`notePassage`, ONE WORD)
- Builder `ieltsReadingP1HeadingsNotesPart()` + `CAM12_T5_TORTOISE_DECLINE_NOTE_PASSAGE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_4.jpg`
- Wizard edit: `matching-headings|gap-fill` + `notePassage` â†’ `r1hn` (khÃ¡c `r1hg` sentence gap)

## ÄÃ£ xong (2026-07-08) â€” Reading P1 template r1ct (Match + Choose TWO)
- Template `p1-r1-match-choose-two` (`r1ct`) â€” preview JPG `Teamplate_Part1_3.jpg` (Cam12 T6 Agriculture risks)
- Match paragraph Q1â€“3 (Aâ€“I) + matching-features Q4â€“9 (ngÆ°á»i Aâ€“G) + Choose TWO Q10â€“13
- Builder `ieltsReadingP1MatchChooseTwoPart()` + `CAM12_T6_AGRICULTURE_PEOPLE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_3.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P3 template r3se (Summary + MC + Endings)
- Template `p3-r3-summary-mc-endings` (`r3se`) â€” preview `Teamplate_Part3_7.jpg` (Cam12 T3 Montreal Study)
- Summary TWO WORDS Q27â€“31 (`note` inline) + MC Aâ€“D Q32â€“36 + sentence endings Q37â€“40
- Builder `ieltsReadingP3SummaryMcEndingsPart()` â€” Ä‘Ã£ xÃ³a nháº§m template Listening `p3-c8`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_7.jpg`

## ÄÃ£ xong (2026-07-08) â€” Fix Reading Part 3 tráº¯ng trang (Cam13 T1 / r3ty)
- **NguyÃªn nhÃ¢n 1:** AI ghi `type: "table-completion"` â†’ crash `question.options.map` trong `MultipleChoiceGroup`.
- **NguyÃªn nhÃ¢n 2 (console):** `features[]` tá»« AI dÃ¹ng `label` thay `name` â†’ `splitReferenceText(feature.name)` crash; `ReadingHighlightableText` nháº­n `text` undefined.
- **Fix:** `readingExamSanitize.ts` â€” group type, `features`/`headings`/`wordBank` (map `label`â†’`name`); load Dexie + published; phÃ²ng thá»§ `splitReferenceText`, `segmentsFromAnnotations`, `ReadingHighlightableText`.

## ÄÃ£ xong (2026-07-08) â€” Fix Reading Wizard noteTable khÃ´ng hiá»‡n (r3ty / má»i báº£ng nÃ—n)
- `readingNoteTableUtils.ts` â€” normalize báº£ng n cá»™t Ã— n dÃ²ng, validate gap â†” questions
- Wizard AI: `mergeTemplateNoteTables` gáº¯n `noteTable` tá»« template khi AI thiáº¿u báº£ng
- Import JSON: chuáº©n hÃ³a `noteTable` trong `normalizeImportPart` + cáº£nh bÃ¡o thiáº¿u báº£ng

## ÄÃ£ xong (2026-07-08) â€” Reading P3 template r3ty (Table + YNNG + Match)
- Template `p3-r3-table-ynng-match` (`r3ty`) â€” preview JPG `Teamplate_Part3_6.jpg` (Cam12 T2 The Benefits of Being Bilingual)
- Table Q27â€“31 (`noteTable` Test|Findings) + YNNG Q32â€“36 (claims of writer) + match Ä‘oáº¡n Q37â€“40 (Aâ€“G)
- Builder `ieltsReadingP3TableYnngMatchPart()` + `CAM12_T2_BILINGUAL_TABLE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_6.jpg`

## ÄÃ£ xong (2026-07-08) â€” Reading P1 template r1f (TFNG + Match + Notes)
- Template `p1-r1-tfng-match-notes` (`r1f`) â€” preview JPG `Teamplate_Part1_1.jpg` (Cam11 T2 Mary Rose)
- TFNG Q1â€“4 + matching-features Q5â€“8 (má»‘c thá»i gian Aâ€“G) + note completion Q9â€“13 (`notePassage`)
- Builder `ieltsReadingP1TfngMatchNotesPart()` + `CAM11_T2_MARY_ROSE_NOTE_PASSAGE`
- áº¢nh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_1.jpg`

## ÄÃ£ xong (2026-07-07) â€” Note cáº¡nh TÃ´ sÃ¡ng (Luyá»‡n thi)
- Reading IELTS + Listening KET/PET/FCE/CAE/CPE/IELTS + Cambridge RW A2â€“C2

## ÄÃ£ xong (2026-07-07) â€” SW cache catalog MP3
- `public/sw.js` cache-first `/catalog/**/*.mp3` (vÃ  m4a/wav/ogg/webm)
- Version cache = `web/package.json` version (hiá»‡n `0.2.0`); dev = `ryan-catalog-dev`
- User nghe láº¡i khÃ´ng tá»‘n Vercel bandwidth (sau láº§n táº£i Ä‘áº§u)

## ÄÃ£ xong (2026-07-07) â€” Deploy production
- https://ryanenglishv2.vercel.app â€” migrations 009â€“012, SW, Listening publish, Admin publish

## Æ¯u tiÃªn session má»›i (chá»n theo user) â€” cáº­p nháº­t 2026-07-09
### 1 â€” Verify E2E template Reading má»›i (Æ°u tiÃªn)
1. Wizard P1: **r1ntf** (Huarango notes+table+TFNG), **r1nt** (Nutmeg), **r1my**
2. Wizard P2: **r2tn** (Silbo notes sections), **r2mt**, **r2cs** â€” Choose TWO multi-select
3. Wizard P3: **r3hmy** (headings+MC+YNNG), **r3tn** notes r1n8, **r3em**, **r3fy**
4. Cam15 Moore: notes **1930s/1940s/1950s** má»—i dÃ²ng riÃªng sau generate

### 0 â€” IELTS track
1. `pnpm --filter web dev` â†’ http://localhost:5173/app/exam/track/ielts
2. **ÄÄƒng nháº­p Google** â€” hard refresh **Ctrl+Shift+R** náº¿u HMR lá»—i builder

### A â€” Admin publish / batch Reading
- Admin â†’ Publish ná»™i dung; batch Cam khi Ä‘á»§ 3 passages

### B â€” Ká»¹ thuáº­t cÃ²n má»Ÿ
- r1tt merge Ã´ E2E browser; SAMPLE passage r1tt â†’ Coconut náº¿u AI nhiá»…u
- Listening Ã” CHá»® mobile iOS
```

## ÄÃ£ xong (2026-07-09) â€” Sá»• ghi chÃº tá»« vá»±ng (cháº¿ Ä‘á»™ há»c)
- Dexie **v12** báº£ng `notebookEntries` (`NotebookEntry`): phrase/meaning/example/IPA/pos + ghi chÃº user, chá»‘ng trÃ¹ng `phraseKey`
- `notebookRepo` â€” save (upsert), updateNote, delete, list
- Study SRS: nÃºt **LÆ°u sá»• ghi chÃº** (`SaveToNotebookButton`) cáº¡nh Há»i AI / Láº­t tháº»
- Tab **Sá»• ghi chÃº** trong study mode + nÃºt trÃªn trang Bá»™ tá»« vá»±ng (má»Ÿ khÃ´ng cáº§n chá»n deck)
- Dictionary modal: **LÆ°u sá»• ghi chÃº** (song song ThÃªm vÃ o bá»™ tháº»)
- UI: tÃ¬m kiáº¿m, sá»­a memo, xÃ³a, phÃ¡t Ã¢m â€” CSS theme-aware
- `pnpm --filter web exec tsc --noEmit` â€” pass

## Next session start prompt (cáº­p nháº­t 2026-07-10 â€” offline dict Part1)
1. Tá»« Ä‘iá»ƒn FAB â†’ tra `abandon`, `environment`, `look forward to` (offline, khÃ´ng cáº§n Pro)
2. (Tuá»³ chá»n) Part2.json â†’ `pnpm build:dict:part1` má»Ÿ rá»™ng; seed deck vocab tá»« JSON
3. Test sync LWW + exam progress náº¿u chÆ°a verify

## ÄÃ£ xong (2026-07-10) â€” Offline dictionary Part 1 (300 tá»«)
- Sá»­a/hoÃ n thiá»‡n `Tainguyen/TuDien/Part1.json` (file cÅ© truncated ~105 tá»«) â†’ **300 cards** A2â€“C2
- Copy bundle: `apps/web/src/features/dictionary/data/offlinePart1.json`
- `offlineDictPack.ts` load Part1 + ~60 cá»¥m phrase writing
- Script: `pnpm build:dict:part1` (`scripts/build-dict-part1.mjs`)
- DictionaryModal: hiá»ƒn thá»‹ sá»‘ má»¥c offline tháº­t
- `tsc` pass

## Next session start prompt (cáº­p nháº­t 2026-07-10 â€” Supabase sync tháº­t)
1. `pnpm db:push` â€” Ã¡p migration **014_exam_progress_sync.sql** trÃªn Supabase
2. Test offlineâ†’online: sá»­a deck/SRS offline â†’ online â†’ sync; má»Ÿ mÃ¡y 2 pull LWW
3. Reading/Listening: lÃ m dá»Ÿ / ná»™p bÃ i â†’ Äá»“ng bá»™ â†’ thiáº¿t bá»‹ khÃ¡c tháº¥y draft
4. Electron: export Vocabulary v2 / legacy backup â†’ Settings â†’ Nháº­p backup â†’ Äá»“ng bá»™ Ä‘Ã¡m mÃ¢y
5. (Tuá»³ chá»n) notebook cloud sync; verify E2E Reading template

## ÄÃ£ xong (2026-07-10) â€” Supabase sync kÃ­ch hoáº¡t tháº­t
### Conflict resolution offlineâ†’online
- `packages/db/src/cloud/sync.ts` â€” **`syncBidirectional`** (LWW theo `updated_at` / SRS `lastReviewedAt`)
- `useSyncManager` luÃ´n gá»i bidirectional (khÃ´ng cÃ²n push-only khi local cÃ³ data)
- Preset deck váº«n bá» qua sync cloud

### Reading/Listening exam progress sync
- Migration **`014_exam_progress_sync.sql`** â€” báº£ng `exam_progress` (user_id, skill, exam_id, payload jsonb)
- `examProgressSync.ts` â€” merge localStorage drafts â†” cloud (LWW `updatedAt`)
- Draft saves stamp `updatedAt` (Reading IELTS, Cambridge RW shells, Listening KET/PET/IELTS/FCE)

### Electron â†’ Web migration
- `electronMigrate.ts` â€” Vocabulary export v2 + legacy `flashcardCustomDecks_v6` / SRS
- Non-UUID id â†’ stable UUID remap (sync Supabase Ä‘Æ°á»£c)
- `importBackup` auto-detect Electron/legacy náº¿u khÃ´ng pháº£i Web backup v1â€“3
- Settings: mÃ´ táº£ há»— trá»£ Electron + sync hai chiá»u

### Verify
- `pnpm exec tsc --noEmit` (apps/web) â€” pass
- **Cáº§n `pnpm db:push`** trÆ°á»›c khi exam progress sync hoáº¡t Ä‘á»™ng Ä‘áº§y Ä‘á»§

## Da xong (2026-07-09) â€” Dictionary offline+Pro / MindMap export+templates / CEFR+exam suggestions
- offlineDictPack + dictionary_ai gate
- exportMindmap PNG/SVG/PDF + IELTS templates
- cefr field + ExamPracticeSuggestionsPanel


## Da xong (2026-07-09) â€” Listening practiceâ†”exam bridge
- Lesson link sourceExamId/part + linkedAudio
- examListeningBridge + Luyen dictation tu ket qua exam
- Play limit free/basic + slow 0.5/0.75 + Nghe chunk
- Transcript jump-to-word (uoc luong time-align)

## ÄÃ£ xong (2026-07-10) â€” Vocab double card (phrase trÃ¹ng)
- **Root cause:** gá»™p deck preset (`dedupePresetDecks` / admin publish) chuyá»ƒn tháº» theo id khÃ¡c nhau â†’ cÃ¹ng phrase trong 1 deck; import CSV luÃ´n `add` (khÃ´ng unique)
- **Fix:**
  - `cardRepo.dedupeByPhrase` / `dedupeAllDecks` â€” gá»™p theo phrase (case-insensitive), giá»¯ SRS tá»‘t nháº¥t, merge field thiáº¿u, chuyá»ƒn reviewLog
  - Gá»i sau migrate deck, `dedupePresetDecks`, `seedPresetDecks`, `mergeVocab` (admin publish)
  - `ImportModal` dÃ¹ng `cardRepo.addUnique` + `sourceKind: 'import'`
- Verify: `pnpm --filter web exec tsc --noEmit` â€” pass

## ÄÃ£ xong (2026-07-10) â€” Double bá»™ tháº» "CÃ´ng nghá»‡" (vÃ  preset khÃ¡c)
- **Root cause:** `dedupePresetDecks` chá»‰ gá»™p khi `name` khá»›p exact + `origin !== 'user'` â†’ báº£n UUID / tÃªn lá»‡ch unicode / origin user váº«n hiá»‡n cáº¡nh `preset:ielts:cong-nghe`
- **Fix:** bucket theo **stable slug** (`preset:group:slug`), gá»™p má»i deck trong group preset khá»›p seed (ká»ƒ cáº£ origin user); chuáº©n hoÃ¡ tÃªn seed; phrase key NFD + collapse space
- Má»Ÿ láº¡i `/app/vocab` â†’ seed cháº¡y dedupe â†’ chá»‰ cÃ²n 1 "CÃ´ng nghá»‡"

## ÄÃ£ xong (2026-07-10) â€” Listening ZIP: Answer Key + Audioscript â†’ transcript khi xem láº¡i
- ZIP cÃ³ thá»ƒ chá»©a `answer-key.pdf` / `audioscript.txt` / `tapescript.txt` (trÆ°á»›c Ä‘Ã¢y bá»‹ skip)
- `listeningAudioscriptParse.ts` â€” tÃ¡ch Audioscript, map sá»‘ cÃ¢u â†’ `ttsText`
- `importListeningZip` trÃ­ch PDF text + gáº¯n transcript/Ä‘Ã¡p Ã¡n vÃ o payload
- UI xem láº¡i: `ListeningReviewActiveBar`, `ListeningQuestionAnswerPanel`, `ListeningExamResult` hiá»‡n **Transcript** tá»«ng cÃ¢u
- **LÆ°u Ã½:** PDF scan (khÃ´ng text layer) â†’ cáº§n `audioscript.txt` hoáº·c PDF cÃ³ chá»¯; preview import hiá»‡n warning

## ÄÃ£ xong (2026-07-10) â€” KET A2 Part 7 import: 1 áº£nh `part7-page.jpg`
- **TrÆ°á»›c:** `part7-p1.jpg` â€¦ `part7-p3.jpg` (báº¯t buá»™c 3 file)
- **Sau:** **1 file** `part7-page.jpg` (alias `part7.jpg`) â€” giá»‘ng PET Part 8 / FCE Part 9
- Code: `ketWritingImportUtils`, `cambridgeReadingImportTemplates`, `ImportReadingManualModal`
- HDSD: `Prompt-KET-A2-Reading-Universal.txt` (+ báº£ng so sÃ¡nh FCE/CAE/PET)

## ÄÃ£ xong (2026-07-10) â€” Library: 3Ã— Test 1 â†’ chá»‰ giá»¯ 7-part
- **UI (Error1.jpg):** Test 1 Ã—2 meta `5 parts` (catalog/stub) + Test 1 `7 parts` (Ä‘Ãºng) + T2â€“T4
- **Rule:** cÃ¹ng Book+Test â†’ `preferLibraryExam`: **nhiá»u part hÆ¡n** > nhÃ£n Writing > rank nguá»“n
- Sample váº«n áº©n khi cÃ³ catalog; **khÃ´ng** Æ°u tiÃªn catalog 5-part hÆ¡n import 7-part
- Hard refresh KET A2 Reading â†’ 1 dÃ²ng Test 1 (7 parts) + Test 2â€“4

## ÄÃ£ xong (2026-07-10) â€” Admin Publish vocab khÃ´ng cÃ²n double
- **NguyÃªn nhÃ¢n há»‡ thá»‘ng:** publish Ä‘áº©y card/deck UUID random â†’ re-publish / user pull `bulkPut` id má»›i â†’ double
- **Fix phÃ²ng ngá»«a (cáº£ 2 phÃ­a):**
  - `vocabPublishNormalize.ts` â€” deck â†’ `preset:group:slug`, card â†’ `pcard:{deckId}:{hash(phrase)}`, gá»™p trÃ¹ng trong payload
  - `collectVocab` (Admin publish) luÃ´n normalize trÆ°á»›c khi upsert
  - `mergeVocab` (user pull) normalize láº¡i payload (ká»ƒ cáº£ báº£n publish cÅ© UUID) + `ensureSrs` + dedupe legacy
  - `stablePresetCardId` / `phraseKeyForCard` trong `vocabSeedDecks.ts`
- **Sau nÃ y:** Admin Publish vocab idempotent â€” cÃ¹ng tá»« = cÃ¹ng id, khÃ´ng nhÃ¢n Ä‘Ã´i
- Verify: `tsc --noEmit` pass
- **Next admin:** Publish láº¡i 1 láº§n vocab Ä‘á»ƒ cloud payload dÃ¹ng id á»•n Ä‘á»‹nh (khuyáº¿n nghá»‹)


## Da xong (2026-07-10) â€” Listening transcript Cambridge vs IELTS
- Cambridge A2-C2: ZIP answer-key/audioscript -> auto ttsText khi xem lai
- IELTS: khong auto tu PDF; Xem cung de bai -> nut Hien transcript (AI)
- Files: listeningAudioscriptParse, importListeningZip, listeningIeltsTranscriptAi, examListeningTranscriptStorage, ListeningIeltsTest

## Da xong (2026-07-10) â€” Cap nhat Prompt Universal Listening A2-C2
- Prompt-Listening-Cambridge.txt: Answer Key + Audioscript + 2 nguon transcript (import + AI)
- KET/PET/FCE/CAE/CPE Universal: ZIP answer-key/audioscript.txt, checklist, loi thuong gap, viec lam

---

## ÄÃ£ xong (2026-07-10 cuá»‘i session) â€” Cambridge checklist + transcript + RLS + Vocab double/sync

### HDSD / DeepSeek A2â€“C2
- [x] `HDSD/Prompt-Listening-Cambridge-CHECKLIST.txt` + `Prompt-Reading-Cambridge-CHECKLIST.txt` (A2â€“C2)
- [x] Link checklist tá»« master + 10 Universal (KETâ€¦CPE L/R)
- [x] DeepSeek Test 2: gá»­i prompt + PDF + `answer-key.txt` + `audioscript.txt` â€” **khÃ´ng** MP3 / khÃ´ng báº¯t buá»™c q1â€“q5.jpg
- [x] Pack ZIP **pháº³ng** cÃ¹ng cáº¥p: `exam.json`, `listening.mp3`, `answer-key.txt`, `audioscript.txt`, `q*.jpg`

### Listening transcript tá»« `audioscript.txt`
- [x] **UI xem:** Ná»™p bÃ i â†’ káº¿t quáº£ `Transcript:` Â· hoáº·c **Xem cÃ¹ng Ä‘á» bÃ i** â†’ khá»‘i **Transcript Â· CÃ¢u N** / bar review
- [x] Bug: ZIP `ket-listening-test2.zip` **thiáº¿u** `audioscript.txt` (chá»‰ nested folder) â†’ rebuild ZIP flat + file script
- [x] Bug parser: format Cambridge `Question 1 One. â€¦` / monologue Part 2â€“5 (`Look at questions 6â€“10`) khÃ´ng map Ä‘Æ°á»£c
- [x] Fix `listeningAudioscriptParse.ts` â€” Question N + ordinal dÃ i trÆ°á»›c ngáº¯n + range monologue â†’ 25/25 cÃ¢u KET Test 2
- [x] Toolbar: Cambridge `importedCount=0` â†’ gá»£i Ã½ ZIP cáº§n `audioscript.txt` / import láº¡i

### Listening khÃ¡c (session)
- [x] Audio play: blob URL revoke sá»›m (`useExamQuestionAudio`)
- [x] KET Part 2 double form: strip gap trong instruction + UI + prompt rules
- [x] Admin xÃ³a Ä‘á»: local Dexie + unpublish cloud published tables
- [x] Import: alias audio `listening.mp3` / `Audio.mp3`

### RLS / quyá»n user vs admin
- [x] **MÃ´ hÃ¬nh:** User ghi data **cÃ¡ nhÃ¢n** (deck/card/srs/writing/mindmap/exam_progress). Admin ghi **Luyá»‡n thi + Vocab máº·c Ä‘á»‹nh** (published tables)
- [x] Migration **`015_user_data_rls_harden.sql`** â€” `USING` + **`WITH CHECK`** (`auth.uid() = user_id`) â€” **Ä‘Ã£ `pnpm db:push`**
- [x] Message lá»—i sync phÃ¢n biá»‡t báº£ng admin vs data cÃ¡ nhÃ¢n (`useSyncManager.friendlySyncError`)

### Vocab double + lá»—i sync (production `/app/vocab`)
- [x] **Root cause:** preset tá»«ng push cloud UUID â†’ má»—i láº§n sync **pull láº¡i** cáº¡nh `preset:â€¦` + card UUID vs `pcard:` cÃ¹ng phrase
- [x] `sync.ts`: nháº­n ghost deck (cÃ¹ng group+tÃªn preset) â†’ **khÃ´ng pull**; **soft-delete** ghost deck/card cloud; chá»‰ push UUID user; push **chunked** + partial fail khÃ´ng â€œcháº¿tâ€ sync
- [x] `seedPresetDecks` trÆ°á»›c/sau sync; dedupe theo stable slug + **tÃªn seed duy nháº¥t** (group cloud sai váº«n gá»™p)
- [x] **Rekey** card â†’ `pcard:{deckId}:{hash}` + merge SRS/reviewLog (`rekeyOneCard` / `repairVocabDuplicates`)
- [x] UI `/app/vocab`: nÃºt **ã€ŒDá»n tháº» trÃ¹ngã€**
- [x] Version web **0.2.3** Â· **deploy prod** https://ryanenglishv2.vercel.app
- [x] User: hard refresh (Ctrl+Shift+R) â†’ sync â†’ **Dá»n tháº» trÃ¹ng**

### Lá»—i cÃ²n tá»“n táº¡i / theo dÃµi
- [ ] User verify sau deploy: sá»‘ tháº» tá»«ng bá»™ preset (~100) háº¿t x2/x3; sync sidebar khÃ´ng cÃ²n Ä‘á» RLS
- [ ] Admin **Publish láº¡i vocab 1 láº§n** (payload cloud id á»•n Ä‘á»‹nh `preset:` / `pcard:`) náº¿u cloud cÃ²n UUID cÅ©
- [ ] Náº¿u unpublish/xÃ³a Ä‘á» cloud fail: kiá»ƒm tra RLS DELETE trÃªn `reading_exam_published` / `listening_exam_published`
- [ ] Re-import KET Listening Test 2 ZIP má»›i (cÃ³ audioscript) náº¿u Ä‘á» cÅ© local chÆ°a cÃ³ `ttsText`
- [ ] Working tree local cÃ²n nhiá»u file uncommitted (HDSD, exam, vocab, Tainguyen xÃ³aâ€¦) â€” chÆ°a git commit full session

## ÄÃ£ xong (2026-07-11) â€” Publish Listening kÃ¨m MP3 cloud

- **Bug:** `listening-import-*` publish chá»‰ JSON; `stripLocalMediaKeys` xÃ³a `audioKey` â†’ Firefox/user khÃ¡c **khÃ´ng cÃ³ MP3**
- **Fix:** `materializeListeningMediaForPublish` upload blob Dexie â†’ bucket `listening-exam-media` (migration **016**, 50MB) + set `audioUrl`/`pictureImageUrl` public
- User Admin: **Publish láº¡i** Ä‘á» import trÃªn mÃ¡y cÃ³ blob local; Firefox hard refresh
- URL vÃ­ dá»¥: `/app/exam/listening/listening-import-â€¦` load tá»« `listening_exam_published`

## ÄÃ£ xong (2026-07-11) â€” Fix theo screenshot Error/error1+error2

- **error2 Part 2:** passage chá»‰ cÃ²n title + 3 áº£nh (khÃ´ng label/text) â†’ UI `sign-box` khung lá»›n, máº¥t Angus/Frank/Zac
  - `repairKetPart2Passage` ghÃ©p láº¡i 3 profile + portrait theo thá»© tá»±
  - Render Part 2 **khÃ´ng** cÃ²n sign-box; luÃ´n portrait 2.5Ã—3.5cm + text
  - Cloud merge Part 2 gÃ¡n áº£nh theo profile, khÃ´ng dÃ¡n title
- **error1 Part 7:** broken image icon â€œStory picture 1/2/3â€ â€” URL strip/sai
  - `repairKetPart7Passage` â†’ `/catalog/reading/ket-a2-test1/part7-p*.jpg`
  - UI fallback onError + luÃ´n 3 slot catalog
- Test `test-fill-reading-media.mts` PASS

## ÄÃ£ xong (2026-07-11) â€” Fix User: P1/P7 máº¥t áº£nh + P2 máº¥t Ä‘oáº¡n vÄƒn

- **Root cause:** Publish tá»« local import chá»‰ cÃ³ `imageKey` blob â†’ `stripLocalMediaKeys` xÃ³a key â†’ user khÃ´ng cÃ³ `imageUrl`. Published ghi Ä‘Ã¨ catalog (cÃ³ `/catalog/...`). Part 2 portrait + nhÃ¡nh render chá»‰ áº£nh â†’ nuá»‘t text khi thiáº¿u label/text.
- **Fix:** `fillReadingExamMedia.ts` â€” vÃ¡ `imageUrl`/`text`/`label` tá»« catalog khi resolve + trÆ°á»›c publish
- Render Part 2: luÃ´n hiá»‡n text kÃ¨m portrait
- Test: `scripts/test-fill-reading-media.mts` PASS
- User hard refresh lÃ  tháº¥y (khÃ´ng báº¯t buá»™c re-publish); Admin **Publish láº¡i** Ä‘á»ƒ JSON cloud sáº¡ch

## ÄÃ£ xong (2026-07-11) â€” User khÃ´ng tháº¥y P6/P7 + áº£nh KET A2

- **Root cause P6/P7:** catalog builtin `reading-ket-a2-test1` chá»‰ **5 parts**; Admin import local 7-part â†’ User chá»‰ tháº¥y catalog
- **Fix:** catalog â†’ **7 parts** (P6 writing email + P7 story 3 áº£nh `/catalog/reading/ket-a2-test1/part7-p*.jpg`); duration 60; bandHint RW
- **Loader:** `listAllReadingExams` / `resolveReadingExam` Æ°u tiÃªn báº£n **nhiá»u part hÆ¡n** (publish/local vs catalog cÅ©)
- **áº¢nh Part 2:** user chá»‰ tháº¥y náº¿u upload gáº¯n **cÃ¹ng examId** user má»Ÿ (vd. `catalog-reading-ket-a2-test1`); sau upload cáº­p nháº­t published JSON náº¿u Ä‘Ã£ publish
- Admin: import áº£nh portrait **trÃªn Ä‘á» catalog** (hoáº·c Publish láº¡i sau upload), khÃ´ng chá»‰ trÃªn `reading-import-*`

## ÄÃ£ xong (2026-07-11) â€” KET A2 Part 2 portrait image (Admin import)

- 3 profile (label Angus/Frank/Zacâ€¦): trÆ°á»›c má»—i Ä‘oáº¡n Ã´ **2.5cm Ã— 3.5cm**
- **Admin** tháº¥y Ã´ import / Äá»•i / XÃ³a; **user** chá»‰ tháº¥y áº£nh khi Ä‘Ã£ cÃ³
- Cloud: `reading_exam_images` slot `passage` + `item_index` = block index; public read, admin write
- Files: `KetRwPassagePortrait.tsx`, `KetRwPartContent`, `ReadingKetRwTest` (merge cloud images), `persistReadingPassageBlockImage`, CSS `ket-rw-portrait*`

## ÄÃ£ xong (2026-07-11) â€” Fix KET A2 Part 2 bá»‹ Ã©p YNNG (false positive)

- **Bug:** Import ZIP `KET A2_Cam 1` â€” `exam.json` Part 2 Ä‘Ãºng `multiple-choice` (A Angus / B Frank / C Zac) nhÆ°ng UI ra YES/NO/NOT GIVEN
- **Root cause:** `coerceTriStateGroupType` / `optionsLookTriStateOnly` trong `readingExamSanitize.ts`
  - `normalizeTriStateId` map **aâ†’yes, bâ†’no, câ†’not-given** (dÃ nh cho AI option id)
  - Option id A/B/C â†’ bá»‹ coi tri-state; label ngáº¯n (`Angus` < 12 kÃ½ tá»±) khÃ´ng vÆ°á»£t `hasRealMcOpts`
- **Fix:** Detect tri-state **Æ°u tiÃªn label**; bare Aâ€“D khÃ´ng cÃ²n = YES/NO; má»i label khÃ´ng pháº£i YES/NO/TRUE/FALSE/NG = MC tháº­t
- Verify: sanitize `Test 1/exam.json` â†’ Part 2 váº«n `multiple-choice`; YNNG Cam19-style (label YES/NO/NG) váº«n coerce
- User: hard refresh dev â†’ **import láº¡i** ZIP (hoáº·c má»Ÿ láº¡i Ä‘á») â€” khÃ´ng cáº§n sá»­a JSON

## 2026-07-15 â€” Offline dict multi-word: 2k PV + 3k idiom + 10k collocation

### ÄÃ£ lÃ m
- [x] `scripts/build-dict-multi.mjs` â€” generator A2â€“C2 multi-word
- [x] Outputs:
  - `apps/web/src/features/dictionary/data/offlinePhrasal.json` â€” **2000**
  - `apps/web/src/features/dictionary/data/offlineIdioms.json` â€” **3000**
  - `apps/web/src/features/dictionary/data/offlineCollocations.json` â€” **10000**
- [x] Wire vÃ o `offlineDictPack.ts` (import + add sau P1â€“P5; size helpers)
- [x] `DictionaryModal` empty-state hiá»ƒn thá»‹ PV / Idiom / Colloc counts
- [x] **IPA US/UK** cho multi-word: `scripts/enrich-dict-multi-ipa.mjs` (CMUdict ARPABETâ†’IPA + weak forms)
  - Phrasal **2000/2000**, Idioms **3000/3000**, Colloc **~9985/10000** (cÃ²n ~15 Latin/ká»¹ thuáº­t hiáº¿m)
  - Rebuild multi tá»± gá»i enrich IPA á»Ÿ cuá»‘i `build-dict-multi.mjs`
- [x] `pnpm --filter web exec tsc --noEmit` â€” pass

### Nguá»“n
- Phrasal: curated core + verbÃ—particle expansion
- Idioms: curated + baiango/english_idioms CSV + frames / similes / patterns
- Collocations: adj-noun / verb-noun curated + open-vn-en-dict `goodWords` multi-keys (~10k)

### Tá»•ng offline (unique keys approx)
- Singles P1â€“P5: ~24.3k
- Multi: 2k + 3k + 10k
- Unique gá»™p: **~39.3k** má»¥c (dedup khi add)

### Rebuild
```bash
node scripts/build-dict-multi.mjs          # generate + IPA enrich
node scripts/enrich-dict-multi-ipa.mjs     # IPA only (náº¿u Ä‘Ã£ cÃ³ JSON)
```

### Ghi chÃº cháº¥t lÆ°á»£ng
- Má»™t pháº§n idiom/collocation lÃ  pattern-generated (nghÄ©a VI generic) â€” Ä‘á»§ volume tra offline; cÃ³ thá»ƒ tinh chá»‰nh curated sau.
- Bundle JSON lá»›n (~3 MB multi) â€” import Vite JSON OK; typecheck pass.

## 2026-07-15 â€” Fix: popup â€œ31k tá»« cáº§n Ã´n láº¡iâ€ khi chÆ°a rating

**NguyÃªn nhÃ¢n:** Seed gÃ¡n má»i tháº» `dueAt = now`, `state = 'new'`. Code Ä‘áº¿m `dueAt â‰¤ now` â†’ ~30k tháº» â€œcáº§n Ã´n láº¡iâ€.

**Fix:** `isSrsReviewDue` / `isSrsNew` trong `packages/core` â€” â€œÃ´n láº¡iâ€ chá»‰ tháº» Ä‘Ã£ learning/review + Ä‘áº¿n háº¡n. Popup, hub, deck badge, daily goal, notification dÃ¹ng predicate nÃ y.

## 2026-07-15 â€” CÃ i Ä‘áº·t: chá»n giá»ng Kokoro TTS

- [x] `apps/web/src/features/listening/kokoroVoices.ts` â€” 28 giá»ng EN (US/UK), localStorage US+UK
- [x] `tts.ts` â€” `speak()` tá»± dÃ¹ng giá»ng Ä‘Ã£ chá»n theo lang `a`/`b`
- [x] Settings â†’ TÃ i khoáº£n â†’ **Giá»ng Ä‘á»c Kokoro local** â†’ dropdown US/UK + **Thá»­ nghe**
- Defaults: `af_heart` (US), `bf_emma` (UK)

## Next session start prompt (cáº­p nháº­t 2026-07-15 â€” Kokoro voice picker)

```
Äá»c session_summary.md (má»¥c Kokoro voice picker + multi-word dict).

CONTEXT:
- CÃ i Ä‘áº·t â†’ TÃ i khoáº£n â†’ chá»n giá»ng Kokoro US/UK (localStorage).
- speak() inject preferred voice; cáº§n Bat-Kokoro.bat Ä‘á»ƒ nghe Kokoro.

NEXT (optional):
1) Smoke Settings â†’ Thá»­ nghe (cáº§n TTS gateway :8787)
2) Deploy web náº¿u ship dict multi + voice picker
```

## 2026-07-11 â€” HDSD Universal: Ä‘á» PDF **hoáº·c** TXT

- Master L/R + checklist + 10 Universal: Â§ **Nguá»“n Ä‘á» PDF hoáº·c TXT**
- DeepSeek: gá»­i `exam-text.txt` + `answer-key.txt` (+ audioscript) thay PDF Ä‘Æ°á»£c
- Váº«n pack ZIP: `exam.json` + mp3/áº£nh (crop áº£nh ngoÃ i AI)

## 2026-07-11 â€” HDSD Universal A2â€“C2 (Listening + Reading)

- Master: `Prompt-Listening-Cambridge.txt` / `Prompt-Reading-Cambridge.txt` + checklists
- 5Ã— Listening Universal + 5Ã— Reading Universal: má»¥c **App 2026-07**
  - Gap-fill: `answer: "8/eight"` + `acceptableAnswers`
  - áº¢nh **webp** (map basename `q1.jpg` â†” `q1.webp`)
  - Listening: title Book/Test â€” khÃ´ng Ä‘Ã¨ catalog audio Test 1
- KET Listening Universal: vÃ­ dá»¥ Q8 `8/eight` + báº£ng lá»—i thÆ°á»ng gáº·p

## 2026-07-11 â€” Listening: local media > catalog (triá»‡t Ä‘á»ƒ)

- **Bug:** Import KET Test 3 ZIP â†’ merge catalog gáº¯n `/catalog/listening/ket-a2-test1` â†’ phÃ¡t nháº§m audio Test 1
- **Policy:** `listeningLocalMediaPolicy.ts` â€” blob local tháº¯ng; twin chá»‰ cÃ¹ng sá»‘ Test; khÃ´ng default Test 1 cho Test N
- **Load path:** `resolveListeningExam` â†’ merge + `preferLocalListeningMedia` (sá»­a Ä‘á» Dexie cÅ©, khÃ´ng báº¯t re-import)
- **Play:** `partAudioSource` / `sharedExamAudioSource` / `useExamQuestionAudio` khÃ´ng push catalog song song khi cÃ³ blob
- **Regression:** `pnpm test:listening-media` (`apps/web/scripts/test-listening-media-policy.mts`)

## 2026-07-11 â€” Tainguyen ra ngoÃ i repo (deploy nháº¹ hÆ¡n)

- **Data:** `D:\App-English-Ryan\Tainguyen` (~1.8 GB); **junction** `Website\Tainguyen` â†’ path Ä‘Ã³ (script local OK)
- **Code:** `scripts/tainguyen-path.mjs` (`TAINGUYEN_PATH`); `build-catalog.mjs --if-present` / skip trÃªn Vercel náº¿u khÃ´ng cÃ³ nguá»“n
- **`vercel.json`:** `node scripts/build-catalog.mjs --if-present` rá»“i build web
- **`.vercelignore`:** khÃ´ng upload Tainguyen, PDF thÃ´, Giaodien, server, â€¦
- **`.gitignore`:** `Tainguyen/`
- **Docs:** `docs/TAINGUYEN.md`
- **Giá»¯:** `apps/web/public/catalog` (~830 MB audio) â€” váº«n lÃ  bottleneck upload náº¿u chÆ°a CDN

## 2026-07-11 â€” Check-in (Ä‘iá»ƒm danh) sync theo tÃ i khoáº£n

- **Váº¥n Ä‘á»:** Chuá»—i Ä‘iá»ƒm danh chá»‰ trong IndexedDB (`reviewLog` mode=checkin); publish khÃ´ng xÃ³a; Ä‘á»•i mÃ¡y / clear site data / browser khÃ¡c = máº¥t streak. Sync cloud trÆ°á»›c Ä‘Ã³ **khÃ´ng** gá»“m reviewLog.
- **Fix:**
  - Migration `017_checkin_days.sql` â€” báº£ng `checkin_days (user_id, day_key YYYY-MM-DD, checked_at)` + RLS own row
  - `apps/web/src/features/home/checkInSync.ts` â€” union merge local â†” cloud; push ngay khi báº¥m Ä‘iá»ƒm danh (best-effort)
  - `useCheckIn.ts` â€” ghi local + push cloud náº¿u Ä‘Ã£ login + online
  - `useSyncManager` â€” gá»i `syncCheckInDays` má»—i láº§n sync (cÃ¹ng exam_progress)
- **Deploy:** cáº§n `pnpm db:push` (hoáº·c SQL Editor cháº¡y 017) rá»“i deploy web
## 2026-07-12 - Fix Home streak theo diem danh

- Home now calculates the overview streak from persisted `reviewLog.mode=checkin` records, shared with `CheckInButton` via `calcCheckInStreak` in `checkInSync.ts`.
- Verified with `pnpm --filter web exec tsc --noEmit`. Cloud multi-device persistence still requires applying migration `017_checkin_days.sql`.

## 2026-07-12 - Admin Publish prune MindMap

- Fixed admin-published MindMap deletion: user sync now remembers IDs received from the previous admin publish and removes only stale IDs missing from the new payload.
- Personal MindMaps are not included in that ID list and are preserved.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-12 - Publish prune cho toÃ n bá»™ ná»™i dung Admin

- Lessons, Translation, Sentence Structures vÃ  Writing Prompts giá» prune cÃ¡c ID tá»«ng nháº­n tá»« Admin Publish nhÆ°ng Ä‘Ã£ váº¯ng trong payload má»›i.
- Batch Publish Reading/Listening giá» dá»n cÃ¡c exam cloud khÃ´ng cÃ²n trong danh sÃ¡ch publishable local.
- Dá»¯ liá»‡u cÃ¡ nhÃ¢n khÃ´ng náº±m trong danh sÃ¡ch Admin Publish nÃªn khÃ´ng bá»‹ xÃ³a.

## 2026-07-12 â€” Fix MindMap xoÃ¡ rá»“i sá»‘ng láº¡i (sync legacy bypass tombstone)

- **Root cause:** `apps/web/src/features/auth/useSync.ts` cháº¡y song song vá»›i `useSyncManager` vÃ  khi `db.decks.count() === 0` gá»i `syncCloudToLocal` â€” hÃ m nÃ y pull tháº³ng `SELECT * FROM mindmaps` rá»“i `bulkPut`, **khÃ´ng Ä‘á»c `mindmapTombstones`**. Má»i mindmap Ä‘Ã£ xoÃ¡ local nhÆ°ng cloud chÆ°a ká»‹p xoÃ¡ Ä‘á»u Ä‘Æ°á»£c kÃ©o vá» "sá»‘ng láº¡i".
- **Fix:**
  - XoÃ¡ `apps/web/src/features/auth/useSync.ts` (Ä‘Ã£ khÃ´ng cÃ³ caller â€” `useSyncManager` vá»›i `syncBidirectional` lo háº¿t, vÃ  `syncBidirectional` tÃ´n trá»ng `mindmapTombstones`).
  - XoÃ¡ hÃ m legacy `syncLocalToCloud` + `syncCloudToLocal` khá»i `packages/db/src/cloud/sync.ts`.
  - Bá» 2 tÃªn Ä‘Ã³ khá»i export á»Ÿ `packages/db/src/index.ts`.
- **Verify:** `pnpm --filter web exec tsc --noEmit` PASS.
- **Ghi chÃº:** giá» chá»‰ cÃ²n 1 Ä‘Æ°á»ng sync duy nháº¥t qua `syncBidirectional`. Náº¿u sau nÃ y cáº§n "pull-only cho mÃ¡y má»›i" thÃ¬ pháº£i viáº¿t láº¡i cÃ³ filter tombstone (mindmaps, vÃ  cÃ¡c báº£ng khÃ¡c vá» sau).

## 2026-07-12 â€” Fix Deck/Card xoÃ¡ rá»“i sá»‘ng láº¡i (thiáº¿u tombstone)

- **Root cause:** `deckRepo.delete()` vÃ  `cardRepo.delete()` chá»‰ xoÃ¡ thuáº§n local (`db.decks.delete` / `db.cards.delete`), khÃ´ng viáº¿t tombstone. `syncBidirectional` sau Ä‘Ã³ tháº¥y row cÃ²n trÃªn cloud mÃ  khÃ´ng cÃ³ local â†’ coi nhÆ° "remote má»›i" â†’ `bulkPut` kÃ©o vá», sá»‘ng láº¡i toÃ n bá»™ deck + cards + SRS (hoáº·c card Ä‘Æ¡n láº»).
- **Fix:**
  - `packages/db/src/local/schema.ts` â€” bump v14, thÃªm báº£ng `deckTombstones` + `cardTombstones` (interface `DeckTombstone`, `CardTombstone`), index `&id, deletedAt`.
  - `deckRepo.delete()` â€” transaction: put tombstone â†’ xoÃ¡ srs/reviewLog/cards/deck local (giá»¯ nguyÃªn preset guard).
  - `cardRepo.delete()` â€” transaction: put tombstone â†’ xoÃ¡ srs + card local.
  - `packages/db/src/cloud/sync.ts` (`syncBidirectional`):
    - Load `deckTombstones` + `cardTombstones` cÃ¹ng lÃºc, lá»c UUID há»£p lá»‡.
    - `cloudDecksLive` / `cloudCardsLive` filter thÃªm tombstone set (khÃ´ng pull ngÆ°á»£c ngay cáº£ khi push xoÃ¡ cloud lá»—i).
    - Push hard-delete cloud (`.from('decks').delete().eq(user_id).in(id, chunk)` + tÆ°Æ¡ng tá»± cho cards), chunk 80. Cloud cÃ³ FK `on delete cascade` nÃªn xoÃ¡ deck â†’ cards + srs tá»± dá»n.
    - XoÃ¡ tombstone local sau khi cloud xÃ¡c nháº­n thÃ nh cÃ´ng.
- **Verify:** `pnpm --filter web exec tsc --noEmit` PASS.
- **Ghi chÃº:**
  - Deck/card Ä‘Ã£ bá»‹ xoÃ¡ trÆ°á»›c báº£n vÃ¡ nÃ y (khi chÆ°a cÃ³ tombstone) váº«n cÃ³ thá»ƒ sá»‘ng láº¡i 1 láº§n tá»« cloud vÃ o sync káº¿ tiáº¿p â€” khÃ´ng cá»©u láº¡i Ä‘Æ°á»£c vÃ¬ khÃ´ng cÃ³ dáº¥u váº¿t. Tá»« giá» trá»Ÿ Ä‘i thÃ¬ sáº¡ch.
  - KhÃ´ng cáº§n migration Supabase â€” cloud schema Ä‘Ã£ cÃ³ `on delete cascade` sáºµn.

## 2026-07-12 â€” Prune Ä‘á» Reading/Listening Admin Ä‘Ã£ xoÃ¡ (theo pattern mindmap)

- **Váº¥n Ä‘á»:** Admin xoÃ¡ Ä‘á» trong `reading_exam_published` / `listening_exam_published` thÃ¬ `listAllReadingExams`/`listAllListeningExams` (Ä‘á»c tháº³ng cloud) tá»± bá» khá»i Library. NhÆ°ng má»™t sá»‘ flow phá»¥ nhÆ° `readingExamCloudImages.persistReadingPartImage` cÃ³ gá»i `examRepo.create(..., 'cloud-images')` â†’ cache láº¡i báº£n local vá»›i cÃ¹ng id. Náº¿u Admin xoÃ¡ cloud, `resolveReadingExam` (`local || published || builtin`) váº«n cÃ²n báº£n local â†’ Ä‘á» "sá»‘ng láº¡i" khi má»Ÿ chi tiáº¿t.
- **Fix (kÃªnh A: chá»‰ Admin publish, khÃ´ng Ä‘á»¥ng Ä‘á» user tá»± import):**
  - Má»›i: `apps/web/src/features/admin/syncAdminPublishedExams.ts`
    - `syncPublishedReading()` / `syncPublishedListening()` â€” SELECT id tá»« 2 báº£ng publish cloud, so vá»›i danh sÃ¡ch id Ä‘Ã£ lÆ°u trong settings key `admin_published_reading_exam_ids` / `admin_published_listening_exam_ids`, prune báº£n local (`examRepo.delete` / `listeningExamRepo.delete`) + audio blob prefix (`reading-exam:${id}:`, `listening-exam:${id}:`) cho id Ä‘Ã£ biáº¿n máº¥t khá»i cloud.
    - Ghi láº¡i danh sÃ¡ch id hiá»‡n táº¡i vÃ o settings cho láº§n sau. Äá» user tá»± import (khÃ´ng náº±m trong id publish) khÃ´ng bá»‹ Ä‘á»¥ng.
  - Ná»‘i vÃ o `useSyncManager.runSync` sau bÆ°á»›c check-in, non-fatal.
- **Verify:** `pnpm --filter web exec tsc --noEmit` PASS.
- **Ghi chÃº:**
  - KhÃ´ng giáº£i quyáº¿t bÃ i toÃ¡n "48 Ä‘á» IELTS user tá»± import bá»‹ máº¥t" â€” kÃªnh B (sync user-imported exams lÃªn cloud) chÆ°a lÃ m.
  - Láº§n sync Ä‘áº§u tiÃªn sau báº£n vÃ¡: settings chÆ°a cÃ³ key nÃªn `previousIds` rá»—ng â†’ khÃ´ng prune gÃ¬ háº¿t, chá»‰ ghi baseline. Tá»« láº§n Admin publish/xoÃ¡ tiáº¿p theo má»›i báº¯t Ä‘áº§u prune Ä‘Ãºng.
-
## 2026-07-12 â€” IELTS Reading Cambridge catalog import

- Seed 47 Ä‘á» Reading Cambridge IELTS Cam 9â€“20, Test 1â€“4 vÃ o builtin catalog.
- Loáº¡i `reading-cam-11-2.json` vÃ¬ payload cÃ³ 41 cÃ¢u; ghi chÃº táº¡i `docs/known-issues.md`.
- ThÃªm `scripts/payload-to-catalog.mjs` vÃ  má»Ÿ rá»™ng `scripts/build-catalog.mjs` Ä‘á»c `out-reading/`.
- Fix layout cÃ¢u há»i: giá»¯ prompt tháº­t, table completion, title, rows vÃ  gap tá»« `reading_filtered.json`.
- Verify: catalog test 47 Ä‘á»/3 passages/40 cÃ¢u PASS; `pnpm -C apps/web build` PASS.

## 2026-07-14 â€” Fix avatar User trong Admin

- **Root cause:** Admin Ä‘Ã£ render `profiles.avatar_url`, nhÆ°ng profile sync chá»‰ Ä‘á»c `user_metadata.avatar_url`; má»™t sá»‘ Google identity chá»‰ cÃ³ `picture`, vÃ  profile cÅ© chÆ°a Ä‘Æ°á»£c backfill.
- `syncAuthProfile.ts`: Ä‘á»“ng bá»™ email/tÃªn/avatar tá»« Auth vÃ o `profiles` khi bootstrap/Ä‘Äƒng nháº­p, há»— trá»£ `avatar_url` + `picture`, khÃ´ng ghi `null` Ä‘Ã¨ dá»¯ liá»‡u profile hiá»‡n cÃ³.
- `018_profile_avatar_sync.sql`: cáº­p nháº­t trigger Auth vÃ  backfill avatar/tÃªn cho user cÅ© tá»« `auth.users`.
- `AdminPage.tsx`: áº£nh dÃ¹ng `referrerPolicy="no-referrer"`; URL há»ng tá»± fallback sang avatar chá»¯ cÃ¡i.
- Verify: `vitest run src/features/auth/syncAuthProfile.test.ts` â€” 2 tests PASS; `pnpm --filter web exec tsc --noEmit` PASS.
- Deploy cáº§n cháº¡y `pnpm db:push` Ä‘á»ƒ Ã¡p migration 017â€“018 trÆ°á»›c hoáº·c cÃ¹ng lÃºc deploy web.

## 2026-07-14 â€” KET A2 Listening practice 44 Ä‘á» (pilot + multi-part audio)

### Má»¥c tiÃªu
Import thÃªm ~44 Ä‘á» KET Listening (crawl CSV + media) vÃ o app, title theo Cambridge Book/Test (tiáº¿p sau 10 Ä‘á» sáºµn).

### Nguá»“n / layout
- Root: `D:\App-English-Ryan\Crawl\Import_KET_A2_Listening\`
- 44 folder `test-01`â€¦`test-44` (Ä‘Ã£ scaffold + copy CSV)
- Má»—i folder: `ket-a2-test-NN.csv` + `part1.mp3`â€¦`part5.mp3` + `q1.jpg`â€¦`q5.jpg`
- `meta.json` (optional): `{ "book", "test" }` â€” test-01 = Book 3 Test 3
- Mapping slot máº·c Ä‘á»‹nh (KET_EXISTING_COUNT=10): test-01â†’B3T3, test-02â†’B3T4, test-03â†’B4T1, â€¦

### ÄÃ£ lÃ m
- [x] Survey cÆ¡ cháº¿ import KET (ZIP `exam.json` + media; catalog 1 Ä‘á» builtin)
- [x] Scaffold 44 folder + README + STATUS.csv
- [x] `scripts/ket-practice-csv-to-exam.mjs` â€” CSVâ†’exam.json + audioscript + answer-key + ZIP flat
- [x] Pilot **test-01**: title `KET A2 Listening â€” Book 3 â€” Test 3`
  - ZIP: `Import_KET_A2_Listening\ket-practice-test-01.zip`
  - 5 parts / 25 cÃ¢u; audio per-part; picture-mc q1â€“q5
- [x] **Bug fix multi-part audio:** `ListeningKetTest` / `ListeningPetTest` dÃ¹ng `resolveListeningAudioSource(exam, currentPart)` thay `ketSharedExamAudioSource` (trÆ°á»›c Ä‘Ã¢y 5Ã— part*.mp3 â†’ "KhÃ´ng tÃ¬m tháº¥y file audio")
- [x] `ketSharedExamAudioSource` fallback part 0 (khÃ´ng source rá»—ng)
- [x] User confirm: pilot **hoáº¡t Ä‘á»™ng tá»‘t**
- [x] Cáº­p nháº­t session_summary

### Convert + publish (2026-07-15)
- [x] User bÃ¡o Ä‘á»§ media test-01â€¦44
- [x] Verify: 44 folder = CSV + 5 mp3 + 5 jpg
- [x] `node scripts/ket-practice-csv-to-exam.mjs all` â†’ **44/44 OK**
- [x] STATUS.csv cáº­p nháº­t (ready=Y)
- [x] **Publish cloud test-02â€¦44** (skip test-01 Ä‘Ã£ import pilot)
  - Script: `scripts/publish-ket-practice-listening.mjs`
  - IDs: `listening-import-ket-a2-practice-02` â€¦ `44`
  - Table `listening_exam_published` + Storage `listening-exam-media`
- [ ] User hard refresh app â†’ smoke Book 3 Test 4

### LÆ°u Ã½
- KhÃ´ng dÃ¹ng id/slug chung `catalog-listening-ket-a2-test1` cho practice
- App UI KET Ä‘Ã£ há»— trá»£ 5 file part; published exams dÃ¹ng `audioUrl` public per part
- test-01 (Book 3 Test 3) váº«n báº£n local pilot `listening-import-*` timestamp â€” khÃ´ng Ä‘á»¥ng

### Lá»‡nh
```bash
node scripts/ket-practice-csv-to-exam.mjs all
node scripts/publish-ket-practice-listening.mjs 2-44   # re-publish (upsert)
```

---

## 2026-07-15 â€” grammar_basic 8Ã—25 cÃ¢u

- `seedData/grammarBasic25.ts` â€” 8 genre: present simple/continuous/perfect/perfect continuous, uncountable, singular/plural, passive, comparison
- Má»—i bá»™ id `tr-grammar-{genre}`, 25 cÃ¢u VIâ†’EN + hint
- `seedTranslationPacks` v2 â€” auto upgrade (giá»¯ SRS theo sentence id); xÃ³a pack import trÃ¹ng genre
- Verify: vitest grammarBasic25 PASS; tsc PASS
- User: hard refresh â†’ `/app/writing/translate/grammar_basic` â†’ tá»«ng chá»§ Ä‘á» hiá»‡n **1 bá»™ Â· 25 cÃ¢u**

## 2026-07-15 â€” Seed Luyá»‡n dá»‹ch IELTS (Json Import)

- Nguá»“n: `7. Json Import/1. Writing Master/2. Luyá»‡n dá»‹ch IELTS/`
  - Present Continuous.json â†’ **25 cÃ¢u** (`grammar_basic` / `present_continuous`)
  - Present Simple.json â†’ **2 cÃ¢u** (`grammar_basic` / `present_simple`)
- Code:
  - `importIeltsTranslationPack.ts` â€” parse `ielts_translation_pack`
  - `seedData/ieltsTranslationPacks.json` + `seedTranslationPacks.ts` â€” upsert stable id `tr-import-â€¦`
  - Wire `ensureTranslationSeedData()` trÃªn Hub / Genre / Practice pages
- Verify: vitest import pack PASS; `tsc --noEmit` PASS
- User: hard refresh `/app/writing/translate` â†’ **Cáº¥u trÃºc cÆ¡ báº£n** â†’ Hiá»‡n táº¡i tiáº¿p diá»…n / Hiá»‡n táº¡i Ä‘Æ¡n

## 2026-07-15 â€” Fix avatar tráº¯ng (user + admin)

- **NguyÃªn nhÃ¢n:** Google OAuth dÃ¹ng `picture` (khÃ´ng chá»‰ `avatar_url`); `<img>` thiáº¿u `referrerPolicy="no-referrer"` â†’ Google cháº·n â†’ vÃ²ng trÃ²n tráº¯ng; fallback chá»¯ dÃ¹ng `--bg-primary` dá»… sai contrast.
- **Fix:**
  - `userAvatar.ts` â€” resolve `avatar_url` | `picture` | identity_data
  - `UserAvatar.tsx` â€” component chung: `referrerPolicy`, `object-cover`, onError â†’ chá»¯ cÃ¡i `--color-on-primary`
  - Wire: AppShell, HomePage, SettingsPage, AdminPage
  - `syncAuthProfile` â€” mirror `picture` â†’ `user_metadata.avatar_url` + profiles
- Verify: vitest userAvatar + syncAuthProfile PASS; `tsc --noEmit` PASS

## 2026-07-15 â€” KET A2 Listening convert 44 ZIP + publish cloud

- Media Ä‘á»§ + convert ZIP **44/44**
- User: test-01 Ä‘Ã£ import; báº¯t Ä‘áº§u tá»« **Cam 3 Test 4** â†’ publish **02â€“44** only
- `node scripts/publish-ket-practice-listening.mjs 2-44` â†’ **43/43 OK**
- Verify: practice count 43; audio URL HTTP 200
- Title range: Book 3 Test 4 â€¦ Book 14 Test 2
- **User:** hard refresh (Ctrl+F5) â†’ Luyá»‡n thi â†’ Cambridge â†’ A2 Key

---
## 2026-07-16 â€” Fix PDF.js bÃ¡o file 0 byte

- User gáº·p `The PDF file is empty, i.e. its size is zero bytes` trong reader má»›i.
- XÃ¡c minh endpoint dev tráº£ Ä‘Ãºng `200`, `application/pdf`, `Content-Length: 1,018,904` vÃ  magic bytes `%PDF-1.4`; file váº­t lÃ½ khÃ´ng rá»—ng.
- Root cause náº±m á»Ÿ pipeline browser `fetch â†’ arrayBuffer â†’ Uint8Array â†’ getDocumentProxy`: PDF.js chuyá»ƒn/detach backing buffer khi má»Ÿ document, táº¡o Ä‘Æ°á»ng lá»—i 0-byte trong lifecycle reader.
- Bá» hoÃ n toÃ n fetch/arrayBuffer trung gian trong `BookReaderPage`; dÃ¹ng PDF.js `getDocument({ url })` Ä‘á»ƒ thÆ° viá»‡n táº£i trá»±c tiáº¿p URL PDF.
- Bá» helper `renderPageAsImage`; render `PDFPageProxy` trá»±c tiáº¿p lÃªn `<canvas>`, cÃ³ cleanup/cancel render task khi Ä‘á»•i trang hoáº·c unmount.
- Regression test khÃ³a yÃªu cáº§u: `getDocument` nháº­n URL, khÃ´ng gá»i global fetch, render trang 1 lÃªn canvas, khÃ´ng iframe.
- Verify: endpoint 1,018,904 bytes; 8 Reading Corner tests PASS; `tsc --noEmit` PASS; production build PASS.

### Next session start prompt

Hard refresh `/app/reading-corner/sach/read/cv01`; xÃ¡c nháº­n trang 1 render lÃªn canvas, bá»™ Ä‘áº¿m `1 / 278`, nÃºt trang sau má»Ÿ trang 2 vÃ  khÃ´ng cÃ²n lá»—i PDF file empty.
## 2026-07-16 â€” Fix SRS flip card bá»‹ xuyÃªn hai máº·t á»Ÿ dark theme

- áº¢nh user cho tháº¥y sau khi láº­t, ná»™i dung máº·t trÆ°á»›c bá»‹ soi gÆ°Æ¡ng/xuyÃªn qua máº·t sau.
- Root cause: `.vs-flip-face` dÃ¹ng gradient alpha + `backdrop-filter: blur(20px)` bÃªn trong `preserve-3d`; Chrome compositing sai backface trÃªn dark theme.
- Máº·t tháº» giá» cÃ³ lá»›p ná»n kÃ­n `var(--bg-card)` dÆ°á»›i gradient theme, bá» backdrop-filter khá»i chÃ­nh hai máº·t 3D.
- ThÃªm visibility handoff táº¡i ná»­a animation (0.275s): máº·t trÆ°á»›c áº©n cá»©ng khi flipped, máº·t sau chá»‰ hiá»‡n khi flipped; giá»¯ `backface-visibility` cho hiá»‡u á»©ng xoay.
- ThÃªm stacking isolation cho `.vs-flip-inner`; khÃ´ng thay Ä‘á»•i handler láº­t/rating hoáº·c grid.
- Regression test Ä‘á» trÆ°á»›c fix â†’ xanh; 4 vocab CSS/backdrop tests PASS; `tsc --noEmit` PASS; production build PASS.

### Next session start prompt

Hard refresh `/app/vocab`, má»Ÿ Láº·p láº¡i ngáº¯t quÃ£ng á»Ÿ dark theme vÃ  láº­t nhiá»u tháº»; xÃ¡c nháº­n chá»‰ tháº¥y Ä‘Ãºng má»™t máº·t, khÃ´ng cÃ²n chá»¯ soi gÆ°Æ¡ng/xuyÃªn lá»›p trong hoáº·c sau animation.
## 2026-07-16 â€” Fix tiáº¿p SRS: máº·t sau biáº¿n máº¥t sau báº£n vÃ¡ xuyÃªn máº·t

- áº¢nh user cho tháº¥y tráº¡ng thÃ¡i flipped cÃ³ rating buttons nhÆ°ng toÃ n bá»™ card trá»‘ng.
- Root cause chÃ­nh xÃ¡c: `isolation: isolate` Ä‘Æ°á»£c thÃªm cÃ¹ng `.vs-flip-inner { transform-style: preserve-3d }`; isolation lÃ  grouping property khiáº¿n descendants bá»‹ flatten, nÃªn backface cá»§a máº·t sau bá»‹ loáº¡i bá».
- Gá»¡ `isolation: isolate`, giá»¯ `position: relative` vÃ  `preserve-3d`.
- Giá»¯ nguyÃªn cÃ¡c pháº§n Ä‘Ãºng cá»§a báº£n vÃ¡ trÆ°á»›c: ná»n card kÃ­n, khÃ´ng backdrop-filter trÃªn face, visibility handoff á»Ÿ ná»­a vÃ²ng xoay.
- Regression test yÃªu cáº§u flip inner cÃ³ `preserve-3d` vÃ  tuyá»‡t Ä‘á»‘i khÃ´ng cÃ³ `isolation`.
- Verify: test Ä‘á» trÆ°á»›c fix â†’ xanh; 4 vocab tests PASS; `tsc --noEmit` PASS; production build PASS.

### Next session start prompt

Hard refresh `/app/vocab`, láº­t SRS card á»Ÿ dark theme; xÃ¡c nháº­n máº·t sau hiá»‡n nghÄ©a/IPA/example, máº·t trÆ°á»›c khÃ´ng xuyÃªn qua, láº­t vá» máº·t trÆ°á»›c váº«n bÃ¬nh thÆ°á»ng.
## 2026-07-16 â€” Security HIGH: Phase 1 code hoÃ n táº¥t, Phase 2 quota Ä‘ang triá»ƒn khai

- Äá»c toÃ n bá»™ `Security/SECURITY_HARDENING_PLAN.txt` vÃ  triá»ƒn khai theo thá»© tá»±.
- Phase 1 code:
  - Migration `020_harden_published_exams.sql`: anon khÃ´ng Ä‘á»c Ä‘Æ°á»£c Ä‘á» publish; authenticated qua `can_read_published_exam`, free chá»‰ 4 demo, paid/admin toÃ n bá»™.
  - `admin_published_modules` + `admin_publish_meta` chuyá»ƒn tá»« public sang authenticated read.
  - Admin publish Reading/Listening tÃ¡ch answer vault private trÆ°á»›c, body ghi DB Ä‘Ã£ strip recursive `answer`, `explanation`, `acceptableAnswers`, `modelAnswer` vÃ  cÃ¡c key scoring khÃ¡c.
  - Script `backfill-published-exam-vaults.mjs` cho row cÅ©.
  - `books/` paid-only; `catalog/ielts-wizard/` admin-only; content-sign há»— trá»£ PDF/SVG.
  - BookReader resolve signed URL trÆ°á»›c khi fetch buffer.
  - 99 wizard assets Ä‘Ã£ copy vÃ o `public/catalog/ielts-wizard`; UI wizard resolve signed URL.
  - strip build + `.vercelignore` loáº¡i `catalog`, `data`, `books`, `ielts-wizard`.
  - Upload script há»— trá»£ books/PDF/SVG vÃ  dry-run khÃ´ng cáº§n credential.
- Dry-run private upload PASS: 1 PDF (1,018,904 bytes) + 99 wizard assets (8,529,450 bytes).
- Phase 2 code:
  - Migration `021_content_access_daily_quota.sql`: admin-only security alert queue + anomaly scan hourly náº¿u pg_cron sáºµn.
  - content-sign TTL 60s, quota 400/user/24h, alert tá»« 300 request.
- Tests scoped Phase 1/BookReader/answer-strip/protected paths PASS.
- Production blocker: `.env.deploy` cÃ³ access token nhÆ°ng chÆ°a cÃ³ `SUPABASE_SERVICE_ROLE_KEY`, nÃªn chÆ°a cháº¡y upload/backfill production.
- Phase 5.1 Turnstile Spin:
  - Widget Managed Ä‘Ã£ táº¡o cho `localhost`, `127.0.0.1`, `ryanenglishv2.vercel.app`.
  - Site key public: `0x4AAAAAAD3OvoKGgmLtnOJz`.
  - Managed Worker Ä‘Ã£ deploy: `turnstile-siteverify-ryan-english` táº¡i `https://turnstile-siteverify-ryan-english.ryan-license-worker.workers.dev`.
  - Secret chá»‰ Ä‘Æ°á»£c truyá»n vÃ o Worker qua `wrangler secret put`, khÃ´ng ghi vÃ o repo.
  - Form Ä‘Äƒng nháº­p email Ä‘Æ°á»£c gate báº±ng `success === true`; Google OAuth giá»¯ nguyÃªn.
  - CSP Ä‘Ã£ cho phÃ©p Turnstile script/frame vÃ  Worker endpoint.
  - Validation end-to-end PASS: health, dummy token rejection, managed-worker metadata, hostname.
- Scoped security tests PASS: 5 files / 11 tests.
- Full `tsc` Ä‘ang bá»‹ cháº·n bá»Ÿi duplicate properties trong user-owned `reading-corner/catalog.ts`, khÃ´ng thuá»™c patch security.
- Phase 4 code:
  - Public routes `/terms` vÃ  `/privacy`.
  - Copyright + legal links trÃªn landing, login vÃ  app sidebar.
  - Migration `022_legal_consent.sql`: versioned consent timestamps qua
    `accept_legal_terms()`, protected server-controlled fields.
  - Reusable `TermsConsentCheckbox` Ä‘Ã£ sáºµn sÃ ng; app chÆ°a cÃ³ signup handler
    thá»±c táº¿ nÃªn chÆ°a wire checkbox vÃ o luá»“ng Ä‘Äƒng kÃ½.
- Phase 3/6:
  - `pnpm security:check` kiá»ƒm tra sourcemap, noindex, anti-frame, private media,
    ignored secrets, migrations vÃ  cáº¥m `VITE_*SERVICE_ROLE`.
  - Runbook `Security/SECURITY_OPERATIONS.md`, PR/release template vÃ  quarterly
    RLS/audit workflow.
- Turnstile Spin bundle persisted táº¡i `.claude/skills/turnstile-spin`.
- Verify má»›i nháº¥t: `security:check` 8/8 PASS; scoped security tests 6 files /
  13 tests PASS; `git diff --check` PASS.
- Production Ä‘Ã£ Ã¡p:
  - Láº¥y service-role táº¡m qua Supabase Management API báº±ng PAT hiá»‡n cÃ³; key chá»‰
    tá»“n táº¡i trong process, khÃ´ng ghi file/log.
  - Upload private `exam-media`: 2.011/2.012 file thÃ nh cÃ´ng.
  - Duy nháº¥t `catalog/listening/cae-c1-test1/listening.mp3` (82.94MB) vÆ°á»£t giá»›i
    háº¡n 50MB cá»§a Supabase Free, bá»‹ bá» qua vÃ  sáº½ khÃ´ng kháº£ dá»¥ng sau lockdown.
  - Backfill 51 Listening published rows: tÃ¡ch 1.275 answer entries vÃ o private
    vault; body production khÃ´ng cÃ²n answer fields.
  - Deploy Edge Function `content-sign`.
  - Push migrations 018â€“022 lÃªn production.
  - Audit production PASS: anon Ä‘á»c 0 rows á»Ÿ reading/listening/admin publish
    tables; answer leak false; `exam-media.public=false`; vault tá»“n táº¡i;
    content-sign thiáº¿u JWT tráº£ 401.
- Gá»¡ duplicate aliases `media` vÃ  `housing` á»Ÿ mapping `reading-corner/catalog.ts`
  (giá»¯ semantics runtime â€œlast key winsâ€), má»Ÿ khÃ³a typecheck/build.
- Full `tsc --noEmit` PASS; production build PASS vÃ  strip toÃ n bá»™ private media
  khá»i dist; `security:check` 9/9 PASS.
- CSP production Ä‘Ã£ bá» `'unsafe-eval'` vÃ  script `'unsafe-inline'`.
- Blocker cÃ²n láº¡i:
  - Vercel CLI token khÃ´ng há»£p lá»‡: code web má»›i chÆ°a deploy; chÆ°a táº¡o/publish
    Firewall rules hoáº·c kiá»ƒm tra production logs.
  - Signup handler chÆ°a tá»“n táº¡i nÃªn `TermsConsentCheckbox` chÆ°a wire thá»±c táº¿.
  - ChÆ°a cÃ³ kÃªnh email/Zalo gá»­i alert; hiá»‡n cÃ³ queue + admin-only DB alerts.
  - PITR, legal review/Ä‘Äƒng kÃ½ báº£n quyá»n vÃ  xá»­ lÃ½ file CAE >50MB lÃ  thao tÃ¡c
    dashboard/kinh doanh cÃ²n láº¡i.

### Next session start prompt

User cháº¡y `vercel login` Ä‘á»ƒ lÃ m má»›i token, sau Ä‘Ã³ deploy production ngay (backend
Ä‘Ã£ lockdown), smoke `/terms`, `/privacy`, login Turnstile, rá»“i táº¡o/publish
Vercel Firewall draft. Xá»­ lÃ½ audio CAE 82.94MB báº±ng nÃ¢ng Supabase Pro hoáº·c nÃ©n
dÆ°á»›i 50MB vÃ  upload láº¡i Ä‘Ãºng path.

### Táº¡m dá»«ng cuá»‘i ngÃ y 2026-07-16

- User yÃªu cáº§u dá»«ng vÃ  tiáº¿p tá»¥c vÃ o ngÃ y mai.
- KhÃ´ng cháº¡y láº¡i upload, backfill hoáº·c migrations 018â€“022: táº¥t cáº£ Ä‘Ã£ Ã¡p dá»¥ng
  production vÃ  audit PASS.
- Viá»‡c Ä‘áº§u tiÃªn ngÃ y mai:
  1. User cháº¡y `vercel login` trong `D:\App-English-Ryan\Website`.
  2. XÃ¡c minh báº±ng `vercel whoami`.
  3. Deploy frontend production Ä‘á»ƒ Ä‘á»“ng bá»™ vá»›i backend Ä‘Ã£ lockdown.
  4. Smoke test `/terms`, `/privacy`, Turnstile login, sÃ¡ch vÃ  media Ä‘á» thi.
  5. Táº¡o Vercel Firewall draft, review `vercel firewall diff`, sau Ä‘Ã³ má»›i
     publish.
- ChÆ°a xá»­ lÃ½:
  - Audio `catalog/listening/cae-c1-test1/listening.mp3` 82.94MB vÆ°á»£t giá»›i háº¡n
    Supabase Free 50MB.
  - Signup handler chÆ°a tá»“n táº¡i nÃªn checkbox consent chÆ°a Ä‘Æ°á»£c wire.
  - Alert má»›i dá»«ng á»Ÿ DB queue; chÆ°a gá»­i email/Zalo.
  - PITR, legal review vÃ  Ä‘Äƒng kÃ½ báº£n quyá»n cáº§n thao tÃ¡c dashboard/nghiá»‡p vá»¥.

### Session 2026-07-17 â€” Verify production + smoke test HIGH security

- XÃ¡c minh code: migrations 019â€“023 trong repo; `pnpm db:push` remote up-to-date;
  `content-sign` redeploy OK; security tests (phase1/2/4 + BookReaderPage)
  10/10 PASS; `tsc --noEmit` PASS.
- Smoke test production (https://ryanenglishv2.vercel.app) â€” ALL PASS:
  - `/terms`, `/privacy` render Ä‘áº§y Ä‘á»§ (Ä‘iá»u khoáº£n cáº¥m crawl, copyright footer)
  - `/books/*.pdf` â†’ SPA fallback (PDF binary Ä‘Ã£ strip khá»i dist)
  - REST anon `reading/listening_exam_published` â†’ `[]`
  - `content-sign` khÃ´ng JWT â†’ 401; storage `exam-media` public access â†’ 400
  - Login: Turnstile widget hiá»ƒn thá»‹, nÃºt ÄÄƒng nháº­p disabled tá»›i khi cÃ³ token;
    khÃ´ng lá»—i CSP
- **Audio CAE fix:** user Ä‘Ã£ nÃ©n mp3 <20MB vÃ  import láº¡i vÃ o app â€” háº¿t blocker
  50MB Supabase Free.
- **Vercel Hobby note:** khÃ´ng cÃ³ rate-limit rule (cáº§n Pro). Má»©c Hobby dÃ¹ng:
  Attack Challenge Mode (báº­t khi bá»‹ crawl) + 1 custom WAF rule challenge/deny
  theo UA bot (python-requests, scrapy, curl, wget, HeadlessChrome,
  Go-http-client). Daily quota 400/user/24h á»Ÿ content-sign lÃ  lá»›p rate-limit
  chÃ­nh â€” chá»‰ nÃ¢ng Pro/Cloudflare khi cÃ³ báº±ng chá»©ng bá»‹ crawl
  (theo dÃµi `content_access_log` + Vercel Analytics).
- CÃ²n láº¡i (tay user): táº¡o 1 custom WAF rule UA-bot trÃªn Vercel Dashboard;
  login tháº­t + admin publish 1 Ä‘á» Ä‘á»ƒ confirm end-to-end.

### Session 2026-07-17 â€” Speaking AI thÃ nh trang riÃªng, chat + thu Ã¢m

- Speaking AI chuyá»ƒn tá»« modal panel sang trang riÃªng `/app/speaking-ai`
  (`features/speaking-ai/SpeakingAiPage.tsx` + `speakingAiPage.css`); xÃ³a
  `SpeakingAiPanel.tsx`, `speakingAi.css`, `speakingAiTranscript.css`.
- Há»— trá»£ song song gÃµ chat vÃ  thu Ã¢m micro: textarea + nÃºt mic; transcript
  nháº­n dáº¡ng ghÃ©p vá»›i text gÃµ tay; lÆ°á»£t gÃµ tay Æ°á»›c lÆ°á»£ng `durationSec` theo sá»‘
  tá»« (words/2, káº¹p 1â€“60s) nÃªn váº«n dÃ¹ng edge function `speaking-ai` (DeepSeek)
  hiá»‡n cÃ³, khÃ´ng Ä‘á»•i backend.
- UI premium theo skill high-end-visual-design: hero eyebrow pill, console
  double-bezel bo 2rem, bubble gradient, composer pill + nÃºt send button-in-button,
  motion cubic-bezier, tÃ´n trá»ng prefers-reduced-motion; ná»n dÃ¹ng grid xanh
  nháº¡t sáºµn cÃ³ (`/app/speaking-ai` thÃªm vÃ o `APP_GRID_ONLY_PATHS`).
- Sidebar: bá» nÃºt má»Ÿ modal á»Ÿ Ä‘áº§u toolbar; thÃªm NavLink "Speaking AI"
  (icon AudioLines) ngay dÆ°á»›i "Luyá»‡n Shadowing".
- Test `speakingAiMvp.test.ts` cáº­p nháº­t theo trang má»›i â€” 3/3 PASS;
  `tsc --noEmit` PASS.
- ChÆ°a smoke UI trong trÃ¬nh duyá»‡t (route cáº§n Ä‘Äƒng nháº­p, user chá»n bá» qua).

### Session 2026-07-17 â€” Ná»n lÆ°á»›i Writing subpages

- Má»i route con `/app/writing/*` dÃ¹ng ná»n lÆ°á»›i xanh nháº¡t, khÃ´ng ribbon; trang
  hub `/app/writing` giá»¯ ribbon.
- Bá»• sung transparency cho `writing-shell`, cÃ¹ng Translation Practice:
  danh sÃ¡ch/chi tiáº¿t, empty state vÃ  mÃ n hÃ¬nh luyá»‡n táº­p toÃ n trang (`tp-shell`)
  Ä‘á»u Ä‘á»ƒ lá»™ backdrop lÆ°á»›i; card vÃ  input váº«n giá»¯ ná»n riÃªng.
- Verify: `appShellBackdrop.test.ts` 62/62 PASS; `tsc --noEmit` PASS.

### Session 2026-07-17 â€” Translation: nháº­n diá»‡n cÃ¢u Ä‘Ã£ dá»‹ch

- CÃ¢u Ä‘Ã£ dá»‹ch cÃ³ ná»n vÃ  viá»n mÃ u primary ráº¥t nháº¹, Ä‘á»“ng thá»i badge `ÄÃ£ dá»‹ch` cÃ³
  icon check Ä‘á»ƒ phÃ¢n biá»‡t nhanh vá»›i cÃ¢u chÆ°a dá»‹ch mÃ  khÃ´ng lÃ m máº¥t Ä‘á»™ dá»… Ä‘á»c.

### Session 2026-07-17 â€” Sá»­a overlay phiÃªn luyá»‡n dá»‹ch

- `tp-shell` lÃ  lá»›p phá»§ toÃ n trang cá»§a phiÃªn luyá»‡n dá»‹ch, nÃªn khÃ´ng Ä‘Æ°á»£c lÃ m
  trong suá»‘t theo backdrop grid. ÄÃ£ bá» override nÃ y; grid chá»‰ hiá»‡n á»Ÿ mÃ n hÃ¬nh
  danh sÃ¡ch, cÃ²n phiÃªn luyá»‡n táº­p cÃ³ ná»n Ä‘áº·c vÃ  khÃ´ng cÃ²n lá»™ UI phÃ­a sau.
- Regression check `appShellBackdrop.test.ts`: red trÆ°á»›c sá»­a (1/62 fail vÃ¬
  `tp-shell` bá»‹ transparent), green sau sá»­a.

### Session 2026-07-17 â€” LÆ°á»›i trong phiÃªn luyá»‡n dá»‹ch

- `tp-shell` cÃ³ ná»n lÆ°á»›i xanh nháº¡t Ä‘á»™c láº­p (opaque), vÃ¬ váº­y phiÃªn luyá»‡n táº­p cÃ³
  Ä‘Ãºng visual grid mÃ  khÃ´ng lÃ m lá»™ UI danh sÃ¡ch phÃ­a sau.
- TÄƒng Ä‘á»™ nháº­n diá»‡n cho cÃ¢u/badge `ÄÃ£ dá»‹ch`: tint 11%, viá»n primary 45% vÃ 
  badge 30% Ä‘á»ƒ tráº¡ng thÃ¡i xanh nhÃ¬n tháº¥y ngay á»Ÿ light/mid/dark theme.

### Session 2026-07-17 â€” Badge ÄÃ£ dá»‹ch xanh lÃ¡

- ThÃªm token `--color-success` cho cáº£ light/dark/mid theme; chá»‰ badge check
  `ÄÃ£ dá»‹ch` dÃ¹ng token nÃ y, Ä‘á»ƒ tráº¡ng thÃ¡i hoÃ n thÃ nh Ä‘Æ°á»£c nháº­n diá»‡n báº±ng xanh lÃ¡.

### Session 2026-07-17 â€” Tráº¡ng thÃ¡i Sentence Structure

- Danh sÃ¡ch `/app/sentence-structure` Ä‘á»c completion history: cáº¥u trÃºc Ä‘Ã£ hoÃ n
  thÃ nh hiá»‡n badge xanh lÃ¡ `âœ“ ÄÃ£ há»c` vÃ  gá»£i Ã½ `â†» Há»c láº¡i`, click hÃ ng váº«n má»Ÿ
  Ä‘Ãºng phiÃªn luyá»‡n táº­p hiá»‡n cÃ³.

### Session 2026-07-17 â€” Font Sentence Structure practice

- Bá» style serif/editorial cÅ© chá»‰ cÃ²n á»Ÿ route luyá»‡n cáº¥u trÃºc: header `Äiá»n tráº¯c
  nghiá»‡m` trá»Ÿ vá» font á»©ng dá»¥ng chuáº©n vÃ  khÃ´ng cÃ²n chá»¯ trang trÃ­ `GRAMMAR ATLAS`
  chá»“ng lÃªn mÃ n hÃ¬nh.

### Session 2026-07-17 â€” Sunny dáº¡o chÆ¡i trÃªn Home

- Sau 30 giÃ¢y á»Ÿ `/app/home`, mascot Sunny chuyá»ƒn sang animation â€œdáº¡o chÆ¡i/trá»‘n
  tÃ¬mâ€ nháº¹ quanh bubble header; váº«n `pointer-events: none` vÃ  táº¯t hoÃ n toÃ n khi
  ngÆ°á»i dÃ¹ng báº­t `prefers-reduced-motion`.

### Session 2026-07-17 â€” Sunny á»Ÿ cÃ¡c trang chÃ­nh

- `AppShell` dÃ¹ng má»™t mascot gÃ³c pháº£i trÃªn cho Tá»« vá»±ng, Viáº¿t, Nghe, Shadowing,
  Speaking AI, má»i trang GÃ³c Ä‘á»c, Cáº¥u trÃºc cÃ¢u vÃ  CÃ i Ä‘áº·t. Mascot khÃ´ng nháº­n
  pointer events, áº©n dÆ°á»›i 720px vÃ  táº¯t nhÃºn khi giáº£m chuyá»ƒn Ä‘á»™ng.
- Sau 30 giÃ¢y, Sunny á»Ÿ gÃ³c pháº£i trÃªn chÆ¡i trá»‘n tÃ¬m: nÃ©p ra ngoÃ i mÃ©p pháº£i rá»“i
  quay láº¡i theo chu ká»³ nháº¹.

### Session 2026-07-17 â€” Card IELTS theo GÃ³c Ä‘á»c BÃ¡o

- Hai card Listening/Reading á»Ÿ `/app/exam/track/ielts` dÃ¹ng variant riÃªng theo
  surface cá»§a GÃ³c Ä‘á»c BÃ¡o: card sÃ¡ng, viá»n Ä‘áº­m, bo lá»›n, offset shadow vÃ  hover
  dá»‹ch chÃ©o. Cambridge khÃ´ng thay Ä‘á»•i style.

### Session 2026-07-17 â€” Surface card chung toÃ n app

- Ãp surface card láº¥y cáº£m há»©ng tá»« GÃ³c Ä‘á»c BÃ¡o cho card cáº¥p má»™t toÃ n app: Home,
  Tá»« vá»±ng, Writing/Translation, Shadowing, Exam, Sentence Structure vÃ  Prompt
  Bank. CÃ¡c card cÃ³ viá»n primary text, ná»n theme, offset shadow, hover/focus rÃµ;
  khÃ´ng Ã¡p vÃ o question card, modal hoáº·c input Ä‘á»ƒ báº£o toÃ n luá»“ng há»c.
- Bá»• sung `study-heatmap` ("60 ngÃ y há»c gáº§n nháº¥t") vÃ o card surface chung.

### Session 2026-07-17 â€” Light theme Writing Library contrast

- Shared card surface lÃ m ná»n Writing Library sÃ¡ng, trong khi copy cÅ© lÃ  tráº¯ng.
  ÄÃ£ override title/description/CTA theo token theme Ä‘á»ƒ card luÃ´n Ä‘á»c Ä‘Æ°á»£c á»Ÿ
  Light, Mid vÃ  Dark.

### Session 2026-07-17 â€” Card archive IELTS/Cambridge

- Card sÃ¡ch, header sÃ¡ch vÃ  hÃ ng Ä‘á» trong má»i trang con Reading/Listening cá»§a
  `/app/exam/track/ielts/*` vÃ  `/app/exam/track/cambridge/*` dÃ¹ng surface card
  GÃ³c Ä‘á»c BÃ¡o. Chá»‰ Ä‘á»•i archive/library UI, khÃ´ng áº£nh hÆ°á»Ÿng mÃ n hÃ¬nh lÃ m bÃ i.

### Session 2026-07-17 â€” Light contrast Cambridge exam cards

- Shared card surface Ä‘Ã£ thay gradient cá»§a card ká»¹ nÄƒng Cambridge nhÆ°ng copy cÅ©
  váº«n mÃ u tráº¯ng. Title, mÃ´ táº£, icon chip vÃ  badge giá» dÃ¹ng token theme, nÃªn Ä‘á»c
  rÃµ á»Ÿ Light (vÃ  váº«n Ä‘Ãºng á»Ÿ Mid/Dark).

### Session 2026-07-17 â€” Typography chung theo GÃ³c Ä‘á»c BÃ¡o

- Thá»‘ng nháº¥t font UI báº±ng stack native cá»§a `/app/reading-corner/bao` qua
  `--font-app`; controls káº¿ thá»«a Ä‘Ãºng font. CÃ¡c mÃ n Writing, Vocab vÃ  paper
  IELTS/KET khÃ´ng cÃ²n giá»¯ Inter/Quicksand/Segoe riÃªng. Heading editorial dÃ¹ng
  `--font-editorial` (Georgia), tÆ°Æ¡ng á»©ng typography headline cá»§a BÃ¡o; font mono
  cho IPA/code vÃ  lá»±a chá»n font Ä‘á»c Ä‘á» cá»§a ngÆ°á»i dÃ¹ng Ä‘Æ°á»£c giá»¯ nguyÃªn.

### Session 2026-07-17 â€” Typography Tá»•ng quan

- `/app/home` cÃ²n override Cambria/Georgia á»Ÿ tiÃªu Ä‘á», chá»‰ sá»‘ vÃ  nhÃ£n section
  nÃªn nhÃ¬n chÆ°a Ä‘á»“ng bá»™. Ba pháº§n nÃ y nay dÃ¹ng `--font-app` nhÆ° GÃ³c Ä‘á»c BÃ¡o.

### Session 2026-07-17 â€” Audit typography toÃ n app

- RÃ  toÃ n bá»™ CSS app vÃ  thay cÃ¡c font UI/decorative cÃ²n sÃ³t á»Ÿ Reading Corner,
  Exam hub, Listening library, Sentence Structure, Login vÃ  KET Listening vá»
  `--font-app`. Ngoáº¡i lá»‡ duy nháº¥t giá»¯ láº¡i lÃ  text IPA/code vÃ  font reading do
  há»c viÃªn chá»n trong trÃ¬nh lÃ m Ä‘á»; Ä‘Ã¢y lÃ  dá»¯ liá»‡u/chá»©c nÄƒng há»c, khÃ´ng pháº£i
  typography giao diá»‡n.
- Landing vÃ  text trong mascot SVG cÅ©ng Ä‘Ã£ bá» Inter/Instrument Serif Ä‘á»ƒ cÃ¹ng
  há»‡ font; export MindMap vá»‘n Ä‘Ã£ dÃ¹ng system font tÆ°Æ¡ng thÃ­ch.

### Session 2026-07-17 â€” Popup nháº¯c Ã´n táº­p theo card BÃ¡o

- Restyle `SrsReviewReminderModal` theo surface card GÃ³c Ä‘á»c BÃ¡o: ná»n theo
  theme, viá»n Ä‘áº­m, offset shadow, CTA/deck rows cÃ³ haptic hover/focus vÃ 
  animation transform/opacity. Logic nháº¯c, Ä‘Ã³ng popup, chá»n deck vÃ 
  `prefers-reduced-motion` giá»¯ nguyÃªn.

### Session 2026-07-17 â€” CÃ i khoáº£ng nháº¯c pop-up Ã´n táº­p

- CÃ i Ä‘áº·t > Giao diá»‡n cÃ³ lá»±a chá»n 5 / 15 / 25 / 30 phÃºt cho pop-up nháº¯c Ã´n
  trong app. GiÃ¡ trá»‹ Ä‘Æ°á»£c lÆ°u local, phÃ¡t event Ä‘á»ƒ AppShell Ä‘ang má»Ÿ nháº­n ngay;
  máº·c Ä‘á»‹nh tÆ°Æ¡ng thÃ­ch ngÆ°á»£c lÃ  30 phÃºt.

### Session 2026-07-17 â€” Vocab library theo Nhai TOPIK (UI-only reference)

- `/app/vocab` dÃ¹ng grid-paper panel neo-brutalist, filter/tabs viá»n Ä‘áº­m vÃ 
  card giÃ¡o trÃ¬nh 2 cá»™t dáº¡ng bÃ¬a sÃ¡ch + metadata/progress. Giá»¯ AppShell, dá»¯
  liá»‡u deck vÃ  luá»“ng há»c Ryan; khÃ´ng dÃ¹ng hay import dá»¯ liá»‡u tá»« website crawl.

### Session 2026-07-17 â€” Vocab lesson theo Nhai TOPIK (UI-only reference)

- Khi má»Ÿ má»™t deck, `/app/vocab` chuyá»ƒn sang lesson canvas grid-paper vá»›i hard
  border/shadow; danh sÃ¡ch tá»« trá»Ÿ thÃ nh 2-column word cards trÃªn desktop vÃ 
  má»™t cá»™t trÃªn mobile. SRS/study modes hiá»‡n cÃ³ váº«n lÃ  luá»“ng flashcard tháº­t cá»§a
  Ryan, khÃ´ng Ä‘Æ°a dá»¯ liá»‡u lesson tá»« crawl vÃ o app.

### Session 2026-07-17 â€” Äá»“ng bá»™ 9 mode há»c vocab theo lesson grid-paper

- `Láº·p láº¡i ngáº¯t quÃ£ng`, `Tráº¯c nghiá»‡m`, `ÄoÃ¡n nghÄ©a`, `Nghe & GÃµ`, `Speaking`, `Tá»« yáº¿u`, `Ã”n táº­p`, `Thá»‘ng kÃª`, `Sá»• ghi chÃº` dÃ¹ng chung bá» máº·t paper-grid: viá»n Ä‘áº­m, hard-shadow, nÃºt/card khá»‘i vÃ  mÃ u xanh chá»n nhÆ° áº£nh UI crawl.
- Thanh 9 mode lÃ  mode card rÃµ rÃ ng (3 cá»™t desktop, 1 cá»™t mobile); luá»“ng há»c vÃ  dá»¯ liá»‡u khÃ´ng thay Ä‘á»•i.

### Session 2026-07-17 â€” PhÃ¡t Ã¢m trong danh sÃ¡ch tá»«

- Má»—i tháº» tá»« á»Ÿ lesson `/app/vocab` cÃ³ nÃºt loa, gá»i TTS phrase hiá»‡n cÃ³ vÃ  cÃ³ nhÃ£n trá»£ nÄƒng theo tá»« Ä‘ang phÃ¡t.

### Session 2026-07-17 â€” Khung flashcard SRS paper-grid

- Bá»• sung hard-border/hard-shadow trá»±c tiáº¿p vÃ o 3D flip scene vÃ  loáº¡i bá» gradient/bÃ³ng lá»“ng á»Ÿ hai máº·t tháº»; máº·t trÆ°á»›c/sau giá» cÃ¹ng há»‡ paper-card vá»›i cÃ¡c mode vocab khÃ¡c mÃ  váº«n giá»¯ cÆ¡ cháº¿ láº­t.
- NÃºt `Láº­t tháº»` cáº¡nh `Há»i AI` cÅ©ng dÃ¹ng surface paper-card, viá»n Ä‘áº­m vÃ  hard-shadow thay vÃ¬ gradient cÅ©.
- Máº·t trÆ°á»›c SRS á»Ÿ light theme khÃ³a foreground cá»§a tá»«, nhÃ£n, vÃ­ dá»¥ vÃ  gá»£i Ã½ láº­t vá» `--text-primary` Ä‘á»ƒ tÆ°Æ¡ng pháº£n rÃµ trÃªn ná»n xanh paper-card.
- Bá»• sung tÆ°Æ¡ng pháº£n cho cÃ¡c badge chá»§ Ä‘á»/Ä‘áº¿n háº¡n vÃ  nÃºt audio á»Ÿ máº·t trÆ°á»›c; chÃºng khÃ´ng cÃ²n dÃ¹ng chá»¯ nháº¡t dÃ nh cho dark theme.

### Session 2026-07-17 â€” Listening cards theo style GÃ³c Ä‘á»c BÃ¡o

- Card Cambridge pack, lesson cÃ¡ nhÃ¢n vÃ  card Part bÃªn trong `/app/listening` nay dÃ¹ng ná»n theme, border rÃµ, offset hard-shadow vÃ  hover nÃ¢ng nháº¹ theo há»‡ card BÃ¡o; thao tÃ¡c/list/grid/compact váº«n giá»¯ nguyÃªn.
- CÃ¡c route lesson `/app/listening/:lessonId` cÅ©ng dÃ¹ng background grid-paper vÃ  cÃ¹ng card family cho header, luyá»‡n táº­p, shadowing, transcript vÃ  sidebar.
- XÃ³a lá»›p hÃ¬nh trang trÃ­ trÃ²n/vuÃ´ng khá»i card Listening: card/subcard Ã©p surface sáº¡ch, khÃ´ng background image hay pseudo-element trang trÃ­.

### Session 2026-07-17 â€” Writing library surface sáº¡ch

- `/app/writing` bá» toÃ n bá»™ cÃ¡c hÃ¬nh trÃ²n/vuÃ´ng minh há»a trong bá»‘n card hub; card chuyá»ƒn sang bá»‘ cá»¥c má»™t cá»™t, giá»¯ gradient, ná»™i dung vÃ  CTA.

### Next session start prompt

Kiá»ƒm tra trá»±c quan Light/Mid/Dark táº¡i `/app/vocab`, `/app/listening`, `/app/listening/:lessonId` vÃ  `/app/writing`: báº£o Ä‘áº£m card paper/BÃ¡o cÃ³ tÆ°Æ¡ng pháº£n chá»¯ tá»‘t, khÃ´ng cÃ²n shape hÃ¬nh há»c á»Ÿ Writing vÃ  cÃ¡c thao tÃ¡c há»c/SRS/Listening váº«n hoáº¡t Ä‘á»™ng. CÃ¡c thay Ä‘á»•i UI hiá»‡n táº¡i Ä‘Ã£ pass `pnpm --filter web exec -- tsc --noEmit`; working tree cÃ³ thay Ä‘á»•i UI cá»§a user/session, khÃ´ng reset hoáº·c checkout.
## 2026-07-18 â€” Emergency account-suspension circuit breaker

- Added migration `028_suspend_compromised_accounts.sql`: admin-only `set_user_suspension(user_id, suspended, reason)`, suspension audit fields, and an entitlement check that denies suspended users all published exams, including free demos.
- `content-sign`, `speaking-ai`, and `notify-payment` now check `profiles.suspended_at` for every request and return `ACCOUNT_SUSPENDED` (403); this overrides a still-valid JWT. New signed URLs stop immediately; a URL issued before suspension retains its existing 60-second TTL.
- Client converts the signed-media denial to an account-suspended message. `phase2Hardening` 4/4 and web TypeScript check PASS.
- To suspend a user after migration: `select public.set_user_suspension((select id from public.profiles where email = '<email>'), true, 'Suspected automated crawl');`. Reverse it with `false, null`.
## 2026-07-18 â€” Admin self-service account suspension

- `/app/admin` now lets an administrator search a user, give an optional reason, confirm **KhÃ³a**, and later **Má»Ÿ khÃ³a**. Admin accounts cannot be suspended from this UI.
- The action calls the production-safe `set_user_suspension` RPC; it preserves user data, downgrades a suspended account to Free, and immediately stops new protected-content/API access through the server checks from migration 028.
- Verify: `phase2Hardening` includes the Admin RPC regression assertion; run TypeScript check before release.
## 2026-07-18 â€” Pro-only content access

- All learning/content routes under `/app` now require an active Pro, Lifetime, or Admin profile. Free, Trial, and Basic users are redirected to Settings to upgrade; Settings remains accessible for account/payment management.
- Migration `029_pro_only_content_access.sql` removes free exam demos at the database entitlement layer. `content-sign` no longer signs any media for Free/Trial/Basic; Speaking AI also rejects those plans with `PRO_REQUIRED`.
- Production: migration 029 pushed; `content-sign` and `speaking-ai` deployed. Vercel release is still intentionally pending because the working tree contains unrelated UI changes.
- Verify: `phase2Hardening` 6/6 PASS, `pnpm --filter web exec tsc --noEmit` PASS, and `pnpm security:check` 9/9 PASS.
## 2026-07-18 â€” Flashcard radial-reveal demo

- Added standalone `flashcard-radial-reveal-demo.html` for direct browser testing: origin-based radial `clip-path` reveal, 1â†’1.02â†’1 depth settle, registered gradient-angle transition, staggered phonetic/translation, landing shadow and reverse-to-original-origin behavior.
- The demo is vanilla HTML/CSS/JS; JS only records click coordinates, toggles state classes and sequences the reverse text fade. It includes keyboard access and `prefers-reduced-motion` support.
## 2026-07-18 â€” Flashcard fade-reveal demo

- Added standalone `flashcard-fade-reveal-demo.html`: a reusable vanilla card factory using one `.is-flipped` state class, smooth blueâ†’green `background-color` transition, compacted word, staggered phonetic/translation reveal and clean hint replacement/reverse behavior.
## 2026-07-18 â€” SRS flashcard Fade Reveal

- Replaced the SRS card's 3D `rotateY` flip with a one-class Fade Reveal: theme-token blueâ†’green `background-color` transition, compacted source word, staggered phonetic (70ms) and translation (140ms), clean hint fade and reverse, plus reduced-motion support.
- SRS queue, audio, keyboard flip/rating, notebook save and scheduling behavior are unchanged.
## 2026-07-18 â€” SRS Fade Reveal translucent surface

- Changed the blue and green Fade Reveal surfaces to 50% `color-mix(..., transparent)`, letting the study paper/grid show through while retaining theme-token colors and readable foreground text.
## 2026-07-18 â€” SRS transparency fix

- Removed the opaque lesson-paper frame behind the SRS Fade Reveal card. The 50% tint now composites with the visible grid/paper backdrop rather than with an opaque inner surface.
## 2026-07-18 â€” SRS Fade Reveal 30% tint

- Reduced both front and revealed SRS tint layers from 50% to 30% so the paper-grid backdrop remains more prominent.
## 2026-07-18 â€” SRS Fade Reveal 15% tint

- Reduced both SRS Fade Reveal tint layers to 15%, making the underlying paper grid the dominant surface.
## 2026-07-18 â€” Translucent vocab learning modes

- Applied the same 15% transparent primary-tint surface to Quiz, Guess Meaning, Listen & Type, and Speaking. Inputs/options keep their own surfaces for readability; the main exercise panels now reveal the paper grid underneath.
## 2026-07-18 â€” Persistent SRS rating controls

- The four SRS rating controls are now sticky/pinned below the card instead of appearing only after reveal. They stay visibly locked until the answer is revealed, preventing accidental grades.
- Replaced bright red/orange/green/purple gradients with darker, flat theme-token status tones and softer shadows.
## 2026-07-18 â€” Light SRS rating tones

- Reworked the persistent SRS rating controls to simple light/pastel status surfaces (14% tint), with readable theme-text foregrounds, subtle borders and no colored shadows.
## 2026-07-18 â€” Mid SRS rating tones

- Increased the rating controls to mid-strength tints: 24% for Hard/Good/Easy and 28% for the Forget/danger state, with correspondingly clearer borders.
## 2026-07-18 â€” Normal SRS rating saturation

- Raised SRS rating button fills to normal-strength flat colors: 60% status tint (64% Forget) with stronger matching borders; no gradients or colored shadows.
## 2026-07-18 â€” High SRS rating saturation

- Increased SRS rating fills by another 35 percentage points: 95% for Hard/Good/Easy and 99% for Forget, producing near-solid flat status colors.
## 2026-07-18 â€” SRS contrast correction

- Strengthened foreground contrast on the translucent main SRS card and switched the near-solid rating buttons to a light foreground plus high-contrast secondary text, restoring readability without changing the selected color strength.
## 2026-07-18 â€” Light SRS back-face contrast

- Strengthened the Light-theme SRS revealed face: meaning is extra-bold primary text; source word, phonetic and example use an 88% primary foreground; IPA sits on a higher-contrast light surface.

## 2026-07-18 â€” Light SRS badge contrast

- The revealed-card topic and part-of-speech badges now use primary text with a clearer translucent paper surface and border in Light theme, so long topic names and labels such as â€œTÃ­nh tá»«â€ remain legible.

## 2026-07-18 â€” SRS horizontal next-card transition

- After rating a revealed SRS card, the current card now passes left and the next card enters from the right (180ms out, 240ms in). Rating, flipping and keyboard input are briefly locked during the pass to prevent duplicate actions; reduced-motion users advance without the visible slide.
- Verify: `vocabStudyFlip.test.ts` 2/2 PASS and `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-18 â€” Phrase-library Revise entry point

- Added a **Revise** control beside the Phrases tab. It shows the due-card count for the currently selected unit type, opens the existing deck picker, and starts SRS with the selected deck while preserving that unit filter. The control is visibly disabled when nothing is due.
- Revise is a separate card beside Phrases, with the same background, border, radius and active-state treatment as the Phrases card.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-18 â€” Vocabulary library outer frame removal

- Removed the desktop-only hard border, rounded frame and offset shadow that enclosed the entire Vocabulary library canvas. The grid-paper background and all individual tab/deck cards remain unchanged.

## 2026-07-18 â€” Corrected vocabulary SRS rating schedule

- Replaced the old day-only scheduler with the visible learning cadence: **QuÃªn** returns in 1 minute, **KhÃ³** in 10 minutes, consecutive **Nhá»›** ratings schedule 1 day then 4 days, and **Dá»…** schedules a new card for 4 days. Later intervals still grow from ease.
- The active SRS session now remembers the earliest 1/10-minute retry and reloads its due queue when that time arrives, so a learner does not need to leave and reopen Revise to see the card again.
- Added regression coverage in `srsScheduling.test.ts`; SRS scheduling + Fade Reveal tests 6/6 and `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-18 â€” Revise due-state refresh and signal

- The Revise-card count now reevaluates every 15 seconds as well as on Dexie data updates, fixing the stale state where a 1-minute lapse became due but the card stayed disabled because no database write occurred at that exact minute.
- Once a matching card is due, Revise changes to the primary-tint/border state and receives a restrained motion signal; reduced-motion users get the bright state without motion.
- Verify: SRS tests 6/6 and `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-18 â€” Revise enabled-state consistency

- Corrected an inconsistent visual state: Revise previously inherited Phrasesâ€™ selected tint even with zero due cards, while remaining disabled. Revise now brightens only when its own due count is positive, which is the same condition that enables its click action.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-18 â€” Revise review-only queue

- Added the `review` SRS filter. Opening a deck from the Revise popup now loads only cards that satisfy `isSrsReviewDue`; new cards remain available from the normal Láº·p láº¡i flow and cannot enter a Revise queue.
- The SRS title/empty state identifies this as â€œÃ”n tháº» Ä‘áº¿n háº¡nâ€. Verify: SRS tests 6/6 and `pnpm --filter web exec tsc --noEmit` PASS.

## 2026-07-18 â€” MÃ¢y nhá» Ä‘i cÃ¹ng Sunny

- Gáº¯n mÃ¢y nhá» â˜ï¸ vÃ o Sunny á»Ÿ header Tá»•ng quan vÃ  mascot gÃ³c pháº£i cá»§a cÃ¡c trang chÃ­nh.
- Light hiá»ƒn thá»‹ Sunny Ä‘i cÃ¹ng mÃ¢y nhá» â˜ï¸; Mid vÃ  Dark áº©n hoÃ n toÃ n máº·t trá»i, thay báº±ng máº·t trÄƒng ðŸŒ™ nhÆ°ng váº«n giá»¯ mÃ¢y nhá» Ä‘i cÃ¹ng.
- MÃ¢y/máº·t trÄƒng náº±m cÃ¹ng wrapper chuyá»ƒn Ä‘á»™ng nÃªn luÃ´n theo Sunny khi nhÃºn, dáº¡o chÆ¡i vÃ  trá»‘n tÃ¬m; váº«n tÃ´n trá»ng `prefers-reduced-motion` vÃ  thu nhá» trÃªn mobile.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS; `git diff --check` PASS.

## 2026-07-18 â€” Bird companion SVG mascot set

- Táº¡o 5 SVG thuáº§n, nháº¹ táº¡i `apps/web/public/mascots/`: idle, happy, sad/encourage, studying/thinking vÃ  flying/loading; má»i bá»™ pháº­n chÃ­nh cÃ³ ID á»•n Ä‘á»‹nh Ä‘á»ƒ animate tá»« React/CSS.
- Bird dÃ¹ng thÃ¢n mint, cÃ¡nh xanh, bá»¥ng kem, má» coral vÃ  nÃ©t viá»n nÃ¢u-Ä‘en máº£nh; flying cÃ³ wing-flap loop ná»™i bá»™ vÃ  tÃ´n trá»ng `prefers-reduced-motion`.
- ThÃªm pose rá»™ng `bird-with-sunny.svg` cho welcome/streak vÃ  demo Ä‘á»™c láº­p `apps/web/public/demo/bird-mascot-states.html`; demo hiá»‡n cÃ¡c state cáº¡nh nhau, happy bounce vÃ  flying flap hoáº¡t Ä‘á»™ng.
- Bird SVG Ä‘Æ°á»£c giá»¯ lÃ m asset/demo tham kháº£o nhÆ°ng Ä‘Ã£ gá»¡ khá»i UI theo yÃªu cáº§u; app dÃ¹ng Sunny + mÃ¢y â˜ï¸ á»Ÿ Light, máº·t trÄƒng ðŸŒ™ + mÃ¢y â˜ï¸ á»Ÿ Mid/Dark.

## 2026-07-18 â€” Audit local-first cho táº£i 1000 user Ä‘á»“ng thá»i

- Audit read-only xÃ¡c nháº­n `syncBidirectional`, `exam_progress` vÃ  `checkin_days` Ä‘ang full-pull, khÃ´ng cursor/pagination; `supabase/config.toml` giá»›i háº¡n `max_rows = 1000`, táº¡o rá»§i ro cáº¯t dá»¯ liá»‡u im láº·ng cho user lá»›n.
- Push chÃ­nh Ä‘Ã£ batch/chunk; sync cháº¡y khi login, online vÃ  má»—i 5 phÃºt nhÆ°ng chÆ°a cÃ³ jitter/backoff. LWW váº«n dÃ¹ng timestamp tá»« clock client trong khi má»™t sá»‘ báº£ng cÃ³ trigger server `updated_at`, dáº«n tá»›i semantics khÃ´ng nháº¥t quÃ¡n.
- Index user+updated_at Ä‘Ã£ cÃ³ cho decks/cards/writing/mindmaps/exam_progress; thiáº¿u Ä‘Ã¡ng chÃº Ã½: `srs(user_id, updated_at)`, `content_access_log(ip, created_at)` vÃ  `payment_requests(user_id)`; Dexie thiáº¿u compound `[deckId+dueAt]`, reviewLog mode index vÃ  audio cache quota/LRU metadata.
- RLS own-row dÃ¹ng `auth.uid()` trá»±c tiáº¿p vÃ  thÆ°á»ng thiáº¿u `to authenticated`; cÃ¡c helper admin/entitlement Ä‘Æ°á»£c gá»i theo row, cáº§n init-plan wrapper `(select ...)`. `speaking_messages` EXISTS cÃ³ PK/index há»— trá»£ nhÆ°ng váº«n cáº§n EXPLAIN trÃªn production data.
- Runtime browser/Edge dÃ¹ng Supabase HTTP Data API, khÃ´ng má»Ÿ Postgres connection trá»±c tiáº¿p. Chuá»—i tooling hiá»‡n cÃ³ lÃ  Supavisor session port 5432; náº¿u sau nÃ y cÃ³ serverless native Postgres client thÃ¬ dÃ¹ng transaction pooler 6543.
- ChÆ°a cháº¡y EXPLAIN/load test production vÃ¬ audit khÃ´ng Ä‘Æ°á»£c cáº¥p phÃ©p táº¡o táº£i; cáº§n migration incremental-sync + indexes trÆ°á»›c, sau Ä‘Ã³ k6 báº±ng token riÃªng vÃ  SQL `EXPLAIN (ANALYZE, BUFFERS)` trÃªn dá»¯ liá»‡u Ä‘áº¡i diá»‡n.
## 2026-07-18 â€” Listening Practice event-driven input state

- Chrome DevTools production baseline for `/`: LCP 544 ms, CLS 0.00, TTFB 35 ms; render-blocking CSS/font insight reported no estimated savings, so no speculative landing-page change was made.
- Removed the 200 ms DOM polling loop from Listening Practice Boxes/Cloze. `BlankInputMode` now reports whether it contains input directly from its input event, preserving the Check-button behavior while eliminating five background DOM scans per second.
- Verify: `pnpm --filter web exec tsc --noEmit` PASS.
## 2026-07-18 â€” Production web release v0.2.7

- Bumped `apps/web` from v0.2.6 to v0.2.7 and deployed the current frontend snapshot to Vercel production without pushing the still-staging migrations 031â€“034.
- Verify: `pnpm security:check` 9/9 PASS; local production build PASS (2,271 modules) and private media strip PASS; Vercel deployment `dpl_5mNFZgicB1SxPZwmxL3XSRByD1bF` reached READY.
- Production alias `https://ryanenglishv2.vercel.app` updated to `ryanenglishv2-abwldfjbc-ryanenglish.vercel.app`. Chrome smoke: HTTP 200, landing rendered, zero console warnings/errors.
## 2026-07-18 â€” Import YouTube URL vÃ o Shadowing v0.2.8

- `/app/shadowing` cÃ³ form dÃ¡n URL YouTube; há»— trá»£ watch, youtu.be, Shorts, embed, live URL vÃ  video ID. Backend tá»± chá»n caption tiáº¿ng Anh thá»§ cÃ´ng trÆ°á»›c, fallback auto-generated, chuáº©n hÃ³a timestamp rá»“i má»Ÿ ngay lesson vá»›i player/tua cÃ¢u/tá»‘c Ä‘á»™/ghi Ã¢m/cháº¥m nÃ³i/dictation/quiz hiá»‡n cÃ³.
- ThÃªm Edge Function `youtube-captions`: auth + Pro/Lifetime/Admin + suspension check, URL/video validation, 15s timeout, giá»›i háº¡n video 2 giá»/2.000 cue, lá»—i rÃµ cho private/live/no-caption/YouTube upstream. KhÃ´ng dÃ¹ng API key/OAuth á»Ÿ client.
- Custom lesson cache local tá»‘i Ä‘a 20 video. Video pháº£i public, cho phÃ©p embed vÃ  cÃ³ caption tiáº¿ng Anh; caption cá»§a video báº¥t ká»³ khÃ´ng dÃ¹ng Ä‘Æ°á»£c YouTube Data API chÃ­nh thá»©c vÃ¬ captions list/download yÃªu cáº§u OAuth/quyá»n liÃªn quan video.
- Verify: URL parser 9/9 PASS; web TypeScript PASS; security 9/9 PASS; production build PASS (2.272 modules). Edge Function deployed to project `ntcagvtkwxwsmlxlumfo`.
- Production web v0.2.8 deployment `dpl_9dkZRMmbRxWN9Edu7NNmZdHL2tAZ` READY and aliased to `https://ryanenglishv2.vercel.app`. Logged-out smoke confirms protected route redirects to login; authenticated end-to-end paste still needs a signed-in Pro smoke.

## 2026-07-18 â€” Fix YouTube caption fetch bá»‹ cháº·n trÃªn Supabase Edge

- TÃ¡i hiá»‡n vá»›i video `_CwYFdjj63s`: URL/parser Ä‘Ãºng vÃ  desktop request ngoÃ i Edge tráº£ HTTP 200, nhÆ°ng production bÃ¡o `VIDEO_UNAVAILABLE` ngay táº¡i request trang watch; nguyÃªn nhÃ¢n lÃ  nhÃ¡nh cÅ© khÃ´ng cÃ³ fallback vÃ  che má»i upstream non-2xx thÃ nh 404 chung.
- `youtube-captions` nay thá»­ `www.youtube.com/watch` trÆ°á»›c rá»“i fallback sang `m.youtube.com/watch` vá»›i mobile User-Agent. Mobile watch Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c minh tráº£ `ytInitialPlayerResponse` vÃ  `captionTracks` cho chÃ­nh video lá»—i.
- Khi cáº£ hai nguá»“n tháº¥t báº¡i, function tráº£ `YOUTUBE_BLOCKED` 502 vÃ  log chuá»—i nguá»“n/status (`desktop:403`, `mobile:429`, v.v.) thay vÃ¬ bÃ¡o sai ráº±ng video khÃ´ng tá»“n táº¡i.
- Regression test `youtubeCaptionsFallback.test.ts` 2/2 PASS; web TypeScript PASS; security release check 9/9 PASS; diff check PASS.
- Edge Function `youtube-captions` Ä‘Ã£ deploy production lÃªn project `ntcagvtkwxwsmlxlumfo`. Cáº§n ngÆ°á»i dÃ¹ng Pro dÃ¡n láº¡i Ä‘Ãºng URL Ä‘á»ƒ smoke authenticated end-to-end; khÃ´ng cáº§n redeploy frontend.

### Follow-up â€” Supabase vÃ  Vercel Ä‘á»u bá»‹ bot checkpoint

- Authenticated production retry xÃ¡c nháº­n cáº£ desktop/mobile YouTube watch Ä‘á»u bá»‹ cháº·n tá»« Supabase, tráº£ `YOUTUBE_BLOCKED`.
- ThÃªm Vercel Function ná»™i bá»™ `/api/youtube-captions-relay`, chá»‰ nháº­n video ID há»£p lá»‡, báº£o vá»‡ báº±ng `YOUTUBE_CAPTIONS_RELAY_SECRET`, giá»›i háº¡n caption 5 MB vÃ  khÃ´ng nháº­n URL tÃ¹y Ã½. Relay tests + fallback tests 4/4 PASS; TypeScript PASS.
- Secret relay yáº¿u do PowerShell API khÃ´ng tÆ°Æ¡ng thÃ­ch á»Ÿ láº§n deploy Ä‘áº§u Ä‘Ã£ Ä‘Æ°á»£c xoay ngay báº±ng `RandomNumberGenerator.Create().GetBytes`; Vercel production deployment má»›i `dpl_BymHVAFqGL8iTe4NUMDSJ7nUZ9RJ` READY vÃ  Supabase secret/function Ä‘Ã£ redeploy.
- Blocker hiá»‡n táº¡i: Vercel Security Checkpoint tráº£ 429 trÆ°á»›c khi request tá»›i Function; `vercel curl` cÅ©ng khÃ´ng tá»± bypass vÃ¬ project chÆ°a táº¡o Protection Bypass for Automation. KhÃ´ng táº¯t firewall.
- Code Edge Ä‘Ã£ chuáº©n bá»‹ header `x-vercel-protection-bypass` tá»« secret `VERCEL_AUTOMATION_BYPASS_SECRET`. User cáº§n vÃ o Vercel Project â†’ Settings â†’ Deployment Protection â†’ Protection Bypass for Automation, táº¡o token; Ä‘áº·t cÃ¹ng giÃ¡ trá»‹ vÃ o Supabase Edge Function secret `VERCEL_AUTOMATION_BYPASS_SECRET`, rá»“i retry/deploy-smoke.
- User Ä‘Ã£ táº¡o automation bypass vÃ  Supabase secret, sau Ä‘Ã³ rotate vÃ¬ token cÅ© lá»™ trong áº£nh. Usage screenshot xÃ¡c nháº­n quota khÃ´ng vÆ°á»£t (409 MB/100 GB, 28K/1M Edge Requests, CPU 4s/1h); nháº­n Ä‘á»‹nh quota lÃ  blocker Ä‘Ã£ Ä‘Æ°á»£c rÃºt láº¡i.
- Redeploy production sau khi rotate token Ä‘á»ƒ deployment nháº­n bypass má»›i: `dpl_53GcojXeKPY8LfXgwSBC2K3VnbrW` READY, alias chÃ­nh Ä‘Ã£ cáº­p nháº­t. `vercel curl` cá»§a CLI 54 váº«n bá»‹ Security Checkpoint vÃ  khÃ´ng cÃ³ Function log, nÃªn cáº§n retry authenticated tá»« app Ä‘á»ƒ xÃ¡c nháº­n Edge dÃ¹ng secret Supabase trá»±c tiáº¿p; CLI automation lookup khÃ´ng pháº£i báº±ng chá»©ng secret Supabase sai.
## 2026-07-18 â€” Máº·t trá»i TID cho Exam Hub

- Thay minh há»a lá»›n trong hero `/app/exam` báº±ng Ä‘Ãºng hai lá»›p SVG thÃ¢n/khuÃ´n máº·t Ä‘Æ°á»£c trÃ­ch tá»« `https://theieltsdictionary.com/about-tid`; mascot dáº¡o chÆ¡i toÃ n app khÃ´ng Ä‘á»•i.
- Giá»¯ interaction gá»‘c: thÃ¢n máº·t trá»i quay 9 Ä‘á»™ má»—i 0,5 giÃ¢y, khuÃ´n máº·t Ä‘á»©ng yÃªn; responsive vÃ  tÃ´n trá»ng reduced-motion.
- Hai máº¯t Ä‘Æ°á»£c tÃ¡ch khá»i SVG máº·t, giá»¯ Ä‘Ãºng tá»a Ä‘á»™/hÃ¬nh dÃ¡ng gá»‘c vÃ  liáº¿c trÃ¡iâ€“pháº£i theo nhá»‹p 4,8 giÃ¢y; reduced-motion giá»¯ máº¯t Ä‘á»©ng yÃªn.
- Thu máº·t trá»i desktop tá»« 29rem xuá»‘ng 27rem vÃ  dá»‹ch sang pháº£i 2,5rem Ä‘á»ƒ khÃ´ng overlap tiÃªu Ä‘á» Luyá»‡n thi; mobile giá»¯ trong viewport.
- Asset public: `apps/web/public/mascots/tid/sun-body.svg` vÃ  `sun-face.svg`. Verify: `pnpm --filter web exec tsc --noEmit` PASS; `git diff --check` PASS.
## 2026-07-18 â€” Fix mÃ n hÃ¬nh tráº¯ng sau submit Listening import

- Cháº©n Ä‘oÃ¡n route `listening-import-ket-a2-practice-12`: mÃ n káº¿t quáº£ gá»i `.toUpperCase()` trá»±c tiáº¿p trÃªn option ID cá»§a dá»¯ liá»‡u import, nÃªn option thiáº¿u ID/ID khÃ´ng pháº£i chuá»—i lÃ m React crash vÃ  vÃ¹ng Exam tráº¯ng.
- Chuáº©n hÃ³a ID vá» string; náº¿u thiáº¿u thÃ¬ fallback A/B/C theo index. Luá»“ng format Ä‘Ã¡p Ã¡n nhiá»u lá»±a chá»n cÅ©ng khÃ´ng cÃ²n gá»i `.toUpperCase()` trÃªn giÃ¡ trá»‹ khÃ´ng chuáº©n.
- Regression test tÃ¡i hiá»‡n lá»—i trÆ°á»›c fix vÃ  bao phá»§ cáº£ ID thiáº¿u láº«n ID dáº¡ng sá»‘.
- Hardening tiáº¿p sau khi Practice 12 váº«n tráº¯ng: loáº¡i bá» `.toUpperCase()` trá»±c tiáº¿p cÃ²n sÃ³t á»Ÿ AI source vÃ  chuáº©n hÃ³a `question.answer`/`userAnswer`; cÃ¢u thiáº¿u answer key giá» tráº£ sai an toÃ n thay vÃ¬ gá»i `.trim()` trÃªn `undefined` lÃ m crash toÃ n bÃ¡o cÃ¡o.
- Root cause Ä‘iá»ƒm 0/25 vÃ  review khÃ´ng cÃ³ Ä‘Ã¡p Ã¡n: localhost coi `catalog/exams/**/*.answers.json` lÃ  Vite public asset, trong khi vault cá»§a Ä‘á» restored/published chá»‰ tá»“n táº¡i á»Ÿ private Supabase Storage. `mustUseSignedMedia` giá» luÃ´n kÃ½ answer vault trÃªn cáº£ dev vÃ  production; regression security test bao phá»§ Listening/Reading.
- Harden toÃ n bá»™ Luyá»‡n thi: Reading result dÃ¹ng formatter option an toÃ n nhÆ° Listening; normalize answer/option/headings chá»‹u Ä‘Æ°á»£c dá»¯ liá»‡u import thiáº¿u/sai kiá»ƒu. Cáº£ Reading vÃ  Listening khÃ´ng cÃ²n cháº¥m 0 giáº£ khi vault lá»—iâ€”hiá»‡n mÃ n bÃ¡o táº£i Ä‘Ã¡p Ã¡n tháº¥t báº¡i vÃ  nÃºt thá»­ láº¡i thay vÃ¬ render report/review thiáº¿u answer key.
- Fix tiáº¿p â€œXem cÃ¹ng Ä‘á» bÃ iâ€ hiá»‡n `ÄÃ¡p Ã¡n Ä‘Ãºng: â€”`: mÃ n bÃ¡o cÃ¡o Ä‘Ã£ dÃ¹ng exam Ä‘Æ°á»£c merge answer vault nhÆ°ng khi chuyá»ƒn vá» paper, component cha váº«n giá»¯ DTO cÅ© Ä‘Ã£ strip Ä‘Ã¡p Ã¡n. `promoteHydratedExamForReview` nay Ä‘á»“ng bá»™ snapshot Ä‘Ã£ hydrate vá» DTO mÃ  paper Ä‘ang render trÆ°á»›c khi báº­t review mode, Ã¡p dá»¥ng chung cho Listening vÃ  Reading. Regression test 1/1; toÃ n bá»™ test liÃªn quan 8/8, TypeScript vÃ  diff check PASS.
### Session 2026-07-19 â€” Fix `srs incremental pull: column srs.id does not exist`

- Root cause: helper phÃ¢n trang incremental dÃ¹ng `id` lÃ m tie-breaker cho má»i báº£ng, nhÆ°ng khÃ³a á»•n Ä‘á»‹nh cá»§a báº£ng `srs` lÃ  `card_id` vÃ  báº£ng nÃ y khÃ´ng cÃ³ cá»™t `id`.
- Query pull nay chá»n `card_id` riÃªng cho `srs`, giá»¯ `id` cho decks/cards/writing_docs/mindmaps; regression test khÃ³a Ä‘Ãºng mapping vÃ  test scalability Ä‘Æ°á»£c cáº­p nháº­t theo query Ä‘á»™ng.
- Feedback loop trÆ°á»›c fix RED Ä‘Ãºng `id` thay vÃ¬ `card_id`; sau fix scoped tests 6/6, TypeScript vÃ  `git diff --check` PASS.

### Session 2026-07-19 â€” YouTube caption relay hardening (datacenter IP blocker)

- TÃ¡ch relay Vercel thÃ nh project riÃªng `youtube-captions-relay.vercel.app`, báº£o vá»‡ báº±ng shared secret vÃ  bá»• sung Android InnerTube Player API sau desktop/mobile watch page. Unit/regression tests 5/5 vÃ  TypeScript PASS.
- Smoke production xÃ¡c nháº­n relay riÃªng khÃ´ng cÃ²n bá»‹ Vercel Security Checkpoint, nhÆ°ng egress Vercel váº«n bá»‹ YouTube cháº·n: endpoint tráº£ 502 dÃ¹ Android InnerTube hoáº¡t Ä‘á»™ng tá»« mÃ¡y local.
- Táº¡o vÃ  deploy Cloudflare Worker giá»›i háº¡n Ä‘Ãºng POST + video ID 11 kÃ½ tá»±, secret header, timeout 15 giÃ¢y vÃ  caption tá»‘i Ä‘a 5 MB táº¡i `services/youtube-captions-worker`; Wrangler 4.112.0 types + deploy dry-run PASS. Endpoint: `ryan-youtube-captions-relay.ryan-license-worker.workers.dev`.
- Relay secret Ä‘Ã£ xoay báº±ng CSPRNG, Ä‘áº·t vÃ o Worker qua stdin vÃ  Ä‘á»“ng bá»™ cÃ¹ng URL vÃ o Supabase; Edge Function `youtube-captions` Ä‘Ã£ redeploy.
- Smoke production váº«n bá»‹ YouTube cháº·n tá»« Cloudflare: `desktop:429`, `mobile:429`, `innertube:LOGIN_REQUIRED`. Káº¿t luáº­n Ä‘Ã¢y lÃ  cháº·n IP datacenter, khÃ´ng pháº£i Vercel checkpoint hay lá»—i parser. Cáº§n residential proxy hoáº·c transcript API cÃ³ key Ä‘á»ƒ hoÃ n táº¥t; app hiá»‡n váº«n cÃ³ thá»ƒ bÃ¡o YouTube cháº·n.
- Verify: YouTube fallback/relay tests 5/5 PASS; web TypeScript PASS; `git diff --check` PASS.

### Session 2026-07-19 â€” Gá»¡ nháº­p YouTube khá»i Shadowing

- Gá»¡ form â€œLuyá»‡n vá»›i video YouTube cá»§a báº¡nâ€, toÃ n bá»™ state/import/cache client vÃ  fallback custom lesson; thÆ° viá»‡n Shadowing dá»±ng sáºµn cÃ¹ng trÃ¬nh phÃ¡t cá»§a cÃ¡c bÃ i cÃ³ sáºµn váº«n giá»¯ nguyÃªn.
- XoÃ¡ source vÃ  tests cá»§a Supabase `youtube-captions`, Vercel relay vÃ  Cloudflare Worker. Production Edge Function, Vercel project, Cloudflare Worker cÃ¹ng ba Supabase relay secrets Ä‘Ã£ Ä‘Æ°á»£c xoÃ¡.
- Bump web lÃªn v0.2.9. Verify: khÃ´ng cÃ²n reference tá»›i import/relay YouTube trong app/backend source; web TypeScript PASS.
## 2026-07-21 â€” Auto-sync Listening transcript vÃ  cÃ¢u há»i theo audio

- `useExamQuestionAudio` nay expose `audioCurrentTime` vÃ  `audioDuration`, cáº­p nháº­t cÃ¹ng vÃ²ng `requestAnimationFrame` Ä‘ang Ä‘iá»u khiá»ƒn progress bar.
- Whisper local giá»¯ backward-compatible plain text vÃ  lÆ°u thÃªm segment timing Ä‘Ã£ validate táº¡i `exam-listening-whisper-segments:{examId}:{partNumber}`. Transcript panel render tá»«ng segment, highlight/auto-scroll segment Ä‘ang phÃ¡t, bá» highlight khi pause vÃ  quy Ä‘á»•i Ä‘Ãºng thá»i gian tÆ°Æ¡ng Ä‘á»‘i khi Part dÃ¹ng má»™t MP3 chung.
- ThÃªm `useAudioSync`: practice mode tá»± chá»n/scroll cÃ¢u theo Whisper segment hoáº·c tá»· lá»‡ thá»i lÆ°á»£ng; exam mode, submitted vÃ  review mode khÃ´ng auto-advance. Má»i pointer interaction trong runner táº¡m khÃ³a auto-sync 3 giÃ¢y Ä‘á»ƒ thao tÃ¡c thá»§ cÃ´ng tháº¯ng.
- TÃ­ch há»£p KET, PET, FCE/CAE/CPE vÃ  IELTS runner. Mapping thuáº§n xá»­ lÃ½ cáº£ audio riÃªng tá»«ng Part vÃ  shared-audio `startPct`/`endPct`.
- Verify: scoped `useAudioSync` tests 4/4 PASS; `pnpm --filter web exec tsc --noEmit` PASS; `pnpm --filter web build` PASS (2,277 modules, private media strip PASS); `git diff --check` PASS.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a smoke tÆ°Æ¡ng tÃ¡c cÃ³ audio + Whisper tháº­t trong browser Ä‘Äƒng nháº­p; cáº§n kiá»ƒm tra highlight, seek, Ä‘á»•i Part vÃ  manual override trÃªn dá»¯ liá»‡u thá»±c.
- Next session start prompt: smoke Listening practice cÃ³ Whisper segments trÃªn KET/PET/FCE/IELTS; xÃ¡c nháº­n segment highlight, question auto-scroll, seek vÃ  khÃ³a manual 3 giÃ¢y.
### Follow-up 2026-07-21 â€” Hiá»‡n nÃºt táº¡o segment timing cho transcript cÅ©

- Root cause transcript má»Ÿ ra nhÆ°ng khÃ´ng highlight: auto-question cÃ³ fallback theo tá»· lá»‡ duration nÃªn váº«n cháº¡y, cÃ²n transcript highlight báº¯t buá»™c cÃ³ Whisper segments. Transcript plain/catalog hoáº·c Whisper táº¡o trÆ°á»›c báº£n vÃ¡ chá»‰ cÃ³ text; Ä‘á»“ng thá»i UI cÅ© áº©n nÃºt Whisper khi `ttsText` Ä‘Ã£ Ä‘á»§, khiáº¿n khÃ´ng thá»ƒ táº¡o timestamps.
- Panel nay hiá»‡n `Táº¡o Ä‘á»“ng bá»™ transcript theo audio` báº¥t cá»© khi nÃ o Part cÃ³ audio URL nhÆ°ng chÆ°a cÃ³ segments, ká»ƒ cáº£ transcript text Ä‘Ã£ tá»“n táº¡i. Cháº¡y má»™t láº§n sáº½ ghi segment timing vÃ  báº­t highlight/auto-scroll.
- Regression test khÃ³a tráº¡ng thÃ¡i plain transcript + zero segments. Verify: scoped tests 5/5, TypeScript vÃ  `git diff --check` PASS.
## 2026-07-21 â€” Fix login bá»‹ cáº¯t trÃªn mÃ n hÃ¬nh MacBook tháº¥p

- Repro Chrome táº¡i `1024x640`: login card cao 697.5px nhÆ°ng `.login-page` fixed-height 640px váº«n `align-items: center`, Ä‘áº©y card lÃªn `y=-28.75px`; container khÃ´ng táº¡o vÃ¹ng scroll há»¯u dá»¥ng nÃªn Ä‘áº§u/cuá»‘i form bá»‹ cáº¯t.
- Breakpoint `max-height: 750px` nay dÃ¹ng `align-items: flex-start`. Card báº¯t Ä‘áº§u dÆ°á»›i padding á»Ÿ `y=12px`, login page cÃ³ vÃ¹ng cuá»™n 82px táº¡i 1024x640; 1280x720 giá»¯ card Ä‘áº§y Ä‘á»§ vÃ  chá»‰ cÃ³ 2px overflow.
- Verify trá»±c tiáº¿p Chrome DevTools táº¡i 1024x640 vÃ  1280x720; cuá»™n Ä‘Æ°á»£c tá»›i footer. TypeScript vÃ  `git diff --check` PASS.
- Next session start prompt: náº¿u cáº§n, smoke thÃªm tab ÄÄƒng kÃ½ táº¡i viewport tháº¥p vÃ¬ consent copy cÃ³ thá»ƒ lÃ m card cao hÆ¡n login.
## 2026-07-21 â€” Publish Whisper segment timestamps lÃªn cloud

- `ListeningPart` cÃ³ field `transcriptSegments`; dá»¯ liá»‡u náº±m trá»±c tiáº¿p trong JSON `listening_exam_published.parts`, khÃ´ng cáº§n migration.
- Pipeline publish hydrate cáº£ plain transcript vÃ  segment timing tá»« localStorage trÆ°á»›c khi strip/push. Segment cloud Ä‘Ã£ cÃ³ Ä‘Æ°á»£c Æ°u tiÃªn, khÃ´ng bá»‹ timing local cÅ© ghi Ä‘Ã¨.
- Transcript panel vÃ  `useAudioSync` Æ°u tiÃªn `part.transcriptSegments` tá»« cloud, chá»‰ fallback localStorage cho Ä‘á» local/Ä‘á» cÅ©. VÃ¬ váº­y Vercel khÃ´ng cáº§n cháº¡y Whisper khi user há»c.
- Äá» Ä‘Ã£ publish trÆ°á»›c Ä‘Ã¢y cáº§n Admin má»Ÿ tá»«ng Part, cháº¡y `Táº¡o Ä‘á»“ng bá»™ transcript theo audio`, rá»“i publish/re-publish Ä‘á» Ä‘á»ƒ timestamps lÃªn cloud.
- Verify: publish/runtime regression tests 8/8 PASS; TypeScript PASS; production build PASS (2,278 modules, strip private media PASS); `git diff --check` PASS.
- Lá»—i cÃ²n tá»“n táº¡i: chÆ°a re-publish dá»¯ liá»‡u production, nÃªn cÃ¡c Ä‘á» cloud hiá»‡n táº¡i chÆ°a tá»± cÃ³ segments cho tá»›i khi cháº¡y quy trÃ¬nh generation + publish.
- Next session start prompt: chá»n má»™t Listening exam, táº¡o timing cho má»i Part, re-publish, rá»“i smoke trÃªn domain production/khÃ¡c origin Ä‘á»ƒ xÃ¡c nháº­n khÃ´ng gá»i `/api/stt` nhÆ°ng highlight/scroll váº«n cháº¡y.

## 2026-07-21 â€” Lá»‡nh batch táº¡o segment timestamps cho 54 Ä‘á» KET

- ThÃªm lá»‡nh root `pnpm ket:segments -- --yes` Ä‘á»ƒ Claude cháº¡y má»™t láº§n cho toÃ n bá»™ KET A2 Listening Ä‘Ã£ publish. Script táº£i audio private tá»« `exam-media`, giá»¯ má»™t tiáº¿n trÃ¬nh `faster-whisper`/model duy nháº¥t, ghi `transcript` + `transcriptSegments` vÃ o `listening_exam_published.parts`, bá» qua Part Ä‘Ã£ cÃ³ timing vÃ  tiáº¿p tá»¥c bÃ¡o lá»—i theo tá»«ng Part.
- Lá»‡nh tá»± Ä‘á»c `.env.deploy`, láº¥y service role trá»±c tiáº¿p hoáº·c qua `SUPABASE_ACCESS_TOKEN`, Ä‘á»“ng thá»i tá»± tÃ¬m venv Whisper cÃ³ sáºµn táº¡i `C:\Users\lindv\whisper\.venv\Scripts\python.exe`. CÃ³ cÃ¡c tÃ¹y chá»n `--list-only`, `--force`, `--limit`, `--only`, `--model`, `--python`; má»i thao tÃ¡c ghi báº¯t buá»™c cÃ³ `--yes`.
- Read-only production check ban Ä‘áº§u xÃ¡c nháº­n Ä‘Ãºng 54 KET exams, má»—i Ä‘á» 5 Parts, tá»•ng 270 Parts vÃ  0/270 Parts cÃ³ timestamps.
- User Ä‘Ã£ cháº¡y batch ghi tháº­t thÃ nh cÃ´ng: `Done: 54/54 exams updated, 270 Parts timed, 0 Parts failed.`
- Caveat: 10 Ä‘á» Cam/Book cÅ© cÃ³ thá»ƒ dÃ¹ng má»™t file audio chung cho cáº£ 5 Parts. Batch tÃ¡i sá»­ dá»¥ng transcript/timestamps tuyá»‡t Ä‘á»‘i cá»§a file chung; highlight theo audio hoáº¡t Ä‘á»™ng, nhÆ°ng panel cÃ³ thá»ƒ hiá»‡n transcript toÃ n bÃ i vÃ  mapping cÃ¢u há»i chá»‰ gáº§n Ä‘Ãºng náº¿u Part khÃ´ng cÃ³ má»‘c pháº§n trÄƒm thá»i gian.
- Verify: CLI help PASS; Python compile PASS; venv `faster-whisper` 1.2.1 cÃ³ sáºµn; web TypeScript PASS; `git diff --check` PASS; production `--list-only` PASS.
- Lá»—i cÃ²n tá»“n táº¡i: cáº§n smoke production Ã­t nháº¥t má»™t Ä‘á» per-Part audio cÃ¹ng má»™t Ä‘á» shared-audio; xÃ¡c nháº­n transcript highlight/auto-scroll, seek, pause vÃ  khÃ³a thao tÃ¡c thá»§ cÃ´ng 3 giÃ¢y.
- Next session start prompt: smoke production Ä‘á» â€œKET A2_Test 2 - Luyá»‡n Nghe Tiáº¿ng Anh A2 CÃ³ Ä‘Ã¡p Ã¡n vÃ  dá»‹ch nghÄ©aâ€, sau Ä‘Ã³ kiá»ƒm tra thÃªm má»™t Ä‘á» KET practice dÃ¹ng audio riÃªng tá»«ng Part.

## 2026-07-21 â€” Production web release v0.2.10

- Bump `apps/web` tá»« 0.2.9 lÃªn 0.2.10 vÃ  deploy frontend auto-sync Listening, cloud transcript segments cÃ¹ng fix login viewport tháº¥p lÃªn Vercel production.
- 54/54 KET exams Ä‘Ã£ cÃ³ timestamps, tá»•ng 270 Parts, 0 Parts failed; khÃ´ng cháº¡y migration trong release nÃ y.
- Verify: Listening tests 8/8 PASS; TypeScript PASS; security release check 9/9 PASS; local production build PASS (2.278 modules, private media strip PASS); Vercel build READY.
- Deployment `dpl_FRUibDr8KSK2Socb9n5WGej98seM` READY; alias chÃ­nh `https://ryanenglishv2.vercel.app` Ä‘Ã£ cáº­p nháº­t.
- Next session start prompt: smoke authenticated production Ä‘á» KET A2_Test 2 vÃ  má»™t KET practice; xÃ¡c nháº­n transcript highlight/auto-scroll, seek, pause vÃ  manual override 3 giÃ¢y.

## 2026-07-21 â€” Fix auto-sync cho Cambridge shared audio

- Root cause Cam 1 Test 3 khÃ´ng tá»± chuyá»ƒn cÃ¢u/Part: `useAudioSync` chá»‰ map audio vÃ o cÃ¢u cá»§a `currentPart`, trong khi 10 Ä‘á» KET Book 1 Test 1 Ä‘áº¿n Book 3 Test 2 dÃ¹ng má»™t MP3 chung, khÃ´ng cÃ³ `audioStartPct/audioEndPct`.
- Hook chung nay tá»± nháº­n dáº¡ng theo cáº¥u trÃºc dá»¯ liá»‡u: má»i Part cÃ¹ng nguá»“n audio vÃ  khÃ´ng cÃ³ range thÃ¬ sync trÃªn toÃ n bá»™ cÃ¢u, Ä‘á»“ng thá»i Ä‘á»•i `partIndex`; audio riÃªng tá»«ng Part hoáº·c shared audio cÃ³ range tiáº¿p tá»¥c sync trong Part hiá»‡n táº¡i.
- Ãp dá»¥ng chung cho runner KET, PET, FCE/CAE/CPE vÃ  IELTS, nÃªn cÃ¡c láº§n import Cambridge A2-C2 sau tá»± há»— trá»£ cáº£ kiá»ƒu má»™t audio láº«n nhiá»u audio, khÃ´ng hardcode ID/Cam.
- Audit production: `ket shared-unbounded = 10`, `ket per-part = 44`, `cae per-part = 1`; 10 shared gá»“m Book 1 Test 1â€“4, Book 2 Test 1â€“4 vÃ  Book 3 Test 1â€“2.
- Regression tests bao phá»§ shared-unbounded, per-Part vÃ  shared-ranged. Verify: Listening tests 11/11 PASS; TypeScript PASS; `git diff --check` PASS.
- Bump web lÃªn v0.2.11; security check 9/9 vÃ  production build PASS. Deployment `dpl_8CBUerMTo2Ak559uiHLfiGFFgVB5` READY, alias `https://ryanenglishv2.vercel.app` Ä‘Ã£ cáº­p nháº­t.
- Next session start prompt: smoke production Cam 1 Test 3 xuyÃªn ranh giá»›i Part 1â†’2 vÃ  má»™t KET practice per-Part audio.

## 2026-07-24 â€” Fix admin SPA performance route tracking

- Added admin-gated `useAdminPerformanceTracking` in `AppShell`; one shared observer set survives React StrictMode remounts without duplicate active observers.
- `adminPerformance.ts` now splits SPA visits by `performance.now()` route windows and attributes delayed CLS, INP, long-task, and resource entries by `entry.startTime`; pre-session entries are filtered.
- Route JSON now includes `lcpMs`, `fcpMs`, `cls`, and `inpMs`. The first route keeps true hard-navigation FCP/LCP; later FCP is null and LCP remains an explicitly documented soft-navigation proxy.
- LCP, layout-shift, longtask, and event observers use `buffered: true`; Event Timing uses `durationThreshold: 16`.
- New integration/regression tests: 7/7 PASS. Full web suite: 195/197 PASS; two unrelated baseline assertions remain stale (`SIGN_TTL_SEC` expects 60 vs current 1,800; Cambridge catalog expects 47 vs current 48). TypeScript and production build PASS.
- Baseline A/B confirmed by stashing every Phase 3 file and rerunning only those two tests on the old code: both failed identically (TTL expected 60 vs 1,800; catalog expected 47 vs 48). They predate and are independent of the performance-tool fix; review them as separate maintenance issues.
- Local authenticated Playwright smoke: 12 visits / 11 unique paths, all durations about 3.5â€“3.7 s; clipboard JSON and route-table screenshot captured. Production deployment `dpl_8gAmhPLgMY9JqzLhS6jyDxQMX4SZ` is READY and aliased to `https://ryanenglishv2.vercel.app`. Authenticated production hard-reload smoke confirmed 6 separate visits / 5 unique paths (`admin â†’ home â†’ vocab â†’ writing â†’ listening â†’ admin`), with independent 4.2â€“7.1 s durations instead of cumulative timing; production screenshot captured at `artifacts/admin-performance-routes-production.png`.

## 2026-07-24 â€” Vocab TBT optimization Task 1: lazy versioned seed

- `/app/vocab` now reads the existing Dexie `settings` key `preset_vocab_cards_version` before importing preset data. Browsers already at seed version 5 skip the 6.4 MB decoded `vocabSeedDecks` bundle and all routine seed/dedupe work.
- The version/key live in lightweight `vocabSeedVersion.ts`; stale or missing versions dynamically load `vocabSeedDecks`, complete seeding, then persist version 5. No new object store or Dexie schema bump was needed.
- Regression tests cover current, stale, and failed seed states: 3/3 PASS. TypeScript and production build PASS; output keeps `VocabularyPage` (~114 KB) separate from `vocabSeedDecks` (~6.4 MB).
- Full web suite: 198/200 PASS. The same two pre-existing failures remain: signed URL TTL expects 60 vs current 1,800, and Cambridge catalog expects 47 vs current 48.
- No deployment was made for Task 1 alone. Next step: Task 2, merge `reviseDueCount` and deck stats into one IndexedDB query/aggregation.

## 2026-07-24 â€” Vocab TBT optimization Task 2: merged deck aggregates

- Added `useDeckAggregates`: one `liveQuery` owner in `VocabularyPage` reads `cards` and `srs` together, caches the raw snapshot in a ref, and builds one `Map<deckId, { total, mastered, dueCount }>` for the active Single/Phrases unit kind.
- Removed the independent `reviseDueCount` full-table query and `DeckGrid.useDeckUnitStats`. `VocabularyPage` now derives total due count from the shared map and passes the same map to `DeckGrid`.
- Regular React rerenders, filter changes, 15-second due-clock updates, and Single/Phrases changes aggregate the cached snapshot in memory; IndexedDB re-runs only when Dexie observes an actual cards/SRS mutation.
- Semantics remain unchanged: mastered is `reps >= 3`; due uses `isSrsReviewDue`, so new unreviewed cards do not count. Regression tests verify the aggregate and that unit changes do not issue another query: 2/2 PASS.
- Full web suite: 200/202 PASS with only the two known baseline failures. TypeScript and production build PASS. Local authenticated smoke: 161 decks, 162 rendered cards on All, 27 on IELTS, representative preset deck shows 100 single words and 100 phrases, Revise due is 0 for the local all-new dataset, and no console errors.
- No deployment was made for Task 2 alone. Next step: Task 3, add `content-visibility: auto` mitigation.

## 2026-07-24 â€” Vocab TBT optimization Task 3: virtualized deck grid

- Added `@tanstack/react-virtual` and replaced the 162-card eager DOM grid with a measured virtual grid. It keeps the existing one-column mobile / two-column desktop layout, uses the existing `.vocab-library-page` scroll owner, five-item overscan, and dynamic card measurements.
- Removed `unitKind` from the `DeckGrid` React key; the repair-only `gridKey` remains. Switching Single words/Phrases now preserves the grid instance instead of deleting and remounting every card.
- `DeckCard` is memoized and receives stable select/delete handlers. Virtual item wrappers also use `content-visibility: auto` with a 184px intrinsic fallback.
- Production build PASS. Full web suite remains 200/202 PASS with only the two confirmed baseline failures (signed URL TTL assertion and Cambridge catalog count).
- Authenticated local Playwright smoke: All still reports 161 decks, while only 17 cards are mounted at a time; bottom index 161 renders without blank space, IELTS reports 26 decks and resets to index 0, tab changes preserve the same grid DOM node, and deck detail navigation works without console errors.
- Internal Admin performance session for `/app/vocab` (9.24s with full scroll, IELTS/All, Single/Phrases, and deck-detail interactions): one long task, `longTaskTotalMs=58`, `maxLongTaskMs=58`, `inpMs=64`, below the requested 150ms target.
- No deployment was made for Task 3 alone.

## 2026-07-24 â€” Vocab TBT optimization Task 4: preview verification

- Task 4 verification/report commit: `8ef8aa8` (documentation only; no application code changed).
- Verified branch HEAD `fff751f` with the three optimization commits `ec3082c`, `01081ca`, and `fff751f`. Final preview deployment `dpl_2322TaJke4fFELH8nBiRMkPvwFDU` is READY at `https://ryanenglishv2-56lvwfgh6-ryanenglish.vercel.app`.
- Deployment Protection remained enabled. QA used the configured Vercel automation bypass; no protection setting was disabled.
- Preview initially rendered a blank page because `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` existed only for Production. Both public Vite runtime values were added to the Preview environment, then the same source deployment was rebuilt successfully. No backend secret was copied.
- Lighthouse 12.8.2 desktop results: `/app/vocab` score 99 / TBT 69 ms; `/app/reading-corner` 97 / 26 ms; `/app/listening` 99 / 30 ms; `/app/shadowing` 99 / 55 ms; `/app/sentence-structure` 100 / 77 ms; `/app/writing` 99 / 21 ms. All desktop app-route targets pass. The anonymous landing run used Lighthouse mobile and scored 94 with TBT 9 ms, passing the 50 ms target.
- The pre-optimization `/app/vocab` Lighthouse baseline was TBT 242 ms; preview desktop is 69 ms, a 173 ms / 71% reduction.
- Mobile Lighthouse diagnostics remain above the requested gates: vocab 87 / 500 ms, reading 74 / 798 ms, listening 62 / 16,567 ms, shadowing 61 / 22,922 ms, sentence structure 91 / 215 ms, and writing 87 / 334 ms. These are recorded as a release warning rather than hidden behind the passing desktop preset.
- The requested aliases `/app/reading` and `/app/grammar` do not exist in the router. Verification used their actual sidebar destinations `/app/reading-corner` and `/app/sentence-structure`; directly requesting the aliases falls through the wildcard redirect.
- Preview functional smoke PASS: All reports 161 decks; only 17 cards mount on desktop and 9 on mobile; layout is two columns desktop and one column mobile; bottom virtual index 161 renders without blank space; filters/tabs do not crash; deck detail opens correctly; console/page errors are zero. Optional back-state persistence is not implemented: returning from detail resets IELTS to All.
- Admin baseline was 6 Long Tasks / 559 ms total / 122 ms max. Preview runs were 4 / 289 ms with extra detail and viewport interactions, 3 / 246 ms with the strict protocol, and best warm gradual-scroll run 2 / 173 ms / 118 ms max with INP 64 ms. Count and INP pass, but the best total remains 23 ms above the 150 ms gate.
- Preview promotion was initially withheld because the first acceptance gate was not met. The user then explicitly accepted up to 200 ms Admin long-task total and requested immediate production deployment.
- Final production HEAD includes follow-up `a07a812` (`fix: reduce vocab card shadow offset, fix grid gap, fix virtual list width`). Deployment `dpl_E1z8baUYTowNmkKhBXtFTPSwzYKa` is READY and aliased to `https://ryanenglishv2.vercel.app`.
- Authenticated production verification: virtual grid is active, only 15 cards mount in the measured desktop viewport, the `a07a812` 1.6 px shadow is present, and console/page errors are zero.
- Final production Admin session on `/app/vocab` ran 15.01 seconds with gradual full-list scrolling plus IELTS/All and Single/Phrases changes: `longTaskCount=1`, `longTaskTotalMs=58`, `maxLongTaskMs=58`, and `inpMs=48`. This is below the accepted 200 ms limit, so the vocab optimization task is closed.




- Update 2026-07-27: `apps/web/src/pages/WritingCambridgeTaskPage.tsx` dã tách riêng shell `b1` d? bám ?nh crawl `D:\App-English-Ryan\Crawl\Writing_Crawl\B1\Question_1..3.png`; không còn render `WritingEditor` chung cho `b1` route.
- Update 2026-07-27: route /app/writing/cambridge/b1/b1-test-01/b1-test-01-task-01 da vao exam full-page mode trong AppShell (an sidebar trai, mobile drawer, Dictionary FAB).
- Update 2026-07-27: B1 Writing task da doi sang KetRwSplitPane de dung thanh chia keo duoc nhu PET/KET Reading; vi tri split duoc luu theo task qua splitStorageKey.
- Update 2026-07-27: WritingLayout da dung overflow-hidden cho Cambridge flow va shell B1 da them height 100% + position relative de chiem tron khung bai thi.
- Update 2026-07-27: them flow Admin import anh prompt cho Cambridge Writing trong tab Publish noi dung. Admin co the chon level/test/task va upload anh, luu vao WritingDoc rieng voi sourceMeta.docRole='prompt_seed'.
- Update 2026-07-27: WritingCambridgeTaskPage uu tien render promptImage cua prompt_seed neu co, trong khi bai viet user dung docRole='user_answer' de tranh ghi de vao prompt admin.
- Update 2026-07-27: mo route A2 trong Cambridge Writing library/test/task pages bang `cambridgeWritingRouteCatalog.ts`; `/app/writing/cambridge/a2` nay dung 1 test seed tu `reading-ket-a2-book4-test2.json`.
- Update 2026-07-27: `WritingCambridgeTaskPage.tsx` da them shell A2 reuse layout KET Writing Part 6/7 (split email + story pictures), van giu flow prompt_seed/user_answer hien co.
- Update 2026-07-27: verify `pnpm --filter web exec -- tsc --noEmit` PASS sau khi noi route A2.
- Update 2026-07-27: `AdminWritingPromptImagePanel.tsx` da chuyen tu seed catalog sang route catalog, nen A2 Writing nay import prompt image chung flow voi B1/B2/C1/C2; mac dinh mo san test/task A2 dau tien.
- Update 2026-07-27: verify `pnpm --filter web exec -- tsc --noEmit` PASS sau khi mo A2 trong admin import image flow.
- Update 2026-07-27: `ExamTrackPage.tsx` da bat card Writing cho Cambridge A2 bang cach mo cung dieu kien voi B1-C2; `/app/exam/track/cambridge/a2` nay hien Writing card va dieu huong sang `/app/writing/cambridge/a2`.
- Update 2026-07-27: verify `pnpm --filter web exec -- tsc --noEmit` PASS sau khi mo Writing card cho A2 track page.
- Update 2026-07-27: da hop nhat schema/catalog Cambridge Writing A2-C2. `packages/catalog/src/cambridge/writing/schema.ts` nay chap nhan level `a2`, exam `KET`, test status/version va metadata KET task; `seedData.ts` da dua `ket-a2-book4-test2` vao `CAMBRIDGE_WRITING_COLLECTION_MAP` chung.
- Update 2026-07-27: da bo hard-code A2 trong `apps/web/src/features/writing/cambridgeWritingRouteCatalog.ts`; route level/test/task pages nay doc A2 qua seed catalog chung nhu B1-C2. `pnpm --filter web exec -- tsc --noEmit` PASS sau buoc nen nay.
- Update 2026-07-27: da them table Dexie `cambridgeWritingTests` o `packages/db/src/local/schema.ts` (version moi: v18) + local repo `packages/db/src/local/repositories/cambridgeWritingTestRepo.ts` cho Cambridge Writing admin/published records. `RyanDB` nay nhan optional db name de test migration.
- Update 2026-07-27: da them merged repo app-layer `apps/web/src/features/writing/cambridgeWritingTestRepo.ts` merge precedence `seed < published_sync < admin_local`, bao loi payload invalid qua `errors[]`, va chua cham UI level/test/task pages.
- Update 2026-07-27: test moi PASS: `packages/db/src/local/schema.test.ts`, `packages/db/src/local/clearLocalUserData.test.ts`, `packages/db/src/local/repositories/cambridgeWritingTestRepo.test.ts`, `apps/web/src/features/writing/cambridgeWritingTestRepo.test.ts`.
- Update 2026-07-27: verify `pnpm --filter web exec -- tsc --noEmit` PASS; `pnpm --filter @ryan/db test` PASS. `pnpm test` van FAIL do baseline/cu: `src/security/phase2Hardening.test.ts` (SIGN_TTL 60 vs code 1800), `src/features/exam/__tests__/catalogCamReading.test.ts` (expect 47 seeded exams, actual 48), va e2e Playwright specs bi Vitest pick len.
- Update 2026-07-27: da chuyen 3 page Cambridge Writing sang merged repo/hooks. `apps/web/src/features/writing/useCambridgeWritingTests.ts` nay co `useCambridgeWritingCollection(level)`, `useCambridgeWritingTest(level, testId)`, `useCambridgeWritingTask(level, testId, taskId)` dung `useLiveQuery` va tu dong `includeDrafts` khi `useIsAdmin() === true`.
- Update 2026-07-27: `apps/web/src/pages/WritingCambridgeLevelPage.tsx` da bo static `getCambridgeRouteCollection` + `getCambridgeRouteManifest`; count/task count tinh tu merged tests, co loading/empty/error state, admin thay warning payload invalid, user chi thay thong diep cap nhat noi dung.
- Update 2026-07-27: `apps/web/src/pages/WritingCambridgeTestPage.tsx` da bo static `getCambridgeRouteTest`; phan biet loading / not found / loaded bang merged repo, draft admin mo duoc, user thuong khong thay draft.
- Update 2026-07-27: `apps/web/src/pages/WritingCambridgeTaskPage.tsx` da bo static `getCambridgeRouteTest/getCambridgeRouteTask`; task/doc flow dung merged hook. Lookup `WritingDoc` va auto-create nay khoa theo `examFamily=cambridge`, `level`, `testId`, `taskId`, `sourcePromptId=taskId`. Da chan root cause tao duplicate `WritingDoc` bang exact-identity lookup truoc khi `createDoc()`.
- Update 2026-07-27: them test `apps/web/src/features/writing/useCambridgeWritingTests.test.tsx` va `apps/web/src/features/writing/cambridgeWritingPages.test.tsx` cover hook/page flow seed -> local draft -> task, draft admin/user visibility, archived hide, invalid payload safe, no redirect during loading, no duplicate WritingDoc, two-pane B1 khong regress.
- Update 2026-07-27: verify PASS `pnpm --filter web exec -- tsc --noEmit`, PASS `pnpm --filter web test -- src/features/writing` (17 tests), PASS `pnpm --filter @ryan/db test`.
- Update 2026-07-27: baseline khong lien quan van giu nguyen, chua sua trong luot nay: `src/security/phase2Hardening.test.ts` expect SIGN_TTL 60 vs code 1800, `src/features/exam/__tests__/catalogCamReading.test.ts` expect 47 vs actual 48, va khong dong vao e2e Playwright discovery ngoai scope feature Writing.
- Update 2026-07-27: hoan tat task6 Cambridge Writing admin local-draft flow cho level pages A2-C2. `WritingCambridgeLevelPage.tsx` nay co nut `Tao de moi` chi hien cho admin; draft card cho phep open/edit, user thuong khong thay thao tac quan tri.
- Update 2026-07-27: them bo admin editor trong `apps/web/src/features/writing/admin/` gom schema helper, mapper, dialog, test form, task editor, card preview va CSS rieng. Admin co the tao/sua test, them/xoa/nhan ban/sap xep task, preview card va luu local draft qua `cambridgeWritingTestRepo` ma khong tao `writingDocs`.
- Update 2026-07-27: `cambridgeWritingTestRepo.ts` va `useCambridgeWritingTests.ts` da mo rong merged metadata (`items`, `item`, `origin`, `editable`, `recordId`) de UI level/test/task va admin editor dung chung seed + published_sync + admin_local.
- Update 2026-07-27: `CambridgeWritingTestCard.tsx` duoc tach thanh `cb-card-main` + `cb-card-actions`, ho tro `interactive`, `preview`, badge draft va nut `Chinh sua` cho local draft, tranh nested interactive bug.
- Update 2026-07-27: test moi PASS cho admin flow va mapper: `apps/web/src/features/writing/admin/cambridgeWritingFormMapper.test.ts`, `apps/web/src/features/writing/admin/cambridgeWritingAdmin.test.tsx`. Admin integration test da xac nhan create local draft, route test/task mo duoc, edit giu nguyen ID/URL, va khong tao `writingDocs` som.
- Update 2026-07-27: verify PASS `pnpm --filter web test -- src/features/writing` (23 tests), PASS `pnpm --filter web exec -- tsc --noEmit`, PASS `pnpm --filter @ryan/db test`. Baseline ngoai scope van giu nguyen: `src/security/phase2Hardening.test.ts` SIGN_TTL 60 vs 1800, `src/features/exam/__tests__/catalogCamReading.test.ts` 47 vs 48, va khong dong vao Playwright e2e discovery.
- Update 2026-07-27: hoan tat task7 cho Cambridge Writing copy/Unicode. Da tao `apps/web/src/features/writing/cambridgeWritingCopy.ts` lam nguon copy chung cho hub, level, test, task, card va admin flow; loai bo tinh trang chuoi khong dau/Anh-Viet bi rach rac trong UI.
- Update 2026-07-27: `WritingCambridgePage.tsx`, `WritingCambridgeLevelPage.tsx`, `WritingCambridgeTestPage.tsx`, `WritingCambridgeTaskPage.tsx`, `CambridgeWritingTestCard.tsx` va bo admin editor da duoc doi sang copy co dau tieng Viet dung, gom ca loading/empty/not-found/draft labels.
- Update 2026-07-27: them `CambridgeWritingAdminGuideDialog.tsx` va nut `Huong dan tao de` o level pages A2-C2 cho admin. Dialog huong dan 5 buoc va canh bao ban nhap chi luu tren trinh duyet hien tai, chua publish cho hoc vien.
- Update 2026-07-27: `CambridgeWritingCreateButton.tsx` nay render ca 2 action admin (`Huong dan tao de`, `Tao de moi`) va CSS `cambridgeWritingAdmin.css` duoc mo rong cho `cb-level-actions`, guide dialog, guide warning.
- Update 2026-07-27: regression tests duoc cap nhat de assert chuoi Unicode that: `apps/web/src/features/writing/cambridgeWritingPages.test.tsx` va `apps/web/src/features/writing/admin/cambridgeWritingAdmin.test.tsx` nay check `Dang tai thu vien Writing`, `Tim theo ten de hoac dang bai`, `Tao de moi`, `Huong dan tao de`, `Luu ban nhap`, `Ban nhap`... thay vi chi test render chung chung.
- Update 2026-07-27: verify PASS `pnpm --filter web test -- src/features/writing` (23 tests), PASS `pnpm --filter web exec -- tsc --noEmit`, PASS `pnpm --filter @ryan/db test`. Baseline ngoai scope van giu nguyen: `src/security/phase2Hardening.test.ts` SIGN_TTL 60 vs 1800, `src/features/exam/__tests__/catalogCamReading.test.ts` 47 vs 48, va khong dong vao Playwright e2e discovery.

- Update 2026-07-27: bat dau task8 Cambridge Writing advanced exam shell cho B2/C1/C2. Da mo rong schema `packages/catalog/src/cambridge/writing/schema.ts` voi `promptBlocks` + `presentation`, va seed B2/C1/C2 trong `seedData.ts` da duoc chuan hoa theo block renderer (notes / announcement / email / opinions / source-texts).
- Update 2026-07-27: them bo component chung `apps/web/src/features/writing/exam/` gom `CambridgeAdvancedWritingTaskView.tsx`, `CambridgeWritingPromptRenderer.tsx`, `cambridgeWritingExamUiConfig.ts`, `useCambridgeWritingQuestionSelection.ts`, `cambridgeAdvancedWritingExam.css`. View moi giu split 50/50, resizer, footer part tabs, selector Undecided/Yes/No cho Part 2, va luu selection theo key `cambridge-writing-selection:{level}:{testId}`.
- Update 2026-07-27: `apps/web/src/pages/WritingCambridgeTaskPage.tsx` da route B2/C1/C2 sang advanced shell chung, trong khi A2/B1 giu nguyen flow hien tai. Answer van save vao `writingDocs` co san, khong tao route rieng cho B2/C1/C2.
- Update 2026-07-27: admin mapper da duoc gia co de khong lam roi `promptBlocks` / `presentation` khi mo draft va luu lai (`cambridgeWritingFormSchema.ts`, `cambridgeWritingFormMapper.ts`, `CambridgeWritingTestEditorDialog.tsx`).
- Update 2026-07-27: verify PASS `pnpm --filter web exec tsc --noEmit`. Test mapper moi PASS. Cac test writing/component/integration moi dang bi harness timeout khi chay Vitest, can dieu tra tiep o session sau.


