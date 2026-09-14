"use client";

import { motion, type Variants } from "motion/react";

import { easing } from "@/lib/motion";

/**
 * One drawing per chapter of the route in, set as a technical sheet.
 *
 * The first version was a single motif floating in an empty frame, which read
 * as a placeholder rather than as a figure. These are drawn the way a survey
 * sheet or a site plan is: a neatline with grid references along its edges, a
 * faint working grid, a north point where the drawing is a map, and enough
 * secondary detail — index contours, a stream, lot numbers, street trees,
 * callouts, construction ticks — that each one reads as finished work.
 *
 * Still deliberately abstract. None of them depicts a real place, product or
 * number; they describe the kind of work each stop was. Everything is computed
 * or written out by hand, never random, so the server and the client draw the
 * same sheet.
 *
 * The sheet furniture is static. Only the drawing itself draws in when its
 * chapter becomes the one being read, and undraws when the reader moves on.
 * Dashed strokes fade rather than draw: Motion implements `pathLength` with
 * `stroke-dasharray`, which would overwrite the dash pattern and render every
 * stream and setback as a solid line.
 */

export type FigureKind = "contours" | "parcels" | "tools" | "venn";

type Swatch = "line" | "heavy" | "dash" | "dot" | "box" | "ring";

/** What the title block under each sheet shows. */
export const FIGURE_META: Record<
  FigureKind,
  { scaled: boolean; legend: { swatch: Swatch; label: string; toned?: boolean }[] }
> = {
  contours: {
    scaled: true,
    legend: [
      { swatch: "line", label: "Contour" },
      { swatch: "heavy", label: "Index" },
      { swatch: "dash", label: "Stream" },
      { swatch: "dot", label: "Summit", toned: true },
    ],
  },
  parcels: {
    scaled: true,
    legend: [
      { swatch: "box", label: "Lot" },
      { swatch: "box", label: "Marked", toned: true },
      { swatch: "ring", label: "Tree" },
    ],
  },
  tools: {
    scaled: false,
    legend: [
      { swatch: "box", label: "Tool" },
      { swatch: "box", label: "Product", toned: true },
      { swatch: "dash", label: "Callout" },
    ],
  },
  venn: {
    scaled: false,
    legend: [
      { swatch: "ring", label: "Discipline" },
      { swatch: "dot", label: "Crossing" },
      { swatch: "dot", label: "Overlap", toned: true },
    ],
  },
};

const DRAW: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, ease: easing.outQuart, delay: 0.08 + i * 0.05 },
      opacity: { duration: 0.2, delay: 0.08 + i * 0.05 },
    },
  }),
};

const FADE: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.45, ease: easing.outQuart, delay: 0.25 + i * 0.05 },
  }),
};

const INK = "currentColor";
const MONO = { fontFamily: "var(--font-mono)", letterSpacing: "0.14em" } as const;

/* --- Sheet furniture ----------------------------------------------------------
   Neatline at 16 units in, a working grid inside it, and grid references along
   the top and left edges — letters across, numbers down, as on a map sheet. */

const SHEET = { x: 16, y: 16, w: 408, h: 278 };
const COLS = 8;
const ROWS = 5;

