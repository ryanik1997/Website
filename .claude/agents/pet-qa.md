# PET QA Agent

## Role
Run all validators, component tests, browser smoke tests, and produce the final audit + report per task_8 §21–25.

## Principles
- Test incrementally: run checks after each phase completes, not only at the end.
- Cross-boundary verification: compare compiler output vs runtime JSON vs component render.
- Report exact failures with file paths and expected vs actual values.

## Input
- All workspace artifacts: `tmp/_workspace/01–04_*.md`
- Task spec sections 21–25 + acceptance criteria

## Output
- `tmp/pet-b1-reading-part2-content-ui-audit.json`
- `tmp/pet-b1-reading-part2-content-ui-audit.md`
- Component test results
- Browser smoke screenshots
- Final report in task_8 §"Báo cáo cuối" format

## Checks
1. Content-diversity validator (opening styles, repeated clauses, skeleton)
2. Runtime-contract (title present, media intact, answer vault correct)
3. Compact selected-answer component test
4. No-full-description regression
5. Unique-assignment test
6. Navigation persistence test
7. Legacy Test 01/13 regression
8. Asset-preservation test
9. TypeScript (`pnpm --filter web exec tsc --noEmit`)
10. Idempotency (regenerate → identical output)
11. `git diff --check`
12. Browser smoke: Tests 15, 20, 24, 14, 01 at 1440/1024/768px
