# PET B1 Reading Part 4/5/6 Title — Discovery Report

Scope: Tests 01, 03, 13, 14–51 (42 catalog entries). Audit targets Part 4, Part 5, Part 6 only.

## Schema discovered

**Part 4 title source:** `blueprint.part4.title` → compiler → `part.passageTitle = "Part 4 – {title}"`.
- compiler: `compile-exam.mjs` line 179/285 `passageTitle: \`Part 4 \u2013 ${bp.title}\`` (PRESERVED).
- Renderer `PetRwPartContent.tsx` (~line 569-618): `rawTitle = passageSubtitle || passageTitle` with `^Part\s*4\s*[—–-]\s*` prefix stripped → rendered as `<h2 class="pet-rw-part4-title">`.

**Part 5 title source:** `blueprint.part5.title` field EXISTS in some blueprints but compiler HARDCODES it:
- `compile-exam.mjs` line 207/305 `passageTitle: 'Part 5 \u2013 Multiple-choice cloze'` (DROPS bp.part5.title).
- Renderer (~line 724-795): `cleanTitle = passageSubtitle || passageTitle` with `^Part\s*5\s*[—–-]\s*` stripped → `<h2 class="pet-rw-part5-title">`.

**Part 6 title source:** same as Part 5 — compiler HARDCODES `'Part 6 \u2013 Open cloze'` (line 219/317).
- Renderer (~line 808-826): `<h2 class="ket-rw-passage-title">{part.passageTitle}</h2>` — shows RAW passageTitle (prefix NOT stripped).

**Compiler preserves title:** Part 4 YES. Part 5/6 NO (hardcoded generic). → Compiler fix required (§7).

**Runtime renderer displays:** `part.passageTitle` primary; `part.passageSubtitle` used as override for Parts 3/4/5 heading. Part 6 shows passageTitle verbatim.

**Package/public parity:** `packages/catalog/data/reading-pet-b1-testN.json` == `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-testN.json` (byte-identical copies; generator writes both).

**Legacy handling:** Tests 01/03/13 authored directly; have topic titles except Test 03 Part 5 ("The Watch" — 2 words, legacy). Test 02 uses instructional `passageSubtitle` (generic type as subtitle). Renderer falls back to empty title gracefully.

## Source of truth per test batch

- **Blueprint-backed (14–30, 36–40, 51):** `scripts/reading/pet-b1/blueprints/test-N.mjs` → `generate-pet-b1-reading-tests-14-51.mjs`. Regeneration is byte-identical (verified Test 36).
- **Non-blueprint (31–35, 41–50):** committed JSON only (one-time backfill scripts; main generator throws "Missing quality Part 1 blueprint for Test 31"). Must edit JSON directly.

## Title state (audit)

- OK (KEEP): Tests 01, 02, 03, 13, 20–29 (all parts); Part 4 of 14–19, 30, 36–40, 51.
- FAIL generic type "Multiple-choice cloze"/"Open cloze" (Part 5/6): Tests 14–19, 30, 36–40, 51 → 13 tests × 2 = 26 titles.
- FAIL short/domain-only (Part 4/5/6): Tests 31–35, 41–50 → 15 tests × 3 = 45 titles.
- Total to author: ~71 titles.

## Fix plan

1. Compiler: read `bp.part5.title`/`bp.part6.title` (fallback generic) in compile-exam.mjs.
2. Blueprints 14–19, 30, 36–40, 51: add `part5.title`, `part6.title`; regenerate → verify byte-identical except titles.
3. Non-blueprint 31–35, 41–50: edit `passageTitle` directly in package + public JSON.
4. Validator: `scripts/reading/validate-pet-b1-reading-titles.mjs`.
5. Audit reports + browser text evidence (Tests 31/36/40/51).
