"use client";

import { motion } from "motion/react";

import { easing } from "@/lib/motion";

/**
 * Drawings for the moments that have no photograph.
 *
 * The photo slots were standing empty, and the honest fill for a story about
 * groundwater is not a stock picture of somebody in a hard hat — it's the
 * drawing the work itself produces. Each one is a plate from that world, in
 * the same line language as the chapter figures beside them: a cross-section
 * of the ground, a sheet of field readings, and the crossing from one to the
 * other.
 *
 * Nothing here claims to be a record of a particular day. They are diagrams,
 * and they read as diagrams; a real photograph replaces one by setting `image`
 * on the moment, with no other change.
 */

export type MomentArtKind = "cross-section" | "field-sheet" | "crossover";

const draw = (delay: number, duration = 1.1) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration, ease: easing.outQuart, delay },
  },
});

/** Dashed guides can't be drawn — a dash pattern and a draw fight over the
 *  same property — so they fade in behind the lines that can. */
const fade = (delay: number) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, delay } },
});

const pop = (delay: number) => ({
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easing.outExpo, delay },
  },
});

/* --- 01 · The ground in section --------------------------------------------- */

function CrossSection({ tone }: { tone: string }) {
  return (
    <>
      {/* Strata. */}
      <motion.path d="M6 58 C 60 48, 120 66, 180 56 S 290 44, 354 54" variants={draw(0.05)} />
      <motion.path d="M6 96 C 70 88, 130 104, 190 96 S 296 86, 354 94" variants={draw(0.18)} />
      <motion.path d="M6 154 C 64 148, 128 160, 192 152 S 298 142, 354 150" variants={draw(0.3)} />
      <motion.path d="M6 206 C 70 200, 140 212, 210 204 S 300 196, 354 202" variants={draw(0.42)} />

      {/* The water table, and the saturated ground under it. */}
      <motion.path
        d="M6 124 C 72 118, 132 132, 196 124 S 298 114, 354 122"
        strokeWidth="1.6"
        stroke={tone}
        variants={draw(0.55)}
      />
      <motion.g variants={fade(0.9)} style={{ color: tone }}>
        {Array.from({ length: 11 }, (_, i) => 22 + i * 31).map((x) => (
          <line key={x} x1={x} y1={132} x2={x} y2={200} strokeDasharray="1 7" opacity={0.5} />
        ))}
      </motion.g>

      {/* The well: casing, screen, and the water standing in it. */}
      <motion.path d="M150 16 L150 186 M172 16 L172 186" variants={draw(0.68)} />
      <motion.path d="M150 186 L172 186" variants={draw(0.86, 0.4)} />
      <motion.g variants={fade(1)} style={{ color: tone }}>
        <rect x="150" y="140" width="22" height="46" fill="currentColor" opacity={0.12} />
        <line x1="150" y1="124" x2="172" y2="124" strokeWidth="1.6" />
      </motion.g>
      <motion.path d="M140 16 L182 16" strokeWidth="1.6" variants={draw(0.62, 0.4)} />

      {/* Flow toward the well. */}
      <motion.g variants={fade(1.15)} style={{ color: tone }}>
        {[
          "M60 150 L120 146 M112 141 L120 146 L112 151",
          "M300 146 L212 150 M220 145 L212 150 L220 155",
        ].map((d) => (
          <path key={d} d={d} opacity={0.75} />
        ))}
      </motion.g>

      <motion.g variants={pop(1.3)} style={{ color: tone }}>
        <circle cx="161" cy="124" r="3.5" fill="currentColor" />
      </motion.g>
    </>
  );
}

/* --- 02 · A sheet of readings ------------------------------------------------ */

