"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * `reducedMotion="user"` makes Motion honour the OS preference globally: for
 * those visitors it skips transform and layout animations and jumps straight to
 * the end value, while opacity still resolves.
 *
 * Doing it here rather than branching on `useReducedMotion()` inside each
 * component matters for correctness, not just tidiness — that hook only
 * resolves on the client, so branching on it during render produced markup that
 * disagreed with the server and left masked headlines parked out of view.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