function Sheet({ north }: { north: boolean }) {
  const colW = SHEET.w / COLS;
  const rowH = SHEET.h / ROWS;

  return (
    <g aria-hidden>
      {/* Working grid */}
      {Array.from({ length: COLS - 1 }, (_, i) => (
        <line
          key={`gx${i}`}
          x1={SHEET.x + colW * (i + 1)} y1={SHEET.y}
          x2={SHEET.x + colW * (i + 1)} y2={SHEET.y + SHEET.h}
          stroke={INK} strokeOpacity="0.06"
        />
      ))}
      {Array.from({ length: ROWS - 1 }, (_, i) => (
        <line
          key={`gy${i}`}
          x1={SHEET.x} y1={SHEET.y + rowH * (i + 1)}
          x2={SHEET.x + SHEET.w} y2={SHEET.y + rowH * (i + 1)}
          stroke={INK} strokeOpacity="0.06"
        />
      ))}

      {/* Neatline, doubled */}
      <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill="none" stroke={INK} strokeOpacity="0.4" />
      <rect x={SHEET.x + 3} y={SHEET.y + 3} width={SHEET.w - 6} height={SHEET.h - 6} fill="none" stroke={INK} strokeOpacity="0.12" />

      {/* Edge ticks on all four sides; references on two */}
      {Array.from({ length: COLS + 1 }, (_, i) => {
        const x = SHEET.x + colW * i;
        return (
          <g key={`tx${i}`}>
            <line x1={x} y1={SHEET.y - 4} x2={x} y2={SHEET.y} stroke={INK} strokeOpacity="0.4" />
            <line x1={x} y1={SHEET.y + SHEET.h} x2={x} y2={SHEET.y + SHEET.h + 4} stroke={INK} strokeOpacity="0.4" />
            {i < COLS ? (
              <text x={x + colW / 2} y={SHEET.y - 5} textAnchor="middle" fontSize="6.5" fill={INK} fillOpacity="0.45" style={MONO}>
                {String.fromCharCode(65 + i)}
              </text>
            ) : null}
          </g>
        );
      })}
      {Array.from({ length: ROWS + 1 }, (_, i) => {
        const y = SHEET.y + rowH * i;
        return (
          <g key={`ty${i}`}>
            <line x1={SHEET.x - 4} y1={y} x2={SHEET.x} y2={y} stroke={INK} strokeOpacity="0.4" />
            <line x1={SHEET.x + SHEET.w} y1={y} x2={SHEET.x + SHEET.w + 4} y2={y} stroke={INK} strokeOpacity="0.4" />
            {i < ROWS ? (
              <text x={SHEET.x - 7} y={y + rowH / 2 + 2} textAnchor="middle" fontSize="6.5" fill={INK} fillOpacity="0.45" style={MONO}>
                {i + 1}
              </text>
            ) : null}
          </g>
        );
      })}

      {north ? (
        <g transform="translate(398 250)">
          <circle r="11" fill="none" stroke={INK} strokeOpacity="0.3" />
          <path d="M 0 -9 L 4.5 6 L 0 3 L -4.5 6 Z" fill={INK} fillOpacity="0.65" />
          <text y="-14" textAnchor="middle" fontSize="7" fill={INK} fillOpacity="0.6" style={MONO}>
            N
          </text>
        </g>
      ) : null}
    </g>
  );
}

/* --- 01 · Earth science: a contour map ----------------------------------------
   Eight nested contours around a summit, every fourth one heavier as an index
   contour, with a stream cutting down across them the way water does. */

