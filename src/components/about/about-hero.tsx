"use client";

import { useEffect, useState } from "react";

import { ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

import { RouteStrip } from "@/components/about/route-strip";
import { SymbolTopography } from "@/components/about/symbol-topography";
import { sequenceToneLight } from "@/components/case/sequence-tones";
import { StatusDot } from "@/components/layout/status-dot";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePointerParallax } from "@/hooks/use-pointer-parallax";
import { Lift, MaskReveal } from "@/components/motion/reveal";
import { about } from "@/data/about";
import { site } from "@/data/site";
import { easing } from "@/lib/motion";

/**
 * The about page's opening.
 *
 * It was a headline on the left, a pending portrait on the right and a lot of
 * black between them — true to the copy, but it said nothing the reader
 * couldn't get from the nav. Here the opening sets up the story before the
 * scroll starts:
 *
 * - The ground under it is a topographic map across the whole opening, its
 *   contour lines set in tiny code symbols — the story starts in
 *   hydrogeology and ends in software, and the map is both at once.
 * - A row of readouts gives the facts the site already states: where, what,
 *   and whether he's available.
 * - The headline is the page's largest type, with a note pointing to where the
 *   story actually began. There is deliberately no portrait.
 * - The whole route runs along the bottom, drawing in stop by stop, and each
 *   stop jumps to its chapter.
 *
 * Nothing here is new copy: every word comes from about.ts or site.ts.
 */

const ACCENT = "var(--color-accent)";
const pad = (i: number) => String(i + 1).padStart(2, "0");

/** Scrolls to a chapter of the story, centred so the sticky nav never covers it. */
function goToChapter(
  event: React.MouseEvent<HTMLAnchorElement>,
  chapter: number,
) {
  const target = document.getElementById(`path-chapter-${chapter}`);
  if (!target) return;
  event.preventDefault();
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    behavior: still ? "auto" : "smooth",
    block: "center",
  });
}

