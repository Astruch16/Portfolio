"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { buildForms, hash } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";
import { cn } from "@/lib/utils";

/**
 * The sculpture without WebGL.
 *
 * Used on small screens and under reduced motion, where three.js is never
 * downloaded. The same point clouds, projected once through a fixed
 * three-quarter view onto a 2D canvas — so a phone sees the real forms, not a
 * stand-in — and redrawn only when the form changes. No motion, no pointer.
 */

const COUNT = 3600;
const FORMS = buildForms(COUNT);

export function SculptureStatic({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { form } = useSyncExternalStore(sculpture.subscribe, sculpture.getSnapshot, sculpture.getServerSnapshot);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const draw = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const points = FORMS[form];
      const yaw = -0.5;
      const pitch = 0.26;
      const scale = Math.min(width, height) * 0.36;
      const camera = 5.1;

      for (let i = 0; i < COUNT; i += 1) {
        const x = points[i * 3];
        const y = points[i * 3 + 1];
        const z = points[i * 3 + 2];
        // Yaw, then pitch, then perspective.
        const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
        const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
        const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
        const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
        const k = camera / (camera - z2);
        const depth = Math.min(1, Math.max(0, (z2 + 1.6) / 3.2));
        const accent = hash(i * 5.19) < 0.11;
        ctx.fillStyle = accent ? "rgba(114, 87, 255, 0.9)" : `rgba(20, 20, 20, ${(0.3 + depth * 0.62).toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(width / 2 + (x1 + 0.3) * k * scale, height / 2 - (y2 - 0.3) * k * scale, (accent ? 1.3 : 0.95) * k, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    return () => observer.disconnect();
  }, [form]);

  return <canvas ref={canvas} aria-hidden className={cn("block h-full w-full", className)} />;
}
