# IELTS Speaking functional-clone report

## Source audit

Authenticated source audit is stored in `tmp/speaking-source-audit.json`, `tmp/speaking-source-states.json`, `tmp/speaking-source-route-map.json`, and `tmp/speaking-source-interactions.json`.

Observed source: landing scroll 1372px; Forecast tabs 2/32/82; Roulette Part 1/2/3 + spin; Shadowing catalog 30 lessons and 3035px scroll document.

## Fixes in this pass

- `.app-shell__main:has(.ielts-speaking-page)` now owns the single vertical scroll for Speaking IELTS; the dashboard no longer clips below the viewport.
- Shadowing excludes the catalog wrapper and renders 30 lessons.
- Shadowing titles are extracted from lesson content instead of the repeated site title.
- Practice route rejects landing/forecast/roulette/container records and does not render raw page dumps.
- Forecast/Roulette now explicitly show an honest missing-normalized-pool state instead of pretending a page record is a practice item.

## Status

- UI parity: FAILED
- Functional parity: FAILED
- Data mapping: PARTIAL/FAILED for Forecast, Roulette and Part 1/2/3
- Scroll behavior: PASS in local smoke after fix
- Production-ready: NO (source parity remains incomplete)

- Final production build: PASS (`pnpm --filter web build`)

Remaining work is data normalization of the 2/32/82 Forecast items and finite Roulette Part 1/2/3 pools, then real Forecast tabs, Roulette spin, inline Shadowing lesson player, and inline Part 1/2/3 recorder context.
