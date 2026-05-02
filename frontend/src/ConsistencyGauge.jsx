// Tachymeter-style gauge. Two variants:
//   compact — small coloured arc + percentage. Used inline in lists.
//   full    — larger 3-zone tachymeter with needle. Used in MP detail.
const RED = "#dc4040";
const AMBER = "#e09040";
const GREEN = "#4ca85a";

function colourFor(value) {
  if (value >= 70) return GREEN;
  if (value >= 40) return AMBER;
  return RED;
}

function clamp(v) {
  return Math.max(0, Math.min(100, v));
}

export function ConsistencyGauge({ value, variant = "compact", label }) {
  const v = clamp(value);
  if (variant === "full") return <FullGauge value={v} label={label} />;
  return <CompactGauge value={v} />;
}

function CompactGauge({ value }) {
  const radius = 22;
  const semi = Math.PI * radius;
  const filled = (value / 100) * semi;
  const colour = colourFor(value);

  return (
    <span className="gauge gauge--compact" aria-label={`${value}%`}>
      <svg viewBox="0 0 56 32" width="56" height="32" aria-hidden="true">
        <path
          d="M 6 26 A 22 22 0 0 1 50 26"
          stroke="rgba(255, 255, 255, 0.10)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 6 26 A 22 22 0 0 1 50 26"
          stroke={colour}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${semi}`}
        />
      </svg>
      <span className="gauge__pct">{value}%</span>
    </span>
  );
}

function FullGauge({ value }) {
  const radius = 70;
  const cx = 100;
  const cy = 90;

  const angleDeg = 180 - (value / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const needleLen = radius - 8;
  const needleX = cx + needleLen * Math.cos(angleRad);
  const needleY = cy - needleLen * Math.sin(angleRad);

  return (
    <svg viewBox="0 0 200 100" width="200" height="100" aria-label={`${value}%`} className="gauge gauge--full">
      <path d={zoneArc(0, 40, radius, cx, cy)}   stroke={RED}   strokeWidth="12" fill="none" strokeLinecap="butt" />
      <path d={zoneArc(40, 70, radius, cx, cy)}  stroke={AMBER} strokeWidth="12" fill="none" strokeLinecap="butt" />
      <path d={zoneArc(70, 100, radius, cx, cy)} stroke={GREEN} strokeWidth="12" fill="none" strokeLinecap="butt" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#f5f5f5" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#f5f5f5" />
    </svg>
  );
}

function zoneArc(startPct, endPct, radius, cx, cy) {
  const a = (180 - (startPct / 100) * 180) * Math.PI / 180;
  const b = (180 - (endPct / 100) * 180) * Math.PI / 180;
  const x1 = cx + radius * Math.cos(a);
  const y1 = cy - radius * Math.sin(a);
  const x2 = cx + radius * Math.cos(b);
  const y2 = cy - radius * Math.sin(b);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
