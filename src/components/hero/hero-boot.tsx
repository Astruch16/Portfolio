"use client";

import { motion } from "motion/react";
import type { RefObject } from "react";

import { TypeLine } from "@/components/hero/type-line";
import { easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The hero's prompt.
 *
 * It appears and blinks on its own, the name and role write themselves out
 * beneath it, and then it travels down the page to write the statement before
 * retiring. The finished state is the editorial layout exactly as designed,
 * with no terminal furniture left behind.
 *
 * Decorative: the real content is in the document from the first byte, so this
 * is hidden from assistive technology and skipped entirely for anyone who has
 * asked for reduced motion.
 */
export function HeroCaret({
  ref,
  enabled,
  travelY,
  moved,
  done,
  label,
  className,
}: {
  ref?: RefObject<HTMLParagraphElement | null>;
  enabled: boolean;
  /** A short command shown beside the prompt, typed in and then dropped. */
  label?: string;
  /** Pixels between the prompt's resting place and the statement. */
  travelY: number;
  moved: boolean;
  done: boolean;
  className?: string;
}) {
  if (!enabled) return null;

  return (
    <motion.p
      ref={ref}
      aria-hidden
      className={cn(
        "label flex items-center gap-2 tracking-[0.08em] normal-case text-faint",
        className,
      )}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: moved ? travelY : 0, opacity: done ? 0 : 1 }}
      transition={{
        y: { duration: 0.55, ease: easing.outExpo },
        opacity: { duration: 0.4, ease: easing.outQuart },
      }}
    >
      <span className="text-accent">&gt;</span>
      {label ? (
        <TypeLine text={label} typed enabled charMs={20} />
      ) : null}
      <span className="boot-caret" />
    </motion.p>
  );
}
