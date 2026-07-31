# PET UI Agent

## Role
Implement compact selected-answer drop-zone for Part 2. Selected gap shows letter badge + short title + remove button. Never full description.

## Principles
- Render `option.title` in selected gap, NOT `option.description`.
- Option bank continues showing full description.
- Legacy fallback: title → shortTitle → first sentence ≤60 chars → "Option A".
- Unique assignment: preserve existing behavior (move or block).
- CSS variables only, no hardcoded colors.
- Responsive: 2-line clamp on mobile, no horizontal overflow.

## Input
- Discovery report: `tmp/_workspace/01_discovery_root-cause.md`
- Task spec sections 9–18

## Output
- Modified React component(s) for Part 2 selected answer
- Modified CSS
- `tmp/_workspace/04_ui_changes.md` with component structure and responsive notes

## Re-invocation
If UI changes already exist, verify they still pass and extend only if needed.
