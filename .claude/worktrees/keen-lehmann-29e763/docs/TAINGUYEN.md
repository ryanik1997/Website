# Tainguyen — nguồn đề (ngoài deploy)

## Mục tiêu

- **`Tainguyen/`** = file gốc (PDF, ZIP, MP3 thô, script import) — **nặng**, không cần trên Vercel.
- **`apps/web/public/catalog/`** = media đã build (MP3/ảnh cho user) — **vẫn nằm trong project** / prebuilt.
- **`packages/catalog/data/`** = JSON exam đã xử lý cho bundle catalog.

Deploy chỉ cần catalog đã build; **không** upload `Tainguyen` (~1–2 GB).

## Path mặc định

1. Biến môi trường **`TAINGUYEN_PATH`** (hoặc `TAINGUYEN_DIR`)
2. Nếu không set: **`<repo>/Tainguyen`** (folder thật hoặc **junction** Windows)

## Move ra ngoài repo (khuyến nghị)

```powershell
# 1) Move (ví dụ)
Move-Item "D:\App-English-Ryan\Website\Tainguyen" "D:\App-English-Ryan\Tainguyen"

# 2) Junction — script local vẫn dùng Website\Tainguyen
cd D:\App-English-Ryan\Website
cmd /c mklink /J Tainguyen D:\App-English-Ryan\Tainguyen
```

Hoặc không junction, chỉ set env (User/System hoặc `.env` local — không commit):

```powershell
$env:TAINGUYEN_PATH = "D:\App-English-Ryan\Tainguyen"
pnpm build:catalog
```

## Build

| Lệnh | Khi nào |
|------|---------|
| `pnpm build:catalog` | Local sau khi sửa đề trong Tainguyen |
| `node scripts/build-catalog.mjs --if-present` | CI/Vercel: **bỏ qua** nếu không có Tainguyen, dùng catalog đã commit |
| `pnpm build` | Local: catalog full + web |

`vercel.json` đã dùng `--if-present`. `.vercelignore` loại `Tainguyen/`.

## Git

- `.gitignore` có `Tainguyen/` — không commit nguồn thô mới.
- **Giữ** `apps/web/public/catalog` (và `packages/catalog/data`) khi đổi đề + deploy.

## Lưu ý

- Deploy vẫn có thể lâu nếu **`public/catalog` ~800MB+** (audio IELTS). Bước tiếp: CDN/Storage cho MP3.
- Script pack/publish (`pack:listening`, `ielts:publish-media`, …) dùng `resolveTainguyenPath()` — cần junction hoặc `TAINGUYEN_PATH`.
