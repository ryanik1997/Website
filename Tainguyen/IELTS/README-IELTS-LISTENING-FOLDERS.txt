═══════════════════════════════════════════════════════════════
IELTS Listening — Cam 9–20 · Test 1–4 (48 đề)
═══════════════════════════════════════════════════════════════

Mỗi folder: Listening IELTS_Test{N}_Cam{X}/

── BẠN THẢ VÀO FOLDER (tối thiểu) ──

  listening.mp3          Bắt buộc — audio ~30 phút
  *.pdf                  Đề Listening (tên tùy ý, vd. IELTS_Test2_Cam10.pdf)
  Answer Key.pdf         Hoặc answer-key.txt (paste đáp án 1–40)

── TÙY CHỌN (Part 2 có map/diagram) ──

  map.jpg
  diagram.jpg
  a3.jpg                 Ảnh form Part 1 (nếu PDF có hình)

── AGENT / CHATGPT TẠO SAU ──

  exam_part1.json … exam_part4.json
  exam.json              (pnpm ielts:bundle)
  *.zip                  (pack import thử trong app)

── SỬA meta.json ──

  Đổi template từng part (p1-a3, p2-a6, p3-c3, p4-d1…) khi biết dạng đề.
  Xem: HDSD/Import Listening IELTS.txt · Giaodien/a1–a5, Part2-Listening/

── LỆNH SAU KHI CÓ JSON ──

  pnpm ielts:validate "IELTS/Listening IELTS_Test{N}_Cam{X}"
  pnpm ielts:bundle "IELTS/Listening IELTS_Test{N}_Cam{X}"

── ĐỀ ĐÃ CÓ SẴN exam.json (chưa bundle) ──

  Cam9 Test1, Cam20 Test1, Cam9 Test2 (pilot đầy đủ) — giữ nguyên;
  có thể migrate sang exam_partN.json sau.

Tổng: 12 sách (Cam 9–20) × 4 test = 48 folder.
