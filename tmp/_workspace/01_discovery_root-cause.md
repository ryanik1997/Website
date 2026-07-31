# Discovery: PET B1 Part 2 Root Cause

## 1. Content Monotony Root Cause

**File:** `scripts/reading/pet-b1/compile/compile-exam.mjs` lines 11–29

`OPTION_DETAILS` (9 shared suffixes, 25–45 words each) and `PROFILE_DETAILS` (5 shared suffixes) are appended by array index to EVERY test's Part 2:

```js
const options = bp.options.map((o, i) => `${o.text}${OPTION_DETAILS[i]}`)
const profiles = bp.profiles.map((p, i) => `${p.text}${PROFILE_DETAILS[i]}`)
```

All tests 14–24, 30, 51 share identical boilerplate suffixes. Additionally, blueprint `option.text` fields follow a shared "A [adjective] [domain-noun]..." skeleton.

## 2. Drop-zone UI Root Cause

**Chain:**
1. Compiler emits `passage` blocks with `text` = full option+suffix, NO em-dash separator
2. Runtime `resolveReferenceParts()` (readingB1ReferenceList.ts:24) tries em-dash split → fails → `title = undefined`, `body = full text`
3. Bank option: `{ id: 'A', label: fullText, title: undefined, body: fullText }`
4. `PetRwDragMatch.tsx` line 182: `{bankItem.title ?? bankItem.label}` → renders FULL description in gap
5. CSS `.pet-rw-drag__slot.is-filled { height: auto }` → expands to fit paragraph

## 3. Blueprint Part 2 Fields (current)

```js
part2: {
  domain: 'string',
  options: [{ key: 'option-a', text: 'full prose' }],
  profiles: [{ key: 'profile-1', text: 'profile prose', correctOptionKey: 'option-a' }],
}
```

No `title`, no `openingStyle`, no `constraints`.

## 4. Compiler Output (current)

```js
passage: [{ label: 'A', text: fullText, imageSlotId: '...', imageRequired: false }]
features: [{ id: 'a', name: fullText }]
```

No `title` field.

## 5. Runtime Title Split Mechanism

`splitReferenceText()` in `readingB1ReferenceList.ts:16`:
- Splits on em-dash `—` or en-dash `–` or hyphen `-` surrounded by spaces
- If found: `{ title: before, body: after }`
- If not: `{ body: entire }`

**FIX:** Format compiled text as `"Title — Description"` → existing runtime splits correctly, NO runtime code change needed.

## 6. Component Rendering

- **Option bank:** `PetRwDragMatch.tsx` lines 87–121 — renders `title` heading + `body` paragraph when title exists
- **Selected gap:** line 182 — `bankItem.title ?? bankItem.label` — compact when title exists
- **Remove button:** lines 189–207 — already working

## 7. Selection State

- `answers[questionId]` = lowercase letter string (e.g., 'a')
- Stable, no full text stored

## 8. Unique Assignment

- `assignOption()` lines 54–62: MOVE behavior — clears previous owner, assigns new

## 9. Fix Plan (minimal)

1. **Compiler:** Remove OPTION_DETAILS/PROFILE_DETAILS. Format passage text as `"title — description"`.
2. **Blueprints:** Add `title` + `openingStyle` to each option. Rewrite descriptions for diversity.
3. **CSS:** Add ellipsis truncation to `.pet-rw-drag__slot-value` (safety).
4. **NO runtime changes needed** — em-dash split already works.
