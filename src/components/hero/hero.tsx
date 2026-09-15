"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HeroBackdrop } from "@/components/hero/hero-backdrop";
import { HeroCaret } from "@/components/hero/hero-boot";
import { HeroMeta } from "@/components/hero/hero-meta";
import { HeroStatement } from "@/components/hero/hero-statement";
import { HeroVisual } from "@/components/hero/hero-visual";
import { HeroTerminal } from "@/components/hero/hero-terminal";
import { NameField } from "@/components/hero/name-field";
import { TypeLine } from "@/components/hero/type-line";
import { Lift } from "@/components/motion/reveal";
import { nameMosaic } from "@/data/name-mosaic";
import { site } from "@/data/site";
import { STEP, useBootSequence } from "@/hooks/use-boot-sequence";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePointerParallax } from "@/hooks/use-pointer-parallax";
import { cue } from "@/lib/motion";
import { type FormIndex } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";

/** Character cadences, slow enough to read as writing rather than a flicker. */
const NAME_MS = 60;
const ROLE_MS = 16;

/** Distance the prompt keeps above the statement once it has travelled. */
const CARET_LEAD = 44;

/** The boot writes the statement through its first three verbs. */
const BOOT_FORMS: { step: number; form: 0 | 1 | 2 }[] = [
  { step: STEP.design, form: 0 },
  { step: STEP.build, form: 1 },
  { step: STEP.ship, form: 2 },
];

/**
 * Having written the first three, the boot runs on through the rest and comes
 * back to the first, at the pace it was writing at. Otherwise the opening
 * shows three of the six forms and the idle cycle then starts wherever the
 * boot happened to stop, halfway along the rail.
 */
