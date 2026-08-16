(function () {
  'use strict';
  const E = window.VNEMAP_Engine;
  let DB = null;
  let chartInstance = null;

  const $ = (id) => document.getElementById(id);
  const LS_KEY = 'vnemap_scenarios_v2';

  // ---- Load external database ----
  // Thứ tự ưu tiên: fetch (có server) → bản nhúng nguyên văn trong index.html
  // (#db-inline, do sync-inline-db.mjs đồng bộ) → object 7 rau tối thiểu (lưới an toàn cuối).
  let DB_SOURCE = 'fetch';
  function showBanner(kind) { // 'info' = offline đầy đủ, 'warn' = dữ liệu rút gọn
    const banner = document.createElement('div');
    if (kind === 'info') {
      banner.style.cssText = 'background:var(--primary-soft);color:var(--primary);border:1px solid var(--line);border-radius:8px;padding:12px 16px;font-size:13px;line-height:1.55;margin:0 0 4px';
      banner.innerHTML = '<b>ℹ Đang chạy ở chế độ offline (không có server)</b> — dùng dữ liệu nhúng sẵn trong file. Đầy đủ chức năng, không cần kết nối mạng.';
    } else {
      banner.style.cssText = 'background:#fdf1d9;color:#a3720b;border:1px solid #e8cd8e;border-radius:8px;padding:12px 16px;font-size:13px;line-height:1.55;margin:0 0 4px';
      banner.innerHTML = '<b>⚠ Đang dùng dữ liệu RÚT GỌN (7 rau, 3 màng OPP)</b> — không tải được database.json lẫn bản nhúng trong HTML (file hỏng/thiếu?).<br>Nhân bản lại file index.html nguyên vẹn, hoặc mở qua HTTP server.';
    }
    const grid = document.querySelector('.wrap');
    grid.insertBefore(banner, grid.firstChild);
  }
  async function loadDB() {
    try {
      const res = await fetch('database.json');
      if (!res.ok) throw new Error(res.status);
      DB = await res.json();
      DB_SOURCE = 'fetch';
    } catch (e) {
      const inline = document.getElementById('db-inline');
      if (inline) {
        DB = JSON.parse(inline.textContent);
        DB_SOURCE = 'inline';
        console.warn('database.json không fetch được (mở qua file://?), dùng bản nhúng sẵn trong HTML.');
        showBanner('info');
      } else {
      // fallback cuối cùng nếu cả script nhúng cũng thiếu — 7 rau làm lưới an toàn
      DB = {
        rau: {
          xa_lach:     {ten_hien_thi:'Xà lách',R_O2_10C:15,Q10:2.5,RQ:1.0,O2_opt_min:1,O2_opt_max:3,CO2_opt_max:10,CO2_canh_bao_do:15,O2_LOL:0.5,Km_O2:2.0,k_CO2_uc_che:8.0,mat_do_khoi_kg_m3:80,toc_do_mat_nuoc_pct_ngay:3.5,RH_toi_uu_max:95,do_tin_cay:''},
          rau_muong:   {ten_hien_thi:'Rau muống',R_O2_10C:35,Q10:2.5,RQ:1.0,O2_opt_min:2,O2_opt_max:5,CO2_opt_max:10,CO2_canh_bao_do:15,O2_LOL:1.0,Km_O2:2.5,k_CO2_uc_che:8.0,mat_do_khoi_kg_m3:120,toc_do_mat_nuoc_pct_ngay:4.5,RH_toi_uu_max:92,do_tin_cay:''},
          cai_bo_xoi:  {ten_hien_thi:'Cải bó xôi',R_O2_10C:40,Q10:2.5,RQ:1.0,O2_opt_min:5,O2_opt_max:10,CO2_opt_max:15,CO2_canh_bao_do:20,O2_LOL:1.0,Km_O2:3.0,k_CO2_uc_che:10.0,mat_do_khoi_kg_m3:100,toc_do_mat_nuoc_pct_ngay:4.0,RH_toi_uu_max:95,do_tin_cay:''},
          bong_cai_xanh:{ten_hien_thi:'Bông cải xanh',R_O2_10C:42,Q10:2.3,RQ:1.0,O2_opt_min:1,O2_opt_max:2,CO2_opt_max:10,CO2_canh_bao_do:15,O2_LOL:0.5,Km_O2:1.5,k_CO2_uc_che:6.0,mat_do_khoi_kg_m3:250,toc_do_mat_nuoc_pct_ngay:3.0,RH_toi_uu_max:92,do_tin_cay:''},
          nam_rom:     {ten_hien_thi:'Nấm rơm',R_O2_10C:30,Q10:2.5,RQ:1.0,O2_opt_min:5,O2_opt_max:15,CO2_opt_max:15,CO2_canh_bao_do:20,O2_LOL:1.0,Km_O2:3.0,k_CO2_uc_che:10.0,mat_do_khoi_kg_m3:300,toc_do_mat_nuoc_pct_ngay:5.5,RH_toi_uu_max:90,do_tin_cay:''},
          gia_do:      {ten_hien_thi:'Giá đỗ',R_O2_10C:70,Q10:2.6,RQ:1.1,O2_opt_min:3,O2_opt_max:8,CO2_opt_max:10,CO2_canh_bao_do:15,O2_LOL:1.5,Km_O2:4.0,k_CO2_uc_che:8.0,mat_do_khoi_kg_m3:450,toc_do_mat_nuoc_pct_ngay:6.0,RH_toi_uu_max:98,do_tin_cay:''},
          rau_hon_hop: {ten_hien_thi:'Rau hỗn hợp',R_O2_10C:25,Q10:2.5,RQ:1.0,O2_opt_min:3,O2_opt_max:8,CO2_opt_max:10,CO2_canh_bao_do:15,O2_LOL:1.0,Km_O2:2.5,k_CO2_uc_che:8.0,mat_do_khoi_kg_m3:150,toc_do_mat_nuoc_pct_ngay:4.0,RH_toi_uu_max:93,do_tin_cay:''}
        },
        mang_OPP: {
          OPP_20micron:{do_day_micron:20,OTR_23C:2250,CTR_23C:5000,WVTR_23C:8.0,he_so_Arrhenius_nhiet_do_per_C:1.035},
          OPP_25micron:{do_day_micron:25,OTR_23C:1800,CTR_23C:4000,WVTR_23C:6.5,he_so_Arrhenius_nhiet_do_per_C:1.035},
          OPP_30micron:{do_day_micron:30,OTR_23C:1500,CTR_23C:3330,WVTR_23C:5.0,he_so_Arrhenius_nhiet_do_per_C:1.035}
        }
      };
      DB_SOURCE = 'hardcoded_minimal';
      console.warn('Không tải được database.json lẫn bản nhúng — dùng 7 rau tối thiểu.', e);
      showBanner('warn');
      }
    }
    window.VNEMAP_DB_SOURCE = DB_SOURCE;
  }

  function populateSelects() {
    const vegSel = $('veg');
    // gom theo nhóm (nhom) — các entry cũ không có nhom về nhóm "Cơ bản"
    const groups = new Map();
    Object.keys(DB.rau).forEach(k => {
      const g = DB.rau[k].nhom || 'Cơ bản (đã hiệu chỉnh)';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(k);
    });
    for (const [g, keys] of groups) {
      const og = document.createElement('optgroup');
      og.label = g;
      keys.forEach(k => {
        const o = document.createElement('option');
        o.value = k; o.textContent = DB.rau[k].ten_hien_thi;
        og.appendChild(o);
      });
      vegSel.appendChild(og);
    }
    vegSel.value = 'gia_do';
    vegSel.addEventListener('change', updateVegNote);
    updateVegNote();

    const filmSel = $('filmThick');
    Object.keys(DB.mang_OPP).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = DB.mang_OPP[k].do_day_micron + ' micron';
      filmSel.appendChild(o);
    });
    filmSel.value = 'OPP_25micron';
  }

  function updateVegNote() {
    const v = DB.rau[$('veg').value];
    $('vegNote').textContent =
      `R_O2 @10°C = ${v.R_O2_10C} mL/kg.h · O2 ${v.O2_opt_min}-${v.O2_opt_max}%, CO2 ≤${v.CO2_opt_max}% · RH tối ưu ≤${v.RH_toi_uu_max}%` +
      (v.do_tin_cay ? ` · ⚠ ${v.do_tin_cay}` : '');
  }

  // ---- Temperature profile (Feature A) ----
  const TEMP_PRESETS = {
    cold:  [{ h: 0, c: 6 }, { h: 72, c: 6 }],
    abuse: [{ h: 0, c: 6 }, { h: 2, c: 15 }, { h: 4, c: 8 }, { h: 7, c: 25 }, { h: 72, c: 25 }],
    flat:  null // use the single temp input as constant
  };
  let currentProfile = TEMP_PRESETS.cold.slice();

  function renderProfileList() {
    const ul = $('profileList');
    ul.innerHTML = '';
    currentProfile.forEach((pt, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="ph">Giờ ${pt.h}</span>
        <input type="number" value="${pt.h}" min="0" max="72" step="1" data-i="${i}" data-k="h" style="width:70px" onchange="onProfileEdit(this)">
        <input type="number" value="${pt.c}" step="0.5" data-i="${i}" data-k="c" style="width:70px" onchange="onProfileEdit(this)">
        <span style="font-size:12px;color:#7c8a83">°C</span>
        <button class="del" onclick="removeProfilePoint(${i})">X</button>`;
      ul.appendChild(li);
    });
  }
  function onProfileEdit(el) {
    const i = +el.dataset.i, k = el.dataset.k;
    currentProfile[i][k] = parseFloat(el.value);
    currentProfile.sort((a, b) => a.h - b.h);
    renderProfileList();
    runCalc();
  }
  function addProfilePoint() {
    const last = currentProfile[currentProfile.length - 1] || { h: 0, c: 8 };
    currentProfile.push({ h: Math.min(last.h + 6, 72), c: 8 });
    currentProfile.sort((a, b) => a.h - b.h);
    renderProfileList();
    runCalc();
  }
  function removeProfilePoint(i) {
    if (currentProfile.length <= 1) return;
    currentProfile.splice(i, 1);
    renderProfileList();
    runCalc();
  }
  function setConstTemp(c) {
    document.getElementById('temp').value = c;
    currentProfile = null; // constant mode, driven by #temp
    document.getElementById('temp').disabled = false;
    renderProfileList();
    runCalc();
  }

  function applyTempPreset(type) {
    document.querySelectorAll('#profileList').forEach(() => {});
    if (type === 'flat') {
      currentProfile = null; // constant mode, driven by #temp
      document.getElementById('temp').disabled = false;
    } else {
      currentProfile = TEMP_PRESETS[type].slice();
      document.getElementById('temp').disabled = true;
    }
    renderProfileList();
    runCalc();
  }

  function syncHoleInput(v) { $('nHoles').value = v; $('nHolesNum').value = v; $('nHolesVal').textContent = v; runCalc(); }
  function syncHoleSlider(v) { $('nHoles').value = v; $('nHolesVal').textContent = v; runCalc(); }

  function readParams() {
    return {
      veg: $('veg').value,
      massG: parseFloat($('mass').value),
      tempC: parseFloat($('temp').value),
      tempProfile: currentProfile, // may be null -> engine falls back to tempC
      filmKey: $('filmThick').value,
      sides: parseInt($('sides').value),
      bagW: parseFloat($('bagW').value),
      bagL: parseFloat($('bagL').value),
      freeVolML: parseFloat($('freeVol').value) || 0,
      nHoles: parseFloat($('nHolesNum').value),
      holeD_um: parseFloat($('holeD').value),
      zoneLen: parseFloat($('zoneLen').value),
      zoneFromBottom: parseFloat($('zoneFromBottom').value),
      tech: $('tech').value
    };
  }

  function statusFor(res) {
    const v = res.v;
    const pk = res.peak || {};
    // Abuse-test: check breach at ANY time, not just final equilibrium.
    if ((pk.co2Max != null && pk.co2Max > v.CO2_canh_bao_do) ||
        (pk.o2Min != null && pk.o2Min < 1) ||
        res.finalO2 < 1 || res.finalCO2 > v.CO2_canh_bao_do) {
      let msg;
      if ((pk.co2Max != null && pk.co2Max > v.CO2_canh_bao_do) && (pk.co2MaxHr != null)) {
        msg = `NGUY HIỂM (abuse): CO2 đạt đỉnh ${pk.co2Max.toFixed(1)}% vượt ngưỡng ${v.CO2_canh_bao_do}% tại giờ thứ ${pk.co2MaxHr.toFixed(0)} khi nhiệt độ lên ${pk.co2MaxT.toFixed(0)}°C.`;
      } else if (pk.o2Min != null && pk.o2Min < 1 && pk.o2MinHr != null) {
        msg = `NGUY HIỂM (abuse): O2 tụt xuống ${pk.o2Min.toFixed(1)}% (< 1%) tại giờ thứ ${pk.o2MinHr.toFixed(0)} khi nhiệt độ ${pk.o2MinT.toFixed(0)}°C — nguy cơ yếm khí.`;
      } else {
        msg = res.finalCO2 > v.CO2_canh_bao_do ? `NGUY HIỂM: CO2 vượt ngưỡng gây tổn thương mô (${v.CO2_canh_bao_do}%).` : 'NGUY HIỂM: O2 dưới 1% — nguy cơ yếm khí, thối rữa nhanh.';
      }
      return { s: 'red', msg };
    }
    if (res.finalO2 < v.O2_opt_min || res.finalO2 > v.O2_opt_max || res.finalCO2 > v.CO2_opt_max || res.finalRH > v.RH_toi_uu_max)
      return { s: 'yellow', msg: 'CẢNH BÁO: nồng độ khí hoặc độ ẩm ngoài khoảng tối ưu khuyến nghị.' };
    return { s: 'green', msg: 'An toàn — O2/CO2/độ ẩm trong ngưỡng khuyến nghị.' };
  }

  function drawChart(res, scenarios) {
    const ctx = $('chart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    const datasets = [
      { label: 'O2 %', data: res.o2arr, borderColor: '#0d4a3e', backgroundColor: 'rgba(13,74,62,0.08)', fill: true, tension: 0.25, pointRadius: 0, borderWidth: 2, yAxisID: 'y' },
      { label: 'CO2 %', data: res.co2arr, borderColor: '#b8862e', backgroundColor: 'rgba(184,134,46,0.08)', fill: true, tension: 0.25, pointRadius: 0, borderWidth: 2, yAxisID: 'y' },
      { label: 'RH %', data: res.rharr, borderColor: '#2a6fb0', borderDash: [5, 4], tension: 0.25, pointRadius: 0, borderWidth: 1.5, yAxisID: 'y' },
      { label: 'Nhiệt độ °C', data: res.temparr, borderColor: '#b3261e', borderDash: [2, 2], tension: 0.2, pointRadius: 0, borderWidth: 1.5, yAxisID: 'y1' }
    ];
    const colors = ['#9b2d8f', '#c0392b', '#16a085', '#8e44ad'];
    (scenarios || []).forEach((sc, i) => {
      datasets.push({ label: 'O2 · ' + sc.name, data: sc.res.o2arr, borderColor: colors[i % colors.length], tension: 0.25, pointRadius: 0, borderWidth: 1.5, yAxisID: 'y' });
      datasets.push({ label: 'CO2 · ' + sc.name, data: sc.res.co2arr, borderColor: colors[i % colors.length], borderDash: [4, 3], tension: 0.25, pointRadius: 0, borderWidth: 1.5, yAxisID: 'y' });
    });
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels: res.t.map(x => x.toFixed(0)), datasets },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Thời gian (giờ)' } },
          y: { title: { display: true, text: 'Nồng độ / độ ẩm (%)' }, min: 0, position: 'left' },
          y1: { title: { display: true, text: 'Nhiệt độ (°C)' }, position: 'right', grid: { drawOnChartArea: false } }
        },
        plugins: { legend: { position: 'top' } }
      }
    });
  }

  function suggestAdjustment(res, base) {
    const box = $('suggestBox');
    const v = res.v;
    if (res.finalO2 >= v.O2_opt_min && res.finalO2 <= v.O2_opt_max && res.finalCO2 <= v.CO2_opt_max) {
      box.className = 'suggest-box ok';
      box.innerHTML = '<b>✓ Cấu hình hiện tại đạt yêu cầu.</b> Không cần điều chỉnh số lỗ. Có thể tăng thêm 10-15% số lỗ làm dự phòng biến động nhiệt độ chuỗi lạnh.';
      return;
    }
    box.className = 'suggest-box';
    if (res.finalO2 < v.O2_opt_min) {
      const found = E.optimizeHoles(base, DB, { max: 400, step: 5 });
      box.innerHTML = found
        ? `<b>⚠ O2 quá thấp (${res.finalO2.toFixed(2)}% &lt; ${v.O2_opt_min}%) — nguy cơ yếm khí.</b> Thử tăng lên khoảng <b>${found} lỗ</b> (hiện ${base.nHoles}) để đưa O2 vào khoảng an toàn.`
        : `<b>⚠ O2 quá thấp (${res.finalO2.toFixed(2)}%).</b> Tăng lỗ tới +400 chưa đủ — cân nhắc màng mỏng hơn (20 micron) hoặc tăng đường kính lỗ.`;
    } else if (res.finalO2 > v.O2_opt_max) {
      box.innerHTML = `<b>ℹ Có thể đục lỗ nhiều hơn cần thiết</b> (O2 ${res.finalO2.toFixed(2)}% &gt; ${v.O2_opt_max}%). Cân nhắc giảm số lỗ hoặc thu hẹp vùng đục để tiết kiệm và giảm mất ẩm/héo mép lá.`;
    } else if (res.finalCO2 > v.CO2_opt_max) {
      const found = E.optimizeHoles(base, DB, { max: 400, step: 5 });
      box.innerHTML = found
        ? `<b>⚠ CO2 vượt ngưỡng tối ưu (${res.finalCO2.toFixed(2)}% &gt; ${v.CO2_opt_max}%).</b> Thử tăng lên khoảng <b>${found} lỗ</b>.`
        : `<b>⚠ CO2 vượt ngưỡng tối ưu.</b> Cần tăng đáng kể số lỗ/đường kính lỗ — kiểm tra lại khối lượng rau có quá tải.`;
      if (res.finalRH > v.RH_toi_uu_max) {
        box.innerHTML += `<br><b>💧 Độ ẩm trong túi ${res.finalRH.toFixed(0)}% &gt; ${v.RH_toi_uu_max}%</b> — nguy cơ đọng sương/mốc; cân nhắc giảm độ kín màng hoặc tăng lỗ.`;
      }
    }
  }

  function buildSpecSummary(p, res) {
    const f = DB.mang_OPP[p.filmKey];
    const profTxt = (p.tempProfile && p.tempProfile.length)
      ? p.tempProfile.map(pt => `${pt.h}h:${pt.c}°C`).join(' → ')
      : `Cố định ${p.tempC}°C`;
    const text = `Túi OPP ${f.do_day_micron}, ${p.bagW}x${p.bagL}cm, ${p.sides === 2 ? 'đục 2 mặt' : 'đục 1 mặt'}
Vùng đục: dài ${p.zoneLen}cm, cách đáy ${p.zoneFromBottom}cm
Tổng số lỗ: ${p.nHoles} lỗ, D=${p.holeD_um} micron
Công nghệ: ${p.tech === 'laser' ? 'Laser' : 'Kim cơ'}
Nhiệt độ: ${profTxt}
Mã lô: ${p.lotNote || '(chưa nhập)'}
Kết quả: O2 ${res.finalO2.toFixed(2)}% / CO2 ${res.finalCO2.toFixed(2)}% / RH ${res.finalRH.toFixed(0)}%`;
    $('specSummary').textContent = text;

    const tbl = $('printTable');
    const rows = [
      ['Chất liệu túi', `OPP ${f.do_day_micron} micron`],
      ['Kích thước túi', `${p.bagW} x ${p.bagL} cm`],
      ['Trao đổi khí', p.sides === 2 ? '2 mặt' : '1 mặt'],
      ['Vùng đục lỗ', `Dài ${p.zoneLen}cm, cách đáy ${p.zoneFromBottom}cm`],
      ['Số lỗ / Đường kính', `${p.nHoles} lỗ, D=${p.holeD_um} micron`],
      ['Công nghệ đục', p.tech === 'laser' ? 'Laser' : 'Kim cơ'],
      ['Lịch sử nhiệt độ', (p.tempProfile && p.tempProfile.length) ? p.tempProfile.map(pt => `${pt.h}h:${pt.c}°C`).join(' → ') : `Cố định ${p.tempC}°C`],
      ['Mã lô / ghi chú', p.lotNote || '—'],
      ['O2 cân bằng', res.finalO2.toFixed(2) + '%'],
      ['CO2 cân bằng', res.finalCO2.toFixed(2) + '%'],
      ['Độ ẩm trong túi (*)', res.finalRH.toFixed(0) + '% (ước tính sơ bộ)'],
      ['Ngày xuất', new Date().toLocaleDateString('vi-VN')]
    ];
    tbl.innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  }

  function runCalc() {
    if (!DB) return;
    const p = readParams();
    const res = E.integrate(p, DB);

    if (!$('freeVol').value) $('freeVol').placeholder = res.Vfree.toFixed(0);

    $('kpiO2').textContent = res.finalO2.toFixed(2) + '%';
    $('kpiCO2').textContent = res.finalCO2.toFixed(2) + '%';
    $('kpiRH').textContent = res.finalRH.toFixed(0) + '%';
    $('kpiTime').textContent = res.t90 ? res.t90.toFixed(1) + ' giờ' : '>72 giờ';

    const st = statusFor(res);
    const banner = $('statusBanner');
    const colors = { green: ['var(--green-bg)', 'var(--green)'], yellow: ['var(--yellow-bg)', 'var(--yellow)'], red: ['var(--red-bg)', 'var(--red)'] };
    banner.style.background = colors[st.s][0];
    banner.style.color = colors[st.s][1];
    banner.innerHTML = `<span class="dot" style="background:${colors[st.s][1]}"></span> ${st.msg}`;

    // sticky strip (redesign 1.2) — cùng kết quả, vị trí cố định
    const strip = $('stickyStrip');
    if (strip) {
      $('stickyDot').style.background = colors[st.s][1];
      $('stickyO2').textContent = res.finalO2.toFixed(2) + '%';
      $('stickyCO2').textContent = res.finalCO2.toFixed(2) + '%';
      $('stickyRH').textContent = res.finalRH.toFixed(0) + '%';
      $('stickyCfg').textContent = `MAP · ${DB.rau[p.veg].ten_hien_thi} ${p.massG}g · ${p.tempC}°C · OPP ${DB.mang_OPP[p.filmKey].do_day_micron}µm · ${p.nHoles} lỗ D${p.holeD_um}µm`;
    }

    const scenarios = loadScenarios().map(s => ({ name: s.name, res: E.integrate(s.params, DB) }));
    drawChart(res, scenarios);
    suggestAdjustment(res, p);
    buildSpecSummary(p, res);
  }

  // ---- Scenario persistence ----
  function loadScenarios() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
  }
  function saveScenario() {
    const p = readParams();
    const name = (p.lotNote || `Kịch bản ${new Date().toLocaleTimeString('vi-VN')}`);
    const list = loadScenarios();
    list.push({ name, params: p });
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    renderScenarios();
    runCalc();
  }
  function removeScenario(idx) {
    const list = loadScenarios();
    list.splice(idx, 1);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    renderScenarios();
    runCalc();
  }
  function clearScenarios() {
    localStorage.removeItem(LS_KEY);
    renderScenarios();
    runCalc();
  }
  function renderScenarios() {
    const list = loadScenarios();
    const ul = $('scenarioList');
    ul.innerHTML = '';
    list.forEach((s, i) => {
      const r = E.integrate(s.params, DB);
      const li = document.createElement('li');
      li.innerHTML = `<span class="nm">${s.name}</span>
        <span class="badge">O2 ${r.finalO2.toFixed(1)}% · CO2 ${r.finalCO2.toFixed(1)}%</span>
        <button onclick="removeScenario(${i})">Xoá</button>`;
      ul.appendChild(li);
    });
  }

  // ---- PDF export (jsPDF) ----
  function exportPDF() {
    if (!DB) return;
    const p = readParams();
    const res = E.integrate(p, DB);
    const f = DB.mang_OPP[p.filmKey];
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const m = 40;
    doc.setFontSize(18); doc.text('VN-EMAP Designer - Thông so bao bi', m, 50);
    doc.setFontSize(10); doc.setTextColor(120);
    doc.text('WinEco · Vietnam Micro-perforated MAP spec sheet', m, 66);
    doc.setTextColor(0);
    const rows = [
      ['Chat lieu tui', `OPP ${f.do_day_micron} micron`],
      ['Kich thuoc tui', `${p.bagW} x ${p.bagL} cm`],
      ['Trao doi khi', p.sides === 2 ? '2 mat' : '1 mat'],
      ['Vung duc lo', `Dai ${p.zoneLen}cm, cach day ${p.zoneFromBottom}cm`],
      ['So lo / Duong kinh', `${p.nHoles} lo, D=${p.holeD_um} micron`],
      ['Cong nghe duc', p.tech === 'laser' ? 'Laser' : 'Kim co'],
      ['Ma lo / Ghi chu', p.lotNote || '—'],
      ['O2 can bang', res.finalO2.toFixed(2) + '%'],
      ['CO2 can bang', res.finalCO2.toFixed(2) + '%'],
      ['Do am trong tui (*)', res.finalRH.toFixed(0) + '% (uoc tinh so bo)'],
      ['Nhiet do / Khoi luong', `${p.tempC}°C / ${p.massG}g`],
      ['Ngay xuat', new Date().toLocaleDateString('vi-VN')]
    ];
    let y = 100;
    doc.setFontSize(11);
    rows.forEach(r => {
      doc.setTextColor(110); doc.text(r[0], m, y);
      doc.setTextColor(0); doc.text(r[1], m + 200, y);
      y += 24;
    });
    doc.setTextColor(150); doc.setFontSize(8);
    doc.text('Ban tinh tham khao ky thuat - can doi chieu A/B test thuc te.', m, 780);
    doc.text('(*) Do am la uoc tinh so bo (mo hinh Tetens + WVTR chua do thuc te), chi tham khao.', m, 796);
    doc.save(`VN-EMAP_${p.lotNote || 'spec'}_${Date.now()}.pdf`);
  }

  // ---- Feature B: reverse mode (find configs) ----
  const HOLE_DIAMETERS = [80, 100, 120, 150, 200]; // micron
  const HOLE_RANGE = { min: 0, max: 400, step: 5 };
  let mode = 'forward';
  let lastReverseResults = [];

  function setMode(m) {
    mode = m;
    const fwd = m === 'forward';
    $('modeForward').classList.toggle('active', fwd);
    $('modeReverse').classList.toggle('active', !fwd);
    $('panelB').style.display = fwd ? '' : 'none';
    $('panelC').style.display = fwd ? '' : 'none';
    $('forwardBtn').style.display = fwd ? '' : 'none';
    $('reverseBtn').style.display = fwd ? 'none' : '';
    $('forwardPanel').style.display = fwd ? '' : 'none';
    $('reversePanel').style.display = fwd ? 'none' : '';
  }

  // Extra scan for the edge case: combos that reach final equilibrium targets
  // but fail the mid-profile peak/valley safety check (only relevant with tempProfile).
  function scanFinalOkPeakFail(base) {
    const v = DB.rau[base.veg];
    const out = [];
    for (const filmKey of Object.keys(DB.mang_OPP)) {
      for (const holeD_um of HOLE_DIAMETERS) {
        for (let n = HOLE_RANGE.min; n <= HOLE_RANGE.max; n += HOLE_RANGE.step) {
          const r = E.integrate({ ...base, filmKey, holeD_um, nHoles: n }, DB);
          const okFinal = r.finalO2 >= v.O2_opt_min && r.finalO2 <= v.O2_opt_max && r.finalCO2 <= v.CO2_opt_max;
          if (!okFinal) continue;
          const okPeak = !base.tempProfile || (r.peak.o2Min >= 1 && r.peak.co2Max <= v.CO2_canh_bao_do);
          if (!okPeak) {
            out.push({ filmKey, holeD_um, nHoles: n, finalO2: r.finalO2, finalCO2: r.finalCO2,
              peakO2Min: r.peak.o2Min, peakCO2Max: r.peak.co2Max,
              why: r.peak.co2Max > v.CO2_canh_bao_do ? 'peakCO2' : 'peakO2' });
          }
          break; // smallest n reaching okFinal for this pair — that's the candidate to classify
        }
      }
    }
    return out;
  }

  function resultRow(c, i, withButton) {
    const f = DB.mang_OPP[c.filmKey];
    const btn = withButton ? `<td class="act"><button class="use-btn" onclick="useConfig(${i})">Dùng cấu hình này</button></td>` : '';
    return `<tr>
      <td>OPP ${f.do_day_micron}µm</td><td>${c.holeD_um}µm</td><td>${c.nHoles}</td>
      <td>${c.finalO2.toFixed(2)}%</td><td>${c.finalCO2.toFixed(2)}%</td>
      <td>${c.peakO2Min != null ? c.peakO2Min.toFixed(2) + '%' : '—'}</td>
      <td>${c.peakCO2Max != null ? c.peakCO2Max.toFixed(2) + '%' : '—'}</td>
      <td>${c.t90 != null ? c.t90.toFixed(1) + 'h' : '>72h'}</td>${btn}</tr>`;
  }

  function runReverse() {
    if (!DB) return;
    const base = readParams(); // panel B/C inputs are hidden but still readable — bag geometry/sides/tech are needed by integrate()
    const nCombos = Object.keys(DB.mang_OPP).length * HOLE_DIAMETERS.length * (Math.floor((HOLE_RANGE.max - HOLE_RANGE.min) / HOLE_RANGE.step) + 1);
    $('reverseSpinner').style.display = '';
    $('scanCount').textContent = nCombos.toLocaleString('vi-VN');
    $('reverseSummary').innerHTML = '';
    $('reverseWarn').style.display = 'none';
    $('nearMissBox').style.display = 'none';
    $('reverseBody').innerHTML = '';

    // let the spinner paint before the CPU-bound scan (measured ~250-300ms worst case, no Worker needed)
    setTimeout(() => {
      const t0 = performance.now();
      const results = E.findAllConfigs(base, DB, { holeDiameters: HOLE_DIAMETERS, holeRange: HOLE_RANGE });
      const v = DB.rau[base.veg];
      const profTxt = (base.tempProfile && base.tempProfile.length) ? 'profile nhiệt độ động' : `nhiệt độ cố định ${base.tempC}°C`;

      if (results.length) {
        lastReverseResults = results;
        $('reverseSummary').innerHTML = `<div style="font-size:13.5px;line-height:1.6">
          Tìm được <b>${results.length} cấu hình</b> đạt cả O2 (${v.O2_opt_min}-${v.O2_opt_max}%) lẫn CO2 (≤${v.CO2_opt_max}%)
          cho <b>${v.ten_hien_thi}</b> ${base.massG}g ở ${profTxt} — quét ${nCombos.toLocaleString('vi-VN')} tổ hợp trong ${(performance.now() - t0).toFixed(0)}ms.</div>`;
        $('reverseBody').innerHTML = results.map((c, i) => resultRow(c, i, true)).join('');
      } else {
        lastReverseResults = [];
        $('reverseWarn').style.display = '';
        $('reverseWarn').innerHTML = `Không tìm thấy cấu hình nào trong database hiện có (3 độ dày OPP) đạt được cả 2 mục tiêu O2 và CO2 cùng lúc
          cho <b>${v.ten_hien_thi}</b> ở điều kiện này. Cân nhắc: (a) mở rộng khoảng đường kính lỗ thử nghiệm,
          (b) xem xét chất liệu màng khác ngoài OPP, hoặc (c) chấp nhận đạt 1 trong 2 mục tiêu — xem kết quả gần nhất bên dưới.`;

        // distinguish "final OK but peak unsafe" from "nothing reaches final targets"
        if (base.tempProfile && base.tempProfile.length) {
          const peakFails = scanFinalOkPeakFail(base);
          if (peakFails.length) {
            $('reverseWarn').innerHTML += `<br><br><b>Lưu ý phân biệt:</b> có ${peakFails.length} tổ hợp <i>đạt cân bằng cuối</i> nhưng bị loại vì
              nguy hiểm giữa chừng trong profile — ví dụ OPP ${DB.mang_OPP[peakFails[0].filmKey].do_day_micron}µm / lỗ ${peakFails[0].holeD_um}µm / ${peakFails[0].nHoles} lỗ
              (${peakFails[0].why === 'peakCO2'
                ? `CO2 vọt lên ${peakFails[0].peakCO2Max.toFixed(1)}% giữa chừng, vượt ngưỡng ${v.CO2_canh_bao_do}%`
                : `O2 tụt xuống ${peakFails[0].peakO2Min.toFixed(1)}% giữa chừng (&lt;1%)`}).`;
          }
        }

        const nm = E.findNearMisses(base, DB, { limit: 5 });
        if (nm.length) {
          $('nearMissBox').style.display = '';
          $('nearMissBody').innerHTML = nm.map(c => resultRow(c, -1, false)).join('');
        }
      }
      $('reverseSpinner').style.display = 'none';
    }, 30);
  }

  function useConfig(i) {
    if (!lastReverseResults[i]) return;
    const c = lastReverseResults[i];
    $('filmThick').value = c.filmKey;
    $('holeD').value = c.holeD_um;
    const slider = $('nHoles');
    if (c.nHoles > +slider.max) slider.max = c.nHoles;
    setMode('forward');
    syncHoleInput(c.nHoles);
  }

  // expose handlers used by inline onclick
  window.setMode = setMode;
  window.applyTempPreset = applyTempPreset;
  window.setConstTemp = setConstTemp;
  window.onProfileEdit = onProfileEdit;
  window.addProfilePoint = addProfilePoint;
  window.removeProfilePoint = removeProfilePoint;
  window.syncHoleInput = syncHoleInput;
  window.syncHoleSlider = syncHoleSlider;
  window.runCalc = runCalc;
  window.saveScenario = saveScenario;
  window.removeScenario = removeScenario;
  window.clearScenarios = clearScenarios;
  window.exportPDF = exportPDF;
  window.runReverse = runReverse;
  window.useConfig = useConfig;

  (async function init() {
    await loadDB();
    window.VNEMAP_DB = DB; // cho module Packaging Lab (M2) dùng chung dữ liệu rau/màng
    populateSelects();
    renderProfileList();
    renderScenarios();
    setMode('forward');
    runCalc();
  })();
})();
