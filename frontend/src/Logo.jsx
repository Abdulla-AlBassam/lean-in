export function Logo() {
  return (
    <a className="logo" href="/" aria-label="Lean In — home">
      <svg viewBox="0 0 32 32" className="logo-figure" aria-hidden="true">
        <defs>
          <clipPath id="ballot-clip">
            <rect x="3" y="11" width="26" height="18" rx="2.2" />
          </clipPath>
        </defs>

        {/* Ballot box — front face filled with the Union Jack */}
        <g>
          <rect x="3" y="11" width="26" height="18" rx="2.2" fill="#00205B" />

          <g clipPath="url(#ballot-clip)">
            {/* White diagonals (St Andrew / St Patrick base) */}
            <path d="M3 11 L29 29 M29 11 L3 29" stroke="#FFFFFF" strokeWidth="4" />
            {/* Red diagonals (St Patrick), narrower than the white base */}
            <path d="M3 11 L29 29 M29 11 L3 29" stroke="#C8102E" strokeWidth="1.6" />
            {/* White cross fimbriation */}
            <rect x="14" y="11" width="4" height="18" fill="#FFFFFF" />
            <rect x="3" y="18" width="26" height="4" fill="#FFFFFF" />
            {/* Red cross (St George) */}
            <rect x="15" y="11" width="2" height="18" fill="#C8102E" />
            <rect x="3" y="19" width="26" height="2" fill="#C8102E" />
          </g>

          {/* Slot rim — the dark interior visible at the top */}
          <rect x="9" y="10.4" width="14" height="2" rx="0.6" fill="rgba(0, 0, 0, 0.75)" />

          {/* Subtle outline so the ballot reads against any background */}
          <rect
            x="3"
            y="11"
            width="26"
            height="18"
            rx="2.2"
            fill="none"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="0.6"
          />
        </g>

        {/* White ballot paper peeking out — drops into the slot on hover */}
        <g className="logo-paper">
          <rect x="11" y="3" width="10" height="8.5" rx="0.5" fill="#F8F8F2" />
          <line x1="13" y1="6" x2="19" y2="6" stroke="#b5b5b5" strokeWidth="0.4" />
          <line x1="13" y1="7.8" x2="19" y2="7.8" stroke="#b5b5b5" strokeWidth="0.4" />
          <line x1="13" y1="9.6" x2="17" y2="9.6" stroke="#b5b5b5" strokeWidth="0.4" />
        </g>
      </svg>
    </a>
  );
}