const CONTOURS = Array.from({ length: 8 }, (_, ring) => {
  const base = 16 + ring * 16;
  const points = Array.from({ length: 96 }, (_, step) => {
    const theta = (step / 96) * Math.PI * 2;
    const wobble =
      1 +
      0.15 * Math.sin(3 * theta + ring * 0.5) +
      0.06 * Math.sin(5 * theta + 1.3 + ring * 0.25) +
      0.03 * Math.sin(9 * theta + ring);
    const x = 200 + Math.cos(theta) * base * wobble * 1.14;
    const y = 138 + Math.sin(theta) * base * wobble * 0.76;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return `M ${points.join(" L ")} Z`;
});

function Contours({ tone }: { tone: string }) {
  return (
    <>
      {CONTOURS.map((d, i) => {
        const index = i === 3 || i === 7;
        return (
          <motion.path
            key={i}
            d={d}
            custom={CONTOURS.length - i}
            variants={DRAW}
            fill="none"
            stroke={i === 0 ? tone : INK}
            strokeOpacity={i === 0 ? 1 : index ? 0.58 : 0.26}
            strokeWidth={i === 0 ? 1.6 : index ? 1.35 : 0.9}
          />
        );
      })}

      {/* The stream, off the flank and away downhill. */}
      <motion.path
        d="M 176 160 C 158 178, 150 188, 132 204 S 96 236, 70 248 S 30 262, 8 270"
        custom={9} variants={FADE}
        fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1.1" strokeDasharray="5 3"
      />
      <motion.path
        d="M 132 204 C 140 222, 138 240, 150 262"
        custom={10} variants={FADE}
        fill="none" stroke={INK} strokeOpacity="0.38" strokeWidth="0.9" strokeDasharray="3 3"
      />

      {/* Summit: a survey triangle, and a leader to its reference. */}
      <motion.g custom={11} variants={FADE}>
        <path d="M 200 126 L 192 140 L 208 140 Z" fill={tone} fillOpacity="0.18" stroke={tone} strokeWidth="1.25" />
        <circle cx="200" cy="135" r="1.6" fill={tone} />
        <line x1="208" y1="132" x2="252" y2="96" stroke={tone} strokeOpacity="0.7" strokeWidth="0.9" />
        <line x1="252" y1="96" x2="290" y2="96" stroke={tone} strokeOpacity="0.7" strokeWidth="0.9" />
        <text x="256" y="91" fontSize="7" fill={tone} style={MONO}>
          SUMMIT
        </text>
      </motion.g>

      {/* Spot marks on the lower ground. */}
      <motion.g custom={12} variants={FADE} stroke={INK} strokeOpacity="0.5" strokeWidth="1">
        {[[322, 214], [96, 96], [340, 70]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} />
            <line x1={x - 3} y1={y + 3} x2={x + 3} y2={y - 3} />
          </g>
        ))}
      </motion.g>
    </>
  );
}

/* --- 02 · Real estate: a site plan ---------------------------------------------
   A numbered block of lots along a tree-lined street, one lot marked with its
   building footprint, and a dimension line over the whole block. */

const LOTS = [
  [52, 58, 62, 74], [114, 58, 50, 74], [164, 58, 70, 74], [234, 58, 56, 74], [290, 58, 60, 74],
  [52, 132, 80, 70], [132, 132, 58, 70], [190, 132, 64, 70], [254, 132, 96, 70],
] as const;

const MARKED = 7;

function Parcels({ tone }: { tone: string }) {
  return (
    <>
      {/* Dimension line across the block */}
      <motion.g custom={0} variants={FADE} stroke={INK} strokeOpacity="0.45" strokeWidth="0.9">
        <line x1="52" y1="40" x2="350" y2="40" />
        <line x1="52" y1="35" x2="52" y2="45" />
        <line x1="350" y1="35" x2="350" y2="45" />
        <line x1="52" y1="45" x2="52" y2="56" strokeDasharray="2 2" />
        <line x1="350" y1="45" x2="350" y2="56" strokeDasharray="2 2" />
      </motion.g>
      <motion.text custom={0} variants={FADE} x="201" y="36" textAnchor="middle" fontSize="7" fill={INK} fillOpacity="0.55" style={MONO}>
        BLOCK
      </motion.text>

      <motion.rect x="52" y="58" width="298" height="144" custom={1} variants={DRAW} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="1.3" />

      {LOTS.map(([x, y, w, h], i) => {
        const marked = i === MARKED;
        return (
          <g key={i}>
            <motion.rect
              x={x} y={y} width={w} height={h}
              custom={i + 2} variants={DRAW}
              fill={marked ? tone : "none"}
              fillOpacity={marked ? 0.12 : 0}
              stroke={marked ? tone : INK}
              strokeOpacity={marked ? 1 : 0.3}
              strokeWidth={marked ? 1.5 : 0.9}
            />
            <motion.text
              custom={i + 2} variants={FADE}
              x={x + 5} y={y + 11}
              fontSize="6.5" fill={marked ? tone : INK} fillOpacity={marked ? 1 : 0.5} style={MONO}
            >
              {String(i + 1).padStart(2, "0")}
            </motion.text>
          </g>
        );
      })}

      {/* Building footprint and setback on the marked lot */}
      <motion.rect x="201" y="158" width="40" height="30" custom={12} variants={DRAW} fill={tone} fillOpacity="0.22" stroke={tone} strokeWidth="1.2" />
      <motion.rect x="196" y="152" width="50" height="43" custom={13} variants={FADE} fill="none" stroke={tone} strokeOpacity="0.6" strokeWidth="0.8" strokeDasharray="3 2" />

      {/* Street, centre line, trees */}
      <motion.line x1="30" y1="218" x2="340" y2="218" custom={14} variants={DRAW} stroke={INK} strokeOpacity="0.45" strokeWidth="1" />
      <motion.line x1="30" y1="252" x2="340" y2="252" custom={15} variants={DRAW} stroke={INK} strokeOpacity="0.45" strokeWidth="1" />
      <motion.line x1="30" y1="235" x2="340" y2="235" custom={16} variants={FADE} stroke={INK} strokeOpacity="0.35" strokeWidth="0.9" strokeDasharray="8 6" />
      <motion.g custom={17} variants={FADE}>
        {[64, 118, 172, 226, 280].map((x) => (
          <g key={x}>
            <circle cx={x} cy="210" r="4.5" fill="none" stroke={INK} strokeOpacity="0.45" />
            <circle cx={x} cy="210" r="1" fill={INK} fillOpacity="0.5" />
          </g>
        ))}
      </motion.g>
    </>
  );
}

