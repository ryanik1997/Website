# Licensed CAE C1 Listening input

Place only material that you own or are explicitly licensed to reproduce and use in this application.

Public accessibility is not a redistribution licence. Do not place copied website questions, answer keys, transcripts, HTML/Markdown, or audio here unless the copyright owner has granted suitable permission.

The importer is offline-only: it reads local files and contains no crawler target.

## Folder layout

```text
tmp/cae-listening-licensed-input/
  test-01/
    manifest.json
    questions.json
    answers.json
    transcripts.json
    part-1.mp3
    part-2.mp3
    part-3.mp3
    part-4.mp3
```

Use `test-02`, `test-03`, and so on for additional tests. The folder number must match `manifest.json.testNumber`.

## `manifest.json`

```json
{
  "testNumber": 1,
  "title": "CAE C1 Listening — Licensed Test 1",
  "level": "c1",
  "family": "cae",
  "durationMinutes": 40,
  "license": {
    "owner": "Copyright owner or corpus owner",
    "permission": "Description of the right to reproduce and use the material in this app",
    "source": "https://licensed-source.example/corpus",
    "licensed": true,
    "userOwned": false,
    "writtenPermission": false,
    "permissionEvidence": "Licence agreement or permission reference"
  },
  "audio": {
    "part1": "part-1.mp3",
    "part2": "part-2.mp3",
    "part3": "part-3.mp3",
    "part4": "part-4.mp3"
  }
}
```

Requirements:

- `testNumber`: integer from 1 to 99.
- `level`: exactly `c1`.
- `family`: exactly `cae`.
- `license.owner`, `license.permission`, and `license.source`: non-empty.
- Exactly one of `license.userOwned` or `license.licensed` must be `true`.
- A source on `engexam.info` or any subdomain is rejected unless `writtenPermission` is `true` and `permissionEvidence` is non-empty.
- The `test-XX` folder number must match `manifest.testNumber`; unexpected directory names fail validation.
- Audio names must be local, non-empty `.mp3` files inside the test directory. Absolute paths and `..` are rejected.

## `questions.json`

Use the existing CAE app contract:

```json
{
  "parts": [
    {
      "partNumber": 1,
      "rangeLabel": "Questions 1–6",
      "instruction": "Licensed instruction text",
      "questions": [
        {
          "number": 1,
          "type": "multiple-choice",
          "prompt": "Synthetic example prompt",
          "options": [
            { "id": "A", "label": "Option A" },
            { "id": "B", "label": "Option B" },
            { "id": "C", "label": "Option C" }
          ]
        }
      ]
    }
  ]
}
```

Required shape:

- Part 1: Q1–Q6, `multiple-choice`, exactly A/B/C.
- Part 2: Q7–Q14, `gap-fill`, no options. `passageTitle` and `wordLimit` are optional.
- Part 3: Q15–Q20, `multiple-choice`, exactly A/B/C/D.
- Part 4: Q21–Q30, `matching`, two A–H option banks, five questions in each task, `matchingDualTask: true`, and non-empty `taskOneInstruction` / `taskTwoInstruction`.
- Question numbers must be unique and exactly 1–30.
- Do not put answers or explanations in `questions.json`.

## `answers.json`

```json
{
  "answers": {
    "1": { "answer": "A", "explanation": "Optional explanation" },
    "7": {
      "answer": "licensed answer",
      "acceptableAnswers": ["licensed answer", "licensed variant"]
    }
  }
}
```

Provide exactly 30 entries, keys `1` through `30`:

- Multiple-choice and matching answers must be valid option IDs.
- Gap-fill answers must be non-empty.
- `acceptableAnswers` is optional and must contain non-empty strings.

## `transcripts.json`

Preferred part-specific format:

```json
{
  "parts": {
    "1": "Licensed transcript for Part 1.",
    "2": "Licensed transcript for Part 2.",
    "3": "Licensed transcript for Part 3.",
    "4": "Licensed transcript for Part 4."
  }
}
```

Alternatively, provide a full transcript with an explicit mapping policy:

```json
{
  "fullTranscript": "Licensed full transcript.",
  "mappingPolicy": "The transcript is used as the fallback transcript for each part."
}
```

## Commands

Validate without writing:

```bash
node scripts/listening/cae-c1/validate-licensed-cae-listening-input.mjs
```

Preview conversion without writing:

```bash
node scripts/listening/cae-c1/convert-licensed-cae-listening-to-catalog.mjs --dry-run
```

Apply after reviewing the dry-run report:

```bash
node scripts/listening/cae-c1/convert-licensed-cae-listening-to-catalog.mjs --apply
```

The converter refuses materially different existing outputs unless `--overwrite` is explicitly supplied. It never crawls or downloads source material.