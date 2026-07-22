# Auto-Sync Transcript & Question với Audio Playback — Summary

## Mục tiêu
Khi audio Listening exam đang phát:
1. **Transcript highlight** segment tương ứng, auto-scroll
2. **Câu hỏi tự động chuyển** theo audio (chỉ practice mode, không exam mode)
3. **Part tự động chuyển** khi audio qua Part khác (shared audio)

## Trạng thái hiện tại
- Code đã implement ở: `useAudioSync.ts`, `audioSyncUtils.ts`
- Content matching (question prompt → Whisper segment) hoạt động tốt cho Part 1 (câu hỏi được đọc trong audio)
- Còn **3 vấn đề chưa giải quyết được** (cần agent khác lên plan)

---

## Vấn đề 1: Công thức chuyển Part không đúng

### Sai lầm 1: Chia đều audio cho các Part
```typescript
// ❌ Sai: giả định audio chia đều
fullRatio = audioCurrentTime / audioDuration
questionIndex = floor(fullRatio * totalQuestions)
```
Thực tế Part 1 có thể chiếm 30% audio (example + hướng dẫn), Part 2 chỉ 15%.

### Sai lầm 2: Dùng startPct/endPct clipping sai cách
```typescript
// ❌ Sai: clip time → không auto-transition được
const relTime = Math.min(partDuration, audioCurrentTime - startTime)
questionIndex = floor((relTime / partDuration) * partQCount)
```
Khi audio ra khỏi Part hiện tại, `relTime` bị clamp ở `partDuration` → mắc kẹt ở câu cuối của Part.

### Cần làm:
- Dùng `audioStartPct`/`audioEndPct` có sẵn trong `ListeningPart` để detect Part transition
- Không clip time, cho phép audio position vượt quá Part boundary
- Khi phát hiện Part thay đổi → gọi `onPartChange`
- Trong Part mới, tính question index dựa trên `startPct`/`endPct` của Part đó

---

## Vấn đề 2: Content matching chỉ hoạt động cho Part 1

### Nguyên nhân:
KET Part 1: câu hỏi được đọc trong audio → match được
KET Part 2-5: câu hỏi KHÔNG được đọc → match thất bại

### Giải pháp tạm thời (đã implement):
Khi match < 2 câu → fallback về `questionIndexAtAudioTime` (pause detection + time ratio)

### Vấn đề còn lại:
Pause detection không chính xác cho Part 2 (continuous conversation/dialogue). Cần giải pháp tốt hơn:
- Dùng Whisper segment gaps để detect natural breaks
- Hoặc map segment count → question count theo tỷ lệ
- Hoặc dùng duration ratio trong Part

---

## Vấn đề 3: "Now listen again" (KET play 2 lần)

KET A2 audio có cấu trúc:
```
first pass (0-T) → "Now listen again" pause → second pass (T'-2T)
```

### Đã làm:
- Detect gap >3s giữa các Whisper segments → identify listen-twice boundary
- Wrap second pass time về first pass position

### Vấn đề còn lại:
- Cần verify detection đúng cho tất cả KET exams
- Gap threshold (3s) có thể không phù hợp cho mọi audio

---

## Files liên quan

| File | Vai trò |
|---|---|
| `apps/web/src/features/exam/useAudioSync.ts` | Hook chính: gọi sync logic, track manual interaction, part change |
| `apps/web/src/features/exam/audioSyncUtils.ts` | Utils: content matching, pause detection, listen-twice detection, question index calculation |
| `apps/web/src/features/exam/useExamQuestionAudio.ts` | Hook audio playback: đã thêm `audioCurrentTime`, `audioDuration` return |
| `apps/web/src/features/exam/ListeningTranscriptSidePanel.tsx` | Panel transcript: đã thêm audio time props + segment highlight |
| `apps/web/src/features/exam/ListeningKetTest.tsx` | KET test runner: đã tích hợp useAudioSync + audioCurrentTime |
| `apps/web/src/features/exam/ListeningPetTest.tsx` | PET test runner: đã tích hợp |
| `apps/web/src/features/exam/ListeningFceTest.tsx` | FCE/CAE/CPE test runner: đã tích hợp |
| `apps/web/src/features/exam/ListeningIeltsTidShell.tsx` | IELTS: chưa tích hợp (không cần auto-sync) |
| `apps/web/src/features/exam/listeningTest.css` | CSS cho segment highlight |
| `apps/web/src/features/exam/listeningExamData.ts` | Types: `ListeningPart.audioStartPct/audioEndPct`, `transcriptSegments?` |
| `server/python/whisper_stt.py` | Whisper script trả về `segments: [{id, start, end, text}]` |
| `scripts/backfill-ket-listening-transcript-segments.mjs` | Script backfill segments cho KET exams lên Supabase |

## Data flow

```
useExamQuestionAudio
  └── audioCurrentTime, audioDuration (seconds)
       │
       ▼
useAudioSync
  ├── syncWholeExam = true (shared audio 1 file)
  │     ├── Detect Part từ audioStartPct/audioEndPct
  │     ├── Tính question index trong Part
  │     └── onPartChange khi Part thay đổi
  │
  └── syncWholeExam = false (per-part audio 5 files)
        ├── Content matching (Part 1: question prompt → segment)
        ├── Fallback: pause detection / time ratio
        └── questionIndex trong Part hiện tại
       │
       ▼
ListeningTranscriptSidePanel
  └── segments filter → .is-speaking class → scrollIntoView
```

## Cấu trúc audio KET

| Exams | Audio | Parts | Questions |
|---|---|---|---|
| Cam1-Cam3(Test1,2) | 1 shared file | 5 parts | 25 questions |
| Cam3(Test3,4)→Cam14 | 5 per-part files | 5 parts | 25 questions |

## Trạng thái hiện tại
- [x] Expose audioCurrentTime/audioDuration từ hook
- [x] Lưu Whisper segments timing vào localStorage + Supabase
- [x] Segment highlight + scroll trong transcript panel
- [x] Content matching (question prompt → segment)
- [ ] **Auto-transition Part đúng** — công thức chưa chính xác
- [ ] **Content matching cho Part 2-5** — hiện fallback không tối ưu
- [ ] **Listen-twice detection** — cần verify trên nhiều exam
