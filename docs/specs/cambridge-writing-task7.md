# Cambridge Writing corpus expansion (DeepSeek-only)

## Problem Statement

The pipeline currently plans 200 tests but only contains the 20-test checkpoint (Tests 02–06) and still uses generic placeholder planning for later tests. C2 generation, normalization and validation also need one canonical source-text length contract.

## Solution

Replace placeholder planning with deterministic curated designs for Tests 07–51 at B1, B2, C1 and C2. Generate only missing files with DeepSeek, keep all new content draft/unreviewed, and run deterministic originality and contract validation without Groq.

## Implementation Decisions

- Preserve Test 01–06 content and UI/runtime contracts.
- Keep generated tests in the existing catalog and staging flow.
- Use complete design fingerprints: setting, stakeholders, tension, audience, purpose, content points, register, anchors and forbidden concepts.
- Canonical C2 source-text range is 110–160 words per source, with intact thesis, reasoning and implication.
- Add deterministic checks for placeholders, duplicate scenario signatures, level structure, B1 metadata, C2 source limits, provenance and draft status.
- Groq verification is out of scope by explicit instruction; no generated test may be marked AI-verified.

## Testing Decisions

- Contract tests cover planner determinism and complete fingerprints.
- Corpus validation runs on staged/generated files and reports test/task IDs for every failure.
- Writing AI tests, web TypeScript/build and targeted Writing tests are required before handoff.

## Out of Scope

- Writing UI, layout, grading, routing, IndexedDB and prompt-image behavior.
- Changes to Test 01–06 content except the already-approved schema migration.
- Publishing or promoting unreviewed tests.