/* --- 03 → 04 · Internal tools into shipping products ------------------------------
   A terminal on the left becomes a product window on the right, each called out
   with the name of its stop. */

function Tools({ tone }: { tone: string }) {
  return (
    <g transform="translate(0 16)">
      {/* Callouts */}
      <motion.g custom={0} variants={FADE}>
        <line x1="40" y1="62" x2="40" y2="34" stroke={INK} strokeOpacity="0.5" strokeWidth="0.9" strokeDasharray="2 2" />
        <circle cx="40" cy="62" r="2" fill={INK} fillOpacity="0.6" />
        <text x="46" y="37" fontSize="7" fill={INK} fillOpacity="0.62" style={MONO}>TOOL</text>
        <line x1="360" y1="46" x2="360" y2="22" stroke={tone} strokeOpacity="0.7" strokeWidth="0.9" strokeDasharray="2 2" />
        <circle cx="360" cy="46" r="2" fill={tone} />
        <text x="354" y="25" textAnchor="end" fontSize="7" fill={tone} style={MONO}>PRODUCT</text>
      </motion.g>

      {/* Terminal */}
      <motion.rect x="28" y="62" width="142" height="116" rx="3" custom={1} variants={DRAW} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="1.25" />
      <motion.line x1="28" y1="78" x2="170" y2="78" custom={2} variants={DRAW} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <motion.g custom={2} variants={FADE}>
        {[38, 45, 52].map((x) => (
          <circle key={x} cx={x} cy="70" r="1.8" fill="none" stroke={INK} strokeOpacity="0.45" />
        ))}
      </motion.g>
      {[[94, 46], [110, 88], [126, 64], [142, 78], [158, 40]].map(([y, w], i) => (
        <g key={y}>
          <motion.path d={`M 38 ${y - 3.5} L 42.5 ${y} L 38 ${y + 3.5}`} custom={3 + i} variants={DRAW} fill="none" stroke={tone} strokeWidth="1.2" />
          <motion.line x1="50" y1={y} x2={50 + w} y2={y} custom={3 + i} variants={DRAW} stroke={INK} strokeOpacity={i === 4 ? 0.6 : 0.4} strokeWidth="1.5" />
        </g>
      ))}
      <motion.rect x="94" y="153" width="6" height="10" custom={8} variants={FADE} fill={tone} />

      {/* The move from one to the other */}
      <motion.line x1="182" y1="120" x2="216" y2="120" custom={9} variants={DRAW} stroke={tone} strokeWidth="1.5" />
      <motion.path d="M 209 113 L 217 120 L 209 127" custom={10} variants={DRAW} fill="none" stroke={tone} strokeWidth="1.5" />
      <motion.text custom={10} variants={FADE} x="199" y="110" textAnchor="middle" fontSize="6" fill={tone} style={MONO}>SHIP</motion.text>

      {/* Product */}
      <motion.rect x="230" y="46" width="144" height="148" rx="3" custom={11} variants={DRAW} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="1.25" />
      <motion.line x1="230" y1="60" x2="374" y2="60" custom={12} variants={DRAW} stroke={INK} strokeOpacity="0.3" strokeWidth="1" />
      <motion.g custom={12} variants={FADE}>
        {[240, 247, 254].map((x) => (
          <circle key={x} cx={x} cy="53" r="1.8" fill="none" stroke={INK} strokeOpacity="0.45" />
        ))}
      </motion.g>
      <motion.line x1="268" y1="60" x2="268" y2="194" custom={13} variants={DRAW} stroke={INK} strokeOpacity="0.28" strokeWidth="1" />
      {[74, 88, 102, 116].map((y, i) => (
        <motion.line key={y} x1="238" y1={y} x2={i === 0 ? 260 : 254} y2={y} custom={13 + i} variants={DRAW} stroke={i === 0 ? tone : INK} strokeOpacity={i === 0 ? 1 : 0.32} strokeWidth="1.4" />
      ))}

      {/* Hero card with a trend line */}
      <motion.rect x="278" y="70" width="86" height="40" rx="2" custom={14} variants={DRAW} fill={tone} fillOpacity="0.1" stroke={tone} strokeWidth="1" />
      <motion.path d="M 286 100 L 298 94 L 310 97 L 322 86 L 334 89 L 346 78 L 356 80" custom={16} variants={DRAW} fill="none" stroke={tone} strokeWidth="1.4" />

      {/* Two stat cards with bars */}
      {[278, 324].map((x, i) => (
        <g key={x}>
          <motion.rect x={x} y="118" width="40" height="36" rx="2" custom={17 + i} variants={DRAW} fill="none" stroke={INK} strokeOpacity="0.34" strokeWidth="1" />
          {[0, 1, 2, 3].map((b) => (
            <motion.rect
              key={b}
              x={x + 7 + b * 7} y={148 - (8 + ((b + i) % 3) * 6)} width="4" height={8 + ((b + i) % 3) * 6}
              custom={18 + i} variants={FADE}
              fill={INK} fillOpacity="0.32"
            />
          ))}
        </g>
      ))}
      {[166, 176].map((y, i) => (
        <motion.line key={y} x1="278" y1={y} x2={i ? 332 : 364} y2={y} custom={20 + i} variants={DRAW} stroke={INK} strokeOpacity="0.3" strokeWidth="1.3" />
      ))}
    </g>
  );
}

