// Main App component — wires everything together.
const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp } = React;

const DEFAULT_ENABLED = { bbn: true, cno: true, alpha: true, fepk: true, snia: true, s: true, r: true };

function App() {
  const [archId, setArchId] = useStateApp('sun');
  const [feh, setFeh] = useStateApp(0.0);
  const [fehDirty, setFehDirty] = useStateApp(false); // has user moved slider?
  const [enabled, setEnabled] = useStateApp(DEFAULT_ENABLED);
  const [selected, setSelected] = useStateApp(window.ELEMENTS.find(e => e.sym === 'Mg'));
  const [activeProcess, setActiveProcess] = useStateApp(null);
  const [tooltip, setTooltip] = useStateApp(null);
  const [tweaksOpen, setTweaksOpen] = useStateApp(false);
  const [tweaks, setTweaks] = useStateApp(/*EDITMODE-BEGIN*/{
    "density": "comfortable",
    "showProcBars": true,
    "showBands": true
  }/*EDITMODE-END*/);

  // When archetype changes, snap feh to archetype value.
  useEffectApp(() => {
    const a = window.ARCHETYPES.find(x => x.id === archId);
    if (a) { setFeh(a.feh); setFehDirty(false); }
  }, [archId]);

  // Persist selection
  useEffectApp(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('stellar-chem') || '{}');
      if (saved.archId) setArchId(saved.archId);
      if (saved.selectedSym) {
        const el = window.ELEMENTS.find(e => e.sym === saved.selectedSym);
        if (el) setSelected(el);
      }
    } catch (e) {}
  }, []);
  useEffectApp(() => {
    localStorage.setItem('stellar-chem', JSON.stringify({ archId, selectedSym: selected?.sym }));
  }, [archId, selected]);

  const archetype = window.ARCHETYPES.find(a => a.id === archId);
  // If user dragged slider, build a synthetic archetype
  const effectiveArch = fehDirty ? { ...archetype, feh, xfe: {} } : archetype;
  const alphafe = window.computeAlphaFe(effectiveArch?.feh ?? feh, enabled, effectiveArch?.xfe);

  // Tweaks edit-mode protocol
  useEffectApp(() => {
    function onMsg(e) {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    }
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  const selectedXFe = selected ? window.computeXFe(selected, effectiveArch?.feh ?? feh, enabled, effectiveArch?.xfe) : 0;

  return (
    <div className="app" data-screen-label="dashboard">
      {/* Topbar */}
      <div className="topbar">
        <div className="title">● STELLAR_CHEM</div>
        <div className="sub">nucleosynthesis dashboard / v1</div>
        <div className="spacer" />
        <div className="legend">
          {window.PROCESSES.map(p => (
            <div
              key={p.key}
              className={`chip ${activeProcess && activeProcess !== p.key ? 'disabled' : ''}`}
              onClick={() => setActiveProcess(activeProcess === p.key ? null : p.key)}
              title="click to filter table by this process"
            >
              <span className="sw" style={{ background: p.color }} />
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Left panel: controls */}
      <div className="panel">
        <div className="panel-section">
          <div className="panel-label">archetype star</div>
          <div className="archetype-list">
            {window.ARCHETYPES.map(a => (
              <button
                key={a.id}
                className={`btn ${archId === a.id ? 'active' : ''}`}
                onClick={() => setArchId(a.id)}
              >
                <span className="name">{a.name}</span>
                <span className="sub">[Fe/H]={a.feh.toFixed(2)} · {a.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-section">
          <div className="panel-label">[Fe/H] (override)</div>
          <div className="slider-row">
            <input
              type="range"
              min="-4.5" max="0.6" step="0.05"
              value={fehDirty ? feh : (archetype?.feh ?? 0)}
              onChange={e => { setFeh(parseFloat(e.target.value)); setFehDirty(true); }}
            />
            <span className="slider-value">{(fehDirty ? feh : archetype?.feh ?? 0).toFixed(2)}</span>
          </div>
          {fehDirty && (
            <button
              className="btn"
              style={{ marginTop: 8, fontSize: 10 }}
              onClick={() => setFehDirty(false)}
            >↺ reset to archetype</button>
          )}
        </div>

        <div className="panel-section">
          <div className="panel-label">nucleosynthesis channels</div>
          <div className="toggle-grid">
            {window.PROCESSES.map(p => (
              <div
                key={p.key}
                className={`toggle ${enabled[p.key] ? '' : 'off'}`}
                onClick={() => setEnabled({ ...enabled, [p.key]: !enabled[p.key] })}
              >
                <span className="sw" style={{ background: p.color }} />
                <span>{p.short}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <button className="btn" style={{ fontSize: 10, flex: 1 }}
              onClick={() => setEnabled(DEFAULT_ENABLED)}>all on</button>
            <button className="btn" style={{ fontSize: 10, flex: 1 }}
              onClick={() => setEnabled({ bbn: false, cno: false, alpha: false, fepk: false, snia: false, s: false, r: false })}>all off</button>
          </div>
        </div>

        <div className="panel-section">
          <div className="panel-label">populations map</div>
          <div className="afe-plane">
            <window.AlphaFePlane feh={effectiveArch?.feh ?? feh} alphafe={alphafe} archetype={effectiveArch} />
          </div>
        </div>
      </div>

      {/* Main: visualizations */}
      <div className="main">
        <div className="block">
          <div className="block-header">
            <div className="block-title">Star summary</div>
            <div className="block-subtitle">{archetype?.name} — {archetype?.pop}</div>
          </div>
          <div className="stat-grid">
            <div className="stat">
              <div className="k">[Fe/H]</div>
              <div className={`v ${(effectiveArch?.feh ?? feh) > 0 ? 'pos' : 'neg'}`}>{((effectiveArch?.feh ?? feh) >= 0 ? '+' : '') + (effectiveArch?.feh ?? feh).toFixed(2)}</div>
            </div>
            <div className="stat">
              <div className="k">[α/Fe]</div>
              <div className={`v ${alphafe > 0.1 ? 'pos' : alphafe < -0.05 ? 'neg' : ''}`}>{(alphafe >= 0 ? '+' : '') + alphafe.toFixed(2)}</div>
            </div>
            <div className="stat">
              <div className="k">[Eu/Fe]</div>
              <div className={`v ${(archetype?.eufe ?? 0) > 0.3 ? 'pos' : (archetype?.eufe ?? 0) < -0.3 ? 'neg' : ''}`}>{(((archetype?.eufe ?? 0) >= 0 ? '+' : '')) + (archetype?.eufe ?? 0).toFixed(2)}</div>
            </div>
            <div className="stat">
              <div className="k">[Ba/Fe]</div>
              <div className={`v ${(archetype?.bafe ?? 0) > 0.3 ? 'pos' : (archetype?.bafe ?? 0) < -0.3 ? 'neg' : ''}`}>{(((archetype?.bafe ?? 0) >= 0 ? '+' : '')) + (archetype?.bafe ?? 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="block">
          <div className="block-header">
            <div className="block-title">Periodic table · colored by process mix</div>
            <div className="block-subtitle">hover: details · click: inspect · badge: [X/Fe]</div>
          </div>
          <window.PeriodicTable
            selected={selected}
            onSelect={setSelected}
            feh={effectiveArch?.feh ?? feh}
            enabled={enabled}
            archetype={effectiveArch}
            activeProcess={activeProcess}
            setTooltip={setTooltip}
          />
        </div>

        <div className="block">
          <div className="block-header">
            <div className="block-title">Abundance pattern · [X/Fe] vs Z</div>
            <div className="block-subtitle">dashed line = solar · bands = process regions</div>
          </div>
          <div className="plot-wrap">
            <window.PatternPlot
              feh={effectiveArch?.feh ?? feh}
              enabled={enabled}
              archetype={effectiveArch}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="panel">
        <div className="panel-section">
          <div className="panel-label">interpretation</div>
          <window.Interpretation
            archetype={archetype}
            feh={effectiveArch?.feh ?? feh}
            alphafe={alphafe}
            enabled={enabled}
          />
        </div>

        {selected && (
          <div className="panel-section">
            <div className="panel-label">selected · {selected.sym} ({selected.name})</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 28, color: 'var(--fg)' }}>{selected.sym}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-dim)' }}>
                Z={selected.Z}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 14,
                color: selectedXFe > 0.15 ? '#e8c46a' : selectedXFe < -0.15 ? '#7ab8e8' : '#c8cfe0'
              }}>
                [{selected.sym}/Fe] = {(selectedXFe >= 0 ? '+' : '') + selectedXFe.toFixed(2)}
              </div>
            </div>
            <div className="panel-label" style={{ marginTop: 4 }}>process decomposition</div>
            <window.ProcessBars element={selected} />
            {selected.note && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-dim)', marginTop: 8, lineHeight: 1.5 }}>
                // {selected.note}
              </div>
            )}
          </div>
        )}

        <div className="panel-section">
          <div className="panel-label">reading this dashboard</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-dim)', lineHeight: 1.6 }}>
            <p style={{margin:'0 0 6px 0'}}>· cell color = process-weighted blend</p>
            <p style={{margin:'0 0 6px 0'}}>· [X/Fe] &gt; 0 (amber) = enhanced vs sun</p>
            <p style={{margin:'0 0 6px 0'}}>· [X/Fe] &lt; 0 (cyan) = deficient vs sun</p>
            <p style={{margin:'0 0 6px 0'}}>· toggle a channel off to see what that process contributes</p>
            <p style={{margin:'0'}}>· values for archetypes are representative literature numbers, rounded for intuition</p>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: Math.min(tooltip.x + 12, window.innerWidth - 280),
            top: Math.min(tooltip.y + 12, window.innerHeight - 120),
          }}
        >
          <div className="tt-title">{tooltip.el.sym} · {tooltip.el.name} (Z={tooltip.el.Z})</div>
          <div>[X/Fe] = {(tooltip.xfe >= 0 ? '+' : '') + tooltip.xfe.toFixed(2)}</div>
          <div className="tt-sub">
            {window.PROCESSES.filter(p => tooltip.el.frac[p.key] > 0.1)
              .map(p => `${p.short} ${Math.round(tooltip.el.frac[p.key]*100)}%`).join(' · ')}
          </div>
          {tooltip.el.note && <div className="tt-sub" style={{marginTop:4}}>{tooltip.el.note}</div>}
        </div>
      )}

      {/* Tweaks */}
      {tweaksOpen && (
        <div className="tweaks">
          <h3>Tweaks</h3>
          <div className="row">
            <label>periodic table density</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['compact', 'comfortable', 'large'].map(d => (
                <button key={d}
                  className={`btn ${tweaks.density === d ? 'active' : ''}`}
                  style={{ flex: 1, fontSize: 10 }}
                  onClick={() => setTweak('density', d)}
                >{d}</button>
              ))}
            </div>
          </div>
          <div className="row">
            <label>show process bars in cells</label>
            <button className={`btn ${tweaks.showProcBars ? 'active' : ''}`} style={{ width: '100%', fontSize: 10 }}
              onClick={() => setTweak('showProcBars', !tweaks.showProcBars)}>
              {tweaks.showProcBars ? 'on' : 'off'}
            </button>
          </div>
          <div className="row">
            <label>show process bands in pattern</label>
            <button className={`btn ${tweaks.showBands ? 'active' : ''}`} style={{ width: '100%', fontSize: 10 }}
              onClick={() => setTweak('showBands', !tweaks.showBands)}>
              {tweaks.showBands ? 'on' : 'off'}
            </button>
          </div>
        </div>
      )}

      {/* Apply density tweak */}
      <style>{`
        .ptable { --cell: ${tweaks.density === 'compact' ? '28px' : tweaks.density === 'large' ? '40px' : '34px'}; }
        ${!tweaks.showProcBars ? '.ptable .cell .proc-bars { display: none; }' : ''}
        ${!tweaks.showBands ? '.plot-band { display: none; }' : ''}
      `}</style>
    </div>
  );
}

window.App = App;
