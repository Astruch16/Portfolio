/** Mintlytics — a movement trace over a price ladder. */
export function ChartVisual({ accent }: { accent: string }) {
  const line =
    "M6 88 L22 74 L34 80 L48 58 L62 64 L76 42 L90 50 L104 34 L118 40 L132 22 L146 30 L160 18 L176 24 L192 12";

  return (
    <svg
      viewBox="0 0 200 110"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="mintlytics-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      <g stroke="currentColor" strokeWidth="0.3" opacity="0.16">
        {[22, 44, 66, 88].map((y) => (
          <line key={y} x1="0" x2="200" y1={y} y2={y} />
        ))}
      </g>

      <path d={`${line} L192 110 L6 110 Z`} fill="url(#mintlytics-fill)" />
      <path d={line} fill="none" stroke={accent} strokeWidth="1" />

      {/* Price ladder. */}
      <g stroke="currentColor" strokeWidth="0.3" opacity="0.4">
        {[14, 30, 46, 62, 78, 94].map((y) => (
          <line key={y} x1="186" x2="196" y1={y} y2={y} />
        ))}
      </g>
      <circle cx="192" cy="12" r="1.8" fill={accent} />
    </svg>
  );
}
