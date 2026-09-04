"use client";

import { motion } from "motion/react";

import { easing } from "@/lib/motion";

/**
 * The data-ingestion pipeline, activating once as it enters the viewport.
 *
 * External sources fan in at the top, run down a controlled pipeline — polling,
 * validation, normalization, storage — into the historical price store, then the
 * platform's surfaces fan out at the bottom. The spine draws down and each stage
 * lights in turn, so the signal reads as moving through the system rather than
 * everything appearing at once. It runs once and settles; reduced motion drops
 * the transforms and the completed diagram simply arrives.
 *
 * Deliberately linear: sources feed the pipeline and the store feeds the
 * surfaces, without drawing any source-to-feature claim the architecture
 * wouldn't support.
 */

const GROUP = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const SPINE = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1.1, ease: easing.outExpo } },
};
const NODE = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easing.outQuart } },
};
const SIGNAL = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easing.outExpo } },
};
const FADE = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing.outQuart } },
};

export function IngestionPipeline({
  sources,
  stages,
  features,
  accent,
}: {
  sources: string[];
  stages: { label: string; note?: string }[];
  features: string[];
  accent: string;
}) {
  return (
    <motion.div
      className="mx-auto w-full max-w-[40rem]"
      variants={GROUP}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
    >
      {/* Fan-in: external sources */}
      <motion.p variants={FADE} className="label text-faint">
        External sources
      </motion.p>
      <motion.div variants={GROUP} className="mt-3 flex flex-wrap gap-2">
        {sources.map((source) => (
          <motion.span
            key={source}
            variants={FADE}
            className="label rounded-sm border border-hairline px-2.5 py-1.5 text-muted"
            style={{ borderBottomColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
          >
            {source}
          </motion.span>
        ))}
      </motion.div>

      <span aria-hidden className="mx-auto my-4 block h-6 w-px bg-hairline-strong" />

      {/* Pipeline spine */}
      <div className="relative">
        <motion.span
          aria-hidden
          className="absolute left-[5px] top-3 bottom-3 block w-px origin-top bg-hairline-strong"
          variants={SPINE}
        />
        <ol className="relative">
          {stages.map((stage, i) => (
            <motion.li
              key={stage.label}
              variants={NODE}
              className="flex items-start gap-5 border-t border-hairline py-3.5 first:border-t-0"
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
                <span className="label block text-fg">{stage.label}</span>
                {stage.note ? (
                  <span className="label mt-1 block text-faint">{stage.note}</span>
                ) : null}
              </span>
              <span className="label shrink-0 text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      <span aria-hidden className="mx-auto my-4 block h-6 w-px bg-hairline-strong" />

      {/* Fan-out: surfaces */}
      <motion.p variants={FADE} className="label text-faint">
        Surfaces
      </motion.p>
      <motion.div
        variants={GROUP}
        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {features.map((feature) => (
          <motion.span
            key={feature}
            variants={FADE}
            className="label rounded-sm border border-hairline px-2.5 py-2 text-center text-muted"
            style={{ borderTopColor: `color-mix(in srgb, ${accent} 40%, transparent)` }}
          >
            {feature}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}
