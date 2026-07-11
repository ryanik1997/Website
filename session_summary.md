# Session Summary — Ryan English Website

## Thông tin dự án
- **Thư mục:** `D:/App-English-Ryan/Website/`
- **Stack:** Vite + React + TypeScript + Tailwind + pnpm workspaces
- **Supabase project:** `ntcagvtkwxwsmlxlumfo`
- **Dev server:** `pnpm dev` → `http://localhost:5173`

---

## Trạng thái hiện tại

- **Branch:** `main` (git repo `D:/App-English-Ryan/Website`)
- **Phase:** Global catalog (hướng 3) — đề Reading/Listening ship cùng deploy, mọi user thấy
- **Session:** **2026-07-10 (cuối)** — Vocab ghost sync fix + RLS harden + Cambridge checklist/transcript + deploy **v0.2.3**
- **Session trước (cùng ngày):** Cambridge skill picker **Reading - Writing** (A2–C2); IELTS giữ Reading; Listening audioscript; Admin publish vocab
- **Tạm hoãn:** Batch import đề Reading Cam 11–20 — re-publish đề cũ có thể dùng **Admin → Publish nội dung**
- **Production:** https://ryanenglishv2.vercel.app — **deployed v0.2.3** (vocab dedupe/rekey, sync ghost soft-delete, chunked push)
- **Migrations Supabase:** 001–**016** (đã push trước); **017_checkin_days** — cần `pnpm db:push` (điểm danh cloud)
- **Dev:** `pnpm dev` → `/app/vocab` (Dọn thẻ trùng) · `/app/exam/...`

### Bundle đề sẵn trong `Tainguyen/`
| Kỹ năng | Level | File | Trạng thái |
|---------|-------|------|------------|
| Reading | A2 KET | `ket-reading-test1` | **Builtin** `catalog-reading-ket-a2-test1` |
| Reading | B1 PET | `pet-reading-test1` | **Builtin** `catalog-reading-pet-b1-test1` |
| Reading | B2 FCE | `fce-reading-test1` | **Builtin** `catalog-reading-fce-b2-test1` |
| Listening | A2 KET | `ket-listening-test1` | **Builtin** `catalog-listening-ket-a2-test1` |
| Listening | B1 PET | `pet-listening-test1` | **Builtin** `catalog-listening-pet-b1-test1` |
| Listening | B2 FCE | `fce-Listening-test1` | **Builtin** `catalog-listening-fce-b2-test1` |
| Reading | C1 CAE | `cae-Reading-test1` | **Builtin** `catalog-reading-cae-c1-test1` — **10 parts RW** (P1–8 Reading + P9–10 Writing, 120 phút) |
| Reading | C2 CPE | `cpe-Reading-test1` | **Builtin** `catalog-reading-cpe-c2-test1` — **9 parts RW** (P1–7 Reading + P8–9 Writing, 120 phút) |
| Listening | C1 CAE | `cae-Listening-test1` | **Builtin** `catalog-listening-cae-c1-test1` |
| Listening | IELTS Cam 9–20 | `IELTS/Listening IELTS_Test*_Cam*` (48 đề) | **Builtin** `catalog-listening-ielts-cam{X}-test{Y}` — auto `build-catalog.mjs` |

---

## Cấu trúc monorepo

```
Website/
├── apps/web/               ← Vite + React app chính
│   ├── src/
│   │   ├── App.tsx         ← Routes: / (landing) + /app/* (protected)
│   │   ├── main.tsx        ← AuthProvider wrap
│   │   ├── features/auth/  ← AuthContext, LoginPage, ProtectedRoute, AuthCallback, useSync
│   │   ├── lib/            ← supabase.ts, database.types.ts
│   │   ├── pages/
│   │   │   ├── landing/LandingPage.tsx  ← Trang chủ public + animated sun
│   │   │   └── AppShell.tsx            ← Sidebar + nav /app/*
│   │   └── styles/globals.css          ← 3 theme: light / mid / dark
│   ├── .env.local          ← VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (đã điền)
│   └── tailwind.config.js
├── packages/
│   ├── core/               ← SRS scheduler (SM-2) + License plans (TS thuần)
│   ├── db/                 ← Dexie schema (14 bảng) + sync cloud↔local
│   └── ui/                 ← Button, Card components
├── server/                 ← Local TTS Kokoro gateway — `pnpm dev:server` → :8787
├── supabase/
│   └── migrations/001_initial_schema.sql  ← ĐÃ CHẠY trên Supabase
└── pnpm-workspace.yaml
```

---

## Việc đã hoàn thành (session 2026-06-30)

### Vocab Study UI — Premium redesign (Giaodien/*.html) — HOÀN THÀNH
- [x] `study/vocabStudy.css` — dark gradient shell, stat bar, mode tabs, flashcard/quiz/game card
- [x] `study/DeckStatBar.tsx` — Total/Leared/Progress/Từ mới/Cần ôn/Đã vào lịch/Lần ôn kế tiếp
- [x] `study/StudyModeTabs.tsx` — 3 mode active + placeholder tabs (Listening, Từ yếu…)
- [x] `study/useDeckStudyStats.ts` — live stats từ Dexie SRS
- [x] `study/speakPhrase.ts` — Kokoro local TTS (lang `a` US); fallback Web Speech; SRS auto-phát khi lật về mặt trước
- [x] `StudySession.tsx` — wire shell + stat bar + mode tabs
- [x] `SrsMode.tsx` — flashcard Lặp lại: tags, flip Space, rating gradient 1–4, Hỏi AI, phát âm
- [x] `QuizMode.tsx` — Trắc nghiệm: 2×2 options, gradient word, example + voice, keyboard 1–4
- [x] `TypeMode.tsx` — Đoán nghĩa: nhìn VI → gõ EN, letter pills, blank example, Gợi ý/Không biết/Kiểm tra, SRS update
- [x] `pnpm --filter web exec tsc --noEmit` — pass
- [x] `vocabStudy.css` theme-aware — nền/text/card theo `data-theme` light/mid/dark (dùng `--bg-*`, `--text-*`, `--color-*`)
- [x] Danh sách từ (`CardPanel`) — cột **Trạng thái** (Từ mới / Cần ôn / Đã học) + badge **từ loại** (Danh từ, Động từ…)
- [x] **Nghe & Gõ** (`ListenTypeMode`) — mode mới theo `Giaodien/Nghe & Gõ lại từ vựng.html`: TTS + tốc độ, gõ lại, gợi ý/bỏ qua/xem đáp án, panel hướng dẫn + tiến độ
- [x] **SRS popup nhắc ôn** — `SrsReviewReminderModal`: chim animated, đếm từ due, chọn deck → SRS; hiện khi vào `/app` (F5/login) + mỗi 30 phút
- [x] Fix popup sau F5: `useSrsReviewPopup` dùng `useLiveQuery` + re-check sau `syncState === 'done'`
- [x] Import tự gán `pos` qua `posLabels.ts` (infer + chuẩn hóa noun/verb/adj → tiếng Việt)
- [x] **Học lại** — `StudyDoneActions` trên màn hình hoàn thành (SRS/Quiz/Type/Listen): nút Học lại + Quay lại/Xong
- [x] **SRS flip 3D** — Space/click lật thẻ với animation `rotateY` (`.vs-flip-scene` / `.vs-flip-inner.is-flipped`)
- [x] **Từ yếu** (`WeakWordsMode`) — bảng từ yếu (lapses/ease), nút Ôn SRS từ yếu; `isWeakWord()` + `studyFilter: 'weak'`
- [x] **Ôn tập** (`ReviewHubMode`) — hero đến giờ ôn, stat pills, lịch ôn sắp tới, chế độ ôn nhanh
- [x] **Thống kê** (`StatsMode`) — bento dashboard: hoạt động 14 ngày, phân bố rating/mode/trạng thái, top từ yếu
- [x] `StudyModeTabs` — 7 tab active (không còn placeholder disabled); `CardPanel` thêm nút Ôn tập / Từ yếu / Thống kê

### Listening — Cấu trúc Test/Part + Thêm câu/văn bản (Giaodien/8.jpg) — HOÀN THÀNH
- [x] `Lesson` metadata: `book`, `bookNum`, `test`, `part`, `topic`, `source` (Dexie v4)
- [x] `listeningMeta.ts` — nhóm Cambridge theo sách → Test → Part
- [x] `cambridgePacks.ts` — seed Cambridge 20 (Test 1 Parts 1–4, Test 2 Part 1) + KET A2
- [x] `ListeningTopicAccordion.tsx` — UI accordion như hình 8 (Dictation, Bắt đầu, + Thêm câu, + Văn bản)
- [x] `ListeningUserLessonCard.tsx` — My Lessons: + Thêm câu, + Văn bản
- [x] `AppendSentencesModal.tsx` — thêm 1 câu hoặc dán văn bản (tách câu tự động)
- [x] `lessonRepo.appendSentences()` — append vào bài đã có
- [x] Seed `listening_seed_v2` — bổ sung bài có cấu trúc Test/Part
- [x] Xóa/ẩn **Bài Cambridge (cũ)** — `purgeLegacyCambridge()` xóa bài flat khỏi DB, UI chỉ hiện bài có `book/test/part`

### Listening — Import & Phiên âm (MP3 → text) — HOÀN THÀNH
- [x] `packages/core/src/ai/transcribeAudio.ts` — Whisper API (OpenAI `whisper-1` / Groq `whisper-large-v3`), dùng API key từ Cài đặt AI
- [x] `packages/db/audioRepo.ts` — lưu blob MP3 local (`lesson:{id}`)
- [x] `ImportAudioModal.tsx` — upload MP3 (≤25MB) → phiên âm → preview câu → tạo bài user
- [x] `ListeningLibraryPage` — nút **Import & Phiên âm** mở modal, sau tạo redirect vào bài mới
- [x] Cần API key **Groq** hoặc **OpenAI** (DeepSeek/Gemini chưa hỗ trợ STT)

### Copy text trong app — HOÀN THÀNH
- [x] `lib/copyToClipboard.ts` — Clipboard API + `execCommand` fallback
- [x] `components/TextSelectionToolbar.tsx` — toolbar "Copy" khi bôi đen text (toàn app, trừ input/textarea)
- [x] `components/CopyButton.tsx` — nút copy tái sử dụng
- [x] `App.tsx` — mount `TextSelectionToolbar` global
- [x] `globals.css` + `AppShell` main — `user-select: text` cho nội dung
- [x] `ListeningTranscriptTab` — text chọn được + nút Copy/Sửa (không bọc trong `<button>`)
- [x] `ListeningSidebarCards` — Copy bản dịch + câu gốc
- [x] `SrsMode` — cho phép chọn text khi đã lật thẻ
- [x] `DictionaryModal` — Copy toàn bộ kết quả tra từ

### Local TTS → Frontend Listening — BƯỚC 3 HOÀN THÀNH
- [x] `apps/web/src/features/listening/tts.ts` — wrapper gọi `POST /api/tts`, `HTMLAudioElement`, prefetch, fallback Web Speech API
- [x] `ttsConfig.ts` — `VITE_TTS_SERVICE_URL` (default `http://localhost:8787`)
- [x] `useListeningPlayback.ts` — progress bar theo audio thật khi Kokoro active (RAF 60fps, `scaleX`, buffering state)
- [x] `LessonDetail.tsx`, `DictationSession.tsx` — dùng wrapper + hiện cảnh báo khi TTS local chưa sẵn sàng
- [x] `ListeningSidebarCards.tsx` — **xóa badge `ListeningTtsStatusBadge` ("Kokoro local")** ở card "Luyện phát âm" (theo `Giaodien/7.jpg`)
- [x] `server/src/index.ts` — CORS cho dev frontend `:5173`
- [x] `pnpm --filter web exec tsc --noEmit` + `pnpm --filter web build` — pass

#### Dev flow Listening + Kokoro:
```bash
pnpm dev:server    # terminal 1 — :8787
pnpm dev           # terminal 2 — :5173
# Optional: VITE_TTS_SERVICE_URL=http://localhost:8787 in apps/web/.env.local
```

---

### Local TTS Service (Kokoro) — BƯỚC 1 + 2 HOÀN THÀNH
- [x] **Bước 1:** Express + TypeScript gateway (`pnpm dev:server` → :8787)
- [x] **Bước 2:** Kokoro engine thật qua Python child process (:8788)
- [x] `GET /api/tts/health` — Node + Kokoro status (available/ready/deps/cache dir)
- [x] `POST /api/tts` — trả `audio/wav` thật, filesystem cache SHA-256 (text+voice+speed)
- [x] `server/python/kokoro_server.py` + `requirements.txt` + `scripts/setup-kokoro.ps1`
- [x] Graceful 503 JSON khi Kokoro chưa ready; Node không crash
- [x] Chưa đụng `apps/web` Listening / `tts.ts`
- [x] Verified: health OK, synth WAV OK (first run chậm do tải model HF), cache HIT OK

#### Chạy TTS service:
```bash
pnpm install --ignore-scripts
powershell -ExecutionPolicy Bypass -File server/scripts/setup-kokoro.ps1   # lần đầu
pnpm dev:server          # http://localhost:8787
pnpm --filter server typecheck
```

---

### Supabase — ĐÃ SETUP XONG
- [x] SQL migration chạy thành công (6 bảng + RLS + triggers)
  - `profiles`, `decks`, `cards`, `srs`, `writing_docs`, `ai_usage`
  - Row Level Security: mỗi user chỉ thấy data của mình
  - Trigger `handle_new_user`: tự tạo profile khi user đăng nhập lần đầu
- [x] Google OAuth bật — Client ID/Secret đã điền
- [x] Redirect URL: `http://localhost:5173/auth/callback`
- [x] Site URL: `http://localhost:5173`

### Code đã viết
- [x] Monorepo skeleton (pnpm workspaces, 5 packages)
- [x] AuthContext + Google OAuth flow
- [x] Landing page (`/`) — public, có animated sun (xoay + nổi + chớp mắt)
- [x] Protected routes (`/app/*`) — redirect về `/` nếu chưa login
- [x] AppShell sidebar với user info + logout + theme switcher
- [x] Dexie schema đầy đủ (local-first)
- [x] Sync layer: `syncLocalToCloud` + `syncCloudToLocal`
- [x] `packages/core`: SRS scheduler (SM-2) + License plans

