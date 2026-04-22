// Process decomposition bars + interpretation text
function ProcessBars({ element }) {
  if (!element) return null;
  const items = window.PROCESSES.map(p => ({ ...p, frac: element.frac[p.key] }))
    .filter(p => p.frac > 0)
    .sort((a,b) => b.frac - a.frac);
  return (
    <div className="proc-list">
      {items.map(p => (
        <div className="proc-row" key={p.key}>
          <div className="label">{p.short}</div>
          <div className="bar"><div className="fill" style={{ width: `${p.frac*100}%`, background: p.color }} /></div>
          <div className="pct">{Math.round(p.frac*100)}%</div>
        </div>
      ))}
    </div>
  );
}

function Interpretation({ archetype, feh, alphafe, enabled }) {
  const lines = [];

  // Metallicity context
  if (feh < -2.5) lines.push(['// very metal-poor — Pop II; born from gas enriched by only a few supernovae', 'muted']);
  else if (feh < -1) lines.push(['// metal-poor — old halo / thick disk era; few SN Ia yet', 'muted']);
  else if (feh < -0.3) lines.push(['// intermediate — thick disk / inner disk regime', 'muted']);
  else lines.push(['// metal-rich — modern thin disk / bulge', 'muted']);

  // α/Fe context
  if (alphafe > 0.25) lines.push([`[α/Fe] = +${alphafe.toFixed(2)}  →  CCSN-dominated; formed fast, before SN Ia caught up`, 'hi']);
  else if (alphafe > 0.1) lines.push([`[α/Fe] = +${alphafe.toFixed(2)}  →  mixed CCSN + SN Ia`, null]);
  else if (alphafe > -0.05) lines.push([`[α/Fe] ≈ 0  →  SN Ia have diluted α-elements; thin-disk-like`, null]);
  else lines.push([`[α/Fe] = ${alphafe.toFixed(2)}  →  strongly SN Ia enriched`, 'low']);

  // Eu (r-process)
  const eu = archetype?.eufe;
  if (eu !== undefined) {
    if (eu > 1.0) lines.push([`[Eu/Fe] = +${eu.toFixed(2)}  →  r-II: likely a single neutron-star-merger / rare CCSN event`, 'hi']);
    else if (eu > 0.3) lines.push([`[Eu/Fe] = +${eu.toFixed(2)}  →  r-I: moderate r-process enhancement`, 'hi']);
    else if (eu < -0.3) lines.push([`[Eu/Fe] = ${eu.toFixed(2)}  →  r-poor: too early / too unlucky for NSM enrichment`, 'low']);
  }

  // Ba (s-process dominant at solar)
  const ba = archetype?.bafe;
  if (ba !== undefined) {
    if (ba > 0.8) lines.push([`[Ba/Fe] = +${ba.toFixed(2)}  →  s-process enhancement (AGB companion?)`, 'hi']);
    else if (ba < -0.8) lines.push([`[Ba/Fe] = ${ba.toFixed(2)}  →  no s-process yet; AGBs hadn't contributed`, 'low']);
  }

  // If processes disabled
  const disabled = window.PROCESSES.filter(p => !enabled[p.key]);
  if (disabled.length) {
    lines.push([`// simulating: ${disabled.map(p=>p.short).join(', ')} OFF`, 'muted']);
  }

  // Story blurb
  if (archetype?.blurb) {
    lines.push(['', null]);
    lines.push([archetype.blurb, null]);
  }

  return (
    <div className="interp">
      <p><span className="prompt">$</span> <span className="muted">interpret --star={archetype?.id || 'custom'}</span></p>
      {lines.map(([t, cls], i) => (
        <p key={i} className={cls || ''}>{t}</p>
      ))}
    </div>
  );
}

window.ProcessBars = ProcessBars;
window.Interpretation = Interpretation;
