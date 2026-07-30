# PET B1 Reading Batch 15-19 Audit

Generated: 2026-07-30T10:23:10.983Z

## Summary

| Test | P3 words | P4 words | P4 answers | P5 markers | P6 markers |
|------|----------|----------|------------|------------|------------|
| 15 | 380 | 323 | c,g,e,a,h | 6 | 6 |
| 16 | 375 | 312 | d,g,b,f,h | 6 | 6 |
| 17 | 374 | 336 | f,d,h,b,g | 6 | 6 |
| 18 | 380 | 369 | g,d,f,h,b | 6 | 6 |
| 19 | 365 | 346 | g,c,h,e,a | 6 | 6 |

## Part 2 Answers

| Test | Q6 | Q7 | Q8 | Q9 | Q10 |
|------|----|----|----|----|-----|
| 15 | A | B | C | E | H |
| 16 | A | B | C | F | H |
| 17 | A | C | E | D | H |
| 18 | A | B | E | D | H |
| 19 | A | F | C | E | D |

## Part 4 Semantic Mapping

### Test 15

Display permutation: [19,null,16,null,18,null,17,20]

| Label | correctForGap |
|-------|---------------|
| a | 19 |
| b | null |
| c | 16 |
| d | null |
| e | 18 |
| f | null |
| g | 17 |
| h | 20 |

### Test 16

Display permutation: [null,18,null,16,null,19,17,20]

| Label | correctForGap |
|-------|---------------|
| a | null |
| b | 18 |
| c | null |
| d | 16 |
| e | null |
| f | 19 |
| g | 17 |
| h | 20 |

### Test 17

Display permutation: [null,19,null,17,null,16,20,18]

| Label | correctForGap |
|-------|---------------|
| a | null |
| b | 19 |
| c | null |
| d | 17 |
| e | null |
| f | 16 |
| g | 20 |
| h | 18 |

### Test 18

Display permutation: [null,20,null,17,null,18,16,19]

| Label | correctForGap |
|-------|---------------|
| a | null |
| b | 20 |
| c | null |
| d | 17 |
| e | null |
| f | 18 |
| g | 16 |
| h | 19 |

### Test 19

Display permutation: [20,null,17,null,19,null,16,18]

| Label | correctForGap |
|-------|---------------|
| a | 20 |
| b | null |
| c | 17 |
| d | null |
| e | 19 |
| f | null |
| g | 16 |
| h | 18 |

## Part 5 Answers

| Test | Q21 | Q22 | Q23 | Q24 | Q25 | Q26 |
|------|-----|-----|-----|-----|-----|-----|
| 15 | a | a | a | a | a | a |
| 16 | a | a | a | a | a | a |
| 17 | a | a | a | a | a | a |
| 18 | a | a | a | a | a | a |
| 19 | a | a | a | a | a | a |

## Part 6 Answers

| Test | Q27 | Q28 | Q29 | Q30 | Q31 | Q32 |
|------|-----|-----|-----|-----|-----|-----|
| 15 | the | who | but | at | they | so |
| 16 | at | and | which | so | they | could |
| 17 | that | in | but | the | so | it |
| 18 | although | who | an | at | would | we |
| 19 | a | who | and | in | that | so |

## Validation Results

- Structural: PASS
- Answer vault consistency: PASS
- Part 4 distribution (non-monotonic): PASS
- Part 4 semantic mapping: PASS
- Part 5 contract (6 markers, 4 options): PASS
- Part 6 contract (6 markers, no options): PASS
- Idempotency: PASS
- git diff --check: PASS
