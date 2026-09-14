"use client";

import { useEffect, useRef } from "react";

import type { MosaicLine } from "@/data/name-mosaic";
import { cn } from "@/lib/utils";

/**
 * The hero name as a live field of code symbols.
 *
 * Same letterforms as before — the cell grid sampled from the real display face
 * by `scripts/generate-name-mosaic.mjs` — but every symbol is now a particle
 * with a home. On the boot sequence's cue each letter's symbols fly in from
 * scattered positions and settle into place. After that the name answers the
 * visitor:
 *
 * - move across it and the symbols part around the pointer, rewriting
 *   themselves as they go, then spring back into the letter;
 * - click or tap it and a shockwave blows the name apart, and it reassembles.
 *
 * All of it on one canvas: 1,646 particles is one pass of `fillText` a frame,
 * where the DOM version needed eight animated layers just to float. The loop
 * parks when the name is off screen or the tab is hidden. With reduced motion
 * the name is drawn once, assembled, and does not react.
 */

const GLYPHS = Array.from("{}[]<>/\\|;=+*&^%$#@!?~");

/** Extra leading over the display face's own, in em — see the note in the generator's data. */
const EXTRA_LEADING = 0.07;
/** Symbol size, in em of the display type. */
const GLYPH_EM = 0.058;
/** Room around the name for symbols pushed outside it, in em. */
const BLEED_EM = 0.3;

const PHYSICS = {
  /** Pointer influence radius, in em. */
  radius: 0.46,
  push: 2.4,
  spring: 0.055,
  damping: 0.84,
  /** Click shockwave: strength in px per frame, falloff distance in em. */
  blast: 30,
  blastFalloff: 0.8,
  /** Chance per frame that a symbol under the pointer rewrites itself. */
  scramble: 0.06,
};

type Particle = {
  line: number;
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  glyph: number;
  delay: number;
  released: boolean;
  alpha: number;
  phase: number;
};

