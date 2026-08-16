// ============================================================
// VN-EMAP Packaging Development Lab — M1: Data model
// Materials + Films + Micro-perforation. KHÔNG sửa engine.js
// hay Feature A/B của MAP Calculator.
// Quy tắc dữ liệu: trường chưa đo -> null (không tự bịa);
// mọi film phải có confidence thuộc CONFIDENCE_LEVELS.
// ============================================================
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const LS_KEY = 'vnemap_packfilms_v1'; // overlay người dùng đè lên seed

  const CONFIDENCE_LEVELS = {
    measured: { ten: 'Measured (đo thực nghiệm)', cls: 'cf-measured' },
    supplier_confirmed: { ten: 'Supplier confirmed', cls: 'cf-supplier' },
    literature: { ten: 'Literature (tài liệu)', cls: 'cf-literature' },
    estimated: { ten: 'Estimated (ước tính)', cls: 'cf-estimated' },
    archetype: { ten: 'Archetype (theo nhóm)', cls: 'cf-estimated' },
    unknown: { ten: 'Unknown', cls: 'cf-unknown' }
  };

  let PACKDB = null; // seed packaging-db.json
  let films = [];    // bản làm việc (seed + overlay localStorage)

  // ---------- nạp dữ liệu ----------
  async function loadPackDB() {
    try {
      const res = await fetch('packaging-db.json');
      if (!res.ok) throw new Error(res.status);
      PACKDB = await res.json();
    } catch (e) {
      // offline (file://): dùng bản nhúng nguyên văn trong index.html (#pkgdb-inline)
      const inline = document.getElementById('pkgdb-inline');
      if (inline) {
        PACKDB = JSON.parse(inline.textContent);
        console.warn('packaging-db.json không fetch được (offline?), dùng bản nhúng sẵn trong HTML.');
      } else {
        PACKDB = { version: 1, materials: [], films: [], perforation: { diameters_um: [50, 80, 100, 120, 150, 200], patterns: [] } };
        console.warn('packaging-db.json not loaded (offline?), module Materials chạy rỗng.', e);
        setTimeout(() => { const el = document.getElementById('materialChips'); if (el) el.innerHTML = '<span style="color:#a3720b;font-size:12.5px">⚠ Không tải được packaging-db.json (file hỏng/thiếu) — Packaging Lab chạy ở chế độ rút gọn.</span>'; }, 0);
      }
    }
    let overlay = [];
    try { overlay = JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { overlay = []; }
    // overlay đè lên seed theo film_id
    const byId = new Map(PACKDB.films.map(f => [f.film_id, f]));
    overlay.forEach(f => byId.set(f.film_id, f));
    films = [...byId.values()];
  }
  function persist() {
    // chỉ lưu phim do người dùng thêm/sửa; seed không copy lại
    const seedIds = new Set(PACKDB.films.map(f => f.film_id));
    const user = films.filter(f => !seedIds.has(f.film_id) || f._edited);
    localStorage.setItem(LS_KEY, JSON.stringify(user.map(({ _edited, ...f }) => f)));
  }

  // ---------- validation ----------
  function num(v) { const n = parseFloat(v); return isFinite(n) ? n : null; }
  function gtField(v) { // {value, unit, temp_C, rh_pct, method, source} — value bắt buộc > 0 nếu có
    const o = { value: num(v.value), unit: v.unit || null, temp_C: num(v.temp_C), rh_pct: num(v.rh_pct), method: v.method || null, source: v.source || null };
    return o.value != null && o.value > 0 ? o : null;
  }
  function validateFilm(f) {
    const errs = [];
    if (!f.film_id) errs.push('Thiếu film_id');
    if (!f.material) errs.push('Chưa chọn Material');
    if (!(f.thickness_um > 0)) errs.push('Thickness (µm) phải > 0');
    if (!CONFIDENCE_LEVELS[f.confidence]) errs.push('Chưa gán Data confidence');
    if (f.density_g_cm3 != null && f.density_g_cm3 <= 0) errs.push('Density phải > 0');
    ['otr', 'co2tr', 'wvtr'].forEach(k => {
      const o = f[k];
      if (o && !(o.value > 0)) errs.push(k.toUpperCase() + ': value phải > 0 hoặc để trống (null)');
    });
    return errs;
  }

  // ---------- UI: tab ----------
  function setAppTab(tab) {
    $('viewMap').style.display = tab === 'map' ? '' : 'none';
    $('viewPack').style.display = tab === 'pack' ? '' : 'none';
    $('tabMap').classList.toggle('active', tab === 'map');
    $('tabPack').classList.toggle('active', tab === 'pack');
  }

  // ---------- UI: films ----------
  function renderMaterials() {
    $('materialChips').innerHTML = PACKDB.materials.map(m =>
      `<span class="chip">${m.code}</span>`).join('');
    // options cho filter chất liệu của bảng film
    const fsel = $('filmFilterMat');
    if (fsel) {
      const cur = fsel.value;
      fsel.innerHTML = '<option value="">Tất cả chất liệu</option>' +
        PACKDB.materials.map(m => `<option value="${m.code}">${m.code}</option>`).join('');
      fsel.value = cur;
    }
  }

  function renderFilmForm() {
    const matSel = $('fMaterial');
    matSel.innerHTML = '<option value="">— chọn —</option>' +
      PACKDB.materials.map(m => `<option value="${m.code}">${m.code} · ${m.ten}</option>`).join('');
    const cfSel = $('fConfidence');
    cfSel.innerHTML = Object.keys(CONFIDENCE_LEVELS).map(k =>
      `<option value="${k}">${CONFIDENCE_LEVELS[k].ten}</option>`).join('');
    // đường kính lỗ: preset + custom
    const dSel = $('perfD');
    dSel.innerHTML = PACKDB.perforation.diameters_um.map(d =>
      `<option value="${d}">${d} µm</option>`).join('') + '<option value="custom">Custom…</option>';
    const patSel = $('perfPattern');
    patSel.innerHTML = PACKDB.perforation.patterns.map(p =>
      `<option value="${p.code}">${p.ten}</option>`).join('');
  }

  function cfBadge(k) {
    const c = CONFIDENCE_LEVELS[k] || CONFIDENCE_LEVELS.unknown;
    return `<span class="cf ${c.cls}">${c.ten}</span>`;
  }
  function gtCell(o) {
    return o ? `${o.value} ${o.unit || ''}` : '<span class="null">null</span>';
  }

  let filmTableCollapsed = false;
  function filmFilterChanged() { renderFilms(); }
  function toggleFilmTable() {
    filmTableCollapsed = !filmTableCollapsed;
    $('filmTableWrap').style.display = filmTableCollapsed ? 'none' : '';
    $('filmCollapseBtn').textContent = filmTableCollapsed ? `Mở rộng danh sách (${films.length})` : 'Thu gọn danh sách';
  }

  function renderFilms() {
    // filter chỉ áp cho bảng danh sách; dropdown M2 vẫn thấy đủ film khả dụng
    const q = ($('filmSearch') && $('filmSearch').value || '').toLowerCase().trim();
    const mat = $('filmFilterMat') ? $('filmFilterMat').value : '';
    const cf = $('filmFilterCf') ? $('filmFilterCf').value : '';
    const shown = films.filter(f =>
      (!q || f.film_id.toLowerCase().includes(q) || (f.structure || '').toLowerCase().includes(q) || f.material.toLowerCase().includes(q)) &&
      (!mat || f.material === mat) &&
      (!cf || f.confidence === cf));
    $('filmBody').innerHTML = shown.map((f) => {
      const i = films.indexOf(f);
      return `<tr>
      <td>${f.film_id}</td><td>${f.material}</td><td>${f.structure || '—'}</td><td>${f.thickness_um}</td>
      <td>${gtCell(f.otr)}</td><td>${gtCell(f.co2tr)}</td><td>${gtCell(f.wvtr)}</td>
      <td>${cfBadge(f.confidence)}</td>
      <td class="act">
        <button class="use-btn" onclick="VNEMAP_PackUI.editFilm(${i})">Sửa</button>
        <button class="use-btn danger" onclick="VNEMAP_PackUI.deleteFilm(${i})">Xoá</button>
      </td></tr>`;
    }).join('');
    const cnt = $('filmCount');
    if (cnt) cnt.textContent = `Hiển thị ${shown.length}/${films.length} film` + (q || mat || cf ? ' (đang lọc)' : '') + '.';
    if (window.VNEMAP_DB) renderM2(); // cập nhật film select của M2 sau CRUD
  }

  function readFilmForm() {
    return {
      film_id: $('fId').value.trim(),
      material: $('fMaterial').value,
      structure: $('fStructure').value.trim() || null,
      thickness_um: num($('fThickness').value),
      width_mm: num($('fWidth').value),
      length_mm: num($('fLength').value),
      density_g_cm3: num($('fDensity').value),
      sealability: $('fSeal').value || null,
      heat_seal_temp_C: num($('fSealTemp').value),
      haze_pct: num($('fHaze').value),
      gloss: num($('fGloss').value),
      transparency: num($('fTransparency').value),
      tensile_MPa: num($('fTensile').value),
      elongation_pct: num($('fElong').value),
      otr: { value: $('fOtr').value, unit: 'cm3/m2.day', temp_C: num($('fOtrT').value) ?? 23, rh_pct: num($('fOtrRH').value), method: $('fOtrMethod').value || null, source: $('fOtrSource').value || null },
      co2tr: { value: $('fCo2tr').value, unit: 'cm3/m2.day', temp_C: num($('fCo2trT').value) ?? 23, rh_pct: num($('fCo2trRH').value), method: $('fCo2trMethod').value || null, source: $('fCo2trSource').value || null },
      wvtr: { value: $('fWvtr').value, unit: 'g/m2.day', temp_C: num($('fWvtrT').value) ?? 23, rh_pct: num($('fWvtrRH').value), method: $('fWvtrMethod').value || null, source: $('fWvtrSource').value || null },
      supplier: $('fSupplier').value.trim() || null,
      confidence: $('fConfidence').value
    };
  }

  function saveFilm() {
    const f = readFilmForm();
    ['otr', 'co2tr', 'wvtr'].forEach(k => { f[k] = gtField(f[k]); });
    ['width_mm', 'length_mm', 'density_g_cm3', 'heat_seal_temp_C', 'haze_pct', 'gloss', 'transparency', 'tensile_MPa', 'elongation_pct']
      .forEach(k => { if (f[k] === undefined || f[k] === null) f[k] = null; });
    const errs = validateFilm(f);
    if (errs.length) { $('filmFormMsg').textContent = '⚠ ' + errs.join('; '); return; }
    const idx = films.findIndex(x => x.film_id === f.film_id);
    if (idx >= 0) { films[idx] = { ...f, _edited: true }; }
    else {
      if (films.some(x => x.film_id === f.film_id)) { $('filmFormMsg').textContent = '⚠ film_id đã tồn tại'; return; }
      films.push(f);
    }
    persist(); renderFilms();
    $('filmFormMsg').textContent = '✓ Đã lưu "' + f.film_id + '"';
  }

  function editFilm(i) {
    const f = films[i];
    $('fId').value = f.film_id; $('fMaterial').value = f.material; $('fStructure').value = f.structure || '';
    $('fThickness').value = f.thickness_um; $('fWidth').value = f.width_mm ?? ''; $('fLength').value = f.length_mm ?? '';
    $('fDensity').value = f.density_g_cm3 ?? ''; $('fSeal').value = f.sealability || '';
    $('fSealTemp').value = f.heat_seal_temp_C ?? ''; $('fHaze').value = f.haze_pct ?? '';
    $('fGloss').value = f.gloss ?? ''; $('fTransparency').value = f.transparency ?? '';
    $('fTensile').value = f.tensile_MPa ?? ''; $('fElong').value = f.elongation_pct ?? '';
    const setGT = (pfx, o) => {
      $(pfx).value = o ? o.value : ''; $(pfx + 'T').value = o && o.temp_C != null ? o.temp_C : '';
      $(pfx + 'RH').value = o && o.rh_pct != null ? o.rh_pct : '';
      $(pfx + 'Method').value = o && o.method || ''; $(pfx + 'Source').value = o && o.source || '';
    };
    setGT('fOtr', f.otr); setGT('fCo2tr', f.co2tr); setGT('fWvtr', f.wvtr);
    $('fSupplier').value = f.supplier || ''; $('fConfidence').value = f.confidence;
    $('filmFormMsg').textContent = 'Đang sửa "' + f.film_id + '" — bấm Lưu để cập nhật.';
  }

  function deleteFilm(i) {
    const f = films[i];
    if (!confirm('Xoá film "' + f.film_id + '"?')) return;
    films.splice(i, 1);
    persist(); renderFilms();
  }

  // ---------- UI: perforation ----------
  function densityConvert(src) {
    const w = num($('perfBagW').value) || 0, l = num($('perfBagL').value) || 0;
    const faces = parseInt($('perfFaces').value) || 1;
    const areaCm2 = w * l * faces; // diện tích đục (mặt túi)
    const total = num($('perfTotal').value);
    const perCm2 = num($('perfPerCm2').value);
    const perM2 = num($('perfPerM2').value);
    // ô nào vừa nhập thì ô đó là "nguồn chân lý"
    let n = null;
    if (src === 'perfTotal' && total != null) n = total;
    else if (src === 'perfPerCm2' && perCm2 != null && areaCm2 > 0) n = perCm2 * areaCm2;
    else if (src === 'perfPerM2' && perM2 != null && areaCm2 > 0) n = perM2 * areaCm2 / 1e4;
    else if (total != null) n = total;
    else if (perCm2 != null && areaCm2 > 0) n = perCm2 * areaCm2;
    else if (perM2 != null && areaCm2 > 0) n = perM2 * areaCm2 / 1e4;
    if (n == null || areaCm2 <= 0) { $('perfOut').textContent = 'Nhập kích thước túi và một trong ba ô mật độ.'; return; }
    n = Math.round(n);
    $('perfTotal').value = n;
    $('perfPerCm2').value = +(n / areaCm2).toFixed(3);
    $('perfPerM2').value = Math.round(n / areaCm2 * 1e4);
    $('perfOut').innerHTML = `Tổng <b>${n}</b> lỗ trên ${areaCm2.toFixed(0)} cm² (${(areaCm2 / 1e4).toFixed(3)} m²) · ${dLabel()}`;
    drawPattern(n);
  }
  function dLabel() {
    const sel = $('perfD').value;
    return 'D = ' + (sel === 'custom' ? (($('perfDCustom').value || '?') + ' µm (custom)') : sel + ' µm');
  }

  // ---------- pattern preview (canvas) ----------
  function drawPattern(nHoles) {
    const cv = $('perfPreview'), ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    const m = 14, w = cv.width - 2 * m, h = cv.height - 2 * m;
    ctx.strokeStyle = '#0d4a3e'; ctx.lineWidth = 2;
    ctx.strokeRect(m, m, w, h);
    const pattern = $('perfPattern').value;
    const n = Math.max(0, Math.min(nHoles || 0, 400)); // cap hiển thị
    if (n === 0) return;
    ctx.fillStyle = '#b8862e';
    // vùng chứa lỗ theo pattern (ty lệ [x0,y0,x1,y1] trong mặt túi)
    const ZONES = {
      uniform: [0.08, 0.08, 0.92, 0.92],
      center: [0.25, 0.3, 0.75, 0.7],
      edge: null, // viền: 4 dải
      top: [0.15, 0.06, 0.85, 0.3],
      bottom: [0.15, 0.7, 0.85, 0.94],
      side: [0.06, 0.2, 0.3, 0.8],
      zone: [0.2, 0.35, 0.8, 0.75],
      custom: [0.08, 0.08, 0.92, 0.92]
    };
    const pts = [];
    if (pattern === 'edge') {
      const band = 0.18, cols = Math.ceil(Math.sqrt(n / (w / h)) / 1), step = Math.max(10, Math.sqrt(4 * w * h * band / n));
      let cnt = 0;
      for (let x = m; x <= m + w && cnt < n; x += step) { pts.push([x, m + h * band / 2]); pts.push([x, m + h - h * band / 2]); cnt += 2; }
      for (let y = m + step; y < m + h - step && cnt < n; y += step) { pts.push([m + w * band / 2, y]); pts.push([m + w - w * band / 2, y]); cnt += 2; }
    } else {
      const z = ZONES[pattern] || ZONES.uniform;
      const zw = w * (z[2] - z[0]), zh = h * (z[3] - z[1]);
      const cols = Math.max(1, Math.round(Math.sqrt(n * zw / zh)));
      const rows = Math.max(1, Math.ceil(n / cols));
      for (let i = 0; i < n; i++) {
        const c = i % cols, r = Math.floor(i / cols);
        pts.push([m + w * z[0] + (cols > 1 ? (c + 0.5) / cols * zw : zw / 2),
                  m + h * z[1] + (rows > 1 ? (r + 0.5) / rows * zh : zh / 2)]);
      }
    }
    const r = n > 200 ? 1.2 : n > 60 ? 1.8 : 2.5;
    pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill(); });
    if (nHoles > 400) {
      ctx.fillStyle = '#7c8a83'; ctx.font = '11px sans-serif';
      ctx.fillText('(hiển thị tối đa 400 lỗ)', m + 4, cv.height - 3);
    }
  }

  // ---------- M2: Packaging Designer ----------
  const ARR = 1.035; // hệ số Arrhenius mặc định khi film không có riêng
  function filmReady(f) { return !!(f.otr && f.co2tr && f.wvtr && f.thickness_um > 0); }

  let filmAlias = {}; // film_id M1 → key trong db2 (trỏ về màng gốc nếu bị dedupe)
  function filmKeyOf(id) { return filmAlias[id] || ('PKG_' + id.replace(/[^A-Za-z0-9_]/g, '_')); }

  // DB cho engine: màng gốc + film M1 có đủ OTR/CO2TR/WVTR (chuẩn hóa về 23°C)
  function mergedFilmsDB() {
    const base = window.VNEMAP_DB;
    if (!base) return null;
    const db2 = { rau: base.rau, mang_OPP: {} };
    const seen = new Map(); // khử trùng: film M1 trùng thông số màng gốc → alias về màng gốc
    const sig = f => [f.do_day_micron, Math.round(f.OTR_23C), Math.round(f.CTR_23C), Math.round(f.WVTR_23C)].join('|');
    Object.keys(base.mang_OPP).forEach(k => {
      const f = base.mang_OPP[k];
      db2.mang_OPP[k] = { ...f, _label: 'OPP ' + f.do_day_micron + 'µm' };
      seen.set(sig(f), k);
    });
    filmAlias = {};
    films.forEach(f => {
      if (!filmReady(f)) return;
      const norm = o => o.temp_C != null && o.temp_C !== 23 ? +(o.value * Math.pow(ARR, 23 - o.temp_C)).toFixed(1) : o.value;
      const entry = {
        do_day_micron: f.thickness_um,
        OTR_23C: norm(f.otr), CTR_23C: norm(f.co2tr), WVTR_23C: norm(f.wvtr),
        he_so_Arrhenius_nhiet_do_per_C: ARR,
        _label: f.film_id + ' · ' + f.material + ' ' + f.thickness_um + 'µm'
      };
      const native = seen.get(sig(entry));
      if (native) { filmAlias[f.film_id] = native; return; } // trùng màng gốc — dùng màng gốc
      const key = 'PKG_' + f.film_id.replace(/[^A-Za-z0-9_]/g, '_');
      seen.set(sig(entry), key);
      filmAlias[f.film_id] = key;
      db2.mang_OPP[key] = entry;
    });
    return db2;
  }

  function renderM2() {
    const veg = $('m2Veg'), E = window.VNEMAP_Engine, base = window.VNEMAP_DB;
    if (base) {
      const groups = new Map();
      Object.keys(base.rau).forEach(k => {
        const g = base.rau[k].nhom || 'Cơ bản (đã hiệu chỉnh)';
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(k);
      });
      veg.innerHTML = '';
      for (const [g, keys] of groups) {
        const og = document.createElement('optgroup'); og.label = g;
        keys.forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = base.rau[k].ten_hien_thi; og.appendChild(o); });
        veg.appendChild(og);
      }
      veg.value = 'nam_rom'; // mặc định là case CÓ nghiệm — xà lách 300g 6°C túi 28×35 là case bất khả thi đã biết
    }
    const fsel = $('m2Film');
    const prevSel = fsel.value; // giữ lựa chọn hiện tại khi rebuild
    fsel.innerHTML = films.map(f => {
      const ok = filmReady(f);
      return `<option value="${f.film_id}" ${ok ? '' : 'disabled'}>${f.film_id} · ${f.material} ${f.thickness_um}µm${ok ? '' : ' — thiếu OTR/CO₂TR/WVTR (null)'}</option>`;
    }).join('');
    if (prevSel && films.some(f => f.film_id === prevSel)) fsel.value = prevSel;
    const dSel = $('m2D');
    dSel.innerHTML = PACKDB.perforation.diameters_um.map(d => `<option value="${d}">${d} µm</option>`).join('') + '<option value="custom">Custom…</option>';
    $('m2Pattern').innerHTML = PACKDB.perforation.patterns.map(p => `<option value="${p.code}">${p.ten}</option>`).join('');
  }

  function m2Params() {
    const base = window.VNEMAP_DB;
    const w = num($('m2BagW').value) || 0, l = num($('m2BagL').value) || 0;
    const faces = parseInt($('m2Faces').value) || 2;
    const areaCm2 = Math.max(w * l * faces, 1e-6);
    const mode = $('m2DensMode').value;
    const dens = num($('m2Dens').value) || 0;
    let nHoles;
    if (mode === 'total') nHoles = dens;
    else if (mode === 'cm2') nHoles = dens * areaCm2;
    else nHoles = dens * areaCm2 / 1e4;
    nHoles = Math.round(nHoles);
    const dSel = $('m2D').value;
    const holeD = dSel === 'custom' ? (num($('m2DCustom').value) || 100) : +dSel;
    return {
      veg: $('m2Veg').value,
      massG: num($('m2Mass').value) || 300,
      tempC: num($('m2Temp').value) || 8,
      filmKey: filmKeyOf($('m2Film').value),
      sides: faces,
      bagW: w, bagL: l,
      freeVolML: num($('m2FreeVol').value) || 0,
      nHoles, holeD_um: holeD,
      zoneLen: num($('m2ZoneLen').value) || 20,
      zoneFromBottom: num($('m2ZoneFromBottom').value) || 2,
      tech: $('m2Tech').value,
      _areaCm2: areaCm2, _pattern: $('m2Pattern').value
    };
  }

  function m2Status(res, v) {
    const pk = res.peak || {};
    if (res.finalO2 < 1 || res.finalCO2 > v.CO2_canh_bao_do || (pk.o2Min != null && pk.o2Min < 1))
      return { s: 'red', msg: `NGUY HIỂM: O2 ${res.finalO2.toFixed(2)}% / CO2 ${res.finalCO2.toFixed(2)}% ngoài ngưỡng an toàn (ngưỡng cảnh báo CO2 ${v.CO2_canh_bao_do}%).` };
    if (res.finalO2 < v.O2_opt_min || res.finalO2 > v.O2_opt_max || res.finalCO2 > v.CO2_opt_max)
      return { s: 'yellow', msg: `CẢNH BÁO: ngoài khoảng tối ưu O2 ${v.O2_opt_min}-${v.O2_opt_max}% / CO2 ≤${v.CO2_opt_max}%. Xem quét ngược bên dưới để tìm cấu hình đạt.` };
    return { s: 'green', msg: 'ĐẠT: O2/CO2 cân bằng trong khoảng tối ưu cho sản phẩm này.' };
  }

  const M2_COLORS = { green: ['#e5f5ea', '#1c7a4d'], yellow: ['#fdf1d9', '#a3720b'], red: ['#fbe4e2', '#b3261e'] };

  function m2Run() {
    const E = window.VNEMAP_Engine, db2 = mergedFilmsDB();
    if (!E || !db2) { $('m2Banner').textContent = 'Chưa tải được engine/database.'; return; }
    if (!db2.mang_OPP[filmKeyOf($('m2Film').value)]) {
      $('m2Banner').style.cssText = 'background:#fbe4e2;color:#b3261e';
      $('m2Banner').textContent = 'Film này thiếu OTR/CO₂TR/WVTR (null) — bổ sung dữ liệu đo ở panel M1 trước khi tính.';
      return;
    }
    const p = m2Params();
    const res = E.integrate(p, db2);
    const v = db2.rau[p.veg];
    $('m2O2').textContent = res.finalO2.toFixed(2) + '%';
    $('m2CO2').textContent = res.finalCO2.toFixed(2) + '%';
    $('m2RH').textContent = res.finalRH.toFixed(0) + '%';
    $('m2T90').textContent = res.t90 ? res.t90.toFixed(1) + ' giờ' : '>72 giờ';
    const st = m2Status(res, v);
    const c = M2_COLORS[st.s];
    $('m2Banner').style.cssText = `background:${c[0]};color:${c[1]}`;
    $('m2Banner').textContent = st.msg;
    // sticky strip (redesign 1.2)
    const stripC = { green: '#1c7a4d', yellow: '#a3720b', red: '#b3261e' };
    $('stickyDot').style.background = stripC[st.s];
    $('stickyO2').textContent = res.finalO2.toFixed(2) + '%';
    $('stickyCO2').textContent = res.finalCO2.toFixed(2) + '%';
    $('stickyRH').textContent = res.finalRH.toFixed(0) + '%';
    $('stickyCfg').textContent = `M2 · ${v.ten_hien_thi} ${p.massG}g · ${p.tempC}°C · ${db2.mang_OPP[p.filmKey]._label} · ${p.nHoles} lỗ D${p.holeD_um}µm`;
    const f = db2.mang_OPP[p.filmKey];
    $('m2Spec').textContent =
`Sản phẩm: ${v.ten_hien_thi} — ${p.massG}g — ${p.tempC}°C
Film: ${f._label} (OTR ${f.OTR_23C} / CTR ${f.CTR_23C} / WVTR ${f.WVTR_23C} @23°C)
Túi: ${p.bagW}×${p.bagL}cm, đục ${p.sides} mặt — diện tích đục ${p._areaCm2.toFixed(0)}cm²
Lỗ: D=${p.holeD_um}µm × ${p.nHoles} lỗ (${(p.nHoles / p._areaCm2).toFixed(3)} lỗ/cm² · ${Math.round(p.nHoles / p._areaCm2 * 1e4)} lỗ/m²) · Pattern: ${p._pattern}
→ O2 ${res.finalO2.toFixed(2)}% · CO2 ${res.finalCO2.toFixed(2)}% · RH ${res.finalRH.toFixed(0)}% · t90 ${res.t90 ? res.t90.toFixed(1) + 'h' : '>72h'}`;
    $('m2HolesLabel').textContent = `≈ ${p.nHoles} lỗ trên ${p._areaCm2.toFixed(0)} cm²`;
  }

  let m2ScanResults = [];
  // Quét ngược mịn: O2 cân bằng tăng đơn điệu theo số lỗ (cùng film+D) nên dùng bisect
  // thay vì quét tuyến tính — cho phép max lỗ vài nghìn (đục kim cơ mật độ cao) mà vẫn nhanh.
  function m2Scan() {
    const E = window.VNEMAP_Engine, db2 = mergedFilmsDB();
    if (!E || !db2) return;
    const p = m2Params();
    const v = db2.rau[p.veg];
    const Ds = ($('m2ScanDs').value || '80,100,120,150,200')
      .split(',').map(x => parseFloat(x.trim())).filter(d => d >= 10 && isFinite(d));
    const MAXN = Math.min(Math.max(num($('m2ScanMax').value) || 400, 5), 5000);
    const NMIN = Math.min(Math.max(num($('m2ScanMin').value) || 0, 0), MAXN);
    if (!Ds.length) { $('m2ScanSummary').textContent = 'Danh sách đường kính lỗ không hợp lệ.'; return; }

    const ok = r => r.finalO2 >= v.O2_opt_min && r.finalO2 <= v.O2_opt_max && r.finalCO2 <= v.CO2_opt_max
      && (!p.tempProfile || (r.peak.o2Min >= 1 && r.peak.co2Max <= v.CO2_canh_bao_do));
    const sim = (fk, D, n) => E.integrate({ ...p, filmKey: fk, holeD_um: D, nHoles: n }, db2);

    // số lỗ LỚN NHẤT vẫn đạt trần O2 (O2 đơn điệu tăng theo n) — [n..nMax] = toàn dải mật độ khả thi
    const findNMax = (fk, D, nLo) => {
      if (sim(fk, D, MAXN).finalO2 <= v.O2_opt_max) return MAXN;
      let a = nLo, b2 = MAXN; // sim(a) đạt trần, sim(b2) vượt
      while (b2 - a > 1) { const mid = (a + b2) >> 1; if (sim(fk, D, mid).finalO2 <= v.O2_opt_max) a = mid; else b2 = mid; }
      return a;
    };

    $('m2ScanSpinner').style.display = '';
    $('m2ScanSpinner').textContent = `Đang quét ${Object.keys(db2.mang_OPP).length} màng × ${Ds.length} D × ${NMIN}–${MAXN} lỗ...`;
    setTimeout(() => {
      const t0 = performance.now();
      const results = [];
      for (const fk of Object.keys(db2.mang_OPP)) {
        for (const D of Ds) {
          if (NMIN === 0) {
            const r0 = sim(fk, D, 0);
            if (ok(r0)) { results.push(row(fk, D, 0, r0, findNMax(fk, D, 0))); continue; }
            if (r0.finalO2 > v.O2_opt_max) continue;      // 0 lỗ đã quá thoáng → thêm lỗ chỉ thoáng hơn
          } else if (sim(fk, D, NMIN).finalO2 > v.O2_opt_max) continue; // đủ lỗ tối thiểu là vượt cửa sổ rồi
          const rM = sim(fk, D, MAXN);
          if (rM.finalO2 < v.O2_opt_min) continue;         // tới max lỗ vẫn thiếu O2
          // bisect n nhỏ nhất (≥ NMIN) có O2 ≥ O2_min
          let lo = Math.max(NMIN - 1, 0), hi = MAXN;
          if (sim(fk, D, lo).finalO2 >= v.O2_opt_min) hi = lo + 1;
          while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (sim(fk, D, mid).finalO2 >= v.O2_opt_min) hi = mid; else lo = mid;
          }
          for (let n = Math.max(NMIN, hi - 3); n <= Math.min(MAXN, hi + 80); n++) {
            const r = sim(fk, D, n);
            if (ok(r)) { results.push(row(fk, D, n, r, findNMax(fk, D, n))); break; }
            if (r.finalO2 > v.O2_opt_max && n > hi) break; // đã vượt cửa sổ
          }
        }
      }
      function row(filmKey, holeD_um, nHoles, r, nMax) {
        return { filmKey, holeD_um, nHoles, nMax: nMax != null ? nMax : nHoles, finalO2: r.finalO2, finalCO2: r.finalCO2, t90: r.t90, peakCO2Max: r.peak ? r.peak.co2Max : null };
      }
      results.sort((a, b) => a.nHoles - b.nHoles);
      m2ScanResults = results;
      const area = p._areaCm2 || 1;
      $('m2Body').innerHTML = results.map((r, i) => `<tr>
        <td>${db2.mang_OPP[r.filmKey]._label}</td><td>${r.holeD_um}µm</td><td>${r.nHoles}</td>
        <td>${(r.nHoles / area).toFixed(2)}</td>
        <td><b>${r.nHoles === r.nMax ? r.nHoles : r.nHoles + ' – ' + r.nMax}</b></td>
        <td>${r.finalO2.toFixed(2)}%</td><td>${r.finalCO2.toFixed(2)}%</td>
        <td>${r.peakCO2Max != null ? r.peakCO2Max.toFixed(2) + '%' : '—'}</td>
        <td>${r.t90 != null ? r.t90.toFixed(1) + 'h' : '>72h'}</td>
        <td class="act"><button class="use-btn" onclick="VNEMAP_PackUI.useM2Config(${i})">Dùng</button></td></tr>`).join('');
      const maxN = results.length ? Math.max(...results.map(r => r.nMax)) : 0;
      $('m2ScanSummary').innerHTML = results.length
        ? `Tìm được ${results.length} tổ hợp màng+lỗ đạt mục tiêu trong ${(performance.now() - t0).toFixed(0)}ms. "Số lỗ" = điểm ÍT NHẤT đạt; "Khoảng khả thi" = toàn dải số lỗ vẫn đạt khí — mật độ "chi chít" tối đa khả thi: <b>${maxN} lỗ (${(maxN / area).toFixed(2)} lỗ/cm²)</b>.`
        : (NMIN > 0
          ? `Không cấu hình nào đạt với ≥ ${NMIN} lỗ — với danh sách D này, mật độ tối thiểu đã đẩy O₂ vượt trần ${v.O2_opt_max}%. Giảm số lỗ tối thiểu, dùng D nhỏ hơn (VD 50µm), hoặc chọn rau/khối lượng thở mạnh hơn.`
          : `Không cấu hình nào đạt cho <b>${v.ten_hien_thi} ${p.massG}g ở ${p.tempC}°C với túi ${p.bagW}×${p.bagL}cm</b> — đây là kết quả vật lý hợp lệ, không phải lỗi app (đã gặp với xà lách/giá đỗ). Thử theo thứ tự: (1) túi nhỏ hơn (VD 20×25), (2) khối lượng cao hơn, (3) rau thở mạnh hơn, (4) nhiệt độ theo kênh thực tế.`);
      $('m2ScanSpinner').style.display = 'none';
    }, 30);
  }

  function useM2Config(i) {
    const r = m2ScanResults[i];
    if (!r) return;
    if (r.filmKey.startsWith('PKG_')) $('m2Film').value = r.filmKey.slice(4);
    if (![50, 80, 100, 120, 150, 200].includes(r.holeD_um)) { $('m2D').value = 'custom'; $('m2DCustom').value = r.holeD_um; }
    else $('m2D').value = String(r.holeD_um);
    const area = m2Params()._areaCm2;
    $('m2DensMode').value = 'total';
    $('m2Dens').value = r.nHoles;
    m2Run();
  }

  // ---------- M3: Engineering (gas + moisture + seal) ----------
  // Ngưỡng/cấu hình M3 — đặt ở đây (configuration), KHÔNG hard-code trong engine
  const M3_CFG = {
    RH_HIGH: 95,   // RH trong túi ≥ mức này → rủi ro ngưng tụ HIGH
    RH_MOD: 90,    // ≥ mức này → MODERATE
    SEAL_WINDOWS: { // cửa nhiệt độ hàn dán khuyến nghị (°C) theo chất liệu — literature, cần supplier confirm
      BOPP: [130, 145], CPP: [125, 150], PE: [120, 135], LLDPE: [120, 135], LDPE: [110, 125],
      PP: [140, 165], OPP: [130, 145], 'PET/PE': [110, 130], 'BOPP/CPP': [125, 150], 'BOPP/PE': [115, 135],
      CUSTOM: null
    },
    SEAL_TOLERANCE: 10 // ngoài cửa ±10°C → "Needs optimization"; xa hơn → "Not recommended"
  };
  const Psat_kPa = t => 0.61078 * Math.exp((17.27 * t) / (t + 237.3)); // Tetens, giống engine

  function m3Base() { // tham số dùng chung: lấy từ form M2 + db đã gộp film
    const E = window.VNEMAP_Engine, db2 = mergedFilmsDB();
    if (!E || !db2) return null;
    const p = m2Params();
    if (!db2.mang_OPP[p.filmKey]) return { err: 'Film hiện tại thiếu OTR/CO₂TR/WVTR — bổ sung ở M1.' };
    return { E, db2, p };
  }

  // 1) Effective package gas transfer = Film OTR + micro-hole transport
  function m3Eff() {
    const b = m3Base();
    const out = $('m3EffBody');
    if (!b) { out.innerHTML = ''; return; }
    if (b.err) { out.innerHTML = `<tr><td colspan="6">${b.err}</td></tr>`; return; }
    const { E, db2, p } = b;
    const c = E.buildConductances({ ...p, tempC: p.tempC }, db2);
    const f = db2.mang_OPP[p.filmKey];
    const row = (name, gf, gh, unit) => {
      const tot = gf + gh, pct = tot > 0 ? (gh / tot * 100) : 0;
      return `<tr><td>${name}</td><td>${gf.toFixed(1)}</td><td>${gh.toFixed(1)}</td>
        <td><b>${tot.toFixed(1)}</b> ${unit}/túi.ngày</td>
        <td>${pct.toFixed(0)}%</td><td>${(tot / c.areaTotal_m2).toFixed(0)} ${unit}/m².ngày</td></tr>`;
    };
    out.innerHTML =
      row('O₂ (film ' + f._label + ')', c.G_film_O2, c.G_holes_O2, 'mL') +
      row('CO₂', c.G_film_CO2, c.G_holes_CO2, 'mL') +
      row('H₂O', c.G_film_H2O, c.G_holes_H2O, 'g') +
      `<tr><td colspan="6" class="act hint">Tính ở ${p.tempC}°C · màng ${c.A_film_m2.toFixed(3)}m² + ${p.nHoles} lỗ D=${p.holeD_um}µm (≈${c.A_holes_cm2.toFixed(3)}cm², tech ${p.tech}) — diện tích toàn túi ${c.areaTotal_m2.toFixed(3)}m².</td></tr>`;
  }

  // 2) Moisture / condensation
  function m3Moist() {
    const b = m3Base();
    if (!b) return;
    if (b.err) { $('m3MoistBadge').textContent = b.err; return; }
    const { E, db2, p } = b;
    const v = db2.rau[p.veg];
    const days = num($('m3Days').value) || 7;
    const ambRH = (num($('m3AmbRH').value) || 70) / 100;
    const res = E.integrate(p, db2);
    const maxRH = Math.max(...res.rharr);
    const mass_kg = p.massG / 1000;
    const transp_g_day = v.toc_do_mat_nuoc_pct_ngay / 100 * mass_kg * 1000; // g/day thoát hơi từ rau
    const c = E.buildConductances({ ...p, tempC: p.tempC }, db2);
    const ps = Psat_kPa(p.tempC);
    const eIn = res.finalRH / 100 * ps, eOut = ambRH * ps;
    const flux_out = c.G_total_H2O * Math.max(eIn - eOut, 0); // g/day ra khỏi túi
    const netLoss_g_day = transp_g_day - flux_out;
    const loss_g = Math.max(net_g(netLoss_g_day) * days, 0);
    const accum_g = Math.max(net_g(flux_out - transp_g_day) * days, 0);

    $('m3RhFinal').textContent = res.finalRH.toFixed(0) + '% (max ' + maxRH.toFixed(0) + '%)';
    $('m3Loss').textContent = loss_g.toFixed(1) + ' g (' + (loss_g / p.massG * 100).toFixed(2) + '% khối lượng)';
    $('m3Accum').textContent = accum_g > 0.01 ? accum_g.toFixed(1) + ' g hơi nước dư (ngưng tụ tiềm năng)' : '≈ 0 g';
    const badge = $('m3MoistBadge');
    let lvl, msg;
    if (maxRH >= M3_CFG.RH_HIGH) { lvl = 'red'; msg = '🔴 HIGH — RH trong túi đạt ' + maxRH.toFixed(0) + '% (≥' + M3_CFG.RH_HIGH + '%): nguy cơ đọng sương/mốc cao.'; }
    else if (maxRH >= M3_CFG.RH_MOD) { lvl = 'yellow'; msg = '🟡 MODERATE — RH tối đa ' + maxRH.toFixed(0) + '%: cần theo dõi đọng sương.'; }
    else { lvl = 'green'; msg = '🟢 LOW — RH tối đa ' + maxRH.toFixed(0) + '% dưới ngưỡng ngưng tụ.'; }
    badge.className = 'suggest-box ' + (lvl === 'green' ? 'ok' : '');
    badge.textContent = msg + ' Thoát hơi rau ' + transp_g_day.toFixed(1) + ' g/ngày vs thoát ra ngoài ' + flux_out.toFixed(1) + ' g/ngày ở ' + p.tempC + '°C, RH môi trường ' + (ambRH * 100).toFixed(0) + '%.';
  }
  const net_g = x => isFinite(x) ? x : 0;

  // 3) Sealability
  function m3Seal() {
    const f = films.find(x => x.film_id === $('m2Film').value);
    const box = $('m3SealBox');
    if (!f) { box.textContent = 'Chưa chọn film.'; return; }
    const win = M3_CFG.SEAL_WINDOWS[f.material];
    const temp = num($('m3SealTemp').value);
    const type = $('m3SealType').value;
    if (!win) {
      box.className = 'suggest-box';
      box.textContent = '⚠ Chất liệu ' + f.material + ' chưa có cửa nhiệt hàn trong cấu hình — dùng theo khuyến nghị nhà cung cấp.';
      return;
    }
    const [lo, hi] = win, tol = M3_CFG.SEAL_TOLERANCE;
    let lvl, msg;
    if (temp >= lo && temp <= hi) { lvl = 'ok'; msg = `🟢 SUITABLE — ${temp}°C nằm trong cửa khuyến nghị ${lo}–${hi}°C cho ${f.material}.`; }
    else if (temp >= lo - tol && temp <= hi + tol) { lvl = ''; msg = `🟡 NEEDS OPTIMIZATION — ${temp}°C ngoài cửa ${lo}–${hi}°C nhưng trong dung sai ±${tol}°C. Kiểm tra độ bền mạch hàn thực tế.`; }
    else { lvl = ''; msg = `🔴 NOT RECOMMENDED — ${temp}°C cách xa cửa ${lo}–${hi}°C cho ${f.material}: hàn không kín hoặc cháy màng.`; box.className = 'suggest-box'; box.style.background = 'var(--red-bg)'; box.style.color = 'var(--red)'; box.textContent = msg; return; }
    box.className = 'suggest-box ' + lvl;
    box.style.cssText = '';
    box.textContent = msg + ` Kiểu hàn: ${type}` + (num($('m3SealTime').value) ? `, thời gian ${$('m3SealTime').value}s` : '') + (num($('m3SealPressure').value) ? `, áp lực ${$('m3SealPressure').value} bar` : '') + (num($('m3SealWidth').value) ? `, bề rộng ${$('m3SealWidth').value}mm` : '') + '. Cửa nhiệt là literature — cần supplier confirmed.';
  }

  // ---------- M4: Trial / Experiment + shelf-life ----------
  const M4_CFG = { QUALITY_MIN: 3 }; // điểm chất lượng tối thiểu chấp nhận (thang 1-5) — configuration
  const LS_TRIALS = 'vnemap_trials_v1';
  let trials = [];
  let curTrial = -1;
  let m4Chart = null;

  function loadTrials() { try { trials = JSON.parse(localStorage.getItem(LS_TRIALS)) || []; } catch { trials = []; } }
  function saveTrials() { localStorage.setItem(LS_TRIALS, JSON.stringify(trials)); }

  // Tạo trial mới từ cấu hình hiện tại của form M2
  function m4Create() {
    const b = m3Base();
    if (b && b.err) { $('m4Msg').textContent = '⚠ ' + b.err; return; }
    if (!b) { $('m4Msg').textContent = '⚠ Chưa tải được engine/database.'; return; }
    const p = b.p;
    const code = ($('m4Code').value.trim()) || ('T-' + new Date().toISOString().slice(5, 10).replace('-', '') + '-' + (trials.length + 1));
    if (trials.some(t => t.code === code)) { $('m4Msg').textContent = '⚠ Mã trial đã tồn tại: ' + code; return; }
    const area = p._areaCm2 || 1;
    trials.push({
      code, created: new Date().toISOString(),
      design: {
        veg: p.veg, vegName: b.db2.rau[p.veg].ten_hien_thi,
        massG: p.massG, tempC: p.tempC,
        filmId: $('m2Film').value, filmLabel: b.db2.mang_OPP[p.filmKey]._label,
        bagW: p.bagW, bagL: p.bagL, sides: p.sides,
        holeD_um: p.holeD_um, nHoles: p.nHoles,
        densPerCm2: +(p.nHoles / area).toFixed(3), pattern: p._pattern, tech: p.tech
      },
      measurements: []
    });
    saveTrials();
    curTrial = trials.length - 1;
    $('m4Msg').textContent = '✓ Đã tạo trial "' + code + '" từ cấu hình M2.';
    renderM4();
  }

  function m4AddRow() {
    const t = trials[curTrial];
    if (!t) { $('m4Msg').textContent = '⚠ Chưa chọn trial.'; return; }
    const day = num($('m4Day').value);
    if (day == null) { $('m4Msg').textContent = '⚠ Nhập số ngày.'; return; }
    const row = {
      day,
      o2: num($('m4O2').value), co2: num($('m4CO2').value),
      tempC: num($('m4Temp').value), rh: num($('m4RH').value),
      weightG: num($('m4Weight').value),
      condensation: $('m4Cond').value, // none/light/heavy
      color: num($('m4Color').value), texture: num($('m4Texture').value),
      odor: num($('m4Odor').value), visual: num($('m4Visual').value),
      note: $('m4Note').value.trim() || null
    };
    const i = t.measurements.findIndex(m => m.day === day);
    if (i >= 0) t.measurements[i] = row; else { t.measurements.push(row); t.measurements.sort((a, b2) => a.day - b2.day); }
    saveTrials(); renderM4();
    $('m4Msg').textContent = '✓ Đã lưu mốc ngày ' + day + ' vào trial ' + t.code + '.';
  }

  function m4DelRow(i) {
    const t = trials[curTrial]; if (!t) return;
    t.measurements.splice(i, 1); saveTrials(); renderM4();
  }
  function m4Select(i) { curTrial = i; renderM4(); }
  function m4DelTrial() {
    const t = trials[curTrial]; if (!t) return;
    if (!confirm('Xoá trial "' + t.code + '"?')) return;
    trials.splice(curTrial, 1); curTrial = trials.length ? 0 : -1; saveTrials(); renderM4();
  }

  function m4ModelCurve(t) { // đường mô hình O2/CO2 cho trial (theo ngày)
    const E = window.VNEMAP_Engine, db2 = mergedFilmsDB();
    if (!E || !db2) return null;
    const fk = filmKeyOf(t.design.filmId);
    if (!db2.mang_OPP[fk]) return null;
    const res = E.integrate({
      veg: t.design.veg, massG: t.design.massG, tempC: t.design.tempC,
      filmKey: fk, sides: t.design.sides, bagW: t.design.bagW, bagL: t.design.bagL,
      freeVolML: 0, nHoles: t.design.nHoles, holeD_um: t.design.holeD_um,
      zoneLen: 20, zoneFromBottom: 2, tech: t.design.tech
    }, db2, 24 * 12); // 12 ngày
    return { days: res.t.map(h => h / 24), o2: res.o2arr, co2: res.co2arr };
  }

  function m4Acceptable(m, v) {
    return m.visual != null && m.visual >= M4_CFG.QUALITY_MIN &&
      (m.co2 == null || m.co2 <= v.CO2_canh_bao_do) &&
      (m.o2 == null || m.o2 >= 1);
  }

  function renderM4() {
    // danh sách trial
    $('m4TrialList').innerHTML = trials.map((t, i) =>
      `<span class="chip" style="cursor:pointer;${i === curTrial ? 'background:var(--primary);color:#fff;' : ''}" onclick="VNEMAP_PackUI.m4Select(${i})">${t.code} (${t.measurements.length} mốc)</span>`).join('') +
      (curTrial >= 0 ? ' <button class="use-btn danger" onclick="VNEMAP_PackUI.m4DelTrial()">Xoá trial hiện tại</button>' : '');
    const t = trials[curTrial];
    const body = $('m4Body'), concl = $('m4Conclusion');
    $('m4CalBtn').disabled = true; // bật lại khi trial có ≥3 mốc đo O2+CO2
    if (!t) {
      $('m4Info').textContent = 'Chưa có trial — cấu hình form M2 rồi bấm "TẠO TRIAL TỪ M2".';
      body.innerHTML = ''; concl.textContent = '—';
      if (m4Chart) { m4Chart.destroy(); m4Chart = null; }
      return;
    }
    const d = t.design;
    $('m4Info').textContent =
      `${t.code} · ${d.vegName} ${d.massG}g · ${d.filmLabel} · túi ${d.bagW}×${d.bagL}cm ${d.sides} mặt · ` +
      `D=${d.holeD_um}µm × ${d.nHoles} lỗ (${d.densPerCm2}/cm², ${d.pattern}) · ${d.tempC}°C · tạo ${new Date(t.created).toLocaleDateString('vi-VN')}`;

    body.innerHTML = t.measurements.map((m, i) => {
      const wl = m.weightG != null && d.massG ? ((d.massG - m.weightG) / d.massG * 100).toFixed(2) + '%' : '—';
      return `<tr><td>${m.day}</td><td>${m.o2 ?? '—'}</td><td>${m.co2 ?? '—'}</td><td>${m.tempC ?? '—'}</td>
        <td>${m.rh ?? '—'}</td><td>${wl}</td><td>${m.condensation || '—'}</td>
        <td>${m.visual ?? '—'}</td><td>${m.odor ?? '—'}</td>
        <td class="act"><button class="use-btn danger" onclick="VNEMAP_PackUI.m4DelRow(${i})">Xoá</button></td></tr>`;
    }).join('');

    // biểu đồ đo vs mô hình
    const model = m4ModelCurve(t);
    const days = t.measurements.map(m => m.day);
    const datasets = [
      { type: 'scatter', label: 'O2 đo', data: t.measurements.map(m => ({ x: m.day, y: m.o2 })), borderColor: '#0d4a3e', backgroundColor: '#0d4a3e', pointRadius: 4 },
      { type: 'scatter', label: 'CO2 đo', data: t.measurements.map(m => ({ x: m.day, y: m.co2 })), borderColor: '#b8862e', backgroundColor: '#b8862e', pointRadius: 4 }
    ];
    if (model) {
      datasets.push({ type: 'line', label: 'O2 mô hình', data: model.days.map((dy, i) => ({ x: dy, y: model.o2[i] })), borderColor: '#0d4a3e', borderDash: [5, 4], pointRadius: 0, tension: 0.3 });
      datasets.push({ type: 'line', label: 'CO2 mô hình', data: model.days.map((dy, i) => ({ x: dy, y: model.co2[i] })), borderColor: '#b8862e', borderDash: [5, 4], pointRadius: 0, tension: 0.3 });
    }
    const ctx = $('m4Chart').getContext('2d');
    if (m4Chart) m4Chart.destroy();
    m4Chart = new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        scales: {
          x: { type: 'linear', title: { display: true, text: 'Ngày' }, min: 0 },
          y: { title: { display: true, text: '%' }, min: 0, suggestedMax: 21 }
        },
        plugins: { legend: { position: 'top' } }
      }
    });

    // kết luận shelf-life
    const base = window.VNEMAP_DB, v = base && base.rau[d.veg];
    $('m4CalBtn').disabled = m4GasMeasurements(t).length < 3; // đủ điều kiện hiệu chỉnh
    if (!t.measurements.length) { concl.textContent = 'Chưa có mốc đo — nhập kết quả các ngày (0/1/3/5/7/10...).'; return; }
    let shelf = 0, failDay = null;
    for (const m of t.measurements) {
      if (m4Acceptable(m, v || { CO2_canh_bao_do: 1e9 })) { if (m.day > shelf) shelf = m.day; }
      else if (failDay == null) failDay = m.day;
    }
    const last = t.measurements[t.measurements.length - 1];
    let deviation = '';
    if (model) {
      const devs = t.measurements.filter(m => m.o2 != null).map(m => {
        const idx = Math.round(m.day * 48); // mô hình mẫu mỗi 0.5h
        return idx < model.o2.length ? Math.abs(m.o2 - model.o2[idx]) : null;
      }).filter(x => x != null);
      if (devs.length) deviation = ` Độ lệch O2 mô hình vs đo (trung bình): ${(devs.reduce((s, x) => s + x, 0) / devs.length).toFixed(2)}%.`;
    }
    concl.innerHTML = last.day === shelf && !failDay
      ? `<b>Kết quả ĐO thực nghiệm: shelf life ≥ ${shelf} ngày</b> (chất lượng ≥${M4_CFG.QUALITY_MIN}/5, khí trong ngưỡng an toàn ở mọi mốc).${deviation}<br><i>Đây là shelf-life được xác nhận bằng thực nghiệm — khác với dự đoán mô hình (đường nét đứt trên biểu đồ).</i>${last.day < 10 ? ' Cần đo thêm mốc xa hơn để chốt giới hạn trên.' : ''}`
      : `<b>Shelf life thực nghiệm ước tính: ${shelf} ngày</b> — mốc đầu tiên không đạt: ngày ${failDay} (chất lượng &lt;${M4_CFG.QUALITY_MIN}/5 hoặc khí vượt ngưỡng).${deviation}`;
  }

  // ---------- M5: Supplier profile + RFQ Generator ----------
  const LS_SUPPLIERS = 'vnemap_suppliers_v1';
  let suppliers = [];
  const SAMPLE_STATUS = {
    none: 'Chưa yêu cầu', requested: 'Đã yêu cầu', received: 'Đã nhận mẫu',
    testing: 'Đang test (M4)', approved: 'Đã duyệt'
  };

  function loadSuppliers() {
    try { suppliers = JSON.parse(localStorage.getItem(LS_SUPPLIERS)) || []; } catch { suppliers = []; }
    if (!suppliers.length) {
      // seed: chỉ tên + các trường để trống — KHÔNG tự bịa capability
      suppliers = [{ name: 'Law Packaging', contact: '', films: [], perforation: 'micro', minThick_um: null,
        maxWidth_mm: null, holeD_min: null, holeD_max: null, printing: '', seal: '', quotation: '',
        sample_status: 'none', trial_status: '', notes: 'Seed mặc định — bổ sung capability thực tế từ nhà cung cấp.' }];
      saveSuppliers();
    }
  }
  function saveSuppliers() { localStorage.setItem(LS_SUPPLIERS, JSON.stringify(suppliers)); }

  function renderM5() {
    $('supList').innerHTML = suppliers.map((s, i) =>
      `<span class="chip" style="cursor:pointer;${i === curSupplier ? 'background:var(--primary);color:#fff;' : ''}" onclick="VNEMAP_PackUI.supSelect(${i})">${s.name}${s.sample_status && s.sample_status !== 'none' ? ' · ' + SAMPLE_STATUS[s.sample_status] : ''}</span>`).join('');
    const s = suppliers[curSupplier];
    if (!s) { $('supForm').reset && $('supForm').reset(); return; }
    $('supName').value = s.name; $('supContact').value = s.contact || '';
    $('supFilms').value = (s.films || []).join(', ');
    $('supPerf').value = s.perforation || '';
    $('supMinThick').value = s.minThick_um ?? ''; $('supMaxWidth').value = s.maxWidth_mm ?? '';
    $('supHoleDMin').value = s.holeD_min ?? ''; $('supHoleDMax').value = s.holeD_max ?? '';
    $('supPrinting').value = s.printing || ''; $('supSeal').value = s.seal || '';
    $('supQuotation').value = s.quotation || ''; $('supSampleStatus').value = s.sample_status || 'none';
    $('supTrialStatus').value = s.trial_status || ''; $('supNotes').value = s.notes || '';
  }
  let curSupplier = 0;

  function supSave() {
    const name = $('supName').value.trim();
    if (!name) { $('supMsg').textContent = '⚠ Thiếu tên nhà cung cấp.'; return; }
    const rec = {
      name, contact: $('supContact').value.trim(),
      films: $('supFilms').value.split(',').map(x => x.trim()).filter(Boolean),
      perforation: $('supPerf').value, minThick_um: num($('supMinThick').value),
      maxWidth_mm: num($('supMaxWidth').value), holeD_min: num($('supHoleDMin').value), holeD_max: num($('supHoleDMax').value),
      printing: $('supPrinting').value.trim(), seal: $('supSeal').value.trim(),
      quotation: $('supQuotation').value.trim(), sample_status: $('supSampleStatus').value,
      trial_status: $('supTrialStatus').value.trim(), notes: $('supNotes').value.trim()
    };
    if (curSupplier >= 0 && suppliers[curSupplier]) suppliers[curSupplier] = rec;
    else suppliers.push(rec);
    saveSuppliers(); renderM5();
    $('supMsg').textContent = '✓ Đã lưu nhà cung cấp "' + name + '".';
  }
  function supAdd() {
    suppliers.push({ name: 'NCC mới', contact: '', films: [], perforation: 'micro', minThick_um: null, maxWidth_mm: null,
      holeD_min: null, holeD_max: null, printing: '', seal: '', quotation: '', sample_status: 'none', trial_status: '', notes: '' });
    curSupplier = suppliers.length - 1;
    saveSuppliers(); renderM5();
  }
  function supSelect(i) { curSupplier = i; renderM5(); }

  // RFQ Generator — từ cấu hình M2 hiện tại + effective transfer (M3)
  function buildRFQ() {
    const b = m3Base();
    if (b && b.err) { $('rfqOut').value = '⚠ ' + b.err; return; }
    if (!b) { $('rfqOut').value = '⚠ Chưa tải được engine/database.'; return; }
    const { E, db2, p } = b;
    const v = db2.rau[p.veg], f = db2.mang_OPP[p.filmKey];
    const c = E.buildConductances({ ...p, tempC: p.tempC }, db2);
    const area = p._areaCm2 || 1;
    const sup = suppliers[curSupplier];
    const trial = trials[curTrial];
    const mat = (films.find(x => x.film_id === $('m2Film').value) || {}).material || f._label.split(' ')[0].replace(/[0-9µ]/g, '');
    const sealWin = M3_CFG.SEAL_WINDOWS[mat];
    const patternTxt = $('m2Pattern').selectedOptions[0] ? $('m2Pattern').selectedOptions[0].textContent : p._pattern;
    const lines = [
      `RFQ – Bao bì rau quả vi đục lỗ (Micro-Perforated Vegetable Packaging)`,
      `Ngày: ${new Date().toLocaleDateString('vi-VN')}`,
      `Nhà cung cấp đề xuất: ${sup ? sup.name : '(chọn ở danh sách)'}`,
      ``,
      `1. Sản phẩm: ${v.ten_hien_thi} — khối lượng tịnh ${p.massG} g`,
      `2. Film: ${f._label}`,
      `3. Độ dày màng: ${f.do_day_micron} µm`,
      `4. Lỗ vi mô: D = ${p.holeD_um} µm × ${p.nHoles} lỗ/túi (${(p.nHoles / area).toFixed(3)} lỗ/cm² · ${Math.round(p.nHoles / area * 1e4)} lỗ/m²) — Pattern: ${patternTxt} — Công nghệ: ${p.tech === 'laser' ? 'Laser' : 'Kim cơ'}`,
      `5. Túi: ${p.bagW} × ${p.bagL} cm, đục ${p.sides} mặt`,
      `6. Nhiệt độ bảo quản: ${p.tempC}°C`,
      `7. Yêu cầu vận chuyển khí HIỆU DỤNG CỦA BAO BÌ (gồm cả lỗ, tính ở ${p.tempC}°C — mô phỏng, cần xác nhận bằng đo):`,
      `   - O₂ : ${(c.G_total_O2).toFixed(0)} mL/túi.ngày (màng ${(c.G_film_O2).toFixed(0)} + lỗ ${(c.G_holes_O2).toFixed(0)})`,
      `   - CO₂: ${(c.G_total_CO2).toFixed(0)} mL/túi.ngày`,
      `   - H₂O: ${(c.G_total_H2O).toFixed(0)} g/túi.ngày`,
      `   Lưu ý: đây là effective package gas transfer, KHÔNG phải OTR màng nguyên.`,
      `8. Yêu cầu hàn: ${$('m3SealType').selectedOptions[0]?.textContent || 'Heat seal'}${sealWin ? ` — cửa nhiệt khuyến nghị ${mat}: ${sealWin[0]}–${sealWin[1]}°C` : ''} (chi tiết ở M3)`,
      `9. In ấn: ${sup && sup.printing ? sup.printing : '(ghi yêu cầu in)'}`,
      `10. MOQ: (điền)`,
      `11. Yêu cầu mẫu: 100–200 túi mẫu để A/B test 7–10 ngày ở ${p.tempC}°C${trial ? ` (đối chiếu trial "${trial.code}" trong hệ thống)` : ''}`,
      ``,
      `Số liệu kỹ thuật do công cụ VN-EMAP Designer (mô hình MAP v3) tính — mang tính tham khảo, cần xác nhận bằng thực nghiệm.`
    ];
    $('rfqOut').value = lines.join('\n');
    $('supMsg').textContent = '✓ Đã tạo RFQ từ cấu hình M2.';
  }

  function rfqCopy() {
    const txt = $('rfqOut').value;
    if (!txt) return;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
      .then(() => { $('supMsg').textContent = '✓ Đã copy RFQ vào clipboard.'; })
      .catch(() => { $('rfqOut').select(); document.execCommand('copy'); $('supMsg').textContent = '✓ Đã copy RFQ.'; });
  }
  function rfqDownload() {
    const txt = $('rfqOut').value;
    if (!txt) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
    a.download = 'RFQ_vnemap_' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click(); URL.revokeObjectURL(a.href);
  }

  // ---------- Sub-tab M1-M5 (redesign 1.1): ẩn/hiện qua display, giữ nguyên DOM → không mất dữ liệu ----------
  let packMilestone = 1;
  function setPackMilestone(m) {
    packMilestone = m;
    for (let i = 1; i <= 5; i++) {
      $('msub' + i).style.display = (i === m) ? '' : 'none';
      $('subtab' + i).classList.toggle('active', i === m);
    }
    window.scrollTo({ top: 0 });
  }

  // ---------- Việc A (calibration plan): đề xuất hiệu chỉnh Km_O2 / k_CO2_uc_che từ trial M4 ----------
  // Grid search 2 tham số — KHÔNG tự động ghi đè database.json, chỉ đề xuất qua xác nhận tay.
  function m4GasMeasurements(t) { return t.measurements.filter(m => m.o2 != null && m.co2 != null); }

  function sampleAt(sim, hour) { // nội suy đường cong mô hình tại đúng giờ đo
    const idx = hour / 0.5; // sim lấy mẫu mỗi 0.5h
    const i0 = Math.floor(idx), i1 = Math.min(i0 + 1, sim.o2arr.length - 1);
    const f = idx - i0;
    return {
      o2: sim.o2arr[i0] + (sim.o2arr[i1] - sim.o2arr[i0]) * f,
      co2: sim.co2arr[i0] + (sim.co2arr[i1] - sim.co2arr[i0]) * f
    };
  }

  function calibrateFromTrial(trial) {
    const E = window.VNEMAP_Engine, db2 = mergedFilmsDB();
    if (!E || !db2) return { err: 'Chưa tải được engine/database.' };
    const measured = m4GasMeasurements(trial);
    if (measured.length < 3) return { err: 'Cần ≥ 3 mốc đo có CẢ O2 lẫn CO2 mới đủ chạy khớp đường cong.' };
    const d = trial.design;
    const v = db2.rau[d.veg];
    const fk = filmKeyOf(d.filmId);
    if (!db2.mang_OPP[fk]) return { err: 'Film của trial không còn trong hệ thống.' };
    const params = { veg: d.veg, massG: d.massG, tempC: d.tempC, filmKey: fk, sides: d.sides,
      bagW: d.bagW, bagL: d.bagL, freeVolML: 0, nHoles: d.nHoles, holeD_um: d.holeD_um,
      zoneLen: 20, zoneFromBottom: 2, tech: d.tech };
    const horizon = Math.max(measured[measured.length - 1].day * 24, 24);
    let best = null, bestErr = Infinity;
    for (let km = 0.5; km <= 6.0001; km += 0.25) {
      for (let kco2 = 3; kco2 <= 20.0001; kco2 += 1) {
        const testV = { ...v, Km_O2: km, k_CO2_uc_che: kco2 };
        const sim = E.integrate(params, { ...db2, rau: { ...db2.rau, [d.veg]: testV } }, horizon);
        let err = 0;
        measured.forEach(m => {
          const s = sampleAt(sim, m.day * 24);
          err += Math.pow(s.o2 - m.o2, 2) + Math.pow(s.co2 - m.co2, 2);
        });
        if (err < bestErr) { bestErr = err; best = { km: +km.toFixed(2), kco2: +kco2.toFixed(1), rmse: +Math.sqrt(err / (2 * measured.length)).toFixed(3) }; }
      }
    }
    // đếm số trial độc lập cùng loại rau cũng đủ điều kiện — để khuyến nghị độ tin cậy
    const sameVegTrials = trials.filter(t => t !== trial && t.design.veg === d.veg && m4GasMeasurements(t).length >= 3).length;
    return { best, v, n: measured.length, sameVegTrials };
  }

  let lastCalResult = null;
  function m4Calibrate() {
    const t = trials[curTrial];
    const box = $('m4CalOut');
    if (!t) { box.textContent = 'Chưa chọn trial.'; return; }
    $('m4CalSpinner').style.display = '';
    box.textContent = 'Đang quét lưới Km_O2 × k_CO2_uc_che (414 tổ hợp)...';
    setTimeout(() => {
      const t0 = performance.now();
      const r = calibrateFromTrial(t);
      $('m4CalSpinner').style.display = 'none';
      if (r.err) { box.className = 'suggest-box'; box.textContent = '⚠ ' + r.err; lastCalResult = null; return; }
      lastCalResult = { trialCode: t.code, ...r };
      const { best, v, n, sameVegTrials } = r;
      const enoughTrials = sameVegTrials >= 2; // ≥3 trial độc lập tính cả trial hiện tại
      box.className = 'suggest-box';
      box.innerHTML = `
        <b>Km_O2 hiện tại: ${v.Km_O2} → Đề xuất: ${best.km}</b> (trial "${t.code}", ${n} mốc đo O2+CO2, RMSE: ${best.rmse}%)<br>
        <b>k_CO2_uc_che hiện tại: ${v.k_CO2_uc_che} → Đề xuất: ${best.kco2}</b><br>
        Thời gian quét: ${(performance.now() - t0).toFixed(0)}ms.<br>
        ${enoughTrials
          ? `Đã có ${sameVegTrials + 1} trial đủ điều kiện cho ${v.ten_hien_thi} — vẫn nên xem lại giá trị có hợp lý không trước khi cập nhật.`
          : `⚠ Chỉ ${sameVegTrials + 1} trial cho loại rau này — chưa đủ để cập nhật chính thức. Khuyến nghị: thu thập thêm 2-4 trial tương tự trước khi sửa database.json.`}<br>
        <i>Không tự động áp dụng — xem lại giá trị đề xuất, nếu chấp nhận thì sửa tay database.json (rồi chạy <code>node sync-inline-db.mjs</code>).</i>
        <br><button class="btn-line" onclick="VNEMAP_PackUI.m4CalExport()">XUẤT ĐỀ XUẤT RA .TXT</button>`;
    }, 30);
  }

  function m4CalExport() {
    if (!lastCalResult) return;
    const { trialCode, best, v, n, sameVegTrials } = lastCalResult;
    const t = trials.find(x => x.code === trialCode);
    const txt = [
      'VN-EMAP Designer — Đề xuất hiệu chỉnh hằng số (từ M4 Trial)',
      'Ngày: ' + new Date().toLocaleString('vi-VN'),
      'Trial: ' + trialCode,
      'Rau: ' + v.ten_hien_thi + ' (' + (t ? t.design.veg : '') + ')',
      'Số mốc đo O2+CO2: ' + n + ' | Trial độc lập cùng rau: ' + (sameVegTrials + 1),
      '',
      'Mốc đo đã dùng:',
      ...(t ? t.measurements.filter(m => m.o2 != null && m.co2 != null)
            .map(m => `  Ngày ${m.day}: O2 ${m.o2}% · CO2 ${m.co2}%`) : []),
      '',
      `Km_O2:        hiện tại ${v.Km_O2}  →  đề xuất ${best.km}`,
      `k_CO2_uc_che: hiện tại ${v.k_CO2_uc_che}  →  đề xuất ${best.kco2}`,
      `RMSE (O2+CO2): ${best.rmse}%`,
      '',
      '⚠ Đề xuất từ ' + (sameVegTrials + 1) + ' trial — KHÔNG tự động áp dụng.',
      'Nếu chấp nhận: sửa tay database.json (field Km_O2 / k_CO2_uc_che của rau này),',
      'sau đó chạy: node sync-inline-db.mjs'
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
    a.download = 'VNEMAP_calibration_' + trialCode + '_' + Date.now() + '.txt';
    a.click(); URL.revokeObjectURL(a.href);
  }

  // expose cho inline onclick
  const VNEMAP_PackUI = { saveFilm, editFilm, deleteFilm, densityConvert, setAppTab, m2Run, m2Scan, useM2Config, m3Eff, m3Moist, m3Seal, m4Create, m4AddRow, m4DelRow, m4Select, m4DelTrial, supSave, supAdd, supSelect, buildRFQ, rfqCopy, rfqDownload, setPackMilestone, m4Calibrate, m4CalExport, filmFilterChanged, toggleFilmTable };
  window.VNEMAP_PackUI = VNEMAP_PackUI;
  window.VNEMAP_Pack = { CONFIDENCE_LEVELS, validateFilm, loadPackDB, getFilms: () => films };

  (async function init() {
    await loadPackDB();
    loadTrials();
    loadSuppliers();
    if (trials.length && curTrial < 0) curTrial = 0; // mở lại trial gần nhất sau reload
    renderMaterials();
    renderFilmForm();
    renderFilms();
    densityConvert();
    // M2/M4 render sau khi app.js đã gán window.VNEMAP_DB
    const waitDb = () => {
      if (window.VNEMAP_DB) { renderM2(); renderM4(); renderM5(); }
      else setTimeout(waitDb, 150);
    };
    waitDb();
    setAppTab('map');
  })();
})();
