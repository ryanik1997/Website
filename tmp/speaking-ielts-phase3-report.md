# IELTS Speaking phase 3 report

## Progress source

Existing `speaking-ai` history endpoint backed by `speaking_conversations` and `speaking_messages`. Dashboard filters conversations whose mode/topic contains IELTS. No new store or database table.

## Stats

- Weekly sessions: completed IELTS conversations with at least one turn, limited to the current local week.
- Average band: `—`; the current AI schema does not return IELTS `overallBand`.
- Streak: unique consecutive local calendar days with completed IELTS conversations.
- Loading state uses a blank stat value to avoid layout shift; no-history fallback remains `0 / — / 0`.

## Bookmark/progress

No reusable bookmark or Speaking IELTS attempt repository exists in the app. No fake persistence was added. Card-level bookmark/progress UI remains intentionally absent until a real service is available.

## Browser smoke

PASS: authenticated local dashboard loaded; no 4xx/5xx or failed requests observed; direct route navigation worked for dashboard, Forecast, Roulette, Shadowing and Practice Bank; Shadowing rendered 30 lessons; mobile 390px had no horizontal overflow.

NOT RUN: real microphone permission, recording, AI submit, persisted AI result, Part 1/2/3 recording, and audio playback. Headless Chrome has no physical microphone; submitting would create real AI usage and user history.

## Validation

- Progress tests: 2/2 PASS.
- Existing Speaking AI tests: 6/6 PASS.
- TypeScript: PASS.
- `git diff --check`: PASS.
- Production build: PASS after final patch.

Status: **NOT PRODUCTION-READY** until real microphone/AI smoke and final build pass.
