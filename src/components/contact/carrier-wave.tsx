"use client";

import { useEffect, useRef } from "react";

import { uplink } from "@/lib/uplink";
import { cn } from "@/lib/utils";

/**
 * The carrier behind the headline: a line held open on the page, waiting.
 *
 * Three traces drift across it, drawn as runs of dots rather than strokes, in
 * the same drawing language as the rest of the site. The pointer lifts the
 * trace it passes over. Every keystroke in the form sends a pulse travelling
 * along it, so the page visibly answers the message being written — the wave
 * calms when the draft is only started, tightens when it's ready to send, and
 * breaks into a run of pulses when it's sent.
 *
 * One canvas, one pass per frame, paused when it's off screen or the tab is
 * hidden, and a single still frame under reduced motion.
 */

/** Px between dots along a trace. */
const STEP = 7;
/** How long a pulse takes to fade, and how fast it travels. */
const PULSE_MS = 2600;
const PULSE_SPEED = 0.42;

type Pulse = { at: number; born: number; strength: number };

type Trace = { offset: number; amp: number; rate: number; alpha: number };

const TRACES: Trace[] = [
  { offset: 0, amp: 1, rate: 1, alpha: 0.5 },
  { offset: 1.7, amp: 0.62, rate: 0.74, alpha: 0.28 },
  { offset: 3.4, amp: 0.4, rate: 1.35, alpha: 0.18 },
];

export function CarrierWave({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pulses: Pulse[] = [];
    const pointer = { x: -9999, on: 0, target: 0 };
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let last = 0;
    let phase = uplink.getSnapshot().phase;

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
      const t = time * 0.001;
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      // Ready to send reads as a steadier, stronger carrier; a sent message
      // leaves it ringing.
      const gain = phase === "ready" ? 1.25 : phase === "sending" || phase === "sent" ? 1.6 : 1;
      const base = Math.min(height * 0.3, 34) * gain;

      pointer.on += (pointer.target - pointer.on) * 0.08;
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        if (time - pulses[i].born > PULSE_MS) pulses.splice(i, 1);
      }

      for (const trace of TRACES) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += STEP) {
          const u = x / Math.max(1, width);
          let y =
            Math.sin(u * 7.4 * trace.rate + t * 0.9 + trace.offset) * 0.6 +
            Math.sin(u * 3.1 * trace.rate - t * 0.55 + trace.offset) * 0.4;

          // The pointer lifts the trace under it.
          if (pointer.on > 0.01) {
            const d = (x - pointer.x) / 190;
            y += Math.exp(-d * d) * 1.5 * pointer.on;
          }

          // Each keystroke rides outward from where the last one landed.
          for (const pulse of pulses) {
            const age = time - pulse.born;
            const travelled = pulse.at + age * PULSE_SPEED;
            const fade = 1 - age / PULSE_MS;
            const d = (x - travelled) / 55;
            y += Math.exp(-d * d) * Math.sin(age * 0.02) * 2.4 * fade * pulse.strength;
          }

          const py = mid + y * base * trace.amp;
          // Dots, not a stroke: the site draws with marks.
          ctx.moveTo(x + 0.9, py);
          ctx.arc(x, py, 0.9, 0, Math.PI * 2);
        }
        ctx.fillStyle =
          phase === "sent"
            ? `rgb(182 229 59 / ${trace.alpha})`
            : phase === "ready" || phase === "sending"
              ? `rgb(114 87 255 / ${trace.alpha + 0.12})`
              : `rgb(245 245 245 / ${trace.alpha})`;
        ctx.fill();
      }
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - last < 24) return;
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
      if (still || !visible) draw(performance.now());
    });
    sizeObserver.observe(el);

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    viewObserver.observe(el);

    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      const near = event.clientY > box.top - 120 && event.clientY < box.bottom + 120;
      pointer.target = near ? 1 : 0;
    };
    const visibility = () => start();

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", visibility);

    const offPulse = uplink.onPulse((strength) => {
      if (still) return;
      // Typed characters enter from the left of the wave; a send fills it.
      pulses.push({ at: strength > 1 ? -width * 0.1 : width * 0.12, born: performance.now(), strength });
      if (pulses.length > 14) pulses.shift();
    });
    const offState = uplink.subscribe(() => {
      phase = uplink.getSnapshot().phase;
      if (still) draw(0);
    });

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", visibility);
      offPulse();
      offState();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={cn("pointer-events-none block", className)} />;
}
