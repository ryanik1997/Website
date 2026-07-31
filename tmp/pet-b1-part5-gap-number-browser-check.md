# PET B1 Part 5 — Gap Question-Number Preservation (browser text evidence, no screenshots)

Env: Vite dev server port 5175, route `/app/exam/reading/{examId}`. Evidence from live DOM text + computed styles.

## Test 31 — catalog-reading-pet-b1-test31
- Route: /app/exam/reading/catalog-reading-pet-b1-test31
- Question: Q23 (3rd gap)
- Before selection trigger text: `23` (aria: `Question 23, choose answer`)
- Selected option: `uncertain`
- After selection trigger text: `23\nuncertain` (number span `23` + value span `uncertain`)
- Dropdown options: 4 single-word (from Q21 chooser)
- After navigation trigger text: n/a (verified on Test 36)
- Console errors: 0

## Test 36 — catalog-reading-pet-b1-test36
- Route: /app/exam/reading/catalog-reading-pet-b1-test36
- Question: Q23
- Before selection trigger text: `23` (aria: `Question 23, choose answer`)
- Selected option: `keep`
- After selection trigger text: `23\nkeep` (number span `23`, value span `keep`)
- Dropdown options while open: `stop`, `keep`, `start`, `avoid` — 4 single-word options; trigger still `23\nkeep`
- After navigation trigger text (Part 6 → back to Part 5): `23\nkeep` — number + answer persist
- All gaps after return: `21`, `22`, `23\nkeep`, `24`, `25`, `26`
- Console errors: 0

## Test 40 — catalog-reading-pet-b1-test40
- Route: /app/exam/reading/catalog-reading-pet-b1-test40
- Question: Q23
- Selected option: `something`
- After selection trigger text: `23\nsomething` (number span `23`, value span `something`)
- aria: `Question 23, selected answer something`
- Console errors: 0

## Test 51 — catalog-reading-pet-b1-test51
- Route: /app/exam/reading/catalog-reading-pet-b1-test51
- Question: Q23
- Selected option: `suggestion`
- After selection trigger text: `23\nsuggestion` (number span `23`, value span `suggestion`)
- aria: `Question 23, selected answer suggestion`
- Console errors: 0

## Computed styles (Test 51 Q23)
- Field: `display: flex; gap: 4px; justify-content: center`
- Number span: `flex: 0 0 auto; min-width: 22px; font-weight: 700` — cannot be squeezed/covered
- Value span: `flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap` — shrinks with ellipsis, never overflows onto the number

## Status
All 4 tests show the question number preserved alongside the selected answer; dropdown open keeps the number; navigation persistence holds; dropdowns expose 4 single-word options; zero console errors.
