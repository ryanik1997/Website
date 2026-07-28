# AGENTS.md — Ryan English Website

## ⚠️ Đọc trước khi làm bất cứ điều gì

**Đọc `session_summary.md` ngay khi bắt đầu session.**

```
Read: session_summary.md
```

**Sau mỗi bản vá / tính năng hoàn chỉnh**, cập nhật `session_summary.md`:
- Mục "Việc đã hoàn thành" → thêm việc mới
- Mục "Lỗi còn tồn tại" → bỏ lỗi đã fix, thêm lỗi mới
- Mục "Next session start prompt" → cập nhật context mới nhất

---

## Commands

```bash
pnpm dev              # Chạy apps/web tại http://localhost:5173
pnpm build            # Build production
pnpm --filter web exec tsc --noEmit   # Type check
pnpm install --ignore-scripts         # Cài packages (tránh lỗi esbuild hook)

# Deploy production (migrations → build → Vercel)
copy .env.deploy.example .env.deploy    # điền SUPABASE_ACCESS_TOKEN + DB password
pnpm db:push                          # chỉ push SQL migrations (1 lần / release)
pnpm deploy:prod                      # db:push + vercel deploy --prod

# Nguồn đề (Tainguyen) — ngoài repo / junction; xem docs/TAINGUYEN.md
# pnpm build:catalog                  # local khi sửa đề (cần Tainguyen hoặc TAINGUYEN_PATH)
# node scripts/build-catalog.mjs --if-present   # Vercel: skip nếu không có Tainguyen
```

---

## Architecture tóm tắt

- `apps/web/` — Vite + React app, route `/` (landing) và `/app/*` (protected)
- `packages/core/` — Logic thuần TS: SRS scheduler, license plans (không import DOM/React)
- `packages/db/` — Dexie schema (14 bảng) + sync Supabase
- `packages/ui/` — Shared components (Button, Card)
- `supabase/migrations/` — SQL schema đã chạy

## Rules

1. **Đọc `session_summary.md` trước** — không bỏ qua
2. **Dùng CSS variables** cho màu sắc (`--bg-primary`, `--text-primary`, `--color-primary`...) — 3 theme light/mid/dark
3. **Không hardcode màu** (`#fff`, `#000`) — dùng biến
4. **Bump version** trong package.json khi release
5. **Cập nhật session_summary.md** sau mỗi session

---

## Agent skills

### Issue tracker

GitHub Issues (`ryanik1997/Website`) via `gh` CLI. External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) — no aliases. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` at repo root (created lazily by `/domain-modeling` when needed). See `docs/agents/domain.md`.
