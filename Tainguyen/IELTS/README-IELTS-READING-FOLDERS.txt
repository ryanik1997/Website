═══════════════════════════════════════════════════════════════
IELTS Reading — Cam 9–20 · Test 1–4 (48 đề)
═══════════════════════════════════════════════════════════════

Mỗi folder: Reading IELTS_Test{N}_Cam{X}/

── BẠN THẢ VÀO FOLDER (tối thiểu) ──

  *.pdf / *.txt          Đề Reading (OCR text) + Answer Key 1–40
  answer-key.txt         Paste đáp án (mẫu có sẵn)

── TÙY CHỌN (diagram / table trong passage) ──

  part1-p0.jpg …         Ảnh đoạn văn (imageFile trong JSON)
  diagram.jpg

── AGENT / CHATGPT TẠO SAU ──

  exam_passage1.json … exam_passage3.json
  exam.json              (pnpm ielts:reading:bundle)
  *.zip                  (import thử trong app)

── SỬA meta.json ──

  Đổi template từng passage (r1, r2-headings, r3-ynng…) khi biết dạng đề.
  Xem: HDSD/Import Reading IELTS.txt · HDSD/Prompt-IELTS-Reading-Cam9-Cam20.txt

── LỆNH SAU KHI CÓ JSON ──

  pnpm ielts:reading:validate "IELTS/Reading IELTS_Test{N}_Cam{X}"
  pnpm ielts:reading:bundle "IELTS/Reading IELTS_Test{N}_Cam{X}"

── PILOT ĐÃ CÓ SẴN (pnpm ielts:reading:export-pilots) ──

  Cam 10 Test 1 — đề đủ 40 câu (mock ielts-reading-01)
  Cam 11 Test 3 — Passage 1 Matching Headings
  Cam 10 Test 4 — Passage 2 YNNG

Tổng: 12 sách (Cam 9–20) × 4 test = 48 folder.