/* --- 05 · Design × build × product ---------------------------------------------
   Three disciplines, their six intersections and the place all three overlap,
   with construction ticks and a radius dimension. Labels are the words of the
   stop's own note. */

const CIRCLES = [
  { cx: 160, cy: 118, label: "Design", lx: 88, ly: 30 },
  { cx: 240, cy: 118, label: "Build", lx: 312, ly: 30 },
  { cx: 200, cy: 182, label: "Product", lx: 200, ly: 276 },
] as const;
const R = 72;

/** Where each pair of circles crosses — solved once, not hand-placed. */
const INTERSECTIONS = (() => {
  const points: [number, number][] = [];
  for (let a = 0; a < CIRCLES.length; a += 1) {
    for (let b = a + 1; b < CIRCLES.length; b += 1) {
      const p = CIRCLES[a];
      const q = CIRCLES[b];
      const dx = q.cx - p.cx;
      const dy = q.cy - p.cy;
      const d = Math.hypot(dx, dy);
      const h = Math.sqrt(R * R - (d / 2) ** 2);
      const mx = p.cx + dx / 2;
      const my = p.cy + dy / 2;
      points.push([mx - (dy / d) * h, my + (dx / d) * h], [mx + (dy / d) * h, my - (dx / d) * h]);
    }
  }
  return points;
})();

