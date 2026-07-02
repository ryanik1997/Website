# @ryan/catalog — Nội dung global (ship cùng deploy)

Mọi user nhận cùng nội dung sau khi admin deploy. Không cần import thủ công từng máy.

## Cập nhật đề Luyện thi (Reading / Listening)

1. Sửa bundle trong `Tainguyen/{ket-reading-test1,...}/exam.json` (+ media)
2. Chạy `pnpm build:catalog` — copy media → `apps/web/public/catalog/`, sinh JSON → `packages/catalog/data/`
3. Bump `GLOBAL_CATALOG_VERSION` trong `src/manifest.ts` (nếu đổi Dexie seeds)
4. `pnpm deploy:prod`

Đề exam builtin: ID `catalog-reading-*`, `catalog-listening-*` — tự có trong `READING_EXAMS` / `LISTENING_EXAMS`.

## Cập nhật module Dexie (Cấu trúc câu, Vocab, …)

1. Sửa seed trong `src/seeds/`
2. Đăng ký trong `syncGlobalCatalog.ts`
3. Bump `GLOBAL_CATALOG_VERSION`
4. Deploy

User mở app → `GlobalCatalogSync` upsert bản mới.

## Thêm bundle mới

Thêm entry vào `scripts/build-catalog.mjs` → `BUNDLES[]`, chạy `build:catalog`.