export function AboutHero() {
  const { stops, beats } = about.path;
  // Only the typography answers the pointer; the hook writes --px/--py on this
  // container and the `depth` elements read them in CSS — the same layering the
  // landing page's hero has.
  const { ref: parallax } = usePointerParallax<HTMLDivElement>();
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");

  // The opening is held while the story rides over it, exactly as the landing
  // page's hero is held while the work rides over that — so it recedes rather
  // than scrolling away, and the ground behind it drifts at its own rate.
  //
  // Measured against the viewport rather than the section: a sticky element
  // never moves relative to the scrollport, so a target-based `useScroll`
  // would sit at zero forever.
  const { scrollY } = useScroll();
  const [viewport, setViewport] = useState(0);

  useEffect(() => {
    const measure = () => setViewport(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const range = viewport || 1;
  const groundY = useTransform(scrollY, [0, range], [0, 150]);
  const glowY = useTransform(scrollY, [0, range], [0, 260]);
  const typeY = useTransform(scrollY, [0, range], [0, -60]);
  const routeY = useTransform(scrollY, [0, range], [0, 26]);
  const fade = useTransform(scrollY, [0, range], [1, 0.2]);
  const chapterOf = (stop: number) =>
    beats.findIndex((beat) => (beat.stops as readonly number[]).includes(stop));

  const readouts = [
    { label: "Based", value: site.location.city, note: site.location.region },
    { label: "Role", value: site.role, note: null },
    {
      label: "Status",
      value: site.status.available,
      note: site.status.detail,
      live: true,
    },
  ];

  return (
    <section
      data-surface="dark"
      className="relative isolate overflow-hidden bg-bg text-fg lg:sticky lg:top-0 lg:h-svh"
    >
      {/* --- Ground ------------------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Eased off under the nav and the readout rail at the top, and under
            the route at the bottom, so the small type in those bands stays
            easy to read. Full strength behind the headline, which can take it. */}
        {/* A little softer on narrow screens, where the opening stacks into a
            tall column and more small type sits over the map at once — but not
            so soft that the ground disappears: the headline carries its own
            scrim, and the readouts and route have the mask's eased bands. */}
        <motion.div
          className="absolute inset-0 opacity-[0.72] lg:opacity-100"
          style={{
            y: still ? 0 : groundY,
            maskImage:
              "linear-gradient(to bottom, rgb(0 0 0 / 0.22) 0%, rgb(0 0 0 / 0.5) 20%, #000 36%, #000 64%, rgb(0 0 0 / 0.42) 100%)",
          }}
        >
          <SymbolTopography />
        </motion.div>
        <motion.div
          style={{
            y: still ? 0 : glowY,
            background:
              "radial-gradient(circle, rgb(114 87 255 / 0.3) 0%, transparent 70%)",
          }}
          className="absolute top-[18%] right-[4%] h-[38rem] w-[38rem] rounded-full opacity-45 blur-[130px]"
        />
      </div>

      <div
        ref={parallax}
        className="shell flex min-h-[100svh] flex-col pt-[calc(var(--nav-h)+clamp(1.75rem,5vh,3.5rem))] pb-[clamp(1.75rem,4vh,2.75rem)] lg:h-full lg:min-h-0"
      >
        {/* --- Top rail: eyebrow and readouts ---------------------------- */}
        <div className="flex flex-col gap-8 border-b border-hairline pb-5 lg:flex-row lg:items-end lg:justify-between">
          <Lift as="p" className="depth label text-muted" style={{ "--depth": 2 } as React.CSSProperties}>
            <span className="text-accent">03</span>
            <span className="text-faint"> / </span>
            {about.eyebrow}
          </Lift>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)_minmax(0,1fr)] lg:max-w-[54rem]">
            {readouts.map((r, i) => (
              <Lift
                key={r.label}
                delay={0.1 + i * 0.07}
                className={i === 1 ? "col-span-2 sm:col-span-1" : undefined}
              >
                <dt className="label text-faint">
                  {pad(i)} <span className="text-faint/60">/</span> {r.label}
                </dt>
                <dd className="mt-2 font-mono text-[0.8125rem] leading-[1.35] font-medium tracking-[0.02em] text-fg uppercase">
                  <span className="inline-flex items-center gap-2">
                    {r.live ? <StatusDot /> : null}
                    {r.value}
                  </span>
                  {r.note ? (
                    <span className="mt-1 block font-mono text-[0.6875rem] tracking-[0.1em] text-muted">
                      {r.note}
                    </span>
                  ) : null}
                </dd>
              </Lift>
            ))}
          </dl>
        </div>

        {/* --- Headline ------------------------------------------------ */}
        <motion.div
          style={still ? undefined : { y: typeY, opacity: fade }}
          className="flex flex-1 items-center py-[clamp(1.5rem,6vh,4.5rem)]"
        >
          <div className="relative isolate">
            {/* A pool of the page's own ground behind the headline and the
                lines under it. The map runs at full strength everywhere else,
                but under the text its symbols were the same size and weight as
                the small type and read straight through it. Soft-edged, so it
                reads as the map thinning out rather than as a panel. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-x-[12%] -inset-y-[22%] -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 58% 60% at 42% 52%, rgb(11 11 11 / 0.94) 0%, rgb(11 11 11 / 0.82) 42%, rgb(11 11 11 / 0.4) 68%, transparent 88%)",
              }}
            />
            <h1
              className="depth display text-[clamp(3rem,8.2vw,7.75rem)] leading-[0.86] text-fg"
              style={{ "--depth": 3 } as React.CSSProperties}
            >
              {about.headline.map((line, i) => (
                <MaskReveal key={line} delay={0.12 + i * 0.1}>
                  {line}
                </MaskReveal>
              ))}
            </h1>

            <div className="mt-[clamp(1.75rem,4.5vh,3rem)] flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-12">
              <Lift delay={0.34} className="max-w-[44ch]">
                <p className="text-[clamp(1.2rem,1.7vw,1.5rem)] leading-[1.4] text-fg/85">
                  {about.lead}
                </p>
              </Lift>

              {/* The margin note: where the story actually began. */}
              <Lift delay={0.44}>
                <a
                  href="#path-chapter-0"
                  onClick={(event) => goToChapter(event, 0)}
                  className="group/note inline-flex items-start gap-3 border-l pt-0.5 pl-4"
                  style={{ borderColor: sequenceToneLight(0, ACCENT) }}
                >
                  <span>
                    <span className="label block text-muted">
                      Where it started
                    </span>
                    <span className="label mt-2 flex items-baseline gap-2.5">
                      <span style={{ color: sequenceToneLight(0, ACCENT) }}>
                        {pad(0)}
                      </span>
                      <span className="text-fg transition-colors group-hover/note:text-accent">
                        {stops[0].label}
                      </span>
                    </span>
                  </span>
                </a>
              </Lift>
            </div>
          </div>
        </motion.div>

        {/* --- The route ------------------------------------------------- */}
        <motion.div style={still ? undefined : { y: routeY }}>
          <div className="mb-4 flex items-baseline justify-between gap-6">
            <Lift delay={0.5} as="p" className="label text-faint">
              The route
            </Lift>
            <Lift delay={0.9}>
              <a
                href="#path-chapter-0"
                onClick={(event) => goToChapter(event, 0)}
                className="label group/scroll inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"
              >
                Read it
                <ArrowDown
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/scroll:translate-y-0.5"
                />
              </a>
            </Lift>
          </div>

          {/* Five stops stacked two-up took a third of a phone's screen out of
              an opening that has to fit one. They run along a strip that
              carries itself instead, which is what a route does anyway. */}
          <RouteStrip className="-mx-(--gutter) overflow-x-auto px-(--gutter) pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            <motion.ol
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: { delayChildren: 0.6, staggerChildren: 0.12 },
                },
              }}
              className="relative flex w-max gap-x-5 sm:grid sm:w-auto sm:grid-cols-5 sm:gap-x-4"
            >
              {/* The rail itself, drawn across as the stops arrive. */}
              <motion.span
                aria-hidden
                className="absolute top-[4.5px] right-0 left-0 h-px origin-left bg-hairline-strong"
                variants={{
                  hidden: { scaleX: 0 },
                  visible: {
                    scaleX: 1,
                    transition: {
                      duration: 1.4,
                      ease: easing.outExpo,
                      delay: 0.55,
                    },
                  },
                }}
              />

              {stops.map((stop, i) => {
                const tone = sequenceToneLight(i, ACCENT);
                const chapter = chapterOf(i);
                return (
                  <motion.li
                    key={stop.label}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.55, ease: easing.outQuart },
                      },
                    }}
                    className="w-[11.5rem] shrink-0 sm:w-auto sm:shrink"
                  >
                    <a
                      href={`#path-chapter-${chapter}`}
                      onClick={(event) => goToChapter(event, chapter)}
                      className="group/stop relative block pt-6"
                    >
                      <span
                        aria-hidden
                        className="absolute top-0 block size-2.5 shrink-0 rounded-full transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/stop:scale-150"
                        style={{ backgroundColor: tone }}
                      />
                      <span className="block">
                        <span className="label block" style={{ color: tone }}>
                          {pad(i)}
                        </span>
                        <span className="display mt-2 block text-[clamp(0.95rem,1.25vw,1.2rem)] leading-[1.05] text-fg transition-colors group-hover/stop:text-accent">
                          {stop.label}
                        </span>
                        <span className="label mt-1.5 block text-faint">
                          {stop.note}
                        </span>
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </motion.ol>
          </RouteStrip>
        </motion.div>
      </div>
    </section>
  );
}
