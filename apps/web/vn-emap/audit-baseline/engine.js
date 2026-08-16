(function (global) {
  'use strict';

  // ============================================================
  // VN-EMAP Engine v2 — pure physics, no DOM, unit-testable.
  // Mass balance O2/CO2 + H2O vapor through OPP film + micro-holes.
  // Respiration: Michaelis-Menten on O2, with CO2 inhibition (2-var model).
  // ============================================================

  const DEFAULTS = {
    D_O2_25C: 0.206,      // cm2/s
    D_CO2_25C: 0.160,     // cm2/s
    D_H2O_25C: 0.260,     // cm2/s
    RHO_AIR: 1.0,         // not used directly
    END_CORR: 0.8,        // hole end-correction factor
    atm_O2: 0.209,        // air O2 mole fraction
    atm_CO2: 0.0004,      // air CO2 mole fraction
    atm_RH: 0.70,         // ambient relative humidity (fraction)
    Vm_H2O_25C: 24450,    // cm3/mol water vapor @25C
    T_ref_OTR: 23,        // C, OTR reference temp
    T_ref_R: 10,          // C, respiration reference temp
    bagPuff_cm: 4          // assumed bag thickness for free-volume estimate
  };

  function diffusionCoef(D25, tempC) {
    const T = tempC + 273.15, T25 = 298.15;
    return D25 * Math.pow(T / T25, 1.75);
  }

  function filmRateAtTemp(rate23, tempC, arr) {
    arr = arr || 1.035;
    return rate23 * Math.pow(arr, tempC - DEFAULTS.T_ref_OTR);
  }

  function respRateAtTemp(R_ref, Q10, tempC) {
    return R_ref * Math.pow(Q10, (tempC - DEFAULTS.T_ref_R) / 10);
  }

  // Saturation water vapor pressure (kPa) at temperature T (°C) via Tetens' equation.
  // P_sat = 0.61078 * exp(17.27*T / (T + 237.3)). Inside the bag and outside share the
  // same temperature, so comparing vapor pressures is equivalent to comparing %RH, but we
  // keep the explicit Psat(T) so temperature dependence is modeled physically.
  function Psat_kPa(tempC) {
    return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  }

  // Geometry + conductances
  function buildConductances(p, db) {
    const v = db.rau[p.veg];
    const f = db.mang_OPP[p.filmKey];
    const thick_cm = f.do_day_micron * 1e-4;
    const holeD_cm = p.holeD_um * 1e-4;
    const A_hole_cm2 = Math.PI * Math.pow(holeD_cm / 2, 2);
    const A_holes_cm2 = p.nHoles * A_hole_cm2;
    const areaTotal_m2 = (p.sides === 2 ? 2 : 1) * (p.bagW / 100) * (p.bagL / 100);
    const A_film_m2 = Math.max(areaTotal_m2 - A_holes_cm2 / 1e4, 0);
    const Leff_cm = thick_cm + DEFAULTS.END_CORR * holeD_cm;

    const D_O2 = diffusionCoef(DEFAULTS.D_O2_25C, p.tempC);
    const D_CO2 = diffusionCoef(DEFAULTS.D_CO2_25C, p.tempC);
    const D_H2O = diffusionCoef(DEFAULTS.D_H2O_25C, p.tempC);

    const techVar = p.tech === 'pin' ? 1.20 : 1.0; // pin = +20% OTR mean (uneven holes raise effective OTR)

    // per unit mole-fraction diff, mL/day = D(cm2/s)*A(cm2)/L(cm) * 86400 * nHoles
    // techVar applied to all hole conductances when using needle-perforation (kim cơ)
    const G_holes_O2 = D_O2 * A_holes_cm2 / Leff_cm * 86400 * techVar;
    const G_holes_CO2 = D_CO2 * A_holes_cm2 / Leff_cm * 86400 * techVar;
    const G_holes_H2O = D_H2O * A_holes_cm2 / Leff_cm * 86400 * techVar;

    const OTR_film_T = filmRateAtTemp(f.OTR_23C, p.tempC, f.he_so_Arrhenius_nhiet_do_per_C);
    const CTR_film_T = filmRateAtTemp(f.CTR_23C, p.tempC, f.he_so_Arrhenius_nhiet_do_per_C);
    const WVTR_film_T = filmRateAtTemp(f.WVTR_23C, p.tempC, f.he_so_Arrhenius_nhiet_do_per_C);

    const G_film_O2 = OTR_film_T * A_film_m2;
    const G_film_CO2 = CTR_film_T * A_film_m2;
    const G_film_H2O = WVTR_film_T * A_film_m2; // g/day per unit (Pout-Pin) atm

    return {
      v, f, thick_cm, holeD_cm, A_hole_cm2, A_holes_cm2, areaTotal_m2, A_film_m2, Leff_cm,
      D_O2, D_CO2, D_H2O,
      G_holes_O2, G_holes_CO2, G_holes_H2O,
      G_film_O2, G_film_CO2, G_film_H2O,
      G_total_O2: G_film_O2 + G_holes_O2,
      G_total_CO2: G_film_CO2 + G_holes_CO2,
      G_total_H2O: G_film_H2O + G_holes_H2O,
      techVar
    };
  }

  function estimateFreeVolume(p, v) {
    const bagVolTotal = p.bagW * p.bagL * DEFAULTS.bagPuff_cm; // mL
    const mass_kg = p.massG / 1000;
    const produceVol = mass_kg * 1000 / v.mat_do_khoi_kg_m3 * 1000; // mL
    return Math.max(bagVolTotal - produceVol, bagVolTotal * 0.15);
  }

  // 2-variable respiration rate (mL O2/kg.day): Michaelis on O2 * CO2 inhibition
  function respO2rate(v, Rmax, yO2, yCO2) {
    const Km = v.Km_O2 / 100;
    const mm = yO2 / (Km + yO2);
    const inh = 1 / (1 + (yCO2 * 100) / v.k_CO2_uc_che); // k_CO2 in %
    return Rmax * mm * inh;
  }

  // Linear interpolation of a temperature profile [{h,c}, ...] at hour hr.
  function tempAt(profile, hr) {
    if (!profile || !profile.length) return DEFAULTS.T_ref_R;
    if (hr <= profile[0].h) return profile[0].c;
    for (let i = 1; i < profile.length; i++) {
      if (hr <= profile[i].h) {
        const t0 = profile[i - 1], t1 = profile[i];
        const frac = (hr - t0.h) / (t1.h - t0.h);
        return t0.c + frac * (t1.c - t0.c);
      }
    }
    return profile[profile.length - 1].c;
  }

  // Normalize input into a temperature profile. Accepts either:
  //   p.tempProfile = [{h,c}, ...]   (dynamic, Feature A)
  //   p.tempC = <number>             (constant, backward compatible)
  function toProfile(p) {
    if (Array.isArray(p.tempProfile) && p.tempProfile.length) return p.tempProfile;
    const c = (typeof p.tempC === 'number') ? p.tempC : DEFAULTS.T_ref_R;
    return [{ h: 0, c }, { h: 72, c }];
  }

  function integrate(p, db, horizonHr = 72) {
    const v = db.rau[p.veg];
    const profile = toProfile(p);
    const mass_kg = p.massG / 1000;
    const RQ = v.RQ;

    const Vfree = p.freeVolML && p.freeVolML > 0 ? p.freeVolML : estimateFreeVolume(p, v);

    const dt = 0.1;
    const steps = Math.round(horizonHr / dt);
    let yO2 = DEFAULTS.atm_O2, yCO2 = DEFAULTS.atm_CO2;
    let eIn = DEFAULTS.atm_RH * Psat_kPa(profile[0].c); // internal water vapor pressure (kPa)

    const t = [], o2arr = [], co2arr = [], rharr = [], temparr = [];
    const atmO2 = DEFAULTS.atm_O2, atmCO2 = DEFAULTS.atm_CO2, atmRH = DEFAULTS.atm_RH;

    // Peak (worst-case) breach tracking for the abuse-test warning.
    const peak = { co2Max: -1, co2MaxHr: null, co2MaxT: null, o2Min: 1e9, o2MinHr: null, o2MinT: null };

    for (let i = 0; i <= steps; i++) {
      const hr = i * dt;
      const tempC_now = tempAt(profile, hr);
      const c = buildConductances({ ...p, tempC: tempC_now }, db); // re-evaluate conductance each step
      const Psat = Psat_kPa(tempC_now);
      const eOut = atmRH * Psat;
      const yRH = Psat > 0 ? Math.min(eIn / Psat, 1) : atmRH;

      if (i % 5 === 0 || i === steps) {
        t.push(+hr.toFixed(1));
        o2arr.push(+(yO2 * 100).toFixed(3));
        co2arr.push(+(yCO2 * 100).toFixed(3));
        rharr.push(+(yRH * 100).toFixed(2));
        temparr.push(+tempC_now.toFixed(2));
      }

      // track worst-case breach at ANY time, not just final equilibrium
      if (yCO2 * 100 > peak.co2Max) { peak.co2Max = yCO2 * 100; peak.co2MaxHr = hr; peak.co2MaxT = tempC_now; }
      if (yO2 * 100 < peak.o2Min) { peak.o2Min = yO2 * 100; peak.o2MinHr = hr; peak.o2MinT = tempC_now; }

      const Rmax_O2 = respRateAtTemp(v.R_O2_10C, v.Q10, tempC_now) * mass_kg * 24; // mL O2/day, temp-dependent
      const R_O2_day = respO2rate(v, Rmax_O2, yO2, yCO2); // mL O2/day
      let RQ_eff = RQ;
      if (yO2 * 100 < v.O2_LOL) RQ_eff = RQ * 3.0;
      const R_CO2_day = R_O2_day * RQ_eff;

      const flux_O2_in = c.G_total_O2 * (atmO2 - yO2);   // mL/day
      const flux_CO2_out = c.G_total_CO2 * (yCO2 - atmCO2); // mL/day
      const dO2 = (flux_O2_in - R_O2_day) * (dt / 24) / Vfree;
      const dCO2 = (R_CO2_day - flux_CO2_out) * (dt / 24) / Vfree;

      // Water vapor: transpiration (produce) vs transmission through membrane + holes,
      // balanced on actual vapor-pressure difference eIn - eOut (kPa).
      const transp_g_day = v.toc_do_mat_nuoc_pct_ngay / 100 * mass_kg * 1000; // g/day
      const flux_H2O_out = c.G_total_H2O * (eIn - eOut); // g/day
      const deIn = (transp_g_day - flux_H2O_out) * (dt / 24) / (mass_kg * 1000); // crude kPa/day

      yO2 = Math.min(Math.max(yO2 + dO2, 0), atmO2);
      yCO2 = Math.max(yCO2 + dCO2, 0);
      eIn = Math.max(eIn + deIn, 0.0001);
    }

    const finalO2 = o2arr[o2arr.length - 1];
    const finalCO2 = co2arr[co2arr.length - 1];
    const finalRH = rharr[rharr.length - 1];

    // time to 90% of O2 change (relative to final)
    let t90 = null;
    for (let i = 0; i < o2arr.length; i++) {
      const prog = Math.abs(DEFAULTS.atm_O2 - o2arr[i] / 100) / Math.max(Math.abs(DEFAULTS.atm_O2 - finalO2 / 100), 1e-6);
      if (prog >= 0.9) { t90 = t[i]; break; }
    }

    return {
      t, o2arr, co2arr, rharr, temparr,
      finalO2, finalCO2, finalRH, t90,
      peak,
      v, Vfree,
      mass_kg
    };
  }

  // Auto-find hole count that hits O2/CO2 targets (single-var optimizer)
  function optimizeHoles(base, db, opts) {
    opts = opts || {};
    const v = db.rau[base.veg];
    let lo = base.nHoles, best = null;
    for (let extra = 0; extra <= (opts.max || 800); extra += (opts.step || 5)) {
      const n = base.nHoles + extra;
      if (n > (opts.maxN || 2000)) break;
      const r = integrate({ ...base, nHoles: n }, db);
      if (r.finalO2 >= v.O2_opt_min && r.finalO2 <= v.O2_opt_max && r.finalCO2 <= v.CO2_opt_max) {
        best = n; break;
      }
    }
    return best;
  }

  // Feature B: scan film thickness x hole diameter x hole count, return feasible configs.
  // Respects BOTH final-equilibrium and (when tempProfile set) peak/valley throughout the profile.
  function findAllConfigs(base, db, opts) {
    opts = opts || {};
    const v = db.rau[base.veg];
    const results = [];
    const filmKeys = Object.keys(db.mang_OPP);
    const holeDiameters = opts.holeDiameters || [80, 100, 120, 150, 200]; // micron
    const holeRange = opts.holeRange || { min: 0, max: 400, step: 5 };

    for (const filmKey of filmKeys) {
      for (const holeD_um of holeDiameters) {
        for (let n = holeRange.min; n <= holeRange.max; n += holeRange.step) {
          const r = integrate({ ...base, filmKey, holeD_um, nHoles: n }, db);
          const okFinal = r.finalO2 >= v.O2_opt_min && r.finalO2 <= v.O2_opt_max && r.finalCO2 <= v.CO2_opt_max;
          // If a dynamic tempProfile is used, also require the peak/valley to stay safe.
          const okPeak = !base.tempProfile || (r.peak.o2Min >= 1 && r.peak.co2Max <= v.CO2_canh_bao_do);
          if (okFinal && okPeak) {
            results.push({
              filmKey, holeD_um, nHoles: n,
              finalO2: r.finalO2, finalCO2: r.finalCO2, t90: r.t90,
              peakO2Min: r.peak.o2Min, peakCO2Max: r.peak.co2Max
            });
            break; // smallest n that satisfies for this (filmKey, holeD_um) pair
          }
        }
      }
    }
    return results.sort((a, b) => a.nHoles - b.nHoles);
  }

  // Near-miss configs for the empty-result edge case: rank by how close to targets.
  // Returns up to `limit` configs (regardless of feasibility) ordered by a penalty score.
  function findNearMisses(base, db, opts) {
    opts = opts || {};
    const v = db.rau[base.veg];
    const candidates = [];
    const filmKeys = Object.keys(db.mang_OPP);
    const holeDiameters = opts.holeDiameters || [80, 100, 120, 150, 200];
    const holeRange = opts.holeRange || { min: 0, max: 400, step: 20 };
    for (const filmKey of filmKeys) {
      for (const holeD_um of holeDiameters) {
        for (let n = holeRange.min; n <= holeRange.max; n += holeRange.step) {
          const r = integrate({ ...base, filmKey, holeD_um, nHoles: n }, db);
          const dO2 = Math.max(0, v.O2_opt_min - r.finalO2, r.finalO2 - v.O2_opt_max);
          const dCO2 = Math.max(0, r.finalCO2 - v.CO2_opt_max);
          const dPeakO2 = r.peak.o2Min < 1 ? (1 - r.peak.o2Min) : 0;
          const dPeakCO2 = Math.max(0, r.peak.co2Max - v.CO2_canh_bao_do);
          const score = dO2 + dCO2 + dPeakO2 * 5 + dPeakCO2 * 2;
          candidates.push({
            filmKey, holeD_um, nHoles: n,
            finalO2: r.finalO2, finalCO2: r.finalCO2, t90: r.t90,
            peakO2Min: r.peak.o2Min, peakCO2Max: r.peak.co2Max, score
          });
        }
      }
    }
    return candidates.sort((a, b) => a.score - b.score).slice(0, opts.limit || 5);
  }

  const Engine = {
    DEFAULTS,
    diffusionCoef,
    filmRateAtTemp,
    respRateAtTemp,
    buildConductances,
    estimateFreeVolume,
    respO2rate,
    tempAt,
    toProfile,
    integrate,
    optimizeHoles,
    findAllConfigs,
    findNearMisses
  };

  // Works both as a classic browser <script> (attaches to global) and as a Node ESM/CJS module.
  global.VNEMAP_Engine = Engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
})(typeof window !== 'undefined' ? window : globalThis);
