"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * A topographic map drawn entirely in tiny code symbols.
 *
 * The terrain is a height field — a handful of summits, a depression and a
 * gentle roll across the whole surface — contoured with marching squares at a
 * fixed interval. The contour lines are never stroked: each grid cell a line
 * passes through gets one symbol at the crossing, and because the grid pitch
 * matches the symbol spacing, the symbols fall into evenly spaced runs that
 * read as lines from a distance and as code up close. Every fifth contour is
 * an index contour, set brighter.
 *
 * Drawn to a single canvas rather than as SVG or DOM text: a full-width map is
 * many thousands of symbols, which is one cheap pass of `fillText` but would be
 * thousands of nodes any other way. It fits the canvas to its box and device
 * pixel ratio, re-surveys on resize, and spreads out from the main summit on
 * first draw. With reduced motion it simply appears.
 *
 * Deterministic throughout — the terrain and the choice of symbol at each
 * crossing come from fixed values and a hash, never randomness — so it draws
 * the same map every time.
 */

const GLYPHS = Array.from("{}[]<>/\\|;=+*&^%$#@!?~");

/** CSS px between neighbouring symbols along a line, and the grid pitch. */
const PITCH = 8;
/** CSS px. Very small on purpose: the lines should read before the symbols do. */
const FONT_PX = 6.5;
const LEVELS = 30;
const INDEX_EVERY = 5;
const REVEAL_MS = 1900;

const INK = "rgba(233, 233, 236, 0.15)";
const INK_INDEX = "rgba(233, 233, 236, 0.34)";

/** Summits (positive) and hollows (negative), in units of the canvas height. */
const HILLS = [
  { x: 0.8, y: 0.44, a: 1, r: 0.21 },
  { x: 0.34, y: 0.8, a: 0.72, r: 0.17 },
  { x: 0.55, y: 0.12, a: 0.58, r: 0.15 },
  { x: 0.1, y: 0.22, a: 0.52, r: 0.19 },
  { x: 0.97, y: 0.93, a: 0.46, r: 0.14 },
  { x: 0.63, y: 0.66, a: 0.4, r: 0.11 },
  { x: 0.44, y: 0.42, a: -0.34, r: 0.13 },
  { x: 0.2, y: 0.55, a: 0.3, r: 0.1 },
] as const;

function elevation(X: number, Y: number, aspect: number): number {
  let h = 0;
  for (const hill of HILLS) {
    const dx = X - hill.x * aspect;
    const dy = Y - hill.y;
    h += hill.a * Math.exp(-(dx * dx + dy * dy) / (2 * hill.r * hill.r));
  }
  // A long, low roll so the ground between the summits is never flat.
  h += 0.07 * Math.sin(5.2 * X + 1.7 * Y) + 0.045 * Math.sin(3.1 * Y - 2.3 * X + 0.8);
  return h;
}

type Mark = { x: number; y: number; glyph: string; index: boolean; reach: number };

/** Edge pairs for each marching-squares case (corners tl=8 tr=4 br=2 bl=1). */
const CASES: Record<number, [number, number][]> = {
  1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]],
  5: [[0, 1], [3, 2]], 6: [[0, 2]], 7: [[0, 3]], 8: [[0, 3]],
  9: [[0, 2]], 10: [[0, 3], [2, 1]], 11: [[0, 1]], 12: [[3, 1]],
  13: [[1, 2]], 14: [[3, 2]],
};

