/** Expird — coordinate field with plotted listings and a readout edge. */
export function MapVisual({ accent }: { accent: string }) {
  const points = [
    [22, 34],
    [38, 58],
    [54, 26],
    [63, 66],
    [76, 44],
    [31, 74],
    [86, 70],
  ];

  return (
    <svg
      viewBox="0 0 200 130"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="0.25" opacity="0.16">
        {[26, 52, 78, 104].map((y) => (
          <line key={y} x1="0" x2="200" y1={y} y2={y} />
        ))}
        {[40, 80, 120, 160].map((x) => (
          <line key={x} x1={x} x2={x} y1="0" y2="130" />
        ))}
      </g>

      {/* Parcel fragments. */}
      <g stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.28">
        <path d="M18 22 h44 v30 h-26 v22 h-18 z" />
        <path d="M96 40 h52 v26 h-30 v20 h-22 z" />
        <path d="M60 78 h30 v26 h-30 z" />
      </g>

      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="1.4" fill={accent} opacity={i % 3 === 0 ? 1 : 0.5} />
          {i % 3 === 0 ? (
            <circle cx={x} cy={y} r="4.5" fill="none" stroke={accent} strokeWidth="0.3" opacity="0.5" />
          ) : null}
        </g>
      ))}

      {/* Readout rail. */}
      <g opacity="0.5">
        <line x1="160" y1="14" x2="160" y2="116" stroke="currentColor" strokeWidth="0.25" />
        {[20, 34, 48, 62, 76, 90, 104].map((y, i) => (
          <line
            key={y}
            x1="160"
            x2={i % 2 === 0 ? 170 : 165}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.25"
          />
        ))}
      </g>
    </svg>
  );
}
