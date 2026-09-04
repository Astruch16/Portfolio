"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HeroBackdrop } from "@/components/hero/hero-backdrop";
import { HeroCaret } from "@/components/hero/hero-boot";
import { HeroMeta } from "@/components/hero/hero-meta";
import { StackRuntime } from "@/components/hero/stack-runtime";
import { HeroVisual } from "@/components/hero/hero-visual";
import { TypeLine } from "@/components/hero/type-line";
import { Lift } from "@/components/motion/reveal";
import { site } from "@/data/site";
import { STEP, useBootSequence } from "@/hooks/use-boot-sequence";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePointerParallax } from "@/hooks/use-pointer-parallax";
import { cue } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Character cadences, slow enough to read as writing rather than a flicker. */
const NAME_MS = 60;
const ROLE_MS = 16;
const STATEMENT_MS = 34;

/** Distance the prompt keeps above the statement once it has travelled. */
const CARET_LEAD = 44;

type StatementLine = { text: string; step: number; accent?: boolean };

const STATEMENT: StatementLine[] = [
  { text: "I design it", step: STEP.design },
  { text: "I build it", step: STEP.build },
  { text: "I ship it", step: STEP.ship, accent: true },
];

/**
 * A diagonal composition: the name anchors the upper left with the role hung
 * directly beneath it as its descriptor, the statement carries the lower left,
 * metadata counterweights the upper right, and the set piece fills the lower
 * right. Nothing sits inside a card.
 */
