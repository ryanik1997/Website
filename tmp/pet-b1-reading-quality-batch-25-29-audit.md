# PET B1 Reading Quality Audit — Batch 25–29

## Summary

| Metric | Value |
|--------|-------|
| Tests | 5 (25, 26, 27, 28, 29) |
| Parts | 30 |
| Questions | 160 |
| Answers | 160 |
| Structural validator | PASS (38/1216) |
| Similarity (8-gram) | 0 shared |
| Asset preservation | PASS |
| Part 2 smoke | PASS |
| Part 4 semantic mapping | PASS |
| Part 5 contract | PASS |
| TypeScript | PASS (exit 0) |
| git diff --check | PASS (CRLF warnings only) |

## Per-Test Breakdown

| Test | Domain | P1 Cards | P2 Options | P2 Profiles | P3 ¶ | P3 Q | P4 Opt | P5 Q | P6 Q |
|------|--------|----------|------------|-------------|------|------|--------|------|------|
| 25 | Travel and local transport | 5 | 8 | 5 | 4 | 5 | 8 | 6 | 6 |
| 26 | Health, fitness and wellbeing | 5 | 8 | 5 | 4 | 5 | 8 | 6 | 6 |
| 27 | Technology and digital life | 5 | 8 | 5 | 4 | 5 | 8 | 6 | 6 |
| 28 | Arts, crafts and creative hobbies | 5 | 8 | 5 | 4 | 5 | 8 | 6 | 6 |
| 29 | Part-time work and youth earning | 5 | 8 | 5 | 4 | 5 | 8 | 6 | 6 |

## Opening Styles (Part 2)

| Test | Sequence |
|------|----------|
| 25 | invitation, feature, need, outcome, audience, condition, schedule, location |
| 26 | outcome, audience, schedule, invitation, condition, need, location, feature |
| 27 | condition, schedule, feature, location, outcome, invitation, need, audience |
| 28 | feature, location, audience, schedule, invitation, outcome, condition, need |
| 29 | audience, need, outcome, condition, invitation, schedule, location, feature |

All 5 tests use all 8 opening styles in unique sequences. No sequence repeats from Tests 15–24.

## Part 6 Grammar Targets

| Test | Targets |
|------|---------|
| 25 | preposition, preposition, conjunction, relative-word, pronoun, preposition |
| 26 | relative-word, conjunction, preposition, article, linking-word, pronoun |
| 27 | conjunction, relative-word, article, preposition, pronoun, auxiliary |
| 28 | article, preposition, relative-word, conjunction, linking-word, pronoun |
| 29 | preposition, preposition, relative-word, article, conjunction, pronoun |

All answers are single lowercase words matching `/^[a-z]+$/`.

## Validation Results

- **Structural validator**: 38 tests, 228 parts, 1216 questions — PASS
- **Idempotency**: Golden samples (14, 30, 51) PASS
- **Part 2 smoke**: Full-card drag/drop compatible — PASS
- **Part 4 semantic mapping**: Golden samples PASS
- **Part 5 contract**: 6 markers, 4 options each — PASS
- **Asset preservation**: imageSlotId fields preserved — PASS
- **Similarity**: 0 shared 8-grams (new vs existing + mutual)
- **TypeScript**: exit 0
- **git diff --check**: No whitespace errors (CRLF warnings only)