function FieldSheet({ tone }: { tone: string }) {
  return (
    <>
      {/* Axes. */}
      <motion.path d="M40 26 L40 186 L340 186" variants={draw(0.05, 0.8)} />

      {/* Drawdown, then recovery — the shape a pumping test leaves behind. */}
      <motion.path
        d="M40 54 L104 54 C 132 54, 150 104, 176 140 S 214 172, 248 172"
        strokeWidth="1.6"
        stroke={tone}
        variants={draw(0.3, 1.3)}
      />
      <motion.path
        d="M248 172 C 286 172, 300 120, 316 86 L340 66"
        strokeWidth="1.6"
        stroke={tone}
        strokeDasharray="4 4"
        variants={fade(1.35)}
      />

      {/* Readings taken along it. */}
      <motion.g variants={fade(1.5)} style={{ color: tone }}>
        {[
          [104, 54],
          [150, 100],
          [200, 156],
          [248, 172],
          [300, 120],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="3" fill="currentColor" />
            <line x1={x} y1={y} x2={x} y2={186} strokeDasharray="2 4" opacity={0.45} />
          </g>
        ))}
      </motion.g>

      {/* The tick marks a sheet like this carries. */}
      <motion.g variants={fade(0.6)}>
        {[54, 92, 130, 168].map((y) => (
          <line key={y} x1="34" y1={y} x2="40" y2={y} />
        ))}
        {[104, 168, 232, 296].map((x) => (
          <line key={x} x1={x} y1="186" x2={x} y2="192" />
        ))}
      </motion.g>

      {/* Sample vials, logged beside the curve. */}
      <motion.g variants={fade(1.7)}>
        {[268, 292, 316].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 30 L${x} 62 Q${x} 68 ${x + 6} 68 Q${x + 12} 68 ${x + 12} 62 L${x + 12} 30 Z`} />
            <line x1={x} y1="36" x2={x + 12} y2="36" />
            <rect
              x={x}
              y={52 - i * 6}
              width="12"
              height={16 + i * 6}
              fill={tone}
              opacity={0.16}
              stroke="none"
            />
          </g>
        ))}
      </motion.g>
    </>
  );
}

/* --- 03 · The crossing ------------------------------------------------------- */

function Crossover({ tone }: { tone: string }) {
  return (
    <>
      {/* Contours on the left, thinning as they travel right. */}
      <motion.g variants={fade(0.1)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.path
            key={i}
            d={`M14 ${40 + i * 30} C 60 ${28 + i * 30}, 92 ${58 + i * 30}, 140 ${44 + i * 30}`}
            variants={draw(0.1 + i * 0.09, 0.9)}
            opacity={1 - i * 0.12}
          />
        ))}
      </motion.g>

      {/* The same lines, resolving into rows of code on the right. */}
      <motion.g variants={fade(0.8)} style={{ color: tone }}>
        {[
          [196, 56, 96],
          [208, 78, 74],
          [208, 100, 110],
          [196, 122, 66],
          [208, 144, 88],
        ].map(([x, y, w]) => (
          <line key={y} x1={x} y1={y} x2={x + w} y2={y} strokeWidth="3" opacity={0.5} />
        ))}
      </motion.g>

      {/* The brackets that hold them. */}
      <motion.path
        d="M176 34 C 166 34, 166 96, 156 100 C 166 104, 166 166, 176 166"
        strokeWidth="1.6"
        stroke={tone}
        variants={draw(0.65, 0.9)}
      />
      <motion.path
        d="M332 34 C 342 34, 342 96, 352 100 C 342 104, 342 166, 332 166"
        strokeWidth="1.6"
        stroke={tone}
        variants={draw(0.75, 0.9)}
      />

      {/* One line carried across the gap. */}
      <motion.path
        d="M140 100 L156 100"
        strokeDasharray="3 4"
        variants={fade(1.1)}
      />
      <motion.g variants={pop(1.25)} style={{ color: tone }}>
        <circle cx="148" cy="100" r="3.5" fill="currentColor" />
      </motion.g>
    </>
  );
}

const ART: Record<MomentArtKind, (props: { tone: string }) => React.ReactElement> = {
  "cross-section": CrossSection,
  "field-sheet": FieldSheet,
  crossover: Crossover,
};

export function MomentArt({
  kind,
  tone,
  play,
}: {
  kind: MomentArtKind;
  tone: string;
  /** Drawn once the moment it belongs to has developed. */
  play: boolean;
}) {
  const Figure = ART[kind];

  return (
    <svg
      aria-hidden
      viewBox="0 0 360 212"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full text-fg/55"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    >
      <motion.g initial="hidden" animate={play ? "visible" : "hidden"}>
        <Figure tone={tone} />
      </motion.g>
    </svg>
  );
}
