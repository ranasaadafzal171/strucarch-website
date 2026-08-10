document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  function $(sel) { return document.querySelector(sel); }
  function num(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(String(el.value).replace(/,/g, ""));
    return isFinite(v) ? v : 0;
  }
  function fmt(n, maxDec) {
    if (!isFinite(n)) return "0";
    if (maxDec === undefined) maxDec = 4;
    var s = n.toLocaleString("en-US", { maximumFractionDigits: maxDec });
    return s;
  }
  function fmtU(n) { return fmt(n, 3); }

  /* ============ 1. UNIT CONVERTER ============ */
  var CATS = {
    length: {
      name: "Length",
      units: { "mm": 1, "cm": 10, "m": 1000, "km": 1000000, "in": 25.4, "ft": 304.8, "yd": 914.4, "mi": 1609344 }
    },
    area: {
      name: "Area",
      units: { "mm²": 1e-6, "cm²": 1e-4, "m²": 1, "in²": 0.00064516, "ft²": 0.09290304, "yd²": 0.83612736, "marla": 25.29285264, "kanal": 505.857, "acre": 4046.8564224, "hectare": 10000 }
    },
    volume: {
      name: "Volume",
      units: { "cm³": 1e-6, "m³": 1, "L": 0.001, "in³": 1.63871e-5, "ft³": 0.028316846592, "yd³": 0.764554858, "gal (US)": 0.003785411784, "gal (UK)": 0.00454609 }
    },
    force: {
      name: "Force",
      units: { "N": 1, "kN": 1000, "kgf": 9.80665, "lbf": 4.4482216152605, "kip": 4448.2216152605, "tf": 9806.65 }
    },
    pressure: {
      name: "Pressure / Stress",
      units: { "Pa": 1, "kPa": 1000, "MPa": 1e6, "N/mm²": 1e6, "kN/m²": 1000, "kg/cm²": 98066.5, "psi": 6894.757293, "ksi": 6894757.293, "bar": 100000, "psf": 47.880258 }
    },
    moment: {
      name: "Bending Moment",
      units: { "N·m": 1, "kN·m": 1000, "N·mm": 0.001, "lbf·ft": 1.355817948, "kip·ft": 1355.817948, "kgf·m": 9.80665 }
    },
    mass: {
      name: "Mass / Weight",
      units: { "g": 0.001, "kg": 1, "t": 1000, "oz": 0.028349523125, "lb": 0.45359237, "US ton": 907.18474 }
    },
    speed: {
      name: "Speed",
      units: { "m/s": 1, "km/h": 0.277777777778, "mph": 0.44704, "ft/s": 0.3048, "knot": 0.514444444444 }
    },
    temperature: {
      name: "Temperature",
      special: true,
      units: { "°C": 1, "°F": 2, "K": 3 }
    }
  };
  var catKeys = Object.keys(CATS);

  function tempToC(v, unit) {
    if (unit === 1) return v;
    if (unit === 2) return (v - 32) * 5 / 9;
    return v - 273.15;
  }
  function tempFromC(c, unit) {
    if (unit === 1) return c;
    if (unit === 2) return c * 9 / 5 + 32;
    return c + 273.15;
  }

  function fillUnits(sel, catKey) {
    var opts = Object.keys(CATS[catKey].units).map(function (u) {
      return '<option value="' + u + '">' + u + '</option>';
    });
    sel.innerHTML = opts.join("");
  }

  function populateCat() {
    var cat = 0;
    var keys = catKeys.map(function (k) {
      return '<option value="' + k + '">' + CATS[k].name + '</option>';
    }).join("");
    $("#uc-cat").innerHTML = keys;
    $("#uc-cat").value = catKeys[cat];
    fillUnits($("#uc-from"), catKeys[cat]);
    fillUnits($("#uc-to"), catKeys[cat]);
    var units = Object.keys(CATS[catKeys[cat]].units);
    $("#uc-from").value = units[0];
    $("#uc-to").value = units[units.length > 1 ? 1 : 0];
    updateUnit();
  }

  function updateUnit() {
    var cat = catKeys.indexOf($("#uc-cat").value);
    var f = $("#uc-from").value;
    var t = $("#uc-to").value;
    var v = num("uc-value");
    if (CATS[catKeys[cat]].special) {
      var c = tempToC(v, CATS[catKeys[cat]].units[f]);
      var out = tempFromC(c, CATS[catKeys[cat]].units[t]);
    } else {
      var cf = CATS[catKeys[cat]].units[f];
      var ct = CATS[catKeys[cat]].units[t];
      var out = v * cf / ct;
    }
    $("#uc-out").textContent = fmtU(out);
    $("#uc-out-label").textContent = t;
    var note;
    if (CATS[catKeys[cat]].special) {
      note = "1 " + f + " = " + fmtU(tempFromC(tempToC(1, CATS[catKeys[cat]].units[f]), CATS[catKeys[cat]].units[t])) + " " + t;
    } else {
      note = "1 " + f + " = " + fmt(CATS[catKeys[cat]].units[f] / CATS[catKeys[cat]].units[t], 6) + " " + t;
    }
    $("#uc-note").textContent = note;
  }

  populateCat();
  $("#uc-cat").addEventListener("change", function () {
    fillUnits($("#uc-from"), $("#uc-cat").value);
    fillUnits($("#uc-to"), $("#uc-cat").value);
    updateUnit();
  });
  $("#uc-from").addEventListener("change", updateUnit);
  $("#uc-to").addEventListener("change", updateUnit);
  $("#uc-value").addEventListener("input", updateUnit);
  $("#uc-swap").addEventListener("click", function () {
    var tmp = $("#uc-from").value;
    $("#uc-from").value = $("#uc-to").value;
    $("#uc-to").value = tmp;
    updateUnit();
  });

  /* ============ 2. CONCRETE MIX ============ */
  var MIXES = { "1:2:4": [1, 2, 4], "1:1.5:3": [1, 1.5, 3], "1:1:2": [1, 1, 2], "1:3:6": [1, 3, 6], "1:4:8": [1, 4, 8], "1:5:10": [1, 5, 10] };

  function updateMix() {
    var grade = $("#mix-grade").value;
    $("#mix-custom-row").style.display = grade === "custom" ? "" : "none";
    var ratio;
    if (grade === "custom") {
      ratio = [num("mix-c") || 0, num("mix-s") || 0, num("mix-a") || 0];
    } else {
      ratio = MIXES[grade];
      $("#mix-c").value = ratio[0]; $("#mix-s").value = ratio[1]; $("#mix-a").value = ratio[2];
    }
    var total = ratio[0] + ratio[1] + ratio[2];
    var wet = num("mix-vol");
    if ($("#mix-vol-unit").value === "ft3") wet = wet * 0.028316846592;
    var waste = num("mix-waste") / 100;
    var dry = wet * 1.54 * (1 + waste);
    var bagVol = 0.0347; // 50 kg bag of cement, 1440 kg/m3
    var cementM3 = dry * ratio[0] / total;
    var cementKg = cementM3 * 1440;
    var bags = cementM3 / bagVol;
    var sandM3 = dry * ratio[1] / total;
    var aggM3 = dry * ratio[2] / total;
    var waterL = cementKg * num("mix-wcr");

    var html = "";
    html += '<div class="t-out"><div class="k">Cement</div><div class="v">' + fmt(bags, 1) + '</div><div class="u">bags (50 kg)</div></div>';
    html += '<div class="t-out"><div class="k">Cement weight</div><div class="v">' + fmtU(cementKg) + '</div><div class="u">kg</div></div>';
    html += '<div class="t-out"><div class="k">Sand</div><div class="v">' + fmtU(sandM3) + '</div><div class="u">m³ · ' + fmtU(sandM3 * 35.3147) + ' cft</div></div>';
    html += '<div class="t-out"><div class="k">Aggregate</div><div class="v">' + fmtU(aggM3) + '</div><div class="u">m³ · ' + fmtU(aggM3 * 35.3147) + ' cft</div></div>';
    html += '<div class="t-out"><div class="k">Water (est.)</div><div class="v">' + fmtU(waterL) + '</div><div class="u">litres</div></div>';
    html += '<div class="t-out"><div class="k">Mix ratio</div><div class="v">' + ratio[0] + ' : ' + ratio[1] + ' : ' + ratio[2] + '</div><div class="u">cement : sand : aggregate</div></div>';
    $("#mix-out").innerHTML = html;
  }
  $("#mix-grade").addEventListener("change", updateMix);
  ["mix-c", "mix-s", "mix-a", "mix-vol", "mix-vol-unit", "mix-waste", "mix-wcr"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateMix);
  });
  $("#mix-vol-unit").addEventListener("change", updateMix);
  updateMix();

  /* ============ 3. REBAR WEIGHT ============ */
  var BARS = [
    { label: "6 mm (#2)", dia: 6 }, { label: "8 mm (#3)", dia: 8 }, { label: "10 mm (#3)", dia: 10 },
    { label: "12 mm (#4)", dia: 12 }, { label: "14 mm (#5)", dia: 14 }, { label: "16 mm (#5)", dia: 16 },
    { label: "18 mm (#6)", dia: 18 }, { label: "20 mm (#6)", dia: 20 }, { label: "22 mm (#7)", dia: 22 },
    { label: "25 mm (#8)", dia: 25 }, { label: "28 mm (#9)", dia: 28 }, { label: "32 mm (#10)", dia: 32 },
    { label: "36 mm (#11)", dia: 36 }, { label: "40 mm (#12)", dia: 40 }
  ];
  function rebarWeightM(dia) { return (dia * dia) / 162; }
  function rebarTable() {
    var html = '<table><thead><tr><th>Bar</th><th>kg/m</th><th>kg/12 m</th><th>m/tonne</th></tr></thead><tbody>';
    BARS.forEach(function (b) {
      var w = rebarWeightM(b.dia);
      html += '<tr><td>' + b.label + '</td><td>' + fmt(w, 3) + '</td><td>' + fmt(w * 12, 1) + '</td><td>' + fmt(1000 / w, 0) + '</td></tr>';
    });
    html += '</tbody></table>';
    return html;
  }
  function updateRebar() {
    var bar = BARS[parseInt($("#rb-size").value, 10)];
    var qty = Math.max(1, num("rb-qty"));
    var mode = $("#rb-mode").value;
    var totalWeight, totalLength;
    if (mode === "length") {
      var len = num("rb-length") * qty;
      totalWeight = len * rebarWeightM(bar.dia);
      totalLength = len;
      $("#rb-length").parentElement.style.display = "";
      $("#rb-weight").parentElement.style.display = "none";
    } else {
      var wt = num("rb-weight") * qty;
      totalWeight = wt;
      totalLength = wt / rebarWeightM(bar.dia);
      $("#rb-length").parentElement.style.display = "none";
      $("#rb-weight").parentElement.style.display = "";
    }
    var display = totalWeight >= 1000 ? totalWeight / 1000 : totalWeight;
    $("#rb-out").textContent = fmt(display, 2);
    $("#rb-out-label").textContent = (totalWeight >= 1000 ? "tonnes" : "kg") + " · " + bar.label + " · " + fmt(rebarWeightM(bar.dia), 3) + " kg/m · total " + fmt(totalLength, 0) + " m";
    $("#rb-table").innerHTML = rebarTable();
  }
  $("#rb-size").innerHTML = BARS.map(function (b, i) {
    return '<option value="' + i + '"' + (b.dia === 12 ? ' selected' : '') + '>' + b.label + '</option>';
  }).join("");
  ["rb-size", "rb-mode", "rb-length", "rb-weight", "rb-qty"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateRebar);
    $("#" + id).addEventListener("change", updateRebar);
  });
  updateRebar();

  /* ============ 4. BEAM CALCULATOR ============ */
  function updateBeam() {
    var L = num("bm-span");
    var w = num("bm-udl");
    var P = num("bm-point");
    var E = num("bm-e");
    var I = num("bm-i");
    var M = (w * L * L) / 8 + (P * L) / 4;
    var V = (w * L) / 2 + P / 2;
    var wN = w, Lmm = L * 1000, PN = P * 1000;
    var def = (5 * wN * Math.pow(Lmm, 4)) / (384 * E * I) + (PN * Math.pow(Lmm, 3)) / (48 * E * I);
    var html = "";
    html += '<div class="t-out"><div class="k">Max moment</div><div class="v">' + fmtU(M) + '</div><div class="u">kN·m</div></div>';
    html += '<div class="t-out"><div class="k">Max shear</div><div class="v">' + fmtU(V) + '</div><div class="u">kN</div></div>';
    html += '<div class="t-out"><div class="k">Max deflection</div><div class="v">' + fmt(def, 2) + '</div><div class="u">mm</div></div>';
    html += '<div class="t-out"><div class="k">Span / deflection</div><div class="v">L/' + fmt(L * 1000 / def, 0) + '</div><div class="u">typical limit L/250</div></div>';
    $("#bm-out").innerHTML = html;
  }
  ["bm-span", "bm-udl", "bm-point", "bm-e", "bm-i"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateBeam);
  });
  $("#bm-preset").addEventListener("click", function () {
    var presets = [
      { span: 4, udl: 20, point: 0, e: 25000, i: 533000000 },
      { span: 6, udl: 15, point: 0, e: 25000, i: 533000000 },
      { span: 8, udl: 0, point: 100, e: 200000, i: 118000000 },
      { span: 10, udl: 10, point: 50, e: 200000, i: 118000000 }
    ];
    var idx = Math.floor(Math.random() * presets.length);
    var p = presets[idx];
    $("#bm-span").value = p.span; $("#bm-udl").value = p.udl; $("#bm-point").value = p.point;
    $("#bm-e").value = p.e; $("#bm-i").value = p.i;
    updateBeam();
  });
  updateBeam();

  /* ============ 5. CONCRETE VOLUME ============ */
  function updateVolume() {
    var shape = $("#cv-shape").value;
    var showRect = shape !== "ccolumn" && shape !== "cfooting";
    $("#cv-lwh").style.display = showRect ? "" : "none";
    $("#cv-dia").style.display = showRect ? "none" : "";
    var qty = Math.max(1, num("cv-qty"));
    var vol;
    if (showRect) {
      var l = num("cv-l"), w = num("cv-w"), h = num("cv-h");
      if (shape === "slab") vol = l * w * h;
      else if (shape === "footing") vol = l * w * h;
      else if (shape === "wall") vol = l * w * h;
      else vol = l * w * h;
    } else {
      var d = num("cv-d"), hd = num("cv-hd");
      vol = (Math.PI * d * d / 4) * hd;
    }
    vol *= qty;
    var bags = (vol * 1.54 / 7) * 1.05 / 0.0347;
    var html = "";
    html += '<div class="t-out"><div class="k">Volume</div><div class="v">' + fmtU(vol) + '</div><div class="u">m³</div></div>';
    html += '<div class="t-out"><div class="k">Volume</div><div class="v">' + fmtU(vol * 35.3147) + '</div><div class="u">ft³ (cft)</div></div>';
    html += '<div class="t-out"><div class="k">Cement (M15 1:2:4)</div><div class="v">' + fmt(bags, 1) + '</div><div class="u">bags of 50 kg</div></div>';
    html += '<div class="t-out"><div class="k">Concrete weight (est.)</div><div class="v">' + fmtU(vol * 2400) + '</div><div class="u">kg · 2,400 kg/m³</div></div>';
    $("#cv-out").innerHTML = html;
  }
  $("#cv-shape").addEventListener("change", updateVolume);
  ["cv-l", "cv-w", "cv-h", "cv-d", "cv-hd", "cv-qty"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateVolume);
  });
  updateVolume();

  /* ============ 6. SLOPE CONVERTER ============ */
  function updateSlope() {
    var mode = $("#sl-in-mode").value;
    var pct = 0;
    $("#sl-row-single").style.display = mode === "rise" ? "none" : "";
    $("#sl-row-rise").style.display = mode === "rise" ? "" : "none";
    if (mode === "pct") {
      pct = num("sl-val");
    } else if (mode === "deg") {
      pct = Math.tan(num("sl-val") * Math.PI / 180) * 100;
    } else if (mode === "ratio") {
      var X = num("sl-val");
      pct = X > 0 ? 100 / X : 0;
    } else {
      var rise = num("sl-rise"), run = num("sl-run");
      pct = run > 0 ? (rise / run) * 100 : 0;
    }
    var deg = Math.atan(pct / 100) * 180 / Math.PI;
    var ratioX = pct > 0 ? 100 / pct : Infinity;
    var grade = pct <= 5 ? "Flat" : pct <= 8.33 ? "Gentle" : pct <= 12.5 ? "Moderate" : pct <= 20 ? "Steep" : "Very steep";
    var html = "";
    html += '<div class="t-out"><div class="k">Percent</div><div class="v">' + fmt(pct, 2) + '%</div><div class="u">grade</div></div>';
    html += '<div class="t-out"><div class="k">Degrees</div><div class="v">' + fmt(deg, 2) + '°</div><div class="u">angle</div></div>';
    html += '<div class="t-out"><div class="k">Ratio</div><div class="v">1 : ' + (isFinite(ratioX) ? fmt(ratioX, ratioX < 10 ? 1 : 0) : '&infin;') + '</div><div class="u">rise : run</div></div>';
    html += '<div class="t-out"><div class="k">Classification</div><div class="v" style="font-size:0.95rem;">' + grade + '</div><div class="u">reference</div></div>';
    $("#sl-out").innerHTML = html;
  }
  $("#sl-in-mode").addEventListener("change", updateSlope);
  ["sl-val", "sl-rise", "sl-run"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateSlope);
  });
  updateSlope();

  /* ============ 7. SCALE CONVERTER ============ */
  var SCALE_TO_MM = { mm: 1, cm: 10, m: 1000, in: 25.4 };
  var MM_TO_OUT = { mm: 1, cm: 0.1, m: 0.001, km: 1e-6, ft: 1 / 304.8 };
  var scaleDir = 1;
  function scaleScale() {
    var sc = $("#sc-scale").value;
    $("#sc-custom-wrap").style.display = sc === "custom" ? "" : "none";
    return sc === "custom" ? (num("sc-scale-custom") || 1) : parseFloat(sc);
  }
  function updateScale() {
    var X = scaleScale();
    var meas = num("sc-meas");
    var inUnit = SCALE_TO_MM[$("#sc-meas-unit").value];
    var outUnit = MM_TO_OUT[$("#sc-out-unit").value];
    var actual = scaleDir === 1 ? meas * inUnit * X * outUnit : meas * inUnit / X * outUnit;
    var note = scaleDir === 1 ? "Actual = measured × " + X : "Measured = actual ÷ " + X;
    $("#sc-out").textContent = fmtU(actual);
    $("#sc-out-label").textContent = $("#sc-out-unit").value;
    $("#sc-note").textContent = note + " (1 : " + fmt(X, 0) + ")";
  }
  $("#sc-scale").addEventListener("change", updateScale);
  $("#sc-scale-custom").addEventListener("input", updateScale);
  ["sc-meas", "sc-meas-unit", "sc-out-unit"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateScale);
    $("#" + id).addEventListener("change", updateScale);
  });
  $("#sc-reverse").addEventListener("click", function () {
    scaleDir = scaleDir === 1 ? -1 : 1;
    updateScale();
  });
  updateScale();

  /* ============ 8. SECTION PROPERTIES ============ */
  function updateSection() {
    var shape = $("#sp-shape").value;
    $("#sp-rect").style.display = shape === "rect" ? "" : "none";
    $("#sp-circ").style.display = shape === "circle" ? "" : "none";
    var html = "";
    if (shape === "rect") {
      var b = num("sp-b"), h = num("sp-h");
      var A = b * h;
      var Ix = (b * h * h * h) / 12, Iy = (h * b * b * b) / 12;
      var Sx = Ix / (h / 2), Sy = Iy / (b / 2);
      html += '<div class="t-out"><div class="k">Area A</div><div class="v">' + fmtU(A) + '</div><div class="u">mm²</div></div>';
      html += '<div class="t-out"><div class="k">Ixx</div><div class="v">' + fmt(Ix, 0) + '</div><div class="u">mm⁴</div></div>';
      html += '<div class="t-out"><div class="k">Iyy</div><div class="v">' + fmt(Iy, 0) + '</div><div class="u">mm⁴</div></div>';
      html += '<div class="t-out"><div class="k">Sxx</div><div class="v">' + fmt(Sx, 0) + '</div><div class="u">mm³</div></div>';
      html += '<div class="t-out"><div class="k">Syy</div><div class="v">' + fmt(Sy, 0) + '</div><div class="u">mm³</div></div>';
      html += '<div class="t-out"><div class="k">r = &radic;(I/A)</div><div class="v">' + fmt(Math.sqrt(Ix / A), 1) + '</div><div class="u">mm</div></div>';
    } else {
      var d = num("sp-d");
      var Ac = (Math.PI * d * d) / 4;
      var Ic = (Math.PI * d * d * d * d) / 64;
      var Sc = Ic / (d / 2);
      html += '<div class="t-out"><div class="k">Area A</div><div class="v">' + fmtU(Ac) + '</div><div class="u">mm²</div></div>';
      html += '<div class="t-out"><div class="k">Ixx = Iyy</div><div class="v">' + fmt(Ic, 0) + '</div><div class="u">mm⁴</div></div>';
      html += '<div class="t-out"><div class="k">Sxx = Syy</div><div class="v">' + fmt(Sc, 0) + '</div><div class="u">mm³</div></div>';
      html += '<div class="t-out"><div class="k">r = &radic;(I/A)</div><div class="v">' + fmt(Math.sqrt(Ic / Ac), 1) + '</div><div class="u">mm</div></div>';
    }
    $("#sp-out").innerHTML = html;
  }
  $("#sp-shape").addEventListener("change", updateSection);
  ["sp-b", "sp-h", "sp-d"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateSection);
  });
  updateSection();

  /* ============ 9. STEEL QUANTITY ============ */
  var SQ = {
    slab: [60, 90, "Slab / pavement"],
    beams: [120, 180, "Beams"],
    columns: [150, 250, "Columns"],
    footings: [60, 100, "Footings"],
    retaining: [80, 120, "Retaining walls"],
    overall: [100, 150, "Overall RCC average"]
  };
  function updateSteelQty() {
    var t = SQ[$("#sq-type").value];
    var vol = num("sq-vol");
    var lo = vol * t[0], hi = vol * t[1];
    var html = "";
    html += '<div class="t-out"><div class="k">Estimate range</div><div class="v">' + fmt(lo, 0) + ' - ' + fmt(hi, 0) + '</div><div class="u">kg</div></div>';
    html += '<div class="t-out"><div class="k">Estimate range</div><div class="v">' + fmt(lo / 1000, 2) + ' - ' + fmt(hi / 1000, 2) + '</div><div class="u">tonnes</div></div>';
    html += '<div class="t-out"><div class="k">Reference rate</div><div class="v">' + t[0] + ' - ' + t[1] + '</div><div class="u">kg per m³ (' + t[2] + ')</div></div>';
    html += '<div class="t-out"><div class="k">Concrete volume</div><div class="v">' + fmtU(vol) + '</div><div class="u">m³</div></div>';
    $("#sq-out").innerHTML = html;
  }
  $("#sq-type").addEventListener("change", updateSteelQty);
  $("#sq-vol").addEventListener("input", updateSteelQty);
  updateSteelQty();

  /* ============ 10. RAMP SLOPE ============ */
  function updateRamp() {
    var rise = num("rp-rise"), run = num("rp-run");
    var pct = run > 0 ? (rise / run) * 100 : 0;
    var deg = Math.atan(pct / 100) * 180 / Math.PI;
    var ratioX = pct > 0 ? run / rise : Infinity;
    var status;
    var limit12 = 100 / 12; // 8.333...%
    if (pct <= limit12) { status = "Pass - accessible (≤ 1:12)"; }
    else if (pct <= 10) { status = "Steep - short runs only (≤ 1:10)"; }
    else if (pct <= 12.5) { status = "Very steep - 1:8 absolute max, steps needed"; }
    else { status = "Not compliant - use steps or a lift"; }
    var html = "";
    html += '<div class="t-out"><div class="k">Slope</div><div class="v">' + fmt(pct, 2) + '%</div><div class="u">' + fmt(deg, 2) + '°</div></div>';
    html += '<div class="t-out"><div class="k">Ratio</div><div class="v">1 : ' + (isFinite(ratioX) ? fmt(ratioX, 1) : '&infin;') + '</div><div class="u">rise : run</div></div>';
    html += '<div class="t-out" style="grid-column:1 / -1; background:' + (pct <= limit12 ? 'var(--primary-soft)' : '#fff4e5') + '; border-color:' + (pct <= limit12 ? 'var(--primary)' : '#f0c76b') + ';"><div class="k">Result</div><div class="v" style="font-size:1rem;">' + status + '</div><div class="u">accessibility reference</div></div>';
    $("#rp-out").innerHTML = html;
  }
  ["rp-rise", "rp-run"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateRamp);
  });
  updateRamp();

  /* ============ 11. EARTHWORK VOLUME ============ */
  function updateEarthwork() {
    var L = num("ew-l");
    var c1 = num("ew-c1"), c2 = num("ew-c2");
    var f1 = num("ew-f1"), f2 = num("ew-f2");
    var shrink = Math.max(0, num("ew-shrink")) / 100;
    var cut = L * (c1 + c2) / 2;
    var fill = L * (f1 + f2) / 2;
    var fillAdj = fill * (1 + shrink);
    var net = cut - fillAdj;
    var html = "";
    html += '<div class="t-out"><div class="k">Cut volume</div><div class="v">' + fmtU(cut) + '</div><div class="u">m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Fill volume</div><div class="v">' + fmtU(fill) + '</div><div class="u">m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Fill needed (after shrink)</div><div class="v">' + fmtU(fillAdj) + '</div><div class="u">m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Net (cut - fill)</div><div class="v">' + fmtU(net) + '</div><div class="u">m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Cut volume</div><div class="v">' + fmtU(cut * 35.3147) + '</div><div class="u">ft&sup3; (cft)</div></div>';
    html += '<div class="t-out"><div class="k">Net</div><div class="v">' + fmtU(net * 35.3147) + '</div><div class="u">ft&sup3; (cft)</div></div>';
    $("#ew-out").innerHTML = html;
  }
  ["ew-l", "ew-c1", "ew-c2", "ew-f1", "ew-f2", "ew-shrink"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateEarthwork);
  });
  updateEarthwork();

  /* ============ 12. BRICK QUANTITY ============ */
  function updateBrick() {
    var L = num("bq-l"), H = num("bq-h"), T = num("bq-t");
    var waste = Math.max(0, num("bq-waste")) / 100;
    var ratio = num("bq-ratio"); // n in 1:n
    var vol = L * H * T;
    var bricks = Math.ceil(vol * 500 * (1 + waste));
    var mortar = vol * 0.3;
    var dry = mortar * 1.33;
    var cement = dry / (1 + ratio) / 0.0347; // bags
    var sand = dry * ratio / (1 + ratio);
    var html = "";
    html += '<div class="t-out"><div class="k">Wall volume</div><div class="v">' + fmtU(vol) + '</div><div class="u">m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Bricks needed</div><div class="v">' + fmt(bricks, 0) + '</div><div class="u">@ 500/m&sup3; + wastage</div></div>';
    html += '<div class="t-out"><div class="k">Mortar volume</div><div class="v">' + fmtU(mortar) + '</div><div class="u">m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Cement (1:' + ratio + ')</div><div class="v">' + fmt(cement, 1) + '</div><div class="u">bags of 50 kg</div></div>';
    html += '<div class="t-out"><div class="k">Sand</div><div class="v">' + fmtU(sand) + '</div><div class="u">m&sup3; (' + fmtU(sand * 35.3147) + ' cft)</div></div>';
    html += '<div class="t-out"><div class="k">Bricks / m&sup2;</div><div class="v">' + fmt(vol > 0 ? bricks / (L * H) : 0, 1) + '</div><div class="u">per sq m of wall face</div></div>';
    $("#bq-out").innerHTML = html;
  }
  ["bq-l", "bq-h", "bq-t", "bq-waste", "bq-ratio"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateBrick);
    $("#" + id).addEventListener("change", updateBrick);
  });
  updateBrick();

  /* ============ 13. PLASTER QUANTITY ============ */
  function updatePlaster() {
    var area = num("pq-area"), thick = num("pq-thick");
    var ratio = num("pq-ratio"); // n in 1:n
    var waste = Math.max(0, num("pq-waste")) / 100;
    var wet = area * thick / 1000;
    var dry = wet * 1.33;
    var cement = dry / (1 + ratio) / 0.0347; // bags
    var sand = dry * ratio / (1 + ratio);
    var html = "";
    html += '<div class="t-out"><div class="k">Plaster volume</div><div class="v">' + fmtU(wet) + '</div><div class="u">m&sup3; (wet)</div></div>';
    html += '<div class="t-out"><div class="k">Dry volume</div><div class="v">' + fmtU(dry) + '</div><div class="u">m&sup3; (x1.33)</div></div>';
    html += '<div class="t-out"><div class="k">Cement (1:' + ratio + ')</div><div class="v">' + fmt(cement * (1 + waste), 1) + '</div><div class="u">bags of 50 kg</div></div>';
    html += '<div class="t-out"><div class="k">Sand</div><div class="v">' + fmtU(sand * (1 + waste)) + '</div><div class="u">m&sup3; (' + fmtU(sand * (1 + waste) * 35.3147) + ' cft)</div></div>';
    html += '<div class="t-out"><div class="k">Cement / 100 m&sup2;</div><div class="v">' + fmt(area > 0 ? cement * (1 + waste) / area * 100 : 0, 1) + '</div><div class="u">bags</div></div>';
    html += '<div class="t-out"><div class="k">Sand / 100 m&sup2;</div><div class="v">' + fmtU(area > 0 ? sand * (1 + waste) / area * 100 : 0) + '</div><div class="u">m&sup3;</div></div>';
    $("#pq-out").innerHTML = html;
  }
  ["pq-area", "pq-thick", "pq-ratio", "pq-waste"].forEach(function (id) {
    $("#" + id).addEventListener("input", updatePlaster);
    $("#" + id).addEventListener("change", updatePlaster);
  });
  updatePlaster();

  /* ============ 14. ASPHALT QUANTITY ============ */
  function updateAsphalt() {
    var area = num("aq-area"), thick = num("aq-thick");
    var density = num("aq-density");
    var waste = Math.max(0, num("aq-waste")) / 100;
    var vol = area * thick / 1000;
    var mass = vol * density * (1 + waste);
    var html = "";
    html += '<div class="t-out"><div class="k">Compacted volume</div><div class="v">' + fmtU(vol) + '</div><div class="u">m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Mass (with wastage)</div><div class="v">' + fmtU(mass / 1000) + '</div><div class="u">tonnes</div></div>';
    html += '<div class="t-out"><div class="k">Mass</div><div class="v">' + fmtU(mass) + '</div><div class="u">kg</div></div>';
    html += '<div class="t-out"><div class="k">Asphalt / 100 m&sup2;</div><div class="v">' + fmtU(area > 0 ? mass / area * 100 : 0) + '</div><div class="u">kg</div></div>';
    html += '<div class="t-out"><div class="k">Compacted volume</div><div class="v">' + fmtU(vol * 35.3147) + '</div><div class="u">ft&sup3; (cft)</div></div>';
    html += '<div class="t-out"><div class="k">Rate approx @ Rs 200/kg</div><div class="v">Rs ' + fmtU(mass * 0.2 / 1000) + '</div><div class="u">thousand (labour + mix dependent)</div></div>';
    $("#aq-out").innerHTML = html;
  }
  ["aq-area", "aq-thick", "aq-density", "aq-waste"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateAsphalt);
    $("#" + id).addEventListener("change", updateAsphalt);
  });
  updateAsphalt();

  /* ============ 15. AGGREGATE & SAND QUANTITY ============ */
  function updateAggregate() {
    var vol = num("ag-vol");
    var waste = Math.max(0, num("ag-waste")) / 100;
    var unit = $("#ag-unit").value;
    var mat = $("#ag-material").value;
    var dryFactor = 1.54, parts = [1, 2, 4]; // cement, sand, agg (1:2:4)
    if (mat === "mortar") { dryFactor = 1.33; parts = [1, 4, 0]; }
    if (mat === "pcc") { dryFactor = 1.54; parts = [1, 4, 8]; }
    var sum = parts[0] + parts[1] + parts[2];
    var dry = vol * dryFactor * (1 + waste);
    var conv = unit === "cft" ? 35.3147 : 1;
    var u = unit === "cft" ? "cft" : "m&sup3;";
    var cement = dry * parts[0] / sum / 0.0347;
    var html = "";
    html += '<div class="t-out"><div class="k">Dry material volume</div><div class="v">' + fmtU(dry * conv) + '</div><div class="u">' + u + '</div></div>';
    html += '<div class="t-out"><div class="k">Cement</div><div class="v">' + fmt(cement, 1) + '</div><div class="u">bags of 50 kg</div></div>';
    if (parts[1] > 0) { html += '<div class="t-out"><div class="k">Sand</div><div class="v">' + fmtU(dry * parts[1] / sum * conv) + '</div><div class="u">' + u + '</div></div>'; }
    if (parts[2] > 0) { html += '<div class="t-out"><div class="k">Crush / aggregate</div><div class="v">' + fmtU(dry * parts[2] / sum * conv) + '</div><div class="u">' + u + '</div></div>'; }
    html += '<div class="t-out"><div class="k">Ratio</div><div class="v">1:' + parts[1] + ':' + parts[2] + '</div><div class="u">cement : sand : aggregate</div></div>';
    html += '<div class="t-out"><div class="k">Mix type</div><div class="v">' + (mat === "conc" ? "Concrete" : mat === "mortar" ? "Mortar" : "PCC") + '</div><div class="u">' + (mat === "conc" ? "1:2:4" : mat === "mortar" ? "1:4" : "1:4:8") + '</div></div>';
    $("#ag-out").innerHTML = html;
  }
  ["ag-vol", "ag-waste"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateAggregate);
    $("#" + id).addEventListener("change", updateAggregate);
  });
  ["ag-material", "ag-unit"].forEach(function (id) {
    $("#" + id).addEventListener("change", updateAggregate);
  });
  updateAggregate();

  /* ============ 16. RATE ANALYSIS ============ */
  function updateRateAnalysis() {
    var mat = num("ra-material"), lab = num("ra-labour"), plant = num("ra-plant");
    var oh = Math.max(0, num("ra-overhead")) / 100;
    var qty = num("ra-qty");
    var direct = mat + lab + plant;
    var withOh = direct * (1 + oh);
    var rate = qty > 0 ? withOh / qty : 0;
    var unitLabel = $("#ra-unit").value === "cft" ? "cft" : $("#ra-unit").value === "m3" ? "m&sup3;" : $("#ra-unit").value === "sft" ? "sft" : "kg";
    var html = "";
    html += '<div class="t-out"><div class="k">Direct cost (mat + lab + plant)</div><div class="v">Rs ' + fmtU(direct) + '</div><div class="u">total</div></div>';
    html += '<div class="t-out"><div class="k">Direct + overhead</div><div class="v">Rs ' + fmtU(withOh) + '</div><div class="u">' + fmt(num("ra-overhead"), 0) + '% overhead &amp; profit</div></div>';
    html += '<div class="t-out"><div class="k">Material share</div><div class="v">' + fmt(direct > 0 ? mat / direct * 100 : 0, 0) + '%</div><div class="u">of direct cost</div></div>';
    html += '<div class="t-out"><div class="k">Labour share</div><div class="v">' + fmt(direct > 0 ? lab / direct * 100 : 0, 0) + '%</div><div class="u">of direct cost</div></div>';
    html += '<div class="t-out"><div class="k">Plant share</div><div class="v">' + fmt(direct > 0 ? plant / direct * 100 : 0, 0) + '%</div><div class="u">of direct cost</div></div>';
    html += '<div class="t-out t-out-full"><div class="k">Rate for this item</div><div class="v">Rs ' + fmt(rate, 2) + '</div><div class="u">per ' + unitLabel + '</div></div>';
    $("#ra-out").innerHTML = html;
  }
  ["ra-material", "ra-labour", "ra-plant", "ra-overhead", "ra-qty"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateRateAnalysis);
    $("#" + id).addEventListener("change", updateRateAnalysis);
  });
  $("#ra-unit").addEventListener("change", updateRateAnalysis);
  updateRateAnalysis();

  /* ============ 17. REBAR ESTIMATOR BY MEMBER ============ */
  function updateRebarEstimator() {
    var vol = num("re-vol");
    var member = $("#re-member").value;
    var dens = num("re-density");
    var rate = num("re-total");
    var weight = vol * dens;
    var html = "";
    html += '<div class="t-out"><div class="k">Member type</div><div class="v">' + (member.charAt(0).toUpperCase() + member.slice(1)) + '</div><div class="u">concrete volume ' + fmtU(vol) + ' m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Steel weight</div><div class="v">' + fmtU(weight) + '</div><div class="u">kg @ ' + fmt(dens, 0) + ' kg/m&sup3;</div></div>';
    html += '<div class="t-out"><div class="k">Steel tonnage</div><div class="v">' + fmt(weight / 1000, 3) + '</div><div class="u">tonnes</div></div>';
    html += '<div class="t-out"><div class="k">Steel cost</div><div class="v">Rs ' + fmtU(weight * rate) + '</div><div class="u">@ Rs ' + fmt(rate, 0) + '/kg (material only)</div></div>';
    html += '<div class="t-out"><div class="k">Steel / m&sup3;</div><div class="v">' + fmtU(dens) + '</div><div class="u">kg of steel per m&sup3; of concrete</div></div>';
    html += '<div class="t-out"><div class="k">Reference range</div><div class="v">' + (member === "slab" ? "70-110" : member === "beam" ? "120-180" : member === "column" ? "150-220" : "60-100") + '</div><div class="u">kg/m&sup3; typical for this member</div></div>';
    $("#re-out").innerHTML = html;
  }
  ["re-vol", "re-density", "re-total"].forEach(function (id) {
    $("#" + id).addEventListener("input", updateRebarEstimator);
    $("#" + id).addEventListener("change", updateRebarEstimator);
  });
  $("#re-member").addEventListener("change", updateRebarEstimator);
  updateRebarEstimator();
});
