# PET B1 Reading Part 4/5/6 Title — Browser Check (text evidence, no screenshots)

Environment: Vite dev server (port 5175), route `/app/exam/reading/{examId}`. Evidence collected from the live DOM via accessibility/text queries and the served HTTP JSON payload.

## Test 36 — `catalog-reading-pet-b1-test36`

| Item | Part 4 | Part 5 | Part 6 |
|---|---|---|---|
| Route | /app/exam/reading/catalog-reading-pet-b1-test36 | same | same |
| Expected title | Community Science Fair develops through experience | A Student Reading Survey | Learning About Internet Safety |
| Visible DOM title (h2) | `Community Science Fair develops through experience` | `A Student Reading Survey` | `Part 6 – Learning About Internet Safety` |
| DOM title selector | `h2.pet-rw-part4-title` | `h2.pet-rw-part5-title` | `h2.ket-rw-passage-title` |
| Generic-only heading? | No — topic title is primary; task instruction shown separately | No | No |
| Passage starts with | "The science fair took shape around a measurement problem rather than a timetable…" | "Last month, students at a local school [21] a survey of their reading habits…" | "The library team decided to run a short course on safe internet use…" |
| Gap markers | Q16–20 present | Q21–26 present | Q27–32 present |
| Interaction checked | part nav renders | gap dropdown opens with options | open-cloze gaps render |
| Console errors | 0 | 0 | 0 |

## Test 40 — `catalog-reading-pet-b1-test40`

| Item | Part 4 | Part 5 | Part 6 |
|---|---|---|---|
| Route | /app/exam/reading/catalog-reading-pet-b1-test40 | same | same |
| Expected title | The roof garden plan is tested for safety | Selling Cards at the Weekend Market | From Car Park to Community Garden |
| Visible DOM title (h2) | `The roof garden plan is tested for safety` | `Selling Cards at the Weekend Market` | `Part 6 – From Car Park to Community Garden` |
| DOM title selector | `h2.pet-rw-part4-title` | `h2.pet-rw-part5-title` | `h2.ket-rw-passage-title` |
| Generic-only heading? | No | No | No |
| Passage starts with | "People living in the flats above the market wanted a community garden on the roof…" | "My friend and I opened a small stall at the weekend market to sell [21] cards…" | "A group of residents decided to turn an unused car park into a small community garden…" |
| Gap markers | Q16–20 present | Q21–26 present | Q27–32 present |
| Console errors | 0 | 0 | 0 |

## Test 31 — `catalog-reading-pet-b1-test31`

| Item | Part 4 | Part 5 | Part 6 |
|---|---|---|---|
| Route | /app/exam/reading/catalog-reading-pet-b1-test31 | same | same |
| Expected title | Running a Repair Café | The Repair Café's Weekly Routine | Safe Repairs for New Volunteers |
| Visible DOM title (h2) | `Running a Repair Café` | `The Repair Café's Weekly Routine` | `Part 6 – Safe Repairs for New Volunteers` |
| DOM title selector | `h2.pet-rw-part4-title` | `h2.pet-rw-part5-title` | `h2.ket-rw-passage-title` |
| Generic-only heading? | No | No | No |
| Passage starts with | "The volunteers began their repair cafés plan with one short meeting…" | "The volunteers usually meet [21] Saturday. New members are shown how to [22] the equipment…" | "The volunteers meet [27] week to plan activities…" |
| Gap markers | Q16–20 present | Q21–26 present | Q27–32 present |
| Interaction checked | — | **Dropdown Q21 opens** (listbox: every/each/whole/all), **selection "each" persists** in the gap button | — |
| Console errors | 0 | 0 | 0 |

## Test 51 — `catalog-reading-pet-b1-test51`

| Item | Part 4 | Part 5 | Part 6 |
|---|---|---|---|
| Route | /app/exam/reading/catalog-reading-pet-b1-test51 | same | same |
| Expected title | A cleaner way to travel | A Low-Waste Trip to the Coast | Recording Notes for Greener Travel |
| Visible DOM title (h2) | `A cleaner way to travel` | `A Low-Waste Trip to the Coast` | `Part 6 – Recording Notes for Greener Travel` |
| DOM title selector | `h2.pet-rw-part4-title` | `h2.pet-rw-part5-title` | `h2.ket-rw-passage-title` |
| Generic-only heading? | No | No | No |
| Passage starts with | "Maya wanted to travel across the island without producing much rubbish…" | "Our coastal trip [21] the cliff path…" | "The storm arrived [27] we reached the cliff path…" |
| Gap markers | Q16–20 present | Q21–26 present | Q27–32 present |
| Console errors | 0 | 0 | 0 |

## Served JSON payload (HTTP, port 5175)

All four tests served the expected `passageTitle` for Parts 4/5/6 (e.g. Test 31 → `Part 4 – Running a Repair Café` | `Part 5 – The Repair Café's Weekly Routine` | `Part 6 – Safe Repairs for New Volunteers`). The renderer reads `part.passageTitle` (with `passageSubtitle` override for Parts 4/5) — the DOM h2 values above come directly from that served payload, so runtime title visibility is confirmed end-to-end.

## Status

All 12 part checks (4 tests × 3 parts) show the topic title as the primary visible heading. No generic-only headings remain. Gap markers and interactions (dropdown open + selection persistence) work. Zero console errors.