function Venn({ tone }: { tone: string }) {
  const centre = { x: 200, y: 140 };

  return (
    <>
      {CIRCLES.map((c, i) => (
        <motion.circle key={c.label} cx={c.cx} cy={c.cy} r={R} custom={i} variants={DRAW} fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="1.25" />
      ))}

      {/* Construction ticks around each circle */}
      <motion.g custom={3} variants={FADE} stroke={INK} strokeOpacity="0.28" strokeWidth="0.8">
        {CIRCLES.flatMap((c) =>
          Array.from({ length: 24 }, (_, k) => {
            const a = (k / 24) * Math.PI * 2;
            const inner = k % 6 === 0 ? R + 2 : R + 3;
            const outer = k % 6 === 0 ? R + 9 : R + 6;
            return (
              <line
                key={`${c.label}-${k}`}
                x1={(c.cx + Math.cos(a) * inner).toFixed(1)} y1={(c.cy + Math.sin(a) * inner).toFixed(1)}
                x2={(c.cx + Math.cos(a) * outer).toFixed(1)} y2={(c.cy + Math.sin(a) * outer).toFixed(1)}
              />
            );
          }),
        )}
      </motion.g>

      {/* Radius dimension on Build */}
      <motion.g custom={4} variants={FADE}>
        <line x1="240" y1="118" x2={240 + R * Math.cos(-Math.PI / 4)} y2={118 + R * Math.sin(-Math.PI / 4)} stroke={INK} strokeOpacity="0.45" strokeWidth="0.8" />
        <circle cx="240" cy="118" r="1.6" fill={INK} fillOpacity="0.6" />
        <text x="268" y="92" fontSize="6.5" fill={INK} fillOpacity="0.55" style={MONO}>R</text>
      </motion.g>

      {/* The six intersections */}
      <motion.g custom={5} variants={FADE}>
        {INTERSECTIONS.map(([x, y], k) => (
          <circle key={k} cx={x.toFixed(1)} cy={y.toFixed(1)} r="2" fill="none" stroke={INK} strokeOpacity="0.6" strokeWidth="1" />
        ))}
      </motion.g>

      {/* Where all three overlap */}
      <motion.g custom={6} variants={FADE}>
        <circle cx={centre.x} cy={centre.y} r="16" fill={tone} fillOpacity="0.12" stroke={tone} strokeOpacity="0.55" strokeDasharray="2 3" />
        <circle cx={centre.x} cy={centre.y} r="5.5" fill={tone} />
        <line x1={centre.x - 26} y1={centre.y} x2={centre.x - 19} y2={centre.y} stroke={tone} />
        <line x1={centre.x + 19} y1={centre.y} x2={centre.x + 26} y2={centre.y} stroke={tone} />
      </motion.g>

      {CIRCLES.map((c, i) => (
        <motion.text key={c.label} x={c.lx} y={c.ly} custom={7 + i} variants={FADE} textAnchor="middle" fontSize="8" fill={INK} fillOpacity="0.7" style={{ ...MONO, textTransform: "uppercase" }}>
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
    <svg aria-hidden viewBox="0 0 440 310" className="block h-full w-full text-fg">
      <Sheet north={FIGURE_META[kind].scaled} />
      {/* Drawings are authored on a 400 × 280 field; seated inside the neatline. */}
      <motion.g
        transform="translate(20 15)"
        initial="hidden"
        animate={active ? "visible" : "hidden"}
      >
        <Figure tone={tone} />
      </motion.g>
    </svg>
  );
}
