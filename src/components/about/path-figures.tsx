"use client";

import { motion, type Variants } from "motion/react";

import { easing } from "@/lib/motion";

/**
 * One drawing per chapter of the route in.
 *
 * Deliberately abstract, and deliberately in the site's own line idiom — ink
 * hairlines on paper with one coded accent — so they read as figures in the
 * same drawing set as the case-study plates rather than as illustrations
 * dropped into the page. None of them depicts a real place, product or
 * number; they describe the kind of work each stop was.
 *
 * Every stroke draws itself in when its chapter becomes the one being read,
 * and undraws when the reader moves on, so the panel changes with the story
 * instead of cutting between pictures.
 */

export type FigureKind = "contours" | "parcels" | "tools" | "venn";

const DRAW: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, ease: easing.outQuart, delay: 0.1 + i * 0.07 },
      opacity: { duration: 0.2, delay: 0.1 + i * 0.07 },
    },
  }),
};

const FADE: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easing.outExpo, delay: 0.25 + i * 0.07 },
  }),
};

const INK = "currentColor";

/* --- Earth science: a contour map -------------------------------------------
   Seven nested closed lines around a summit. Computed once at module scope from
   fixed sine terms, never random, so the server and the client draw the same
   terrain. */
const CONTOURS = Array.from({ length: 7 }, (_, ring) => {
  const base = 26 + ring * 19;
  const points = Array.from({ length: 72 }, (_, step) => {
    const theta = (step / 72) * Math.PI * 2;
    const wobble =
      1 +
      0.16 * Math.sin(3 * theta + ring * 0.55) +
      0.07 * Math.sin(5 * theta + 1.3 + ring * 0.2);
    const x = 196 + Math.cos(theta) * base * wobble * 1.3;
    const y = 132 + Math.sin(theta) * base * wobble * 0.82;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")} Z`;
});

function Contours({ tone }: { tone: string }) {
  return (
    <>
      {CONTOURS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          custom={CONTOURS.length - i}
          variants={DRAW}
          fill="none"
          stroke={i === 0 ? tone : INK}
          strokeOpacity={i === 0 ? 1 : 0.34 - i * 0.03}
          strokeWidth={i === 0 ? 1.5 : 1}
        />
      ))}
      {/* The survey mark on the summit. */}
      <motion.g custom={8} variants={FADE} style={{ transformOrigin: "196px 132px" }}>
        <line x1="186" y1="132" x2="206" y2="132" stroke={tone} strokeWidth="1.25" />
        <line x1="196" y1="122" x2="196" y2="142" stroke={tone} strokeWidth="1.25" />
      </motion.g>
    </>
  );
}

/* --- Real estate: a site plan -------------------------------------------------
   A block cut into lots along a street, one of them marked. */
const LOTS = [
  [52, 58, 62, 74], [114, 58, 50, 74], [164, 58, 70, 74], [234, 58, 56, 74], [290, 58, 60, 74],
  [52, 132, 80, 70], [132, 132, 58, 70], [190, 132, 64, 70], [254, 132, 96, 70],
] as const;

function Parcels({ tone }: { tone: string }) {
  return (
    <>
      <motion.rect
        x="52" y="58" width="298" height="144"
        custom={0} variants={DRAW}
        fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1.25"
      />
      {LOTS.map(([x, y, w, h], i) => (
        <motion.rect
          key={i}
          x={x} y={y} width={w} height={h}
          custom={i + 1} variants={DRAW}
          fill={i === 7 ? tone : "none"}
          fillOpacity={i === 7 ? 0.16 : 0}
          stroke={i === 7 ? tone : INK}
          strokeOpacity={i === 7 ? 1 : 0.28}
          strokeWidth={i === 7 ? 1.5 : 1}
        />
      ))}
      {/* The street. */}
      <motion.line
        x1="30" y1="226" x2="372" y2="226"
        custom={10} variants={DRAW}
        stroke={INK} strokeOpacity="0.4" strokeWidth="1"
      />
      <motion.line
        x1="30" y1="240" x2="372" y2="240"
        custom={11} variants={DRAW}
        stroke={INK} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="6 7"
      />
      {/* The pin on the marked lot. */}
      <motion.g custom={12} variants={FADE} style={{ transformOrigin: "222px 150px" }}>
        <circle cx="222" cy="152" r="5" fill={tone} />
        <line x1="222" y1="157" x2="222" y2="176" stroke={tone} strokeWidth="1.25" />
      </motion.g>
    </>
  );
}

