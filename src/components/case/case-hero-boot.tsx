"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { TypeLine } from "@/components/hero/type-line";
import { easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The case study's opening, assembled the way the landing hero is: a terminal
 * prompt writes a command, then the identifier, title, discipline and summary
 * arrive in ordered beats — the title printed left-to-right so its wordmark
 * gradient survives (a per-character opacity fade can't fade a gradient that is
 * painted once across the whole word).
 *
 * The real text is in the document from the first byte; the beats only toggle
 * how it is revealed. Under reduced motion every beat resolves to `done` at
 * once and the MotionProvider snaps the transforms, so the hero simply arrives.
 */

const PHASE = {
  idle: 0,
  command: 1,
  title: 2,
  discipline: 3,
  summary: 4,
  done: 5,
} as const;

export function CaseHeroBoot({
  slug,
  index,
  kind,
  accent,
  name,
  wordmark,
  discipline,
  summary,
}: {
  slug: string;
  index: string;
  kind: string;
  accent: string;
  name: string;
  /** The wordmark gradient props, or null to fall back to the flat accent. */
  wordmark: { className: string; style: CSSProperties } | null;
  discipline: string;
  summary: string | null;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<number>(PHASE.idle);

  useEffect(() => {
    // Reduced motion: no timeline. `show()` already resolves everything visible
    // via `Boolean(reduced)`, and the MotionProvider snaps the transforms.
    if (reduced) return;
    const timers = [
      window.setTimeout(() => setPhase(PHASE.command), 40),
      window.setTimeout(() => setPhase(PHASE.title), 480),
      window.setTimeout(() => setPhase(PHASE.discipline), 1040),
      window.setTimeout(() => setPhase(PHASE.summary), 1300),
      window.setTimeout(() => setPhase(PHASE.done), 1700),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, [reduced]);

  const enabled = !reduced;
  const show = (n: number) => Boolean(reduced) || phase >= n;

  return (
    <>
      {/* Terminal prompt — decorative furniture, real content lives below it. */}
      <p
        aria-hidden
        className="label flex items-center gap-2 tracking-[0.08em] normal-case text-faint"
      >
        <span style={{ color: accent }}>&gt;</span>
        <TypeLine
          text={`open ${slug}`}
          typed={show(PHASE.command)}
          enabled={enabled}
          charMs={22}
        />
        {!reduced && phase < PHASE.summary ? (
          <span className="boot-caret" />
        ) : null}
      </p>

      {/* Identifier */}
      <motion.p
        className="label mt-[clamp(1rem,3vh,1.75rem)] text-muted"
        initial={{ opacity: 0, y: 6 }}
        animate={{
          opacity: show(PHASE.title) ? 1 : 0,
          y: show(PHASE.title) ? 0 : 6,
        }}
        transition={{ duration: 0.5, ease: easing.outQuart }}
      >
        <span style={{ color: accent }}>{index}</span>
        <span className="text-faint"> / </span>
        {kind}
      </motion.p>

      {/* Title — printed left-to-right so the gradient stays intact. */}
      <h1 className="display mt-[clamp(1rem,3vh,2rem)] text-section">
        <motion.span
          className={cn("inline-block", wordmark?.className)}
          style={wordmark?.style ?? { color: accent }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{
            clipPath: show(PHASE.title) ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          }}
          transition={{ duration: 0.7, ease: easing.outExpo }}
        >
          {name}
        </motion.span>
      </h1>

      {/* Discipline */}
      <p className="label mt-5 text-muted">
        <TypeLine
          text={discipline}
          typed={show(PHASE.discipline)}
          enabled={enabled}
          charMs={16}
        />
      </p>

      {/* Summary — typed out like the lines above it. */}
      <div className="mt-[clamp(2rem,5vh,3.5rem)] max-w-[min(100%,46rem)]">
        {summary ? (
          <p className="text-statement leading-[1.06] font-bold tracking-[-0.02em] uppercase">
            <TypeLine
              text={summary}
              typed={show(PHASE.summary)}
              enabled={enabled}
              charMs={9}
            />
          </p>
        ) : (
          <span className="label text-faint">
            [ one line on what this product is ]
          </span>
        )}
      </div>
    </>
  );
}
