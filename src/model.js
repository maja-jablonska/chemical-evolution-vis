// Core abundance logic:
// - For each element and a given [Fe/H] + enabled processes, derive [X/Fe].
// - Blend archetype observed values (when present) with model predictions.

// Schematic galactic chemical evolution model:
//   * α-elements: [α/Fe] ~ +0.35 at low [Fe/H]; knee near [Fe/H] ~ -1; declines to ~0 at solar.
//   * Fe-peak from SN Ia: Mn, Ni-like species rise with [Fe/H] (SN Ia turns on at [Fe/H]~-1).
//   * s-process (main): scales like [s/Fe] ~ 0 at solar; negative at very low [Fe/H]; can be
//     boosted by AGB contamination.
//   * r-process: large scatter at low [Fe/H]; levels near 0 at solar.
//
// The "toggle a process off" mode re-renormalizes the frac contributions and rescales [X/Fe].

window.computeXFe = function computeXFe(element, feh, enabledProcesses, archetypeXFe) {
  // If an archetype explicitly provides a measurement, trust it when all processes are enabled.
  const allOn = window.PROCESSES.every(p => enabledProcesses[p.key]);
  if (allOn && archetypeXFe && element.sym in archetypeXFe) {
    return archetypeXFe[element.sym];
  }

  // Baseline model [X/Fe] at this [Fe/H]:
  // Start with an "all processes" baseline = linear-ish interpolation between low-Fe and solar.
  const base = baselineXFe(element, feh);

  // Now reweight based on enabled processes.
  const frac = element.frac;
  let kept = 0, total = 0;
  for (const p of window.PROCESSES) {
    total += frac[p.key];
    if (enabledProcesses[p.key]) kept += frac[p.key];
  }
  if (total <= 0) return base;
  if (kept <= 0) return -4; // essentially zero abundance

  // [X/Fe] reduction in dex when processes are removed:
  //   [X/Fe]_eff = [X/Fe]_base + log10(kept/total)
  // This assumes the process fractions are linear contributions to N_X.
  // Then also modify [Fe/H]-derived context: if SN Ia is off we also boost effective alpha.
  let xfe = base + Math.log10(kept / total);

  // Archetype override: if archetype provides a value AND all processes at least partly on,
  // nudge toward it.
  if (archetypeXFe && element.sym in archetypeXFe) {
    const arc = archetypeXFe[element.sym];
    xfe = arc + Math.log10(kept / total);
  }

  return xfe;
};

function baselineXFe(el, feh) {
  // Core idea: different families have characteristic [X/Fe]([Fe/H]) tracks.
  // Returns [X/Fe] in dex.
  const isAlpha = el.frac.alpha > 0.5 && el.Z >= 8 && el.Z <= 22;
  const isFePeak = el.frac.fepk + el.frac.snia > 0.7;
  const isSNIa = el.frac.snia > 0.5;
  const isS = el.frac.s > 0.5;
  const isR = el.frac.r > 0.5;

  // "knee" in alpha/Fe plane
  const alphaKnee = (f) => {
    // plateau [α/Fe] ~ +0.35 for f < -1.2, linearly to 0 at f = 0.0, slight negative at f > 0
    if (f <= -1.2) return 0.35;
    if (f >= 0.2) return -0.02;
    // linear between -1.2 and 0.2
    return 0.35 - (f - (-1.2)) * (0.35 - (-0.02)) / (0.2 - (-1.2));
  };

  if (isAlpha) return alphaKnee(feh);
  if (el.sym === 'Mn') {
    // Mn strongly SN Ia: low at low [Fe/H], rises to 0 at solar
    if (feh <= -1.5) return -0.5;
    if (feh >= 0) return 0.0;
    return -0.5 + (feh + 1.5) * (0.5 / 1.5);
  }
  if (el.sym === 'Fe') return 0;

  if (isSNIa) {
    // rises with [Fe/H]
    return Math.max(-0.4, Math.min(0.1, feh * 0.25));
  }
  if (isFePeak) {
    // fairly flat around 0
    return 0;
  }
  if (isS) {
    // very low at very low [Fe/H], climbs to ~0 at solar
    if (feh <= -2.5) return -1.2;
    if (feh >= 0) return 0.0;
    return -1.2 + (feh + 2.5) * (1.2 / 2.5);
  }
  if (isR) {
    // large scatter; in model use a rising curve from very negative at low [Fe/H] to 0
    if (feh <= -3) return -0.8;
    if (feh >= -1) return 0.0;
    return -0.8 + (feh + 3) * (0.8 / 2);
  }
  // Light / CNO / misc
  return 0;
}

// Derive [α/Fe] from element contributions (average of O, Mg, Si, Ca, Ti).
window.computeAlphaFe = function computeAlphaFe(feh, enabledProcesses, archetypeXFe) {
  const alphas = ['O', 'Mg', 'Si', 'Ca', 'Ti'];
  let sum = 0, n = 0;
  for (const sym of alphas) {
    const el = window.ELEMENTS.find(e => e.sym === sym);
    if (!el) continue;
    const v = window.computeXFe(el, feh, enabledProcesses, archetypeXFe);
    if (isFinite(v) && v > -3) { sum += v; n++; }
  }
  return n > 0 ? sum / n : 0;
};

// Color for a periodic-table cell — blend process colors by fraction.
window.elementColor = function elementColor(el) {
  let r = 0, g = 0, b = 0, w = 0;
  for (const p of window.PROCESSES) {
    const f = el.frac[p.key];
    if (f <= 0) continue;
    const c = hexToRgb(p.color);
    r += c.r * f; g += c.g * f; b += c.b * f; w += f;
  }
  if (w <= 0) return '#1a2133';
  return `rgb(${Math.round(r/w)}, ${Math.round(g/w)}, ${Math.round(b/w)})`;
};

function hexToRgb(hex) {
  const m = hex.replace('#','');
  return {
    r: parseInt(m.slice(0,2), 16),
    g: parseInt(m.slice(2,4), 16),
    b: parseInt(m.slice(4,6), 16),
  };
}

// Classify an element's dominant process (for short labels).
window.dominantProcess = function dominantProcess(el) {
  let best = null, bestF = 0;
  for (const p of window.PROCESSES) {
    if (el.frac[p.key] > bestF) { best = p; bestF = el.frac[p.key]; }
  }
  return best;
};
