---
name: ielts-html-generator
description: Use this skill when user provides an IELTS test HTML reference (or PDF) and asks to create matching HTML mock + app data (exam_partN.json / catalog). Triggered by "làm đề thi giống file HTML", "cập nhật theo HTML 100%", "remake structure theo HTML", or processing the 48 Cambridge tests. HTML file is now the single source of truth for text, bullets, layout, gap positions. Never rely on PDF OCR.
---

# IELTS HTML Test Generator Skill

## Purpose
Create beautiful, faithful digital recreations of Cambridge IELTS exam papers as single-file HTML. The HTML must look and feel extremely close to the printed paper while adding practical digital features (typing answers, selecting MCQ options, print-optimized).

## Core Principles (always follow)
- **HTML reference is the single source of truth** (100% text, bullets •/–, line breaks, inline gaps, form structure). Do **not** use PDF OCR or previous JSONs as primary source.
- When user provides HTML file (e.g. IELTS_Test1_Listening_Cam9.html), extract **every single character**, bullet, section, and gap position exactly.
- Visual fidelity for both:
  - The standalone HTML mock (Tailwind + custom styles matching the provided reference).
  - The app data (notePassage[] in exam_partN.json) so the React renderer produces identical layout (using existing .listening-ielts-notes__box, line classes, GapInlineCompact, etc.).
- Every test uses consistent patterns for notePassage (static + gap + section + example) and questions.
- Prepare both the HTML mock **and** the backend JSON data for the 48 tests.
- File naming for HTML: `IELTS_TestN_Listening_CamX.html`.
- After updating JSON: run `pnpm build:catalog` and validate in app.

## Standard Workflow
1. User provides the HTML reference file for the test (this is now the authoritative source).
2. Carefully extract **every character, bullet, section header, gap position, and line break** from the HTML with 100% fidelity.
3. For the standalone HTML mock: copy the template and replace content section-by-section.
4. For app data: build/update `exam_partN.json` (notePassage + questions) directly from the HTML structure (see "Data Preparation" section below).
5. Rename and save files appropriately.
6. Run `pnpm build:catalog` and test both the HTML and the app rendering.
7. Place HTML in artifacts (if requested) and commit the updated JSONs.

## HTML Structure (do not deviate)
- Max-width container (~900px) with shadow for screen, clean white for print.
- Top dark header: "Test X" + black "LISTENING" badge.
- Amber instruction box at top.
- Each SECTION has its own header badge.
- Use `.paper-box` for bordered exam content areas.
- Use `.notes-box` for the note-completion style boxes (Section 2 & 4).
- Question numbers in bold with `<span class="question-number">`.
- Answer lines: `<input class="answer-input">` with bottom border only.
- MCQ options: Use the `.option` class + the two JS functions provided in template.

## Section-Specific Patterns

### Section 1 (Form / Notes Completion)
- Use a single `.paper-box` with title "JOB ENQUIRY" or equivalent.
- Replicate every bullet and sub-bullet exactly.
- Place `<span class="question-number">N</span>` right before each answer input.
- Keep example line with green "(Example)" label.
- Use `flex` + `form-row` / `form-label` classes for alignment.

### Section 2 (Notes + MCQ)
- First part: `.notes-box` with centered bold title (e.g. "SPORTS WORLD").
- List items with inline inputs for 11-16.
- Then separate MCQ blocks for 17-18 (single choice) and 19-20 (choose TWO letters).
- For choose-two: use `toggleMultiOption()` and show "Click to select (max 2)" note.

### Section 3 (All MCQ)
- Big `.paper-box` with title "Course Feedback" or similar.
- Each question has clear stem + 3 options using the `.option` + `selectOption()` pattern.
- Keep consistent left margin for options (`.mcq-container`).

### Section 4 (Long Notes with Subheadings)
- One big `.paper-box`.
- Main title in bold.
- Subheadings (Parasites, Toxins, Accidental Strandings, Human Activity, Group Behaviour, Further Reading) in bold.
- Place inputs inline after question numbers.
- For lines with two blanks (e.g. question 33), put two separate inputs next to each other.
- Preserve all example references and years exactly.

## Interactive JavaScript (keep identical across tests)
Always include these two functions from the template:
- `selectOption(element, questionNum)` — for single-choice A/B/C
- `toggleMultiOption(element, questionId)` — for "choose TWO letters" questions
Also keep:
- `addInputListeners()` for nice focus + Enter-to-next behavior
- Keyboard accessibility on `.option` elements

