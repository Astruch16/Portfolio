"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * A field of short strokes turning slowly in a current — the background
 * texture for the site's dark chapters.
 *
 * Each point on a loose grid carries one dash whose angle comes from a pair of
 * slow interfering waves, so the whole field reads like a wind map or a
 * magnetic trace: structured, never random, and always drifting. A soft band of
 * brightness travels across it, and strokes near the pointer turn toward it and
 * light up in the accent.
 *
 * Drawn to one canvas in a few batched paths. It only animates while it's on
 * screen and the tab is visible, runs at roughly thirty frames a second, and
 * under reduced motion draws a single still frame.
 */

const SPACING = 30;
const DASH = 9;
const BUCKETS = 5;

type Props = {
  className?: string;
  /** Stroke colour, as "r g b". */
  ink?: string;
  /** Colour strokes take near the pointer, as "r g b". */
  glow?: string;
  /** Peak stroke opacity. */
  strength?: number;
};

export function SignalField({
  className,
  ink = "245 245 245",
  glow = "114 87 255",
  strength = 0.22,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -9999, y: -9999, on: 0, target: 0 };
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const box = el.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const t = time * 0.001;
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";

      pointer.on += (pointer.target - pointer.on) * 0.08;
      const band = ((t * 0.045) % 1.4) - 0.2;

      const paths = Array.from({ length: BUCKETS }, () => new Path2D());
      const lit = new Path2D();

      for (let y = SPACING / 2; y < height; y += SPACING) {
        // Every other row shifts half a step, so the grid reads as a weave.
        const offset = (Math.round(y / SPACING) % 2) * (SPACING / 2);
        for (let x = SPACING / 2 + offset; x < width; x += SPACING) {
          let angle =
            Math.sin(x * 0.0042 + t * 0.21) * Math.cos(y * 0.0056 - t * 0.17) * Math.PI +
            Math.sin((x + y) * 0.0019 + t * 0.09) * 0.8;

          // Brightest along the travelling band, fading toward the edges.
          const u = x / width;
          const v = y / height;
          const across = Math.exp(-((u + v * 0.35 - band) ** 2) / 0.05);
          let level = 0.28 + across * 0.72;
          level *= Math.min(1, v * 3.2) * Math.min(1, (1 - v) * 2.4);

          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const near = pointer.on * Math.max(0, 1 - Math.hypot(dx, dy) / 180);
          if (near > 0) angle = angle * (1 - near) + Math.atan2(dy, dx) * near;

          const cx = Math.cos(angle) * DASH * 0.5;
          const cy = Math.sin(angle) * DASH * 0.5;
          const path = near > 0.25 ? lit : paths[Math.min(BUCKETS - 1, Math.floor(level * BUCKETS))];
          path.moveTo(x - cx, y - cy);
          path.lineTo(x + cx, y + cy);
        }
      }

      paths.forEach((path, i) => {
        ctx.strokeStyle = `rgb(${ink} / ${(((i + 1) / BUCKETS) * strength).toFixed(3)})`;
        ctx.stroke(path);
      });
      ctx.strokeStyle = `rgb(${glow} / ${Math.min(0.9, strength * 3.2).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.stroke(lit);
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - last < 33) return;
      last = time;
      draw(time);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (still) draw(0);
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    resize();
    start();

    const sizeObserver = new ResizeObserver(() => {
      resize();
      if (still || !visible) draw(0);
    });
    sizeObserver.observe(el);

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    viewObserver.observe(el);

    // The canvas sits under the section's content, so the pointer is read off
    // the window rather than off the canvas itself.
    const move = (event: PointerEvent) => {
      if (!visible) return;
      const box = el.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.target = pointer.y >= 0 && pointer.y <= box.height ? 1 : 0;
    };
    const leave = () => {
      pointer.target = 0;
    };
    const visibility = () => start();

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ink, glow, strength]);

  return <canvas ref={canvas} aria-hidden className={cn("pointer-events-none block", className)} />;
}
