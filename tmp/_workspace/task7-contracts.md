# Task 7 — PET B1 Tests 41–50: P3–P6 Authoring Contracts

You are authoring **only Part 3, Part 4, Part 5, Part 6** of one PET B1 Reading blueprint. Part 1 and Part 2 are already written and must NOT be changed.

## Blueprint format reference

Read `scripts/reading/pet-b1/blueprints/test-36.mjs` — it is the canonical format example. Your blueprint is `scripts/reading/pet-b1/blueprints/test-{N}.mjs`. Its `part1`/`part2` are complete; replace the `part3`/`part4`/`part5`/`part6` sections (currently marked `PLACEHOLDER_AUTHOR_ME`).

## The compiled output shapes (what your blueprint must produce)

- **Part 3**: `part3.title` (topic, 3–8 words, non-generic) → `passageTitle: "Part 3 – {title}"`. Passage = `paragraphs` (array) with the 3rd paragraph extended by `buildExtension` at compile time. `questions`: 5 × `{ stem, options: [4 labels], correctIndex }`.
- **Part 4**: `part4.title` → `"Part 4 – {title}"`. `layoutParagraphs` = 5 paragraphs, EACH containing exactly one gap marker `(16) .....` … `(20) .....` in reading order (paragraph i contains gap `(16+i)`). At compile, paragraph i becomes `layoutParagraphs[i] + layoutExtensions[i] + layoutClosers[i]` (all 3 non-empty, total ~55–75 words per paragraph). `options` = 8 × `{ key, text, correctForGap }` where 5 have `correctForGap: 16..20` (the sentence that fits that gap) and 3 have `correctForGap: null` (distractors). `displayOrder` = a permutation of 0–7 (the shuffled display order). The option whose `correctForGap` is 16 must be a sentence that reads naturally at gap 16, etc.
- **Part 5**: `part5.title` → `"Part 5 – {title}"`. `text` (learner-facing, ~150–170 words) + `extra` (~30–40 words appended). `specs`: 6 × `{ phrase, options: [4 single words], correctIndex }`. Each `phrase` must appear verbatim in `text + extra`; the compiler replaces it with `(21) .....` … `(26) .....`. Options must be single orthographic words (letters/digits/`'`/`-` only, no spaces, no phrases).
- **Part 6**: `part6.title` → `"Part 6 – {title}"`. `text` (~130–150 words) + `extra` (~20–30 words) + `tail` (~15–20 words). `answers`: 6 single lowercase words (one per gap 27–32). `targets`: 6 grammar-category labels.

## Word-count rules (learner-facing, measured after gap markers removed)

| Part | Hard range | Preferred |
|---|---|---|
| Part 3 | 300–380 | 325–365 |
| Part 4 | 300–360 | 320–345 |
| Part 5 | 180–220 | 190–210 |
| Part 6 | 160–200 | 172–192 |

Count words in the passage ONLY (not questions/options). Aim for the middle of the preferred band.

## Part 3 rules (§6)

- ≥4 paragraphs, ≥12 sentences, 5 questions, 4 options each.
- Cover ≥4 reading skills among: main idea, detail, reason, attitude, inference, purpose, reference.
- Each question: plausible stem + 3 wrong-but-plausible distractors + 1 correct. `correctIndex` 0–3.
- No shared opening/closing/skeleton with any other PET test.

## Part 4 rules (§7)

- 5 paragraphs, one gap per paragraph, gaps in reading order Q16→Q20.
- ≥14 sentences total. Each paragraph ~55–75 words (post-extension).
- ≥35 words before Q16, ≥35 words between consecutive gaps, ≥35 words after Q20.
- 8 options (5 correct, 3 distractors). Cohesion across the 5 correct options must use ≥5 DIFFERENT cohesion types from: pronoun reference, chronology, contrast, cause/effect, lexical cohesion, consequence, change of plan, paragraph development.
- Avoid the shared skeleton `background → problem → attempt → difficulty → success` for all 5 paragraphs — vary the structure.
- Semantic correctness is mandatory: the sentence for gap N must follow from the sentence before it and the sentence after it.

## Part 5 rules (§8)

- 6 gaps Q21–Q26, 4 single-word options each, exactly one correct.
- ≥8 sentences, ≥20 words after Q26.
- ≥4 distinct language-target categories across the 6 gaps (collocation, adjective/adverb, phrasal verb, linking word, fixed expression, verb choice, preposition, article, dependent preposition, time expression, pronoun …).
- Gaps spread through the passage (not all clustered).
- Options: single words only. NEVER a phrase. E.g. a gap like "___ the end" has options `At/On/By/For` — never `At the end`.

## Part 6 rules (§9)

- 6 gaps Q27–Q32, one answer each.
- ≥7 sentences, ≥20 words after Q32.
- ≥5 distinct grammar categories across the 6 answers; no category used more than twice. Categories: article, preposition, auxiliary, pronoun, relative word, conjunction, determiner, quantifier, linking word, fixed grammatical expression.
- Answers single lowercase words, no multi-word, no slash alternatives, no punctuation.
- No common alternative answer: if two words are both natural, rewrite the sentence so exactly one is correct.

## Titles

Each of P3/P4/P5/P6 needs `title`: 3–8 words, topic-specific, non-generic, distinct from the other parts in the same test, must not reveal any gap answer. Do NOT use "Multiple-choice cloze", "Open cloze", "Gapped text", or bare domain words.

## Quality bar (§11 — NO padding)

Every sentence must add meaning (context, detail, evidence, consequence, example, transition, result). Forbidden: filler sentences, generic conclusions, repeating the same idea, copy-and-swap-domain-noun prose, synonym padding to reach word counts, extending one paragraph only to hit the count.

## Your output

Edit the blueprint file `scripts/reading/pet-b1/blueprints/test-{N}.mjs` so `part3`, `part4`, `part5`, `part6` are fully authored and valid. Leave `part1`/`part2` untouched. Do not touch any other file. After writing, re-read your own file and self-check every contract in this document (word counts, option counts, single-word options/answers, gap numbering, correctForGap correctness, title rules). Report a short self-audit: per-part word counts, question/option/gap counts, P5 language-target list, P6 grammar-category list, P4 cohesion-type list, and your 8 P4 option sentences.