Do **not** add heavy libraries. Keep everything vanilla + Tailwind CDN.

## Styling Rules (strict)
- Use the exact CSS classes and custom styles from the template (`answer-input`, `option`, `paper-box`, `notes-box`, `question-number`, etc.).
- Never change the Tailwind script or core color scheme (dark header, blue accents on focus/selection).
- Print styles must remain (remove shadows, ensure inputs show as lines).

## Quality Checklist before delivering
- [ ] All 40 questions present with correct numbering
- [ ] Inputs have proper width and placeholder underlines
- [ ] MCQ options are clickable and highlight correctly
- [ ] Choose-two questions limit to 2 selections
- [ ] Text matches the source PDF 100%
- [ ] Looks excellent when printed (A4 portrait)
- [ ] File saved to `/home/workdir/artifacts/` with clear name
- [ ] No console errors

## Future Enhancements (when user requests)
- Add "Show Answer Key" button (hidden by default)
- Add 30-minute countdown timer
- Generate an index page listing all 47 completed HTML tests
- Support Reading section in the future (different layout)

This skill ensures every one of the 47 tests will have the same professional, consistent, and highly usable HTML format.

---

## Data Preparation from HTML Reference (New Priority Workflow)

### When to use
User provides HTML mock (e.g. `IELTS_Test1_Listening_Cam9.html`) and says "làm lại cấu trúc", "cập nhật theo HTML 100%", "remake data giống file html".

### Goal
Make the app's exam data (notePassage, questions, layout) produce pixel-perfect match to the HTML when rendered in `ListeningIeltsPartView` + `ListeningIeltsNotePassageBox`.

### Step-by-step
1. Open the provided HTML and the corresponding `exam_partN.json` (or create from template).
2. **Part 1 (Form/Notes)**: Build `notePassage[]` as linear array of objects:
   - `{ "type": "example", "text": "• Work at: a restaurant" }`
   - `{ "type": "static", "text": "• Type of work:" }`
   - `{ "type": "gap", "number": 1 }`
   - `{ "type": "static", "text": "• Number of hours per week: 12 hours" }`
   - Use **exact** leading bullets from HTML (`• ` for main, `– ` for subs).
   - For Q7-style (label on one line, answer input on next indented line): keep the colon static + gap on next logical line. The renderer + CSS will handle.
   - Inline gaps (text + gap + text on same line): put as consecutive static + gap + static.
3. **Part 2 / 4 (Notes)**: Prefer explicit `static` + `gap` + `static` blocks (instead of only gapLead/gapTrail) for clarity and exact control.
   - Copy every bullet and continuation phrase exactly.
   - Use `section` for subheadings (Parasites, Group Behaviour...).
4. **Questions array**:
   - `prompt` = the label text before the blank (as shown in HTML).
   - For MC / Choose TWO: copy options **verbatim** (including periods).
   - `gapLead` / `gapTrail` only as fallback; prefer putting text in notePassage.
5. Update `notePassageLayout`: "form" for most Part 1, "lecture" for Part 4, "table" only when HTML shows table.
6. After changes:
   - Update the full `exam.json` if needed.
   - Run `pnpm build:catalog`
   - Test in app at `/app/exam/...` or listening test page.
   - Hard refresh + compare side-by-side with the HTML reference.
7. Also keep the standalone HTML mock updated/consistent if user asks for it.

### Common exact-match rules (from Cam9 Test 1 work)
- Never invent or normalize text (1994 not 1990s, exact dashes, "was ill" not missing words).
- Bullets in data determine CSS class (• → `--bullet`, – → `--sub`).
- Pure gap lines after a main label (no preceding static in the line) render without extra bullet if that's how HTML shows it.
- Use `prepareNotePassageBlocks` + `groupNotePassageFormLines` logic (already tuned for this).
- For Part 4 lecture notes: full sentences with gaps inside, sub-sections as separate `section` blocks.
- Answer values can stay from previous correct sources, but the **visible form text** must come from HTML.

### Tools & commands
- Edit `exam_partN.json` directly for precision.
- `pnpm build:catalog` to ship to app.
- Use existing templates in `Tainguyen/templates/` as starting point when creating new.
- When user gives new HTML for next test → repeat the extraction process above.

This ensures all 48 tests will be **visually identical** to the references the user provides, without OCR drift.