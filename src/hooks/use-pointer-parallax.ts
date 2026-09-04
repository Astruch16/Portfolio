"use client";

import { useEffect, useRef, type RefObject } from "react";

export type PointerVector = { x: number; y: number };

type Options = {
  /** 0–1. Lower is heavier. */
  smoothing?: number;
  /** Skip the whole thing (touch, reduced motion, off-screen). */
  enabled?: boolean;
};

const SETTLE_EPSILON = 0.0004;

/**
 * One pointer listener for an entire composition.
 *
 * Writes smoothed, normalised (-1..1) coordinates to `--px` / `--py` on the
 * container so DOM layers can parallax purely in CSS at whatever depth
 * multiplier they like, and exposes the same values through a ref so a canvas
 * can read them inside its own frame loop. Nothing here triggers a React
 * render, and the rAF loop parks itself once the springs settle.
 */
export function usePointerParallax<T extends HTMLElement>({
  smoothing = 0.075,
  enabled = true,
}: Options = {}): {
  ref: RefObject<T | null>;
  pointer: RefObject<PointerVector>;
} {
  const ref = useRef<T>(null);
  const pointer = useRef<PointerVector>({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;

    const target = { x: 0, y: 0 };
    let frame = 0;
    let running = false;

    const tick = () => {
      const dx = target.x - pointer.current.x;
      const dy = target.y - pointer.current.y;

      pointer.current.x += dx * smoothing;
      pointer.current.y += dy * smoothing;

      el.style.setProperty("--px", pointer.current.x.toFixed(4));
      el.style.setProperty("--py", pointer.current.y.toFixed(4));

      if (Math.abs(dx) < SETTLE_EPSILON && Math.abs(dy) < SETTLE_EPSILON) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      start();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [enabled, smoothing]);

  return { ref, pointer };
}