/* --- Internal tools → shipping products -----------------------------------------
   A terminal on the left becomes a product window on the right. */
function Tools({ tone }: { tone: string }) {
  return (
    // Drawn against a 240-unit band; shifted to sit in the middle of the plate.
    <g transform="translate(0 20)">
      {/* Terminal */}
      <motion.rect x="28" y="62" width="142" height="116" rx="3" custom={0} variants={DRAW} fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1.25" />
      <motion.line x1="28" y1="80" x2="170" y2="80" custom={1} variants={DRAW} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      {[[42, 98, 40], [42, 114, 88], [42, 130, 62], [42, 146, 76]].map(([x, y, w], i) => (
        <motion.line key={i} x1={x + 10} y1={y} x2={x + 10 + w} y2={y} custom={2 + i} variants={DRAW} stroke={INK} strokeOpacity="0.42" strokeWidth="1.5" />
      ))}
      {[98, 114, 130, 146].map((y, i) => (
        <motion.path key={y} d={`M 38 ${y - 4} L 43 ${y} L 38 ${y + 4}`} custom={2 + i} variants={DRAW} fill="none" stroke={tone} strokeWidth="1.25" />
      ))}

      {/* The move from one to the other. */}
      <motion.line x1="184" y1="120" x2="216" y2="120" custom={6} variants={DRAW} stroke={tone} strokeWidth="1.5" />
      <motion.path d="M 209 113 L 217 120 L 209 127" custom={7} variants={DRAW} fill="none" stroke={tone} strokeWidth="1.5" />

      {/* Product */}
      <motion.rect x="230" y="46" width="144" height="148" rx="3" custom={8} variants={DRAW} fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1.25" />
      <motion.line x1="270" y1="46" x2="270" y2="194" custom={9} variants={DRAW} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      {[[282, 60, 80, 30], [282, 100, 38, 40], [324, 100, 38, 40], [282, 150, 80, 30]].map(([x, y, w, h], i) => (
        <motion.rect
          key={i}
          x={x} y={y} width={w} height={h} rx="2"
          custom={10 + i} variants={DRAW}
          fill={i === 0 ? tone : "none"} fillOpacity={i === 0 ? 0.16 : 0}
          stroke={i === 0 ? tone : INK} strokeOpacity={i === 0 ? 1 : 0.34} strokeWidth="1"
        />
      ))}
      {[62, 78, 94, 110].map((y, i) => (
        <motion.line key={y} x1="240" y1={y} x2="260" y2={y} custom={10 + i} variants={DRAW} stroke={INK} strokeOpacity="0.3" strokeWidth="1.25" />
      ))}
    </g>
  );
}

/* --- Design × build × product ------------------------------------------------
   Three disciplines, and the place they overlap. The labels are the words of
   the stop's own note. */
const CIRCLES = [
  { cx: 160, cy: 112, label: "Design", lx: 96, ly: 30 },
  { cx: 240, cy: 112, label: "Build", lx: 304, ly: 30 },
  { cx: 200, cy: 176, label: "Product", lx: 200, ly: 270 },
] as const;

function Venn({ tone }: { tone: string }) {
  return (
    <>
      {CIRCLES.map((c, i) => (
        <motion.circle
          key={c.label}
          cx={c.cx} cy={c.cy} r="72"
          custom={i} variants={DRAW}
          fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="1.25"
        />
      ))}
      <motion.g custom={4} variants={FADE} style={{ transformOrigin: "200px 134px" }}>
        <circle cx="200" cy="134" r="7" fill={tone} />
        <circle cx="200" cy="134" r="15" fill="none" stroke={tone} strokeOpacity="0.5" strokeWidth="1" />
      </motion.g>
      {CIRCLES.map((c, i) => (
        <motion.text
          key={c.label}
          x={c.lx} y={c.ly}
          custom={5 + i} variants={FADE}
          textAnchor="middle"
          fill={INK} fillOpacity="0.62"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {c.label}
        </motion.text>
      ))}
    </>
  );
}

const FIGURES: Record<FigureKind, (props: { tone: string }) => React.ReactElement> = {
  contours: Contours,
  parcels: Parcels,
  tools: Tools,
  venn: Venn,
};

export function PathFigure({
  kind,
  active,
  tone,
}: {
  kind: FigureKind;
  active: boolean;
  tone: string;
}) {
  const Figure = FIGURES[kind];

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 400 280"
      className="block h-full w-full text-fg"
      initial="hidden"
      animate={active ? "visible" : "hidden"}
    >
      <Figure tone={tone} />
    </motion.svg>
  );
}
