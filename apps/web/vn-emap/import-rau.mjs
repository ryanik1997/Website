// Import danh mục rau từ "1. MAP/cac_loai_rau.txt" vào database.json.
// Mỗi loại rau được ánh xạ về NHÓM NGUYÊN MẪU (archetype) đã có trong database —
// thông số hô hấp là ước tính theo nhóm (do_tin_cay ghi rõ), chưa đo thực nghiệm.
// Chạy:  node import-rau.mjs "<đường dẫn cac_loai_rau.txt>"
import fs from 'node:fs';

const LIST_PATH = process.argv[2] || 'D:/App-English-Ryan/1. MAP/cac_loai_rau.txt';
const DB_PATH = new URL('./database.json', import.meta.url);

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// ---- Archetypes: tham chiếu key trong db.rau hiện có, hoặc định nghĩa mới ----
const archetypes = {
  xa_lach:   { ref: 'xa_lach' },      // rau lá mềm kiểu xà lách
  cai:       { ref: 'cai_bo_xoi' },   // rau lá họ cải
  day:       { ref: 'rau_muong' },    // rau dây/rauCook lá xanh (muống, mồng tơi, dền...)
  herb:      { ref: 'rau_muong' },    // rau gia vị (nhạy, hô hấp cao)
  mam:       { ref: 'gia_do' },       // rau mầm
  hoa:       { ref: 'bong_cai_xanh' },// thân hoa (súp lơ)
  qua: { def: { R_O2_10C: 10, Q10: 2.2, RQ: 1.0, O2_opt_min: 3, O2_opt_max: 6, CO2_opt_max: 5,
                CO2_canh_bao_do: 8, O2_LOL: 1, Km_O2: 2.0, k_CO2_uc_che: 6.0,
                mat_do_khoi_kg_m3: 450, toc_do_mat_nuoc_pct_ngay: 1.5, RH_toi_uu_max: 90 } },
  cu:  { def: { R_O2_10C: 6, Q10: 2.1, RQ: 1.0, O2_opt_min: 2, O2_opt_max: 5, CO2_opt_max: 6,
                CO2_canh_bao_do: 10, O2_LOL: 1, Km_O2: 1.5, k_CO2_uc_che: 8.0,
                mat_do_khoi_kg_m3: 600, toc_do_mat_nuoc_pct_ngay: 0.8, RH_toi_uu_max: 88 } },
};

// Nhóm sản phẩm trong file → archetype mặc định (key so sánh sau khi bỏ dấu, vì
// file trộn Unicode NFC/NFD — "quả" vs "quả" — nên phải chuẩn hóa cả hai phía)
const GROUP_DEFAULT = {
  'rau an la': 'day', 'rau gia vi': 'herb', 'rau an qua': 'qua',
  'rau mam': 'mam', 'rau an than hoa': 'hoa', 'rau an cu': 'cu',
};

// Ghi đè theo từ khóa trong tên (duyệt theo thứ tự, khớp đầu tiên thắng)
const NAME_RULES = [
  [/xà lách|rau diếp/i, 'xa_lach'],
  [/súp lơ/i, 'hoa'],
  [/cải|bắp cải|kale/i, 'cai'],
  [/muống|mồng tơi|dền|đay|lang|ngót|su su/i, 'day'],
];

function stripDia(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}
function slugOf(name) {
  return stripDia(name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
function archetypeParams(key) {
  const a = archetypes[key];
  if (a.ref) return db.rau[a.ref];
  return a.def;
}

// ---- Đọc & chuẩn hóa danh sách ----
const lines = fs.readFileSync(LIST_PATH, 'utf8').split(/\r?\n/).slice(1); // bỏ header
const seen = new Set();
const items = [];
for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;
  // Tách nhóm và tên: nhóm = phần trước "KH-" hoặc trước tên không có tiền tố
  const m = line.match(/^(.*?)\t\s*(?:KH-)?\s*(.+)$/);
  if (!m) continue;
  const group = stripDia(m[1]).trim().toLowerCase();
  const name = m[2].replace(/^KH-\s*/, '').replace(/\s+/g, ' ').trim();
  if (!name) continue;
  const dedupeKey = stripDia(name).toLowerCase();
  if (seen.has(dedupeKey)) continue; // đã có (file có nhiều dòng trùng: Cà chua đỏ, Ớt ngọt...)
  seen.add(dedupeKey);

  let arch = GROUP_DEFAULT[group] || 'day';
  // luật theo-tên chỉ tinh chỉnh nhóm "Rau ăn lá" (arch 'day' chung);
  // các nhóm cụ thể (mầm/quả/củ/thân hoa/gia vị) giữ nguyên mặc định nhóm
  if (arch === 'day') {
    for (const [re, a] of NAME_RULES) { if (re.test(name)) { arch = a; break; } }
  }

  items.push({ group: m[1].trim(), name, arch });
}

// ---- Ghi vào db.rau (không ghi đè key hiện có) ----
const NOTE = 'Ước tính theo nhóm nguyên mẫu — chưa đo thực nghiệm';
let added = 0, skipped = 0;
for (const it of items) {
  let slug = slugOf(it.name);
  if (db.rau[slug] || slug === '') { skipped++; continue; }
  const p = archetypeParams(it.arch);
  db.rau[slug] = {
    ten_hien_thi: it.name,
    nhom: it.group.normalize('NFC'), // file trộn NFC/NFD → gộp nhóm trùng khi hiển thị
    R_O2_10C: p.R_O2_10C, Q10: p.Q10, RQ: p.RQ,
    O2_opt_min: p.O2_opt_min, O2_opt_max: p.O2_opt_max,
    CO2_opt_max: p.CO2_opt_max, CO2_canh_bao_do: p.CO2_canh_bao_do,
    O2_LOL: p.O2_LOL, Km_O2: p.Km_O2, k_CO2_uc_che: p.k_CO2_uc_che,
    mat_do_khoi_kg_m3: p.mat_do_khoi_kg_m3, toc_do_mat_nuoc_pct_ngay: p.toc_do_mat_nuoc_pct_ngay,
    RH_toi_uu_max: p.RH_toi_uu_max,
    do_tin_cay: NOTE
  };
  added++;
}

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n', 'utf8');
console.log(`Đã thêm ${added} loại rau (bỏ qua ${skipped} trùng/key tồn tại). Tổng: ${Object.keys(db.rau).length}`);
