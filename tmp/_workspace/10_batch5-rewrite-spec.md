# Batch 5 (Tests 36-40) Blueprint Rewrite Spec

## Context

- Repo root: `D:/App-English-Ryan/Website`
- Blueprints to edit: `scripts/reading/pet-b1/blueprints/test-36.mjs` … `test-40.mjs`
- After editing, run `node scripts/reading/generate-pet-b1-reading-tests-14-51.mjs --from=36 --to=40` to compile to `packages/catalog/data/reading-pet-b1-testN.json` + `apps/web/public/catalog/exams/reading/catalog-reading-pet-b1-testN.json` (+ `.answers.json`).
- Compiler: `scripts/reading/pet-b1/compile/compile-exam.mjs` (read it — exact schema contract).
- Golden reference (canonical schema): `scripts/reading/pet-b1/blueprints/test-51.mjs`.

## DO NOT

- Do NOT touch any blueprint other than your assigned test file.
- Do NOT commit or push.
- Do NOT use padding / filler / repeated idea / generic closing. Every added word must add context, evidence, consequence, example, or transition.
- Do NOT leave shared scaffold with the other 4 batch tests or with reference tests (1,2,3,13,14-35,41-51).
- Do NOT put an answer key or rationale inside learner-facing passage text.

## Schema (from compile-exam.mjs + golden test-51)

### part1.cards (5 cards)
```js
cards: [
  { key: 'p1-card-1', template: '<type>', title: '<unique short title>',
    text: '<30-45 word short text unique to this card>',
    question: { stem: '<question about the text>',
      options: [ { key: 'a1', text: '<answer text>' }, { key: 'a2', text: '...' }, { key: 'a3', text: '...' } ],
      correctOptionKey: 'a1' } },
  ...
]
```
- Each card is a different short-text type (notice / email / poster / message / update / announcement / booking).
- **EXACTLY 3 options per card** (keys a1-a3, b1-b3, c1-c3, d1-d3, e1-e3). The working-tree `compilePart1` now THROWS unless a card has exactly 3 distinct options (task §6: "3 options/question"). Golden test-51 has 4 and no longer compiles — ignore it for Part 1; follow the current compiler.
- `correctOptionKey` must reference one of that card's option keys.
- Text, title, stem, options must be bespoke to THIS test's domain. No two cards in the same test may share option wording. No two tests may reuse the same card scaffold.

### part2 (matching: 8 options, 5 profiles)
```js
part2: {
  domain: '<domain sentence>',
  options: [ { key: 'option-a', title: '<short unique title, NO em-dash/en-dash/"- ">', openingStyle: '<e.g. activity-led>', text: '<45-75 word distinct description>', constraints: [ '...' ], imageSlotKey: 'option-a' }, ... 8 total ],
  profiles: [ { key: 'profile-1', text: '<distinct person description>', correctOptionKey: 'option-x' }, ... 5 total ]
}
```
- All 8 option descriptions must be DISTINCT from each other and across the 5 tests.
- All 5 profiles must be DISTINCT and each match exactly one option (`correctOptionKey`), with the mapping non-trivial (spread across options, not 1,2,3,4,5 → A,B,C,D,E).
- Per-test option opening styles: min 5 distinct styles, max 2 of the same style.
- Option title must never contain `—`, `–`, or `- ` (breaks runtime title split).
- `imageSlotKey` stays `option-<letter>`.

### part3 (5 questions)
```js
part3: {
  title: '<title>',
  paragraphs: [ '<para1>', '<para2>', '<para3>', '<para4>' ],
  buildExtension: ' <1-3 sentence closing appended to paragraph 3>',
  questions: [ { stem, options: ['A','B','C','D'], correctIndex: N }, ... 5 ]
}
```
- 325-365 learner-facing words preferred (hard 300-380). ≥4 paragraphs, ≥12 sentences.
- `compilePart3` appends `buildExtension` onto `paragraphs[2]` — so paragraphs[2] must read naturally WITHOUT the extension (the extension continues it). Never start a paragraph with a stray fragment.
- Each question tests a real reading skill (main idea, detail, reason, attitude, inference, purpose, reference). 5 questions / 4 options each.
- `correctIndex` must point to the actually-correct option.