/** Small deterministic hash, so the fly-in pattern is the same every visit. */
function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function NameField({
  lines,
  typed,
  enabled,
  charMs,
  className,
}: {
  lines: readonly MosaicLine[];
  /** Whether each line has been reached by the boot sequence. */
  typed: readonly boolean[];
  /** False with reduced motion: drawn once, assembled, with no interaction. */
  enabled: boolean;
  charMs: number;
  className?: string;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // When each line was released, read by the render loop without re-rendering.
  const starts = useRef<(number | null)[]>(lines.map(() => null));

  const width = Math.max(...lines.map((l) => l.width));
  const height = lines.reduce((total, l) => total + l.lineHeight + EXTRA_LEADING, 0);

  useEffect(() => {
    typed.forEach((on, i) => {
      if (on && starts.current[i] == null) starts.current[i] = performance.now();
    });
  }, [typed]);

  useEffect(() => {
    const host = box.current;
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!host || !el || !ctx) return;

    const lineBoxes = lines.map((l) => l.lineHeight + EXTRA_LEADING);
    let fontPx = 0;
    let bleed = 0;
    let family = "monospace";
    let ink = "#111";
    let frame = 0;
    let running = false;
    let visible = true;
    const pointer = { x: 0, y: 0, active: false };

    // Build the particles once; their homes are recomputed on every resize.
    const particles: Particle[] = [];
    lines.forEach((line, l) => {
      line.cells.forEach(([, , character], i) => {
        const seed = l * 10000 + i;
        particles.push({
          line: l,
          hx: 0,
          hy: 0,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          glyph: (i * 7) % GLYPHS.length,
          // The character's own beat, plus a small scatter so a letter
          // gathers out of its symbols instead of snapping on whole.
          delay: character * charMs + hash(seed + 0.5) * 260,
          released: !enabled,
          alpha: enabled ? 0 : 1,
          phase: hash(seed + 0.9) * Math.PI * 2,
        });
      });
    });

    const layout = () => {
      const rect = host.getBoundingClientRect();
      fontPx = parseFloat(getComputedStyle(host).fontSize);
      bleed = BLEED_EM * fontPx;
      ink = getComputedStyle(host).color;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width + bleed * 2;
      const h = rect.height + bleed * 2;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let n = 0;
      let top = 0;
      lines.forEach((line, l) => {
        const inkTop = (line.inkTop + EXTRA_LEADING / 2) * fontPx;
        for (const [cx, cy] of line.cells) {
          const p = particles[n];
          const hx = bleed + cx * fontPx;
          const hy = bleed + top + inkTop + cy * fontPx;
          if (p.hx === 0 && p.hy === 0) {
            // First layout: start scattered around home, ready to fly in.
            const angle = hash(n + 0.1) * Math.PI * 2;
            const reach = (0.25 + hash(n + 0.3) * 0.7) * fontPx;
            p.x = enabled ? hx + Math.cos(angle) * reach : hx;
            p.y = enabled ? hy + Math.sin(angle) * reach : hy;
          } else {
            // Resize: carry each symbol's displacement across.
            p.x += hx - p.hx;
            p.y += hy - p.hy;
          }
          p.hx = hx;
          p.hy = hy;
          n += 1;
        }
        top += lineBoxes[l] * fontPx;
      });
    };

    const draw = (now: number) => {
      const w = el.width;
      const h = el.height;
      ctx.clearRect(0, 0, w, h);
      // Weight must be a multiple of 100 or the canvas font shorthand is
      // silently rejected and falls back to 10px sans-serif.
      ctx.font = `700 ${(GLYPH_EM * fontPx).toFixed(2)}px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = ink;

      const drift = enabled ? fontPx * 0.004 : 0;
      for (const p of particles) {
        if (p.alpha <= 0) continue;
        if (p.alpha < 1) ctx.globalAlpha = p.alpha;
        const ox = drift ? Math.sin(now * 0.0011 + p.phase) * drift : 0;
        const oy = drift ? Math.cos(now * 0.0009 + p.phase) * drift : 0;
        ctx.fillText(GLYPHS[p.glyph], p.x + ox, p.y + oy);
        if (p.alpha < 1) ctx.globalAlpha = 1;
      }
    };

    const step = (now: number) => {
      const radius = PHYSICS.radius * fontPx;
      const radius2 = radius * radius;

      for (const p of particles) {
        if (!p.released) {
          const start = starts.current[p.line];
          if (start == null || now - start < p.delay) continue;
          p.released = true;
        }
        if (p.alpha < 1) p.alpha = Math.min(1, p.alpha + 0.07);

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius2 && d2 > 0.25) {
            const d = Math.sqrt(d2);
            const force = (1 - d / radius) ** 2 * PHYSICS.push;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
            if (Math.random() < PHYSICS.scramble) {
              p.glyph = (p.glyph + 1 + Math.floor(Math.random() * (GLYPHS.length - 1))) % GLYPHS.length;
            }
          }
        }

        p.vx = (p.vx + (p.hx - p.x) * PHYSICS.spring) * PHYSICS.damping;
        p.vy = (p.vy + (p.hy - p.y) * PHYSICS.spring) * PHYSICS.damping;
        p.x += p.vx;
        p.y += p.vy;
      }

      draw(now);
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || !enabled || !visible || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const toLocal = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onDown = (event: PointerEvent) => {
      const { x, y } = toLocal(event);
      const falloff = PHYSICS.blastFalloff * fontPx;
      for (const p of particles) {
        if (!p.released) continue;
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.hypot(dx, dy) || 1;
        const strength = PHYSICS.blast * Math.exp(-d / falloff);
        p.vx += (dx / d) * strength;
        p.vy += (dy / d) * strength;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    const resize = new ResizeObserver(() => {
      layout();
      if (!enabled) draw(0);
    });
    const onVisibility = () => (document.hidden ? stop() : start());

    // The site's mono face, once loaded.
    const probe = document.createElement("span");
    probe.className = "font-mono";
    document.body.append(probe);

    document.fonts.ready.then(() => {
      family = getComputedStyle(probe).fontFamily || family;
      probe.remove();
      layout();
      if (enabled) {
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        el.addEventListener("pointerdown", onDown);
        observer.observe(el);
        document.addEventListener("visibilitychange", onVisibility);
        start();
      } else {
        draw(0);
      }
      resize.observe(host);
    });

    return () => {
      stop();
      probe.remove();
      observer.disconnect();
      resize.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // `lines` is static data and `enabled` only changes with the motion
    // preference; re-running on either rebuilds the field from scratch.
  }, [lines, enabled, charMs]);

  return (
    <span
      ref={box}
      className={cn("relative block", className)}
      style={{ width: `${width}em`, height: `${height}em` }}
    >
      <canvas
        ref={canvas}
        aria-hidden
        className="absolute touch-manipulation"
        style={{ left: `-${BLEED_EM}em`, top: `-${BLEED_EM}em` }}
      />
    </span>
  );
}
