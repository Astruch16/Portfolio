"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";

type MagneticProps = {
  children: ReactNode;
  /** Fraction of the cursor offset the element travels. Keep it small. */
  strength?: number;
  /** Pixels of slack around the element in which the pull applies. */
  radius?: number;
  className?: string;
};

/**
 * A restrained magnetic pull. The element leans toward the cursor by a
 * fraction of the offset and springs back on exit — enough to feel alive on a
 * trackpad, never enough to make a control hard to hit.
 *
 * Motion values are written straight to the transform, so the pull costs no
 * React renders.
 */
export function Magnetic({
  children,
  strength = 0.22,
  radius = 80,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 20, mass: 0.35 };
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;

      const withinX = Math.abs(dx) < rect.width / 2 + radius;
      const withinY = Math.abs(dy) < rect.height / 2 + radius;

      if (withinX && withinY) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [radius, still, strength, x, y]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={still ? undefined : { x: springX, y: springY }}
    >
      {children}
    </motion.span>
  );
}
