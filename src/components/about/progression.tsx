"use client";

import { motion } from "motion/react";

import { sequenceToneLight } from "@/components/case/sequence-tones";
import { easing } from "@/lib/motion";

/**
 * The route into software, drawn as a rail.
 *
 * This page previously borrowed the case studies' architecture diagram for
 * this, which drew a data pipeline — right shape, wrong subject. A career is
 * not a system: it runs along, not down, and its stops are places rather than
 * services.
 *
 * The rail draws once, then the stops arrive along it in order. Horizontal on
 * a wide viewport where five stops fit side by side; vertical below that,
 * where they would otherwise be four words wide each.
 */

const RAIL = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.1, ease: easing.outExpo },
  },
};

const RAIL_VERTICAL = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.1, ease: easing.outExpo },
  },
};

const GROUP = {
  hidden: {},
  visible: { transition: { delayChildren: 0.24, staggerChildren: 0.11 } },
};

const STOP = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing.outQuart } },
};

const DOT = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: 0.4, ease: easing.outExpo } },
};

export function Progression({
  stops,
  accent = "var(--color-accent)",
}: {
  stops: readonly { label: string; note: string }[];
  accent?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      className="relative"
    >
      {/* --- Wide: one rail across, stops hung beneath it ------------------ */}
      <div className="relative hidden lg:block">
        <motion.span
          aria-hidden
          variants={RAIL}
          style={{ transformOrigin: "left" }}
          className="absolute top-[5px] right-0 left-0 block h-px bg-hairline-strong"
        />
        <motion.ol variants={GROUP} className="relative grid grid-cols-5 gap-x-6">
          {stops.map((stop, i) => (
            <motion.li key={stop.label} variants={STOP} className="relative pt-7">
              <motion.span
                aria-hidden
                variants={DOT}
                style={{ backgroundColor: sequenceToneLight(i, accent) }}
                className="absolute top-[1px] left-0 block size-2.5 rounded-full"
              />
              <p
                className="label absolute top-0 left-5"
                style={{ color: sequenceToneLight(i, accent) }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="display text-[clamp(0.95rem,1.25vw,1.2rem)] leading-[1.05] text-balance text-fg">
                {stop.label}
              </p>
              <p className="label mt-2.5 text-faint">{stop.note}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>

      {/* --- Narrow: the same rail turned on its side ---------------------- */}
      <div className="relative lg:hidden">
        <motion.span
          aria-hidden
          variants={RAIL_VERTICAL}
          style={{ transformOrigin: "top" }}
          className="absolute top-1 bottom-1 left-[5px] block w-px bg-hairline-strong"
        />
        <motion.ol variants={GROUP} className="relative flex flex-col gap-8">
          {stops.map((stop, i) => (
            <motion.li key={stop.label} variants={STOP} className="relative pl-9">
              <motion.span
                aria-hidden
                variants={DOT}
                style={{ backgroundColor: sequenceToneLight(i, accent) }}
                className="absolute top-[7px] left-0 block size-2.5 rounded-full"
              />
              <p className="label" style={{ color: sequenceToneLight(i, accent) }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="display mt-2 text-[clamp(1.25rem,5vw,1.6rem)] leading-[1.05] text-fg">
                {stop.label}
              </p>
              <p className="label mt-2 text-faint">{stop.note}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </motion.div>
  );
}
