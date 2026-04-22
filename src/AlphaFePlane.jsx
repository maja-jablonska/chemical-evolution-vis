// [alpha/Fe] vs [Fe/H] plane
function AlphaFePlane({ feh, alphafe, archetype }) {
  const W = 320, H = 220;
  const padL = 40, padR = 12, padT = 12, padB = 32;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const xMin = -4.5, xMax = 0.6;
  const yMin = -0.15, yMax = 0.55;
  const xs = x => padL + (x - xMin) / (xMax - xMin) * plotW;
  const ys = y => padT + (yMax - y) / (yMax - yMin) * plotH;

  // Population loci (schematic ellipses)
  const pops = Object.entries(window.POPULATIONS).map(([key, p]) => {
    const [f0, f1] = p.fehRange;
    const cx = (f0 + f1) / 2;
    const w = (f1 - f0);
    const cy = p.alphaMean;
    const h = 0.08;
    return { key, color: p.color, label: p.label, cx, cy, w, h };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* axes */}
      {[-4, -3, -2, -1, 0].map(x => (
        <g key={x}>
          <line x1={xs(x)} x2={xs(x)} y1={padT} y2={H - padB} className="plot-grid" />
          <text x={xs(x)} y={H - padB + 12} textAnchor="middle" className="plot-axis">{x}</text>
        </g>
      ))}
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map(y => (
        <g key={y}>
          <line x1={padL} x2={W - padR} y1={ys(y)} y2={ys(y)} className="plot-grid" />
          <text x={padL - 4} y={ys(y) + 3} textAnchor="end" className="plot-axis">{y.toFixed(1)}</text>
        </g>
      ))}
      <text x={W/2} y={H - 4} textAnchor="middle" className="plot-axis">[Fe/H]</text>
      <text x={10} y={padT + plotH/2} transform={`rotate(-90 10 ${padT + plotH/2})`} textAnchor="middle" className="plot-axis">[α/Fe]</text>

      {/* knee track (schematic) */}
      <path
        d={(() => {
          const pts = [];
          for (let f = xMin; f <= xMax; f += 0.05) {
            let a;
            if (f <= -1.2) a = 0.35;
            else if (f >= 0.2) a = -0.02;
            else a = 0.35 - (f - (-1.2)) * (0.35 - (-0.02)) / (0.2 - (-1.2));
            pts.push(`${xs(f)},${ys(a)}`);
          }
          return 'M' + pts.join(' L');
        })()}
        stroke="#e8c46a" strokeWidth="1.2" fill="none" strokeDasharray="4 3" opacity="0.5"
      />

      {/* Populations */}
      {pops.map(p => (
        <g key={p.key}>
          <ellipse
            cx={xs(p.cx)} cy={ys(p.cy)}
            rx={Math.abs(xs(p.cx + p.w/2) - xs(p.cx))}
            ry={Math.abs(ys(p.cy - p.h/2) - ys(p.cy))}
            fill={p.color} opacity="0.15"
            stroke={p.color} strokeWidth="0.7"
          />
          <text
            x={xs(p.cx)} y={ys(p.cy + p.h/2 + 0.02)}
            textAnchor="middle"
            className="plot-axis"
            style={{ fill: p.color, fontSize: 8 }}
          >{p.label}</text>
        </g>
      ))}

      {/* Current point */}
      <circle cx={xs(feh)} cy={ys(alphafe)} r="5" fill="#fff" />
      <circle cx={xs(feh)} cy={ys(alphafe)} r="8" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
      <text x={xs(feh) + 9} y={ys(alphafe) - 6} className="plot-axis" style={{ fill: '#fff', fontSize: 9 }}>
        {archetype?.name || 'current'}
      </text>

      {/* Knee label */}
      <text x={xs(-1)} y={ys(0.35) - 4} className="plot-axis" style={{ fontSize: 8, fill: '#e8c46a' }}>
        knee ([Fe/H]≈−1)
      </text>
    </svg>
  );
}

window.AlphaFePlane = AlphaFePlane;
