"use client";

import { motion } from "motion/react";
import { Fragment } from "react";

import { easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * A left-to-right sequence of labels joined by arrows.
 *
 * Labels and arrows are siblings in one stagger, so the row builds in the order
 * it reads — label, arrow, label — rather than everything fading up at once.
 * It runs once on entry and settles; nothing loops.
 *
 * Both share identical box metrics (same size, leading, padding and border
 * width, the arrow's border merely transparent) which is what actually keeps
 * the glyphs on the same line. Centring alone does not: the underline on the
 * labels makes their boxes taller and drags the arrows off the baseline.
 */

const BOX =
  "block border-b pb-1.5 font-mono text-[0.8125rem] leading-none tracking-[0.14em] uppercase";

const GROUP = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const LABEL = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const ARROW = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function ArrowSequence({
  items,
  accent,
  underline = true,
}: {
  items: string[];
  accent: string;
  underline?: boolean;
}) {
  return (
    <motion.div
      className="flex flex-wrap items-center gap-x-3 gap-y-3"
      variants={GROUP}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
    >
      {items.map((item, i) => (
        <Fragment key={item}>
          {i > 0 ? (
            <motion.span
              aria-hidden
              variants={ARROW}
              transition={{ duration: 0.45, ease: easing.outExpo }}
              className={cn(BOX, "border-transparent")}
              style={{ color: accent }}
            >
              &rarr;
            </motion.span>
          ) : null}
          <motion.span
            variants={LABEL}
            transition={{ duration: 0.45, ease: easing.outQuart }}
            className={cn(
              BOX,
              underline ? "border-hairline" : "border-transparent",
              "text-muted",
            )}
          >
            {item}
          </motion.span>
        </Fragment>
      ))}
    </motion.div>
  );
}
