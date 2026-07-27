# Site Analysis — engexam.info FCE B2 Reading and Use of English

## Overview

WordPress site, content server-rendered in HTML. No JSON API. No JavaScript rendering needed for content extraction. Answer keys and explanations are in the same HTML.

## URL Pattern

```
https://engexam.info/fce-reading-and-use-of-english-practice-tests/fce-reading-and-use-of-english-practice-test-{testNumber}/{pageNumber}/
```

- `testNumber`: 1 → 26
- `pageNumber`: 1 → 8

## Page → Part Mapping

| Page | Content | Questions | Format |
|------|---------|-----------|--------|
| /1/  | Part 1 — Multiple-choice cloze | 1–8 | `<select>` with 4 options |
| /2/  | Part 2 — Open cloze | 9–16 | `<input type="text">` |
| /3/  | Part 3 — Word formation | 17–24 | `<input type="text">` |
| /4/  | Part 4 — Key word transformations | 25–30 | `<input type="text">` + keyword |
| /5/  | Part 5 — Multiple choice | 31–36 | `<input type="radio">` 4 options |
| /6/  | Part 6 — Gapped text | 37–42 | `<select>` with A–G options |
| /7/  | Part 7 — Multiple matching | 43–52 | `<select>` with A–D options |
| /8/  | Answer Keys + Vocabulary | — | Text with explanations |

## Selectors

### Navigation / Metadata
- **Breadcrumbs**: `<p id="breadcrumbs">`
- **Title**: `<h1 class="entry-title">`
- **Page links**: `<div class="page-links">`

### Part Content (in `<div class="entry-content">`)
- **Part heading**: `<h1>Part N</h1>` (N = 1..7)
- **Part subtitle/title**: `<h2>Title text</h2>` (after the `<h1>`)
- **Instruction**: `<em>For questions N-M...</em>`
- **Example**: `<strong>Example:</strong>` (sometimes in `<strong>0</strong>`)
- **Example answer**: `<strong>Example: 0. ANSWER</strong>` or `<strong>Example: 0. IS YOUR FAVOURITE</strong>`
- **Question number**: `<strong>N</strong>` inside `<span class="nowrap">`
- **Highlight/keyword**: `<span class="underline-target" data-ref="N">`
- **Explanation button**: `<a id="q0N" role="button" tabindex="0" class="expl"></a>`
- **Next/prev**: `<input ... value="Next task">`

### Gap types
- **Part 1 (select)**: `<select name="qN" id="qN">` with `<option value="0">` (empty) then values 1-4 for A-D
- **Part 2/3/4 (input)**: `<input type="text" autocomplete="off" id="qN" size="X" maxlength="Y">` — `q9`...`q30`
- **Part 5 (radio)**: `<input name="qN" type="radio" value="A|B|C|D">` — options in separate `<br />` lines
- **Part 6 (select)**: `<select name="q1" id="q37">` etc with options A-G (value 1-7)
- **Part 7 (select)**: `<select name="q1" id="q43">` etc with options A-D (value 1-4)

### Answer Keys (page 8)
- **Heading**: `<h1>Answer Keys</h1>`
- **Part key**: `<h3>Part N</h3>` for each part
- **Answer format**: `<strong>N LETTER – answer_text.</strong> Explanation text.`
- **Vocabulary**: `<h2>Vocabulary</h2>` then `<h3>Part N</h3>`

### JS resources
- **Timer + grading** (per part): `https://engexam.info/wp-content/uploads/FCE-JS/FCE-reading-test-{N}-2026/fce{P}.js`
- **Highlighting**: `https://engexam.info/wp-content/uploads/highlighting/highlight.js`
- **Timer helper**: `https://engexam.info/wp-content/uploads/FCE-JS/timer-fce.js`

## Important Notes

1. All 26 tests use identical template structure. Verified with test 1, test 13, test 26.
2. Tests are not multi-page — each page is a WordPress sub-page of the main test page.
3. Test 26 may have slightly different page count — verify before crawling.
4. Answer keys are on page 8 for all tests (verified).
5. JS grading uses `onClick="gradeTest()"` but all answer/data content is in HTML.
6. `<select>` options use value mapping: 1=A, 2=B, 3=C, 4=D (or A-G for Part 6).
7. Part 5 uses radio buttons (not select) — different scraping approach needed.
8. Example answers appear as `<strong>Example: 0. ANSWER_TEXT</strong>` — parse carefully.
9. Some parts have instructions with bold formatting inside `<em>`.
10. Question numbering is continuous across all 7 parts: 1-8, 9-16, 17-24, 25-30, 31-36, 37-42, 43-52.
