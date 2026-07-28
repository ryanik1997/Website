# READING PIPELINE — Bước 0 xác minh

Nhánh: `feat/fix-reading-layout` (base: `feat/import-cam-reading`).

## 1. Vị trí file source (đã xác minh bằng Glob/Grep)

- `apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingAiNormalize.ts`
- `apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingPartTemplates.ts`
- `apps/web/src/features/exam/ieltsReadingWizard/ieltsReadingTemplateCatalog.ts`
- `apps/web/src/features/exam/readingNoteTableUtils.ts`

## 2. Chữ ký (signature) các hàm pipeline

### ieltsReadingAiNormalize.ts

- `export function normalizeAiReadingPart(part: ReadingImportPartJson): ReadingImportPartJson` — line 209. Pure (không import DOM/Dexie/fetch — chỉ import type + reorderPartGroupsToTemplate).
- `export function alignQuestionGroupsToTemplate(part: ReadingImportPartJson, templatePart: ReadingImportPartJson): ReadingImportPartJson` — line 402.
- `export function forceTemplateSummaryWordBanks(part, templatePart): ReadingImportPartJson` — line 461.
- `export function forceTemplateHybridGroups(part, templatePart): ReadingImportPartJson` — line 562.
- `export function applyReadingTemplateTableStructure(part, templatePart): ReadingImportPartJson` — line 849. **Đây là wrapper cuối** — nội bộ nó gọi align → hybrid → mergeTemplateNotePassages → mergeTemplateNoteTables → forceTemplateTablesByIndex → rematerializeReadingTableGroups → cleanup + finalize.
- `export function validateAiReadingPartAgainstTemplate(...)` — line 981.

⚠️ **Phát hiện lệch spec:** `mergeTemplateNotePassages` (line 357) **KHÔNG được export**. Nó là hàm nội bộ của `applyReadingTemplateTableStructure`. Không thể gọi riêng từ script ngoài mà không sửa source.

→ Khuyến nghị: dùng `applyReadingTemplateTableStructure` làm entry điểm — nó đã compose toàn bộ pipeline (bao gồm mergeTemplateNotePassages, forceTemplateHybridGroups, và các bước table). Nếu cần thêm `forceTemplateSummaryWordBanks` (word bank cho summary) thì chạy nó **trước** applyReadingTemplateTableStructure vì wrapper hiện không gọi nó.

### readingNoteTableUtils.ts

- `export function validateReadingNoteTable(table: ReadingNoteTable | undefined, ...): string[]` — line 270 (trả mảng cảnh báo).
- `mergeTemplateNoteTables`, `forceTemplateTablesByIndex`, `rematerializeReadingTableGroups`, `normalizeReadingImportNoteTables` — tất cả pure.

### ieltsReadingPartTemplates.ts

- `export function resolveReadingTemplateKind(passageNumber: IeltsReadingPassageNumber, kind: string): IeltsReadingWizardTemplateKind` — line 9149 (tồn tại 2 chỗ: file này + file catalog line 563).
- `export function getIeltsReadingWizardTemplatePart(passageNumber, kind): ReadingImportPartJson` — line 9166 (builder trả template part).

## 3. Purity

- Grep `window|dexie|indexedDB|fetch(|document.` trên cả 3 file → 0 hit.
- Import chỉ là types + module nội bộ khác trong `../` và `./`. Không đụng browser API.
- ✅ An toàn để chạy từ Node/tsx.

## 4. ⚠️ Sai giả định trong task spec — cần user xác nhận trước khi làm Bước 2

Task spec nói: "ghép displayType 3 group → `resolveReadingTemplateKind` → template kind".

**Thực tế:** `resolveReadingTemplateKind(passageNumber, kind: string)` chỉ nhận template-kind STRING (như `'p1-r1-tfng-mc'`, `'p1-r1n-notes-tfng'`, `'p2-r2hmc-headings-summary-mc'`) và kiểm tra kind đó có nằm trong catalog không. Nó **KHÔNG** map từ displayType triplet.

→ Bước 2 phải viết **thêm** bảng mapping mới (`displayType-triplet → template-kind`) — logic MỚI chứ không phải "gọi hàm sẵn có". Có 3 lựa chọn:

- **A.** Viết mapping table thủ công trong `scripts/reading/detect-template.mjs` (heuristic: {tfng,summary-completion,multiple-choice} → `p1-r1-...`).
- **B.** Duyệt tất cả template builder trong catalog, chạy mỗi builder → lấy triplet displayType từ output → xây reverse-index (khớp đúng thứ tự group). Đây là "dùng source thật, không đoán" nhưng cần chạy 60+ builder.
- **C.** Bỏ template-kind resolution — fallback "normalize-only" cho toàn bộ 47 đề, chỉ dùng `normalizeAiReadingPart` (không align template). Layout sẽ tốt hơn adapter cũ nhưng không đảm bảo khớp bản mẫu.

**Yêu cầu quyết định từ user trước khi tiếp Bước 2–5.**

## 5. Trạng thái commit

- Branch: `feat/fix-reading-layout` — tạo xong.
- File này: sẽ commit như commit "step0: pipeline signature confirm".
