# Auto-Sync Transcript & Question theo Audio — Giải pháp + Plan (3 bug)

Status: In progress

## TL;DR

Ba bug đều bắt nguồn từ **một sai lầm gốc: đoán vị trí câu hỏi/Part bằng tỉ lệ thời gian đồng hồ (wall-clock ratio)**. Audio Listening không chia đều: có im lặng, hướng dẫn, example, và mỗi recording phát **2 lần**. 

Giải pháp cốt lõi: **neo mọi thứ vào timeline của transcript (Whisper segments), không đoán theo tỉ lệ**. Cambridge KET/PET luôn đọc câu mốc ("Now turn to Part two", "Now listen again") — ta bắt đúng các câu này để lấy mốc thời gian thật, thay vì công thức chia tỉ lệ.

<aside>
⚠️

**Blocker cần xác nhận:** Các file trong summary (`useAudioSync.ts`, `audioSyncUtils.ts`, `ListeningTranscriptSidePanel.tsx`, field `audioStartPct/transcriptSegments`, `whisper_stt.py`, script backfill) **không có trên nhánh `main`** của repo đang mount (`ryanik1997/Website`). Repo hiện chỉ có `useExamQuestionAudio.ts` (expose `progressPct/timeLabel`, chưa expose giây thô), `transcribeAudio.ts` (đang xin `response_format: json` = chỉ text, chưa có segments), và type `ListeningPart` **chưa có** field timing. → Plan dưới đây build phần nền còn thiếu. Nếu code đã có ở nhánh/máy khác, hãy push lên để mình fix trực tiếp thay vì làm lại.

</aside>

---

## Nguyên tắc thiết kế

1. **Timeline-anchored, không ratio.** Dùng `segments: [{id,start,end,text}]` của Whisper làm nguồn sự thật về thời gian.
2. **Mốc Part = câu nói mốc trong audio** ("Part two", "end of Part one"), không phải % duration.
3. **Không bao giờ clamp thời gian.** Cho phép `currentTime` vượt biên Part → nhờ vậy mới detect được transition.
4. **Dùng giây (seconds) làm mốc lưu trữ**, không dùng %. Mốc bắt từ Whisper vốn là giây; % phụ thuộc duration nên dễ lệch.
5. **Tách 2 luồng theo độ tin cậy:** *highlight transcript* (chính xác mọi Part vì chỉ cần timing) luôn bật; *auto-chuyển câu hỏi* chỉ bật khi đủ tin cậy (tránh nhảy sai gây khó chịu).

---

## Nền tảng dữ liệu (tiền đề cho cả 3 bug)

**a) Whisper trả về segments.** Sửa `packages/core/src/ai/transcribeAudio.ts`:

```tsx
// Trước: chỉ text
form.append('response_format', 'json')

// Sau: verbose_json để có timing
form.append('response_format', 'verbose_json')
form.append('timestamp_granularities[]', 'segment')
// (tuỳ chọn) 'word' để content-match Part 1 mịn hơn

export interface TranscriptSegment { id: number; start: number; end: number; text: string }
// return { text, segments: data.segments as TranscriptSegment[] }
```

**b) Thêm field timing vào types** (`listeningExamData.ts`):

```tsx
export interface TranscriptSegment { id: number; start: number; end: number; text: string }

// ListeningPart
transcriptSegments?: TranscriptSegment[]  // per-part file: segments của part đó
audioStartSec?: number                    // shared file: part bắt đầu ở giây nào
audioEndSec?: number
listenAgainSec?: number                   // mốc "Now listen again" trong part

// ListeningQuestion
audioAnchorSec?: number                   // (tuỳ chọn) câu này bắt đầu được nói ở giây nào
```

**c) Expose giây thô từ hook** (`useExamQuestionAudio.ts` hiện chỉ có `progressPct`, `timeLabel`):

```tsx
const [currentTime, setCurrentTime] = useState(0)
const [duration, setDuration]   = useState(0)
// trong syncTimeUi(): setCurrentTime(audio.currentTime); setDuration(audio.duration)
// return { ...cũ, currentTime, duration }
```

---

## Bug 1 — Công thức chuyển Part sai (shared audio 1 file)

**Vì sao 2 cách cũ sai:**

- *Chia đều audio* → giả định mỗi Part = `1/N` thời lượng. Sai vì Part 1 có example + hướng dẫn (~30%), Part 2 chỉ ~15%.
- *Clip time bằng startPct/endPct* → khi audio ra khỏi Part, `relTime` bị `Math.min(partDuration, …)` kẹp lại → mắc kẹt ở câu cuối, không bao giờ phát hiện transition.

**Giải pháp: lấy mốc Part thật từ transcript.** KET/PET luôn đọc câu mốc. Tái sử dụng đúng ý tưởng đã có trong `scripts/test-ket-split.py` (đang split theo `\bpart\s*N\b`) nhưng áp lên segment **có timestamp**:

```tsx
// Backfill 1 lần: suy ra audioStartSec cho từng Part từ segments
const CUES = [/\bpart\s+(two|2)\b/i, /\bpart\s+(three|3)\b/i, /\bpart\s+(four|4)\b/i, /\bpart\s+(five|5)\b/i]
function derivePartStarts(segments: TranscriptSegment[], partCount: number): number[] {
  const starts = [0] // Part 1 = 0 (hoặc segment nội dung đầu tiên sau intro)
  let cursor = 0
  for (let p = 1; p < partCount; p++) {
    const seg = segments.find(s => s.start > cursor && CUES[p - 1].test(s.text))
    const t = seg ? seg.start : starts[p - 1] // fallback: giữ mốc trước nếu không match
    starts.push(t); cursor = t
  }
  return starts
}
```

**Runtime detect Part (KHÔNG clamp):**

```tsx
function partIndexAtTime(starts: number[], t: number): number {
  for (let i = starts.length - 1; i >= 0; i--) if (t >= starts[i]) return i
  return 0
}
// Trong useAudioSync: nếu partIndexAtTime(...) !== currentIndex → onPartChange(newIndex)
```

Cho phép `currentTime` vượt biên Part → index tự tăng → transition xảy ra tự nhiên. Diệt cả hai sai lầm cùng lúc.

---

## Bug 2 — Content matching chỉ chạy Part 1 (câu Part 2–5 không được đọc)

Part 1: câu hỏi được đọc → match prompt ↔ segment OK. Part 2–5: câu hỏi không được đọc → match thất bại. Fallback wall-clock hiện tại không chính xác cho hội thoại liên tục.

**Chiến lược 2 tầng:**

**Tầng A — Anchor (ưu tiên, chính xác).** Nếu có `audioAnchorSec` cho câu hỏi → chọn câu có anchor lớn nhất ≤ `currentTime`. Cách suy anchor:

- Part 1: content-match prompt → `segment.start`.
- Part có đọc số thứ tự ("One.", "Six", "Question six") → match token số → anchor.

**Tầng B — Chia theo *nội dung nói*, không theo đồng hồ (fallback bền).** Với hội thoại liên tục:

```tsx
// (i) Duration-weighted: bỏ qua im lặng → tốt hơn wall-clock nhiều
function questionIndexInPart(segs: TranscriptSegment[], t: number, qCount: number): number {
  const spoken = segs.map(s => s.end - s.start)
  const total = spoken.reduce((a, b) => a + b, 0)
  let acc = 0
  for (let i = 0; i < segs.length; i++) {
    if (t < segs[i].end) break
    acc += spoken[i]
  }
  return Math.min(qCount - 1, Math.floor((acc / total) * qCount))
}
```

- **(ii) Gap-snapping** để tinh chỉnh: tìm `qCount-1` khoảng lặng lớn nhất trong Part làm ranh giới câu; chỉ dùng khi số gap "mạnh" ≈ `qCount-1`, ngược lại quay về (i).

<aside>
💡

**UX quan trọng:** highlight transcript LUÔN chạy (chỉ cần timing). Auto-chuyển câu chỉ bật khi độ tin cậy cao (Tầng A, hoặc gap rõ ràng). Part mơ hồ → giữ chuyển câu thủ công + gắn cờ `confidence` để tránh nhảy sai.

</aside>

---

## Bug 3 — "Now listen again" (mỗi recording phát 2 lần)

KET: "You will hear each recording twice." → trong mỗi Part: [pass1] "Now listen again" [pass1 lặp lại]. Ngưỡng gap cứng 3s không tổng quát.

**Giải pháp: phrase-first, gap-second, theo từng Part.**

```tsx
function detectListenAgain(segs: TranscriptSegment[]): number | null {
  // 1) Ưu tiên bắt câu nói mốc (bền nhất)
  const cue = segs.find(s => /(now\s+)?listen\s+again|hear .* again|second time/i.test(s.text))
  if (cue) return cue.start
  // 2) Fallback: gap lớn nhất quanh GIỮA part (ngưỡng thích nghi, không cứng 3s)
  const mid = segs.length ? (segs[0].start + segs[segs.length - 1].end) / 2 : 0
  let best = null, bestGap = 0
  for (let i = 1; i < segs.length; i++) {
    const gap = segs[i].start - segs[i - 1].end
    const nearMid = Math.abs(segs[i].start - mid) < (segs[segs.length-1].end - segs[0].start) / 3
    if (nearMid && gap > bestGap) { bestGap = gap; best = segs[i].start }
  }
  return bestGap > 2 ? best : null
}
```

**Runtime map pass2 → pass1:**

```tsx
// Nếu currentTime thuộc pass2, quy về vị trí tương đương pass1 để tính câu hỏi
const t = currentTime >= listenAgainSec
  ? partStartSec + (currentTime - listenAgainSec)  // pass2 → pass1
  : currentTime
```