### part4 (5 gaps)
```js
part4: {
  title: '<title>',
  layoutParagraphs: [ '<para1 with (16) .....>', ..., '<para5 with (20) .....>' ],   // exactly 5, one gap each
  layoutExtensions: [ '<>', '<>', ... ],   // 5 strings appended after each paragraph (may be "" )
  layoutClosers: [ ... ],                  // 5 strings appended after extension (may be "" )
  options: [ { key: 'option-0', text: '...', correctForGap: 16 }, ... 8 ],  // 5 correct (gap 16..20) + 3 distractors (correctForGap: null)
  displayOrder: [ ... ]                    // permutation of 0..7
}
```
- Target 320-345 words (hard 300-360). Exactly 5 paragraphs, each with 1 gap Q16→Q20 in reading order.
- 8 options: 5 correct (one per gap) + 3 plausible distractors. `correctForGap` is the semantic mapping (never derive answer from array index).
- Each paragraph ~55-75 words. ≥14 sentences. ≥35 words before Q16, between gaps, and after Q20.
- The 5 correct sentences must exercise varied cohesion (pronoun reference, chronology, contrast, cause/effect, lexical cohesion, consequence, change of plan, paragraph development).
- Keep `displayOrder` a valid permutation; answers are derived from `correctForGap`.

### part5 (multiple-choice cloze, Q21-26)
```js
part5: {
  text: '<passage with the 6 spec phrases appearing VERBATIM as contiguous substrings>',
  extra: '<extension passage>',
  specs: [ { phrase: '<verbatim substring present in text+extra>', languageTarget: '<category>', options: ['correct','w1','w2','w3'], correctIndex: 0 }, ... 6 ]
}
```
- `compilePart5` does `passage.replace(spec.phrase, '(N) .....')` on `${text} ${extra}`. Every `spec.phrase` MUST appear verbatim (single contiguous token sequence) in `text` or `extra`, and ideally appear only once. Otherwise the gap never gets inserted.
- Target 190-210 words learner-facing (hard 180-220). ≥8 sentences. ≥4 distinct languageTarget categories per test; gap distribution across the passage; ≥20 words after Q26.
- languageTarget from: collocation, phrasal verb, dependent preposition, linking word, fixed expression, verb choice, adjective/adverb, noun choice, meaning distinction, context-sensitive grammar.
- The 6 per-test target sequences must differ from the other 4 batch tests.
- Each distractor must be plausible (grammatically/semantically close but wrong).

### part6 (open cloze, Q27-32)
```js
part6: {
  text: '<passage with (27) ........ .. (32) ........ inline>',
  extra: '<extension>',
  tail: '<closing>',
  answers: ['w1',...'w6'],   // each exactly 1 lowercase word
  targets: ['category',...]  // grammar category per gap
}
```
- `compilePart6` joins `${text} ${extra} ${tail}`.
- Target 172-192 words (hard 160-200). ≥7 sentences. ≥5 DISTINCT grammar categories across the 6 gaps, no category more than twice.
- Categories: article, preposition, auxiliary, pronoun, relative word, conjunction, determiner, quantifier, linking word, fixed grammatical expression.
- Answers are single lowercase words; each must be the only natural completion (no common alternatives).

## Per-test architecture (content matrix) — DO NOT swap these

