# Speaking source parity audit

Source was reopened with an authenticated browser session on 2026-08-01. The previous app smoke was not treated as parity evidence.

Observed source facts:

- Landing has 5 links, no buttons, and a 1372px document at 1440×900.
- Forecast has three real tabs: mandatory Part 1 (2), Part 1 topics (32), Part 2 + 3 (82). Its initial view renders two mandatory items.
- Roulette has Part 1/2/3 tabs, a finite visible card pool and `Spin the deck`; Part 2 spin produced a result state without changing URL.
- Shadowing catalog has 30 lessons plus catalog chrome, 24 buttons, 31 links and a 3035px document. Lesson URLs use UUID plus `community=true&mode=shadowing`.
- Current app had a generic item card for Roulette, treated page/container records as practice items, and sent practice to generic Speaking AI instead of inline context. Desktop app main also clipped the Speaking document because `.app-shell__main` used `overflow:hidden`.

Status reset required by task: UI parity FAILED, functional parity FAILED, data mapping FAILED, scroll behavior FAILED before the fix, production-ready NO.

The single scroll owner fix is now applied with `.app-shell__main:has(.ielts-speaking-page) { overflow-y:auto; overflow-x:hidden; }`. Full functional parity still requires normalized practice items, real Roulette pools, Forecast tabs and a Shadowing lesson player.
