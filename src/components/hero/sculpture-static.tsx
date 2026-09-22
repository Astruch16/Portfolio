"use client";

import { useEffect, useRef } from "react";

import { buildForms, hash } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";
import { cn } from "@/lib/utils";

/**
 * The sculpture without WebGL.
 *
 * Used on small screens and under reduced motion, where three.js is never
 * downloaded. The same point clouds, through the same square-on view, drawn to
 * a 2D canvas — so a phone sees the real forms rather than a stand-in.
 *
 * It used to draw each form once and sit there, which beside the desktop scene
 * read as a picture of the sculpture instead of the sculpture. It now runs the
 * same behaviour the shader does, on the CPU: the six forms blend by six eased
 * weights, particles lift off along their own direction mid-morph and settle,
 * every particle breathes, the whole thing sways, and a tap scatters it.
 *
 * The work is kept inside a phone's budget by drawing rather than by doing
 * less: every particle is a rect added to one of a handful of paths, so a frame
 * is a few fills rather than thousands of draw calls, and the loop runs at
 * thirty frames a second, only while it's on screen and the tab is visible.
 * Under reduced motion it draws one still frame and never starts.
 */

const COUNT = 5600;
const ACCENT_SHARE = 0.11;
/** Alpha steps the ink is sorted into — one fill each, rather than one per particle. */
const BUCKETS = 6;
const FRAME_MS = 33;

const FORMS = buildForms(COUNT);

/** A direction on the sphere and a phase, for lift, breath and scatter. */
const SEED = (() => {
  const seed = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i += 1) {
    const u = hash(i * 1.31) * 2 - 1;
    const t = hash(i * 2.17) * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    seed.set([s * Math.cos(t), u, s * Math.sin(t), hash(i * 3.73)], i * 4);
  }
  return seed;
})();

const ACCENT = (() => {
  const accent = new Uint8Array(COUNT);
  for (let i = 0; i < COUNT; i += 1) accent[i] = hash(i * 5.19) < ACCENT_SHARE ? 1 : 0;
  return accent;
})();

export function SculptureStatic({
  className,
  fit = 1,
  lift = -0.12,
  shift = 0.42,
}: {
  className?: string;
  fit?: number;
  lift?: number;
  shift?: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const weights = [1, 0, 0, 0, 0, 0];
    const burst = { value: 1.2, seen: sculpture.getSnapshot().burst };
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let last = 0;
    let previous = 0;

    const resize = () => {
      const box = el.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      if (!width || !height) return;
      const t = time * 0.001;
      const dt = Math.min(0.1, previous ? (time - previous) / 1000 : 0);
      previous = time;

      const state = sculpture.getSnapshot();

      // Ease each weight toward the form being asked for, exactly as the
      // shader's CPU side does.
      if (still) {
        for (let k = 0; k < weights.length; k += 1) weights[k] = k === state.form ? 1 : 0;
      } else {
        const ease = 1 - Math.exp(-dt * 2.6);
        for (let k = 0; k < weights.length; k += 1) {
          weights[k] += ((k === state.form ? 1 : 0) - weights[k]) * ease;
        }
      }

      if (state.burst !== burst.seen) {
        burst.seen = state.burst;
        burst.value = Math.max(burst.value, 1.2);
      }
      burst.value *= Math.exp(-dt * 2.2);

      // Mid-morph lift: zero when one form holds, strongest halfway between two.
      const settled = Math.max(...weights);
      const rise = still ? 0 : (1 - settled) * 1.6;
      const scatter = still ? 0 : burst.value;

      const yaw = still ? 0 : Math.sin(t * 0.22) * 0.2;
      const pitch = still ? 0 : Math.sin(t * 0.17) * 0.04;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);

      // Scene units to px at the origin, the same as the 3D camera (fov 38 at
      // 5.1), so both draw the forms at the same size and place.
      const camera = 5.1;
      const scale = height / (2 * camera * Math.tan((19 * Math.PI) / 180));
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);
      const ink = Array.from({ length: BUCKETS }, () => new Path2D());
      const accentPath = new Path2D();
      // Which forms are actually contributing — a weight at zero is skipped
      // rather than multiplied through every particle.
      const live: number[] = [];
      for (let k = 0; k < weights.length; k += 1) if (weights[k] > 0.001) live.push(k);

      for (let i = 0; i < COUNT; i += 1) {
        const o = i * 3;
        let x = 0;
        let y = 0;
        let z = 0;
        for (const k of live) {
          const form = FORMS[k];
          const w = weights[k];
          x += form[o] * w;
          y += form[o + 1] * w;
          z += form[o + 2] * w;
        }

        const s = i * 4;
        const sx = SEED[s];
        const sy = SEED[s + 1];
        const sz = SEED[s + 2];
        const phase = SEED[s + 3];

        if (!still) {
          const off = rise * (0.35 + phase * 0.65) + scatter * (0.8 + phase * 1.4);
          const breath = Math.sin(t * 0.9 + phase * 6.2831) * 0.014;
          x += sx * (off + breath);
          y += sy * (off + breath);
          z += sz * (off + breath);
        }

        // Yaw, then pitch, then perspective.
        const x1 = x * cosYaw + z * sinYaw;
        const z1 = -x * sinYaw + z * cosYaw;
        const y2 = y * cosPitch - z1 * sinPitch;
        const z2 = y * sinPitch + z1 * cosPitch;
        const k = camera / (camera - z2);

        const px = cx + (x1 * fit + shift) * k * scale;
        const py = cy - (y2 * fit + lift) * k * scale;
        if (px < -8 || py < -8 || px > width + 8 || py > height + 8) continue;

        const depth = Math.min(1, Math.max(0, (z2 + 1.6) / 3.2));
        if (ACCENT[i]) {
          const size = 1.9 * k;
          accentPath.rect(px - size / 2, py - size / 2, size, size);
        } else {
          const size = 1.45 * k;
          const bucket = Math.min(BUCKETS - 1, (depth * BUCKETS) | 0);
          ink[bucket].rect(px - size / 2, py - size / 2, size, size);
        }
      }

      for (let b = 0; b < BUCKETS; b += 1) {
        ctx.fillStyle = `rgba(20, 20, 20, ${(0.3 + (b / (BUCKETS - 1)) * 0.62).toFixed(2)})`;
        ctx.fill(ink[b]);
      }
      ctx.fillStyle = "rgba(114, 87, 255, 0.9)";
      ctx.fill(accentPath);
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - last < FRAME_MS) return;
      last = time;
      draw(time);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (still) draw(performance.now());
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    resize();
    start();

    const sizeObserver = new ResizeObserver(() => {
      resize();
      if (still || !visible) draw(performance.now());
    });
    sizeObserver.observe(el);

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    viewObserver.observe(el);

    const visibility = () => start();
    document.addEventListener("visibilitychange", visibility);

    // A tap scatters it, the way a click does on the desktop scene.
    const tap = () => {
      if (!still) sculpture.scatter();
    };
    el.addEventListener("pointerup", tap);

    // Redrawn on a form change even when parked, so a cycle that ticks over
    // while the hero is off screen isn't showing the wrong form on return.
    const unsubscribe = sculpture.subscribe(() => {
      if (still || !visible) draw(performance.now());
    });

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      el.removeEventListener("pointerup", tap);
      unsubscribe();
    };
  }, [fit, lift, shift]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={cn("block h-full w-full touch-pan-y", className)}
    />
  );
}
