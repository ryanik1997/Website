---
name: run-web
description: Build, run, start, screenshot, and drive the Ryan English web app (apps/web). Use when asked to start the dev server, take a screenshot, run tests, or interact with the running UI.
---

Ryan English web app — Vite + React + TypeScript + Playwright. Drive it by starting the dev server then running the Playwright driver at `.claude/skills/run-web/driver.mjs`.

All paths below are relative to `apps/web/` (or repo root where noted).

## Prerequisites

```bash
# Node 24 + pnpm (already present)
node --version   # v24.18.0
pnpm --version   # 9.15.0

# Playwright Chromium (one-time)
cd /path/to/repo/root
npx playwright install chromium    # downloads ~88 MiB to ~/.cache/ms-playwright/
```

## Setup

```bash
cd /path/to/repo/root
pnpm install --ignore-scripts
```

## Run (agent path)

### 1. Start the dev server

```bash
cd /path/to/repo/root
pnpm --filter web dev &
# Poll until ready (usually <3s)
for i in $(seq 1 30); do
  if curl -sf http://localhost:5173 >/dev/null 2>&1; then
    echo "Server ready after ${i}s"
    break
  fi
  sleep 1
done
```

Serves at `http://localhost:5173`.

### 2. Run the Playwright driver

```bash
cd apps/web
node .claude/skills/run-web/driver.mjs http://localhost:5173/app .run-session
```

The driver:
1. Launches headless Chromium (1280×800, 2x DPR)
2. Navigates to the URL
3. Takes a **full-page screenshot** → `.run-session/screenshot.png`
4. Takes a **viewport screenshot** → `.run-session/screenshot-viewport.png`
5. Dumps all console output → `.run-session/console.log`
6. Writes a JSON report → `.run-session/report.json`

### 3. Stop

```bash
kill $(lsof -ti:5173 -sTCP:LISTEN)
```

### 4. Run tests

```bash
cd /path/to/repo/root
pnpm --filter web exec tsc --noEmit   # Type check
```

## Run (human path)

```bash
cd /path/to/repo/root
pnpm dev     # Server + web app. Opens browser at http://localhost:5173.
```

## Gotchas

- **Port 5173 busy**: Vite auto-increments to 5174, 5175, etc. Check which port with `lsof -ti:TCP:LISTEN -sTCP:LISTEN -i :5173` and update the driver URL accordingly. The skill's `driver.mjs` accepts a custom URL as first arg.
- **Playwright browsers must be installed separately**: `pnpm install` does not download Chromium. Run `npx playwright install chromium` after install.
- **React DevTools injection**: The driver may report 2 console errors (`%c%d font-size:0;color:transparent NaN`). These are React DevTools HMR noise, not real app errors — ignore them.
- **On first nav**: Vite compiles module bundles on demand. The first page load can take a few seconds but settles after that. The driver's `networkidle` wait handles this.

## Troubleshooting

- **`browserType.launch: Executable doesn't exist`**: Playwright Chromium not installed. Run `npx playwright install chromium`.
- **`ECONNREFUSED localhost:5173`**: Dev server not running. Start it with `pnpm --filter web dev`.
- **Screenshot shows blank/error page**: Check `.run-session/console.log` for errors. Common cause: missing env vars or API endpoint unreachable in dev mode.
