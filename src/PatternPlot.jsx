// Abundance pattern plot: [X/Fe] vs atomic number Z
function PatternPlot({ feh, enabled, archetype, selected, onSelect }) {
  const W = 820, H = 260;
  const padL = 40, padR = 14, padT = 14, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const zMin = 1, zMax = 92;
  const yMin = -2, yMax = 2.5;

  const xScale = z => padL + (z - zMin) / (zMax - zMin) * plotW;
  const yScale = y => padT + (yMax - y) / (yMax - yMin) * plotH;

  // Draw process bands (vertical strips for Z ranges)
  const bands = [
    { key: 'light',  z0: 1,  z1: 5,  color: '#9ab5ff', label: 'light' },
    { key: 'cno',    z0: 6,  z1: 9,  color: '#6ad0c2', label: 'CNO' },
    { key: 'alpha',  z0: 8,  z1: 22, color: '#e8c46a', label: 'α + Fe-peak' },
    { key: 'fepk',   z0: 23, z1: 30, color: '#e87a7a', label: '' },
    { key: 's1',     z0: 37, z1: 42, color: '#b67ae8', label: 'light s' },
    { key: 's2',     z0: 55, z1: 60, color: '#b67ae8', label: '2nd s' },
    { key: 'r',      z0: 63, z1: 72, color: '#e87ac8', label: 'lanthanides (r/s)' },
    { key: 's3',     z0: 80, z1: 83, color: '#b67ae8', label: '3rd s (Pb)' },
    { key: 'actin',  z0: 89, z1: 92, color: '#e87ac8', label: 'actinides' },
  ];

  // Data points
  const points = window.ELEMENTS.map(el => {
    const xfe = window.computeXFe(el, feh, enabled, archetype?.xfe);
    return { el, xfe: Math.max(yMin + 0.05, Math.min(yMax - 0.05, xfe)) };
  }).filter(p => isFinite(p.xfe));

  // Sort by Z for line
  points.sort((a, b) => a.el.Z - b.el.Z);

  // Build a smoothed line through dominant-process groups
  // (visual only; use raw points too)
  return (
    <svg className="plot-svg" viewBox={`0 0 ${W} ${H}`}>
      {/* Bands */}
      {bands.map(b => (
        <g key={b.key}>
          <rect
            x={xScale(b.z0)} y={padT}
            width={xScale(b.z1) - xScale(b.z0)} height={plotH}
            fill={b.color} className="plot-band"
          />
          {b.label && (
            <text
              x={(xScale(b.z0) + xScale(b.z1)) / 2}
              y={padT + 10}
              textAnchor="middle"
              className="plot-label"
              style={{ fontSize: 8 }}
            >
              {b.label}
            </text>
          )}
        </g>
      ))}

      {/* Y grid */}
      {[-2, -1, 0, 1, 2].map(y => (
        <g key={y}>
          <line
            x1={padL} x2={W - padR}
            y1={yScale(y)} y2={yScale(y)}
            className={y === 0 ? 'plot-zero' : 'plot-grid'}
          />
          <text x={padL - 6} y={yScale(y) + 3} textAnchor="end" className="plot-axis">
            {y >= 0 ? '+' : ''}{y.toFixed(1)}
          </text>
        </g>
      ))}

      {/* X ticks */}
      {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(z => (
        <g key={z}>
          <line x1={xScale(z)} x2={xScale(z)} y1={H - padB} y2={H - padB + 3} stroke="var(--fg-dim)" />
          <text x={xScale(z)} y={H - padB + 14} textAnchor="middle" className="plot-axis">{z}</text>
        </g>
      ))}
      <text x={W/2} y={H - 4} textAnchor="middle" className="plot-axis">atomic number Z</text>
      <text x={10} y={padT + plotH/2} transform={`rotate(-90 10 ${padT + plotH/2})`} textAnchor="middle" className="plot-axis">[X/Fe]</text>

      {/* Points */}
      {points.map(p => {
        const col = window.elementColor(p.el);
        const isSel = selected && selected.Z === p.el.Z;
        return (
          <g key={p.el.Z} style={{ cursor: 'pointer' }} onClick={() => onSelect(p.el)}>
            <circle
              cx={xScale(p.el.Z)}
              cy={yScale(p.xfe)}
              r={isSel ? 5 : 3}
              fill={col}
              stroke={isSel ? '#fff' : 'none'}
              strokeWidth={isSel ? 1.5 : 0}
            />
            {isSel && (
              <text
                x={xScale(p.el.Z) + 7}
                y={yScale(p.xfe) + 3}
                className="plot-label"
                style={{ fill: '#fff', fontSize: 9 }}
              >
                {p.el.sym} {(p.xfe >= 0 ? '+' : '') + p.xfe.toFixed(2)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

window.PatternPlot = PatternPlot;