| Test | Domain | P3 type | P4 structure | P5 type | P6 type |
|------|--------|---------|--------------|---------|---------|
| 36 | community science fair (school insect display, move to library, evidence-based revision) | explanatory feature | process/event account (measurement-driven development) | factual local report (library reading-habits survey) | practical course message (internet-safety course) |
| 37 | youth theatre (short play, parents arrive early, timing) | interview/profile-style group experience | chronological event account (rehearsal → audience feedback → performance) | advice article (joining a drama group) | public announcement (photography workshop) |
| 38 | food waste project (school café portions, weigh leftovers) | opinion feature (measure instead of guess) | process explanation (measure → trial → adjust) | short news story (recycling project) | event/competition item (local recipe competition) |
| 39 | local history archive (old photos, missing date, memory vs records) | investigation/biography-style | comparison of approaches (memory vs council records) | reflective account (learning to cook) | information page (museum photograph room) |
| 40 | urban gardening (roof garden above market, engineer, safety) | experience report (safety-first redesign) | project-development (plan → engineer → build → grow) | event review (market stall selling cards) | informal news item (car park → community garden) |

## Current state + word-count targets (current → target)

Current counts are AFTER regenerating from current blueprints.

| Test | P3 current → target | P4 current → target | P5 current → target | P6 current → target |
|------|---------------------|---------------------|---------------------|---------------------|
| 36 | 356 → 348-360 | 339 → 322-328 | 187 → 194-202 | 167 → 175-181 |
| 37 | 323 → 330-342 | 317 → 330-336 | 192 → 198-206 | 186 → 183-189 |
| 38 | 313 → 335-348 | 335 → 338-344 | 192 → 190-197 | 177 → 172-178 |
| 39 | 316 → 335-348 | 312 → 324-332 | 192 → 203-210 | 183 → 179-185 |
| 40 | 316 → 340-355 | 309 → 334-342 | 193 → 196-204 | 198 → 184-190 |

Counts = learner-facing words after removing `(N) ....` gap markers (use the same rule as `validate-pet-b1-batch-36-40.mjs`).

## Known defects to fix (per test)

- **ALL tests Part 1**: broken — options must become `{key, text}` objects and `correctOptionKey` must match an option key; current answers compile to `"@"`. Rewrite all 5 cards with unique bespoke content.
- **ALL tests Part 2**: all 8 option texts and all 5 profiles are identical placeholders. Rewrite with distinct content + non-trivial correctOptionKey mapping.
- **ALL tests Part 3 paragraph 3**: starts with a stray fragment (e.g. test-36 "testing evidence through revision."). Remove the fragment; rework the paragraph so it opens a natural sentence.
- **test-36**: P4 339→322-328 (trim), P5 187→194-202 (add), P6 167→175-181 (add, and Part 6 grammar categories currently only 3 distinct — make ≥5).
- **test-37**: P3 323→330-342, P4 317→330-336 (add), P4 para4 is 53 words (<55) — extend.
- **test-38**: P3 313→335-348, P4 335→338-344 (small add), P5 192→190-197 (may trim).
- **test-39**: P3 316→335-348, P4 312→324-332 (add).
- **test-40**: P3 316→340-355, P4 309→334-342 (add), P4 para3 is 54 words — extend, P6 198→184-190 (trim).
- **ALL tests Part 5 specs**: add `languageTarget` to each spec; ensure ≥4 distinct categories per test and a target sequence distinct from the other batch tests.
- **ALL tests Part 6 targets**: ensure ≥5 distinct grammar categories, none >2x. Adjust answers if you change gaps.

## Verification after you finish

You may run (read-only checks only):
```
node scripts/reading/generate-pet-b1-reading-tests-14-51.mjs --from=36 --to=40
node scripts/reading/validate-pet-b1-batch-36-40.mjs
node scripts/reading/validate-pet-b1-batch-36-40-similarity.mjs
node scripts/reading/validate-pet-b1-batch-5-similarity.mjs
node scripts/reading/validate-pet-b1-batch-36-40-cross-similarity.mjs
```
Report back: per-part word counts (P3/P4/P5/P6), the P5 language-target sequence, the P6 grammar-category sequence, and any validator failures. Do not modify other files.
