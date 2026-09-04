"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { StatusDot } from "@/components/layout/status-dot";
import { Lift } from "@/components/motion/reveal";
import { site } from "@/data/site";
import { duration, easing } from "@/lib/motion";

/**
 * The identity module.
 *
 * Three indexed readings hung off one hairline — location, status, current
 * work. No card, no panel: the rule is what binds them, so the module stays
 * part of the cream canvas rather than sitting on top of it.
 *
 * Each reading carries the same three-tier hierarchy — an indexed label in tiny
 * mono, the reading itself at full contrast, and a muted annotation — so the
 * block is scannable at a glance while staying clearly secondary to the hero.
 */

const STAGGER = 0.09;

function Reading({
  index,
  label,
  children,
  delay,
}: {
  index: string;
  label: string;
  children: ReactNode;
  delay: number;
}) {
  return (
    <Lift delay={delay}>
      <p className="label text-faint">
        {index} <span className="text-faint/60">/</span> {label}
      </p>
      <div className="mt-2">{children}</div>
    </Lift>
  );
}

/** The reading itself: the one line in each group meant to be read first. */
function Value({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[0.875rem] leading-[1.4] font-medium tracking-[0.02em] text-fg uppercase">
      {children}
    </p>
  );
}

/** The annotation under it. */
function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 font-mono text-[0.6875rem] tracking-[0.1em] text-muted uppercase">
      {children}
    </p>
  );
}

export function HeroMeta({ delay }: { delay: number }) {
  return (
    <div className="relative pl-5">
      {/* The spine. Draws down as the module arrives, then holds. */}
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 block w-px origin-top bg-hairline"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: duration.reveal, ease: easing.outExpo, delay }}
      />

      <div className="flex flex-col gap-[clamp(0.85rem,2vh,1.3rem)]">
        <Reading index="01" label="Location" delay={delay + STAGGER}>
          <Value>{site.location.city}</Value>
          <Note>{site.location.region}</Note>
        </Reading>

        <Reading index="02" label="Status" delay={delay + STAGGER * 2}>
          {/* The one interaction in the module: the annotation swaps for the
              invitation on hover. Everything else holds still. */}
          <Link href="/contact" className="group/status block">
            <Value>
              <StatusDot className="mr-2 mb-px inline-block align-middle" />
              {site.status.available}
            </Value>
            <span className="relative mt-1 block overflow-hidden">
              <span className="block font-mono text-[0.6875rem] tracking-[0.1em] text-muted uppercase transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/status:-translate-y-full">
                {site.status.detail}
              </span>
              <span
                aria-hidden
                className="absolute inset-0 block translate-y-full font-mono text-[0.6875rem] tracking-[0.1em] text-accent uppercase transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/status:translate-y-0"
              >
                {site.status.open} &rarr;
              </span>
            </span>
          </Link>
        </Reading>

        <Reading index="03" label="Current" delay={delay + STAGGER * 3}>
          {site.current.map((word) => (
            <Value key={word}>{word}</Value>
          ))}
        </Reading>
      </div>
    </div>
  );
}
