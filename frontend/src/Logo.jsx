export function Logo() {
  return (
    <a className="logo" href="/" aria-label="Lean In — home">
      <svg viewBox="0 0 32 32" className="logo-figure" aria-hidden="true">
        <defs>
          <clipPath id="ballot-clip">
            <rect x="3" y="11" width="26" height="18" rx="2.2" />
          </clipPath>
          <clipPath id="paper-slot-clip">
            <rect x="0" y="0" width="32" height="11" />
          </clipPath>
        </defs>

        {/* Ballot box — front face filled with the Union Jack */}
        <g>
          <rect x="3" y="11" width="26" height="18" rx="2.2" fill="#00205B" />

          <g clipPath="url(#ballot-clip)">
            <path d="M3 11 L29 29 M29 11 L3 29" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M3 11 L29 29 M29 11 L3 29" stroke="#C8102E" strokeWidth="1.6" />
            <rect x="14" y="11" width="4" height="18" fill="#FFFFFF" />
            <rect x="3" y="18" width="26" height="4" fill="#FFFFFF" />
            <rect x="15" y="11" width="2" height="18" fill="#C8102E" />
            <rect x="3" y="19" width="26" height="2" fill="#C8102E" />
          </g>

          {/* Slot rim */}
          <rect x="6" y="10.4" width="20" height="1.8" rx="0.6" fill="rgba(0, 0, 0, 0.78)" />

          {/* Outline */}
          <rect x="3" y="11" width="26" height="18" rx="2.2"
            fill="none" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="0.6" />
        </g>

        {/* Outer group hosts the clip-path so it stays in the SVG coordinate
            system while the inner group transforms. Merging would let the clip
            travel with the paper and break the "into the slot" effect. */}
        <g clipPath="url(#paper-slot-clip)">
          <g className="logo-paper">
            <rect x="6" y="2" width="20" height="9" rx="0.6" fill="#F8F8F2" />
            <line x1="9" y1="5" x2="23" y2="5" stroke="#b5b5b5" strokeWidth="0.45" />
            <line x1="9" y1="6.8" x2="23" y2="6.8" stroke="#b5b5b5" strokeWidth="0.45" />
            <line x1="9" y1="8.6" x2="20" y2="8.6" stroke="#b5b5b5" strokeWidth="0.45" />
          </g>
        </g>
      </svg>
    </a>
  );
}
