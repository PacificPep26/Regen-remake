/**
 * Inline SVG US flag — the 🇺🇸 emoji renders as literal "US" text on some
 * Windows/browser font combos instead of an actual flag glyph (OS-level
 * color-emoji font limitation, not something CSS can fix). An SVG
 * guarantees the same flag renders everywhere.
 */
const UsFlag = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 7410 3900"
    className={className}
    role="img"
    aria-label="United States flag"
  >
    <rect width="7410" height="3900" fill="#b22234" />
    <g fill="#fff">
      {[1, 3, 5, 7, 9, 11, 13].map((i) => (
        <rect key={i} y={(i * 300)} width="7410" height="300" />
      ))}
    </g>
    <rect width="2964" height="2100" fill="#3c3b6e" />
  </svg>
)

export default UsFlag
