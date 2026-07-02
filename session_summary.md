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
- **Session:** 2026-07-02 — `@ryan/catalog` + builtin KET/PET/FCE Reading + KET Listening
- **Production:** https://ryanenglishv2.vercel.app — **chưa deploy** catalog v0.2.0 (local only)

### Bundle đề sẵn trong `Tainguyen/`
| Kỹ năng | Level | File | Trạng thái |
|---------|-------|------|------------|
| Reading | A2 KET | `ket-reading-test1` | **Builtin** `catalog-reading-ket-a2-test1` |
| Reading | B1 PET | `pet-reading-test1` | **Builtin** `catalog-reading-pet-b1-test1` |
| Reading | B2 FCE | `fce-reading-test1` | **Builtin** `catalog-reading-fce-b2-test1` |
| Listening | A2 KET | `ket-listening-test1` | **Builtin** `catalog-listening-ket-a2-test1` |

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
- [ ] `pnpm-workspace.yaml` bị hook tự động thêm `allowBuilds` — dùng `pnpm install --ignore-scripts` để tránh lỗi
- [ ] `packages/db` cần `@supabase/supabase-js` là peerDependency (đã cấu hình)

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
- [x] `public/sw.js` — push + notificationclick → `/#/app/vocab`
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

## Next session start prompt

```
Đọc session_summary.md.

Session 2026-07-02 — Global catalog hướng 3 đã xong (builtin đề + sync framework).

Production: https://ryanenglishv2.vercel.app
Sau khi user confirm Listening KET OK → pnpm deploy:prod (UI gap-fill/matching chưa lên prod).

─── ƯU TIÊN NGÀY MAI ───

1. USER TEST — Import Listening KET A2
   • Luyện thi → Cambridge → A2 → Import thủ công Listening
   • Upload Tainguyen/ket-listening-test1.zip
   • Kiểm tra: audio phát, Part 2 gap-fill, Part 5 matching, chấm điểm
   • Nếu lỗi → fix UI/import; nếu OK → deploy prod

2. USER TEST — Reading (nếu chưa)
   • ket-reading-test1.zip — Part 1 ảnh, Part 4 MC (không gap-fill)
   • pet-reading-test1.zip — xóa đề cũ trước khi import lại (fix a8/a9)

3. TUỲ CHỌN — Ảnh Part 1 Listening
   • Extract từ PDF → q1-a.jpg … q5-c.jpg → rebuild ZIP

4. TIẾP THEO (nếu user muốn)
   • PET B1 Listening import (tương tự KET)
   • FCE B2 Listening
   • Prompt + build script cho level tiếp theo

─── ĐÃ XONG 2026-07-01 (Import đề) ───
• Reading: KET / PET / FCE bundles + prompts HDSD
• Listening KET: UI gap-fill + matching, dedupe MP3, build script, ZIP ~12MB
• Files chính: ListeningQuestionCard.tsx, ListeningKetTest.tsx, importListeningUtils.ts
• scripts/build-ket-a2-listening-test1.py, HDSD/Prompt-KET-A2-Listening.txt

─── CHƯA CONFIRM (cũ) ───
• Listening Ô CHỮ mobile iOS
• Web Audio autoplay iOS
• Thanh cuộn thừa Listening lesson page
```
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

## Mục tiêu ưu tiên phiên sau (2026-07-02)

### Luyện thi — Import đề
1. User test `ket-listening-test1.zip` → fix nếu lỗi → `pnpm deploy:prod`
2. User test `ket-reading-test1.zip` / `pet-reading-test1.zip` (xóa đề cũ PET)
3. Extract ảnh Part 1 Listening từ PDF (tuỳ chọn)
4. Bắt đầu PET B1 Listening hoặc level user chọn tiếp

### Khác (nếu user nhắc)
- Listening lesson: thanh cuộn thừa — `?lsnDebug=only-tabs`
- iOS Ô CHỮ + Web Audio autoplay
