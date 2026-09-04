"use client";

import { motion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

import {
  drawVariants,
  fadeTransition,
  liftVariants,
  maskLineVariants,
  revealTransition,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Entrance primitives.
 *
 * None of these branch on the motion preference. The root <MotionProvider> is
 * configured with `reducedMotion="user"`, so Motion drops the travel and keeps
 * the fade for anyone who asked for that — and the markup stays identical
 * between server and client, which a render-time preference check would break.
 */

type RevealProps = {
  children: ReactNode;
  /** Seconds from first paint. Offsets come from `cue` in lib/motion. */
  delay?: number;
  className?: string;
  /** Play on scroll into view instead of on mount. */
  onView?: boolean;
};

const viewport = { once: true, margin: "0px 0px -12% 0px" } as const;

function useEntrance(onView: boolean) {
  return onView
    ? ({ initial: "hidden", whileInView: "visible", viewport } as const)
    : ({ initial: "hidden", animate: "visible" } as const);
}

/**
 * A line of type that slides out from behind a clipping edge. Preferred over
 * an opacity fade for headlines — the mask reads as typesetting, the fade
 * reads as a template.
 */
export function MaskReveal({
  children,
  delay = 0,
  className,
  onView = false,
}: RevealProps) {
  const entrance = useEntrance(onView);

  return (
    // The viewport trigger lives on the clipping wrapper, not on the element
    // that moves. An IntersectionObserver reports an element as out of view
    // when an ancestor's overflow clips it entirely — so observing the child
    // deadlocks the moment its travel exceeds the mask's height, which is
    // exactly what happens when a line wraps. The wrapper is never clipped, and
    // the state propagates down to the child as a variant.
    <motion.span className={cn("mask-line", className)} {...entrance}>
      <motion.span
        className="block will-change-transform"
        variants={maskLineVariants}
        transition={{ ...revealTransition, delay }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/**
 * Created once at module scope — calling `motion.create()` during render
 * would hand React a new component type on every pass and remount the subtree.
 */
const liftElements = {
  div: motion.div,
  p: motion.p,
  li: motion.li,
  span: motion.span,
} as const;

type LiftProps = RevealProps & {
  as?: keyof typeof liftElements;
  style?: CSSProperties;
  id?: string;
};

/** Supporting copy and metadata: a short rise with a fade. */
export function Lift({
  children,
  delay = 0,
  className,
  onView = false,
  as = "div",
  ...rest
}: LiftProps) {
  const entrance = useEntrance(onView);
  const Component = liftElements[as];

  return (
    <Component
      className={className}
      variants={liftVariants}
      transition={{ ...fadeTransition, delay }}
      {...entrance}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * A rule that draws in from one edge. Borders that simply fade in look like a
 * loading state; borders that draw look deliberate.
 */
export function DrawLine({
  delay = 0,
  className,
  origin = "left",
  onView = false,
}: Omit<RevealProps, "children"> & { origin?: "left" | "right" }) {
  const entrance = useEntrance(onView);

  return (
    <motion.span
      aria-hidden
      className={cn("block h-px w-full bg-hairline-strong", className)}
      style={{ transformOrigin: origin }}
      variants={drawVariants}
      transition={{ ...revealTransition, delay }}
      {...entrance}
    />
  );
}