const SWEEP: FormIndex[] = [3, 4, 5, 0];
const SWEEP_MS = 460;

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
  // Below this the display type is small enough that a symbol would be four
  // pixels across — a smudge rather than a mosaic — so the name stays solid
  // and the nine hundred cells are never sent to a phone at all.
  const mosaic = useMediaQuery("(min-width: 768px)");
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");

  const booting = !still;
  const step = useBootSequence(booting);
  const reached = (target: number) => !booting || step >= target;

  // The statement and the sculpture walk design → build → ship as the boot
  // writes them.
  useEffect(() => {
    if (!booting) {
      sculpture.suggest(2);
      return;
    }
    const beat = [...BOOT_FORMS].reverse().find((b) => step >= b.step);
    if (beat) sculpture.suggest(beat.form);
  }, [booting, step]);

  // Then straight on through the remaining three and back to the first, which
  // is where the idle cycle takes over. Each step only suggests, so a visitor
  // who reaches for the rail mid-sweep keeps what they picked.
  useEffect(() => {
    if (!booting || step < STEP.done) return;
    let i = 0;
    const timer = setInterval(() => {
      sculpture.suggest(SWEEP[i]);
      i += 1;
      if (i === SWEEP.length) clearInterval(timer);
    }, SWEEP_MS);
    return () => clearInterval(timer);
  }, [booting, step]);

  // How far the prompt drops to reach the statement. Measured from layout
  // positions rather than bounding boxes, so the prompt's own transform never
  // feeds back into it.
  const caretRef = useRef<HTMLParagraphElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const [travelY, setTravelY] = useState(0);
  // Distance from the bottom of the hero to the bottom of the statement's
  // rail, so the sculpture's rule can sit on exactly the same line. Measured,
  // not derived: when the left column runs tall the statement is pushed below
  // where its margin alone would put it.
  const [railOffset, setRailOffset] = useState<number | null>(null);
  // Where the identity module ends: the ceiling the sculpture's forms stand
  // under, since its box reaches up behind the module.
  const metaRef = useRef<HTMLDivElement>(null);
  const [ceiling, setCeiling] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const caret = caretRef.current;
      const statement = statementRef.current;
      if (!caret || !statement) return;

      setTravelY(statement.offsetTop - caret.offsetTop - CARET_LEAD);
      const parent = statement.offsetParent as HTMLElement | null;
      if (parent) {
        setRailOffset(parent.clientHeight - (statement.offsetTop + statement.offsetHeight));
        const meta = metaRef.current;
        if (meta) setCeiling(meta.offsetTop + meta.offsetHeight);
      }
    };

    measure();
    // Fonts landing and the name assembling both change heights without a
    // window resize.
    const observer = new ResizeObserver(measure);
    if (statementRef.current) observer.observe(statementRef.current);
    if (statementRef.current?.offsetParent) observer.observe(statementRef.current.offsetParent);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
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
        className="shell relative flex min-h-[min(100svh,50rem)] flex-col pt-[calc(var(--nav-h)+clamp(2rem,6vh,4.25rem))] pb-10 lg:h-full lg:min-h-0 lg:pb-12 lg:gap-y-[clamp(0.875rem,2.4vh,2.5rem)]"
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
        {/* Click-through: this column's blocks run the full width of the hero
            and sit above the 3D set, so without it they swallow clicks meant
            for the sculpture. Only the parts that take input opt
            back in, each shrunk to its own content. */}
        {/* Above the statement, so the terminal's panel can open over it. */}
        <div className="pointer-events-none relative z-20 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <h1
            id="hero-name"
            // Negative indent optically aligns the "A" with the monogram above.
            className="depth display pointer-events-auto -ml-[0.055em] w-fit text-display text-fg lg:text-[length:min(var(--text-display),20vh)]"
            style={{ "--depth": 3 } as React.CSSProperties}
          >
            <span className="sr-only">
              {site.name} — {site.role}
            </span>
            <span aria-hidden>
              {mosaic ? (
                // A live field: the symbols assemble on the boot's cue, part
                // around the pointer and scatter on a click.
                <NameField
                  lines={nameMosaic}
                  typed={[reached(STEP.name), reached(STEP.surname)]}
                  enabled={booting}
                  charMs={NAME_MS}
                />
              ) : (
                <>
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
                </>
              )}
            </span>
          </h1>

          <p
            aria-hidden
            className="depth label mt-[clamp(1rem,2.6vh,2.25rem)] text-[0.9375rem] tracking-[0.15em] text-muted"
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

          {/* --- Terminal ----------------------------------------------------
              The stack and the prompt in one window, filling the space
              between the role and the statement: as much of it as there is,
              up to a cap on very tall screens. Its tabs arrive where the stack
              strip used to, as the boot loads the stack. */}
          <Lift
            delay={t(2.25)}
            className="pointer-events-auto relative z-20 mt-[clamp(0.75rem,1.8vh,1.75rem)] flex w-full max-w-[36rem] flex-col lg:max-h-[27rem] lg:min-h-[3.875rem] lg:max-w-[min(36rem,calc(50vw-var(--gutter)-3.5rem))] lg:flex-1"
          >
            <HeroTerminal className="h-[14rem] lg:h-auto lg:min-h-0 lg:flex-1" />
          </Lift>
        </div>

        {/* --- Statement -----------------------------------------------------
            One live line, I [verb] it, whose verb is the form the sculpture is
            holding — and the rail of every form beneath it, which is also the
            control. Kept clear of the scroll cue below it. */}
        <HeroStatement
          ref={statementRef}
          visible={reached(STEP.design)}
          railVisible={reached(STEP.done)}
          animate={!still}
          // Keep this margin in step with the sculpture's bottom offset below —
          // the two rules line up across the hero.
          className="relative z-10 mt-12 w-fit lg:mt-auto lg:mb-[clamp(4.75rem,11vh,7rem)]"
        />

        {/* --- Identity module ---------------------------------------------
            Counterweights the name across the top of the composition. Absolute
            on wide screens so it can sit against the right gutter without
            taking part in the left column's vertical rhythm. */}
        <div
          ref={metaRef}
          className="depth relative z-10 mt-10 lg:absolute lg:top-[calc(var(--nav-h)+clamp(1.25rem,4vh,3rem))] lg:right-(--gutter) lg:mt-0 lg:w-[17rem]"
          style={{ "--depth": 4 } as React.CSSProperties}
        >
          <HeroMeta delay={t(cue.meta)} />
        </div>

        {/* --- The sculpture -----------------------------------------------
            Holds the lower-right quadrant. No `depth` class: it takes the
            pointer itself — dragging, scattering — so it doesn't also drift
            with the parallax. */}
        <HeroVisual
          cycling={step >= STEP.done || still}
          style={pinned && railOffset != null ? { bottom: railOffset } : undefined}
          ceiling={pinned ? ceiling : null}
          // Its bottom rule sits on the same line as the rail under the statement.
          // The calc is the first-paint value; the measured offset takes over.
          className="mt-12 aspect-4/3 w-full md:w-[78%] md:self-end lg:absolute lg:right-(--gutter) lg:bottom-[calc(3rem+clamp(4.75rem,11vh,7rem))] lg:z-0 lg:mt-0 lg:w-[min(50vw,48rem)]"
        />

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
