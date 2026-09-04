"use client";

import { motion } from "motion/react";

import { easing } from "@/lib/motion";

/**
 * The data pipeline, activating once as it enters the viewport.
 *
 * A spine draws down while each node lights in turn — the signal reading as it
 * moves through the system rather than everything fading up together. It runs
 * once and settles; there is no loop. Under reduced motion Motion drops the
 * transforms and the diagram simply arrives complete, which is the correct
 * end state for a technical drawing.
 *
 * Built from the motion primitives already in the bundle: a diagram is not a
 * reason to add a charting or animation library.
 */

const GROUP = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
};

const SPINE = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.2, ease: easing.outExpo },
  },
};

const NODE = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easing.outQuart } },
};

const SIGNAL = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easing.outExpo } },
};

export function ArchitectureDiagram({
  nodes,
  accent,
}: {
  nodes: { label: string; note: string }[];
  accent: string;
}) {
  return (
    <motion.div
      className="relative"
      variants={GROUP}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -18% 0px" }}
    >
      <motion.span
        aria-hidden
        className="absolute top-3 bottom-3 left-[5px] block w-px origin-top bg-hairline-strong"
        variants={SPINE}
      />

      <ol className="relative">
        {nodes.map((node, i) => (
          <motion.li
            key={node.label}
            variants={NODE}
            className="flex items-start gap-5 border-t border-hairline py-4 first:border-t-0"
          >
            <span className="relative mt-1 block size-[11px] shrink-0">
              <span className="absolute inset-0 rounded-full border border-hairline-strong" />
              <motion.span
                className="absolute inset-[3px] rounded-full"
                style={{ backgroundColor: accent }}
                variants={SIGNAL}
              />
            </span>

            <span className="flex-1">
              <span className="label block text-fg">{node.label}</span>
              <span className="label mt-1 block text-faint">{node.note}</span>
            </span>

            <span className="label shrink-0 text-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}
