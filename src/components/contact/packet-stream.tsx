"use client";

import { useEffect, useRef } from "react";

import { uplink } from "@/lib/uplink";

/**
 * Where the message goes: a dish at the right of the panel, and a packet for
 * every character typed.
 *
 * Each keystroke launches one code symbol from the left, which arcs across and
 * is absorbed — the dish rings when it lands. Pressing send launches the rest
 * in one burst, and a delivered message leaves the dish lit and quiet.
 *
 * Decorative and inert: the panel it sits in is a mirror of the form, never a
 * control. Runs only while it's on screen; under reduced motion it draws the
 * dish once and never animates.
 */

const GLYPHS = Array.from("{}[]<>/\\|;=+*&^%$#@!?~");
const ACCENT = "114 87 255";
const SIGNAL = "182 229 59";
const INK = "245 245 245";
/** Seconds a packet takes to cross. */
const TRAVEL = 1.15;

type Packet = { born: number; lane: number; glyph: string; speed: number };

export function PacketStream({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const packets: Packet[] = [];
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let last = 0;
    /** Rings the dish throws when a packet lands, as timestamps. */
    const rings: number[] = [];
    let phase = uplink.getSnapshot().phase;
    let family = "monospace";

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

      const dishX = width - 34;
      const dishY = height / 2;
      const tone = phase === "sent" ? SIGNAL : ACCENT;

      // --- The dish: arcs facing the incoming packets ---------------------
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i += 1) {
        const r = 11 + i * 9;
        const breath = still ? 0 : Math.sin(t * 1.6 - i * 0.5) * 0.12;
        ctx.strokeStyle = `rgb(${tone} / ${Math.max(0, 0.6 - i * 0.1 + breath).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(dishX, dishY, r, Math.PI * 0.62, Math.PI * 1.38);
        ctx.stroke();
      }
      ctx.fillStyle = `rgb(${tone} / 0.9)`;
      ctx.beginPath();
      ctx.arc(dishX, dishY, 3, 0, Math.PI * 2);
      ctx.fill();

      // --- Rings from landed packets ---------------------------------------
      for (let i = rings.length - 1; i >= 0; i -= 1) {
        const age = (time - rings[i]) / 900;
        if (age > 1) {
          rings.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgb(${tone} / ${(0.4 * (1 - age)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(dishX, dishY, 6 + age * 34, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- The packets ------------------------------------------------------
      ctx.font = `500 11px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = packets.length - 1; i >= 0; i -= 1) {
        const packet = packets[i];
        const p = ((time - packet.born) / 1000) * packet.speed;
        if (p >= 1) {
          packets.splice(i, 1);
          rings.push(time);
          continue;
        }
        // A flat arc in, easing as it arrives, so the dish reads as a target.
        const eased = 1 - Math.pow(1 - p, 2.2);
        const x = 10 + eased * (dishX - 30);
        const lift = Math.sin(p * Math.PI) * packet.lane;
        const y = dishY + lift * (1 - eased * 0.55);
        const alpha = Math.min(1, p * 5) * (1 - Math.pow(p, 3)) * 0.9;
        ctx.fillStyle = p > 0.75 ? `rgb(${tone} / ${alpha})` : `rgb(${INK} / ${alpha * 0.75})`;
        ctx.fillText(packet.glyph, x, y);
      }

      // --- The path they travel, and which end is which --------------------
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = `rgb(${INK} / 0.1)`;
      ctx.beginPath();
      ctx.moveTo(10, dishY);
      ctx.lineTo(dishX - 30, dishY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgb(${INK} / 0.35)`;
      ctx.font = `500 9px ${family}`;
      ctx.textAlign = "left";
      ctx.fillText("YOU", 10, dishY - 12);
      ctx.textAlign = "right";
      ctx.fillText("ADAM", dishX - 26, dishY - 12);
      ctx.textAlign = "center";
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - last < 28) return;
      last = time;
      draw(time);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (still) draw(0);
      else if (visible && !document.hidden) frame = requestAnimationFrame(loop);
    };

    const probe = document.createElement("span");
    probe.className = "font-mono";
    document.body.append(probe);
    family = getComputedStyle(probe).fontFamily || family;
    probe.remove();

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

    const launch = (strength: number) => {
      const now = performance.now();
      const count = strength > 1 ? 14 : 1;
      for (let i = 0; i < count; i += 1) {
        packets.push({
          born: now + i * 45,
          lane: (Math.random() - 0.5) * height * 0.5,
          glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0],
          speed: (1 / TRAVEL) * (0.8 + Math.random() * 0.5),
        });
      }
      if (packets.length > 60) packets.splice(0, packets.length - 60);
    };

    const offPulse = uplink.onPulse((strength) => {
      if (!still) launch(strength);
    });
    const offState = uplink.subscribe(() => {
      phase = uplink.getSnapshot().phase;
      if (still) draw(0);
    });
    const visibility = () => start();
    document.addEventListener("visibilitychange", visibility);

    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      offPulse();
      offState();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={className} />;
}
