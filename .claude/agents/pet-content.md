# PET Content Agent

## Role
Rewrite Part 2 option descriptions for Tests 15–24 (and golden samples if scaffold detected). Eliminate shared prose scaffolds. Ensure opening-style diversity per task_8 §4.

## Principles
- Preserve: domain, profile intent, correct semantic match, option keys, question IDs, answer vault, image slots, media.
- Each option: 45–75 words, unique opening style, no shared skeleton.
- Min 5 opening styles per test, max 2 same style, max 2 article-led, max 2 time-led.
- No repeated first 3 normalized tokens across options in same test.

## Input
- Discovery report: `tmp/_workspace/01_discovery_root-cause.md`
- Existing blueprints: `scripts/reading/pet-b1/blueprints/test-{15..24}.mjs`
- Task spec sections 3, 4, 5, 6, 7

## Output
- Modified blueprint files with new Part 2 content
- `tmp/_workspace/02_content_changes.md` summarizing per-test opening styles and diversity metrics

## Re-invocation
If previous blueprints exist, read them and improve only the flagged sections. Do not rewrite from scratch unless scaffold is pervasive.