Highlight transcript: pass2 có text giống hệt → highlight bản pass2 (đơn giản) hoặc map về pass1. Chỉ số câu **reset** ở pass2 (giống pass1) → nghe 2 lần không phá sync.

<aside>
✅

**Bộ lọc tự động kiểm tra Bug 3:** split đúng thì pass1 ≈ pass2 về thời lượng. Dùng bất biến này (|dur1 − dur2| < ε) làm sanity-check khi backfill nhiều đề KET (Cam1..Cam14) → tự phát hiện đề split sai.

</aside>

---

## Data flow (sau khi sửa)

```
useExamQuestionAudio → { currentTime, duration }   (MỚI: giây thô)
      │
useAudioSync(segments, parts, mode)
   ├─ shared 1 file: partIndexAtTime(currentTime) → onPartChange   (không clamp)
   ├─ per-part:      map listen-again (pass2 → pass1)
   ├─ question idx:  Tầng A anchor → else Tầng B duration-weighted + gap-snap
   └─ highlight:     segment chứa currentTime → .is-speaking + scrollIntoView
```

---

## Plan triển khai (theo bước, không kèm timeline)

**Bước 0 — Nền tảng & plumbing**

- Thêm `TranscriptSegment` + field timing trên `ListeningPart`/`ListeningQuestion`.
- Expose `currentTime`/`duration` từ `useExamQuestionAudio`.
- `transcribeAudio` → `verbose_json` + trả `segments`.

**Bước 1 — Nạp & lưu segments**

- Cập nhật script backfill: lưu segments; suy `audioStartSec` mỗi Part (cue-phrase, tái dùng logic `test-ket-split.py` trên timestamp); suy `listenAgainSec`; ghi Supabase + cache local. Cache để không transcribe lại.

**Bước 2 — Utils thuần (pure, test được)** → tạo `audioSyncUtils.ts`

- `partIndexAtTime`, `questionIndexInPart` (A/B), `detectListenAgain`, `mapPass2ToPass1`, `highlightSegmentAtTime`. Toàn hàm thuần → dễ unit test bằng fixture.

**Bước 3 — Hook + đấu dây** → tạo `useAudioSync.ts`

- Tiêu thụ utils; phát `onPartChange`; **debounce khi user thao tác tay** (tôn trọng điều hướng thủ công vài giây, tránh auto-sync "giành" với user).
- Đấu vào `ListeningKetTest.tsx` / `ListeningPetTest.tsx` / `ListeningFceTest.tsx`. Auto-chuyển câu **chỉ practice mode**; exam mode chỉ highlight (hoặc tắt hẳn).

**Bước 4 — Kiểm chứng** (xem mục dưới).

---

## Kiểm chứng (Verification)

- **Unit test (Vitest)** cho utils thuần với fixture segments trích từ vài đề KET thật: khẳng định `partIndexAtTime` nhảy đúng mốc, `detectListenAgain` cho đúng 1 split/part và `|dur1−dur2|` nhỏ.
- **Manual QA:** chạy 1 đề shared (Cam1) + 1 đề per-part (Cam5); xem Part tự chuyển đúng chỗ narrator nói "Part two", transcript highlight bám lời nói, pass2 map đúng, auto-chuyển câu chỉ ở practice.
- **Dev overlay:** vẽ mốc Part + split "listen again" lên thanh scrubber để mắt thường soi nhanh.
- **Type check:** `pnpm --filter web exec tsc --noEmit`.

---

## Phương án thay thế

| Tiêu chí | Auto-derive từ transcript (đề xuất) | Author thủ công mốc/anchor |
| --- | --- | --- |
| Độ chính xác | Cao cho phần có câu mốc; trung bình cho hội thoại | Rất cao |
| Công sức | Chạy 1 lần, tự scale mọi đề | Tốn công mỗi đề |
| Rủi ro | Sai khi Whisper nghe nhầm câu mốc | Gần như không |
| Tiêu chí | Segment-level timestamp (đề xuất) | Word-level timestamp |
| --- | --- | --- |
| Payload | Nhỏ | Lớn hơn |
| Content-match Part 1 | Đủ tốt | Mịn hơn |

**Khuyến nghị:** auto-derive + segment-level làm mặc định; cho phép **override thủ công** với đề cá biệt; bật word-level riêng cho Part 1 nếu cần match chính xác hơn.

---

## Bước tiếp theo cần bạn quyết

1. Xác nhận code cũ (`useAudioSync.ts`/`audioSyncUtils.ts`…) đang ở đâu — push lên `main` hay để mình dựng mới từ plan này.
2. Cho biết muốn mình **bắt tay code luôn** (mình sẽ mở PR nháp theo Bước 0→3 + unit test) hay chỉ dừng ở plan.