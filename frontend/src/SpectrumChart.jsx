import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:8000";

const SHORT_LABEL = {
  labour: "L",
  conservative: "C",
  libdem: "LD",
  snp: "SNP",
  plaid: "PC",
};

// Party fills that are too pale for white text — use dark instead.
const PALE_DOTS = new Set(["snp"]);

export function SpectrumChart({ axisId, parties }) {
  const [axes, setAxes] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/axes`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setAxes(d.axes))
      .catch(() => setAxes([]));
  }, []);

  if (!axes || !axisId || !parties || parties.length === 0) return null;
  const axis = axes.find((a) => a.id === axisId);
  if (!axis) return null;

  // Flip y for SVG (libertarian-positive in data → top in chart).
  const dots = parties
    .map((p) => {
      const pos = axis.parties[p.id];
      if (!pos) return null;
      return { id: p.id, name: p.name, colour: p.colour, x: pos.x, y: -pos.y };
    })
    .filter(Boolean);

  if (dots.length === 0) return null;

  return (
    <div className="spectrum">
      <div className="spectrum__title">{axis.label} · political compass</div>
      <svg className="spectrum__svg" viewBox="-1.18 -1.18 2.36 2.36" role="img" aria-label={`${axis.label} spectrum`}>
        <line x1="-1" y1="0" x2="1" y2="0" stroke="rgba(245,245,245,0.18)" strokeWidth="0.006" />
        <line x1="0" y1="-1" x2="0" y2="1" stroke="rgba(245,245,245,0.18)" strokeWidth="0.006" />
        <text x="-1.06" y="-1.06" fontSize="0.085" fill="rgba(245,245,245,0.34)" textAnchor="start" dominantBaseline="hanging">Left · Lib</text>
        <text x="1.06"  y="-1.06" fontSize="0.085" fill="rgba(245,245,245,0.34)" textAnchor="end"   dominantBaseline="hanging">Right · Lib</text>
        <text x="-1.06" y="1.06"  fontSize="0.085" fill="rgba(245,245,245,0.34)" textAnchor="start">Left · Auth</text>
        <text x="1.06"  y="1.06"  fontSize="0.085" fill="rgba(245,245,245,0.34)" textAnchor="end">Right · Auth</text>
        {dots.map((d) => (
          <g key={d.id}>
            <circle cx={d.x} cy={d.y} r="0.10" fill={d.colour} stroke="rgba(255,255,255,0.75)" strokeWidth="0.014" />
            <text x={d.x} y={d.y} fontSize="0.085" fontWeight="700" fill={PALE_DOTS.has(d.id) ? "#1a1a1a" : "#ffffff"} textAnchor="middle" dominantBaseline="central" pointerEvents="none">
              {SHORT_LABEL[d.id] || d.id.slice(0, 2).toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
