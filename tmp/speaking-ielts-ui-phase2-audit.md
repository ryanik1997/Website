# IELTS Speaking UI phase 2 audit

- Reuse `AppShell` navigation, CSS variables, Lucide icons, and `ReadingRibbonBackdrop` visual language.
- Reuse `useSpeakingRecorder` for permission, MediaRecorder, browser transcript, playback, and error states.
- Reuse `sendSpeakingTurn`/`SpeakingAiPage` backend flow; it accepts transcript, duration, conversation ID, level, topic and mode. The Edge Function validates auth/plan/usage and stores history.
- Crawl data currently has 34 normalized source records, 30 downloaded assets, forecast state evidence (2/32/82), roulette states, and 31 shadowing routes. It does not provide a stable structured IELTS question schema for every item, so the practice adapter preserves `contentText` and source provenance instead of inventing questions.
- User progress/history is not exposed through a reusable Speaking IELTS repository. Dashboard stats therefore remain zero/— until existing Speaking AI history is surfaced; no separate localStorage history is introduced.
- New routes required: `/app/speaking/ielts`, `/practice-bank`, `/forecast`, `/roulette`, `/shadowing`, `/practice/:itemId`, `/samples`.
- No new AI endpoint. IELTS context is adapted into the existing `topic`/`mode` request fields and the current recorder/AI result UI remains authoritative.
