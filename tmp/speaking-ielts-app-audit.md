# Speaking IELTS app audit

Date: 2026-08-01

## Reuse map

- Shell/navigation: `apps/web/src/pages/AppShell.tsx`; add one leaf below `Speaking AI`.
- Route registration: `apps/web/src/App.tsx`; protected routes are nested under `/app` and `ProOnlyRoute`.
- Reading Corner visual language: `apps/web/src/features/reading-corner/readingCorner.css`, `BilingualPressPortal.tsx`, and `ReadingRibbonBackdrop.tsx`.
- Existing Speaking AI page: `apps/web/src/features/speaking-ai/SpeakingAiPage.tsx`.
- Existing recorder: `apps/web/src/features/speaking-ai/useSpeakingRecorder.ts`; browser SpeechRecognition + MediaRecorder, 60-second cap, microphone error states, no audio persistence.
- Existing AI API: `apps/web/src/features/speaking-ai/speakingAiApi.ts` and `supabase/functions/speaking-ai/index.ts`.

## Existing AI flow

1. Browser requests microphone permission.
2. SpeechRecognition produces transcript; MediaRecorder creates local playback blob.
3. Client sends transcript, duration, level/topic/mode/conversation ID to the Supabase `speaking-ai` Edge Function.
4. Function authenticates, checks plan/suspension/usage, calls DeepSeek with a JSON rubric, commits usage atomically, and stores conversation/messages.
5. Client renders correction, vocabulary, follow-up, history, retry and TTS playback.

The current backend explicitly does not claim pronunciation scoring because it receives browser transcript text only. IELTS Speaking should use this same adapter and preserve that limitation; no second AI pipeline is warranted.

## Data boundary

Source content belongs in an app-owned static catalog/import output. User progress, recordings, attempts and AI results must remain in existing Supabase speaking conversations/usage storage. The crawl artifact remains outside the app runtime.

## Required route

Proposed: `/app/speaking/ielts`, with data-driven child views for forecast, roulette, shadowing and practice. Existing `/app/speaking-ai` remains unchanged.

## Constraints

- Do not alter Reading Corner behavior.
- Do not hard-code 30 shadowing lessons as components.
- Do not add a new scoring endpoint or expose credentials/API keys.
- Use CSS variables and the existing app shell tokens.