### Landing page details
- Header: logo + chuông + nút Khách (dropdown: Đăng nhập / Tạo tài khoản)
- Hero: "Luyện thi / IELTS/ CAMBRIDGE" + animated sun mascot
- Sun animation: xoay tia (12s), nổi lên xuống (4s), chớp mắt, lắc smile, chat bubble "bạn cứ việc focus... đã có Ryan lo!"
- Features section: 6 cards (Vocab SRS, Writing AI, Listening, MindMap, Dictionary, Offline-first)
- Pricing section: tab switcher (Free 0đ / Pro 99k / Lifetime 599k) + 3 cột desktop / 1 card mobile
- PaymentModal: QR chuyển khoản (`public/images/qr-payment.jpg`) khi CTA Pro/Lifetime; mailto kích hoạt
- Footer: brand + liên hệ email + anchor links (#features, #pricing)
- Toàn bộ UI dùng CSS variables (không hardcode gray/indigo)

### Plan Management + Admin Page — HOÀN THÀNH (session 2026-06-30)

#### Kiến trúc (Hướng B — Supabase-based):
- Schema `profiles` đã có sẵn `plan` + `plan_expires_at` từ migration 001
- Migration 002 chỉ cần thêm `is_admin` + admin RLS policies

**Files:**
- [x] `supabase/migrations/002_admin_plan.sql` — ADD COLUMN is_admin + is_current_user_admin() function + 2 RLS policies (admin read all / admin update plan)
- [x] `features/auth/usePlanSync.ts` — hook đọc plan+is_admin từ Supabase sau login → lưu vào db.settings
- [x] `features/admin/AdminPage.tsx` — trang quản lý user: stats 4 ô + search + bảng users + UpgradeModal
- [x] `App.tsx` — route `/app/admin`
- [x] `AppShell.tsx` — gọi `usePlanSync()` + nav item Admin (chỉ hiện nếu is_admin=true)

#### Notes quan trọng:
- `usePlanSync` chạy 1 lần sau login, lưu plan vào db.settings → `canUse(plan, feature)` dùng ngay
- is_admin được set THỦ CÔNG trong Supabase SQL Editor: `UPDATE profiles SET is_admin=true WHERE email='...'`
- Admin page: search theo email/display_name, UpgradeModal cho chọn plan + thời hạn (1m/3m/12m/lifetime)
- calcExpiry: free/lifetime → null, các gói khác → now + months
- TypeScript cast `supabase as any` cho update plan (database.types.ts chưa include cột mới)
- RLS helper function `is_current_user_admin()` dùng SECURITY DEFINER để tránh recursion

#### Cách dùng (Flow):
1. Chạy `002_admin_plan.sql` trong Supabase SQL Editor
2. Chạy `UPDATE profiles SET is_admin=true WHERE email='your@gmail.com'`
3. Đăng xuất + đăng nhập lại → nav Admin xuất hiện
4. Vào Admin → tìm user → "Nâng cấp" → chọn gói + thời hạn → Lưu
5. User đăng xuất + đăng nhập lại → plan mới có hiệu lực

### Module MindMap — HOÀN THÀNH (session 2026-06-30)
- [x] `packages/core/src/ai/mindmapPrompt.ts` — buildMindmapExpandPrompt → JSON {children:[]}
- [x] `packages/db/src/local/repositories/mindmapRepo.ts` — CRUD mindmaps (create/saveTree/rename/delete)
- [x] `features/mindmap/types.ts` — MindNode type + createNode/flattenNodes/updateNode/appendChildren/removeNode + **radialLayout** algorithm (depth 0-3, dynamic R1, spread angle per branch)
- [x] `mindmapStore.ts` — Zustand (activeMapId)
- [x] `MindmapListPanel.tsx` — danh sách mindmap + node count + xóa
- [x] `NewMindmapModal.tsx` — nhập từ trung tâm → tạo root node
- [x] `MindmapCanvas.tsx` — custom SVG canvas: dot grid + bezier lines + positioned pill nodes + action toolbar (AI Expand / Add / Rename / Delete / Collapse)
- [x] `MindmapPage.tsx` — layout 2 panel
- [x] `App.tsx` — thêm route `/app/mindmap`
- [x] `AppShell.tsx` — thêm nav item MindMap + GitBranch icon

#### Notes quan trọng MindMap:
- Layout thuần custom: SVG bezier lines + absolutely positioned divs (không dùng React Flow)
- radialLayout: Level 1 R1=max(180, n*38), Level 2 R2=145 spread 75%, Level 3 R3=110
- Node interaction: click=select, double-click=rename inline, toolbar bên dưới node được chọn
- AI Expand: PRO gate (canUse plan 'mindmap_ai') → gọi AI → parse JSON → appendChildren → save
- Collapse: toggle node.collapsed → layout bỏ qua subtree đó
- Dot grid: SVG pattern repeating circle r=1
- Màu sắc: 8 màu BRANCH_COLORS, level 1 mỗi nhánh 1 màu, level 2+ inherit

### Module Dictionary — HOÀN THÀNH (session 2026-06-30)
- [x] `packages/core/src/ai/dictionaryPrompt.ts` — DictResult type, DictDefinition, buildDictionaryPrompt
- [x] `packages/db/src/local/repositories/dictRepo.ts` — get/save/isFresh (TTL 30 ngày)/recent
- [x] `apps/web/src/features/dictionary/dictStore.ts` — Zustand (isOpen, initialQuery, open/close)
- [x] `DictionaryFAB.tsx` — FAB cố định bottom-right, detect text selection khi click
- [x] `DictionaryModal.tsx` — search bar + cache lookup + AI call + result (IPA/POS/Level/Definitions/Collocations/Synonyms/TTS)
- [x] `SaveToDeckModal.tsx` — chọn deck + inline tạo deck mới + thêm card + success state
- [x] `AppShell.tsx` — gắn FAB + Modal vào layout chính (available toàn bộ /app pages)

#### Notes quan trọng Dictionary:
- FAB detect window.getSelection() → pre-fill query khi có text đang chọn
- Cache: isFresh() check TTL 30 ngày trước khi gọi AI
- API key/provider lấy từ db.settings (dùng chung với Writing module)
- SaveToDeckModal: z-[60] (trên DictionaryModal z-50), inline create deck không cần modal con
- Collocations + Synonyms đều clickable → tra tiếp từ liên quan
- TTS: speechSynthesis.speak() inline (không import từ listening module)

### Module Writing — HOÀN THÀNH (session 2026-06-30)
- [x] `packages/core/src/ai/provider.ts` — callAI, AI_PROVIDERS (OpenAI/DeepSeek/Groq/Gemini), AIMessage, AIResult
- [x] `packages/core/src/ai/writingPrompt.ts` — IELTSScore type, buildIELTSTask2Prompt, buildIELTSTask1Prompt, buildMasterPrompt
- [x] `packages/core/src/index.ts` — export ai layer
- [x] `packages/db` — WritingDoc.type mở rộng: 'ielts_task1'|'ielts_task2'|'master' (+ backward compat 'ielts')
- [x] `writingRepo.ts` — CRUD docs, hashText cache (SHA-256), aiUsage tracking, settings CRUD
- [x] `writingStore.ts` — Zustand (activeDocId, score, isGrading, gradingError)
- [x] `DocListPanel.tsx` — danh sách bài, badge loại/từ số
- [x] `NewDocModal.tsx` — chọn Task 1/Task 2/Free + nhập đề bài
- [x] `AiSettingsModal.tsx` — chọn provider, nhập API key (ẩn/hiện), chọn plan, xem usage hôm nay
- [x] `ScorePanel.tsx` — Overall band (lớn) + 4 tiêu chí + Strengths/Improvements + history chips
- [x] `WritingEditor.tsx` — textarea với auto-save 1.5s debounce + word count bar + grade flow đầy đủ
- [x] `WritingPage.tsx` — layout 2 panel

#### Notes quan trọng Writing:
- Grade flow: check API key → check plan → check rate limit → check cache (SHA-256 hash) → call AI → save history → recordUsage
- Cache: cùng text → trả ngay từ writingHistory.textHash, không gọi AI lần 2
- Rate limit: Free/Basic=0, Trial=5/ngày, Pro=20/ngày, Lifetime=∞
- Plan default: 'pro' (tự chọn trong AiSettings, dùng thử chứ không enforce)
- Tất cả 4 providers dùng OpenAI-compatible API format
- response_format: { type: 'json_object' } — AI buộc trả JSON
- Feedback viết bằng tiếng Việt (system prompt chỉ định)

### Module Listening — HOÀN THÀNH + PORT TỪ P15.8.302 (session 2026-06-30)
- [x] `types.ts` — LessonSentence, defaultSentence, splitIntoSentences, compareWords, accuracy, ratingFromAccuracy
- [x] `tts.ts` — Web Speech API wrapper (speak/stop/playSlow)
- [x] `cambridgePacks.ts` — 4 Cambridge packs mock (28 câu), seeded vào DB khi vào trang lần đầu
- [x] `lessonRepo.ts` trong `packages/db` — CRUD lessons
- [x] `listeningStore.ts` — Zustand (activeLessonId, studying, tab)
- [x] `ListeningLibraryPage.tsx` — thư viện bài nghe (LIBRARY ARCHIVES UI)
- [x] `ListeningLessonPage.tsx` — chi tiết bài: 3 tab Practice/Transcript/Shadowing + sidebar
- [x] `ListeningPracticeTab.tsx` — Ô chữ/Cloze per-word inputs, audio progress bar, word diff live, cloze count +/−
- [x] `ListeningShadowingTab.tsx` — pitch contour canvas, Web Speech recognition, mic YIN capture
- [x] `practiceUtils.ts`, `BlankInputMode.tsx`, `WordDiffPanel.tsx` — logic blank/cloze/diff port từ reference
- [x] `useListeningPlayback.ts` — TTS + progress bar ước lượng theo tốc độ đọc
- [x] `pitchContour.ts`, `PitchContourCanvas.tsx`, `useMicPitchCapture.ts` — YIN pitch + canvas
- [x] `useSpeechRecognition.ts` — Web Speech API wrapper shadowing
- [x] `ListeningSidebarCards.tsx` — dịch nghĩa + phát âm (dots locked đến khi hoàn thành câu)
- [x] `CreateLessonModal.tsx`, `DictationSession.tsx` (legacy overlay)
- [x] Route `/app/listening/:lessonId` + `ListeningLayout.tsx` seed Cambridge packs

#### Notes quan trọng Listening:
- TTS: Web Speech API (không cần server). `speak(text, rate=0.85)`, chậm `rate=0.6`
- Audio progress bar: ước lượng duration (không có HTMLAudioElement như Electron app cũ)
- Pitch contour "Nghe mẫu": synthetic reference contour; "Bắt đầu đọc": mic YIN thật
- Cloze: `clozeCount=0` = ẩn tất cả từ eligible; +/- điều chỉnh số ô trống
- SRS sentences được lưu embedded trong `lesson.sentences[]` (không dùng bảng `srs`)
- Cambridge packs chỉ seed 1 lần (check `count > 0` trước)
- Accuracy → rating: ≥90%=4, ≥70%=3, ≥40%=2, <40%=1
- `pnpm --filter web exec tsc --noEmit` + `pnpm --filter web build` — pass

### Module Vocabulary — HOÀN THÀNH (session 2026-06-30)
- [x] Repository layer: `deckRepo`, `cardRepo`, `srsRepo` trong `packages/db/src/local/repositories/`
- [x] `packages/db/src/index.ts` export đầy đủ repos
- [x] `vocabStore` (Zustand) — activeDeckId + studyMode state
- [x] `DeckPanel` — danh sách deck (live query), tạo/xóa deck, badge "X ôn"
- [x] `CardPanel` — bảng từ (live query), thêm/sửa/xóa từ, 3 nút học
- [x] `DeckEditorModal` — tạo/sửa bộ thẻ
- [x] `CardEditorModal` — thêm/sửa từ (phrase/meaning/example/IPA), "Thêm & tiếp"
- [x] `StudySession` — overlay toàn màn hình, tab chuyển chế độ
- [x] `SrsMode` — flip card + rate 1-4 (SM-2), progress bar, thống kê cuối
- [x] `QuizMode` — 4 đáp án, shuffle, highlight đúng/sai, điểm %
- [x] `TypeMode` — gõ nghĩa, fuzzy match variants, đáp án khi sai
- [x] `VocabularyPage` — layout 2 panel + StudySession overlay
- [x] Build production thành công (tsc + vite build sạch)

#### Notes quan trọng:
- `cardRepo.add()` tự init SRS state (dueAt = now → all new cards immediately due)
- `deckRepo.delete()` cascade xóa cards + srs + reviewLog
- StudySession dùng `absolute inset-0` → VocabularyPage cần `relative h-full`

---

### Vercel Deploy Prep — HOÀN THÀNH (session 2026-06-30)
- [x] `apps/web/vercel.json` — SPA rewrite: tất cả route (trừ `/assets/*`) → `index.html`
- [x] `apps/web/vite.config.ts` — `base: '/'`, `build.outDir: 'dist'` (explicit)
- [x] `apps/web/public/_redirects` — Netlify fallback: `/* /index.html 200`
- [x] `apps/web/.env.example` — template env vars (không có giá trị thật)
- [x] `pnpm --filter web build` — sạch (tsc + vite build)

#### Vercel setup notes:
- **Deployed:** https://ryanenglishv2.vercel.app/
- **Root Directory: ĐỂ TRỐNG** (repo root `Website/`) — KHÔNG đặt `apps/web`
  - Monorepo cần `packages/*` + `pnpm-workspace.yaml` ở root để build
  - Lỗi `" apps/web" does not exist` = Root Directory có **space thừa** hoặc sai path
- `vercel.json` (repo root) — build + output `apps/web/dist` + SPA routes
- `apps/web/spa.vercel.json` — Vite plugin copy vào `dist/vercel.json` mỗi lần build
- **Output Directory:** `apps/web/dist` (root trống) hoặc `dist` (root = apps/web) — KHÔNG đặt `public`
- **QUAN TRỌNG:** `cleanUrls: false` — `cleanUrls: true` làm rewrite `/index.html` bị ignore → 404 SPA
- Dùng `routes` + `filesystem` handle thay vì `rewrites` đơn giản (đáng tin hơn cho Vite SPA)
- Env vars (bắt buộc): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Supabase → Auth → URL Configuration:
  - Site URL: `https://ryanenglishv2.vercel.app`
  - Redirect URLs: `https://ryanenglishv2.vercel.app/` + `http://localhost:5173/`
- **BrowserRouter** (2026 fix login) — OAuth `#access_token` không còn phá route; `recoverOAuthSession` chạy trong `main.tsx` trước khi render
- OAuth redirect về `/` (không dùng `/auth/callback`) — tránh 404 Vercel static
- `AuthContext` xử lý `?code=` PKCE ngay khi app load
- Production deploy 2026-06-30: bundle `index-BQV91eba.js` (đã verify redirectTo = origin + `/`)
- **OAuth production: HOẠT ĐỘNG** — đăng nhập Gmail OK trên https://ryanenglishv2.vercel.app/
- **OAuth fix:** Supabase redirect `#access_token=...` → `recoverOAuthSession` (trước React render) → `setSession` → URL `/app/vocab`. Đăng xuất → `location.replace('/')`.
- Vite build copy `index.html` → mọi route path + `404.html` (fallback khi rewrites không apply)
- **Commit `vercel.json` ở repo root vào Git** nếu deploy qua GitHub

---

## Lỗi còn tồn tại / Chưa test

- [x] Google OAuth flow end-to-end trên production — OK (2026-06-30)
- [x] Deploy production Vercel — OK https://ryanenglishv2.vercel.app/
- [ ] **Listening Ô CHỮ trên mobile iOS** — user từng báo ~75% fix (mất chữ "o" trong "do", ô trống, vòng tròn đỏ trùng WordDiff). Đã rewrite DOM thuần + tách `ListeningAudioBar`; **chờ user hard refresh production và xác nhận**
- [x] **Listening thanh cuộn ngang/dọc thừa** (dưới tabs) — fix layout shell + ẩn scrollbar; bỏ `overflow-x-auto` tabs + debug observer
- [ ] **Web Audio trên iOS** — chime/buzz/pháo hoa có thể cần tương tác người dùng trước (autoplay policy)
- [ ] **IELTS Cam20 Listening UI** — fix `notePassage` + Choose TWO + **P1 bảng 4 cột** + **Part 2 segment UI**; **chờ user hard refresh + so sánh `Giaodien/a2` (bảng) + `a5–a10` + `Part2-Listening/a7,a10`**
- [ ] Nếu user đã import ZIP Cam20 cũ vào Dexie → xóa đề cũ hoặc re-import `Listening IELTS_Test1_Cam20.zip` mới
- [ ] `pnpm-workspace.yaml` bị hook tự động thêm `allowBuilds` — dùng `pnpm install --ignore-scripts` để tránh lỗi
- [ ] `packages/db` cần `@supabase/supabase-js` là peerDependency (đã cấu hình)
- [ ] **CAE C1 RW Part 10** — `part10-page.jpg` placeholder (chưa ảnh Q58 riêng); xem mục Cambridge RW cuối file

---

### Module Settings + Code Splitting — HOÀN THÀNH (session 2026-06-30)
- [x] `lib/theme.ts` — getTheme/setTheme + THEMES preview config (dùng chung AppShell + Settings)
- [x] `features/settings/useAiSettings.ts` — hook load/save/test AI settings (tách từ AiSettingsModal)
- [x] `features/settings/AiSettingsPanel.tsx` — provider grid + API key + test kết nối + usage
- [x] `SettingsPage.tsx` — 3 tab: Giao diện (theme preview cards), AI (shared panel), Tài khoản (plan + features + contact)
- [x] `AiSettingsModal.tsx` — refactor dùng AiSettingsPanel (DRY)
- [x] `App.tsx` — React.lazy() + Suspense cho tất cả route pages
- [x] `components/PageFallback.tsx` — spinner loading khi lazy load chunk
- [x] Build production thành công — main chunk ~384KB (từ 588KB), pages tách riêng (Vocab 28KB, Writing 22KB...)

#### Notes quan trọng Settings:
- Theme: 3 chế độ light/mid/dark, lưu localStorage `ryan-theme`, preview card mini UI
- AI tab: tái dùng logic AiSettingsModal, thêm nút "Kiểm tra kết nối" (callAI test JSON)
- Account tab: plan từ db.settings (sync Supabase qua usePlanSync), hiển thị features enabled qua canUse()
- Contact: email ryanik1997@gmail.com + hướng dẫn nâng cấp qua admin
- Plan selector trong AI settings đã bỏ (plan giờ sync từ Supabase, không override thủ công)
- Deep link tab: `/app/settings?tab=ai` hoặc `?tab=account` (HashRouter)

### SRS Push Reminder (local SW) — HOÀN THÀNH (session 2026-06-30)
- [x] `public/sw.js` — push + notificationclick → `/app/vocab`; **+ cache-first catalog audio** (2026-07-07)
- [x] `features/notifications/useNotifications.ts` — local schedule, Dexie due count, localStorage
- [x] `SettingsPage` tab Giao diện — section "Nhắc nhở ôn từ hàng ngày"
- [x] `App.tsx` — đăng ký SW on load; `AppShell` — `useNotifications()` interval
- Best-effort: chỉ chạy khi tab mở, không cần VAPID/server

### AppShell Sidebar Polish — HOÀN THÀNH (session 2026-06-30)
- [x] Logo mark gradient R + tagline IELTS · AI · SRS
- [x] Nav badges ôn từ (vocab SRS + listening dueAt) real-time
- [x] ThemeSwitcher 3 dot swatches + active ring
- [x] User area: avatar w-8, divider, logout hover text
- [x] Sidebar `w-52`

### License Backend (Payment notify) — HOÀN THÀNH (session 2026-06-30)
- [x] Edge Function `notify-payment` — Resend email admin + lưu `payment_requests`
- [x] `004_payment_requests.sql` — bảng + RLS (user read own, admin all)
- [x] `PaymentModal` — nút "Thông báo đã chuyển" (chỉ khi đã login)
- [x] `AdminPage` — tab "Yêu cầu kích hoạt", badge pending, 1-click Kích hoạt
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Deploy Edge Function:
```bash
npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo
```
Secrets: `RESEND_API_KEY`, `ADMIN_EMAIL` (tuỳ chọn `APP_ORIGIN`)
Chạy `004_payment_requests.sql` trong Supabase SQL Editor trước khi test.

### Supabase Cloud Sync — HOÀN THÀNH (session 2026-06-30)
- [x] `sync.ts` mở rộng — writingDocs + mindmaps push/pull, `isLocalEmpty()`, error handling
- [x] `003_writing_mindmap_sync.sql` — mindmaps table + writing_docs type constraint
- [x] `useSyncManager.ts` + `SyncProvider` — login/auto 5min/online/manual sync
- [x] `SyncOnLogin.tsx` — toast khôi phục / đồng bộ xong
- [x] `AppShell` — sync indicator sidebar; Settings tab Tài khoản — "Đồng bộ đám mây"
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Notes quan trọng Cloud Sync:
- Thiết bị mới (local trống) → `syncCloudToLocal`; có data → `syncLocalToCloud`
- `ryan-last-sync` trong localStorage
- **Chạy `003_writing_mindmap_sync.sql` trên Supabase trước khi test**

### Daily Goal + Streak Celebration — HOÀN THÀNH (session 2026-06-30)
- [x] `settingsRepo.ts` — getSetting / putSetting, export từ `@ryan/db`
- [x] `useDailyGoal.ts` — goal words/translations, progress từ reviewLog hôm nay
- [x] `DailyGoalCard.tsx` — progress bars, inline edit target (⚙)
- [x] `StreakCelebration.tsx` — overlay confetti, 1 lần/ngày (localStorage)
- [x] `HomePage` — DailyGoalCard, StreakCelebration, Translation quick action, flame badge streak≥3
- [x] `PracticeSession` — ghi reviewLog mode `translation` khi rate
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Notes quan trọng Daily Goal:
- Settings keys: `daily_goal_words` (10), `daily_goal_translations` (5)
- Vocab count: reviewLog mode srs/quiz/type; translation: mode `translation`
- Celebrate key: `ryan-streak-celebrated-YYYY-MM-DD`

### Backup/Restore toàn bộ data — HOÀN THÀNH (session 2026-06-30)
- [x] `features/settings/backupRestore.ts` — exportBackup, importBackup (bulkPut merge), estimateBackupSize
- [x] `ConfirmRestoreModal.tsx` — xác nhận merge, loading, success summary, error
- [x] `SettingsPage` tab Tài khoản — section "Dữ liệu & Backup" (xuất/nhập JSON)
- [x] Format backup v1: 13 bảng (không audioBlobs, không dictionaryCache)
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Notes quan trọng Backup:
- File: `ryan-english-backup-YYYY-MM-DD.json`
- Restore MERGE qua `bulkPut` — không xóa data cũ
- Ước tính size: ~750 bytes/record

### Translation Practice — HOÀN THÀNH (session 2026-06-30)
- [x] Dexie schema v2: `TranslationSet` + `TranslationSentence` (SRS nhúng trong sentence)
- [x] `translationRepo.ts` — CRUD + addSentence/deleteSentence/updateSrsState
- [x] `sampleSets.ts` — 3 bộ mẫu seed (IELTS T2×10, IELTS T1×8, Daily×10)
- [x] `translationStore.ts` — activeSetId, practicing
- [x] `TranslationListPanel` — sidebar + badge category + due count + xóa (user only)
- [x] `NewSetModal` — tạo bộ câu rỗng
- [x] `TranslationDetail` — danh sách câu + thêm/xóa inline
- [x] `PracticeSession` — overlay luyện dịch, fuzzy compare, highlight, SRS rating
- [x] `TranslationPage` — layout 2 panel + seed on mount
- [x] Route `/app/translation` + nav "Dịch câu" (Languages icon, giữa Nghe và MindMap)
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Notes quan trọng Translation:
- Fuzzy compare: normalize lowercase, bỏ dấu câu, match từ (cho phép lệch 1 ký tự)
- Highlight: đúng = `--color-primary`, thiếu = `--color-accent`, thừa = `--text-muted`
- SRS đơn giản: Dễ +3 ngày, Ổn +1 ngày, Khó ôn lại ngay
- Seed check `translationRepo.count() > 0` trước khi insert mẫu

### Import/Export từ vựng — HOÀN THÀNH (session 2026-06-30)
- [x] `features/vocab/importExport.ts` — export CSV/JSON (RFC 4180), parse CSV/JSON (version 1), template CSV
- [x] `features/vocab/ImportModal.tsx` — drop zone, preview 5 dòng, import qua `cardRepo.add()`, cảnh báo >500 từ
- [x] `CardPanel.tsx` — nút **Xuất** (dropdown CSV/JSON, disabled khi rỗng) + **Nhập** (mở ImportModal)
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Notes quan trọng Import/Export:
- CSV header: `phrase,meaning,example,ipaUS,pos` — `phrase` + `meaning` bắt buộc
- JSON format: `{ version: 1, deck: { name, book, unit }, cards: [...] }`
- Import chỉ thêm vào deck hiện tại (không tạo deck mới từ JSON)
- UI dùng CSS variables, không hardcode màu

### Module Pages Đồng Nhất (PanelHeader + PanelEmpty) — HOÀN THÀNH (session 2026-06-30)
- [x] `components/PanelHeader.tsx` — header chuẩn cho left/right panel (title, subtitle, actions slot, border)
- [x] `components/PanelEmpty.tsx` — empty state chuẩn (icon, message, optional action)
- [x] Áp dụng PanelHeader: `DeckPanel`, `CardPanel`, `LessonPanel`, `DocListPanel`, `MindmapListPanel`, `TranslationListPanel`
- [x] Áp dụng PanelEmpty: `DeckPanel`, `LessonPanel`, `DocListPanel`, `MindmapListPanel`, `TranslationListPanel`
- [x] Đồng nhất left panel width → `w-60` (240px) — LessonPanel + TranslationListPanel từ `w-64` → `w-60`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Notes quan trọng Panel unify:
- Header: `px-4 py-3.5`, `text-sm` title, `text-xs` subtitle, CSS variables only
- CardPanel header dùng PanelHeader nhưng giữ nguyên study/export/import/thêm từ trong `actions`
- Right panel detail headers (LessonDetail, TranslationDetail...) chưa đổi — chỉ left list panels + CardPanel

### HomePage Dashboard Polish — HOÀN THÀNH (session 2026-06-30)
- [x] Dynamic greeting/subtitle theo giờ + streak
- [x] StatCard accent bar + quick actions grid
- [x] Onboarding checklist shimmer animation (`globals.css` `.progress-shimmer`)
- [x] **StudyActivityGrid** — thay checklist "Bắt đầu với Ryan English" bằng lưới 60 ngày học (`reviewLog`, 10×6 ô, đậm/nhạt theo lượt học)

### Onboarding Empty States — HOÀN THÀNH (session 2026-06-30)
- [x] `components/EmptyStateCard.tsx` — welcome card dùng chung (icon, CTA, tip, footer link)
- [x] `VocabularyPage.tsx` — khi chưa có deck: welcome + nút "Tạo bộ thẻ ngay" → DeckEditorModal
- [x] `WritingPage.tsx` — khi chưa có bài: welcome + "Tạo bài viết đầu tiên" → NewDocModal; link Settings > AI
- [x] `features/home/useHomeStats.ts` — stats từ Dexie: wordsStudied, docCount, streak (reviewLog), onboarding 5 bước
- [x] `HomePage.tsx` — dashboard: 3 stat cards + 4 quick actions + checklist onboarding (hiện khi < 5/5)
- [x] Build production thành công (tsc + vite build sạch)

#### Notes quan trọng Onboarding:
- Empty state chỉ render khi `useLiveQuery` trả về mảng rỗng (không flash loading)
- Streak tính từ `reviewLog` — ngày liên tiếp có ôn tập SRS
- Onboarding 5 bước: tạo deck → 10 từ → SRS review → writing doc → API key
- Writing empty state ẩn DocListPanel; Vocabulary empty state ẩn DeckPanel/CardPanel
- Tất cả UI dùng CSS variables (`--bg-card`, `--color-primary`...)

### Writing UI — Giaodien redesign + import ảnh (session 2026-06-30)
- [x] `writingStudy.css` — layout Focus & Precision, theme-aware (light/mid/dark)
- [x] `WritingEditor.tsx` — 2 cột: đề bài (trái) + editor (phải), timer, action bar, AI feedback drawer
- [x] `WritingTopicPanel.tsx` — badge, ảnh đề, prompt glass box, hướng dẫn
- [x] Import JPG/WEBP — `writingImage.ts` (nén, validate), modal tạo bài + panel đề
- [x] Dexie v5 `promptImage` + sync `prompt_image` + migration `005_writing_prompt_image.sql`

### Writing — Cambridge A2–C2 track (session 2026-06-30)
- [x] `writingUiConfig.ts` — nhãn UI riêng Cambridge (kicker, title, placeholder, submit) vs IELTS
- [x] `writingPrompt.ts` — `CambridgeScore` 4 tiêu chí (Content, Communicative Achievement, Organisation, Language, 0–5); `buildCambridgePrompt` / `buildWritingGradePrompt`
- [x] `ScorePanel.tsx` — hiển thị điểm Cambridge (0–5 + level) hoặc band IELTS tùy loại bài
- [x] `WritingCambridgePage` + `WritingLibraryPage` — route `/app/writing/cambridge`
- [x] Fix nhãn IELTS trên trang Cambridge: `DocListPanel` auto-chọn bài đúng track; `WritingEditor` prop `allowedTypes`
- [x] Fix tsc: `WritingEditor` framework merge; `useWritingDashboard` `getCriterionBand` cho cả 2 framework
- [x] `pnpm --filter web exec tsc --noEmit` — pass
- [x] Fix Dashboard thống kê trống: layout `AppShell`/`WritingLayout` + `wd-page` height; empty state có UI đầy đủ; `parseScore` legacy; errorBank sort in-memory
- [x] Supabase migrations push: `006_cambridge_writing_types.sql` + `007_writing_type_constraint_repair.sql` (fix writing_docs type check + prompt_image); cập nhật `friendlySyncError`
- [x] **Cấu trúc câu** — sidebar `/app/sentence-structure`: danh sách + điền A/B, lật thẻ, kiểm tra; seed 6 mẫu; Dexie v7 `sentenceStructures`
- [x] Cambridge hub 3 bước: `/cambridge` (chọn A2–C2) → `/cambridge/:level` (email/story/…) → `/cambridge/:level/:genre` (editor + tìm kiếm); field `genre` Dexie v6 + migration `008_writing_genre.sql`
- [x] IELTS hub 3 bước: `/practice` (Task 1/2/Free) → `/practice/:track` (line graph, opinion…) → `/practice/:track/:genre` (editor); `ieltsCatalog.ts` + `WritingGenre` mở rộng
- [x] **Luyện dịch IELTS hub 3 bước** — `/translate` → `/translate/:track` → `/translate/:track/:genre`; `translationCatalog.ts`; Dexie v8 genre + v9 category
- [x] **Translation tracks mới:** Cấu trúc cơ bản (8 grammar), Collocations & Vocab (15 chủ đề), Dịch đoạn Band 6.5 (15), Band 8.0 (10), Essay hoàn chỉnh (15), Của tôi

### Translation — label Đã dịch / Chưa dịch + bấm câu để dịch (session 2026-06-30)
- [x] `TranslationSentence.srsState.translatedAt` — đánh dấu khi user bấm Kiểm tra trong `PracticeSession`
- [x] `translationRepo.markTranslated()` + `isSentenceTranslated()` helper
- [x] `SentenceRow` — badge cạnh Dễ/TB/Khó: **Đã dịch** (primary) / **Chưa dịch** (muted)
- [x] `applyPracticeRating` giữ `translatedAt` khi rate SRS
- [x] Bấm bất kỳ câu nào trong danh sách → `startPracticeSentence(id)` mở luyện dịch 1 câu
- [x] Nút **Luyện tập** vẫn chạy phiên đầy đủ (ưu tiên câu cần ôn)
- [x] **Practice UI redesign** (`translationPractice.css`) — badge VN→English, câu VI lớn, chip ẩn từ
- [x] `translationChips.ts` — mỗi từ trong đáp án EN = 1 chip; mở theo thứ tự khi gõ đúng từ (live, kể cả từ lặp)
- [x] Chip khóa hiện `●●●` / `N từ`; mở xanh + nút nghe TTS; **Hiện tất cả** / **Ẩn gợi ý**
- [x] Smart Segment panel sau kiểm tra; Enter để nộp; Chấm AI riêng (placeholder)
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Session 2026-06-30 → 2026-07-01 — Listening Ô CHỮ + phản hồi âm thanh/pháo hoa

#### Listening Ô CHỮ — fix mất chữ khi gõ
- [x] `BlankInputMode.tsx` — input DOM thuần (port P15.8.302), `forwardRef` + `collectAnswer()` đọc DOM
- [x] `ListeningAudioBar.tsx` — tách progress TTS, tránh re-render 60fps làm mất ký tự
- [x] `practiceUtils.collectBlankAnswer` (boxes) — `join(' ')` trực tiếp, bỏ placeholder `…`
- [x] `globals.css` — width px động; `readOnly` khi khóa (không `disabled`)
- [x] WordDiff live: 1 panel trong `BlankInputMode` khi bật "Hiện kết quả ngay"

#### Listening — celebrate khi đúng 100%
- [x] `lib/studyFeedback.ts` + `components/StudyFireworks.tsx` (tách dùng chung)
- [x] `ListeningPracticeTab` — Kiểm tra → 100% → chime + pháo hoa

#### Vocab — âm thanh đúng/sai
- [x] `useStudyAnswerFeedback.ts` — hook Quiz / Type / Nghe & Gõ
- [x] Đúng → chime + pháo hoa; Sai / Bỏ qua / Không biết → buzz
- [x] SRS **không** có (chế độ rating 1–4, không đúng/sai nhị phân)

#### SRS — Space phát audio
- [x] `SrsMode.doFlip` — mỗi lần Space/lật thẻ đều `speakPhrase(card.phrase)` (trước chỉ phát khi quay về mặt trước)

#### Deploy
- [x] Nhiều lần `pnpm deploy:prod` — production OK **https://ryanenglishv2.vercel.app**
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Key files session này
| File | Vai trò |
|------|---------|
| `features/listening/BlankInputMode.tsx` | Input DOM thuần, `collectAnswer()` |
| `features/listening/ListeningAudioBar.tsx` | Tách progress TTS, tránh re-render input |
| `features/listening/ListeningPracticeTab.tsx` | Practice + celebrate 100% |
| `features/listening/practiceUtils.ts` | `collectBlankAnswer`, word diff |
| `lib/studyFeedback.ts` | Chime, buzz, fireworks dùng chung |
| `components/StudyFireworks.tsx` | Canvas pháo hoa ~2.8s |
| `features/vocab/study/useStudyAnswerFeedback.ts` | Hook phản hồi Quiz/Type/Nghe&Gõ |
| `features/vocab/modes/SrsMode.tsx` | Space → phát audio mỗi lần lật |

#### Reference (Electron cũ)
- `D:\App-English-Ryan\ProjectGitHub\App English_P15.8.302\assets\chunks\ryan-v24-13-script-172-listening-dictation-core.js` — `.ry-lsn-blank` DOM, `collectBlankAnswer()` join values

#### Cần test lại (user chưa confirm 100%)
- [ ] Listening Ô CHỮ trên **mobile iOS** — hard refresh production, test gõ "do" và câu dài
- [ ] Âm thanh Web Audio trên iOS sau tương tác đầu tiên (autoplay policy)

### Luyện thi Reading — IELTS UI (session 2026-07-01)
- [x] `examData.ts` — 3 parts (kākāpō / elms / sleep), TFNG + matching paragraph + matching features + MC
- [x] `readingTest.css` — split-pane IELTS shell (passage trái, câu hỏi phải, footer Part pills)
- [x] `ReadingTest.tsx` — header timer + Submit, bottom nav, lưu draft localStorage
- [x] `ReadingQuestionPanel.tsx` — TRUE/FALSE/NOT GIVEN, matching A–G, features A–C
- [x] `ExamResult.tsx` + `ExamHome.tsx` — cập nhật theo schema mới
- [x] Route: `/app/exam/reading/ielts-reading-01`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Session 2026-07-01 — Listening fix thanh cuộn thừa

- [x] `globals.css` — `.listening-lesson-shell` + `.listening-lesson-scroll` (overflow-x hidden, scrollbar ẩn)
- [x] `ListeningLessonPage` — bỏ debug MutationObserver/inline style; shell 2 lớp (hidden + scroll)
- [x] `ListeningTabs` — `overflow-hidden` + `flex-wrap` (không còn `overflow-x-auto`)
- [x] `ListeningPracticeTab` — `min-w-0 overflow-hidden` card + textarea
- [x] `ListeningLibraryPage` — dùng chung scroll shell
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Luyện thi — chỉ Reading + Listening (session 2026-07-01) — HOÀN THÀNH
- [x] IELTS + Cambridge track: bỏ Writing khỏi hub (Writing ở module Viết); bỏ nút Full Mock IELTS trên `ExamTrackPage`
- [x] Cambridge: Reading thay Writing; import PDF gắn `cambridgeLevel`

### IELTS — đề mẫu Listening 4×10 (session 2026-07-01) — HOÀN THÀNH
- [x] `ieltsExamFormats.ts` — metadata 4 parts · 40 câu · ~30 phút · Academic & GT · gõ khi nghe
- [x] `ielts-listening-sample-01` — Part1 form (10 gap) · Part2 monologue (5 MC+5 matching) · Part3 academic (6 gap+4 MC) · Part4 lecture (6 gap+4 MC)
- [x] Hiện trên `/app/exam/track/ielts`; `bandHint` hiển thị cấu trúc đề

### Cambridge — đề mẫu theo format thi thật A2–C2 (session 2026-07-01) — HOÀN THÀNH
- [x] `cambridgeExamFormats.ts` — metadata parts/câu/phút/% theo KET/PET/FCE/CAE/CPE
- [x] `cambridgeSampleBuilders.ts` — helpers tạo Part + câu hỏi
- [x] `cambridgeReadingSamples.ts` — Reading đúng số Part (A2:5, B1:6, B2:7, C1:8, C2:7); bandHint `Sample X/Y câu`
- [x] `cambridgeListeningSamples.ts` — Listening đúng số Part (A2:5×25, B1:4×25, B2–C2:4×30 câu)
- [x] `cambridgeExamLevels.ts` — mô tả format thi trên hub; ExamTrackPage hiện `bandHint`

### Cambridge A2–C2 — Luyện thi (session 2026-07-01) — HOÀN THÀNH
- [x] `cambridgeExamLevels.ts` — 5 cấp A2 (KET) → C2 (CPE), skills Reading + Listening (Writing ở module Viết)
- [x] `examTracks.ts` — hub 2 track: IELTS + Cambridge A2–C2 (bỏ KET riêng, redirect `/track/ket` → `/track/cambridge/a2`)
- [x] `ExamTrackPage` — `/app/exam/track/cambridge` chọn level; `/cambridge/:level` đề + import + link Writing
- [x] `ListeningExamType` mở rộng: `pet` | `fce` | `cae` | `cpe` (B1–C2 dùng UI multi-part như IELTS)
- [x] `ImportListeningModal` — template JSON theo `defaultExamType` từng level
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Listening Phase 3 — hub + ZIP + Full Mock (session 2026-07-01) — HOÀN THÀNH
- [x] `examTracks.ts` + `ExamHome` hub 2 track (IELTS / Cambridge A2–C2)
- [x] `ExamTrackPage` — `/app/exam/track/:trackId/:level?`, Full Mock + import + danh sách đề
- [x] `importListeningZip.ts` + `fflate` — import ZIP bundle (exam.json + MP3/ảnh)
- [x] `fullMockData` + `fullMockSession` — Full Test IELTS `ielts-mock-01`
- [x] `FullMockIntro` → Reading → Listening → `WritingMockTest` → `FullMockSummary`
- [x] Reading/Listening nộp trong Full Mock hiện `FullMockStageResult` + chuyển kỹ năng
- [x] `WritingMockTest` — Task 1 + Task 2 (đếm từ, timer, chưa chấm AI)
- [x] Routes: `/app/exam/full/:mockId`, `/summary`, `/writing/:mockId`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Listening Phase 2 — import + IELTS + Dexie (session 2026-07-01) — HOÀN THÀNH
- [x] Dexie v11 `listeningExams` + `listeningExamRepo`
- [x] `ImportListeningModal` — JSON + MP3/ảnh (q1.mp3, q1-a.jpg, part1.mp3), template tải về
- [x] `importListeningUtils.ts` — parse, validate, lưu blob `audioRepo`
- [x] `ListeningIeltsTest` — audio sticky theo Part, gap-fill/MC/matching, giới hạn lượt nghe (exam mode)
- [x] `ListeningKetTest` — tách từ shell Phase 1, hỗ trợ `examMode`
- [x] Đề builtin `ielts-listening-sample-01` (Part 1–2)
- [x] Backup v3 gồm `listeningExams`
- [x] `ExamHome` — Import Listening + xóa đề import
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Listening KET Phase 1 — card UI (session 2026-07-01) — HOÀN THÀNH
- [x] `listeningExamData.ts` — schema + đề mẫu `ket-listening-sample-01` (6 câu, `audioKey`/`audioUrl`/`imageUrl` optional)
- [x] `useExamQuestionAudio.ts` — MP3 từ `audioRepo` hoặc URL, fallback TTS `ttsText`
- [x] `ListeningQuestionCard` + `ListeningExamAudioBar` — Phát / Phát chậm, picture MC placeholder
- [x] `ListeningTest.tsx` — header timer, Chưa chắc chắn, Submit/Next, dots nav, draft localStorage
- [x] `ListeningExamResult.tsx` — chấm điểm + giải thích
- [x] Route `/app/exam/listening/:examId` + `ExamHome` section Listening
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Reading — Highlight passage khi làm bài (session 2026-07-01) — HOÀN THÀNH
- [x] `readingHighlightUtils.ts` — offset-based highlights theo `blockId`, merge/trừ range, parse Selection
- [x] `ReadingHighlightableText.tsx` — render `<mark>` cho từng khối text
- [x] `ReadingHighlightToolbar.tsx` — toolbar chung Highlight / Bỏ highlight / Copy (passage + câu hỏi)
- [x] `ReadingPassagePanel.tsx` + `ReadingQuestionPanel.tsx` — highlight passage và panel câu hỏi/đáp án
- [x] `ReadingTest.tsx` — `highlightsByPart` chỉ trong session (không lưu localStorage); mất khi thoát/F5
- [x] `readingTest.css` — `.reading-test-highlight` theme-aware; `user-select: text` passage + questions
- [x] `TextSelectionToolbar` — bỏ qua `[data-reading-highlight-zone]` (tránh toolbar trùng)
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Import PDF Reading — Sprint 1–3 (session 2026-07-01) — HOÀN THÀNH

**Sprint 1 — Tin cậy**
- [x] Backup v2 — `readingExams` trong `backupRestore.ts` (import v1+v2)
- [x] `answerConfidence: 'key' | 'inferred'` — badge "Đoán" preview + ExamResult
- [x] `parseReadingPdfFull()` — thử full trước, fallback parse từng part + progress UI
- [x] `readingPdfValidate.ts` — score tin cậy %, warnings trước khi lưu

**Sprint 2 — Độ phủ IELTS**
- [x] Dạng câu mới: `gap-fill`, `summary-completion`, `sentence-completion`
- [x] `ReadingQuestionPanel` — input ONE WORD + word bank pills
- [x] `isReadingAnswerCorrect()` — chấm gap-fill fuzzy

**Sprint 3 — Scan PDF + performance**
- [x] Hybrid `pdfContent.ts` — text layer trước, Vision OCR (OpenAI/Gemini) nếu scan
- [x] `pdfVision.ts` — render trang → batch Vision OCR
- [x] Lazy-load `ImportReadingPdfModal` + dynamic `pdfjs-dist` — ExamHome ~7KB (tách chunk pdf ~477KB)

#### Flow Import PDF Reading
1. Luyện thi → **Import PDF Reading**
2. Upload PDF (≤12MB) — text layer hoặc scan (Vision OCR tự động)
3. API key Cài đặt → AI (OpenAI/Gemini khuyến nghị full test + scan)
4. Parse Part 1–3 → score tin cậy + preview (lọc câu đáp án đoán) → **Lưu & làm bài**
5. Backup v2 gồm `readingExams`

#### Giới hạn còn lại
- Vision OCR tốn token/chậm (~20 trang max); chất lượng phụ thuộc ảnh scan
- Groq không Vision — scan cần đổi OpenAI/Gemini
- Chưa sync `readingExams` lên Supabase cloud
- Chưa có UI sửa đề import sau khi lưu

### Import PDF Reading — KET A2 parser (session 2026-07-01)
- [x] `readingPdfKetPrompt.ts` — prompt 5 parts KET, `splitPdfTextForKetParts()`, parse full + fallback từng part
- [x] `parseReadingPdfFull(..., { format: 'ket-a2' })` — tự chọn parser KET khi import từ Cambridge A2
- [x] `validateReadingImport(parts, 'ket-a2')` — validation 5 parts (Q1–6, 7–13, 14–18, 19–24, 25–30)
- [x] `ImportReadingPdfModal` — UI 5 parts khi `cambridgeLevel === 'a2'`
- [x] `ParsedReadingPart.partNumber` → `number` (hỗ trợ part 4–5)

### Fix KET split — cắt nhầm Part 5 (session 2026-07-01)
- [x] `splitPdfTextForKetParts` — bỏ regex `writing\s+part` (khớp nhầm footer "Reading and Writing PART 5" → mất Part 5)
- [x] Chỉ cắt PDF khi có Writing Part 6+ (`part 7`…)

### Import PDF Reading — PET B1 parser (session 2026-07-01)
- [x] `readingPdfPetPrompt.ts` — prompt 6 parts PET, `splitPdfTextForPetParts()`, parse full + fallback từng part
- [x] `parseReadingPdfFull(..., { format: 'pet-b1' })` — tự chọn khi import từ Cambridge B1
- [x] `validateReadingImport(parts, 'pet-b1')` — validation 6 parts · 32 câu (Q1–5, 6–10, 11–15, 16–20, 21–26, 27–32)
- [x] `readingPdfFormatForLevel()` / `expectedReadingPartsForLevel()` — map a2→ket, b1→pet

### Gỡ Import PDF/OCR Reading (session 2026-07-01)
- [x] Bỏ nút **Import PDF Reading** khỏi `ExamTrackPage` — chỉ còn **Import thủ công**
- [x] JSON mẫu KET A2: 5 parts · 30 câu + hướng dẫn trong modal
- [x] Hướng dẫn import trong modal Reading + Listening

### Import PDF OCR — giữ ảnh trang/passage (session 2026-07-01) — ĐÃ GỠ KHỎI UI
- [x] `pdfContent.ts` — `ExtractPdfResult.pages[]` (text + `dataUrl`); `preservePageImages` cho KET/PET
- [x] `pdfVision.ts` — OCR **từng trang** (detail high), giữ ảnh gốc — không còn plain-text-only batch
- [x] `pdfExtract.ts` — `extractTextFromPdfPerPage()`
- [x] `readingPdfPageImages.ts` — detect part→pages (KET/PET markers), lưu blob `reading-exam:{id}:page-N`, gắn `imageKey` passage fallback
- [x] `ImportReadingPdfModal` — lưu ảnh khi save; KET Part 1 luôn gắn ảnh trang khi có
- [x] `ReadingPassagePanel` — KET Part 1 hiện ảnh passage trước signs
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Hành vi mới
- PDF scan KET A2: Vision OCR từng trang → AI parse câu hỏi → ảnh trang gắn vào passage khi text yếu
- Part 1 KET: ưu tiên ảnh trang (signs) dù passage text có hay không
- Part 2–5: fallback `passage: [{ imageKey }]` khi passage < 80 ký tự

### Import thủ công Reading + Listening (session 2026-07-01) — HOÀN THÀNH
- [x] `importReadingManualUtils.ts` — parse/validate JSON đề Reading, lưu ảnh đoạn văn vào `audioRepo`
- [x] `importReadingZip.ts` — ZIP bundle (exam.json + ảnh)
- [x] `ImportReadingManualModal.tsx` — upload JSON/ZIP + ảnh, preview, lưu Dexie (`source: manual`)
- [x] `ReadingPassageBlock.imageKey` + `ReadingPassagePanel` hiển thị ảnh đoạn văn
- [x] `ExamTrackPage` — nút **Import thủ công Reading** (JSON + ảnh) + **Import thủ công Listening** (đã có JSON/ZIP)
- [x] Xóa đề import: `reading-pdf-*` + `reading-manual-*`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

#### Flow Import thủ công Reading
1. Luyện thi → track IELTS/Cambridge → **Import thủ công Reading**
2. Tải JSON mẫu → điền passage (text + `imageFile`) + questionGroups
3. Upload ảnh (`part1-p1.jpg`…) hoặc ZIP bundle
4. Preview → **Lưu & làm bài** — ảnh hiển thị trong panel passage trái

#### Import Reading Cambridge A2–C2 — template + prompt chuẩn (session 2026-07-01)
- [x] `cambridgeReadingImportTemplates.ts` — LEVEL_PARTS đủ A2–C2; A2 Part 4 = MC chọn từ (không gap-fill)
- [x] JSON mẫu tải trong modal theo level — đủ số câu mỗi part (không chỉ 2 câu mẫu)
- [x] `cambridgeImportGuideLines()` — bảng parts trong modal Import Reading
- [x] `validateReadingManualImport` — cảnh báo A2 Part 4 sai type
- [x] `HDSD/Prompt-Reading-Cambridge.txt` — prompt AI cho A2–C2
- [x] `HDSD/Prompt.txt` + `HDSD/Import De Thi.txt` — cập nhật Part 4 KET = MC

#### Bundle KET A2 Reading Test 1 (Claude → ZIP) — CẦN SỬA PART 4
- [x] Claude trả folder `C:\Users\ADMIN\Downloads\ket-reading-test1` — 5 parts · 30 câu · 6 ảnh Part 1
- [x] `exam.json` đã chuẩn schema (`passageTitle`, `type`, `passage[].text` Part 2–5)
- [x] ZIP: `C:\Users\ADMIN\Downloads\ket-reading-test1.zip` (~348 KB)
- [x] Copy vào repo: `Tainguyen/ket-reading-test1/` + `Tainguyen/ket-reading-test1.zip`
- [ ] User import trên app → xác nhận Part 1 ảnh + Part 2–5 highlight

#### Fix PET B1 Reading Test 1 — lặp cột + đáp án (session 2026-07-01)
- [x] `ReadingPassagePanel` — B1 Part 2/4: ẩn block `Danh sách A–H` cột trái (passage đã có đủ nội dung)
- [x] `ReadingQuestionPanel` — B1 matching: ẩn `List of features/sentences` cột phải (chỉ câu hỏi + pills A–H)
- [x] `scripts/build-pet-b1-test1.py` — Part 2: passage `label` A–H + `features[]` tên ngắn; Part 4: câu A–H trong passage + `features[]` chỉ text câu (không prefix chữ cái)
- [x] Regenerate `Tainguyen/pet-reading-test1.zip` + `exam.json` (6 parts · 32 câu)
- [x] `cambridgeReadingImportTemplates.ts` — B1 Part 2/4: mẫu features ngắn (full text → passage[])
- [ ] User **xóa đề cũ** + import lại `pet-reading-test1.zip` → xác nhận Part 2/4 không lặp (a8/a9)

#### Flow Import thủ công Listening (đã có)
1. **Import thủ công Listening** → JSON/ZIP + MP3/ảnh câu hỏi
2. Tên file: `q1.mp3`, `q1-a.jpg`, `part1.mp3`…

### Fix Import PDF kẹt / timeout "Đọc PDF quá lâu" (session 2026-07-01)
- [x] `pdfExtract.ts` — worker cố định `/pdf.worker.min.mjs`; không `await task.destroy()` (fire-and-forget 2s — tránh treo 45s)
- [x] Timeout theo bước: mở PDF 30s, mỗi trang 20s, tổng 120s; `useWorkerFetch: false`
- [x] `vite.config.ts` — plugin copy `pdf.worker.min.mjs` → `public/`; `optimizeDeps.exclude: pdfjs-dist`
- [x] Tiến trình: tải pdf.js → mở file → trang X/Y; `preloadPdfJs()` khi mở modal
- [x] `ImportReadingPdfModal` — nút **Phân tích**; label AI sau extract
- [x] `pnpm --filter web build` — pass

---

### Mindmap — connector polish (session 2026-06-30)
- [x] `connectors.ts` — anchor theo layout: Tree/Fishbone (trái↔phải), Tree↓ (trên↔dưới), Round (bezier theo hướng ra/vào)
- [x] Tree/Fishbone/Tree↓ dùng đường elbow (không cắt ngang qua pill)
- [x] Tăng `EDGE_PAD`/`LINE_GAP`, `strokeLinecap: butt` — tránh nét tròn xuyên vào chữ
- [x] Node pill: nền đặc hơn + `overflow-hidden` + `isolation`

---

## Modules chưa build / còn lại

1. ~~**Vocabulary**~~ ✅ DONE
2. ~~**Listening**~~ ✅ DONE
3. ~~**Writing**~~ ✅ DONE
4. ~~**MindMap**~~ ✅ DONE
5. ~~**Dictionary**~~ ✅ DONE
6. ~~**Settings**~~ ✅ DONE
7. ~~**Translation Practice**~~ ✅ DONE
8. ~~**Supabase Cloud Sync**~~ ✅ DONE (cần chạy migration 003 trên Supabase)
9. **License/Plan** — Edge Function notify-payment ✅ code xong; deploy + migration 004
10. **(Optional)** PanelHeader cho right panel detail headers

---

## Credentials (KHÔNG commit)

- Supabase URL: `https://ntcagvtkwxwsmlxlumfo.supabase.co`
- Anon key: trong `apps/web/.env.local`
- Google OAuth Client ID: `889427125348-ald12qq5haovti1l724h55phnrcon3p4.apps.googleusercontent.com`

---

## Deploy

- **Production URL:** https://ryanenglishv2.vercel.app
- **User yêu cầu auto deploy** sau mỗi lần code xong — agent chạy `pnpm deploy:prod` khi hoàn thành tính năng

### Quy trình deploy (có `supabase db push`)

Migrations chạy **một lần cho cả hệ thống** — không per-user.

```bash
# Lần đầu: copy .env.deploy.example → .env.deploy, điền:
#   SUPABASE_ACCESS_TOKEN  (dashboard/account/tokens)
#   SUPABASE_DB_PASSWORD   (Project Settings → Database)

pnpm db:push          # push supabase/migrations/*.sql lên remote
pnpm db:push:dry      # xem trước migrations sẽ apply (không ghi DB)
pnpm deploy:prod      # db:push → build → vercel deploy --prod
```

- Script: `scripts/db-push.mjs` — project ref `ntcagvtkwxwsmlxlumfo`
- CI (tuỳ chọn): `.github/workflows/deploy.yml` — cần secrets GitHub
- Edge Function (riêng): `npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo`

---

### Import thủ công Listening KET A2 Test 1 (session 2026-07-01) — HOÀN THÀNH
- [x] `ListeningQuestionCard.tsx` — gap-fill input + matching pills A–H; part instruction + part audio fallback
- [x] `ListeningKetTest.tsx` — truyền `partInstruction` + `partAudioSource` cho card
- [x] `importListeningUtils.ts` — dedupe MP3/ảnh trùng tên (1 file `listening.mp3` cho 5 parts)
- [x] `scripts/build-ket-a2-listening-test1.py` — 5 parts · 25 câu + copy `listening.mp3`
- [x] Bundle: `Tainguyen/ket-listening-test1.zip` (~12 MB) + OneDrive `ket-listening-test1.zip`
- [x] `HDSD/Prompt-KET-A2-Listening.txt` + cập nhật `Import De Thi.txt`
- [x] `pnpm --filter web exec tsc --noEmit` — pass
- [ ] User import ZIP → xác nhận Part 2 gap-fill + Part 5 matching + audio phát OK
- [ ] (Tuỳ chọn) Extract ảnh Part 1 từ PDF → `q1-a.jpg` … `q5-c.jpg`

#### Flow Import Listening KET A2
1. Luyện thi → Cambridge → A2 → **Import thủ công Listening**
2. Upload `ket-listening-test1.zip` (exam.json + listening.mp3)
3. Preview → Lưu & làm bài — UI KET 1 câu/màn, hỗ trợ picture-mc / gap-fill / MC / matching

---

### Global Catalog — hướng 3 (session 2026-07-02) — HOÀN THÀNH
- [x] `packages/catalog/` — manifest `GLOBAL_CATALOG_VERSION`, builtin exams, `syncGlobalCatalog()`
- [x] `scripts/build-catalog.mjs` — Tainguyen → `public/catalog/` + `packages/catalog/data/`
- [x] Builtin đề: KET/PET/FCE Reading + KET Listening (ID `catalog-*`) — mọi user sau deploy
- [x] `GlobalCatalogSync` trong `AppShell` — upsert Cấu trúc câu catalog (ID cố định `catalog:ss:*`)
- [x] `pnpm build:catalog` chạy trước `pnpm build`; web `v0.2.0`
- [x] `packages/catalog/README.md` — quy trình admin cập nhật + deploy
- [ ] TODO sau: vocab decks/cards, writing prompts, translation, listening lessons → `syncGlobalCatalog`

#### Admin cập nhật nội dung cho mọi user (không import tay)
1. Sửa `Tainguyen/.../exam.json` (+ media) hoặc seed trong `packages/catalog/src/seeds/`
2. `pnpm build:catalog` (đề thi) + bump `GLOBAL_CATALOG_VERSION` (Dexie seeds)
3. `pnpm deploy:prod`

---

### Listening picture-mc — ảnh composite A2–C2 (session 2026-07-02) — HOÀN THÀNH
- [x] Part 1 `picture-mc`: **1 ảnh/câu** (`q1.jpg` chứa A+B+C) thay vì 3 file riêng
- [x] `ListeningPictureBoard` + `ListeningPictureChoiceRow` — tranh trái, nút A/B/C phải
- [x] Import + `build-catalog` + legacy `q1-a.jpg` vẫn hỗ trợ
- [x] `exam.json` KET + HDSD cập nhật

### KET Listening — Part 2 gap-fill + Part 5 drag-drop (session 2026-07-02) — HOÀN THÀNH
- [x] `ListeningKetGapFillPartView` — Part 2 (câu 6–10): đề + audio trái, tất cả ô điền chỗ trống gộp cột phải
- [x] `ListeningKetMatchingPartView` — Part 5 (câu 21–25): tên + ô vuông kéo thả trái (theo `Giaodien/a1.jpg`), bank A–H phải
- [x] Kéo thả hoặc chọn đáp án → bấm ô; mỗi chữ cái dùng một lần; nút × xóa ô
- [x] `listeningKetPartLayout.ts` — detect part gap-fill / matching

### Listening Luyện thi — audio không dừng khi đổi Part (session 2026-07-02) — HOÀN THÀNH
- [x] `ListeningKetTest` / `ListeningIeltsTest` — bỏ `stopPlayback()` khi `partIndex` đổi (KET + IELTS + Cambridge PET/FCE/CAE/CPE)
- [x] `ListeningQuestionCard` — bỏ dừng audio khi đổi câu
- [x] KET timer cố định **25 phút** (`KET_LISTENING_DURATION_MINUTES`)

### Listening KET — fix audio không phát (session 2026-07-02) — HOÀN THÀNH
- [x] `useExamQuestionAudio` — thử lần lượt blob Dexie → `audioUrl` catalog; blob rỗng/hỏng không chặn fallback
- [x] `listeningExamCatalogMerge` — luôn bổ sung `audioUrl` từ builtin khi import thiếu
- [x] `listeningExamLoader` — mọi đề `source: import` đều merge media catalog (match title/examType)
- [x] `playHtmlAudio` — `preload` + `canplay`; log URL khi lỗi
- [x] Verify local: `GET /catalog/listening/ket-a2-test1/listening.mp3` → 200 (~21MB)

### PET B1 Listening — UI + bundle + prompt HDSD (session 2026-07-02) — HOÀN THÀNH
- [x] `ListeningPetTest` — 4 Part, 25 câu, timer **30 phút**, audio liên tục khi đổi Part
- [x] `ListeningPetMcPartView` — Part 2 (context + prompt) & Part 4 (audioIntro + MC)
- [x] `ListeningPetGapFillPartView` — Part 3 (`passageTitle` + `gapLead`/`gapTrail`)
- [x] Part 1: **7 câu** picture-mc (`q1.jpg` … `q7.jpg` composite A+B+C)
- [x] `Tainguyen/pet-listening-test1/exam.json` + ZIP (~21 MB) — đáp án Answer Key chính thức
- [x] `pnpm pack:listening:pet` — đóng gói bundle
- [x] HDSD: `Prompt-PET-B1-Listening.txt`, `Import Listening PET B1.txt`, cập nhật `Import De Thi.txt` + `Prompt-PET-B1.txt`
- [x] `Prompt-KET-A2-Listening.txt` — `durationMinutes` 25, hướng dẫn pack/import

### Luyện thi — Làm lại + Quay lại + Reading KET 30 phút (session 2026-07-02) — HOÀN THÀNH
- [x] `FullMockStageResult` + `handleRetry` — nút **Làm lại** sau submit (Reading/Listening/Writing/Full Mock)
- [x] `ExamHeaderBack` + `examNavigation.ts` — nút **Quay lại** khi đang làm bài (mọi chế độ)
- [x] `KET_READING_DURATION_MINUTES = 30` — Reading A2 cố định 30 phút

### Luyện thi — FCE B2 Listening Test 1 builtin (session 2026-07-02) — HOÀN THÀNH
- [x] `Tainguyen/fce-Listening-test1/exam.json` — 4 parts · 30 câu (Part 1 MC, Part 2 gap-fill Spectacled Bears, Part 3 matching, Part 4 MC)
- [x] Part 2: `passageTitle` + `imageFile: q2.jpg` → `ListeningPartImageHeader` (một ảnh gấu như Giaodien/a7.jpg)
- [x] Catalog builtin `catalog-listening-fce-b2-test1` + `pnpm pack:listening:fce` → ZIP import
- [x] `build-catalog.mjs` + `builtinExams.ts` — ship media `listening.mp3` + `q2.jpg`
- [x] FCE Part 3 matching (a9.jpg) — `ListeningLetterMatchingPartView`: A–H bên trái, kéo/thả chữ cái vào ô Speaker 19–23
- [x] HDSD FCE B2 Listening — `Prompt-FCE-B2-Listening.txt`, `Import Listening FCE B2.txt`, cập nhật `Import De Thi.txt` + `Prompt-FCE-B2.txt`

### Luyện thi — CAE C1 Reading Test 1 builtin (session 2026-07-02) — HOÀN THÀNH
- [x] Nguồn: `Tainguyen/cae-Reading-test1/` (PDF `Test_1_Reading_CAE_C1.pdf` + `answer keys.pdf`) → `scripts/build-cae-reading-test1.py`
- [x] `exam.json` ban đầu — 8 parts · **56 câu** · 90 phút (Part 1–4 Use of English, Part 5–8 Reading)
- [x] **Cập nhật 2026-07-06:** → **10 parts · 58 mục · 120 phút** (P9 Q57 + P10 Q58 Writing) — xem mục **CAE C1 Reading & Writing** cuối file
- [x] Catalog builtin `catalog-reading-cae-c1-test1` + `build-catalog.mjs` + `builtinExams.ts`
- [x] `cambridgeReadingImportTemplates.ts` — C1 Part 6: 37–40 cross-text, Part 7: 41–46 gapped text, Part 8: 47–56 multiple matching
- [x] `pnpm pack:reading:cae` → `Tainguyen/cae-Reading-test1.zip` (exam.json only — không ảnh)
- [x] HDSD: `Prompt-CAE-C1-Reading.txt`, `Import Reading CAE C1.txt`, cập nhật `Import De Thi.txt`
- [x] UI Reading: ẩn danh sách features trùng khi passage đã có label A–G (B2/C1 Part 6–8); placeholder Part 4 = `3–6 words`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Luyện thi — IELTS Listening Cam 9 + Cam 20 Test 1 builtin (session 2026-07-02) — HOÀN THÀNH
- [x] Nguồn: `Tainguyen/IELTS/Listening IELTS_Test1_Cam9|Cam20/` (PDF + Answer Key + MP3)
- [x] `scripts/build-ielts-listening-tests.py` — 2× exam.json · 40 câu · 4 parts · `listening.mp3`
- [x] **Fix Cam 9 Test 1 nội dung đúng** (JOB INQUIRY / SPORTS WORLD / Spiros–Hiroko / Whales) — trước đó nhầm đề khác
- [x] `ListeningIeltsPartView` — UI một cột theo `Giaodien/a1–a4`: note-completion inline (`gapLead`/`gapTrail`), MC dọc, Choose TWO
- [x] ZIP import: `pnpm pack:listening:ielts-cam9` → **flat** `exam.json` + `listening.mp3` (không thư mục con/PDF); `importListeningZip` bỏ qua PDF
- [x] Catalog: `catalog-listening-ielts-cam9-test1` + `catalog-listening-ielts-cam20-test1`
- [x] `isListeningAnswerCorrect` — đáp án thay thế `A/E` (Choose TWO) + gap-fill `/` variants
- [x] `pnpm pack:listening:ielts-cam9` / `ielts-cam20` + `pnpm build:ielts-listening`
- [x] HDSD: `Prompt-IELTS-Listening-Cam9-Cam20.txt`
- [x] `pnpm --filter web exec tsc --noEmit` — pass
- [x] **`notePassage` system** — `static` | `section` | `gap` trên `ListeningPart`; render `ListeningIeltsNotePassageBox.tsx` + `listeningNotePassage.ts`; validation import IELTS; catalog merge pass-through
- [x] **Fix Cam 9 static lines** — P1 (12 hours, referees…), P4 (Several other theories, Cape Cod, Thurston…) trong `build-ielts-listening-tests.py`
- [x] **Fix Cam 20 đáp án thiếu** (`Giaodien/a5–a10`): `notePassage` P1/P4 đầy đủ static + `gapLead`/`gapTrail`; Choose TWO P2–P3 `choose_two()` nhãn đầy đủ (không còn "A A"); rebuild catalog + ZIP
- [x] Rebuild: `python scripts/build-ielts-listening-tests.py` → `pnpm build:catalog` → `pnpm pack:listening:ielts-cam9` / `ielts-cam20` — `tsc` pass
- [x] **Cam20 P1 table layout** — `notePassageLayout: table` + `noteTable` (4 cột như đề giấy); `ListeningIeltsNoteTable.tsx`; so `Giaodien/a2` giống `a1` (bảng có viền, ô trống inline)
- [x] **IELTS import templates** — modal 5 nút (full / P1 form a3 / table a2 / mixed a4 / mixed a5); `noteTables[]` cho Part 1 bảng+Choose TWO+bảng; `ieltsListeningImportTemplates.ts`; `HDSD/Import Listening IELTS.txt` + Prompt IELTS; `Tainguyen/templates/ielts-listening-*.json`
- [x] **IELTS Listening Part 2 UI** (`Giaodien/Part2-Listening/a6–a14`) — segment: gaps / MC / matching / choose-two / diagram / map; `ListeningIeltsSectionHeader`, `ListeningIeltsMatchingBlock`, `ListeningIeltsMapBlock`, `ListeningIeltsDiagramBlock`; `sectionRange`/`sectionInstruction`/`sectionTitle`/`mapLabel`/`diagramLabel`; CSS `listeningTest.css`
- [x] **Part 2 import templates** — modal 9 nút (a6–a14); `ieltsListeningP2Templates.ts`; `Tainguyen/templates/ielts-listening-p2-a*.json`; export `pnpm export:ielts-p2` (`scripts/export-ielts-p2-templates.ts`, ngoài `tsc` web)
- [x] **Cam9/Cam20 P2 catalog** — `build-ielts-listening-tests.py`: gapLead `•`, section meta Cam9 SPORTS WORLD + Cam20 Pottery; rebuild catalog
- [x] **IELTS Listening Part 3 UI** (`Giaodien/Part3-Listening/c1–c7`) — `notePassageSections[]`, `ListeningIeltsFlowChartBlock` (c6), segment flowchart; templates `ieltsListeningP3Templates.ts`; modal 7 nút; `pnpm export:ielts-p3`; Cam9 P3 section meta + Cam20 P3 Choose TWO×3 + MC section headers
- [x] **HDSD prompt ChatGPT Part 1/2/3** — `HDSD/Prompt-IELTS-Listening-Part1.txt`, `Part2.txt`, `Part3.txt` (bảng nhận dạng a/c, quy tắc JSON, prompt mẫu copy-dán, checklist); cập nhật `Import Listening IELTS.txt` + `Prompt-IELTS-Listening-Cam9-Cam20.txt`
- [x] **IELTS Listening Part 4** — lecture notes d1–d3 (Cam9 Whales, Cam20 Rivers, generic); `ieltsListeningP4Templates.ts`; modal 3 nút; `pnpm export:ielts-p4`; `HDSD/Prompt-IELTS-Listening-Part4.txt`
- [x] **HDSD ChatGPT tổng 4 parts** — `HDSD/ChatGPT-IELTS-Listening-4-Parts.txt` (workflow A/B, nhận dạng a/c/d, prompt copy-dán, ghép exam.json, checklist); cập nhật `Import Listening IELTS.txt` + `Prompt-IELTS-Listening-Cam9-Cam20.txt`
- [x] **Choose TWO A/E** — tài liệu `Giaodien/two-choice.jpg`; `ChooseTwoBlock` clickable (chọn 2 đáp án trên list A–E); `isChooseTwoGroup` nhận dạng mọi "Which TWO" / answer slash; áp dụng tổng quát Part 1–3 qua `ListeningIeltsPartView`
- [x] **IELTS bundle pipeline (pilot Cam9 Test 2)** — `meta.json` + `exam_partN.json`; `pnpm ielts:merge|validate|pack|bundle`; `ieltsListeningBundle.ts`; pilot `Listening IELTS_Test2_Cam9` (**HOÀN CHỈNH** · 4 parts · 40 câu · `pnpm ielts:bundle`)
- [x] **Cam9 Test 2 Part 2** — `exam_part2.json` (a6: bảng Parks + MC Longfield + map Hinchingbrooke); `map.jpg` từ PDF; đáp án Key: trees, friday, farm, C, B, A, A, I, F, E
- [x] **Cam9 Test 2 Part 3** — `exam_part3.json` (MC 21–24 Self-Access Centre + notes 25–30); meta `p3-mc4+notes6`; Key: C, B, B, C, reading, CD, workbooks, timetable/schedule, alarm, email/emails
- [x] **Cam9 Test 2 Part 4** — `exam_part4.json` (d1: Business Cultures — Power/Role/Task culture, ONE WORD); Key: central, conversation, effectively, risk, levels, description, technical, change, responsibility, flexible
- [x] Cam9 Test 2 completely removed from builtin samples (per user: "xóa sạch đề mẫu"). User will import manually from Tainguyen/IELTS/Listening IELTS_Test2_Cam9/ (P1 = ACCOMMODATION FORM – STUDENT INFORMATION). Updated generatedIeltsListening.ts, manifest.json, removed forces in loader.
- [x] **Cam9 Test 4 bundle** — `Listening IELTS_Test4_Cam9` (**HOÀN CHỈNH** · 4 parts · 40 câu · `pnpm ielts:bundle`); P4 Q37–40 bảng 3 cột khớp `Questions 37_40.jpg` (bullets + break, "urban areas", "when in cities", "Large survey starting soon"); P2 Q19–20 notes đúng PDF (park + pizza + museum)

### Luyện thi — CAE C1 Listening Test 1 builtin (session 2026-07-02) — HOÀN THÀNH
- [x] `Tainguyen/cae-Listening-test1/exam.json` — 4 parts · 30 câu (Part 1 MC 3 extracts, Part 2 gap-fill TRIP TO SOUTH AFRICA, Part 3 MC A/B/C/D, Part 4 dual matching)
- [x] Part 4 dual-task (a10.jpg) — `ListeningDualLetterMatchingPartView`: TASK ONE 21–25 + TASK TWO 26–30, hai bảng A–H riêng, kéo/thả vào Speaker 1–5
- [x] `isDualLetterMatchingPart()` + `dualMatchingTaskGroups()` trong `listeningMultiPartLayout.ts`
- [x] Catalog builtin `catalog-listening-cae-c1-test1` + `pnpm pack:listening:cae` + `build-catalog.mjs` + `builtinExams.ts`
- [x] HDSD CAE C1 Listening — `Prompt-CAE-C1-Listening.txt`, `Import Listening CAE C1.txt`, cập nhật `Import De Thi.txt`

### Luyện thi — Highlight tô sáng Listening IELTS + Cambridge A2–C2 (session 2026-07-02) — HOÀN THÀNH
- [x] Dùng chung logic Reading: `ReadingHighlightToolbar`, `ReadingHighlightableText`, `usePartHighlights`, `ExamHighlightZone`
- [x] Áp dụng toàn bộ Listening: `ListeningKetTest`, `ListeningPetTest`, `ListeningIeltsTest` (IELTS + FCE/CAE/CPE)
- [x] Vùng tô sáng: hướng dẫn, đề bài, gap-fill notes, MC/matching options; audio/ô nhập có `data-highlight-skip`
- [x] Highlight lưu theo Part; reset khi **Làm lại**
- [x] Theme **light**: tô sáng exam (`--exam-highlight-bg`) màu vàng `#fff3a3`; mid/dark giữ accent tím

### Luyện thi — Đã làm + Làm lại trên danh sách đề (session 2026-07-02) — HOÀN THÀNH
- [x] `examCompletion.ts` — đọc draft localStorage (`submitted` + điểm đúng/tổng); `injectKetGapFillQuestionMarkers` — KET Part 2 hiện `and:(10) …`
- [x] `useExamDraftRevision.ts` — re-render `ExamTrackPage` khi nộp bài / làm lại
- [x] `ExamTrackPage` — badge **Đã làm**, meta `Đúng X/Y câu`, nút **Xem kết quả** + **Làm lại** từng đề Reading/Listening
- [x] `ExamResult` / `ListeningExamResult` — **Về luyện thi** + **Làm lại** cạnh nhau; back về đúng track Cambridge/IELTS (`examNavigation.ts`)
- [x] `ListeningKetGapFillPartView` — ghi chú Part 2 có số câu trước chỗ trống (vd. `Send a letter and:(10) …`)

### Luyện thi — Footer thống nhất + Reset timer (session 2026-07-02) — HOÀN THÀNH
- [x] `ExamPartFooter.tsx` — thanh ngang Part + pills số câu + Prev/Next câu + Submit (dùng chung Reading/Listening)
- [x] `ExamTimerControls.tsx` + `examTimer.ts` — đồng hồ + nút reset (RotateCcw) cạnh timer
- [x] `ListeningKetTest.tsx` — refactor `partIndex` + `activeQuestionId` (migrate draft `questionIndex` cũ); footer giống Reading
- [x] `ListeningIeltsTest.tsx` — footer dùng `ExamPartFooter`; nav prev/next **câu** (không chỉ Part)
- [x] `ReadingTest.tsx` — dùng shared footer + timer reset
- [x] `listeningTest.css` — CSS vars footer pills trên `.listening-exam-shell`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

---

## Kế hoạch ngày mai — Import ~100 đề Listening IELTS

**Mục tiêu:** User đưa PDF + Answer Key + MP3 hàng loạt; agent hỗ trợ tạo JSON, validate, gộp đề, đưa vào app.

### Chuẩn folder (đã pilot Cam9 Test 2)

```
Tainguyen/IELTS/Listening IELTS_Test{N}_Cam{9|10|…|20}/
  meta.json              ← cambridge, test, template từng part (p1-a3, p2-a6…)
  exam_part1.json … exam_part4.json
  listening.mp3
  map.jpg / diagram.jpg / a3.jpg … (nếu có)
  Answer key.pdf         (tuỳ chọn)
```

### Workflow mỗi đề (lặp ×100)

| Bước | Việc | Lệnh / file |
|------|------|-------------|
| 1 | Nhận dạng dạng Part 1–4 | `HDSD/ChatGPT-IELTS-Listening-4-Parts.txt` + `Prompt-Part1…4.txt` |
| 2 | ChatGPT → `exam_partN.json` | Đính kèm PDF part + Key + mẫu `Tainguyen/templates/ielts-listening-*.json` |
| 3 | Validate + merge | `pnpm ielts:validate "IELTS/…"` → `pnpm ielts:bundle "IELTS/…"` |
| 4 | Import thử (1 đề) | ZIP hoặc builtin catalog |
| 5 | Batch catalog | Thêm entry `build-catalog.mjs` + `builtinExams.ts` → `pnpm build:catalog` |

**Lệnh bundle (1 đề):**
```bash
pnpm ielts:bundle "IELTS/Listening IELTS_Test2_Cam9"
pnpm ielts:validate "IELTS/Listening IELTS_Test2_Cam9" --partial   # dev part lẻ
```

### Pilot thành công (mẫu copy)

| Đề | ID catalog | Parts | Ghi chú |
|----|------------|-------|---------|
| Cam9 Test 2 | (removed from builtin samples) | 4×40 câu | User will import from Tainguyen/IELTS/Listening IELTS_Test2_Cam9/ (correct P1: ACCOMMODATION FORM) |
| Cam9 Test 4 | (removed from builtin samples) | 4×40 câu | `Tainguyen/IELTS/Listening IELTS_Test4_Cam9.zip` — P4 table Q37–40, `diagram.jpg` P2 |

### Scale 100 đề — agent sẽ hỗ trợ

- [ ] Thống nhất naming: `Listening IELTS_Test{N}_Cam{X}` + `meta.json` template
- [ ] Batch validate: script quét folder `Tainguyen/IELTS/` (nếu cần viết thêm)
- [ ] Batch `build-catalog.mjs`: generate BUNDLES[] từ manifest hoặc glob (tránh sửa tay 100 dòng)
- [ ] Choose TWO / map / gap: so Answer Key trước khi merge
- [ ] Deploy 1 lần sau khi catalog ổn: `pnpm build:catalog` → `pnpm deploy:prod`

### Tài liệu tham chiếu

- `HDSD/ChatGPT-IELTS-Listening-4-Parts.txt` — workflow ChatGPT tổng
- `HDSD/Import Listening IELTS.txt` — import UI + bundle pipeline
- `apps/web/src/features/exam/ieltsListeningBundle.ts` — merge/validate logic
- `Giaodien/two-choice.jpg` — Choose TWO (answer `A/E`, UI 2 ô)

### Fix audio IELTS Listening (session 2026-07-03) — HOÀN THÀNH
- [x] `build-catalog.mjs` — auto-discover 25 đề IELTS (Cam9–14 + Cam20 T1) từ `Tainguyen/IELTS/`
- [x] Generate `packages/catalog/src/generatedIeltsListening.ts` + copy MP3 → `public/catalog/listening/`
- [x] `GLOBAL_CATALOG_VERSION` bump **1 → 2**
- [x] `pnpm build:catalog` + `tsc --noEmit` pass
- [ ] User: hard refresh (`Ctrl+Shift+R`) hoặc xóa đề import cũ → dùng đề builtin; `pnpm deploy:prod` cho production

### IELTS Listening Cam15–16 batch (session 2026-07-03) — HOÀN THÀNH
- [x] `scripts/build-ielts-cam15-16-listening.py` — 8 đề × 4 parts × 40 câu
- [x] Cam15 T3 P1 — PDF đủ Part 1 (Employment Agency: Possible Jobs); layout form theo đề giấy (First Job / Second Job, bullets từng dòng)
- [x] Map images: Cam15 T2/T4, Cam16 T1/T4 → `map.jpg`
- [x] `pnpm ielts:validate` — 8/8 pass, không cảnh báo
- [x] `pnpm ielts:pack` — 8 ZIP (exam.json + listening.mp3 + map nếu có)
- [x] `pnpm build:catalog` — **33 đề** IELTS auto-discovered (Cam9–16 + Cam20 T1)
- [x] `GLOBAL_CATALOG_VERSION` bump **2 → 3** (sau đó **3 → 4** khi fix Cam15 T3 P1 từ PDF gốc)
- [x] `pnpm --filter web exec tsc --noEmit` pass

### IELTS Listening Cam17–18 batch (session 2026-07-03) — HOÀN THÀNH
- [x] `scripts/dump-ielts-cam17-18.py` + `ielts-cam17-18-dump.txt`
- [x] `scripts/build-ielts-cam17-18-listening.py` — 8 đề × 4 parts × 40 câu
- [x] Cam18 T2 P1 — PDF đủ Q1–5 (Milo's Restaurants); layout dual noteTables theo đề giấy
- [x] Cam18 T2 map — `map.jpg` từ PDF page 3 (School, Sports centre, Clinic…)
- [x] `pnpm ielts:validate` — 8/8 pass
- [x] `pnpm ielts:pack` — 8 ZIP
- [x] `pnpm build:catalog` — **41 đề** IELTS (Cam9–18 + Cam20 T1)
- [x] `GLOBAL_CATALOG_VERSION` bump **4 → 5** (sau đó **5 → 6** khi fix Cam18 T2 P1 từ PDF gốc)

### IELTS Listening Cam19–20 batch (session 2026-07-03) — HOÀN THÀNH
- [x] `scripts/dump-ielts-cam19-20.py` + `ielts-cam19-20-dump.txt`
- [x] `scripts/build-ielts-cam19-20-listening.py` — 8 đề × 4 parts × 40 câu (Cam19 T1–T4 + Cam20 T1–T4)
- [x] Cam20 T1 migrate sang bundle format (`exam_part1–4.json` + `meta.json`)
- [x] Map images: Cam19 T1 (Farley House), Cam20 T3 (archaeology site) → `map.jpg`
- [x] `pnpm ielts:validate` — 8/8 pass (fix notePassage static rỗng Cam20 T2/T3)
- [x] `pnpm ielts:pack` — 8 ZIP
- [x] `pnpm build:catalog` — **48 đề** IELTS (Cam9–20)
- [x] `GLOBAL_CATALOG_VERSION` bump **6 → 7**

### IELTS Part 1 layout fix — 48 đề (session 2026-07-03) — HOÀN THÀNH
- [x] `normalize_part1()` trong `build-ielts-cam11-12-listening.py` — auto `notePassageLayout`, `passageTitle`, bullet sau section `:`
- [x] `scripts/fix-all-ielts-p1.py` + `scripts/rebuild-all-ielts-listening.py`
- [x] UI: Part 1 `passageTitle` căn giữa, to hơn (`listening-ielts-notes__title--part1`)
- [x] Renderer: `groupNotePassageIntoLines` mode `form` tách dòng sau gap
- [x] Cam9 T1 bundle (`exam_part1.json`), Cam12 v2 bullets, Cam20 T1 bỏ `notePassage` trùng bảng
- [x] Rebuild 48 đề + `pnpm build:catalog` — `GLOBAL_CATALOG_VERSION` **8 → 9**

### IELTS Part 4 layout fix — 48 đề (session 2026-07-03) — HOÀN THÀNH
- [x] `normalize_part4()` trong `build-ielts-cam11-12-listening.py` — auto `notePassageLayout: lecture`, `passageTitle`, bỏ section trùng title, bullets `•`/`–`
- [x] `scripts/fix-all-ielts-p1.py` mở rộng xử lý cả `exam_part4.json` (48 đề)
- [x] Renderer: `groupNotePassageIntoLines` mode `lecture` tách dòng sau gap (giống `form`)
- [x] UI: Part 4 `passageTitle` căn giữa phía trên box (`partTitleAboveBox` — class `listening-ielts-notes__title--part1`)
- [x] `write_test()` normalize P4 + fix `merge_parts` dùng payload đã normalize
- [x] `pnpm build:catalog` — `GLOBAL_CATALOG_VERSION` **9 → 10**

### IELTS note lines renderer fix (session 2026-07-03) — HOÀN THÀNH
- [x] **Root cause:** `groupNotePassageIntoLines` gom nhiều `static` block khi không nhận bullet `•`/`–` → "carer:time for…a [1]" (Cam20 T2 P1, case5 vs case6)
- [x] `groupNotePassageFormLines()` — mỗi `static` JSON = một dòng; chỉ gom `static+gap(+trail)`; gap trail ≠ bullet mới
- [x] Áp dụng cho `notePassageLayout: form` và `lecture` (Part 1 + Part 4)
- [x] `hasNoteLineMarker` / `noteLineMarkerKind` — nhận `• – + * ▪ · ► …` (Cam11 T1: `+ £250 deposit`)
- [x] `GLOBAL_CATALOG_VERSION` **10 → 11**

### IELTS note lines 100% đề giấy (session 2026-07-03) — HOÀN THÀNH
- [x] Quy tắc cứng: **mỗi static block JSON = một dòng UI** — không nối dài; chỉ gom `static + gap + trail` cùng câu
- [x] `atomizeNotePassageBlocks` / `_atomize_note_passage` — tách `\n` trong data
- [x] NotePassageBox bỏ list mode (luôn form/lecture strict)
- [x] CSS `.listening-ielts-notes__line` — `display:block`, `white-space:pre-wrap`
- [x] `GLOBAL_CATALOG_VERSION` **11 → 12**

### IELTS map/diagram crop (session 2026-07-03) — HOÀN THÀNH
- [x] `find_map_diagram_clip_rect()` + `extract_map_image()` — render crop vùng map/diagram, không extract nguyên trang PDF
- [x] `find_fallback_plan_clip_rect()` — PDF scan (Cam9 T2) crop embedded image, bỏ header/footer
- [x] `scripts/extract-all-ielts-plan-images.py` — auto quét `imageFile` trong `exam_part*.json` → 15 ảnh (map.jpg/diagram.jpg)
- [x] `PAGE_OVERRIDES` Cam9 T2 map → page 3 (scan)
- [x] Fix nhận câu hỏi 16–20 vs số label trên map (Cam16 T4)
- [x] Re-extract 15/15 OK; `pnpm build:catalog`
- [x] Fix crop quá tay (v2): union khối vẽ + padding; giữ đủ mép map/compass/đường; Cam9 T2 đúng trang map (p4)
- [x] Note P1/P4 bullets + line breaks (v3): `_enrich_passage_bullets` mở rộng; `enrichNotePassageBullets` TS runtime; mỗi static = 1 dòng; CSS hanging indent
- [x] Note bullets conservative (v4): `_sanitize_passage_markers()` gỡ •/– sai (form label, gap trail, prose, intro); enrich thận trọng; fix `'' in '–-+−*'`; intro vs e.g. sub-list; Cam20 T2 P1 khớp case6
- [x] Note bullets colon sub-list (v5 / catalog v19): `_colon_introduces_sub_items()` — mục sau dòng `:` (vd. `site:`, `ocean hotspots:`, `innovations include:`) dùng `–`; giữ `•` cho intro `may include discussion of:`; `_find_colon_sub_parent()` lan context qua sibling; Cam19 P4 Ceide Fields khớp đề giấy
- [x] `GLOBAL_CATALOG_VERSION` **12 → … → 19**

### IELTS note inline gap fix (session 2026-07-03) — ĐÃ LÀM, USER BÁO VẪN LỖI
- [x] `groupNotePassageFormLines` — không flush trước gap khi `:` hoặc trail sau gap (` at 6 p.m.`)
- [x] `prepareNotePassageBlocks` — inject `gapLead` dòng `e.g.` dùng `–` thay `•`
- [x] `GapInlineCompact` — `suppressLead`/`suppressTrail` + so khớp bullet khi compare
- [x] `scripts/sync-ielts-inline-gaps.py` — gỡ 106 `gapLead`/`gapTrail` thừa (8 đề Cam9–11)
- [x] `GLOBAL_CATALOG_VERSION` **20 → 21**; `pnpm build:catalog` 48 đề
- [ ] **User xác nhận vẫn lỗi** — cần reproduce cụ thể trên localhost (đề/part/câu nào)

### Lỗi còn tồn tại (IELTS Listening notes — ưu tiên session 2026-07-04)

**Bug user báo (chưa đóng):**
- P1: text inline gap vẫn **rớt dòng** (vd. `Interview arranged for: Thursday [9] at 6 p.m.` không 1 dòng)
- P4: **double text** `gapLead`/`gapTrail` (vd. `e.g. some parasites…` lặp 2 lần)
- P4: **bullet `•` thừa** trên dòng `e.g.` (phải là `–` sub-bullet)
- Có thể còn lỗi trên **đề khác Cam9 T1** dù đã sync 48 đề

**Nguyên nhân đã xác định (tham khảo khi fix):**
| Triệu chứng | File | Ghi chú |
|-------------|------|---------|
| Rớt dòng trước gap | `listeningNotePassage.ts` → `groupNotePassageFormLines` | Flush sai khi static “hoàn chỉnh” nhưng gap+trail cùng câu |
| Double text | `prepareNotePassageBlocks` inject static + `GapInlineCompact` render lại | Dedupe `suppressLead`/`suppressTrail` |
| `•` trên e.g. | `prepareNotePassageBlocks` inject `gapLead` | Dòng `e.g.` → `–` |
| JSON trùng | `exam_part*.json` + `questions[].gapLead` | `sync-ielts-inline-gaps.py` đã chạy; có thể còn case chưa cover |

**Test case chuẩn khi debug:**
- `catalog-listening-ielts-cam9-test1` — P1 Q9, P4 Q32
- So PDF: `Tainguyen/IELTS/Listening IELTS_Test1_Cam9/*.pdf`

**Khác (IELTS import — không block notes bug):**
- Cam9 T4 P4: layout `table` (không lecture)
- Map scan còn dòng câu hỏi 15–20 dưới ảnh
- Production chưa deploy catalog v21
- 48 đề chưa audit PDF 100% (chỉ Cam9 T1 P1 rewrite đầy đủ)

---

## 2026-07-11 — Fix trang trắng `/app/vocab`

- Root cause: import vòng giữa `vocabSeedDecks` và `vocabPublishedSync` khiến `PRESET_GROUP_IDS` có thể bị đọc trong TDZ.
- Fix: tách constants dùng chung sang `apps/web/src/features/vocab/vocabConstants.ts`; giữ re-export tương thích.
- Verify: `pnpm --filter web exec tsc --noEmit` pass.

## Next session start prompt

```
Đọc session_summary.md.

Session 2026-07-04 — Fix tiếp IELTS Listening note P1/P4 (user báo vẫn lỗi).

Bước 1 — Reproduce với user:
- Hỏi đề/part/câu cụ thể hoặc mở Cam9 T1: P1 Q9, P4 Q32
- pnpm dev:web → http://localhost:5173 → hard refresh (Ctrl+Shift+R)
- Nếu data cũ: pnpm build:catalog (catalog v21)

Bước 2 — Debug renderer:
- apps/web/src/features/exam/listeningNotePassage.ts
  (groupNotePassageFormLines, prepareNotePassageBlocks, gapLeadRenderedAdjacent)
- apps/web/src/features/exam/ListeningIeltsNotePassageBox.tsx (GapInlineCompact suppress)
- apps/web/src/features/exam/listeningTest.css (::before bullet/sub)

Bước 3 — Debug data nếu renderer OK trên script nhưng UI vẫn sai:
- Tainguyen/IELTS/.../exam_part1.json, exam_part4.json
- python scripts/audit-ielts-pdf-vs-json.py
- pnpm fix:ielts-notes (= sync-ielts-inline-gaps + fix-all-ielts-p1 + build:catalog)

Đã làm session 2026-07-03 (chưa đủ):
- Renderer inline gap + suppress double text
- sync 48 đề, catalog v21

Chưa xong:
- User xác nhận vẫn lỗi rớt dòng / double text / bullet e.g.
- Audit PDF vs JSON cho 48 đề
```

## Session 2026-07-04 — Fix 48 standalone HTML mocks (unique per PDF) + no line drops (rớt dòng)

### Vấn đề user báo
- Tất cả 48 file HTML trong Tainguyen/IELTS/.../*.html (và PDF to HTML/) **giống hệt nhau** (chỉ đổi title).
- File sinh ra xấu, không giống template (assets/ielts-listening-template_Test1_Cam9.html).
- Yêu cầu: **Mỗi đề phải khác nhau**, nội dung lấy từ file PDF tương ứng (không copy paste 1 cái).

### Nguyên nhân gốc
- `gen.py` + `gen_ielts.py` dùng regex mỏng manh thay thế `<div class="p-8">...` (không match được → giữ nguyên nội dung Cam9 mẫu).
- `render_form` quá đơn giản, chỉ render notePassage cơ bản, bỏ qua questions/MC/options/passageTitle thực của từng exam.json.
- Không dùng dữ liệu đã parse sạch từ PDF (exam_part*.json, exam.json) một cách đầy đủ.

### Đã làm
- Viết lại `gen.py` (loại bỏ regex, build shell + inner động):
  - Load exam.json + exam_partN.json (dữ liệu đã được build scripts + fix bullet/notePassage từ PDF).
  - Render đầy đủ 4 SECTION với:
    - `paper-box` + `notes-box` style (2px #374151 radius như template)
    - `passageTitle` unique (Self-drive tours..., CRIME REPORT FORM, Business Cultures, ... )
    - `form-row` + `.form-label` + inline `.question-number` + `.answer-input`
    - `bullet-item` (• và –)
    - MC/choose-two: `.mcq-container` + `.option` + `onclick="selectOption/toggleMultiOption"`
  - Cập nhật header (Test X, Cambridge Y) + title tag + footer.
  - Tự copy thêm bản vào `Tainguyen/PDF to HTML/`.
- Chạy `python gen.py` → **48 file** (hash khác nhau 100%).
- Re-run sau khi cải thiện `render_blocks` (tự động form-row khi label + gap, inline tail text).
- Mỗi HTML giờ có nội dung **khác hẳn**, đúng theo đề PDF gốc (JSON trung gian), giao diện giống hệt template reference.

### Kết quả
- Cam9 T1: JOB ENQUIRY + SPORTS WORLD + Whales (đúng đề)
- Cam10 T1: Self-drive tours in the USA + Leisure club + Spirit Bear
- Cam9 T2: CRIME REPORT FORM + Self-Access Centre + Business Cultures
- Tất cả có inputs, options clickable, bullets đúng, box viền đậm bo góc.
- Đã loại bỏ hoàn toàn nội dung Cam9 mẫu khỏi 47 đề còn lại.

### Files liên quan
- `gen.py` (cải tiến)
- `Tainguyen/IELTS/Listening IELTS_Test*_Cam*/*.html` (48)
- `Tainguyen/PDF to HTML/*.html` (copies)

### Next
- Nếu cần render đẹp hơn (table layout P1, map ảnh nhúng, section header chi tiết hơn) → có thể mở rộng render + dùng thêm `meta.json` + ảnh.
- Sau này muốn regenerate chỉ cần `python gen.py`.

### Follow-up (line drops / rớt dòng fix)
- User reported text dropping to new lines (real paper keeps the sentence + blank on 1 line).
- Rewrote render_blocks: more aggressive lookahead for gaps after any static; always wrap static+gap+tail into one flex container (bullet-item / form-row / generic display:flex nowrap).
- Reduced over-greedy chaining (only immediate tail after a gap; stop unless consecutive gaps).
- Re-ran `python gen.py` → all 48 (the 47 + Cam9 T1) updated.
- Result: "text [n] trail", "label: text [n] more", plain note lines now stay inline in their div. Loose <span class=question-number> greatly reduced.
- Applies uniformly because generator is the single source for all HTMLs.

# Session Update - 2026-07-01

## Da lam trong phien nay
- Clean up `apps/web/src/features/listening/CreateLessonModal.tsx`:
  - giu Cambridge mode
  - don logic `create()`
  - gom state tao lesson
  - sua label/UI text
- Them tao Cambridge `Test 3` trong luong tao Listening lesson.
- Nang cap Kokoro UX:
  - start/check status ngay tu giao dien
  - them `ListeningTtsStatusBadge` than thien hon
  - co copy command, offline messaging, health polling
- Bat view mode that su cho Listening Library:
  - `list | grid | compact`
  - luu vao localStorage
  - grid cards duoc bo tri gon hon
  - them motion nhe cho view switch
- Them feedback dung dap an cho Listening practice:
  - sound + fireworks giong Vocab
  - auto next sau 5s
- Them xoa bai nghe trong trang chi tiet:
  - option trong dropdown
  - modal confirm
  - toast + loading + navigate ve `/app/listening`
- Fix mot phan bug sau khi xoa lesson:
  - reset state lesson
  - `navigate('/app/listening', { replace: true })`
  - giam kha nang white page do state cu
- Rut gon dev flow:
  - root `pnpm dev` huong toi chay web + server local
  - co huong auto open browser local
- Sua Google OAuth redirect:
  - `apps/web/src/features/auth/AuthContext.tsx`
  - `redirectTo` = `${window.location.origin}/auth/callback`
  - localhost va production dung chung callback dung origin

## Van de dang mo
- [x] **Listening thanh cuon ngang/dọc thừa** (2026-07-01) — fix: bỏ `overflow-x-auto` tabs, shell 2 lớp `.listening-lesson-shell` + `.listening-lesson-scroll`, ẩn scrollbar trong `globals.css`, bỏ debug MutationObserver. **Chờ user hard refresh và xác nhận.**
- Debug query vẫn còn: `lsnDebug`, `lsnPracticeDebug` (nếu cần isolate component).

## File nong can mo lai o phien sau
- `apps/web/src/features/listening/ListeningLessonPage.tsx`
- `apps/web/src/features/listening/ListeningTabs.tsx`
- `apps/web/src/features/listening/ListeningPracticeTab.tsx`
- `apps/web/src/styles/globals.css`
- `apps/web/src/features/auth/AuthContext.tsx`
- `apps/web/src/features/auth/AuthCallback.tsx`

## Luu y ky thuat
- `pnpm --filter web build` dang bi chan boi loi xac thuc registry/pnpm cua moi truong:
  - `Refusing to run pnpm@9.15.0: its npm registry signature could not be verified`
- Day khong phai loi source code app.
- Repo da co route `/auth/callback` trong `App.tsx` va xu ly session trong `AuthCallback.tsx`.
- Supabase Dashboard van can whitelist:
  - `http://localhost:5173/auth/callback`
  - production domain `/auth/callback`

## Mục tiêu ưu tiên phiên sau (2026-07-02, tiếp)

### IELTS Listening — user confirm
1. Hard refresh → Cam20 Test 1 — so `Giaodien/a5–a10`
2. Cam9 Test 1 — static lines P1/P4
3. OK → `pnpm deploy:prod`

### Luyện thi — Import đề (backlog)
- KET/PET/FCE/CAE Listening + Reading ZIP test
- PET Listening: `HDSD/Prompt-PET-B1-Listening.txt`

### Khác (nếu user nhắc)
- Cam20 P1 table layout 4 cột
- Listening lesson thanh cuộn thừa — `?lsnDebug=only-tabs`
- iOS Ô CHỮ + Web Audio autoplay

## Session 2026-07-04 — Fix Cambridge IELTS 9 Test 2 Part 4 (Business Cultures)

### Vấn đề
- Part 4 notePassage cho "Business Cultures" (Power/Role/Task culture) note format không khớp layout thực tế của đề.
- Các dòng đặc điểm tổ chức không có cấu trúc header "Characteristics of organization:" + danh sách con dùng "–".
- Gap 31 (central) bị tách sai; tương tự nhiều chỗ khác.
- User cung cấp format chi tiết hơn với ● cho header items (Advantage, Disadvantage, Suitable employee, Characteristics..., Advantages, Disadvantages) và – cho sub-items, kèm inline gaps đúng vị trí.

### Đã fix (lần 2)
- Viết lại toàn bộ `notePassage` blocks theo đúng format user đưa ra (kết hợp 2 tin nhắn):
  - ● Characteristics of organization:
    – small
    – [31] power source
    – few rules and procedures
    – communication by [32]
  - ● Advantage: can act quickly
  - ● Disadvantage: might not act [33]
  - ● Suitable employee:
    – not afraid of [34]
    – doesn't need job security
  - Role Culture + ● Characteristics... với – large, many [35] / specialized departments / job [36]...
  - ● Advantages: / ● Disadvantages: / ● Suitable employee: với subs
  - Task Culture: ● Characteristic of organization: (singular như user) + 3 – subs
  - ● Advantages: [40]
- Sử dụng literal "● " (không bị strip hoàn toàn) + "– " cho sub để renderer + CSS tạo đúng bullet style.
- Cập nhật gapLead/gapTrail trên questions 31,33,34,35,36,37,38,39,40 để hỗ trợ inline grouping tốt hơn.
- Cập nhật cả exam_part4.json + exam.json.
- Chạy `pnpm build:catalog` + repack ZIP.
- Giữ lại phần còn lại của Task (Disadvantages + Suitable) để đầy đủ 10 câu.

### Files đã sửa
- Tainguyen/IELTS/Listening IELTS_Test2_Cam9/exam_part4.json
- Tainguyen/IELTS/Listening IELTS_Test2_Cam9/exam.json
- packages/catalog/data/listening-ielts-cam9-test2.json removed from active catalog samples (user imports manually)
- ZIP bundle

---

## Session 2026-07-04 — Xóa sạch 48 đề mẫu IELTS Cam9-20 (user request)

### Lý do
- User lặp lại: "Xóa sạch 48 đề mẫu", "Không ổn rồi bạn ơi. Hãy xóa sạch đề mẫu trong app đi. Mình qua hướng khác để import đề vô", "CÀNG FIX CÀNG RỐI VÀ KHÔNG GIẢI QUYẾT ĐƯỢC VẤN ĐỀ", "tÔI KHÔNG xóa cache hoặc xóa đề trong app đc".
- Nguyên nhân rối: Dexie local + catalog builtin vẫn override nội dung mới (Cam9 T2 Part1 phải là ACCOMMODATION FORM, không phải CRIME).
- Giải pháp triệt để: xóa sạch 48 Cam9-20 khỏi catalog/builtin. User tự import thủ công từ Tainguyen (đúng data).

### Đã làm (xóa triệt để)
- scripts/build-catalog.mjs: disable hoàn toàn discoverIeltsListeningBundles() + comment rõ + bỏ gọi writeGenerated. BUNDLES chỉ còn STATIC (KET/PET/FCE/CAE).
- packages/catalog/src/generatedIeltsListening.ts: xóa hết import + array rỗng GENERATED_IELTS_LISTENING_EXAMS = [], header giải thích.
- packages/catalog/data/manifest.json: xóa sạch 48 entry ielts trong "listening", chỉ giữ 4 non-ielts.
- Xóa 48 file listening-ielts-cam*.json trong packages/catalog/data/.
- Xóa 48 thư mục ielts-cam*-test* (kèm mp3) trong apps/web/public/catalog/listening/.
- builtinExams.ts, listeningExamData.ts, listeningExamLoader.ts: tự động sạch (dựa CATALOG + GENERATED rỗng). Không còn force cam9 cũ.

### Kết quả
- Catalog chỉ ship 4 đề Listening (KET A2, PET B1, FCE B2, CAE C1).
- 48 IELTS Cam9-20 không còn là "đề mẫu" builtin.
- User import từ Tainguyen/IELTS/... sẽ không conflict.

### Lệnh user chạy
pnpm build:catalog   # (tùy chọn, đã edit trực tiếp)
pnpm dev
→ hard refresh (Ctrl+Shift+R)
Sau đó dùng Import thủ công Listening để đưa đề Tainguyen vào.

### Verify
- tsc pass
- Chỉ còn catalog listening 4 entries
- Không có "catalog-listening-ielts" active trong code paths

---

### Cam10 Test 3 Part 4 — Leaders / Conclusion (2026-07-04)
- `exam_part4.json`: bổ sung đủ section **Leaders**, **Conclusion**, các dòng static (Prevention Focus, inspire promotion/prevention, kết luận sau Q40).
- `exam.json` + ZIP: `pnpm ielts:bundle "IELTS/Listening IELTS_Test3_Cam10"` — validate pass.
- `scripts/build-ielts-cam9-10-listening.py` `cam10_t3_p4()` đồng bộ cùng cấu trúc.

### Cam11 Import DOCX Wizard — ngắt dòng + phantom P4 (2026-07-04)
- **Triệu chứng:** Import DOCX Cam11 T1 — dòng trống kép, gap số tách thành paragraph riêng (`● the` / `1` / `Room`); sau Tạo JSON Part 4 xuất hiện dòng Cam10 Leadership (*emphasise the results of a mistake*, *inspire prevention focus in followers*) không có trong Word.
- **Nguyên nhân:** `expandMultilineParagraphs` + `partLinesToExamText` join `\n\n`; `repairP4LectureSections` inject gap 39/40 cho mọi Part 4 có gap 39.
- **Fix:** Wizard gọi `extractDocxContent(..., { splitMultilineParagraphs: false })`; `partLinesToExamText` join `\n`; `isLeadershipLectureP4()` — chỉ repair Leaders/Conclusion khi đề Leadership (Cam10 T3), không áp Ocean Biodiversity.
- **Verify:** Cam11 docx → Part 1 ~41 dòng (gap inline), Part 4 Ocean Biodiversity, `phantom: false`; tsc pass.

### Cam10 Test 4 Part 1 — Address ngắt dòng (a6 Thorndyke, 2026-07-04)
- **Nguyên nhân:** AI Import Wizard hay gộp `Park Flats (Behind the` thành một static block → logic gom dòng không nối vào `Address: Flat 4, [2]`.
- **Fix `listeningNotePassage.ts`:** `repairFormPassageInlineBlocks()` tách static gộp; `formLineCanContinue()` + regex mở rộng trong `isFormInlineSegment()`; `prepareNotePassageBlocks` gọi repair trước atomize.
- **Fix `ieltsListeningAiNormalize.ts`:** `repairP1FormPassage()` khi normalize AI Part 1; mặc định `notePassageLayout: "form"` nếu thiếu.
- **Kết quả:** một dòng `Address: Flat 4, | [2] | Park Flats | (Behind the | [3] | )`.

### Batch validate 48 đề IELTS Listening (2026-07-04)
- Chạy `pnpm ielts:validate` trên cả 48 folder `Tainguyen/IELTS/Listening IELTS_Test*_Cam*` → **48 PASS, 0 FAIL**.
- Cam11 T1 pass; Part 4 = Ocean Biodiversity (JSON gốc đúng, không phantom Leadership).
- Chỉ có **7 file .zip** sẵn; 41 đề còn lại cần `pnpm ielts:bundle` trước khi import UI.

## Lỗi còn tồn tại (cập nhật 2026-07-04)
- Không còn 48 đề builtin IELTS trong catalog → user import thủ công từ Tainguyen.
- **Import Wizard DOCX + AI** vẫn rủi ro (gộp dòng form, AI lệch layout) — **không dùng** cho 48 đề đã có `exam_part*.json`.
- Nếu bug sau import ZIP: sửa `exam_partN.json` trong Tainguyen → `pnpm ielts:bundle` → import lại ZIP.
- Các media ielts trong dist/ (build cũ) sẽ bị thay khi rebuild catalog.

## Kế hoạch session tiếp theo — Import 48 đề IELTS Listening (ZIP)

**Nguyên tắc:** Dùng **Import thủ công Listening (ZIP)** — KHÔNG dùng Import Wizard DOCX / Import Word cho bulk.

| Bước | Việc | Lệnh / UI |
|------|------|-----------|
| 1 | Pack ZIP 48 đề | `pnpm ielts:bundle "IELTS/Listening IELTS_Test{N}_Cam{X}"` hoặc batch PowerShell (xem Next prompt) |
| 2 | Pilot 3 đề | Cam11 T1, Cam10 T3 (Leadership), Cam9 T2 — import ZIP, so UI với `IELTS_Test*_Listening_Cam*.html` |
| 3 | Import hàng loạt | Luyện thi → IELTS → **Import thủ công Listening** → chọn từng `.zip` |
| 4 | Kiểm tra UI | P1 gap inline, P2 map/diagram, P4 đúng tiêu đề lecture |
| 5 | (Tùy chọn) Ship catalog | Sau khi UI ổn → bật lại builtin IELTS + `pnpm build:catalog` + deploy |

**Tránh nhầm 3 nút Import Listening:**
| Nút | Dùng cho 48 đề? |
|-----|-----------------|
| **Import thủ công Listening** (ZIP) | **Có — đường chính** |
| **Import Word** (DOCX parser) | Không (đã có JSON trong Tainguyen) |
| **Import Wizard → Import DOCX** (AI) | **Không** (dễ lỗi ngắt dòng / phantom P4) |

### IELTS Reading Import Wizard (paste + AI, 2026-07-04)
- **Flow giống Listening Wizard:** Setup (title, Cam/Test, Answer Key 1–40) → Passage 1–3 (chọn template, paste Word, AI JSON) → Preview → Lưu Dexie.
- **Files mới:** `ieltsReadingWizard/IeltsReadingImportWizard.tsx`, `WizardPassageStepPanel.tsx`.
- **Core đã có:** config, templates (18 layout), AI prompt/normalize/generate, persist (`ielts-reading-import-wizard-draft`).
- **ExamTrackPage:** nút **Import Wizard Reading** trên track IELTS + badge "Có nháp".
- **CSS:** reuse `ieltsListeningWizard.css` + `.ielts-wizard-template-card--text` cho template không ảnh.
- **Save:** `buildReadingExamFromImport` + `examRecordFromReading(exam, 'manual', wizard-camX-testY)`.

## Session 2026-07-05 — HTML mock đầy đủ từ exam_part*.json (user làm DOCX riêng)

### Bối cảnh
- User sẽ tự làm file **DOCX** giống đề thi thật nhất.
- HTML trong `Tainguyen/IELTS/.../*.html` trước đó **thiếu** bảng, map, flow-chart, section headers, example.

### Đã làm
- Viết lại `gen.py` — nguồn chính `exam_part1–4.json` (fallback `exam.json`):
  - `noteTable` / `noteTables` (bảng P1 Cam20, P2 Cam9 T2, P4 table…)
  - `map.jpg` / `diagram.jpg` nhúng relative
  - Section headers (`sectionRange`, `sectionInstruction`, `sectionTitle`)
  - MC, Choose TWO (gộp 2 câu), map labeling A–I, flow-chart A–H, matching list
  - Example block P1, form/lecture layout, gap inline
- `pnpm gen:ielts-html` (= `python gen.py`) — regenerate 48 file + copy `Tainguyen/PDF to HTML/`
- Verify: Cam20 T1 có bảng Restaurant; Cam9 T2 có bảng Parks + MC đúng JSON + `map.jpg` HINCHINGBROOKE; Cam9 T1 có Example + Q9 inline

### Workflow đề xuất (DOCX + HTML)
| Bước | User / Agent |
|------|----------------|
| 1 | User làm DOCX theo đề giấy |
| 2 | (Tuỳ chọn) ChatGPT/Import Wizard → `exam_partN.json` |
| 3 | `pnpm ielts:bundle` → ZIP import app |
| 4 | `pnpm gen:ielts-html` → HTML tham chiếu so với DOCX/PDF |

### Cam11 Test 4 Part 1 — FESTIVAL EVENTS table + PLAYS (2026-07-05)
- **Triệu chứng:** notePassage tab-separated lộn xộn; Jazz thiếu "Also appearing"; Duck races thiếu prize [4]; Flower show venue/notes sai; Q8–10 mapLabel A–I.
- **Fix JSON:** `noteTables` 4 cột đúng True.jpg (break trong Notes Duck races); `[6] Hall`; PLAYS matching A–C.
- **ZIP:** `Listening IELTS_Test4_Cam11.zip` repack.

### Cam12 Test 1 Part 1 — FAMILY EXCURSIONS form notes (2026-07-05)
- **Tham chiếu:** `Tainguyen/IELTS/Fix/Cam 12/Test 1/True.jpg`.
- **Triệu chứng:** Cyclists need — repair kit / food and drink / [8] gom một dòng; Q4 `• •`; sub-list thiếu `–`.
- **Fix JSON:** `• Cyclists need:` + `–` sub-items; Q4 `•` + gap; `np_section("Cost")`; terminal Q7 không bullet.
- **Fix build:** `cam12_t1_p1()` trong `build-ielts-cam12-v2-listening.py`; skip `_enrich_passage_bullets` khi JSON đã có markers.
- **Fix renderer:** `shouldAppendToFormLine` — không gom chữ `a` vào dòng bullet trước.
- **ZIP:** `Listening IELTS_Test1_Cam12.zip` repack PASS.

### Cam11 Test 4 Part 4 — Soil / CO₂ lecture notes (2026-07-05)
- **Tham chiếu:** `Tainguyen/IELTS/Fix/Cam 11/Test 4/True.jpg`.
- **Triệu chứng:** thiếu nhiều bullet (Claims 13%, carbon lost, fertilizer, e.g. year-round); Q35–36 gom một dòng; tiêu đề sai; Australia/Future sections thiếu text.
- **Fix JSON:** `notePassage` đầy đủ theo True.jpg; `passageTitle` THE USE OF SOIL TO REDUCE CO₂ IN THE ATMOSPHERE; Q35/Q36 tách dòng; `notePassageLayout: lecture`.
- **Fix build:** `cam11_t4_p4()`; `_is_prose_after_section` — section kết thúc `:` giữ bullet list.
- **ZIP:** `Listening IELTS_Test4_Cam11.zip` repack PASS.

### Cam11 Test 4 Part 2 — MUSEUM COLLECTIONS + MUSEUM PLAN (2026-07-05)
- **Tham chiếu:** `Tainguyen/IELTS/Fix/Cam 11/Test 4/True.jpg` + `MUSEUM PLAN.jpg`.
- **Triệu chứng:** Q11–20 tất cả `mapLabel: true` + options A–I; Q11–16 render map thay vì matching bank A–G; Q17–20 thiếu ảnh plan; `notePassage` junk; `sectionTitle` sai.
- **Fix JSON:** Q11–16 matching A–G (nhãn đầy đủ, không `mapLabel`); Q17–20 `mapLabel` + A–H; `sectionTitle` MUSEUM COLLECTIONS / MUSEUM PLAN; `imageFile: map.jpg`.
- **Fix build:** `cam11_t4_p2()` — instruction đúng True.jpg; prompts Q17–20 lowercase.
- **Ảnh:** copy `MUSEUM PLAN.jpg` → `map.jpg`; `meta.json` restore version 1.
- **ZIP:** `pnpm ielts:merge` + `validate` + `pack` → `Listening IELTS_Test4_Cam11.zip` PASS.

### Cam11 Test 3 Part 4 — Ethnography in business notes (2026-07-05)
- **Triệu chứng:** Hospitals/Airlines dính vào dòng Computer companies; thiếu bullet Uganda, Principles; trail [34] tách dòng + bullet thừa.
- **Fix JSON:** `notePassage` đầy đủ theo True.jpg; subsection = `section`; `passageTitle` ETHNOGRAPHY IN BUSINESS; `notePassageLayout: lecture`.
- **Fix renderer:** `isShortContinuation` nhận trail dài (`to improve communication…` ≤100 ký tự).

### Cam11 Test 3 Part 3 — bảng Q21–26 + matching REPORT PARTS (2026-07-05)
- **Triệu chứng:** notePassage inline lộn xộn (bullet, text dính); Q27–30 hiện A–I + mapLabel sai; không có bảng 2 cột.
- **Fix JSON:** `noteTables` 3 hàng đúng True.jpg; bỏ `notePassage`; Q27–30 matching A–D + `sectionTitle` REPORT PARTS.
- **Fix UI:** `ListeningIeltsNoteTable` placeholder trống; `__cell` flex baseline; matching bank inline cho 4 option ngắn.

### Cam11 Test 3 Part 2 — thiếu map.jpg Q16–20 (2026-07-05)
- **Triệu chứng:** Questions 16–20 không hiện sơ đồ `map.jpg` (chỉ có dropdown matching).
- **Nguyên nhân:** `exam_part2.json` bị sai — Q16–20 thành `gap-fill`, thiếu `imageFile`, `mapLabel`, `sectionTitle` PLANS FOR FACILITIES.
- **Fix:** Regenerate từ `cam11_t3_p2()` + `imageFile: "map.jpg"` + `mapLabel: true`; copy `map.jpg` từ Fix folder; ZIP repack.
- **UI:** `ListeningIeltsMapBlock` — layout stacked + option bank A–G khi có nhãn đầy đủ.

### Cam11 Test 2 Part 4 — ngắt dòng lecture Taylor Concert Hall (2026-07-05)
- **Triệu chứng:** `● symbolic meaning` gom vào dòng `physical and [31] context`; 3 bullet auditorium gom một dòng dài [37][38][39].
- **Nguyên nhân:** `shouldAppendToFormLine` coi bullet mới là trail vì `isShortContinuation(bareNoteText)` trả true trên text lowercase nhiều từ sau khi gỡ marker.
- **Fix:** `isMisplacedGapTrailBullet()` — chỉ gom bullet nhầm trên trail ngắn (Room – seats 100); bullet list item thật → dòng mới.
- **Kết quả:** Introduction 3 bullet riêng; auditorium 3 dòng riêng; Building design / Evaluation đúng.

### Cam11 Test 2 Part 1 — ngắt dòng form Youth Council (2026-07-05)
- **Tham chiếu:** `Tainguyen/IELTS/Fix/Cam 11/Test 2/True.jpg` (đúng) vs `NotTrue.jpg` (app sai).
- **Triệu chứng:** bullet `•` tự inject sau gap; `Street, Stamford, Lincs` / `, and is interested in the` tách dòng; `Example – Name: Roger Brown` thành block example; `Occupation…[4] Studying [5]` gom một dòng.
- **Fix `listeningNotePassage.ts`:** `formPassageWithoutBullets()`, `isExampleMarkerLine()` (chỉ `"Example"`), `FORM_COMMA_TRAIL_RE` / `FORM_ADDRESS_TRAIL_RE`, `during the week` trong `SAME_LINE_GAP_TRAIL_RE`; `isFormSubFieldStarter()` — `Studying` sau [4] = dòng mới thụt lề.
- **Fix UI:** `listening-ielts-notes__line--indent` cho sub-field; title trong box khi `notePassageLayout: "form"`.
- **JSON:** `exam_part1.json` đã tách block đúng; ZIP repack: `pnpm ielts:merge` + `pnpm ielts:pack` → `Listening IELTS_Test2_Cam11.zip`.
- **Dòng sau fix:** Occupation…[4] | Studying [5]… (2 dòng); Hobbies [6][7] cùng dòng; không bullet thừa.

### Cam12 Test 3 Part 4 — mercury/birds lecture line splits (2026-07-05)
- **Triệu chứng:** Claire Q32/Q33 gom một dòng; `– the effects on bird song (usually learned from a bird's` bị tách mất marker `–`.
- **Nguyên nhân:** `repairFormPassageInlineBlocks()` tách nhầm dòng có ngoặc `(` trên lecture notes có `•/–`.
- **Fix renderer:** `repairFormPassageInlineBlocks` — skip khi `notePassageHasStructuredMarkers()`; không tách block đã có `•/–`.
- **JSON:** `exam_part4.json` đã đúng (coal/fish 2 dòng; Claire 3 dòng; Findings 3 dòng; Lab-based 2 dòng); `notePassageLayout: lecture`.
- **ZIP:** `Listening IELTS_Test3_Cam12.zip` merge + validate + pack PASS.
- **Q37:** Gộp `• Migrating birds such as [37]` + trail `containing mercury…` một dòng (bỏ `•` trên trail block).

### Cam12 Test 4 Part 1 — address Q7 inline (2026-07-05)
- **Triệu chứng:** `address: 277` + gap + `Place, Dumfries` tách 2 dòng; số nhà sai `277` thay vì `27`.
- **Fix JSON:** `• address: 27` + gap 7 + `Place, Dumfries`; prompt `Address: 27 … Place:`.
- **Fix renderer:** `FORM_ADDRESS_TRAIL_RE` nhận `Place,` (và road/lane/avenue/drive) — trail sau gap cùng dòng.
- **ZIP:** `Listening IELTS_Test4_Cam12.zip` merge + validate + pack PASS.

### Cam13 Test 1 — P1 table + P2/P3 headers + flow-chart end (2026-07-05)
- **P1:** Hàng Example trước The Food Studio; Bond's col3 hàng 2 = small classes/[2]/[3]; recipes/[5]/lecture/[6] hàng tiếp; Q10 trail `is sometimes available`.
- **P2:** Xóa `sectionTitle` Traffic Changes in Granford (Q11).
- **P3:** Xóa `sectionTitle` Seed germination (Q21); `ListeningIeltsFlowChartBlock` đọc `flowChartEnd` từ câu cuối → hiện `Investigate the findings.` sau Q30.
- **ZIP:** `Listening IELTS_Test1_Cam13.zip` merge + validate + pack PASS.

### Cam13 Test 1 Part 4 — urban animals lecture line splits (2026-07-05)
- **Intro:** Gộp 2 câu một dòng; bỏ `It was` → `Previously thought…`
- **Q31:** `• the [31] — because of its general adaptability` một dòng (`EM_DASH_GAP_TRAIL_RE`)
- **Q32/Q33:** Tách pigeon + `In fact…[33]` hai dòng
- **Q40:** Gộp `Species…cities. However, some changes may not be [40]`
- **ZIP:** repack PASS

### Cam13 Test 1 Part 1 — COOKERY CLASSES table vs true.jpg (2026-07-05)
- **Tham chiếu:** `Tainguyen/IELTS/Fix/Cam 13/Test 1/true.jpg`
- **Sửa:** 3 hàng dữ liệu — Hàng 1: `Example` + `The Food Studio` (cùng ô) | focus [1] | Other Info small classes/[2]/[3]; Hàng 2: Bond's | [4] | recipes [5]/lecture [6]; Hàng 3: The [7] Centre | [8] | [9]/[10] is sometimes available.
- **ZIP:** repack PASS

### Cam13 Test 2 — P1 Level B + P2/P3 titles + P4 line splits (2026-07-05)
- **P1:** `Level 8` → `Level B`; bỏ trail `kph`
- **P2:** Xóa `Information on company volunteering projects`
- **P3:** Xóa `Planning a presentation on nanotechnology`
- **P4:** Encoding 3 dòng; Consolidation 3 dòng; impairments 2 dòng (bỏ `•` trail block sai)
- **ZIP:** `Listening IELTS_Test2_Cam13.zip` repack PASS

### Cam13 Test 3 — P1–P4 fixes (2026-07-05)
- **P1:** Tách `Linda…[2]` / `Limited [3] in city centre` (`isMisplacedGapTrailBullet` — không gom `• Limited`)
- **P2:** Xóa `Physical activities`; bỏ option C `set a time limit` (Q19–20)
- **P3:** Xóa `Project on using natural dyes…`; matching title `Natural dyes` → `Problems`
- **P4:** `Possible reasons:` → section; 3 dòng prose + `• to provide [37]…` (`isProseLineBreakAhead`)
- **ZIP:** `Listening IELTS_Test3_Cam13.zip` repack PASS

### Cam13 Test 4 — P2 title + P4 Q38 order (2026-07-05)
- **P2:** Xóa `sectionTitle` The Snow Centre (Q11)
- **P4:** Dòng Q38 (`The move towards the consumption of [38]…`) đặt trước section `Coffee in the 19th century` (đúng đề giấy)
- **ZIP:** `Listening IELTS_Test4_Cam13.zip` repack PASS

### Cam14 Test 1 — P1 form + P2 title + P4 lecture (2026-07-05)
- **P1:** `Current address: [3] Apartments (No 15)` gộp 1 dòng; wallet £[4] / `• a [5]` tách 2 dòng; `Crime reference number allocated [10]` inline (bỏ section)
- **Renderer:** `FORM_BUILDING_TRAIL_RE` + `isMisplacedGapTrailBullet` không gom `• a` sau gap (Cam14 T1 P1)
- **P2:** Xóa `sectionTitle` Induction talk for new apprentices (Q11)
- **P4:** Viết lại `notePassage` — What's needed, Wave prose, lagoon bullets, Advantages/Problem sections, Ocean thermal energy conversion; `notePassageLayout: lecture`
- **Build:** `cam14_t1_p1/p2/p4()` trong `build-ielts-cam13-14-listening.py` khớp JSON
- **ZIP:** `Listening IELTS_Test1_Cam14.zip` validate + pack PASS

### Cam19 Test 3 — P1 notes + P3 flowchart (2026-07-05)
- **P1 Q1–6:** Đổi từ bảng 2 cột sang `notePassageSections` — **Where to go** / **Fish market** / **Organic shop** / **Supermarket** + bullet `•` (khớp True.jpg Fix/Cam 19); thêm `pm, earlier than closing time` sau Q3
- **P1 Q7–10:** Giữ bảng Shopping / To buy / Other ideas
- **P3:** Xóa `flowChartEnd: Investigate the findings.` sau Q30
- **ZIP:** `Listening IELTS_Test3_Cam19.zip` merge + validate + pack PASS

### Cam19 Test 4 — P1 First day at work True.jpg (2026-07-05)
- **P1 Q1–6:** Đổi từ bảng 2 cột sang `notePassageLayout: form` + `notePassageSections` — bullet `•` + gap inline trong box **First day at work** (khớp True.jpg Fix/Cam 19); bỏ `in staffroom` sau Q2
- **P1 Q7–10:** Header **Responsibility** (không Section); Sushi → **Sushi takeaway counter**; Q8 chuyển sang Task 1 `Re-stock with [8] boxes if needed`; Task 2 gộp `Wipe preparation area and clean the sink` + `Do not clean any knives`; Notes static
- **Build:** `cam19_t4_p1()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test4_Cam19.zip` merge + validate + pack PASS

### Cambridge A2–C2 — Library Archives UI (2026-07-05)
- **ExamTrackPage** `/app/exam/track/cambridge/{a2|b1|…}` — Reading + Listening dùng `IeltsLibraryArchive` giống IELTS (`Giaodien/GiaodienListeningIELTS.jpg`)
- **Bìa sách:** `KET` / `PET` / `FCE` / `CAE` / `CPE` + số quyển; tiêu đề card `CAMBRIDGE KET 1`…
- **Nhóm đề:** `cambridgeLibraryGrouping.ts` — Test N → Book ceil(N/4); search `Test 2`, `Book 1`
- **CSS:** `exam-hub-page--ielts` layout cho cả Cambridge level pages

### Cam20 Test 4 — P4 Chembe Bird Sanctuary True.jpg (2026-07-05)
- **P4:** `passageTitle` "Research in the area around Chembe Bird Sanctuary" (bỏ section trùng); section 1 bullets `•`; "Falling numbers" — parent `accidentally killed:` + sub `– by [34]` / `– by electrocution… [35]`; "Ways of protecting" — `frightening birds of prey by:` + sub `– keeping a [38]` / `– making a [39] – e.g.…`
- **Build:** `cam20_t4_p4()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test4_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 4 — P1 Advice on family visit True.jpg (2026-07-05)
- **P1:** `passageTitle` "Advice on family visit" (bỏ section trùng); gap inline Q1/Q3/Q9; Q2 `£ [2]`; Science Museum 2 dòng `•`; Food 2 bullet `• Clacton Market… food` + `• need to have lunch…`; Free activities label + 2 bullet `•`
- **Build:** `cam20_t4_p1()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test4_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 3 — P4 Inclusive design True.jpg + map.jpg (2026-07-05)
- **P4:** Khớp True.jpg Fix/Cam 20 — `passageTitle: Inclusive design`; **Definition** / **Examples** có `•` + gap inline; Q32 thêm ` problems` sau gap
- **To assist the elderly:** section + `•` 2 mục; **Impact** — Access / Safety / Comfort in the workplace + sub `–`
- **Build:** `cam20_t3_p4()` + `notePassageLayout: lecture`
- **map.jpg:** Copy `Tainguyen/.../Test3_Cam20/map.jpg` → catalog `ielts-cam20-test3`
- **ZIP:** `Listening IELTS_Test3_Cam20.zip` merge + validate + pack PASS (gồm map.jpg)

### Cam20 Test 3 — P1 Furniture rental companies True.jpg (2026-07-05)
- **P1:** Khớp True.jpg Fix/Cam 20 — bảng 3 cột **Furniture rental companies** + bullet `•` trong ô nhiều dòng
- **Peak notes:** `• The furniture…` / `• Delivers in 1-2 days` / `• Special offer…`
- **Aaron row:** costs `• Mid-range prices` + `• 12% monthly fee for [5]`; notes chỉ `Also offers a cleaning service`
- **Larch notes:** `• Must have own [7]` + `• Minimum contract length: six months` (không `Must have enough space`)
- **Q8:** `[8] Rentals` — gap tên công ty (answer `space` → Space Rentals), không phải số 8 tĩnh
- **Build:** `CAM20_T3_P1_TABLE` + `cam20_t3_p1()` + `passageTitle`
- **ZIP:** `Listening IELTS_Test3_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 2 — P4 Developing food trend True.jpg (2026-07-05)
- **P4:** Khớp True.jpg Fix/Cam 20 — `passageTitle: Developing food trend` (không trends); bỏ section trùng tiêu đề
- **Intro:** `•` mục chính; `–` sub cho Sales of [32] và Famous [33]
- **Marketing campaigns:** label `The avocado:` / `Oat milk:` / `Norwegian skrei:` + sub `–`; Q34 inline `– [34] were invited…`; thêm dòng **A Swedish brand's media campaign received publicity by upsetting competitors.**
- **Ethical concerns:** `Quinoa:` + sub `–` cho Q39–40
- **Build:** `cam20_t2_p4()` + `notePassageLayout: lecture`
- **ZIP:** `Listening IELTS_Test2_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 2 — P1 carers notes True.jpg (2026-07-05)
- **P1:** Khớp True.jpg Fix/Cam 20 — gap inline (`• a [1]`, `• how much [2] the caring involves`, `– [6] her`…); bỏ `sectionTitle` thừa **Local councils — practical support for carers**
- **Q6:** Sửa `–` tách dòng → `– ` + gap + ` her` (1 dòng, không gộp với Q5)
- **Build:** `cam20_t2_p1()` trong `build-ielts-cam19-20-listening.py`
- **ZIP:** `Listening IELTS_Test2_Cam20.zip` merge + validate + pack PASS

### Cam20 Test 1 — P4 Reclaiming urban rivers True.jpg (2026-07-05)
- **P4:** Khớp True.jpg Fix/Cam 20 — `•` mục chính; `–` sub-list dưới `Industrial development…` và `In Los Angeles…`
- **Q33:** `Seals and even a [33] have been seen` (1 dòng, không bullet lạ giữa gap)
- **Q38:** Thêm `in cities around the world` sau gap
- **Q39–40:** 1 bullet `Instead of road transport, goods could be transported… electric [39], or in the future, by [40]`
- **Build:** `CAM20_T1_P4_NOTE` + `cam20_t1_p4()` + `notePassageLayout: lecture`
- **ZIP:** `Listening IELTS_Test1_Cam20.zip` merge + validate + pack PASS

### Cam19 Test 4 — P4 Tree planting True.jpg (2026-07-05)
- **P4:** Khớp True.jpg — `passageTitle: Tree planting`; section **Reforestation projects should:** (không bullet); 5 mục dùng `•`; **Large-scale** / **Lampang** / **Involving local communities** có `•` mục chính
- **Lampang:** sub-list `– supporting many wildlife species` + `– increasing the [37]… e.g., [38] were soon attracted` (1 dòng, không tách bullet giữa Q37)
- **Mangrove project:** sub-list `–` cho 3 mục dưới `The mangrove reforestation project:`
- **Build:** `cam19_t4_p4()` + `notePassageLayout: lecture`
- **ZIP:** `Listening IELTS_Test4_Cam19.zip` merge + validate + pack PASS

### Cam19 Test 2 — P1 table row + P4 Tardigrades True.jpg (2026-07-05)
- **P1 Q7–10:** Thêm dòng `5 minutes` / `noting things to practise at home` dưới hàng `10 minutes` / `playing single notes…`
- **P4:** Khớp True.jpg — `•` mọi mục; `• a [32] round body…` 1 dòng; Cryptobiosis/Feeding/Conservation có bullet; `• may eat other tardigrades` tách dòng
- **ZIP:** `Listening IELTS_Test2_Cam19.zip` merge + validate + pack PASS

### Cam19 Test 1 — P1 + P4 Fix/Cam 19 True.jpg (2026-07-05)
- **P1:** Bỏ section trùng `Hinchingbrooke Country Park` (chỉ `passageTitle` trong box); giữ `The park` + bullet `•` + gap inline
- **P4:** Khớp True.jpg — `•` mọi mục chính; `–` chỉ sub dưới Discovery / Neolithic innovations; `• His [32] became…` 1 dòng; `• Items…[34]`; `• Each field…` / `• The fields…` (không `–`); `•` Reasons Q39–40

### Cam19 Test 1 — P4 bullets + map.jpg (2026-07-05)
- **P4:** Thêm `•` / `–` đúng đề giấy; tách **Neolithic innovations include:** → `– cooking indoors` / `– pots used for storage and to make [36]` (3 dòng riêng)
- **Build:** `cam19_t1_p4()` + `notePassageLayout: lecture`, `passageTitle: Ceide Fields`
- **map.jpg:** Copy `Tainguyen/.../Test1_Cam19/map.jpg` → catalog `ielts-cam19-test1`
- **ZIP:** `Listening IELTS_Test1_Cam19.zip` merge + validate + pack PASS (gồm map.jpg)

### Cam18 Test 2 — P1 notes + map.jpg (2026-07-05)
- **P1 Q1–5:** Đổi từ bảng 2 cột (Section | Details) sang `notePassageLayout: form` + `notePassageSections` — **Benefits** / **Person specification** trong box, bullet + gap inline (khớp True.jpg Fix/Cam 18)
- **P1 Q6–10:** Giữ `noteTables` (Location / Job title / …)
- **map.jpg:** Copy `Tainguyen/.../Test2_Cam18/map.jpg` → `apps/web/public/catalog/listening/ielts-cam18-test2/map.jpg`; ZIP pack gồm `map.jpg`
- **Build:** `cam18_t2_p1()` trong `build-ielts-cam17-18-listening.py`
- **ZIP:** `Listening IELTS_Test2_Cam18.zip` merge + validate + pack PASS

### Cam18 Test 1 — P1 Q6–Q7 two lines (2026-07-05)
- **P1 Q6–Q7:** Tách `– bus today was [6]` và `– frequency of buses in the [7]` thành 2 dòng (trước: gộp 1 dòng khi mất marker `–`)
- **Renderer:** `shouldAppendToFormLine` — không gom gap-lead mới vào dòng gap trước (`isGapLeadBlock`)
- **ZIP:** `Listening IELTS_Test1_Cam18.zip` merge + validate + pack PASS

### Cam17 Test 3 — P1 Q8 one line (2026-07-05)
- **P1 Q8:** `Average temperature in summer: approx. [8] degrees` gộp 1 dòng (trước: label / gap / `degrees` tách 3 dòng)
- **Renderer:** `isFormLabelWithInlineValue` không tách dòng khi có gap ngay sau (`approx.` kết thúc bằng `.`)

### Cam17 Test 2 — P1 notes layout (2026-07-05)
- **P1 Q1–7:** Đổi từ bảng 2 cột (Section | Details) sang `notePassageLayout: form` + `notePassageSections` — tiêu đề trong box, section **Library** / **Lunch club**, dòng độc lập "Help for individuals needed next week", không bullet (khớp True.jpg)
- **P1 Q8–10:** Giữ `noteTables` — bảng **Village social events**
- **Renderer:** `FORM_ROOM_IN_TRAIL_RE` — gộp `[3] Room in the village hall` cùng dòng
- **Build:** `cam17_t2_p1()` trong `build-ielts-cam17-18-listening.py`
- **ZIP:** `Listening IELTS_Test2_Cam17.zip` merge + validate + pack PASS

## Listening IELTS Cam 9–20 — HOÀN THÀNH (2026-07-05)

- [x] **48/48** folder `Tainguyen/IELTS/Listening IELTS_Test*_Cam*` — `pnpm ielts:validate` PASS
- [x] Fix layout True.jpg (P1 form/table, P2 map, P3 flow-chart, P4 lecture/bullets) — Cam 9–20
- [x] Build scripts: `build-ielts-cam9-10` … `cam19-20-listening.py` + renderer fixes (`ListeningIeltsNotePassage`, form line grouping…)
- [x] `pnpm gen:ielts-html` — HTML tham chiếu 48 đề
- [ ] **Batch pack ZIP** — nhiều folder chưa có `.zip` cạnh folder (chạy lệnh bên dưới)
- [ ] **Import hàng loạt** vào app + hard refresh
- [ ] **Deploy** `pnpm build:catalog` + `pnpm deploy:prod` khi user sẵn sàng

**Đường import chính:** ZIP (`pnpm ielts:bundle`) — **không** dùng Import Wizard DOCX hàng loạt.

---

## KET A2 Reading & Writing — Cam 1 Test 1 + AI chấm Writing (2026-07-06)

- [x] `Tainguyen/Import Cambridge/KET_A2/KET A2_Cam 1/Test 1/exam.json` — 7 parts (Q1–32), `durationMinutes: 60`, Part 6 email + Part 7 story
- [x] ZIP: `Tainguyen/Import Cambridge/KET_A2/KET A2_Cam 1/ket-reading-test1.zip` (exam.json + part1-q1…q6 + part7-p1…p3)
- [x] AI chấm Part 6–7: `ketRw/ketWritingGrade.ts` + `KetWritingGradePanel.tsx` — nút "Chấm điểm AI" trên `ExamResult` (Cambridge 0–5, Part 7 vision nếu OpenAI/Gemini)
- [x] `pnpm --filter web exec tsc --noEmit` — pass

---

## PET B1 Reading & Writing — shell 8 part + import ảnh (2026-07-06)

- [x] `apps/web/src/features/exam/petRw/` — UI shell 8 part (P1 signs … P6 cloze, P7–P8 writing) giống Giaodien `Reading_Writing_PET_B1`
- [x] `petWritingImportUtils.ts` — merge ảnh Part 2/4/7/8; **Part 8 chỉ 1 ảnh** `part8-page.jpg` (không tách p1…p3 như KET Part 7)
- [x] `cambridgeReadingImportTemplates.ts` — B1 template 8 parts (34 câu), hint Part 8 = 1 ảnh
- [x] `ReadingTest.tsx` route B1 → `ReadingPetRwTest`; `ImportReadingManualModal` hint Part 8 (1 ảnh)
- [x] `pnpm --filter web exec tsc --noEmit` — pass
- [x] `HDSD/Prompt-PET-B1-Reading-Universal.txt` — cập nhật 8 part RW; Part 8 = 1 ảnh `part8-page.jpg`

**Import ảnh PET (tuỳ chọn sau JSON):**

| File | Mục đích |
|------|----------|
| `part7-page.jpg` | Đề Writing Part 7 |
| `part8-page.jpg` | **1 ảnh** truyện Part 8 (3 khung trong 1 file) |
| `part2-page.jpg`, `part2-q6…q10.jpg`, `part4-page.jpg` | Layout/ảnh Part 2/4 |

---

## FCE B2 Reading & Writing — shell 9 part + import ảnh (2026-07-06)

- [x] `apps/web/src/features/exam/fceRw/` — UI shell 9 part (P1–P7 Reading + P8 essay + P9 story) giống Giaodien `Reading_Writing_FCE_B2`
- [x] `fceWritingImportUtils.ts` — Part 8 = `part8-page.jpg`; Part 9 = **1 ảnh** `part9-page.jpg` (như PET Part 8); merge cập nhật passage khi part đã có trong JSON
- [x] `cambridgeReadingImportTemplates.ts` — B2 template 9 parts (54 câu), hint Part 8–9 ảnh JPG
- [x] `ReadingTest.tsx` route B2 → `ReadingFceRwTest`; `ImportReadingManualModal` hint Part 8–9
- [x] `cambridgeExamFormats.ts` + `readingExamDuration.ts` — 80 phút, 9 parts
- [x] Catalog `reading-fce-b2-test1.json` — metadata Reading & Writing 80 phút (7 parts builtin; Part 8–9 qua import ảnh)
- [x] Part 7 UI + catalog: **Paragraph A** … **Paragraph D** (passage heading + options)
- [x] `HDSD/Prompt-FCE-B2-Reading-Universal.txt` — cập nhật 9 part RW, Part 7 Paragraph, Part 8–9 ảnh 1 file/part
- [x] `pnpm --filter web exec tsc --noEmit` — pass

**Import ảnh FCE (sau JSON 7 hoặc 9 part):**

| File | Mục đích |
|------|----------|
| `part8-page.jpg` | Đề Writing Part 8 (essay) |
| `part9-page.jpg` | **1 ảnh** truyện Part 9 (3 khung trong 1 file) |

---

## CAE C1 Reading & Writing — shell 10 part + import ảnh (2026-07-06)

- [x] `apps/web/src/features/exam/caeRw/` — UI shell 10 part (P1–P8 Reading + P9–P10 Writing) giống Giaodien `Reading_Writing_CAE_C1`
- [x] `CaeRwPartContent.tsx` — P6 Reviewer A–D; P7 gapped text kéo thả; P8 Consultant A–E; P9 Q57 + P10 Q58 (220–260 từ, mỗi part 1 ảnh)
- [x] `caeWritingImportUtils.ts` — Part 9 = `part9-page.jpg` (Q57); Part 10 = `part10-page.jpg` (Q58)
- [x] `cambridgeReadingImportTemplates.ts` — C1 template 10 parts (58 mục), hint Reviewer/Consultant/Part 9–10
- [x] `ReadingTest.tsx` route C1 → `ReadingCaeRwTest`; `ImportReadingManualModal` merge Part 9–10
- [x] `examData.ts` — `isCaeReadingWritingExam()`; `cambridgeExamFormats.ts` + `readingExamDuration.ts` — 90 phút (8 part) / 120 phút (có Part 9–10)
- [x] Catalog `reading-cae-c1-test1.json` + `Tainguyen/cae-Reading-test1/exam.json` — 10 parts; P6/P8 options Reviewer/Consultant; Part 9–10 Writing
- [x] Media: `part9-page.jpg`, `part10-page.jpg` trong `Tainguyen/` + `apps/web/public/catalog/reading/cae-c1-test1/`
- [x] `build-catalog.mjs` — giữ `minWords` cho writing-task
- [x] `pnpm --filter web exec tsc --noEmit` — pass
- [x] `HDSD/Prompt-CAE-C1-Reading-Universal.txt` — 10 part RW, Reviewer/Consultant, Part 9–10 JPG
- [ ] `part10-page.jpg` builtin — hiện **placeholder** (copy `Part9.jpg`); cần ảnh riêng Q58 khi có screenshot

**Cấu trúc 10 parts (58 mục):**

| Part | Câu | UI |
|------|-----|-----|
| 1–5 | 1–36 | MC cloze, open cloze, keyword list, transformation, reading MC |
| 6 | 37–40 | Cross-text: **Reviewer A**…**D** trái, radio phải |
| 7 | 41–46 | Gapped text: gap trái + bank A–G kéo thả phải |
| 8 | 47–56 | Multiple matching: **Consultant A**…**E** |
| 9 | 57 | Writing task 1 — split pane, 220–260 từ |
| 10 | 58 | Writing task 2 — split pane, 220–260 từ |

**Import ảnh CAE (sau JSON 8 hoặc 10 part):**

| File | Mục đích |
|------|----------|
| `part9-page.jpg` | Đề Writing Part 9 (Q57) |
| `part10-page.jpg` | Đề Writing Part 10 (Q58) |

**Screenshot ref:** `Giaodien/Taicautruc/Reading_Writing_CAE_C1/Part1.jpg` … `Part7.jpg`, `Part9.jpg`

---

## CPE C2 Reading & Writing — shell 9 part + import ảnh (2026-07-06)

- [x] `apps/web/src/features/exam/cpeRw/` — UI shell 9 part (P1–P7 Reading + P8 essay + P9 choice) giống Giaodien `Reading_Writing_CPE_C2`
- [x] `cpeWritingImportUtils.ts` — Part 8 = `part8-page.jpg` (essay 240–280); Part 9 = `part9-page.jpg` (Q2–Q4 choice 280–320)
- [x] `cambridgeReadingImportTemplates.ts` — C2 template 9 parts; Part 4 single-gap transform; Part 6 bank A–H từ passage
- [x] `ReadingTest.tsx` route C2 → `ReadingCpeRwTest`; `ImportReadingManualModal` merge Part 8–9
- [x] Catalog `reading-cpe-c2-test1.json` + `Tainguyen/cpe-Reading-test1/` — 120 phút
- [x] `HDSD/Prompt-CPE-C2-Reading-Universal.txt` — 9 part RW, rules Part 4/6/8–9, answer key Test 1; cập nhật `Import De Thi.txt`, `Prompt-Reading-Cambridge.txt`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

**Import ảnh CPE (sau JSON):**

| File | Mục đích |
|------|----------|
| `part8-page.jpg` | Đề Writing Part 8 (essay) |
| `part9-page.jpg` | Đề Writing Part 9 (choice Q2–Q4) |

**Test nhanh:** `/app/exam/reading/catalog-reading-cpe-c2-test1`

---

## Việc đã hoàn thành (session 2026-07-06 — HDSD + UX polish)

### HDSD prompts
- [x] **Listening Universal A2–C2** — `HDSD/Prompt-Listening-Cambridge.txt` (index) + 5 file `Prompt-{KET-A2|PET-B1|FCE-B2|CAE-C1|CPE-C2}-Listening-Universal.txt`
- [x] **Vocab import** — `HDSD/Prompt-Vocab-Universal.txt` (CSV/JSON, cột `phrase` hỗ trợ cụm từ) + `Prompt-Vocab-Chu-De.txt` (6 nhóm IELTS/Oxford/TOEIC/…) + `Import Vocab.txt`

### UX exam
- [x] **Nút Exit** Listening FCE/CAE/CPE — `ListeningFceTest.tsx` header (`listening-ket-cambridge__exit`), `navigate(listeningExamBackPath(exam))` về track Cambridge tương ứng
- [x] **Fix theme Cambridge A2–C2 library** — token `--color-on-primary: #ffffff` (light/mid/dark) trong `globals.css`; thay `color: var(--bg-primary)` → `var(--color-on-primary)` trên nút primary trong `examHub.css` + modal `ImportReadingManualModal`, `ImportListeningModal`, `ExamResult`

**Nguyên nhân lỗi theme:** `--bg-primary` = trắng (light) / đen (dark) — dùng làm màu chữ trên nền `--color-primary` khiến dark theme mất contrast.

**Test theme:** `/app/exam/track/cambridge/a2` → đổi theme Sáng/Tối trong sidebar — nút CTA, pill "TẤT CẢ", "Làm bài" phải giữ chữ trắng.

### Vocab (đã có sẵn trong app)
- Import cụm từ qua cột `phrase` — `features/vocab/importExport.ts`, `ImportModal.tsx`

---

## Lỗi còn tồn tại — Cambridge RW (cập nhật 2026-07-06)

- [ ] **CAE Part 10 ảnh** — `part10-page.jpg` chưa có screenshot riêng Q58 (đang dùng copy Part9)
- [ ] **`pnpm build:catalog`** — cần đủ folder `Tainguyen/ket-reading-test1` … (một số chỉ có `.zip`); CAE/CPE đã có folder + ảnh
- [ ] **Theme debt app-wide** — một số trang khác vẫn dùng `color: var(--bg-primary)` trên nút primary (Settings, Vocab, Listening library…); Cambridge library đã fix
- [x] **CPE C2 Reading** — RW shell 9 parts (`cpeRw/`) + catalog `reading-cpe-c2-test1`
- [x] **Prompt HDSD CAE** — `HDSD/Prompt-CAE-C1-Reading-Universal.txt`
- [x] **Prompt HDSD CPE** — `HDSD/Prompt-CPE-C2-Reading-Universal.txt` (9 parts RW, Part 4/6/8–9 rules, answer key Test 1)
- [x] **Prompt HDSD Listening Universal A2–C2** — `HDSD/Prompt-Listening-Cambridge.txt` + 5 file `Prompt-*-Listening-Universal.txt` (KET/PET/FCE/CAE/CPE)
- [x] **Prompt HDSD Vocab import** — `HDSD/Prompt-Vocab-Universal.txt` + `Prompt-Vocab-Chu-De.txt` + `Import Vocab.txt` (từ đơn + cụm từ, 6 nhóm chủ đề)
- [x] **Fix theme Cambridge A2–C2 library** — token `--color-on-primary` trong `globals.css`; nút CTA/filter pill trong `examHub.css` + modal import exam dùng màu chữ cố định thay `var(--bg-primary)` (tránh chữ đen trên nền tím khi dark theme)
- [x] TypeScript `pnpm --filter web exec tsc --noEmit` — pass (CAE RW)

---

## Next session start prompt
```
Đọc session_summary.md ngay.

## Đã xong (2026-07-06) — Cambridge Reading & Writing shells (5 level)
- KET A2: 7 parts RW + AI chấm Writing P6–7
- PET B1: 8 parts RW; Part 8 = 1 ảnh `part8-page.jpg`
- FCE B2: 9 parts RW; Part 8/9 JPG; Part 7 Paragraph A–D
- CAE C1: 10 parts RW; P6 Reviewer / P8 Consultant; P9/P10 Writing JPG → `caeRw/` · `catalog-reading-cae-c1-test1`
- CPE C2: 9 parts RW; P4 transform 1 gap; P6 bank A–H; P8 essay + P9 choice → `cpeRw/` · `catalog-reading-cpe-c2-test1`

## Đã xong (2026-07-06) — HDSD + UX
- Listening Universal A2–C2: `HDSD/Prompt-Listening-Cambridge.txt` + 5 file level-specific
- Vocab import: `Prompt-Vocab-Universal.txt` + `Prompt-Vocab-Chu-De.txt` + `Import Vocab.txt` (cụm từ qua `phrase`)
- Exit Listening FCE/CAE/CPE: `ListeningFceTest.tsx`
- Fix theme Cambridge library: `--color-on-primary` · `examHub.css` · modal import exam

## Đã xong (2026-07-05)
- Listening IELTS Cam 9–20: validate 48/48 PASS
- Cambridge Library Archives → /app/exam/track/cambridge/{a2|b1|b2|c1|c2}

## Ưu tiên session mới (chọn theo user)

### A — Verify + ship Cambridge RW
1. Hard refresh → so từng level với Giaodien `Reading_Writing_*`
2. Thay `part10-page.jpg` CAE bằng screenshot Q58 thật (nếu có)
3. `pnpm build:catalog` (khi đủ Tainguyen folders) + deploy

### B — IELTS Listening import (48 ZIP)
- Batch `pnpm ielts:bundle` → Import thủ công Listening
- Pilot: Cam11 T1, Cam10 T3, Cam20 T4

### C — Reading IELTS
- [x] Pipeline bundle: `pnpm ielts:reading:{scaffold|export-pilots|validate|merge|pack|bundle|bundle:all}`
- [x] Scaffold 48 folder `Reading IELTS_Test{N}_Cam{X}` + HDSD/Prompt
- [x] 3 pilot ZIP (Cam10 T1, Cam11 T3 headings, Cam10 T4 YNNG)
- [ ] 45 đề còn lại — cần OCR text → AI → exam_passage1–3.json
- [x] Wizard template mở rộng (18 layout P1–P3) — Việc 3
- [ ] Table/Note layout renderer (nếu đề có bảng trong câu hỏi)

### D — Theme debt app-wide
- Cambridge library đã fix `--color-on-primary`
- Còn Settings, Vocab, Listening library… dùng `color: var(--bg-primary)` trên nút primary

### E — Cambridge Listening UI
- FCE/CAE/CPE Listening dùng `ListeningFceTest` shell (screenshot-based)
- Recipe CAE: cuối `session_summary.md`

## Lệnh thường dùng
pnpm dev
pnpm --filter web exec tsc --noEmit
pnpm build:catalog
pnpm ielts:bundle "IELTS/Listening IELTS_Test4_Cam20"

## Test nhanh
/app/exam/track/cambridge/a2          — library + đổi theme
/app/exam/reading/catalog-reading-cae-c1-test1
/app/exam/reading/catalog-reading-cpe-c2-test1
```

### Verify (session tiếp)
- [x] `pnpm --filter web exec tsc --noEmit` pass
- [x] Prompt HDSD Reading CAE + CPE Universal
- [x] Prompt HDSD Listening Universal A2–C2 + Vocab import
- [x] Fix theme Cambridge A2–C2 library (`--color-on-primary`)
- [ ] CAE RW UI: 10 part footer, P9/P10 ảnh + textarea, Reviewer/Consultant labels
- [ ] Thay `part10-page.jpg` ảnh thật Q58
- [ ] `pnpm build:catalog` full (khi Tainguyen folders đủ)
- [ ] Deploy production RW shells
---

## IELTS Reading — YNNG + Matching Headings renderer (2026-07-07)

- [x] Types: `yes-no-not-given`, `matching-headings` (question); `ynng`, `matching-headings` (group); `headings[]`
- [x] `ReadingQuestionPanel` — `YnngGroup`, `MatchingHeadingsGroup` (+ `TriStateGroup` TFNG/YNNG)
- [x] `importReadingManualUtils` — validate + build; auto YNNG options khi import
- [x] `ExamResult` — format đáp án heading (`i. label…`)
- [x] Demo builtin `ielts-reading-types-demo` — Part 1 headings, Part 2 YNNG
- [x] `pnpm --filter web exec tsc --noEmit` pass

**Test:** `/app/exam/reading/ielts-reading-types-demo`

---

## IELTS Reading Wizard — template mở rộng (Việc 3, 2026-07-07) — HOÀN THÀNH 18 template

- [x] **18 template** per-passage picker (6 mỗi Passage) — cover layout Cam 9–20
- [x] **P1 (6):** `r1` TFNG+MC · `r1g` TFNG+Gap · `r1h` Headings+MC · `r1s` Sentence+MC · `r1hg` Headings+Gap · `r1m` Gap+MC
- [x] **P2 (6):** `r2` Match+MC · `r2y` YNNG+Match · `r2h` Headings+Gap+YNNG · `r2t` TFNG+Match · `r2g` Gap+Match · `r2s` Summary+YNNG+MC
- [x] **P3 (6):** `r3` TFNG+MC · `r3f` Gap+TFNG+Flow · `r3y` YNNG+MC · `r3gy` Gap+YNNG+MC · `r3sy` Summary+YNNG+MC · `r3gt` Gap+TFNG+MC
- [x] `ieltsReadingPartTemplates.ts` — builder + SAMPLE JSON cho 18 template
- [x] `ieltsReadingAiPrompt.ts` — `passageExtraRules()` chi tiết theo template
- [x] `ieltsReadingWizardEdit.ts` — `TEMPLATE_SIGNATURES` map gap/sentence-completion → template mới
- [x] `ieltsReadingWizardPersist.ts` — fallback template kind không hợp lệ
- [x] **Ảnh preview layout** — 18 SVG schematic + lightbox zoom (giống Listening Wizard)
- [x] `public/ielts-wizard/reading/p{1,2,3}/*.svg` + `scripts/generate-ielts-reading-wizard-previews.mjs`
- [x] `pnpm --filter web exec tsc --noEmit` pass

**Import Cam9 T1 qua Wizard:** P1 → `r1g`, P2 → `r2h`, P3 → `r3f`

**Workflow 45 đề còn lại:** OCR PDF → Wizard (chọn template đúng layout) → AI JSON → Lưu Dexie → `pnpm ielts:reading:bundle:all` → Import ZIP

**Test:** `/app/exam/track/ielts` → Import Wizard Reading → chọn template từng Passage (6 option/passage)

---

## IELTS Reading Wizard — sửa đề đã import (2026-07-07)

- [x] Nút **bút chì** trên Library Archives (đề IELTS import 3 passages)
- [x] `ieltsReadingWizardEdit.ts` — nạp đề Dexie → wizard draft, suy template, tái tạo answer key
- [x] Chế độ sửa: Preview → **Sửa passages** → chỉ tạo lại passage cần fix → **Cập nhật đề** (`examRepo.update`)
- [x] Giữ `imageKey` ảnh passage cũ khi cập nhật (`mergePassageImageKeys`)
- [x] `pnpm --filter web exec tsc --noEmit` pass

**Workflow sửa P1:** Library → Test → bút chì → Sửa passages → Passage 1 → Tạo JSON → Cập nhật đề

---

## IELTS Reading — bundle pipeline + 48 scaffold (2026-07-07)

- [x] `ieltsReadingBundle.ts` + `scripts/ielts-reading-bundle.ts` (merge/validate/pack/bundle)
- [x] `scaffold-ielts-reading-folders.mjs` — 48 folder + meta.json + answer-key.txt
- [x] `export-ielts-reading-pilots.ts` — 3 pilot đủ 40 câu
- [x] `batch-ielts-reading-bundle.mjs` — bundle hàng loạt khi đủ 3 passages
- [x] HDSD: `Import Reading IELTS.txt`, `Prompt-IELTS-Reading-Cam9-Cam20.txt`
- [x] Pilot ZIP: `Reading IELTS_Test1_Cam10`, `Test3_Cam11`, `Test4_Cam10`
- [x] **Cam9 Test 1** — `scripts/build-ielts-reading-cam9-test1.py` → 3 passages · 40 câu · ZIP sẵn (`Reading IELTS_Test1_Cam9.zip`)
- [x] **Cam9 Tests 2–4** — `scripts/build-ielts-reading-cam9-tests-234.py` + `scripts/ielts_reading_cam9_lib.py` (parser plain text PDF/DOCX)
  - T2: Hearing/classroom noise · Venus in Transit · Neuroscientist/iconoclast
  - T3: Attitudes to language · Tidal power · Information theory/Voyager
  - T4: Marie Curie · Children's identity · Development of Museums
  - ZIP: `Reading IELTS_Test2_Cam9.zip`, `Test3_Cam9.zip`, `Test4_Cam9.zip` — **40 câu mỗi test, không cảnh báo**
  - Lệnh gộp: `pnpm ielts:reading:build-cam9` (T1 + T2–4)
- [x] **Cam10 Tests 1–4** — `scripts/build-ielts-reading-cam10.py` + plain text từ PDF
  - T1: Stepwells · EU Transport · Psychology of innovation
  - T2: Tea/Industrial Revolution · Gifted children · Museums of fine art
  - T3: Tourism · Autumn leaves · Beyond the blue horizon
  - T4: Megafires · Second nature · Evolution backwards
  - ZIP: `Reading IELTS_Test1_Cam10.zip` … `Test4_Cam10.zip` — **40 câu/test, không cảnh báo**
  - Lệnh: `pnpm ielts:reading:build-cam10`
- [ ] Cam11/12 Test 1 + 37 đề còn lại

**Lệnh:** `pnpm ielts:reading:build-cam10` → `pnpm ielts:reading:bundle "IELTS/Reading IELTS_Test{N}_Cam10"`

---

## FCE B2 Listening — Cambridge screenshot shell + Part 2 local image import (2026-07-06)

- [x] Screenshot source: `Giaodien/Taicautruc/Listening_FCE_B2/Part1.jpg` ... `Part4.jpg`.
- [x] `ListeningTest.tsx` routes `exam.examType === 'fce'` to `ListeningFceTest`.
- [x] `ListeningFceTest.tsx` — Cambridge shell reused from KET/PET: top Cambridge header, fixed footer 4 parts, qnav, prev/next floating buttons, submit modal, localStorage draft, shared audio continues across parts.
- [x] `ListeningFceMcPartView.tsx` — Part 1 shows only active MC question like screenshot; Part 4 shows all MC questions in one scrolling page. Options are full-width pale rows with radio circle.
- [x] `ListeningFceGapFillPartView.tsx` — Part 2 gap-fill layout for Spectacled Bears, title + optional part image, inline numbered gaps.
- [x] Part 2 has a small local image picker: user can click `Import` and choose an image from PC; preview replaces existing part image for current browser session only. It is not persisted to `exam.json`/Dexie.
- [x] `ListeningFceMatchingPartView.tsx` — Part 3 speaker matching: speakers + drop slots left, answer bank right, supports click-to-pick and drag/drop, one-use options.
- [x] `listeningTest.css` — scoped `.listening-fce-*` CSS, based on Cambridge screenshot spacing/colors. Does not intentionally alter KET/PET/IELTS.
- [ ] No test/build run for this change per user request.

### Recipe for next model: CAE C1 Listening UI

- Start from FCE implementation, not `ListeningIeltsTest`.
- Create CAE-specific shell/view files rather than overloading IELTS:
  - `ListeningCaeTest.tsx`
  - `ListeningCaeMcPartView.tsx` for CAE Part 1/3 MC
  - `ListeningCaeGapFillPartView.tsx` for CAE Part 2
  - reuse/adapt `ListeningDualLetterMatchingPartView` or make `ListeningCaeDualMatchingPartView.tsx` for Part 4 dual task
- Route in `ListeningTest.tsx`: `if (exam.examType === 'cae') return shell(<ListeningCaeTest exam={exam} />)`.
- Use screenshots from the corresponding CAE folder if present under `Giaodien/Taicautruc/Listening_CAE_C1`; if absent, use FCE shell proportions and CAE data shape in `Tainguyen/cae-Listening-test1/exam.json`.
- CAE known data shape:
  - Part 1: MC, 3 extracts / 6 questions.
  - Part 2: gap-fill, `passageTitle` TRIP TO SOUTH AFRICA.
  - Part 3: MC A/B/C/D.
  - Part 4: dual matching, 10 questions split Task One 21-25 + Task Two 26-30, already detected by `isDualLetterMatchingPart()` / `dualMatchingTaskGroups()`.
- Keep audio behavior same as FCE/PET: use `resolveListeningAudioSource(exam, currentPart)`, `playKey = exam-${exam.id}`, do not stop audio when changing parts.
- Keep all CAE CSS scoped as `.listening-cae-*`.
- If user asks for Part 2 image import in CAE too, copy the small local image picker pattern from `ListeningFceGapFillPartView.tsx`.

---

## Listening CAE C1 + CPE C2 restructure from screenshots (2026-07-06)

- User requested screenshot-based restructure from:
  - `Giaodien/Taicautruc/Listening_CAE_C1/Part1.jpg` ... `Part4.jpg`
  - `Giaodien/Taicautruc/Listening_CPE_C2/Part1.jpg` ... `Part4.jpg`
- Note: user typed "Reading Writing CPE C2" once, but the folder and screenshots are Listening CPE C2; implementation followed the screenshots.

### CAE C1 Listening

- [x] `ListeningTest.tsx` now routes `exam.examType === 'cae'` into `ListeningFceTest` instead of falling through to IELTS.
- [x] `ListeningFceTest.tsx` now adds class `listening-cae-cambridge` for CAE and dispatches parts by data shape:
  - all `gap-fill` questions -> `ListeningFceGapFillPartView`
  - `isDualLetterMatchingPart(currentPart)` -> `ListeningDualLetterMatchingPartView`
  - `isGroupedLetterMatchingPart(currentPart)` -> `ListeningFceMatchingPartView`
  - otherwise MC -> `ListeningFceMcPartView`
- [x] CAE Part 3 is shown as all MC questions in one scrollable page.
- [x] CAE Part 4 dual matching uses `ListeningDualLetterMatchingPartView`.
- [x] Fixed CAE Part 4 answer-bank wrapping bug:
  - bank rows now use `display: flex`
  - answer text uses `white-space: nowrap` on desktop
  - task layout is vertical task-by-task like screenshot
  - mobile/medium widths allow wrapping under `1100px`
- [x] CSS is scoped through `.listening-cae-cambridge`.

### CPE C2 Listening

- [x] `ListeningTest.tsx` now routes `exam.examType === 'cpe'` into `ListeningFceTest`.
- [x] `ListeningFceTest.tsx` now adds `listening-cpe-cambridge` and reuses CAE-style Cambridge shell via `listening-cae-cambridge`.
- [x] CPE Part 3 MC displays all questions in one scrollable page, same as CAE.
- [x] `cambridgeListeningSamples.ts` now has `buildCpeListening()` replacing the previous generic `multiPartListening('c2', 'cpe', ...)` sample.
- [x] CPE sample shape now matches screenshots:
  - Part 1: Questions 1-6, MC, three extracts/two questions each.
  - Part 2: Questions 7-15, gap-fill scientific expedition.
  - Part 3: Questions 16-20, MC with 4 options.
  - Part 4: Questions 21-30, dual matching internships, Task 1 + Task 2.
- [x] Added local helpers in `cambridgeListeningSamples.ts`:
  - `listeningMcOptions()` for 4-option CPE MC
  - `listeningMatching()` for Part 4 matching questions

### Files touched in this sequence

- `apps/web/src/features/exam/ListeningTest.tsx`
- `apps/web/src/features/exam/ListeningFceTest.tsx`
- `apps/web/src/features/exam/ListeningFceMcPartView.tsx`
- `apps/web/src/features/exam/ListeningDualLetterMatchingPartView.tsx`
- `apps/web/src/features/exam/listeningTest.css`
- `apps/web/src/features/exam/cambridgeListeningSamples.ts`
- `session_summary.md`

### Verification status

- [ ] No test run.
- [ ] No build run.
- Reason: user explicitly asked not to run test/build for the earlier screenshot restructure work.

---

## Reading IELTS — Ảnh cloud Admin-only (session 2026-07-07) — HOÀN THÀNH

- [x] Migration `009_reading_exam_images.sql` — bucket `reading-exam-media` (public read) + bảng `reading_exam_images` + RLS (mọi user đọc, chỉ Admin insert/update/delete)
- [x] `readingExamCloudImages.ts` — upload/list/delete/merge ảnh theo `examId` + slot (`top`/`bottom`/`passage`/`group`)
- [x] `useReadingExamCloudImages.ts` + `useIsAdmin.ts` — hook load ảnh + flag admin từ Dexie settings
- [x] `ReadingTest.tsx` — merge cloud images khi render; upload/xóa chỉ khi `isAdmin`
- [x] `ReadingPassagePanel.tsx` / `ReadingPartTopImage.tsx` — user chỉ xem ảnh, không thấy slot upload
- [x] `IeltsReadingImportWizard.tsx` + `ImportReadingManualModal.tsx` — Admin import ảnh → `mediaStorage: 'cloud'`; user thường không upload
- [x] `importReadingManualUtils.ts` — `mediaStorage: 'local' | 'cloud'`
- [x] `database.types.ts` — `reading_exam_images` + `profiles.is_admin` + `Relationships: []`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Hành vi
- Admin thêm ảnh (trong đề hoặc Import Wizard) → lưu Supabase Storage + metadata → **mọi user thấy**
- Ảnh tồn tại mãi cho đến khi Admin xóa
- User thường: không có nút upload/xóa ảnh

### Deploy migration — ĐÃ CHẠY (2026-07-07)
- `pnpm db:push` → `009_reading_exam_images.sql` applied trên Supabase

### Fix ảnh không hiện (2026-07-07)
- Nguyên nhân chính: migration 009 chưa push → bucket/bảng không tồn tại, upload thất bại im lặng
- `isAdmin === true` (tránh `undefined` → lưu local Dexie thay vì cloud)
- Hỗ trợ tên file `part1-top.jpg`, `part1-bottom.jpg`, `part1-group-0.jpg`
- `topImageUrl`/`bottomImageUrl` trên `ReadingPart` + persist Dexie overlay cho đề builtin
- Hiện lỗi upload/load ảnh cho Admin trên màn Reading

### User không thấy dữ liệu Admin đã thêm — chẩn đoán (2026-07-07)

**Hai lớp dữ liệu tách biệt:**

| Lớp | Admin lưu | User thấy khi nào |
|-----|-----------|-------------------|
| **Ảnh** | Supabase `reading_exam_images` + Storage `reading-exam-media` | Mở **đúng `examId`** + có nội dung đề |
| **Nội dung đề** (passage, câu hỏi) | Trước đây chỉ **Dexie local** (IndexedDB trình duyệt Admin) | **Không** — mỗi máy/tài khoản riêng |

**Ví dụ thực tế:** ảnh cloud cho `reading-manual-1783427421159` đã có trên Supabase, nhưng bản đề JSON chưa publish → User không mở được đề / không thấy ảnh.

**Các case khác:**
- Ảnh lưu `imageKey` local (Dexie) khi `isAdmin` chưa load → chỉ Admin cùng máy thấy
- Đề import `reading-manual-*` không sync cloud (chỉ catalog builtin ship cùng deploy)
- Đề **builtin** `catalog-reading-...`: chỉ cần ảnh cloud theo `examId` — không cần publish nội dung đề

### Publish đề Reading lên Supabase — CODE XONG, CHƯA ROLLOUT HẾT ĐỀ (2026-07-07)

- [x] Migration `010_reading_exam_published.sql` — bảng `reading_exam_published` + RLS (mọi user đọc, Admin ghi) — **đã `pnpm db:push`**
- [x] `readingExamPublish.ts` — `publishReadingExamToCloud`, `getPublishedReadingExam`, `listPublishedReadingExams`
- [x] `examLoader.ts` — `resolveReadingExam` / `listAllReadingExams` ưu tiên: Dexie local → **published Supabase** → builtin catalog
- [x] `IeltsReadingImportWizard.tsx` + `ImportReadingManualModal.tsx` — Admin **Lưu** → auto publish (khi `isAdmin === true`)
- [x] `database.types.ts` — `reading_exam_published`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### Việc tạm hoãn / đã có cách thay thế

1. **Re-publish đề cũ** — dùng **Admin → Publish nội dung** (máy đã import); hoặc Reading Wizard → Sửa → Lưu; không bắt buộc import lại ZIP
2. **Batch ảnh** — gắn ảnh khi import xong Cam 9–20, rồi Publish nội dung
3. **Verify cross-user** — Admin Publish → User khác hard refresh
4. ~~Script one-shot~~ → thay bằng `publishAllAdminContent` + `AdminPublishExamsPanel`

**Workflow đề xuất sau batch import:**
```
Import hết đề (Wizard/build script)
  → Admin Lưu từng đề (hoặc script publish) — ảnh cloud + exam JSON lên Supabase
  → pnpm build:catalog (đề builtin) HOẶC rely reading_exam_published (đề manual)
  → pnpm deploy:prod
  → User hard refresh → thấy đề + ảnh
```

---

## Service Worker — cache catalog audio offline (session 2026-07-07) — HOÀN THÀNH

Giảm bandwidth Vercel khi user nghe lại MP3 Listening: lần đầu tải từ network, lần sau lấy từ Cache Storage.

- [x] `apps/web/public/sw.js` — cache-first cho `GET /catalog/**/*.{mp3,m4a,wav,ogg,webm}`; giữ push notifications; `skipWaiting` + `clients.claim`; xóa cache cũ khi version đổi; dev fallback version `dev` khi placeholder chưa inject
- [x] `apps/web/vite.config.ts` — plugin `injectSwCatalogCacheVersion`: thay `__CATALOG_CACHE_VERSION__` bằng `package.json` version lúc `closeBundle`
- [x] `apps/web/src/App.tsx` — `register('/sw.js')` + `reg.update()` on load
- [x] `pnpm --filter web build` — pass; `dist/sw.js` có `ryan-catalog-0.2.0`

### Cách hoạt động
1. User mở app → SW đăng ký scope `/`
2. Phát Listening MP3 từ `/catalog/.../listening.mp3` → SW fetch network → lưu `ryan-catalog-{version}`
3. Lần sau (cùng tab hoặc session mới): DevTools Network hiện `(from ServiceWorker)` — **không tốn Vercel transfer**
4. Mỗi release bump `apps/web/package.json` version → cache name mới → user tải MP3 mới nếu file đổi

### Verify thủ công (production / preview)
- DevTools → Application → Cache Storage → `ryan-catalog-*`
- Network: play MP3 2 lần → request thứ 2 `Size` = `(ServiceWorker)`

### Chưa làm (tuỳ chọn)
- Cache cross-origin Supabase `reading-exam-media` URLs

---

## Listening — publish đề import lên Supabase (session 2026-07-07) — HOÀN THÀNH

Giống Reading: Admin Lưu → mọi user thấy đề Listening import (`listening-import-*`).

- [x] Migration `011_listening_exam_published.sql` — **đã `pnpm db:push`**
- [x] `listeningExamPublish.ts` — publish / get / list
- [x] `listeningExamLoader.ts` — Dexie local → **published Supabase** → builtin catalog + `mergeCatalogListeningMedia`
- [x] `ImportListeningModal.tsx` + `IeltsListeningImportWizard.tsx` — Admin Lưu → auto publish
- [x] `database.types.ts` — `listening_exam_published`

### MP3 / ảnh sau publish
- IELTS title `Cambridge X Test Y` → `audioUrl` / ảnh từ `/catalog/listening/...` (deploy)
- KET/PET custom không khớp catalog → user thấy câu hỏi, **chưa** nghe MP3 (blob chỉ máy Admin) — tuỳ chọn upload cloud sau

---

## Admin — Publish nội dung toàn app (session 2026-07-07) — HOÀN THÀNH

Một nút publish mọi module — **không cần import lại từng đề**.

- [x] Migration `012_admin_published_modules.sql` — `admin_published_modules` + `admin_publish_meta` — **đã push**
- [x] `adminContentPublish.ts` — `publishAllAdminContent`, `countAdminPublishableContent`
- [x] `syncAdminPublishedContent.ts` — user pull khi vào `/app` (gọi từ `GlobalCatalogSync.tsx`)
- [x] `publishLocalExamsBatch.ts` — batch Reading/Listening (gọi từ publish all)
- [x] `AdminPublishExamsPanel.tsx` — tab **Publish nội dung** trong `/app/admin`
- [x] `scripts/build-catalog.mjs` — auto unzip `Tainguyen/{bundle}.zip` nếu thiếu folder (fix Vercel build)
- [x] `pnpm deploy:prod` — production live

### Admin workflow
```
Thêm/sửa data trên máy Admin (IndexedDB)
  → /app/admin → tab "Publish nội dung" → Publish tất cả
  → Supabase (modules + reading_exam_published + listening_exam_published)
  → User mở /app → syncAdminPublishedContent() tự merge
```

### Module publish (một nút)

| Module | Nguồn local | Ghi chú |
|--------|-------------|---------|
| Từ vựng | `deck.origin === 'preset'` + thẻ | Không SRS |
| Viết | `writingDocs` text trống | Đề bài thư viện |
| Nghe | `lessons` category `cambridge` | Không bài `user` |
| Luyện dịch | `translationSets` ≠ `user` | |
| Cấu trúc câu | `sentenceStructures` | |
| MindMap | `mindmaps` | |
| Luyện thi Reading | `reading-manual-*` … (trừ `catalog-*`) | Bảng `reading_exam_published` |
| Luyện thi Listening | `listening-import-*` | Bảng `listening_exam_published` |

### Không publish
- SRS, deck/từ user, bài viết đã gõ, bài nghe user, đề builtin `catalog-*`

### Auto publish khi Lưu (Admin)
- Reading: Wizard + Import modal → `publishReadingExamToCloud`
- Listening: Import modal + Wizard → `publishListeningExamToCloud`

---

## Luyện thi — Note cạnh Tô sáng (session 2026-07-07) — HOÀN THÀNH

- [x] `readingHighlightUtils.ts` — `TextNote`, `segmentsFromAnnotations`, `upsertNotesForRanges`, `removeNotesInRanges`, `findNotesOverlappingRanges`
- [x] `examHighlightContext.tsx` — context `{ highlights, notes }`, hook `useExamNotes()`
- [x] `usePartHighlights.ts` — `notes`, `handleNotesChange`, `notesByPart`, `setAnnotationsByPart`
- [x] `ReadingHighlightToolbar.tsx` — nút **Note** + panel textarea (Lưu / Xóa / Đóng)
- [x] `ReadingHighlightableText.tsx` — gạch chân wavy + tooltip `title` cho đoạn có note
- [x] `readingTest.css` — `.reading-test-note`, styles panel note trên toolbar
- [x] **Reading IELTS shell** — `ReadingTest.tsx`: `notesByPart` persist draft `exam-reading-draft:{examId}`
- [x] **Listening** — `ListeningKetTest`, `ListeningPetTest`, `ListeningFceTest` (FCE/CAE/CPE), `ListeningIeltsTest`: notes persist draft `exam-listening-draft:{examId}`
- [x] `pnpm --filter web exec tsc --noEmit` — pass

### UX
1. Bôi đen text trong vùng `data-exam-highlight-zone`
2. Toolbar: **Tô sáng** | **Note** | Bỏ tô sáng | Sao chép
3. **Note** → textarea → **Lưu note** (gắn `blockId` + offset)
4. Text có note: gạch chân wavy; hover xem tooltip

### Cambridge RW A2–C2 (bổ sung 2026-07-07)
- [x] `rwHighlight/` — `RwExamMain`, `RwHighlightText`, `RwInstruction`, `RwMcRadioQuestion`, `rwGapTextSegment`
- [x] 5 shell `*RwTest.tsx` — toolbar Tô sáng + Note, persist `highlightsByPart`/`notesByPart` trong draft
- [x] `KetRwPartContent`, `PetRwPartContent`, `FceRwPartContent`, `CaeRwPartContent`, `CpeRwPartContent`, `PetRwDragMatch` — text highlightable qua `ReadingHighlightableText`
- [x] `readingKetRw.css` — styles highlight/note trong `.ket-rw-main`

---

## Đã xong (2026-07-09) — Security + isolation + draft race
- **C1 profiles:** migration `013_protect_profile_privileges.sql` — trigger chặn self-promote `is_admin`/`plan`
- **IndexedDB isolation:** `clearLocalUserData` + `ensureLocalUserIsolation` — wipe on logout / đổi user
- **notify-payment:** chỉ JWT user (reject anon/service key); HTML escape; identity từ claims
- **Plan default:** `?? 'free'` (writing/mindmap/structure/KET grade)
- **Exam draft race:** `useExamDraftGate` — hydrate xong mới save (Reading + Listening shells)

### Deploy bắt buộc
```
pnpm db:push
npx supabase functions deploy notify-payment --project-ref ntcagvtkwxwsmlxlumfo
```

## Đã xong (2026-07-09) — Writing: rewrite V2 + OCR Task1 + dashboard 30d + Cambridge RW AI
- **Rubric → Version 2 side-by-side:** `buildWritingRewritePrompt` + `RewriteComparePanel` trong ScorePanel (so sánh V1/V2, copy, áp dụng V2)
- **Task 1 graph OCR:** `buildChartDescribePrompt` + nút “OCR & mô tả biểu đồ” (vision OpenAI/Gemini); chấm Task 1 gắn ảnh khi provider hỗ trợ vision
- **Dashboard:** lịch chấm 30 ngày + TB 30 ngày + xu hướng band theo ngày (`useWritingDashboard`, `WritingDashboardPage`)
- **Cambridge RW Writing:** `CambridgeRwWritingGradePanel` A2–C2 (thay KET-only); lưu history `exam-rw:*` cho dashboard; model answer AI + **catalog** (`cambridgeWritingModelCatalog`) trên result + hub Cambridge Writing
- Core: `attachImagesToUserMessage`, rewrite/chart/model answer types trong `writingPrompt.ts`
- `pnpm --filter web exec tsc --noEmit` — pass

### Verify Writing
1. `/app/writing/practice` → Task 1: upload JPG → OCR & mô tả → chấm AI → **Viết lại Version 2**
2. `/app/writing/dashboard` → lịch 30 ngày + cột trend
3. Nộp đề Cambridge RW → Part Writing: Chấm AI + Catalog mẫu / Tạo bài mẫu AI
4. `/app/writing/cambridge` → Model answer catalog

## Next session start prompt (cập nhật 2026-07-09 — Writing pack)
```
Đọc session_summary.md ngay.

## Context nhanh
- Writing: rewrite V2 side-by-side, Task1 OCR vision, dashboard 30d calendar
- Cambridge RW Writing AI + model catalog (A2–C2)
- ExamResult dùng CambridgeRwWritingGradePanel

### Verify user
1. Writing practice: grade + rewrite V2
2. Dashboard 30 ngày
3. Cambridge RW result: chấm AI + catalog
```

## Đã xong (2026-07-09) — Landing WebGL Magic Tome
- Cài `three` + `@types/three` (apps/web)
- `MagicTomeCanvas.tsx` — tome leather texture, cover canvas, spine gold, flip pages, ACES lights, particles
- `DictionaryBookScene` cinematic stage; `HERO_MASCOT_MODE = 'dictionary'`
- Fix strip “A · ARCANE” mỏng (geometry/camera) → sách dày face-on
- `tsc --noEmit` pass

---

## Đã xong (2026-07-09) — Skill picker Page1 + Library Archives
- `/app/exam/track/ielts` → 2 thẻ Listening/Reading (Giaodien Page1)
- `/ielts/reading|listening` → Library Archives (1 skill)
- Cambridge: `/cambridge` levels → `/cambridge/a2` skill picker → `/a2/reading|listening` library
- `ExamSkillPicker.tsx` + route `track/:trackId/:arg2?/:arg3?`

## Đã xong (2026-07-09) — AI chỉ đoạn đáp án + tô cam
- AI bắt buộc **Đoạn trong đề** (quote nguyên văn từ passage/NGUỒN)
- Lưu evidences trong sessionStorage; match quote → `ReadingHighlight kind=evidence`
- Tô **cam** (`.reading-test-highlight--evidence`) + scroll tới đoạn khi đổi câu review
- Reading IELTS + Cambridge RW; Listening: quote trong panel (source = note/prompt)
- `examAiEvidence.ts`, `useReviewEvidenceHighlights`, `buildReadingPassageHighlightBlocks`

## Đã xong (2026-07-09) — AI phân tích style + xem cùng đề
- Panel AI report dùng cùng class/nền/chữ với “Bài giải chi tiết”
- `examAiAnalysisStorage` + `ExamReviewAiPanel` + `useExamReviewAi`
- Nút “Xem cùng đề bài” trên panel AI (và action bar) mở review kèm AI
- Wire panel: ReadingTest, *RwTest (KET–CPE), ListeningIelts/Ket/Pet/Fce
- `pnpm --filter web exec tsc --noEmit` — pass

## Đã xong (2026-07-09) — Báo cáo kết quả Luyện thi (Reading_IELTS_Result)
- UI xanh lưới + sun mascot + stats: đúng / bỏ qua / sai / band
- `ExamPracticeResultReport` + `examBandScore` + CSS
- Wire `ExamResult` (Reading IELTS/Cambridge) + `ListeningExamResult`
- Nút: Làm lại · Xem cùng đề bài · Bài giải chi tiết · Thảo luận (disabled)


---

## Đã xong (2026-07-09) — Template P3 r3mfs (Match + Features + Summary) ← Part3_20
- Kind `p3-r3-match-features-summary` · code **r3mfs**
- Q27–31 matching-paragraph A–G · Q32–36 features A–E (Dan Macon…Bethany Smith) · Q37–40 summary ONE WORD
- SAMPLE: Livestock guard dogs; preview `Teamplate_Part3_20.jpg`
- Khác **r3ms** (match → summary → features)
- Test: `apps/web/scripts/test-r3mfs.mts` PASS

## Đã xong (2026-07-09) — Template P3 r3fem (Features + Endings + MC) ← Part3_19
- Kind `p3-r3-features-endings-mc` · code **r3fem**
- Q27–33 matching-features A–C (Martin Rees, Daniel Wolpert, Kathleen Richardson)
- Q34–36 sentence endings A–D (wordBank LIST OF OPTIONS)
- Q37–40 MC A–D (Q37 fear of machines khớp JPG)
- Preview: `Teamplate_Part3_19.jpg` → `public/ielts-wizard/reading/p3/`
- Test: `apps/web/scripts/test-r3fem.mts` PASS

## Đã xong (2026-07-09) — Template P2 r2h2n (Headings + Choose TWO + Notes) ← Part2_20
- Kind `p2-r2-headings-choose-two-notes` · code **r2h2n**
- Q14–19 matching-headings A–F (i–vii) · Q20–21 Choose TWO · Q22–23 Choose TWO · Q24–26 notes ONE WORD (notePassage)
- SAMPLE: Saving coral reefs (London Zoo / tentacles / algae)
- Preview: `Teamplate_Part2_20.jpg` → `public/ielts-wizard/reading/p2/`
- Test: `apps/web/scripts/test-r2h2n.mts` PASS

## Đã xong (2026-07-09) — Template P3 r3ysb (YNNG + Summary bank + MC) ← Part3_18
- Kind `p3-r3-ynng-summary-bank-mc` · code **r3ysb**
- Q27–32 YNNG · Q33–37 summary bank A–H (Calls by the umpire) · Q38–40 MC A–D
- SAMPLE: **The Automated Ball-Strike System** (ABS baseball) — khớp Teamplate_Part3_18.jpg
- Preview: `Teamplate_Part3_18.jpg` → `public/ielts-wizard/reading/p3/`
- Test: `apps/web/scripts/test-r3ysb.mts` PASS

## Đã xong (2026-07-09) — Template P2 r2ms2 (Match + Summary + Choose TWO)
- Kind `p2-r2-match-summary-choose-two` · code **r2ms2**
- Q14–16 match · Q17–22 summary ONE WORD · Q23–24 + Q25–26 2× Choose TWO A–E
- SAMPLE: Community gardens; preview tạm Teamplate_Part2_10.jpg
- Khác **r2cs** (Choose TWO trước summary); **r2msc** (sentence giữa)

## Đã xong (2026-07-09) — Template P2 r2mfu (Match + Features + Summary)
- Kind `p2-r2-match-features-summary` · code **r2mfu**
- Q14–17 match A–F · Q18–23 features A–E · Q24–26 summary ONE WORD
- SAMPLE: Deep-sea mining (Cam19 T4 P2); preview Teamplate_Part2_19.jpg
- Khác **r2mfs** (features ít + sentence cuối); **r2msf** (sentence giữa)

## Đã xong (2026-07-09) — Template P3 r3mgy (MC + Summary ONE WORD + YNNG)
- Kind `p3-r3-mc-summary-gap-ynng` · code **r3mgy**
- Q27–30 MC A–D · Q31–35 summary ONE WORD (note, no bank) · Q36–40 YNNG
- SAMPLE: The Unselfish Gene / hunter-gatherers (Cam19 T4 P3); preview Teamplate_Part3_17.jpg
- Khác **r3my** (có wordBank); **r3mey** (endings A–F)

## Đã xong (2026-07-09) — Template P3 r3mey (MC + Endings + YNNG)
- Kind `p3-r3-mc-endings-ynng` · code **r3mey**
- Q27–30 MC A–D · Q31–34 sentence endings A–F · Q35–40 YNNG
- SAMPLE: artificial speech translation (Cam19 T3 P3); preview Teamplate_Part3_16.jpg
- Khác **r3my** (summary note đoạn, không endings)

## Đã xong (2026-07-09) — Template P2 r2msf (Match + Sentence + Features)
- Kind `p2-r2-match-sentence-features` · code **r2msf**
- Q14–17 match A–H · Q18–22 sentence ONE WORD · Q23–26 features A–D
- SAMPLE: The global importance of wetlands (Cam19 T3 P2); preview Teamplate_Part2_18.jpg
- Khác **r2mfs** (match → features → sentence)

## Đã xong (2026-07-09) — Template P3 r3sb (Summary bank + YNNG + MC)
- Kind `p3-r3-summary-bank-ynng-mc` · code **r3sb**
- Q27–32 summary bank A–K · Q33–37 YNNG · Q38–40 MC A–D
- SAMPLE: gifted child / Mirzakhani (Cam19 T2 P3); preview Teamplate_Part3_15.jpg
- Infer: bank ≥10 hoặc 6 gaps + 5 YNNG + 3 MC → r3sb (khác r3sy)

## Đã xong (2026-07-09) — Fix Choose TWO chỉ chọn 1 đáp án (r2msc / Cam19 T2)
- **Root cause:** AI/import chỉ gắn `options` A–E lên câu 1 (Q23/Q25); Q24/Q26 `options: []` → `isReadingChooseTwoGroup` false → UI MC chọn 1
- `normalizeReadingChooseTwoGroup`: share options sang câu 2; wire sanitize + ReadingQuestionPanel
- Cloud Cam19 T2 P2 (`reading-manual-1783587241597`) đã fill options Q24/Q26
- Test `scripts/test-r2msc-choose-two.mts` PASS

## Đã xong (2026-07-09) — Nhận dạng xáo trộn dạng câu (mọi template)
- `ieltsReadingGroupRoles.ts`: role Match/TFNG/YNNG/Choose TWO/Summary bank/Notes/Table…
- `reorderPartGroupsToTemplate`: sắp lại groups về thứ tự SAMPLE (role + dải Q)
- `alignQuestionGroupsToTemplate` gọi reorder trước hybrid
- Infer: multiset role + chấm assignment theo số câu (phân biệt r3my/r3ysm khi type order xáo)
- Test: `scripts/test-shuffle-groups.mts` PASS

## Đã xong (2026-07-09) — Template P2 r2msc (Match + Sentence + Choose TWO)
- Kind `p2-r2-match-sentence-choose-two` · code **r2msc**
- Q14–18 match A–F · Q19–22 sentence ONE WORD · Q23–24 + Q25–26 2× Choose TWO A–E
- SAMPLE: Athletes and stress (Cam19 T2 P2); preview Teamplate_Part2_17.jpg
- Prompt AI + infer signature

## Đã xong (2026-07-09) — Template r3my cập nhật Cam19 (MC + Summary A–J + YNNG)
- Kind `p3-r3-mc-summary-ynng` · code **r3my**
- SAMPLE: *The persistence and peril of misinformation* (Cam19 T1 P3)
- Q27–30 MC A–D · Q31–36 summary bank A–J · Q37–40 YNNG
- Prompt AI + infer `multiple-choice|summary-completion|ynng` (+ gap-fill alias)
- Khác **r3ysm** (YNNG → summary → MC)

## Đã xong (2026-07-09) — Cam19 T1 Reading P3 double YNNG + data fix
- **Bug:** Q37–40 `group.type=multiple-choice` + câu YNNG → UI MC hiện **A YES / B NO** chồng instruction YES if… (double)
- **Sanitize + UI:** ép `ynng` khi instruction/options là tri-state; radio luôn 3 option ngắn
- **Cloud fix** `reading-manual-1783584609723` (Cam 19 Test 1):
  - Q27–30 → MC A–D (đáp án D/A/C/D)
  - Q31–36 → summary bank (H/J/G/B/E/C)
  - Q37–40 → **ynng** (YES / NOT GIVEN / NO / NOT GIVEN)
- Script: `apps/web/scripts/fix-cam19-t1-p3-via-db.mts`

## Đã xong (2026-07-09) — Template P1 r1tn (TFNG + Notes)
- Kind `p1-r1-tfng-notes` · code **r1tn**
- Q1–7 TFNG · Q8–13 notes ONE WORD (`notePassage` bullets) — Teamplate_Part1_14.jpg
- SAMPLE: tennis racket / materials, spin, training, gut, weights, grip
- Preview: `public/ielts-wizard/reading/p1/Teamplate_Part1_14.jpg`
- Infer: `tfng|gap-fill` + notePassage / “Complete the notes” → r1tn (không nhầm r1g)
- Prompt AI + hybrid notePassage như r1n8/r2tn

## Đã xong (2026-07-09) — Fix r3ysm thiếu LIST OF OPTIONS (Q31–36) — v2 cứng
- **Root cause:** AI trả số nhóm ≠ SAMPLE (vd. tách MC → 4 groups) → `forceTemplateHybridGroups` early-return → không gắn wordBank
- `forceTemplateSummaryWordBanks`: match theo **số câu Q31–36** (không phụ thuộc index); luôn ép SAMPLE A–J
- `finalizeTemplateStructure`: chạy word-bank ép ở **mọi** nhánh `applyReadingTemplateTableStructure`
- `normalizeAiReadingPart`: extract bank từ alias (`listOfOptions`, options câu đầu…); type → summary-completion khi list of phrases
- Test `scripts/test-r3ysm-wordbank.mts` PASS (missing + partial + **4-group mismatch**)

## Đã xong (2026-07-09) — Template P3 r3ysm (YNNG + Summary bank + MC)
- Kind `p3-r3-ynng-summary-mc` · code **r3ysm**
- Q27–30 YNNG · Q31–36 summary word bank A–J · Q37–40 MC A–D
- Preview: `Teamplate_Part3_14.jpg` → `public/ielts-wizard/reading/p3/`
- SAMPLE: Wegener / continental drift

## Đã xong (2026-07-09) — Template P2 r2mfy (MC + Features + YNNG)
- Kind `p2-r2-mc-features-ynng` · code **r2mfy**
- Q14–16 MC A–D · Q17–22 matching-features A–E · Q23–26 YNNG (claims of writer)
- Preview: `Teamplate_Part2_16.jpg` → `public/ielts-wizard/reading/p2/`
- SAMPLE: Growth mindset (Binet, Dweck, Gelman, Bates, Yeager & Walton)

## Đã xong (2026-07-09) — Template P1 r1ms2 (Match + Summary + Choose TWO)
- Kind `p1-r1-match-summary-choose-two` · code **r1ms2**
- Q1–5 match A–E · Q6–9 summary ONE WORD · Q10–11 Choose TWO A–E · Q12–13 MC
- Preview: `Teamplate_Part1_13.jpg` → `public/ielts-wizard/reading/p1/`
- SAMPLE: Green roofs

## Đã xong (2026-07-09) — Fix r2hmc thiếu nội dung (chuẩn r2hm)
- SAMPLE passage dài đủ 7 đoạn; summary note liền (format Diamond r2hm); MC instruction Cam-style
- `forceTemplateHybridGroups`: merge **headings[]** + summary **note** từ SAMPLE khi AI thiếu
- Prompt r2hmc: bắt buộc headings đầy đủ + note summary liền 24________…; không noteTable
- Test: `scripts/test-r2hmc.mts` PASS

## Đã xong (2026-07-09) — Template P2 r2hmc (Headings + MC + Summary)
- Kind `p2-r2-headings-mc-summary` · code **r2hmc**
- Q14–20 matching-headings A–G (i–viii) · Q21–23 MC A–D · Q24–26 summary ONE WORD AND/OR A NUMBER (note)
- Preview: `Teamplate_Part2_15.jpg` → `public/ielts-wizard/reading/p2/`
- SAMPLE: Steam car / Model E; khác r2hm (thứ tự headings→MC→summary)

## Đã xong (2026-07-09) — Template P1 r1msf (Match + Summary + Features)
- Kind `p1-r1-match-summary-features` · code **r1msf**
- Q1–4 matching-paragraph A–H · Q5–8 summary ONE WORD (note) · Q9–13 matching-features A–D
- Preview: `Teamplate_Part1_12.jpg` → `public/ielts-wizard/reading/p1/`
- SAMPLE: Making buildings with wood (Cheeseman, Mannstrom, Surgenor, Preston & Lehne)
- Không noteTable (summary only)

## Đã xong (2026-07-09) — Template P2 r2mys (MC + YNNG + Summary bank)
- Kind `p2-r2-mc-ynng-summary` · code **r2mys**
- Q14–19 MC A–D · Q20–23 YNNG · Q24–26 summary word bank A–F (note + 24________)
- Preview: `Teamplate_Part2_14.jpg` → `public/ielts-wizard/reading/p2/`
- Khác r2ms: thứ tự MC → YNNG → summary (không MC → summary → YNNG)
- SAMPLE: AI / UK health system

## Đã xong (2026-07-09) — Template P2 r2mfs (Match + Features + Sentence)
- Kind `p2-r2-match-features-sentence` · code **r2mfs**
- Q14–18 matching-paragraph A–G · Q19–21 matching-features A–C (TSI/Salvage/Shelterwood) · Q22–26 sentence ONE WORD
- Preview: `Teamplate_Part2_13.jpg` → `public/ielts-wizard/reading/p2/`
- Builder + catalog + AI prompt + infer; SAMPLE Forest management

## Đã xong (2026-07-09) — Fix r1st gap 6 mất (header rỗng)
- **Bug:** `normalizeReadingNoteTable` `.filter(Boolean)` bỏ header `''` → 4 cột → 3, mất cột Sale + gap 6
- **Fix:** giữ header rỗng; SAMPLE r1st gaps [4,5,6,7]; test `test-r1st-gap6.mts` PASS

## Đã xong (2026-07-09) — Template P1 r1st (Sentence + Table + TFNG)
- Kind `p1-r1-sentence-table-tfng` · code **r1st**
- Q1–3 sentence (TWO WORDS AND/OR A NUMBER) · Q4–7 noteTable 4 cột Intensive vs aeroponic · Q8–13 TFNG
- Preview: `Teamplate_Part1_11.jpg` → `public/ielts-wizard/reading/p1/`
- Builder + catalog + AI prompt + TABLE_TEMPLATE_KINDS + infer (khác r1ntf: sentence, không notePassage)
- SAMPLE: Crop-growing skyscrapers / aeroponic urban farming

## Đã xong (2026-07-09) — noteTable CHỈ đúng slot SAMPLE (TFNG sạch)
- **Cổng cứng** `enforceNoteTableOnlyOnTemplateSlots`: SAMPLE không table → strip HẾT; chỉ giữ khi index SAMPLE có noteTable
- UI: render noteTable **chỉ** khi instruction `Complete the table…` (không TFNG/summary/sentence)
- `sanitizeGroup`: gỡ noteTable khỏi tfng/ynng/match/MC/summary/notes
- Infer wizard: `tfng|gap-fill` + noteTable chỉ → r1tb nếu instruction table
- Test: TFNG+sentence strip table; summary strip; r1tb/r1nt OK

## Đã xong (2026-07-09) — Chống nhiễm table vào Summary ONE WORD
- **Bug:** “Complete the summary below. Choose ONE WORD ONLY…” vẫn dính noteTable (UI bảng)
- **Fix:** `isReadingSummaryInstruction` / `groupMustNotHaveNoteTable` — gỡ noteTable cho summary/notes/sentence
- rematerialize: SAMPLE không table → strip hết; có table → chỉ gắn khi instruction **table** (không summary)
- UI `ReadingQuestionPanel` / `GapFillGroup`: không render noteTable nếu summary/notes
- Validate/import: không bắt noteTable cho summary
- Test: summary ONE WORD strip noteTable PASS; r1tb/r1nt OK

## Đã xong (2026-07-09) — Template P3 r3ms (Match + Summary + Features)
- Kind `p3-r3-match-summary-features` · code **r3ms**
- Q27–31 matching-paragraph A–F · Q32–35 summary ONE WORD (note) · Q36–40 matching-features A–D
- Preview: `Teamplate_Part3_13.jpg` → `public/ielts-wizard/reading/p3/`
- Builder + catalog + AI prompt + infer (khác r3tb: summary note, không noteTable)
- SAMPLE: Space debris (Frueh / Krag / Sorge / Jah)

## Đã xong (2026-07-09) — Chống nhiễm noteTable sang template khác
- **Bug:** rematerialize dựng bảng từ mọi “ONE WORD ONLY”; apply structure chạy full pipeline cho mọi template
- **Fix:** `applyReadingTemplateTableStructure` phân nhánh:
  - SAMPLE không notes/table → align + strip noteTable
  - chỉ notes → merge notePassage, không rematerialize table
  - có table → full pipeline + strip index không có table
- rematerialize: không build table nếu SAMPLE không có noteTable
- Test: `test-no-table-infection.mts` (tfng-gap sạch, r1tb/r1nt OK)

## Đã xong (2026-07-09) — Fix r1nt layout DeepSeek (notes|TFNG|table)
- **Lỗi user:** `câu 7 thiếu trong noteTable`; `cần gap-fill|tfng|gap-fill (nhận gap-fill|gap-fill|gap-fill)`; `thiếu notePassage`
- **Root cause:** rematerialize gắn noteTable vào nhóm Notes vì “ONE WORD ONLY”; AI trả 3× gap-fill
- **Fix:** `forceTemplateHybridGroups` ép type + notePassage + TFNG theo index SAMPLE; rematerialize **không** nhầm notes→table; validate skip notes group
- Test: `scripts/test-r1nt-layout.mts` PASS

## Đã xong (2026-07-09) — Fix r1tb DeepSeek “nửa vời” (lần 6)
- **Bug:** AI trả 4–6 hàng có chữ → không bị coi list-like → giữ bảng thiếu Aim/Method
- **Fix:** incomplete nếu rows < 85% SAMPLE; pickBest **mặc định ép SAMPLE** trừ khi AI ≥ 90% số hàng SAMPLE
- Nuclear trong rematerialize: rows quá ít → mergeTemplateLayoutWithPrompts
- Test D half-table 6 rows → 11 rows Aim/Method PASS

## Đã xong (2026-07-09) — Fix r1tb thiếu Aim/Method (lần 5) — ép SAMPLE layout
- mergeTemplateLayoutWithPrompts; pickBest ưu tiên SAMPLE; repair fallback
- Test: content/listlike/oneword — 11 rows, Aim/Method, PASS

## Đã xong (2026-07-09) — Fix r1tb table có khung nhưng **không nội dung** (lần 3)
- noteTableIsContentRich, pickBestNoteTable, enrich prompts
- Test: `scripts/test-r1tb-content.mts` + `test-r1tb-oneword.mts` PASS

## Đã xong (2026-07-09) — Fix r1tb Q7–12 table bị thành one-word (lần 2)
- rematerialize + remap gap + rawJson normalize + rebuildPayload re-apply
- Test: `apps/web/scripts/test-r1tb-oneword.mts` PASS
- tsc pass

## Đã xong (2026-07-09) — Fix r1tb Q7–12 table bị thành one-word (lần 1)
- Parse ô string; forceTemplate; prompt cấm one-word list (chưa đủ với DeepSeek)

---

## Session 2026-07-09 — IELTS Reading Wizard (tóm tắt)

### Template Reading mới
| Code | Kind | Passage | Layout | Preview |
|------|------|---------|--------|---------|
| r1my | p1-r1-match-ynng-features | P1 | Match đoạn + YNNG + Features | Teamplate_Part1_8.jpg |
| r1nt | p1-r1-notes-tfng-table | P1 | Notes → TFNG → Table | Teamplate_Part1_9.jpg (Nutmeg) |
| r1ntf | p1-r1-notes-table-tfng | P1 | Notes → Table → TFNG | r1t.svg (Huarango) |
| r1tb | p1-r1-tfng-table | P1 | TFNG → Table (n×m merge) | Teamplate_Part1_10.jpg (Rocha bats) |
| r2cs | p2-r2-match-choose-two-summary | P2 | Match + 2× Choose TWO + Summary | Teamplate_Part2_10.jpg |
| r2mt | p2-r2-match-tfng-choose-two | P2 | Match + TFNG + Choose TWO | Teamplate_Part2_11.jpg |
| r2tn | p2-r2-tfng-notes | P2 | TFNG + Notes (Silbo) | Teamplate_Part2_12.jpg |
| r3fy | p3-r3-features-ynng-summary | P3 | Features + YNNG + Summary | Teamplate_Part3_8.jpg |
| r3tn | p3-r3-tfng-notes-mc | P3 | TFNG + Notes + MC | Teamplate_Part3_9.jpg |
| r3em | p3-r3-endings-summary-mc | P3 | Endings + Summary bank + MC | Teamplate_Part3_10.jpg |
| r3hmy | p3-r3-headings-mc-ynng | P3 | Headings + MC + YNNG | Teamplate_Part3_11.jpg |

### Fix / harden UI & AI
- **Choose TWO Reading:** multi-select checkbox (2 slots) — `readingChooseTwoUtils.ts` + `ChooseTwoGroup`
- **ExamTrack trắng:** ErrorBoundary, safe rows, `getTemplateBuilders()` factory (không throw HMR)
- **Notes ngắt dòng:** `break` type, decade section (1940s/1950s), AI + normalize
- **noteTable n×m:** pad cột, validate hàng; r1nt validate notes vs table riêng
- **Sentence completion ngắt dòng:** AI + `splitSummaryNoteParagraphs` + normalize note/prompt
- **r3tn notes** layout r1n8 đầy đủ; answer Cam14 (large/microplastic/…)

### Files chính
`ieltsReadingPartTemplates.ts`, `ieltsReadingTemplateCatalog.ts`, `ieltsReadingWizardConfig.ts`,
`ieltsReadingWizardEdit.ts`, `ieltsReadingAiPrompt.ts`, `ieltsReadingAiNormalize.ts`,
`ReadingQuestionPanel.tsx`, `readingChooseTwoUtils.ts`, `readingNoteTableUtils.ts`,
`listeningNotePassage.ts`, `ExamTrackPage.tsx`, `ExamTrackErrorBoundary.tsx`

---

## Đã xong (2026-07-07) — Admin Publish nội dung (toàn app)
- Migration 012 — `admin_published_modules` + `admin_publish_meta`
- /app/admin → tab "Publish nội dung" → một nút: vocab, viết, nghe, dịch, cấu trúc câu, mindmap, đề Reading/Listening
- User: `syncAdminPublishedContent()` khi vào /app (GlobalCatalogSync)
- Đề cũ: Admin bấm Publish trên máy đã import — KHÔNG cần import lại từng file

## Đã xong (2026-07-07) — Listening publish cloud
- Migration 011 `listening_exam_published` — Admin Lưu → mọi user thấy đề import

## Đã xong (2026-07-07) — Reading cloud: ảnh + publish đề
- Migration 009 (`reading_exam_images`) + 010 (`reading_exam_published`) — đã push Supabase
- Ảnh: Admin upload → cloud; User chỉ xem
- Publish đề: Admin Lưu import → `reading_exam_published`; `examLoader` load cho mọi user

## Đã xong (2026-07-07) — Wizard Reading IELTS 18 template
- 6 template/passage (P1–P3) cover layout Cam 9–20
- 18 SVG preview + builders + AI prompt rules + edit signatures
- Test: /app/exam/track/ielts → Import Wizard Reading → 6 option mỗi passage

## Đã xong (2026-07-09) — Reading P3 template r3hmy (Headings + MC + YNNG)
- Template `p3-r3-headings-mc-ynng` (`r3hmy`) — preview `Teamplate_Part3_11.jpg` (AI attitudes)
- Matching headings Q27–32 (A–F, i–viii) + MC Q33–35 + YNNG Q36–40 (claims of writer)
- Builder `ieltsReadingP3HeadingsMcYnngPart()`; signature `matching-headings|multiple-choice|ynng`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_11.jpg`

## Đã xong (2026-07-09) — Sentence completion: ép ngắt dòng P1–3
- AI: "Complete the sentences… NO MORE THAN TWO WORDS" — mỗi câu 1 prompt 1 dòng; note multi-sentence = `\\n\\n`
- Normalize: `normalizeAiSentenceOrSummaryNote` + `normalizeAiSentencePrompts`
- UI: `splitSummaryNoteParagraphs` — single `\\n` cũng tách dòng khi sentence-style / ≥2 gap lines
- Template liên quan: r1 sentence-mc, tfng-gap, headings-gap; r2 headings-tfng-sentence; r3 match-paragraph-sentence, gap-ynng/tfng-mc…

## Đã xong (2026-07-09) — Reading P2 template r2tn (TFNG + Notes / Silbo)
- Template `p2-r2-tfng-notes` (`r2tn`) — preview `Teamplate_Part2_12.jpg` (Silbo Gomero)
- TFNG Q14–19 + notes ONE WORD Q20–26 (`notePassage` + 3 section: How produced / used / future)
- AI prompt: **ép ngắt dòng** — mỗi section = `{type:section}`, mỗi bullet 1 block, `break` giữa section
- Infer: `tfng|gap-fill` + notePassage → r2tn (không nhầm r2fw diagram)
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_12.jpg`

## Đã xong (2026-07-09) — noteTable luôn lưới n cột × m dòng
- AI prompt: **LUÔN** headers[n] + rows[m], mỗi hàng cells.length === n (pad [])
- `normalizeReadingNoteTable`: pad/cắt mọi hàng về đúng n cột
- `validateReadingNoteTable` + AI validate: báo lỗi hàng sai số cột
- r1ntf / r1tt / mọi table-completion: title tách riêng, không nhét vào header

## Đã xong (2026-07-09) — Reading P1 template r1ntf (Notes + Table + TFNG)
- Template `p1-r1-notes-table-tfng` (`r1ntf`) — preview `r1t.svg` (Huarango tree)
- Notes Q1–5 (`notePassage`) + table Q6–8 (`noteTable` 2 cột) + TFNG Q9–13
- Khác r1nt (notes→TFNG→table): thứ tự **notes → table → TFNG**
- Signature `gap-fill|gap-fill|tfng`; validate notePassage nhóm 1 + noteTable nhóm 2

## Đã xong (2026-07-09) — Reading P1 template r1tb (TFNG + Table)
- Template `p1-r1-tfng-table` (`r1tb`) — preview `Teamplate_Part1_10.jpg` (Rocha bat study)
- TFNG Q1–6 + table Q7–13 (`noteTable` 2 cột × m dòng, merge Findings + skip)
- Builder `ieltsReadingP1TfngTablePart()` + `CAM_ROCHA_BAT_TABLE`; infer `tfng|gap-fill` + noteTable
- Ảnh: `Tainguyen/IELTS/Template/Teamplate_Part1_10.jpg` → `apps/web/public/ielts-wizard/reading/p1/`

## Đã xong (2026-07-09) — Notes Reading: ép ngắt dòng (1940s/1950s)
- **Vấn đề:** AI gộp heading thập niên (Cam15 Moore) → UI không xuống dòng
- **Fix render:** `isNoteDecadeOrEraHeading` + type `break`; atomize/group lines tách section
- **Fix AI:** prompt notes P1–3 bắt buộc section riêng cho 1930s/1940s/1950s + `break`
- **Normalize:** `normalizeAiNotePassage` convert decade static → section, `\\n` → blocks/break
- Types: `ReadingNotePassageBlock` + Listening thêm `break`

## Đã xong (2026-07-09) — Reading P3 template r3em (Endings + Summary bank + MC)
- Template `p3-r3-endings-summary-mc` (`r3em`) — preview `Teamplate_Part3_10.jpg` (Fairy tales / Tehrani)
- Sentence endings A–F Q27–31 + summary word bank A–I Q32–36 (`note` inline) + MC Q37–40
- Builder `ieltsReadingP3EndingsSummaryMcPart()`; signature `summary-completion|summary-completion|multiple-choice`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_10.jpg`

## Đã xong (2026-07-09) — Reading P1 template r1nt (Notes + TFNG + Table)
- Template `p1-r1-notes-tfng-table` (`r1nt`) — preview `Teamplate_Part1_9.jpg` (Nutmeg)
- Notes Q1–4 (`notePassage` như r1n8) + TFNG Q5–7 + table Q8–13 (`noteTable` merge 17th century như r1tt)
- Builder `ieltsReadingP1NotesTfngTablePart()` + `CAM_NUTMEG_NOTE_PASSAGE` + `CAM_NUTMEG_HISTORY_TABLE`
- Signature: `gap-fill|tfng|gap-fill` (notes → TFNG → table); TABLE_TEMPLATE_KINDS includes r1nt
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_9.jpg`

## Đã xong (2026-07-09) — r3tn notes Q34–39 đủ layout r1n8
- `CAM_MARINE_DEBRIS_NOTE_PASSAGE`: section heading + bullet/sub-bullet + gap (giống Glass r1n8)
- Đủ text tĩnh: plastic (not metal or wood), insufficient information on + 3 sub-bullets, Rochman closing
- Answer key Cam14: 34 large, 35 microplastic, 36 populations, 37 types, 38 survival, 39 disasters
- AI prompt: bắt buộc notePassage đầy đủ, cấm rút gọn thành `note` string

## Đã xong (2026-07-09) — Fix crash TEMPLATE_BUILDERS / track IELTS trắng
- **Root cause:** `assertAllTemplateBuildersRegistered()` throw khi HMR catalog cập nhật trước builder body → `ReferenceError: ieltsReadingP3TfngNotesMcPart is not defined` → module fail → ExamTrack Lazy crash
- **Fix:** TEMPLATE_BUILDERS dùng lazy `() => fn()`; assert chỉ `console.error`, **không throw** lúc load module
- React Router Future Flag / DevTools messages = warning thường, không phải lỗi trang

## Đã xong (2026-07-09) — Reading P3 template r3tn (TFNG + Notes + MC)
- Template `p3-r3-tfng-notes-mc` (`r3tn`) — preview JPG `Teamplate_Part3_9.jpg` (Marine debris / Rochman)
- TFNG Q27–33 + notes ONE WORD Q34–39 (`notePassage` + notesTitle) + MC best title Q40
- Builder `ieltsReadingP3TfngNotesMcPart()` + `CAM_MARINE_DEBRIS_NOTE_PASSAGE`
- Signature: `tfng|gap-fill|multiple-choice` (+ notePassage)
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_9.jpg`

## Đã xong (2026-07-09) — Reading P2 template r2mt (Match đoạn + TFNG + Choose TWO)
- Template `p2-r2-match-tfng-choose-two` (`r2mt`) — preview JPG `Teamplate_Part2_11.jpg` (Zoos)
- Matching paragraph Q14–17 (A–G) + TFNG Q18–22 + Choose TWO Q23–24 (+ Q25–26 mẫu)
- Builder `ieltsReadingP2MatchTfngChooseTwoPart()`; signature `matching-paragraph|tfng|multiple-choice`
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_11.jpg`

## Đã xong (2026-07-09) — Fix Reading IELTS Choose TWO không chọn 2 đáp án
- **Root cause:** UI Reading render Choose TWO như 2× MC radio (mỗi câu 1 list) → user không multi-select được 2 option như Listening
- **Fix:** `readingChooseTwoUtils.ts` + `ChooseTwoGroup` (checkbox, 2 slots) trong `ReadingQuestionPanel`
- Nhận diện: instruction "Choose TWO" / "Which TWO" + 2 câu MC cùng options; gộp AI 4 câu → split cặp
- CSS: `.reading-test-choose-two*` trong `readingTest.css`
- Đáp án vẫn 2 question id (mỗi ô 1 chữ) — scoring không đổi

## Đã xong (2026-07-09) — Reading P3 template r3fy (Features + YNNG + Summary)
- Template `p3-r3-features-ynng-summary` (`r3fy`) — preview JPG `Teamplate_Part3_8.jpg` (Guided play)
- Matching features Q27–31 (người A–G) + YNNG Q32–36 (claims of writer) + summary ONE WORD Q37–40 (`note` inline)
- Builder `ieltsReadingP3FeaturesYnngSummaryPart()` + `CAM_GUIDED_PLAY_SUMMARY_NOTE`
- Signature: `matching-features|ynng|gap-fill`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_8.jpg`

## Đã xong (2026-07-09) — Reading P1 template r1my (Match đoạn + YNNG + Features)
- Template `p1-r1-match-ynng-features` (`r1my`) — preview JPG `Teamplate_Part1_8.jpg`
- Matching paragraph Q1–3 (A–J) + YNNG Q4–6 (claims of writer) + matching features A–C Q7–13 (Hamiltonian/Jeffersonian/Jacksonian)
- Builder `ieltsReadingP1MatchYnngFeaturesPart()`; signature `matching-paragraph|ynng|matching-features`
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_8.jpg`

## Đã xong (2026-07-09) — Fix màn trắng `/app/exam/track/ielts` (harden)
- **Repro sạch:** Playwright + mock auth → track IELTS **render OK** (Library Archives + nút Import)
- **Root cause có thể:** crash render từ đề Dexie/localStorage lỗi (`examType`/`parts`/`answer` undefined) → React unmount trắng, không ErrorBoundary
- **Fix:**
  - `ExamTrackErrorBoundary` bọc track page (hiện message thay vì trắng)
  - `safeReadingRow` / `safeListeningRow` + `safeDraftFlag`
  - `listAllListeningExams` normalize + fallback `examType`/`parts`
  - `getPartQuestions` / `getListeningExamQuestions` / `isReadingAnswerCorrect` / draft completion — defensive
- User: **Ctrl+Shift+R** hard refresh sau HMR lỗi transform

## Đã xong (2026-07-09) — Reading P2 template r2cs (Match đoạn + Choose TWO + Summary)
- Template `p2-r2-match-choose-two-summary` (`r2cs`) — preview JPG `Teamplate_Part2_10.jpg` (Cam14 T1 Bike-sharing)
- Matching paragraph Q14–18 (A–G, which section) + 2× Choose TWO Q19–20 & Q21–22 + summary ONE WORD Q23–26 (`note` inline)
- Builder `ieltsReadingP2MatchChooseTwoSummaryPart()` + `CAM14_T1_BIKE_SUMMARY_NOTE`
- Signature: `matching-paragraph|multiple-choice|multiple-choice|gap-fill`
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_10.jpg`

## Đã xong (2026-07-07) — Reading P1 template r1n (Notes + TFNG)
- Template `p1-r1-notes-tfng` (`r1n`) — preview JPG `Question1_6.jpg` (Wildfires Q1–6)
- `notePassage` + `notesTitle` + `ReadingNotePassageBox.tsx` render notes inline
- Builder `ieltsReadingP1NotesTfngPart()` + Cam10 T4 `exam_passage1.json` rebuilt + bundle ZIP

## Đã xong (2026-07-07) — Reading P2 template r2g (Summary + Match)
- Template `p2-r2-gap-match` (`r2g`) — preview JPG `Teamplate_Part2_1.jpg` (Cam10 T4 Second nature)
- Summary Q14–18: `note` inline `14________` … `18________` + `SummaryGapFillNote` UI
- Builder `ieltsReadingP2GapMatchPart()` + Cam10 T4 `exam_passage2.json` rebuilt + bundle ZIP

## Đã xong (2026-07-07) — Reading P3 template r3tb (Match + Table + Features)
- Template `p3-r3-match-table-features` (`r3tb`) — preview JPG `Teamplate_Part3_1.jpg` (Cam11 T1 geo-engineering)
- Match đoạn Q27–29 + table Q30–36 (`noteTable` Procedure|Aim) + match người Q37–40
- Builder `ieltsReadingP3MatchTableFeaturesPart()` + `CAM11_T1_GEO_ENGINEERING_TABLE`

## Đã xong (2026-07-08) — Reading P1 template r1ts (TFNG + Match + Summary)
- Template `p1-r1-tfng-match-summary` (`r1ts`) — preview JPG `Teamplate_Part1_2.jpg` (Cam11 T4 Research using twins)
- TFNG Q1–4 + matching features Q5–9 (Galton/Bouchard/Reed) + summary word bank A–F Q10–13 (`note` inline)
- Builder `ieltsReadingP1TfngMatchSummaryPart()` + `CAM11_T4_EPIGENETIC_SUMMARY_NOTE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_2.jpg`

## Đã xong (2026-07-08) — Reading P2 template r2te (TFNG + Endings + Summary)
- Template `p2-r2-tfng-endings-summary` (`r2te`) — preview JPG `Teamplate_Part2_4.jpg` (Cam11 T3 Great Migrations)
- TFNG Q14–18 + matching sentence endings A–G Q19–22 + summary ONE WORD Q23–26 (`note` inline)
- Builder `ieltsReadingP2TfngEndingsSummaryPart()` + `CAM11_T3_MIGRATION_ENDINGS_BANK` + `CAM11_T3_PRONGHORN_SUMMARY_NOTE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_4.jpg`

## Đã xong (2026-07-08) — Reading P2 template r2fs (MC + TFNG + Endings)
- Template `p2-r2-mc-tfng-endings` (`r2fs`) — preview JPG `Teamplate_Part2_6.jpg` (Cam11 T4 An Introduction to Film Sound)
- Multiple choice Q14–18 + TFNG Q19–23 + matching sentence endings A–E Q24–26
- Builder `ieltsReadingP2McTfngEndingsPart()`

## Đã xong (2026-07-08) — Reading P3 template r3hy (Headings + Summary + YNNG)
- Template `p3-r3-headings-summary-ynng` (`r3hy`) — preview JPG `Teamplate_Part3_4.jpg` (Cam11 T4 This Marvellous Invention)
- Matching headings Q27–32 (A–F) + summary word bank A–G Q33–36 + YNNG Q37–40
- Builder `ieltsReadingP3HeadingsSummaryYnngPart()`

## Đã xong (2026-07-08) — Fix Reading Wizard `TEMPLATE_BUILDERS[kind] is not a function`
- `resolveReadingTemplateKind()` — fallback kind hợp lệ từ catalog/default khi localStorage hoặc kind lỗi
- `assertAllTemplateBuildersRegistered()` — dev-time check catalog ↔ builders
- `ieltsReadingWizardPersist` + `ieltsReadingAiGenerate` dùng resolve trước khi gọi builder

## Đã xong (2026-07-08) — Reading P3 template r3ag (Headings + Gap + YNNG)
- Template `p3-r3-headings-gap-ynng` (`r3ag`) — preview JPG `Teamplate_Part3_5.jpg` (Cam12 T5 What's the Purpose of Gaining Knowledge)
- Matching headings Q27–32 (A–F) + summary TWO WORDS Q33–36 (`note` inline) + YNNG Q37–40
- Builder `ieltsReadingP3HeadingsGapYnngPart()` + `CAM12_T5_KNOWLEDGE_HEADINGS` + `CAM12_T5_ARSON_SUMMARY_NOTE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_5.jpg`

## Đã xong (2026-07-08) — Fix preview Part2_6 → r2fs (MC + TFNG + Endings)
- `Teamplate_Part2_6.jpg` = Film Sound (trùng Part2_5) — preview `r2fs`, không còn gán nhầm Falkirk
- `Teamplate_Part2_2.jpg` = Falkirk diagram — preview `r2fw`

## Đã xong (2026-07-08) — Reading P2 template r2fw (TFNG + Diagram)
- Template `p2-r2-tfng-diagram` (`r2fw`) — preview JPG `Teamplate_Part2_2.jpg` (Cam11 T1 The Falkirk Wheel)
- TFNG Q14–19 + diagram labeling ONE WORD Q20–26 (`imageFile: falkirk-wheel-diagram.jpg`)
- Builder `ieltsReadingP2TfngDiagramPart()`

## Đã xong (2026-07-08) — Reading P2 template r2fs (MC + TFNG + Endings)
- Template `p2-r2-mc-tfng-endings` (`r2fs`) — preview JPG `Teamplate_Part2_6.jpg` (Cam11 T4 An Introduction to Film Sound)
- Multiple choice Q14–18 + TFNG Q19–23 + matching sentence endings A–E Q24–26
- Builder `ieltsReadingP2McTfngEndingsPart()` + `CAM11_T4_FILM_SOUND_ENDINGS_BANK`
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_6.jpg`

## Đã xong (2026-07-08) — Reading P3 template r3hy (Headings + Summary + YNNG)
- Template `p3-r3-headings-summary-ynng` (`r3hy`) — preview JPG `Teamplate_Part3_4.jpg` (Cam11 T4 This Marvellous Invention)
- Matching headings Q27–32 (A–F) + summary word bank A–G Q33–36 + YNNG Q37–40 (views of writer)
- Builder `ieltsReadingP3HeadingsSummaryYnngPart()` + `CAM11_T4_LANGUAGE_HEADINGS` + `CAM11_T4_LANGUAGE_WORD_BANK`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_4.jpg`

## Đã xong (2026-07-08) — Reading P3 template r3ps (Match đoạn + Sentence)
- Template `p3-r3-match-paragraph-sentence` (`r3ps`) — preview JPG `Teamplate_Part3_3.jpg` (Cam11 T3 Mathematical Reasoning)
- Matching paragraph Q27–34 (A–G) + sentence completion ONE WORD Q35–40
- Builder `ieltsReadingP3MatchParagraphSentencePart()`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_3.jpg`

## Đã xong (2026-07-08) — Reading IELTS: bỏ auto chạy theo câu
- `ReadingTest.tsx` — bỏ `useEffect` auto-scroll passage + câu hỏi khi đổi `activeQuestionId`
- `ReadingQuestionPanel.tsx` — bỏ auto chuyển câu tiếp theo sau khi điền paragraph/heading/word bank/feature

## Đã xong (2026-07-08) — Reading P3 template r3my (MC + Summary + YNNG)
- Template `p3-r3-mc-summary-ynng` (`r3my`) — preview JPG `Teamplate_Part3_2.jpg` (Cam11 T2 Art and the Brain)
- Multiple choice Q27–30 + summary word bank A–H Q31–33 (`note` inline) + YNNG Q34–39 (claims of writer)
- Builder `ieltsReadingP3McSummaryYnngPart()` + `CAM11_T2_ART_BRAIN_SUMMARY_NOTE` + `CAM11_T2_ART_BRAIN_WORD_BANK`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_2.jpg`

## Đã xong (2026-07-08) — Reading P2 template r2hm (Headings + Summary + MC)
- Template `p2-r2-headings-summary-mc` (`r2hm`) — preview JPG `Teamplate_Part2_3.jpg` (Cam11 T4 Easter Island)
- Matching headings Q14–20 + summary ONE WORD Q21–24 (`note` inline) + Choose TWO Q25–26
- Builder `ieltsReadingP2HeadingsSummaryMcPart()` + `CAM11_T4_DIAMOND_SUMMARY_NOTE`

## Đã xong (2026-07-08) — Fix màn trắng `/app/exam/track/ielts`
- **Root cause:** `listeningNotePassage.ts` lỗi cú pháp (duplicate `question`, string chưa đóng) → Vite không transform được → lazy import `ExamTrackPage` fail (chuỗi: `ieltsListeningWizardPersist` → `importListeningUtils` → `listeningNotePassage`)
- **Fix phụ:** `ExamTrackPage.tsx` — chuyển redirect `ket` xuống sau tất cả hooks (tránh Rules of Hooks khi đổi route)
- Verify: `pnpm --filter web exec tsc --noEmit` + `vite build` pass; dev server restart → hard refresh Ctrl+Shift+R

## Đã xong (2026-07-08) — Reading P2 template r2hms (Headings + Match + Summary)
- Template `p2-r2-headings-match-summary` (`r2hms`) — preview JPG `Teamplate_Part2_9.jpg` (Cam13 T1 Boredom)
- Matching headings Q14–19 (A–F, i–viii) + match ideas Q20–23 (A–E) + summary ONE WORD Q24–26
- Builder `ieltsReadingP2HeadingsMatchSummaryPart()` + `CAM13_T1_BOREDOM_SUMMARY_NOTE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_9.jpg`

## Đã xong (2026-07-08) — Reading P1 template r1tt (Table + TFNG, merge ô)
- Template `p1-r1-table-tfng` (`r1tt`) — preview JPG `Teamplate_Part1_7.jpg` (Cam13 T4 Coconut palm)
- Table completion Q1–8 (`noteTable` 3 cột, `rowSpan`/`colSpan`/`skip`) + TFNG Q9–13
- `R1TT_MERGE_TABLE_SAMPLE` — bảng mẫu "fruits" gộp 5 hàng; vẫn hỗ trợ bảng 2 cột không merge (`CAM13_T1_NZ_WEBSITE_TABLE`)
- `examData.ts` + `readingNoteTableUtils.ts` + `ReadingNoteTable.tsx` — render merge cột/hàng
- AI prompt: quy tắc merge khi copy Word/PDF dạng bảng IELTS
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_7.jpg`
- Wizard edit: `gap-fill|tfng` + `noteTable` → `r1tt` (khác `r1n`/`r1n8` notePassage)

## Đã xong (2026-07-08) — Fix sync cloud: preset deck ID không phải UUID
- Lỗi: `decks upsert: invalid input syntax for type uuid: "preset:academic:kinh-te-hoc"`
- Nguyên nhân: `syncLocalToCloud` đẩy cả bộ preset (`preset:group:slug`) lên Supabase — cột `decks.id` là UUID
- Fix: `packages/db/src/cloud/presetDeck.ts` — `isPresetDeck()`; sync bỏ qua deck/card/SRS preset
- Chỉ deck `origin: user` (UUID) được đồng bộ cloud; preset lấy từ seed local + Admin publish

## Đã xong (2026-07-08) — Vocab preset decks bị double
- Root cause: `seedPresetDecks` dùng UUID ngẫu nhiên + React StrictMode/sync Admin publish tạo bản trùng cùng group+tên
- Fix: `stablePresetDeckId()` + `put` idempotent + `dedupePresetDecks()` gộp thẻ/SRS về 1 bộ
- `mergeVocab` remap ID preset trước `bulkPut`; gọi dedupe sau sync

## Đã xong (2026-07-08) — Reading P2 template r2hl (Headings + TFNG + Sentence)
- Template `p2-r2-headings-tfng-sentence` (`r2hl`) — preview JPG `Teamplate_Part2_7.jpg` (Cam12 T8 The Lost City)
- Matching headings Q14–20 (A–G) + TFNG Q21–24 + sentence completion ONE WORD Q25–26
- Builder `ieltsReadingP2HeadingsTfngSentencePart()` + `CAM12_T8_LOST_CITY_HEADINGS`
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_7.jpg`

## Đã xong (2026-07-08) — Reading P2 template r2ms (MC + Summary + YNNG)
- Template `p2-r2-mc-summary-ynng` (`r2ms`) — preview JPG `Teamplate_Part2_8.jpg` (Cam12 T8 Bring back the big cats)
- Multiple choice Q14–18 + summary word bank A–F Q19–22 + YNNG Q23–26
- Builder `ieltsReadingP2McSummaryYnngPart()` + `CAM12_T8_LYNX_SUMMARY_NOTE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p2/Teamplate_Part2_8.jpg`

## Đã xong (2026-07-08) — Reading P1 template r1n8 (Notes 8 + TFNG)
- Template `p1-r1-notes-tfng-8` (`r1n8`) — preview JPG `Teamplate_Part1_5.jpg` (Cam12 T8 The history of glass)
- Note completion Q1–8 (`notePassage`, ONE WORD) + TFNG Q9–13
- Builder `ieltsReadingP1NotesTfng8Part()` + `CAM12_T8_GLASS_NOTE_PASSAGE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_5.jpg`
- Wizard edit: `gap-fill|tfng` + `notePassage` + ≥8 gaps → `r1n8` (khác `r1n` 6 gaps)

## Đã xong (2026-07-08) — Reading P1 template r1hn (Headings + Notes)
- Template `p1-r1-headings-notes` (`r1hn`) — preview JPG `Teamplate_Part1_4.jpg` (Cam12 T5 Flying tortoises)
- Matching headings Q1–7 (A–G, i–viii) + note completion Q8–13 (`notePassage`, ONE WORD)
- Builder `ieltsReadingP1HeadingsNotesPart()` + `CAM12_T5_TORTOISE_DECLINE_NOTE_PASSAGE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_4.jpg`
- Wizard edit: `matching-headings|gap-fill` + `notePassage` → `r1hn` (khác `r1hg` sentence gap)

## Đã xong (2026-07-08) — Reading P1 template r1ct (Match + Choose TWO)
- Template `p1-r1-match-choose-two` (`r1ct`) — preview JPG `Teamplate_Part1_3.jpg` (Cam12 T6 Agriculture risks)
- Match paragraph Q1–3 (A–I) + matching-features Q4–9 (người A–G) + Choose TWO Q10–13
- Builder `ieltsReadingP1MatchChooseTwoPart()` + `CAM12_T6_AGRICULTURE_PEOPLE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_3.jpg`

## Đã xong (2026-07-08) — Reading P3 template r3se (Summary + MC + Endings)
- Template `p3-r3-summary-mc-endings` (`r3se`) — preview `Teamplate_Part3_7.jpg` (Cam12 T3 Montreal Study)
- Summary TWO WORDS Q27–31 (`note` inline) + MC A–D Q32–36 + sentence endings Q37–40
- Builder `ieltsReadingP3SummaryMcEndingsPart()` — đã xóa nhầm template Listening `p3-c8`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_7.jpg`

## Đã xong (2026-07-08) — Fix Reading Part 3 trắng trang (Cam13 T1 / r3ty)
- **Nguyên nhân 1:** AI ghi `type: "table-completion"` → crash `question.options.map` trong `MultipleChoiceGroup`.
- **Nguyên nhân 2 (console):** `features[]` từ AI dùng `label` thay `name` → `splitReferenceText(feature.name)` crash; `ReadingHighlightableText` nhận `text` undefined.
- **Fix:** `readingExamSanitize.ts` — group type, `features`/`headings`/`wordBank` (map `label`→`name`); load Dexie + published; phòng thủ `splitReferenceText`, `segmentsFromAnnotations`, `ReadingHighlightableText`.

## Đã xong (2026-07-08) — Fix Reading Wizard noteTable không hiện (r3ty / mọi bảng n×n)
- `readingNoteTableUtils.ts` — normalize bảng n cột × n dòng, validate gap ↔ questions
- Wizard AI: `mergeTemplateNoteTables` gắn `noteTable` từ template khi AI thiếu bảng
- Import JSON: chuẩn hóa `noteTable` trong `normalizeImportPart` + cảnh báo thiếu bảng

## Đã xong (2026-07-08) — Reading P3 template r3ty (Table + YNNG + Match)
- Template `p3-r3-table-ynng-match` (`r3ty`) — preview JPG `Teamplate_Part3_6.jpg` (Cam12 T2 The Benefits of Being Bilingual)
- Table Q27–31 (`noteTable` Test|Findings) + YNNG Q32–36 (claims of writer) + match đoạn Q37–40 (A–G)
- Builder `ieltsReadingP3TableYnngMatchPart()` + `CAM12_T2_BILINGUAL_TABLE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p3/Teamplate_Part3_6.jpg`

## Đã xong (2026-07-08) — Reading P1 template r1f (TFNG + Match + Notes)
- Template `p1-r1-tfng-match-notes` (`r1f`) — preview JPG `Teamplate_Part1_1.jpg` (Cam11 T2 Mary Rose)
- TFNG Q1–4 + matching-features Q5–8 (mốc thời gian A–G) + note completion Q9–13 (`notePassage`)
- Builder `ieltsReadingP1TfngMatchNotesPart()` + `CAM11_T2_MARY_ROSE_NOTE_PASSAGE`
- Ảnh: `apps/web/public/ielts-wizard/reading/p1/Teamplate_Part1_1.jpg`

## Đã xong (2026-07-07) — Note cạnh Tô sáng (Luyện thi)
- Reading IELTS + Listening KET/PET/FCE/CAE/CPE/IELTS + Cambridge RW A2–C2

## Đã xong (2026-07-07) — SW cache catalog MP3
- `public/sw.js` cache-first `/catalog/**/*.mp3` (và m4a/wav/ogg/webm)
- Version cache = `web/package.json` version (hiện `0.2.0`); dev = `ryan-catalog-dev`
- User nghe lại không tốn Vercel bandwidth (sau lần tải đầu)

## Đã xong (2026-07-07) — Deploy production
- https://ryanenglishv2.vercel.app — migrations 009–012, SW, Listening publish, Admin publish

## Ưu tiên session mới (chọn theo user) — cập nhật 2026-07-09
### 1 — Verify E2E template Reading mới (ưu tiên)
1. Wizard P1: **r1ntf** (Huarango notes+table+TFNG), **r1nt** (Nutmeg), **r1my**
2. Wizard P2: **r2tn** (Silbo notes sections), **r2mt**, **r2cs** — Choose TWO multi-select
3. Wizard P3: **r3hmy** (headings+MC+YNNG), **r3tn** notes r1n8, **r3em**, **r3fy**
4. Cam15 Moore: notes **1930s/1940s/1950s** mỗi dòng riêng sau generate

### 0 — IELTS track
1. `pnpm --filter web dev` → http://localhost:5173/app/exam/track/ielts
2. **Đăng nhập Google** — hard refresh **Ctrl+Shift+R** nếu HMR lỗi builder

### A — Admin publish / batch Reading
- Admin → Publish nội dung; batch Cam khi đủ 3 passages

### B — Kỹ thuật còn mở
- r1tt merge ô E2E browser; SAMPLE passage r1tt → Coconut nếu AI nhiễu
- Listening Ô CHỮ mobile iOS
```

## Đã xong (2026-07-09) — Sổ ghi chú từ vựng (chế độ học)
- Dexie **v12** bảng `notebookEntries` (`NotebookEntry`): phrase/meaning/example/IPA/pos + ghi chú user, chống trùng `phraseKey`
- `notebookRepo` — save (upsert), updateNote, delete, list
- Study SRS: nút **Lưu sổ ghi chú** (`SaveToNotebookButton`) cạnh Hỏi AI / Lật thẻ
- Tab **Sổ ghi chú** trong study mode + nút trên trang Bộ từ vựng (mở không cần chọn deck)
- Dictionary modal: **Lưu sổ ghi chú** (song song Thêm vào bộ thẻ)
- UI: tìm kiếm, sửa memo, xóa, phát âm — CSS theme-aware
- `pnpm --filter web exec tsc --noEmit` — pass

## Next session start prompt (cập nhật 2026-07-10 — offline dict Part1)
1. Từ điển FAB → tra `abandon`, `environment`, `look forward to` (offline, không cần Pro)
2. (Tuỳ chọn) Part2.json → `pnpm build:dict:part1` mở rộng; seed deck vocab từ JSON
3. Test sync LWW + exam progress nếu chưa verify

## Đã xong (2026-07-10) — Offline dictionary Part 1 (300 từ)
- Sửa/hoàn thiện `Tainguyen/TuDien/Part1.json` (file cũ truncated ~105 từ) → **300 cards** A2–C2
- Copy bundle: `apps/web/src/features/dictionary/data/offlinePart1.json`
- `offlineDictPack.ts` load Part1 + ~60 cụm phrase writing
- Script: `pnpm build:dict:part1` (`scripts/build-dict-part1.mjs`)
- DictionaryModal: hiển thị số mục offline thật
- `tsc` pass

## Next session start prompt (cập nhật 2026-07-10 — Supabase sync thật)
1. `pnpm db:push` — áp migration **014_exam_progress_sync.sql** trên Supabase
2. Test offline→online: sửa deck/SRS offline → online → sync; mở máy 2 pull LWW
3. Reading/Listening: làm dở / nộp bài → Đồng bộ → thiết bị khác thấy draft
4. Electron: export Vocabulary v2 / legacy backup → Settings → Nhập backup → Đồng bộ đám mây
5. (Tuỳ chọn) notebook cloud sync; verify E2E Reading template

## Đã xong (2026-07-10) — Supabase sync kích hoạt thật
### Conflict resolution offline→online
- `packages/db/src/cloud/sync.ts` — **`syncBidirectional`** (LWW theo `updated_at` / SRS `lastReviewedAt`)
- `useSyncManager` luôn gọi bidirectional (không còn push-only khi local có data)
- Preset deck vẫn bỏ qua sync cloud

### Reading/Listening exam progress sync
- Migration **`014_exam_progress_sync.sql`** — bảng `exam_progress` (user_id, skill, exam_id, payload jsonb)
- `examProgressSync.ts` — merge localStorage drafts ↔ cloud (LWW `updatedAt`)
- Draft saves stamp `updatedAt` (Reading IELTS, Cambridge RW shells, Listening KET/PET/IELTS/FCE)

### Electron → Web migration
- `electronMigrate.ts` — Vocabulary export v2 + legacy `flashcardCustomDecks_v6` / SRS
- Non-UUID id → stable UUID remap (sync Supabase được)
- `importBackup` auto-detect Electron/legacy nếu không phải Web backup v1–3
- Settings: mô tả hỗ trợ Electron + sync hai chiều

### Verify
- `pnpm exec tsc --noEmit` (apps/web) — pass
- **Cần `pnpm db:push`** trước khi exam progress sync hoạt động đầy đủ

## Da xong (2026-07-09) — Dictionary offline+Pro / MindMap export+templates / CEFR+exam suggestions
- offlineDictPack + dictionary_ai gate
- exportMindmap PNG/SVG/PDF + IELTS templates
- cefr field + ExamPracticeSuggestionsPanel


## Da xong (2026-07-09) — Listening practice↔exam bridge
- Lesson link sourceExamId/part + linkedAudio
- examListeningBridge + Luyen dictation tu ket qua exam
- Play limit free/basic + slow 0.5/0.75 + Nghe chunk
- Transcript jump-to-word (uoc luong time-align)

## Đã xong (2026-07-10) — Vocab double card (phrase trùng)
- **Root cause:** gộp deck preset (`dedupePresetDecks` / admin publish) chuyển thẻ theo id khác nhau → cùng phrase trong 1 deck; import CSV luôn `add` (không unique)
- **Fix:**
  - `cardRepo.dedupeByPhrase` / `dedupeAllDecks` — gộp theo phrase (case-insensitive), giữ SRS tốt nhất, merge field thiếu, chuyển reviewLog
  - Gọi sau migrate deck, `dedupePresetDecks`, `seedPresetDecks`, `mergeVocab` (admin publish)
  - `ImportModal` dùng `cardRepo.addUnique` + `sourceKind: 'import'`
- Verify: `pnpm --filter web exec tsc --noEmit` — pass

## Đã xong (2026-07-10) — Double bộ thẻ "Công nghệ" (và preset khác)
- **Root cause:** `dedupePresetDecks` chỉ gộp khi `name` khớp exact + `origin !== 'user'` → bản UUID / tên lệch unicode / origin user vẫn hiện cạnh `preset:ielts:cong-nghe`
- **Fix:** bucket theo **stable slug** (`preset:group:slug`), gộp mọi deck trong group preset khớp seed (kể cả origin user); chuẩn hoá tên seed; phrase key NFD + collapse space
- Mở lại `/app/vocab` → seed chạy dedupe → chỉ còn 1 "Công nghệ"

## Đã xong (2026-07-10) — Listening ZIP: Answer Key + Audioscript → transcript khi xem lại
- ZIP có thể chứa `answer-key.pdf` / `audioscript.txt` / `tapescript.txt` (trước đây bị skip)
- `listeningAudioscriptParse.ts` — tách Audioscript, map số câu → `ttsText`
- `importListeningZip` trích PDF text + gắn transcript/đáp án vào payload
- UI xem lại: `ListeningReviewActiveBar`, `ListeningQuestionAnswerPanel`, `ListeningExamResult` hiện **Transcript** từng câu
- **Lưu ý:** PDF scan (không text layer) → cần `audioscript.txt` hoặc PDF có chữ; preview import hiện warning

## Đã xong (2026-07-10) — KET A2 Part 7 import: 1 ảnh `part7-page.jpg`
- **Trước:** `part7-p1.jpg` … `part7-p3.jpg` (bắt buộc 3 file)
- **Sau:** **1 file** `part7-page.jpg` (alias `part7.jpg`) — giống PET Part 8 / FCE Part 9
- Code: `ketWritingImportUtils`, `cambridgeReadingImportTemplates`, `ImportReadingManualModal`
- HDSD: `Prompt-KET-A2-Reading-Universal.txt` (+ bảng so sánh FCE/CAE/PET)

## Đã xong (2026-07-10) — Library: 3× Test 1 → chỉ giữ 7-part
- **UI (Error1.jpg):** Test 1 ×2 meta `5 parts` (catalog/stub) + Test 1 `7 parts` (đúng) + T2–T4
- **Rule:** cùng Book+Test → `preferLibraryExam`: **nhiều part hơn** > nhãn Writing > rank nguồn
- Sample vẫn ẩn khi có catalog; **không** ưu tiên catalog 5-part hơn import 7-part
- Hard refresh KET A2 Reading → 1 dòng Test 1 (7 parts) + Test 2–4

## Đã xong (2026-07-10) — Admin Publish vocab không còn double
- **Nguyên nhân hệ thống:** publish đẩy card/deck UUID random → re-publish / user pull `bulkPut` id mới → double
- **Fix phòng ngừa (cả 2 phía):**
  - `vocabPublishNormalize.ts` — deck → `preset:group:slug`, card → `pcard:{deckId}:{hash(phrase)}`, gộp trùng trong payload
  - `collectVocab` (Admin publish) luôn normalize trước khi upsert
  - `mergeVocab` (user pull) normalize lại payload (kể cả bản publish cũ UUID) + `ensureSrs` + dedupe legacy
  - `stablePresetCardId` / `phraseKeyForCard` trong `vocabSeedDecks.ts`
- **Sau này:** Admin Publish vocab idempotent — cùng từ = cùng id, không nhân đôi
- Verify: `tsc --noEmit` pass
- **Next admin:** Publish lại 1 lần vocab để cloud payload dùng id ổn định (khuyến nghị)


## Da xong (2026-07-10) — Listening transcript Cambridge vs IELTS
- Cambridge A2-C2: ZIP answer-key/audioscript -> auto ttsText khi xem lai
- IELTS: khong auto tu PDF; Xem cung de bai -> nut Hien transcript (AI)
- Files: listeningAudioscriptParse, importListeningZip, listeningIeltsTranscriptAi, examListeningTranscriptStorage, ListeningIeltsTest

## Da xong (2026-07-10) — Cap nhat Prompt Universal Listening A2-C2
- Prompt-Listening-Cambridge.txt: Answer Key + Audioscript + 2 nguon transcript (import + AI)
- KET/PET/FCE/CAE/CPE Universal: ZIP answer-key/audioscript.txt, checklist, loi thuong gap, viec lam

---

## Đã xong (2026-07-10 cuối session) — Cambridge checklist + transcript + RLS + Vocab double/sync

### HDSD / DeepSeek A2–C2
- [x] `HDSD/Prompt-Listening-Cambridge-CHECKLIST.txt` + `Prompt-Reading-Cambridge-CHECKLIST.txt` (A2–C2)
- [x] Link checklist từ master + 10 Universal (KET…CPE L/R)
- [x] DeepSeek Test 2: gửi prompt + PDF + `answer-key.txt` + `audioscript.txt` — **không** MP3 / không bắt buộc q1–q5.jpg
- [x] Pack ZIP **phẳng** cùng cấp: `exam.json`, `listening.mp3`, `answer-key.txt`, `audioscript.txt`, `q*.jpg`

### Listening transcript từ `audioscript.txt`
- [x] **UI xem:** Nộp bài → kết quả `Transcript:` · hoặc **Xem cùng đề bài** → khối **Transcript · Câu N** / bar review
- [x] Bug: ZIP `ket-listening-test2.zip` **thiếu** `audioscript.txt` (chỉ nested folder) → rebuild ZIP flat + file script
- [x] Bug parser: format Cambridge `Question 1 One. …` / monologue Part 2–5 (`Look at questions 6–10`) không map được
- [x] Fix `listeningAudioscriptParse.ts` — Question N + ordinal dài trước ngắn + range monologue → 25/25 câu KET Test 2
- [x] Toolbar: Cambridge `importedCount=0` → gợi ý ZIP cần `audioscript.txt` / import lại

### Listening khác (session)
- [x] Audio play: blob URL revoke sớm (`useExamQuestionAudio`)
- [x] KET Part 2 double form: strip gap trong instruction + UI + prompt rules
- [x] Admin xóa đề: local Dexie + unpublish cloud published tables
- [x] Import: alias audio `listening.mp3` / `Audio.mp3`

### RLS / quyền user vs admin
- [x] **Mô hình:** User ghi data **cá nhân** (deck/card/srs/writing/mindmap/exam_progress). Admin ghi **Luyện thi + Vocab mặc định** (published tables)
- [x] Migration **`015_user_data_rls_harden.sql`** — `USING` + **`WITH CHECK`** (`auth.uid() = user_id`) — **đã `pnpm db:push`**
- [x] Message lỗi sync phân biệt bảng admin vs data cá nhân (`useSyncManager.friendlySyncError`)

### Vocab double + lỗi sync (production `/app/vocab`)
- [x] **Root cause:** preset từng push cloud UUID → mỗi lần sync **pull lại** cạnh `preset:…` + card UUID vs `pcard:` cùng phrase
- [x] `sync.ts`: nhận ghost deck (cùng group+tên preset) → **không pull**; **soft-delete** ghost deck/card cloud; chỉ push UUID user; push **chunked** + partial fail không “chết” sync
- [x] `seedPresetDecks` trước/sau sync; dedupe theo stable slug + **tên seed duy nhất** (group cloud sai vẫn gộp)
- [x] **Rekey** card → `pcard:{deckId}:{hash}` + merge SRS/reviewLog (`rekeyOneCard` / `repairVocabDuplicates`)
- [x] UI `/app/vocab`: nút **「Dọn thẻ trùng」**
- [x] Version web **0.2.3** · **deploy prod** https://ryanenglishv2.vercel.app
- [x] User: hard refresh (Ctrl+Shift+R) → sync → **Dọn thẻ trùng**

### Lỗi còn tồn tại / theo dõi
- [ ] User verify sau deploy: số thẻ từng bộ preset (~100) hết x2/x3; sync sidebar không còn đỏ RLS
- [ ] Admin **Publish lại vocab 1 lần** (payload cloud id ổn định `preset:` / `pcard:`) nếu cloud còn UUID cũ
- [ ] Nếu unpublish/xóa đề cloud fail: kiểm tra RLS DELETE trên `reading_exam_published` / `listening_exam_published`
- [ ] Re-import KET Listening Test 2 ZIP mới (có audioscript) nếu đề cũ local chưa có `ttsText`
- [ ] Working tree local còn nhiều file uncommitted (HDSD, exam, vocab, Tainguyen xóa…) — chưa git commit full session

## Đã xong (2026-07-11) — Publish Listening kèm MP3 cloud

- **Bug:** `listening-import-*` publish chỉ JSON; `stripLocalMediaKeys` xóa `audioKey` → Firefox/user khác **không có MP3**
- **Fix:** `materializeListeningMediaForPublish` upload blob Dexie → bucket `listening-exam-media` (migration **016**, 50MB) + set `audioUrl`/`pictureImageUrl` public
- User Admin: **Publish lại** đề import trên máy có blob local; Firefox hard refresh
- URL ví dụ: `/app/exam/listening/listening-import-…` load từ `listening_exam_published`

## Đã xong (2026-07-11) — Fix theo screenshot Error/error1+error2

- **error2 Part 2:** passage chỉ còn title + 3 ảnh (không label/text) → UI `sign-box` khung lớn, mất Angus/Frank/Zac
  - `repairKetPart2Passage` ghép lại 3 profile + portrait theo thứ tự
  - Render Part 2 **không** còn sign-box; luôn portrait 2.5×3.5cm + text
  - Cloud merge Part 2 gán ảnh theo profile, không dán title
- **error1 Part 7:** broken image icon “Story picture 1/2/3” — URL strip/sai
  - `repairKetPart7Passage` → `/catalog/reading/ket-a2-test1/part7-p*.jpg`
  - UI fallback onError + luôn 3 slot catalog
- Test `test-fill-reading-media.mts` PASS

## Đã xong (2026-07-11) — Fix User: P1/P7 mất ảnh + P2 mất đoạn văn

- **Root cause:** Publish từ local import chỉ có `imageKey` blob → `stripLocalMediaKeys` xóa key → user không có `imageUrl`. Published ghi đè catalog (có `/catalog/...`). Part 2 portrait + nhánh render chỉ ảnh → nuốt text khi thiếu label/text.
- **Fix:** `fillReadingExamMedia.ts` — vá `imageUrl`/`text`/`label` từ catalog khi resolve + trước publish
- Render Part 2: luôn hiện text kèm portrait
- Test: `scripts/test-fill-reading-media.mts` PASS
- User hard refresh là thấy (không bắt buộc re-publish); Admin **Publish lại** để JSON cloud sạch

## Đã xong (2026-07-11) — User không thấy P6/P7 + ảnh KET A2

- **Root cause P6/P7:** catalog builtin `reading-ket-a2-test1` chỉ **5 parts**; Admin import local 7-part → User chỉ thấy catalog
- **Fix:** catalog → **7 parts** (P6 writing email + P7 story 3 ảnh `/catalog/reading/ket-a2-test1/part7-p*.jpg`); duration 60; bandHint RW
- **Loader:** `listAllReadingExams` / `resolveReadingExam` ưu tiên bản **nhiều part hơn** (publish/local vs catalog cũ)
- **Ảnh Part 2:** user chỉ thấy nếu upload gắn **cùng examId** user mở (vd. `catalog-reading-ket-a2-test1`); sau upload cập nhật published JSON nếu đã publish
- Admin: import ảnh portrait **trên đề catalog** (hoặc Publish lại sau upload), không chỉ trên `reading-import-*`

## Đã xong (2026-07-11) — KET A2 Part 2 portrait image (Admin import)

- 3 profile (label Angus/Frank/Zac…): trước mỗi đoạn ô **2.5cm × 3.5cm**
- **Admin** thấy ô import / Đổi / Xóa; **user** chỉ thấy ảnh khi đã có
- Cloud: `reading_exam_images` slot `passage` + `item_index` = block index; public read, admin write
- Files: `KetRwPassagePortrait.tsx`, `KetRwPartContent`, `ReadingKetRwTest` (merge cloud images), `persistReadingPassageBlockImage`, CSS `ket-rw-portrait*`

## Đã xong (2026-07-11) — Fix KET A2 Part 2 bị ép YNNG (false positive)

- **Bug:** Import ZIP `KET A2_Cam 1` — `exam.json` Part 2 đúng `multiple-choice` (A Angus / B Frank / C Zac) nhưng UI ra YES/NO/NOT GIVEN
- **Root cause:** `coerceTriStateGroupType` / `optionsLookTriStateOnly` trong `readingExamSanitize.ts`
  - `normalizeTriStateId` map **a→yes, b→no, c→not-given** (dành cho AI option id)
  - Option id A/B/C → bị coi tri-state; label ngắn (`Angus` < 12 ký tự) không vượt `hasRealMcOpts`
- **Fix:** Detect tri-state **ưu tiên label**; bare A–D không còn = YES/NO; mọi label không phải YES/NO/TRUE/FALSE/NG = MC thật
- Verify: sanitize `Test 1/exam.json` → Part 2 vẫn `multiple-choice`; YNNG Cam19-style (label YES/NO/NG) vẫn coerce
- User: hard refresh dev → **import lại** ZIP (hoặc mở lại đề) — không cần sửa JSON

## Next session start prompt (cập nhật 2026-07-11)

```
Đọc session_summary.md (đầu file + mục "2026-07-11" fix KET Part 2 YNNG + check-in cloud).

1) pnpm db:push — migration 017_checkin_days (bắt buộc trước khi streak cloud hoạt động)
2) Đăng nhập → điểm danh → máy/browser khác login cùng account → Đồng bộ → streak điểm danh khôi phục
3) Lưu ý: số lửa Home = streak HỌC (vocab), không phải điểm danh
```

## 2026-07-11 — HDSD Universal: đề PDF **hoặc** TXT

- Master L/R + checklist + 10 Universal: § **Nguồn đề PDF hoặc TXT**
- DeepSeek: gửi `exam-text.txt` + `answer-key.txt` (+ audioscript) thay PDF được
- Vẫn pack ZIP: `exam.json` + mp3/ảnh (crop ảnh ngoài AI)

## 2026-07-11 — HDSD Universal A2–C2 (Listening + Reading)

- Master: `Prompt-Listening-Cambridge.txt` / `Prompt-Reading-Cambridge.txt` + checklists
- 5× Listening Universal + 5× Reading Universal: mục **App 2026-07**
  - Gap-fill: `answer: "8/eight"` + `acceptableAnswers`
  - Ảnh **webp** (map basename `q1.jpg` ↔ `q1.webp`)
  - Listening: title Book/Test — không đè catalog audio Test 1
- KET Listening Universal: ví dụ Q8 `8/eight` + bảng lỗi thường gặp

## 2026-07-11 — Listening: local media > catalog (triệt để)

- **Bug:** Import KET Test 3 ZIP → merge catalog gắn `/catalog/listening/ket-a2-test1` → phát nhầm audio Test 1
- **Policy:** `listeningLocalMediaPolicy.ts` — blob local thắng; twin chỉ cùng số Test; không default Test 1 cho Test N
- **Load path:** `resolveListeningExam` → merge + `preferLocalListeningMedia` (sửa đề Dexie cũ, không bắt re-import)
- **Play:** `partAudioSource` / `sharedExamAudioSource` / `useExamQuestionAudio` không push catalog song song khi có blob
- **Regression:** `pnpm test:listening-media` (`apps/web/scripts/test-listening-media-policy.mts`)

## 2026-07-11 — Tainguyen ra ngoài repo (deploy nhẹ hơn)

- **Data:** `D:\App-English-Ryan\Tainguyen` (~1.8 GB); **junction** `Website\Tainguyen` → path đó (script local OK)
- **Code:** `scripts/tainguyen-path.mjs` (`TAINGUYEN_PATH`); `build-catalog.mjs --if-present` / skip trên Vercel nếu không có nguồn
- **`vercel.json`:** `node scripts/build-catalog.mjs --if-present` rồi build web
- **`.vercelignore`:** không upload Tainguyen, PDF thô, Giaodien, server, …
- **`.gitignore`:** `Tainguyen/`
- **Docs:** `docs/TAINGUYEN.md`
- **Giữ:** `apps/web/public/catalog` (~830 MB audio) — vẫn là bottleneck upload nếu chưa CDN

## 2026-07-11 — Check-in (điểm danh) sync theo tài khoản

- **Vấn đề:** Chuỗi điểm danh chỉ trong IndexedDB (`reviewLog` mode=checkin); publish không xóa; đổi máy / clear site data / browser khác = mất streak. Sync cloud trước đó **không** gồm reviewLog.
- **Fix:**
  - Migration `017_checkin_days.sql` — bảng `checkin_days (user_id, day_key YYYY-MM-DD, checked_at)` + RLS own row
  - `apps/web/src/features/home/checkInSync.ts` — union merge local ↔ cloud; push ngay khi bấm điểm danh (best-effort)
  - `useCheckIn.ts` — ghi local + push cloud nếu đã login + online
  - `useSyncManager` — gọi `syncCheckInDays` mỗi lần sync (cùng exam_progress)
- **Deploy:** cần `pnpm db:push` (hoặc SQL Editor chạy 017) rồi deploy web
