// Periodic table grid component
const { useState, useMemo } = React;

function PeriodicTable({ selected, onSelect, feh, enabled, archetype, activeProcess, setTooltip }) {
  const cells = window.ELEMENTS.map(el => {
    const color = window.elementColor(el);
    const xfe = window.computeXFe(el, feh, enabled, archetype?.xfe);
    const isSel = selected && selected.Z === el.Z;
    // Dim cells that don't match active process filter
    const matchActive = !activeProcess || el.frac[activeProcess] > 0.2;
    const bg = matchActive ? color : 'rgba(50,60,80,0.25)';
    const textOp = matchActive ? 1 : 0.3;

    // XFe tint — blue for negative, amber for positive
    let xfeLabel = '';
    let xfeColor = 'var(--fg)';
    if (isFinite(xfe)) {
      xfeLabel = (xfe >= 0 ? '+' : '') + xfe.toFixed(1);
      xfeColor = xfe > 0.15 ? '#e8c46a' : xfe < -0.15 ? '#7ab8e8' : '#c8cfe0';
    }

    return (
      <div
        key={el.Z}
        className={`cell ${isSel ? 'selected' : ''}`}
        style={{
          gridRow: el.row,
          gridColumn: el.col,
          background: bg,
          opacity: textOp,
        }}
        onClick={() => onSelect(el)}
        onMouseEnter={(e) => setTooltip({
          x: e.clientX, y: e.clientY,
          el, xfe,
        })}
        onMouseMove={(e) => setTooltip({
          x: e.clientX, y: e.clientY,
          el, xfe,
        })}
        onMouseLeave={() => setTooltip(null)}
      >
        <div className="z">{el.Z}</div>
        <div className="sym" style={{ color: xfe > 0.3 ? '#fff' : '#0a0d14', textShadow: '0 0 2px rgba(255,255,255,0.2)' }}>{el.sym}</div>
        <div className="xfe" style={{ color: xfeColor }}>{xfeLabel}</div>
        <div className="proc-bars">
          {window.PROCESSES.map(p => {
            const f = el.frac[p.key];
            if (f <= 0) return null;
            return <span key={p.key} style={{ width: `${f*100}%`, background: p.color }} />;
          })}
        </div>
      </div>
    );
  });

  return (
    <div className="ptable">
      {cells}
      {/* Strip labels */}
      <div className="strip-label" style={{ gridRow: 9, gridColumn: '1 / 4' }}>Lanthanides →</div>
      <div className="strip-label" style={{ gridRow: 10, gridColumn: '1 / 4' }}>Actinides →</div>
    </div>
  );
}

window.PeriodicTable = PeriodicTable;
