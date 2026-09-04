import type { Transition, Variants } from "motion/react";

/**
 * Single source of truth for motion. Mirrors the `--ease-*` and `--duration-*`
 * custom properties in globals.css so a CSS hover and a Motion entrance never
 * drift apart. Nothing in the codebase should inline an easing array.
 */
type Bezier = [number, number, number, number];

export const easing = {
  outExpo: [0.16, 1, 0.3, 1] as Bezier,
  outQuart: [0.25, 1, 0.5, 1] as Bezier,
  inOutQuart: [0.76, 0, 0.24, 1] as Bezier,
};

export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.64,
  reveal: 0.9,
} as const;

/**
 * Load choreography, in seconds from first paint.
 *
 * The typography is driven by the boot sequence in `hooks/use-boot-sequence`;
 * these are the pieces that land after it finishes.
 */
export const cue = {
  nav: 0,
  meta: 4.45,
  scene: 4.55,
  seam: 4.65,
} as const;

export const revealTransition: Transition = {
  duration: duration.reveal,
  ease: easing.outExpo,
};

export const fadeTransition: Transition = {
  duration: duration.slow,
  ease: easing.outQuart,
};

/** Vertical mask reveal — the child slides out from under a clipping parent. */
export const maskLineVariants: Variants = {
  hidden: { y: "108%" },
  visible: { y: "0%" },
};

/** Small lift used by metadata and supporting copy. */
export const liftVariants: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/** Hairlines draw in from their leading edge rather than fading. */
export const drawVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1 },
};
