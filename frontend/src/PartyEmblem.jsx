// Simplified single-color party emblems. Drawn rather than imported because
// the official party SVGs from Wikimedia are all wide wordmarks (4:1+ ratios)
// that don't fit a uniform card badge, and several use dark grey fills that
// don't show on the glass background.
const EMBLEMS = {
  labour: (
    // Rose — five petals + dark centre
    <g fill="#E4003B">
      <circle cx="16" cy="9" r="4.5" />
      <circle cx="22.5" cy="13.5" r="4.5" />
      <circle cx="20" cy="20.5" r="4.5" />
      <circle cx="12" cy="20.5" r="4.5" />
      <circle cx="9.5" cy="13.5" r="4.5" />
      <circle cx="16" cy="15.5" r="3" fill="rgba(6, 8, 12, 0.95)" />
    </g>
  ),
  conservative: (
    // Oak tree — clustered foliage + trunk
    <g fill="#0087DC">
      <circle cx="16" cy="9" r="5" />
      <circle cx="10.5" cy="13" r="4.5" />
      <circle cx="21.5" cy="13" r="4.5" />
      <circle cx="13" cy="17" r="4" />
      <circle cx="19" cy="17" r="4" />
      <rect x="14.5" y="17" width="3" height="9" rx="0.6" />
    </g>
  ),
  libdem: (
    // Bird of Liberty — stylised swoop
    <g fill="#FAA61A">
      <path d="M3 19 C 8 11, 13 13, 16 16 C 19 13, 24 11, 29 19 C 24 14, 20 17, 16 19 C 12 17, 8 14, 3 19 Z" />
      <circle cx="16" cy="17" r="1.6" />
    </g>
  ),
  snp: (
    // Saltire — Scottish national symbol, simplified
    <g stroke="#FDF38E" strokeWidth="3.5" fill="none" strokeLinecap="round">
      <path d="M5 7 L27 25" />
      <path d="M27 7 L5 25" />
    </g>
  ),
  plaid: (
    // Welsh poppy — four petals + dark centre
    <g fill="#005B54">
      <circle cx="16" cy="8" r="5.5" />
      <circle cx="24" cy="16" r="5.5" />
      <circle cx="16" cy="24" r="5.5" />
      <circle cx="8" cy="16" r="5.5" />
      <circle cx="16" cy="16" r="3" fill="rgba(6, 8, 12, 0.95)" />
    </g>
  ),
};

export function PartyEmblem({ partyId, size = 32 }) {
  const emblem = EMBLEMS[partyId];
  if (!emblem) return null;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className="party-emblem"
      aria-hidden="true"
    >
      {emblem}
    </svg>
  );
}
