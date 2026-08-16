# AUDIT Checklist — VN-EMAP Designer (dùng khi audit code do Deepseek/tác nhân khác sửa)

> Cách dùng: sau khi Deepseek giao kết quả, chạy lại từng mục dưới đây và so với baseline.
> Mọi mục phải CÓ BẰNG CHỨNG (lệnh chạy + output), không chấp nhận mô tả bằng lời.

## 0. Baseline trước khi Deepseek sửa (2026-08-16 16:40)

SHA-256 (16 ký tự đầu) + kích thước:

```
e76321d08975c676    12882  engine.js
80d34d053f0159f7    28647  app.js
3696f6fc0d6b1fbe    54608  packaging.js
fc9f763afc52aff2   139831  index.html
2fce5456cd85e7a7    36201  database.json
b800d387f9834f62    54300  packaging-db.json
5058c4c0029928d7     4903  import-rau.mjs
4cc431749960c6dd     1318  sync-inline-db.mjs
```

Số liệu tham chiếu engine (phải RA Y HỆT nếu Deepseek không đụng logic):
- `integrate` xa_lach 300g 6°C OPP25 20 lỗ D100: O2 **18.861**, CO2 **2.337**
- `findAllConfigs` nam_rom 300g 6°C: **15 configs** (min = OPP_20micron/D80µm/0 lỗ, O2 12.778)
- `findAllConfigs` gia_do 300g 8°C: **0 configs**; near-miss[0] score **2.407**
- `findAllConfigs` xa_lach abuse profile: **10 configs**

## 1. Quy tắc BẮT BUỘC (vi phạm = FAIL ngay)

- [ ] **Không sửa `engine.js`** trừ khi task yêu cầu rõ — checksum `e76321d08975c676` phải còn nguyên, hoặc diff phải chỉ ra đúng phần được yêu cầu.
- [ ] **Không tự động ghi đè `database.json`/`packaging-db.json`** (calibration chỉ ĐỀ XUẤT, sửa qua tay người).
- [ ] **Không tự bịa dữ liệu**: trường chưa đo phải `null` + gán confidence đúng (measured/supplier_confirmed/literature/estimated/archetype/unknown).
- [ ] Nếu sửa `database.json` hoặc `packaging-db.json` → **phải chạy `node sync-inline-db.mjs`** (nội dung #db-inline/#pkgdb-inline trong index.html phải khớp nguyên văn file).
- [ ] Không phá Feature A/B: `optimizeHoles`/`findAllConfigs` nhận db gốc từ app.js, không bị chuyển sang mergedFilmsDB.

## 2. Test hồi quy bắt buộc chạy lại (Node)

```
cd apps/web/vn-emap && node -e "<xem session_summary mục regression — 5 test A1/A2-beta/B1/B2/B3>"
```
Kỳ vọng: A1 khớp tuyệt đối; B1=15/B2=0/B3=10 configs với đúng số liệu ở mục 0.

## 3. Test UI bắt buộc chạy lại (Playwright qua HTTP server)

- [ ] `node --check` app.js / packaging.js / engine.js PASS
- [ ] HTTP: dropdown rau 72 loại, MAP tính được, Feature B chạy (warn hoặc rows)
- [ ] file://: banner "chế độ offline" hiện, dropdown 72 rau (bản nhúng #db-inline còn khớp)
- [ ] Sub-tab M1–M5: mỗi tab hiển thị đúng 1 milestone; **dữ liệu form không mất** khi chuyển tab/sub-tab/mode
- [ ] M1: 35 films, filter (text + chất liệu + confidence) và nút thu gọn hoạt động
- [ ] M2: film thiếu OTR/CO₂TR/WVTR bị disable; tính bao bì + quét ngược chạy
- [ ] M4: tạo trial từ M2, thêm mốc đo, nút hiệu chỉnh khóa khi <3 mốc O2+CO2
- [ ] M5: RFQ sinh đủ 11 mục, copy + download
- [ ] Print media: chỉ .print-sheet hiện; nút Xuất PDF tải file
- [ ] Sticky strip cập nhật khi runCalc/m2Run

## 4. Checklist code quality

- [ ] Không có global leak ngoài `window.VNEMAP_*` có chủ đích
- [ ] Không thêm framework/build step (dự án cố ý không build)
- [ ] localStorage keys: `vnemap_packfilms_v1`, `vnemap_trials_v1`, `vnemap_suppliers_v1`, `vnemap_scenarios_v2` — không đổi tên (mất dữ liệu người dùng)
- [ ] CSS dùng biến `--*` sẵn có, không hardcode màu mới ngoài token

## 5. Quy trình audit

1. Chạy checksum (mục 0) → xác định file nào bị đụng.
2. `git diff` không có (thư mục chưa track) → so thủ công bằng checksum + đọc diff do Deepseek cung cấp.
3. Chạy mục 2 (Node) + mục 3 (Playwright) — dán output thật.
4. Đối chiếu mục 1 — từng dòng.
5. Kết luận: PASS / FAIL kèm chứng cứ, ghi vào session_summary.md.