export function Hero() {
  // Only the typography answers the pointer; the hook writes --px/--py on this
  // container and the `depth` elements read them in CSS.
  const { ref } = usePointerParallax<HTMLDivElement>();
  const pinned = useMediaQuery("(min-width: 1024px)");
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");

  const booting = !still;
  const step = useBootSequence(booting);
  const reached = (target: number) => !booting || step >= target;

  // How far the prompt drops to reach the statement. Measured from layout
  // positions rather than bounding boxes, so the prompt's own transform never
  // feeds back into it.
  const caretRef = useRef<HTMLParagraphElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const [travelY, setTravelY] = useState(0);

  useEffect(() => {
    const measure = () => {
      const caret = caretRef.current;
      const statement = statementRef.current;
      if (!caret || !statement) return;

      setTravelY(statement.offsetTop - caret.offsetTop - CARET_LEAD);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pinned]);

  // The hero is pinned on wide screens and the next section rides over it, so
  // the contents recede as they are covered rather than scrolling away.
  //
  // Progress is measured against the viewport rather than the section: a
  // sticky element never moves relative to the scrollport, so a target-based
  // `useScroll` would sit at zero forever.
  const { scrollY } = useScroll();
  const [viewport, setViewport] = useState(0);

  useEffect(() => {
    const measure = () => setViewport(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const range = viewport || 1;
  const y = useTransform(scrollY, [0, range], [0, -60]);
  const opacity = useTransform(scrollY, [0, range], [1, 0.2]);

  // Reduced motion collapses every remaining cue to zero. Read through an
  // effect-backed media query, never `useReducedMotion()` at render time: the
  // first client render has to agree with the server, and this one does.
  const t = (seconds: number) => (still ? 0 : seconds);

  return (
    <section
      data-surface="light"
      aria-labelledby="hero-name"
      className="relative isolate overflow-hidden bg-bg text-fg lg:sticky lg:top-0 lg:h-svh"
    >
      <HeroBackdrop />

      <motion.div
        ref={ref}
        style={pinned && !still ? { y, opacity } : undefined}
        // Capped below lg so a tall tablet viewport does not open a void
        // between the metadata and the object.
        // `gap-y` guarantees a floor between the name block and the statement on
        // short-but-wide viewports, where `mt-auto` has no slack left to give.
        className="shell relative flex min-h-[min(100svh,50rem)] flex-col pt-[calc(var(--nav-h)+clamp(2rem,6vh,4.25rem))] pb-10 lg:h-full lg:min-h-0 lg:pb-12 lg:gap-y-[clamp(1rem,3vh,2.5rem)]"
      >
        <HeroCaret
          ref={caretRef}
          enabled={booting}
          travelY={travelY}
          moved={step >= STEP.travel}
          done={step >= STEP.done}
          label={
            step >= STEP.stack && step < STEP.travel ? "load stack" : undefined
          }
          className="absolute top-[calc(var(--nav-h)+clamp(0.6rem,2.2vh,1.5rem))] left-(--gutter) z-20"
        />

        {/* --- Name and role ------------------------------------------------
            One block. The role is the descriptor for the name, not a separate
            piece of furniture at the far end of the page. */}
        <div className="relative z-10">
          <h1
            id="hero-name"
            // Negative indent optically aligns the "A" with the monogram above.
            className="depth display -ml-[0.055em] text-display text-fg"
            style={{ "--depth": 3 } as React.CSSProperties}
          >
            <span className="sr-only">
              {site.name} — {site.role}
            </span>
            <span aria-hidden>
              <TypeLine
                className="block"
                text="Adam"
                typed={reached(STEP.name)}
                enabled={booting}
                charMs={NAME_MS}
              />
              <TypeLine
                className="block"
                text="Struch"
                typed={reached(STEP.surname)}
                enabled={booting}
                charMs={NAME_MS}
              />
            </span>
          </h1>

          <p
            aria-hidden
            className="depth label mt-[clamp(1.25rem,3.5vh,2.25rem)] text-[0.9375rem] tracking-[0.15em] text-muted"
            style={{ "--depth": 3 } as React.CSSProperties}
          >
            <TypeLine
              className="block"
              text="Design Engineer"
              typed={reached(STEP.role)}
              enabled={booting}
              charMs={ROLE_MS}
            />
            <TypeLine
              className="block"
              text="& Full-Stack Developer"
              typed={reached(STEP.role)}
              enabled={booting}
              charMs={ROLE_MS}
              startIndex={15}
            />
          </p>

          {/* --- Stack runtime ----------------------------------------------
              A thin technical strip hung directly off the role, so it reads as
              an annotation on the title rather than a separate widget. The
              panels it opens carry all the weight. */}
          <div className="relative z-20 mt-[clamp(1rem,3vh,1.75rem)]">
            <StackRuntime delay={t(2.25)} />
          </div>
        </div>

        {/* --- Statement -----------------------------------------------------
            Three beats joined by a spine. Gaps and connectors are fixed, so the
            rhythm stays even however the type scales. */}
        <div
          ref={statementRef}
          // `w-fit` shrinks the block to its widest line; `items-center` then
          // centres every line and the spine on that same axis, so the stack
          // reads as one column while the block itself stays on the gutter.
          className="relative z-10 mt-12 flex w-fit flex-col items-center gap-[clamp(0.4rem,0.9vh,0.7rem)] lg:mt-auto lg:mb-[clamp(1.5rem,5vh,4.5rem)]"
        >
          {STATEMENT.map((line, index) => (
            <div key={line.text} className="contents">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="block w-px origin-top bg-hairline-strong transition-transform duration-500 ease-[var(--ease-out-expo)]"
                  style={{
                    height: "clamp(1rem, 2.2vh, 1.75rem)",
                    transform: reached(line.step) ? "scaleY(1)" : "scaleY(0)",
                  }}
                />
              ) : null}
              <p
                className={cn(
                  "text-statement font-bold tracking-[-0.03em] uppercase",
                  line.accent ? "text-accent" : "text-fg",
                )}
              >
                <TypeLine
                  text={line.text}
                  typed={reached(line.step)}
                  enabled={booting}
                  charMs={STATEMENT_MS}
                />
              </p>
            </div>
          ))}
        </div>

        {/* --- Identity module ---------------------------------------------
            Counterweights the name across the top of the composition. Absolute
            on wide screens so it can sit against the right gutter without
            taking part in the left column's vertical rhythm. */}
        <div
          className="depth relative z-10 mt-10 lg:absolute lg:top-[calc(var(--nav-h)+clamp(1.25rem,4vh,3rem))] lg:right-(--gutter) lg:mt-0 lg:w-[17rem]"
          style={{ "--depth": 4 } as React.CSSProperties}
        >
          <HeroMeta delay={t(cue.meta)} />
        </div>

        {/* --- The set ------------------------------------------------------
            Sits in the lower-right quadrant. Deliberately carries no `depth`
            class: the set is fixed, and only the typography answers the
            pointer. */}
        <HeroVisual className="pointer-events-none -mr-(--gutter) mt-auto aspect-3/2 w-[calc(100%+var(--gutter))] pt-8 md:w-[74%] md:self-end lg:absolute lg:right-[2%] lg:bottom-[7%] lg:z-0 lg:mt-0 lg:aspect-4/3 lg:w-[64vw] lg:pt-0 xl:w-[min(66vw,64rem)]" />

        {/* --- Scroll cue ---------------------------------------------------- */}
        <Lift
          delay={t(cue.seam)}
          className="pointer-events-none absolute bottom-[3%] left-(--gutter) z-10 hidden gap-4 lg:flex"
        >
          <span aria-hidden className="w-px shrink-0 self-stretch bg-hairline-strong" />
          <div className="flex flex-col gap-4">
            <span className="label text-faint">
              Scroll
              <br />
              Down
            </span>
            <ArrowDown aria-hidden className="size-3 text-faint" strokeWidth={1.5} />
          </div>
        </Lift>
      </motion.div>
    </section>
  );
}