function survey(width: number, height: number): Mark[] {
  const aspect = width / height;
  const cols = Math.ceil(width / PITCH);
  const rows = Math.ceil(height / PITCH);
  const stride = cols + 1;

  const field = new Float32Array(stride * (rows + 1));
  let lo = Infinity;
  let hi = -Infinity;
  for (let j = 0; j <= rows; j += 1) {
    for (let i = 0; i <= cols; i += 1) {
      const v = elevation((i * PITCH) / height, (j * PITCH) / height, aspect);
      field[j * stride + i] = v;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }

  const interval = (hi - lo) / (LEVELS + 1);
  const main = HILLS[0];
  const originX = main.x * width;
  const originY = main.y * height;
  const marks: Mark[] = [];

  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const a = field[j * stride + i];
      const b = field[j * stride + i + 1];
      const c = field[(j + 1) * stride + i + 1];
      const d = field[(j + 1) * stride + i];
      const cellLo = Math.min(a, b, c, d);
      const cellHi = Math.max(a, b, c, d);

      const first = Math.max(1, Math.ceil((cellLo - lo) / interval));
      const last = Math.min(LEVELS, Math.floor((cellHi - lo) / interval));

      for (let k = first; k <= last; k += 1) {
        const level = lo + k * interval;
        const shape = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
        const pairs = CASES[shape];
        if (!pairs) continue;

        const x0 = i * PITCH;
        const y0 = j * PITCH;
        const lerp = (p: number, q: number) => (p === q ? 0.5 : (level - p) / (q - p));
        // Crossing point on each cell edge: top, right, bottom, left.
        const edge = (e: number): [number, number] => {
          switch (e) {
            case 0: return [x0 + lerp(a, b) * PITCH, y0];
            case 1: return [x0 + PITCH, y0 + lerp(b, c) * PITCH];
            case 2: return [x0 + lerp(d, c) * PITCH, y0 + PITCH];
            default: return [x0, y0 + lerp(a, d) * PITCH];
          }
        };

        for (const [e1, e2] of pairs) {
          const [ax, ay] = edge(e1);
          const [bx, by] = edge(e2);
          const x = (ax + bx) / 2;
          const y = (ay + by) / 2;
          const hash = ((i * 73856093) ^ (j * 19349663) ^ (k * 83492791)) >>> 0;
          marks.push({
            x,
            y,
            glyph: GLYPHS[hash % GLYPHS.length],
            index: k % INDEX_EVERY === 0,
            reach: Math.hypot(x - originX, y - originY),
          });
        }
      }
    }
  }

  // The map spreads outward from the main summit.
  marks.sort((m, n) => m.reach - n.reach);
  return marks;
}

export function SymbolTopography({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let revealed = false;
    let family = "monospace";

    const paint = (marks: Mark[], from: number, to: number) => {
      let current = "";
      for (let n = from; n < to; n += 1) {
        const mark = marks[n];
        const style = mark.index ? INK_INDEX : INK;
        if (style !== current) {
          ctx.fillStyle = style;
          current = style;
        }
        ctx.fillText(mark.glyph, mark.x, mark.y);
      }
    };

    const draw = () => {
      cancelAnimationFrame(frame);
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      // Weight must be a multiple of 100: the canvas font shorthand silently
      // rejects anything else and falls back to 10px sans-serif.
      ctx.font = `500 ${FONT_PX}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const marks = survey(width, height);

      // Only the first draw spreads out; a resize redraws in place.
      if (still || revealed) {
        paint(marks, 0, marks.length);
        return;
      }

      const start = performance.now();
      let drawn = 0;
      const step = (now: number) => {
        // Clamped at both ends: a frame's timestamp is when that frame began,
        // which can fall just before `start` was read — a negative t, a
        // negative count, and on the next frame an index before the array.
        const t = Math.min(1, Math.max(0, (now - start) / REVEAL_MS));
        const eased = 1 - Math.pow(1 - t, 3);
        const target = Math.min(marks.length, Math.max(drawn, Math.floor(eased * marks.length)));
        paint(marks, drawn, target);
        drawn = target;
        if (t < 1) {
          frame = requestAnimationFrame(step);
        } else {
          paint(marks, drawn, marks.length);
          revealed = true;
        }
      };
      frame = requestAnimationFrame(step);
    };

    // The site's mono face, once it has loaded.
    const probe = document.createElement("span");
    probe.className = "font-mono";
    document.body.append(probe);
    family = getComputedStyle(probe).fontFamily || family;
    probe.remove();

    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (revealed || still) draw();
      });
    });

    document.fonts.ready.then(() => {
      draw();
      observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={cn("block h-full w-full", className)} />;
}
