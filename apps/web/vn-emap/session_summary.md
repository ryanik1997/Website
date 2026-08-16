# Session Summary — VN-EMAP Designer (apps/web/vn-emap)

> File này tách riêng cho dự án VN-EMAP. Các session sau chỉ cập nhật file này, không ghi vào `Website/session_summary.md` gốc.
>
> **QUY TRÌNH QUAN TRỌNG: sau khi sửa `database.json` hoặc `packaging-db.json`, LUÔN chạy `node sync-inline-db.mjs` (trong thư mục vn-emap) trước khi commit — nếu quên, bản offline (file://) sẽ dùng dữ liệu cũ.**

## 2026-08-16 — Fix "nút Quét ngược bị lỗi"

- Chẩn đoán: KHÔNG có lỗi JS (đã test: input rác, min>max, rỗng, bấm liên tiếp — đều không throw). Nguyên nhân trải nghiệm: **mặc định form M2 là xà lách 300g 6°C túi 28×35 — case bất khả thi đã biết** → mở app bấm quét ngay là nhận "0 cấu hình", nhìn như hỏng.
- Fix: (1) mặc định rau M2 đổi sang **nấm rơm** (case có nghiệm — mở app bấm ngay ra 170 tổ hợp); (2) thông báo 0-cấu hình viết lại: nêu rõ case cụ thể, khẳng định "kết quả vật lý hợp lệ, không phải lỗi app", gợi ý thử theo thứ tự túi nhỏ hơn → khối lượng → rau → nhiệt độ.
- Lưu ý vận hành cho Ryan: nếu trình duyệt còn cache HTML/JS lệch phiên bản → Ctrl+F5 (hard refresh).

## 2026-08-16 — Cột "Khoảng số lỗ khả thi" cho quét ngược (giải thích "sao không thấy lỗ chi chít")

- Ryan hỏi vì sao bảng quét không ra số lỗ "chi chít" (hàng trăm lỗ). Nguyên nhân: bảng chỉ hiện 1 dòng/ổ (màng+D) với số lỗ NHỎ NHẤT đạt → toàn 0-vài lỗ.
- Đã thêm cột **"Khoảng số lỗ khả thi"** (min–max, bisect cả 2 đầu nhờ tính đơn điệu O2 theo n) + dòng tóm tắt mật độ chi chít tối đa khả thi. `findNMax()` dùng chung cho nhánh 0-lỗ và nhánh bisect.
- Kết quả minh hoạ: nấm rơm 300g 6°C D50/80 → OPP20+D50 khoảng **0–14 lỗ**, toàn dải tối đa 32 lỗ (màng kín nhất) — tức với sản phẩm này ở 6°C, "chi chít" VẬT LÝ không thể quá ~32 lỗ vì trần O₂ 15%. Muốn mật độ cao: D nhỏ hơn (50µm), rau thở mạnh/hơn khối lượng, hoặc nhiệt cao hơn.
- Verify Playwright: khoảng hiển thị đúng cả 2 nhánh; scan 271ms.

## 2026-08-16 — Vì sao quét ra 0 lỗ + thêm "Số lỗ tối thiểu" và cột mật độ

- Ryan hỏi vì sao bảng quét ra 0 lỗ. Giải thích: bảng sắp theo số lỗ tăng dần → dòng đầu = cấu hình ÍT lỗ nhất đạt mục tiêu KHÍ. Với nấm rơm 6°C, cửa sổ O₂ rất rộng (5-15%) và rau thở ít → **cả 170 cấu hình đều 0 lỗ** (mọi màng tự đạt, thêm lỗ đẩy O₂ vượt trần). 0 lỗ = tối ưu khí, không phải lỗi.
- Vì hướng sản xuất của Ryan là kim cơ chi chít (BẮT BUỘC có lỗ), thêm:
  - Ô **"Số lỗ tối thiểu"** (#m2ScanMin) — quét chỉ trả cấu hình đạt khí với ≥ N lỗ (bisect từ N; nếu N đã đẩy O₂ vượt trần thì loại cặp film+D với thông báo giải thích rõ).
  - Cột **"Mật độ (lỗ/cm²)"** trong bảng kết quả cạnh "Số lỗ (tổng túi)" — cặp thông số giao xưởng.
- Verify: min=20 D50/D80 nấm rơm → 19 cấu hình (PE-REF-50 D50×20 O₂ 14.98%...); min=100 D80 → 0 với thông báo gợi ý giảm min/D. Nút "Dùng" vẫn điền tổng số lỗ.
- Bài học: nấm rơm/cửa sổ rộng → max lỗ khả thi bị chặn bởi trần O₂; lỗ "chi chít" hàng trăm chỉ khả thi với D nhỏ (50µm) hoặc rau thở mạnh/nhiệt cao.

## 2026-08-16 — Nâng cấp quét ngược M2 cho đục kim cơ mật độ cao ("chi chít")

- Ryan thông báo hướng phát triển bao bì: **đục lỗ kim cơ mật độ cao** (như túi salad ngoại) → nâng cấp M2:
  - Thêm 2 ô cấu hình quét: **danh sách D lỗ tự nhập** (mặc định 80-200µm, kim cơ nhập 200-1000) + **số lỗ tối đa** (mặc định 400, cho tới 5000 — mật độ "chi chít" 1000-3000 lỗ).
  - Thay thuật toán quét: `findAllConfigs` tuyến tính (bước 5, max 400) → **bisect + refine mịn từng lỗ** trong packaging.js (dựa trên tính đơn điệu O2 theo số lỗ; engine.js vẫn không đụng). Chấp nhận tempProfile (lọc peak như cũ).
- Kết quả phụ tốt: scan mặc định nấm rơm giờ ra **170 cấu hình (trước 55) trong 73ms** — bước 5 cũ bỏ sót các cấu hình số lỗ nhỏ không chia hết cho 5.
- Giá đỗ 300g 8°C với D 200-800 + max 2000 lỗ + tech kim cơ: **vẫn 0** — đúng vật lý (CO2/O2 selectivity của lỗ quá kém, đã phân tích từ plan Feature B), không phải lỗi quét. Giảm khối lượng hoặc nhiệt độ là lối thoát.
- Test Playwright: default scan ✓; kim cơ scan (Ds 200-800, max 2000, tech pin) chạy không lỗi ✓; nút "Dùng" điền lại form + sticky cập nhật ✓.

## 2026-08-16 — Case "Quét ngược trả 0": xà lách 300g 6°C túi 28×35 (KHÔNG phải bug)

- Ryan báo lỗi khi quét ngược M2: xà lách 300g · 6°C · túi 28×35 2 mặt → 0 cấu hình.
- Đã kiểm chứng bằng Node **quét mịn từng lỗ (bước 1)** trên cả 35 màng: vẫn 0 → không phải do lưới quét thô (bước 5) mà là **bất khả thi vật lý thật**: ở 6°C xà lách hô hấp thấp, diện tích màng túi 28×35 quá lớn → kể cả màng kín nhất (PET/PE 62µm) O2 sau 72h vẫn ≥5%, không xuống nổi dải mục tiêu 1-3%; kín hơn nữa thì CO2 >10%.
- **2 giải pháp chạy được (đã verify Node)**: (1) **giảm túi còn 20×25cm** cùng 300g → 45 cấu hình, tốt nhất CPP-REF-30 · 0 lỗ · O2 2.06/CO2 8.62; (2) **tăng khối lượng 500g** cùng túi → 5 cấu hình, tốt nhất CPP-REF-40 · 0 lỗ · O2 2.56/CO2 9.75. Nguyên tắc: giảm diện tích màng / tăng tỷ lệ rau-thể-tích để bao bì "kín" đủ cho rau thở ít ở 6°C. Lưu ý 0 lỗ = màng tự đủ, không cần đục.
- Nhiệt độ 10°C: vẫn 0 (R tăng nhưng G màng cũng tăng theo nhiệt).

## 2026-08-16 — Chuẩn bị audit cho Deepseek (READY — chờ kết quả)

- Ryan giao việc gì đó cho Deepseek làm trên dự án này; tôi đóng vai trò **audit** kết quả.
- Đã tạo: `AUDIT_checklist.md` (quy tắc bắt buộc + 5 test hồi quy Node + 12 điểm kiểm tra UI + quy trình) và `audit-baseline/` (snapshot 8 file hiện tại để diff chính xác — thư mục vn-emap chưa được git track nên không dùng git diff được).
- Baseline đã chốt: checksum SHA-256 (16 ký tự) từng file + 4 số liệu engine tham chiếu (MAP O2 18.861/CO2 2.337; nam_rom 15 / gia_do 0 / xa_lach-abuse 10 configs). Nếu Deepseek không đụng engine, các số này phải ra Y HỆT.
- Khi Deepseek giao kết quả: chạy checksum tìm file đổi → diff với audit-baseline → chạy lại test mục 2-3 trong AUDIT_checklist.md → đối chiếu quy tắc mục 1 → kết luận PASS/FAIL có chứng cứ, ghi vào session_summary.

## 2026-08-16 — Mở rộng thư viện film lên 35 + filter & thu gọn danh sách (DONE)

- **Thêm 24 film tham chiếu** (tổng **35**): monolayer BOPP 15/20/30/40µm, CPP 25/40, PE 30/60/70/80, LLDPE 25/70/100, LDPE 25/50/60, PP 25/40 + laminate PET/PE 12+40 & 12+60, BOPP/CPP 18+25, BOPP/PE 20+30, 20+40, 15+40. Monolayer scale nghịch đảo theo độ dày từ giá trị cơ sở; **laminate tính bằng điện trở nối tiếp từng lớp** (PET12 cơ sở OTR 80/CO2 350/WVTR 12) — nhất quán nội bộ. Chuẩn hoá lại 2 laminate cũ theo cùng công thức (PETPE-12-50: 78.4/344/6.4; BOPPCPP-20-30: 823.5/2908/3.3). Tất cả confidence=literature. Đã chạy sync-inline-db.mjs (index.html → 133.9 KB).
- **UI M1**: hàng filter cho bảng film — tìm theo ID/cấu trúc/chất liệu (text) + dropdown chất liệu (11 loại) + dropdown confidence (6 mức) + đếm "Hiển thị X/Y film (đang lọc)"; nút **Thu gọn/Mở rộng danh sách** (ẩn/hiện cả bảng). Filter chỉ áp bảng danh sách — dropdown M2 vẫn thấy đủ 35 film.
- Verify Playwright: 35/35 hiển thị; lọc "BOPP" → 10; lọc PET/PE → đúng 3 PETPE; lọc literature → 35; thu gọn/mở lại hoạt động; M2 dropdown 35.

## 2026-08-16 — Thêm 8 film tham chiếu ngành vào packaging-db.json (DONE)

- Theo yêu cầu Ryan: 1 bộ film phổ biến (CPP, PE, LLDPE, LDPE, PP unoriented, BOPP + 2 màng ghép PET/PE và BOPP/CPP) theo số liệu tham khảo ngành, đúng format packaging-db.json. Tất cả confidence=`literature`, source ghi rõ *"giá trị điển hình theo độ dày (biến động theo grade/nhà sản xuất), cần supplier confirm"* — không tự nói là số đo thật.
- Giá trị (23°C): CPP-REF-30: OTR 1400/CO₂ 4600/WVTR 7.5 · PE-REF-50: 4000/16000/9.0 · LLDPE-REF-50: 7000/26000/11 · LDPE-REF-40: 4800/19000/10 · PP-REF-30: 1800/6000/8.5 · BOPP-REF-25: 1600/4000/4.5 · PETPE-12-50 (62µm): 55/220/6.0 · BOPPCPP-20-30 (50µm): 700/2100/2.8.
- Đã chạy `node sync-inline-db.mjs` (index.html 84→97.9 KB). Verify Playwright: M1 hiển thị 11 films (3 seed + 8 ref) ✓; PET/PE dùng được trong M2 (giá đỗ: O2 10.95%) ✓; quét ngược nấm rơm: 55 configs trên 11 màng, kết quả chứa đủ film mới ✓.

## 2026-08-16 — Calibration plan: Việc A làm xong, Việc B KHÔNG khả thi (báo cáo đúng spec)

- Theo `1. MAP/VN-EMAP_calibration_plan.md`. **Việc B (đối chiếu Excel A/B với đèn cảnh báo): KHÔNG làm** — đã đọc `WinEco_Test_ThamThoi_Goc_Cai.xlsx` (3 sheet): cột "Chi tiết xử lý" chỉ là text tự do ("Cắt góc 1cm"), KHÔNG có cột cấu trúc độ dày màng/số lỗ/D lỗ → không tái tạo input cho integrate() được. Excel cần bổ sung cột số liệu cấu trúc (quyết định của Ryan, agent không tự sửa file).
- **Việc A (hiệu chỉnh Km_O2/k_CO2_uc_che từ trial M4): ĐÃ TRIỂN KHAI** trong panel M4 — nút "ĐỀ XUẤT HIỆU CHỈNH" (khóa khi trial <3 mốc đo có đủ O2+CO2), grid search đúng spec (Km 0.5-6 bước 0.25 × k_CO2 3-20 bước 1 = 414 tổ hợp, nội suy đường cong tại đúng giờ đo, RMSE O2+CO2). Chỉ ĐỀ XUẤT + xuất .txt — KHÔNG có nút tự động áp dụng; hiển thị cảnh báo số trial độc lập cùng rau (khuyến nghị ≥3-5).
- **Chưa có trial M4 THẬT nào có số đo O2/CO2** → tính năng chưa được chạy trên dữ liệu thật. Việc cần làm trước: đo O2/CO2 thật (giá đỗ ưu tiên) và nhập vào M4.
- Kiểm chứng THUẬT TOÁN bằng dữ liệu TỔNG HỢP (sinh từ engine Km=2.5/k=9, KHÔNG phải số đo thật): Node grid search tìm lại đúng Km=2.5, k=9.0, RMSE 0.000 (308ms); RMSE với giá trị mặc định = 1.074% → phân biệt được đúng/sai. Playwright UI: khóa 0/2 mốc, mở khi 5 mốc; với nhiệt độ trial khớp (8°C) UI cũng ra đúng Km=2.5 RMSE 0%. **Lưu ý độ nhạy phát hiện**: trial ghi 6°C nhưng số đo sinh ở 8°C → đề xuất lệch (Km=1.25) — nhiệt độ trong trial phải ghi đúng điều kiện đo thật. Xuất .txt `VNEMAP_calibration_<trial>_<ts>.txt` ✓.
- Test params tái lập (Node): {veg:'gia_do', massG:300, tempC:8, filmKey:'OPP_25micron', sides:2, bagW:28, bagL:35, freeVolML:0, nHoles:6, holeD_um:100, tech:'laser'}; số đo tổng hợp ngày [0.5,3,5,7,10] = O2 [16.755, 9.663, 8.259, 7.780, 7.559]%, CO2 [4.565, 11.874, 13.078, 13.385, 13.455]%.

## 2026-08-16 — Fix fallback offline: nhúng đủ 72 rau vào index.html (DONE)

- Theo `1. MAP/VN-EMAP_offline_fallback_fix.md`: thay fallback 7 rau gõ tay bằng **bản nhúng nguyên văn** database.json + packaging-db.json vào index.html qua `<script type="application/json" id="db-inline">` / `#pkgdb-inline`.
- `app.js loadDB()`: fetch → inline (`DB_SOURCE='inline'`, banner ℹ xanh "chế độ offline — đầy đủ chức năng") → object 7 rau cũ làm lưới an toàn cuối (`DB_SOURCE='hardcoded_minimal'`, banner ⚠ vàng chỉ ở nhánh này). Expose `window.VNEMAP_DB_SOURCE` để kiểm tra.
- `packaging.js loadPackDB()`: fetch → inline → fallback rỗng (chỉ cảnh báo khi cả 2 thất bại).
- Script mới `sync-inline-db.mjs`: đồng bộ cả 2 JSON vào index.html, validate JSON trước khi nhúng, idempotent (chạy 2 lần không nhân block), tự chèn block nếu chưa có.
- Kiểm chứng file:// (Playwright): `DB_SOURCE=inline`, dropdown **72 rau**, 11 material chips + 3 film seed, M2 tính được (O2 16.99%), banner ℏ info hiện, banner rút gọn = 0. Ảnh: `screenshots/offline_banner_72rau.png`, `offline_72rau_panelA.png`.
- Kiểm chứng HTTP: `DB_SOURCE=fetch`, 72 rau, không banner (ưu tiên fetch khi có server).
- Kích thước: index.html **45.8 KB → 84.0 KB** (+38 KB ≈ đúng dung lượng 2 file JSON 36+4 KB — như dự đoán của plan, không bất thường).
- Grep đối chiếu: `"ten_hien_thi"` trong #db-inline = **72** (khớp database.json); nội dung block khớp nguyên văn 100% với file gốc (so chuỗi).

## 2026-08-16 — Checklist "final" trước khóa sổ (DONE — 5/5 mục đạt)

1. **Offline fallback**: chọn phương án banner (không nhúng 72 rau vào app.js — tránh phình file + lệch dữ liệu). `loadDB()` catch → chèn banner vàng rõ ràng "Đang dùng dữ liệu RÚT GỌN (7 rau...)" + hướng dẫn mở qua HTTP server; `packaging.js loadPackDB()` catch → cảnh báo tương tự trong panel M1. Playwright file://: banner hiện, veg = 7 ✓ (screenshot `checklist_1_offline_banner.png`).
2. **Field chết engine.js**: đã xác nhận không ai đọc (grep) → xoá 8 key `: null` (G_total_O2/G_total_CO2/G_total_H2O/G_holes_O2/G_film_O2/areaTotal_m2/A_film_m2) khỏi return của `integrate()`. `buildConductances()` giữ nguyên.
3. **Regression toàn bộ A+B (Node, sau khi xoá field)**: A1 backward-compat KHỚP TUYỆT ĐỐI (O2 18.861/CO2 2.337, const = flat profile) ✓; A2-beta phi đơn điệu KHÔNG ĐỔI (nhiệt 6→25→6: CO2 đỉnh 6.814% @h15.1 > cuối 2.338%) ✓; B1 nam_rom = **15 configs** min OPP20/D80/0 lỗ O2 12.778/CO2 6.973 (khớp verify ban đầu) ✓; B2 gia_do = **0 configs** + near-miss 7.649/12.407/score 2.407 (khớp) ✓; B3 xa_lach abuse = **10 configs** top O2 1.65/CO2 8.907/peakCO2 11.36 (khớp) ✓. `optimizeHoles`/`findAllConfigs` vẫn nhận tham số db gốc — mergedFilmsDB chỉ tồn tại riêng trong packaging.js, không ảnh hưởng. Cả bộ 550ms.
4. **UI giữ dữ liệu**: M2 (veg/mass) giữ qua sub-tab M2↔M4 và app-tab Pack↔Map ✓; M4 giữ mã trial ✓; MAP giữ 77 lỗ qua đổi mode xuôi/ngược + kpiO2 tính lại 18.70% ✓.
5. **Print/PDF sau redesign**: emulate print media — printSheet hiện đúng, sticky strip + toàn bộ nội dung khác ẩn đúng, bảng spec 12 hàng ✓; nút Xuất PDF (jsPDF) tải file OK ✓.

## 2026-08-16 — UI Redesign theo `1. MAP/VN-EMAP_UI_Redesign_plan.md` (DONE)

- **1.1 Sub-tab M1-M5**: viewPack chia 5 container `msub1..5` + thanh pill-nav `sub-tabs` (sticky top:38px dưới sticky strip); `setPackMilestone()` trong packaging.js theo đúng pattern setMode (display:none, giữ DOM). Panel Micro-perforation (M1) di chuyển vào msub1. **Chiều cao tab Pack: 5.799px → 1.120–1.364px mỗi milestone (~77% giảm)**.
- **1.2 Sticky status strip**: `#stickyStrip` sticky top:0 dưới header — đèn trạng thái + O2/CO2/RH + dòng cấu hình hiện tại (font mono); cập nhật từ `runCalc()` (app.js, MAP) và `m2Run()` (packaging.js, M2) — chỉ đẩy kết quả có sẵn, không tính toán mới. Xác nhận dính đúng khi cuộn (top=0 tại scroll 1500px).
- **1.3 Accordion** (`<details class="acc">` đóng mặc định): MAP panel D (Ghi chú lô), E (Kịch bản), khối profile nhiệt độ động; M1 form Thêm/sửa Film.
- **2 Visual polish**: chuẩn hoá `.panel{padding:16px 18px}` + rule `.panel h3` (bỏ toàn bộ inline style h3); zebra striping `.result-table tbody tr:nth-child(even)`; tách nút: `.btn-acc` (accent) cho 8 hành động chính (TẠO TRIAL/RFQ, QUÉT NGƯỢC, 3 nút M3, LƯU NCC, THÊM MỐC ĐO), `btn-line` chỉ còn hành động phụ. Không đổi màu/font/đèn tín hiệu (đúng mục 3 KHÔNG làm).
- **Không sửa engine.js hay logic tính toán** — chỉ cấu trúc HTML/CSS + code hiển thị (thêm block đẩy sticky trong runCalc/m2Run).
- Kiểm chứng giữ dữ liệu qua sub-tab (plan §5): điền M2 (OPP-002/nấm rơm/40 lỗ) → chuyển M5 → M2: film/veg/dens/KPI giữ nguyên ✓. Regression: slider MAP cập nhật sticky real-time, Feature B chạy, MAP tab 1.872→1.633px.
- **Screenshots trong `apps/web/vn-emap/screenshots/`**: `before_map_full.png`, `before_pack_full.png` (5799px), `after_1.2_sticky_map.png`, `after_1.2_sticky_scrolled.png` (sticky top=0 khi cuộn), `after_1.1_subtabs_m2.png`, `after_1.3_accordion_map.png`, `after_map_full.png`, `after_pack_m2_full.png`.
- Lưu ý: nút sub-tab mặc định M1; chuyển sub-tab cuộn về đầu trang.

## 2026-08-16 — Milestone M5: Supplier & RFQ Generator (DONE) — HOÀN TẤT 5 MILESTONE

- Panel "M5 · Supplier & RFQ" — hoàn thành milestone cuối theo `1. MAP/Task_1.txt` (Phase 11-12).
- **Supplier profile**: CRUD nhà cung cấp lưu localStorage `vnemap_suppliers_v1`; seed 1 bản "Law Packaging" chỉ có tên — capability (film, đục lỗ, độ dày min, khổ max, khoảng D lỗ, in ấn, hàn, báo giá) để trống cho người dùng điền từ supplier (không tự bịa). Trạng thái mẫu 5 mức (Chưa yêu cầu → Đã yêu cầu → Đã nhận mẫu → Đang test (M4) → Đã duyệt) hiển thị ngay trên chip danh sách; trường liên kết mã trial M4; thêm nhiều NCC để so sánh.
- **RFQ Generator**: nút "TẠO RFQ TỪ M2" sinh văn bản RFQ đầy đủ 11 mục (sản phẩm, film, độ dày, lỗ D×số+lỗ/cm²+lỗ/m²+pattern+tech, túi, nhiệt độ bảo quản, **yêu cầu khí hiệu dụng của bao bì** từ M3 kèm phân tách màng/lỗ + cảnh báo "≠ OTR màng nguyên", yêu cầu hàn kèm cửa nhiệt theo chất liệu từ M3_CFG, in ấn, MOQ, yêu cầu mẫu A/B test có trỏ mã trial M4 nếu có). COPY vào clipboard + TẢI XUỐNG .txt.
- Sửa trong lượt: dòng yêu cầu hàn RFQ không lấy được chất liệu với màng native (label không có material) → lấy từ film M1 hoặc suy từ label + tra cửa nhiệt SEAL_WINDOWS.
- Validate Playwright: seed Law Packaging 1 chip ✓; cập nhật capability + lưu (chip hiện "Đã yêu cầu") ✓; thêm NCC thứ 2 + chuyển qua lại giữ dữ liệu ✓; RFQ sinh đúng cấu trúc (dòng 7 tách màng/lỗ, dòng 8 "Heat seal — cửa nhiệt OPP: 130–145°C", pattern tiếng Việt đầy đủ) ✓; COPY ✓; download `RFQ_vnemap_2026-08-16.txt` ✓; reload giữ NCC/trial/film ✓; regression M2 + MAP tab OK ✓.
- Trạng thái chung: **M1 (data model) + M2 (designer) + M3 (engineering) + M4 (trial/shelf-life) + M5 (supplier/RFQ) — tất cả xong.** Việc tiếp theo tự nhiên: đo thực nghiệm thay ước tính (film OTR, cửa nhiệt hàn, dữ liệu rau theo archetype), xuất PDF spec/trial, backup/xuất nhập localStorage sang JSON file.

## 2026-08-16 — Milestone M4: Trial / Experiment + shelf-life (DONE)

- Panel "M4 · Trial / Experiment" — quản lý trial + nhập kết quả đo + dashboard so sánh đo/mô hình + kết luận shelf-life. Không sửa engine.js.
- **Tạo trial từ M2**: nút "TẠO TRIAL TỪ M2" chụp toàn bộ thiết kế (rau, film + label, túi, D/số lỗ/mật độ/pattern/tech, nhiệt độ, khối lượng) vào trial có mã (tự sinh hoặc nhập, VD LP-001). Lưu localStorage `vnemap_trials_v1`.
- **Nhập mốc đo theo ngày**: O2, CO2, nhiệt độ, RH, trọng lượng (tự tính % mất nước), ngưng tụ (none/light/heavy), màu/kết cấu/mùi/chất lượng tổng thể (1-5), ghi chú. Nhập lại cùng ngày = cập nhật.
- **Dashboard**: biểu đồ Chart.js — điểm chấm = số đo, đường nét đứt = mô hình (integrate 12 ngày trên cùng cấu hình trial); tính độ lệch O2 mô hình vs đo trung bình.
- **Kết luận shelf-life**: shelf = mốc xa nhất thỏa chất lượng ≥3/5 (ngưỡng M4_CFG.QUALITY_MIN) VÀ CO2 ≤ ngưỡng cảnh báo VÀ O2 ≥ 1%; phân biệt rõ "Kết quả ĐO thực nghiệm" ≠ dự đoán mô hình; gợi ý đo thêm mốc nếu chưa thấy giới hạn.
- Bug sửa: sau reload không tự chọn lại trial (`curTrial = -1`) → giờ mở trial gần nhất.
- Validate Playwright (1 phiên đầy đủ): tạo LP-001 (nấm rơm 300g, OPP 25µm, 5 lỗ D100µm, 6°C) → 5 mốc ngày 0/3/5/7/10 → kết luận "shelf life ≥ 10 ngày, độ lệch O2 mô hình vs đo 2.71%" ✓; reload giữ nguyên trial + tự chọn ✓; xoá mốc 10 → ≥7 ngày ✓; sửa mốc 7 visual=2 → "ước tính 5 ngày, mốc đầu không đạt: ngày 7" ✓; xoá trial ✓.
- Test params tái lập: mốc đo [{0,20.9,0.04,295g,5},{3,12.5,6.0,290,5},{5,10.2,7.0,286,4},{7,9.0,7.6,283,3},{10,7.8,8.2,280,4}] (ngày, O2%, CO2%, trọng lượng, visual).
- Chưa làm: M5 (Supplier profile + RFQ Generator); xuất trial ra CSV/PDF.

## 2026-08-16 — Milestone M3: Engineering — khí hiệu dụng · ẩm · hàn (DONE)

- Panel "M3 · Engineering" trong tab Packaging Development Lab, tính trên cấu hình đang chọn ở form M2 (film/túi/lỗ/mật độ/nhiệt độ). KHÔNG sửa engine.js; ngưỡng để trong `M3_CFG` ở packaging.js (không hard-code engine).
- Khối 1 — Effective package gas transfer (đúng nguyên tắc Film OTR + micro-hole transport = package transfer): bảng O₂/CO₂/H₂O với 3 cột qua màng / qua lỗ / tổng (đơn vị túi.ngày), % đóng góp của lỗ, quy đổi /m².ngày; dùng `E.buildConductances()`.
- Khối 2 — Moisture & condensation: nhập số ngày + RH môi trường → RH trong túi (cân bằng/max từ `integrate()`), mất nước tích lũy (g + % khối lượng), hơi nước dư/ngưng tụ tiềm năng, badge 🟢 LOW / 🟡 MODERATE / 🔴 HIGH theo ngưỡng RH 90/95 (M3_CFG). Ghi chú rõ: mất nước là CẬN TRÊN (transpiration chưa khớp RH trong túi — hạn chế của engine hiện có).
- Khối 3 — Sealability: kiểu hàn (heat/impulse/hot bar/ultrasonic) + nhiệt độ/thời gian/áp lực/bề rộng; bảng cửa nhiệt hàn theo chất liệu (M3_CFG.SEAL_WINDOWS, literature) → 🟢 SUITABLE / 🟡 NEEDS OPTIMIZATION (±10°C) / 🔴 NOT RECOMMENDED; material CUSTOM → cảnh báo dùng theo supplier.
- Bug nghiêm trọng sửa trong lượt: film seed OPP-001..003 bị dedupe về màng gốc nhưng `m2Params` vẫn map sang `PKG_OPP_00x` không tồn tại → chọn film seed trong M2/M3 bị báo "thiếu dữ liệu" oan. Fix: bảng `filmAlias` (film_id → key db2, trỏ native khi trùng chữ ký), `filmKeyOf()` dùng chung cho M2/M3.
- Validate Playwright: OPP-002 (alias) tính được O2 8.84% ✓; CPP-001 (OTR 3200/6800/9) EFF: O2 màng 349.5 + lỗ 889.8 = 1239.3 mL/túi.ngày (72% qua lỗ) với 20 lỗ D=50µm ✓; ẩm túi kín OPP-002 + giá đỗ: RH 89%, mất nước 125g/7ngày (cận trên, đã ghi chú) ✓; seal CPP: 130°C=🟢, 155°C=🟡, 165°C=🔴 ✓; CUSTOM=⚠ ✓; regression M2 scan 20 configs/4 màng + MAP tab OK.
- Chưa làm: M4 (Trial/shelf-life), M5 (Supplier/RFQ); cửa nhiệt hàn SEAL_WINDOWS là literature — cần supplier confirmed.

## 2026-08-16 — Milestone M2: Packaging Designer (DONE)

- Panel mới "M2 · Packaging Designer" trong tab Packaging Development Lab — bridge film M1 vào engine MAP v3 (KHÔNG sửa engine.js).
- Chức năng: chọn sản phẩm (72 rau, optgroup) + film từ M1 + túi (W/L/mặt đục/freeVol) + lỗ (D preset 50-200µm + Custom) + mật độ 3 kiểu nhập (total / cm² / m²) + pattern + tech → nút TÍNH BAO BÌ chạy `integrate()` và hiện KPI O2/CO2/RH/t90 + banner trạng thái ĐẠT/CẢNH BÁO/NGUY HIỂM + spec text tổng hợp.
- `mergedFilmsDB()`: gộp màng gốc + film M1 có đủ OTR/CO₂TR/WVTR thành db cho engine; OTR đo ở nhiệt độ khác 23°C được chuẩn hóa về 23°C bằng hệ số Arrhenius 1.035; **khử trùng theo chữ ký** (thickness+OTR+CTR+WVTR) để seed OPP-001..003 không tạo bản sao trùng của OPP gốc; film thiếu dữ liệu bị `disabled` trong select M2 và bị chặn khi tính.
- Nút QUÉT NGƯỢC chạy `findAllConfigs()` trên **tất cả film trong hệ thống** (màng gốc + M1); nút "Dùng" điền ngược về form M2.
- Sửa trong lượt: bug renderM2 rebuild `#m2Film` làm mất lựa chọn hiện tại (render trễ từ poll VNEMAP_DB hoặc sau khi lưu film) → giờ giữ lại `prevSel`.
- `app.js`: thêm 1 dòng expose `window.VNEMAP_DB` sau loadDB cho module M2 dùng chung.
- Validate Playwright: film thiếu OTR bị disable ✓; CPP-001 (OTR 3200/CTR 6800/WVTR 9, supplier_confirmed) tính được O2/CO2 ✓; scan nấm rơm 300g 6°C = 20 configs trên 4 màng (không trùng) ✓; "Dùng" điền đúng D/số lỗ + banner ĐẠT ✓; mật độ cm²→total quy đổi đúng (1/cm² × 1960cm² = 1960 lỗ) ✓; regression MAP tab OK.
- Test params tái lập: film CPP-001 {OTR 3200, CO2TR 6800, WVTR 9 cm3|g/m2.day @23°C, thickness 30µm}; veg nam_rom, 300g, 6°C, túi 28×35cm 2 mặt; kết quả quét: 20 cấu hình, min = OPP 20µm / D80µm / 0 lỗ.
- Chưa làm: M3 (engineering OTR/CO2TR/WVTR + moisture + seal), M4 (Trial/shelf-life), M5 (Supplier/RFQ); M2 chưa hỗ trợ tempProfile động (chỉ temp cố định — dùng MAP Calculator cho profile).

## 2026-08-16 — Task_1 / Milestone M1: Packaging Development Lab — Data model (DONE)

- Triển khai M1 theo `1. MAP/Task_1.txt` (khuyến nghị: Materials + Films + Perforation, không làm cả 12 phase). KHÔNG sửa engine.js hay Feature A/B của MAP Calculator.
- File mới:
  - `packaging-db.json` — schema seed: 11 material types (BOPP/CPP/PE/LLDPE/LDPE/PP/OPP/PET-PE/BOPP-CPP/BOPP-PE/Custom), 3 film OPP seed (migrate từ mang_OPP, confidence=literature, các trường chưa đo = null), perforation schema (diameters 50-200µm + 8 patterns).
  - `packaging.js` — module M1: validation (`validateFilm`: bắt buộc material/thickness>0/confidence; OTR/CO2TR/WVTR dạng {value,unit,temp,rh,method,source}, value trống → null KHÔNG tự bịa), CRUD film lưu localStorage overlay đè seed theo film_id (`vnemap_packfilms_v1`), density converter (total ↔ holes/cm² ↔ holes/m² theo diện tích túi × số mặt), pattern preview canvas (uniform/center/edge/top/bottom/side/zone/custom, cap 400 chấm).
- `index.html`: nav tab 2 view "MAP Calculator (v3)" / "Packaging Development Lab (M1)"; view M1 gồm panel Materials+Films (form đầy đủ trường theo spec Task_1, bảng danh sách có badge Data confidence 5 mức) + panel Micro-perforation (D preset + Custom, converter, pattern + preview). Warning box nhấn mạnh "Film OTR ≠ package OTR".
- Sửa trong lượt: index.html thiếu 1 thẻ `</div>` trong vùng viewMap (lỗi có sẵn từ trước, browser tự đóng nên chưa thấy) làm viewPack bị lồng vào viewMap → DOM 0×0 không tương tác được; density converter bỏ heuristic activeElement, truyền id ô nhập từ oninput.
- Validate Playwright (qua HTTP server): 11 chips, 3 film seed; thêm film BOPP confidence supplier_confirmed với OTR null → hiển thị "null" 3 ô ✓; validation chặn thiếu material ✓; converter đúng cả 3 chiều (2 lỗ/cm² × 980cm² = 1960 lỗ = 20.000/m²; 15.000/m² = 1.470 lỗ; 50 lỗ 2 mặt = 0,026/cm²) ✓; canvas preview vẽ ✓; custom D 65µm ✓; regression: MAP tab 72 rau/3 màng/Feature B vẫn chạy ✓.
- Chưa làm (để milestone sau theo Task_1): M2 Packaging Designer (bridge film từ M1 vào engine tính xuôi/ngược), M3 OTR/CO2TR/WVTR engineering + moisture + seal, M4 Trial/shelf-life, M5 Supplier/RFQ.

## 2026-08-16 — Import 65 loại rau từ cac_loai_rau.txt (DONE)

- Thêm 65 loại rau từ `1. MAP/cac_loai_rau.txt` vào `database.json` (72 tổng, giữ nguyên 7 gốc + 3 màng OPP). File chỉ có tên + nhóm → mỗi loại được **ánh xạ về nhóm nguyên mẫu** (xà lách/cải/rau-dây/gia vị/rau mầm/giá đỗ/bông cải) + 2 nguyên mẫu mới định nghĩa: rau ăn quả (R=10, O2 3-6%, CO2≤5%) và rau ăn củ (R=6, O2 2-5%, CO2≤6%). Field `do_tin_cay: "Ước tính theo nhóm nguyên mẫu — chưa đo thực nghiệm"` hiển thị trong vegNote.
- Script tái lập: `import-rau.mjs` (`node import-rau.mjs`) — dedupe tên (file có Cà chua đỏ x5, Ớt ngọt x2...), chuẩn hóa NFC/NFD (file trộn 2 dạng Unicode làm nhóm bị tách đôi), luật theo-tên chỉ áp cho nhóm "Rau ăn lá".
- `app.js`: dropdown rau gom theo `optgroup` theo trường `nhom` (7 nhóm); vegNote hiện cảnh báo độ tin cậy cho entry ước tính.
- Fix trong lượt: `window.applyPreset = applyPreset` (hàm đã xoá) gây ReferenceError làm chết init → dropdown rau/màng rỗng không chọn được.
- Sự cố đã xử lý: khi reset lần 1 vô tình xoá sạch 7 rau gốc (chúng cũng có `do_tin_cay` không rỗng); dựng lại từ fallback inline trong app.js (bản đúng cho engine v3; file `1. MAP/VN-EMAP_database.json` là bản v1 cũ thiếu field). Script reset giờ chỉ xoá entry có `do_tin_cay` khác rỗng.
- Validate Playwright qua http://localhost: `72 options / 7 optgroups`; mapping kiểm tra đúng (rau mầm R=70, cải R=40, xà lách R=15, hành tây R=6, súp lơ R=42); chế độ tìm ngược & trường hợp rỗng + near-miss hoạt động.
- Lưu ý vận hành: mở qua `file://` trình duyệt chặn `fetch('database.json')` → app tự dùng fallback 7 rau cũ. Muốn thấy đủ 72 loại phải mở qua HTTP server (vd `python -m http.server`).

## 2026-08-16 — Feature B: Tìm ngược cấu hình (DONE)

- Triển khai Tính năng B theo plan `1. MAP/VN-EMAP_v3_FeatureB_plan.md`.
- `engine.js`: `findAllConfigs()` + `findNearMisses()` (không sửa `optimizeHoles()` cũ).
- `app.js`: `setMode('forward'|'reverse')` toggle 2 chế độ (ẩn panel B/C khi tìm ngược), `runReverse()` quét 3 màng × 5 đường kính (80/100/120/150/200µm) × 0-400 lỗ bước 5 (1215 tổ hợp) với spinner, bảng kết quả (Màng/Đ-lỗ/Số lỗ/O2 CB/CO2 CB/O2 peak/CO2 peak/t90) + nút "Dùng cấu hình này" (`useConfig()`) tự điền vào form Tính xuôi.
- Trường hợp rỗng: thông báo đúng spec + bảng 5 cấu hình gần đạt nhất + nhánh phân biệt "đạt cân bằng cuối nhưng nguy hiểm giữa chừng" (`scanFinalOkPeakFail`, chỉ chạy khi có tempProfile — chưa có case nào trong db hiện tại kích hoạt, defensive).
- Hiệu năng đo Node: ~250-300ms cho toàn lưới quét (kể cả tempProfile động) → dưới ngưỡng 1-2s nên KHÔNG cần Web Worker; dùng `setTimeout(30ms)` để spinner vẽ trước.
- `index.html`: thêm CSS (.mode-toggle/.mode-btn/.spinner/.result-table/.reverse-warn/.near-miss), tag v3.0 (Feature B).
- Params test tái lập (chạy Node, nạp engine bằng `new Function('module',...)` vì repo ESM):
  - TEST 1 (15 configs): `{veg:'nam_rom',massG:300,tempC:6,sides:2,bagW:28,bagL:35,freeVolML:0,tech:'laser'}`
  - TEST 2 (0 configs + near-miss): `{veg:'gia_do',massG:300,tempC:8,...}`
  - TEST 3 (10 configs, peak filter): `{veg:'xa_lach',massG:300,tempC:8,tempProfile:[{h:0,c:6},{h:2,c:15},{h:4,c:8},{h:7,c:25},{h:72,c:25}],...}`

## Next session start prompt

- Dự án VN-EMAP v3 nằm tại `apps/web/vn-emap/` (engine.js + app.js + index.html + database.json + import-rau.mjs). Đọc file này trước khi làm tiếp.
- Việc có thể làm tiếp: đo thực nghiệm thay ước tính nhóm nguyên mẫu cho các rau mới nhập (ưu tiên các rau đóng gói nhiều: xà lách, cải ngọt, rau muống); cân nhắc thêm chất liệu màng ngoài OPP nếu tìm ngược hay trả về rỗng (Ưu tiên 4 plan gốc); dọn chỗ còn ghi "v2" trong UI.
